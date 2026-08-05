/**
 * lib/auth.ts
 * Server-side JWT token helper for admin authentication.
 * Credentials are compared against Vercel env vars — never exposed to the browser.
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
// Crash-fast: enforce exact secret contract.
// Must be a 64-character lowercase hex string produced by:
//   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
// A short or non-hex secret would make brute-forcing trivial.
const HEX_64 = /^[0-9a-f]{64,}$/;
if (!JWT_SECRET || !HEX_64.test(JWT_SECRET)) {
  throw new Error(
    '[auth] JWT_SECRET must be a lowercase hex string of at least 64 characters. ' +
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
