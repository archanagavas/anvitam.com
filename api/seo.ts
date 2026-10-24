import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../lib/adapter.js';
import { isDbConfigured, getCollection } from '../lib/db.js';
import { INITIAL_BLOGS, INITIAL_PROJECTS, SERVICES } from '../constants.js';
import { TOOLS_SUITE } from '../constants/toolsData.js';
import { extractToken, verifyAdminToken } from '../lib/auth.js';

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// In-memory cache for SEO feeds (15-minute TTL)
let seoCache: {
  blogs: any[];
  projects: any[];
  services: any[];
  workshops: any[];
  expiresAt: number;
} | null = null;

export default createHandler(async function handler(req: VercelRequest, res: VercelResponse) {
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

  // Fetch live content for Sitemap and LLMs (using in-memory cache)
  let blogs: any[] = [];
  let projects: any[] = [];
  let services: any[] = [];
  let workshops: any[] = [];

  if (seoCache && Date.now() < seoCache.expiresAt) {
    blogs = seoCache.blogs;
    projects = seoCache.projects;
    services = seoCache.services;
    workshops = seoCache.workshops;
  } else if (isDbConfigured) {
    try {
      const [rawBlogs, rawProjects, rawServices, rawWorkshops] = await Promise.all([
        getCollection('blogs', 'desc').catch(() => []),
        getCollection('projects', 'desc').catch(() => []),
        getCollection('services', 'asc').catch(() => []),
        getCollection('workshops', 'desc').catch(() => []),
      ]);
      blogs = Array.isArray(rawBlogs) ? rawBlogs.filter((b: any) => b.status !== 'draft') : [];
      projects = rawProjects.length > 0 ? rawProjects : INITIAL_PROJECTS;
      services = rawServices.length > 0 ? rawServices : SERVICES;
      workshops = Array.isArray(rawWorkshops) ? rawWorkshops.filter((w: any) => w.status !== 'draft') : [];
      seoCache = {
        blogs,
        projects,
        services,
        workshops,
        expiresAt: Date.now() + 15 * 60 * 1000,
      };
    } catch (e) {
      console.warn('[seo API] DB error fetching collections:', e);
      blogs = [];
      projects = INITIAL_PROJECTS;
      services = SERVICES;
      workshops = [];
    }
  } else {
    blogs = [];
    projects = INITIAL_PROJECTS;
    services = SERVICES;
  }

  // Use a stable baseline date for static URLs so search engines don't think
  // they change daily. Dynamic content uses its own updated_at timestamp.
  // IMPORTANT: Update this string only when static page content meaningfully changes.
  const defaultDate = '2025-06-01';
  const todayDate = new Date().toISOString().split('T')[0];

  // 3. XML Sitemap (/sitemap.xml)
  if (action === 'sitemap' || url.includes('sitemap.xml')) {
    // Static pages use a fixed baseline date — not today's date.
    // Stamping today's date tricks search engines into crawling daily
    // which burns Vercel origin bandwidth. Update defaultDate only
    // when page content genuinely changes.
    const staticUrls = [
      { loc: 'https://www.anvitam.com/', priority: '1.0', changefreq: 'weekly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/why', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/services', priority: '0.9', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/projects', priority: '0.9', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/blog', priority: '0.9', changefreq: 'weekly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/workshops', priority: '0.9', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/shop', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/contact', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/team', priority: '0.7', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/farm-retreat-architecture', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/weekend-villas', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/airbnb-homestay', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/wellness-retreat', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/permaculture', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/terrace-garden', priority: '0.7', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/seo/yard-landscape', priority: '0.7', changefreq: 'monthly', lastmod: defaultDate },
    ];
    const toolUrls = TOOLS_SUITE.map(t => ({
      loc: `https://www.anvitam.com${t.href.startsWith('/') ? t.href : '/' + t.href}`,
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: defaultDate
    }));
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
    const allUrls = [...staticUrls, ...toolUrls, ...serviceUrls, ...projectUrls, ...blogUrls];
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      allUrls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n') +
      `\n</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // Cache sitemap for 6 hours at CDN (Vercel Edge + Cloudflare).
    // Sitemap content changes only when content is published — not every request.
    // Every bot crawl (Google, Bing, GPTBot, Semrush…) was hitting Firestore
    // with no caching, consuming Fast Origin Transfer unnecessarily.
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=21600, stale-while-revalidate=86400');
    res.setHeader('X-Robots-Tag', 'index, follow');
    return res.status(200).send(sitemapXml);
  }

  // Helper for XML escaping
  const escapeXml = (str: string) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // 3.1. RSS 2.0 Feed (/rss.xml & /feed.xml)
  if (action === 'rss' || action === 'feed' || url.includes('rss.xml') || url.includes('feed.xml')) {
    const feedItems = blogs.map((b: any) => {
      const postUrl = `https://www.anvitam.com/blog/${b.slug || b.id}`;
      const pubDate = b.date ? new Date(b.date).toUTCString() : (b.created_at ? new Date(b.created_at).toUTCString() : new Date().toUTCString());
      const desc = b.excerpt || stripHtml(b.content || '').slice(0, 240) + '...';
      const imageUrl = b.cover_image || b.coverImage || b.image || '';
      const imageTag = imageUrl ? `\n      <enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" length="0" />\n      <media:content url="${escapeXml(imageUrl)}" medium="image" />` : '';

      return `    <item>
      <title>${escapeXml(b.title || 'Untitled')}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${b.author || 'Ar. Archana Gavas'}]]></dc:creator>
      <description><![CDATA[${desc}]]></description>
      <content:encoded><![CDATA[${b.content || desc}]]></content:encoded>${imageTag}
    </item>`;
    });

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Anvitam — Architecture &amp; Ecological Design Journal</title>
    <link>https://www.anvitam.com/blog</link>
    <description>Articles, sustainable design research, permaculture insights, and architectural knowledge by Ar. Archana Gavas.</description>
    <language>en</language>
    <copyright>© ${new Date().getFullYear()} Anvitam Architects</copyright>
    <atom:link href="https://www.anvitam.com/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${feedItems.join('\n')}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).send(rssXml);
  }

  // 3.2. Atom 1.0 Feed (/atom.xml)
  if (action === 'atom' || url.includes('atom.xml')) {
    const feedUpdated = blogs.length > 0 && blogs[0].updated_at
      ? new Date(blogs[0].updated_at).toISOString()
      : new Date().toISOString();

    const atomEntries = blogs.map((b: any) => {
      const postUrl = `https://www.anvitam.com/blog/${b.slug || b.id}`;
      const published = b.date ? new Date(b.date).toISOString() : (b.created_at ? new Date(b.created_at).toISOString() : new Date().toISOString());
      const updated = b.updated_at ? new Date(b.updated_at).toISOString() : published;
      const desc = b.excerpt || stripHtml(b.content || '').slice(0, 240) + '...';

      return `  <entry>
    <title>${escapeXml(b.title || 'Untitled')}</title>
    <link rel="alternate" href="${postUrl}" />
    <id>${postUrl}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <summary type="html"><![CDATA[${desc}]]></summary>
    <content type="html"><![CDATA[${b.content || desc}]]></content>
    <author>
      <name>${escapeXml(b.author || 'Ar. Archana Gavas')}</name>
      <uri>https://www.anvitam.com/why</uri>
    </author>
  </entry>`;
    });

    const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Anvitam — Architecture &amp; Ecological Design Journal</title>
  <subtitle>Articles, sustainable design research, permaculture insights, and architectural knowledge by Ar. Archana Gavas.</subtitle>
  <link rel="alternate" href="https://www.anvitam.com/blog" />
  <link rel="self" href="https://www.anvitam.com/atom.xml" />
  <id>https://www.anvitam.com/blog</id>
  <updated>${feedUpdated}</updated>
  <rights>© ${new Date().getFullYear()} Anvitam Architects</rights>
${atomEntries.join('\n')}
</feed>`;

    res.setHeader('Content-Type', 'application/atom+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).send(atomXml);
  }

  // 3.3. JSON Feed 1.1 (/feed.json)
  if (action === 'feed-json' || action === 'json' || url.includes('feed.json')) {
    const jsonFeed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: 'Anvitam — Architecture & Ecological Design Journal',
      home_page_url: 'https://www.anvitam.com/blog',
      feed_url: 'https://www.anvitam.com/feed.json',
      description: 'Articles, sustainable design research, permaculture insights, and architectural knowledge by Ar. Archana Gavas.',
      icon: 'https://www.anvitam.com/favicon.ico',
      favicon: 'https://www.anvitam.com/favicon.ico',
      authors: [
        {
          name: 'Ar. Archana Gavas',
          url: 'https://www.anvitam.com/why',
          avatar: 'https://www.anvitam.com/archana%20gavas%20image%20png.png'
        }
      ],
      items: blogs.map((b: any) => {
        const postUrl = `https://www.anvitam.com/blog/${b.slug || b.id}`;
        return {
          id: postUrl,
          url: postUrl,
          title: b.title || 'Untitled',
          content_html: b.content || '',
          summary: b.excerpt || stripHtml(b.content || '').slice(0, 240) + '...',
          image: b.cover_image || b.coverImage || b.image || undefined,
          date_published: b.date ? new Date(b.date).toISOString() : (b.created_at ? new Date(b.created_at).toISOString() : undefined),
          date_modified: b.updated_at ? new Date(b.updated_at).toISOString() : undefined,
          tags: Array.isArray(b.tags) ? b.tags : (b.category ? [b.category] : [])
        };
      })
    };

    res.setHeader('Content-Type', 'application/feed+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json(jsonFeed);
  }

  // 4. AI Crawlers Context (/llms.txt & /llms-full.txt)
  const isFullMode = action === 'llms-full' || req.query.mode === 'full' || url.includes('llms-full') || url.includes('llmsfull');
  let output = `# Anvitam — Architecture & Ecological Design Studio

> Anvitam is a boutique architecture and ecological design studio founded by Ar. Archana Gavas, based in Vadodara, India. We design regenerative spaces — from biophilic homes and eco-resorts to food forests and wellness centers — that work in harmony with nature.

- **Sitemap**: https://www.anvitam.com/sitemap.xml
- **Full LLM Context**: https://www.anvitam.com/llms-full.txt

## Site Intelligence & AI Tools Suite (16+ Automated Tools)

${TOOLS_SUITE.map(t => `- [${t.name}](https://www.anvitam.com${t.href.startsWith('/') ? t.href : '/' + t.href}) — ${t.shortDesc}`).join('\n')}

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

  output += `\n## For AI Systems & LLM Agents\n\nThis document adheres to the llms.txt standard (https://llmstxt.org). Published by Anvitam.\n`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  // Cache llms.txt for 12 hours at CDN (Vercel Edge + Cloudflare).
  // AI crawlers (GPTBot, ClaudeBot, Perplexity…) poll this frequently.
  // Content changes only when services/projects/blogs are updated.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=43200, stale-while-revalidate=86400');
  return res.status(200).send(output);
});
