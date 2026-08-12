import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, X, RotateCcw, BookOpen } from 'lucide-react';
import { BlogPost } from '../../types';
import { cn } from '../../lib/utils';

interface JournalBookFlipProps {
  items: BlogPost[];
  className?: string;
}

export function JournalBookFlip({ items, className }: JournalBookFlipProps) {
  // bookState: 'closed_front' | 'open' | 'closed_back'
  const [bookState, setBookState] = useState<'closed_front' | 'open' | 'closed_back'>('closed_front');
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');

  if (!items || items.length === 0) return null;

  const totalPosts = items.length;
  const activePost = items[currentPage];

  const handleOpenBook = () => {
    setCurrentPage(0);
    setBookState('open');
  };

  const handleNextPage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isFlipping) return;

    if (currentPage >= totalPosts - 1) {
      // Reached past the last blog post -> Flip close the back cover!
      setIsFlipping(true);
      setTimeout(() => {
        setBookState('closed_back');
        setIsFlipping(false);
      }, 550);
      return;
    }

    setIsFlipping(true);
    setFlipDirection('next');
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setIsFlipping(false);
    }, 550);
  };

  const handlePrevPage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isFlipping) return;

    if (currentPage === 0) {
      // At first page and click prev -> Flip close the front cover!
      setIsFlipping(true);
      setTimeout(() => {
        setBookState('closed_front');
        setIsFlipping(false);
      }, 550);
      return;
    }

    setIsFlipping(true);
    setFlipDirection('prev');
    setTimeout(() => {
      setCurrentPage((prev) => prev - 1);
      setIsFlipping(false);
    }, 550);
  };

  const handleRestart = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookState('closed_front');
    setCurrentPage(0);
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto my-6 px-2 sm:px-4 select-none relative flex flex-col items-center justify-center", className)}>
      {/* Top Close Button (Visible when book is open) */}
      {bookState === 'open' && (
        <div className="w-full max-w-[960px] flex justify-end mb-3 px-2">
          <button
            onClick={() => setBookState('closed_front')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-stone-900 hover:bg-emerald-950 text-white text-xs font-bold transition-all cursor-pointer shadow-md group"
          >
            <X size={14} className="text-stone-400 group-hover:text-white" />
            <span>Close Journal</span>
          </button>
        </div>
      )}

      {/* 3D PHYSICAL BOOK CONTAINER (FULL EDGE-TO-EDGE COVER FILL, NO WHITE BOUNDARY GAPS) */}
      <div 
        className={cn(
          "relative mx-auto transition-all duration-700 h-[480px] sm:h-[520px]",
          bookState === 'open' 
            ? "w-full max-w-[960px] rounded-[18px] shadow-2xl overflow-hidden bg-[#F6F3EB] border border-stone-300/80" 
            : "w-full max-w-[480px] sm:max-w-[508px] aspect-[937/959]"
        )}
        style={{ perspective: '2200px' }}
      >
        {/* ═════════════════════════════════════════════════════════════
            STATE 1: INSIDE BOOK SPREAD (HIGH-END PAPER JOURNAL DESIGN)
           ═════════════════════════════════════════════════════════════ */}
        {bookState === 'open' && (
          <div className="absolute inset-0 w-full h-full bg-[#F6F3EB] z-10">
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 relative">
              {/* Center Book Spine Binding Shadow & Crease */}
              <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/25 via-black/5 to-black/25 z-30 pointer-events-none" />

              {/* ── LEFT PAGE: TEXT & TYPOGRAPHY ── */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-full bg-[#FBF9F4] border-b md:border-b-0 md:border-r border-stone-300/70 relative">
                {/* Fine Paper Rule Top Line */}
                <div className="flex items-center justify-between border-b border-emerald-900/15 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-900 text-[#CCFF00] text-[9px] font-bold uppercase tracking-widest">
                      {activePost.tags?.[0] || 'Journal Entry'}
                    </span>
                    <span className="text-[11px] text-stone-500 font-serif italic">
                      {activePost.date}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-stone-400 font-serif">
                    No. 0{currentPage + 1}
                  </span>
                </div>

                {/* Main Article Title & Excerpt */}
                <div className="my-auto">
                  <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900 leading-snug mb-3 hover:text-emerald-900 transition-colors">
                    {activePost.title}
                  </h3>

                  <p className="text-stone-700 text-xs sm:text-sm font-sans leading-relaxed line-clamp-5">
                    <span className="float-left text-3xl font-serif font-black text-emerald-900 pr-2 pt-0.5 leading-none">
                      {activePost.excerpt.charAt(0)}
                    </span>
                    {activePost.excerpt.slice(1)}
                  </p>
                </div>

                {/* Left Page Bottom Footer & Link */}
                <div className="pt-3 border-t border-emerald-900/15 flex items-center justify-between mt-auto">
                  <Link
                    to={`/blog/${activePost.slug || activePost.id}`}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950 text-[#CCFF00] hover:bg-black text-xs font-bold transition-all shadow-md group"
                  >
                    <span>Read Journal Entry</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform text-[#CCFF00]" />
                  </Link>

                  <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
                    Page {currentPage * 2 + 1}
                  </span>
                </div>
              </div>

              {/* ── RIGHT PAGE: FEATURED PHOTO & FLIP CONTROLS ── */}
              <div className="relative h-48 md:h-full overflow-hidden bg-stone-900 group">
                <img
                  src={activePost.image || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop'}
                  alt={activePost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                {/* Right Page Bottom Footer */}
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                  <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest drop-shadow-md">
                    By {activePost.author || 'Archana Gavas'}
                  </p>
                </div>

                {/* Corner Fold Interactive Page Flip Hint */}
                <div 
                  onClick={handleNextPage}
                  className="absolute bottom-0 right-0 w-16 h-16 bg-white/95 backdrop-blur-md cursor-pointer flex items-end justify-end p-2 rounded-tl-3xl shadow-2xl border-t border-l border-stone-300 hover:scale-110 transition-transform z-30 group/curl"
                  title={currentPage === totalPosts - 1 ? "Close Back Cover" : "Turn Next Page"}
                >
                  <div className="flex items-center gap-1 text-emerald-950 font-extrabold text-[10px] uppercase pb-1 pr-1">
                    <span>{currentPage === totalPosts - 1 ? 'Close' : 'Flip'}</span>
                    <ChevronRight size={16} className="group-hover/curl:translate-x-0.5 transition-transform text-emerald-800" />
                  </div>
                </div>
              </div>

              {/* 3D FLIPPING PAPER PAGE LEAF OVERLAY */}
              <AnimatePresence>
                {isFlipping && (
                  <motion.div
                    key={`flip-${currentPage}-${flipDirection}`}
                    initial={{ rotateY: flipDirection === 'next' ? 0 : -180 }}
                    animate={{ rotateY: flipDirection === 'next' ? -180 : 0 }}
                    transition={{ duration: 0.55, ease: [0.645, 0.045, 0.355, 1.000] }}
                    style={{
                      transformOrigin: 'left center',
                      transformStyle: 'preserve-3d',
                    }}
                    className="hidden md:block absolute top-0 right-0 w-1/2 h-full z-40 shadow-2xl pointer-events-none"
                  >
                    {/* Front side of flipping paper page */}
                    <div 
                      className="absolute inset-0 bg-stone-900 overflow-hidden border-l border-stone-400"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <img
                        src={activePost.image || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop'}
                        alt="Flipping Page"
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
                    </div>

                    {/* Back side of flipping paper page (paper text texture) */}
                    <div 
                      className="absolute inset-0 bg-[#FBF9F4] p-6 border-r border-stone-300 flex flex-col justify-between"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <div className="border-b border-emerald-900/15 pb-2">
                        <span className="text-[9px] font-bold text-emerald-900 uppercase">Anvitam Journal</span>
                      </div>
                      <div className="my-auto">
                        <h4 className="text-lg font-serif font-bold text-stone-900 line-clamp-2 mb-2">
                          {activePost.title}
                        </h4>
                        <p className="text-xs text-stone-600 line-clamp-4 leading-relaxed font-serif italic">
                          "{activePost.excerpt}"
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 font-bold">Turning Page...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Page Turn Arrow Buttons */}
              <button
                onClick={handlePrevPage}
                aria-label="Previous Page"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-stone-300 shadow-xl hover:bg-emerald-950 hover:text-white transition-all flex items-center justify-center z-40 cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={handleNextPage}
                aria-label="Next Page"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-stone-300 shadow-xl hover:bg-emerald-950 hover:text-white transition-all flex items-center justify-center z-40 cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STATE 2: 3D FRONT COVER (FLIPS OPEN TO THE LEFT)
           ═════════════════════════════════════════════════════════════ */}
        <motion.div
          onClick={() => bookState === 'closed_front' && handleOpenBook()}
          initial={false}
          animate={{
            rotateY: bookState !== 'closed_front' ? -180 : 0,
            pointerEvents: bookState === 'closed_front' ? 'auto' : 'none',
          }}
          transition={{
            duration: 0.85,
            ease: [0.645, 0.045, 0.355, 1.000],
          }}
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 w-full h-full cursor-pointer z-40 group"
        >
          <img 
            src="/journal-front-page.png" 
            alt="Anvitam Journal Front Cover Artwork" 
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" 
          />

          <div className="absolute bottom-6 right-6 z-20">
            <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/95 backdrop-blur-md text-emerald-950 border border-emerald-900/20 text-xs font-black uppercase tracking-wider shadow-2xl group-hover:bg-emerald-950 group-hover:text-white transition-all duration-300 transform group-hover:scale-105">
              <BookOpen size={15} className="text-emerald-700 group-hover:text-[#CCFF00] transition-colors" />
              <span>Open Journal</span>
              <ArrowRight size={15} className="text-emerald-700 group-hover:text-[#CCFF00] group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </motion.div>

        {/* ═════════════════════════════════════════════════════════════
            STATE 3: 3D BACK COVER (FLIPS CLOSED OVER THE BACK AT END)
           ═════════════════════════════════════════════════════════════ */}
        <motion.div
          onClick={handleRestart}
          initial={false}
          animate={{
            rotateY: bookState === 'closed_back' ? 0 : 180,
            pointerEvents: bookState === 'closed_back' ? 'auto' : 'none',
          }}
          transition={{
            duration: 0.85,
            ease: [0.645, 0.045, 0.355, 1.000],
          }}
          style={{
            transformOrigin: 'right center',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 w-full h-full cursor-pointer z-30 group"
        >
          <img 
            src="/journal-back-cover.png" 
            alt="Anvitam Journal Back Cover Artwork" 
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" 
          />

          <div className="absolute bottom-6 right-6 z-20">
            <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/95 backdrop-blur-md text-emerald-950 border border-emerald-900/20 text-xs font-black uppercase tracking-wider shadow-2xl group-hover:bg-emerald-950 group-hover:text-white transition-all duration-300 transform group-hover:scale-105">
              <RotateCcw size={15} className="text-emerald-700 group-hover:text-[#CCFF00] transition-colors" />
              <span>Re-open Journal</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Page Dots Navigation (when open) */}
      {bookState === 'open' && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalPosts }).map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(idx);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                currentPage === idx ? "w-8 bg-emerald-950" : "w-2 bg-stone-300 hover:bg-stone-400"
              )}
              aria-label={`Jump to entry ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default JournalBookFlip;
