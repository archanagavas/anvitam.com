/**
 * api/messages/index.ts
 * GET  /api/messages  — list all messages (admin, JWT required)
 * POST /api/messages  — submit contact message (public)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { verifyAdminToken, extractToken } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const rows = await sql`
      SELECT id, name, email, message, date, created_at FROM messages ORDER BY created_at DESC
    `;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { id, name, email, message, date } = req.body ?? {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required.' });
    }
    await sql`
      INSERT INTO messages (id, name, email, message, date)
      VALUES (${id ?? crypto.randomUUID()}, ${name}, ${email}, ${message}, ${date ?? new Date().toISOString()})
    `;
    return res.status(201).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
