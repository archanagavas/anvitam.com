// pages/UserDashboard.tsx — Architectural Studio SaaS Dashboard (Image 4 & 2 Design Layout)
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  Zap,
  Crown,
  LogOut,
  Search,
  Plus,
  Compass,
  TrendingUp,
  CreditCard,
  Settings,
  ChevronRight,
  Edit2,
  X,
  Filter
} from 'lucide-react';
import { getToolUser, logoutToolUser, updateToolUser, type ToolUser } from '../utils/userAuth';
import { TOOLS_SUITE, type ToolItem } from '../constants/toolsData';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';
import { ToolsPaywallOverlay } from '../components/tools/ToolsPaywallOverlay';

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

  const categories = ['All', 'Site & Urban', '3D & Shadow (Phase 2)', 'Climate', 'Ecology & Soil', 'Building Science'];

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
              <div className="w-9 h-9 rounded-xl bg-black text-[#CCFF00] flex items-center justify-center font-black text-sm shadow-sm">
                A
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-gray-900 tracking-tight leading-none">Anvitam Studio</h2>
                <span className="text-[10px] text-gray-400 font-medium">Site Intelligence v2.0</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-3">Menu</p>
                <nav className="space-y-1">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} /> },
                    { id: 'tools', label: `Tools Suite (${TOOLS_SUITE.length})`, icon: <Compass size={18} /> },
                    { id: 'analytics', label: 'Site Analytics', icon: <TrendingUp size={18} /> },
                    { id: 'billing', label: 'Billing & Credits', icon: <CreditCard size={18} /> },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                        activeMenu === item.id
                          ? 'bg-[#052E16] text-[#CCFF00] shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-3">General</p>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveMenu('settings')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeMenu === 'settings'
                        ? 'bg-[#052E16] text-[#CCFF00]'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200/60">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-black text-[#CCFF00] font-black text-xs flex items-center justify-center shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-gray-900 truncate">{user?.name || user?.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN WORKSPACE AREA ── */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">

          {/* Top Bar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools, site analyses or metrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none focus:border-black shadow-xs"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/site-analysis')}
                className="bg-[#052E16] text-[#CCFF00] hover:bg-black font-extrabold text-xs px-5 py-2.5 rounded-2xl transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> Run Full 11+ Site Intelligence Report
              </button>
            </div>
          </div>

          {/* DASHBOARD VIEW */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-8">
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Studio Dashboard</h1>
                <p className="text-xs text-gray-500 mt-1">Plan, prioritize and launch your architectural site intelligence tools.</p>
              </div>

              {/* STAT CARDS BENTO GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Stat 1 */}
                <div className="bg-[#052E16] text-white p-6 rounded-3xl shadow-md flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-200">Total Site Analyses</span>
                    <span className="text-[10px] bg-[#CCFF00] text-black font-extrabold px-2 py-0.5 rounded-full">
                      Active Studio
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-[#CCFF00]">24</h2>
                  <p className="text-[11px] text-emerald-200/80 mt-2">Active site reports generated</p>
                </div>

                {/* Stat 2 */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500">Metered Credits Remaining</span>
                    <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
                      <Zap size={16} />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    {user?.credits_remaining ?? 5} <span className="text-xs font-normal text-gray-500">credits</span>
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-2">
                    {user?.is_subscribed ? '250 Studio Credits refilled monthly' : `${user?.trial_days_remaining ?? 15} days remaining on trial`}
                  </p>
                </div>

                {/* Stat 3 */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500">Subscription Plan</span>
                    <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
                      <Crown size={16} />
                    </div>
                  </div>
                  <h2 className="text-xl font-black text-gray-900 truncate">
                    {user?.subscription_plan === 'pro_monthly' || user?.is_subscribed
                      ? 'Pro Monthly (250/mo)'
                      : user?.subscription_plan === 'topup_10'
                      ? '10 Credits Top-Up'
                      : 'Free Trial'}
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-2">
                    {user?.is_subscribed ? 'Full 16+ Studio tools unlocked' : 'Upgrade to Pro or top up credits'}
                  </p>
                </div>

                {/* Stat 4 */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500">Tools Suite</span>
                    <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                      <LayoutGrid size={16} />
                    </div>
                  </div>
                  <h2 className="text-4xl font-black text-gray-900">{TOOLS_SUITE.length} Tools</h2>
                  <p className="text-[11px] text-gray-400 mt-2">Solar, Wind, Soil, Carbon & Urban</p>
                </div>

              </div>

              {/* BENTO MIDDLE SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Quick Launch Cards */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-base font-black text-gray-900">Featured Architectural Tools</h3>
                    <button
                      onClick={() => setActiveMenu('tools')}
                      className="text-xs font-bold text-[#052E16] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View All {TOOLS_SUITE.length} Tools →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TOOLS_SUITE.slice(0, 6).map(t => (
                      <div
                        key={t.id}
                        onClick={() => navigate(t.href)}
                        className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200/70 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-black rounded-xl shrink-0">
                            {t.iconSvg}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-black">{t.name}</h4>
                            <p className="text-[10px] text-gray-500 line-clamp-1">{t.shortDesc}</p>
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
                    <h3 className="text-base font-black text-gray-900 mb-1">Credit Usage & Plan</h3>
                    <p className="text-xs text-gray-500 font-medium">Monthly API generation limits</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-3">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-600">Credits Remaining</span>
                      <span className="text-black font-mono">
                        {user?.is_subscribed ? '250 / 250' : `${user?.credits_remaining ?? 5} / 5`}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#052E16] transition-all duration-500"
                        style={{ width: user?.is_subscribed ? '100%' : `${((user?.credits_remaining ?? 5) / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">
                      {user?.is_subscribed
                        ? '⚡ Pro Plan Active — 250 monthly credits automatically refilled.'
                        : `Free trial remaining: ${user?.credits_remaining ?? 5} credits.`}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowPaywall(true)}
                    className="w-full bg-[#052E16] text-[#CCFF00] hover:bg-black font-extrabold py-3.5 rounded-2xl text-xs transition shadow-sm cursor-pointer"
                  >
                    {user?.is_subscribed ? 'Manage Subscription' : 'Upgrade to Pro ($5/mo) →'}
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ── ALL 16+ TOOLS TAB (IMAGE 2 COMPLETE FIX) ── */}
          {(activeMenu === 'tools' || activeMenu === 'billing') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">All {TOOLS_SUITE.length} Architectural Tools</h2>
                  <p className="text-xs text-gray-500 mt-1">Select any tool to launch in site intelligence workspace.</p>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-black text-[#CCFF00]'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                      className={`bg-white p-6 rounded-3xl border flex flex-col justify-between transition-all hover:shadow-lg ${
                        isHighlighted ? 'border-2 border-[#CCFF00] ring-2 ring-[#CCFF00]/40' : 'border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.iconBg}`}>
                            {t.iconSvg}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {t.category}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-gray-900 mb-1">{t.name}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">{t.shortDesc}</p>

                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-6 space-y-1.5">
                          {t.features.slice(0, 3).map((f, idx) => (
                            <p key={idx} className="text-[11px] text-gray-700 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate">{f}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(t.href)}
                        className="w-full bg-[#052E16] text-[#CCFF00] hover:bg-black font-extrabold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        Launch Tool <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeMenu === 'settings' && (
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6 max-w-xl">
              <h2 className="text-xl font-black text-gray-900">Studio Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-2xl border border-gray-200 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Studio Display Name</label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        className="flex-1 bg-white border border-black px-4 py-3 rounded-2xl text-xs font-bold outline-none"
                      />
                      <button onClick={handleSaveName} className="bg-black text-[#CCFF00] font-bold px-4 py-3 rounded-2xl text-xs cursor-pointer">
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-200">
                      <span className="text-xs font-bold text-gray-900">{user?.name || 'Not specified'}</span>
                      <button onClick={() => setIsEditingName(true)} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                        <Edit2 size={13} /> Edit
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} /> Sign Out of Studio Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <ToolsAuthModal
        isOpen={showAuthModal}
        onClose={() => navigate('/tools')}
        onSuccess={(u) => {
          setUser(u);
          setShowAuthModal(false);
        }}
        initialMode="login"
      />

      {showPaywall && (
        <ToolsPaywallOverlay
          trialDaysRemaining={user?.trial_days_remaining ?? 0}
          onSubscribe={(plan) => {
            window.open(`/api/tools/subscribe?plan=${plan}&email=${user?.email || ''}`, '_blank');
          }}
          onLogin={() => { setShowPaywall(false); setShowAuthModal(true); }}
        />
      )}
    </>
  );
}
