import React from 'react';
import { useContent } from '../context/ContentContext';

const SlidingTestimonials: React.FC = () => {
  const { testimonials } = useContent();

  const defaultTestimonials = [
    {
      id: 't1',
      author: 'Sophie D.',
      role: 'Property Owner, Farm Retreat',
      text: 'We chose Anvitam for their regenerative architecture expertise, and they delivered far beyond expectations. Clean spatial planning, clear communication, and stunning climate-responsive design.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 't2',
      author: 'Jessica T.',
      role: 'Founder, EcoStay Resorts',
      text: 'Our booking conversion rates jumped 35% after launching the new farm stay layout. The biophilic, guest-first approach was exactly what we needed.',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 't3',
      author: 'Lucas K.',
      role: 'Managing Director, Permaculture Estate',
      text: 'From the first meeting, Archana was professional and visionary. Her landscape integration and food forest masterplan gave our retreat its signature identity.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 't4',
      author: 'Helen Y.',
      role: 'Architectural Consultant',
      text: 'As a developer, I appreciated how clean and reusable the codebase was. Preline made it easy to hand off to our internal team.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 't5',
      author: 'Daniel N.',
      role: 'Resort Developer, Vanvagado',
      text: 'We needed fast, flexible frontend support, and they delivered. Preline was the perfect foundation for our growing platform.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 't6',
      author: 'Aarav Sharma',
      role: 'Retreat Owner, Maharashtra',
      text: 'Anvitam turned our raw land into a thriving organic sanctuary. The mud-brick cottages and rainwater harvesting masterplan are marvels of modern engineering.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop'
    }
  ];

  const allTestimonials = (Array.isArray(testimonials) && testimonials.length > 0) 
    ? testimonials 
    : defaultTestimonials;

  // Split testimonials into row 1 and row 2 safely
  const midPoint = Math.max(1, Math.ceil(allTestimonials.length / 2));
  const row1Original = allTestimonials.slice(0, midPoint);
  const row2Original = allTestimonials.slice(midPoint).length > 0 ? allTestimonials.slice(midPoint) : row1Original;

  // Multiply items to ensure continuous infinite loop across all screen sizes
  const row1 = [...row1Original, ...row1Original, ...row1Original, ...row1Original];
  const row2 = [...row2Original, ...row2Original, ...row2Original, ...row2Original];

  return (
    <div className="w-full overflow-hidden py-4 space-y-6 select-none relative">
      {/* Gradient edge masks for smooth fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      {/* ── ROW 1: Moves Left ── */}
      <div className="flex w-max animate-marquee-left hover:[animation-play-state:paused] gap-5">
        {row1.map((item, idx) => {
          const authorName = item?.author || 'Client';
          const roleTitle = item?.role || '';
          const reviewText = item?.text || '';
          const avatarUrl = item?.image || '';
          const initials = authorName.slice(0, 2).toUpperCase();

          return (
            <div
              key={`r1-${item?.id || 'idx'}-${idx}`}
              className="w-[320px] sm:w-[380px] shrink-0 bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3.5 mb-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={authorName} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                    {initials}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm tracking-tight">{authorName}</h4>
                  {roleTitle && <p className="text-xs text-gray-400 font-medium mt-0.5">{roleTitle}</p>}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                "{reviewText}"
              </p>
            </div>
          );
        })}
      </div>

      {/* ── ROW 2: Moves Right (Opposite Direction) ── */}
      <div className="flex w-max animate-marquee-right hover:[animation-play-state:paused] gap-5">
        {row2.map((item, idx) => {
          const authorName = item?.author || 'Client';
          const roleTitle = item?.role || '';
          const reviewText = item?.text || '';
          const avatarUrl = item?.image || '';
          const initials = authorName.slice(0, 2).toUpperCase();

          return (
            <div
              key={`r2-${item?.id || 'idx'}-${idx}`}
              className="w-[320px] sm:w-[380px] shrink-0 bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3.5 mb-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={authorName} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                    {initials}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm tracking-tight">{authorName}</h4>
                  {roleTitle && <p className="text-xs text-gray-400 font-medium mt-0.5">{roleTitle}</p>}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                "{reviewText}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SlidingTestimonials;
