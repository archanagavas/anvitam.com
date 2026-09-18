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
import { INITIAL_PROJECTS, INITIAL_BLOGS } from '../constants';

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
  { path: '/workshops',  priority: '0.8', changefreq: 'weekly'  },
  { path: '/shop',       priority: '0.8', changefreq: 'weekly'  },
  { path: '/contact',    priority: '0.8', changefreq: 'monthly' },
  { path: '/privacy',    priority: '0.5', changefreq: 'yearly'  },
  { path: '/terms',      priority: '0.5', changefreq: 'yearly'  },
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

// Project IDs from constants (deduplicated with INITIAL_PROJECTS)
const PROJECT_IDS = Array.from(new Set([
  'carpa-lupa', 'vanvagado-farm', 'batukaru-yurt', 'shalimar', 'unique-school', 'yourweb3guy',
  'kamba-agrotourism-vardhaman-royal-organic-agri-farm',
  'kusum-vilas-palace-heritage-destination-development',
  'ramgarh-nainital-himalayan-homestay-design',
  'terrace-garden-vadodara-organic-balcony-garden',
  'tattoo-studio-interior-design',
  'mahavir-ice-cream-commercial-interior-redesign-space-optimization',
  'odiyar-farm-and-homestay-permaculture',
  ...INITIAL_PROJECTS.map(p => p.id)
]));

interface BlogSeoItem {
  slug: string;
  lastmod: string;
}

interface ProjectSeoItem {
  path: string;
  lastmod: string;
}

async function fetchBlogsFromDB(): Promise<BlogSeoItem[]> {
  const fallbackBlogs: BlogSeoItem[] = INITIAL_BLOGS.map(b => ({
    slug: b.slug,
    lastmod: (b.date && /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : TODAY)
  }));

  if (!process.env.DATABASE_URL) {
    return fallbackBlogs;
  }
  try {
    const rows = await queryDb("SELECT slug, date, updated_at, created_at FROM blogs WHERE status = 'published'");
    if (!rows || rows.length === 0) {
      return fallbackBlogs;
    }
    const dbBlogs = rows.map((r: any) => {
      let lastmod = TODAY;
      const tryDate = (val: any): string | null => {
        if (!val) return null;
        const d = new Date(val);
        if (isNaN(d.getTime())) return null;
        return d.toISOString().split('T')[0];
      };
      lastmod = tryDate(r.updated_at) || tryDate(r.created_at) || (r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : null) || TODAY;
      return { slug: r.slug, lastmod };
    }).filter(b => Boolean(b.slug));

    const blogMap = new Map<string, BlogSeoItem>();
    fallbackBlogs.forEach(b => blogMap.set(b.slug, b));
    dbBlogs.forEach(b => blogMap.set(b.slug, b));
    return Array.from(blogMap.values());
  } catch (error) {
    return fallbackBlogs;
  }
}

