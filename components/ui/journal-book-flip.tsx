import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, ChevronLeft, ChevronRight, Bookmark, X, Sparkles } from 'lucide-react';
import { BlogPost } from '../../types';
import { cn } from '../../lib/utils';

interface JournalBookFlipProps {
  items: BlogPost[];
  className?: string;
}

export function JournalBookFlip({ items, className }: JournalBookFlipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  if (!items || items.length === 0) return null;

  const activePost = items[currentPage];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection('next');
    setCurrentPage((prev) => (prev + 1) % items.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection('prev');
    setCurrentPage((prev) => (prev - 1 + items.length) % items.length);
  };

  // Variants for 3D page flip effect
  const pageVariants = {
    initial: (dir: 'next' | 'prev') => ({
      rotateY: dir === 'next' ? 90 : -90,
      opacity: 0,
      scale: 0.96,
      transformOrigin: dir === 'next' ? 'left center' : 'right center',
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1],
      },
    },
    exit: (dir: 'next' | 'prev') => ({
      rotateY: dir === 'next' ? -90 : 90,
      opacity: 0,
      scale: 0.96,
      transformOrigin: dir === 'next' ? 'right center' : 'left center',
      transition: {
        duration: 0.4,
        ease: [0.7, 0, 0.84, 0],
      },
    }),
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto my-4 px-2 sm:px-4", className)}>
      {!isOpen ? (
        /* ════ CLOSED BOOK / JOURNAL COVER STATE ════ */
        <motion.div
          onClick={() => setIsOpen(true)}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-xl mx-auto h-[380px] sm:h-[420px] rounded-[24px] bg-[#111111] text-white p-6 sm:p-10 shadow-2xl cursor-pointer overflow-hidden border border-stone-800 flex flex-col justify-between group"
          style={{ perspective: 1200 }}
        >
          {/* Decorative Journal Book Spine (Left edge accent) */}
          <div className="absolute top-0 bottom-0 left-0 w-5 sm:w-6 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 border-r border-stone-700/60 shadow-inner flex flex-col justify-between items-center py-6">
            <div className="w-1.5 h-12 rounded-full bg-[#CCFF00]/40" />
            <div className="w-1.5 h-12 rounded-full bg-white/20" />
            <div className="w-1.5 h-12 rounded-full bg-[#CCFF00]/40" />
          </div>

          {/* Golden Ribbon Bookmark Hanging from top */}
          <div className="absolute top-0 right-10 z-20 transition-transform duration-300 group-hover:translate-y-2">
            <div className="w-6 h-16 bg-[#CCFF00] text-black flex items-end justify-center pb-2 shadow-md clip-bookmark">
              <Bookmark size={14} className="fill-black text-black" />
            </div>
          </div>

          {/* Book Cover Content */}
          <div className="pl-6 sm:pl-8 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#CCFF00] border border-white/15 text-[10px] font-bold uppercase tracking-widest mb-6">
              <Sparkles size={12} /> ANVITAM ARCHITECTURE JOURNAL
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3 group-hover:text-[#CCFF00] transition-colors">
              Learn Before You Build.
            </h3>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              An interactive journal on permaculture, eco retreats, vernacular architecture, and sustainable land planning.
            </p>
          </div>

          {/* Bottom Action Badge */}
          <div className="pl-6 sm:pl-8 flex items-center justify-between border-t border-stone-800 pt-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
              <BookOpen size={16} className="text-[#CCFF00]" />
              <span>{items.length} Journal Entries Inside</span>
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#CCFF00] text-black font-bold text-xs group-hover:scale-105 transition-transform shadow-lg shadow-[#CCFF00]/20">
              <span>Open Journal</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </motion.div>
      ) : (
        /* ════ OPEN JOURNAL BOOK SPREAD STATE ════ */
        <div className="relative w-full">
          {/* Header Bar with Close & Page Counter */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#111] text-[#CCFF00]">
                Journal Page {currentPage + 1} of {items.length}
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold text-stone-500">
                Click corners or arrows to turn pages
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <X size={14} />
              <span>Close Journal</span>
            </button>
          </div>

          {/* 3D Book Page Container */}
          <div className="relative w-full h-[450px] sm:h-[420px] bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden [perspective:1400px]">
            {/* Center Book Spine Divider (visible on desktop) */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-stone-200/50 via-stone-300/80 to-stone-200/50 z-20 pointer-events-none shadow-inner" />

            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activePost.id || currentPage}
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full h-full grid grid-cols-1 md:grid-cols-2 bg-white"
              >
                {/* ── LEFT PAGE: TEXT & EXCERPT ── */}
                <div className="p-6 sm:p-8 flex flex-col justify-between h-full border-b md:border-b-0 md:border-r border-stone-200/80 bg-[#FAF9F6] relative">
                  {/* Page watermark number */}
                  <div className="absolute top-4 right-6 text-3xl font-black text-stone-200/60 select-none">
                    0{currentPage + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#111] text-[#CCFF00] text-[10px] font-bold uppercase tracking-wider">
                        {activePost.tags?.[0] || 'Journal'}
                      </span>
                      <span className="text-xs text-stone-400 font-medium">
                        {activePost.date}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug mb-3 hover:text-stone-600 transition-colors">
                      {activePost.title}
                    </h3>

                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-4">
                      {activePost.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-200 flex items-center justify-between mt-auto">
                    <Link
                      to={`/blog/${activePost.slug || activePost.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111] text-white hover:bg-[#CCFF00] hover:text-black text-xs font-bold transition-all duration-300 shadow-md group"
                    >
                      <span>Read Full Entry</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      By {activePost.author || 'Archana Gavas'}
                    </span>
                  </div>
                </div>

                {/* ── RIGHT PAGE: FEATURED IMAGE & TURN CONTROLS ── */}
                <div className="relative h-48 md:h-full overflow-hidden bg-stone-900 group">
                  <img
                    src={activePost.image || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop'}
                    alt={activePost.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Corner Fold Hint */}
                  <div 
                    onClick={handleNext}
                    className="absolute bottom-0 right-0 w-12 h-12 bg-white/90 backdrop-blur-md cursor-pointer flex items-end justify-end p-2 rounded-tl-2xl shadow-lg border-t border-l border-stone-300 hover:scale-110 transition-transform z-30"
                    title="Next Page"
                  >
                    <ChevronRight size={18} className="text-black" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrow Controls */}
            <button
              onClick={handlePrev}
              aria-label="Previous Page"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-stone-300 shadow-xl hover:bg-[#111] hover:text-white transition-all flex items-center justify-center z-40 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={handleNext}
              aria-label="Next Page"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-stone-300 shadow-xl hover:bg-[#111] hover:text-white transition-all flex items-center justify-center z-40 cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Page Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setDirection(idx > currentPage ? 'next' : 'prev');
                  setCurrentPage(idx);
                }}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 cursor-pointer",
                  currentPage === idx ? "w-8 bg-[#111]" : "w-2 bg-stone-300 hover:bg-stone-400"
                )}
                aria-label={`Jump to page ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalBookFlip;
