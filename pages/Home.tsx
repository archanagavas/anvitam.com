import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { ArrowRight, Trees, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import SlidingTestimonials from '../components/SlidingTestimonials';
import InfiniteMarquee from '../components/InfiniteMarquee';
import VerticalTimeline from '../components/VerticalTimeline';
import { FlowButton } from '../components/ui/flow-button';
import { TypingAnimation } from '../components/TypingAnimation';

const FLIP_WORDS = [
  "Farms",
  "Eco Resorts",
  "Airbnbs",
  "Farm Retreats",
  "Homestays",
  "Weekend Villas",
  "Wellness Centers",
  "Food Forests",
  "Agrotourism",
  "Community Centers",
  "Terrace Gardens"
];

const SERVICES_CHECKLIST = [
  "Permaculture Design",
  "Farm retreat",
  "Airbnb",
  "Homestay",
  "Community Center",
  "Weekend Villa",
  "Eco Resort",
  "Wellness Retreat Center",
  "Food Forest",
  "Agrotourism",
  "Landscape Design",
  "Terrace Garden"
];

/* ─── HERO BACKGROUND VIDEO/IMAGE URL ─── */
const HERO_BG = '/hero-image.png';
const SERVICE_1 = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=75&w=600&auto=format&fit=crop';
const SERVICE_2 = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=75&w=600&auto=format&fit=crop';
const SERVICE_3 = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=75&w=600&auto=format&fit=crop';

/* ── Scroll-reveal wrapper ── */
const FadeUp = React.forwardRef<HTMLDivElement, { children: React.ReactNode; delay?: number }>(
  ({ children, delay = 0 }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
);

/* ── Typewriter Effect Component ── */
const TypewriterHeadingWords: React.FC<{ words: string[] }> = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => {
        setReverse(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        setSubIndex((prev) => prev + (reverse ? -1 : 1));
      },
      reverse ? 45 : 85
    );

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  return (
    <span className="inline-block relative text-[#CCFF00] font-bold">
      {words[index].substring(0, subIndex)}
      <span className={`inline-block ml-0.5 text-[#CCFF00] font-light ${blink ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
        |
      </span>
    </span>
  );
};

const Home: React.FC = () => {
  const { projects, blogs, services, partners, openEstimator } = useContent();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const showcaseProjects = projects?.slice(0, 2) || [];
  const recentBlogs = blogs?.filter(b => b.status === 'published').slice(0, 2) || [];

  const neonBtn = 'inline-flex items-center gap-2 bg-[#CCFF00] text-[#050505] px-6 py-3 rounded-full text-sm font-semibold hover:scale-105 transition-transform duration-300 cursor-pointer';
  const outlineBtn = 'inline-flex items-center gap-2 border border-[#111] text-[#111] bg-transparent px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#111] hover:text-white transition-all duration-300 cursor-pointer';

  return (
    <div className="w-full bg-white text-[#111] font-sans overflow-hidden">

      <Helmet>
        <title>Anvitam | Regenerative Architecture for Farms, Retreats & Resorts</title>
        <meta name="description" content="Anvitam combines architecture, landscape, permaculture and climate-responsive design to create places that work with their land — not against it. Working across India, USA, Australia & globally." />
        <meta name="keywords" content="regenerative architecture, sustainable architecture, farm retreat architect, eco resort architect, permaculture designer, food forest design, natural building" />
        <meta name="robots" content="index, follow" />
        <meta name="X-Robots-Tag" content="index, follow" />
        <meta name="publisher" content="Anvitam" />
        <link rel="publisher" href="https://www.anvitam.com/" />
        <link rel="canonical" href="https://www.anvitam.com/" />
      </Helmet>

      {/* ══════════════════════════════════════════
          HERO — full-bleed mountain image, centered text
      ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen min-h-[680px] flex flex-col items-center justify-center overflow-hidden">
        {/* BG image with parallax */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <img 
            src={HERO_BG} 
            alt="Sustainable mountain retreat landscape architecture design" 
            className="w-full h-full object-cover" 
            fetchPriority="high"
            loading="eager"
          />
          {/* subtle dark vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </motion.div>

        {/* Centered hero text */}
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-16">
          {/* Trust Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-white/40 shadow-lg text-gray-900 text-xs font-semibold mb-8 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="flex -space-x-2.5 overflow-hidden">
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover" src="/avatars/client1.jpg" alt="Mahandra sinh Solanki" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover" src="/avatars/client2.jpg" alt="Akash Jha" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover" src="/avatars/client3.jpg" alt="Unique School of Science" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover" src="/avatars/client4.jpg" alt="Client" />
            </div>
            <div className="flex items-center gap-2">
              <span className="flex text-amber-500 text-xs tracking-tighter">★ ★ ★ ★ ★</span>
              <span className="text-gray-900 font-bold text-xs tracking-tight">Trusted by 20+ owners</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl text-white font-bold leading-[1.15] tracking-tight mb-8"
          >
            Regenerative Architecture for{' '}
            <TypewriterHeadingWords words={FLIP_WORDS} />
          </motion.h1>

          {/* 2 Prominent Hero Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-10"
          >
            <Link to="/projects">
              <FlowButton text="Explore Our Projects" variant="dark" className="shadow-lg" />
            </Link>
            <FlowButton
              text="Get Estimate"
              variant="lime"
              onClick={() => window.dispatchEvent(new CustomEvent('open-estimator'))}
            />
          </motion.div>

          {/* Services Checklist Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto text-xs"
          >
            {SERVICES_CHECKLIST.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium shadow-xs hover:border-[#CCFF00]/60 transition-colors"
              >
                <span className="text-[#CCFF00] font-bold text-xs">✓</span>
                <span className="text-white/95">{item}</span>
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats bar at the bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 grid grid-cols-3 border-t border-white/20 bg-black/40 backdrop-blur-md">
          {[
            { num: '10+', label: 'PROJECTS DELIVERED', delay: 300 },
            { num: 'Global', label: 'PROJECTS & CONSULTATIONS', delay: 700 },
            { num: '811,297 sq ft', label: 'IMPACTED BY ANVITAM', delay: 1100 },
          ].map((s, i) => (
            <div key={i} className="py-3 md:py-6 px-2 sm:px-4 text-center text-white border-r last:border-r-0 border-white/20 flex flex-col justify-center items-center">
              <p className="text-base sm:text-2xl md:text-3xl font-bold leading-tight break-words min-h-[1.5em] flex items-center justify-center">
                <TypingAnimation delay={s.delay} duration={70}>
                  {s.num}
                </TypingAnimation>
              </p>
              <p className="text-[9px] sm:text-[11px] md:text-xs text-white/80 mt-1 uppercase tracking-wider text-center font-semibold min-h-[1.5em] flex items-center justify-center">
                <TypingAnimation delay={s.delay + 300} duration={35}>
                  {s.label}
                </TypingAnimation>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CLIENT LOGO SLIDER ══ */}
      <div className="bg-white border-y border-black/5 py-6">
        <p className="text-center text-xs text-[#999] uppercase tracking-widest mb-4">Trusted by our clients</p>
        <InfiniteMarquee
          items={[
            'dwelvex studio', 'Unique school of science', 'Beer Bar', 'Shalimar',
            'yourweb3guy', 'Saraya', 'Mahadev Construction', 'Mossaria', 'vanvagado Farm', 'Carpa Lupa', 'The Batukaru Yurt'
          ]}
        />
      </div>

      {/* ══ DIFFERENTIATOR ══ */}
      <section className="bg-white py-24 px-6 md:px-16 lg:px-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-8">
              <span>↓</span> Our Approach
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111] mb-6">
              Your land already has a system.
            </h2>
            <p className="text-[#555] text-lg leading-relaxed mb-4">
              We help you understand it <strong className="text-[#111]">before you build.</strong>
            </p>
            <p className="text-[#555] text-base leading-relaxed mb-8">
              Most projects begin with <em>where should the building go?</em> We begin with <strong className="text-[#111]">what is the land already telling us?</strong> Climate, water, soil, sun, wind, topography and living systems come first. Architecture follows.
            </p>
            <Link to="/contact">
              <FlowButton text="Discuss Your Project" />
            </Link>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: '☀️', label: 'Climate', body: 'Sun, shade, wind, heat, rainfall and seasonal comfort.' },
                { icon: '💧', label: 'Water', body: 'Drainage, harvesting, recharge, irrigation and water resilience.' },
                { icon: '🌱', label: 'Living Systems', body: 'Soil, vegetation, biodiversity, food production and landscape.' },
              ].map((c, i) => (
                <div key={i} className="bg-gray-50/70 rounded-2xl p-6 border border-gray-200/80 hover:shadow-lg hover:border-gray-300 transition-all flex flex-col">
                  <span className="text-3xl mb-4">{c.icon}</span>
                  <h3 className="font-bold text-[#111] mb-2">{c.label}</h3>
                  <p className="text-[#555] text-sm leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══ WHAT ARE YOU PLANNING — self-selection ══ */}
      <section className="bg-white py-24 px-6 md:px-16 lg:px-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-6">↓ Find Your Path</div>
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] text-gray-900 mb-4">What are you planning?</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Tell us what you're building and we'll calculate an instant cost estimate for you.</p>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'I want to build a farm retreat', icon: '🏕️', serviceId: 'farm-retreat' },
              { label: 'I want to create an eco-resort', icon: '🏡', serviceId: 'eco-resort' },
              { label: 'I want to design interior of the home', icon: '🌿', serviceId: 'weekend-villa' },
              { label: 'I want to design a food forest', icon: '🌳', serviceId: 'permaculture-design' },
              { label: 'I want a wellness destination', icon: '🧘', serviceId: 'eco-resort' },
              { label: 'I own property and I\'m not sure what\'s possible yet', icon: '🌍', serviceId: undefined },
            ].map((card, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-estimator', card.serviceId ? { detail: { serviceId: card.serviceId } } : {}))}
                  className="w-full text-left group flex items-center gap-4 bg-gray-50/80 hover:bg-gray-900 border border-gray-200/80 hover:border-gray-900 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <span className="text-3xl shrink-0">{card.icon}</span>
                  <span className="text-gray-900 group-hover:text-white font-semibold text-sm leading-snug transition-colors">{card.label}</span>
                  <ArrowRight size={16} className="ml-auto text-gray-400 group-hover:text-white shrink-0 transition-colors" />
                </button>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICES — card carousel / centered heading + 3 portrait cards
      ══════════════════════════════════════════ */}
      <section className="bg-white py-24 px-6 md:px-16 lg:px-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto">
          {/* Section label */}
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-6">
                <span>↓</span> What We Offer
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111] mb-4">
                What can we help you create?
              </h2>
              <p className="text-[#555] max-w-2xl mx-auto text-base">
                Four core disciplines, integrated into a single design approach.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.slice(0, 3).map((s, i) => (
              <FadeUp key={s.id} delay={i * 0.1}>
                <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full group cursor-pointer border border-gray-200 hover:shadow-xl transition-shadow duration-300" onClick={() => navigate(`/services/${s.id}`)}>
                  <div className="relative h-72 overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 w-12 h-12 bg-[#CCFF00] rounded-full flex items-center justify-center text-2xl shadow-md">
                      {['🌿', '🌱', '🏡'][i] || '🏗️'}
                    </div>
                    <img src={s.heroImage || [SERVICE_1, SERVICE_2, SERVICE_3][i]} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <h3 className="text-white text-2xl font-bold leading-tight mb-2">{s.title}</h3>
                      <p className="text-white/75 text-sm leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                  <div className="p-6 mt-auto">
                    <Link to={`/services/${s.id}`}>
                      <FlowButton text="Explore Service" />
                    </Link>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/services">
              <FlowButton text="View All Services" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROCESS — 2-Column Methodology Section
      ══════════════════════════════════════════ */}
      <section className="bg-white py-24 px-6 md:px-16 lg:px-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto" id="method">
          <VerticalTimeline />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROJECTS — left image, right details
      ══════════════════════════════════════════ */}
      <section className="bg-white py-24 px-6 md:px-16 lg:px-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-6">
                  <span>↓</span> See Our Projects
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111]">Ideas are easy. We care about what works on site.</h2>
              </div>
              <Link to="/projects">
                <FlowButton text="View All Projects" />
              </Link>
            </div>
          </FadeUp>

          <div className="space-y-8">
            {showcaseProjects.length > 0 ? showcaseProjects.map((project, i) => (
              <FadeUp key={project.id} delay={i * 0.1}>
                <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 hover:shadow-xl transition-shadow group">
                  <div className="relative md:w-1/2 h-64 md:h-auto overflow-hidden">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#CCFF00] bg-[#111] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">{project.category}</span>
                        {project.status && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            project.status === 'ongoing' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                              : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {project.status === 'ongoing' ? 'Ongoing' : 'Delivered'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mt-5 mb-4">{project.title}</h3>
                      <p className="text-[#555] text-sm leading-relaxed mb-6">{project.description}</p>
                    </div>
                    <div className="space-y-3 mb-8">
                      {[
                        { icon: '📍', label: 'Location', val: project.location },
                        { icon: '🏁', label: 'Type', val: project.category },
                        ...(project.status ? [{ icon: '⏳', label: 'Status', val: project.status === 'ongoing' ? 'Ongoing' : 'Delivered' }] : []),
                        ...(project.specs?.slice(0, 2).map((s, idx) => ({ 
                           icon: idx === 0 ? '♻️' : '✨', 
                           label: s.label, 
                           val: s.value 
                        })) || [])
                      ].slice(0, 4).map(r => (
                        <div key={r.label} className="flex justify-between items-center text-sm border-b border-[#111]/5 pb-2">
                          <span className="text-[#888] flex items-center gap-2">{r.icon} {r.label}</span>
                          <span className="font-medium text-[#111] text-right max-w-[60%]">{r.val}</span>
                        </div>
                      ))}
                    </div>
                    <Link to={`/projects/${project.slug || project.id}`}>
                      <FlowButton text="View Details" />
                    </Link>
                  </div>
                </div>
              </FadeUp>
            )) : (
              /* Placeholder cards when no data */
              [0, 1].map(i => (
                <FadeUp key={i} delay={i * 0.1}>
                  <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 hover:shadow-xl transition-shadow group">
                    <div className="relative md:w-1/2 h-64 md:h-80 overflow-hidden bg-[#ddd]">
                      <img src={i === 0 ? SERVICE_1 : SERVICE_2} alt="Project" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
                      <div>
                        <span className="text-[#CCFF00] bg-[#111] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">{i === 0 ? 'Farm Retreat Architecture' : 'Airbnb Homestay Design'}</span>
                        <h3 className="text-2xl md:text-3xl font-bold mt-5 mb-4">{i === 0 ? 'Eco Farm Stay – California' : 'Boutique Villa – Sydney'}</h3>
                        <p className="text-[#555] text-sm leading-relaxed mb-6">
                          {i === 0
                            ? 'A complete farmstay architecture services project combining passive solar design and permaculture landscape design on a 40-acre rural property.'
                            : 'Airbnb landscape design in Sydney blending terrace garden design with boutique villa landscape design for maximum guest appeal.'}
                        </p>
                      </div>
                      <div className="space-y-3 mb-8">
                        {[
                          { icon: '📍', label: 'Location', val: i === 0 ? 'California, USA' : 'Sydney, Australia' },
                          { icon: '♻️', label: 'Approach', val: i === 0 ? 'Permaculture site planning' : 'Urban gardening design' },
                          { icon: '🏁', label: 'Status', val: 'Completed' },
                          { icon: '💰', label: 'ROI', val: 'Estimated 14 months' },
                        ].map(r => (
                          <div key={r.label} className="flex justify-between items-center text-sm border-b border-[#111]/5 pb-2">
                            <span className="text-[#888] flex items-center gap-2">{r.icon} {r.label}</span>
                            <span className="font-medium text-[#111]">{r.val}</span>
                          </div>
                        ))}
                      </div>
                      <Link to="/projects">
                        <FlowButton text="View Details" />
                      </Link>
                    </div>
                  </div>
                </FadeUp>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BLOG — section label + grid
      ══════════════════════════════════════════ */}
      <section className="bg-white py-24 px-6 md:px-16 lg:px-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-6">
                  <span>↓</span> Our Journal
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111]">Learn before you build.</h2>
              </div>
              <Link to="/blog">
                <FlowButton text="Read the Journal" />
              </Link>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentBlogs.length > 0 ? recentBlogs.map((post, i) => (
              <FadeUp key={post.id} delay={i * 0.1}>
                <Link to={`/blog/${post.slug || post.id}`} className="bg-white rounded-2xl overflow-hidden flex flex-col border border-gray-200 hover:shadow-xl transition-shadow group cursor-pointer">
                  {post.image && (
                    <div className="h-52 overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4 text-xs text-[#888]">
                      <span className="border border-[#111]/15 rounded-full px-3 py-1">{post.category || 'Design'}</span>
                      <span>{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-[#555] transition-colors">{post.title}</h3>
                    <p className="text-[#555] text-sm leading-relaxed mb-6">{post.excerpt}</p>
                    <span className="inline-flex items-center gap-2 text-[#111] font-semibold text-sm group-hover:gap-4 transition-all">
                      Read blog <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </FadeUp>
            )) : (
              /* placeholder blog cards */
              [
                { tag: 'Permaculture', date: 'Mar 2025', title: 'How Permaculture Site Planning Transforms Farm Retreats', excerpt: 'A breakdown of how we use permaculture design principles to create self-sustaining eco retreats across the USA and Australia.' },
                { tag: 'Villa Design', date: 'Feb 2025', title: 'Weekend Villa Architect: What to Look for in Australia', excerpt: 'Key questions to ask any landscape architect for villas before committing to a boutique villa landscape design project.' },
              ].map((post, i) => (
                <FadeUp key={i} delay={i * 0.1}>
                  <Link to="/blog" className="bg-white rounded-2xl overflow-hidden flex flex-col border border-gray-200 hover:shadow-xl transition-shadow group cursor-pointer">
                    <div className="h-52 overflow-hidden">
                      <img src={i === 0 ? SERVICE_3 : SERVICE_1} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-4 text-xs text-[#888]">
                        <span className="border border-[#111]/15 rounded-full px-3 py-1">{post.tag}</span>
                        <span>{post.date}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-[#555] transition-colors">{post.title}</h3>
                      <p className="text-[#555] text-sm leading-relaxed mb-6">{post.excerpt}</p>
                      <span className="inline-flex items-center gap-2 text-[#111] font-semibold text-sm group-hover:gap-4 transition-all">
                        Read the Guide <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                </FadeUp>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS — CONTINUOUS SLIDING BAND ══ */}
      <section className="bg-white py-16 md:py-20 border-t border-gray-100 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-16 lg:px-24 mb-6 md:mb-10">
          <FadeUp>
            <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-3">
              <Trees size={14} className="text-[#111]" /> CLIENT FEEDBACK
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#111]">
              Trusted by Our Clients
            </h2>
          </FadeUp>
        </div>
        <SlidingTestimonials />
      </section>

      {/* ══ PARTNERS / BRANDS ══ */}
      <section className="bg-white py-16 md:py-20 px-6 md:px-16 lg:px-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-4">
              <Trees size={14} className="text-[#111]" /> OUR CLIENTS &amp; PARTNERS
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#111] mb-10">
              Brands we partner with
            </h2>
          </FadeUp>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {([
              { id: '1', name: 'Camp Leo', logo: '/logos/Camp leo.png' },
              { id: '2', name: 'Jay Bhole', logo: '/logos/Jay Bhole.png' },
              { id: '3', name: 'Mahadev Construction', logo: '/logos/Mahadev Construction.png' },
              { id: '4', name: 'Mossaria', logo: '/logos/Mossaria.png' },
              { id: '5', name: 'RJ Organics', logo: '/logos/RJ Organics.png' },
              { id: '6', name: 'SAC', logo: '/logos/SAC.png' },
              { id: '7', name: 'Shalimar', logo: '/logos/Shalimar.png' },
              { id: '8', name: 'Stone Age Huts & Hostel', logo: '/logos/Stone Age Huts and hostal.png' },
              { id: '9', name: 'Unique School of Science', logo: '/logos/Unique School of Science.png' },
              { id: '10', name: 'Vanvagado Farm', logo: '/logos/Vanvagado farm.png' },
              { id: '11', name: 'Vergers du Monde', logo: '/logos/vergersdumonde.png' },
              { id: '12', name: 'yourweb3guy', logo: '/logos/Yourweb3guy.png' },
            ]).map((partner) => (
              <div
                key={partner.id}
                className="group relative bg-gray-50/90 hover:bg-white border border-gray-200/90 hover:border-[#111] rounded-2xl p-5 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 h-28 sm:h-32 cursor-pointer"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-16 max-w-[130px] object-contain transition-all duration-300 group-hover:scale-110"
                />
                {/* Floating Tooltip showing name on hover */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-30 whitespace-nowrap">
                  <span className="bg-[#111] text-[#CCFF00] text-xs font-bold px-3 py-1 rounded-full shadow-xl border border-white/10 flex items-center gap-1">
                    {partner.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MEET ARCHANA (Image 1 Inspired Profile Card Layout) ══ */}
      <section className="bg-white py-24 px-6 md:px-16 lg:px-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-10">
              ↓ The Architect
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="relative flex flex-col lg:flex-row items-center justify-center">
              {/* Left Profile Image Container */}
              <div className="w-full lg:w-[480px] shrink-0 h-[480px] sm:h-[520px] rounded-[32px] overflow-hidden bg-[#e5dfd5] shadow-xl relative border border-gray-200">
                <img
                  src="/archana.png"
                  alt="Archana Gavas - Principal Architect"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Overlapping Dark Card (Right) */}
              <div className="w-full lg:w-[580px] bg-[#18181B] border border-white/10 rounded-[28px] p-8 sm:p-10 md:p-12 shadow-2xl mt-6 lg:mt-0 lg:-ml-24 z-10 text-white flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
                    Archana Gavas
                  </h2>
                  <p className="text-sm sm:text-base text-gray-400 font-medium mb-6">
                    Founder &amp; Principal Architect, Ecological Design
                  </p>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
                    Archana Gavas is an architect interested in what happens when we stop treating buildings, landscapes, and ecosystems as separate things. Her work sits at the intersection of architecture, permaculture, climate-responsive design, and natural building to create self-sustaining living spaces.
                  </p>
                </div>

                {/* Circular Action / Social Buttons Row */}
                <div className="flex items-center gap-4 pt-2">
                  <a
                    href="https://www.linkedin.com/in/archana-gavas/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-12 h-12 rounded-full bg-white text-black hover:bg-[#CCFF00] hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-md"
                  >
                    <Linkedin size={20} />
                  </a>
                  <a
                    href="mailto:ar.archanagavas@gmail.com"
                    aria-label="Email"
                    className="w-12 h-12 rounded-full bg-white text-black hover:bg-[#CCFF00] hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-md"
                  >
                    <Mail size={20} />
                  </a>
                  <Link
                    to="/contact"
                    className="ml-auto inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-300 hover:text-white transition-colors"
                  >
                    Get in Touch <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══ IS ANVITAM RIGHT FOR YOU ══ */}
      <section className="bg-slate-50 py-24 px-6 md:px-16 lg:px-24 border-t border-b border-gray-200/80">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Is Anvitam the right fit<br/>for your project?</h2>
              <p className="text-gray-600 max-w-xl mx-auto">Anvitam may be a good fit if you:</p>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {[
              'Own or are planning to acquire land',
              'Want architecture connected to landscape and ecology',
              'Are developing a farm, retreat, resort, villa or wellness project',
              'Care about climate-responsive and natural design',
              'Want to understand the land before building on it',
              'Are looking for a long-term design approach rather than a generic plan',
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <div className="flex items-start gap-3 bg-white border border-gray-200/90 shadow-sm rounded-xl p-5">
                  <span className="text-emerald-600 font-bold text-lg shrink-0">✓</span>
                  <span className="text-gray-800 text-sm leading-relaxed">{item}</span>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp>
            <div className="text-center">
              <Link to="/contact">
                <FlowButton text="Tell Us About Your Project" />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <FaqSection />

      {/* ══ FINAL CTA ══ */}
      <section className="bg-white py-24 px-6 md:px-16 lg:px-24 border-t border-gray-200">
        <div className="max-w-screen-xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-4xl md:text-6xl font-bold leading-[1.1] text-gray-900 mb-4">Have land and a vision?</h2>
            <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-xl mx-auto">Let's design what it could become. Tell us about your site, what you want to create, and where you are in the process.</p>
            <Link to="/contact">
              <FlowButton text="Discuss Your Project" className="px-10 py-4 text-base" />
            </Link>
          </FadeUp>
        </div>
      </section>

    </div>
  );
};


/* ══ FAQ COMPONENT ══ */

function FaqSection() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  const tabs = ['Working with Us', 'Our Services', 'Process & Cost'];
  const faqs = [
    [
      { q: 'What locations do you serve?', a: 'We work with clients globally across India, USA, Australia, and internationally. Site visits and consultations are scheduled based on project scope.' },
      { q: 'What happens after I get in touch?', a: 'You share details about your site and vision. We have an initial conversation to understand your project. If it\'s a good fit, we discuss scope and next steps — there\'s no commitment required from that first conversation.' },
      { q: 'Do you work with international clients?', a: 'Yes. We work with clients across India and internationally, including remote consultations and digital project management for early-stage design work.' },
    ],
    [
      { q: 'Do you design complete farm retreats, or just consult?', a: 'We can do both — from full architectural design and masterplanning to focused permaculture or landscape consultations depending on what stage you\'re at and what you need.' },
      { q: 'Do you provide only architecture, or landscape and permaculture too?', a: 'Anvitam integrates architecture, landscape design, permaculture and natural building as a single practice. You don\'t need to hire separate consultants for each discipline.' },
      { q: 'Do you work on agricultural land?', a: 'Yes. A significant part of our work involves farm land — whether for farm retreats, food forests, agroforestry systems or permaculture masterplanning on agricultural plots.' },
      { q: 'Can you design a food forest?', a: 'Yes. Syntropic agroforestry and food forest design are core to our practice — we design multi-layered food systems that integrate with buildings and landscape.' },
    ],
    [
      { q: 'How much does a project cost?', a: 'Cost depends heavily on the scope, site, scale and services required. We don\'t publish a fixed rate because a site analysis for a farm and a full eco-resort masterplan are very different engagements. We discuss fees after understanding your project.' },
      { q: 'How long does a project take?', a: 'Early-stage consultations can move quickly. Full design and masterplanning projects typically run over several months depending on complexity, approvals and the build phase.' },
      { q: 'What happens during the process?', a: 'We begin by understanding your site and vision. We read the land — climate, water, soil, vegetation. Then we build a design strategy that integrates architecture, landscape and ecological systems before producing drawings and plans.' },
    ],
  ];


  return (
    <section className="bg-white py-24 px-6 md:px-16 lg:px-24 border-t border-black/5">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-6">↓ FAQs</div>
          <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111] mb-4">Got questions?</h2>
          <p className="text-[#555] text-base mb-8">We're here to make sustainable architecture easy to understand. Find answers to the most common questions below.</p>
          <div className="border-t border-[#111]/10 pt-8">
            <p className="font-semibold text-[#111] mb-4">Still got questions?</p>
            <a href="mailto:anvitamarchitects@gmail.com" className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#111] px-5 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-transform">anvitamarchitects@gmail.com</a>
          </div>
        </div>
        {/* Right */}
        <div>
          {/* Tabs */}
          <div className="flex gap-8 border-b border-[#111]/10 mb-6">
            {tabs.map((t, i) => (
              <button key={t} onClick={() => { setActiveTab(i); setOpenIdx(null); }} className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === i ? 'border-[#111] text-[#111]' : 'border-transparent text-[#888] hover:text-[#555]'}`}>{t}</button>
            ))}
          </div>
          {/* Accordion */}
          <div className="divide-y divide-[#111]/8">
            {faqs[activeTab].map((item, i) => (
              <div key={i} className="py-4">
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between text-left gap-4">
                  <h3 className="text-sm font-medium text-[#111]">{item.q}</h3>
                  <motion.span animate={{ rotate: openIdx === i ? 45 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-lg leading-none text-[#888]">+</motion.span>
                </button>
                <motion.div initial={false} animate={{ height: openIdx === i ? 'auto' : 0, opacity: openIdx === i ? 1 : 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                  <p className="pt-3 pb-1 text-sm text-[#555] leading-relaxed">{item.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;

