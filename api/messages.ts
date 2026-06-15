import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || (lastPart !== 'messages' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      const token = extractToken(req.headers.authorization);
      if (!token || !verifyAdminToken(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      return res.status(200).json([]);
    }
    if (req.method === 'POST') {
      const { name, email, message } = req.body ?? {};
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'name, email and message are required.' });
      }
      console.log(`[Mock Message] From: ${name} (${email}) - Msg: ${message}`);
      return res.status(201).json({ success: true, mocked: true });
    }
    if (req.method === 'DELETE') {
      const token = extractToken(req.headers.authorization);
      if (!token || !verifyAdminToken(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      return res.status(200).json({ success: true, mocked: true });
    }
    return res.status(503).json({ error: 'Database connection not configured' });
  }

  if (req.method === 'GET') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (id) {
      const rows = await sql`
        SELECT id, name, email, message, date, created_at FROM messages WHERE id = ${id}
      `;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }
      return res.status(200).json(rows[0]);
    }
    const rows = await sql`
      SELECT id, name, email, message, date, created_at FROM messages ORDER BY created_at DESC
    `;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { id: bodyId, name, email, message, date } = req.body ?? {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required.' });
    }
    await sql`
      INSERT INTO messages (id, name, email, message, date)
      VALUES (${id || bodyId || crypto.randomUUID()}, ${name}, ${email}, ${message}, ${date ?? new Date().toISOString()})
    `;
    return res.status(201).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!id) {
      return res.status(400).json({ error: 'Missing message ID' });
    }
    await sql`DELETE FROM messages WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
