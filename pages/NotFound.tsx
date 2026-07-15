import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { ArrowLeft, Home, Compass } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden bg-[#03160E] text-[#FAFAFA] font-sans">
      <Helmet>
        <title>404 - Page Not Found | Anvitam</title>
        <meta name="description" content="The page you are looking for does not exist. Explore sustainable architecture and permaculture design on Anvitam." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      {/* Floating abstract organic green blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#CCFF00]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A3B8AF]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 80, delay: 0.1 }}
          className="mb-8 p-6 rounded-full bg-[#052A1A] border border-[#A3B8AF]/20 shadow-2xl relative group"
        >
          <div className="absolute inset-0 bg-[#CCFF00]/5 rounded-full blur-xl scale-0 group-hover:scale-150 transition-transform duration-700" />
          <Compass className="w-16 h-16 text-[#CCFF00] animate-pulse" />
        </motion.div>

        {/* 404 Text */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-8xl sm:text-9xl font-serif font-bold tracking-tight text-[#CCFF00] mb-4 selection:bg-[#FAFAFA] selection:text-[#03160E]"
        >
          404
        </motion.h1>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-2xl sm:text-3xl font-serif font-semibold mb-6 text-[#FAFAFA]"
        >
          Lost in the Canopy?
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-[#A3B8AF] text-base sm:text-lg leading-relaxed mb-12 max-w-md mx-auto"
        >
          The page you are looking for has grown in a different direction, or never existed in our ecosystem. Let's guide you back to the oasis.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link
            to="/"
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#CCFF00] text-[#03160E] font-medium tracking-wide hover:bg-[#b5e000] hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_4px_20px_rgba(204,255,0,0.25)] hover:shadow-[0_8px_30px_rgba(204,255,0,0.4)]"
          >
            <Home className="w-5 h-5" />
            Return to Oasis
          </Link>
          <Link
            to="/services"
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-transparent border border-[#A3B8AF]/30 text-[#FAFAFA] font-medium tracking-wide hover:bg-white/5 hover:border-[#CCFF00]/50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Compass className="w-5 h-5" />
            Explore Services
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
