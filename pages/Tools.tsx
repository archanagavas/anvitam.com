// pages/Tools.tsx — Architectural Site Intelligence Suite Directory (16+ Live Tools)
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Sun, Compass, Layers3, Droplets, Wind, Search, Check, ArrowRight,
  ShieldCheck, Crown, Zap, X, ChevronRight, LayoutGrid
} from 'lucide-react';
import { TOOLS_SUITE, type ToolItem } from '../constants/toolsData';
import { getToolUser } from '../utils/userAuth';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';

export default function Tools() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalTool, setActiveModalTool] = useState<ToolItem | null>(null);
  const [currency] = useState<'INR' | 'USD'>('USD');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingToolRedirect, setPendingToolRedirect] = useState<string | null>(null);

  const categories = ['All', 'Site & Urban', '3D & Shadow (Phase 2)', 'Climate', 'Ecology & Soil', 'Building Science'];

  const filteredTools = TOOLS_SUITE.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLaunchTool = (tool: ToolItem) => {
    const user = getToolUser();
    if (!user) {
      setPendingToolRedirect(`/dashboard?tool=${tool.id}`);
      setShowAuthModal(true);
    } else {
      navigate(`/dashboard?tool=${tool.id}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Site Intelligence Suite | 16+ Architectural Tools | Anvitam</title>
        <meta name="description" content="Explore Anvitam's 16+ site intelligence tools: 3D Solar Shadow Simulator, Wind Rose Analyzer, SoilGrids Geotechnical, Rainwater Sizer, and Embodied Carbon Estimator." />
      </Helmet>

      <div className="bg-[#F8F9FA] text-[#111111] min-h-screen pt-28 pb-20 font-sans">

        {/* ── HERO HEADER SECTION ── */}
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#052E16] text-[#CCFF00] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[#CCFF00]/30 mb-6 shadow-sm"
          >
            <Crown size={14} /> 16+ Automated Site Intelligence Tools
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-black text-[#111111] tracking-tight leading-tight mb-6">
            Architectural Site Intelligence <br className="hidden md:inline" />
            <span className="text-[#052E16] underline decoration-[#CCFF00] decoration-4 underline-offset-8">
              Engineered for Precision Design
            </span>
          </h1>

          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            From 3D solar shadow animation and 16-cardinal wind vectors to global SoilGrids geotechnical analysis. Select any tool to preview capabilities or access your studio dashboard.
          </p>

          {/* Search & Category Filter Bar */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tool name, climate metric, soil composition, or 3D shadow..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-6 py-4 text-xs md:text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-black shadow-sm transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-black text-[#CCFF00] shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 16+ TOOLS GRID ── */}
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 mb-24">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h2 className="text-xl md:text-2xl font-black text-gray-900">
              {selectedCategory === 'All' ? 'All 16 Architectural Tools' : `${selectedCategory} Tools`}
            </h2>
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              Showing {filteredTools.length} of {TOOLS_SUITE.length} Tools
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs ${tool.iconBg}`}>
                      {tool.iconSvg}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      tool.badge.includes('PHASE 2')
                        ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-black'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 group-hover:text-black mb-2 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-6">
                    {tool.shortDesc}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setActiveModalTool(tool)}
                      className="text-xs font-bold text-gray-500 hover:text-black transition cursor-pointer underline underline-offset-4"
                    >
                      Preview Details
                    </button>

                    <button
                      onClick={() => handleLaunchTool(tool)}
                      className="bg-black hover:bg-[#052E16] text-[#CCFF00] font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      Launch in Studio <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── PRICING SECTION ── */}
        <div className="bg-white py-20 border-t border-gray-200">
          <div className="max-w-screen-xl mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block py-1.5 px-4 rounded-full border border-black/10 text-[10px] font-black uppercase tracking-widest text-black mb-3 bg-gray-100">
                Transparent Monetization
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
                Start Free. Upgrade when your studio scales.
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                All registered accounts receive <strong>5 Free Credits</strong> on sign-up. Pro subscription grants <strong>250 Credits/Month</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter Free */}
              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-4">
                    Free Trial
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Starter Pass</h3>
                  <p className="text-xs text-gray-500 mb-6">Test the full tool suite with zero commitment</p>
                  <div className="text-4xl font-extrabold text-gray-900 mb-6">
                    {currency === 'INR' ? '₹0' : '$0'}
                    <span className="text-xs font-normal text-gray-500 ml-2">15-day trial</span>
                  </div>
                  <ul className="space-y-3 text-xs text-gray-700 mb-8">
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-black" /> <strong>5 Free Credits</strong> upon registration</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-black" /> All 16+ site & 3D shadow tools</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-black" /> SoilGrids, Open-Meteo & SunCalc data</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-black text-white hover:bg-gray-800 font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer"
                >
                  Start Free Trial →
                </button>
              </div>

              {/* Monthly Pro */}
              <div className="bg-[#111111] text-white p-8 rounded-3xl border-2 border-[#CCFF00] flex flex-col justify-between shadow-2xl relative">
                <div>
                  <div className="absolute top-4 right-4 bg-[#CCFF00] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-1 rounded-full border border-[#CCFF00]/20 inline-block mb-4">
                    Pro Access
                  </span>
                  <h3 className="text-xl font-bold text-white mb-1">Monthly Pro</h3>
                  <p className="text-xs text-gray-400 mb-6">250 credits monthly for active architects</p>
                  <div className="text-4xl font-extrabold text-white mb-6">
                    {currency === 'INR' ? '₹299' : '$5.00'}
                    <span className="text-xs font-normal text-gray-400 ml-2">/ month</span>
                  </div>
                  <ul className="space-y-3 text-xs text-gray-200 mb-8">
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-[#CCFF00]" /> <strong>250 Credits / month</strong> refilled automatically</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-[#CCFF00]" /> Real-time 3D solar shadow simulator</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-[#CCFF00]" /> Full access to all 16+ tools</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-[#CCFF00] hover:bg-white text-black font-extrabold py-3.5 rounded-2xl text-xs transition-colors shadow-lg cursor-pointer"
                >
                  Subscribe Monthly →
                </button>
              </div>

              {/* Yearly Studio */}
              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black bg-gray-200 px-3 py-1 rounded-full border border-gray-300 inline-block mb-4">
                    Save 25%
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Yearly Studio</h3>
                  <p className="text-xs text-gray-500 mb-6">Best value for practices & studios</p>
                  <div className="text-4xl font-extrabold text-gray-900 mb-6">
                    {currency === 'INR' ? '₹2,499' : '$45.00'}
                    <span className="text-xs font-normal text-gray-500 ml-2">/ year</span>
                  </div>
                  <ul className="space-y-3 text-xs text-gray-700 mb-8">
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-black" /> <strong>3,000 Credits / year</strong></li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-black" /> Priority customer support</li>
                    <li className="flex items-center gap-2.5"><Check size={14} className="text-black" /> Branded PDF client report export</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-black text-white hover:bg-gray-800 font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer"
                >
                  Subscribe Yearly →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── TOOL DETAIL MODAL ── */}
        <AnimatePresence>
          {activeModalTool && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setActiveModalTool(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${activeModalTool.iconBg}`}>
                    {activeModalTool.iconSvg}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-black bg-[#CCFF00] px-2.5 py-0.5 rounded-full">
                      {activeModalTool.category}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mt-1">{activeModalTool.name}</h2>
                  </div>
                </div>

                <div className="h-48 w-full rounded-2xl overflow-hidden mb-6 bg-gray-100">
                  <img
                    src={activeModalTool.previewImage}
                    alt={activeModalTool.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                  {activeModalTool.fullDesc}
                </p>

                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Capabilities Included</h4>
                <ul className="space-y-2.5 mb-8">
                  {activeModalTool.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-gray-700 font-medium">
                      <Check size={14} className="text-green-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    const tool = activeModalTool;
                    setActiveModalTool(null);
                    handleLaunchTool(tool);
                  }}
                  className="w-full bg-[#111111] hover:bg-[#052E16] text-[#CCFF00] font-extrabold py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  Open Tool in Studio Dashboard <ArrowRight size={16} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ToolsAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(u) => {
            setShowAuthModal(false);
            if (pendingToolRedirect) {
              navigate(pendingToolRedirect);
              setPendingToolRedirect(null);
            } else {
              navigate('/dashboard');
            }
          }}
          initialMode="login"
        />

      </div>
    </>
  );
}
