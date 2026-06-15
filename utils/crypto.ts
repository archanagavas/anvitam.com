/**
 * Crypto utilities using the native Web Crypto API — zero dependencies.
 * OWASP: Use platform-native crypto primitives, not third-party JS libs.
 * MDN: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
