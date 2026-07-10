import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { sql, isDbConfigured } from '../lib/db.js';
import { INITIAL_BLOGS, INITIAL_PROJECTS, SERVICES } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  // Filter empty parts
  const pathSegments = urlParts.filter(Boolean);
  
  const section = pathSegments[0] || '';
  const idOrSlug = pathSegments[1] || '';

  let title = 'Anvitam | Architecture & Design';
  let desc = 'ANVITAM Architects in Vadodara, Gujarat blending Sustainability with Nature. Eco retreats, farm stays, permaculture design worldwide.';
  let imageUrl = 'https://www.anvitam.com/favicon.png';
  let canonicalUrl = `https://www.anvitam.com${req.url ? req.url.split('?')[0] : ''}`;
  let keywords = 'architecture, sustainable architecture, permaculture design, eco retreats, farm stays, biophilic design, green building, Vadodara, Gujarat';
  let robots = 'index, follow';
  let publisher = 'Anvitam';

  // Fetch data depending on the section
  if (section === 'blog' && idOrSlug) {
    try {
      let blog: any = null;
      if (isDbConfigured) {
        const rows = await sql`
          SELECT title, slug, excerpt, image, meta_title, meta_description, meta_keywords, meta_robots, tags 
          FROM blogs 
          WHERE slug = ${idOrSlug} OR id = ${idOrSlug}
        `;
        if (rows.length > 0) {
          blog = rows[0];
        }
      }
      if (!blog) {
        blog = INITIAL_BLOGS.find(b => b.slug === idOrSlug || b.id === idOrSlug);
      }

      if (blog) {
        title = blog.meta_title || blog.metaTitle || blog.title;
        desc = blog.meta_description || blog.metaDescription || blog.excerpt || blog.title;
        imageUrl = blog.image || imageUrl;
        canonicalUrl = `https://www.anvitam.com/blog/${blog.slug || blog.id}`;
        let tagsArr = blog.tags;
        if (typeof tagsArr === 'string') {
          try { tagsArr = JSON.parse(tagsArr); } catch (e) {}
        }
        keywords = blog.meta_keywords || blog.metaKeywords || (Array.isArray(tagsArr) && tagsArr.length > 0 ? tagsArr.join(', ') : keywords);
        robots = blog.meta_robots || blog.metaRobots || robots;
      }
    } catch (e) {
      console.error('Error fetching blog SEO data:', e);
    }
  } else if (section === 'projects' && idOrSlug) {
    try {
      let project: any = null;
      if (isDbConfigured) {
        const rows = await sql`
          SELECT title, slug, description, image, tags, meta_title, meta_description, meta_keywords, meta_robots 
          FROM projects 
          WHERE slug = ${idOrSlug} OR id = ${idOrSlug}
        `;
        if (rows.length > 0) {
          project = rows[0];
        }
      }
      if (!project) {
        project = INITIAL_PROJECTS.find(p => p.slug === idOrSlug || p.id === idOrSlug);
      }

      if (project) {
        title = project.meta_title || project.metaTitle || `${project.title} | Projects | Anvitam`;
        desc = project.meta_description || project.metaDescription || project.description || desc;
        imageUrl = project.image || imageUrl;
        canonicalUrl = `https://www.anvitam.com/projects/${project.slug || project.id}`;
        let tagsArr = project.tags;
        if (typeof tagsArr === 'string') {
          try { tagsArr = JSON.parse(tagsArr); } catch (e) {}
        }
        keywords = project.meta_keywords || project.metaKeywords || (Array.isArray(tagsArr) && tagsArr.length > 0 ? tagsArr.join(', ') : keywords);
        robots = project.meta_robots || project.metaRobots || robots;
      }
    } catch (e) {
      console.error('Error fetching project SEO data:', e);
    }
  } else if (section === 'services' && idOrSlug) {
    try {
      let service: any = null;
      if (isDbConfigured) {
        const rows = await sql`
          SELECT title, description, hero_image, value_props, meta_title, meta_description, meta_keywords, meta_robots 
          FROM services 
          WHERE id = ${idOrSlug}
        `;
        if (rows.length > 0) {
          service = rows[0];
        }
      }
      if (!service) {
        service = SERVICES.find(s => s.id === idOrSlug);
      }

      if (service) {
        title = service.meta_title || service.metaTitle || `${service.title} | Services | Anvitam`;
        desc = service.meta_description || service.metaDescription || service.description || desc;
        imageUrl = service.hero_image || service.heroImage || imageUrl;
        canonicalUrl = `https://www.anvitam.com/services/${idOrSlug}`;
        let props = service.value_props || service.valueProps;
        if (typeof props === 'string') {
          try { props = JSON.parse(props); } catch (e) {}
        }
        keywords = service.meta_keywords || service.metaKeywords || [service.title, 'sustainable architecture', 'eco design', 'permaculture', ...(Array.isArray(props) ? props : [])].join(', ');
        robots = service.meta_robots || service.metaRobots || robots;
      }
    } catch (e) {
      console.error('Error fetching service SEO data:', e);
    }
  } else if (section === 'seo' && idOrSlug) {
    const seoPages: Record<string, { title: string; desc: string }> = {
      'farm-retreat-architecture': {
        title: 'Farm Retreat Architecture & Design | Anvitam',
        desc: 'Discover sustainable farm retreat architecture and design by Anvitam. We build eco-friendly farm stays integrated with nature and permaculture.'
      },
      'weekend-villas': {
        title: 'Sustainable Weekend Villas | Anvitam',
        desc: 'Design beautiful, eco-friendly weekend villas blending biophilic architecture with modern comforts. Grounded in natural materials and off-grid living.'
      },
      'airbnb-homestay': {
        title: 'Airbnb & Homestay Design for Revenue | Anvitam',
        desc: 'Elevate your rental property with our signature Airbnb & Homestay design, maximizing occupancy, guest reviews, and local authenticity.'
      },
      'wellness-retreat': {
        title: 'Wellness Retreat Architecture & Sanctuaries | Anvitam',
        desc: 'Architecting world-class wellness retreats, meditation shalas, and healing sanctuaries that promote physical, mental, and spiritual rejuvenation.'
      },
      'permaculture': {
        title: 'Permaculture Design & Consultation | Anvitam',
        desc: 'Professional permaculture design and consultation services to turn your land into a self-sustaining, biodiverse, and productive food forest.'
      },
      'terrace-garden': {
        title: 'Terrace Garden & Rooftop Sanctuary Design | Anvitam',
        desc: 'Transform barren rooftops into lush, productive terrace gardens. Structural auditing, lightweight soil engineering, and biophilic design.'
      },
      'yard-landscape': {
        title: 'Backyard & Ecological Landscape Design | Anvitam',
        desc: 'Beautiful backyard designs featuring natural chemical-free swimming pools, local flora, and passive water harvesting setups.'
      },
      'community-centre': {
        title: 'Community Centers & Civic Architecture | Anvitam',
        desc: 'Designing sustainable, accessible, and resilient community centers that serve local neighborhoods and teach ecology through action.'
      }
    };

    const pageMeta = seoPages[idOrSlug];
    if (pageMeta) {
      title = pageMeta.title;
      desc = pageMeta.desc;
      canonicalUrl = `https://www.anvitam.com/seo/${idOrSlug}`;
    }
  } else {
    const staticPages: Record<string, { title: string; desc: string }> = {
      'about': {
        title: 'About Us | Anvitam',
        desc: 'Meet Archana Gavas and the team at Anvitam. We are architects and permaculture designers based in Vadodara, Gujarat, working globally.'
      },
      'why': {
        title: 'Why Sustainable Design? | Anvitam',
        desc: 'Understand why we build with earth, wood, and lime. The science behind passive cooling, non-toxic materials, and permanent ecology.'
      },
      'contact': {
        title: 'Contact Us | Anvitam',
        desc: 'Get in touch with Anvitam for sustainable architecture projects, farm stay design, permaculture masterplans, or general consultations.'
      },
      'portfolio': {
        title: 'Our Portfolio | Anvitam',
        desc: 'Browse our sustainable design projects including Carpa Lupa, The Batukaru Yurt, vanvagado Farm, and residential designs.'
      },
      'projects': {
        title: 'Our Projects | Anvitam',
        desc: 'Browse our sustainable design projects including Carpa Lupa, The Batukaru Yurt, vanvagado Farm, and residential designs.'
      },
      'services': {
        title: 'Services | Anvitam',
        desc: 'Explore our design services: Permaculture, Farm Retreats, Airbnb & Homestay Design, Community Centers, and Terrace Gardens.'
      },
      'shop': {
        title: 'Products & Online Courses | Anvitam',
        desc: 'Masterclasses on Farm Retreat design, Food Forest blueprints, and Airbnb optimization. Book consultations and download blueprints.'
      },
      'blog': {
        title: 'Blog & Insights | Anvitam',
        desc: 'Read articles and research on biophilic design, natural building materials, clay/lime plasters, and sustainable engineering.'
      },
      'privacy': {
        title: 'Privacy Policy | Anvitam',
        desc: 'Read the Privacy Policy for Anvitam.com.'
      },
      'terms': {
        title: 'Terms of Service | Anvitam',
        desc: 'Read the Terms of Service for Anvitam.com.'
      }
    };

    const pageMeta = staticPages[section];
    if (pageMeta) {
      title = pageMeta.title;
      desc = pageMeta.desc;
    }
  }

  // Load the index.html template
  let template = '';
  try {
    template = fs.readFileSync(path.join(process.cwd(), 'dist/index.html'), 'utf8');
  } catch (err) {
    try {
      template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    } catch (err2) {
      template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Anvitam</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
    }
  }

  // Replace tags
  template = template.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title data-rh="true">${title}</title>`);

  const replaceOrInjectMeta = (htmlStr: string, keyAttr: string, keyVal: string, value: string) => {
    const regex = new RegExp(`<meta[^>]*${keyAttr}="${keyVal}"[^>]*>`, 'i');
    const newTag = `<meta ${keyAttr}="${keyVal}" content="${value.replace(/"/g, '&quot;')}" data-rh="true" />`;
    if (regex.test(htmlStr)) {
      return htmlStr.replace(regex, newTag);
    } else {
      return htmlStr.replace('</head>', `  ${newTag}\n</head>`);
    }
  };

  template = replaceOrInjectMeta(template, 'name', 'description', desc);
  template = replaceOrInjectMeta(template, 'property', 'og:title', title);
  template = replaceOrInjectMeta(template, 'property', 'og:description', desc);
  template = replaceOrInjectMeta(template, 'property', 'og:url', canonicalUrl);
  template = replaceOrInjectMeta(template, 'property', 'og:image', imageUrl);
  
  template = replaceOrInjectMeta(template, 'name', 'twitter:title', title);
  template = replaceOrInjectMeta(template, 'name', 'twitter:description', desc);
  template = replaceOrInjectMeta(template, 'name', 'twitter:image', imageUrl);
  template = replaceOrInjectMeta(template, 'name', 'twitter:card', 'summary_large_image');

  // Inject keywords, robots, publisher metas
  template = replaceOrInjectMeta(template, 'name', 'keywords', keywords);
  template = replaceOrInjectMeta(template, 'name', 'robots', robots);
  template = replaceOrInjectMeta(template, 'name', 'X-Robots-Tag', robots);
  template = replaceOrInjectMeta(template, 'name', 'publisher', publisher);

  // Inject/replace canonical link
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" data-rh="true" />`;
  if (template.includes('rel="canonical"')) {
    template = template.replace(/<link[^>]*rel="canonical"[^>]*>/i, canonicalTag);
  } else {
    template = template.replace('</head>', `  ${canonicalTag}\n</head>`);
  }

  // Inject link rel="publisher"
  const publisherTag = `<link rel="publisher" href="https://www.anvitam.com/" data-rh="true" />`;
  if (template.includes('rel="publisher"')) {
    template = template.replace(/<link[^>]*rel="publisher"[^>]*>/i, publisherTag);
  } else {
    template = template.replace('</head>', `  ${publisherTag}\n</head>`);
  }

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=60');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', robots);
  return res.status(200).send(template);
}
