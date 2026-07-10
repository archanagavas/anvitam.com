import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { ArrowRight, MapPin, Globe, Trees } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import TestimonialCarousel from '../components/TestimonialCarousel';


/* ─── HERO BACKGROUND VIDEO/IMAGE URL ─── */
const HERO_BG = 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=75&w=1200&auto=format&fit=crop';
const FEATURE_1 = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=75&w=1200&auto=format&fit=crop';
const FEATURE_2 = 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?q=75&w=1200&auto=format&fit=crop';
const FEATURE_3 = 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=75&w=1200&auto=format&fit=crop';
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

const Home: React.FC = () => {
  const { projects, blogs, services } = useContent();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const showcaseProjects = projects?.slice(0, 2) || [];
  const recentBlogs = blogs?.filter(b => b.status === 'published').slice(0, 2) || [];

  const TOPMATE = 'https://topmate.io/archanagavas/1799075?utm_source=public_profile&utm_campaign=archanagavas';
  const neonBtn = 'inline-flex items-center gap-2 bg-[#CCFF00] text-[#050505] px-6 py-3 rounded-full text-sm font-semibold hover:scale-105 transition-transform duration-300 cursor-pointer';
  const outlineBtn = 'inline-flex items-center gap-2 border border-[#111] text-[#111] bg-transparent px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#111] hover:text-white transition-all duration-300 cursor-pointer';

  return (
    <div className="w-full bg-[#EFEFEB] text-[#111] font-sans overflow-hidden">

      <Helmet>
        <title>Anvitam | Architecture Firm</title>
        <meta name="description" content="Anvitam designs high-performing farm retreats, eco-resorts, Airbnbs, homestays, and wellness centers using permaculture and sustainable landscape design." />
        <meta name="keywords" content="architecture firm, sustainable architecture, permaculture design, eco retreats, farm stays, biophilic design, green building, Vadodara, Gujarat" />
        <meta name="robots" content="index, follow" />
        <meta name="X-Robots-Tag" content="index, follow" />
        <meta name="publisher" content="Anvitam" />
        <link rel="publisher" href="https://www.anvitam.com/" />
      </Helmet>

      {/* ══════════════════════════════════════════
          HERO — full-bleed image, centered text
      ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
        {/* BG image with parallax */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <img src={HERO_BG} alt="Farm retreat architecture and sustainable resort design" className="w-full h-full object-cover" />
          {/* very subtle dark vignette at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
        </motion.div>

        {/* Centered hero text */}
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium tracking-widest uppercase"
          >
            Eco Friendly Design
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl text-white font-bold leading-[1.1] tracking-tight mb-6"
          >
            Sustainable Architecture for{' '}
            <span className="text-[#CCFF00]">Modern Living</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <a href={TOPMATE} target="_blank" rel="noreferrer" className={neonBtn}>
              Get a Design Consultation <ArrowRight size={16} />
            </a>
          </motion.div>

          {/* Benefit checks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6 text-white text-sm"
          >
            {['Permaculture Design', 'Farm retreat', 'Airbnb', 'Homestay', 'Community Center', 'Weekend Villa', 'Eco Resort', 'Wellness Retreat Center', 'Food Forest', 'Agrotourism', 'Landscape Design', 'Terrace Garden'].map(b => (
              <span key={b} className="flex items-center gap-1.5"><span className="text-[#CCFF00]">✓</span> {b}</span>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats bar at the bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 grid grid-cols-3 border-t border-white/20 bg-black/40 backdrop-blur-md">
          {[
            { num: '12+', label: 'Projects Completed' },
            { num: 'Permaculture', label: 'Grounded in Principles' },
            { num: '100%', label: 'Climate-Aware Design' },
          ].map((s, i) => (
            <div key={i} className="py-3 md:py-6 px-1 sm:px-3 text-center text-white border-r last:border-r-0 border-white/20 flex flex-col justify-center items-center">
              <p className="text-sm sm:text-2xl md:text-4xl font-bold leading-tight break-words">{s.num}</p>
              <p className="text-[8px] sm:text-[10px] md:text-xs text-white/80 mt-1 uppercase tracking-wider text-center">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CLIENT LOGO SLIDER ══ */}
      <div className="bg-white border-y border-black/5 py-5 overflow-hidden">
        <p className="text-center text-xs text-[#999] uppercase tracking-widest mb-4">Trusted by our clients</p>
        <div className="relative flex overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 30 }}
            className="flex whitespace-nowrap text-[#333] text-sm font-semibold gap-0"
          >
            {[
              'dwelvex studio', 'Unique school of science', 'Beer Bar', 'Shalimar',
              'yourweb3guy', 'Saraya', 'Mahadev Construction', 'Mossaria', 'vanvagado Farm', 'Carpa Lupa', 'The Batukaru Yurt',
              'dwelvex studio', 'Unique school of science', 'Beer Bar', 'Shalimar',
              'yourweb3guy', 'Saraya', 'Mahadev Construction', 'Mossaria', 'vanvagado Farm', 'Carpa Lupa', 'The Batukaru Yurt',
            ].map((name, i) => (
              <span key={i} className="mx-10 opacity-40 hover:opacity-100 transition-opacity cursor-default">{name}</span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          WHAT WE DO — 2 columns on light bg (Biogax section 2 style)
      ══════════════════════════════════════════ */}
      <section className="bg-[#EFEFEB] py-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left col — heading + pills + CTA */}
          <FadeUp>
            <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-8">
              <span>↓</span> What We Do
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111] mb-8">
              Designing Nature-First Architecture for the World
            </h2>
            {/* Tag pills — same as Biogax */}
            <div className="flex flex-wrap gap-3 mb-10">
              {['Visionary', 'Collaborative', 'Sustainable', 'Global', 'Impactful', 'Reliable', 'Adaptive', 'Efficient', 'Innovative'].map(tag => (
                <span key={tag} className="border border-[#111]/15 rounded-full px-4 py-1.5 text-sm text-[#111]/70 hover:bg-[#111] hover:text-white transition-all cursor-default">{tag}</span>
              ))}
            </div>
            <Link to="/contact" className={neonBtn}>
              Get a Design Consultation <ArrowRight size={16} />
            </Link>
          </FadeUp>

          {/* Right col — description */}
          <FadeUp delay={0.15}>
            <p className="text-3xl md:text-4xl font-bold leading-[1.2] text-[#111] mb-8">
              We're helping property owners transform spaces into <span className="text-[#888]">nature-led, profitable sanctuaries.</span>
            </p>
            <p className="text-[#555] text-base leading-relaxed mb-4">
              Our mission is simple: to make <strong className="text-[#111]">thoughtful, sustainable architecture</strong> accessible across the world. We design and deliver <strong className="text-[#111]">end-to-end solutions</strong> for farm retreats, wellness spaces, eco-resorts, and regenerative landscapes, where we are working with clients across the USA, Australia, India, Bali and beyond.
            </p>
            <p className="text-[#555] text-base leading-relaxed">
              From <strong className="text-[#111]">intimate lifestyle farms</strong> to <strong className="text-[#111]">large commercial developments</strong>, our work adapts to your scale and vision, whether it’s a nature-led Airbnb, a weekend villa, or a land-based project rooted in <strong className="text-[#111]">permaculture principles</strong>.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURE BANNERS — full-width image cards (Biogax scroll banners)
          Each is a wide rounded card image with text overlay bottom-left
      ══════════════════════════════════════════ */}
      <section className="bg-[#EFEFEB] py-4 px-6 md:px-16 lg:px-24 space-y-4">
        {[
          { img: FEATURE_1, h: 'Design Your Farm Retreat.', sub: 'Lower your impact and your costs with our farm retreat architecture design that works with the land.', kw: 'Farm retreat architecture' },
          { img: FEATURE_2, h: 'Maximize Property Efficiency.', sub: 'Carefully planned wellness retreats and homestays designed for performance, longevity, and guest experience.', kw: 'Wellness retreat architect' },
          { img: FEATURE_3, h: 'Grow Revenue from Nature.', sub: 'Regenerative landscapes and food forests that evolve into self-sustaining, productive ecosystems.', kw: 'Edible garden design services' },
        ].map((b, i) => (
          <FadeUp key={i} delay={i * 0.05}>
            <div className="relative rounded-2xl overflow-hidden h-[480px] md:h-[560px] group cursor-pointer">
              <img src={b.img} alt={b.h} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-10 max-w-xl">
                <h3 className="text-white text-3xl md:text-4xl font-bold leading-[1.15] mb-3">{b.h}</h3>
                <p className="text-white/75 text-sm md:text-base leading-relaxed mb-6">{b.sub}</p>
                <Link to="/contact" className={neonBtn}>
                  Get a Design Consultation <ArrowRight size={16} />
                </Link>
              </div>
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white/80 text-xs">
                {b.kw}
              </div>
            </div>
          </FadeUp>
        ))}
      </section>

      {/* ══════════════════════════════════════════
          SERVICES — card carousel / centered heading + 3 portrait cards
      ══════════════════════════════════════════ */}
      <section className="bg-[#EFEFEB] py-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-screen-xl mx-auto">
          {/* Section label */}
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-6">
                <span>↓</span> Services We Offer
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111] mb-4">
                Architectural solutions built for nature
              </h2>
              <p className="text-[#555] max-w-2xl mx-auto text-base">
                We work globally on <strong className="text-[#111]">landscape</strong> and <strong className="text-[#111]">sustainable building design</strong>, with projects across the USA, Australia, India, Bali and beyond.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.slice(0, 3).map((s, i) => (
              <FadeUp key={s.id} delay={i * 0.1}>
                <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full group cursor-pointer border border-black/5 hover:shadow-xl transition-shadow duration-300" onClick={() => navigate(`/services/${s.id}`)}>
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
                    <Link to="/contact" className={neonBtn}>
                      Get a Design Consultation <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/services" className={outlineBtn}>View all services <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROCESS — numbered steps on light bg
      ══════════════════════════════════════════ */}
      <section className="bg-[#EFEFEB] py-24 px-6 md:px-16 lg:px-24 border-t border-black/5">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-6">
                <span>↓</span> Our Process
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111] mb-4">Implementation Process.</h2>
              <p className="text-[#555] max-w-xl mx-auto text-base">
                From initial <strong className="text-[#111]">outdoor living design consultation</strong> to full project delivery, we manage every step.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Site Understanding & Analysis', body: 'We study the land in detail like its ecology, climate, contours, and rhythms to establish a grounded design intent.' },
              { n: '02', title: 'Design Resolution', body: 'Architecture, landscape, and systems are developed together as a unified whole, balancing performance, regulation, and experience.' },
              { n: '03', title: 'Guided Execution', body: 'From drawings to construction, we guide the project to completion, ensuring clarity, quality, and continuity of vision.' },
            ].map((p, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-8 border border-black/5 hover:shadow-lg transition-shadow h-full flex flex-col">
                  <span className="text-6xl font-bold text-[#111]/8 mb-4 block">{p.n}</span>
                  <h3 className="text-xl font-bold text-[#111] mb-3">{p.title}</h3>
                  <p className="text-[#555] text-sm leading-relaxed flex-grow">{p.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROJECTS — left image, right details (Biogax project card style)
      ══════════════════════════════════════════ */}
      <section className="bg-[#EFEFEB] py-24 px-6 md:px-16 lg:px-24 border-t border-black/5">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-6">
                  <span>↓</span> See Our Projects
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111]">Powering Change Around the World</h2>
              </div>
              <Link to="/projects" className={outlineBtn}>View all projects <ArrowRight size={14} /></Link>
            </div>
          </FadeUp>

          <div className="space-y-8">
            {showcaseProjects.length > 0 ? showcaseProjects.map((project, i) => (
              <FadeUp key={project.id} delay={i * 0.1}>
                <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row border border-black/5 hover:shadow-xl transition-shadow group">
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
                              : 'bg-green-150 text-green-800 border border-green-250'
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
                    <Link to={`/projects/${project.slug || project.id}`} className={neonBtn}>
                      View Details <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </FadeUp>
            )) : (
              /* Placeholder cards when no data */
              [0, 1].map(i => (
                <FadeUp key={i} delay={i * 0.1}>
                  <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row border border-black/5 hover:shadow-xl transition-shadow group">
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
                      <Link to="/projects" className={neonBtn}>View Details <ArrowRight size={16} /></Link>
                    </div>
                  </div>
                </FadeUp>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BLOG — section label + grid (Biogax blog style)
      ══════════════════════════════════════════ */}
      <section className="bg-[#EFEFEB] py-24 px-6 md:px-16 lg:px-24 border-t border-black/5">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-6">
                  <span>↓</span> Our Blog
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111]">Our latest insights</h2>
              </div>
              <Link to="/blog" className={neonBtn}>View all posts <ArrowRight size={14} /></Link>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentBlogs.length > 0 ? recentBlogs.map((post, i) => (
              <FadeUp key={post.id} delay={i * 0.1}>
                <Link to={`/blog/${post.slug || post.id}`} className="bg-white rounded-2xl overflow-hidden flex flex-col border border-black/5 hover:shadow-xl transition-shadow group cursor-pointer">
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
                  <Link to="/blog" className="bg-white rounded-2xl overflow-hidden flex flex-col border border-black/5 hover:shadow-xl transition-shadow group cursor-pointer">
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
                        Read blog <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                </FadeUp>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ══ ENGAGEMENT MODELS ══ */}
      <section className="bg-[#EFEFEB] py-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111] mb-4">
                Engagement Models
              </h2>
              <p className="text-[#555] text-base max-w-lg">
                Flexible ways to collaborate on your next <strong>community centre design</strong> or{' '}
                <strong className="text-[#2a7a4f]">food forest design</strong>.
              </p>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Partnership Model */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-white rounded-3xl p-10 flex flex-col justify-between min-h-[320px] hover:shadow-lg transition-shadow">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Partnership Model</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-[#CCAA00] mb-6">Revenue Share (15%/Quarter)</p>
                <p className="text-[#555] text-sm leading-relaxed mb-2">
                  For complex projects including wellness centres and homestay developments, we act as long-term design partners, leading the architectural scope with a focus on environmental performance and longevity.
                </p>
              </div>
              <Link to="/contact" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#111] border-b border-[#111]/30 pb-1 w-fit hover:gap-5 transition-all mt-8">
                Explore Partnership <ArrowRight size={14} />
              </Link>
            </motion.div>
            {/* Retainer Model */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white rounded-3xl p-10 flex flex-col justify-between min-h-[320px] hover:shadow-lg transition-shadow">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Retainer Model</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-[#2a7a4f] mb-6">Starting ₹25,000/month</p>
                <p className="text-[#555] text-sm leading-relaxed">
                  This engagement is intended for ongoing design guidance, phased implementation, and focused consultation on smaller residential landscape projects.
                </p>
              </div>
              <Link to="/contact" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#111] border-b border-[#111]/30 pb-1 w-fit hover:gap-5 transition-all mt-8">
                Explore Retainer <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS — LOOPING CAROUSEL ══ */}
      <section className="bg-white py-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-[#111] text-center mb-12">Trusted by Our Clients</h2>
          </FadeUp>
          <TestimonialCarousel />
        </div>
      </section>



      {/* ══ PARTNERS / BRANDS ══ */}
      <section className="bg-white py-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-6">
              <Trees size={14} className="text-[#111]" /> OUR PARTNERS
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[#111] mb-12">
              Brands we partner with
            </h2>
          </FadeUp>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-[1px] bg-black/10 border border-black/10 rounded-xl overflow-hidden p-[1px]">
            {[
              { label: 'yourweb3guy', icon: '🌿' },
              { label: 'Unique School of Science', icon: '🏫' },
              { label: 'Carpa Lupa', icon: '🏠' },
              { label: 'Beer Bar', icon: '🍺' },
              { label: 'Shalimar', icon: '✦' },
              { label: 'The Batukaru Yurt', icon: '🏢' },
              { label: 'Saraya', icon: '🌸' },
              { label: 'Vanvagado Farm', icon: '🏗️' },
              
            ].map((partner, i) => {
              // Row 1: 3 items (span 2 each)
              // Row 2: 2 items (span 3 each)
              // Row 3: 3 items (span 2 each)
              const colSpan = (i === 3 || i === 4) ? 'md:col-span-3' : 'md:col-span-2';
              
              return (
                <div key={i} className={`bg-white relative p-10 flex flex-col items-center justify-center min-h-[220px] transition-colors hover:bg-gray-50 group cursor-default ${colSpan}`}>
                  <span className="absolute top-6 left-6 text-xs text-[#555] font-medium">{i + 1}. Client</span>
                  <div className="flex items-center gap-4 transition-transform group-hover:scale-105 duration-500">
                    <span className="text-3xl opacity-90">{partner.icon}</span>
                    <span className="font-bold text-[#111] text-xl md:text-2xl tracking-tight">{partner.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ══ FAQ ══ */}
      <FaqSection />



    </div>
  );
};


/* ══ FAQ COMPONENT ══ */

function FaqSection() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  const tabs = ['Getting started', 'Collaboration', 'Support'];
  const faqs = [
    [
      { q: 'How long does a farm retreat architecture project take?', a: 'Typically 6–18 months depending on scale, site conditions, and permitting. We\'ll give you a full timeline after the initial site audit.' },
      { q: 'Do you provide weekend villa architect services in Australia?', a: 'Yes. We have dedicated teams across major Australian states including NSW, VIC, and QLD delivering weekend villa design and farm stay architecture.' },
      { q: 'What is permaculture site planning?', a: 'It\'s a design methodology that works with natural systems to create self-sustaining, productive landscapes. We integrate it into every eco retreat design project.' },
      { q: 'Can I get Airbnb homestay design services remotely?', a: 'Absolutely. We offer full digital discovery, remote design consultations, and partnered local build management across USA and Australia.' },
      { q: 'Do you handle food forest design?', a: 'Yes — edible garden design services and food forest design are core to our offering and can be added to any retreat or villa landscape project.' },
    ],
    [
      { q: 'How do I collaborate with your team?', a: 'We begin with a design consultation, then assign you a dedicated project lead who manages communication across design, ecology, and build teams.' },
      { q: 'Can I supply my own images and content?', a: 'Yes. We design around your vision. You can share references, images, and materials at any stage of the process.' },
      { q: 'Do you work with international clients?', a: 'Yes — we serve clients globally with primary focus on USA and Australia markets, including remote consultations and digital project management.' },
    ],
    [
      { q: 'What support do you offer post-completion?', a: 'We offer 12-month post-project support including seasonal garden reviews, permaculture maintenance guides, and landscape architect for villas check-ins.' },
      { q: 'Is there a warranty on design work?', a: 'Yes. All architectural plans carry a design warranty. Landscaping and planting guarantees vary by service package.' },
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
                  <span className="text-sm font-medium text-[#111]">{item.q}</span>
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

