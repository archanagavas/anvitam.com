import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDbConfigured, getCollection, getDoc, findWhere, upsertDoc, deleteDoc } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_WORKSHOPS } from '../constants.js';

function normalizeWorkshop(row: any) {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization || '',
    location: row.location || '',
    city: row.city || '',
    state: row.state || '',
    country: row.country || '',
    date: row.date || '',
    category: row.category || 'School',
    description: row.description || '',
    attendeesCount: row.attendeesCount || row.attendees_count || '',
    offerings: row.offerings || [],
    skillsOutcomes: row.skillsOutcomes || row.skills_outcomes || '',
    materialsUsed: row.materialsUsed || row.materials_used || '',
    impact: row.impact || '',
    outcomes: row.outcomes || '',
    faqs: row.faqs || [],
    images: row.images || [],
    galleryDetails: row.galleryDetails || row.gallery_details || [],
    relatedProjectIds: row.relatedProjectIds || row.related_project_ids || [],
    relatedServiceIds: row.relatedServiceIds || row.related_service_ids || [],
    relatedArticleIds: row.relatedArticleIds || row.related_article_ids || [],
    slug: row.slug || '',
    metaTitle: row.metaTitle || row.meta_title || '',
    metaDescription: row.metaDescription || row.meta_description || '',
    primaryKeyword: row.primaryKeyword || row.primary_keyword || '',
    secondaryKeywords: row.secondaryKeywords || row.secondary_keywords || '',
    canonicalUrl: row.canonicalUrl || row.canonical_url || '',
    ogTitle: row.ogTitle || row.og_title || '',
    ogDescription: row.ogDescription || row.og_description || '',
    ogImage: row.ogImage || row.og_image || '',
    status: row.status || 'published',
    createdAt: row.createdAt || row.created_at,
  };
}

function buildWorkshopDoc(b: any, id: string) {
  return {
    id, title: b.title || '',
    organization: b.organization || '', location: b.location || '',
    city: b.city || '', state: b.state || '', country: b.country || '',
    date: b.date || '', category: b.category || 'School',
    description: b.description || '', attendeesCount: b.attendeesCount || '',
    offerings: b.offerings || [], skillsOutcomes: b.skillsOutcomes || '',
    materialsUsed: b.materialsUsed || '', impact: b.impact || '',
    outcomes: b.outcomes || '', faqs: b.faqs || [], images: b.images || [],
    galleryDetails: b.galleryDetails || [],
    relatedProjectIds: b.relatedProjectIds || [],
    relatedServiceIds: b.relatedServiceIds || [],
    relatedArticleIds: b.relatedArticleIds || [],
    slug: b.slug || '',
    metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || '',
    primaryKeyword: b.primaryKeyword || '', secondaryKeywords: b.secondaryKeywords || '',
    canonicalUrl: b.canonicalUrl || '', ogTitle: b.ogTitle || '',
    ogDescription: b.ogDescription || '', ogImage: b.ogImage || '',
    status: b.status || 'published',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) ||
    (lastPart && lastPart !== 'workshops' && lastPart !== 'workshops.ts' && lastPart !== 'workshops.js' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const w = INITIAL_WORKSHOPS.find(w => w.id === id);
        if (!w) return res.status(404).json({ error: 'Workshop not found' });
        return res.status(200).json(w);
      }
      return res.status(200).json(INITIAL_WORKSHOPS);
    }
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (req.method === 'GET') {
    try {
      if (id) {
        let row = await getDoc('workshops', id);
        if (!row) {
          const bySlug = await findWhere('workshops', 'slug', id);
          row = bySlug[0] || null;
        }
        if (!row) {
          const fallback = INITIAL_WORKSHOPS.find(w => w.id === id);
          if (fallback) { res.setHeader('x-db-fallback', 'true'); return res.status(200).json(fallback); }
          return res.status(404).json({ error: 'Workshop not found' });
        }
        return res.status(200).json(normalizeWorkshop(row));
      }
      const rows = await getCollection('workshops', 'desc');
      if (rows.length === 0) return res.status(200).json(INITIAL_WORKSHOPS);
      return res.status(200).json(rows.map(normalizeWorkshop));
    } catch (err) {
      console.warn('[workshops API] Firestore error:', err);
      res.setHeader('x-db-fallback', 'true');
      return res.status(200).json(INITIAL_WORKSHOPS);
    }
  }

  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const b = req.body ?? {};
    const targetId = id || b.id || `workshop-${Date.now()}`;
    try {
      await upsertDoc('workshops', targetId, buildWorkshopDoc(b, targetId));
    } catch (err) { console.warn('[workshops API] upsert failed:', err); }
    return res.status(201).json({ success: true, id: targetId });
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing workshop ID' });
    try {
      await upsertDoc('workshops', id, buildWorkshopDoc(req.body ?? {}, id));
    } catch (err) { console.warn('[workshops API] update failed:', err); }
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing workshop ID' });
    try { await deleteDoc('workshops', id); } catch (err) { console.warn('[workshops API] delete failed:', err); }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
