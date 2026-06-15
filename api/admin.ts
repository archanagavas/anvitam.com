import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { signAdminToken, verifyAdminToken, extractToken } from '../lib/auth';
import { initDatabase } from '../lib/db';

const attempts: Record<string, { count: number; until: number }> = {};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlPath = (req.url || '').split('?')[0];
  const queryPath = req.query.path;
  const action = (Array.isArray(queryPath) ? queryPath[0] : queryPath) || urlPath.split('/').pop() || '';

  // 1. Database Initialization
  if (action === 'db-init' || req.url?.includes('db-init')) {
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

  // 2. Admin Verification (GET)
  if (action === 'verify' || req.method === 'GET') {
    const token = extractToken(req.headers.authorization);
    if (!token) return res.status(401).json({ valid: false, error: 'No token provided.' });

    const payload = verifyAdminToken(token);
    if (!payload) return res.status(401).json({ valid: false, error: 'Invalid or expired token.' });

    return res.status(200).json({ valid: true, email: payload.email });
  }

  // 3. Admin Login (POST)
  if (action === 'login' || req.method === 'POST') {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown';
    const now = Date.now();

    if (attempts[ip] && attempts[ip].count >= 5 && now < attempts[ip].until) {
      const secs = Math.ceil((attempts[ip].until - now) / 1000);
      return res.status(429).json({ error: `Too many attempts. Try again in ${secs}s.` });
    }

    const { email, password } = req.body ?? {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const expectedEmail = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();
    const expectedHash  = process.env.ADMIN_PASSWORD_HASH ?? '';

    if (!expectedEmail || !expectedHash) {
      console.error('[admin/login] ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured.');
      return res.status(500).json({ error: 'Authentication not configured on server.' });
    }

    const emailMatches    = email.toLowerCase().trim() === expectedEmail;
    const passwordMatches = await bcrypt.compare(password, expectedHash);

    if (!emailMatches || !passwordMatches) {
      if (!attempts[ip] || now >= attempts[ip].until) {
        attempts[ip] = { count: 1, until: now + 30_000 };
      } else {
        attempts[ip].count++;
        if (attempts[ip].count >= 5) {
          attempts[ip].until = now + 30_000;
          return res.status(429).json({ error: 'Too many failed attempts. Locked for 30s.' });
        }
      }
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    delete attempts[ip];
    const token = signAdminToken(email.toLowerCase().trim());
    return res.status(200).json({ token });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
