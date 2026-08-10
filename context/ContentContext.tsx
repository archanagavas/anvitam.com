/**
 * context/ContentContext.tsx
 * 
 * Hybrid data layer:
 *  1. Optimistically renders from localStorage (instant, no flash)
 *  2. Syncs with Neon database API in the background
 *  3. Admin mutations hit the API and update local state
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, BlogPost, Service, DigitalProduct, ContactMessage, Testimonial, EstimatorService, PartnerBrand, Workshop } from '../types';
import { INITIAL_PROJECTS, INITIAL_BLOGS, SERVICES, DIGITAL_PRODUCTS, INITIAL_TESTIMONIALS, INITIAL_ESTIMATOR_SERVICES, INITIAL_PARTNERS, INITIAL_WORKSHOPS } from '../constants';

// ── Auth token helpers (JWT stored in sessionStorage — auto-clears on tab close) ──
export const getAuthToken = (): string | null => {
  try {
    return sessionStorage.getItem('anvitam_admin_token');
  } catch (e) {
    return null;
  }
};
export const setAuthToken = (token: string) => {
  try {
    sessionStorage.setItem('anvitam_admin_token', token);
  } catch (e) {}
};
export const clearAuthToken = () => {
  try {
    sessionStorage.removeItem('anvitam_admin_token');
  } catch (e) {}
};
export const authHeaders = (): Record<string, string> => {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

interface ContentContextType {
  projects: Project[];
  blogs: BlogPost[];
  services: Service[];
  digitalProducts: DigitalProduct[];
  messages: ContactMessage[];
  testimonials: Testimonial[];
  estimatorServices: EstimatorService[];
  partners: PartnerBrand[];
  workshops: Workshop[];
  isDbConnected: boolean;
  isInitialSyncDone: boolean;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  addBlog: (blog: BlogPost) => Promise<void>;
  updateBlog: (blog: BlogPost) => Promise<void>;
  addService: (service: Service) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  addDigitalProduct: (product: DigitalProduct) => Promise<void>;
  updateDigitalProduct: (product: DigitalProduct) => Promise<void>;
  addMessage: (message: ContactMessage) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  deleteDigitalProduct: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  addTestimonial: (t: Testimonial) => Promise<void>;
  updateTestimonial: (t: Testimonial) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  addEstimatorService: (s: EstimatorService) => Promise<void>;
  updateEstimatorService: (s: EstimatorService) => Promise<void>;
  deleteEstimatorService: (id: string) => Promise<void>;
  addPartner: (p: PartnerBrand) => Promise<void>;
  updatePartner: (p: PartnerBrand) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  addWorkshop: (w: Workshop) => Promise<void>;
  updateWorkshop: (w: Workshop) => Promise<void>;
  deleteWorkshop: (id: string) => Promise<void>;
  refreshFromDb: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem('anvitam_deleted_ids');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
}

function addDeletedId(id: string) {
  try {
    const current = getDeletedIds();
    current.add(id);
    localStorage.setItem('anvitam_deleted_ids', JSON.stringify(Array.from(current)));
  } catch (e) {}
}

function loadFromStorage<T>(key: string, initialData: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved) as T[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error(`[ContentContext] Failed to parse localStorage key "${key}":`, err);
  }
  return initialData;
}

function stripBase64(obj: any): any {
  // Preserve uploaded image data URLs so user image uploads are not destroyed/erased!
  return obj;
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    const sanitized = stripBase64(data);
    localStorage.setItem(key, JSON.stringify(sanitized));
  } catch (err) {
    console.warn(`[ContentContext] Failed to save key "${key}" to localStorage:`, err);
  }
}

function mergePreservingLocal<T extends { id: string }>(
  localItems: T[],
  incomingItems: T[] | undefined,
  defaultItems: T[],
  repairFn: (item: T, def?: T) => T
): T[] {
  const deletedIds = getDeletedIds();
  const isServerResponse = incomingItems !== undefined;
  const itemMap = new Map<string, T>();

  if (isServerResponse) {
    // Server is the source of truth when online. Overlay incoming items from server API (skipping deleted ones)
    if (Array.isArray(incomingItems)) {
      for (const item of incomingItems) {
        if (!item?.id || deletedIds.has(item.id)) continue;
        const def = defaultItems.find(d => d.id === item.id);
        itemMap.set(item.id, repairFn(item, def));
      }
    }

    // Keep unsynced local custom items created offline (only if not a default item and not on server)
    if (Array.isArray(localItems)) {
      for (const loc of localItems) {
        if (!loc || !loc.id || deletedIds.has(loc.id)) continue;
        const isDefaultItem = defaultItems.some(d => d.id === loc.id);
        if (!isDefaultItem && !itemMap.has(loc.id)) {
          itemMap.set(loc.id, repairFn(loc));
        }
      }
    }
  } else {
    // Initial load before server fetch: populate default items + local storage edits
    for (const def of defaultItems) {
      if (def?.id && !deletedIds.has(def.id)) {
        itemMap.set(def.id, repairFn(def, def));
      }
    }
    if (Array.isArray(localItems)) {
      for (const loc of localItems) {
        if (!loc || !loc.id || deletedIds.has(loc.id)) continue;
        const def = defaultItems.find(d => d.id === loc.id);
        const existing = itemMap.get(loc.id);
        itemMap.set(loc.id, repairFn({ ...(existing || {}), ...loc }, def));
      }
    }
  }

  return Array.from(itemMap.values());
}

const repairWorkshop = (w: Workshop, def?: Workshop): Workshop => ({
  ...def,
  ...w,
  images: (w.images && w.images.length > 0) ? w.images : (def?.images || [])
});

const repairService = (s: Service, def?: Service): Service => {
  const heroImage = s.heroImage || (s as any).hero_image || s.image || def?.heroImage || def?.image || '';
  const image = s.image || heroImage || def?.image || def?.heroImage || '';
  return {
    ...def,
    ...s,
    heroImage,
    image
  };
};

const repairProduct = (p: DigitalProduct, def?: DigitalProduct): DigitalProduct => ({
  ...def,
  ...p,
  image: p.image || def?.image || ''
});

const repairProject = (p: Project, def?: Project): Project => {
  const heroImage = p.heroImage || (p as any).hero_image || p.image || def?.heroImage || def?.image || '';
  const image = p.image || heroImage || def?.image || def?.heroImage || '';
  return {
    ...def,
    ...p,
    image,
    heroImage,
    gallery: (p.gallery && p.gallery.length > 0) ? p.gallery : (def?.gallery || [])
  };
};

const repairBlog = (b: BlogPost, def?: BlogPost): BlogPost => ({
  ...def,
  ...b,
  image: b.image || def?.image || ''
});

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = loadFromStorage<Project>('anvitam_projects_v2', INITIAL_PROJECTS);
    return mergePreservingLocal(stored, [], INITIAL_PROJECTS, repairProject);
  });
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    const stored = loadFromStorage<BlogPost>('anvitam_blogs_v2', INITIAL_BLOGS);
    return mergePreservingLocal(stored, [], INITIAL_BLOGS, repairBlog);
  });
  const [services, setServices] = useState<Service[]>(() => {
    const stored = loadFromStorage<Service>('anvitam_services_v5', SERVICES);
    return mergePreservingLocal(stored, [], SERVICES, repairService);
  });
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>(() => {
    const stored = loadFromStorage<DigitalProduct>('anvitam_products', DIGITAL_PRODUCTS);
    return mergePreservingLocal(stored, [], DIGITAL_PRODUCTS, repairProduct);
  });
  const [messages, setMessages] = useState<ContactMessage[]>(() =>
    loadFromStorage<ContactMessage>('anvitam_messages', [])
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() =>
    loadFromStorage<Testimonial>('anvitam_testimonials', INITIAL_TESTIMONIALS)
  );
  const [estimatorServices, setEstimatorServices] = useState<EstimatorService[]>(() =>
    loadFromStorage<EstimatorService>('anvitam_estimator_services_v1', INITIAL_ESTIMATOR_SERVICES)
  );
  const [partners, setPartners] = useState<PartnerBrand[]>(() => {
    const raw = loadFromStorage<PartnerBrand>('anvitam_partners_v3', INITIAL_PARTNERS);
    return raw.map(p => {
      if (!p.logo) {
        const initP = INITIAL_PARTNERS.find(ip => ip.id === p.id || ip.name.toLowerCase() === p.name.toLowerCase());
        if (initP?.logo) return { ...p, logo: initP.logo };
      }
      return p;
    });
  });
  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    const stored = loadFromStorage<Workshop>('anvitam_workshops_v2', INITIAL_WORKSHOPS);
    return mergePreservingLocal(stored, [], INITIAL_WORKSHOPS, repairWorkshop);
  });
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  // ── Fetch from Neon DB ────────────────────────────────────────────
  const refreshFromDb = async () => {
    try {
      const [blogsRes, projectsRes, servicesRes, productsRes, testimonialsRes, partnersRes, workshopsRes] = await Promise.all([
        fetch('/api/blogs'),
        fetch('/api/projects'),
        fetch('/api/services'),
        fetch('/api/products'),
        fetch('/api/testimonials'),
        fetch('/api/partners'),
        fetch('/api/workshops')
      ]);

      const hasAnyFallback = 
        blogsRes.headers.get('x-db-fallback') === 'true' ||
        projectsRes.headers.get('x-db-fallback') === 'true' ||
        servicesRes.headers.get('x-db-fallback') === 'true' ||
        productsRes.headers.get('x-db-fallback') === 'true' ||
        testimonialsRes.headers.get('x-db-fallback') === 'true' ||
        partnersRes.headers.get('x-db-fallback') === 'true' ||
        workshopsRes.headers.get('x-db-fallback') === 'true';

      if (workshopsRes.ok) {
        const rawWorkshops: Workshop[] = await workshopsRes.json();
        setWorkshops(prev => {
          const merged = mergePreservingLocal(prev, rawWorkshops, INITIAL_WORKSHOPS, repairWorkshop);
          saveToStorage('anvitam_workshops_v2', merged);
          return merged;
        });
      }

      if (blogsRes.ok) {
        const dbBlogs: BlogPost[] = await blogsRes.json();
        setBlogs(prev => {
          const merged = mergePreservingLocal(prev, dbBlogs, INITIAL_BLOGS, repairBlog);
          saveToStorage('anvitam_blogs_v2', merged);
          return merged;
        });
      }

      if (projectsRes.ok) {
        const rawProjects: Project[] = await projectsRes.json();
        setProjects(prev => {
          const merged = mergePreservingLocal(prev, rawProjects, INITIAL_PROJECTS, repairProject);
          saveToStorage('anvitam_projects_v2', merged);
          return merged;
        });
      }

      if (servicesRes.ok) {
        const rawServices: Service[] = await servicesRes.json();
        setServices(prev => {
          const merged = mergePreservingLocal(prev, rawServices, SERVICES, repairService);
          saveToStorage('anvitam_services_v5', merged);
          return merged;
        });
      }

      if (productsRes.ok) {
        const rawProducts: DigitalProduct[] = await productsRes.json();
        setDigitalProducts(prev => {
          const merged = mergePreservingLocal(prev, rawProducts, DIGITAL_PRODUCTS, repairProduct);
          saveToStorage('anvitam_products', merged);
          return merged;
        });
      }

      if (testimonialsRes.ok) {
        const dbTestimonials: Testimonial[] = await testimonialsRes.json();
        setTestimonials(prev => {
          const merged = mergePreservingLocal(prev, dbTestimonials, INITIAL_TESTIMONIALS, (t, def) => ({
            ...def, ...t, image: t.image || def?.image || ''
          }));
          saveToStorage('anvitam_testimonials', merged);
          return merged;
        });
      }

      if (partnersRes.ok) {
        const dbPartners: PartnerBrand[] = await partnersRes.json();
        setPartners(prev => {
          const merged = mergePreservingLocal(prev, dbPartners, INITIAL_PARTNERS, (p, def) => ({
            ...def, ...p, logo: p.logo || def?.logo || ''
          }));
          saveToStorage('anvitam_partners_v3', merged);
          return merged;
        });
      }

      // Fetch messages if admin token exists
      const token = getAuthToken();
      if (token) {
        const msgRes = await fetch('/api/messages', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (msgRes.ok) {
          const dbMessages: ContactMessage[] = await msgRes.json();
          setMessages(dbMessages);
          saveToStorage('anvitam_messages', dbMessages);
        }
      }

      setIsDbConnected(!hasAnyFallback);
    } catch (err) {
      console.warn('[ContentContext] DB sync failed — using local data:', err);
      setIsDbConnected(false);
    } finally {
      setIsInitialSyncDone(true);
    }
  };

  // Fetch on mount — always sync from DB (DB is the source of truth)
  useEffect(() => {
    refreshFromDb();
  }, []);

  // Auto-reconnect if DB is offline
  useEffect(() => {
    let interval: any;
    if (!isDbConnected && isInitialSyncDone) {
      interval = setInterval(() => {
        refreshFromDb();
      }, 15000); // Auto-retry every 15 seconds if disconnected
    }
    return () => clearInterval(interval);
  }, [isDbConnected, isInitialSyncDone]);

  // Persist items to localStorage
  useEffect(() => { saveToStorage('anvitam_services_v5', services); }, [services]);
  useEffect(() => { saveToStorage('anvitam_products', digitalProducts); }, [digitalProducts]);
  useEffect(() => { saveToStorage('anvitam_projects_v2', projects); }, [projects]);
  useEffect(() => { saveToStorage('anvitam_blogs_v2', blogs); }, [blogs]);
  useEffect(() => { saveToStorage('anvitam_testimonials', testimonials); }, [testimonials]);
  useEffect(() => { saveToStorage('anvitam_estimator_services_v1', estimatorServices); }, [estimatorServices]);
  useEffect(() => { saveToStorage('anvitam_partners_v3', partners); }, [partners]);

  // ── CRUD Operations ──────────────────────────────────────────────────────
  const addProject = async (project: Project) => {
    setProjects(prev => [project, ...prev]);
    const token = getAuthToken();
    if (token) {
      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(project),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('[ContentContext] DB project save failed:', res.status, err);
        } else {
          console.log('[ContentContext] ✅ Project saved to DB:', project.title);
        }
      } catch (err) {
        console.error('[ContentContext] Failed to save project to DB:', err);
      }
    } else {
      console.warn('[ContentContext] No auth token — project saved to localStorage only');
    }
  };

  const updateProject = async (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/projects/${project.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(project),
        });
      } catch (err) {
        console.error('[ContentContext] Failed to update project in DB:', err);
      }
    }
  };

  const addBlog = async (blog: BlogPost) => {
    setBlogs(prev => [blog, ...prev]);
    const token = getAuthToken();
    if (token) {
      try {
        const res = await fetch('/api/blogs', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(blog),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('[ContentContext] DB blog save failed:', res.status, err);
        } else {
          console.log('[ContentContext] ✅ Blog saved to DB:', blog.title);
        }
      } catch (err) {
        console.error('[ContentContext] Failed to save blog to DB:', err);
      }
    } else {
      console.warn('[ContentContext] No auth token — blog saved to localStorage only');
    }
  };

  const updateBlog = async (blog: BlogPost) => {
    setBlogs(prev => prev.map(b => b.id === blog.id ? blog : b));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/blogs/${blog.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(blog),
        });
      } catch (err) {
        console.error('[ContentContext] Failed to update blog in DB:', err);
      }
    }
  };

  const addService = async (service: Service) => {
    setServices(prev => [...prev, service]);
    const token = getAuthToken();
    if (token) {
      try {
        await fetch('/api/services', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(service),
        });
      } catch (err) {
        console.error('[ContentContext] Failed to save service to DB:', err);
      }
    }
  };

  const updateService = async (service: Service) => {
    setServices(prev => prev.map(s => s.id === service.id ? service : s));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/services/${service.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(service),
        });
      } catch (err) {
        console.error('[ContentContext] Failed to update service in DB:', err);
      }
    }
  };

  const addDigitalProduct = async (product: DigitalProduct) => {
    setDigitalProducts(prev => [product, ...prev]);
    const token = getAuthToken();
    if (token) {
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(product),
        });
      } catch (err) {
        console.error('[ContentContext] Failed to save product to DB:', err);
      }
    }
  };

  const updateDigitalProduct = async (product: DigitalProduct) => {
    setDigitalProducts(prev => prev.map(p => p.id === product.id ? product : p));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(product),
        });
      } catch (err) {
        console.error('[ContentContext] Failed to update product in DB:', err);
      }
    }
  };

  const addMessage = async (message: ContactMessage) => {
    const msgObj: ContactMessage = {
      ...message,
      id: message.id || crypto.randomUUID(),
      date: message.date || new Date().toISOString(),
    };
    // Optimistic update with PII retention policy (max 50 items, max 30 days)
    setMessages(prev => {
      const filtered = prev.filter(m => m.id !== msgObj.id);
      const updated = [msgObj, ...filtered];
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const retained = updated.filter(m => {
        // Reject entries with missing or unparseable dates (unknown dates are not retained)
        if (!m.date) return false;
        const time = new Date(m.date).getTime();
        if (isNaN(time)) return false;
        return time >= thirtyDaysAgo;
      }).slice(0, 50);
      saveToStorage('anvitam_messages', retained);
      return retained;
    });

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgObj),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('[ContentContext] Failed to send message to DB:', err);
      // Revert optimistic addition on API failure
      setMessages(prev => {
        const reverted = prev.filter(m => m.id !== msgObj.id);
        saveToStorage('anvitam_messages', reverted);
        return reverted;
      });
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    // Optimistic removal from local state first
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToStorage('anvitam_projects_v2', updated);
      return updated;
    });
    const token = getAuthToken();
    let remoteOk = false;
    if (token) {
      try {
        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: authHeaders() });
        remoteOk = res.ok;
      } catch (err) {
        console.error('[ContentContext] Failed to delete project from DB:', err);
      }
    } else {
      // No token means local-only mode — treat as confirmed
      remoteOk = true;
    }
    // Only persist tombstone after confirmed remote delete
    if (remoteOk) addDeletedId(id);
  };

  const deleteBlog = async (id: string) => {
    setBlogs(prev => {
      const updated = prev.filter(b => b.id !== id);
      saveToStorage('anvitam_blogs_v2', updated);
      return updated;
    });
    const token = getAuthToken();
    let remoteOk = false;
    if (token) {
      try {
        const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE', headers: authHeaders() });
        remoteOk = res.ok;
      } catch (err) {
        console.error('[ContentContext] Failed to delete blog from DB:', err);
      }
    } else {
      remoteOk = true;
    }
    if (remoteOk) addDeletedId(id);
  };

  const deleteService = async (id: string) => {
    setServices(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveToStorage('anvitam_services_v5', updated);
      return updated;
    });
    const token = getAuthToken();
    let remoteOk = false;
    if (token) {
      try {
        const res = await fetch(`/api/services/${id}`, { method: 'DELETE', headers: authHeaders() });
        remoteOk = res.ok;
      } catch (err) {
        console.error('[ContentContext] Failed to delete service from DB:', err);
      }
    } else {
      remoteOk = true;
    }
    if (remoteOk) addDeletedId(id);
  };

  const deleteDigitalProduct = async (id: string) => {
    setDigitalProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToStorage('anvitam_products', updated);
      return updated;
    });
    const token = getAuthToken();
    let remoteOk = false;
    if (token) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders() });
        remoteOk = res.ok;
      } catch (err) {
        console.error('[ContentContext] Failed to delete product from DB:', err);
      }
    } else {
      remoteOk = true;
    }
    if (remoteOk) addDeletedId(id);
  };

  const deleteMessage = async (id: string) => {
    // Capture evicted item before removal so we can restore on failure
    let evicted: ContactMessage | undefined;
    setMessages(prev => {
      evicted = prev.find(m => m.id === id);
      const updated = prev.filter(m => m.id !== id);
      saveToStorage('anvitam_messages', updated);
      return updated;
    });
    const token = getAuthToken();
    if (token) {
      try {
        const res = await fetch(`/api/messages?id=${id}`, { method: 'DELETE', headers: authHeaders() });
        if (!res.ok) throw new Error(`DELETE /api/messages returned ${res.status}`);
      } catch (err) {
        console.error('[ContentContext] Failed to delete message from DB — restoring:', err);
        // Restore the evicted message so it isn't silently lost
        if (evicted) {
          setMessages(prev => {
            if (prev.some(m => m.id === id)) return prev; // already restored
            const restored = [evicted!, ...prev];
            saveToStorage('anvitam_messages', restored);
            return restored;
          });
        }
      }
    }
  };

  const addTestimonial = async (t: Testimonial) => {
    setTestimonials(prev => [t, ...prev]);
    const token = getAuthToken();
    if (token) {
      try {
        await fetch('/api/testimonials', { method: 'POST', headers: authHeaders(), body: JSON.stringify(t) });
      } catch (err) {
        console.error('Failed to save testimonial:', err);
      }
    }
  };

  const updateTestimonial = async (t: Testimonial) => {
    setTestimonials(prev => prev.map(item => item.id === t.id ? t : item));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/testimonials/${t.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(t) });
      } catch (err) {
        console.error('Failed to update testimonial:', err);
      }
    }
  };

  const deleteTestimonial = async (id: string) => {
    setTestimonials(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveToStorage('anvitam_testimonials', updated);
      return updated;
    });
    const token = getAuthToken();
    let remoteOk = false;
    if (token) {
      try {
        const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE', headers: authHeaders() });
        remoteOk = res.ok;
      } catch (err) {
        console.error('Failed to delete testimonial:', err);
      }
    } else {
      remoteOk = true;
    }
    if (remoteOk) addDeletedId(id);
  };

  const addEstimatorService = async (s: EstimatorService) => {
    setEstimatorServices(prev => [s, ...prev]);
    const token = getAuthToken();
    if (token) {
      try {
        await fetch('/api/estimator-services', { method: 'POST', headers: authHeaders(), body: JSON.stringify(s) });
      } catch (err) {
        console.error('Failed to save estimator service to DB:', err);
      }
    }
  };

  const updateEstimatorService = async (s: EstimatorService) => {
    setEstimatorServices(prev => prev.map(item => item.id === s.id ? s : item));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/estimator-services/${s.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(s) });
      } catch (err) {
        console.error('Failed to update estimator service in DB:', err);
      }
    }
  };

  const deleteEstimatorService = async (id: string) => {
    setEstimatorServices(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage('anvitam_estimator_services_v1', updated);
      return updated;
    });
    const token = getAuthToken();
    let remoteOk = false;
    if (token) {
      try {
        const res = await fetch(`/api/estimator-services/${id}`, { method: 'DELETE', headers: authHeaders() });
        remoteOk = res.ok;
      } catch (err) {
        console.error('Failed to delete estimator service from DB:', err);
      }
    } else {
      remoteOk = true;
    }
    if (remoteOk) addDeletedId(id);
  };

  const addPartner = async (p: PartnerBrand) => {
    setPartners(prev => [p, ...prev]);
    const token = getAuthToken();
    if (token) {
      try {
        await fetch('/api/partners', { method: 'POST', headers: authHeaders(), body: JSON.stringify(p) });
      } catch (err) {
        console.error('Failed to save partner brand to DB:', err);
      }
    }
  };

  const updatePartner = async (p: PartnerBrand) => {
    setPartners(prev => prev.map(item => item.id === p.id ? p : item));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/partners/${p.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(p) });
      } catch (err) {
        console.error('Failed to update partner brand in DB:', err);
      }
    }
  };

  const deletePartner = async (id: string) => {
    addDeletedId(id);
    setPartners(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage('anvitam_partners_v3', updated);
      return updated;
    });
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/partners/${id}`, { method: 'DELETE', headers: authHeaders() });
      } catch (err) {
        console.error('Failed to delete partner brand from DB:', err);
      }
    }
  };

  const addWorkshop = async (w: Workshop) => {
    setWorkshops(prev => [w, ...prev]);
    const token = getAuthToken();
    if (token) {
      try {
        await fetch('/api/workshops', { method: 'POST', headers: authHeaders(), body: JSON.stringify(w) });
      } catch (err) {
        console.error('Failed to save workshop to DB:', err);
      }
    }
  };

  const updateWorkshop = async (w: Workshop) => {
    setWorkshops(prev => prev.map(item => item.id === w.id ? w : item));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/workshops/${w.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(w) });
      } catch (err) {
        console.error('Failed to update workshop in DB:', err);
      }
    }
  };

  const deleteWorkshop = async (id: string) => {
    addDeletedId(id);
    setWorkshops(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage('anvitam_workshops_v2', updated);
      return updated;
    });
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/workshops/${id}`, { method: 'DELETE', headers: authHeaders() });
      } catch (err) {
        console.error('Failed to delete workshop from DB:', err);
      }
    }
  };

  useEffect(() => { saveToStorage('anvitam_workshops_v2', workshops); }, [workshops]);

  return (
    <ContentContext.Provider value={{
      projects, blogs, services, digitalProducts, messages, testimonials, estimatorServices, partners, workshops,
      isDbConnected, isInitialSyncDone,
      addProject, updateProject, addBlog, updateBlog, addService, updateService, addDigitalProduct, updateDigitalProduct, addMessage, addTestimonial, updateTestimonial,
      addEstimatorService, updateEstimatorService, deleteEstimatorService,
      addPartner, updatePartner, deletePartner,
      addWorkshop, updateWorkshop, deleteWorkshop,
      deleteProject, deleteBlog, deleteService, deleteDigitalProduct, deleteMessage, deleteTestimonial,
      refreshFromDb,
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) throw new Error('useContent must be used within a ContentProvider');
  return context;
};