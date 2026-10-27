// lib/md/registry.ts — Renderer registry: route pattern -> markdown renderer.
// ONE step to add a page: add a renderer (or a row in STATIC_PAGES / a dynamic
// pattern below). llms.txt, llms-full.txt and /api/md/_catalog pick it up
// automatically via listMarkdownRoutes(). Data comes from the same Firestore
// collections / seed constants the HTML pages use (see api/md.ts loader).
import { TOOLS_SUITE } from '../../constants/toolsData.js';
import { PROCESS_STEPS } from '../../constants.js';
import { SITE, absUrl } from '../site.js';
import { pageShell, htmlToMarkdown, faqMarkdown, fmtDate, parseArr, mdLink, siteRelated } from './format.js';

export interface MdData {
  blogs: any[];
  projects: any[];
  services: any[];
  workshops: any[];
  products: any[];
}

export interface MdRoute { path: string; title: string; summary: string; section: string }
export interface MdResult { body: string; canonicalPath: string; lastModified?: string }

/** Public routes intentionally NOT exposed as markdown, with reason. */
export const SKIP_ROUTES: { pattern: string; reason: string }[] = [
  { pattern: '/admin', reason: 'private admin, never exposed' },
  { pattern: '/dashboard', reason: 'logged-in user dashboard' },
  { pattern: '/rachnacad', reason: 'localhost-only unfinished studio (SHOW_GENERATIVE_AI_STUDIOS=false)' },
  { pattern: '/tools/rachnacad', reason: 'localhost-only unfinished studio' },
  { pattern: '/tools/ai-home-design', reason: 'localhost-only unfinished studio, redirects to /tools in production' },
  { pattern: '/tools/ai-interior', reason: 'alias of localhost-only studio' },
  { pattern: '/tools/ai-exterior', reason: 'alias of localhost-only studio' },
  { pattern: '/tools/ai-garden', reason: 'alias of localhost-only studio' },
  { pattern: '/tools/ai-replace', reason: 'alias of localhost-only studio' },
  { pattern: '/tools/ai-removal', reason: 'alias of localhost-only studio' },
  { pattern: '/team', reason: 'redirects to /why' },
  { pattern: '/site-intelligence', reason: 'alias of /site-analysis' },
  { pattern: '/site_intelligence', reason: 'alias of /site-analysis' },
  { pattern: '/tools/site-intelligence', reason: 'alias of /site-analysis' },
  { pattern: '/tools/site-analysis', reason: 'alias of /site-analysis' },
];

const titleCase = (slug: string) =>
  slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const published = (items: any[]) =>
  (items || []).filter((x) => x && x.status !== 'draft' && x.isDraft !== true);

interface StaticPage { path: string; title: string; summary: string; section: string; body: (d: MdData) => string }

const serviceList = (d: MdData) =>
  published(d.services).map((s) => `- ${mdLink(s.title, `/services/${s.id}`)} - ${s.description || ''}`).join('\n');
const projectList = (d: MdData) =>
  published(d.projects).map((p) => `- ${mdLink(p.title, `/projects/${p.slug || p.id}`)} - ${p.description || ''}`).join('\n');
const blogList = (d: MdData) =>
  published(d.blogs).map((b) => `- ${mdLink(b.title, `/blog/${b.slug || b.id}`)} - ${b.excerpt || ''}`).join('\n');
const workshopList = (d: MdData) =>
  published(d.workshops).map((w) => `- ${mdLink(w.title, `/workshops/${w.slug || w.id}`)} - ${w.description || ''}`).join('\n');

