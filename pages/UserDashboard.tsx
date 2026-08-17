// pages/UserDashboard.tsx — Architectural Studio SaaS Dashboard
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  Zap,
  Crown,
  LogOut,
  Search,
  Compass,
  TrendingUp,
  CreditCard,
  Settings,
  ChevronRight,
  Edit2,
  X,
  Sliders,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { getToolUser, logoutToolUser, updateToolUser, type ToolUser } from '../utils/userAuth';
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
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'tools' | 'analytics' | 'billing' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const targetToolParam = searchParams.get('tool');
  const isIndia = Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Kolkata');
  const topupPrice = isIndia ? DODO_PRODUCTS.topup_10.priceINR : DODO_PRODUCTS.topup_10.priceUSD;
  const monthlyPrice = isIndia ? DODO_PRODUCTS.pro_monthly.priceINR : DODO_PRODUCTS.pro_monthly.priceUSD;

  const categories = ['All', 'Sun & Site', '3D & Shadows', 'Weather & Wind', 'Soil & Water', 'Building Cost & Carbon'];

  useEffect(() => {
    const current = getToolUser();
    if (current) {
      setUser(current);
      setNameInput(current.name || '');
    } else {
      setShowAuthModal(true);
    }

    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ToolUser | null>;
      setUser(customEvent.detail);
      if (customEvent.detail?.name) setNameInput(customEvent.detail.name);
    };

    window.addEventListener('anvitam-user-updated', handleUserUpdate);
    return () => window.removeEventListener('anvitam-user-updated', handleUserUpdate);
  }, []);

  useEffect(() => {
    if (targetToolParam) {
      setActiveMenu('tools');
    }
  }, [targetToolParam]);

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    updateToolUser({ name: nameInput.trim() });
    setIsEditingName(false);
  };

  const handleLogout = () => {
    logoutToolUser();
    navigate('/tools');
  };

  const filteredTools = TOOLS_SUITE.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalCreditsAllocated = Math.max(
    user?.is_subscribed ? 250 : 5,
    (user?.credits_remaining ?? 5) + (user?.credits_used ?? 0)
  );

  return (
    <>
      <Helmet>
        <title>Studio Dashboard | Anvitam Site Intelligence</title>
      </Helmet>

      <div className="bg-[#F8F9FA] text-[#111111] min-h-screen flex font-sans pt-24">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-64 bg-white border-r border-gray-200/80 p-6 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-6rem)]">
          <div>
            <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 rounded-xl bg-black text-[#CCFF00] flex items-center justify-center font-bold text-sm shadow-xs">
                A
              </div>
              <div>
                <h2 className="font-bold text-sm text-gray-900 tracking-tight leading-none">Anvitam Studio</h2>
                <span className="text-[10px] text-gray-500 font-normal">Site Intelligence v2.0</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 px-3">Menu</p>
                <nav className="space-y-1">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={17} /> },
                    { id: 'tools', label: `Tools Suite (${TOOLS_SUITE.length})`, icon: <Compass size={17} /> },
                    { id: 'billing', label: 'Billing & Credits', icon: <CreditCard size={17} /> },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition cursor-pointer ${
                        activeMenu === item.id
                          ? 'bg-[#111111] text-[#CCFF00] font-bold shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-800 font-bold flex items-center justify-center text-xs">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-gray-900 truncate">{user?.name || user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-gray-500 truncate font-normal">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-x-hidden">
          
          {/* DASHBOARD VIEW */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-8">
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Studio Dashboard</h1>
                <p className="text-xs text-gray-500 mt-1 font-normal">Plan, prioritize and launch your architectural site intelligence tools.</p>
              </div>

              {/* STAT CARDS BENTO GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Stat 1 */}
                <div className="bg-[#111111] text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-300">Total Site Analyses</span>
                    <span className="text-[10px] bg-[#CCFF00] text-black font-bold px-2.5 py-0.5 rounded-full">
                      Active Studio
                    </span>
                  </div>
                  <h2 className="text-4xl font-bold text-[#CCFF00]">{user?.credits_used ?? 0}</h2>
                  <p className="text-[11px] text-gray-400 mt-2 font-normal">Active site reports generated</p>
                </div>

                {/* Stat 2 */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Metered Credits</span>
                    <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                      <Zap size={16} />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {user?.credits_remaining ?? 5} <span className="text-xs font-normal text-gray-500">credits</span>
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-2 font-normal">
                    {user?.is_subscribed ? '250 Studio Credits refilled monthly' : `${user?.trial_days_remaining ?? 15} days remaining on trial`}
                  </p>
                </div>

                {/* Stat 3 */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Subscription Plan</span>
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                      <Crown size={16} />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 truncate">
                    {user?.subscription_plan === 'pro_monthly' || user?.is_subscribed
                      ? 'Pro Monthly (250/mo)'
                      : user?.subscription_plan === 'topup_10'
                      ? '10 Credits Top-Up'
                      : 'Free Trial (5 Credits)'}
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-2 font-normal">
                    {user?.is_subscribed ? 'Full 16+ Studio tools unlocked' : 'Upgrade to Pro or top up credits'}
                  </p>
                </div>

                {/* Stat 4 */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Tools Suite</span>
                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                      <LayoutGrid size={16} />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">{TOOLS_SUITE.length} Tools</h2>
                  <p className="text-[11px] text-gray-500 mt-2 font-normal">Solar, Wind, Soil, Carbon &amp; Urban</p>
                </div>

              </div>

              {/* BENTO MIDDLE SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

                {/* Quick Launch Cards */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">Featured Architectural Tools</h3>
                    <button
                      onClick={() => setActiveMenu('tools')}
                      className="text-xs font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View All {TOOLS_SUITE.length} Tools →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TOOLS_SUITE.slice(0, 6).map(t => (
                      <div
                        key={t.id}
                        onClick={() => navigate(t.href)}
                        className="p-4 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-200/60 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#111111] text-[#CCFF00] rounded-xl shrink-0">
                            {t.iconSvg}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-black">{t.name}</h4>
                            <p className="text-[10px] text-gray-500 line-clamp-1 font-normal">{t.shortDesc}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Bento Card */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Credit Usage &amp; Plan</h3>
                    <p className="text-xs text-gray-500 font-normal">Metered credit status</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-3">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-600">Credits Remaining</span>
                      <span className="text-black font-mono">
                        {user?.credits_remaining ?? 5} / {totalCreditsAllocated}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#111111] transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, ((user?.credits_remaining ?? 5) / totalCreditsAllocated) * 100))}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 font-normal">
                      {user?.is_subscribed
                        ? '⚡ Pro Plan Active — 250 monthly credits automatically refilled.'
                        : `Free trial remaining: ${user?.credits_remaining ?? 5} credits.`}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowPaywall(true)}
                    className="w-full bg-[#111111] text-[#CCFF00] hover:bg-black font-bold py-3.5 rounded-2xl text-xs transition shadow-sm cursor-pointer hover:scale-[1.01]"
                  >
                    {user?.is_subscribed ? 'Manage Subscription' : `Upgrade to Pro (${monthlyPrice}/mo) →`}
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ── TOOLS TAB ── */}
          {activeMenu === 'tools' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">All {TOOLS_SUITE.length} Architectural Tools</h2>
                  <p className="text-xs text-gray-500 mt-1 font-normal">Select any tool to launch in site intelligence workspace.</p>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#111111] text-[#CCFF00] font-bold'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 16+ TOOLS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map(t => {
                  const isHighlighted = targetToolParam === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`bg-white p-6 rounded-3xl border flex flex-col justify-between transition-all hover:shadow-md ${
                        isHighlighted ? 'border-2 border-[#CCFF00] ring-2 ring-[#CCFF00]/40' : 'border-gray-200/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.iconBg}`}>
                            {t.iconSvg}
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {t.category}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 mb-1">{t.name}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4 font-normal">{t.shortDesc}</p>

                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-6 space-y-1.5">
                          {t.features.slice(0, 3).map((f, idx) => (
                            <p key={idx} className="text-[11px] text-gray-600 font-normal flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate">{f}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(t.href)}
                        className="w-full bg-[#111111] text-[#CCFF00] hover:bg-black font-semibold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.01]"
                      >
                        Launch Tool <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── BILLING & CREDITS TAB ── */}
          {activeMenu === 'billing' && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Billing &amp; Metered Credits</h2>
                <p className="text-xs text-gray-500 mt-1 font-normal">Manage your credit balance, top-up packs, and monthly studio subscriptions.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-800 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      CURRENT PLAN
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {user?.is_subscribed ? 'Pro Monthly Subscription' : user?.subscription_plan === 'topup_10' ? '10 Credits Top-Up Pack' : 'Starter Pass (Free Trial)'}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-3xl font-bold text-gray-900">{user?.credits_remaining ?? 5} <span className="text-sm font-normal text-gray-500">Credits Remaining</span></p>
                    <p className="text-xs text-gray-500 font-normal mt-1">{user?.credits_used ?? 0} credits consumed so far</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top-up */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/80 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-base text-gray-900 mb-1">10 Credits Top-Up Pack</h4>
                      <p className="text-xs text-gray-500 mb-4 font-normal">Pay once. Credits stay valid for 90 days across all 16 tools.</p>
                      <p className="text-2xl font-bold text-gray-900 mb-4">{topupPrice}</p>
                    </div>
                    <button
                      onClick={() => window.open(DODO_PRODUCTS.topup_10.checkoutUrl, '_blank')}
                      className="w-full bg-black text-white hover:bg-gray-800 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                    >
                      Buy Top-Up Pack ({topupPrice})
                    </button>
                  </div>

                  {/* Pro monthly */}
                  <div className="bg-[#111111] text-white p-6 rounded-2xl border border-black flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-base text-[#CCFF00] mb-1">Pro Monthly Subscription</h4>
                      <p className="text-xs text-gray-300 mb-4 font-normal">250 credits per month refilled automatically for active studios.</p>
                      <p className="text-2xl font-bold text-white mb-4">{monthlyPrice}/mo</p>
                    </div>
                    <button
                      onClick={() => window.open(DODO_PRODUCTS.pro_monthly.checkoutUrl, '_blank')}
                      className="w-full bg-[#CCFF00] text-black hover:bg-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                    >
                      Get Pro Monthly ({monthlyPrice}/mo)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

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
        onClose={() => setShowPaywall(false)}
        onUseFreeTrial={() => setShowPaywall(false)}
        onLogin={() => { setShowPaywall(false); setShowAuthModal(true); }}
      />
    </>
  );
}
