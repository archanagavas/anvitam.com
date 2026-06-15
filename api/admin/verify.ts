/**
 * api/admin/verify.ts
 * GET /api/admin/verify
 * Verifies the JWT token from Authorization header.
 * Client calls this on page load to check if session is still valid.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminToken, extractToken } from '../../lib/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = extractToken(req.headers.authorization);
  if (!token) return res.status(401).json({ valid: false, error: 'No token provided.' });

  const payload = verifyAdminToken(token);
  if (!payload) return res.status(401).json({ valid: false, error: 'Invalid or expired token.' });

  return res.status(200).json({ valid: true, email: payload.email });
}