export const STATIC_PAGES: StaticPage[] = [
  {
    path: '/', title: `${SITE.name} | Sustainable Architecture & Ecological Design`, section: 'Core pages',
    summary: 'Sustainable architecture and ecological design studio designing eco resorts, farm retreats, food forests and wellness sanctuaries worldwide from Vadodara, Gujarat.',
    body: (d) => `## What We Do\n\n${SITE.description}\n\n## Services\n\n${serviceList(d)}\n\n## Selected Projects\n\n${projectList(d)}\n\n## Latest Journal Articles\n\n${published(d.blogs).slice(0, 10).map((b) => `- ${mdLink(b.title, `/blog/${b.slug || b.id}`)} - ${b.excerpt || ''}`).join('\n')}\n\n## Founder\n\n${SITE.founder} — ${SITE.founderTitle}. Contact: ${SITE.email}`,
  },
  {
    path: '/why', title: 'Why Sustainable Design? | Anvitam', section: 'Core pages',
    summary: 'Why Anvitam builds with natural materials, passive solar design and closed ecosystem loops instead of conventional concrete construction.',
    body: () => `## Passive Solar & Climate-Responsive Architecture\n\nWe analyze sun paths, seasonal winds, and microclimates to design structures that naturally maintain comfortable temperatures, maximizing natural daylight and passive cooling/heating to reduce lifelong energy demand.\n\n## Healthy Buildings with Natural Materials\n\nWe build with natural, non-toxic materials like earth, stone, timber, bamboo, and lime. These materials are breathable, regulate indoor humidity, prevent mold, and lock carbon inside the building fabric.\n\n## Closing Ecosystem Loops\n\nA building should act like a living tree: generating energy, harvesting water, and feeding the soil. We integrate graywater filtration, compost systems, rainwater collection, and food forestry into the architectural environment.\n\n## About the Studio\n\n${SITE.description}`,
  },
  { path: '/services', title: 'Services | Anvitam', section: 'Core pages', summary: 'Architecture, permaculture masterplanning, eco-resort, farm retreat, homestay, wellness and landscape design services by Anvitam.', body: (d) => `## Services\n\n${serviceList(d)}` },
  { path: '/projects', title: 'Projects Portfolio | Anvitam', section: 'Core pages', summary: 'Selected sustainable architecture and permaculture projects: eco resorts, farm retreats, natural homes and terrace gardens.', body: (d) => `## Projects\n\n${projectList(d)}` },
  { path: '/blog', title: 'Journal / Blog | Anvitam', section: 'Core pages', summary: 'Articles and research on sustainable building, natural materials, permaculture, food forests and ecological design by Ar. Archana Gavas.', body: (d) => `## Articles\n\n${blogList(d)}` },
  { path: '/workshops', title: 'Workshops | Nest N Nurture by Anvitam', section: 'Core pages', summary: 'Hands-on eco workshops for schools, universities and workplaces: bird house building, campus space makeovers and plastic waste transformation.', body: (d) => `## Workshops\n\n${workshopList(d)}` },
  {
    path: '/shop', title: 'Shop & Courses | Anvitam', section: 'Core pages',
    summary: 'Online courses, design blueprints and 1:1 consultation and mentorship sessions with Ar. Archana Gavas.',
    body: (d) => `## Products & Sessions\n\n${(d.products || []).map((p) => `- ${mdLink(p.title, p.link || '/shop')} - ${p.description || ''}${p.price ? ` (${p.price})` : ''}`).join('\n')}`,
  },
  {
    path: '/contact', title: 'Contact | Anvitam', section: 'Core pages',
    summary: 'Contact Anvitam for sustainable architecture, permaculture consultation, farm retreat and eco-resort design enquiries.',
    body: () => `## Get In Touch\n\n- Email: ${SITE.email}\n- Phone: ${SITE.phone}\n- Studio: ${SITE.locality}\n- Book a session: ${SITE.socials.topmate}\n- Founder: ${SITE.founder}, ${SITE.founderTitle}`,
  },
  {
    path: '/tools', title: 'Site Intelligence Tools | Anvitam', section: 'Docs / Guides',
    summary: 'Free site-analysis tools: 3D sun and shadow simulation, wind, soil, rainwater and embodied-carbon calculators for landowners and architects.',
    body: () => `## Tools\n\n${TOOLS_SUITE.map((t) => `- ${mdLink(t.name, t.href)} - ${t.shortDesc}`).join('\n')}`,
  },
  {
    path: '/site-analysis', title: 'Site Intelligence & 3D Shadow Canvas | Anvitam', section: 'Docs / Guides',
    summary: 'Drop a pin anywhere on Earth to simulate 3D building shadows, wind vectors, soil health, rainwater and solar potential, with site reports.',
    body: () => `## What It Does\n\n${TOOLS_SUITE[0]?.fullDesc || 'Site analysis: sun angles, wind direction, soil health, building heights, rainwater collection, solar PV and 3D shadow tests.'}\n\n## Capabilities\n\n${(TOOLS_SUITE[0]?.features || []).map((f) => `- ${f}`).join('\n')}`,
  },
  { path: '/privacy', title: 'Privacy Policy | Anvitam', section: 'Optional', summary: 'Privacy policy for anvitam.com.', body: () => `See the canonical privacy policy at ${absUrl('/privacy')}. It describes what personal data the contact and estimator forms collect and how it is used.` },
  { path: '/terms', title: 'Terms of Service | Anvitam', section: 'Optional', summary: 'Terms of service for anvitam.com.', body: () => `See the canonical terms of service at ${absUrl('/terms')}.` },
];

