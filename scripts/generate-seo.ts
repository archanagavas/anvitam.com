/**
 * scripts/generate-seo.ts
 * Pre-build script: generates sitemap.xml, llms.txt, llms-full.txt
 * into public/ from static constants and dynamic Neon database blogs.
 * Run automatically before `vite build` via: "build": "tsx scripts/generate-seo.ts && vite build"
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { neon } from '@neondatabase/serverless';

const SITE_URL = 'https://anvitam.com';
const TODAY = new Date().toISOString().split('T')[0];
const PUBLIC_DIR = resolve(process.cwd(), 'public');

mkdirSync(PUBLIC_DIR, { recursive: true });

// Load env variables manually for tsx execution
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const p = resolve(process.cwd(), file);
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^['"]|['"]$/g, '');
          process.env[key] = value;
        }
      });
    }
  }
}
loadEnv();

// ── Static routes ──────────────────────────────────────────────────────
const STATIC_ROUTES = [
  { path: '/',           priority: '1.0', changefreq: 'daily'   },
  { path: '/why',        priority: '0.8', changefreq: 'monthly' },
  { path: '/services',   priority: '0.9', changefreq: 'weekly'  },
  { path: '/projects',   priority: '0.9', changefreq: 'weekly'  },
  { path: '/blog',       priority: '0.9', changefreq: 'daily'   },
  { path: '/shop',       priority: '0.8', changefreq: 'weekly'  },
  { path: '/contact',    priority: '0.8', changefreq: 'monthly' },
  { path: '/team',       priority: '0.7', changefreq: 'monthly' },
  { path: '/seo/farm-retreat-architecture', priority: '0.8', changefreq: 'monthly' },
  { path: '/seo/weekend-villas',            priority: '0.8', changefreq: 'monthly' },
  { path: '/seo/airbnb-homestay',           priority: '0.8', changefreq: 'monthly' },
  { path: '/seo/wellness-retreat',          priority: '0.8', changefreq: 'monthly' },
  { path: '/seo/permaculture',              priority: '0.8', changefreq: 'monthly' },
  { path: '/seo/terrace-garden',            priority: '0.7', changefreq: 'monthly' },
  { path: '/seo/yard-landscape',            priority: '0.7', changefreq: 'monthly' },
  { path: '/seo/community-centre',          priority: '0.7', changefreq: 'monthly' },
];

// Service IDs from constants
const SERVICE_IDS = [
  'permaculture-design', 'farm-retreat', 'airbnb', 'homestay', 'community-center',
  'weekend-villa', 'eco-resort', 'wellness-retreat', 'food-forest', 'agrotourism',
  'landscape-design', 'terrace-garden', 'backyard-design',
];

// Project IDs from constants
const PROJECT_IDS = [
  'carpa-lupa', 'vanvagado-farm', 'batukaru-yurt', 'shalimar', 'unique-school', 'yourweb3guy',
];

async function fetchSlugsFromDB(): Promise<string[]> {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ [generate-seo] DATABASE_URL is not set. Sitemap won\'t include dynamic blogs.');
    return [];
  }
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT slug FROM blogs WHERE status = 'published'`;
    return rows.map((r: any) => r.slug).filter(Boolean);
  } catch (error) {
    console.error('❌ [generate-seo] Failed to fetch blog slugs from database:', error);
    return [];
  }
}

// ── Generate sitemap.xml ──────────────────────────────────────────────
function makeSitemap(blogSlugs: string[]): string {
  const entries: string[] = [];

  const add = (path: string, priority: string, changefreq: string) => {
    entries.push(`  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  };

  STATIC_ROUTES.forEach(r => add(r.path, r.priority, r.changefreq));
  SERVICE_IDS.forEach(id => add(`/services/${id}`, '0.8', 'monthly'));
  PROJECT_IDS.forEach(id => add(`/projects/${id}`, '0.7', 'monthly'));
  blogSlugs.forEach(slug => add(`/blog/${slug}`, '0.8', 'weekly'));

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join('\n')}
</urlset>`;
}

// ── Generate llms.txt ─────────────────────────────────────────────────
function makeLlms(blogSlugs: string[]): string {
  const serviceList = SERVICE_IDS.map(id => `- [${id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}](${SITE_URL}/services/${id})`).join('\n');
  const projectList = PROJECT_IDS.map(id => `- [${id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}](${SITE_URL}/projects/${id})`).join('\n');
  const blogList = blogSlugs.map(slug => `- [${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}](${SITE_URL}/blog/${slug})`).join('\n');

  return `# Anvitam — Architecture & Ecological Design Studio

> Anvitam is a boutique architecture and ecological design studio founded by Ar. Archana Gavas, based in Vadodara, India. We design regenerative spaces — from biophilic homes and eco-resorts to food forests and wellness centers — that work in harmony with nature.

## What We Do

Anvitam bridges architecture, permaculture, and ecological design. Our services include:

${serviceList}

## Our Philosophy

We practice biophilic design — weaving nature into the built environment. Every project starts with deep listening: to the land, the climate, and the client's vision. We use passive solar design, natural materials, water harvesting, and regenerative planting to create spaces that heal the earth.

## Who We Serve

- Hospitality entrepreneurs building eco-resorts, farm stays, and Airbnbs
- Families building custom sustainable homes
- Landowners developing permaculture farms, food forests, or wellness centers
- Real estate developers seeking ecological masterplanning

## Founder

**Ar. Archana Gavas** — Principal Architect & Founder
Based in Vadodara, Gujarat, India.
LinkedIn: https://www.linkedin.com/in/archana-gavas/
Mentorship & Consultations: https://topmate.io/ar_archana_gavas

## Key Pages

- Home: ${SITE_URL}/
- Services: ${SITE_URL}/services
- Projects Portfolio: ${SITE_URL}/projects
- Journal/Blog: ${SITE_URL}/blog
- Shop/Mentorship: ${SITE_URL}/shop
- Contact & Book: ${SITE_URL}/contact
- About Anvitam: ${SITE_URL}/why

## Selected Projects

${projectList}

## Dynamic Insights & Journal

${blogList || '_No published posts yet._'}

## Contact

- Website: ${SITE_URL}
- Book a consultation: https://topmate.io/ar_archana_gavas/1799075

## For AI Systems

This file follows the llms.txt standard (https://llmstxt.org). Last updated: ${TODAY}.
`;
}

// ── Main Execution ────────────────────────────────────────────────────
async function main() {
  const blogSlugs = await fetchSlugsFromDB();
  const sitemap = makeSitemap(blogSlugs);
  const llms = makeLlms(blogSlugs);

  writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8');
  writeFileSync(join(PUBLIC_DIR, 'llms.txt'), llms, 'utf8');

  console.log('✅ SEO files generated:');
  console.log('   public/sitemap.xml');
  console.log('   public/llms.txt');
  console.log(`   Last updated: ${TODAY}`);
}

main().catch(err => {
  console.error('❌ Failed to generate SEO files:', err);
  process.exit(1);
});
