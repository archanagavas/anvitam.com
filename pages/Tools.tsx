// pages/Tools.tsx — Architectural Site Intelligence Suite Directory (16+ Live Tools)
import React, { useState } from 'react';
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

      <div className="bg-white text-[#111111] min-h-screen pt-28 pb-12 font-sans relative selection:bg-[#CCFF00] selection:text-black">
        
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* ── HERO HEADER SECTION ── */}
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 mb-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#111111] text-[#CCFF00] text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[#CCFF00]/30 mb-6 shadow-md"
          >
            <Zap size={14} className="text-[#CCFF00]" /> 16 Easy Site Analysis Tools
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-black text-[#111111] tracking-tight leading-tight mb-6">
            Get Smart Site Reports <br className="hidden md:inline" />
            <span className="text-[#111111] bg-[#CCFF00] px-4 py-1.5 rounded-xl inline-block mt-1 border border-black/10 shadow-xs">
              in Seconds
            </span>
          </h1>

          <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8 font-medium">
            Get instant sun paths, wind direction, soil health reports, and 3D shadow tests for any location on Earth. Save hours of manual research with 1 click.
          </p>

          {/* Search & Category Filter Bar */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for sun, wind, soil, shadow, rain, or building tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-2xl pl-12 pr-10 py-4 text-xs md:text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-black shadow-sm transition-all focus:ring-2 focus:ring-black/10"
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
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#111111] text-[#CCFF00] shadow-md ring-2 ring-black'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300/80 shadow-2xs'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 16+ TOOLS GRID ── */}
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 mb-16 relative z-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Sliders size={20} className="text-gray-700" />
              {selectedCategory === 'All Tools' ? 'All 16 Architectural Tools' : `${selectedCategory} Tools`}
            </h2>
            <span className="text-xs font-bold text-gray-700 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-300 shadow-2xs">
              Showing {filteredTools.length} of {TOOLS_SUITE.length} Tools
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs ${tool.iconBg}`}>
                      {tool.iconSvg}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                      tool.badge.includes('3D')
                        ? 'bg-[#CCFF00] text-black border-black/20 font-black'
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }`}>
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 group-hover:text-black mb-2 transition-colors tracking-tight">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-6 font-medium">
                    {tool.shortDesc}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setActiveModalTool(tool)}
                      className="text-xs font-bold text-gray-500 hover:text-black transition cursor-pointer underline underline-offset-4"
                    >
                      Read Tool Guide
                    </button>

                    <button
                      onClick={() => handleLaunchTool(tool)}
                      className="bg-[#111111] hover:bg-black text-[#CCFF00] font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Open Tool <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── PRICING SECTION (7th GRADE SIMPLE COPY) ── */}
        <div className="bg-[#111111] text-white py-16 border-t border-b border-black relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#CCFF00]/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-screen-xl mx-auto px-6 md:px-12 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block py-1.5 px-4 rounded-full border border-[#CCFF00]/30 text-[10px] font-black uppercase tracking-widest text-[#CCFF00] mb-3 bg-[#CCFF00]/10">
                Simple Pricing
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                Simple Pricing. No Hidden Fees.
              </h2>
              <p className="text-xs md:text-sm text-gray-300 font-medium max-w-lg mx-auto leading-relaxed">
                Try 5 tools for free when you sign up. Buy extra credits only when you need them.
              </p>
            </div>

            {/* 2-TIER PRODUCT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Option 1: 10 Credits Pack */}
              <div className="bg-[#1C1C1C] p-8 rounded-3xl border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition shadow-xl group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700">
                      BUY ONCE
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 bg-neutral-900 px-2.5 py-0.5 rounded-full border border-neutral-800">
                      No Monthly Subscription
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-1">10 Credits Pack</h3>
                  <p className="text-xs text-gray-400 mb-6 font-medium">Great for a quick site check or single project report.</p>
                  
                  <div className="text-4xl font-extrabold text-white mb-6">
                    {topupPrice}
                    <span className="text-xs font-normal text-gray-400 ml-2">one time</span>
                  </div>

                  <ul className="space-y-3.5 text-xs text-gray-300 mb-8 font-medium">
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
                      <span>Download ready-to-print PDF reports for your clients</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-white text-black hover:bg-[#CCFF00] font-black py-4 rounded-2xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  Buy 10 Credits ({topupPrice}) <ArrowRight size={14} />
                </button>
              </div>

              {/* Option 2: Pro Monthly Pass */}
              <div className="bg-[#161616] p-8 rounded-3xl border-2 border-[#CCFF00] flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-[#CCFF00] text-black text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-sm">
                  BEST VALUE
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-1 rounded-full border border-[#CCFF00]/30">
                      PRO MONTHLY
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-1">Pro Monthly Pass</h3>
                  <p className="text-xs text-gray-400 mb-6 font-medium">Best for active architects, planners & design studios.</p>

                  <div className="text-4xl font-extrabold text-white mb-6">
                    {monthlyPrice}
                    <span className="text-xs font-normal text-gray-400 ml-2">/ month</span>
                  </div>

                  <ul className="space-y-3.5 text-xs text-gray-200 mb-8 font-medium">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span><strong>250 Credits every month</strong> (refills automatically)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span>Full 3D Sun & Shadow Simulator access</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span>Soil reports, wind vectors & rainwater calculations</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#CCFF00] shrink-0" />
                      <span>Download clean, un-watermarked PDF client reports</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-[#CCFF00] hover:bg-white text-black font-black py-4 rounded-2xl text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  Get Monthly Pass ({monthlyPrice}/mo) <ArrowRight size={14} />
                </button>
              </div>

            </div>

            {/* Trial callout */}
            <div className="mt-12 text-center text-xs text-gray-400 font-medium">
              🎁 First time here? Sign up in 10 seconds to get <strong className="text-[#CCFF00]">5 Free Credits</strong> instantly.
            </div>
          </div>
        </div>

        {/* ── TOOL DETAIL PREVIEW MODAL ── */}
        <AnimatePresence>
          {activeModalTool && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="tool-modal-title"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto border border-gray-200 text-gray-900"
              >
                <button
                  onClick={() => setActiveModalTool(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${activeModalTool.iconBg}`}>
                    {activeModalTool.iconSvg}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-black bg-[#CCFF00] px-2.5 py-0.5 rounded-full border border-black/10">
                      {activeModalTool.category}
                    </span>
                    <h2 id="tool-modal-title" className="text-xl font-black text-gray-900 mt-1 tracking-tight">{activeModalTool.name}</h2>
                  </div>
                </div>

                <div className="h-48 w-full rounded-2xl overflow-hidden mb-6 bg-gray-100 border border-gray-200">
                  <img
                    src={activeModalTool.previewImage}
                    alt={activeModalTool.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-6 font-medium">
                  {activeModalTool.fullDesc}
                </p>

                <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" /> What This Tool Gives You
                </h4>
                <ul className="space-y-2.5 mb-8">
                  {activeModalTool.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-gray-800 font-semibold">
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
                  className="w-full bg-[#111111] hover:bg-black text-[#CCFF00] font-black py-4 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-[1.01]"
                >
                  Open Tool Now <ArrowRight size={16} />
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
