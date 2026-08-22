// pages/UserDashboard.tsx — Ultra-Clean Architectural & Anvitam's AI SaaS Dashboard
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
  CreditCard,
  ChevronRight,
  Sparkles,
  Home,
  Building,
  Trees,
  Wand2,
  Trash2,
  MapPin,
  Mountain,
  Sliders,
  CheckCircle2,
  ArrowUpRight,
  User,
  ShieldCheck
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
  const [activeTab, setActiveTab] = useState<'ai-studio' | 'site-intelligence' | 'billing'>('ai-studio');
  const [searchQuery, setSearchQuery] = useState('');

  const targetToolParam = searchParams.get('tool');
  const isIndia = user?.country ? user.country === 'IN' : false;
  const topupPrice = isIndia ? DODO_PRODUCTS.topup_10.priceINR : DODO_PRODUCTS.topup_10.priceUSD;
  const monthlyPrice = isIndia ? DODO_PRODUCTS.pro_monthly.priceINR : DODO_PRODUCTS.pro_monthly.priceUSD;

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

  useEffect(() => {
    if (targetToolParam) {
      setActiveTab('site-intelligence');
    }
  }, [targetToolParam]);

  const handleLogout = () => {
    logoutToolUser();
    navigate('/tools');
  };

  const totalCreditsAllocated = user?.is_subscribed ? 250 : 3;
  const creditsRemaining = user?.credits_remaining ?? 3;
  const creditsUsed = user?.credits_used ?? 0;

  // AI Studio Tool Modules
  const aiStudioTools = [
    {
      id: 'interior',
      name: 'AI Interior Design & Room Restyle',
      desc: 'Transform living rooms, bedrooms, and kitchens with 15+ architectural styles and shoppable catalog pins.',
      href: '/tools/ai-home-design?module=interior',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
      badge: 'INTERIOR AI',
      icon: <Home size={18} />
    },
    {
      id: 'exterior',
      name: 'AI Exterior Facade Design Studio',
      desc: 'Refresh house exteriors, modern facade cladding, glass, and elevation architectural renders.',
      href: '/tools/ai-home-design?module=exterior',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop',
      badge: 'EXTERIOR AI',
      icon: <Building size={18} />
    },
    {
      id: 'garden',
      name: 'AI Garden & Yard Landscape Studio',
      desc: 'Design gardens, courtyards, permaculture yards, patio seating, and biophilic outdoor spaces.',
      href: '/tools/ai-home-design?module=garden',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600&auto=format&fit=crop',
      badge: 'GARDEN AI',
      icon: <Trees size={18} />
    },
    {
      id: 'replace',
      name: 'AI Replace & Add Furniture Studio',
      desc: 'Select specific items in room photos and replace them with modern catalog products.',
      href: '/tools/ai-home-design?module=replace',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop',
      badge: 'EDIT AI',
      icon: <Wand2 size={18} />
    },
    {
      id: 'remove',
      name: 'AI Furniture Removal & Declutter Studio',
      desc: 'Erase unwanted furniture, wires, and clutter leaving clean floors and walls.',
      href: '/tools/ai-home-design?module=remove',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop',
      badge: 'CLEANUP AI',
      icon: <Trash2 size={18} />
    }
  ];

  return (
    <>
      <Helmet>
        <title>Studio Dashboard | Anvitam AI &amp; Site Intelligence</title>
      </Helmet>

      <div className="bg-[#FAFBFD] text-[#111111] min-h-screen font-sans pt-20 pb-16">

        {/* ── STUDIO HEADER BAR ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black text-[#CCFF00] font-extrabold flex items-center justify-center text-xl shadow-xs">
                A
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Studio Dashboard</h1>
                  <span className="text-[10px] font-extrabold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-gray-200">
                    Anvitam AI v2.0
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  Welcome back, <strong className="text-gray-900">{user?.name || user?.email?.split('@')[0] || 'Architect'}</strong> ({user?.email})
                </p>
              </div>
            </div>

            {/* Credit & Plan Indicator */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-gray-50 border border-gray-200/80 px-4 py-2 rounded-2xl flex items-center gap-3">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-xl">
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
                className="bg-black hover:bg-gray-800 text-[#CCFF00] font-extrabold px-4 py-2.5 rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Crown size={15} /> Upgrade to Pro
              </button>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-2xl bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>

          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── TAB NAVIGATION ── */}
          <div className="flex items-center gap-2 mb-8 border-b border-gray-200 pb-4 overflow-x-auto">
            {[
              { id: 'ai-studio', label: "Anvitam's AI Design Studio (5 AI Tools)", icon: <Sparkles size={16} /> },
              { id: 'site-intelligence', label: `Site Intelligence Suite (${TOOLS_SUITE.length} Tools)`, icon: <Compass size={16} /> },
              { id: 'billing', label: 'Billing & Metered Credits', icon: <CreditCard size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-black text-[#CCFF00] shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-black border border-gray-200/80'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB 1: AI DESIGN STUDIO ── */}
          {activeTab === 'ai-studio' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Anvitam's AI Design Tools Suite</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Photorealistic interior, exterior facade, garden, and furniture AI tools.</p>
                </div>
                <button
                  onClick={() => navigate('/tools/ai-home-design')}
                  className="bg-[#CCFF00] text-black font-extrabold px-4 py-2 rounded-2xl text-xs hover:bg-black hover:text-[#CCFF00] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  Launch Full Anvitam's AI Studio →
                </button>
              </div>

              {/* 5 AI STUDIO TOOL CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiStudioTools.map(tool => (
                  <div
                    key={tool.id}
                    className="bg-white rounded-3xl border border-gray-200/80 hover:border-gray-400 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                        <img
                          src={tool.image}
                          alt={tool.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-3 left-3 text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-black text-[#CCFF00] shadow-sm">
                          {tool.badge}
                        </span>
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gray-100 rounded-xl text-gray-800">
                            {tool.icon}
                          </div>
                          <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-purple-700 transition">
                            {tool.name}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-normal">{tool.desc}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => navigate(tool.href)}
                        className="w-full bg-black text-white hover:bg-gray-800 font-extrabold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        Launch Tool <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ── TAB 2: SITE INTELLIGENCE SUITE ── */}
          {activeTab === 'site-intelligence' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Architectural Site Intelligence Suite</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Solar shadow, wind rose, soil profile, building height, and carbon tools.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TOOLS_SUITE.map(tool => (
                  <div
                    key={tool.id}
                    className="bg-white rounded-3xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-md transition space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${tool.iconBg}`}>
                          {tool.iconSvg}
                        </div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {tool.category}
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-gray-900 mb-1">{tool.name}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-normal mb-3">{tool.shortDesc}</p>

                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1">
                        {tool.features.slice(0, 2).map((f, idx) => (
                          <p key={idx} className="text-[11px] text-gray-600 font-normal flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{f}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(tool.href)}
                      className="w-full bg-black text-white hover:bg-gray-800 font-extrabold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Launch Tool <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ── TAB 3: BILLING & CREDITS ── */}
          {activeTab === 'billing' && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Billing &amp; Metered Credits</h2>
                <p className="text-xs text-gray-500 mt-0.5">Manage credit balance, top-up packs, and monthly subscriptions.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                      CURRENT PLAN
                    </span>
                    <h3 className="text-2xl font-extrabold text-gray-900 mt-2">
                      {user?.is_subscribed ? 'Pro Monthly Subscription' : 'Starter Pass (Free Trial)'}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-3xl font-extrabold text-gray-900">{creditsRemaining} <span className="text-xs font-normal text-gray-500">Credits Remaining</span></p>
                    <p className="text-xs text-gray-500 font-normal mt-0.5">{creditsUsed} total credits consumed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/80 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 mb-1">10 Credits Top-Up Pack</h4>
                      <p className="text-xs text-gray-500 mb-4 font-normal">Pay once. Credits stay valid for 90 days across all tools.</p>
                      <p className="text-2xl font-extrabold text-gray-900 mb-4">{topupPrice}</p>
                    </div>
                    <button
                      onClick={() => window.open(DODO_PRODUCTS.topup_10.checkoutUrl, '_blank', 'noopener,noreferrer')}
                      className="w-full bg-black text-white hover:bg-gray-800 font-extrabold py-3 rounded-xl text-xs transition cursor-pointer"
                    >
                      Buy Top-Up Pack ({topupPrice})
                    </button>
                  </div>

                  <div className="bg-black text-white p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#CCFF00] mb-1">Pro Monthly Subscription</h4>
                      <p className="text-xs text-gray-300 mb-4 font-normal">250 credits per month refilled automatically for active studios.</p>
                      <p className="text-2xl font-extrabold text-white mb-4">{monthlyPrice}/mo</p>
                    </div>
                    <button
                      onClick={() => window.open(DODO_PRODUCTS.pro_monthly.checkoutUrl, '_blank', 'noopener,noreferrer')}
                      className="w-full bg-[#CCFF00] text-black hover:bg-white font-extrabold py-3 rounded-xl text-xs transition cursor-pointer"
                    >
                      Get Pro Monthly ({monthlyPrice}/mo)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
