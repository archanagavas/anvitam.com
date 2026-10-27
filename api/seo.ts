import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../lib/adapter.js';
import { isDbConfigured, getCollection } from '../lib/db.js';
import { INITIAL_BLOGS, INITIAL_PROJECTS, SERVICES } from '../constants.js';
import { TOOLS_SUITE } from '../constants/toolsData.js';
import { extractToken, verifyAdminToken } from '../lib/auth.js';
import { SITE, absUrl } from '../lib/site.js';
import { loadMdData } from './md.js';
import { listMarkdownRoutes, renderMarkdown, DESTINATION_SLUGS, COMPARISON_SLUGS } from '../lib/md/registry.js';

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
      blogs = Array.isArray(rawBlogs) ? rawBlogs.filter((b: any) => b.status !== 'draft' && b.isDraft !== true) : [];
      // Match HTML visibility: isDraft projects are hidden on /projects, so keep them out of the sitemap too.
      projects = rawProjects.length > 0 ? rawProjects.filter((p: any) => p.isDraft !== true) : INITIAL_PROJECTS;
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
      { loc: 'https://www.anvitam.com/privacy', priority: '0.5', changefreq: 'yearly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/terms', priority: '0.5', changefreq: 'yearly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/tools', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      { loc: 'https://www.anvitam.com/site-analysis', priority: '0.8', changefreq: 'monthly', lastmod: defaultDate },
      ...DESTINATION_SLUGS.map(slug => ({ loc: `https://www.anvitam.com/destinations/${slug}`, priority: '0.7', changefreq: 'monthly', lastmod: defaultDate })),
      ...COMPARISON_SLUGS.map(slug => ({ loc: `https://www.anvitam.com/compare/${slug}`, priority: '0.7', changefreq: 'monthly', lastmod: defaultDate })),
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
    const workshopUrls = workshops.map(w => ({
      loc: `https://www.anvitam.com/workshops/${w.slug || w.id}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: w.updated_at ? new Date(w.updated_at).toISOString().split('T')[0] : defaultDate
    }));
    const allUrls = [...staticUrls, ...toolUrls, ...serviceUrls, ...projectUrls, ...blogUrls, ...workshopUrls];
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

  // 4. AI endpoints: /ai.txt, /llms.txt, /llms-full.txt (generated, never stale)
  // Keep robots.txt, llms.txt and ai.txt in sync with each other.
  const mdPath = (path: string) => `${SITE.url}${path === '/' ? '/index' : path}.md`;
  const today = new Date().toISOString().split('T')[0];

  if (action === 'ai' || url.includes('ai.txt')) {
    const aiTxt = `# Anvitam ai.txt — AI usage policy (ai-txt spec v1.1.1 style)
# Keep in sync with /robots.txt and /llms.txt. Last updated: ${today}

[identity]
name: ${SITE.name}
url: ${SITE.url}/
description: ${SITE.description}
founder: ${SITE.founder}, ${SITE.founderTitle}
contact: ${SITE.contactEmail}
phone: ${SITE.phone}
location: ${SITE.locality}
logo: ${SITE.logo}
linkedin: ${SITE.socials.linkedin}
instagram: ${SITE.socials.instagram}

[permissions]
allowed: summarise our public pages
allowed: quote with attribution
allowed: cite in search results and AI answers
allowed: index public pages for search and answer engines

[restrictions]
restricted: do not fabricate quotes, reviews, ratings, prices or project facts not present on our pages
restricted: do not present our content as the model's own work
restricted: do not train on private or user-submitted data (contact-form messages, dashboard or admin data are never public)
restricted: do not republish full articles verbatim without attribution to the canonical page

[attribution]
cite as: ${SITE.name} — <canonical HTML URL of the page used>
example: ${SITE.name} — ${SITE.url}/services/permaculture-design

[scope]
included: /, /why, /services/*, /projects/*, /blog/*, /workshops/*, /shop, /contact, /tools, /site-analysis, /seo/*, /destinations/*, /compare/*, /process/*, /privacy, /terms
excluded: /admin, /dashboard, /api/*, logged-in or draft content
markdown: append .md to any included page URL, or request it with Accept: text/markdown

[contact]
email: ${SITE.contactEmail}
last updated: ${today}
`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(aiTxt);
  }

  const mdData = await loadMdData();
  const routes = listMarkdownRoutes(mdData);
  const bySection = (name: string) => routes.filter(r => r.section === name);

  if (action === 'llms' || action === 'llms-full' || url.includes('llms')) {
    const isFull = action === 'llms-full' || url.includes('llms-full');
    const capNote = 'Full listing: ' + SITE.url + '/api/md/_catalog';
    let output = `# ${SITE.name}

> ${SITE.description}

Key facts: Founded by ${SITE.founder} (${SITE.founderTitle}), based in ${SITE.locality}, consulting worldwide. Services are quoted per project after a paid/free consultation (see Contact). Main audience: landowners, eco-resort and farm-retreat developers, homestay/Airbnb hosts, and families building sustainable homes.

## Core pages
${bySection('Core pages').map(r => `- [${r.title.replace(/ \| Anvitam.*$/, '')}](${mdPath(r.path)}): ${r.summary}`).join('\n')}

## Docs / Guides
${bySection('Docs / Guides').map(r => `- [${r.title.replace(/ \| Anvitam.*$/, '')}](${mdPath(r.path)}): ${r.summary}`).join('\n')}

## Services
${bySection('Services').slice(0, 50).map(r => `- [${r.title}](${mdPath(r.path)}): ${r.summary}`).join('\n')}

## Projects
${bySection('Projects').slice(0, 50).map(r => `- [${r.title}](${mdPath(r.path)}): ${r.summary}`).join('\n')}

## Blog
${bySection('Blog').slice(0, 50).map(r => `- [${r.title}](${mdPath(r.path)}): ${r.summary}`).join('\n')}
${bySection('Blog').length > 50 ? `\n(Capped at 50 in llms.txt. ${capNote})` : ''}

## Workshops
${bySection('Workshops').slice(0, 50).map(r => `- [${r.title}](${mdPath(r.path)}): ${r.summary}`).join('\n')}

## Machine-readable
- [Full content](${SITE.url}/llms-full.txt): every page above concatenated as markdown
- [Markdown catalog](${SITE.url}/api/md/_catalog): JSON list of every markdown route
- [Sitemap](${SITE.url}/sitemap.xml): all canonical HTML pages
- [AI usage policy](${SITE.url}/ai.txt): how AI systems may use this content

## Optional
${bySection('Optional').map(r => `- [${r.title.replace(/ \| Anvitam.*$/, '')}](${mdPath(r.path)}): ${r.summary}`).join('\n')}
- [Contact](${SITE.url}/contact.md): contact details and booking
`;

    if (isFull) {
      const order = ['Core pages', 'Docs / Guides', 'Services', 'Projects', 'Blog', 'Workshops', 'Optional'];
      const ordered = order.flatMap(sec => bySection(sec));
      let full = `# ${SITE.name} - full content\n> ${SITE.shortDescription}\nGenerated: ${today}\n`;
      for (const r of ordered) {
        const rendered = renderMarkdown(r.path, mdData);
        if (!rendered) continue;
        const chunk = `\n\n---\n<!-- source: ${absUrl(r.path)} -->\n${rendered.body}`;
        if (full.length + chunk.length > 500000) {
          console.warn(`[llms-full] Exceeded 500k chars at ${full.length}; truncating before ${r.path}. Full listing: ${SITE.url}/api/md/_catalog`);
          full += `\n\n---\n<!-- truncated at 500k chars. Remaining pages: ${SITE.url}/api/md/_catalog -->\n`;
          break;
        }
        full += chunk;
      }
      output = full;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', isFull
      ? 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800'
      : 'public, max-age=0, s-maxage=43200, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(output);
  }

  return res.status(404).send('Not Found');
});