export const SEO_PAGES: Record<string, { title: string; summary: string }> = {
  'farm-retreat-architecture': { title: 'Farm Retreat Architecture', summary: 'Sustainable farm retreat and farmhouse architecture: passive cooling, natural materials and farm masterplanning.' },
  'weekend-villas': { title: 'Sustainable Weekend Villas', summary: 'Biophilic weekend villa and holiday home design with passive cooling and low-maintenance natural materials.' },
  'airbnb-homestay': { title: 'Airbnb & Homestay Design', summary: 'Boutique Airbnb, rental cottage and homestay design for guest experience and rental yield.' },
  'wellness-retreat': { title: 'Wellness Retreat Architecture', summary: 'Wellness and yoga retreat design with non-toxic natural materials, yoga shalas and healing landscapes.' },
  'permaculture': { title: 'Permaculture Design', summary: 'Permaculture land masterplanning: water harvesting, zoning, soil repair and food forests.' },
  'terrace-garden': { title: 'Terrace Garden Design', summary: 'Terrace and balcony garden design with structural load safety, lightweight media and drip irrigation.' },
  'yard-landscape': { title: 'Backyard & Landscape Design', summary: 'Ecological backyard, courtyard and landscape design with native planting and rainwater earthworks.' },
  'community-centre': { title: 'Community Centre Architecture', summary: 'Community and activity centre design for gatherings, learning hubs and cultural activity.' },
};

export const DESTINATION_SLUGS = ['karjat', 'alibaug', 'coorg', 'wayanad', 'goa', 'vadodara'];
export const COMPARISON_SLUGS = ['rammed-earth-vs-rcc', 'natural-pool-vs-chlorine-pool', 'permaculture-planner-vs-landscape-architect'];

function renderStatic(p: StaticPage, d: MdData): MdResult {
  return {
    canonicalPath: p.path,
    body: pageShell({ title: p.title, summary: p.summary, path: p.path, body: p.body(d), related: siteRelated }),
  };
}

function renderService(s: any, d: MdData): MdResult {
  const body = [
    s.description ? `## Overview\n\n${s.description}` : '',
    parseArr(s.valueProps || s.value_props).length ? `## What You Get\n\n${parseArr(s.valueProps || s.value_props).map((v: string) => `- ${v}`).join('\n')}` : '',
    parseArr(s.whatItIs || s.what_it_is).length ? `## What It Is\n\n${parseArr(s.whatItIs || s.what_it_is).join('\n\n')}` : '',
    parseArr(s.whoItsFor || s.who_its_for).length ? `## Who It's For\n\n${parseArr(s.whoItsFor || s.who_its_for).map((v: string) => `- ${v}`).join('\n')}` : '',
    parseArr(s.process).length ? `## Process\n\n${parseArr(s.process).map((p: any, i: number) => `${i + 1}. **${p.title}** - ${p.description}`).join('\n')}` : '',
    s.pricing ? `## Pricing\n\n${s.pricing}` : '',
    faqMarkdown(s.faq),
    s.bookingLink ? `\n\nBook: ${s.bookingLink}` : '',
  ].filter(Boolean).join('\n\n');
  return {
    canonicalPath: `/services/${s.id}`,
    lastModified: s.updated_at || s.updatedAt,
    body: pageShell({
      title: s.metaTitle || `${s.title} | Anvitam`, summary: s.metaDescription || s.description || s.title,
      path: `/services/${s.id}`, lastUpdated: fmtDate(s.updated_at || s.updatedAt) || undefined, body,
      related: [{ text: 'All Services', url: '/services' }, ...siteRelated.slice(1)],
    }),
  };
}

