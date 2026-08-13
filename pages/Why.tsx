import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Globe, Leaf, Calculator } from 'lucide-react';

/* ── Shared scroll-reveal wrapper ── */
const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 36 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ── "Coming in" scale animation ── */
const ScaleFade: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 50 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const TOPMATE = 'https://topmate.io/archanagavas/1799075?utm_source=public_profile&campaign=archanagavas';
const neonBtn =
  'inline-flex items-center gap-2 bg-[#CCFF00] text-[#111] px-6 py-3 rounded-full text-sm font-semibold hover:scale-105 transition-transform duration-300 cursor-pointer shadow-sm';
const outlineBtn =
  'inline-flex items-center gap-2 bg-white border border-black/20 text-[#111] px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#111] hover:text-white hover:border-[#111] transition-all duration-300 cursor-pointer shadow-xs';

/* ── Stats ── */
const STATS = [
  { num: '10+', label: 'Projects Completed' },
  { num: '2022', label: 'Founded' },
  { num: '6+', label: 'Service Areas' },
  { num: 'Global', label: 'India, USA, Bali & Worldwide' },
];

/* ── Feature cards (right column of Our Approach) ── */
const FEATURES = [
  {
    img: '/images/about/natural-cooling.png',
    title: 'Natural Cooling & Eco Design',
    body:
      'We place windows, courtyards, and trees to catch cool breeze and block hot summer sun. This keeps rooms fresh naturally without running ACs all day.',
  },
  {
    img: '/images/about/local-earth-craft.png',
    title: 'Local Earth & Natural Crafts',
    body:
      'We build with natural clay plaster, local stone, reused wood, and bamboo. These natural textures give your rooms warmth and fresh air while lasting for generations.',
  },
  {
    img: '/images/about/comfortable-rooms.png',
    title: 'Comfortable, Light-Filled Rooms',
    body:
      'We bring sunlight, fresh breeze, and lush garden views right into your living room, creating peaceful spaces where your family loves to spend time.',
  },
];

