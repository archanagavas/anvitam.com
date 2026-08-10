import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDbConfigured, getCollection, getDoc, findWhere, upsertDoc, deleteDoc } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_PROJECTS } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) ||
    (lastPart && lastPart !== 'projects' && lastPart !== 'projects.ts' && lastPart !== 'projects.js' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const p = INITIAL_PROJECTS.find(p => p.id === id || p.slug === id);
        if (!p) return res.status(404).json({ error: 'Project not found' });
        return res.status(200).json(p);
      }
      return res.status(200).json(INITIAL_PROJECTS);
    }
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (req.method === 'GET') {
    try {
      if (id) {
        let row = await getDoc('projects', id);
        if (!row) {
          const bySlug = await findWhere('projects', 'slug', id);
          row = bySlug[0] || null;
        }
        if (!row) {
          const fallback = INITIAL_PROJECTS.find(p => p.id === id || p.slug === id);
          if (fallback) { res.setHeader('x-db-fallback', 'true'); return res.status(200).json(fallback); }
          return res.status(404).json({ error: 'Project not found' });
        }
        return res.status(200).json(normalizeProject(row));
      }
      const rows = await getCollection('projects', 'desc');
      return res.status(200).json(rows.map(normalizeProject));
    } catch (err) {
      console.warn('[projects API] Firestore error, falling back:', err);
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const p = INITIAL_PROJECTS.find(p => p.id === id || p.slug === id);
        return p ? res.status(200).json(p) : res.status(404).json({ error: 'Project not found' });
      }
      return res.status(200).json(INITIAL_PROJECTS);
    }
  }

  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const b = req.body ?? {};
    const targetId = id || b.id;
    if (!targetId) return res.status(400).json({ error: 'Missing project ID' });
    try {
      await upsertDoc('projects', targetId, buildProjectDoc(b, targetId));
    } catch (err) { console.warn('[projects API] upsert failed:', err); }
    return res.status(201).json({ success: true });
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing project ID' });
    try {
      await upsertDoc('projects', id, buildProjectDoc(req.body ?? {}, id));
    } catch (err) { console.warn('[projects API] update failed:', err); }
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing project ID' });
    try { await deleteDoc('projects', id); } catch (err) { console.warn('[projects API] delete failed:', err); }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function buildProjectDoc(b: any, id: string) {
  return {
    id, title: b.title || '', slug: b.slug || id,
    category: b.category || '', location: b.location || '',
    year: b.year || '', image: b.image || '', heroImage: b.heroImage || '',
    description: b.description || '', fullDescription: b.fullDescription || '',
    gallery: b.gallery || [], specs: b.specs || [], story: b.story || [],
    isFeatured: b.isFeatured ?? false,
    tags: b.tags || [], faqs: b.faqs || [], videos: b.videos || [],
    status: b.status || 'published',
    metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || '',
    metaKeywords: b.metaKeywords || '',
    metaRobots: b.metaRobots?.trim() ? b.metaRobots : 'index, follow',
  };
}

function normalizeProject(r: any) {
  return {
    id: r.id, title: r.title, slug: r.slug || r.id,
    category: r.category, location: r.location, year: r.year,
    image: r.image, heroImage: r.heroImage || r.hero_image || '',
    description: r.description, fullDescription: r.fullDescription || r.full_description || '',
    gallery: r.gallery || [], specs: r.specs || [], story: r.story || [],
    isFeatured: r.isFeatured ?? r.is_featured ?? false,
    tags: r.tags || [], faqs: r.faqs || [], videos: r.videos || [],
    status: r.status || '',
    metaTitle: r.metaTitle || r.meta_title || '',
    metaDescription: r.metaDescription || r.meta_description || '',
    metaKeywords: r.metaKeywords || r.meta_keywords || '',
    metaRobots: r.metaRobots || r.meta_robots || '',
  };
}
