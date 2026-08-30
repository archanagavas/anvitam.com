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
  Settings, LogOut, PanelLeft, Folder, Code, Clock
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

const AI_MODEL_ENGINES = [
  { id: 'anvitam-ultra', name: '⚡ Anvitam Ultra HD (NVIDIA GPU)', creditCost: 1 },
  { id: 'anvitam-v2-fast', name: '🏎️ Anvitam Fast Turbo', creditCost: 1 },
  { id: 'ollama-sdxl', name: '🦙 God Ollama Local SDXL', creditCost: 1 },
  { id: 'flux-dev', name: '✨ FLUX.1 Professional', creditCost: 2 },
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

const DEFAULT_HOTSPOT_PINS = [
  { id: 'pin_sofa', label: 'Designer Seating', element_type: 'sofa', x_percent: 42, y_percent: 64 },
  { id: 'pin_rug', label: 'Accent Area Rug', element_type: 'rug', x_percent: 58, y_percent: 80 },
  { id: 'pin_light', label: 'Pendant Lighting', element_type: 'pendant_light', x_percent: 50, y_percent: 25 },
  { id: 'pin_decor', label: 'Wall Decor', element_type: 'wall_art', x_percent: 25, y_percent: 38 },
];


interface SavedChatSession {
  id: string;
  title: string;
  timestamp: string;
  module: string;
  style: string;
  roomType: string;
  sourceImage: string | null;
  generatedImage: string | null;
  promptText: string;
  recommendations: any[];
}

export default function AIHomeDesign() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active module from URL
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // UI Drawer & Sidebar States
  const [showBriefCard, setShowBriefCard] = useState(false);

  // Saved Chat Sessions History (Claude "Chats and tasks" sidebar)
  const [savedChats, setSavedChats] = useState<SavedChatSession[]>(() => {
    try {
      const raw = localStorage.getItem('anvitam_design_chats');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'chat-demo-1',
        title: 'Architecture review of retail space',
        timestamp: '2 hours ago',
        module: 'interior',
        style: 'modern',
        roomType: 'Living Room',
        sourceImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
        generatedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
        promptText: 'Modern Scandinavian retail lounge with warm oak wood and ambient lighting',
        recommendations: []
      },
      {
        id: 'chat-demo-2',
        title: 'Scandinavian Living Room Restyle',
        timestamp: 'Yesterday',
        module: 'interior',
        style: 'japandi',
        roomType: 'Living Room',
        sourceImage: null,
        generatedImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
        promptText: 'Japandi minimal living room',
        recommendations: []
      },
      {
        id: 'chat-demo-3',
        title: 'Site Intelligence 3D Shadow Analysis',
        timestamp: '3 days ago',
        module: 'site-intelligence',
        style: 'minimalist',
        roomType: 'Exterior Facade',
        sourceImage: null,
        generatedImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
        promptText: '3D Sun & shadow simulation report',
        recommendations: []
      }
    ];
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const handleStartNewChat = () => {
    setActiveChatId(null);
    setCurrentWorkflowStep(1);
    setSourceImage(null);
    setGeneratedImage(null);
    setPromptText('');
    setRecommendations([]);
  };

  const handleLoadSavedChat = (session: SavedChatSession) => {
    setActiveChatId(session.id);
    setSelectedModule(session.module || 'interior');
    setSelectedStyle(session.style || 'modern');
    setRoomType(session.roomType || 'Living Room');
    setSourceImage(session.sourceImage);
    setGeneratedImage(session.generatedImage);
    setPromptText(session.promptText);
    setRecommendations(session.recommendations || []);
    setCurrentWorkflowStep(session.generatedImage ? 5 : 1);
  };

  // Form State
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<number>(1);
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
    setCurrentWorkflowStep(2); // Advance to Step 2: Style Selection
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
      setCurrentWorkflowStep(4); // Advance to Step 4: AI Model Selection
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSamplePhoto = (sampleUrl: string, sampleMod: string) => {
    setSelectedModule(sampleMod);
    setSearchParams({ module: sampleMod });
    setSourceImage(sampleUrl);
    setCurrentWorkflowStep(4); // Advance to Step 4: AI Model Selection
  };

  const handlePromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!getToolUser()) {
      setShowAuthModal(true);
      return;
    }
    if (currentWorkflowStep < 4) {
      setCurrentWorkflowStep(currentWorkflowStep + 1);
    } else {
      handleGenerate();
    }
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
      setCurrentWorkflowStep(5);
      setShowBriefCard(false);

      // Save generated chat session into persistent history
      const newSession: SavedChatSession = {
        id: `chat_${Date.now()}`,
        title: promptText ? promptText.slice(0, 36) + '...' : `${roomType} ${selectedStyle} Restyle`,
        timestamp: 'Just now',
        module: selectedModule,
        style: selectedStyle,
        roomType,
        sourceImage,
        generatedImage: data.generatedImage,
        promptText: promptText || `${selectedStyle} style redesign for ${roomType}`,
        recommendations: data.recommendations || []
      };
      setSavedChats(prev => {
        const updated = [newSession, ...prev.filter(c => c.id !== newSession.id)];
        try {
          localStorage.setItem('anvitam_design_chats', JSON.stringify(updated.slice(0, 30)));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
      setActiveChatId(newSession.id);

      // Auto-fetch shoppable products and detect visual pins matching the rendered design
      fetchRecommendations(roomType, selectedStyle);
      if (data.generatedImage) {
        fetchElementPins(data.generatedImage);
      }

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

  useEffect(() => {
    fetchRecommendations(roomType, selectedStyle);
  }, []);

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
        <title>Anvitam's AI Studio | Claude Conversational AI Home Design</title>
        <meta name="description" content="Photorealistic AI Studio for interior design, exterior facade, garden landscape, room restyle, and furniture replacement." />
      </Helmet>

      {/* Main Studio Wrapper with Claude Sidebar & Workspace */}
      <div className="w-full bg-[#FAF9F6] text-[#111111] min-h-screen font-sans flex flex-row pt-20 overflow-hidden">

        {/* ── CLAUDE LEFT SIDEBAR ("Chats and tasks") ── */}
        <aside className={`w-64 bg-[#F9F8F6] border-r border-gray-200/80 flex flex-col shrink-0 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-ml-64'} hidden md:flex`}>
          
          {/* Top: + New Chat Button */}
          <div className="p-4 border-b border-gray-200/50 space-y-3">
            <button
              type="button"
              onClick={handleStartNewChat}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-100/80 text-gray-900 border border-gray-300/80 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base text-gray-600 font-bold">+</span>
                <span>New design chat</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">⌘K</span>
            </button>

            {/* Navigation Quick Links */}
            <div className="space-y-0.5 text-xs text-gray-600 font-medium">
              <button type="button" onClick={() => navigate('/tools')} className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-gray-200/60 flex items-center gap-2.5 transition">
                <Folder size={15} className="text-gray-500" />
                <span>Projects</span>
              </button>
              <button type="button" onClick={() => setShowBriefCard(true)} className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-gray-200/60 flex items-center gap-2.5 transition">
                <Sliders size={15} className="text-gray-500" />
                <span>Artifacts &amp; Brief</span>
              </button>
              <button type="button" onClick={() => setShowToolsDrawer(true)} className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-gray-200/60 flex items-center gap-2.5 transition">
                <Code size={15} className="text-gray-500" />
                <span>21+ AI Tools</span>
              </button>
              <button type="button" onClick={() => setShowSettingsModal(true)} className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-gray-200/60 flex items-center gap-2.5 transition">
                <Settings size={15} className="text-gray-500" />
                <span>Customize Studio</span>
              </button>
            </div>
          </div>

          {/* Middle: Chats and tasks List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
            <div className="px-3 py-2 flex items-center justify-between text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <span>Chats and tasks</span>
              <Clock size={13} />
            </div>

            {savedChats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => handleLoadSavedChat(chat)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer truncate ${
                  activeChatId === chat.id
                    ? 'bg-gray-200/80 font-semibold text-gray-900'
                    : 'text-gray-600 hover:bg-gray-200/40 hover:text-gray-900'
                }`}
                title={chat.title}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                <span className="truncate flex-1">{chat.title}</span>
              </button>
            ))}
          </div>

          {/* Bottom: Profile Avatar Footer */}
          <div className="p-3 border-t border-gray-200/70 bg-[#FAF9F6] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-800 text-white font-semibold text-xs flex items-center justify-center">
                {user?.full_name ? user.full_name[0] : 'A'}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-gray-900">{user?.full_name || 'Archana Gavas'}</p>
                <p className="text-[10px] text-gray-500">Free plan • {user?.credits_remaining || 50} credits</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPaywall(true)}
              className="text-[11px] font-semibold text-amber-800 hover:underline"
            >
              Upgrade
            </button>
          </div>
        </aside>

        {/* ── MAIN CLAUDE CHAT CANVAS WORKSPACE ── */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto relative min-h-[calc(100vh-80px)] p-4 sm:p-8">

          {/* Top Canvas Bar with Sidebar Toggle, Module Pills & Controls */}
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition hidden md:block"
                title="Toggle Sidebar"
              >
                <PanelLeft size={16} />
              </button>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 leading-none">Anvitam Design Chat</h1>
                <p className="text-[10px] text-gray-500 font-medium">Powered by Claude &amp; FLUX.1 Pro</p>
              </div>
            </div>

            {/* Controls: Credit Pill, Brief & Settings */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBriefCard(true)}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-amber-200/60"
              >
                <Sliders size={13} />
                <span>Brief</span>
              </button>
              {user && (
                <button
                  type="button"
                  onClick={() => setShowPaywall(true)}
                  className="px-3 py-1.5 rounded-xl bg-gray-900 text-[#CCFF00] text-xs font-semibold flex items-center gap-1"
                >
                  <Zap size={13} className="fill-[#CCFF00]" />
                  <span>{user.credits_remaining} Cred</span>
                </button>
              )}
            </div>
          </div>

          {/* Conversational Assistant Welcome Bubble */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-5 my-4 max-w-3xl mx-auto space-y-2 flex items-start gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-2xl bg-amber-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              🤖
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900">Anvitam AI Assistant</span>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                  Active Assistant
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                Hello! What are you looking to design or transform today? You can select any AI tool from the gallery on the right side panel, or choose your workflow step below:
              </p>
            </div>
          </div>

          {/* Stepper Navigation Header Bar */}
          <div className="bg-gray-50 border border-gray-200/90 rounded-2xl p-2 my-4 shadow-2xs flex items-center justify-between gap-1 overflow-x-auto no-scrollbar max-w-3xl mx-auto w-full">
            {[
              { step: 1, label: '1. Tool', icon: '🛠️' },
              { step: 2, label: '2. Style', icon: '🎨' },
              { step: 3, label: '3. Image & Brief', icon: '📷' },
              { step: 4, label: '4. AI Model', icon: '🤖' },
              { step: 5, label: '5. Render Output', icon: '✨' },
            ].map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step === 5 && !generatedImage) return;
                  setCurrentWorkflowStep(s.step);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  currentWorkflowStep === s.step
                    ? 'bg-black text-[#CCFF00] shadow-2xs font-semibold'
                    : currentWorkflowStep > s.step
                    ? 'bg-gray-200/80 text-gray-800'
                    : 'bg-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* ── CONVERSATIONAL STEP CANVASES IN MAIN WORKSPACE ── */}
          <div className="flex-1 max-w-3xl w-full mx-auto space-y-8 pb-36">

              {/* ── STEP 1: MODULE & WORKFLOW TOOL SELECTION ── */}
              {currentWorkflowStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-5 bg-[#CCFF00] rounded-full inline-block border border-black/20" />
                      Explore AI tools for your design workflow
                    </h2>
                    <span className="text-xs text-gray-500 font-medium">Step 1 of 4</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        id: 'interior',
                        title: 'Interior Design',
                        desc: 'Transform any room instantly',
                        imageBefore: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'exterior',
                        title: 'Exterior Design',
                        desc: 'Redesign your home exterior',
                        imageBefore: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'garden',
                        title: 'Garden Design',
                        desc: 'Redesign gardens & outdoors',
                        imageBefore: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'sketch2image',
                        title: 'Sketch2Image™',
                        desc: 'Sketch/blueprint → 3D photoreal',
                        imageBefore: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'virtual-staging',
                        title: 'Virtual Staging AI',
                        desc: 'Furnish empty room spaces',
                        imageBefore: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'replace',
                        title: 'Replace & Add Furniture',
                        desc: 'Swap furniture with AI',
                        imageBefore: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'remove',
                        title: 'Furniture Removal',
                        desc: 'Remove objects in 1-click',
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

                  {/* Flagship Site Intelligence & 3D Shadow Canvas Section */}
                  <div className="bg-gradient-to-br from-[#111111] via-gray-900 to-black rounded-3xl p-6 text-white border border-gray-800 shadow-xl space-y-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className="px-3 py-1 rounded-full bg-[#CCFF00] text-black text-[10px] font-extrabold uppercase tracking-wider inline-block mb-2">
                          FLAGSHIP SITE CANVAS
                        </span>
                        <h3 className="text-xl font-bold text-white tracking-tight">Site Intelligence &amp; 3D Shadow Canvas</h3>
                        <p className="text-xs text-gray-300 max-w-xl mt-1">
                          Drop a pin anywhere on Earth to simulate 3D building shadows, wind vectors, soil health, and get 11+ site reports.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/site-intelligence')}
                        className="px-5 py-2.5 rounded-xl bg-[#CCFF00] text-black font-bold text-xs hover:bg-white transition flex items-center gap-2 cursor-pointer shadow-md shrink-0"
                      >
                        <span>Launch 3D Site Canvas</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                      {[
                        { icon: '☀️', title: '3D Sun & Shadow', desc: 'Solar path & glare' },
                        { icon: '🏢', title: 'Heights & Density', desc: 'FSI & setbacks' },
                        { icon: '💨', title: 'Wind & Breeze', desc: 'Microclimate vectors' },
                        { icon: '🏔️', title: 'Slope Contours', desc: 'Elevation & grading' },
                        { icon: '🧱', title: 'Soil & Foundation', desc: 'Geotech integrity' },
                        { icon: '🌧️', title: 'Rainwater & Solar', desc: 'PV yield & harvesting' },
                        { icon: '♻️', title: 'Green Costing', desc: 'LCA & carbon index' }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center space-y-1.5 hover:bg-white/10 transition">
                          <span className="text-xl block">{item.icon}</span>
                          <h4 className="text-[11px] font-bold text-white leading-tight">{item.title}</h4>
                          <p className="text-[9px] text-gray-400 leading-tight">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ── STEP 2: AESTHETIC STYLE SELECTION ── */}
              {currentWorkflowStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-5 bg-[#CCFF00] rounded-full inline-block border border-black/20" />
                        Select Architectural &amp; Design Aesthetic
                      </h2>
                      <p className="text-xs text-gray-500">Pick from 55+ curated styles to direct your AI visual generation.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentWorkflowStep(3)}
                      className="px-4 py-2 rounded-xl bg-[#111111] text-[#CCFF00] font-semibold text-xs hover:bg-black transition cursor-pointer"
                    >
                      Next: Upload Image →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-[480px] overflow-y-auto pr-1">
                    {STYLE_OPTIONS.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => {
                          setSelectedStyle(st.id);
                          setCurrentWorkflowStep(3);
                        }}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col items-center text-center gap-2 hover:shadow-md ${
                          selectedStyle === st.id
                            ? 'border-black bg-white ring-2 ring-black font-semibold'
                            : 'border-gray-200/80 bg-white hover:border-gray-400'
                        }`}
                      >
                        <img src={st.img} alt={st.name} className="w-14 h-14 rounded-xl object-cover shadow-2xs" />
                        <div>
                          <h4 className="text-xs font-semibold text-gray-900 truncate">{st.name}</h4>
                          <span className="text-[10px] text-gray-500 font-medium">Select style</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 3: IMAGE UPLOAD & ROOM BRIEF ── */}
              {currentWorkflowStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                        Upload Room Photo &amp; Set Brief
                      </h2>
                      <p className="text-xs text-gray-500">Add your space photo and specify room type, budget &amp; region.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentWorkflowStep(4)}
                      className="px-4 py-2 rounded-xl bg-[#111111] text-[#CCFF00] font-semibold text-xs hover:bg-black transition cursor-pointer"
                    >
                      Next: Select AI Engine →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Photo Uploader & Sample Selector */}
                    <div className="space-y-4">
                      <label className="text-xs font-semibold text-gray-900 block">Room / Site Photo</label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                        }}
                        className="hidden"
                      />

                      {sourceImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-gray-300 h-48 group">
                          <img src={sourceImage} alt="Uploaded Room" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setSourceImage(null)}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/80 text-white hover:bg-red-600 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 hover:border-black bg-gray-50 p-6 rounded-2xl text-center cursor-pointer transition space-y-2"
                        >
                          <Upload size={24} className="mx-auto text-gray-400" />
                          <p className="text-xs font-semibold text-gray-800">Click to upload your room photo</p>
                          <p className="text-[10px] text-gray-400">JPG, PNG, WEBP up to 10MB</p>
                        </div>
                      )}

                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase">Or select sample photo:</span>
                        <div className="grid grid-cols-2 gap-2">
                          {SAMPLE_PHOTOS.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleSelectSamplePhoto(s.url, s.module)}
                              className="p-2 rounded-xl border border-gray-200 hover:border-black bg-gray-50 flex items-center gap-2 cursor-pointer transition text-left"
                            >
                              <img src={s.url} alt={s.label} className="w-8 h-8 rounded-lg object-cover" />
                              <span className="text-[11px] font-semibold text-gray-800 truncate">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Brief Details: Room Type, Region & Budget */}
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-900 block">Room or Area Type</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Living Room', 'Bedroom', 'Kitchen', 'Exterior Facade', 'Backyard Garden', 'Bathroom', 'Office Lounge'].map(r => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRoomType(r)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-900 block">Target Region</label>
                          <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value as any)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold text-gray-900 outline-none"
                          >
                            <option value="India">🇮🇳 India (INR ₹)</option>
                            <option value="USA">🇺🇸 USA (USD $)</option>
                            <option value="Brazil">🇧🇷 Brazil (BRL R$)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-900 block">Budget Level</label>
                          <select
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold text-gray-900 outline-none"
                          >
                            <option value="Economy">Economy</option>
                            <option value="Mid-Range">Mid-Range</option>
                            <option value="Luxury">Luxury Bespoke</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 4: AI MODEL ENGINE SELECTION ── */}
              {currentWorkflowStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs text-center space-y-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                      Select AI Model Engine &amp; Render
                    </h2>
                    <p className="text-xs text-gray-500">Pick your preferred neural render model to process your spatial brief.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[
                      { id: 'fast', label: '⚡ Anvitam Fast', cred: '1 Credit', desc: 'Standard Gemini/OpenRouter speed engine' },
                      { id: 'flux', label: '🚀 FLUX.1 Pro', cred: '2 Credits', desc: 'Photorealistic architectural elevation model' },
                      { id: 'claude', label: '🏛️ Claude Spec', cred: '2 Credits', desc: 'Spatial detail & texture analysis engine' },
                      { id: 'gpt4o', label: '💎 GPT-4o 4K', cred: '3 Credits', desc: 'Ultra-HD luxury render pipeline' }
                    ].map(m => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedAiModel(m.id as any)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition space-y-2 hover:shadow-md ${
                          selectedAiModel === m.id
                            ? 'border-black bg-gray-50 ring-2 ring-black font-semibold'
                            : 'border-gray-200 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-gray-900">{m.label}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-[#111111] text-[#CCFF00] text-[10px] font-extrabold">{m.cred}</span>
                        </div>
                        <p className="text-[11px] text-gray-500">{m.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black font-extrabold py-4 rounded-2xl text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer border border-black/10"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" /> Generating Photorealistic AI Render...
                        </>
                      ) : (
                        <>
                          <Wand2 size={16} /> Render AI Design ({getModelCreditCost(selectedAiModel)} Credits)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

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

                  {/* Interactive Visual Hotspot Pins Overlay */}
                  {(pins.length > 0 ? pins : DEFAULT_HOTSPOT_PINS).map((pin: any, idx: number) => {
                    const matchingProduct = catalog.find(p => p.element_type === pin.element_type) || catalog[idx % catalog.length];
                    const pinId = pin.id || `pin_${idx}`;
                    const isSelected = activePin?.id === pinId;

                    return (
                      <div
                        key={pinId}
                        className="absolute z-20 transition-all duration-300 pointer-events-auto"
                        style={{ left: `${pin.x_percent}%`, top: `${pin.y_percent}%` }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePin(isSelected ? null : { ...pin, id: pinId, product: matchingProduct });
                          }}
                          className="relative group cursor-pointer focus:outline-none"
                          title={`Click to view ${pin.label}`}
                        >
                          <span className="absolute -inset-2 rounded-full bg-[#CCFF00]/40 animate-ping" />
                          <div className="relative w-8 h-8 rounded-full bg-black/90 text-[#CCFF00] border-2 border-[#CCFF00] flex items-center justify-center shadow-lg hover:scale-110 transition">
                            <ShoppingBag size={14} />
                          </div>
                        </button>

                        {isSelected && matchingProduct && (
                          <div className="absolute left-10 -top-12 z-30 w-64 bg-black/95 text-white backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-[#CCFF00]/40 animate-in fade-in slide-in-from-left-2">
                            <div className="flex gap-3">
                              <img src={matchingProduct.image_url} alt={matchingProduct.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10" />
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] uppercase font-bold text-[#CCFF00] tracking-wider block">{pin.label || matchingProduct.element_type}</span>
                                <h5 className="text-xs font-bold text-white truncate leading-tight">{matchingProduct.name}</h5>
                                <p className="text-xs font-extrabold text-amber-400 mt-0.5">{matchingProduct.price}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <a
                                href={`/api/ai-design?action=go&id=${matchingProduct.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-[#CCFF00] hover:bg-white text-black font-bold text-[11px] py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1 shadow-xs"
                              >
                                <span>Buy Item</span>
                                <ExternalLink size={11} />
                              </a>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePin(null);
                                  setSelectedCategoryFilter(matchingProduct.category_id || 'all');
                                  const el = document.getElementById(`product-${matchingProduct.id}`);
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer"
                              >
                                View Grid ↓
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

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
                  .filter(p => selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter)
                  .map(product => (
                    <div
                      key={product.id}
                      id={`product-${product.id}`}
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

          {/* ── CLAUDE FLOATING PROMPT BAR AT BOTTOM ── */}
          <div className="sticky bottom-4 z-30 max-w-2xl w-full mx-auto px-4 mt-2">
            <form onSubmit={handlePromptSubmit} className="bg-white border border-gray-300 hover:border-gray-400 rounded-3xl p-3 shadow-xl space-y-2.5 transition-all">
              
              {/* Text Prompt Input */}
              <div className="flex items-center gap-2 px-2">
                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="How can I help you today? (Type architectural vision or instructions...)"
                  className="w-full text-xs font-sans placeholder-gray-400 bg-transparent border-none outline-none py-1 text-gray-900 font-medium"
                />
              </div>

              {/* Control Buttons & Selectors Row */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                
                {/* Left Controls: + Upload, Chat/Cowork pills, Region */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition cursor-pointer text-sm font-bold shadow-2xs"
                    title="Upload or Change Room Photo"
                  >
                    +
                  </button>

                  <div className="flex items-center gap-1 bg-gray-100/90 p-0.5 rounded-full text-[11px] font-semibold text-gray-600">
                    <button
                      type="button"
                      onClick={() => setDesignMode('restyle')}
                      className={`px-2.5 py-0.5 rounded-full transition cursor-pointer ${designMode === 'restyle' ? 'bg-white text-gray-900 shadow-2xs' : 'hover:text-gray-900'}`}
                    >
                      Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignMode('empty')}
                      className={`px-2.5 py-0.5 rounded-full transition cursor-pointer ${designMode === 'empty' ? 'bg-white text-gray-900 shadow-2xs' : 'hover:text-gray-900'}`}
                    >
                      Cowork
                    </button>
                  </div>

                  {/* Region selector badge */}
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as any)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full px-2 py-0.5 border border-amber-200/80 outline-none cursor-pointer hidden sm:block"
                  >
                    <option value="India">🇮🇳 India</option>
                    <option value="USA">🇺🇸 USA</option>
                    <option value="Brazil">🇧🇷 Brazil</option>
                  </select>
                </div>

                {/* Right Controls: Model Picker & Action Button */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedAiModel}
                    onChange={(e) => setSelectedAiModel(e.target.value)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-semibold rounded-full px-2.5 py-1 border-none outline-none cursor-pointer"
                  >
                    {AI_MODEL_ENGINES.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.creditCost} Cred)
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 text-[#CCFF00] flex items-center justify-center transition cursor-pointer shadow-2xs disabled:opacity-50"
                    title={currentWorkflowStep === 4 ? 'Render AI Design' : 'Next Step'}
                  >
                    {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <ChevronRight size={16} />}
                  </button>
                </div>

              </div>
            </form>
          </div>

        </main>

        {/* ── RIGHT SIDEBAR: ALL AI TOOLS & FEATURE GALLERY ── */}
        <aside className="w-80 border-l border-gray-200/80 bg-[#F9F8F6] shrink-0 hidden xl:flex flex-col p-4 overflow-y-auto space-y-6 no-scrollbar">
          
          {/* Section Header */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
            <div>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">AI Tools Studio</h2>
              <p className="text-[10px] text-gray-500">Pick any tool to launch in chat</p>
            </div>
            <span className="bg-[#111111] text-[#CCFF00] text-[10px] font-bold px-2 py-0.5 rounded-full">
              7 Active
            </span>
          </div>

          {/* 🌟 Flagship Site Canvas Feature Card */}
          <div className="bg-slate-950 text-white rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden group border border-slate-800">
            <span className="bg-[#CCFF00] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
              FLAGSHIP SITE CANVAS
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Site Intelligence &amp; 3D Shadow</span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Drop a pin anywhere on Earth to simulate 3D building shadows, wind vectors, soil health &amp; 11+ site reports.
              </p>
            </div>

            {/* Quick Micro Modules */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
              <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 flex items-center gap-1 text-slate-300">
                <span>☀️</span> Sun &amp; Shadow
              </div>
              <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 flex items-center gap-1 text-slate-300">
                <span>🏢</span> Heights &amp; FSI
              </div>
              <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 flex items-center gap-1 text-slate-300">
                <span>💨</span> Wind Vectors
              </div>
              <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 flex items-center gap-1 text-slate-300">
                <span>🏔️</span> Slope Contours
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/tools')}
              className="w-full bg-[#CCFF00] hover:bg-white text-black font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
            >
              <span>Launch 3D Site Canvas</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* 🛋️ Studio Tools Gallery List */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-1">
              Design &amp; Restyle Suite
            </h3>

            <div className="space-y-2">
              {[
                {
                  id: 'interior',
                  name: 'Interior Design AI',
                  desc: 'Transform any room photo instantly into 55+ styles',
                  icon: '🛋️',
                  badge: 'Popular'
                },
                {
                  id: 'exterior',
                  name: 'Exterior Design AI',
                  desc: 'Redesign your house facade & architecture',
                  icon: '🏡',
                  badge: 'HD'
                },
                {
                  id: 'garden',
                  name: 'Garden & Landscape AI',
                  desc: 'Redesign yards, lawns & outdoor spaces',
                  icon: '🌿',
                  badge: 'Outdoor'
                },
                {
                  id: 'sketch2image',
                  name: 'Sketch2Image™',
                  desc: 'Convert raw sketches/blueprints to 3D renders',
                  icon: '✏️',
                  badge: 'CAD/BIM'
                },
                {
                  id: 'virtual-staging',
                  name: 'Virtual Staging AI',
                  desc: 'Fill empty rooms with photorealistic furniture',
                  icon: '🏗️',
                  badge: 'Real Estate'
                },
                {
                  id: 'replace-furniture',
                  name: 'Replace & Add Furniture',
                  desc: 'Swap specific couches, tables, or lamps',
                  icon: '🪑',
                  badge: 'Inpainting'
                },
                {
                  id: 'furniture-removal',
                  name: 'Furniture Removal AI',
                  desc: 'Clear objects & declutter rooms in 1-click',
                  icon: '🧹',
                  badge: 'Clean'
                }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedModule(t.id);
                    setCurrentWorkflowStep(2);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group ${
                    selectedModule === t.id
                      ? 'bg-white border-black shadow-md ring-1 ring-black'
                      : 'bg-white/80 border-gray-200/80 hover:border-gray-400 hover:bg-white'
                  }`}
                >
                  <span className="text-xl shrink-0 p-2 rounded-xl bg-gray-50 group-hover:scale-110 transition">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-black truncate">{t.name}</h4>
                      <span className="text-[9px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md shrink-0">
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info Badge */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-2xl text-[11px] text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <span>💡</span> Instant Regional Pin Matching
            </p>
            <p className="text-[10px] text-amber-800 leading-snug">
              Every rendered design maps to shoppable products in 🇮🇳 India, 🇺🇸 USA, and 🇧🇷 Brazil.
            </p>
          </div>

        </aside>

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
