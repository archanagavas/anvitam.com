// pages/UserDashboard.tsx — Unified Architectural & AI Studio Master Dashboard
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Zap, Crown, LogOut, Search, Compass, CreditCard, ChevronRight,
  Sparkles, Home, Building, Trees, Wand2, Trash2, MapPin, Mountain,
  Sliders, CheckCircle2, ArrowUpRight, User, ShieldCheck, X, Filter
} from 'lucide-react';
import { getToolUser, logoutToolUser, type ToolUser } from '../utils/userAuth';
import { TOOLS_SUITE, type ToolItem } from '../constants/toolsData';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';
import { ToolsPaywallOverlay } from '../components/tools/ToolsPaywallOverlay';
import { DODO_PRODUCTS } from '../constants/dodoConfig';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<ToolUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Tools');
  const [searchQuery, setSearchQuery] = useState('');

  const targetToolParam = searchParams.get('tool');
  const isIndia = user?.country ? user.country === 'IN' : false;
  const topupPrice = isIndia ? DODO_PRODUCTS.topup_10.priceINR : DODO_PRODUCTS.topup_10.priceUSD;
  const monthlyPrice = isIndia ? DODO_PRODUCTS.pro_monthly.priceINR : DODO_PRODUCTS.pro_monthly.priceUSD;

  const categories = [
    'All Tools',
    'AI Design Studio',
    'Sun & Site',
    '3D & Shadows',
    'Weather & Wind',
    'Soil & Water',
    'Building Cost & Carbon'
  ];

  useEffect(() => {
    const current = getToolUser();
    if (current) {
      setUser(current);
    } else {
      setShowAuthModal(true);
    }

    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ToolUser | null>;
      setUser(customEvent.detail);
    };

    window.addEventListener('anvitam-user-updated', handleUserUpdate);
    return () => window.removeEventListener('anvitam-user-updated', handleUserUpdate);
  }, []);

  const handleLogout = () => {
    logoutToolUser();
    navigate('/tools');
  };

  const totalCreditsAllocated = user?.is_subscribed ? 250 : 3;
  const creditsRemaining = user?.credits_remaining ?? 3;
  const creditsUsed = user?.credits_used ?? 0;

  // Filter tools cleanly
  const filteredTools = TOOLS_SUITE.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCat = selectedCategory === 'All Tools';
    if (selectedCategory === 'AI Design Studio') {
      matchesCat = t.id.startsWith('ai-');
    } else if (selectedCategory !== 'All Tools') {
      matchesCat = t.category === selectedCategory;
    }

    return matchesSearch && matchesCat;
  });

  return (
    <>
      <Helmet>
        <title>Studio Dashboard | Anvitam Architectural &amp; AI Tools</title>
      </Helmet>

      <div className="bg-[#FAFBFD] text-[#111111] min-h-screen font-sans pt-20 pb-16">

        {/* ── UNIFIED MASTER HEADER ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#CCFF00] font-extrabold flex items-center justify-center text-xl shadow-xs border border-black">
                A
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Anvitam Studio Dashboard</h1>
                  <span className="text-[10px] font-extrabold bg-[#CCFF00] text-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-black/10">
                    21+ Live Tools
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  Welcome back, <strong className="text-gray-900">{user?.name || user?.email?.split('@')[0] || 'Architect'}</strong> ({user?.email})
                </p>
              </div>
            </div>

            {/* Credit & Plan Indicator */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-2xl flex items-center gap-3">
                <div className="p-1.5 bg-[#111111] text-[#CCFF00] rounded-xl">
                  <Zap size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Metered Credits</span>
                  <span className="text-xs font-extrabold text-gray-900">
                    {creditsRemaining} / {totalCreditsAllocated} Available
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPaywall(true)}
                className="bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-extrabold px-4 py-2.5 rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-black/10"
              >
                <Crown size={15} /> Upgrade to Pro
              </button>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-2xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>

          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* ── SEARCH & CATEGORY BAR ── */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                  Architectural &amp; AI Design Tool Suite ({filteredTools.length} Tools)
                </h2>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  Select any tool below to launch in your architectural workspace.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search 21+ tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-gray-900 outline-none focus:border-black font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#111111] text-[#CCFF00] shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* ── UNIFIED IDENTICAL TOOL GRID FOR ALL TOOLS ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => (
              <div
                key={tool.id}
                className="bg-white rounded-3xl border border-gray-200/80 hover:border-gray-400 overflow-hidden shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  
                  {/* Top Image Preview Banner (For ALL tools) */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100 border-b border-gray-100">
                    <img
                      src={tool.previewImage}
                      alt={tool.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#111111] text-[#CCFF00] shadow-sm border border-black/20">
                        {tool.badge}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 space-y-3">
                    
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tool.iconBg}`}>
                        {tool.iconSvg}
                      </div>
                      <h3 className="text-base font-extrabold text-gray-900 group-hover:text-black transition">
                        {tool.name}
                      </h3>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed font-normal line-clamp-2">
                      {tool.shortDesc}
                    </p>

                    {/* Features List */}
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1.5 mt-3">
                      {tool.features.slice(0, 3).map((f, idx) => (
                        <p key={idx} className="text-[11px] text-gray-700 font-semibold flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{f}</span>
                        </p>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Signature Brand Action Button */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => navigate(tool.href)}
                    className="w-full bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-extrabold py-3.5 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-black/10 group-hover:scale-[1.01]"
                  >
                    Launch Tool <ArrowUpRight size={15} />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* ── BILLING & SUBSCRIPTION SECTION ── */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-black bg-[#CCFF00] px-3 py-1 rounded-full border border-black/10">
                  CREDIT BALANCE &amp; PLANS
                </span>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-2">
                  {user?.is_subscribed ? 'Pro Monthly Subscription' : 'Starter Pass (3 Free Trial Credits)'}
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-3xl font-extrabold text-gray-900">{creditsRemaining} <span className="text-xs font-normal text-gray-500">Credits Available</span></p>
                <p className="text-xs text-gray-500 font-normal mt-0.5">{creditsUsed} total site analyses run</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 mb-1">10 Credits Top-Up Pack</h4>
                  <p className="text-xs text-gray-500 mb-3 font-normal">Pay once. Credits stay valid for 90 days across all 21+ tools.</p>
                  <p className="text-2xl font-extrabold text-gray-900">{topupPrice}</p>
                </div>
                <button
                  onClick={() => window.open(DODO_PRODUCTS.topup_10.checkoutUrl, '_blank', 'noopener,noreferrer')}
                  className="w-full bg-[#111111] text-[#CCFF00] hover:bg-black font-extrabold py-3.5 rounded-2xl text-xs transition cursor-pointer"
                >
                  Buy Top-Up Pack ({topupPrice})
                </button>
              </div>

              <div className="bg-[#111111] text-white p-6 rounded-2xl border border-black flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-[#CCFF00] mb-1">Pro Monthly Subscription</h4>
                  <p className="text-xs text-gray-300 mb-3 font-normal">250 credits per month refilled automatically for active studios.</p>
                  <p className="text-2xl font-extrabold text-white">{monthlyPrice}/mo</p>
                </div>
                <button
                  onClick={() => window.open(DODO_PRODUCTS.pro_monthly.checkoutUrl, '_blank', 'noopener,noreferrer')}
                  className="w-full bg-[#CCFF00] text-black hover:bg-white font-extrabold py-3.5 rounded-2xl text-xs transition cursor-pointer"
                >
                  Get Pro Monthly ({monthlyPrice}/mo)
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      <ToolsAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          setUser(u);
          setShowAuthModal(false);
        }}
      />

      <ToolsPaywallOverlay
        isOpen={showPaywall}
        userCountry={user?.country}
        onClose={() => setShowPaywall(false)}
        onUseFreeTrial={() => setShowPaywall(false)}
        onLogin={() => { setShowPaywall(false); setShowAuthModal(true); }}
        onRegister={() => { setShowPaywall(false); setShowAuthModal(true); }}
      />
    </>
  );
}
