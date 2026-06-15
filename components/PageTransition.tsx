import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition — smooth clip-path reveal + fade, mirroring Biogax's polished transitions.
 * Uses a curtain wipe: page slides up from y:30 with an opacity fade,
 * and exits with a fast fade+scale-down to feel snappy.
 */
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ willChange: 'opacity, transform, filter' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
