// middleware.ts — Vercel Edge Middleware (framework-agnostic, no Next.js).
// Routes AI-agent markdown requests to ONE handler (api/md.ts):
//   1. GET /pricing.md            -> /api/md?path=/pricing
//   2. GET /pricing + Accept: text/markdown (q > text/html) -> /api/md?path=/pricing&negotiated=1
// `*/*` or a missing Accept header ALWAYS gets HTML. Excluded: /api/*, static
// assets, /_next/*, /.well-known/*, and the site-level text files themselves.

const EXCLUDED_EXACT = new Set(['/llms.txt', '/llms-full.txt', '/ai.txt', '/robots.txt', '/sitemap.xml']);
const EXCLUDED_PREFIXES = ['/api/', '/_next/', '/.well-known/', '/assets/'];
const STATIC_EXT = /\.(?:png|jpe?g|webp|gif|svg|ico|css|js|mjs|map|woff2?|ttf|eot|pdf|xml|json|txt|mp4|webm)$/i;

// Allowlist of content routes eligible for negotiation / .md (not a denylist).
const CONTENT_EXACT = new Set([
  '/', '/index', '/why', '/services', '/projects', '/blog', '/workshops',
  '/shop', '/contact', '/tools', '/site-analysis', '/privacy', '/terms',
]);
const CONTENT_PREFIXES = ['/blog/', '/projects/', '/services/', '/workshops/', '/seo/', '/destinations/', '/compare/', '/process/'];

function isContentRoute(path: string): boolean {
  return CONTENT_EXACT.has(path) || CONTENT_PREFIXES.some((p) => path.startsWith(p));
}

function prefersMarkdown(accept: string | null): boolean {
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

function rewriteTo(request: Request, dest: string): Response {
  const url = new URL(request.url);
  const target = new URL(dest, url.origin);
  return new Response(null, { headers: { 'x-middleware-rewrite': target.toString() } });
}

export default function middleware(request: Request): Response | undefined {
  if (request.method !== 'GET' && request.method !== 'HEAD') return undefined;
  const url = new URL(request.url);
  const path = url.pathname;

  if (EXCLUDED_EXACT.has(path) || EXCLUDED_PREFIXES.some((p) => path.startsWith(p))) return undefined;

  // 1. .md suffix
  if (path.endsWith('.md')) {
    if (EXCLUDED_EXACT.has(path)) return undefined;
    const clean = path.slice(0, -3) || '/';
    const htmlPath = clean === '/index' ? '/' : clean;
    if (!isContentRoute(htmlPath) && htmlPath !== '/') return undefined;
    return rewriteTo(request, `/api/md?path=${encodeURIComponent(htmlPath)}`);
  }

  if (STATIC_EXT.test(path)) return undefined;

  // 2. Content negotiation (allowlist only)
  if (isContentRoute(path) && prefersMarkdown(request.headers.get('accept'))) {
    return rewriteTo(request, `/api/md?path=${encodeURIComponent(path)}&negotiated=1`);
  }

  // HTML-variant cache protection lives at the origin (api/ssr-seo.ts sets
  // `Cloudflare-CDN-Cache-Control: private, no-store`, since Cloudflare
  // ignores `Vary: Accept`). Nothing to do here.
  return undefined;
}

export const config = {
  matcher: ['/((?!api/|_next/static|favicon.ico).*)'],
};
