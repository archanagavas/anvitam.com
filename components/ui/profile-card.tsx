import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Mail, ArrowRight } from 'lucide-react';

interface ProfileCardProps {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
  linkedinUrl?: string;
  emailUrl?: string;
  profileUrl?: string;
  badge?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name = "Archana Gavas",
  role = "Founder & Principal Architect, Ecological Design",
  bio = "Archana Gavas is an architect interested in what happens when we stop treating buildings, landscapes, and ecosystems as separate things. Her work sits at the intersection of architecture, permaculture, climate-responsive design, and natural building.",
  imageSrc = "/archana.png",
  linkedinUrl = "https://www.linkedin.com/in/archana-gavas/",
  emailUrl = "mailto:ar.archanagavas@gmail.com",
  badge = "The Architect",
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto py-12">
      {badge && (
        <div className="inline-flex items-center gap-2 border border-[#111]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#111] mb-10">
          ↓ {badge}
        </div>
      )}

      <div className="relative flex flex-col lg:flex-row items-center justify-center">
        {/* Left Profile Image Container */}
        <div className="w-full lg:w-[480px] shrink-0 h-[480px] sm:h-[520px] rounded-[32px] overflow-hidden bg-[#e5dfd5] shadow-xl relative border border-gray-200">
          <img
            src={imageSrc}
            alt={`${name} - ${role}`}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.src = "/archana.png";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        {/* Overlapping Dark Card (Right) */}
        <div className="w-full lg:w-[580px] bg-[#18181B] border border-white/10 rounded-[28px] p-8 sm:p-10 md:p-12 shadow-2xl mt-6 lg:mt-0 lg:-ml-24 z-10 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
              {name}
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-medium mb-6">
              {role}
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
              {bio}
            </p>
          </div>

          {/* Circular Action / Social Buttons Row */}
          <div className="flex items-center gap-4 pt-2">
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-12 h-12 rounded-full bg-white text-black hover:bg-[#CCFF00] hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-md"
              >
                <Linkedin size={20} />
              </a>
            )}
            {emailUrl && (
              <a
                href={emailUrl}
                aria-label="Email"
                className="w-12 h-12 rounded-full bg-white text-black hover:bg-[#CCFF00] hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-md"
              >
                <Mail size={20} />
              </a>
            )}
            <Link
              to="/contact"
              className="ml-auto inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-300 hover:text-white transition-colors"
            >
              Get in Touch <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
