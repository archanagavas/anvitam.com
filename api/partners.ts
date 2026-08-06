import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_PARTNERS } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || 
             (lastPart && lastPart !== 'partners' && lastPart !== 'partners.ts' && lastPart !== 'partners.js' ? lastPart : undefined);

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
        return res.status(200).json(INITIAL_PARTNERS);
      }
      return res.status(200).json(rows);
    } catch (dbError) {
      console.warn('[partners API] Database query failed, falling back to static constants:', dbError);
      res.setHeader('x-db-fallback', 'true');
      return res.status(200).json(INITIAL_PARTNERS);
    }
  }

  // Admin verification for mutate methods
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { id: bodyId, name, logo, icon, website } = req.body ?? {};
    const targetId = id || bodyId || `partner-${Date.now()}`;

    await sql`
      INSERT INTO partners (id, name, logo, icon, website)
      VALUES (${targetId}, ${name}, ${logo || ''}, ${icon || ''}, ${website || ''})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        logo = EXCLUDED.logo,
        icon = EXCLUDED.icon,
        website = EXCLUDED.website
    `;
    return res.status(201).json({ success: true, id: targetId });
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing partner ID' });
    const { name, logo, icon, website } = req.body ?? {};
    await sql`
      UPDATE partners SET
        name = ${name},
        logo = ${logo || ''},
        icon = ${icon || ''},
        website = ${website || ''}
      WHERE id = ${id}
    `;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing partner ID' });
    await sql`DELETE FROM partners WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
