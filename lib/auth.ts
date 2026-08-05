/**
 * lib/auth.ts
 * Server-side JWT token helper for admin authentication.
 * Credentials are compared against Vercel env vars — fail-safe & resilient.
 */
import jwt from 'jsonwebtoken';

const TOKEN_EXPIRY = '24h';

function getJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET;
  if (envSecret && envSecret.trim().length >= 16) {
    return envSecret.trim();
  }
  
  if (process.env.ADMIN_PASSWORD_HASH) {
    return process.env.ADMIN_PASSWORD_HASH;
  }

  console.warn('[auth] WARNING: JWT_SECRET environment variable is missing or short. Using fallback signature secret.');
  return 'anvitam-default-secure-fallback-jwt-secret-key-2026';
}

export interface AdminToken {
  role: 'admin';
  email: string;
  iat?: number;
  exp?: number;
}

export function signAdminToken(email: string): string {
  const secret = getJwtSecret();
  return jwt.sign({ role: 'admin', email }, secret, { expiresIn: TOKEN_EXPIRY });
}

export function verifyAdminToken(token: string): AdminToken | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as AdminToken;
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
