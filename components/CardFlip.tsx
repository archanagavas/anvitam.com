import React, { useState } from 'react';
import { ArrowRight, Repeat2, LucideIcon, CheckCircle2 } from 'lucide-react';

export interface CardFlipProps {
  icon?: LucideIcon;
  subtitle?: string;
  title: string;
  description: string;
  features: string[];
  ctaText?: string;
  backImage?: string;
  onCtaClick?: () => void;
}

export const CardFlip: React.FC<CardFlipProps> = ({
  icon: Icon,
  subtitle,
  title,
  description,
  features,
  ctaText = 'Book Workshop Inquiry',
  backImage,
  onCtaClick,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group relative h-[380px] w-full [perspective:2000px] cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative h-full w-full [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
        }`}
      >
        {/* ── FRONT OF CARD ── */}
        <div
          className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(0deg)] overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-xs transition-shadow duration-500 group-hover:shadow-lg flex flex-col justify-between p-6"
        >
          {/* Ambient Glow */}
          <div aria-hidden="true" className="absolute top-0 right-0 left-0 h-32 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-[#CCFF00]/40 blur-xl group-hover:scale-125 transition-transform duration-700" />
          </div>

          <div className="relative z-10 space-y-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
                <Icon size={20} />
              </div>
            )}
            {subtitle && (
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                {subtitle}
              </p>
            )}
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 font-normal">
              {description}
            </p>
          </div>

          <div className="relative z-10 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
              Hover / Tap to flip photo
            </span>
            <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-700 group-hover:rotate-180 transition-transform duration-500">
              <Repeat2 size={15} />
            </div>
          </div>
        </div>

        {/* ── BACK OF CARD ── */}
        <div
          className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden rounded-2xl border border-gray-800 shadow-xl relative"
        >
          {backImage ? (
            <div className="relative w-full h-full">
              <img
                src={backImage}
                alt={title}
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#D1F0AA] text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    {subtitle || title}
                  </span>
                  <div className="p-1.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10">
                    <Repeat2 size={15} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onCtaClick) onCtaClick();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#CCFF00] text-black font-black text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 cursor-pointer"
                >
                  <span>{ctaText}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-7 bg-gray-900 text-white flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest">
                    Key Benefits
                  </span>
                  <Repeat2 size={16} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  {title}
                </h3>
                <div className="space-y-2.5 pt-2">
                  {features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 text-xs text-gray-200 font-medium transition-all duration-300"
                      style={{
                        transform: isFlipped ? 'translateX(0)' : 'translateX(-12px)',
                        opacity: isFlipped ? 1 : 0,
                        transitionDelay: `${idx * 60 + 150}ms`,
                      }}
                    >
                      <CheckCircle2 size={15} className="text-[#CCFF00] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onCtaClick) onCtaClick();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#CCFF00] text-black font-black text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-300/20 cursor-pointer"
                >
                  <span>{ctaText}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardFlip;
