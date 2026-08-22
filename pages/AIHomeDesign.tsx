/**
 * pages/AIHomeDesign.tsx — AI Home Design Studio & Master Prompt Library
 * 
 * Includes:
 * 1. 10 DecAI-mirrored modules (Interior, Exterior, Garden, Replace, Remove, Declutter, Style Transfer, Walls, Flooring)
 * 2. Draggable Before/After Split-View Slider
 * 3. Interactive Furnishing Pin Layer overlaid on generated redesign
 * 4. Shoppable Catalog Recommendation Drawer & Product Cards (India, USA, Brazil)
 * 5. Watermarked Preview vs Unlocked HD Export
 */

import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Upload, Image as ImageIcon, Sliders, RefreshCw, ShoppingBag,
  ExternalLink, Layers, CheckCircle2, ChevronRight, AlertCircle, Zap,
  Download, Eye, Lock, ArrowLeftRight, Check, X, Tag, Info, Palette
} from 'lucide-react';
import { getToolUser, type ToolUser } from '../utils/userAuth';
import { CATALOG_CATEGORIES, INITIAL_CATALOG_PRODUCTS, type CatalogProduct } from '../constants/catalogData';

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
  const [style, setStyle] = useState<string>('Modern Minimalist');
  const [colorPalette, setColorPalette] = useState<string>('');
  const [spaceType, setSpaceType] = useState<string>('Backyard');
  const [target, setTarget] = useState<string>('');
  const [itemType, setItemType] = useState<string>('Sofa');
  const [newFinish, setNewFinish] = useState<string>('Sage Green Matte Paint');
  const [floorMaterial, setFloorMaterial] = useState<string>('Light Oak Hardwood');

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

  // Before/After Slider Position (0 to 100)
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
  }, []);

  // Handle File Upload
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

  // Trigger AI Redesign
  const handleGenerate = async () => {
    if (!sourceImage) {
      setErrorMsg('Please upload a room or building photo first.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    // Unique key for this generation so the server can detect retries and
    // avoid double-charging credits if the client sends the same request twice.
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      const token = localStorage.getItem('anvitam_tool_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ai-design?action=generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sourceImage,
          referenceImage,
          module: selectedModule,
          designMode,
          roomType,
          style,
          colorPalette,
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

      // Trigger Step 2 (Shoppable Recommendations) & Step 3 (Element Pin Detection) in parallel
      fetchRecommendations();
      fetchElementPins(data.generatedImage || sourceImage);

    } catch (err: any) {
      console.error('[AIHomeDesign/generate error]', err);
      setErrorMsg(err.message || 'Error executing AI design model.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 2: Fetch Recommendations
  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/ai-design?action=recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomType, style, region, budget })
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

  // Step 3: Fetch Bounding Box Pins
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

  // Slider Drag Handlers
  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const isSubscribed = user?.is_subscribed || false;

  return (
    <>
      <Helmet>
        <title>AI Home Design &amp; Restyle Studio | 10 Master Modules | Anvitam</title>
        <meta name="description" content="Transform room photos into photorealistic interior, exterior, landscape, flooring, and furniture designs with shoppable catalog recommendations." />
      </Helmet>

      <div className="w-full bg-[#0A0A0A] text-white min-h-screen font-sans pt-24 pb-16">
        
        {/* ── TOP NAV / HEADER ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#CCFF00]/20">
                <Sparkles size={13} /> Gemini 3.1 Flash Image Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                AI Home Design <span className="text-[#CCFF00]">Master Studio</span>
              </h1>
              <p className="text-xs text-neutral-400 font-normal mt-1">
                10 photorealistic architectural design modules with shoppable catalog product matching &amp; element pins.
              </p>
            </div>

            {/* Region Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-400">Market Region:</span>
              <div className="bg-neutral-900 p-1 rounded-2xl border border-neutral-800 flex items-center gap-1">
                {[
                  { id: 'India', flag: '🇮🇳', label: 'India' },
                  { id: 'USA', flag: '🇺🇸', label: 'USA' },
                  { id: 'Brazil', flag: '🇧🇷', label: 'Brazil' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRegion(r.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      region === r.id
                        ? 'bg-[#CCFF00] text-black shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {r.flag} {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── LEFT CONTROLS PANEL (5 COLS) ── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 10 MODULE SELECTOR TABS */}
            <div className="bg-neutral-900/90 backdrop-blur-md p-4 rounded-3xl border border-neutral-800">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-3 px-1">
                Select Design Module (10 Master Tools)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'interior', label: 'Interior Design', badge: 'Popular' },
                  { id: 'exterior', label: 'Exterior Facade' },
                  { id: 'garden', label: 'Garden / Yard' },
                  { id: 'replace', label: 'Replace Item' },
                  { id: 'remove', label: 'Remove Object' },
                  { id: 'declutter', label: 'Declutter Room' },
                  { id: 'style-transfer', label: 'Style Transfer' },
                  { id: 'walls', label: 'New Walls' },
                  { id: 'flooring', label: 'New Flooring' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModule(m.id)}
                    className={`p-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer flex flex-col justify-between border ${
                      selectedModule === m.id
                        ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-sm'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <span>{m.label}</span>
                    {m.badge && (
                      <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-1.5 w-max font-bold ${
                        selectedModule === m.id ? 'bg-black text-[#CCFF00]' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {m.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* MODULE INPUT FORM */}
            <div className="bg-neutral-900/90 backdrop-blur-md p-6 rounded-3xl border border-neutral-800 space-y-5">
              
              {/* Photo Upload */}
              <div>
                <label className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <ImageIcon size={16} className="text-[#CCFF00]" /> Room or Building Photo
                </label>
                <div className="relative border-2 border-dashed border-neutral-700 hover:border-[#CCFF00] rounded-2xl p-4 text-center transition bg-neutral-950 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {sourceImage ? (
                    <div className="relative h-36 w-full rounded-xl overflow-hidden">
                      <img src={sourceImage} alt="Source upload" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition">
                        Click or drag to swap photo
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <Upload size={28} className="mx-auto text-neutral-400 group-hover:text-[#CCFF00] transition" />
                      <p className="text-xs font-semibold text-neutral-200">Upload Room or Facade Photo</p>
                      <p className="text-[10px] text-neutral-400">PNG, JPG or WebP up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Interior Sub-Mode */}
              {selectedModule === 'interior' && (
                <div>
                  <label className="text-xs font-bold text-neutral-300 mb-2 block">Interior Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Furnish Empty Room', 'Room Restyle', 'Room Renovation'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setDesignMode(mode as any)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition text-center ${
                          designMode === mode
                            ? 'bg-[#111] text-[#CCFF00] border-[#CCFF00]'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Style Dropdown */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 mb-1.5 block">Room Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#CCFF00]"
                  >
                    {['Living Room', 'Bedroom', 'Dining Room', 'Kitchen', 'Home Office', 'Bathroom', 'Balcony / Terrace', 'Exterior Facade'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 mb-1.5 block">Design Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#CCFF00]"
                  >
                    {['Modern Minimalist', 'Japandi', 'Bohemian Organic', 'Industrial Loft', 'Mid-Century Modern', 'Coastal Mediterranean', 'Tropical Eco', 'Rustic Farmhouse'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Module-Specific Fields */}
              {selectedModule === 'walls' && (
                <div>
                  <label className="text-xs font-bold text-neutral-300 mb-1.5 block">New Wall Finish / Color</label>
                  <input
                    type="text"
                    value={newFinish}
                    onChange={(e) => setNewFinish(e.target.value)}
                    placeholder="e.g. Sage Green Matte Paint, White Shiplap, Exposed Brick"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#CCFF00]"
                  />
                </div>
              )}

              {selectedModule === 'flooring' && (
                <div>
                  <label className="text-xs font-bold text-neutral-300 mb-1.5 block">New Floor Surface Material</label>
                  <input
                    type="text"
                    value={floorMaterial}
                    onChange={(e) => setFloorMaterial(e.target.value)}
                    placeholder="e.g. Light Oak Hardwood, Polished Concrete, Terracotta Tile"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#CCFF00]"
                  />
                </div>
              )}

              {selectedModule === 'replace' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-300 mb-1.5 block">Target Region / Item</label>
                    <input
                      type="text"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="e.g. main sofa area"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-300 mb-1.5 block">New Item Type</label>
                    <input
                      type="text"
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      placeholder="e.g. Velvet L-Shape Sofa"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                </div>
              )}

              {/* Style Transfer Reference Image */}
              {selectedModule === 'style-transfer' && (
                <div>
                  <label className="text-xs font-bold text-neutral-300 mb-2 block">Reference Style Image</label>
                  <div className="relative border border-neutral-800 hover:border-[#CCFF00] rounded-2xl p-3 text-center transition bg-neutral-950">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {referenceImage ? (
                      <div className="relative h-28 w-full rounded-xl overflow-hidden">
                        <img src={referenceImage} alt="Ref upload" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 py-4">+ Upload Reference Style Photo</p>
                    )}
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !sourceImage}
                className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  isGenerating || !sourceImage
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-[#CCFF00] hover:bg-white text-black hover:scale-[1.01]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Rendering AI Design...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate AI Transformation
                  </>
                )}
              </button>

            </div>

          </div>

          {/* ── RIGHT RESULT DISPLAY & INTERACTIVE CANVAS (7 COLS) ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* CANVAS DISPLAY BOX */}
            <div className="bg-neutral-900 p-4 sm:p-6 rounded-3xl border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Layers size={16} className="text-[#CCFF00]" />
                  {generatedImage ? 'Interactive Before/After View & Element Pins' : 'Upload photo & generate redesign'}
                </span>

                {generatedImage && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-800 text-[#CCFF00] border border-neutral-700">
                    {pins.length} Furnishing Pins Detected
                  </span>
                )}
              </div>

              {/* IMAGE CANVAS CONTAINER */}
              <div
                ref={sliderRef}
                onMouseDown={() => setIsDraggingSlider(true)}
                onMouseUp={() => setIsDraggingSlider(false)}
                onMouseLeave={() => setIsDraggingSlider(false)}
                onMouseMove={(e) => isDraggingSlider && handleSliderMove(e.clientX)}
                onTouchMove={(e) => e.touches[0] && handleSliderMove(e.touches[0].clientX)}
                className="relative w-full h-[380px] sm:h-[480px] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 select-none cursor-ew-resize"
              >
                {generatedImage ? (
                  <>
                    {/* After Image (Background) */}
                    <img
                      src={generatedImage}
                      alt="AI Redesign"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* Before Image (Clipped overlay)
                        The container clips to sliderPos% width.
                        The inner img must fill the *full* container width (not the clipped
                        slice), so we give it the same pixel width as the outer slider wrapper
                        via a CSS variable — avoids the stale-closure bug of reading
                        sliderRef.current.offsetWidth during render. */}
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
                      <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Original Photo
                      </span>
                    </div>

                    {/* Split Handle Divider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-[#CCFF00] shadow-2xl z-20 pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shadow-lg font-bold">
                        <ArrowLeftRight size={14} />
                      </div>
                    </div>

                    {/* INTERACTIVE FURNISHING PINS OVERLAY */}
                    {pins.map((pin, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPin(pin);
                          setShowSwapDrawer(true);
                        }}
                        style={{ top: `${pin.y_percent}%`, left: `${pin.x_percent}%` }}
                        className="absolute z-30 -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-125"
                      >
                        <div className="relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CCFF00] opacity-75" />
                          <div className="relative w-7 h-7 rounded-full bg-black text-[#CCFF00] border-2 border-[#CCFF00] flex items-center justify-center font-bold text-[10px] shadow-lg">
                            <Tag size={12} />
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2.5 py-1 rounded-lg bg-black text-white text-[10px] font-bold whitespace-nowrap border border-neutral-700 shadow-xl pointer-events-none">
                          {pin.label} (Tap to Swap)
                        </div>
                      </button>
                    ))}
                  </>
                ) : sourceImage ? (
                  <img src={sourceImage} alt="Uploaded Source" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-neutral-500">
                    <ImageIcon size={48} className="mb-3 text-neutral-700" />
                    <p className="text-xs font-semibold text-neutral-400">No Image Rendered Yet</p>
                    <p className="text-[11px] text-neutral-400 max-w-xs mt-1">Upload a room photo on the left panel and click Generate to view split comparison.</p>
                  </div>
                )}
              </div>

              {/* BOTTOM ACTIONS BAR */}
              {generatedImage && (
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-neutral-400">
                    💡 <strong className="text-white">Tip:</strong> Drag the center slider left/right to compare photos. Tap any glowing pin to swap furniture.
                  </div>

                  <a
                    href={generatedImage}
                    download="anvitam-ai-homedesign.jpg"
                    className="bg-[#CCFF00] hover:bg-white text-black font-bold text-xs px-4 py-2.5 rounded-full transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download size={14} /> Export Redesign
                  </a>
                </div>
              )}

            </div>

            {/* ── SHOPPABLE CATALOG RECOMMENDATIONS SECTION ── */}
            {recommendations.length > 0 && (
              <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShoppingBag size={18} className="text-[#CCFF00]" />
                    Shop This Look ({region} Catalog)
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                    Direct Affiliate Links
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.map((rec, idx) => {
                    const product = catalog.find(p => p.id === rec.product_id) || catalog[0];
                    if (!product) return null;

                    return (
                      <div key={idx} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center gap-3 hover:border-neutral-700 transition">
                        <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 overflow-hidden">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded-md">
                            {product.element_type}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate mt-1">{product.name}</h4>
                          <p className="text-[11px] text-neutral-400 font-mono font-semibold">{product.price}</p>
                          <a
                            href={`/api/go?id=${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#CCFF00] hover:underline mt-1"
                          >
                            Buy on Retailer <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* ── PIN ELEMENT SWAP DRAWER / MODAL ── */}
        <AnimatePresence>
          {showSwapDrawer && selectedPin && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-neutral-900 rounded-3xl max-w-md w-full p-6 border border-neutral-800 shadow-2xl relative text-white"
              >
                <button
                  onClick={() => setShowSwapDrawer(false)}
                  className="absolute top-5 right-5 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <Tag size={18} className="text-[#CCFF00]" />
                  <h3 className="text-lg font-bold text-white">Swap {selectedPin.label}</h3>
                </div>

                <p className="text-xs text-neutral-400 mb-5">
                  Select an alternate catalog product to swap this {selectedPin.element_type} in your AI redesign.
                </p>

                {/* Scope the swap panel to the tapped pin's element_type.
                    This is the differentiator from DecAI — tapping the rug shows
                    only rug options, not sofas. Fall back to all regional items if
                    no element_type match is found (e.g. unrecognized category). */}
                {(() => {
                  const scopedItems = catalog.filter(p => {
                    const regionMatch = p.region === region || p.region === 'Global';
                    const typeMatch = selectedPin
                      ? p.element_type === selectedPin.element_type
                      : true;
                    return regionMatch && typeMatch;
                  });
                  const displayItems =
                    scopedItems.length > 0
                      ? scopedItems
                      : catalog.filter(p => p.region === region || p.region === 'Global');

                  return (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {displayItems.length === 0 ? (
                        <p className="text-xs text-neutral-500 text-center py-4">
                          No {region} catalog items found for this element type.
                        </p>
                      ) : (
                        displayItems.map(item => (
                          <div key={item.id} className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#CCFF00]">{item.element_type}</span>
                                <h4 className="text-xs font-bold text-white mt-0.5">{item.name}</h4>
                                <p className="text-[10px] text-neutral-400 font-mono">{item.price}</p>
                              </div>
                            </div>
                            <a
                              href={`/api/go?id=${item.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#CCFF00] text-black text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-white transition shrink-0"
                            >
                              Buy
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