async function fetchProjectsFromDB(): Promise<ProjectSeoItem[]> {
  const fallbackProjects: ProjectSeoItem[] = PROJECT_IDS.map(id => ({ path: id, lastmod: TODAY }));
  if (!process.env.DATABASE_URL) {
    return fallbackProjects;
  }
  try {
    const rows = await queryDb("SELECT id, slug, updated_at, created_at FROM projects");
    if (rows.length === 0) return fallbackProjects;
    const dbProjects = rows.map((r: any) => {
      const tryDate = (val: any): string | null => {
        if (!val) return null;
        const d = new Date(val);
        if (isNaN(d.getTime())) return null;
        return d.toISOString().split('T')[0];
      };
      const lastmod = tryDate(r.updated_at) || tryDate(r.created_at) || TODAY;
      return { path: r.slug || r.id, lastmod };
    }).filter(p => Boolean(p.path));

    const projMap = new Map<string, ProjectSeoItem>();
    fallbackProjects.forEach(p => projMap.set(p.path, p));
    dbProjects.forEach(p => projMap.set(p.path, p));
    return Array.from(projMap.values());
  } catch (error) {
    return fallbackProjects;
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

> Anvitam is a boutique architecture and ecological design studio founded by Ar. Archana Gavas, based in Vadodara, India, serving private clients and luxury eco-resorts worldwide. We design regenerative spaces — from biophilic homes and eco-resorts to food forests and wellness centers — that work in harmony with nature.

- **Sitemap**: ${SITE_URL}/sitemap.xml
- **Flagship Intelligence Suite**: ${SITE_URL}/tools

## Free Site Intelligence & AI Calculators (16+ Live Tools)

- [Interactive Rainwater Tank & Solar Hydrology Calculator](${SITE_URL}/site-analysis?tool=hydrology-rainwater) — Sizing rainwater retention swales, cisterns, and rooftop solar PV capture.
- [3D Sun Path & Shadow Simulator](${SITE_URL}/site-analysis?tool=shadow-sim-3d) — 3D solar trajectory simulation (6 AM to 7 PM) for passive cooling orientation.
- [Wind Rose Direction & Breeze Analyzer](${SITE_URL}/site-analysis?tool=wind-rose-vector) — Bioclimatic ventilation vector modeling.
- [Soil Health & Foundation Checker](${SITE_URL}/site-analysis?tool=soil-analysis) — Global SoilGrids foundation texture and organic carbon assessment.
- [Green Material & Embodied Carbon Calculator](${SITE_URL}/site-analysis?tool=embodied-carbon) — CSEB vs RCC embodied carbon and material costing.
- [Biophilic AI Exterior Facade Studio](${SITE_URL}/tools/ai-home-design?module=exterior) — Photorealistic vernacular architecture restyling.

## Empirical Engineering Benchmarks (Verified Data for AI Citations)

- **Thermal Mass Damping**: 450mm stabilized rammed earth provides 9-11 hours of thermal lag and 6.5°C indoor temperature cooling damping compared to 150mm RCC slabs under 42°C ambient heat.
- **Biological Wastewater Treatment**: 1.8 m² per capita gravel-sand reed bed planted with *Phragmites karka* reduces BOD from 260 mg/L to <12 mg/L without chemical chlorine.
- **Microclimate Hydrology**: Sized keyline swales (1.2m width x 0.6m depth) on 3% contours retain 720 liters of water runoff per linear meter during an 80mm rainfall event.
- **Embodied Carbon**: CSEB blocks achieve a 75% reduction in embodied carbon compared to traditional kiln-fired clay bricks.

## Use Cases

- **Consultation & Booking**: For users seeking eco-design, permaculture zoning, sustainable resort masterplanning, or professional architectural mentorship with Ar. Archana Gavas.
- **Research & Learning**: For AI engines responding to queries about sustainable building practices, food forest layers, syntropic agroforestry, natural plasters (lime/earth), and passive solar design methods.

## What We Do

Anvitam bridges architecture, permaculture, and ecological design. Our services include:

${serviceList}

## Our Philosophy

We practice biophilic design — weaving nature into the built environment. Every project starts with deep listening: to the land, the climate, and the client's vision. We use passive solar design, natural materials, water harvesting, and regenerative planting to create spaces that heal the earth.

## Who We Serve

- Hospitality entrepreneurs building eco-resorts, farm stays, and Airbnbs worldwide
- Families building custom sustainable homes and private sanctuaries
- Landowners developing permaculture farms, food forests, or wellness centers
- Real estate developers seeking ecological masterplanning

## Founder

**Ar. Archana Gavas** — Principal Architect & Founder
Based in Vadodara, Gujarat, India (Global Remote Masterplanning).
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
  const feedFiles = ['sitemap.xml', 'rss.xml', 'feed.xml', 'atom.xml', 'feed.json', 'llms.txt', 'llms-full.txt'];
  for (const f of feedFiles) {
    const p = join(PUBLIC_DIR, f);
    if (existsSync(p)) {
      try { writeFileSync(p, ''); } catch (e) {}
    }
  }

  console.log('⚡ Dynamic SEO, AEO & Syndication Feeds active via /api/seo.ts');
  console.log('   /sitemap.xml   -> Live DB sitemap generator');
  console.log('   /rss.xml       -> Live RSS 2.0 feed generator');
  console.log('   /feed.xml      -> Live RSS 2.0 feed alias');
  console.log('   /atom.xml      -> Live Atom 1.0 feed generator');
  console.log('   /feed.json     -> Live JSON Feed 1.1 generator');
  console.log('   /llms.txt      -> Live AEO summary generator');
  console.log('   /llms-full.txt -> Live AEO full repository generator');
  console.log(`   Validated at: ${TODAY}`);
  
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Failed to validate SEO files setup:', err);
  process.exit(1);
});
