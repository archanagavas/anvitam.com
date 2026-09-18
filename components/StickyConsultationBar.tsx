import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface StickyConsultationBarProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

export const StickyConsultationBar: React.FC<StickyConsultationBarProps> = ({
  title = "Planning a farm retreat, eco-resort, or passive solar villa?",
  subtitle = "Have Ar. Archana Gavas review your land contours, climate data, and water harvesting plan.",
  ctaText = "Book Masterplanning Review →"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('anvitam_cro_dock_dismissed')) {
      setIsDismissed(true);
      return;
    }

    // Show after scrolling 200px or after 3 seconds
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(() => setIsVisible(true), 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  if (isDismissed || !isVisible) return null;

  return (
    <aside aria-label="Consultation booking banner" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-50 animate-fade-in font-sans">
      <div className="bg-gradient-to-r from-[#03160E] via-[#052A1A] to-[#03160E] text-white p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-[#CCFF00]/40 flex items-center justify-between gap-3 sm:gap-4 backdrop-blur-md">
        
        {/* Architect Thumbnail & Pitch */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src="/archana.png"
              alt="Ar. Archana Gavas"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[#CCFF00] shadow-md"
              onError={(e) => {
                // Fallback avatar icon
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#03160E] rounded-full"></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[11px] sm:text-xs font-bold text-[#CCFF00] tracking-wide flex items-center gap-1 truncate">
                <Sparkles size={12} /> Ar. Archana Gavas
              </span>
              <span className="hidden sm:inline text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                1-on-1 Review
              </span>
            </div>
            <p className="text-xs sm:text-[13px] font-semibold text-white leading-tight line-clamp-1 sm:line-clamp-2">
              {title}
            </p>
            <p className="hidden sm:block text-[11px] text-gray-300 mt-0.5 line-clamp-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* CTA & Close */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://topmate.io/archanagavas"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#CCFF00] hover:bg-[#b8e600] text-[#03160E] font-black text-xs px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <span>{ctaText}</span>
            <ArrowRight size={13} className="shrink-0" />
          </a>

          <button
            onClick={() => {
              setIsDismissed(true);
              sessionStorage.setItem('anvitam_cro_dock_dismissed', 'true');
            }}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition shrink-0"
            aria-label="Dismiss banner"
          >
            <X size={15} />
          </button>
        </div>

      </div>
    </aside>
  );
};

export default StickyConsultationBar;
