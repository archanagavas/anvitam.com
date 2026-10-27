// lib/md/http.ts — Response builder for markdown endpoints.
import type { VercelResponse } from '@vercel/node';
import { absUrl } from '../site.js';

export function sendMarkdown(
  res: VercelResponse,
  body: string,
  opts: { status?: number; canonicalPath?: string; lastModified?: string; negotiated?: boolean; cache?: string; tokens?: number } = {},
): void {
  const status = opts.status ?? 200;
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('X-Markdown-Tokens', String(opts.tokens ?? Math.ceil(body.length / 4)));
  res.setHeader('X-Robots-Tag', 'noindex, follow');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  // Negotiated responses share the page URL with HTML. CDNs in front of this
  // site (Cloudflare) ignore `Vary: Accept` when caching, so a shared-cached
  // markdown body would be served to browsers. Negotiated = never shared-cache.
  res.setHeader('Cache-Control', opts.cache || (opts.negotiated ? 'private, no-store' : 'public, s-maxage=3600, stale-while-revalidate=86400'));
  res.setHeader('CDN-Cache-Control', opts.negotiated ? 'no-cache, no-store, max-age=0' : 'public, s-maxage=3600');
  res.setHeader('Cloudflare-CDN-Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
  if (opts.canonicalPath) {
    const canonical = absUrl(opts.canonicalPath);
    res.setHeader('Content-Location', canonical);
    res.setHeader('Link', `<${canonical}>; rel="canonical"`);
  }
  if (opts.lastModified) res.setHeader('Last-Modified', new Date(opts.lastModified).toUTCString());
  if (opts.negotiated) res.setHeader('Vary', 'Accept');
  res.status(status).send(body);
}

export function markdown404(path: string): string {
  return `# Page Not Found\n\n> No markdown version exists for this address.\n\nCanonical: ${absUrl(path)}\n\nThis page is either private, logged-in only, or does not exist. See the [site index](${absUrl('/llms.txt')}) for available pages.\n`;
}

/** Parse Accept with q-values. Serve markdown only if text/markdown outranks text/html.
 *  `* / *` or a missing header must return HTML. */
export function prefersMarkdown(accept: string | undefined | null): boolean {
  if (!accept) return false;
  let mdQ = -1;
  let htmlQ = -1;
  for (const part of accept.split(',')) {
    const [typeRaw, ...params] = part.trim().split(';');
    const type = typeRaw.trim().toLowerCase();
    let q = 1;
    for (const p of params) {
      const m = p.trim().match(/^q=([0-9.]+)$/i);
      if (m) q = parseFloat(m[1]);
    }
    if (type === 'text/markdown') mdQ = Math.max(mdQ, q);
    if (type === 'text/html') htmlQ = Math.max(htmlQ, q);
  }
  return mdQ > 0 && mdQ > htmlQ;
}
