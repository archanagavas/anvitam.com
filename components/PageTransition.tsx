import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition — smooth clip-path reveal + fade, mirroring Biogax's polished transitions.
 * Uses a curtain wipe: page slides up from y:30 with an opacity fade,
 * and exits with a fast fade+scale-down to feel snappy.
 */
/**
 * PageTransition — smooth, instant page entry with zero navigation delay.
 * Eliminates double-click bugs caused by sluggish 550ms exit blocking.
 */
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
