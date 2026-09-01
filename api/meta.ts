import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../lib/adapter.js';
import { isDbConfigured, getCollection, getDoc, findWhere, upsertDoc, deleteDoc } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import {
  INITIAL_PARTNERS,
  INITIAL_TESTIMONIALS,
  INITIAL_ESTIMATOR_SERVICES,
  INITIAL_WORKSHOPS,
  INITIAL_BLOGS,
  INITIAL_PROJECTS,
  SERVICES,
  DIGITAL_PRODUCTS,
} from '../constants.js';

const ALL_MOCK_PRODUCTS = [
  ...DIGITAL_PRODUCTS,
  {
    id: 'c1', title: 'Farm Retreat Design Masterclass',
    description: 'A comprehensive online course covering site analysis, bioclimatic design, permaculture zoning, and how to create profitable eco-retreat experiences from scratch.',
    price: '₹3,999', link: 'https://topmate.io/archanagavas',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
    tags: ['Architecture', 'Permaculture', 'Business'], category: 'Online Courses'
  },
  {
    id: 'c2', title: 'Food Forest Design Blueprint',
    description: 'Design productive food forests and edible gardens using proven permaculture techniques.',
    price: '₹2,499', link: 'https://topmate.io/archanagavas',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
    tags: ['Food Forest', 'Landscape', 'Sustainability'], category: 'Online Courses'
  },
  {
    id: 'c3', title: 'Airbnb & Homestay Design for Revenue',
    description: 'Learn how to design and position your Airbnb for maximum occupancy.',
    price: '₹1,999', link: 'https://topmate.io/archanagavas',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    tags: ['Airbnb', 'Interior', 'Hospitality'], category: 'Online Courses'
  },
];

export default createHandler(async function handler(req: VercelRequest, res: VercelResponse) {
  const resource = (req.query.resource as string) || 'partners';
  const ALLOWED_RESOURCES = [
    'partners',
    'testimonials',
    'estimator-services',
    'workshops',
    'blogs',
    'products',
    'projects',
    'services',
  ];
  if (!ALLOWED_RESOURCES.includes(resource)) return res.status(400).json({ error: `Unsupported resource: ${resource}` });

  const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
  if (!req.method || !ALLOWED_METHODS.includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });

  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) ||
    (lastPart && !['partners', 'testimonials', 'estimator-services', 'workshops', 'blogs', 'products', 'projects', 'services', 'meta', 'meta.ts', 'meta.js'].includes(lastPart) ? lastPart : undefined);

  // Map resource name to Firestore collection name
  const collectionNameMap: Record<string, string> = {
    'estimator-services': 'estimator_services',
    'products': 'digital_products',
  };
  const collectionName = collectionNameMap[resource] || resource;

  // ── FALLBACK DATA MAP ─────────────────────────────────────────────────────
  const fallbackMap: Record<string, any[]> = {
    partners: INITIAL_PARTNERS,
    testimonials: INITIAL_TESTIMONIALS,
    'estimator-services': INITIAL_ESTIMATOR_SERVICES,
    workshops: INITIAL_WORKSHOPS,
    blogs: INITIAL_BLOGS,
    products: ALL_MOCK_PRODUCTS,
    projects: INITIAL_PROJECTS,
    services: SERVICES,
  };
  const fallbackData = fallbackMap[resource] || [];

  // ── NO DB CONFIGURED ────────────────────────────────────────────────────
  if (!isDbConfigured) {
    if (req.method === 'GET') {
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const item = fallbackData.find(i => i.id === id || i.slug === id);
        if (!item) return res.status(404).json({ error: `${resource} not found` });
        return res.status(200).json(item);
      }
      return res.status(200).json(fallbackData);
    }
    return res.status(503).json({ error: 'Database not configured' });
  }

  // ── GET ─────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
    try {
      if (id) {
        let row = await getDoc(collectionName, id);
        if (!row && (resource === 'blogs' || resource === 'projects')) {
          const bySlug = await findWhere(collectionName, 'slug', id);
          row = bySlug[0] || null;
        }
        if (!row) {
          const fallback = fallbackData.find(i => i.id === id || i.slug === id);
          if (fallback) { res.setHeader('x-db-fallback', 'true'); return res.status(200).json(fallback); }
          return res.status(404).json({ error: `${resource} not found` });
        }
        return res.status(200).json(normalizeItem(resource, row));
      }
      const sortDir = (resource === 'testimonials' || resource === 'blogs' || resource === 'projects' || resource === 'products') ? 'desc' : 'asc';
      const rows = await getCollection(collectionName, sortDir);
      if (resource === 'testimonials') {
        const validRows = rows.filter(r => r && r.text && r.text.trim().length > 0 && r.author && r.author !== 'Client');
        if (validRows.length === 0) { res.setHeader('x-db-fallback', 'true'); return res.status(200).json(fallbackData); }
        return res.status(200).json(validRows.map(r => normalizeItem(resource, r)));
      }
      if (rows.length === 0) { res.setHeader('x-db-fallback', 'true'); return res.status(200).json(fallbackData); }
      return res.status(200).json(rows.map(r => normalizeItem(resource, r)));
    } catch (err) {
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const fallback = fallbackData.find(i => i.id === id || i.slug === id);
        return fallback ? res.status(200).json(fallback) : res.status(404).json({ error: `${resource} not found` });
      }
      return res.status(200).json(fallbackData);
    }
  }

  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
  const targetId = id || b.id || `${resource}-${Date.now()}`;

  // ── POST / PUT ───────────────────────────────────────────────────────────
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      await upsertDoc(collectionName, targetId, buildDoc(resource, b, targetId));
      return res.status(req.method === 'POST' ? 201 : 200).json({ success: true, id: targetId });
    } catch (err: any) {
      console.error(`[meta/${resource}] save failed:`, err);
      return res.status(500).json({ error: err?.message || 'Database save failed' });
    }
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: `Missing ${resource} ID` });
    try { await deleteDoc(collectionName, id); }
    catch (err) { console.warn(`[meta/${resource}] delete failed:`, err); }
    return res.status(200).json({ success: true, id });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});