function renderProject(p: any): MdResult {
  const specs = parseArr(p.specs);
  const body = [
    `## Overview\n\n${htmlToMarkdown(String(p.fullDescription || p.full_description || p.description || ''))}`,
    `- Category: ${p.category || ''}\n- Location: ${p.location || ''}\n- Year: ${p.year || ''}`,
    specs.length ? `## Specifications\n\n| Aspect | Details |\n| --- | --- |\n${specs.map((s: any) => `| ${s.label} | ${s.value} |`).join('\n')}` : '',
    faqMarkdown(p.faqs),
  ].filter(Boolean).join('\n\n');
  return {
    canonicalPath: `/projects/${p.slug || p.id}`,
    lastModified: p.updated_at || p.updatedAt,
    body: pageShell({
      title: p.metaTitle || `${p.title} | Projects | Anvitam`, summary: p.metaDescription || p.description || p.title,
      path: `/projects/${p.slug || p.id}`, lastUpdated: fmtDate(p.updated_at || p.updatedAt) || undefined, body,
      related: [{ text: 'All Projects', url: '/projects' }, ...siteRelated.slice(1)],
    }),
  };
}

function renderBlog(b: any, d: MdData): MdResult {
  const others = published(d.blogs).filter((x) => (x.slug || x.id) !== (b.slug || b.id)).slice(0, 5);
  const body = [
    b.excerpt ? `## Summary\n\n${b.excerpt}` : '',
    htmlToMarkdown(b.content || ''),
    faqMarkdown(b.faqs),
    b.author ? `\n\nAuthor: ${b.author}` : '',
  ].filter(Boolean).join('\n\n');
  return {
    canonicalPath: `/blog/${b.slug || b.id}`,
    lastModified: b.updated_at || b.updatedAt || b.date,
    body: pageShell({
      title: b.metaTitle || b.title, summary: b.metaDescription || b.excerpt || b.title,
      path: `/blog/${b.slug || b.id}`, lastUpdated: fmtDate(b.updated_at || b.updatedAt || b.date) || undefined, body,
      related: [
        { text: 'All Articles', url: '/blog' },
        ...others.map((x) => ({ text: x.title, url: `/blog/${x.slug || x.id}` })),
      ],
    }),
  };
}

function renderWorkshop(w: any): MdResult {
  const body = [
    `## Overview\n\n${w.description || ''}`,
    `- Organization: ${w.organization || ''}\n- Location: ${w.location || ''}\n- Date: ${w.date || ''}`,
    parseArr(w.offerings).length ? `## Offerings\n\n${parseArr(w.offerings).map((v: string) => `- ${v}`).join('\n')}` : '',
    w.skillsOutcomes || w.skills_outcomes ? `## Skills & Outcomes\n\n${htmlToMarkdown(String(w.skillsOutcomes || w.skills_outcomes))}` : '',
    w.impact ? `## Impact\n\n${htmlToMarkdown(String(w.impact))}` : '',
    faqMarkdown(w.faqs),
  ].filter(Boolean).join('\n\n');
  return {
    canonicalPath: `/workshops/${w.slug || w.id}`,
    lastModified: w.updated_at || w.updatedAt,
    body: pageShell({
      title: w.metaTitle || `${w.title} | Anvitam Workshops`, summary: w.metaDescription || w.description || w.title,
      path: `/workshops/${w.slug || w.id}`, lastUpdated: fmtDate(w.updated_at || w.updatedAt) || undefined, body,
      related: [{ text: 'All Workshops', url: '/workshops' }, ...siteRelated.slice(1)],
    }),
  };
}

