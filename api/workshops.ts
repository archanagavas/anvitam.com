import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_WORKSHOPS } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || 
             (lastPart && lastPart !== 'workshops' && lastPart !== 'workshops.ts' && lastPart !== 'workshops.js' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const item = INITIAL_WORKSHOPS.find(i => i.id === id);
        if (!item) return res.status(404).json({ error: 'Workshop not found' });
        return res.status(200).json(item);
      }
      return res.status(200).json(INITIAL_WORKSHOPS);
    }
    return res.status(503).json({ error: 'Database connection not configured' });
  }

  if (req.method === 'GET') {
    try {
      if (id) {
        const rows = await sql`SELECT id, title, organization, location, date, category, description, attendees_count, offerings, images, status FROM workshops WHERE id = ${id}`;
        if (rows.length === 0) {
          const mockItem = INITIAL_WORKSHOPS.find(i => i.id === id);
          if (mockItem) {
            res.setHeader('x-db-fallback', 'true');
            return res.status(200).json(mockItem);
          }
          return res.status(404).json({ error: 'Workshop not found' });
        }
        const row = rows[0];
        return res.status(200).json({
          id: row.id,
          title: row.title,
          organization: row.organization,
          location: row.location,
          date: row.date,
          category: row.category,
          description: row.description,
          attendeesCount: row.attendees_count,
          offerings: typeof row.offerings === 'string' ? JSON.parse(row.offerings) : row.offerings || [],
          images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images || [],
          status: row.status
        });
      }
      const rows = await sql`SELECT id, title, organization, location, date, category, description, attendees_count, offerings, images, status FROM workshops ORDER BY created_at DESC`;
      if (rows.length === 0) {
        return res.status(200).json(INITIAL_WORKSHOPS);
      }
      const formatted = rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        organization: row.organization,
        location: row.location,
        date: row.date,
        category: row.category,
        description: row.description,
        attendeesCount: row.attendees_count,
        offerings: typeof row.offerings === 'string' ? JSON.parse(row.offerings) : row.offerings || [],
        images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images || [],
        status: row.status
      }));
      return res.status(200).json(formatted);
    } catch (dbError) {
      console.warn('[workshops API] Database query failed, falling back to static constants:', dbError);
      res.setHeader('x-db-fallback', 'true');
      return res.status(200).json(INITIAL_WORKSHOPS);
    }
  }

  // Admin verification for mutate methods
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { id: bodyId, title, organization, location, date, category, description, attendeesCount, offerings, images, status } = req.body ?? {};
    const targetId = id || bodyId || `workshop-${Date.now()}`;

    await sql`
      INSERT INTO workshops (id, title, organization, location, date, category, description, attendees_count, offerings, images, status)
      VALUES (
        ${targetId},
        ${title},
        ${organization || ''},
        ${location || ''},
        ${date || ''},
        ${category || 'School'},
        ${description || ''},
        ${attendeesCount || ''},
        ${JSON.stringify(offerings || [])},
        ${JSON.stringify(images || [])},
        ${status || 'published'}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        organization = EXCLUDED.organization,
        location = EXCLUDED.location,
        date = EXCLUDED.date,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        attendees_count = EXCLUDED.attendees_count,
        offerings = EXCLUDED.offerings,
        images = EXCLUDED.images,
        status = EXCLUDED.status
    `;
    return res.status(201).json({ success: true, id: targetId });
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing workshop ID' });
    const { title, organization, location, date, category, description, attendeesCount, offerings, images, status } = req.body ?? {};
    await sql`
      UPDATE workshops SET
        title = ${title},
        organization = ${organization || ''},
        location = ${location || ''},
        date = ${date || ''},
        category = ${category || 'School'},
        description = ${description || ''},
        attendees_count = ${attendeesCount || ''},
        offerings = ${JSON.stringify(offerings || [])},
        images = ${JSON.stringify(images || [])},
        status = ${status || 'published'}
      WHERE id = ${id}
    `;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing workshop ID' });
    await sql`DELETE FROM workshops WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
