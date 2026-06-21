/**
 * context/ContentContext.tsx
 * 
 * Hybrid data layer:
 *  1. Optimistically renders from localStorage (instant, no flash)
 *  2. Syncs with Neon database API in the background
 *  3. Admin mutations hit the API and update local state
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, BlogPost, Service, DigitalProduct, ContactMessage, Testimonial } from '../types';
import { INITIAL_PROJECTS, INITIAL_BLOGS, SERVICES, DIGITAL_PRODUCTS, INITIAL_TESTIMONIALS } from '../constants';

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
  isDbConnected: boolean;
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

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[ContentContext] Failed to save key "${key}" to localStorage:`, err);
  }
}

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() =>
    loadFromStorage<Project>('anvitam_projects', INITIAL_PROJECTS)
  );
  const [blogs, setBlogs] = useState<BlogPost[]>(() =>
    loadFromStorage<BlogPost>('anvitam_blogs', INITIAL_BLOGS)
  );
  const [services, setServices] = useState<Service[]>(() =>
    loadFromStorage<Service>('anvitam_services_v5', SERVICES)
  );
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>(() =>
    loadFromStorage<DigitalProduct>('anvitam_products', DIGITAL_PRODUCTS)
  );
  const [messages, setMessages] = useState<ContactMessage[]>(() =>
    loadFromStorage<ContactMessage>('anvitam_messages', [])
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() =>
    loadFromStorage<Testimonial>('anvitam_testimonials', INITIAL_TESTIMONIALS)
  );
  const [isDbConnected, setIsDbConnected] = useState(false);

  // ── Fetch from Neon DB ────────────────────────────────────────────
  const refreshFromDb = async () => {
    try {
      const [blogsRes, projectsRes, servicesRes, productsRes, testimonialsRes] = await Promise.all([
        fetch('/api/blogs'),
        fetch('/api/projects'),
        fetch('/api/services'),
        fetch('/api/products'),
        fetch('/api/testimonials')
      ]);

      if (blogsRes.ok) {
        const dbBlogs: BlogPost[] = await blogsRes.json();
        if (dbBlogs.length > 0) {
          setBlogs(dbBlogs);
          saveToStorage('anvitam_blogs', dbBlogs);
        }
      }

      if (projectsRes.ok) {
        const dbProjects: Project[] = await projectsRes.json();
        if (dbProjects.length > 0) {
          setProjects(dbProjects);
          saveToStorage('anvitam_projects', dbProjects);
        }
      }

      if (servicesRes.ok) {
        const dbServices: Service[] = await servicesRes.json();
        if (dbServices.length > 0) {
          setServices(dbServices);
          saveToStorage('anvitam_services_v5', dbServices);
        }
      }

      if (productsRes.ok) {
        const dbProducts: DigitalProduct[] = await productsRes.json();
        if (dbProducts.length > 0) {
          setDigitalProducts(dbProducts);
          saveToStorage('anvitam_products', dbProducts);
        }
      }

      if (testimonialsRes.ok) {
        const dbTestimonials: Testimonial[] = await testimonialsRes.json();
        if (dbTestimonials.length > 0) {
          setTestimonials(dbTestimonials);
          saveToStorage('anvitam_testimonials', dbTestimonials);
        }
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

      setIsDbConnected(true);
    } catch (err) {
      console.warn('[ContentContext] DB sync failed — using local data:', err);
      setIsDbConnected(false);
    }
  };

  // Fetch on mount and self-healing check
  useEffect(() => {
    refreshFromDb();

    // Self-healing: reset broken/old data
    if (projects.some(p => p.id === 'container-motel' || p.image.includes('1518481612222'))) {
      setProjects(INITIAL_PROJECTS);
    }
    if (services.length <= 6) {
      setServices(SERVICES);
    }
  }, []);

  // Persist items to localStorage
  useEffect(() => { saveToStorage('anvitam_services_v5', services); }, [services]);
  useEffect(() => { saveToStorage('anvitam_products', digitalProducts); }, [digitalProducts]);
  useEffect(() => { saveToStorage('anvitam_projects', projects); }, [projects]);
  useEffect(() => { saveToStorage('anvitam_blogs', blogs); }, [blogs]);
  useEffect(() => { saveToStorage('anvitam_testimonials', testimonials); }, [testimonials]);

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

  return (
    <ContentContext.Provider value={{
      projects, blogs, services, digitalProducts, messages, testimonials,
      isDbConnected,
      addProject, updateProject, addBlog, updateBlog, addService, updateService, addDigitalProduct, updateDigitalProduct, addMessage, addTestimonial, updateTestimonial,
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