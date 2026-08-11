import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { isDbConfigured, getCollection, getDoc, findWhere } from '../lib/db.js';
import { INITIAL_BLOGS, INITIAL_PROJECTS, SERVICES, PROCESS_STEPS, TESTIMONIALS, INITIAL_WORKSHOPS } from '../constants.js';

// --- Helper Functions for HTML and Schema Generation ---

function generateBreadcrumbSchema(section: string, idOrSlug: string, itemName?: string) {
  const elements = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.anvitam.com/"
    }
  ];

  const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
  elements.push({
    "@type": "ListItem",
    "position": 2,
    "name": sectionName,
    "item": `https://www.anvitam.com/${section}`
  });

  if (idOrSlug) {
    const finalName = itemName || idOrSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    elements.push({
      "@type": "ListItem",
      "position": 3,
      "name": finalName,
      "item": `https://www.anvitam.com/${section}/${idOrSlug}`
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": elements
  };
}

function generateSchemas(section: string, idOrSlug: string, data: { blog?: any, project?: any, service?: any, workshop?: any }) {
  const schemas: any[] = [];

  // Person schema for Archana Gavas (E-E-A-T)
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://www.anvitam.com/#founder",
    "name": "Archana Gavas",
    "jobTitle": "Principal Architect & Founder",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://www.anvitam.com/#organization",
      "name": "Anvitam",
      "url": "https://www.anvitam.com/"
    },
    "url": "https://www.anvitam.com/why",
    "sameAs": [
      "https://www.linkedin.com/in/archana-gavas/",
      "https://www.instagram.com/anvitam_archit/",
      "https://topmate.io/archanagavas"
    ]
  };
  schemas.push(personSchema);

  // LocalBusiness schema for brand geographical anchoring & local SEO
  if (!section || section === 'contact') {
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://www.anvitam.com/#localbusiness",
      "name": "Anvitam",
      "image": "https://www.anvitam.com/favicon.png",
      "telephone": "+917990657190",
      "email": "anvitamarchitects@gmail.com",
      "url": "https://www.anvitam.com/",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Vadodara",
        "addressRegion": "Gujarat",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 22.3072,
        "longitude": 73.1812
      },
      "founder": {
        "@type": "Person",
        "@id": "https://www.anvitam.com/#founder"
      }
    };
    schemas.push(localBusinessSchema);
  }

  // Breadcrumb schema
  if (section) {
    let itemName = '';
    if (section === 'blog' && data.blog) {
      itemName = data.blog.title;
    } else if (section === 'projects' && data.project) {
      itemName = data.project.title;
    } else if (section === 'services' && data.service) {
      itemName = data.service.title;
    } else if (section === 'workshops' && data.workshop) {
      itemName = data.workshop.title;
    }
    
    const breadcrumbSchema = generateBreadcrumbSchema(section, idOrSlug, itemName);
    if (breadcrumbSchema) {
      schemas.push(breadcrumbSchema);
    }
  }

  // BlogPosting schema
  if (section === 'blog' && data.blog) {
    const blog = data.blog;
    let tagsArr = blog.tags;
    if (typeof tagsArr === 'string') {
      try { tagsArr = JSON.parse(tagsArr); } catch (e) {}
    }
    if (!Array.isArray(tagsArr)) tagsArr = [];

    const blogPostingSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://www.anvitam.com/blog/${blog.slug || blog.id}`
      },
      "headline": blog.title,
      "description": blog.excerpt || blog.meta_description || blog.title,
      "image": blog.image || 'https://www.anvitam.com/favicon.png',
      "datePublished": blog.date || new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": blog.author || "Archana Gavas",
        "jobTitle": "Principal Architect & Founder",
        "sameAs": [
          "https://www.linkedin.com/in/archana-gavas/",
          "https://www.instagram.com/anvitam_archit/",
          "https://topmate.io/archanagavas"
        ]
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://www.anvitam.com/#organization",
        "name": "Anvitam",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.anvitam.com/favicon.png",
          "width": 192,
          "height": 192
        }
      },
      "keywords": tagsArr.join(', ')
    };
    schemas.push(blogPostingSchema);

    // Dynamic HowTo schema for step-by-step or agroforestry/permaculture guide posts
    const isGuide = blog.title.toLowerCase().includes('guide') || 
                    blog.title.toLowerCase().includes('how') ||
                    blog.title.toLowerCase().includes('step') ||
                    tagsArr.some((t: string) => t.toLowerCase().includes('guide') || t.toLowerCase().includes('howto') || t.toLowerCase().includes('agroforestry') || t.toLowerCase().includes('permaculture'));
                     
    if (isGuide) {
      const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": blog.title,
        "description": blog.excerpt || blog.meta_description || blog.title,
        "image": blog.image || 'https://www.anvitam.com/favicon.png',
        "author": {
          "@type": "Person",
          "@id": "https://www.anvitam.com/#founder"
        },
        "step": [
          {
            "@type": "HowToStep",
            "name": "Observation & Site Analysis",
            "text": "Analyze the sun, wind, water patterns, soil quality, and topography of the land."
          },
          {
            "@type": "HowToStep",
            "name": "Concept Design & Zoning",
            "text": "Map the site into zones (0 to 5) and design energy/resource flow paths."
          },
          {
            "@type": "HowToStep",
            "name": "Water Harvesting Setup",
            "text": "Design bioswales, ponds, and earthworks to store water on the landscape."
          },
          {
            "@type": "HowToStep",
            "name": "Planting & Agroforestry Layout",
            "text": "Establish food forest layers, syntropic agroforestry beds, and ecological cover."
          }
        ]
      };
      schemas.push(howToSchema);
    }
  }

  // CreativeWork/Project schema for projects detail/case study pages
  if (section === 'projects' && data.project) {
    const project = data.project;
    let tagsArr = project.tags;
    if (typeof tagsArr === 'string') {
      try { tagsArr = JSON.parse(tagsArr); } catch (e) {}
    }
    if (!Array.isArray(tagsArr)) tagsArr = [];

    const projectSchema = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": project.title,
      "description": project.description,
      "image": project.image || 'https://www.anvitam.com/favicon.png',
      "creator": {
        "@type": "Person",
        "@id": "https://www.anvitam.com/#founder"
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://www.anvitam.com/#organization"
      },
      "keywords": tagsArr.join(', ')
    };
    schemas.push(projectSchema);

    // Article schema for case studies
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": project.title,
      "description": project.description,
      "image": project.image || 'https://www.anvitam.com/favicon.png',
      "datePublished": project.year ? `${project.year}-01-01` : new Date().toISOString(),
      "author": {
        "@type": "Person",
        "@id": "https://www.anvitam.com/#founder"
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://www.anvitam.com/#organization"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://www.anvitam.com/projects/${project.slug || project.id}`
      }
    };
    schemas.push(articleSchema);
  }

  // CollectionPage schema for main projects listing
  if (section === 'projects' && !data.project) {
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Anvitam Projects Portfolio | Sustainable Architecture",
      "description": "Explore our portfolio of sustainable design projects, permaculture masterplans, biophilic buildings, and ecological retreats globally.",
      "url": "https://www.anvitam.com/projects",
      "about": {
        "@type": "LocalBusiness",
        "@id": "https://www.anvitam.com/#localbusiness"
      },
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": INITIAL_PROJECTS.map((p, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "url": `https://www.anvitam.com/projects/${p.slug || p.id}`
        }))
      }
    };
    schemas.push(collectionSchema);
  }

  // Service and FAQPage schema for specific services
  if (section === 'services' && data.service) {
    const service = data.service;
    
    // Service schema
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": service.title,
      "description": service.description,
      "serviceType": "Architectural Design and Ecological Masterplanning",
      "provider": {
        "@type": "LocalBusiness",
        "@id": "https://www.anvitam.com/#localbusiness"
      },
      "areaServed": "Worldwide",
      "offers": {
        "@type": "Offer",
        "price": service.pricing || "0",
        "priceCurrency": "INR",
        "description": "Contact for custom design pricing"
      }
    };
    schemas.push(serviceSchema);

    // FAQPage schema
    let serviceFaq = service.faq || [];
    if (typeof serviceFaq === 'string') {
      try { serviceFaq = JSON.parse(serviceFaq); } catch (e) {}
    }
    if (Array.isArray(serviceFaq) && serviceFaq.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": serviceFaq.map((f: any) => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      };
      schemas.push(faqSchema);
    }
  }

  // ContactPage schema for /contact
  if (section === 'contact') {
    const contactPageSchema = {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": "https://www.anvitam.com/contact#webpage",
      "url": "https://www.anvitam.com/contact",
      "name": "Contact Anvitam | Sustainable Architecture & Eco Design",
      "description": "Get in touch with Ar. Archana Gavas at Anvitam for sustainable architecture, permaculture consultation, farm retreat design, and wellness sanctuaries.",
      "mainEntity": {
        "@type": "LocalBusiness",
        "@id": "https://www.anvitam.com/#localbusiness"
      }
    };
    schemas.push(contactPageSchema);
  }

  // Product and Offer schema for /shop
  if (section === 'shop') {
    const product1 = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Farm Retreat Design Masterclass",
      "description": "Learn the details of site analysis, bioclimatic design, permaculture zoning, and how to create profitable eco-retreat experiences.",
      "image": "https://www.anvitam.com/favicon.png",
      "offers": {
        "@type": "Offer",
        "price": "3999",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": "https://topmate.io/archanagavas"
      }
    };
    const product2 = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Food Forest Design Blueprint",
      "description": "Design productive food forests and edible gardens for farm stays, community spaces, and personal properties using permaculture.",
      "image": "https://www.anvitam.com/favicon.png",
      "offers": {
        "@type": "Offer",
        "price": "2499",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": "https://topmate.io/archanagavas"
      }
    };
    schemas.push(product1, product2);
  }

  // FAQPage schema on homepage
  if (!section) {
    const homeFaqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How long does a farm retreat architecture project take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Typically 6–18 months depending on scale, site conditions, and permitting. We'll give you a full timeline after the initial site audit."
          }
        },
        {
          "@type": "Question",
          "name": "Do you provide weekend villa architect services in Australia?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We have dedicated teams across major Australian states including NSW, VIC, and QLD delivering weekend villa design and farm stay architecture."
          }
        },
        {
          "@type": "Question",
          "name": "What is permaculture site planning?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It's a design methodology that works with natural systems to create self-sustaining, productive landscapes. We integrate it into every eco retreat design project."
          }
        },
        {
          "@type": "Question",
          "name": "Can I get Airbnb homestay design services remotely?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. We offer full digital discovery, remote design consultations, and partnered local build management across USA and Australia."
          }
        },
        {
          "@type": "Question",
          "name": "Do you handle food forest design?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — edible garden design services and food forest design are core to our offering and can be added to any retreat or villa landscape project."
          }
        }
      ]
    };
    schemas.push(homeFaqSchema);
  }

  // Event and FAQPage schema for workshops
  if (section === 'workshops' && data.workshop) {
    const workshop = data.workshop;
    let faqsList = workshop.faqs || [];
    if (typeof faqsList === 'string') {
      try { faqsList = JSON.parse(faqsList); } catch (e) {}
    }
    if (!Array.isArray(faqsList) || faqsList.length === 0) {
      faqsList = [
        { question: `What is included in the ${workshop.title}?`, answer: `The workshop provides all reclaimed materials, non-toxic paints, child-safe tools, expert architectural guidance, and participation certificates.` },
        { question: `Where was this workshop conducted?`, answer: `Conducted for ${workshop.organization || 'our partner institution'} at ${workshop.location || 'campus premises'}.` },
        { question: `How can institutions book a similar workshop?`, answer: `Schools, universities, and corporate ESG teams can request a custom proposal via our website or by contacting ar.archanagavas@gmail.com.` }
      ];
    }

    const eventSchema = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": workshop.title,
      "description": workshop.meta_description || workshop.metaDescription || workshop.description,
      "image": (workshop.images && workshop.images[0]) || 'https://www.anvitam.com/workshops/birds%20house%20making.png',
      "startDate": workshop.date ? `${workshop.date}-01-01` : new Date().toISOString().split('T')[0],
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "location": {
        "@type": "Place",
        "name": workshop.organization || "Campus Venue",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": workshop.city || workshop.location || "Gujarat",
          "addressRegion": workshop.state || "Gujarat",
          "addressCountry": workshop.country || "India"
        }
      },
      "organizer": {
        "@type": "Organization",
        "@id": "https://www.anvitam.com/#organization",
        "name": "Nest N Nurture by Anvitam Architecture",
        "url": "https://www.anvitam.com"
      },
      "performer": {
        "@type": "Person",
        "@id": "https://www.anvitam.com/#founder",
        "name": "Ar. Archana Gavas"
      }
    };
    schemas.push(eventSchema);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqsList.map((f: any) => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer
        }
      }))
    };
    schemas.push(faqSchema);
  }

  return schemas;
}

