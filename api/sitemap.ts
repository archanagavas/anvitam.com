import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { INITIAL_BLOGS, INITIAL_PROJECTS, SERVICES } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let blogs: any[] = [];
  let projects: any[] = [];
  let services: any[] = [];

  if (isDbConfigured) {
    try {
      const dbBlogs = await sql`SELECT id, title, slug, date, status, updated_at, created_at FROM blogs WHERE status != 'draft' OR status IS NULL ORDER BY created_at DESC`;
      blogs = dbBlogs.length > 0 ? dbBlogs : INITIAL_BLOGS;
    } catch (e) {
      console.warn('[sitemap API] DB error fetching blogs, falling back to constants:', e);
      blogs = INITIAL_BLOGS;
    }

    try {
      const dbProjects = await sql`SELECT id, title, slug, year, updated_at, created_at FROM projects ORDER BY created_at DESC`;
      projects = dbProjects.length > 0 ? dbProjects : INITIAL_PROJECTS;
    } catch (e) {
      console.warn('[sitemap API] DB error fetching projects, falling back to constants:', e);
      projects = INITIAL_PROJECTS;
    }

    try {
      const dbServices = await sql`SELECT id, title, updated_at, created_at FROM services ORDER BY created_at ASC`;
      services = dbServices.length > 0 ? dbServices : SERVICES;
    } catch (e) {
      console.warn('[sitemap API] DB error fetching services, falling back to constants:', e);
      services = SERVICES;
    }
  } else {
    blogs = INITIAL_BLOGS;
    projects = INITIAL_PROJECTS;
    services = SERVICES;
  }

  const defaultLastMod = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: 'https://www.anvitam.com/', priority: '1.0', changefreq: 'daily', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/why', priority: '0.8', changefreq: 'monthly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/services', priority: '0.9', changefreq: 'weekly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/projects', priority: '0.9', changefreq: 'weekly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/blog', priority: '0.9', changefreq: 'daily', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/shop', priority: '0.8', changefreq: 'weekly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/contact', priority: '0.8', changefreq: 'monthly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/team', priority: '0.7', changefreq: 'monthly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/seo/farm-retreat-architecture', priority: '0.8', changefreq: 'monthly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/seo/weekend-villas', priority: '0.8', changefreq: 'monthly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/seo/airbnb-homestay', priority: '0.8', changefreq: 'monthly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/seo/wellness-retreat', priority: '0.8', changefreq: 'monthly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/seo/permaculture', priority: '0.8', changefreq: 'monthly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/seo/terrace-garden', priority: '0.7', changefreq: 'monthly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/seo/yard-landscape', priority: '0.7', changefreq: 'monthly', lastmod: defaultLastMod },
    { loc: 'https://www.anvitam.com/seo/community-centre', priority: '0.7', changefreq: 'monthly', lastmod: defaultLastMod }
  ];

  const serviceUrls = services.map(s => ({
    loc: `https://www.anvitam.com/services/${s.id}`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: s.updated_at ? new Date(s.updated_at).toISOString().split('T')[0] : defaultLastMod
  }));

  const projectUrls = projects.map(p => ({
    loc: `https://www.anvitam.com/projects/${p.slug || p.id}`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : defaultLastMod
  }));

  const blogUrls = blogs.map(b => {
    let blogMod = defaultLastMod;
    if (b.updated_at) {
      try { blogMod = new Date(b.updated_at).toISOString().split('T')[0]; } catch (e) {}
    } else if (b.date && /^\d{4}-\d{2}-\d{2}$/.test(b.date)) {
      blogMod = b.date;
    }
    return {
      loc: `https://www.anvitam.com/blog/${b.slug || b.id}`,
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: blogMod
    };
  });

  const allUrls = [...staticUrls, ...serviceUrls, ...projectUrls, ...blogUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60');
  res.setHeader('X-Robots-Tag', 'index, follow');
  return res.status(200).send(sitemapXml);
}
