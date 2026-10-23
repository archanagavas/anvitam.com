import React, { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';

interface StickyConsultationBarProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  customHeadline?: string;
  customSubtext?: string;
  customButtonText?: string;
  targetUrl?: string;
}

export const StickyConsultationBar: React.FC<StickyConsultationBarProps> = ({
  title,
  subtitle,
  ctaText,
  customHeadline,
  customSubtext,
  customButtonText,
  targetUrl = "https://topmate.io/archanagavas"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const displayTitle = customHeadline || title || "Planning a farm retreat, eco-resort, or passive solar villa?";
  const displaySubtitle = customSubtext || subtitle || "Have Ar. Archana Gavas review your land contours, climate data, and water harvesting plan.";
  const rawCta = customButtonText || ctaText || "Book Masterplanning Review";
  const cleanCta = rawCta.replace(/[→\->\s]+$/g, '').trim();

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('anvitam_cro_dock_dismissed')) {
      setIsDismissed(true);
      return;
    }

    // Show after scrolling 150px or after 2.5 seconds
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(() => setIsVisible(true), 2500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  if (isDismissed || !isVisible) return null;

  return (
    <aside
      aria-label="Consultation booking banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-50 animate-fade-in font-sans no-print sticky-consultation-bar"
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#08120D]/95 backdrop-blur-xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3.5 sm:p-4 text-white transition-all duration-300">
        {/* Soft Ambient Depth Glows */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-3 sm:gap-4">
          {/* Architect Thumbnail & Pitch */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-1 ring-white/20 bg-emerald-950/60 shadow-md">
                <img
                  src="/archana.png"
                  alt="Ar. Archana Gavas"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-[#08120D]"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 tracking-tight truncate">
                  Ar. Archana Gavas
                </span>
                <span className="inline-flex items-center text-[10px] text-white/70 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 font-medium">
                  Principal Architect
                </span>
              </div>
              <p className="text-xs sm:text-[13px] font-medium text-white/95 leading-tight line-clamp-1">
                {displayTitle}
              </p>
              <p className="hidden sm:block text-[11px] text-white/50 mt-0.5 line-clamp-1 leading-normal">
                {displaySubtitle}
              </p>
            </div>
          </div>

          {/* CTA & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#CCFF00] hover:bg-[#bbf000] text-[#05110A] font-bold text-xs px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 shadow-md flex items-center gap-1.5 hover:shadow-lg hover:shadow-[#CCFF00]/20 active:scale-[0.98] whitespace-nowrap"
            >
              <span>{cleanCta}</span>
              <ArrowRight size={13} className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>

            <button
              onClick={() => {
                setIsDismissed(true);
                sessionStorage.setItem('anvitam_cro_dock_dismissed', 'true');
              }}
              className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition shrink-0"
              aria-label="Dismiss banner"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StickyConsultationBar;