function generateSsrHtml(section: string, idOrSlug: string, data: { blog?: any, project?: any, service?: any, workshop?: any, allProjects?: any[], allServices?: any[] }): string {
  const headerHtml = `
    <header style="padding: 20px; background-color: #03160E; color: #FAFAFA; display: flex; justify-content: space-between; align-items: center; font-family: 'Playfair Display', serif;">
      <div style="font-size: 24px; font-weight: bold;"><a href="/" style="color: #CCFF00; text-decoration: none;">Anvitam</a></div>
      <nav style="display: flex; gap: 20px;">
        <a href="/" style="color: #FAFAFA; text-decoration: none;">Home</a>
        <a href="/why" style="color: #FAFAFA; text-decoration: none;">Why Sustainable</a>
        <a href="/services" style="color: #FAFAFA; text-decoration: none;">Services</a>
        <a href="/projects" style="color: #FAFAFA; text-decoration: none;">Projects</a>
        <a href="/blog" style="color: #FAFAFA; text-decoration: none;">Blog</a>
        <a href="/contact" style="color: #FAFAFA; text-decoration: none;">Contact</a>
        <a href="/shop" style="color: #FAFAFA; text-decoration: none;">Shop</a>
      </nav>
    </header>
  `;

  const footerHtml = `
    <footer style="background-color: #03160E; color: #A3B8AF; padding: 40px 20px; font-family: 'Inter', sans-serif; font-size: 14px; text-align: center; border-top: 1px solid rgba(163, 184, 175, 0.1);">
      <p style="color: #FAFAFA; font-family: 'Playfair Display', serif; font-size: 18px; margin-bottom: 10px;">Anvitam — Sustainable Architecture & Eco Design Studio</p>
      <p style="margin-bottom: 20px;">Vadodara, Gujarat, India | Designing for the World</p>
      <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;">
        <a href="https://www.linkedin.com/in/archana-gavas/" style="color: #CCFF00; text-decoration: none;">LinkedIn</a>
        <a href="https://www.instagram.com/anvitam_archit/" style="color: #CCFF00; text-decoration: none;">Instagram</a>
        <a href="https://topmate.io/archanagavas" style="color: #CCFF00; text-decoration: none;">Topmate Consultation</a>
        <a href="https://submitforbacklinks.com/product/anvitam?utm_source=badge&utm_medium=embed&utm_campaign=anvitam&ref=submitforbacklinks" target="_blank" rel="noopener" data-s4b-token="zRY280VBHOeqyS1Mvd0jKnJd" data-s4b-theme="light" style="color: #CCFF00; text-decoration: none;">SubmitForBacklinks</a>
        <a href="https://indiehunt.io/project/anvitam" target="_blank" rel="noopener" style="color: #CCFF00; text-decoration: none;">IndieHunt</a>
        <a href="https://makerhunt.io/project/anvitam" target="_blank" rel="noopener" title="Featured on MakerHunt" style="color: #CCFF00; text-decoration: none;">MakerHunt</a>
        <a href="https://sidehunt.io/project/anvitam" target="_blank" rel="noopener" title="View project on Sidehunt" style="color: #CCFF00; text-decoration: none;">Sidehunt</a>
        <a href="https://uno.directory" target="_blank" rel="noopener" style="color: #CCFF00; text-decoration: none;">Uno Directory</a>
        <a href="https://earlyhunt.com/project/anvitam" target="_blank" rel="noopener" style="color: #CCFF00; text-decoration: none;">EarlyHunt</a>
        <a href="https://auraplusplus.com/projects/anvitam" target="_blank" rel="noopener" style="color: #CCFF00; text-decoration: none;">Aura++</a>
        <a href="https://www.uneed.best/tool/anvitam" target="_blank" style="color: #CCFF00; text-decoration: none;">Uneed</a>
        <a href="https://nicklaunches.com/products/anvitam/?utm_source=anvitam.com&utm_medium=badge&utm_campaign=featured" target="_blank" rel="noopener" style="color: #CCFF00; text-decoration: none;">Nick Launches</a>
        <a href="https://abacklaunch.com" target="_blank" rel="dofollow" style="color: #CCFF00; text-decoration: none;">Aback Launch</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} Anvitam. All rights reserved. <a href="/privacy" style="color: #A3B8AF;">Privacy Policy</a> | <a href="/terms" style="color: #A3B8AF;">Terms of Service</a></p>
    </footer>
  `;

  let bodyHtml = '';

  if (section === 'blog') {
    if (idOrSlug && data.blog) {
      const blog = data.blog;
      let tagsArr = blog.tags;
      if (typeof tagsArr === 'string') {
        try { tagsArr = JSON.parse(tagsArr); } catch (e) {}
      }
      if (!Array.isArray(tagsArr)) tagsArr = [];
      
      bodyHtml = `
        <article style="max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; line-height: 1.8; color: #111;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 40px; margin-bottom: 10px; color: #03160E;">${blog.title}</h1>
          <p style="color: #666; margin-bottom: 30px;">Published on ${blog.date} by <strong>${blog.author || 'Archana Gavas'}</strong></p>
          <div style="font-size: 18px; font-style: italic; color: #555; border-left: 4px solid #CCFF00; padding-left: 20px; margin-bottom: 30px;">
            <p>${blog.excerpt}</p>
          </div>
          <div style="margin-bottom: 40px; border-radius: 8px; overflow: hidden;">
            <img src="${blog.image}" alt="${blog.title}" style="width: 100%; max-height: 450px; object-fit: cover;" />
          </div>
          <div class="prose" style="font-size: 16px;">
            ${blog.content}
          </div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p><strong>Tags:</strong> ${tagsArr.join(', ')}</p>
          </div>
          ${blog.author_bio ? `
            <div style="margin-top: 40px; padding: 20px; background-color: #03160E; color: #FAFAFA; border-radius: 8px; display: flex; gap: 20px; align-items: center;">
              ${blog.author_image ? `<img src="${blog.author_image}" alt="${blog.author}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;" />` : ''}
              <div>
                <h3 style="margin-top: 0; font-family: 'Playfair Display', serif; color: #CCFF00; margin-bottom: 5px;">About Ar. Archana Gavas</h3>
                <p style="margin: 0; font-size: 14px; color: #A3B8AF; line-height: 1.5;">${blog.author_bio}</p>
              </div>
            </div>
          ` : ''}
        </article>
      `;
    } else {
      bodyHtml = `
        <main style="max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #03160E; margin-bottom: 20px;">Blog & Insights</h1>
          <p style="color: #666; font-size: 18px; margin-bottom: 40px;">Deep dives, research, and project stories exploring sustainable materials, biophilic design, and ecological landscaping.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            ${INITIAL_BLOGS.map(b => `
              <div style="background: #FFF; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; padding: 20px;">
                <h2 style="font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;"><a href="/blog/${b.slug || b.id}" style="color: #03160E; text-decoration: none;">${b.title}</a></h2>
                <p style="color: #888; font-size: 12px;">${b.date}</p>
                <p style="color: #555; line-height: 1.6;">${b.excerpt}</p>
                <a href="/blog/${b.slug || b.id}" style="color: #03160E; font-weight: bold; text-decoration: underline;">Read Article</a>
              </div>
            `).join('')}
          </div>
        </main>
      `;
    }
  } else if (section === 'projects') {
    if (idOrSlug && data.project) {
      const project = data.project;
      let specs = project.specs || [];
      if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch (e) {}
      }
      if (!Array.isArray(specs)) specs = [];

      bodyHtml = `
        <main style="max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; line-height: 1.8;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 40px; color: #03160E; margin-bottom: 10px;">${project.title}</h1>
          <p style="font-size: 18px; color: #666; margin-bottom: 30px;"><strong>Category:</strong> ${project.category} | <strong>Location:</strong> ${project.location} | <strong>Year:</strong> ${project.year}</p>
          <div style="margin-bottom: 40px; border-radius: 8px; overflow: hidden;">
            <img src="${project.image}" alt="${project.title}" style="width: 100%; max-height: 500px; object-fit: cover;" />
          </div>
          <h2>Overview & Concept</h2>
          <p style="font-size: 16px;">${project.full_description || project.fullDescription || project.description}</p>
          
          <h2>Project Specifications</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
            <thead>
              <tr style="border-bottom: 2px solid #03160E; text-align: left;">
                <th style="padding: 10px; font-family: 'Playfair Display', serif; font-weight: bold;">Aspect</th>
                <th style="padding: 10px; font-family: 'Playfair Display', serif; font-weight: bold;">Details</th>
              </tr>
            </thead>
            <tbody>
              ${specs.map((s: any) => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px; font-weight: bold;">${s.label}</td>
                  <td style="padding: 10px;">${s.value}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </main>
      `;
    } else {
      bodyHtml = `
        <main style="max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #03160E; margin-bottom: 20px;">Our Portfolio</h1>
          <p style="color: #666; font-size: 18px; margin-bottom: 40px;">Explore selected architectural and permaculture projects built with natural local materials and climate-responsive planning.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            ${INITIAL_PROJECTS.map(p => `
              <div style="background: #FFF; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; padding: 20px;">
                <h2 style="font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;"><a href="/projects/${p.id}" style="color: #03160E; text-decoration: none;">${p.title}</a></h2>
                <p style="color: #888; font-size: 12px;">${p.category} | ${p.location}</p>
                <p style="color: #555; line-height: 1.6;">${p.description}</p>
                <a href="/projects/${p.id}" style="color: #03160E; font-weight: bold; text-decoration: underline;">View Details</a>
              </div>
            `).join('')}
          </div>
        </main>
      `;
    }
  } else if (section === 'services') {
    if (idOrSlug && data.service) {
      const service = data.service;
      let valueProps = service.value_props || service.valueProps || [];
      if (typeof valueProps === 'string') {
        try { valueProps = JSON.parse(valueProps); } catch (e) {}
      }
      if (!Array.isArray(valueProps)) valueProps = [];

      let whatItIs = service.what_it_is || service.whatItIs || [];
      if (typeof whatItIs === 'string') {
        try { whatItIs = JSON.parse(whatItIs); } catch (e) {}
      }
      if (!Array.isArray(whatItIs)) whatItIs = [];

      let whoItsFor = service.who_its_for || service.whoItsFor || [];
      if (typeof whoItsFor === 'string') {
        try { whoItsFor = JSON.parse(whoItsFor); } catch (e) {}
      }
      if (!Array.isArray(whoItsFor)) whoItsFor = [];

      let processList = service.process || [];
      if (typeof processList === 'string') {
        try { processList = JSON.parse(processList); } catch (e) {}
      }
      if (!Array.isArray(processList)) processList = [];

      let faqList = service.faq || [];
      if (typeof faqList === 'string') {
        try { faqList = JSON.parse(faqList); } catch (e) {}
      }
      if (!Array.isArray(faqList)) faqList = [];

      bodyHtml = `
        <main style="max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; line-height: 1.8;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 40px; color: #03160E; margin-bottom: 20px;">${service.title}</h1>
          <p style="font-size: 18px; color: #555; margin-bottom: 40px;">${service.description}</p>
          
          <h2>Value Propositions & Design Principles</h2>
          <ul>
            ${valueProps.map((v: string) => `<li>${v}</li>`).join('')}
          </ul>

          <h2>What It Is</h2>
          ${whatItIs.map((w: string) => `<p>${w}</p>`).join('')}

          <h2>Who It's For</h2>
          <ul>
            ${whoItsFor.map((w: string) => `<li>${w}</li>`).join('')}
          </ul>

          <h2>Working Process & Milestones</h2>
          <ol>
            ${processList.map((p: any) => `
              <li>
                <strong>${p.title}:</strong> ${p.description}
              </li>
            `).join('')}
          </ol>

          ${service.pricing ? `<h2>Pricing</h2><p>${service.pricing}</p>` : ''}

          ${faqList.length > 0 ? `
            <h2>Frequently Asked Questions</h2>
            <dl>
              ${faqList.map((f: any) => `
                <dt style="font-weight: bold; margin-top: 20px;">${f.question}</dt>
                <dd>${f.answer}</dd>
              `).join('')}
            </dl>
          ` : ''}

          ${service.bookingLink ? `
            <div style="margin: 40px 0; text-align: center;">
              <a href="${service.bookingLink}" style="display: inline-block; padding: 15px 30px; background-color: #CCFF00; color: #03160E; font-weight: bold; border-radius: 30px; text-decoration: none; font-size: 18px;">Book a Consultation Session</a>
            </div>
          ` : ''}
        </main>
      `;
    } else {
      bodyHtml = `
        <main style="max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #03160E; margin-bottom: 20px;">Our Services</h1>
          <p style="color: #666; font-size: 18px; margin-bottom: 40px;">Professional design services bridging sustainable architecture, permaculture masterplanning, and experiential hospitality.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            ${SERVICES.map(s => `
              <div style="background: #FFF; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; padding: 20px;">
                <h2 style="font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;"><a href="/services/${s.id}" style="color: #03160E; text-decoration: none;">${s.title}</a></h2>
                <p style="color: #555; line-height: 1.6;">${s.description}</p>
                <a href="/services/${s.id}" style="color: #03160E; font-weight: bold; text-decoration: underline;">Explore Service</a>
              </div>
            `).join('')}
          </div>
        </main>
      `;
    }
  } else if (section === 'seo') {
    const seoPageTitle = idOrSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    bodyHtml = `
      <main style="max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; line-height: 1.8;">
        <h1 style="font-family: 'Playfair Display', serif; font-size: 40px; color: #03160E; margin-bottom: 20px;">${seoPageTitle}</h1>
        
        <h2>Sustainable & Ecological Architecture</h2>
        <p>Anvitam designs high-performing properties integrated with natural systems. By combining local construction craftsmanship, natural building materials (such as mud, lime, bamboo, stone, and reclaimed wood), and passive solar engineering, we construct spaces that are carbon-negative, climate-resilient, and deeply calming.</p>
        <p>Our ecological design strategies maximize site potential, conserve water through passive harvesting, restore topsoil biodiversity, and establish self-sustaining food production systems. Whether you are building an off-grid farm retreat, a high-revenue eco homestay, or a lush rooftop garden sanctuary, we deliver design masterplans that balance environment and aesthetics perfectly.</p>
        
        <div style="margin: 40px 0; text-align: center;">
          <a href="/contact" style="display: inline-block; padding: 15px 30px; background-color: #CCFF00; color: #03160E; font-weight: bold; border-radius: 30px; text-decoration: none; font-size: 18px;">Contact Ar. Archana Gavas</a>
        </div>
      </main>
    `;
  } else if (section === 'why') {
    bodyHtml = `
      <main style="max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; line-height: 1.8;">
        <h1 style="font-family: 'Playfair Display', serif; font-size: 40px; color: #03160E; margin-bottom: 20px;">Why Sustainable Design?</h1>
        <p style="font-size: 18px; color: #666; margin-bottom: 40px;">Conventional construction drives over 39% of global energy-related carbon emissions. Sustainable architecture is not a luxury—it is an absolute necessity for our planet and our health.</p>
        
        <h2>Passive Solar & Climate-Responsive Architecture</h2>
        <p>We analyze sun paths, seasonal winds, and microclimates to design structures that naturally maintain comfortable temperatures. By maximizing natural daylight and integrating passive cooling/heating techniques, we slash lifelong energy demands.</p>

        <h2>Healthy Buildings with Natural Materials</h2>
        <p>Traditional industrial buildings off-gas toxic volatile organic compounds (VOCs). We build exclusively with natural, non-toxic materials like earth, stone, timber, bamboo, and lime. These materials are breathable, regulate indoor humidity, prevent mold, and lock carbon inside the building fabric.</p>

        <h2>Closing Ecosystem Loops</h2>
        <p>A building should act like a tree—generating energy, harvesting water, and feeding the soil. We integrate graywater filtration, compost systems, rainwater collection, and food forestry into the immediate architectural environment, turning waste back into resource loops.</p>
      </main>
    `;
  } else if (section === 'about' || section === 'team') {
    bodyHtml = `
      <main style="max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; line-height: 1.8;">
        <h1 style="font-family: 'Playfair Display', serif; font-size: 40px; color: #03160E; margin-bottom: 20px;">About Anvitam</h1>
        <p style="font-size: 18px; color: #555; margin-bottom: 40px;">Anvitam is an architectural design and permaculture masterplanning studio based in Vadodara, Gujarat, collaborating on projects worldwide. We create habitats that are carbon-negative, biodiverse, and beautiful.</p>
        
        <h2>Our Principal Architect & Founder</h2>
        <p><strong>Ar. Archana Gavas</strong> is the Principal Architect and founder of Anvitam. She holds deep professional credentials in sustainable building techniques, agroforestry, and permaculture design. For the past 4 years, she has been leading masterplanning projects, farm stay setups, food forest layouts, and biophilic architectural projects globally, helping land owners turn raw soil into productive, high-performing ecological retreats.</p>

        <h2>Our Core Philosophy</h2>
        <p>We believe human design should enrich, rather than destroy, the natural environment. Our projects leverage ancient architectural wisdom tailored to modern realities, constructing spaces that are emotionally calming and physically restorative.</p>
      </main>
    `;
  } else if (section === 'contact') {
    bodyHtml = `
      <main style="max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; line-height: 1.8;">
        <h1 style="font-family: 'Playfair Display', serif; font-size: 40px; color: #03160E; margin-bottom: 20px;">Contact Us</h1>
        <p style="font-size: 18px; color: #555; margin-bottom: 40px;">Let's build something beautiful and sustainable together. Get in touch to discuss your project vision.</p>
        
        <div style="background-color: #03160E; color: #FAFAFA; border-radius: 8px; padding: 30px; margin-bottom: 40px;">
          <h2 style="font-family: 'Playfair Display', serif; color: #CCFF00; margin-top: 0;">Get In Touch</h2>
          <p><strong>Email:</strong> <a href="mailto:anvitamarchitect@gmail.com" style="color: #CCFF00;">anvitamarchitect@gmail.com</a></p>
          <p><strong>Location:</strong> Vadodara, Gujarat, India (consulting worldwide)</p>
          <p><strong>Booking / Priority Session:</strong> <a href="https://topmate.io/archanagavas" style="color: #CCFF00; text-decoration: underline;">Schedule a priority meeting on Topmate</a></p>
        </div>
      </main>
    `;
  } else if (section === 'shop') {
    bodyHtml = `
      <main style="max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif;">
        <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #03160E; margin-bottom: 20px;">Products & Online Courses</h1>
        <p style="color: #666; font-size: 18px; margin-bottom: 40px;">Masterclasses, design blueprints, and priority mentoring sessions designed to help you construct profitable, ecological retreat sanctuaries.</p>
        
        <h2>Available Courses & Resources</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-bottom: 40px;">
          <div style="background: #FFF; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; padding: 20px;">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0; color: #03160E;">Farm Retreat Design Masterclass</h3>
            <p style="color: #555; line-height: 1.6;">Learn details of site analysis, bioclimatic design, permaculture zoning, and how to create profitable eco-retreat experiences.</p>
            <p style="font-weight: bold; color: #03160E;">Price: ₹3,999</p>
            <a href="https://topmate.io/archanagavas" style="color: #CCFF00; background: #03160E; padding: 10px 20px; border-radius: 20px; text-decoration: none; display: inline-block; font-weight: bold;">Enroll Now</a>
          </div>
          <div style="background: #FFF; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; padding: 20px;">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0; color: #03160E;">Food Forest Design Blueprint</h3>
            <p style="color: #555; line-height: 1.6;">Design productive food forests and edible gardens for farm stays, community spaces, and personal properties using permaculture.</p>
            <p style="font-weight: bold; color: #03160E;">Price: ₹2,499</p>
            <a href="https://topmate.io/archanagavas" style="color: #CCFF00; background: #03160E; padding: 10px 20px; border-radius: 20px; text-decoration: none; display: inline-block; font-weight: bold;">Enroll Now</a>
          </div>
        </div>
      </main>
    `;
  } else if (section === 'process') {
    const phaseNames: Record<string, { title: string; desc: string }> = {
      'understand': {
        title: 'Phase 1: Understand',
        desc: 'Every project begins with understanding—listening to client visions, sensing the site, and learning from local microclimates.'
      },
      'design': {
        title: 'Phase 2: Design',
        desc: 'Ideas take shape, evolving into conceptual designs that balance aesthetics, functional ecology, and budget alignment.'
      },
      'deliver': {
        title: 'Phase 3: Deliver',
        desc: 'Guiding the build on-site, ensuring precision in documentation, contractor selection, and sustainable material execution.'
      }
    };
    const phaseInfo = phaseNames[idOrSlug] || {
      title: 'Our 3-Step Ecological Design Process',
      desc: 'Our iterative 3-step design workflow: Understand, Design, and Deliver.'
    };
    bodyHtml = `
      <main style="max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; line-height: 1.8;">
        <h1 style="font-family: 'Playfair Display', serif; font-size: 40px; color: #03160E; margin-bottom: 20px;">${phaseInfo.title}</h1>
        <p style="font-size: 18px; color: #555; margin-bottom: 40px;">${phaseInfo.desc}</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
          ${PROCESS_STEPS.map(p => `
            <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; background: #FFF;">
              <span style="font-size: 24px; font-weight: bold; color: #CCFF00; background: #03160E; width: 40px; height: 40px; display: inline-flex; justify-content: center; align-items: center; border-radius: 50%;">${p.number}</span>
              <h3 style="font-family: 'Playfair Display', serif; margin-top: 10px; color: #03160E;">${p.title}</h3>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">${p.description}</p>
            </div>
          `).join('')}
        </div>
      </main>
    `;
  } else if (section === 'workshops') {
    if (idOrSlug && data.workshop) {
      const workshop = data.workshop;
      const parseList = (str: any) => {
        if (!str) return [];
        if (Array.isArray(str)) return str;
        if (typeof str === 'string') {
          return str.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        }
        return [];
      };

      const skills = parseList(workshop.skills_outcomes || workshop.skillsOutcomes);
      const materials = parseList(workshop.materials_used || workshop.materialsUsed);
      const impact = parseList(workshop.impact);
      const outcomes = parseList(workshop.outcomes);
      let faqs = workshop.faqs || [];
      if (typeof faqs === 'string') {
        try { faqs = JSON.parse(faqs); } catch (e) {}
      }
      if (!Array.isArray(faqs) || faqs.length === 0) {
        faqs = [
          { question: `What is included in the ${workshop.title}?`, answer: `The workshop provides all reclaimed materials, non-toxic paints, child-safe tools, expert architectural guidance, and participation certificates.` },
          { question: `Where was this workshop conducted?`, answer: `Conducted for ${workshop.organization || 'our partner institution'} at ${workshop.location || 'campus premises'}.` },
          { question: `How can institutions book a similar workshop?`, answer: `Schools, universities, and corporate ESG teams can request a custom proposal via our website or by contacting ar.archanagavas@gmail.com.` }
        ];
      }

      bodyHtml = `
        <article style="max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; line-height: 1.8;">
          <header style="margin-bottom: 30px;">
            <span style="font-size: 14px; font-weight: 600; text-transform: uppercase; color: #CCFF00; background: #03160E; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 15px;">${workshop.category || 'Architectural Workshop'}</span>
            <h1 style="font-family: 'Playfair Display', serif; font-size: 38px; color: #03160E; margin: 0 0 15px 0; line-height: 1.2;">${workshop.title}</h1>
            <p style="font-size: 16px; color: #555; margin: 0;">
              <strong>Organization:</strong> ${workshop.organization || 'Anvitam'} | 
              <strong>Location:</strong> ${workshop.location || 'Gujarat, India'} | 
              <strong>Date:</strong> ${workshop.date || '2025'}
            </p>
          </header>

          ${(workshop.images && workshop.images[0]) ? `
            <div style="margin-bottom: 40px; border-radius: 12px; overflow: hidden; max-height: 480px;">
              <img src="${workshop.images[0]}" alt="${workshop.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          ` : ''}

          <section aria-label="Executive Summary" style="background: #03160E; color: #FAFAFA; padding: 25px; border-radius: 12px; margin-bottom: 40px;">
            <h2 style="font-family: 'Playfair Display', serif; color: #CCFF00; margin-top: 0; font-size: 22px;">Executive Overview</h2>
            <p style="color: #A3B8AF; font-size: 16px; margin: 0; line-height: 1.7;">${workshop.description || workshop.meta_description || 'Hands-on architectural and ecological workshop designed to foster biophilic design awareness, hands-on craft skills, and sustainable campus transformation.'}</p>
          </section>

          ${skills.length > 0 ? `
            <section style="margin-bottom: 35px;">
              <h2 style="font-family: 'Playfair Display', serif; font-size: 26px; color: #03160E; border-bottom: 2px solid #CCFF00; padding-bottom: 8px;">Skills & Learning Outcomes</h2>
              <ul style="padding-left: 20px;">
                ${skills.map((s: string) => `<li style="margin-bottom: 8px; font-size: 16px; color: #222;">${s}</li>`).join('')}
              </ul>
            </section>
          ` : ''}

          ${materials.length > 0 ? `
            <section style="margin-bottom: 35px;">
              <h2 style="font-family: 'Playfair Display', serif; font-size: 26px; color: #03160E; border-bottom: 2px solid #CCFF00; padding-bottom: 8px;">Materials Used & Sustainable Craft</h2>
              <ul style="padding-left: 20px;">
                ${materials.map((m: string) => `<li style="margin-bottom: 8px; font-size: 16px; color: #222;">${m}</li>`).join('')}
              </ul>
            </section>
          ` : ''}

          ${impact.length > 0 ? `
            <section style="margin-bottom: 35px;">
              <h2 style="font-family: 'Playfair Display', serif; font-size: 26px; color: #03160E; border-bottom: 2px solid #CCFF00; padding-bottom: 8px;">Environmental & Social Impact</h2>
              <ul style="padding-left: 20px;">
                ${impact.map((i: string) => `<li style="margin-bottom: 8px; font-size: 16px; color: #222;">${i}</li>`).join('')}
              </ul>
            </section>
          ` : ''}

          ${outcomes.length > 0 ? `
            <section style="margin-bottom: 35px;">
              <h2 style="font-family: 'Playfair Display', serif; font-size: 26px; color: #03160E; border-bottom: 2px solid #CCFF00; padding-bottom: 8px;">Workshop Deliverables & Tangible Outcomes</h2>
              <ul style="padding-left: 20px;">
                ${outcomes.map((o: string) => `<li style="margin-bottom: 8px; font-size: 16px; color: #222;">${o}</li>`).join('')}
              </ul>
            </section>
          ` : ''}

          <section aria-label="Frequently Asked Questions" style="margin-top: 40px; background: #FFF; padding: 30px; border-radius: 12px; border: 1px solid #E5E7EB;">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 26px; color: #03160E; margin-top: 0;">Frequently Asked Questions (FAQ)</h2>
            <dl>
              ${faqs.map((f: any) => `
                <dt style="font-weight: bold; font-size: 17px; color: #03160E; margin-top: 18px;">${f.question}</dt>
                <dd style="color: #4A5568; font-size: 15px; margin-left: 0; margin-top: 6px; line-height: 1.6;">${f.answer}</dd>
              `).join('')}
            </dl>
          </section>

          <div style="margin: 40px 0; text-align: center;">
            <a href="/contact" style="display: inline-block; padding: 15px 32px; background-color: #CCFF00; color: #03160E; font-weight: bold; border-radius: 30px; text-decoration: none; font-size: 18px;">Request Workshop Consultation</a>
          </div>
        </article>
      `;
    } else {
      bodyHtml = `
        <main style="max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #03160E; margin-bottom: 20px;">Ecological & Architectural Workshops</h1>
          <p style="color: #666; font-size: 18px; margin-bottom: 40px;">Hands-on educational workshops blending natural building, avian habitat craft, plastic upcycling, and campus masterplanning.</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            ${INITIAL_WORKSHOPS.map(w => `
              <div style="background: #FFF; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; padding: 20px;">
                <h2 style="font-family: 'Playfair Display', serif; font-size: 22px; margin-top: 0;"><a href="/workshops/${w.slug || w.id}" style="color: #03160E; text-decoration: none;">${w.title}</a></h2>
                <p style="color: #888; font-size: 12px;">${w.organization} | ${w.location}</p>
                <p style="color: #555; line-height: 1.6;">${w.description || 'Hands-on architectural and ecological workshop.'}</p>
                <a href="/workshops/${w.slug || w.id}" style="color: #03160E; font-weight: bold; text-decoration: underline;">View Workshop Details</a>
              </div>
            `).join('')}
          </div>
        </main>
      `;
    }
  } else if (section === 'seo') {
    const seoPageData: Record<string, { title: string; heading: string; body: string; faqs?: { question: string; answer: string }[] }> = {
      'farm-retreat-architecture': {
        title: 'Farm Retreat Architecture & Sustainable Eco-Resort Design',
        heading: 'Farm Retreat Architecture & Sustainable Eco-Resort Masterplanning',
        body: 'Anvitam specializes in designing regenerative farm retreats, eco-lodges, and rural stays. By combining bioclimatic design, natural building materials (earth, bamboo, lime), and permaculture water harvesting, we create low-carbon, high-occupancy hospitality experiences.',
        faqs: [
          { question: 'What is a farm retreat architecture project?', answer: 'It is a masterplanned hospitality or personal property combining agricultural food production, eco-lodging, and passive sustainable architecture.' },
          { question: 'How long does site masterplanning take?', answer: 'Site masterplanning typically takes 4 to 8 weeks including hydrological mapping and solar orientation analysis.' }
        ]
      },
      'weekend-villas': {
        title: 'Sustainable Weekend Villas & Biophilic Second Homes',
        heading: 'Sustainable Weekend Villas & Biophilic Off-Grid Escapes',
        body: 'We design passive, climate-responsive weekend villas crafted with local stone, rammed earth, and natural lime renders. Our villa designs require 60% less cooling energy while offering seamless indoor-outdoor living.',
        faqs: [
          { question: 'Can weekend villas be built completely off-grid?', answer: 'Yes! We integrate rooftop solar PV systems, rainwater harvesting cisterns, and natural reedbed greywater filtration.' }
        ]
      },
      'airbnb-homestay': {
        title: 'Airbnb & Homestay Design for Maximum Revenue & Guest Experience',
        heading: 'Architecture & Interior Design for High-Conversion Airbnb Stays',
        body: 'Generic vacation rentals struggle with low occupancy. We design unique, Instagrammable, biophilic Airbnb cottages and homestays that stand out on global booking platforms and command premium nightly rates.',
        faqs: [
          { question: 'How does design impact Airbnb occupancy?', answer: 'Architectural character, natural lighting, and unique local material choices create memorable guest reviews and higher search placement on booking engines.' }
        ]
      },
      'wellness-retreat': {
        title: 'Wellness Retreat Architecture & Meditation Sanctuaries',
        heading: 'Holistic Architecture for Yoga Shalas & Healing Sanctuaries',
        body: 'Designing quiet, non-toxic environments built with breathable natural plasters, acoustic timber, and passive ventilation to support deep healing and meditation practices.',
        faqs: [
          { question: 'Why are natural building materials crucial for wellness retreats?', answer: 'Natural plasters and unrefined earth emit zero Volatile Organic Compounds (VOCs), ensuring healthy indoor air quality.' }
        ]
      },
      'permaculture': {
        title: 'Permaculture Design & Syntropic Agroforestry Masterplanning',
        heading: 'Regenerative Permaculture Landscape & Soil Restoration',
        body: 'We design multi-layered food forests, swales, and water retention ponds to restore degraded soil and build self-sustaining agricultural landscapes.',
        faqs: [
          { question: 'What is included in a permaculture consultation?', answer: 'Topographical mapping, soil hydrology analysis, plant guild selection, and phased implementation roadmaps.' }
        ]
      },
      'terrace-garden': {
        title: 'Terrace Garden & Urban Rooftop Sanctuary Design',
        heading: 'Urban Rooftop Food Forests & Cool Roof Gardens',
        body: 'Converting concrete roof heat sinks into lush, lightweight edible gardens that insulate buildings and produce fresh organic food in urban settings.'
      },
      'yard-landscape': {
        title: 'Backyard & Ecological Landscape Design',
        heading: 'Ecological Backyard Landscapes & Chemical-Free Natural Pools',
        body: 'Designing chemical-free natural swimming ponds, native pollinator gardens, and outdoor living areas using local stone and permeable paving.'
      },
      'community-centre': {
        title: 'Community Centers & Civic Eco-Architecture',
        heading: 'Sustainable Civic & Community Architecture',
        body: 'Designing accessible, solar-powered community centers built with upcycled materials to foster civic engagement and ecological education.'
      }
    };

    const pData = seoPageData[idOrSlug] || {
      title: 'Sustainable Architecture & Ecological Design',
      heading: 'Specialized Sustainable Design Services by Anvitam',
      body: 'Anvitam provides end-to-end architecture, permaculture design, and natural building consulting across India, USA, and Australia.'
    };

    bodyHtml = `
      <article style="max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; line-height: 1.8;">
        <h1 style="font-family: 'Playfair Display', serif; font-size: 38px; color: #03160E; margin-bottom: 20px;">${pData.heading}</h1>
        <p style="font-size: 18px; color: #444; margin-bottom: 30px; line-height: 1.7;">${pData.body}</p>
        
        <div style="background: #03160E; color: #FAFAFA; padding: 30px; border-radius: 12px; margin: 40px 0;">
          <h2 style="font-family: 'Playfair Display', serif; color: #CCFF00; margin-top: 0;">Our Design Guarantees</h2>
          <ul style="color: #A3B8AF; font-size: 16px; padding-left: 20px;">
            <li style="margin-bottom: 10px;">Zero-VOC, non-toxic indoor air quality using breathable lime and clay renders</li>
            <li style="margin-bottom: 10px;">100% rainwater retention and passive microclimate cooling</li>
            <li style="margin-bottom: 10px;">Native plant guilds tailored to your site's specific hardiness zone</li>
          </ul>
        </div>

        ${pData.faqs && pData.faqs.length > 0 ? `
          <section aria-label="Frequently Asked Questions" style="margin-top: 40px; background: #FFF; padding: 30px; border-radius: 12px; border: 1px solid #E5E7EB;">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 26px; color: #03160E; margin-top: 0;">Frequently Asked Questions</h2>
            <dl>
              ${pData.faqs.map(f => `
                <dt style="font-weight: bold; font-size: 17px; color: #03160E; margin-top: 18px;">${f.question}</dt>
                <dd style="color: #4A5568; font-size: 15px; margin-left: 0; margin-top: 6px; line-height: 1.6;">${f.answer}</dd>
              `).join('')}
            </dl>
          </section>
        ` : ''}

        <div style="margin: 40px 0; text-align: center;">
          <a href="/contact" style="display: inline-block; padding: 15px 32px; background-color: #CCFF00; color: #03160E; font-weight: bold; border-radius: 30px; text-decoration: none; font-size: 18px;">Book a Design Discovery Call</a>
        </div>
      </article>
    `;
  } else {
    // Default Home Page
    bodyHtml = `
      <main style="max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif;">
        <div style="text-align: center; padding: 80px 20px; background-color: #03160E; color: #FAFAFA; border-radius: 8px; margin-bottom: 40px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #CCFF00; margin-bottom: 20px; line-height: 1.2;">Anvitam | Sustainable Architecture &amp; Ecological Design</h1>
          <p style="font-size: 18px; max-width: 700px; margin: 0 auto; line-height: 1.6; color: #A3B8AF;">Anvitam is a sustainable architecture and ecological design studio based in Vadodara, Gujarat. Led by Ar. Archana Gavas, we design zero-carbon farm retreats, wellness sanctuaries, and permaculture food forests globally to restore soil and water ecosystems.</p>
          <img src="https://images.unsplash.com/photo-1449844908441-8829872d2607?q=75&w=600&auto=format&fit=crop" alt="Sustainable Architecture and Farm Retreat Design" style="width: 100%; height: auto; max-height: 350px; object-fit: cover; border-radius: 4px; margin-top: 30px;" />
        </div>

        <section style="margin-bottom: 60px; display: flex; flex-direction: column; gap: 20px;">
          <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #03160E; border-bottom: 2px solid #CCFF00; padding-bottom: 10px; margin-bottom: 10px;">Our Principal Architect</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start;">
            <img src="https://www.anvitam.com/favicon.png" alt="Ar. Archana Gavas - Principal Architect & Founder" style="width: 120px; height: 120px; border-radius: 8px; object-fit: cover;" />
            <div style="flex: 1; min-width: 250px;">
              <p style="font-size: 16px; line-height: 1.8; margin-top: 0;"><strong>Ar. Archana Gavas</strong> is the Principal Architect and Permaculture Masterplanner behind Anvitam. Specializing in carbon-negative building craft, agroforestry, and water-resilient landscaping, she helps hospitality brands, homeowners, and private farms design beautiful, self-sustaining properties.</p>
            </div>
          </div>
          <blockquote style="border-left: 4px solid #CCFF00; padding-left: 20px; margin: 20px 0; font-style: italic; color: #555;">
            "Human habitats should act like trees—generating energy, purifying water, and nourishing the soil. True design excellence does not build on the land, it builds with the land, ensuring that every project enhances local ecosystems for generations to come."
            <cite style="display: block; margin-top: 10px; font-weight: bold; font-style: normal; color: #03160E;">— Ar. Archana Gavas, Principal Architect (published in Anvitam Ecological Journal, 2025)</cite>
          </blockquote>
        </section>

        <section style="margin-bottom: 60px;">
          <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #03160E; border-bottom: 2px solid #CCFF00; padding-bottom: 10px;">Ecological Design Impact</h2>
          <p style="color: #666; font-size: 15px; margin-bottom: 20px;">A comparative overview of how Anvitam's ecological design principles compare with standard/conventional builds:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; text-align: left;">
            <thead>
              <tr style="background-color: #03160E; color: #CCFF00;">
                <th style="padding: 12px; border: 1px solid #E5E7EB;">Design Metric</th>
                <th style="padding: 12px; border: 1px solid #E5E7EB;">Conventional Building</th>
                <th style="padding: 12px; border: 1px solid #E5E7EB;">Anvitam Ecological Design</th>
                <th style="padding: 12px; border: 1px solid #E5E7EB;">Net Environmental Benefit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px; border: 1px solid #E5E7EB; font-weight: bold;">Carbon Footprint</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; color: #C53030;">High (+39% global emissions)</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; color: #2F855A; font-weight: bold;">Negative (Carbon-sequestering earth/bamboo)</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; font-weight: bold; color: #2F855A;">100% Net Reduction</td>
              </tr>
              <tr style="background-color: #F9FAFB;">
                <td style="padding: 12px; border: 1px solid #E5E7EB; font-weight: bold;">Water Self-Sufficiency</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; color: #C53030;">0% (Relies on municipal/groundwater depletion)</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; color: #2F855A; font-weight: bold;">100% (Rainwater harvesting & greywater reuse)</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; font-weight: bold; color: #2F855A;">Zero external water dependency</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #E5E7EB; font-weight: bold;">Indoor Microclimate</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; color: #C53030;">Unregulated (Requires mechanical AC/heating)</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; color: #2F855A; font-weight: bold;">Self-regulating (Thermal mass earth walls)</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; font-weight: bold; color: #2F855A;">60% reduction in mechanical loads</td>
              </tr>
              <tr style="background-color: #F9FAFB;">
                <td style="padding: 12px; border: 1px solid #E5E7EB; font-weight: bold;">Ecosystem Biodiversity</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; color: #C53030;">Negative (Soil compaction & concrete cover)</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; color: #2F855A; font-weight: bold;">Positive (Syntropic agroforestry & food forests)</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; font-weight: bold; color: #2F855A;">Restores native flora/fauna habitats</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style="margin-bottom: 60px;">
          <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #03160E; border-bottom: 2px solid #CCFF00; padding-bottom: 10px;">Our Ecological Services</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
            ${(data.allServices && data.allServices.length > 0 ? data.allServices : SERVICES).map((s: any) => `
              <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; background: #FFF;">
                <img src="${s.heroImage || s.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=75&w=400&auto=format&fit=crop'}" alt="${s.title}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 4px; margin-bottom: 15px;" />
                <h3 style="font-family: 'Playfair Display', serif; margin-top: 0; color: #03160E;">${s.title}</h3>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">${s.description}</p>
                <a href="/services/${s.id}" style="color: #03160E; font-weight: bold; text-decoration: underline;">Learn More</a>
              </div>
            `).join('')}
          </div>
        </section>

        <section style="margin-bottom: 60px;">
          <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #03160E; border-bottom: 2px solid #CCFF00; padding-bottom: 10px;">Selected Projects</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
            ${(data.allProjects && data.allProjects.length > 0 ? data.allProjects : INITIAL_PROJECTS).map((p: any) => `
              <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; background: #FFF;">
                <img src="${p.heroImage || p.image || 'https://www.anvitam.com/favicon.png'}" alt="${p.title}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 4px; margin-bottom: 15px;" />
                <h3 style="font-family: 'Playfair Display', serif; margin-top: 0; color: #03160E;">${p.title}</h3>
                <p style="font-size: 12px; color: #888;">${p.category} | ${p.location}</p>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">${p.description}</p>
                <a href="/projects/${p.id}" style="color: #03160E; font-weight: bold; text-decoration: underline;">View Project</a>
              </div>
            `).join('')}
          </div>
        </section>

        <section style="margin-bottom: 60px;">
          <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #03160E; border-bottom: 2px solid #CCFF00; padding-bottom: 10px;">Our Process</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
            ${PROCESS_STEPS.map(p => `
              <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; background: #FFF;">
                <span style="font-size: 24px; font-weight: bold; color: #CCFF00; background: #03160E; width: 40px; height: 40px; display: inline-flex; justify-content: center; align-items: center; border-radius: 50%;">${p.number}</span>
                <h3 style="font-family: 'Playfair Display', serif; margin-top: 10px; color: #03160E;">${p.title}</h3>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">${p.description}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <section style="margin-bottom: 60px; background: #03160E; color: #FAFAFA; padding: 40px 30px; border-radius: 8px;">
          <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #CCFF00; border-bottom: 2px solid #CCFF00; padding-bottom: 10px; margin-top: 0;">Frequently Asked Questions</h2>
          
          <h3 style="font-size: 18px; color: #CCFF00; margin-top: 20px;">How long does a farm retreat architecture project take?</h3>
          <p style="color: #A3B8AF; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Typically 6–18 months depending on scale, site conditions, and permitting. We give you a full timeline after the initial site audit.</p>
          
          <h3 style="font-size: 18px; color: #CCFF00; margin-top: 20px;">Do you provide weekend villa architect services in Australia?</h3>
          <p style="color: #A3B8AF; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Yes. We have dedicated teams across major Australian states including NSW, VIC, and QLD delivering weekend villa design and farm stay architecture.</p>
          
          <h3 style="font-size: 18px; color: #CCFF00; margin-top: 20px;">What is permaculture site planning?</h3>
          <p style="color: #A3B8AF; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">It is a design methodology that works with natural systems to create self-sustaining, productive landscapes. We integrate it into every eco retreat design project.</p>
          
          <h3 style="font-size: 18px; color: #CCFF00; margin-top: 20px;">Can I get Airbnb homestay design services remotely?</h3>
          <p style="color: #A3B8AF; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Absolutely. We offer full digital discovery, remote design consultations, and partnered local build management across the USA and Australia.</p>
          
          <h3 style="font-size: 18px; color: #CCFF00; margin-top: 20px;">Do you handle food forest design?</h3>
          <p style="color: #A3B8AF; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Yes — edible garden design services and food forest design are core to our offering and can be added to any retreat or villa landscape project.</p>
        </section>
      </main>
    `;
  }

  return `
    <div style="background-color: #EFEFEB; min-height: 100vh; font-family: 'Inter', sans-serif;">
      ${headerHtml}
      <div style="padding-bottom: 60px;">
        ${bodyHtml}
      </div>
      ${footerHtml}
    </div>
  `;
}

// --- Express/Vercel Handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url?.includes('debug-seo-headers') || 
      (req.headers['x-matched-path'] as string)?.includes('debug-seo-headers') ||
      (req.headers['x-forwarded-uri'] as string)?.includes('debug-seo-headers')) {
    return res.status(200).json({
      url: req.url,
      headers: req.headers,
      method: req.method,
      query: req.query
    });
  }

  // Robust path resolution: req.query.path is set by vercel.json rewrite (?path=/$1)
  // x-forwarded-uri is the INTERNAL rewrite URI (e.g. /api/ssr-seo?path=...) — do NOT use it as fallback path
  // x-vercel-deployment-url or req.url may contain internal paths too — always prefer query.path
  let requestPath: string;
  if (req.query.path) {
    requestPath = req.query.path as string;
  } else {
    // Last resort: parse req.url and extract ?path= param
    try {
      const parsedUrl = new URL(req.url || '', 'https://www.anvitam.com');
      const queryPath = parsedUrl.searchParams.get('path');
      requestPath = queryPath || parsedUrl.pathname || '/';
    } catch (e) {
      requestPath = '/';
    }
  }

  // Strip query string and leading slash for clean path segments
  const cleanPath = requestPath.split('?')[0];
  const pathSegments = cleanPath.split('/').filter(Boolean);

  const section = pathSegments[0] || '';
  const idOrSlug = pathSegments[1] || '';

  // Build canonical URL from the clean, user-facing path (not the internal /api/ssr-seo path)
  const canonicalPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;

  let title = 'Anvitam | Sustainable Architecture & Ecological Design';
  let desc = 'Anvitam designs high-performing farm retreats, eco-resorts, airbnbs, homestays, and wellness centers using permaculture and sustainable landscape design.';
  let imageUrl = 'https://www.anvitam.com/favicon.png';
  let canonicalUrl = `https://www.anvitam.com${canonicalPath}`;
  let keywords = 'architecture, sustainable architecture, permaculture design, eco retreats, farm stays, biophilic design, green building, Vadodara, Gujarat';
  let robots = 'index, follow';

  let blog: any = null;
  let project: any = null;
  let service: any = null;
  let workshop: any = null;
  let allProjects: any[] | undefined;
  let allServices: any[] | undefined;

  if (isDbConfigured && (!section || section === 'projects' || section === 'services')) {
    try {
      allProjects = await getCollection('projects', 'desc');
      allServices = await getCollection('services', 'asc');
    } catch (e) {}
  }

  // Fetch data depending on the section
  if (section === 'blog' && idOrSlug) {
    if (isDbConfigured) {
      try {
        let row = await getDoc('blogs', idOrSlug);
        if (!row) {
          const bySlug = await findWhere('blogs', 'slug', idOrSlug);
          row = bySlug[0] || null;
        }
        if (row) blog = row;
      } catch (e) {
        console.error('Error fetching blog SEO data from Firestore:', e);
      }
    }
    if (!blog) {
      blog = INITIAL_BLOGS.find(b => 
        b.slug === idOrSlug || 
        b.id === idOrSlug || 
        (b.slug && (idOrSlug.includes(b.slug) || b.slug.includes(idOrSlug))) || 
        idOrSlug.includes(b.id)
      );
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
    } else {
      // Blog not found in DB — serve generic indexable metadata so Google can crawl the client-rendered page
      console.warn(`[ssr-seo] Blog not found in DB for id/slug: ${idOrSlug} — serving generic metadata`);
      title = `Blog | Anvitam Sustainable Architecture`;
      desc = 'Read articles and insights on sustainable architecture, permaculture, eco-design, and biophilic living by Anvitam.';
      canonicalUrl = 'https://www.anvitam.com/blog';
    }
  } else if (section === 'projects' && idOrSlug) {
    if (isDbConfigured) {
      try {
        let row = await getDoc('projects', idOrSlug);
        if (!row) {
          const bySlug = await findWhere('projects', 'slug', idOrSlug);
          row = bySlug[0] || null;
        }
        if (row) project = row;
      } catch (e) {
        console.error('Error fetching project SEO data from Firestore:', e);
      }
    }
    if (!project) {
      project = INITIAL_PROJECTS.find(p => 
        p.slug === idOrSlug || 
        p.id === idOrSlug || 
        (p.slug && (idOrSlug.includes(p.slug) || p.slug.includes(idOrSlug))) || 
        idOrSlug.includes(p.id) || 
        p.id.includes(idOrSlug)
      );
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
    } else {
      // Project not found in DB — serve generic indexable metadata so Google can crawl the client-rendered page
      console.warn(`[ssr-seo] Project not found in DB for id/slug: ${idOrSlug} — serving generic metadata`);
      title = `Project | Anvitam Sustainable Architecture`;
      desc = 'Explore sustainable architecture projects by Anvitam — farm retreats, eco-resorts, permaculture landscapes, and biophilic homes.';
      canonicalUrl = 'https://www.anvitam.com/projects';
    }
  } else if (section === 'services' && idOrSlug) {
    if (isDbConfigured) {
      try {
        const row = await getDoc('services', idOrSlug);
        if (row) service = row;
      } catch (e) {
        console.error('Error fetching service SEO data from Firestore:', e);
      }
    }
    if (!service) {
      const serviceAliases: Record<string, string> = {
        'permaculture': 'permaculture-design',
        'permaculture-design': 'permaculture-design',
        'farm-retreat': 'farm-retreat',
        'farm-retreats': 'farm-retreat',
        'resort-design': 'eco-resort',
        'eco-resort': 'eco-resort',
        'natural-building': 'farm-retreat',
        'agroforestry': 'food-forest',
        'food-forest': 'food-forest',
        'airbnb': 'airbnb',
        'airbnb-design': 'airbnb',
        'homestay': 'homestay',
        'homestay-design': 'homestay',
        'community-center': 'community-center',
        'terrace-garden': 'terrace-garden',
        'backyard-design': 'backyard-design',
        'weekend-villa': 'weekend-villa'
      };
      const mappedId = serviceAliases[idOrSlug] || idOrSlug;
      service = SERVICES.find(s => 
        s.id === mappedId || 
        s.id === idOrSlug || 
        s.id.replace(/-design$/, '') === idOrSlug || 
        idOrSlug.includes(s.id) || 
        s.id.includes(idOrSlug)
      );
    }

    if (service) {
      title = service.meta_title || service.metaTitle || `${service.title} | Services | Anvitam`;
      desc = service.meta_description || service.metaDescription || service.description || desc;
      imageUrl = service.hero_image || service.heroImage || imageUrl;
      canonicalUrl = `https://www.anvitam.com/services/${service.id}`;
      let props = service.value_props || service.valueProps;
      if (typeof props === 'string') {
        try { props = JSON.parse(props); } catch (e) {}
      }
      keywords = service.meta_keywords || service.metaKeywords || [service.title, 'sustainable architecture', 'eco design', 'permaculture', ...(Array.isArray(props) ? props : [])].join(', ');
      robots = service.meta_robots || service.metaRobots || robots;
    } else {
      // Service not found in DB — serve generic indexable metadata so Google can crawl the client-rendered page
      console.warn(`[ssr-seo] Service not found in DB for id/slug: ${idOrSlug} — serving generic metadata`);
      title = `Service | Anvitam Sustainable Architecture`;
      desc = 'Explore sustainable design services by Anvitam — permaculture, farm retreats, eco-resorts, biophilic architecture, and more.';
      canonicalUrl = 'https://www.anvitam.com/services';
    }
  } else if (section === 'workshops') {
    if (idOrSlug) {
      if (isDbConfigured) {
        try {
          let row = await getDoc('workshops', idOrSlug);
          if (!row) {
            const bySlug = await findWhere('workshops', 'slug', idOrSlug);
            row = bySlug[0] || null;
          }
          if (row) workshop = row;
        } catch (e) {
          console.error('Error fetching workshop SEO data from Firestore:', e);
        }
      }
      if (!workshop) {
        workshop = INITIAL_WORKSHOPS.find(w => 
          w.slug === idOrSlug || 
          w.id === idOrSlug || 
          (w.slug && (idOrSlug.includes(w.slug) || w.slug.includes(idOrSlug))) || 
          idOrSlug.includes(w.id) ||
          (idOrSlug.includes('bird-house-architecture-campus-space-makeover') && w.id === 'w-1') ||
          (idOrSlug.includes('bird-house') && idOrSlug.includes('anant') && w.id === 'w-2') ||
          (idOrSlug.includes('plastic-waste') && w.id === 'w-3')
        );
      }

      if (workshop) {
        title = workshop.meta_title || workshop.metaTitle || `${workshop.title} | Nest N Nurture Workshops by Anvitam`;
        desc = workshop.meta_description || workshop.metaDescription || workshop.description || desc;
        imageUrl = (workshop.images && workshop.images[0]) || 'https://www.anvitam.com/workshops/birds%20house%20making.png';
        canonicalUrl = `https://www.anvitam.com/workshops/${workshop.slug || workshop.id}`;
        keywords = workshop.primary_keyword || workshop.primaryKeyword || `${workshop.title}, architecture workshop, bird house making, sustainable design, Nadiad, Gujarat`;
        robots = workshop.meta_robots || workshop.metaRobots || robots;
      } else {
        console.warn(`[ssr-seo] Workshop not found in DB for id/slug: ${idOrSlug} — serving generic metadata`);
        title = `Workshop | Anvitam Sustainable Architecture`;
        desc = 'Hands-on architectural, ecological, and sustainable craft workshops by Anvitam.';
        canonicalUrl = 'https://www.anvitam.com/workshops';
      }
    } else {
      title = 'Ecological & Architectural Workshops | Anvitam';
      desc = 'Explore our hands-on workshops on bird house making, natural building, and sustainable campus space makeovers.';
      canonicalUrl = 'https://www.anvitam.com/workshops';
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
      'process': {
        title: 'Our 3-Step Process | Anvitam Sustainable Architecture',
        desc: 'Discover our 3-step design workflow: Understand, Design, and Deliver. Tailored site analysis, masterplanning, and on-site supervision.'
      },
      'privacy': {
        title: 'Privacy Policy | Anvitam',
        desc: 'Read the Privacy Policy for Anvitam.com.'
      },
      'terms': {
        title: 'Terms of Service | Anvitam',
        desc: 'Read the Terms of Service for Anvitam.com.'
      },
      'team': {
        title: 'Our Team | Anvitam Sustainable Architecture',
        desc: 'Meet Ar. Archana Gavas, Principal Architect and Founder of Anvitam, specializing in sustainable resort architecture, eco retreat design, and permaculture landscape design.'
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
  template = template.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  const replaceOrInjectMeta = (htmlStr: string, keyAttr: string, keyVal: string, value: string) => {
    const regex = new RegExp(`<meta[^>]*${keyAttr}="${keyVal}"[^>]*>`, 'i');
    const newTag = `<meta ${keyAttr}="${keyVal}" content="${value.replace(/"/g, '&quot;')}" />`;
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

  // Inject keywords and robots metas
  template = replaceOrInjectMeta(template, 'name', 'keywords', keywords);
  template = replaceOrInjectMeta(template, 'name', 'robots', robots);
  // X-Robots-Tag is set as an HTTP response header (line below), NOT as a meta tag
  // Having both creates duplicate/stacked values in SEO tools
  template = template.replace(/<meta[^>]*name="X-Robots-Tag"[^>]*>/gi, '');

  // Clean all duplicate/existing canonical and publisher links from template to prevent duplicates
  template = template.replace(/<link[^>]*rel="canonical"[^>]*>/gi, '');
  template = template.replace(/<link[^>]*rel="publisher"[^>]*>/gi, '');

  // Inject the single canonical link
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
  template = template.replace('</head>', `  ${canonicalTag}\n</head>`);

  // --- Inject JSON-LD Schema Marks ---
  const schemas = generateSchemas(section, idOrSlug, { blog, project, service, workshop });
  let schemaTags = '';
  for (const schema of schemas) {
    if (schema) {
      schemaTags += `\n  <script type="application/ld+json">\n  ${JSON.stringify(schema, null, 2)}\n  </script>`;
    }
  }
  if (schemaTags) {
    template = template.replace('</head>', `${schemaTags}\n</head>`);
  }

  // --- Inject Semantic Pre-Rendered HTML inside <div id="root"> ---
  const ssrHtml = generateSsrHtml(section, idOrSlug, { blog, project, service, workshop, allProjects, allServices });
  template = template.replace(
    /<div id="root">(?:[\s\S]*?<\/noscript>\s*)?<\/div>/i,
    `<div id="root">${ssrHtml}</div>`
  );

  // Disable shared CDN cache to prevent cross-URL cache poisoning (each path must be served independently)
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=0, must-revalidate');
  res.setHeader('Vary', 'Accept-Encoding');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', robots);
  return res.status(200).send(template);
}
