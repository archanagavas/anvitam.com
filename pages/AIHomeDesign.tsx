/**
 * pages/AIHomeDesign.tsx — DecAI Studio Interface & AI Home Design Master Studio
 * 
 * Features:
 * 1. DecAI-Mirrored Layout (Left Sidebar, Top Controls, Hero Prompt Bar, Brief Card Drawer, Split Preview Cards)
 * 2. Distinct tools for Interior Design, Exterior Facade, Garden/Yard, Replace, Remove, Declutter, Style Transfer, Walls, Flooring
 * 3. Draggable Before/After Split-View Canvas Slider
 * 4. Interactive Element Bounding Box Pins with Regional Shoppable Catalog (India, USA, Brazil)
 * 5. 3-Credit Enforcement & Dynamic Upgrade Paywalls
 */

import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Upload, Image as ImageIcon, Sliders, RefreshCw, ShoppingBag,
  ExternalLink, Layers, CheckCircle2, ChevronRight, AlertCircle, Zap,
  Download, Eye, Lock, ArrowLeftRight, Check, X, Tag, Info, Palette,
  Home, Building, Trees, Wand2, Trash2, LayoutGrid, Paintbrush, PanelLeft,
  ChevronDown, Crown, Search, User, Globe
} from 'lucide-react';
import { getToolUser, logoutToolUser, type ToolUser } from '../utils/userAuth';
import { CATALOG_CATEGORIES, INITIAL_CATALOG_PRODUCTS, type CatalogProduct } from '../constants/catalogData';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';
import { ToolsPaywallOverlay } from '../components/tools/ToolsPaywallOverlay';

export interface VisualPin {
  label: string;
  element_type: string;
  x_percent: number;
  y_percent: number;
  width_percent?: number;
  height_percent?: number;
}

export interface RecommendationItem {
  product_id: string;
  category: string;
  reason: string;
  alternate_ids: string[];
}

