/**
 * scripts/generate-seo.ts
 * Pre-build script: generates sitemap.xml, llms.txt, llms-full.txt
 * into public/ from static constants and dynamic Neon database blogs.
 * Run automatically before `vite build` via: "build": "tsx scripts/generate-seo.ts && vite build"
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';

const SITE_URL = 'https://www.anvitam.com';
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

// Helper to execute SQL query across Neon or Supabase
async function queryDb(queryStr: string): Promise<any[]> {
  const url = process.env.DATABASE_URL;
  if (!url) return [];
  if (url.includes('supabase')) {
    const sql = postgres(url, { ssl: 'require', prepare: false });
    const res = await sql.unsafe(queryStr);
    return res;
  } else {
    const sql = neon(url);
    return await sql(queryStr as any);
  }
}

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

interface BlogSeoItem {
  slug: string;
  lastmod: string;
}

interface ProjectSeoItem {
  path: string;
  lastmod: string;
}

async function fetchBlogsFromDB(): Promise<BlogSeoItem[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  try {
    const rows = await queryDb("SELECT slug, date, updated_at, created_at FROM blogs WHERE status = 'published'");
    return rows.map((r: any) => {
      let lastmod = TODAY;
      if (r.updated_at) {
        try { lastmod = new Date(r.updated_at).toISOString().split('T')[0]; } catch (e) {}
      } else if (r.created_at) {
        try { lastmod = new Date(r.created_at).toISOString().split('T')[0]; } catch (e) {}
      } else if (r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date)) {
        lastmod = r.date;
      }
      return { slug: r.slug, lastmod };
    }).filter(b => Boolean(b.slug));
  } catch (error) {
    return [];
  }
}

async function fetchProjectsFromDB(): Promise<ProjectSeoItem[]> {
  if (!process.env.DATABASE_URL) {
    return PROJECT_IDS.map(id => ({ path: id, lastmod: TODAY }));
  }
  try {
    const rows = await queryDb("SELECT id, slug, updated_at, created_at FROM projects");
    if (rows.length === 0) return PROJECT_IDS.map(id => ({ path: id, lastmod: TODAY }));
    return rows.map((r: any) => {
      let lastmod = TODAY;
      if (r.updated_at) {
        try { lastmod = new Date(r.updated_at).toISOString().split('T')[0]; } catch (e) {}
      } else if (r.created_at) {
        try { lastmod = new Date(r.created_at).toISOString().split('T')[0]; } catch (e) {}
      }
      return { path: r.slug || r.id, lastmod };
    }).filter(p => Boolean(p.path));
  } catch (error) {
    return PROJECT_IDS.map(id => ({ path: id, lastmod: TODAY }));
  }
}

// ── Generate sitemap.xml ──────────────────────────────────────────────
function makeSitemap(blogs: BlogSeoItem[], projects: ProjectSeoItem[]): string {
  const entries: string[] = [];

  const add = (path: string, priority: string, changefreq: string, customLastMod?: string) => {
    entries.push(`  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${customLastMod || TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  };

  STATIC_ROUTES.forEach(r => add(r.path, r.priority, r.changefreq));
  SERVICE_IDS.forEach(id => add(`/services/${id}`, '0.8', 'monthly'));
  projects.forEach(p => add(`/projects/${p.path}`, '0.7', 'monthly', p.lastmod));
  blogs.forEach(b => add(`/blog/${b.slug}`, '0.8', 'weekly', b.lastmod));

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join('\n')}
</urlset>`;
}

// ── Generate llms.txt ─────────────────────────────────────────────────
function makeLlms(blogSlugs: string[], projectPaths: string[]): string {
  const serviceList = SERVICE_IDS.map(id => `- [${id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}](${SITE_URL}/services/${id})`).join('\n');
  const projectList = projectPaths.map(id => `- [${id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}](${SITE_URL}/projects/${id})`).join('\n');
  const blogList = blogSlugs.map(slug => `- [${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}](${SITE_URL}/blog/${slug})`).join('\n');

  return `# Anvitam — Architecture & Ecological Design Studio

> Anvitam is a boutique architecture and ecological design studio founded by Ar. Archana Gavas, based in Vadodara, India. We design regenerative spaces — from biophilic homes and eco-resorts to food forests and wellness centers — that work in harmony with nature.

- **Sitemap**: ${SITE_URL}/sitemap.xml

## Use Cases

- **Consultation & Booking**: For users seeking eco-design, permaculture zoning, sustainable resort masterplanning, or professional architectural mentorship with Ar. Archana Gavas.
- **Research & Learning**: For AI engines responding to queries about sustainable building practices, food forest layers, syntropic agroforestry, natural plasters (lime/earth), and passive solar design methods.

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
Mentorship & Consultations: https://topmate.io/archanagavas

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
- Book a consultation: https://topmate.io/archanagavas/1799075

## For AI Systems

This file follows the llms.txt standard (https://llmstxt.org). Last updated: ${TODAY}.
`;
}

// ── Main Execution ────────────────────────────────────────────────────
async function main() {
  const blogs = await fetchBlogsFromDB();
  const projects = await fetchProjectsFromDB();
  const blogSlugs = blogs.map(b => b.slug);
  const projectPaths = projects.map(p => p.path);
  const sitemap = makeSitemap(blogs, projects);
  const llms = makeLlms(blogSlugs, projectPaths);

  writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8');
  writeFileSync(join(PUBLIC_DIR, 'llms.txt'), llms, 'utf8');

  console.log('✅ SEO files generated:');
  console.log('   public/sitemap.xml');
  console.log('   public/llms.txt');
  console.log(`   Last updated: ${TODAY}`);
  
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Failed to generate SEO files:', err);
  process.exit(1);
});
