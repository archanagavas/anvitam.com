/**
 * api/admin/login.ts
 * POST /api/admin/login
 * Validates email + password server-side against Vercel env vars.
 * Returns a JWT token on success — credentials NEVER touch the client bundle.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { signAdminToken } from '../../lib/auth';

// Brute-force in-memory guard (resets on cold start — good enough for serverless)
const attempts: Record<string, { count: number; until: number }> = {};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown';
  const now = Date.now();

  // Lockout check
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
    // Increment attempt counter
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

  // Reset on success
  delete attempts[ip];

  const token = signAdminToken(email.toLowerCase().trim());
  return res.status(200).json({ token });
}