// Preset visual styles for Step 3 in Brief Card Modal
const STYLE_OPTIONS = [
  { id: 'Modern', name: 'Modern', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=400&auto=format&fit=crop' },
  { id: 'Cozy', name: 'Cozy', image: 'https://images.unsplash.com/photo-1540518614846-7ede433c5172?q=80&w=400&auto=format&fit=crop' },
  { id: 'Minimalist', name: 'Minimalist', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=400&auto=format&fit=crop' },
  { id: 'Scandinavian', name: 'Scandinavian', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400&auto=format&fit=crop' },
  { id: 'Luxury', name: 'Luxury', badge: 'PLUS', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
  { id: 'Farmhouse', name: 'Farmhouse', badge: 'PLUS', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop' },
  { id: 'Mid Century', name: 'Mid Century', badge: 'PLUS', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format&fit=crop' },
  { id: 'Mediterranean', name: 'Mediterranean', badge: 'PLUS', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&auto=format&fit=crop' },
  { id: 'Cyberpunk', name: 'Cyberpunk', badge: 'PRO', image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=400&auto=format&fit=crop' },
  { id: 'Gothic', name: 'Gothic', badge: 'PRO', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=400&auto=format&fit=crop' },
  { id: 'Techno', name: 'Techno', badge: 'PRO', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop' },
  { id: 'Japanese', name: 'Japanese / Japandi', badge: 'PRO', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=400&auto=format&fit=crop' }
];

export default function AIHomeDesign() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<ToolUser | null>(null);

  // Region State (India, USA, Brazil)
  const [region, setRegion] = useState<'India' | 'USA' | 'Brazil'>('India');
  const [budget, setBudget] = useState<string>('');

  // Module Selection
  const [selectedModule, setSelectedModule] = useState<string>('interior');
  const [designMode, setDesignMode] = useState<'Furnish Empty Room' | 'Room Restyle' | 'Room Renovation'>('Room Restyle');
  const [roomType, setRoomType] = useState<string>('Living Room');
  const [customRoomType, setCustomRoomType] = useState<string>('');
  const [style, setStyle] = useState<string>('Modern');
  const [customStyle, setCustomStyle] = useState<string>('');
  const [colorPalette, setColorPalette] = useState<string>('Surprise Me');
  const [customColorPalette, setCustomColorPalette] = useState<string>('');

  const [spaceType, setSpaceType] = useState<string>('Backyard');
  const [target, setTarget] = useState<string>('');
  const [itemType, setItemType] = useState<string>('Sofa');
  const [newFinish, setNewFinish] = useState<string>('Sage Green Matte Paint');
  const [floorMaterial, setFloorMaterial] = useState<string>('Light Oak Hardwood');

  // Prompt Box State
  const [promptText, setPromptText] = useState<string>('');

  // Images
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // API State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pins, setPins] = useState<VisualPin[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [catalog, setCatalog] = useState<CatalogProduct[]>(INITIAL_CATALOG_PRODUCTS);
  const [selectedPin, setSelectedPin] = useState<VisualPin | null>(null);
  const [showSwapDrawer, setShowSwapDrawer] = useState<boolean>(false);

  // Brief Card Drawer Modal
  const [showBriefCard, setShowBriefCard] = useState<boolean>(false);

  // Auth & Paywall Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

  // Sidebar Collapse
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Slider Drag
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = getToolUser();
    if (currentUser) {
      setUser(currentUser);
      if (currentUser.country === 'IN') setRegion('India');
      else if (currentUser.country === 'BR') setRegion('Brazil');
      else setRegion('USA');
    }

    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ToolUser | null>;
      setUser(customEvent.detail);
    };
    window.addEventListener('anvitam-user-updated', handleUserUpdate);
    return () => window.removeEventListener('anvitam-user-updated', handleUserUpdate);
  }, []);

  // Sync module with URL search parameter
  useEffect(() => {
    const modParam = searchParams.get('module');
    if (modParam) {
      setSelectedModule(modParam);
    }
  }, [searchParams]);

  // Handle Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isRef = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      if (isRef) {
        setReferenceImage(base64);
      } else {
        setSourceImage(base64);
        setGeneratedImage(null);
        setPins([]);
        setRecommendations([]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate AI Design
  const handleGenerate = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if ((user.credits_remaining ?? 0) <= 0) {
      setShowPaywall(true);
      return;
    }

    if (!sourceImage) {
      setErrorMsg('Please upload a room or building photo first.');
      setShowBriefCard(true);
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      const token = localStorage.getItem('anvitam_tool_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const activeRoom = customRoomType.trim() || roomType;
      const activeStyle = customStyle.trim() || style;
      const activePalette = customColorPalette.trim() || colorPalette;

      const res = await fetch('/api/ai-design?action=generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sourceImage,
          referenceImage,
          module: selectedModule,
          designMode,
          roomType: activeRoom,
          style: activeStyle,
          colorPalette: activePalette,
          promptText,
          region,
          spaceType,
          target,
          itemType,
          newFinish,
          floorMaterial,
          generation_id: generationId,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate design');
      }

      setGeneratedImage(data.generatedImage);
      setShowBriefCard(false);

      // Trigger Shoppable recommendations & element pins
      fetchRecommendations(activeRoom, activeStyle);
      fetchElementPins(data.generatedImage || sourceImage);

    } catch (err: any) {
      console.error('[AIHomeDesign/generate error]', err);
      setErrorMsg(err.message || 'Error executing AI design model.');
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

  const handleSelectToolCard = (modId: string) => {
    setSelectedModule(modId);
    setShowBriefCard(true);
  };

  return (
    <>
      <Helmet>
        <title>DecAI Studio | AI Interior &amp; Exterior Design | Anvitam</title>
        <meta name="description" content="DecAI-inspired AI Studio for interior design, exterior facade, garden landscape, room restyle, and furniture replacement." />
      </Helmet>

      <div className="w-full bg-[#FFFFFF] text-[#111111] min-h-screen font-sans flex flex-col pt-16">

        {/* ── TOP APP BAR HEADER (DecAI Style) ── */}
        <header className="h-16 bg-white border-b border-gray-200/80 px-4 sm:px-6 flex items-center justify-between z-30 sticky top-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition cursor-pointer"
            >
              <PanelLeft size={18} />
            </button>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-black text-[#CCFF00] font-extrabold flex items-center justify-center text-sm shadow-xs">
                A
              </div>
              <span className="font-extrabold text-base tracking-tight text-gray-900">
                DecAI<span className="text-xs align-super text-gray-400 font-normal">™</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Credit Status Badge Pill */}
            <button
              onClick={() => setShowPaywall(true)}
              className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-100 transition cursor-pointer"
            >
              <Zap size={14} className="fill-purple-600 text-purple-600" />
              <span>{user?.credits_remaining ?? 3} Credit</span>
              <span className="text-[10px] bg-purple-600 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase ml-0.5">
                Upgrade
              </span>
            </button>

            {/* Market Region */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
              {[
                { id: 'India', flag: '🇮🇳' },
                { id: 'USA', flag: '🇺🇸' },
                { id: 'Brazil', flag: '🇧🇷' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setRegion(r.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    region === r.id ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {r.flag} {r.id}
                </button>
              ))}
            </div>

            {/* User Account */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-gray-700 hidden md:inline truncate max-w-[120px]">
                  {user.name || user.email?.split('@')[0]}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 rounded-xl bg-black text-white font-bold text-xs hover:bg-gray-800 transition cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">

          {/* ── LEFT STUDIO SIDEBAR (DecAI Layout) ── */}
          <aside className={`bg-[#FAFBFD] border-r border-gray-200/80 w-64 p-5 shrink-0 flex flex-col justify-between transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16 md:px-2'
          }`}>
            <div className="space-y-6">
              
              {/* Home */}
              <div>
                <button
                  onClick={() => { setSelectedModule('interior'); setGeneratedImage(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-900 hover:bg-gray-200/70 transition cursor-pointer"
                >
                  <Home size={17} className="text-gray-700" />
                  <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>Home</span>
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
                    onClick={() => { setSelectedModule(item.id); setShowBriefCard(true); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedModule === item.id
                        ? 'bg-gray-200 text-black font-extrabold shadow-2xs'
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
                    onClick={() => { setSelectedModule(item.id); setShowBriefCard(true); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedModule === item.id
                        ? 'bg-gray-200 text-black font-extrabold shadow-2xs'
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
                    onClick={() => { setSelectedModule(item.id); setShowBriefCard(true); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedModule === item.id
                        ? 'bg-gray-200 text-black font-extrabold shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    {item.icon}
                    <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>{item.label}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* Bottom Upgrade Button */}
            <div className="pt-4 border-t border-gray-200/80">
              <button
                onClick={() => setShowPaywall(true)}
                className={`w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold py-3 px-3 rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  sidebarOpen ? '' : 'justify-center p-2'
                }`}
              >
                <Zap size={16} className="fill-yellow-300 text-yellow-300 shrink-0" />
                <span className={sidebarOpen ? 'block' : 'hidden md:hidden'}>⚡ Upgrade Pro</span>
              </button>
            </div>
          </aside>

          {/* ── MAIN WORKSPACE CANVAS ── */}
          <main className="flex-1 bg-white p-6 sm:p-10 overflow-y-auto max-w-6xl mx-auto w-full">
            
            {/* HERO GREETING SECTION (Matching Image 4) */}
            {!generatedImage && (
              <div className="space-y-10 my-4">
                
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Hello, how may I help you?
                  </h1>

                  {/* Centered AI Prompt Box (Image 4) */}
                  <div className="relative max-w-xl mx-auto">
                    <div className="bg-white border border-gray-200/90 hover:border-gray-300 rounded-3xl p-3 shadow-md flex items-center gap-3 transition">
                      <div className="p-2 bg-gray-100 rounded-2xl text-gray-600 shrink-0">
                        <Wand2 size={18} />
                      </div>
                      <input
                        type="text"
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Ask DecAI anything..."
                        className="w-full bg-transparent border-none text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-gray-400 font-mono font-medium">0/500</span>
                        <button
                          onClick={() => setShowBriefCard(true)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-black hover:text-white transition flex items-center justify-center text-gray-700 cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EXPLORE AI TOOLS CARDS (Matching Image 4 Grid) */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#CCFF00] rounded-full inline-block" />
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
                        onClick={() => handleSelectToolCard(card.id)}
                        className="bg-white rounded-2xl border border-gray-200/80 hover:border-gray-400 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                          {/* Split image preview */}
                          <div className="absolute inset-0 flex">
                            <div className="w-1/2 h-full overflow-hidden border-r border-white/80">
                              <img src={card.imageBefore} alt="Before" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            </div>
                            <div className="w-1/2 h-full overflow-hidden">
                              <img src={card.imageAfter} alt="After" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3.5 space-y-1">
                          <h3 className="text-xs font-bold text-gray-900 group-hover:text-purple-700 transition">{card.title}</h3>
                          <p className="text-[10px] text-gray-500 leading-snug font-normal">{card.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* CANVAS DISPLAY & BEFORE/AFTER COMPARISON */}
            {generatedImage && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">Rendered AI Design Result</h2>
                    <p className="text-xs text-gray-500">Drag the center handle left/right to compare before and after.</p>
                  </div>
                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition cursor-pointer"
                  >
                    ← Back to Studio
                  </button>
                </div>

                <div
                  ref={sliderRef}
                  onMouseDown={() => setIsDraggingSlider(true)}
                  onMouseUp={() => setIsDraggingSlider(false)}
                  onMouseLeave={() => setIsDraggingSlider(false)}
                  onMouseMove={(e) => isDraggingSlider && handleSliderMove(e.clientX)}
                  onTouchMove={(e) => e.touches[0] && handleSliderMove(e.touches[0].clientX)}
                  className="relative w-full h-[450px] sm:h-[520px] rounded-3xl overflow-hidden bg-black border border-gray-200 select-none cursor-ew-resize shadow-xl"
                >
                  {/* After Image */}
                  <img src={generatedImage} alt="Rendered" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

                  {/* Before Image Slice */}
                  <div
                    className="absolute top-0 left-0 bottom-0 overflow-hidden pointer-events-none"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={sourceImage!}
                      alt="Original"
                      className="absolute top-0 left-0 h-full max-w-none object-cover"
                      style={{ width: sliderRef.current ? `${sliderRef.current.offsetWidth}px` : '100vw' }}
                    />
                    <span className="absolute top-4 left-4 bg-black/80 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Original
                    </span>
                  </div>

                  {/* Handle Divider */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20 pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg font-bold">
                      <ArrowLeftRight size={14} />
                    </div>
                  </div>

                  {/* Furnishing Pins */}
                  {pins.map((pin, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedPin(pin); setShowSwapDrawer(true); }}
                      style={{ top: `${pin.y_percent}%`, left: `${pin.x_percent}%` }}
                      className="absolute z-30 -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-125"
                    >
                      <div className="relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                        <div className="relative w-7 h-7 rounded-full bg-black text-[#CCFF00] border-2 border-[#CCFF00] flex items-center justify-center font-bold text-[10px] shadow-lg">
                          <Tag size={12} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">
                    💡 Click any pin on the image to view catalog shop links for {region}.
                  </span>
                  <a
                    href={generatedImage}
                    download="anvitam-decai-design.jpg"
                    className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded-2xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Download size={14} /> Export HD Design
                  </a>
                </div>
              </div>
            )}

          </main>

        </div>

        {/* ── RIGHT BRIEF CARD DRAWER / MODAL (Images 1, 2, 3) ── */}
        <AnimatePresence>
          {showBriefCard && (
            <div className="fixed inset-0 z-[999] flex justify-end bg-black/40 backdrop-blur-2xs">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-white min-h-full h-full border-l border-gray-200/80 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between text-gray-900"
              >
                <div>
                  
                  {/* Brief Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                    <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Design Brief Card</h2>
                    <button
                      onClick={() => setShowBriefCard(false)}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Photo Upload Box */}
                  <div className="mb-6 space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">1. Upload Space Photo</label>
                    <div className="relative border-2 border-dashed border-gray-300 hover:border-black rounded-2xl p-4 text-center transition bg-gray-50 group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {sourceImage ? (
                        <div className="relative h-32 w-full rounded-xl overflow-hidden">
                          <img src={sourceImage} alt="Source upload" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="py-4 space-y-1">
                          <Upload size={24} className="mx-auto text-gray-400 group-hover:text-black transition" />
                          <p className="text-xs font-bold text-gray-700">Upload Room or Facade Photo</p>
                          <p className="text-[10px] text-gray-400">PNG, JPG or WebP</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 1: Design mode (Image 1) */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-yellow-400 text-black font-extrabold text-[10px] flex items-center justify-center">1</span>
                      <h3 className="text-xs font-extrabold text-gray-900">Design mode</h3>
                    </div>

                    <div className="space-y-2">
                      {[
                        { id: 'Furnish Empty Room', title: 'Furnish Empty Room', sub: 'Transform. Enjoy greater freedom to redesign your space.' },
                        { id: 'Room Restyle', title: 'Room Restyle', sub: 'Follow the existing layout of your room closely.' }
                      ].map(mode => (
                        <div
                          key={mode.id}
                          onClick={() => setDesignMode(mode.id as any)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                            designMode === mode.id
                              ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${
                            designMode === mode.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300'
                          }`}>
                            {designMode === mode.id && <Check size={10} />}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">{mode.title}</h4>
                            <p className="text-[10px] text-gray-500 leading-snug">{mode.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Room Type (Images 1 & 3) */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-yellow-400 text-black font-extrabold text-[10px] flex items-center justify-center">2</span>
                      <h3 className="text-xs font-extrabold text-gray-900">Select the room type</h3>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: 'Living Room' },
                        { name: 'Bedroom' },
                        { name: 'Kitchen' },
                        { name: 'Bathroom' },
                        { name: 'Dining Room', badge: 'PLUS' },
                        { name: 'Entryway', badge: 'PLUS' },
                        { name: 'Office', badge: 'PLUS' },
                        { name: 'Home Office', badge: 'PLUS' },
                        { name: 'Study Room', badge: 'PRO' },
                        { name: 'Gaming Room', badge: 'PRO' },
                        { name: 'Building Facade', badge: 'PRO' },
                        { name: 'Garden / Yard', badge: 'PRO' }
                      ].map(r => (
                        <button
                          key={r.name}
                          onClick={() => setRoomType(r.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 border ${
                            roomType === r.name
                              ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span>{r.name}</span>
                          {r.badge && (
                            <span className={`text-[8px] font-extrabold px-1 rounded-md text-white uppercase ${
                              r.badge === 'PRO' ? 'bg-purple-600' : 'bg-indigo-600'
                            }`}>
                              {r.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={customRoomType}
                      onChange={(e) => setCustomRoomType(e.target.value)}
                      placeholder="(Optional) No matching room type - input manually."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-black"
                    />
                  </div>

                  {/* Step 3: Select a Style (Images 2 & 3) */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-yellow-400 text-black font-extrabold text-[10px] flex items-center justify-center">3</span>
                      <h3 className="text-xs font-extrabold text-gray-900">Select a style</h3>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {STYLE_OPTIONS.map(s => (
                        <div
                          key={s.id}
                          onClick={() => setStyle(s.id)}
                          className={`relative rounded-xl overflow-hidden border cursor-pointer group h-16 ${
                            style === s.id ? 'border-2 border-amber-500 ring-2 ring-amber-200' : 'border-gray-200'
                          }`}
                        >
                          <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                            <span className="text-[9px] font-bold text-white leading-none truncate">{s.name}</span>
                          </div>
                          {s.badge && (
                            <span className={`absolute top-1 right-1 text-[7px] font-extrabold px-1 rounded text-white ${
                              s.badge === 'PRO' ? 'bg-purple-600' : 'bg-indigo-600'
                            }`}>
                              {s.badge}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={customStyle}
                      onChange={(e) => setCustomStyle(e.target.value)}
                      placeholder="(Optional) Preferred style not found - input manually."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-black"
                    />
                  </div>

                  {/* Step 4: Select Color Palette (Image 2) */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-yellow-400 text-black font-extrabold text-[10px] flex items-center justify-center">4</span>
                      <h3 className="text-xs font-extrabold text-gray-900">Select a color palette <span className="text-[10px] text-gray-400 font-normal">(Optional)</span></h3>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { id: 'Surprise Me', name: 'Surprise Me', dots: ['bg-red-400', 'bg-yellow-400', 'bg-blue-400'] },
                        { id: 'High-Contrast Neutrals', name: 'High-Contrast Neutrals', dots: ['bg-black', 'bg-gray-400', 'bg-white'] },
                        { id: 'Warm Earth Tones', name: 'Warm Earth Tones', dots: ['bg-amber-800', 'bg-amber-600', 'bg-orange-300'] },
                        { id: 'Laid-Back Blues', name: 'Laid-Back Blues', dots: ['bg-blue-800', 'bg-blue-500', 'bg-blue-200'] },
                        { id: 'Forest-Inspired', name: 'Forest-Inspired', dots: ['bg-emerald-900', 'bg-emerald-600', 'bg-amber-700'] }
                      ].map(p => (
                        <div
                          key={p.id}
                          onClick={() => setColorPalette(p.id)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                            colorPalette === p.id ? 'border-gray-900 bg-gray-50 font-bold' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {p.dots.map((d, i) => (
                              <span key={i} className={`w-3 h-3 rounded-full ${d} border border-gray-300`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-800">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-4">
                      {errorMsg}
                    </div>
                  )}

                </div>

                {/* Bottom Action Button (DecAI Style) */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-[#111111] hover:bg-black text-white font-extrabold py-3.5 rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" /> Rendering AI Design...
                      </>
                    ) : (
                      <>
                        <Wand2 size={15} /> Customize for Me (1 Credit)
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
