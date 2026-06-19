import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxImage {
  url: string;
  caption?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, activeIndex, onClose, onNavigate }) => {
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < images.length - 1;

  const goPrev = useCallback(() => { if (canGoPrev) onNavigate(activeIndex - 1); }, [activeIndex, canGoPrev, onNavigate]);
  const goNext = useCallback(() => { if (canGoNext) onNavigate(activeIndex + 1); }, [activeIndex, canGoNext, onNavigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goPrev, goNext]);

  const current = images[activeIndex];
  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
      className="fixed inset-0 z-[500] flex flex-col bg-black/95"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs font-mono tracking-widest uppercase">
            {activeIndex + 1} / {images.length}
          </span>
          {current.caption && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-white/70 text-sm font-light truncate max-w-[300px]">
                {current.caption}
              </span>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          aria-label="Close gallery (Esc)"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main image area — fills all available space, image is contained */}
      <div
        className="flex-1 flex items-center justify-center relative min-h-0 px-16"
        onClick={e => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            onClick={goPrev}
            disabled={!canGoPrev}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10 ${!canGoPrev ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110'}`}
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <img
          key={current.url}
          src={current.url}
          alt={current.caption || `Gallery image ${activeIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none rounded-lg"
          style={{ maxHeight: 'calc(100vh - 180px)' }}
          draggable={false}
        />

        {images.length > 1 && (
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10 ${!canGoNext ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110'}`}
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="flex-shrink-0 py-4 px-5 overflow-x-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex gap-2 justify-center min-w-max mx-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onNavigate(i)}
                className={`w-14 h-10 rounded-md overflow-hidden flex-shrink-0 transition-all border-2 ${
                  i === activeIndex
                    ? 'border-[#CCFF00] opacity-100 scale-105'
                    : 'border-transparent opacity-40 hover:opacity-70'
                }`}
                aria-label={`Go to image ${i + 1}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard hint */}
      <div className="text-center pb-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/20 text-[10px] tracking-widest font-mono">
          ← → to navigate · ESC to close
        </span>
      </div>
    </div>
  );
};

export default ImageLightbox;
