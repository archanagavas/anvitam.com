import React from 'react';

/**
 * React 19 native Document Metadata drop-in replacement for react-helmet-async.
 *
 * React 19 natively hoists <title>, <meta>, and <link> tags to <head> without
 * manual DOM manipulation. react-helmet-async directly called parentNode.removeChild
 * outside React's reconciler, which caused React 19's commitDeletionEffectsOnFiber
 * to throw "Cannot read properties of null (reading 'removeChild')" on every route change,
 * corrupting the fiber tree and requiring users to click 2-3 times to navigate.
 */
export const Helmet: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const HelmetProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default Helmet;