const Why: React.FC = () => {
  return (
    <div className="bg-[#EFEFEB] min-h-screen font-sans w-full overflow-x-hidden">
      <Helmet>
        <title>About Anvitam | Sustainable Resort Architect & Eco Retreat Designer</title>
        <meta
          name="description"
          content="Discover Anvitam's philosophy of contextual architecture and interior design, practicing sustainable, eco-friendly biophilic designs across India, the USA, Australia, Bali, and worldwide."
        />
        <meta name="keywords" content="about anvitam, sustainable resort architect, eco retreat designer, bio-climatic design, natural building materials, archana gavas, Vadodara, India, worldwide architecture" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.anvitam.com/why" />
      </Helmet>

      {/* ══════════════════════════════════════════
          HERO BANNER — Biogax style 2-row banner
      ══════════════════════════════════════════ */}
      <section className="pt-28 pb-0 px-6 md:px-16 lg:px-24 bg-[#EFEFEB]">
        <div className="max-w-screen-xl mx-auto">
          {/* Label pill */}
          <FadeUp>
            <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#111]/60 mb-10">
              <span>↓</span> About Us
            </div>
          </FadeUp>

          {/* ── Two-column top: headline + team avatars / text ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            {/* Left: headline */}
            <FadeUp>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#111]">
                Founded in 2022,<br />
                <span className="text-[#888] font-light italic font-serif">Nurturing Nature</span>
              </h1>
            </FadeUp>

            {/* Right: avatar row + paragraph + dual buttons */}
            <FadeUp delay={0.12}>
              <div className="flex flex-col gap-6">
                {/* Stacked avatars */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[
                      '/archana.webp',
                      '/uploads/akash.jpg',
                      '/uploads/rucha.jpg',
                      '/uploads/navin.jpg',
                    ].map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="Team member"
                        className="w-10 h-10 rounded-full border-2 border-[#EFEFEB] object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[#555]">Our growing team &amp; clients</span>
                </div>

                <p className="text-[#555] text-base leading-relaxed max-w-lg">
                  Anvitam is an architecture firm that designs <strong className="text-[#111]">homes, farmhouses, and resorts that stay cool naturally and feel connected to nature</strong>. From organic food forests and farm retreats to community centers and eco-resorts, our designs fit your land, local weather, and budget. We work across <strong className="text-[#111]">India, the USA, Australia, Bali, and worldwide</strong>.
                </p>

                {/* Dual action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a href={TOPMATE} target="_blank" rel="noreferrer" className={neonBtn}>
                    Book a Design Consultation <ArrowRight size={16} />
                  </a>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-estimator'))}
                    className={outlineBtn}
                  >
                    <Calculator size={16} /> Estimate Project Fit
                  </button>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* ── Stats row ── */}
          <FadeUp delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 border border-[#111]/10 rounded-2xl overflow-hidden bg-white">
              {STATS.map((s, i) => (
                <div
                  key={i}
                  className={`p-8 flex flex-col gap-1 ${
                    i < STATS.length - 1 ? 'border-r border-[#111]/10' : ''
                  }`}
                >
                  <span className="text-4xl md:text-5xl font-bold text-[#111]">{s.num}</span>
                  <span className="text-xs text-[#888] uppercase tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHAT WE DO — 2 col, sticky left heading / stacked cards right
      ══════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-16 lg:px-24 bg-[#EFEFEB]">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — sticky heading block */}
          <FadeUp className="lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#111]/60 mb-8">
              <span>↓</span> Our Approach
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-6">
              Simple. Natural.<br />Built to Last.
            </h2>
            <p className="text-[#555] text-base leading-relaxed mb-8">
              We design spaces that save electricity, capture rainwater, and use local stone, clay, and wood. You get a comfortable home or farm that stays cool in summer and cozy in winter without heavy AC bills.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/contact" className={neonBtn}>
                Work With Us <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-estimator'))}
                className={outlineBtn}
              >
                <Calculator size={15} /> Estimate Fit
              </button>
            </div>
          </FadeUp>

          {/* Right — stacked feature cards (image + text) */}
          <div className="flex flex-col gap-6">
            {FEATURES.map((f, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={f.img}
                      alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <h3 className="absolute bottom-4 left-5 text-white text-xl font-bold">{f.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-[#555] text-sm leading-relaxed">{f.body}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PHILOSOPHY DETAIL — alternating full-image cards
      ══════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-6 md:px-16 lg:px-24 bg-[#EFEFEB] border-t border-black/5">
        <div className="max-w-screen-xl mx-auto space-y-12 md:space-y-20">

          {/* Section Heading */}
          <FadeUp>
            <div className="text-center max-w-2xl mx-auto mb-6">
              <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#111]/60 mb-4">
                <span>↓</span> Our Core Philosophy
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] text-[#111]">
                Guiding Design Principles
              </h2>
            </div>
          </FadeUp>

          {/* Row 1 */}
          <ScaleFade>
            <div className="relative rounded-2xl overflow-hidden h-[440px] md:h-[520px] group shadow-2xl">
              <img
                src="/images/about/shaping-space.png"
                alt="Shaping Space from the Ground Up"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-16 max-w-2xl">
                <span className="inline-block bg-[#CCFF00] text-[#111] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">
                  01 · Belief
                </span>
                <h3 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-4">
                  Shaping Space from the Ground Up
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  We believe design can transform the way we live. Every project, whether a weekend villa or a
                  large-scale wellness retreat, must be approached with sensitivity, purpose, and responsibility.
                </p>
              </div>
            </div>
          </ScaleFade>

          {/* Row 2 */}
          <ScaleFade delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden h-[440px] md:h-[520px] group shadow-2xl">
              <img
                src="/images/about/context-central.png"
                alt="Context is Central to Every Design"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end items-end text-right p-10 md:p-16 max-w-2xl ml-auto">
                <span className="inline-block bg-[#CCFF00] text-[#111] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">
                  02 · Philosophy
                </span>
                <h3 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-4">
                  Context is Central to Every Design
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  Every project is a story shaped by site, climate, material, labour, and budget. Our work
                  is never formulaic as we listen to the land, the people, and the pulse of each project.
                </p>
              </div>
            </div>
          </ScaleFade>

          {/* Row 3 */}
          <ScaleFade delay={0.15}>
            <div className="relative rounded-2xl overflow-hidden h-[440px] md:h-[520px] group shadow-2xl">
              <img
                src="/images/about/care-earth-craft.png"
                alt="Care for the Earth & Craft"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-16 max-w-2xl">
                <span className="inline-block bg-[#CCFF00] text-[#111] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">
                  03 · Principles
                </span>
                <h3 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-4">
                  Care for the Earth &amp; Craft
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  Our approach begins with care for the land, for people, and for the craft. We focus on
                  ecological practices, consider health impacts, and find joy in the design process through
                  curiosity, creativity, and playful exploration.
                </p>
              </div>
            </div>
          </ScaleFade>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          VALUES GRID
      ══════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-16 lg:px-24 bg-white border-t border-black/5">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#111]/60 mb-6">
                <span>↓</span> Our Values
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.1]">
                What Drives Every Project
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🌿',
                title: 'Biophilic by Design',
                body: 'Nature is the starting point, not an add-on. Every project is shaped through living systems, natural materials, light, air, and organic spatial relationships.',
              },
              {
                icon: '🤝',
                title: 'Collaborative at the Core',
                body: 'We listen closely before we draw. Your intent, the site, and its constraints guide the work—our role is to translate them with care, clarity, and ecological insight.',
              },
              {
                icon: '🌍',
                title: 'Global Outlook, Local Intelligence',
                body: 'Working across India, the USA, Australia, Bali, and worldwide, we apply global standards while responding deeply to local climate, culture, and construction traditions.',
              },
              {
                icon: '♻️',
                title: 'Material Responsibility',
                body: 'We prefer locally available, low-embodied-energy materials — reinterpreted to create contemporary expressions that are both relevant and timeless.',
              },
              {
                icon: '💡',
                title: 'Thoughtful Experimentation',
                body: 'We approach design with curiosity and care—open to exploration, yet grounded in responsibility. Serious work does not require seriousness in spirit.',
              },
              {
                icon: '📐',
                title: 'Careful Execution',
                body: 'From early concepts to on-site coordination, we stay involved to ensure each space is built with integrity, precision, and respect for the original intent.',
              },
            ].map((v, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="bg-[#EFEFEB] rounded-2xl p-8 h-full hover:shadow-md transition-shadow border border-transparent hover:border-[#CCFF00]/30 duration-300">
                  <span className="text-3xl mb-5 block">{v.icon}</span>
                  <h3 className="text-lg font-bold mb-3 text-[#111]">{v.title}</h3>
                  <p className="text-[#555] text-sm leading-relaxed">{v.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOUNDER SPOTLIGHT
      ══════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-16 lg:px-24 bg-[#EFEFEB] border-t border-black/5">
        <div className="max-w-screen-xl mx-auto">
          <FadeUp>
            <div className="bg-[#0D0D0D] rounded-3xl overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3 relative">
                <img
                  src="/archana.webp"
                  alt="Archana Gavas — Principal Architect, Anvitam"
                  className="w-full h-80 md:h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
              </div>
              <div className="md:w-2/3 p-10 md:p-16 flex flex-col justify-center">
                <span className="inline-block text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-6">
                  ✦ Principal Architect &amp; Founder
                </span>
                <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-6">
                  Archana Gavas
                </h2>
                <p className="text-white/70 text-base leading-relaxed mb-4">
                  Based in Vadodara and working across geographies, Archana approaches design through careful observation, research, and time spent understanding the land. Each project begins by listening to climate, materials, and how a place is meant to be lived in.
                </p>
                <p className="text-white/70 text-base leading-relaxed mb-8">
                  Her work spans farm retreats, wellness environments, and biophilic interiors across India, the USA, Australia, and Bali, shaped by a commitment to ecological responsibility, material honesty, and craft-led making rather than trends.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href={TOPMATE} target="_blank" rel="noreferrer" className={neonBtn}>
                    Book a Session <ArrowRight size={16} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/archana-gavas/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold hover:border-white transition-colors"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-24 px-6 md:px-16 lg:px-24 bg-[#EFEFEB] border-t border-black/5">
        <div className="max-w-screen-xl mx-auto text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#111]/60 mb-8">
              <span>↓</span> Start a Project
            </div>
            <h2 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Ready to Design<br />
              <span className="text-[#888] font-light italic font-serif">with Nature?</span>
            </h2>
            <p className="text-[#555] text-base max-w-xl mx-auto mb-10">
              Whether it's a farm retreat, wellness centre, or urban home — we'd love to hear about your
              vision. Let's start with a design consultation or estimate your project fit.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href={TOPMATE} target="_blank" rel="noreferrer" className={neonBtn}>
                Book a Consultation <ArrowRight size={16} />
              </a>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-estimator'))}
                className={outlineBtn}
              >
                <Calculator size={16} /> Estimate Project Fit
              </button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
};

export default Why;