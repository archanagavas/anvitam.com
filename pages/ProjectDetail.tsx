import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects } = useContent();
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveSlide(0);
    setOpenFaq(null);
  }, [id]);

  // Find project by slug or ID
  const projectIndex = projects.findIndex(p => p.id === id || p.slug === id);
  const project = projects[projectIndex];

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#111] font-sans">
        <p className="text-xl mb-6">Project not found.</p>
        <Link to="/projects" className="text-sm font-semibold uppercase tracking-wider underline">Back to Projects</Link>
      </div>
    );
  }

  const prevProject = projectIndex > 0 ? projects[projectIndex - 1] : projects[projects.length - 1];
  const nextProject = projectIndex < projects.length - 1 ? projects[projectIndex + 1] : projects[0];

  const ctaButton = (
    <a 
      href="https://topmate.io/archanagavas/1799075" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="inline-flex items-center bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-xs font-bold transition-colors hover:bg-[#bce600]"
    >
      Talk to our project expert <ArrowRight className="ml-2 w-4 h-4" />
    </a>
  );

  // Gallery items helper
  const galleryItems = project.gallery && project.gallery.length > 0 ? project.gallery : [
    { url: project.image || 'https://images.unsplash.com/photo-1540544660406-6a69dacb2804?q=80&w=1200', caption: 'Project Cover Image' }
  ];

  const specsList = project.specs && project.specs.length > 0 ? project.specs : [
    { label: 'Location', value: project.location },
    { label: 'Year', value: project.year },
    { label: 'Category', value: project.category }
  ];

  const displaySpecs = [
    ...(project.status ? [{ label: 'Status', value: project.status === 'ongoing' ? 'Ongoing' : 'Delivered' }] : []),
    ...specsList
  ];

  // FAQ Schema JSON-LD (AEO/SEO/GEO Engine)
  const faqSchema = project.faqs && project.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": project.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <div className="bg-white text-[#111] min-h-screen font-sans selection:bg-[#CCFF00]">
      <Helmet>
        <title>{project.title} | Anvitam Sustainable Architecture</title>
        <meta name="description" content={project.description} />
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>
      
      {/* 1. Hero Section */}
      <div className="pt-36 pb-12 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center space-x-2">
          <Link to="/projects" className="hover:text-[#111] flex items-center transition-colors">
            <ArrowLeft className="w-3 h-3 mr-1" /> All Projects
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-[#111]">{project.title}</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#111] mb-6 tracking-tight flex flex-col items-center gap-3">
          {project.title}
          {project.status && (
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              project.status === 'ongoing' 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : 'bg-green-150 text-green-800 border border-green-250'
            }`}>
              {project.status === 'ongoing' ? 'Ongoing' : 'Delivered'}
            </span>
          )}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed font-light">
          {project.description}
        </p>
        
        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-xl">
            {project.tags.map((tag, i) => (
              <span key={i} className="bg-gray-100 text-gray-800 text-xxs px-3 py-1 rounded-full font-semibold">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mb-4">
          {ctaButton}
        </div>
      </div>

      {/* 2. Interactive Slideshow Showcase (Premium Slider) */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <div className="relative aspect-[16/10] md:aspect-[16/9] w-full bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden group shadow-lg">
          {/* Main Slide Image */}
          <img 
            src={galleryItems[activeSlide].url} 
            className="w-full h-full object-cover transition-opacity duration-500" 
            alt={galleryItems[activeSlide].caption || "Slideshow showcase"} 
          />
          
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

          {/* Navigation Buttons */}
          {galleryItems.length > 1 && (
            <>
              <button 
                onClick={() => setActiveSlide(prev => prev === 0 ? galleryItems.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2.5 rounded-full shadow-md transition opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setActiveSlide(prev => prev === galleryItems.length - 1 ? 0 : prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2.5 rounded-full shadow-md transition opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Caption & Counter overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white z-10">
            <div className="max-w-md">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#CCFF00]">Anvitam Showcase</span>
              <p className="text-sm font-medium mt-1 leading-snug">{galleryItems[activeSlide].caption || "Case study screenshot"}</p>
            </div>
            {galleryItems.length > 1 && (
              <span className="text-xs bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full font-mono text-[#fff]/90 border border-white/10">
                {activeSlide + 1} / {galleryItems.length}
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail slider navigation */}
        {galleryItems.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 overflow-x-auto py-2">
            {galleryItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`w-16 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  activeSlide === idx ? 'border-[#CCFF00] scale-105 shadow' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={item.url} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Project Videos (YouTube / Instagram embeds) */}
      {project.videos && project.videos.length > 0 && (() => {
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
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Project Videos</h3>
              <span className="text-xs text-gray-400 ml-auto">{project.videos!.length} video{project.videos!.length > 1 ? 's' : ''}</span>
            </div>
            <div className={`grid gap-6 ${project.videos!.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {project.videos!.map((vid, i) => {
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
                      title={vid.caption || `Project video ${i + 1}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* 4. Project Specs & Fact Sheet */}
      <div className="max-w-4xl mx-auto px-6 mb-24">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 relative border-b border-gray-100 pb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#111] mb-2 md:mb-0">
            Project Overview & Facts
          </h3>
          <div className="hidden md:block">
            {ctaButton}
          </div>
        </div>
        <div className={`grid grid-cols-2 ${displaySpecs.length >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
          {displaySpecs.map((spec, i) => (
            <div key={i} className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">{spec.label}</span>
              <span className="text-sm font-semibold text-gray-800">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Large Feature Image (Hero Banner) */}
      <div className="max-w-5xl mx-auto px-6 mb-24">
        <img 
          src={project.heroImage || project.image || galleryItems[0].url} 
          alt="Feature banner show" 
          className="w-full h-[350px] md:h-[550px] object-cover rounded-2xl shadow-md border border-gray-100" 
        />
      </div>

      {/* 5. Implementation Process / The Story */}
      {project.story && project.story.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 mb-24">
          <h3 className="text-xl md:text-2xl font-bold text-[#111] mb-2 tracking-tight">Implementation Roadmap</h3>
          <p className="text-gray-500 mb-10 text-sm md:text-base max-w-2xl leading-relaxed">
            A step-by-step summary of our design, visualization, and permaculture consulting journey.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.story.map((step, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-xs transition-shadow">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#CCFF00]/30 text-gray-850 font-bold text-xs mb-4">
                  {i + 1}
                </div>
                <h4 className="font-bold text-[#111] text-base mb-2 tracking-tight">{step.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{step.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Rich HTML Case Study Details (CMS Content) */}
      {project.fullDescription && (
        <div className="max-w-4xl mx-auto px-6 mb-24">
          <h3 className="text-xl md:text-2xl font-bold text-[#111] mb-6 tracking-tight">Detailed Case Study</h3>
          <div 
            className="prose prose-sm md:prose-base text-gray-600 leading-relaxed font-light space-y-4 ql-editor"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.fullDescription) }}
          />
        </div>
      )}

      {/* 7. Accordion FAQ Builder for visitors (AEO SEO Engine) */}
      {project.faqs && project.faqs.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 mb-24">
          <h3 className="text-xl md:text-2xl font-bold text-[#111] mb-3 tracking-tight flex items-center gap-2">
            <HelpCircle className="text-gray-400" size={20} /> Project Q&As
          </h3>
          <p className="text-xs text-gray-500 mb-8">
            Frequently asked questions about this case study's planning and consulting steps.
          </p>
          <div className="border-t border-gray-150 divide-y divide-gray-150">
            {project.faqs.map((faq, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center text-left py-2 focus:outline-none"
                >
                  <span className="font-semibold text-sm md:text-base text-gray-800 pr-8">{faq.question}</span>
                  <span className="text-lg text-gray-400 font-mono select-none">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <p className="pt-2 pb-4 text-xs md:text-sm text-gray-500 leading-relaxed font-light pr-4">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Related / Next Projects Navigation */}
      <div className="max-w-4xl mx-auto px-6 mb-20">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 border-t border-gray-100 pt-8">Explore More Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            to={`/projects/${prevProject.slug || prevProject.id}`} 
            className="flex items-center space-x-4 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition group bg-white shadow-xs"
          >
            <img 
              src={prevProject.image} 
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0" 
              alt={prevProject.title} 
            />
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Previous Case</span>
              <h4 className="font-bold text-[#111] text-xs md:text-sm group-hover:text-gray-650 transition-colors line-clamp-1">
                {prevProject.title}
              </h4>
            </div>
          </Link>

          <Link 
            to={`/projects/${nextProject.slug || nextProject.id}`} 
            className="flex items-center space-x-4 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition group bg-white shadow-xs"
          >
            <img 
              src={nextProject.image} 
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0" 
              alt={nextProject.title} 
            />
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Next Case</span>
              <h4 className="font-bold text-[#111] text-xs md:text-sm group-hover:text-gray-650 transition-colors line-clamp-1">
                {nextProject.title}
              </h4>
            </div>
          </Link>
        </div>
      </div>

      {/* 9. Pre-Footer CTA */}
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

export default ProjectDetail;
