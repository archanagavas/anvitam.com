import React from 'react';

/**
 * PageTransition — instant, zero-latency route rendering.
 * Eliminates double-click bugs, layout thrashing, and unmount latency when switching pages.
 */
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="w-full">{children}</div>;
};

export default PageTransition;
