import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_PARTNERS, INITIAL_TESTIMONIALS, INITIAL_ESTIMATOR_SERVICES } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const resource = (req.query.resource as string) || 'partners';
  const ALLOWED_RESOURCES = ['partners', 'testimonials', 'estimator-services'];
  
  if (!ALLOWED_RESOURCES.includes(resource)) {
    return res.status(400).json({ error: `Unsupported resource: ${resource}` });
  }

  const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
  if (!req.method || !ALLOWED_METHODS.includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || 
             (lastPart && !['partners', 'testimonials', 'estimator-services', 'meta', 'meta.ts', 'meta.js'].includes(lastPart) ? lastPart : undefined);

  // ── 1. PARTNERS RESOURCE ──────────────────────────────────────────
  if (resource === 'partners') {
    if (!isDbConfigured) {
      if (req.method === 'GET') {
        res.setHeader('x-db-fallback', 'true');
        if (id) {
          const item = INITIAL_PARTNERS.find(i => i.id === id);
          if (!item) return res.status(404).json({ error: 'Partner brand not found' });
          return res.status(200).json(item);
        }
        return res.status(200).json(INITIAL_PARTNERS);
      }
      return res.status(503).json({ error: 'Database connection not configured' });
    }

    if (req.method === 'GET') {
      try {
        if (id) {
          const rows = await sql`SELECT id, name, logo, icon, website FROM partners WHERE id = ${id}`;
          if (rows.length === 0) {
            const mockItem = INITIAL_PARTNERS.find(i => i.id === id);
            if (mockItem) {
              res.setHeader('x-db-fallback', 'true');
              return res.status(200).json(mockItem);
            }
            return res.status(404).json({ error: 'Partner brand not found' });
          }
          return res.status(200).json(rows[0]);
        }
        const rows = await sql`SELECT id, name, logo, icon, website FROM partners ORDER BY created_at ASC`;
        if (rows.length === 0) {
          res.setHeader('x-db-fallback', 'true');
          return res.status(200).json(INITIAL_PARTNERS);
        }
        const mergedRows = rows.map((r: any) => {
          if (!r.logo) {
            const initP = INITIAL_PARTNERS.find(p => p.id === r.id || p.name.toLowerCase() === r.name.toLowerCase());
            if (initP?.logo) return { ...r, logo: initP.logo };
          }
          return r;
        });
        return res.status(200).json(mergedRows);
      } catch (dbError) {
        res.setHeader('x-db-fallback', 'true');
        return res.status(200).json(INITIAL_PARTNERS);
      }
    }

    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
      const { id: bodyId, name, logo, icon, website } = req.body ?? {};
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Missing required field: name' });
      }
      const targetId = id || bodyId || `partner-${Date.now()}`;
      try {
        await sql`
          INSERT INTO partners (id, name, logo, icon, website)
          VALUES (${targetId}, ${name.trim()}, ${logo || ''}, ${icon || ''}, ${website || ''})
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name, logo = EXCLUDED.logo, icon = EXCLUDED.icon, website = EXCLUDED.website
        `;
      } catch (err) {
        console.warn('[meta/partners API] Failed to insert/update partner in DB:', err);
      }
      return res.status(201).json({ success: true, id: targetId });
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'Missing partner ID' });
      const { name, logo, icon, website } = req.body ?? {};
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Missing required field: name' });
      }
      try {
        await sql`
          UPDATE partners SET name = ${name.trim()}, logo = ${logo || ''}, icon = ${icon || ''}, website = ${website || ''}
          WHERE id = ${id}
        `;
      } catch (err) {
        console.warn(`[meta/partners API] Failed to update partner ${id} in DB:`, err);
      }
      return res.status(200).json({ success: true, id });
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Missing partner ID' });
      try {
        await sql`DELETE FROM partners WHERE id = ${id}`;
      } catch (err) {
        console.warn(`[meta/partners API] Failed to delete partner ${id} from DB:`, err);
      }
      return res.status(200).json({ success: true, id });
    }
  }

  // ── 2. TESTIMONIALS RESOURCE ──────────────────────────────────────
  if (resource === 'testimonials') {
    if (!isDbConfigured) {
      if (req.method === 'GET') {
        res.setHeader('x-db-fallback', 'true');
        if (id) {
          const item = INITIAL_TESTIMONIALS.find(i => i.id === id);
          if (!item) return res.status(404).json({ error: 'Testimonial not found' });
          return res.status(200).json(item);
        }
        return res.status(200).json(INITIAL_TESTIMONIALS);
      }
      return res.status(503).json({ error: 'Database connection not configured' });
    }

    if (req.method === 'GET') {
      try {
        if (id) {
          const rows = await sql`SELECT id, author, role, text, image FROM testimonials WHERE id = ${id}`;
          if (rows.length === 0) {
            const mockItem = INITIAL_TESTIMONIALS.find(i => i.id === id);
            if (mockItem) {
              res.setHeader('x-db-fallback', 'true');
              return res.status(200).json(mockItem);
            }
            return res.status(404).json({ error: 'Testimonial not found' });
          }
          return res.status(200).json(rows[0]);
        }
        const rows = await sql`SELECT id, author, role, text, image FROM testimonials ORDER BY created_at DESC`;
        if (rows.length === 0) {
          res.setHeader('x-db-fallback', 'true');
          return res.status(200).json(INITIAL_TESTIMONIALS);
        }
        return res.status(200).json(rows);
      } catch (dbError) {
        res.setHeader('x-db-fallback', 'true');
        return res.status(200).json(INITIAL_TESTIMONIALS);
      }
    }

    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
      const { id: bodyId, author, role, text, image } = req.body ?? {};
      if (!author || !text || typeof author !== 'string' || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing required fields: author, text' });
      }
      const targetId = id || bodyId || `testim-${Date.now()}`;
      try {
        await sql`
          INSERT INTO testimonials (id, author, role, text, image)
          VALUES (${targetId}, ${author.trim()}, ${role || ''}, ${text.trim()}, ${image || ''})
          ON CONFLICT (id) DO UPDATE SET
            author = EXCLUDED.author, role = EXCLUDED.role, text = EXCLUDED.text, image = EXCLUDED.image
        `;
      } catch (err) {
        console.warn('[meta/testimonials API] Failed to insert/update testimonial in DB:', err);
      }
      return res.status(201).json({ success: true, id: targetId });
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'Missing testimonial ID' });
      const { author, role, text, image } = req.body ?? {};
      if (!author || !text || typeof author !== 'string' || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing required fields: author, text' });
      }
      try {
        await sql`
          UPDATE testimonials SET author = ${author.trim()}, role = ${role || ''}, text = ${text.trim()}, image = ${image || ''}
          WHERE id = ${id}
        `;
      } catch (err) {
        console.warn(`[meta/testimonials API] Failed to update testimonial ${id} in DB:`, err);
      }
      return res.status(200).json({ success: true, id });
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Missing testimonial ID' });
      try {
        await sql`DELETE FROM testimonials WHERE id = ${id}`;
      } catch (err) {
        console.warn(`[meta/testimonials API] Failed to delete testimonial ${id} from DB:`, err);
      }
      return res.status(200).json({ success: true, id });
    }
  }

  // ── 3. ESTIMATOR SERVICES RESOURCE ────────────────────────────────
  if (resource === 'estimator-services') {
    if (!isDbConfigured) {
      if (req.method === 'GET') {
        res.setHeader('x-db-fallback', 'true');
        if (id) {
          const item = INITIAL_ESTIMATOR_SERVICES.find(i => i.id === id);
          if (!item) return res.status(404).json({ error: 'Estimator service not found' });
          return res.status(200).json(item);
        }
        return res.status(200).json(INITIAL_ESTIMATOR_SERVICES);
      }
      return res.status(503).json({ error: 'Database connection not configured' });
    }

    if (req.method === 'GET') {
      try {
        if (id) {
          const rows = await sql`SELECT id, title, icon, description as "desc", subs, base_inr as "baseINR" FROM estimator_services WHERE id = ${id}`;
          if (rows.length === 0) {
            const mockItem = INITIAL_ESTIMATOR_SERVICES.find(i => i.id === id);
            if (mockItem) {
              res.setHeader('x-db-fallback', 'true');
              return res.status(200).json(mockItem);
            }
            return res.status(404).json({ error: 'Estimator service not found' });
          }
          return res.status(200).json(rows[0]);
        }
        const rows = await sql`SELECT id, title, icon, description as "desc", subs, base_inr as "baseINR" FROM estimator_services ORDER BY created_at ASC`;
        if (rows.length === 0) {
          res.setHeader('x-db-fallback', 'true');
          return res.status(200).json(INITIAL_ESTIMATOR_SERVICES);
        }
        return res.status(200).json(rows);
      } catch (dbError) {
        res.setHeader('x-db-fallback', 'true');
        return res.status(200).json(INITIAL_ESTIMATOR_SERVICES);
      }
    }

    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
      const { id: bodyId, title, icon, desc, subs, baseINR } = req.body ?? {};
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Missing required field: title' });
      }
      const slugId = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const targetId = id || bodyId || slugId || `estimator-${Date.now()}`;

      try {
        await sql`
          INSERT INTO estimator_services (id, title, icon, description, subs, base_inr)
          VALUES (${targetId}, ${title.trim()}, ${icon || '🌿'}, ${desc || ''}, ${JSON.stringify(subs || [])}, ${JSON.stringify(baseINR || [])})
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title, icon = EXCLUDED.icon, description = EXCLUDED.description, subs = EXCLUDED.subs, base_inr = EXCLUDED.base_inr
        `;
      } catch (err) {
        console.warn('[meta/estimator API] Failed to insert/update estimator service in DB:', err);
      }
      return res.status(201).json({ success: true, id: targetId });
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'Missing service ID' });
      const { title, icon, desc, subs, baseINR } = req.body ?? {};
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Missing required field: title' });
      }
      try {
        await sql`
          UPDATE estimator_services SET
            title = ${title.trim()}, icon = ${icon || '🌿'}, description = ${desc || ''}, subs = ${JSON.stringify(subs || [])}, base_inr = ${JSON.stringify(baseINR || [])}
          WHERE id = ${id}
        `;
      } catch (err) {
        console.warn(`[meta/estimator API] Failed to update estimator service ${id} in DB:`, err);
      }
      return res.status(200).json({ success: true, id });
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Missing service ID' });
      try {
        await sql`DELETE FROM estimator_services WHERE id = ${id}`;
      } catch (err) {
        console.warn(`[meta/estimator API] Failed to delete estimator service ${id} from DB:`, err);
      }
      return res.status(200).json({ success: true, id });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
