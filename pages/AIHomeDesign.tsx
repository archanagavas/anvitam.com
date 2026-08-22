/**
 * pages/AIHomeDesign.tsx — Anvitam's AI Studio Master Interface
 * 
 * Features:
 * 1. Seamless Single Navbar Layout (Unified with Anvitam Header)
 * 2. Dedicated Tools for Interior, Exterior Facade, Garden, Replace, Removal, Declutter, Style Transfer, Walls, Flooring
 * 3. 100% Interactive Prompt Bar & 1-Click Sample Photo Selector
 * 4. Interactive Before/After Split Canvas & Shoppable Regional Pins (India 🇮🇳, USA 🇺🇸, Brazil 🇧🇷)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Upload, Wand2, ArrowLeft, Download, RefreshCw, Image as ImageIcon,
  Check, ChevronRight, Sliders, ShieldCheck, Crown, ShoppingBag, MapPin, ExternalLink,
  Layers, Home, Building, Trees, Trash2, Paintbrush, LayoutGrid, Zap, PanelLeft, X, AlertCircle
} from 'lucide-react';
import { getToolUser, type ToolUser } from '../utils/userAuth';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';
import { ToolsPaywallOverlay } from '../components/tools/ToolsPaywallOverlay';

// Preset visual styles for design brief drawer
const STYLE_OPTIONS = [
  { id: 'modern', name: 'Modern Minimalist', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop' },
  { id: 'cozy', name: 'Warm Cozy', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop' },
  { id: 'scandinavian', name: 'Scandinavian', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=300&auto=format&fit=crop' },
  { id: 'luxury', name: 'High-End Luxury', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=300&auto=format&fit=crop' },
  { id: 'farmhouse', name: 'Modern Farmhouse', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop' },
  { id: 'japandi', name: 'Japandi Zen', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=300&auto=format&fit=crop' }
];

// Quick Sample Photos for 1-Click Testing
const SAMPLE_PHOTOS = [
  { id: 'living', label: '🛋️ Living Room', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop', module: 'interior' },
  { id: 'exterior', label: '🏡 House Exterior', url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=800&auto=format&fit=crop', module: 'exterior' },
  { id: 'garden', label: '🌿 Yard & Lawn', url: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=800&auto=format&fit=crop', module: 'garden' },
  { id: 'sofa', label: '🪑 Sofa Lounge', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop', module: 'replace' }
];

export default function AIHomeDesign() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active module from URL (interior, exterior, garden, replace, remove, declutter, style-transfer, walls, flooring)
  const initialModule = searchParams.get('module') || 'interior';
  const [selectedModule, setSelectedModule] = useState<string>(initialModule);

  // User & Auth State
  const [user, setUser] = useState<ToolUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // UI Drawer & Sidebar States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showBriefCard, setShowBriefCard] = useState(false);

  // Form State
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [designMode, setDesignMode] = useState<'empty' | 'restyle'>('restyle');
  const [roomType, setRoomType] = useState<string>('Living Room');
  const [selectedStyle, setSelectedStyle] = useState<string>('modern');
  const [colorPalette, setColorPalette] = useState<string>('Surprise Me');
  const [promptText, setPromptText] = useState<string>('');
  const [budget, setBudget] = useState<string>('Mid-Range');
  const [region, setRegion] = useState<'India' | 'USA' | 'Brazil'>('India');

  // Generation & Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [pins, setPins] = useState<any[]>([]);
  const [activePin, setActivePin] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getToolUser());
    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ToolUser | null>;
      setUser(customEvent.detail);
    };
    window.addEventListener('anvitam-user-updated', handleUserUpdate);
    return () => window.removeEventListener('anvitam-user-updated', handleUserUpdate);
  }, []);

  useEffect(() => {
    const mod = searchParams.get('module');
    if (mod) setSelectedModule(mod);
  }, [searchParams]);

  const handleSelectModule = (modId: string) => {
    setSelectedModule(modId);
    setSearchParams({ module: modId });
    setShowBriefCard(true);
  };

  const handleImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit. Please select a smaller photo.');
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSourceImage(e.target?.result as string);
      setShowBriefCard(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSamplePhoto = (sampleUrl: string, sampleMod: string) => {
    setSelectedModule(sampleMod);
    setSearchParams({ module: sampleMod });
    setSourceImage(sampleUrl);
    setShowBriefCard(true);
  };

  const handlePromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!getToolUser()) {
      setShowAuthModal(true);
      return;
    }
    setShowBriefCard(true);
  };

  // OpenRouter Model Selection (Fast: 1 Credit, FLUX: 2 Credits, GPT-4o: 3 Credits)
  const [selectedAiModel, setSelectedAiModel] = useState<'fast' | 'flux' | 'claude' | 'gpt4o'>('fast');

  const getModelCreditCost = (model: string) => {
    switch (model) {
      case 'gpt4o': return 3;
      case 'flux': return 2;
      case 'claude': return 2;
      default: return 1;
    }
  };

  const handleGenerate = async () => {
    const currentUser = getToolUser();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const creditCost = getModelCreditCost(selectedAiModel);

    if (currentUser.credits_remaining < creditCost) {
      setShowPaywall(true);
      return;
    }

    if (!sourceImage) {
      setErrorMsg('Please upload a room photo or choose a sample image to render your AI design.');
      setShowBriefCard(true);
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          module: selectedModule,
          image: sourceImage,
          designMode,
          roomType,
          style: selectedStyle,
          colorPalette,
          promptText,
          budget,
          region,
          modelTier: selectedAiModel,
          email: currentUser.email
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Design generation failed.');
      }

      setGeneratedImage(data.generatedImage);
      setShowBriefCard(false);

      if (currentUser.credits_remaining > 0) {
        currentUser.credits_remaining = Math.max(0, currentUser.credits_remaining - creditCost);
        currentUser.credits_used = (currentUser.credits_used || 0) + creditCost;
        setUser({ ...currentUser });
      }

      fetchRecommendations(roomType, selectedStyle);
      fetchElementPins(data.generatedImage);

    } catch (err: any) {
      console.error('[AI Design Error]', err);
      setErrorMsg(err.message || 'Unable to generate design. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchRecommendations = async (rType: string, rStyle: string) => {
    try {
      const res = await fetch('/api/ai-design?action=recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomType: rType, style: rStyle, region, budget })
      });
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
        if (data.catalog) setCatalog(data.catalog);
      }
    } catch (err) {
      console.error('[Recommend error]', err);
    }
  };

  const fetchElementPins = async (img: string) => {
    try {
      const res = await fetch('/api/ai-design?action=detect-elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: img })
      });
      const data = await res.json();
      if (data.success && data.pins) {
        setPins(data.pins);
      }
    } catch (err) {
      console.error('[Detect Pins error]', err);
    }
  };

  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  return (
    <>
      <Helmet>
        <title>Anvitam's AI Studio | AI Interior &amp; Exterior Design</title>
        <meta name="description" content="Photorealistic AI Studio for interior design, exterior facade, garden landscape, room restyle, and furniture replacement." />
      </Helmet>

      {/* Main Studio Wrapper (Gaps under main float header) */}
      <div className="w-full bg-[#FAFBFD] text-[#111111] min-h-screen font-sans flex flex-col pt-20">

        <div className="flex-1 flex overflow-hidden">

          {/* ── LEFT STUDIO SIDEBAR (Sticky Pinned, Zero Scroll Needed) ── */}
          <aside className={`bg-white border-r border-gray-200/80 w-64 p-5 shrink-0 flex flex-col justify-between sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto z-30 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16 md:px-2'
          }`}>
            <div className="space-y-6">
              
              {/* Home / Studio Title */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-xs font-extrabold text-gray-900 hover:text-black transition cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>Studio Dashboard</span>
                </button>
              </div>

              {/* Design Space Category */}
              <div className="space-y-1">
                <p className={`text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 mb-2 ${
                  sidebarOpen ? 'block' : 'hidden md:hidden'
                }`}>
                  Design Space
                </p>
                {[
                  { id: 'interior', label: 'Interior Design', icon: <Home size={16} /> },
                  { id: 'exterior', label: 'Exterior Design', icon: <Building size={16} /> },
                  { id: 'garden', label: 'Garden Design', icon: <Trees size={16} /> }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectModule(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                      selectedModule === item.id
                        ? 'bg-[#111111] text-[#CCFF00] font-extrabold shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    {item.icon}
                    <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Edit & Replace Category */}
              <div className="space-y-1">
                <p className={`text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 mb-2 ${
                  sidebarOpen ? 'block' : 'hidden md:hidden'
                }`}>
                  Edit &amp; Replace
                </p>
                {[
                  { id: 'replace', label: 'Replace & Add Furniture', icon: <Wand2 size={16} /> },
                  { id: 'remove', label: 'Furniture Removal', icon: <Trash2 size={16} /> },
                  { id: 'declutter', label: 'Room Declutter', icon: <Layers size={16} /> },
                  { id: 'style-transfer', label: 'Style Transfer', icon: <Paintbrush size={16} /> }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectModule(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                      selectedModule === item.id
                        ? 'bg-[#111111] text-[#CCFF00] font-extrabold shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    {item.icon}
                    <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Structure & Surface Category */}
              <div className="space-y-1">
                <p className={`text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 mb-2 ${
                  sidebarOpen ? 'block' : 'hidden md:hidden'
                }`}>
                  Structure &amp; Surface
                </p>
                {[
                  { id: 'walls', label: 'New Walls', icon: <LayoutGrid size={16} /> },
                  { id: 'flooring', label: 'New Flooring', icon: <Sliders size={16} /> }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectModule(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                      selectedModule === item.id
                        ? 'bg-[#111111] text-[#CCFF00] font-extrabold shadow-xs'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    {item.icon}
                    <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>{item.label}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* Pro Upgrade CTA */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowPaywall(true)}
                className="w-full bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-extrabold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-black/10"
              >
                <Zap size={16} className="fill-black text-black shrink-0" />
                <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>Upgrade to Pro</span>
              </button>
            </div>
          </aside>

          {/* ── MAIN WORKSPACE CANVAS ── */}
          <main className="flex-1 bg-[#FAFBFD] p-6 sm:p-10 overflow-y-auto max-w-6xl mx-auto w-full">
            
            {/* Top Workspace Toolbar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/80">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-xl text-gray-600 hover:text-black hover:bg-gray-200 transition cursor-pointer"
                  title="Toggle Sidebar"
                >
                  <PanelLeft size={18} />
                </button>

                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                  <span className="text-gray-900 font-extrabold">Anvitam's AI Studio</span>
                  <span>/</span>
                  <span className="text-black font-extrabold capitalize">{selectedModule.replace('-', ' ')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPaywall(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#111111] text-[#CCFF00] border border-black text-xs font-extrabold flex items-center gap-1.5 hover:bg-black transition cursor-pointer shadow-2xs"
                >
                  <Zap size={14} className="fill-[#CCFF00] text-[#CCFF00]" />
                  <span>{user?.credits_remaining ?? 3} Credits</span>
                </button>

                <button
                  onClick={() => setShowBriefCard(true)}
                  className="bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-extrabold px-4 py-2 rounded-2xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-black/10 shadow-2xs"
                >
                  <Sliders size={14} /> Open Design Brief
                </button>
              </div>
            </div>

            {/* HERO GREETING SECTION */}
            {!generatedImage && (
              <div className="space-y-10 my-4">
                
                <div className="text-center space-y-5 max-w-2xl mx-auto">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Hello, how may I help you?
                  </h1>

                  {/* Centered Interactive AI Prompt Box */}
                  <form onSubmit={handlePromptSubmit} className="relative max-w-xl mx-auto space-y-3">
                    <div className="bg-white border border-gray-300 hover:border-gray-900 rounded-3xl p-3 shadow-md flex items-center gap-3 transition">
                      <div className="p-2.5 bg-[#111111] text-[#CCFF00] rounded-2xl shrink-0">
                        <Wand2 size={18} />
                      </div>
                      <input
                        type="text"
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Ask Anvitam's AI anything (e.g. Modern Scandinavian living room with warm wood)..."
                        className="w-full bg-transparent border-none text-xs text-gray-900 outline-none placeholder:text-gray-400 font-medium"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="submit"
                          className="w-9 h-9 rounded-full bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black transition flex items-center justify-center font-bold cursor-pointer border border-black/10 shadow-2xs"
                          title="Generate Design"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>

                    {/* OpenRouter Model Tier Selection Bar */}
                    <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] font-semibold text-gray-500 mr-1">AI Model Engine:</span>
                      {[
                        { id: 'fast', label: '⚡ Anvitam Fast (1 Cred)', desc: 'Standard Gemini/OpenRouter' },
                        { id: 'flux', label: '🚀 FLUX.1 Pro (2 Creds)', desc: 'Photorealistic Architectural Elevation' },
                        { id: 'claude', label: '🏛️ Claude Spec (2 Creds)', desc: 'Spatial Detail Engine' },
                        { id: 'gpt4o', label: '💎 GPT-4o 4K (3 Creds)', desc: 'Ultra-HD Luxury Render' }
                      ].map(model => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => setSelectedAiModel(model.id as any)}
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                            selectedAiModel === model.id
                              ? 'bg-[#111111] text-[#CCFF00] shadow-2xs'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                          title={model.desc}
                        >
                          {model.label}
                        </button>
                      ))}
                    </div>
                  </form>

                  {/* 1-Click Sample Photo Testing Chips */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 block">
                      Or click a sample photo to test rendering in 1-click:
                    </span>
                    <div className="flex items-center justify-center flex-wrap gap-2">
                      {SAMPLE_PHOTOS.map(sample => (
                        <button
                          key={sample.id}
                          onClick={() => handleSelectSamplePhoto(sample.url, sample.module)}
                          className="bg-white border border-gray-300 hover:border-black text-gray-800 text-xs font-extrabold px-3 py-1.5 rounded-full transition flex items-center gap-2 cursor-pointer shadow-2xs hover:scale-105"
                        >
                          <img src={sample.url} alt={sample.label} className="w-5 h-5 rounded-full object-cover" />
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* EXPLORE AI TOOLS CARDS */}
                <div className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-5 bg-[#CCFF00] rounded-full inline-block border border-black/20" />
                      Explore AI tools for your design workflow
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      {
                        id: 'interior',
                        title: 'Interior Design',
                        desc: 'Transform interiors with AI-generated designs',
                        imageBefore: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'exterior',
                        title: 'Exterior Design',
                        desc: 'Refresh exteriors with AI-powered redesigns',
                        imageBefore: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'garden',
                        title: 'Garden Design',
                        desc: 'Design stunning gardens and outdoor spaces',
                        imageBefore: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'replace',
                        title: 'Replace & Add Furniture',
                        desc: 'Instantly add or replace furniture with AI',
                        imageBefore: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'remove',
                        title: 'Furniture Removal',
                        desc: 'Remove furniture and objects in one click',
                        imageBefore: 'https://images.unsplash.com/photo-1540518614846-7ede433c5172?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=300&auto=format&fit=crop'
                      }
                    ].map(card => (
                      <div
                        key={card.id}
                        onClick={() => handleSelectModule(card.id)}
                        className={`bg-white rounded-2xl border transition cursor-pointer group flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                          selectedModule === card.id ? 'border-black ring-2 ring-black/10' : 'border-gray-200/80 hover:border-gray-400'
                        }`}
                      >
                        <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                          <div className="absolute inset-0 flex">
                            <div className="w-1/2 h-full overflow-hidden border-r border-white">
                              <img src={card.imageBefore} alt="Before" className="w-full h-full object-cover" />
                            </div>
                            <div className="w-1/2 h-full overflow-hidden">
                              <img src={card.imageAfter} alt="After" className="w-full h-full object-cover" />
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 space-y-1">
                          <h3 className="text-xs font-extrabold text-gray-900 group-hover:text-black">
                            {card.title}
                          </h3>
                          <p className="text-[10px] text-gray-500 line-clamp-2 leading-snug">
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* GENERATED DESIGN OUTPUT CANVAS */}
            {generatedImage && (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Your AI Design Render</h2>
                    <p className="text-xs text-gray-500">Drag the slider to compare original photo vs AI render.</p>
                  </div>
                  <button
                    onClick={() => setShowBriefCard(true)}
                    className="bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-extrabold text-xs px-4 py-2 rounded-2xl transition cursor-pointer border border-black/10 flex items-center gap-1.5"
                  >
                    <Wand2 size={14} /> Adjust Settings &amp; Re-Render
                  </button>
                </div>

                {/* Interactive Before / After Split Slider Canvas */}
                <div
                  ref={sliderRef}
                  onMouseMove={(e) => handleSliderMove(e.clientX)}
                  onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                  className="relative h-[480px] sm:h-[550px] w-full rounded-3xl overflow-hidden border border-gray-300 shadow-lg select-none cursor-ew-resize bg-black"
                >
                  <img src={generatedImage} alt="After" className="absolute inset-0 w-full h-full object-cover" />

                  {sourceImage && (
                    <div
                      className="absolute top-0 left-0 bottom-0 overflow-hidden border-r-2 border-[#CCFF00]"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img src={sourceImage} alt="Before" className="w-full h-full object-cover max-w-none" />
                    </div>
                  )}

                  {/* Slider Handle Divider */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-[#CCFF00] shadow-md flex items-center justify-center pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-black text-[#CCFF00] font-extrabold flex items-center justify-center text-xs shadow-lg border border-[#CCFF00]">
                      ↔
                    </div>
                  </div>

                  <span className="absolute bottom-4 left-4 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-black/80 text-white backdrop-blur-md">
                    Original Photo
                  </span>
                  <span className="absolute bottom-4 right-4 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#CCFF00] text-black shadow-md font-bold">
                    Anvitam AI Render
                  </span>
                </div>

                {/* Export & Catalog Link Footer */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">
                    💡 Click any pin on the image to view shoppable catalog items for {region}.
                  </span>
                  <a
                    href={generatedImage}
                    download="anvitam-ai-design.jpg"
                    className="bg-[#111111] hover:bg-black text-[#CCFF00] font-extrabold text-xs px-5 py-2.5 rounded-2xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download size={14} /> Export HD Design
                  </a>
                </div>

              </div>
            )}

          </main>

        </div>

        {/* ── DESIGN BRIEF CARD SLIDE-IN DRAWER ── */}
        <AnimatePresence>
          {showBriefCard && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-gray-200"
              >
                <div className="space-y-6">
                  
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-900">Design Brief Settings</h2>
                      <p className="text-xs text-gray-500 capitalize">Mode: {selectedModule.replace('-', ' ')}</p>
                    </div>
                    <button
                      onClick={() => setShowBriefCard(false)}
                      className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Step 1: Upload or Choose Photo */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#111111] text-[#CCFF00] font-extrabold text-[10px] flex items-center justify-center">1</span>
                      <h3 className="text-xs font-extrabold text-gray-900">Upload or Select Room Photo</h3>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      accept="image/*"
                      className="hidden"
                    />

                    {sourceImage ? (
                      <div className="relative h-40 rounded-2xl overflow-hidden border border-gray-300">
                        <img src={sourceImage} alt="Uploaded" className="w-full h-full object-cover" />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          Change Photo
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 hover:border-gray-900 bg-gray-50 p-6 rounded-2xl text-center cursor-pointer transition space-y-2"
                      >
                        <Upload size={24} className="mx-auto text-gray-400" />
                        <p className="text-xs font-extrabold text-gray-800">Click to upload your room photo</p>
                        <p className="text-[10px] text-gray-400">Supports JPG, PNG, WEBP up to 10MB</p>
                      </div>
                    )}

                    {/* Quick Sample Photos */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase">Or select sample photo:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {SAMPLE_PHOTOS.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleSelectSamplePhoto(s.url, s.module)}
                            className="p-2 rounded-xl border border-gray-200 hover:border-black bg-gray-50 flex items-center gap-2 cursor-pointer transition text-left"
                          >
                            <img src={s.url} alt={s.label} className="w-7 h-7 rounded-lg object-cover" />
                            <span className="text-[11px] font-bold text-gray-800 truncate">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Room Type */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#111111] text-[#CCFF00] font-extrabold text-[10px] flex items-center justify-center">2</span>
                      <h3 className="text-xs font-extrabold text-gray-900">Room or Area Type</h3>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {['Living Room', 'Bedroom', 'Kitchen', 'Exterior Facade', 'Backyard Garden', 'Bathroom', 'Office Lounge'].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRoomType(r)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            roomType === r
                              ? 'bg-[#111111] text-[#CCFF00] shadow-2xs'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Style Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#111111] text-[#CCFF00] font-extrabold text-[10px] flex items-center justify-center">3</span>
                      <h3 className="text-xs font-extrabold text-gray-900">Architectural Style</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {STYLE_OPTIONS.map(st => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSelectedStyle(st.id)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                            selectedStyle === st.id
                              ? 'border-black bg-gray-100 font-extrabold ring-1 ring-black'
                              : 'border-gray-200 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <img src={st.img} alt={st.name} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-[11px] font-extrabold text-gray-800 truncate">{st.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 4: Market Region & Catalog */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#111111] text-[#CCFF00] font-extrabold text-[10px] flex items-center justify-center">4</span>
                      <h3 className="text-xs font-extrabold text-gray-900">Shoppable Catalog Region</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {[
                        { id: 'India', flag: '🇮🇳 India' },
                        { id: 'USA', flag: '🇺🇸 USA' },
                        { id: 'Brazil', flag: '🇧🇷 Brazil' }
                      ].map(reg => (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => setRegion(reg.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            region === reg.id
                              ? 'bg-[#111111] text-[#CCFF00]'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {reg.flag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                </div>

                {/* Drawer Footer Action */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-extrabold py-3.5 rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer border border-black/10"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" /> Rendering AI Design...
                      </>
                    ) : (
                      <>
                        <Wand2 size={15} /> Render AI Design (1 Credit)
                      </>
                    )}
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
