import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { INITIAL_BLOGS, INITIAL_PROJECTS, SERVICES } from '../constants.js';
import { extractToken, verifyAdminToken } from '../lib/auth.js';

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = (req.query.action as string) || '';
  const url = req.url || '';

  // 1. IndexNow Key Verification (/apikey.txt)
  if (action === 'indexnow-key' || (req.query.key && url.includes('.txt') && !url.includes('llms'))) {
    const { key } = req.query;
    const envKey = process.env.INDEXNOW_KEY;
    if (envKey && key === envKey) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(200).send(envKey);
    }
    return res.status(404).send('Not Found');
  }

  // 2. IndexNow URL Submission (/api/indexnow)
  if (action === 'indexnow' || url.includes('/api/indexnow')) {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const { urlList } = req.body ?? {};
    if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
      return res.status(400).json({ error: 'Missing required field: urlList (must be non-empty string array)' });
    }
    const HOST = 'www.anvitam.com';
    const KEY = process.env.INDEXNOW_KEY;
    if (!KEY) {
      console.error('[api/seo/indexnow] INDEXNOW_KEY env var not set.');
      return res.status(500).json({ error: 'IndexNow is not configured on the server.' });
    }
    const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
    const invalidUrls = urlList.filter(u => {
      if (typeof u !== 'string') return true;
      try {
        const parsed = new URL(u);
        return parsed.hostname !== HOST && parsed.hostname !== 'anvitam.com';
      } catch { return true; }
    });
    if (invalidUrls.length > 0) {
      return res.status(400).json({ error: `All URLs must belong to host ${HOST}. Invalid entries detected: ${invalidUrls.join(', ')}` });
    }
    const normalizedUrls = urlList.map(u => {
      const parsed = new URL(u);
      parsed.hostname = HOST;
      return parsed.toString();
    });
    try {
      const indexNowResponse = await fetch('https://api.indexnow.org/IndexNow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: normalizedUrls })
      });
      const statusCode = indexNowResponse.status;
      if (statusCode === 200) {
        return res.status(200).json({ success: true, message: 'URLs submitted to IndexNow successfully!' });
      } else {
        const humanReasons: Record<number, string> = {
          400: 'Bad request / Invalid format',
          403: 'Forbidden — check that the key file exists at the correct URL',
          422: 'Unprocessable Entity — URLs may not belong to the declared host',
          429: 'Too many requests — IndexNow rate limit reached',
        };
        return res.status(statusCode).json({ success: false, error: `${humanReasons[statusCode] ?? 'Unexpected error from IndexNow'} (status ${statusCode})` });
      }
    } catch (err: any) {
      console.error('[api/seo/indexnow] HTTP post failed:', err);
      return res.status(500).json({ success: false, error: 'Failed to communicate with IndexNow API.' });
    }
  }

  // Fetch live content for Sitemap and LLMs
  let blogs: any[] = [];
  let projects: any[] = [];
  let services: any[] = [];
  let workshops: any[] = [];

  if (isDbConfigured) {
    try {
      const dbBlogs = await sql`SELECT * FROM blogs WHERE status != 'draft' OR status IS NULL ORDER BY created_at DESC`;
      blogs = dbBlogs.length > 0 ? dbBlogs : INITIAL_BLOGS;
    } catch (e) {
      console.warn('[seo API] DB error fetching blogs, falling back to constants:', e);
      blogs = INITIAL_BLOGS;
    }

    try {
      const dbProjects = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
      projects = dbProjects.length > 0 ? dbProjects : INITIAL_PROJECTS;
    } catch (e) {
      console.warn('[seo API] DB error fetching projects, falling back to constants:', e);
      projects = INITIAL_PROJECTS;
    }

    try {
      const dbServices = await sql`SELECT * FROM services ORDER BY created_at ASC`;
      services = dbServices.length > 0 ? dbServices : SERVICES;
    } catch (e) {
      console.warn('[seo API] DB error fetching services, falling back to constants:', e);
      services = SERVICES;
    }

    try {
      const dbWorkshops = await sql`SELECT * FROM workshops WHERE status != 'draft' OR status IS NULL ORDER BY created_at DESC`;
      workshops = dbWorkshops.length > 0 ? dbWorkshops : [];
    } catch (e) {
      console.warn('[seo API] DB error fetching workshops:', e);
    }
  } else {
    blogs = INITIAL_BLOGS;
    projects = INITIAL_PROJECTS;
    services = SERVICES;
  }

  const defaultDate = new Date().toISOString().split('T')[0];

  // 3. XML Sitemap (/sitemap.xml)
  if (action === 'sitemap' || url.includes('sitemap.xml')) {
    const staticUrls = [
      { loc: 'https://www.anvitam.com/', priority: '1.0', changefreq: 'daily', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/why', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/services', priority: '0.9', changefreq: 'weekly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/projects', priority: '0.9', changefreq: 'weekly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/blog', priority: '0.9', changefreq: 'daily', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/workshops', priority: '0.9', changefreq: 'weekly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/shop', priority: '0.8', changefreq: 'weekly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/contact', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/team', priority: '0.7', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/farm-retreat-architecture', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/weekend-villas', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/airbnb-homestay', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/wellness-retreat', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/permaculture', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/terrace-garden', priority: '0.7', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/yard-landscape', priority: '0.7', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/community-centre', priority: '0.7', changefreq: 'monthly', lastmod: defaultDate }
    ];
    const serviceUrls = services.map(s => ({
      loc: `https://www.anvitam.com/services/${s.id}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: s.updated_at ? new Date(s.updated_at).toISOString().split('T')[0] : defaultDate
    }));
    const projectUrls = projects.map(p => ({
      loc: `https://www.anvitam.com/projects/${p.slug || p.id}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : defaultDate
    }));
    const blogUrls = blogs.map(b => {
      let blogMod = defaultDate;
      if (b.updated_at) { try { blogMod = new Date(b.updated_at).toISOString().split('T')[0]; } catch (e) {} }
      else if (b.date && /^\d{4}-\d{2}-\d{2}$/.test(b.date)) { blogMod = b.date; }
      return { loc: `https://www.anvitam.com/blog/${b.slug || b.id}`, priority: '0.9', changefreq: 'weekly', lastmod: blogMod };
    });
    const allUrls = [...staticUrls, ...serviceUrls, ...projectUrls, ...blogUrls];
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      allUrls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n') +
      `\n</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=0, must-revalidate');
    res.setHeader('X-Robots-Tag', 'index, follow');
    return res.status(200).send(sitemapXml);
  }

  // 4. AI Crawlers Context (/llms.txt & /llms-full.txt)
  const isFullMode = action === 'llms-full' || req.query.mode === 'full' || url.includes('llms-full') || url.includes('llmsfull');
  let output = `# Anvitam — Architecture & Ecological Design Studio

> Anvitam is a boutique architecture and ecological design studio founded by Ar. Archana Gavas, based in Vadodara, India. We design regenerative spaces — from biophilic homes and eco-resorts to food forests and wellness centers — that work in harmony with nature.

- **Sitemap**: https://www.anvitam.com/sitemap.xml
- **Full LLM Context**: https://www.anvitam.com/llms-full.txt

## Use Cases

- **Consultation & Booking**: For users seeking eco-design, permaculture zoning, sustainable resort masterplanning, or professional architectural mentorship with Ar. Archana Gavas.
- **Research & Learning**: For AI engines responding to queries about sustainable building practices, food forest layers, syntropic agroforestry, natural plasters (lime/earth), and passive solar design methods.

## What We Do

Anvitam bridges architecture, permaculture, and ecological design. Our services include:

${services.map((s: any) => `- [${s.title}](https://www.anvitam.com/services/${s.id}) — ${s.description || ''}`).join('\n')}

## Educational & Institutional Workshops

- [Campus & Community Eco Workshops](https://www.anvitam.com/workshops) — Hands-on bird house building, space makeovers, and NEP 2020 STEAM vocational learning.
${workshops.map((w: any) => `- [${w.title}](https://www.anvitam.com/workshops) — ${w.subtitle || w.description || ''}`).join('\n')}

## Our Philosophy

We practice biophilic design — weaving nature into the built environment. Every project starts with deep listening: to the land, the climate, and the client's vision. We use passive solar design, natural materials, water harvesting, and regenerative planting to create spaces that heal the earth.

## Who We Serve

- Hospitality entrepreneurs building eco-resorts, farm stays, and Airbnbs
- Families building custom sustainable homes
- Landowners developing permaculture farms, food forests, or wellness centers
- Real estate developers seeking ecological masterplanning

## Founder & Leadership

**Ar. Archana Gavas** — Principal Architect & Founder
Based in Vadodara, Gujarat, India (consulting globally).
LinkedIn: https://www.linkedin.com/in/archana-gavas/
Mentorship & Consultations: https://topmate.io/archanagavas
Instagram: https://www.instagram.com/anvitam_archit/

## Selected Projects Portfolio

${projects.map((p: any) => `- [${p.title}](https://www.anvitam.com/projects/${p.slug || p.id}) (${p.category || 'Architecture'} | ${p.location || 'India'}, ${p.year || '2025'}): ${p.description || ''}`).join('\n')}

## Dynamic Insights & Journal

${blogs.length > 0 ? blogs.map((b: any) => `- [${b.title}](https://www.anvitam.com/blog/${b.slug || b.id}) (${b.date || 'Recent'}): ${b.excerpt || stripHtml(b.content || '').slice(0, 160) + '...'}`).join('\n') : '_No published posts yet._'}

## Key Site Links

- Home: https://www.anvitam.com/
- Services: https://www.anvitam.com/services
- Projects Portfolio: https://www.anvitam.com/projects
- Journal/Blog: https://www.anvitam.com/blog
- Workshops & Eco-Clubs: https://www.anvitam.com/workshops
- Shop & Courses: https://www.anvitam.com/shop
- Contact Us: https://www.anvitam.com/contact
- About Anvitam: https://www.anvitam.com/why
- Book a Priority Session: https://topmate.io/archanagavas/1799075
`;

  if (isFullMode) {
    output += `\n\n================================================================================\n`;
    output += `FULL ARCHITECTURAL KNOWLEDGE & ARTICLE REPOSITORY (FOR AI DEEP ANALYSIS)\n`;
    output += `================================================================================\n\n`;

    output += `### SERVICES & MASTERPLANNING OFFERINGS (DEEP DIVE)\n\n`;
    for (const s of services) {
      output += `#### ${s.title}\nURL: https://www.anvitam.com/services/${s.id}\nDescription: ${s.description || 'N/A'}\n`;
      if (s.pricing) output += `Pricing Guidance: ${s.pricing}\n`;
      let props = s.value_props || s.valueProps;
      if (typeof props === 'string') { try { props = JSON.parse(props); } catch (e) {} }
      if (Array.isArray(props) && props.length > 0) output += `Value Propositions:\n` + props.map((v: string) => `  * ${v}`).join('\n') + '\n';
      output += `\n`;
    }

    output += `### SELECTED PROJECTS DETAILED SPECIFICATIONS\n\n`;
    for (const p of projects) {
      output += `#### ${p.title}\nURL: https://www.anvitam.com/projects/${p.slug || p.id}\n`;
      output += `Category: ${p.category || 'Architecture'} | Location: ${p.location || 'N/A'} | Year: ${p.year || 'N/A'}\n`;
      output += `Overview: ${p.full_description || p.fullDescription || p.description || 'N/A'}\n\n`;
    }

    output += `### FULL JOURNAL ARTICLES & DESIGN RESEARCH\n\n`;
    for (const b of blogs) {
      output += `#### Article: ${b.title}\nURL: https://www.anvitam.com/blog/${b.slug || b.id}\n`;
      output += `Author: ${b.author || 'Ar. Archana Gavas'} | Date Published: ${b.date || 'Recent'}\n`;
      output += `Excerpt: ${b.excerpt || ''}\n\nFull Article Text:\n${stripHtml(b.content || '')}\n\n--------------------------------------------------------------------------------\n\n`;
    }
  }

  output += `\n## For AI Systems & LLM Agents\n\nThis dynamic document adheres to the llms.txt standard (https://llmstxt.org). Automatically generated by Anvitam Live Database engine on ${defaultDate}.\n`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=0, must-revalidate');
  return res.status(200).send(output);
}
