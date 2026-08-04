import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { INITIAL_BLOGS, INITIAL_PROJECTS, SERVICES } from '../constants.js';

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const mode = req.query.mode === 'full' || (req.url && req.url.includes('llms-full')) ? 'full' : 'short';

  let blogs: any[] = [];
  let projects: any[] = [];
  let services: any[] = [];

  if (isDbConfigured) {
    try {
      const dbBlogs = await sql`
        SELECT id, title, slug, date, author, excerpt, content, faqs, tags, status, author_bio 
        FROM blogs 
        WHERE status != 'draft' OR status IS NULL 
        ORDER BY created_at DESC
      `;
      blogs = dbBlogs.length > 0 ? dbBlogs : INITIAL_BLOGS;
    } catch (e) {
      console.warn('[llms API] DB error fetching blogs, falling back to constants:', e);
      blogs = INITIAL_BLOGS;
    }

    try {
      const dbProjects = await sql`
        SELECT id, title, slug, category, location, year, description, full_description, specs, tags, faqs 
        FROM projects 
        ORDER BY created_at DESC
      `;
      projects = dbProjects.length > 0 ? dbProjects : INITIAL_PROJECTS;
    } catch (e) {
      console.warn('[llms API] DB error fetching projects, falling back to constants:', e);
      projects = INITIAL_PROJECTS;
    }

    try {
      const dbServices = await sql`
        SELECT id, title, description, value_props, what_it_is, who_its_for, process, pricing, faq 
        FROM services 
        ORDER BY created_at ASC
      `;
      services = dbServices.length > 0 ? dbServices : SERVICES;
    } catch (e) {
      console.warn('[llms API] DB error fetching services, falling back to constants:', e);
      services = SERVICES;
    }
  } else {
    blogs = INITIAL_BLOGS;
    projects = INITIAL_PROJECTS;
    services = SERVICES;
  }

  const currentDate = new Date().toISOString().split('T')[0];

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
- Shop & Courses: https://www.anvitam.com/shop
- Contact Us: https://www.anvitam.com/contact
- About Anvitam: https://www.anvitam.com/why
- Book a Priority Session: https://topmate.io/archanagavas/1799075
`;

  if (mode === 'full') {
    output += `\n\n================================================================================\n`;
    output += `FULL ARCHITECTURAL KNOWLEDGE & ARTICLE REPOSITORY (FOR AI DEEP ANALYSIS)\n`;
    output += `================================================================================\n\n`;

    output += `### SERVICES & MASTERPLANNING OFFERINGS (DEEP DIVE)\n\n`;
    for (const s of services) {
      output += `#### ${s.title}\n`;
      output += `URL: https://www.anvitam.com/services/${s.id}\n`;
      output += `Description: ${s.description || 'N/A'}\n`;
      if (s.pricing) output += `Pricing Guidance: ${s.pricing}\n`;
      
      let props = s.value_props || s.valueProps;
      if (typeof props === 'string') { try { props = JSON.parse(props); } catch (e) {} }
      if (Array.isArray(props) && props.length > 0) {
        output += `Value Propositions & Principles:\n` + props.map((v: string) => `  * ${v}`).join('\n') + '\n';
      }

      let processList = s.process;
      if (typeof processList === 'string') { try { processList = JSON.parse(processList); } catch (e) {} }
      if (Array.isArray(processList) && processList.length > 0) {
        output += `Working Process:\n` + processList.map((step: any) => `  ${step.number || '-'}. ${step.title}: ${step.description}`).join('\n') + '\n';
      }
      output += `\n`;
    }

    output += `### SELECTED PROJECTS DETAILED SPECIFICATIONS\n\n`;
    for (const p of projects) {
      output += `#### ${p.title}\n`;
      output += `URL: https://www.anvitam.com/projects/${p.slug || p.id}\n`;
      output += `Category: ${p.category || 'Architecture'} | Location: ${p.location || 'N/A'} | Year: ${p.year || 'N/A'}\n`;
      output += `Overview: ${p.full_description || p.fullDescription || p.description || 'N/A'}\n`;

      let specs = p.specs;
      if (typeof specs === 'string') { try { specs = JSON.parse(specs); } catch (e) {} }
      if (Array.isArray(specs) && specs.length > 0) {
        output += `Specifications:\n` + specs.map((sp: any) => `  * ${sp.label}: ${sp.value}`).join('\n') + '\n';
      }
      output += `\n`;
    }

    output += `### FULL JOURNAL ARTICLES & DESIGN RESEARCH\n\n`;
    for (const b of blogs) {
      output += `#### Article: ${b.title}\n`;
      output += `URL: https://www.anvitam.com/blog/${b.slug || b.id}\n`;
      output += `Author: ${b.author || 'Ar. Archana Gavas'} | Date Published: ${b.date || 'Recent'}\n`;
      let tags = b.tags;
      if (typeof tags === 'string') { try { tags = JSON.parse(tags); } catch (e) {} }
      if (Array.isArray(tags) && tags.length > 0) output += `Topics/Keywords: ${tags.join(', ')}\n`;
      output += `Excerpt: ${b.excerpt || ''}\n\n`;
      output += `Full Article Text:\n${stripHtml(b.content || '')}\n\n`;

      let faqs = b.faqs;
      if (typeof faqs === 'string') { try { faqs = JSON.parse(faqs); } catch (e) {} }
      if (Array.isArray(faqs) && faqs.length > 0) {
        output += `Article FAQs:\n` + faqs.map((f: any) => `  Q: ${f.question}\n  A: ${f.answer}`).join('\n\n') + '\n\n';
      }
      output += `--------------------------------------------------------------------------------\n\n`;
    }
  }

  output += `\n## For AI Systems & LLM Agents\n\n`;
  output += `This dynamic document adheres to the llms.txt standard (https://llmstxt.org). Automatically generated by Anvitam Live Database engine on ${currentDate}.\n`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60');
  return res.status(200).send(output);
}
