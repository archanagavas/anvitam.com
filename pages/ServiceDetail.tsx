import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { Project } from '../types';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, PenTool, Wrench, Sprout, Check, HelpCircle } from 'lucide-react';
import TestimonialCarousel from '../components/TestimonialCarousel';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { services, projects } = useContent();
  const service = services.find(s => s.id === id);
  // Find all projects to showcase
  const primaryProject = projects.find(p => p.id === service?.caseStudyId);
  const selectedProjectIds = service?.caseStudyIds || [];
  
  const showcaseProjectsMap = new Map<string, Project>();
  if (primaryProject) {
    showcaseProjectsMap.set(primaryProject.id, primaryProject);
  }
  selectedProjectIds.forEach(id => {
    const p = projects.find(proj => proj.id === id);
    if (p) {
      showcaseProjectsMap.set(p.id, p);
    }
  });
  const showcaseProjects = Array.from(showcaseProjectsMap.values());

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setOpenFaq(null);
  }, [id]);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#111] font-sans">
        <p className="text-xl mb-6">Service not found.</p>
        <Link to="/services" className="text-sm font-semibold uppercase tracking-wider underline">Back to Services</Link>
      </div>
    );
  }

  const ctaButton = (
    <a 
      href={service.bookingLink || 'https://topmate.io/archanagavas/1799075'} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="inline-flex items-center bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-xs font-bold transition-colors hover:bg-[#bce600]"
    >
      Book a Design Consultation <ArrowRight className="ml-2 w-4 h-4" />
    </a>
  );

  const processIcons = [ClipboardList, PenTool, Wrench, Sprout];

  // FAQ Schema JSON-LD (AEO/SEO/GEO Engine)
  const faqSchema = service.faq && service.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": service.faq.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;



  // Combine custom service gallery + related case study galleries
  const allRelatedGalleries = showcaseProjects.flatMap(p => p.gallery || []);
  const rawGallery = [
    ...(service.gallery || []),
    ...allRelatedGalleries
  ];

  const seenUrls = new Set<string>();
  const galleryImages: { url: string; caption: string }[] = [];
  
  // Exclude primary heroImage if already present, but start with hero
  if (service.heroImage) {
    seenUrls.add(service.heroImage);
    galleryImages.push({ url: service.heroImage, caption: service.title });
  }
  
  rawGallery.forEach(img => {
    if (img && img.url && !seenUrls.has(img.url)) {
      seenUrls.add(img.url);
      galleryImages.push(img);
    }
  });

  return (
    <div className="bg-white text-[#111] min-h-screen font-sans selection:bg-[#CCFF00]">
      <Helmet>
        <title>{service.title} | Anvitam Sustainable Architecture Services</title>
        <meta name="description" content={service.description} />
        <meta name="keywords" content={[service.title, 'sustainable architecture', 'eco design', 'permaculture', ...(service.valueProps || [])].join(', ')} />
        <meta property="og:title" content={`${service.title} | Anvitam`} />
        <meta property="og:description" content={service.description} />
        <meta property="og:image" content={service.heroImage || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200'} />
        <meta property="og:type" content="website" />
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>


      
      {/* 1. Hero Section */}
      <div className="pt-36 pb-12 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center space-x-2">
          <Link to="/services" className="hover:text-[#111] flex items-center transition-colors">
            <ArrowLeft className="w-3 h-3 mr-1" /> All Services
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-[#111]">{service.title}</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#111] mb-6 tracking-tight">
          {service.title}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed font-light">
          {service.description}
        </p>
        <div className="mb-4">
          {ctaButton}
        </div>
      </div>

      {/* 2. Service Detailed Image Banner — object-contain so portrait & landscape show fully */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shadow-md">
          <img 
            src={service.heroImage || "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000"} 
            alt={service.title} 
            className="w-full object-contain block"
            style={{ maxHeight: '70vh', background: '#f9f9f9' }}
          />
        </div>
      </div>

      {/* 2b. Gallery Grid */}
      {galleryImages.length > 1 && (
        <div className="max-w-5xl mx-auto px-6 mb-20">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs font-mono text-gray-400 font-bold">{galleryImages.length} images</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl bg-gray-50 border border-gray-100"
              >
                <img
                  src={img.url}
                  alt={img.caption || `Gallery image ${i + 1}`}
                  className="w-full object-contain block"
                  style={{ maxHeight: '220px', background: '#f9f9f9' }}
                />
                {img.caption && (
                  <div className="px-2 py-1.5 border-t border-gray-100 bg-white">
                    <p className="text-[10px] text-gray-400 font-light line-clamp-1">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2c. Service Videos (YouTube / Instagram embeds) */}
      {service.videos && service.videos.length > 0 && (() => {
        const getEmbedUrl = (url: string): { embedUrl: string; type: 'youtube' | 'instagram' } | null => {
          const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`, type: 'youtube' };
          const igMatch = url.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
          if (igMatch) return { embedUrl: `https://www.instagram.com/${igMatch[1]}/${igMatch[2]}/embed/`, type: 'instagram' };
          return null;
        };
        return (
          <div className="max-w-5xl mx-auto px-6 mb-20">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg">🎬</span>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Service Videos</h3>
              <span className="text-xs text-gray-400 ml-auto">{service.videos!.length} video{service.videos!.length > 1 ? 's' : ''}</span>
            </div>
            <div className={`grid gap-6 ${service.videos!.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {service.videos!.map((vid, i) => {
                const embed = getEmbedUrl(vid.url);
                if (!embed) return null;
                const isIG = embed.type === 'instagram';
                return (
                  <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-100">
                      {embed.type === 'youtube'
                        ? <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">▶ YouTube</span>
                        : <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider flex items-center gap-1">📷 Instagram</span>
                      }
                      {vid.caption && <span className="text-xs text-gray-500 ml-2 truncate">{vid.caption}</span>}
                    </div>
                    <iframe
                      src={embed.embedUrl}
                      className={`w-full border-0 ${isIG ? 'h-[600px]' : 'aspect-video'}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      title={vid.caption || `Service video ${i + 1}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* 3. Detailed Service Details and Target Audience */}
      <div className="max-w-4xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-150 pt-10">
          {/* Left: What is it, pricing, who its for */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Service Pricing Guide</h3>
              <p className="text-lg font-bold text-gray-800">{service.pricing || 'Custom Quote / Retainer'}</p>
            </div>

            {service.whoItsFor && service.whoItsFor.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Who It's For</h3>
                <ul className="space-y-2.5">
                  {service.whoItsFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600 font-light">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Key Deliverables */}
          {service.valueProps && service.valueProps.length > 0 && (
            <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Included Deliverables</h3>
              <ul className="space-y-3">
                {service.valueProps.map((prop, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                    <Check size={14} className="text-gray-800 shrink-0 mt-1" />
                    <span>{prop}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 4. Timeline / Step-by-Step implementation process */}
      {service.process && service.process.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 mb-24">
          <h3 className="text-xl md:text-2xl font-bold text-[#111] mb-2 tracking-tight">How We Work</h3>
          <p className="text-gray-500 mb-10 text-sm md:text-base max-w-2xl leading-relaxed">
            Our structured step-by-step process ensures a seamless journey from concept design to on-site execution.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.process.map((step, i) => {
              const IconComponent = processIcons[i % processIcons.length];
              return (
                <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-xs transition-shadow">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 mb-5">
                    <IconComponent className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h4 className="font-bold text-[#111] text-lg mb-2 tracking-tight">{step.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Detailed paragraphs (What it is / concept details) */}
      {service.whatItIs && service.whatItIs.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 mb-24">
          <h3 className="text-xl md:text-2xl font-bold text-[#111] mb-6 tracking-tight">Service Overview & Philosophy</h3>
          <div className="space-y-6 text-gray-600 leading-relaxed font-light text-sm md:text-base max-w-3xl">
            {service.whatItIs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* 6. FAQ Accordion for Service page (AEO/SEO/GEO Engine) */}
      {service.faq && service.faq.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 mb-24">
          <h3 className="text-xl md:text-2xl font-bold text-[#111] mb-3 tracking-tight flex items-center gap-2">
            <HelpCircle className="text-gray-400" size={20} /> Service FAQs
          </h3>
          <p className="text-xs text-gray-500 mb-8">
            Common questions about this architecture and permaculture service.
          </p>
          <div className="border-t border-gray-150 divide-y divide-gray-150">
            {service.faq.map((item, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center text-left py-2 focus:outline-none"
                >
                  <span className="font-semibold text-sm md:text-base text-gray-800 pr-8">{item.question}</span>
                  <span className="text-lg text-gray-400 font-mono select-none">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <p className="pt-2 pb-4 text-xs md:text-sm text-gray-500 leading-relaxed font-light pr-4">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Associated Related Project Showcase */}
      {showcaseProjects.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 mb-20">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 border-t border-gray-100 pt-8">
            {showcaseProjects.length === 1 ? 'Featured Case Study' : 'Featured Case Studies'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showcaseProjects.map(proj => (
              <Link 
                key={proj.id}
                to={`/projects/${proj.slug || proj.id}`} 
                className="flex items-center space-x-5 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition group bg-white shadow-xs"
              >
                <img 
                  src={proj.image} 
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0" 
                  alt={proj.title} 
                />
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Project Showcase</span>
                  <h4 className="font-bold text-[#111] text-sm md:text-base group-hover:text-gray-650 transition-colors">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-gray-450 mt-1">
                    {proj.category} • {proj.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 7.5. Testimonial Carousel */}
      <div className="max-w-4xl mx-auto px-6 mt-12 mb-12">
        <h3 className="text-xl md:text-2xl font-bold text-[#111] mb-6 tracking-tight text-center">What Our Clients Say</h3>
        <TestimonialCarousel />
      </div>

      {/* 8. Pre-Footer CTA */}
      <div className="bg-[#0a0a0a] text-white pt-20 pb-20 px-6 rounded-t-3xl md:rounded-t-[3rem] mt-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-medium max-w-lg leading-tight mb-8 md:mb-0 tracking-tight text-[#f9f9f9]">
            Ready to Transform Your Space With Anvitam?
          </h2>
          <div className="flex-shrink-0">
            {ctaButton}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ServiceDetail;