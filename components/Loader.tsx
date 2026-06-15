import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const Loader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  // Simulate loading progress over 2.5 seconds (to match App.tsx timeout)
  useEffect(() => {
    const totalDuration = 2000; // 2 seconds to reach 100%
    const updateInterval = 50; 
    const steps = totalDuration / updateInterval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, updateInterval);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#03160E] z-[9999] flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-[400px] h-[400px] bg-[#CCFF00] rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Main Hindi Text */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl font-serif text-[#FAFAFA] font-medium tracking-wide mb-10"
        >
          अन्वितम
        </motion.div>

        {/* Sleek Loading Bar */}
        <div className="w-56 h-[1px] bg-white/20 overflow-hidden mb-6">
          <motion.div 
            className="h-full bg-[#CCFF00]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>

        {/* English Small Text */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="flex items-center gap-3 font-sans"
        >
          <span className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-bold">
            Loading Anvitam
          </span>
          <span className="text-[#CCFF00] text-[10px] font-bold font-mono">
            {Math.min(100, Math.round(progress))}%
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default Loader;