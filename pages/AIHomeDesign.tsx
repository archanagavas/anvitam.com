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
  Layers, Home, Building, Trees, Trash2, Paintbrush, LayoutGrid, Zap, Menu, X, AlertCircle,
  Settings, LogOut
} from 'lucide-react';
import { getToolUser, getOrCreateDefaultToolUser, logoutToolUser, type ToolUser } from '../utils/userAuth';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';
import { ToolsPaywallOverlay } from '../components/tools/ToolsPaywallOverlay';
import { AllToolsDrawer } from '../components/tools/AllToolsDrawer';
import { ToolsSettingsModal } from '../components/tools/ToolsSettingsModal';

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
  const [showToolsDrawer, setShowToolsDrawer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // UI Drawer & Sidebar States
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
    setUser(getOrCreateDefaultToolUser());
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
      const res = await fetch('/api/ai-design?action=generate', {
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

      {/* Main Studio Wrapper */}
      <div className="w-full bg-[#FAFBFD] text-[#111111] min-h-screen font-sans flex flex-col pt-20">

        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── MAIN WORKSPACE CANVAS ── */}
          <main className="flex-1 bg-[#FAFBFD] p-6 sm:p-10 overflow-y-auto max-w-6xl mx-auto w-full">
            
            {/* Top Workspace Toolbar (Unified Header with Hamburger, Settings & Logout) */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/80 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowToolsDrawer(true)}
                  className="px-3 py-2 rounded-xl bg-black text-[#CCFF00] hover:bg-gray-800 transition cursor-pointer flex items-center gap-2 text-xs font-semibold shadow-2xs"
                  title="Open All 21+ Tools Drawer"
                  aria-label="Open All 21+ Tools Drawer"
                >
                  <Menu size={16} />
                  <span>All Tools</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span className="text-gray-900 font-semibold">Anvitam Studio</span>
                  <span>/</span>
                  <span className="text-black font-semibold capitalize">{selectedModule.replace('-', ' ')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {user ? (
                  <button
                    type="button"
                    onClick={() => setShowPaywall(true)}
                    aria-label="View or top up available studio credits"
                    className="px-3.5 py-1.5 rounded-full bg-[#111111] text-[#CCFF00] border border-black text-xs font-semibold flex items-center gap-1.5 hover:bg-black transition cursor-pointer shadow-2xs"
                  >
                    <Zap size={14} className="fill-[#CCFF00] text-[#CCFF00]" />
                    <span>{user.credits_remaining} Credits</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    aria-label="Sign in to Anvitam Studio"
                    className="px-3.5 py-1.5 rounded-full bg-[#CCFF00] text-black border border-black/10 text-xs font-semibold hover:bg-black hover:text-[#CCFF00] transition cursor-pointer shadow-2xs"
                  >
                    Sign In / Register
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowBriefCard(true)}
                  aria-label="Open Design Brief parameters"
                  className="bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-semibold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-black/10 shadow-2xs"
                >
                  <Sliders size={14} />
                  <span>Design Brief</span>
                </button>

                {/* Settings Button */}
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 rounded-xl bg-white border border-gray-200/80 hover:border-gray-400 text-gray-700 hover:text-black transition cursor-pointer shadow-2xs"
                  title="Studio & Account Settings"
                  aria-label="Studio & Account Settings"
                >
                  <Settings size={17} />
                </button>

                {/* Sign Out Button */}
                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      logoutToolUser();
                      setUser(null);
                    }}
                    className="p-2 rounded-xl bg-white border border-gray-200/80 hover:border-red-400 text-gray-600 hover:text-red-600 transition cursor-pointer shadow-2xs"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut size={17} />
                  </button>
                )}
              </div>
            </div>

            {/* HERO GREETING SECTION */}
            {!generatedImage && (
              <div className="space-y-10 my-4">
                
                <div className="text-center space-y-5 max-w-2xl mx-auto">
                  <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
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
                        aria-label="Ask Anvitam's AI architectural design prompt"
                        className="w-full bg-transparent border-none text-xs text-gray-900 outline-none placeholder:text-gray-400 font-medium"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="submit"
                          className="w-9 h-9 rounded-full bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black transition flex items-center justify-center font-bold cursor-pointer border border-black/10 shadow-2xs"
                          title="Generate Design"
                          aria-label="Submit AI Design prompt to generate image"
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
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 block">
                      Or click a sample photo to test rendering in 1-click:
                    </span>
                    <div className="flex items-center justify-center flex-wrap gap-2">
                      {SAMPLE_PHOTOS.map(sample => (
                        <button
                          key={sample.id}
                          onClick={() => handleSelectSamplePhoto(sample.url, sample.module)}
                          className="bg-white border border-gray-300 hover:border-black text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full transition flex items-center gap-2 cursor-pointer shadow-2xs hover:scale-105"
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
                    <h2 className="text-lg font-semibold text-gray-900 tracking-tight flex items-center gap-2">
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
                          <h3 className="text-xs font-semibold text-gray-900 group-hover:text-black">
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
                    <h2 className="text-xl font-semibold text-gray-900">Your AI Design Render</h2>
                    <p className="text-xs text-gray-500">Drag the slider to compare original photo vs AI render.</p>
                  </div>
                  <button
                    onClick={() => setShowBriefCard(true)}
                    className="bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-semibold text-xs px-4 py-2 rounded-2xl transition cursor-pointer border border-black/10 flex items-center gap-1.5"
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
                    <div className="w-8 h-8 rounded-full bg-black text-[#CCFF00] font-semibold flex items-center justify-center text-xs shadow-lg border border-[#CCFF00]">
                      ↔
                    </div>
                  </div>

                  <span className="absolute bottom-4 left-4 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-black/80 text-white backdrop-blur-md">
                    Original Photo
                  </span>
                  <span className="absolute bottom-4 right-4 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[#CCFF00] text-black shadow-md font-bold">
                    Anvitam AI Render
                  </span>
                </div>

                {/* Export Action Footer */}
                <div className="flex items-center justify-end pt-2">
                  <a
                    href={generatedImage}
                    download="anvitam-ai-design.jpg"
                    className="bg-[#111111] hover:bg-black text-[#CCFF00] font-semibold text-xs px-5 py-2.5 rounded-2xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
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
                      <h2 className="text-lg font-semibold text-gray-900">Design Brief Settings</h2>
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
                      <span className="w-5 h-5 rounded-full bg-[#111111] text-[#CCFF00] font-semibold text-[10px] flex items-center justify-center">1</span>
                      <h3 className="text-xs font-semibold text-gray-900">Upload or Select Room Photo</h3>
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
                          className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white text-[10px] font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
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
                        <p className="text-xs font-semibold text-gray-800">Click to upload your room photo</p>
                        <p className="text-[10px] text-gray-400">Supports JPG, PNG, WEBP up to 10MB</p>
                      </div>
                    )}

                    {/* Quick Sample Photos */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">Or select sample photo:</span>
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
                      <span className="w-5 h-5 rounded-full bg-[#111111] text-[#CCFF00] font-semibold text-[10px] flex items-center justify-center">2</span>
                      <h3 className="text-xs font-semibold text-gray-900">Room or Area Type</h3>
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
                      <span className="w-5 h-5 rounded-full bg-[#111111] text-[#CCFF00] font-semibold text-[10px] flex items-center justify-center">3</span>
                      <h3 className="text-xs font-semibold text-gray-900">Architectural Style</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {STYLE_OPTIONS.map(st => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSelectedStyle(st.id)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                            selectedStyle === st.id
                              ? 'border-black bg-gray-100 font-semibold ring-1 ring-black'
                              : 'border-gray-200 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <img src={st.img} alt={st.name} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-[11px] font-semibold text-gray-800 truncate">{st.name}</span>
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
                    className="w-full bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-semibold py-3.5 rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer border border-black/10"
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

      <AllToolsDrawer
        isOpen={showToolsDrawer}
        onClose={() => setShowToolsDrawer(false)}
        activeToolId="ai-home-design"
      />

      <ToolsSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        user={user}
        onLogout={() => {
          logoutToolUser();
          setUser(null);
        }}
        onUpgrade={() => setShowPaywall(true)}
      />

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
