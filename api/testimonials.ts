import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_TESTIMONIALS } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || 
             (lastPart && lastPart !== 'testimonials' && lastPart !== 'testimonials.ts' && lastPart !== 'testimonials.js' ? lastPart : undefined);

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
      return res.status(200).json(rows);
    } catch (dbError) {
      console.warn('[testimonials API] Database query failed, falling back to static constants:', dbError);
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const item = INITIAL_TESTIMONIALS.find(i => i.id === id);
        if (!item) return res.status(404).json({ error: 'Testimonial not found' });
        return res.status(200).json(item);
      }
      return res.status(200).json(INITIAL_TESTIMONIALS);
    }
  }

  // Admin verification for mutate methods
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { id: bodyId, author, role, text, image } = req.body ?? {};
    const targetId = id || bodyId;
    if (!targetId) return res.status(400).json({ error: 'Missing testimonial ID' });

    await sql`
      INSERT INTO testimonials (id, author, role, text, image)
      VALUES (${targetId}, ${author}, ${role || ''}, ${text}, ${image || ''})
      ON CONFLICT (id) DO UPDATE SET
        author = EXCLUDED.author,
        role = EXCLUDED.role,
        text = EXCLUDED.text,
        image = EXCLUDED.image
    `;
    return res.status(201).json({ success: true });
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing testimonial ID' });
    const { author, role, text, image } = req.body ?? {};
    await sql`
      UPDATE testimonials SET
        author = ${author},
        role = ${role || ''},
        text = ${text},
        image = ${image || ''}
      WHERE id = ${id}
    `;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing testimonial ID' });
    await sql`DELETE FROM testimonials WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
