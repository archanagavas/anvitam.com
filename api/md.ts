// api/md.ts — Markdown version of every public page.
// Reached via: /<path>.md (vercel rewrite), Accept: text/markdown (middleware.ts
// rewrite), and directly at /api/md/<path>. Never returns HTML.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../lib/adapter.js';
import { isDbConfigured, getCollection } from '../lib/db.js';
import { INITIAL_BLOGS, INITIAL_PROJECTS, SERVICES, INITIAL_WORKSHOPS, DIGITAL_PRODUCTS } from '../constants.js';
import { renderMarkdown, listMarkdownRoutes, type MdData } from '../lib/md/registry.js';
import { sendMarkdown, markdown404, prefersMarkdown } from '../lib/md/http.js';
import { SITE } from '../lib/site.js';

let cache: { data: MdData; expiresAt: number } | null = null;

export async function loadMdData(): Promise<MdData> {
  if (cache && Date.now() < cache.expiresAt) return cache.data;
  let data: MdData = { blogs: INITIAL_BLOGS, projects: INITIAL_PROJECTS, services: SERVICES, workshops: INITIAL_WORKSHOPS, products: DIGITAL_PRODUCTS };
  if (isDbConfigured) {
    try {
      const [blogs, projects, services, workshops, products] = await Promise.all([
        getCollection('blogs', 'desc').catch(() => []),
        getCollection('projects', 'desc').catch(() => []),
        getCollection('services', 'asc').catch(() => []),
        getCollection('workshops', 'desc').catch(() => []),
        getCollection('digital_products', 'desc').catch(() => []),
      ]);
      // Merge seed + DB the way ContentContext does for the HTML site:
      // DB wins on id/slug, seed-only items (e.g. older projects) stay visible.
      const merge = (dbItems: any[], seed: any[]) => {
        if (!dbItems?.length) return seed;
        const keys = new Set(dbItems.map((x) => x.slug || x.id));
        return [...dbItems, ...seed.filter((x) => !keys.has(x.slug || x.id) && !keys.has(x.id))];
      };
      data = {
        blogs: merge(blogs, INITIAL_BLOGS as any[]),
        projects: merge(projects, INITIAL_PROJECTS as any[]),
        services: merge(services, SERVICES as any[]),
        workshops: merge(workshops, INITIAL_WORKSHOPS as any[]),
        products: products?.length ? products : DIGITAL_PRODUCTS,
      };
    } catch { /* fall back to seed data above */ }
  }
  cache = { data, expiresAt: Date.now() + 10 * 60 * 1000 };
  return data;
}

export default createHandler(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');
    return res.status(204).send('');
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD, OPTIONS');
    return sendMarkdown(res, markdown404('/api/md'), { status: 405 });
  }

  // Resolve path: ?path= (vercel rewrite / middleware) or /api/md/<path>
  let raw = (req.query.path as string) || '';
  if (!raw) {
    const urlPath = (req.url || '').split('?')[0];
    raw = urlPath.replace(/^\/api\/md\/?/, '');
    raw = raw ? `/${raw}` : '/';
  }
  if (!raw.startsWith('/')) raw = `/${raw}`;
  const negotiated = (req.query.negotiated as string) === '1';

  // If this arrived via content negotiation, re-check Accept server-side too.
  if (negotiated && !prefersMarkdown(req.headers.accept)) {
    return sendMarkdown(res, markdown404(raw), { status: 406, canonicalPath: raw });
  }

  const data = await loadMdData();

  if (raw === '/_catalog' || raw === '_catalog') {
    const routes = listMarkdownRoutes(data).map((r) => {
      const rendered = renderMarkdown(r.path, data);
      return { path: r.path, markdown: `${SITE.url}${r.path === '/' ? '/index' : r.path}.md`, title: r.title, section: r.section, estimatedTokens: rendered ? Math.ceil(rendered.body.length / 4) : 0 };
    });
    const body = JSON.stringify({ routes, totalEstimatedTokens: routes.reduce((a, r) => a + r.estimatedTokens, 0) }, null, 2);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex, follow');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(req.method === 'HEAD' ? '' : body);
  }

  const result = renderMarkdown(raw, data);
  if (!result) {
    const body = markdown404(raw.replace(/\.md$/, ''));
    if (req.method === 'HEAD') { sendMarkdown(res, body, { status: 404, canonicalPath: raw }); return res; }
    return sendMarkdown(res, body, { status: 404, canonicalPath: raw.replace(/\.md$/, '') });
  }
  if (req.method === 'HEAD') {
    // Same headers as GET (incl. real token count), no body.
    return sendMarkdown(res, '', { canonicalPath: result.canonicalPath, lastModified: result.lastModified, negotiated, tokens: Math.ceil(result.body.length / 4) });
  }
  return sendMarkdown(res, result.body, {
    canonicalPath: result.canonicalPath,
    lastModified: result.lastModified,
    negotiated,
  });
});
