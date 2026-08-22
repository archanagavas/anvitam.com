// pages/Tools.tsx — Architectural Site Intelligence Suite Directory (16+ Live Tools)
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Check, ArrowRight, ShieldCheck, Crown, Zap, X, ChevronRight,
  Sparkles, CheckCircle2, Globe, FileText, Layers, Compass, Sliders
} from 'lucide-react';
import { TOOLS_SUITE, type ToolItem } from '../constants/toolsData';
import { getToolUser } from '../utils/userAuth';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';
import { DODO_PRODUCTS } from '../constants/dodoConfig';

export default function Tools() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Tools');
  const [activeModalTool, setActiveModalTool] = useState<ToolItem | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingToolRedirect, setPendingToolRedirect] = useState<string | null>(null);

  // Prevent background scrolling when tool modal is open
  useEffect(() => {
    if (activeModalTool) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModalTool]);

  // Detect Indian currency preference
  const isIndia = Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Kolkata');
  const topupPrice = isIndia ? DODO_PRODUCTS.topup_10.priceINR : DODO_PRODUCTS.topup_10.priceUSD;
  const monthlyPrice = isIndia ? DODO_PRODUCTS.pro_monthly.priceINR : DODO_PRODUCTS.pro_monthly.priceUSD;

  const categories = ['All Tools', 'Sun & Site', '3D & Shadows', 'Weather & Wind', 'Soil & Water', 'Building Cost & Carbon'];

  const filteredTools = TOOLS_SUITE.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Tools' || tool.category === selectedCategory;
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
        <meta name="description" content="Get instant sun path, wind patterns, soil reports, and 3D shadows for any building location in the world with Anvitam site tools." />
      </Helmet>

      <div className="w-full bg-white text-[#111111] min-h-screen font-sans overflow-hidden">
        
        {/* ── HERO HEADER SECTION ── */}
        <section className="relative pt-24 pb-12 md:pt-28 md:pb-14 overflow-hidden bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#CCFF00] text-[#111] text-[11px] font-bold uppercase tracking-wider mb-4 shadow-sm border border-black/10"
            >
              <Sparkles size={13} /> 16 Easy Site Analysis Tools
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.18] mb-4 text-gray-900"
            >
              Get Smart Site Reports <span className="bg-[#CCFF00] px-3 py-0.5 rounded-xl border border-black/10">in Seconds</span>
            </motion.h1>

            {/* Subtitle in 6th-grade English */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal"
            >
              Easy tools for architects, builders, and students. Get instant sun paths, wind direction, soil health reports, and 3D shadow tests for any location. Save hours of manual work in 1 click.
            </motion.p>

            {/* Search & Category Filter Bar */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tools like sun path, wind, soil, 3D shadows, or rain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-full pl-11 pr-10 py-3.5 text-xs md:text-sm font-normal text-gray-900 placeholder-gray-400 outline-none focus:border-black shadow-xs transition-all focus:ring-2 focus:ring-black/5"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#111111] text-[#CCFF00] shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── 16+ TOOLS GRID ── */}
        <section className="py-12 md:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Sliders size={18} className="text-gray-700" />
              {selectedCategory === 'All Tools' ? 'All 16 Site Analysis Tools' : `${selectedCategory} Tools`}
            </h2>
            <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
              Showing {filteredTools.length} of {TOOLS_SUITE.length} Tools
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl border border-gray-200/80 hover:border-gray-400 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Image Preview Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100 border-b border-gray-100">
                    <img
                      src={tool.previewImage}
                      alt={tool.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#111111] text-[#CCFF00] shadow-sm border border-black/20">
                      {tool.badge}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${tool.iconBg}`}>
                        {tool.iconSvg}
                      </div>
                      <h3 className="text-[#111111] font-bold text-base group-hover:text-black transition tracking-tight">
                        {tool.name}
                      </h3>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed font-normal line-clamp-2">
                      {tool.shortDesc}
                    </p>

                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1.5 mt-3">
                      {tool.features.slice(0, 2).map((f, idx) => (
                        <p key={idx} className="text-[11px] text-gray-700 font-medium flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{f}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveModalTool(tool)}
                      className="text-xs font-medium text-gray-500 hover:text-gray-900 transition cursor-pointer underline underline-offset-4"
                    >
                      Read Tool Guide
                    </button>

                    <button
                      onClick={() => handleLaunchTool(tool)}
                      className="bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-semibold text-xs px-4 py-2 rounded-xl transition shadow-2xs flex items-center gap-1 cursor-pointer border border-black/10 hover:scale-[1.02]"
                    >
                      Open Tool <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PRICING SECTION (MATCHING WORKSHOPS / BRAND THEME) ── */}
        <section className="py-14 md:py-16 bg-[#111111] text-white border-t border-b border-black relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#CCFF00]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block py-1 px-3.5 rounded-full border border-[#CCFF00]/30 text-[10px] font-bold uppercase tracking-wider text-[#CCFF00] mb-3 bg-[#CCFF00]/10">
                Simple Pricing
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
                Simple Pricing. No Hidden Fees.
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-normal max-w-lg mx-auto leading-relaxed">
                Try 5 tools for free when you sign up. Buy extra credits only when you need them.
              </p>
            </div>

            {/* 2-TIER PRODUCT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              
              {/* Option 1: 10 Credits Pack */}
              <div className="bg-[#1C1C1C] p-7 rounded-2xl border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition shadow-lg group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 bg-neutral-800 px-3 py-0.5 rounded-full border border-neutral-700">
                      BUY ONCE
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 bg-neutral-900 px-2.5 py-0.5 rounded-full border border-neutral-800">
                      No Subscription Required
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">10 Credits Pack</h3>
                  <p className="text-xs text-gray-400 mb-5 font-normal">Great for a quick site check or single project report.</p>
                  
                  <div className="text-3xl font-bold text-white mb-6">
                    {topupPrice}
                    <span className="text-xs font-normal text-gray-400 ml-2">one time</span>
                  </div>

                  <ul className="space-y-3 text-xs text-gray-300 mb-8 font-normal">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span><strong>10 Credits added to your account</strong> instantly</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span>Pay once — zero monthly automatic bills</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span>Credits stay valid for 90 days across all tools</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span>Download ready-to-print PDF reports for clients</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-white text-black hover:bg-[#CCFF00] font-bold py-3.5 rounded-full text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  Buy 10 Credits ({topupPrice}) <ArrowRight size={14} />
                </button>
              </div>

              {/* Option 2: Pro Monthly Pass */}
              <div className="bg-[#161616] p-7 rounded-2xl border-2 border-[#CCFF00] flex flex-col justify-between shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-[#CCFF00] text-black text-[10px] font-bold px-3.5 py-1 rounded-bl-xl uppercase tracking-wider shadow-xs">
                  BEST VALUE
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-0.5 rounded-full border border-[#CCFF00]/30">
                      PRO MONTHLY
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">Pro Monthly Pass</h3>
                  <p className="text-xs text-gray-400 mb-5 font-normal">Best for active architects, planners &amp; design studios.</p>

                  <div className="text-3xl font-bold text-white mb-6">
                    {monthlyPrice}
                    <span className="text-xs font-normal text-gray-400 ml-2">/ month</span>
                  </div>

                  <ul className="space-y-3 text-xs text-gray-200 mb-8 font-normal">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span><strong>250 Credits every month</strong> (refills automatically)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span>Full 3D Sun &amp; Shadow Simulator access</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span>Soil reports, wind vectors &amp; rainwater calculations</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span>Download clean, un-watermarked PDF client reports</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-[#CCFF00] hover:bg-white text-black font-bold py-3.5 rounded-full text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  Get Monthly Pass ({monthlyPrice}/mo) <ArrowRight size={14} />
                </button>
              </div>

            </div>

            {/* Trial callout */}
            <div className="mt-10 text-center text-xs text-gray-400 font-normal">
              🎁 First time here? Sign up in 10 seconds to get <strong className="text-[#CCFF00] font-bold">5 Free Credits</strong> instantly.
            </div>
          </div>
        </section>

        {/* ── TOOL DETAIL PREVIEW MODAL (PORTAL TO BODY) ── */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {activeModalTool && (
              <div 
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
                onClick={(e) => e.target === e.currentTarget && setActiveModalTool(null)}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="tool-modal-title"
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 15 }}
                  className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto border border-gray-200 text-gray-900"
                >
                  <button
                    onClick={() => setActiveModalTool(null)}
                    className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>

                  <div className="flex items-center gap-3.5 mb-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activeModalTool.iconBg}`}>
                      {activeModalTool.iconSvg}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-2.5 py-0.5 rounded-full border border-black/10">
                        {activeModalTool.category}
                      </span>
                      <h2 id="tool-modal-title" className="text-lg font-bold text-gray-900 mt-1 tracking-tight">{activeModalTool.name}</h2>
                    </div>
                  </div>

                  <div className="h-44 w-full rounded-xl overflow-hidden mb-5 bg-gray-100 border border-gray-200">
                    <img
                      src={activeModalTool.previewImage}
                      alt={activeModalTool.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5 font-normal">
                    {activeModalTool.fullDesc}
                  </p>

                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" /> What This Tool Gives You
                  </h4>
                  <ul className="space-y-2 mb-6">
                    {activeModalTool.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs text-gray-700 font-medium">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
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
                    className="w-full bg-[#111111] hover:bg-black text-[#CCFF00] font-bold py-3.5 px-6 rounded-full text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    Open Tool Now <ArrowRight size={15} />
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

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
