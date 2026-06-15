/**
 * api/db-init.ts
 * GET /api/db-init  (one-time setup — call once after deploying to Vercel)
 * Creates all required database tables if they don't exist.
 * Secured with ADMIN_INIT_SECRET to prevent unauthorised execution.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initDatabase } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.query.secret as string;
  if (!process.env.ADMIN_INIT_SECRET || secret !== process.env.ADMIN_INIT_SECRET) {
    return res.status(403).json({ error: 'Forbidden. Provide valid ?secret= query param.' });
  }

  try {
    const result = await initDatabase();
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[db-init] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
