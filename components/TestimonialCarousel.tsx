import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useContent } from '../context/ContentContext';

const THEMES = [
  { bg: 'bg-[#CCFF00]', textStyle: 'text-lg font-bold leading-snug text-[#111]', initialsBg: 'bg-[#111]', initialsText: 'text-white', nameStyle: 'text-[#111]' },
  { bg: 'bg-[#F5F5F2]', textStyle: 'text-[#444] text-sm leading-relaxed', initialsBg: 'bg-[#888]', initialsText: 'text-white', nameStyle: 'text-[#111]' },
  { bg: 'bg-[#F5F5F2]', textStyle: 'text-[#444] text-sm leading-relaxed', initialsBg: 'bg-[#aaa]', initialsText: 'text-white', nameStyle: 'text-[#111]' },
  { bg: 'bg-[#03160E]', textStyle: 'text-lg font-bold text-white leading-snug', initialsBg: 'bg-[#CCFF00]', initialsText: 'text-[#111]', nameStyle: 'text-white' },
];

const TestimonialCarousel: React.FC = () => {
  const { testimonials } = useContent();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!testimonials || testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials]);

  if (!testimonials || testimonials.length === 0) return null;

  const t = testimonials[current];
  const theme = THEMES[current % THEMES.length];
  const initials = t.author ? t.author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C';

  return (
    <div className="flex flex-col items-center w-full my-12">
      <div className="w-full max-w-2xl relative min-h-[280px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`${theme.bg} rounded-2xl p-8 md:p-10 w-full`}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-4">{t.role}</p>
            <p className={theme.textStyle + ' mb-6'}>{'"'}{t.text}{'"'}</p>
            <div className="flex items-center gap-3">
              {t.image ? (
                <img src={t.image} alt={t.author} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className={`w-8 h-8 rounded-full ${theme.initialsBg} flex items-center justify-center ${theme.initialsText} text-xs font-bold`}>
                  {initials}
                </div>
              )}
              <span className={`text-sm font-semibold ${theme.nameStyle}`}>{t.author}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Dots */}
      <div className="flex gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current ? 'bg-[#111] w-6' : 'bg-[#ccc] hover:bg-[#999]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
