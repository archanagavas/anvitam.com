/**
 * lib/auth.ts
 * Server-side JWT token helper for admin authentication.
 * Credentials are compared against Vercel env vars — never exposed to the browser.
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';
// Validate JWT_SECRET at runtime (warn only — don't crash non-admin API routes on startup).
// Must be a 64-character lowercase hex string:
//   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
const HEX_64 = /^[0-9a-f]{64,}$/;
if (!HEX_64.test(JWT_SECRET)) {
  console.warn(
    '[auth] WARNING: JWT_SECRET is missing or invalid. Admin authentication will not work. ' +
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))" ' +
    'and set it in Vercel Dashboard → Project → Settings → Environment Variables.'
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