function sanitizeDocuments(raw: any): { id: string; label: string; url: string; description: string; gatedAccess: boolean }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((d): d is Record<string, any> => d !== null && typeof d === 'object')
    .map(d => ({
      id: typeof d.id === 'string' && d.id.trim() ? d.id.trim().substring(0, 64) : crypto.randomUUID(),
      label: typeof d.label === 'string' ? d.label.trim().substring(0, 200) : '',
      description: typeof d.description === 'string' ? d.description.trim().substring(0, 400) : '',
      url: (typeof d.url === 'string' && /^https?:\/\//i.test(d.url.trim())) ? d.url.trim().substring(0, 2048) : '',
      gatedAccess: d.gatedAccess !== false,
    }))
    .filter(d => d.label && d.url);
}

function buildDoc(resource: string, b: any, id: string): any {
  if (resource === 'blogs') {
    return {
      id, title: b.title || '', slug: b.slug || id, date: b.date || new Date().toISOString().split('T')[0],
      excerpt: b.excerpt || '', content: b.content || '', image: b.image || '', author: b.author || 'Anvitam Team',
      metaDescription: b.metaDescription || null, metaTitle: b.metaTitle || null, coverImageAlt: b.coverImageAlt || null,
      faqs: b.faqs || [], tags: b.tags || [], status: b.status || 'published', toc: b.toc || [],
      authorBio: b.authorBio || '', authorImage: b.authorImage || '', metaKeywords: b.metaKeywords || '',
      metaRobots: b.metaRobots?.trim() ? b.metaRobots : 'index, follow',
    };
  }
  if (resource === 'products') {
    return {
      id, title: b.title || '', description: b.description || '', price: b.price || '', link: b.link || '',
      image: b.image || '', tags: b.tags || [], category: b.category || 'E-Books',
      youtubeUrl: b.youtubeUrl || b.youtube_url || '', videos: b.videos || [],
      metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || '',
      metaKeywords: b.metaKeywords || '', metaRobots: b.metaRobots?.trim() ? b.metaRobots : 'index, follow',
    };
  }
  if (resource === 'projects') {
    return {
      id, title: b.title || '', slug: b.slug || id, category: b.category || '', location: b.location || '',
      year: b.year || '', image: b.image || '', heroImage: b.heroImage || '', description: b.description || '',
      fullDescription: b.fullDescription || '', gallery: b.gallery || [], specs: b.specs || [], story: b.story || [],
      isFeatured: b.isFeatured ?? false, tags: b.tags || [], faqs: b.faqs || [], videos: b.videos || [],
      documents: sanitizeDocuments(b.documents), status: b.status || 'published',
      metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || '',
      metaKeywords: b.metaKeywords || '', metaRobots: b.metaRobots?.trim() ? b.metaRobots : 'index, follow',
      isDraft: b.isDraft ?? false,
    };
  }
  if (resource === 'services') {
    return {
      id, title: b.title || '', description: b.description || '', icon: b.icon || 'PenTool', valueProps: b.valueProps || [],
      heroImage: b.heroImage || '', whatItIs: b.whatItIs || [], whoItsFor: b.whoItsFor || [], caseStudyId: b.caseStudyId || '',
      caseStudyIds: b.caseStudyIds || [], process: b.process || [], pricing: b.pricing || '', faq: b.faq || [],
      bookingLink: b.bookingLink || '', gallery: b.gallery || [], videos: b.videos || [], documents: sanitizeDocuments(b.documents),
      metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || '', metaKeywords: b.metaKeywords || '',
      metaRobots: b.metaRobots?.trim() ? b.metaRobots : 'index, follow',
    };
  }
  return { id, ...b };
}

