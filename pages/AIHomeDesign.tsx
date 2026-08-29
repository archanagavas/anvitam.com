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
import { getToolUser, getOrCreateDefaultToolUser, logoutToolUser, deductUserCredit, updateToolUser, type ToolUser } from '../utils/userAuth';
import { ToolsAuthModal } from '../components/tools/ToolsAuthModal';
import { ToolsPaywallOverlay } from '../components/tools/ToolsPaywallOverlay';
import { AllToolsDrawer } from '../components/tools/AllToolsDrawer';
import { ToolsSettingsModal } from '../components/tools/ToolsSettingsModal';
import { INITIAL_CATALOG_PRODUCTS, CATALOG_CATEGORIES, type CatalogProduct } from '../constants/catalogData';
import Room3DViewer from '../components/tools/Room3DViewer';

// Preset visual styles for design brief drawer (55 Curated Anvitam Interior Styles)
const STYLE_OPTIONS = [
  // ── CLEAN & CONTEMPORARY ──
  { id: 'modern', name: '🏠 Pure Modern', desc: 'Clean lines, neutral tones, function over decoration', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop' },
  { id: 'minimalist', name: '⬜ Anvitam Minimalist', desc: 'Extreme simplicity, clutter-free, monochromatic calm', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=300&auto=format&fit=crop' },
  { id: 'scandinavian', name: '🌲 Nordic Hygge', desc: 'Functionality, natural light, muted Scandi palette', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=300&auto=format&fit=crop' },
  { id: 'contemporary', name: '✨ Studio Contemporary', desc: 'Current trends, subtle sophistication, clean lines', img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=300&auto=format&fit=crop' },
  { id: 'simple', name: '◻️ Honest Simple', desc: 'Pure functionality, zero excess, breathable open space', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop' },
  // ── JAPANESE & ZEN ──
  { id: 'japandi', name: '🎋 Japandi Harmony', desc: 'Japanese-Scandi fusion — wabi-sabi meets Nordic calm', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=300&auto=format&fit=crop' },
  { id: 'zen', name: '☮️ Tokyo Zen', desc: 'Tranquility, natural materials, traditional Japanese flow', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=300&auto=format&fit=crop' },
  { id: 'japanese', name: '⛩️ Kyoto Design', desc: 'Minimalism, shoji screens, low furniture, tatami spirit', img: 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?q=80&w=300&auto=format&fit=crop' },
  // ── LUXURY & FORMAL ──
  { id: 'luxury', name: '💎 Grand Luxury', desc: 'High-end materials, gold accents, opulent atmosphere', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=300&auto=format&fit=crop' },
  { id: 'neoclassic', name: '🏛️ Neoclassical Revival', desc: 'Grand columns, ornate mouldings, timeless elegance', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop' },
  { id: 'artdeco', name: '🔶 Art Deco Glamour', desc: 'Bold geometry, rich colors, 1920s sophistication', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=300&auto=format&fit=crop' },
  { id: 'baroque', name: '👑 Baroque Grandeur', desc: 'Opulent drama, gilded details, 17th-century magnificence', img: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=300&auto=format&fit=crop' },
  { id: 'hollywood', name: '🌟 Hollywood Regency', desc: 'Bold colors, shiny finishes, vintage Hollywood drama', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=300&auto=format&fit=crop' },
  // ── NATURAL & ORGANIC ──
  { id: 'biophilic', name: '🌿 Biophilic Living', desc: 'Nature-integrated, indoor greenery, natural light wells', img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=300&auto=format&fit=crop' },
  { id: 'rustic', name: '🪵 Raw Rustic', desc: 'Natural wood, stone, earthy textures, organic warmth', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=300&auto=format&fit=crop' },
  { id: 'eco', name: '♻️ Eco-Conscious', desc: 'Sustainable materials, energy-efficient, low-impact beauty', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=300&auto=format&fit=crop' },
  { id: 'bali', name: '🌴 Bali Resort', desc: 'Rattan, bamboo, tropical greenery, Balinese calm', img: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?q=80&w=300&auto=format&fit=crop' },
  { id: 'tropical', name: '🌺 Tropical Paradise', desc: 'Lush greenery, bright colors, natural materials', img: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=300&auto=format&fit=crop' },
  // ── COASTAL & RELAXED ──
  { id: 'coastal', name: '🌊 Coastal Breeze', desc: 'Shoreline palette, driftwood, sea glass, airy textures', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=300&auto=format&fit=crop' },
  { id: 'nautical', name: '⚓ Nautical Captain', desc: 'Navy blue, white, maritime accessories, rope textures', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=300&auto=format&fit=crop' },
  { id: 'surf', name: '🏄 Surf Shack', desc: 'Weathered wood, surfboard art, laid-back ocean culture', img: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=300&auto=format&fit=crop' },
  { id: 'ski', name: '❄️ Alpine Chalet', desc: 'Cozy mountain warmth, rustic wood, fireplace, plaid', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop' },
  // ── BOHEMIAN & ECLECTIC ──
  { id: 'boho', name: '🔮 Free Spirit Boho', desc: 'Layered textiles, global patterns, eclectic freedom', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=300&auto=format&fit=crop' },
  { id: 'modern_boho', name: '🌸 Modern Boho', desc: 'Relaxed eclectic decor with contemporary touches', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop' },
  { id: 'bohochic', name: '🦚 Boho-Chic Edit', desc: 'Fashionable bohemian — patterns mixed with refinement', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=300&auto=format&fit=crop' },
  { id: 'eclectic', name: '🎨 Eclectic Collector', desc: 'Curated mix of eras, textures, colors for unique personality', img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=300&auto=format&fit=crop' },
  { id: 'tribal', name: '🪶 Global Tribal', desc: 'Indigenous patterns, earthy warmth, cultural heritage art', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=300&auto=format&fit=crop' },
  { id: 'maximalist', name: '🎭 Bold Maximalist', desc: 'More is more — layered textures, vibrant colors, rich patterns', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=300&auto=format&fit=crop' },
  // ── INDUSTRIAL & URBAN ──
  { id: 'industrial', name: '🏭 Raw Industrial', desc: 'Exposed brick, concrete, steel, warehouse aesthetic', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=300&auto=format&fit=crop' },
  { id: 'loft', name: '🧱 Urban Loft', desc: 'Open-plan concrete, ductwork exposed, city edge energy', img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=300&auto=format&fit=crop' },
  // ── FUTURISTIC & TECH ──
  { id: 'cyberpunk', name: '🟣 Cyberpunk Forge', desc: 'Neon lights, high-tech dystopia, gritty futurism', img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=300&auto=format&fit=crop' },
  { id: 'futuristic', name: '🚀 Space Age', desc: 'Sleek innovation, advanced tech surfaces, forward-thinking', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop' },
  { id: 'vaporwave', name: '🌐 Vaporwave Retro', desc: 'Pastel neons, 80s-90s digital nostalgia, cyber motifs', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=300&auto=format&fit=crop' },
  { id: 'gaming', name: '🎮 Gaming Den', desc: 'Multiple screens, LED strips, ergonomic setup, gamer soul', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop' },
  { id: 'retro_future', name: '🤖 Retro-Futurist', desc: 'The future as imagined in the past — atomic age meets tomorrow', img: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=300&auto=format&fit=crop' },
  // ── VINTAGE & HISTORICAL ──
  { id: 'midcentury', name: '🕰️ Mid-Century Studio', desc: 'Sleek lines, organic shapes, 1950s-60s functional design', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=300&auto=format&fit=crop' },
  { id: 'vintage', name: '📻 Vintage Collector', desc: 'Curated pieces with history, nostalgic textures and patina', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop' },
  { id: 'retro', name: '🕹️ Retro Revival', desc: '50s-70s revival — nostalgia meets modern function', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop' },
  { id: 'art_nouveau', name: '🌸 Art Nouveau Flow', desc: 'Flowing organic lines, floral motifs, nature-inspired craft', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop' },
  { id: 'medieval', name: '⚔️ Medieval Keep', desc: 'Heavy wood, stone walls, wrought iron, fortress warmth', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=300&auto=format&fit=crop' },
  { id: 'gothic', name: '🦇 Gothic Revival', desc: 'Dark drama, rich jewel tones, ornate gothic elegance', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=300&auto=format&fit=crop' },
  // ── EUROPEAN REGIONAL ──
  { id: 'mediterranean', name: '🌞 Mediterranean Sun', desc: 'Terra cotta, arches, warm plaster, Aegean palette', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=300&auto=format&fit=crop' },
  { id: 'parisian', name: '🗼 Parisian Atelier', desc: 'Haussmann elegance, herringbone floors, refined French taste', img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=300&auto=format&fit=crop' },
  { id: 'french_country', name: '🥐 French Countryside', desc: 'Soft colors, floral motifs, natural materials, provincial charm', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop' },
  { id: 'traditional', name: '🕯️ Heritage Traditional', desc: 'Classic details, sumptuous furnishings, historical reverence', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=300&auto=format&fit=crop' },
  // ── RURAL & COUNTRY ──
  { id: 'farmhouse', name: '🐄 Modern Farmhouse', desc: 'Rustic warmth, shiplap, barn doors, country simplicity', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop' },
  { id: 'cottagecore', name: '🌷 Cottagecore Dream', desc: 'Rural nostalgia, floral patterns, handmade coziness', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=300&auto=format&fit=crop' },
  { id: 'shabby_chic', name: '🌹 Shabby Chic', desc: 'Vintage elegance, distressed finishes, romantic comfort', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=300&auto=format&fit=crop' },
  // ── FESTIVE & SEASONAL ──
  { id: 'christmas', name: '🎄 Festive Christmas', desc: 'Red, green, gold — holiday warmth and celebration', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop' },
  { id: 'halloween', name: '🎃 Dark Halloween', desc: 'Spooky gothic, orange and black, dramatic seasonal decor', img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=300&auto=format&fit=crop' },
  { id: 'cny', name: '🏮 Lunar New Year', desc: 'Red and gold, lanterns, prosperity symbols, festive energy', img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=300&auto=format&fit=crop' },
  { id: 'easter', name: '🐣 Spring Easter', desc: 'Pastel palette, floral accents, fresh seasonal lightness', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=300&auto=format&fit=crop' },
  // ── SPECIALTY ──
  { id: 'hot_pink', name: '💗 Hot Pink Statement', desc: 'Bold and vibrant — hot pink as the dominant hero color', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=300&auto=format&fit=crop' },
  { id: 'airbnb', name: '🏡 Airbnb-Ready', desc: 'Welcoming, versatile, comfortable for all guests', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop' },
  { id: 'post_apocalyptic', name: '💀 Post-Apocalyptic', desc: 'Weathered survival aesthetic, distressed industrial grit', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=300&auto=format&fit=crop' },
  { id: 'soviet', name: '⚒️ Soviet Brutalist', desc: 'Utilitarian concrete, monumental scale, austere dignity', img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=300&auto=format&fit=crop' },
  { id: 'sketch', name: '✏️ Architectural Sketch', desc: 'Unfinished hand-drawn quality, outlines, raw creative draft', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=300&auto=format&fit=crop' },
];

// Quick Sample Photos for 1-Click Testing
const SAMPLE_PHOTOS = [
  { id: 'living', label: '🛋️ Living Room', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop', module: 'interior' },
  { id: 'sketch', label: '✏️ SketchUp / Wireframe', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop', module: 'sketch2image' },
  { id: 'empty', label: '🏗️ Raw Construction Room', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop', module: 'virtual-staging' },
  { id: 'exterior', label: '🏡 House Exterior', url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=800&auto=format&fit=crop', module: 'exterior' },
  { id: 'garden', label: '🌿 Yard & Lawn', url: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=800&auto=format&fit=crop', module: 'garden' }
];

// Preset AI Studio modules for topbar navigation
const AI_MODULES = [
  { id: 'interior', label: 'Interior AI', icon: '🛋️' },
  { id: 'sketch2image', label: 'Sketch2Image™', icon: '✏️' },
  { id: 'virtual-staging', label: 'Virtual Staging AI', icon: '🏗️' },
  { id: 'exterior', label: 'Exterior Facade', icon: '🏡' },
  { id: 'garden', label: 'Yard & Landscape', icon: '🌿' },
  { id: 'replace', label: 'Object Swap', icon: '🪑' },
  { id: 'remove', label: 'Furniture Removal', icon: '🧹' }
];

export default function AIHomeDesign() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active module from URL (interior, exterior, garden, replace, remove, declutter, style-transfer, walls, flooring)
  const initialModule = searchParams.get('module') || 'interior';
  const [selectedModule, setSelectedModule] = useState<string>(initialModule);

  const handleModuleChange = (modId: string) => {
    setSelectedModule(modId);
    setSearchParams({ module: modId }, { replace: true });
  };

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
  const [catalog, setCatalog] = useState<CatalogProduct[]>(INITIAL_CATALOG_PRODUCTS);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [pins, setPins] = useState<any[]>([]);
  const [activePin, setActivePin] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // 3D Viewer State
  const [show3DViewer, setShow3DViewer] = useState(false);

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
    const currentUser = getToolUser() || getOrCreateDefaultToolUser();
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
          sourceImage: sourceImage,
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

      if (data.credits_remaining !== undefined) {
        updateToolUser({
          credits_remaining: data.credits_remaining,
          credits_used: (currentUser.credits_used || 0) + creditCost
        });
      } else {
        deductUserCredit(creditCost, selectedAiModel);
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
      <div className="w-full bg-white text-[#111111] min-h-screen font-sans flex flex-col pt-20">

        <div className="flex-1 flex flex-col overflow-visible">

          {/* Unified Topbar inside canvas with Hamburger, Module Selector, Settings & Logout */}
          <div className="sa-topbar bg-white text-gray-900 px-6 py-3 border-b border-gray-200/80 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4 z-20 sticky top-20">
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
              <button
                type="button"
                onClick={() => setShowToolsDrawer(true)}
                className="px-3 py-2 rounded-xl bg-black text-[#CCFF00] hover:bg-gray-800 transition cursor-pointer flex items-center gap-2 text-xs font-semibold shadow-2xs shrink-0"
                title="Open All 21+ Tools Drawer"
                aria-label="Open All 21+ Tools Drawer"
              >
                <Menu size={16} />
                <span>All Tools</span>
              </button>

              <div
                className="flex items-center gap-2 cursor-pointer shrink-0"
                onClick={() => navigate('/tools')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/tools');
                  }
                }}
                aria-label="Navigate to site tools directory"
              >
                <span className="w-7 h-7 rounded-lg bg-black text-[#CCFF00] font-semibold flex items-center justify-center text-xs shadow-2xs">AI</span>
                <div>
                  <h1 className="text-xs sm:text-sm font-semibold text-gray-900 leading-none">AI Space &amp; Home Studio</h1>
                  <p className="text-[10px] text-gray-500 font-medium">Anvitam Studio</p>
                </div>
              </div>
            </div>

            {/* Category / Module Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto py-1 lg:py-0 no-scrollbar justify-start sm:justify-center">
              {AI_MODULES.map(mod => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleModuleChange(mod.id)}
                  aria-label={`Select ${mod.label} module`}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                    selectedModule === mod.id ? 'bg-black text-[#CCFF00] font-semibold shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80'
                  }`}
                >
                  <span className="text-xs">{mod.icon}</span>
                  <span>{mod.label}</span>
                </button>
              ))}
            </div>

            {/* Controls: Credit Pill, Design Brief, Settings, Logout */}
            <div className="flex items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end">
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

          {/* ── MAIN WORKSPACE CANVAS ── */}
          <main className="flex-1 bg-[#FAFBFD] p-6 sm:p-10 overflow-y-auto max-w-6xl mx-auto w-full">

            {/* HERO GREETING SECTION */}
            {!generatedImage && (
              <div className="space-y-10 my-4">
                
                <div className="text-center space-y-5 max-w-2xl mx-auto">
                  <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
                    Hello, how may I help you?
                  </h1>

                  {/* Centered Interactive AI Prompt Box with Tool Router & Budget Selector */}
                  <form onSubmit={handlePromptSubmit} className="relative max-w-2xl mx-auto space-y-3">
                    <div className="bg-white border border-gray-300 hover:border-gray-900 rounded-3xl p-3 shadow-md flex flex-col sm:flex-row items-center gap-3 transition">
                      <div className="p-2.5 bg-[#111111] text-[#CCFF00] rounded-2xl shrink-0 hidden sm:flex">
                        <Wand2 size={18} />
                      </div>
                      <input
                        type="text"
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Ask Anvitam's AI anything (e.g. Modern Scandinavian living room with warm wood)..."
                        aria-label="Ask Anvitam's AI architectural design prompt"
                        className="w-full bg-transparent border-none text-xs text-gray-900 outline-none placeholder:text-gray-400 font-medium px-2"
                      />

                      {/* Room Budget Selector Pill inside Prompt Bar */}
                      <div className="flex items-center gap-1.5 shrink-0 bg-gray-100 p-1 rounded-full border border-gray-200">
                        <span className="text-[10px] font-bold text-gray-500 pl-2">Budget:</span>
                        <select
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="bg-white text-gray-900 font-semibold text-[11px] px-2.5 py-1 rounded-full outline-none cursor-pointer border border-gray-300 shadow-2xs"
                        >
                          <option value="Economy">₹25,000 (Economy)</option>
                          <option value="Mid-Range">₹75,000 (Mid-Range)</option>
                          <option value="Luxury">₹2,00,000+ (Luxury)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-10 h-10 rounded-full bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black transition flex items-center justify-center font-bold cursor-pointer border border-black/10 shadow-2xs shrink-0"
                        title="Generate Design"
                        aria-label="Submit AI Design prompt to generate image"
                      >
                        <ChevronRight size={18} />
                      </button>
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
                <div className="flex items-center justify-end gap-3 pt-2">
                  {/* 3D Walkthrough Button */}
                  <button
                    onClick={() => setShow3DViewer(true)}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold text-xs px-5 py-2.5 rounded-2xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    🏠 3D Walkthrough
                  </button>
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

            {/* Room 3D Viewer Overlay */}
            {show3DViewer && generatedImage && (
              <Room3DViewer
                imageUrl={generatedImage}
                onClose={() => setShow3DViewer(false)}
              />
            )}


            {/* SHOPPABLE AFFILIATE RECOMMENDATION ENGINE LAYER */}
            <div className="mt-12 pt-8 border-t border-gray-200/80 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-bold text-gray-900">Shoppable Design Catalog &amp; AI Product Recommendations</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Curated product matches for your {selectedStyle} {selectedModule} space. Buy directly from verified partner stores.
                  </p>
                </div>

                {/* Regional Market Selector */}
                <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-full border border-gray-200 text-xs font-semibold">
                  {(['India', 'USA', 'Brazil'] as const).map(reg => (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => setRegion(reg)}
                      className={`px-3 py-1 rounded-full transition cursor-pointer ${
                        region === reg ? 'bg-black text-[#CCFF00] shadow-xs' : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {reg === 'India' ? '🇮🇳 India' : reg === 'USA' ? '🇺🇸 USA' : '🇧🇷 Brazil'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-[#111111] text-[#CCFF00]'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-black'
                  }`}
                >
                  All Categories
                </button>
                {CATALOG_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-[#111111] text-[#CCFF00]'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-black'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Products Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {catalog
                  .filter(p => (p.region === region || p.region === 'Global') && (selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter))
                  .map(product => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-lg transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-3 left-3 bg-black/80 text-[#CCFF00] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                            {product.element_type.replace('_', ' ')}
                          </span>
                          <span className="absolute top-3 right-3 bg-white/90 text-gray-900 text-xs font-black px-2.5 py-1 rounded-full shadow-xs border border-gray-200">
                            {product.price}
                          </span>
                        </div>

                        <div className="p-4 space-y-2">
                          <h4 className="text-xs font-bold text-gray-900 leading-snug group-hover:text-black line-clamp-2">
                            {product.name}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {product.style_tags.map((tag, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <a
                          href={`/api/ai-design?action=go&id=${product.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-[#111111] hover:bg-black text-[#CCFF00] font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span>Buy Product</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

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