/** Render markdown for a canonical HTML path (no .md suffix). Null = not exposed / not found. */
export function renderMarkdown(rawPath: string, d: MdData): MdResult | null {
  let path = rawPath.split('?')[0].replace(/\.md$/, '');
  if (path === '/index' || path === '') path = '/';
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);

  const stat = STATIC_PAGES.find((p) => p.path === path);
  if (stat) return renderStatic(stat, d);

  const seg = path.split('/').filter(Boolean);
  if (seg[0] === 'services' && seg[1]) {
    const s = published(d.services).find((x) => x.id === seg[1] || x.slug === seg[1]);
    return s ? renderService(s, d) : null;
  }
  if (seg[0] === 'projects' && seg[1]) {
    const p = published(d.projects).find((x) => (x.slug || x.id) === seg[1] || x.id === seg[1]);
    return p ? renderProject(p) : null;
  }
  if (seg[0] === 'blog' && seg[1]) {
    const b = published(d.blogs).find((x) => (x.slug || x.id) === seg[1] || x.id === seg[1]);
    return b ? renderBlog(b, d) : null;
  }
  if (seg[0] === 'workshops' && seg[1]) {
    const w = published(d.workshops).find((x) => (x.slug || x.id) === seg[1] || x.id === seg[1]);
    return w ? renderWorkshop(w) : null;
  }
  if (seg[0] === 'seo' && seg[1] && SEO_PAGES[seg[1]]) {
    const info = SEO_PAGES[seg[1]];
    return {
      canonicalPath: path,
      body: pageShell({
        title: `${info.title} | Anvitam`, summary: info.summary, path,
        body: `## ${info.title}\n\n${info.summary}\n\n${SITE.description}`,
        related: siteRelated,
      }),
    };
  }
  if (seg[0] === 'destinations' && seg[1] && DESTINATION_SLUGS.includes(seg[1])) {
    const name = titleCase(seg[1]);
    return {
      canonicalPath: path,
      body: pageShell({
        title: `Sustainable Architecture in ${name} | Anvitam`,
        summary: `Climate, soil, materials and architectural strategy guide for building sustainably in ${name}.`,
        path,
        body: `## Building in ${name}\n\nThis guide covers local climate, soil, rainfall, regulations, recommended natural materials and architectural strategy for ${name}, with a related Anvitam case study and FAQs on the canonical page: ${absUrl(path)}`,
        related: siteRelated,
      }),
    };
  }
  if (seg[0] === 'compare' && seg[1] && COMPARISON_SLUGS.includes(seg[1])) {
    const name = titleCase(seg[1]);
    return {
      canonicalPath: path,
      body: pageShell({
        title: `${name} | Anvitam Comparison Guide`,
        summary: `Architect's comparison: ${name} — costs, thermal performance, embodied carbon, lifespan, pros and cons.`,
        path,
        body: `## ${name}\n\nFull comparison table, architect's verdict, case study and FAQs are on the canonical page: ${absUrl(path)}`,
        related: siteRelated,
      }),
    };
  }
  if (seg[0] === 'process' && seg[1]) {
    const step = PROCESS_STEPS.find((s) => s.id === seg[1]);
    if (!step) return null;
    return {
      canonicalPath: path,
      body: pageShell({
        title: `${step.title} | Anvitam Process`, summary: step.description || '', path,
        body: `## ${step.title}\n\n${step.description || ''}\n\n${parseArr(step.items).map((v: string) => `- ${v}`).join('\n')}`,
        related: siteRelated,
      }),
    };
  }
  return null;
}

export function listMarkdownRoutes(d: MdData): MdRoute[] {
  const routes: MdRoute[] = STATIC_PAGES.map((p) => ({ path: p.path, title: p.title, summary: p.summary, section: p.section }));
  for (const slug of Object.keys(SEO_PAGES))
    routes.push({ path: `/seo/${slug}`, title: SEO_PAGES[slug].title, summary: SEO_PAGES[slug].summary, section: 'Docs / Guides' });
  for (const s of published(d.services))
    routes.push({ path: `/services/${s.id}`, title: s.title, summary: s.description || '', section: 'Services' });
  for (const p of published(d.projects))
    routes.push({ path: `/projects/${p.slug || p.id}`, title: p.title, summary: p.description || '', section: 'Projects' });
  for (const b of published(d.blogs))
    routes.push({ path: `/blog/${b.slug || b.id}`, title: b.title, summary: b.excerpt || '', section: 'Blog' });
  for (const w of published(d.workshops))
    routes.push({ path: `/workshops/${w.slug || w.id}`, title: w.title, summary: w.description || '', section: 'Workshops' });
  for (const slug of DESTINATION_SLUGS)
    routes.push({ path: `/destinations/${slug}`, title: `Sustainable Architecture in ${titleCase(slug)}`, summary: `Building guide for ${titleCase(slug)}.`, section: 'Docs / Guides' });
  for (const slug of COMPARISON_SLUGS)
    routes.push({ path: `/compare/${slug}`, title: titleCase(slug), summary: `Comparison guide: ${titleCase(slug)}.`, section: 'Docs / Guides' });
  for (const s of PROCESS_STEPS)
    routes.push({ path: `/process/${s.id}`, title: s.title, summary: s.description || '', section: 'Core pages' });
  return routes;
}
