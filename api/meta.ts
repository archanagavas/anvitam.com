import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDbConfigured, getCollection, getDoc, upsertDoc, deleteDoc } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_PARTNERS, INITIAL_TESTIMONIALS, INITIAL_ESTIMATOR_SERVICES } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const resource = (req.query.resource as string) || 'partners';
  const ALLOWED_RESOURCES = ['partners', 'testimonials', 'estimator-services'];
  if (!ALLOWED_RESOURCES.includes(resource)) return res.status(400).json({ error: `Unsupported resource: ${resource}` });

  const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
  if (!req.method || !ALLOWED_METHODS.includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });

  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) ||
    (lastPart && !['partners', 'testimonials', 'estimator-services', 'meta', 'meta.ts', 'meta.js'].includes(lastPart) ? lastPart : undefined);

  // Map resource name to Firestore collection name
  const collectionName = resource === 'estimator-services' ? 'estimator_services' : resource;

  // ── FALLBACK DATA MAP ─────────────────────────────────────────────────────
  const fallbackMap: Record<string, any[]> = {
    partners: INITIAL_PARTNERS,
    testimonials: INITIAL_TESTIMONIALS,
    'estimator-services': INITIAL_ESTIMATOR_SERVICES,
  };
  const fallbackData = fallbackMap[resource] || [];

  // ── NO DB CONFIGURED ────────────────────────────────────────────────────
  if (!isDbConfigured) {
    if (req.method === 'GET') {
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const item = fallbackData.find(i => i.id === id);
        if (!item) return res.status(404).json({ error: `${resource} not found` });
        return res.status(200).json(item);
      }
      return res.status(200).json(fallbackData);
    }
    return res.status(503).json({ error: 'Database not configured' });
  }

  // ── GET ─────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
      if (id) {
        const row = await getDoc(collectionName, id);
        if (!row) {
          const fallback = fallbackData.find(i => i.id === id);
          if (fallback) { res.setHeader('x-db-fallback', 'true'); return res.status(200).json(fallback); }
          return res.status(404).json({ error: `${resource} not found` });
        }
        // Merge logo from constants if missing (partners)
        if (resource === 'partners' && !row.logo) {
          const init = INITIAL_PARTNERS.find(p => p.id === row.id || p.name?.toLowerCase() === row.name?.toLowerCase());
          if (init?.logo) row.logo = init.logo;
        }
        return res.status(200).json(row);
      }
      const rows = await getCollection(collectionName, resource === 'testimonials' ? 'desc' : 'asc');
      if (rows.length === 0) { res.setHeader('x-db-fallback', 'true'); return res.status(200).json(fallbackData); }
      // Merge logos from constants for partners
      if (resource === 'partners') {
        const merged = rows.map(r => {
          if (!r.logo) {
            const initP = INITIAL_PARTNERS.find(p => p.id === r.id || p.name?.toLowerCase() === r.name?.toLowerCase());
            if (initP?.logo) return { ...r, logo: initP.logo };
          }
          return r;
        });
        return res.status(200).json(merged);
      }
      return res.status(200).json(rows);
    } catch (err) {
      res.setHeader('x-db-fallback', 'true');
      return res.status(200).json(fallbackData);
    }
  }

  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const b = req.body ?? {};
    let targetId = id || b.id;

    if (resource === 'partners') {
      const { name, logo, icon, website } = b;
      if (!name?.trim()) return res.status(400).json({ error: 'Missing required field: name' });
      targetId = targetId || `partner-${Date.now()}`;
      try { await upsertDoc('partners', targetId, { id: targetId, name: name.trim(), logo: logo || '', icon: icon || '', website: website || '' }); }
      catch (err) { console.warn('[meta/partners] upsert failed:', err); }
      return res.status(201).json({ success: true, id: targetId });
    }

    if (resource === 'testimonials') {
      const { author, role, text, image } = b;
      if (!author?.trim() || !text?.trim()) return res.status(400).json({ error: 'Missing required fields: author, text' });
      targetId = targetId || `testim-${Date.now()}`;
      try { await upsertDoc('testimonials', targetId, { id: targetId, author: author.trim(), role: role || '', text: text.trim(), image: image || '' }); }
      catch (err) { console.warn('[meta/testimonials] upsert failed:', err); }
      return res.status(201).json({ success: true, id: targetId });
    }

    if (resource === 'estimator-services') {
      const { title, icon, desc, subs, baseINR } = b;
      if (!title?.trim()) return res.status(400).json({ error: 'Missing required field: title' });
      const slugId = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      targetId = targetId || slugId || `estimator-${Date.now()}`;
      try { await upsertDoc('estimator_services', targetId, { id: targetId, title: title.trim(), icon: icon || '🌿', desc: desc || '', subs: subs || [], baseINR: baseINR || [] }); }
      catch (err) { console.warn('[meta/estimator] upsert failed:', err); }
      return res.status(201).json({ success: true, id: targetId });
    }
  }

  // ── PUT ──────────────────────────────────────────────────────────────────
  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: `Missing ${resource} ID` });
    const b = req.body ?? {};

    if (resource === 'partners') {
      const { name, logo, icon, website } = b;
      if (!name?.trim()) return res.status(400).json({ error: 'Missing required field: name' });
      try { await upsertDoc('partners', id, { name: name.trim(), logo: logo || '', icon: icon || '', website: website || '' }); }
      catch (err) { console.warn('[meta/partners] update failed:', err); }
      return res.status(200).json({ success: true, id });
    }

    if (resource === 'testimonials') {
      const { author, role, text, image } = b;
      if (!author?.trim() || !text?.trim()) return res.status(400).json({ error: 'Missing required fields: author, text' });
      try { await upsertDoc('testimonials', id, { author: author.trim(), role: role || '', text: text.trim(), image: image || '' }); }
      catch (err) { console.warn('[meta/testimonials] update failed:', err); }
      return res.status(200).json({ success: true, id });
    }

    if (resource === 'estimator-services') {
      const { title, icon, desc, subs, baseINR } = b;
      if (!title?.trim()) return res.status(400).json({ error: 'Missing required field: title' });
      try { await upsertDoc('estimator_services', id, { title: title.trim(), icon: icon || '🌿', desc: desc || '', subs: subs || [], baseINR: baseINR || [] }); }
      catch (err) { console.warn('[meta/estimator] update failed:', err); }
      return res.status(200).json({ success: true, id });
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
}
