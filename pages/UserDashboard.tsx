// pages/UserDashboard.tsx — Unified Architectural & AI Studio Workspace
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, Crown, LogOut, Search, Compass, CreditCard, ChevronRight,
  Sparkles, Home, Building, Trees, Wand2, Trash2, MapPin, Mountain,
  Sliders, CheckCircle2, ArrowUpRight, User, ShieldCheck, X, Filter,
  MessageSquare, Send, PanelLeft, Bot
} from 'lucide-react';
import { getToolUser, logoutToolUser, type ToolUser } from '../utils/userAuth';
import { TOOLS_SUITE, type ToolItem } from '../constants/toolsData';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';
import { ToolsPaywallOverlay } from '../components/tools/ToolsPaywallOverlay';
import { DODO_PRODUCTS } from '../constants/dodoConfig';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<ToolUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Active Tool Selection from URL or default
  const activeToolParam = searchParams.get('tool') || 'ai-home-design';
  const [activeToolId, setActiveToolId] = useState<string>(activeToolParam);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Chat Assistant State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your Anvitam AI Architectural & Design Assistant. Ask me anything about solar path, building facade, room restyle, or carbon estimates!' }
  ]);

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
    const param = searchParams.get('tool');
    if (param) setActiveToolId(param);
  }, [searchParams]);

  const handleSelectTool = (toolId: string, href: string) => {
    setActiveToolId(toolId);
    setSearchParams({ tool: toolId });
    navigate(href);
  };

  const handleLogout = () => {
    logoutToolUser();
    navigate('/tools');
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);

    // Smart AI Assistant Response
    setTimeout(() => {
      let aiResponse = "I can analyze your architectural site data or generate photorealistic AI designs. Which tool would you like to run?";
      const lower = userText.toLowerCase();

      if (lower.includes('sun') || lower.includes('shadow') || lower.includes('solar')) {
        aiResponse = "For 3D sun path simulation & hourly shadow analysis, try our 3D Solar Path Tool. Click 'Site Analysis' in the left menu!";
      } else if (lower.includes('interior') || lower.includes('living room') || lower.includes('bedroom')) {
        aiResponse = "I recommend our AI Interior Design Studio! You can upload room photos or test 1-click sample styles.";
      } else if (lower.includes('exterior') || lower.includes('facade') || lower.includes('building')) {
        aiResponse = "Our AI Exterior Facade Studio can render modern timber, glass, and stone elevation renders instantly.";
      } else if (lower.includes('garden') || lower.includes('yard') || lower.includes('landscape')) {
        aiResponse = "For outdoors and terraces, launch the AI Garden Landscape Studio in the sidebar menu.";
      } else if (lower.includes('cost') || lower.includes('carbon') || lower.includes('price')) {
        aiResponse = "Check out our Embodied Carbon & Cost Estimator tool under Building Cost & Carbon in the menu.";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 600);
  };

  const totalCreditsAllocated = user?.is_subscribed ? 250 : 3;
  const creditsRemaining = user?.credits_remaining ?? 3;

  // Selected tool item metadata
  const currentToolObj = TOOLS_SUITE.find(t => t.id === activeToolId) || TOOLS_SUITE[0];

  // Group tools for left sidebar
  const aiToolsGroup = TOOLS_SUITE.filter(t => t.id.startsWith('ai-'));
  const siteToolsGroup = TOOLS_SUITE.filter(t => !t.id.startsWith('ai-'));

  const filteredTools = TOOLS_SUITE.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Unified Studio Dashboard | Anvitam Architectural &amp; AI Tools</title>
      </Helmet>

      <div className="bg-[#FAFBFD] text-[#111111] min-h-screen font-sans antialiased flex flex-col pt-20">

        <div className="flex-1 flex overflow-hidden">

          {/* ── LEFT SIDEBAR (All Tools Listed for Instant Switching) ── */}
          <aside className={`bg-white border-r border-gray-200/80 w-64 p-5 shrink-0 flex flex-col justify-between sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto z-30 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16 md:px-2'
          }`}>
            <div className="space-y-6">
              
              {/* Studio Header */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#CCFF00] font-bold flex items-center justify-center text-sm shadow-2xs">
                  A
                </div>
                <div className={sidebarOpen ? 'block' : 'hidden md:hidden'}>
                  <h2 className="text-sm font-semibold text-gray-900 tracking-tight">Anvitam Studio</h2>
                  <p className="text-[10px] text-gray-500 font-normal">21+ Architectural Tools</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className={`relative ${sidebarOpen ? 'block' : 'hidden md:hidden'}`}>
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-900 outline-none focus:border-black font-normal"
                />
              </div>

              {/* Group 1: AI Design Tools */}
              <div className="space-y-1">
                <p className={`text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-1.5 ${
                  sidebarOpen ? 'block' : 'hidden md:hidden'
                }`}>
                  Anvitam AI Design Tools
                </p>
                {aiToolsGroup.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTool(t.id, t.href)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                      activeToolId === t.id
                        ? 'bg-[#111111] text-[#CCFF00] font-semibold shadow-2xs'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-black font-medium'
                    }`}
                  >
                    <span className="shrink-0">{t.iconSvg}</span>
                    <span className={`truncate ${sidebarOpen ? 'block' : 'hidden md:hidden'}`}>{t.name}</span>
                  </button>
                ))}
              </div>

              {/* Group 2: Site Intelligence Suite */}
              <div className="space-y-1 pt-2 border-t border-gray-100">
                <p className={`text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 mb-1.5 ${
                  sidebarOpen ? 'block' : 'hidden md:hidden'
                }`}>
                  Architectural Site Suite
                </p>
                {siteToolsGroup.slice(0, 8).map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTool(t.id, t.href)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                      activeToolId === t.id
                        ? 'bg-[#111111] text-[#CCFF00] font-semibold shadow-2xs'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-black font-medium'
                    }`}
                  >
                    <span className="shrink-0">{t.iconSvg}</span>
                    <span className={`truncate ${sidebarOpen ? 'block' : 'hidden md:hidden'}`}>{t.name}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* Bottom Upgrade CTA */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <button
                onClick={() => setShowPaywall(true)}
                className="w-full bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs border border-black/10"
              >
                <Crown size={14} />
                <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>Upgrade to Pro</span>
              </button>

              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-red-600 transition cursor-pointer ${
                  sidebarOpen ? 'justify-start' : 'justify-center'
                }`}
              >
                <LogOut size={15} />
                <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* ── MAIN STUDIO WORKSPACE CANVAS ── */}
          <main className="flex-1 bg-[#FAFBFD] p-6 sm:p-8 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
            
            {/* Studio Workspace Header Bar */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition cursor-pointer"
                  title="Toggle Sidebar"
                >
                  <PanelLeft size={18} />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">{currentToolObj.name}</h1>
                    <span className="text-[10px] font-semibold bg-[#111111] text-[#CCFF00] px-2 py-0.5 rounded-full uppercase">
                      {currentToolObj.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">{currentToolObj.shortDesc}</p>
                </div>
              </div>

              {/* Credit Meter & Actions */}
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                  <Zap size={14} className="fill-[#CCFF00] text-[#111111]" />
                  <span className="text-xs font-semibold text-gray-900">{creditsRemaining} Credits</span>
                </div>

                <button
                  onClick={() => navigate(currentToolObj.href)}
                  className="bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-semibold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs border border-black/10"
                >
                  Launch Interactive Studio <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            {/* ── AI CHATBOT & PROMPT ASSISTANT BAR ── */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="p-1.5 bg-[#111111] text-[#CCFF00] rounded-lg">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Anvitam AI Chatbot &amp; Studio Assistant</h3>
                  <p className="text-[10px] text-gray-500">Ask questions about solar angles, interior styles, carbon, or site analysis.</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#111111] text-[#CCFF00] font-medium'
                        : 'bg-gray-100 text-gray-800 font-normal border border-gray-200/60'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Anvitam AI anything about your site, facade, or interior project..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:border-black font-normal"
                />
                <button
                  type="submit"
                  className="bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-black/10 shadow-2xs"
                >
                  <Send size={14} /> Send
                </button>
              </form>
            </div>

            {/* ── ALL 21+ TOOLS CATALOG GRID ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 tracking-tight">
                  All Architectural &amp; AI Tools ({filteredTools.length})
                </h2>
                <span className="text-xs text-gray-500 font-normal">Click any tool card to launch</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTools.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTool(t.id, t.href)}
                    className={`bg-white rounded-2xl border overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between ${
                      activeToolId === t.id ? 'border-black ring-2 ring-black/10' : 'border-gray-200/80 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      {/* Top Preview Image */}
                      <div className="relative h-40 w-full overflow-hidden bg-gray-100 border-b border-gray-100">
                        <img
                          src={t.previewImage}
                          alt={t.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#111111] text-[#CCFF00] shadow-2xs">
                          {t.badge}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${t.iconBg}`}>
                            {t.iconSvg}
                          </div>
                          <h3 className="text-xs font-bold text-gray-900 group-hover:text-black">
                            {t.name}
                          </h3>
                        </div>

                        <p className="text-xs text-gray-600 font-normal leading-relaxed line-clamp-2">
                          {t.shortDesc}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTool(t.id, t.href);
                        }}
                        className="w-full bg-gray-100 hover:bg-[#CCFF00] hover:text-black text-gray-800 font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1 cursor-pointer border border-gray-200/80"
                      >
                        Select &amp; Run <ChevronRight size={14} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </main>

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
