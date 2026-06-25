/**
 * lib/auth.ts
 * Server-side JWT token helper for admin authentication.
 * Credentials are compared against Vercel env vars — never exposed to the browser.
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
// Crash-fast: if the secret is missing or too short, refuse to start.
// A hardcoded fallback would appear in the public repo and let anyone forge admin tokens.
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    '[auth] JWT_SECRET env var is missing or shorter than 32 chars. ' +
    'Set a 64-char hex secret in Vercel Dashboard → Project → Settings → Environment Variables.'
  );
}
const TOKEN_EXPIRY = '24h';

export interface AdminToken {
  role: 'admin';
  email: string;
  iat?: number;
  exp?: number;
}

export function signAdminToken(email: string): string {
  return jwt.sign({ role: 'admin', email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyAdminToken(token: string): AdminToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminToken;
    return decoded.role === 'admin' ? decoded : null;
  } catch {
    return null;
  }
}

/** Extract Bearer token from Authorization header */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
