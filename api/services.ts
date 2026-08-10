import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDbConfigured, getCollection, getDoc, upsertDoc, deleteDoc } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { SERVICES } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) ||
    (lastPart && lastPart !== 'services' && lastPart !== 'services.ts' && lastPart !== 'services.js' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const s = SERVICES.find(s => s.id === id);
        if (!s) return res.status(404).json({ error: 'Service not found' });
        return res.status(200).json(s);
      }
      return res.status(200).json(SERVICES);
    }
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
      if (id) {
        const row = await getDoc('services', id);
        if (!row) {
          const fallback = SERVICES.find(s => s.id === id);
          if (fallback) { res.setHeader('x-db-fallback', 'true'); return res.status(200).json(fallback); }
          return res.status(404).json({ error: 'Service not found' });
        }
        return res.status(200).json(normalizeService(row));
      }
      const rows = await getCollection('services', 'asc');
      const result = rows.length > 0 ? rows.map(normalizeService) : SERVICES;
      if (rows.length === 0) res.setHeader('x-db-fallback', 'true');
      return res.status(200).json(result);
    } catch (err) {
      console.warn('[services API] Firestore error:', err);
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const s = SERVICES.find(s => s.id === id);
        return s ? res.status(200).json(s) : res.status(404).json({ error: 'Service not found' });
      }
      return res.status(200).json(SERVICES);
    }
  }

  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const b = req.body ?? {};
    const targetId = id || b.id;
    if (!targetId) return res.status(400).json({ error: 'Missing service ID' });
    await upsertDoc('services', targetId, buildServiceDoc(b, targetId));
    return res.status(201).json({ success: true });
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing service ID' });
    try {
      await upsertDoc('services', id, buildServiceDoc(req.body ?? {}, id));
    } catch (err) { console.warn('[services API] update failed:', err); }
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing service ID' });
    try { await deleteDoc('services', id); } catch (err) { console.warn('[services API] delete failed:', err); }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function buildServiceDoc(b: any, id: string) {
  return {
    id, title: b.title || '', description: b.description || '',
    icon: b.icon || 'PenTool', valueProps: b.valueProps || [],
    heroImage: b.heroImage || '', whatItIs: b.whatItIs || [],
    whoItsFor: b.whoItsFor || [], caseStudyId: b.caseStudyId || '',
    caseStudyIds: b.caseStudyIds || [], process: b.process || [],
    pricing: b.pricing || '', faq: b.faq || [],
    bookingLink: b.bookingLink || '', gallery: b.gallery || [],
    videos: b.videos || [],
    metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || '',
    metaKeywords: b.metaKeywords || '',
    metaRobots: b.metaRobots?.trim() ? b.metaRobots : 'index, follow',
  };
}

function normalizeService(r: any) {
  return {
    id: r.id, title: r.title, description: r.description, icon: r.icon,
    valueProps: r.valueProps || r.value_props || [],
    heroImage: r.heroImage || r.hero_image || '',
    whatItIs: r.whatItIs || r.what_it_is || [],
    whoItsFor: r.whoItsFor || r.who_its_for || [],
    caseStudyId: r.caseStudyId || r.case_study_id || '',
    caseStudyIds: r.caseStudyIds || r.case_study_ids || [],
    process: r.process || [], pricing: r.pricing || '',
    faq: r.faq || [], bookingLink: r.bookingLink || r.booking_link || '',
    gallery: r.gallery || [], videos: r.videos || [],
    metaTitle: r.metaTitle || r.meta_title || '',
    metaDescription: r.metaDescription || r.meta_description || '',
    metaKeywords: r.metaKeywords || r.meta_keywords || '',
    metaRobots: r.metaRobots || r.meta_robots || '',
  };
}
