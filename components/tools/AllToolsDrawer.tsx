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
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredTools = TOOLS_SUITE.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.shortDesc.toLowerCase().includes(search.toLowerCase()) ||
    tool.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [
    { key: 'ai-design', title: 'AI Design Studio', subtitle: 'Generative AI Interior, Exterior & Yard Tools' },
    { key: 'Sun & Site', title: 'Sun & Site Analysis', subtitle: 'Site selection, heights, slopes & roads' },
    { key: '3D & Shadows', title: '3D & Shadow Simulation', subtitle: 'Solar path, heatmaps & facade exposure' },
    { key: 'Weather & Wind', title: 'Weather & Wind Vectors', subtitle: 'Wind direction, climate & solar angles' },
    { key: 'Soil & Water', title: 'Soil, Water & Solar Energy', subtitle: 'SoilGrids, rainwater & PV potential' },
    { key: 'Building Cost & Carbon', title: 'Embodied Carbon & Cost', subtitle: 'Green materials & cost estimation' },
  ];

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
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200/80 bg-white flex items-center justify-between gap-4 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black text-[#CCFF00] flex items-center justify-center font-semibold text-sm shadow-2xs">
                  A
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 leading-tight">Anvitam Studio Tools</h2>
                  <p className="text-xs text-gray-500 font-medium">All 21+ Architectural AI & Site Intelligence Suite</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black flex items-center justify-center transition cursor-pointer"
                aria-label="Close drawer"
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
                  placeholder="Filter 21+ tools by name, feature or category..."
                  className="w-full bg-white border border-gray-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-black focus:ring-1 focus:ring-black font-normal transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 text-xs text-gray-400 hover:text-gray-600 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Tools List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {categories.map(cat => {
                const categoryTools = filteredTools.filter(t => {
                  if (cat.key === 'ai-design') return t.id.startsWith('ai-');
                  return t.category === cat.key;
                });

                if (categoryTools.length === 0) return null;

                return (
                  <div key={cat.key} className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#CCFF00] border border-black/20" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">{cat.title}</h3>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium pl-4">{cat.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 pl-1">
                      {categoryTools.map(tool => {
                        const isActive = activeToolId === tool.id;
                        return (
                          <div
                            key={tool.id}
                            onClick={() => handleLaunch(tool.href)}
                            className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isActive
                                ? 'bg-black text-[#CCFF00] border-black shadow-md'
                                : 'bg-white border-gray-200/80 hover:border-gray-400 hover:bg-gray-50/80 shadow-2xs'
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
                                  <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-[#CCFF00]' : 'text-gray-900'}`}>
                                    {tool.name}
                                  </h4>
                                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                                    isActive ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {tool.badge}
                                  </span>
                                </div>
                                <p className={`text-[11px] line-clamp-1 mt-0.5 font-normal ${
                                  isActive ? 'text-gray-300' : 'text-gray-500'
                                }`}>
                                  {tool.shortDesc}
                                </p>
                              </div>
                            </div>

                            <ArrowRight size={16} className={`shrink-0 transition-transform group-hover:translate-x-1 ${
                              isActive ? 'text-[#CCFF00]' : 'text-gray-400 group-hover:text-black'
                            }`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredTools.length === 0 && (
                <div className="text-center py-12 text-gray-500 space-y-2">
                  <p className="text-sm font-semibold">No tools found matching "{search}"</p>
                  <p className="text-xs text-gray-400">Try searching for "Interior", "Sun", "Shadow", "Soil", or "Wind"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>21+ Tools Active</span>
              <button
                onClick={() => handleLaunch('/dashboard')}
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
