import React from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition — instant entry reveal with zero exit blocking.
 * Never blocks the incoming route with mode="wait" (which caused the double-click bug).
 */
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.16,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
