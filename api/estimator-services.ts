import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db';
import { verifyAdminToken, extractToken } from '../lib/auth';
import { INITIAL_ESTIMATOR_SERVICES } from '../constants';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const urlParts = (req.url || '').split('?')[0].split('/');
    const lastPart = urlParts[urlParts.length - 1];
    const id = (req.query.id as string | undefined) || 
               (lastPart && lastPart !== 'estimator-services' && lastPart !== 'estimator-services.ts' && lastPart !== 'estimator-services.js' ? lastPart : undefined);

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
          const rows = await sql`SELECT id, title, icon, description as desc, subs, base_inr as "baseINR" FROM estimator_services WHERE id = ${id}`;
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
        const rows = await sql`SELECT id, title, icon, description as desc, subs, base_inr as "baseINR" FROM estimator_services ORDER BY created_at ASC`;
        if (rows.length === 0) {
          res.setHeader('x-db-fallback', 'true');
          return res.status(200).json(INITIAL_ESTIMATOR_SERVICES);
        }
        return res.status(200).json(rows);
      } catch (dbError) {
        console.warn('[estimator-services API] Database query failed, falling back to static constants:', dbError);
        res.setHeader('x-db-fallback', 'true');
        if (id) {
          const item = INITIAL_ESTIMATOR_SERVICES.find(i => i.id === id);
          if (!item) return res.status(404).json({ error: 'Estimator service not found' });
          return res.status(200).json(item);
        }
        return res.status(200).json(INITIAL_ESTIMATOR_SERVICES);
      }
    }

    // Admin verification for mutate methods
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      const { id: bodyId, title, icon, desc, subs, baseINR } = req.body ?? {};
      const targetId = id || bodyId || title?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (!targetId) return res.status(400).json({ error: 'Missing service ID' });

      await sql`
        INSERT INTO estimator_services (id, title, icon, description, subs, base_inr)
        VALUES (${targetId}, ${title}, ${icon || '🌿'}, ${desc || ''}, ${JSON.stringify(subs || [])}, ${JSON.stringify(baseINR || [])})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          icon = EXCLUDED.icon,
          description = EXCLUDED.description,
          subs = EXCLUDED.subs,
          base_inr = EXCLUDED.base_inr
      `;
      return res.status(201).json({ success: true, id: targetId });
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'Missing service ID' });
      const { title, icon, desc, subs, baseINR } = req.body ?? {};
      await sql`
        UPDATE estimator_services SET
          title = ${title},
          icon = ${icon || '🌿'},
          description = ${desc || ''},
          subs = ${JSON.stringify(subs || [])},
          base_inr = ${JSON.stringify(baseINR || [])}
        WHERE id = ${id}
      `;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Missing service ID' });
      await sql`DELETE FROM estimator_services WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[estimator-services API] Error:', err);
    return res.status(500).json({ error: 'Server error processing estimator services request' });
  }
}