function normalizeItem(resource: string, r: any): any {
  if (resource === 'blogs') {
    return {
      id: r.id,
      title: r.title || r.slug || r.id || '',
      slug: r.slug || r.id || '',
      date: r.date || new Date().toISOString().split('T')[0],
      excerpt: r.excerpt || '',
      content: r.content || '',
      image: r.image || r.cover_image || '',
      author: r.author || 'Ar. Archana Gavas',
      metaDescription: r.metaDescription || r.meta_description || '',
      metaTitle: r.metaTitle || r.meta_title || '',
      coverImageAlt: r.coverImageAlt || r.cover_image_alt || '',
      faqs: r.faqs || [],
      tags: r.tags || [],
      status: r.status || 'published',
      toc: r.toc || [],
      authorBio: r.authorBio || r.author_bio || '',
      authorImage: r.authorImage || r.author_image || '',
      metaKeywords: r.metaKeywords || r.meta_keywords || '',
      metaRobots: r.metaRobots || r.meta_robots || 'index, follow',
    };
  }
  if (resource === 'products') {
    return {
      id: r.id,
      title: r.title || '',
      description: r.description || '',
      price: r.price || '',
      link: r.link || '',
      image: r.image || '',
      tags: r.tags || [],
      category: r.category || 'E-Books',
      youtubeUrl: r.youtubeUrl || r.youtube_url || '',
      videos: r.videos || [],
      metaTitle: r.metaTitle || r.meta_title || '',
      metaDescription: r.metaDescription || r.meta_description || '',
      metaKeywords: r.metaKeywords || r.meta_keywords || '',
      metaRobots: r.metaRobots || r.meta_robots || '',
    };
  }
  if (resource === 'projects') {
    return {
      id: r.id,
      title: r.title || '',
      slug: r.slug || r.id,
      category: r.category || '',
      location: r.location || '',
      year: r.year || '',
      image: r.image || r.heroImage || r.hero_image || '',
      heroImage: r.heroImage || r.hero_image || r.image || '',
      description: r.description || '',
      fullDescription: r.fullDescription || r.full_description || '',
      gallery: r.gallery || [],
      specs: r.specs || [],
      story: r.story || [],
      isFeatured: r.isFeatured ?? r.is_featured ?? false,
      tags: r.tags || [],
      faqs: r.faqs || [],
      videos: r.videos || [],
      documents: r.documents || [],
      status: r.status || 'published',
      metaTitle: r.metaTitle || r.meta_title || '',
      metaDescription: r.metaDescription || r.meta_description || '',
      metaKeywords: r.metaKeywords || r.meta_keywords || '',
      metaRobots: r.metaRobots || r.meta_robots || '',
      isDraft: r.isDraft ?? r.is_draft ?? false,
    };
  }
  if (resource === 'services') {
    return {
      id: r.id,
      title: r.title || '',
      description: r.description || '',
      icon: r.icon || 'PenTool',
      category: r.category || '',
      valueProps: r.valueProps || r.value_props || [],
      heroImage: r.heroImage || r.hero_image || r.image || '',
      whatItIs: r.whatItIs || r.what_it_is || [],
      whoItsFor: r.whoItsFor || r.who_its_for || [],
      caseStudyId: r.caseStudyId || r.case_study_id || '',
      caseStudyIds: r.caseStudyIds || r.case_study_ids || [],
      process: r.process || [],
      pricing: r.pricing || '',
      faq: r.faq || [],
      bookingLink: r.bookingLink || r.booking_link || '',
      gallery: r.gallery || [],
      videos: r.videos || [],
      documents: r.documents || [],
      metaTitle: r.metaTitle || r.meta_title || '',
      metaDescription: r.metaDescription || r.meta_description || '',
      metaKeywords: r.metaKeywords || r.meta_keywords || '',
      metaRobots: r.metaRobots || r.meta_robots || '',
    };
  }
  if (resource === 'workshops') {
    return {
      id: r.id,
      title: r.title || '',
      slug: r.slug || r.id || '',
      subtitle: r.subtitle || '',
      description: r.description || '',
      audience: r.audience || 'School Students',
      date: r.date || '',
      time: r.time || '',
      location: r.location || '',
      coverImage: r.coverImage || r.cover_image || '',
      images: r.images || [],
      outcomes: r.outcomes || [],
      curriculum: r.curriculum || [],
      targetAudience: r.targetAudience || r.target_audience || [],
      status: r.status || 'upcoming',
      registerUrl: r.registerUrl || r.register_url || '',
      metaTitle: r.metaTitle || r.meta_title || '',
      metaDescription: r.metaDescription || r.meta_description || '',
    };
  }
  return r;
}
