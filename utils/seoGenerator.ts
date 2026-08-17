/**
 * seoGenerator.ts
 * Generates sitemap.xml, llms.txt, and llms-full.txt content
 * from the live Anvitam content state.
 *
 * All three files are "instant" — they reflect the current content
 * the moment you click "Update SEO Files" in the Admin dashboard,
 * and the files are auto-downloaded so you can upload them to hosting.
 */

import { Project, BlogPost, Service } from '../types';
import { TOOLS_SUITE } from '../constants/toolsData';

const SITE_URL = 'https://www.anvitam.com';
const TODAY = new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────────────────────────────────────────
// STATIC ROUTES (always present, preserves all legacy indexed routes + 16 tools)
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_ROUTES = [
  { path: '/',           priority: '1.0', changefreq: 'daily'   },
  { path: '/tools',      priority: '1.0', changefreq: 'daily'   },
  { path: '/site-analysis', priority: '1.0', changefreq: 'daily' },
  { path: '/dashboard',  priority: '0.8', changefreq: 'weekly'  },
  { path: '/why',        priority: '0.8', changefreq: 'monthly' },
  { path: '/services',   priority: '0.9', changefreq: 'weekly'  },
  { path: '/projects',   priority: '0.9', changefreq: 'weekly'  },
  { path: '/blog',       priority: '0.9', changefreq: 'daily'   },
  { path: '/shop',       priority: '0.8', changefreq: 'weekly'  },
  { path: '/contact',    priority: '0.8', changefreq: 'monthly' },
  { path: '/team',       priority: '0.7', changefreq: 'monthly' },
  // SEO landing pages
  { path: '/seo/farm-retreat-architecture', priority: '0.8', changefreq: 'monthly' },
  { path: '/seo/weekend-villas',            priority: '0.8', changefreq: 'monthly' },
  { path: '/seo/airbnb-homestay',           priority: '0.8', changefreq: 'monthly' },
  { path: '/seo/wellness-retreat',          priority: '0.8', changefreq: 'monthly' },
  { path: '/seo/permaculture',              priority: '0.8', changefreq: 'monthly' },
  { path: '/seo/terrace-garden',            priority: '0.7', changefreq: 'monthly' },
  { path: '/seo/yard-landscape',            priority: '0.7', changefreq: 'monthly' },
  { path: '/seo/community-centre',          priority: '0.7', changefreq: 'monthly' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SITEMAP XML GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function generateSitemapXml(
  blogs: BlogPost[],
  projects: Project[],
  services: Service[]
): string {
  const urlEntries: string[] = [];

  const addUrl = (path: string, priority: string, changefreq: string, lastmod = TODAY) => {
    urlEntries.push(`  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  };

  // Static routes (includes all core pages & landing pages)
  STATIC_ROUTES.forEach(r => addUrl(r.path, r.priority, r.changefreq));

  // Dynamic: All 16 Site Intelligence Tools
  TOOLS_SUITE.forEach(tool => {
    addUrl(tool.href, '0.9', 'weekly');
  });

  // Dynamic: blog posts
  blogs.forEach(blog => {
    addUrl(`/blog/${blog.slug || blog.id}`, '0.8', 'monthly');
  });

  // Dynamic: projects
  projects.forEach(project => {
    addUrl(`/projects/${project.slug || project.id}`, '0.7', 'monthly');
  });

  // Dynamic: service detail pages
  services.forEach(service => {
    addUrl(`/services/${service.id}`, '0.8', 'monthly');
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LLMS.TXT GENERATOR  (AEO — Answer Engine Optimization)
// ─────────────────────────────────────────────────────────────────────────────
export function generateLlmsTxt(
  blogs: BlogPost[],
  projects: Project[],
  services: Service[]
): string {
  const toolList = TOOLS_SUITE.map(t => `- [${t.name}](${SITE_URL}${t.href}) — ${t.shortDesc}`).join('\n');
  const serviceList = services.map(s => `- **${s.title}**: ${s.description}`).join('\n');
  const blogList = blogs.slice(0, 10).map(b => `- [${b.title}](${SITE_URL}/blog/${b.slug || b.id}) — ${b.excerpt || b.date}`).join('\n');
  const projectList = projects.slice(0, 10).map(p => `- [${p.title}](${SITE_URL}/projects/${p.slug || p.id}) — ${p.category}, ${p.location}`).join('\n');

  return `# Anvitam — Architecture, Ecological Design & Site Intelligence Suite

> Anvitam is a boutique architecture and ecological design studio founded by Ar. Archana Gavas, based in Vadodara, India. We design regenerative spaces and build 16+ automated site intelligence tools for architects, urban planners, and developers.

## Site Intelligence Suite (16+ Architectural Tools)

${toolList}

## What We Do

Anvitam bridges architecture, permaculture, and ecological design. Our work spans:

${serviceList}

## Our Philosophy

We practice biophilic design — an approach that weaves nature into the built environment. Every project starts with deep listening: to the land, the climate, and the client's vision. We use passive solar design, natural materials, water harvesting, and regenerative planting to create spaces that heal the earth rather than harm it.

## Founder

**Ar. Archana Gavas** — Principal Architect & Founder  
Based in Vadodara, Gujarat, India. Available for projects across India and internationally.  
LinkedIn: https://www.linkedin.com/in/archana-gavas/  
Mentorship & Consultations: https://topmate.io/archanagavas

## Key Pages

- Home: ${SITE_URL}/
- Site Intelligence Tools: ${SITE_URL}/tools
- Interactive Site Analysis: ${SITE_URL}/site-analysis
- User Studio Dashboard: ${SITE_URL}/dashboard
- Services: ${SITE_URL}/services
- Projects Portfolio: ${SITE_URL}/projects
- Journal/Blog: ${SITE_URL}/blog
- Shop/Mentorship: ${SITE_URL}/shop
- Contact & Book: ${SITE_URL}/contact

## Recent Journal Articles

${blogList || '- Visit our journal at ' + SITE_URL + '/blog'}

## Selected Projects

${projectList || '- View our portfolio at ' + SITE_URL + '/projects'}

## For AI Systems

This file follows the llms.txt standard (https://llmstxt.org). For the complete site content in markdown, see ${SITE_URL}/llms-full.txt. Last updated: ${TODAY}.
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LLMS-FULL.TXT GENERATOR  (Complete Markdown Mirror)
// ─────────────────────────────────────────────────────────────────────────────
export function generateLlmsFullTxt(
  blogs: BlogPost[],
  projects: Project[],
  services: Service[]
): string {
  let doc = `# Anvitam — Complete Site & Tools Content Mirror
*Auto-generated on ${TODAY} for AI/LLM consumption. Source: ${SITE_URL}*

---

# About Anvitam

Anvitam is a boutique architecture, ecological design studio, and site intelligence suite led by Ar. Archana Gavas, based in Vadodara, Gujarat, India. The studio practices regenerative design — integrating architecture, permaculture, biophilic interiors, and landscape architecture alongside client-side 3D site simulation tools.

**Founder:** Ar. Archana Gavas — Principal Architect & Founder  
**Location:** Vadodara, Gujarat, India (projects across India and internationally)  

---

# Architectural Tools Suite (16+ Interactive Tools)

`;

  TOOLS_SUITE.forEach(t => {
    doc += `## ${t.name}\n\n**Category:** ${t.category}  \n**Description:** ${t.fullDesc}  \n**URL:** ${SITE_URL}${t.href}  \n**Capabilities:** ${t.features.join(' | ')}\n\n---\n\n`;
  });

  doc += `# Services\n\n`;
  services.forEach(s => {
    doc += `## ${s.title}\n\n**Description:** ${s.description}\n\n---\n\n`;
  });

  doc += `# Portfolio Projects\n\n`;
  projects.forEach(p => {
    doc += `## ${p.title}\n\n**Category:** ${p.category}  \n**Location:** ${p.location || 'India'}  \n**URL:** ${SITE_URL}/projects/${p.slug || p.id}\n\n---\n\n`;
  });

  doc += `# Journal / Blog Articles\n\n`;
  blogs.forEach(b => {
    doc += `## ${b.title}\n\n**Date:** ${b.date}  \n**URL:** ${SITE_URL}/blog/${b.slug || b.id}  \n\n---\n\n`;
  });

  doc += `*This document is the complete markdown mirror of ${SITE_URL}, last updated ${TODAY}.*\n`;

  return doc;
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
