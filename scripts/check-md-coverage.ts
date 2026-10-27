/**
 * scripts/check-md-coverage.ts — Dev check: every public App.tsx route must
 * have a markdown renderer (lib/md/registry.ts) or be on SKIP_ROUTES with a reason.
 * Run: npm run check:md   (exits 1 on uncovered public routes)
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { STATIC_PAGES, SEO_PAGES, DESTINATION_SLUGS, COMPARISON_SLUGS, SKIP_ROUTES } from '../lib/md/registry';
import { PROCESS_STEPS } from '../constants';

const app = readFileSync(resolve(process.cwd(), 'App.tsx'), 'utf8');
const routePatterns = Array.from(app.matchAll(/<Route\s+path="([^"]+)"/g)).map((m) => m[1]);

const coveredStatic = new Set<string>([
  ...STATIC_PAGES.map((p) => p.path),
  ...Object.keys(SEO_PAGES).map((s) => `/seo/${s}`),
  ...DESTINATION_SLUGS.map((s) => `/destinations/${s}`),
  ...COMPARISON_SLUGS.map((s) => `/compare/${s}`),
  ...PROCESS_STEPS.map((s) => `/process/${s.id}`),
]);
// Dynamic patterns covered by pattern renderers in the registry:
const coveredDynamic = ['/services/:id', '/projects/:id', '/blog/:id', '/workshops/:id', '/destinations/:destination', '/compare/:slug', '/process/:phase'];
const skipped = new Set(SKIP_ROUTES.map((s) => s.pattern));

const missing: string[] = [];
for (const r of routePatterns) {
  if (r === '*') continue;
  if (coveredStatic.has(r) || coveredDynamic.includes(r) || skipped.has(r)) continue;
  missing.push(r);
}

if (missing.length) {
  console.error(`✗ Public routes with NO markdown renderer and not on SKIP_ROUTES:\n${missing.map((m) => `  - ${m}`).join('\n')}`);
  console.error('Add a renderer in lib/md/registry.ts or a SKIP_ROUTES entry with a reason.');
  process.exit(1);
}
console.log(`✓ Markdown coverage OK: ${routePatterns.length} App.tsx route patterns checked, ${SKIP_ROUTES.length} explicitly skipped.`);
