import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Maximize2, 
  X, 
  Send, 
  Building2, 
  Check, 
  Wrench, 
  Share2,
  Award,
  Leaf,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import FlowButton from '../components/ui/flow-button';

const WorkshopDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { workshops, addMessage, isInitialSyncDone } = useContent();
  
  // Find workshop by ID or slug
  const workshop = workshops.find(w => w.id === id || w.slug === id);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Helper to parse strings into point-wise lists
  const parsePoints = (input?: string): string[] => {
    if (!input || !input.trim()) return [];
    const lines = input
      .split(/\n|•|·|▪|‣|\r/)
      .map(line => line.replace(/^[\s\-\*\•\d\.\>\–\—\+]+/, '').trim())
      .filter(Boolean);
    if (lines.length > 0) return lines;
    if (input.includes(',')) {
      return input.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [input.trim()];
  };

  // Slideshow State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    schoolName: '',
    email: '',
    phone: '',
    city: '',
    attendees: '50-100 Students',
    offerings: [] as string[],
    date: '',
    notes: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveSlide(0);
  }, [id]);

  useEffect(() => {
    if (workshop?.offerings && workshop.offerings.length > 0) {
      setFormState(prev => ({
        ...prev,
        offerings: workshop.offerings || []
      }));
    }
  }, [workshop]);

  if (!isInitialSyncDone && !workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400">Loading Workshop Sub-Page...</p>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 px-6 py-24 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-[#111] mb-6">
          <Building2 size={36} />
        </div>
        <h1 className="text-3xl font-black mb-3">Workshop Entry Not Found</h1>
        <p className="text-gray-500 max-w-md mb-8 text-sm">
          The requested campus workshop could not be located or may have been updated.
        </p>
        <Link
          to="/workshops"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#111] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-emerald-600 transition"
        >
          <ArrowLeft size={16} /> Back to Workshops
        </Link>
      </div>
    );
  }

  // Extract YouTube ID if present
  const getYouTubeEmbedId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoEmbedId = getYouTubeEmbedId(workshop.videoUrl || workshop.youtubeUrl);
  const rawImages = workshop.images ? workshop.images.filter(img => Boolean(img && img.trim())) : [];
  const imagesList = rawImages.length > 0 ? rawImages : ['/workshops/birds house making.png'];

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const toggleOffering = (offering: string) => {
    setFormState(prev => {
      const exists = prev.offerings.includes(offering);
      return {
        ...prev,
        offerings: exists 
          ? prev.offerings.filter(o => o !== offering)
          : [...prev.offerings, offering]
      };
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedMessage = `[WORKSHOP BOOKING INQUIRY - ${workshop.title}]
Institution / School: ${formState.schoolName}
Contact Person: ${formState.name}
Phone: ${formState.phone}
City/Campus: ${formState.city || workshop.location}
Expected Attendees: ${formState.attendees}
Selected Offerings: ${formState.offerings.join(', ')}
Preferred Dates: ${formState.date || 'Flexible'}
Additional Notes: ${formState.notes || 'None'}`;

    addMessage({
      name: `${formState.name} (${formState.schoolName})`,
      email: formState.email,
      message: formattedMessage,
      date: new Date().toISOString()
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
    }, 2800);
  };

  // SEO & AEO Data setup
  const pageTitle = workshop.metaTitle || `${workshop.title} | Nest N Nurture Workshops by Anvitam`;
  const pageDesc = workshop.metaDescription || workshop.description || `Explore ${workshop.title} conducted for ${workshop.organization} at ${workshop.location}.`;
  const canonicalUrl = workshop.canonicalUrl || `https://www.anvitam.com/workshops/${workshop.slug || workshop.id}`;

  const skillsPoints = parsePoints(workshop.skillsOutcomes);
  const materialsPoints = parsePoints(workshop.materialsUsed);
  const impactPoints = parsePoints(workshop.impact);
  const outcomesPoints = parsePoints(workshop.outcomes);

  const activeFaqs = (workshop.faqs && workshop.faqs.length > 0) ? workshop.faqs : [
    { question: `What is included in the ${workshop.title}?`, answer: `The workshop provides all reclaimed materials, non-toxic paints, child-safe tools, expert architectural guidance, and participation certificates.` },
    { question: `Where was this workshop conducted?`, answer: `Conducted for ${workshop.organization} at ${workshop.location || 'campus premises'}.` },
    { question: `How can institutions book a similar workshop?`, answer: `Schools, universities, and corporate ESG teams can request a custom proposal via our website or by contacting ar.archanagavas@gmail.com.` }
  ];

  const jsonLdEventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": workshop.title,
    "description": pageDesc,
    "image": imagesList[0],
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
      "name": "Nest N Nurture by Anvitam Architecture",
      "url": "https://www.anvitam.com"
    }
  };

  const jsonLdFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": activeFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-[#CCFF00] selection:text-black">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={workshop.primaryKeyword || `${workshop.title}, campus workshop, bird house making, school makeover`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={workshop.ogTitle || pageTitle} />
        <meta property="og:description" content={workshop.ogDescription || pageDesc} />
        <meta property="og:image" content={workshop.ogImage || imagesList[0]} />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLdEventSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(jsonLdFaqSchema)}
        </script>
      </Helmet>

      {/* ── TOP BREADCRUMB NAVIGATION ── */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/workshops"
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-gray-600 hover:text-black transition"
          >
            <ArrowLeft size={16} /> Back to All Workshops
          </Link>
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest hidden sm:inline-block">
            Nest N Nurture Campus Case Study
          </span>
        </div>
      </div>

      {/* ── HERO HEADER SECTION ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#CCFF00] text-black text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
              {workshop.category} Workshop
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Building2 size={12} /> {workshop.organization}
            </span>
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1 ml-auto">
              <Calendar size={13} /> {workshop.date}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight leading-tight">
            {workshop.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 border-y border-gray-100 py-4">
            {workshop.location && (
              <div className="flex items-center gap-2 font-medium">
                <MapPin size={16} className="text-emerald-600" />
                <span>{workshop.location}</span>
              </div>
            )}
            {workshop.attendeesCount && (
              <div className="flex items-center gap-2 font-medium">
                <Users size={16} className="text-emerald-600" />
                <span>{workshop.attendeesCount}</span>
              </div>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-[#111] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition shadow-sm"
            >
              <Sparkles size={14} className="text-[#CCFF00]" /> Book Similar Workshop
            </button>
          </div>
        </div>
      </section>

      {/* ── MEDIA SLIDESHOW & GALLERY CAROUSEL ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
        <div className="bg-gray-950 rounded-3xl overflow-hidden shadow-2xl relative group">
          {/* Main Slide Image */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-black flex items-center justify-center overflow-hidden">
            <img
              src={imagesList[activeSlide]}
              alt={`${workshop.title} Slide ${activeSlide + 1}`}
              className="w-full h-full object-cover transition-all duration-500"
              onError={(e) => { (e.target as HTMLImageElement).src = '/workshops/birds house making.png'; }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Slide Navigation Controls */}
            {imagesList.length > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full backdrop-blur-md transition"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full backdrop-blur-md transition"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* Bottom Bar Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
              <span className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full font-mono font-bold">
                {activeSlide + 1} / {imagesList.length} Slides
              </span>
              
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="bg-black/60 hover:bg-white hover:text-black backdrop-blur-md border border-white/10 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition"
              >
                <Maximize2 size={13} /> Expand Fullscreen
              </button>
            </div>
          </div>

          {/* Thumbnails Row */}
          {imagesList.length > 1 && (
            <div className="p-4 bg-gray-900 flex items-center gap-3 overflow-x-auto border-t border-gray-800 scrollbar-none">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    activeSlide === idx ? 'border-[#CCFF00] opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/workshops/birds house making.png'; }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── YOUTUBE VIDEO SECTION ── */}
      {videoEmbedId && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <div className="bg-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#CCFF00] text-black flex items-center justify-center font-bold">
                <Play size={20} className="fill-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Live Workshop Action & Campus Video</h3>
                <p className="text-xs text-emerald-300">Watch students & facilitators build sustainable bird habitats live</p>
              </div>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden border border-emerald-800 shadow-2xl bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoEmbedId}?autoplay=0`}
                title={`${workshop.title} Video Showcase`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* ── WORKSHOP HIGHLIGHTS & CONTENT MATRIX ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Left Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* AEO / GEO EXECUTIVE SUMMARY BOX */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#CCFF00] flex items-center gap-1.5">
                <Sparkles size={14} /> At-A-Glance Executive Summary
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">GEO & AEO Verified</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Institution</span>
                <span className="font-extrabold text-white">{workshop.organization}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                <span className="font-extrabold text-white">{workshop.location || 'Gujarat'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Audience</span>
                <span className="font-extrabold text-white">{workshop.attendeesCount || workshop.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-extrabold text-[#CCFF00]">{workshop.category} Masterclass</span>
              </div>
            </div>
          </div>

          {/* Highlights & Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-gray-950 flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-600" /> Workshop Overview & Highlights
            </h2>
            <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line bg-gray-50 p-6 rounded-2xl border border-gray-150">
              {workshop.description}
            </p>
          </div>

          {/* Offerings Matrix */}
          {workshop.offerings && workshop.offerings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-gray-900">Key Modules & Activities Conducted</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workshop.offerings.map((off, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <span className="font-bold text-sm text-gray-900">{off}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1. SKILLS & LEARNING OUTCOMES (POINT-WISE) */}
          {skillsPoints.length > 0 && (
            <div className="space-y-4 bg-emerald-50/60 p-6 sm:p-8 rounded-3xl border border-emerald-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-emerald-950 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Wrench size={16} />
                  </div>
                  Educational & Learning Outcomes
                </h3>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200">
                  {skillsPoints.length} Core Competencies
                </span>
              </div>
              <ul className="space-y-2.5 pt-1">
                {skillsPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-emerald-950 font-semibold bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-2xs">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 2 & 3. MATERIALS USED & ECOLOGICAL IMPACT (POINT-WISE GRID) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sustainable Materials */}
            {materialsPoints.length > 0 && (
              <div className="bg-gray-50 p-6 sm:p-7 rounded-3xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
                    <Leaf size={15} className="text-emerald-600" /> Sustainable Materials
                  </h4>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2.5 py-0.5 rounded-full">
                    {materialsPoints.length} Items
                  </span>
                </div>
                <ul className="space-y-2">
                  {materialsPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-800 font-semibold">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Environmental & Social Impact */}
            {impactPoints.length > 0 && (
              <div className="bg-emerald-950 text-white p-6 sm:p-7 rounded-3xl space-y-4 shadow-xl border border-emerald-900">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#CCFF00] flex items-center gap-2">
                    <Sparkles size={15} /> Ecological & Social Impact
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-700">
                    {impactPoints.length} Direct Impacts
                  </span>
                </div>
                <ul className="space-y-2">
                  {impactPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-emerald-100 font-semibold">
                      <Check size={14} className="text-[#CCFF00] shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 4. WORKSHOP OUTCOMES (DEDICATED POINT-WISE CARD) */}
          {outcomesPoints.length > 0 && (
            <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-transparent p-6 sm:p-8 rounded-3xl border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-950 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Award size={18} />
                  </div>
                  Key Deliverables & Workshop Outcomes
                </h3>
                <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                  {outcomesPoints.length} Tangible Results
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {outcomesPoints.map((point, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-amber-150 shadow-xs flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={14} className="font-black" />
                    </div>
                    <span className="font-bold text-xs text-gray-900 leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. AEO & GEO FAQ ACCORDION SECTION */}
          {activeFaqs.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-gray-950 flex items-center gap-2">
                  <HelpCircle size={18} className="text-emerald-600" /> Frequently Asked Questions (FAQ)
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  AEO Optimized
                </span>
              </div>

              <div className="space-y-3">
                {activeFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs transition">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left font-bold text-sm text-gray-900 flex items-center justify-between gap-4 hover:bg-gray-50 transition"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-emerald-600 font-black">Q:</span> {faq.question}
                        </span>
                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50 pt-3">
                          <span className="text-emerald-700 font-extrabold block mb-1">Answer:</span>
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar B2B Card */}
        <div className="space-y-6">
          <div className="bg-gray-950 text-white p-8 rounded-3xl space-y-6 shadow-2xl border border-gray-800 sticky top-24">
            <div className="inline-block bg-[#CCFF00] text-black font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
              B2B Campus Booking
            </div>

            <h3 className="text-2xl font-black leading-tight">
              Bring Nest N Nurture to Your Campus
            </h3>

            <p className="text-xs text-gray-300 leading-relaxed">
              Customizable 1-day workshops, multi-day masterclasses, or permanent campus space makeover installations tailored for schools & colleges.
            </p>

            <ul className="space-y-3 text-xs text-gray-200">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-[#CCFF00]" /> Complete Eco-Kits & Tools Provided
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-[#CCFF00]" /> Guided by Professional Architects
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-[#CCFF00]" /> Student Participation Certificates
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-[#CCFF00]" /> Permanent Campus Bio-Habitat Units
              </li>
            </ul>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-widest rounded-xl transition transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> Request Campus Proposal
            </button>
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX MODAL ── */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-[#CCFF00] p-2 rounded-full transition"
          >
            <X size={28} />
          </button>
          
          <img
            src={imagesList[activeSlide]}
            alt="Fullscreen Workshop Photo"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white font-mono text-xs bg-gray-900/80 px-4 py-2 rounded-full backdrop-blur-md border border-gray-700">
            {activeSlide + 1} of {imagesList.length} Photos
          </div>
        </div>
      )}

      {/* ── LEAD CAPTURE MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-[#CCFF00] rounded-full flex items-center justify-center mx-auto text-black font-bold">
                  <Check size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Workshop Inquiry Received!</h3>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">
                  Thank you! Our Nest N Nurture campus team will review your requirements and reach out within 24 hours.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    B2B Campus Lead Form
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 mt-2">
                    Book Nest N Nurture Workshop
                  </h3>
                  <p className="text-xs text-gray-500">
                    Host bird house building, space makeovers & eco-installations at your campus.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={e => setFormState({ ...formState, name: e.target.value })}
                        placeholder="e.g. Dr. Rajesh Shah"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                        School / College Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.schoolName}
                        onChange={e => setFormState({ ...formState, schoolName: e.target.value })}
                        placeholder="e.g. Unique School of Science"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={e => setFormState({ ...formState, email: e.target.value })}
                        placeholder="principal@school.edu"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formState.phone}
                        onChange={e => setFormState({ ...formState, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                        City / Campus Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.city}
                        onChange={e => setFormState({ ...formState, city: e.target.value })}
                        placeholder="e.g. Nadiad / Ahmedabad"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                        Expected Attendees
                      </label>
                      <select
                        value={formState.attendees}
                        onChange={e => setFormState({ ...formState, attendees: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-600 bg-white"
                      >
                        <option value="25-50 Students">25-50 Students</option>
                        <option value="50-100 Students">50-100 Students</option>
                        <option value="100-250 Students">100-250 Students</option>
                        <option value="250+ Entire Campus">250+ Entire Campus</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1.5">
                      Select Preferred Activities
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Bird House Making', 'Space Makeover', 'Bird Feeder Making', 'Tote Bag Painting', 'Upcycling Workshop'].map(act => (
                        <button
                          key={act}
                          type="button"
                          onClick={() => toggleOffering(act)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                            formState.offerings.includes(act)
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {formState.offerings.includes(act) ? '✓ ' : '+ '} {act}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-widest rounded-xl transition shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <Send size={14} /> Submit Workshop Inquiry
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopDetail;
