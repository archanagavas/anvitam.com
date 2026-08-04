import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { ExternalLink, ShoppingBag, BookOpen, FileText, Layers, Video, ArrowRight, Star, Users, Clock, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOPMATE_BASE = 'https://topmate.io/archanagavas';

const getEmbedUrl = (url: string): { embedUrl: string; type: 'youtube' | 'instagram' } | null => {
  if (!url || !url.trim()) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&autoplay=1`, type: 'youtube' };
  const igMatch = url.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
  if (igMatch) return { embedUrl: `https://www.instagram.com/${igMatch[1]}/${igMatch[2]}/embed/`, type: 'instagram' };
  return null;
};

// ── Static course data (Topmate-hosted) ──────────────────────────────────
const COURSES = [
  {
    id: 'c1',
    title: 'Farm Retreat Design Masterclass',
    subtitle: 'Eco Architecture & Permaculture Integration',
    description: 'A comprehensive online course covering site analysis, bioclimatic design, permaculture zoning, and how to create profitable eco-retreat experiences from scratch.',
    duration: '6 hours',
    students: '120+',
    rating: '4.9',
    price: '₹3,999',
    link: `${TOPMATE_BASE}`,
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
    tags: ['Architecture', 'Permaculture', 'Business'],
    level: 'Intermediate',
  },
  {
    id: 'c2',
    title: 'Food Forest Design Blueprint',
    subtitle: 'Edible Landscapes & Agroforestry',
    description: 'Design productive food forests and edible gardens for farm stays, community spaces, and personal properties using proven permaculture techniques.',
    duration: '4.5 hours',
    students: '85+',
    rating: '4.8',
    price: '₹2,499',
    link: `${TOPMATE_BASE}`,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
    tags: ['Food Forest', 'Landscape', 'Sustainability'],
    level: 'Beginner',
  },
  {
    id: 'c3',
    title: 'Airbnb & Homestay Design for Revenue',
    subtitle: 'Turn Your Property into a Hospitality Asset',
    description: 'Learn how to design, style, and position your Airbnb or homestay for maximum occupancy, guest satisfaction, and profitable returns.',
    duration: '3 hours',
    students: '200+',
    rating: '5.0',
    price: '₹1,999',
    link: `${TOPMATE_BASE}`,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    tags: ['Airbnb', 'Interior', 'Hospitality'],
    level: 'Beginner',
  },
];

// ── Product category tabs ─────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'All', label: 'All Products', icon: ShoppingBag },
  { id: 'E-Books', label: 'E-Books', icon: BookOpen },
  { id: 'Guides', label: 'Guides', icon: FileText },
  { id: 'Resources', label: 'Resources', icon: Layers },
  { id: 'Consultation', label: 'Consultation', icon: Video },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const Shop: React.FC = () => {
  const { digitalProducts } = useContent();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeVideoModal, setActiveVideoModal] = useState<{ url: string; title: string } | null>(null);

  const filteredProducts = activeCategory === 'All'
    ? digitalProducts.filter(p => p.category !== 'Online Courses')
    : digitalProducts.filter(p => p.category === activeCategory);

  const dbCourses = digitalProducts.filter(p => p.category === 'Online Courses');
  const displayCourses = dbCourses.length > 0 
    ? dbCourses.map(c => {
        const fallback = COURSES.find(item => item.id === c.id);
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          duration: fallback ? fallback.duration : 'Self-paced',
          students: fallback ? fallback.students : '50+',
          rating: fallback ? fallback.rating : '4.9',
          price: c.price,
          link: c.link,
          image: c.image,
          tags: c.tags,
          level: fallback ? fallback.level : 'All levels',
          youtubeUrl: c.youtubeUrl,
          videos: c.videos,
        };
      })
    : COURSES;

  const levelColors: Record<string, string> = {
    Beginner: 'bg-green-50 text-green-700 border-green-200',
    Intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
    Advanced: 'bg-purple-50 text-purple-700 border-purple-200',
    'All levels': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <div className="bg-[#EFEFEB] min-h-screen font-sans">
      <Helmet>
        <title>Shop & Courses | Sustainable Architecture Resources | Anvitam</title>
        <meta name="description" content="Explore Anvitam's curated e-books, guides, resources, and online courses on sustainable architecture, permaculture design, farm retreats, and eco homestays." />
        <meta name="keywords" content="sustainable architecture course, permaculture design guide, eco retreat ebook, farm stay design resources, architecture consultation" />
        <meta name="robots" content="index, follow" />
        <meta name="X-Robots-Tag" content="index, follow" />
        <meta name="publisher" content="Anvitam" />
        <link rel="publisher" href="https://www.anvitam.com/" />
        <link rel="canonical" href="https://www.anvitam.com/shop" />
        <meta property="og:title" content="Shop & Courses | Anvitam" />
        <meta property="og:description" content="E-books, guides, and courses on sustainable architecture and permaculture design." />
      </Helmet>

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6 md:px-16 max-w-screen-xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-6">
            <ShoppingBag size={12} /> Shop & Resources
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold text-[#111] tracking-tight leading-[1.05] mb-6">
            Learn Sustainable<br /><span className="text-[#888]">Architecture & Design</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[#555] text-base max-w-xl leading-relaxed">
            Curated e-books, guides, resources, and online courses to help you design profitable eco-retreats, food forests, and sustainable spaces.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Courses Section ── */}
      <section className="px-6 md:px-16 pb-24 max-w-screen-xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-3">
                <Video size={12} /> Online Courses
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#111] tracking-tight">Learn From Archana Gavas</h2>
              <p className="text-[#555] text-sm mt-1">All courses are hosted on Topmate — click to book or buy</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayCourses.map((course, i) => {
              const hasVideo = course.youtubeUrl || (course.videos && course.videos.length > 0);
              const videoTarget = course.youtubeUrl || (course.videos && course.videos[0]?.url);
              return (
                <motion.div key={course.id} variants={fadeUp} custom={i}>
                  <div className="bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
                    <div className="relative h-52 overflow-hidden">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 rounded-full ${levelColors[course.level] || levelColors.Beginner}`}>
                          {course.level}
                        </span>
                      </div>
                      {hasVideo && videoTarget && (
                        <button
                          onClick={() => setActiveVideoModal({ url: videoTarget, title: course.title })}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors group/play"
                        >
                          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover/play:scale-110 transition-transform">
                            <Play size={20} className="fill-white ml-1" />
                          </div>
                        </button>
                      )}
                      <div className="absolute bottom-0 left-0 p-5 pointer-events-none">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {course.tags.map(t => (
                            <span key={t} className="text-[10px] font-semibold text-white/80 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                        <h3 className="text-white font-bold text-lg leading-snug">{course.title}</h3>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-[#555] text-sm leading-relaxed mb-4 flex-grow">{course.description}</p>
                      <div className="grid grid-cols-3 gap-2 mb-5 text-center">
                        <div className="bg-gray-50 rounded-xl py-2.5 px-1 border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Duration</p>
                          <p className="text-xs font-bold text-[#111] flex items-center justify-center gap-1"><Clock size={10} />{course.duration}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl py-2.5 px-1 border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Students</p>
                          <p className="text-xs font-bold text-[#111] flex items-center justify-center gap-1"><Users size={10} />{course.students}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl py-2.5 px-1 border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Rating</p>
                          <p className="text-xs font-bold text-[#111] flex items-center justify-center gap-1"><Star size={10} className="text-yellow-500" />{course.rating}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[#111]">{course.price}</span>
                        <a
                          href={course.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#111] px-5 py-2.5 rounded-full text-xs font-bold hover:scale-105 transition-transform"
                        >
                          Enroll on Topmate <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Topmate CTA */}
          <motion.div variants={fadeUp} className="mt-6 bg-[#111] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-2">1:1 Consultation Available</p>
              <h3 className="text-white text-2xl font-bold mb-1">Book a Private Session</h3>
              <p className="text-white/50 text-sm">30 or 60-minute consultation with Archana Gavas on your project.</p>
            </div>
            <a
              href={TOPMATE_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-[#CCFF00] text-[#111] px-7 py-3.5 rounded-full text-sm font-bold hover:scale-105 transition-transform"
            >
              Book on Topmate <ArrowRight size={16} />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Digital Products ── */}
      <section className="bg-white py-20 px-6 md:px-16">
        <div className="max-w-screen-xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-10">
              <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-4">
                <BookOpen size={12} /> Digital Products
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#111] tracking-tight mb-2">E-Books, Guides & Resources</h2>
              <p className="text-[#555] text-sm">Downloadable resources to support your design journey.</p>
            </motion.div>

            {/* Category Filter Tabs */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 flex-wrap mb-10">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      activeCategory === cat.id
                        ? 'bg-[#111] text-white border-[#111]'
                        : 'bg-white text-[#555] border-gray-200 hover:border-gray-400 hover:text-[#111]'
                    }`}
                  >
                    <Icon size={12} /> {cat.label}
                  </button>
                );
              })}
            </motion.div>

            {filteredProducts.length === 0 ? (
              <motion.div variants={fadeUp} className="text-center py-20 text-[#555]">
                <ShoppingBag size={40} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium">No products in this category yet.</p>
                <p className="text-sm mt-1 opacity-60">Check back soon or explore our courses above.</p>
              </motion.div>
            ) : (
              <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => {
                  const hasVideo = product.youtubeUrl || (product.videos && product.videos.length > 0);
                  const videoTarget = product.youtubeUrl || (product.videos && product.videos[0]?.url);
                  return (
                    <motion.div key={product.id} variants={fadeUp}>
                      <div className="group border border-[#0a0a0a]/10 hover:border-[#111]/30 hover:shadow-2xl transition-all duration-500 bg-white flex flex-col h-full rounded-2xl overflow-hidden">
                        <div className="aspect-[4/3] overflow-hidden bg-gray-50 relative">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-4 right-4 bg-[#CCFF00] text-[#111] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full shadow-sm">
                            {product.price}
                          </div>
                          {hasVideo && videoTarget && (
                            <button
                              onClick={() => setActiveVideoModal({ url: videoTarget, title: product.title })}
                              className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/55 transition-colors group/play"
                            >
                              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover/play:scale-110 transition-transform">
                                <Play size={20} className="fill-white ml-1" />
                              </div>
                            </button>
                          )}
                        </div>
                        <div className="p-7 flex flex-col flex-grow">
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {product.tags.map(tag => (
                              <span key={tag} className="text-[10px] uppercase tracking-[0.15em] bg-[#f5f5f0] text-[#555] px-2.5 py-1 rounded-full border border-gray-100">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-xl font-bold text-[#0a0a0a] mb-3 leading-snug group-hover:text-[#555] transition-colors">
                            {product.title}
                          </h3>
                          <p className="text-[#555] text-sm leading-relaxed mb-6 flex-grow">
                            {product.description}
                          </p>

                          {/* Embed Inline or Play Button */}
                          {hasVideo && videoTarget && (
                            <button
                              onClick={() => setActiveVideoModal({ url: videoTarget, title: product.title })}
                              className="mb-4 flex items-center justify-center gap-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-xl text-xs font-bold transition-colors"
                            >
                              <Play size={14} className="fill-red-600 text-red-600" /> Watch Video Overview
                            </button>
                          )}

                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-[#111] text-white py-4 text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#CCFF00] hover:text-[#111] transition-colors rounded-xl"
                          >
                            <ShoppingBag size={14} />
                            <span>Get on Topmate</span>
                            <ExternalLink size={12} className="opacity-60" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Video Modal ── */}
      <AnimatePresence>
        {activeVideoModal && (() => {
          const embed = getEmbedUrl(activeVideoModal.url);
          if (!embed) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideoModal(null)}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-black border border-gray-800 rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl relative"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-850 bg-gray-950">
                  <h4 className="text-white font-bold text-sm truncate pr-4">{activeVideoModal.title}</h4>
                  <button
                    onClick={() => setActiveVideoModal(null)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="aspect-video w-full">
                  <iframe
                    src={embed.embedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={activeVideoModal.title}
                  />
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default Shop;