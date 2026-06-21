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

const SITE_URL = 'https://www.anvitam.com';
const TODAY = new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────────────────────────────────────────
// STATIC ROUTES (always present, not dynamic)
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_ROUTES = [
  { path: '/',           priority: '1.0', changefreq: 'daily'   },
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
    // Canonical URL: use hash-routing format for now, or clean path
    // Google prefers clean URLs — we list them without hash
    urlEntries.push(`  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  };

  // Static routes
  STATIC_ROUTES.forEach(r => addUrl(r.path, r.priority, r.changefreq));

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
  const serviceList = services.map(s => `- **${s.title}**: ${s.description}`).join('\n');
  const blogList = blogs.slice(0, 10).map(b => `- [${b.title}](${SITE_URL}/blog/${b.slug || b.id}) — ${b.excerpt || b.date}`).join('\n');
  const projectList = projects.slice(0, 10).map(p => `- [${p.title}](${SITE_URL}/projects/${p.slug || p.id}) — ${p.category}, ${p.location}`).join('\n');

  return `# Anvitam — Architecture & Ecological Design Studio

> Anvitam is a boutique architecture and ecological design studio founded by Ar. Archana Gavas, based in Vadodara, India. We design regenerative spaces — from biophilic homes and eco-resorts to food forests and wellness centers — that work in harmony with nature.

## What We Do

Anvitam bridges architecture, permaculture, and ecological design. Our work spans:

${serviceList}

## Our Philosophy

We practice biophilic design — an approach that weaves nature into the built environment. Every project starts with deep listening: to the land, the climate, and the client's vision. We use passive solar design, natural materials, water harvesting, and regenerative planting to create spaces that heal the earth rather than harm it.

## Who We Serve

- Hospitality entrepreneurs building eco-resorts, farm stays, and Airbnbs
- Families building custom sustainable homes in urban or rural settings
- Landowners wanting to develop permaculture farms, food forests, or wellness centers
- Real estate developers seeking ecological masterplanning
- Architecture students and practitioners seeking mentorship

## Founder

**Ar. Archana Gavas** — Principal Architect & Founder  
Based in Vadodara, Gujarat, India. Available for projects across India and internationally.  
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

## Recent Journal Articles

${blogList || '- Visit our journal at ' + SITE_URL + '/blog'}

## Selected Projects

${projectList || '- View our portfolio at ' + SITE_URL + '/projects'}

## Contact

- Website: ${SITE_URL}
- Book a consultation: https://topmate.io/archanagavas/1799075
- 1:1 Portfolio Review: https://topmate.io/archanagavas/1812019

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
  // Strip HTML tags from content for clean markdown
  const stripHtml = (html: string = '') =>
    html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

  // ── Header ──────────────────────────────────────────────────────────────
  let doc = `# Anvitam — Complete Site Content Mirror
*Auto-generated on ${TODAY} for AI/LLM consumption. Source: ${SITE_URL}*

---

# About Anvitam

Anvitam is a boutique architecture and ecological design studio led by Ar. Archana Gavas, based in Vadodara, Gujarat, India. The studio practices regenerative design — integrating architecture, permaculture, biophilic interiors, and landscape architecture to create spaces that are beautiful, sustainable, and deeply connected to nature.

**Founder:** Ar. Archana Gavas — Principal Architect & Founder  
**Location:** Vadodara, Gujarat, India (projects across India and internationally)  
**Philosophy:** Every project begins with listening to the land, the climate, and the client's vision. We use passive solar design, natural materials, rainwater harvesting, and ecological planting to design spaces that regenerate rather than deplete.

---

# Our Design Process

## Step 1 — Understand
- Client vision workshops
- Site study and mapping
- Climate and ecological analysis

## Step 2 — Design
- Conceptual design options
- Final integrated design
- Cost estimate

## Step 3 — Deliver
- Contractor selection support
- Working drawings and documentation
- On-site construction supervision

---

# Services

`;

  // ── Services ─────────────────────────────────────────────────────────────
  services.forEach(s => {
    doc += `## ${s.title}

**Description:** ${s.description}

`;
    if (s.valueProps && s.valueProps.length > 0) {
      doc += `**What We Offer:**\n${s.valueProps.map(v => `- ${v}`).join('\n')}\n\n`;
    }

    if (s.whatItIs && s.whatItIs.length > 0) {
      doc += `**About This Service:**\n${s.whatItIs.join('\n\n')}\n\n`;
    }

    if (s.whoItsFor && s.whoItsFor.length > 0) {
      doc += `**Who This Is For:**\n${s.whoItsFor.map(w => `- ${w}`).join('\n')}\n\n`;
    }

    if (s.process && s.process.length > 0) {
      doc += `**Our Process:**\n${s.process.map((p, i) => `${i + 1}. **${p.title}** — ${p.description}`).join('\n')}\n\n`;
    }

    if (s.pricing) {
      doc += `**Pricing:** ${s.pricing}\n\n`;
    }

    if (s.faq && s.faq.length > 0) {
      doc += `**FAQ:**\n${s.faq.map(f => `- *Q: ${f.question}*\n  A: ${f.answer}`).join('\n')}\n\n`;
    }

    if (s.bookingLink || s.id) {
      doc += `**Book / Enquire:** ${SITE_URL}/services/${s.id}\n\n`;
    }

    doc += `---\n\n`;
  });

  // ── Projects ─────────────────────────────────────────────────────────────
  doc += `# Portfolio Projects\n\n`;

  projects.forEach(p => {
    doc += `## ${p.title}

**Category:** ${p.category}  
**Location:** ${p.location || 'India'}  
**Year:** ${p.year || 'Recent'}  
**Description:** ${p.description}  
**URL:** ${SITE_URL}/projects/${p.slug || p.id}

`;
    if (p.fullDescription) {
      doc += `${stripHtml(p.fullDescription)}\n\n`;
    }

    if (p.specs && p.specs.length > 0) {
      doc += `**Specifications:**\n${p.specs.map(sp => `- ${sp.label}: ${sp.value}`).join('\n')}\n\n`;
    }

    doc += `---\n\n`;
  });

  // ── Blog Posts ────────────────────────────────────────────────────────────
  doc += `# Journal / Blog Articles\n\n`;

  blogs.forEach(b => {
    doc += `## ${b.title}

**Author:** ${b.author || 'Anvitam Team'}  
**Date:** ${b.date}  
**URL:** ${SITE_URL}/blog/${b.slug || b.id}  
**Excerpt:** ${b.excerpt || ''}

`;
    if (b.content) {
      doc += `### Full Content\n\n${stripHtml(b.content)}\n\n`;
    }

    doc += `---\n\n`;
  });

  // ── Team ─────────────────────────────────────────────────────────────────
  doc += `# Team

## Ar. Archana Gavas — Principal Architect & Founder

Rooted in Vadodara, designing for the world. Archana Gavas is the founder and principal architect of Anvitam, bringing together architecture, permaculture, and ecological design to create regenerative spaces across India.

- **LinkedIn:** https://www.linkedin.com/in/archana-gavas/
- **Mentorship:** https://topmate.io/archanagavas
- **Portfolio Review Sessions:** https://topmate.io/archanagavas/1812019

---

# Mentorship & Digital Products

## 1:1 Portfolio Review & Career Guidance
A personalized 45-minute session to review your architectural portfolio, refine your narrative, and position yourself for top international firms. Get actionable feedback from an experienced principal architect.

- **Price:** ₹999
- **Book:** https://topmate.io/archanagavas/1812019

## Project Discussion & Consultation
Book a priority 1:1 session to discuss your upcoming project, site feasibility, or sustainability goals.

- **Book:** https://topmate.io/archanagavas/1799075

---

# Contact & Location

- **Website:** ${SITE_URL}
- **Contact Form:** ${SITE_URL}/contact
- **Book a Consultation:** https://topmate.io/archanagavas/1799075
- **Location:** Vadodara, Gujarat, India
- **Projects:** Pan-India and international

---

*This document is the complete markdown mirror of ${SITE_URL}, last updated ${TODAY}.*
`;

  return doc;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD HELPER — triggers browser file download
// ─────────────────────────────────────────────────────────────────────────────
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
