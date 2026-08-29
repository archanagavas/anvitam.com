// components/tools/AllToolsDrawer.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Sparkles, MapPin, ArrowRight, Zap } from 'lucide-react';
import { TOOLS_SUITE, ToolItem } from '../../constants/toolsData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeToolId?: string;
}

export const AllToolsDrawer: React.FC<Props> = ({ isOpen, onClose, activeToolId }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const filteredTools = TOOLS_SUITE.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.shortDesc.toLowerCase().includes(search.toLowerCase()) ||
    tool.category.toLowerCase().includes(search.toLowerCase()) ||
    (tool.subModules && tool.subModules.some(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())))
  );

  const handleLaunch = (href: string) => {
    onClose();
    navigate(href);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 font-sans antialiased text-[#111111]"
            role="dialog"
            aria-modal="true"
            aria-label="All Studio Tools Navigation"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200/80 bg-white flex items-center justify-between gap-4 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black text-[#CCFF00] flex items-center justify-center font-bold text-sm shadow-2xs">
                  A
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">Anvitam Flagship Studios</h2>
                  <p className="text-xs text-gray-500 font-medium">2 Consolidated Architectural Workspace Canvases</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black flex items-center justify-center transition cursor-pointer"
                aria-label="Close tools drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200/80">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter studios & modules (e.g. Interior, Shadow, Wind, Soil)..."
                  aria-label="Filter studios by name or feature"
                  className="w-full bg-white border border-gray-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-1 focus:ring-black font-normal transition"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear tool search input"
                    className="absolute right-3 text-xs text-gray-400 hover:text-gray-600 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Tools List */}
            <nav className="flex-1 overflow-y-auto p-6 space-y-8" aria-label="Studio Tools List">
              {filteredTools.map(tool => {
                const isActive = activeToolId === tool.id;
                return (
                  <div key={tool.id} className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-200/70">
                    <button
                      type="button"
                      onClick={() => handleLaunch(tool.href)}
                      className={`group p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 w-full focus:outline-none ${
                        isActive
                          ? 'bg-black text-[#CCFF00] border-black shadow-md'
                          : 'bg-white border-gray-200 hover:border-black hover:bg-white shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-[#CCFF00] text-black' : 'bg-gray-100 text-gray-900 group-hover:bg-black group-hover:text-[#CCFF00]'
                        } transition-colors`}>
                          {tool.iconSvg}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-bold truncate ${isActive ? 'text-[#CCFF00]' : 'text-gray-900'}`}>
                              {tool.name}
                            </h4>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              isActive ? 'bg-white/10 text-white' : 'bg-[#CCFF00] text-black border border-black/10'
                            }`}>
                              {tool.badge}
                            </span>
                          </div>
                          <p className={`text-xs line-clamp-1 mt-0.5 font-normal ${
                            isActive ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {tool.shortDesc}
                          </p>
                        </div>
                      </div>

                      <ArrowRight size={16} className={`shrink-0 transition-transform group-hover:translate-x-1 ${
                        isActive ? 'text-[#CCFF00]' : 'text-gray-400 group-hover:text-black'
                      }`} />
                    </button>

                    {/* Sub-module buttons list inside drawer */}
                    {tool.subModules && tool.subModules.length > 0 && (
                      <div className="pt-2 pl-2 space-y-1.5 border-t border-gray-200/60">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Included Modules:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {tool.subModules.map(sub => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleLaunch(sub.href)}
                              className="p-2 rounded-lg bg-white hover:bg-black hover:text-[#CCFF00] text-gray-700 text-xs font-medium border border-gray-200/70 transition flex items-center justify-between text-left group/sub cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <span>{sub.icon}</span>
                                <span className="truncate">{sub.name}</span>
                              </span>
                              <ChevronRight size={12} className="text-gray-400 group-hover/sub:text-[#CCFF00] shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredTools.length === 0 && (
                <div className="text-center py-12 text-gray-500 space-y-2">
                  <p className="text-sm font-semibold">No studios found matching "{search}"</p>
                  <p className="text-xs text-gray-400">Try searching for "Interior", "3D", "Sun", "Shadow", "Soil", or "Wind"</p>
                </div>
              )}
            </nav>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>2 Flagship Studios Active</span>
              <button
                type="button"
                onClick={() => handleLaunch('/dashboard')}
                aria-label="Navigate to Master Studio Dashboard"
                className="text-black font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Go to Master Dashboard →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
