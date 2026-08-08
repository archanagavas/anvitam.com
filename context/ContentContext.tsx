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
  incomingItems: T[],
  defaultItems: T[],
  repairFn: (item: T, def?: T) => T
): T[] {
  const base = incomingItems && incomingItems.length > 0 ? incomingItems : defaultItems;
  const itemMap = new Map<string, T>();

  // 1. Populate default items
  for (const def of defaultItems) {
    if (def?.id) itemMap.set(def.id, repairFn(def, def));
  }

  // 2. Overlay incoming items from server API or fallback
  for (const item of base) {
    if (!item?.id) continue;
    const def = defaultItems.find(d => d.id === item.id);
    itemMap.set(item.id, repairFn(item, def));
  }

  // 3. Preserve local custom items or edits from browser localStorage
  if (Array.isArray(localItems)) {
    for (const loc of localItems) {
      if (!loc || !loc.id) continue;
      const existing = itemMap.get(loc.id);
      if (!existing) {
        // Custom item created in admin panel!
        itemMap.set(loc.id, loc);
      } else {
        // Preserving local edits over defaults, repairing images
        const def = defaultItems.find(d => d.id === loc.id);
        itemMap.set(loc.id, repairFn({ ...existing, ...loc }, def));
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

const repairService = (s: Service, def?: Service): Service => ({
  ...def,
  ...s,
  heroImage: s.heroImage || def?.heroImage || ''
});

const repairProduct = (p: DigitalProduct, def?: DigitalProduct): DigitalProduct => ({
  ...def,
  ...p,
  image: p.image || def?.image || ''
});

const repairProject = (p: Project, def?: Project): Project => ({
  ...def,
  ...p,
  image: p.image || def?.image || '',
  heroImage: p.heroImage || def?.heroImage || '',
  gallery: (p.gallery && p.gallery.length > 0) ? p.gallery : (def?.gallery || [])
});

const repairBlog = (b: BlogPost, def?: BlogPost): BlogPost => ({
  ...def,
  ...b,
  image: b.image || def?.image || ''
});

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = loadFromStorage<Project>('anvitam_projects_v2', INITIAL_PROJECTS);
    return mergePreservingLocal(stored, stored, INITIAL_PROJECTS, repairProject);
  });
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    const stored = loadFromStorage<BlogPost>('anvitam_blogs_v2', INITIAL_BLOGS);
    return mergePreservingLocal(stored, stored, INITIAL_BLOGS, repairBlog);
  });
  const [services, setServices] = useState<Service[]>(() => {
    const stored = loadFromStorage<Service>('anvitam_services_v5', SERVICES);
    return mergePreservingLocal(stored, stored, SERVICES, repairService);
  });
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>(() => {
    const stored = loadFromStorage<DigitalProduct>('anvitam_products', DIGITAL_PRODUCTS);
    return mergePreservingLocal(stored, stored, DIGITAL_PRODUCTS, repairProduct);
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
    return mergePreservingLocal(stored, stored, INITIAL_WORKSHOPS, repairWorkshop);
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
    // Note: self-healing resets removed — DB data always wins on sync
  }, []);

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
    setMessages(prev => [message, ...prev]);
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (err) {
      console.warn('[ContentContext] Failed to save message to DB:', err);
    }
  };

  const deleteProject = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: authHeaders() });
      } catch (err) {
        console.error('[ContentContext] Failed to delete project from DB:', err);
      }
    }
  };

  const deleteBlog = async (id: string) => {
    setBlogs(prev => prev.filter(b => b.id !== id));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/blogs/${id}`, { method: 'DELETE', headers: authHeaders() });
      } catch (err) {
        console.error('[ContentContext] Failed to delete blog from DB:', err);
      }
    }
  };

  const deleteService = async (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/services/${id}`, { method: 'DELETE', headers: authHeaders() });
      } catch (err) {
        console.error('[ContentContext] Failed to delete service from DB:', err);
      }
    }
  };

  const deleteDigitalProduct = async (id: string) => {
    setDigitalProducts(prev => prev.filter(p => p.id !== id));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders() });
      } catch (err) {
        console.error('[ContentContext] Failed to delete product from DB:', err);
      }
    }
  };

  const deleteMessage = async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/messages/${id}`, { method: 'DELETE', headers: authHeaders() });
      } catch (err) {
        console.error('[ContentContext] Failed to delete message from DB:', err);
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
    setTestimonials(prev => prev.filter(t => t.id !== id));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/testimonials/${id}`, { method: 'DELETE', headers: authHeaders() });
      } catch (err) {
        console.error('Failed to delete testimonial:', err);
      }
    }
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
    setEstimatorServices(prev => prev.filter(item => item.id !== id));
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`/api/estimator-services/${id}`, { method: 'DELETE', headers: authHeaders() });
      } catch (err) {
        console.error('Failed to delete estimator service from DB:', err);
      }
    }
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
    setPartners(prev => prev.filter(item => item.id !== id));
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
    setWorkshops(prev => prev.filter(item => item.id !== id));
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