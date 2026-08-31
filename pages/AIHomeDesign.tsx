/**
 * pages/AIHomeDesign.tsx — Anvitam's AI Studio Master Interface
 * 
 * Features:
 * 1. Claude/ChatGPT Conversational Design Studio
 * 2. Dedicated AI Tools for Interior, Exterior, Garden, Replace, Removal, Virtual Staging, Sketch2Image
 * 3. Interactive Before/After Split Canvas & Hotspot Pins (Interior-only)
 * 4. Shoppable Catalog rendered strictly POST-RENDER (Step 4) for generated design matches
 */

import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, Upload, Wand2, ArrowLeft, Download, RefreshCw, Image as ImageIcon,
  Check, ChevronRight, Sliders, ShieldCheck, Crown, ShoppingBag, MapPin, ExternalLink,
  Layers, Home, Building, Trees, Trash2, Paintbrush, LayoutGrid, Zap, Menu, X, AlertCircle,
  Settings, LogOut, PanelLeft, Code, Clock, ThumbsUp, ThumbsDown
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
  { id: 'low-fast', name: '⚡ Fast Draft (Low Complexity) — 1 Cred', creditCost: 1, level: 'Low', speed: '1-3s Fast GPU', desc: 'Fast initial drafts & quick color restyles', icon: '⚡' },
  { id: 'med-balanced', name: '🚀 Balanced Pro (Med Complexity) — 2 Creds', creditCost: 2, level: 'Med', speed: 'High Photorealism', desc: 'Balanced photorealism with lighting & texture synthesis', icon: '🚀' },
  { id: 'hard-master', name: '💎 Ultra HD Master (Hard Reasoning) — 3 Creds', creditCost: 3, level: 'Hard', speed: 'Max 4K Depth', desc: 'Max depth reasoning, raytraced lighting & architectural precision', icon: '👑' },
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

  // User & Auth State
  const [user, setUser] = useState<ToolUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showToolsDrawer, setShowToolsDrawer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // UI Drawer & Sidebar States
  const [showBriefCard, setShowBriefCard] = useState(false);

  // Saved Chat Sessions History (Claude sidebar)
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
        title: 'Modern Living Room Restyle',
        timestamp: '2 hours ago',
        module: 'interior',
        style: 'modern',
        roomType: 'Living Room',
        sourceImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
        generatedImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
        promptText: 'Modern Scandinavian lounge with warm oak wood and ambient lighting',
        recommendations: []
      },
      {
        id: 'chat-demo-2',
        title: 'Japandi Minimal Interior',
        timestamp: 'Yesterday',
        module: 'interior',
        style: 'japandi',
        roomType: 'Living Room',
        sourceImage: null,
        generatedImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
        promptText: 'Japandi minimal living room',
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
    setChatMessages([
      {
        id: `msg-init-${Date.now()}`,
        sender: 'assistant',
        text: "Hello! What space would you like to design or transform today? Select an AI tool below or type your architectural vision in the prompt bar."
      }
    ]);
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
    setCurrentWorkflowStep(session.generatedImage ? 4 : 1);
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

  // Agentic Feedback & Learning State
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [aiDescription, setAiDescription] = useState<string>('');

  // 3D Viewer State
  const [show3DViewer, setShow3DViewer] = useState(false);

  // Conversational Assistant Chat History State
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'user' | 'assistant'; text: string }>>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "Hello! What space would you like to design or transform today? Select an AI tool below or type your architectural vision in the prompt bar."
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Specialized Tool Brief States
  const [sketchRenderType, setSketchRenderType] = useState<'3d-floorplan' | 'exterior-elevation' | 'interior-walkthrough'>('3d-floorplan');
  const [sketchDetailLevel, setSketchDetailLevel] = useState<'conceptual' | 'photorealistic' | 'high-detail'>('photorealistic');
  const [stagingTheme, setStagingTheme] = useState<'luxury-minimalist' | 'executive-suite' | 'scandi-warmth' | 'family-cozy'>('luxury-minimalist');
  const [stagingDemographic, setStagingDemographic] = useState<'luxury' | 'first-time' | 'airbnb'>('luxury');
  const [itemToSwap, setItemToSwap] = useState<string>('Sofa / Couch');
  const [swapPrompt, setSwapPrompt] = useState<string>('');
  const [removalMode, setRemovalMode] = useState<'complete-declutter' | 'loose-objects' | 'fixed-walls'>('complete-declutter');

  useEffect(() => {
    setUser(getOrCreateDefaultToolUser());
    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ToolUser | null>;
      const newUser = customEvent.detail || getOrCreateDefaultToolUser();
      
      setUser((prevUser) => {
        if (prevUser && !prevUser.is_guest && newUser.is_guest) {
          setTimeout(() => {
            setSavedChats([]);
            setActiveChatId(null);
            setCurrentWorkflowStep(1);
            setSourceImage(null);
            setGeneratedImage(null);
            setPromptText('');
            setRecommendations([]);
            setChatMessages([
              {
                id: `msg-init-${Date.now()}`,
                sender: 'assistant',
                text: "Hello! What space would you like to design or transform today? Select an AI tool below or type your architectural vision in the prompt bar."
              }
            ]);
          }, 0);
        }
        return newUser;
      });
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

    if (modId === 'site-intelligence') {
      setChatMessages((prev) => [
        ...prev,
        { id: `ast-${Date.now()}`, sender: 'assistant', text: '🌐 Launching Site Intelligence 3D Canvas with sun path & wind vector reports...' }
      ]);
      navigate('/site-analysis');
      return;
    }

    let helperMsg = "";
    if (['interior', 'exterior', 'garden', 'sketch2image', 'floorplan2isometric'].includes(modId)) {
      setCurrentWorkflowStep(2); // Step 2: Architectural Style Selection
      helperMsg = `Selected ${modId.toUpperCase()} AI. Choose your preferred architectural aesthetic below (Step 2) or type instructions!`;
    } else {
      setCurrentWorkflowStep(3); // Skip Step 2 -> Go straight to Step 3 Photo/Sketch Brief
      if (modId === 'sketch2image') helperMsg = `Selected Sketch2Image™. Upload your floorplan sketch or CAD blueprint in Step 3!`;
      else if (modId === 'virtual-staging') helperMsg = `Selected Virtual Staging AI. Upload an empty room photo below to stage with photorealistic furniture!`;
      else if (modId === 'replace-furniture') helperMsg = `Selected Replace & Add Furniture. Upload a photo below and select the item you want to swap or add!`;
      else if (modId === 'furniture-removal') helperMsg = `Selected Furniture Removal AI. Upload a photo below for 1-click object decluttering!`;
      else helperMsg = `Selected ${modId} tool. Set your brief details below!`;
    }

    setChatMessages((prev) => [
      ...prev,
      { id: `ast-${Date.now()}`, sender: 'assistant', text: helperMsg }
    ]);
  };

  const handleImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit. Please select a smaller photo.');
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgDataUrl = e.target?.result as string;
      setSourceImage(imgDataUrl);

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          text: `📷 Photo uploaded: "${file.name}". Set your brief details or click 'Next: Select AI Engine' to render!`
        }
      ]);

      if (['interior', 'exterior', 'garden'].includes(selectedModule)) {
        if (currentWorkflowStep === 1) setCurrentWorkflowStep(2);
        else if (currentWorkflowStep === 2) setCurrentWorkflowStep(3);
      } else {
        if (currentWorkflowStep < 3) setCurrentWorkflowStep(3);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSamplePhoto = (sampleUrl: string, sampleMod: string) => {
    setSelectedModule(sampleMod);
    setSearchParams({ module: sampleMod });
    setSourceImage(sampleUrl);
    setCurrentWorkflowStep(2); // Advance to Step 2: Style Selection
  };

  const handlePromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!getToolUser()) {
      setShowAuthModal(true);
      return;
    }

    if (!promptText.trim()) {
      if (currentWorkflowStep < 4) {
        setCurrentWorkflowStep(currentWorkflowStep + 1);
      } else {
        handleGenerate();
      }
      return;
    }

    const userMsg = promptText.trim();
    setPromptText('');

    const userMsgObj = { id: `user-${Date.now()}`, sender: 'user' as const, text: userMsg };

    let replyText = "";
    const lower = userMsg.toLowerCase();

    if (lower.includes('interior') || lower.includes('room') || lower.includes('living') || lower.includes('bedroom')) {
      setSelectedModule('interior');
      setCurrentWorkflowStep(2);
      replyText = `I've set the AI tool to Interior Design AI for "${userMsg}". Now choose your preferred architectural style below or upload a room photo!`;
    } else if (lower.includes('exterior') || lower.includes('house') || lower.includes('facade') || lower.includes('building')) {
      setSelectedModule('exterior');
      setCurrentWorkflowStep(2);
      replyText = `Selected Exterior Design AI for "${userMsg}". Pick an architectural facade style below to start rendering!`;
    } else if (lower.includes('garden') || lower.includes('yard') || lower.includes('landscape') || lower.includes('lawn')) {
      setSelectedModule('garden');
      setCurrentWorkflowStep(2);
      replyText = `Selected Garden & Landscape AI. Choose your outdoor theme below!`;
    } else if (lower.includes('site') || lower.includes('shadow') || lower.includes('wind') || lower.includes('analysis')) {
      replyText = `Opening Site Intelligence 3D Canvas with sun path & wind analysis...`;
      navigate('/site-analysis');
    } else if (lower.includes('sketch') || lower.includes('blueprint') || lower.includes('cad') || lower.includes('drawing')) {
      setSelectedModule('sketch2image');
      setCurrentWorkflowStep(2);
      replyText = `Selected Sketch2Image™. Upload your floorplan or sketch in Step 3 to convert to a photorealistic 3D render!`;
    } else if (lower.includes('remove') || lower.includes('clear') || lower.includes('clean')) {
      setSelectedModule('furniture-removal');
      setCurrentWorkflowStep(2);
      replyText = `Selected Furniture Removal AI. Upload your room photo to clear objects and declutter!`;
    } else if (selectedAiModel === 'free-chat') {
      replyText = `AI Assistant (Free): "${userMsg}". We have 8 specialized tools: Interior, Exterior, Landscape, Sketch2Image, Virtual Staging, Replace Furniture, Furniture Removal, and Site Intelligence. Select any tool below or choose a render engine (Low/Med/Hard) to generate 4K designs!`;
    } else {
      if (currentWorkflowStep < 4) {
        setCurrentWorkflowStep(currentWorkflowStep + 1);
      } else {
        handleGenerate();
      }
      replyText = `Processing your prompt: "${userMsg}". Selected model: ${selectedAiModel.toUpperCase()}.`;
    }

    setChatMessages((prev) => [...prev, userMsgObj, { id: `ast-${Date.now()}`, sender: 'assistant', text: replyText }]);
  };

  const [selectedAiModel, setSelectedAiModel] = useState<string>('free-chat');

  const getModelCreditCost = (model: string) => {
    switch (model) {
      case 'free-chat': return 0;
      case 'low-fast': return 1;
      case 'med-balanced': return 2;
      case 'hard-master': return 3;
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
    setFeedbackGiven(null);
    setAiDescription('');

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
      setAiDescription(data.description || '');
      setCurrentWorkflowStep(4);
      setShowBriefCard(false);

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

      fetchRecommendations(roomType, selectedStyle, selectedModule);
      if (data.generatedImage) {
        fetchElementPins(data.generatedImage, selectedModule);
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

  const fetchRecommendations = async (rType: string, rStyle: string, activeMod: string = 'interior') => {
    try {
      const res = await fetch('/api/ai-design?action=recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomType: rType, style: rStyle, region, budget, module: activeMod })
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
    fetchRecommendations(roomType, selectedStyle, selectedModule);
  }, []);

  const fetchElementPins = async (img: string, activeMod: string = 'interior') => {
    try {
      const res = await fetch('/api/ai-design?action=detect-elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: img, module: activeMod })
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
          
          {/* Top: Studio Logo Header, User Profile & New Chat */}
          <div className="p-3.5 border-b border-gray-200/60 space-y-3 bg-white">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5 px-0.5 pt-0.5">
              <div className="w-8 h-8 rounded-xl bg-black text-[#CCFF00] font-black text-sm flex items-center justify-center shadow-xs">
                A
              </div>
              <div className="leading-tight">
                <h2 className="text-xs font-black text-gray-900 tracking-wide uppercase">Anvitam Studio</h2>
                <p className="text-[10px] text-gray-500 font-medium">AI Architectural Suite</p>
              </div>
            </div>

            {/* Profile Info & Credit Upgrade (At Top of Sidebar) */}
            <div className="bg-gray-50 rounded-2xl p-2.5 border border-gray-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-800 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                  {user?.name ? user.name[0] : 'G'}
                </div>
                <div className="leading-tight truncate max-w-[95px]">
                  <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Guest Designer'}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{user?.credits_remaining ?? 0} Creds</p>
                </div>
              </div>
              {user?.is_guest ? (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="text-[10px] font-extrabold bg-[#111111] text-[#CCFF00] px-2.5 py-1 rounded-xl hover:bg-black transition cursor-pointer shrink-0"
                >
                  Log In
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPaywall(true)}
                  className="text-[10px] font-extrabold bg-[#111111] text-[#CCFF00] px-2.5 py-1 rounded-xl hover:bg-black transition cursor-pointer shrink-0"
                >
                  Upgrade
                </button>
              )}
            </div>

            {/* + New Chat Button */}
            <button
              type="button"
              onClick={handleStartNewChat}
              className="w-full py-2 px-3 bg-white hover:bg-gray-100/80 text-gray-900 border border-gray-300/80 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base text-gray-600 font-bold">+</span>
                <span>New design chat</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">⌘K</span>
            </button>

            {/* Navigation Quick Links */}
            <div className="space-y-0.5 text-xs text-gray-600 font-medium">
              <button type="button" onClick={() => setShowSettingsModal(true)} className="w-full text-left px-2.5 py-1 rounded-xl hover:bg-gray-200/60 flex items-center gap-2 transition">
                <Settings size={14} className="text-gray-500" />
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
        </aside>

        {/* ── MAIN CLAUDE CHAT CANVAS WORKSPACE ── */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto relative min-h-[calc(100vh-80px)] p-4 sm:p-8">

          {/* Global Hidden File Input (Always mounted so + button works from anywhere!) */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
            }}
            className="hidden"
          />

          {/* Top Canvas Bar with Sidebar Toggle & Studio Controls */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
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
                <h1 className="text-sm font-semibold text-gray-900 leading-none">Anvitam AI Design Suite</h1>
                <p className="text-[10px] text-gray-500 font-medium">Powered by Claude &amp; FLUX.1 Pro</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowPaywall(true)}
                    className="px-3 py-1.5 rounded-xl bg-gray-900 text-[#CCFF00] text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-black transition"
                  >
                    <Zap size={13} className="fill-[#CCFF00]" />
                    <span>{user.credits_remaining} Cred</span>
                  </button>
                  {!user.is_guest && (
                    <button
                      type="button"
                      onClick={() => logoutToolUser()}
                      className="p-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-600 transition cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut size={15} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── UNIFIED CLAUDE-STYLE CHAT INTERFACE (IMAGE 1 ASSISTANT + IMAGE 2 PROMPT BAR) ── */}
          <div className="max-w-3xl mx-auto w-full space-y-3 my-4">
            
            {/* Assistant Chat Message Feed (Image 1) */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[#111111] text-[#CCFF00] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-black/10">
                      ⚡
                    </div>
                  )}
                  <div className={`max-w-xl space-y-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.sender === 'assistant' && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">Anvitam AI Assistant</span>
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Online • Free Guide
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Step {currentWorkflowStep} of 4</span>
                      </div>
                    )}
                    <p className={`text-xs leading-relaxed font-medium rounded-2xl p-3.5 shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-black text-[#CCFF00] rounded-tr-xs'
                        : 'bg-gray-50 border border-gray-200/80 text-gray-700 rounded-tl-xs'
                    }`}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Prompt Bar (Image 2 - Placed directly below Image 1!) */}
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
                
                {/* Left Controls: + Upload Photo */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition cursor-pointer text-sm font-bold shadow-2xs"
                    title="Upload or Change Room Photo"
                  >
                    +
                  </button>
                </div>

                {/* Right Controls: Model Picker & Action Button */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedAiModel}
                    onChange={(e) => setSelectedAiModel(e.target.value)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-semibold rounded-full px-2.5 py-1 border-none outline-none cursor-pointer max-w-[280px] truncate"
                  >
                    {AI_MODEL_ENGINES.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 text-[#CCFF00] flex items-center justify-center transition cursor-pointer shadow-2xs disabled:opacity-50 shrink-0"
                    title={currentWorkflowStep === 4 ? 'Render AI Design' : 'Send Message / Next Step'}
                  >
                    {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <ChevronRight size={16} />}
                  </button>
                </div>

              </div>
            </form>
          </div>

          {/* Step Back Indicator Bar */}
          {currentWorkflowStep > 1 && (
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-2 my-2 max-w-3xl mx-auto w-full text-xs font-semibold text-gray-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Step:</span>
                <span className="text-gray-900 font-bold">
                  {currentWorkflowStep === 2 && 'Step 2 of 4: Select Architectural Style'}
                  {currentWorkflowStep === 3 && 'Step 3 of 4: Upload Photo & Set Brief'}
                  {currentWorkflowStep === 4 && 'Step 4 of 4: AI Model & Render Output'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentWorkflowStep((prev) => Math.max(1, prev - 1))}
                className="text-[11px] text-gray-600 hover:text-black font-medium underline cursor-pointer"
              >
                ← Back
              </button>
            </div>
          )}

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
                        id: 'floorplan2isometric',
                        title: 'Floorplan to 3D',
                        desc: '2D blueprint → 3D isometric',
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
                        id: 'replace-furniture',
                        title: 'Replace & Add Furniture',
                        desc: 'Swap furniture with AI inpainting',
                        imageBefore: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'furniture-removal',
                        title: 'Furniture Removal',
                        desc: 'Remove objects in 1-click',
                        imageBefore: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=300&auto=format&fit=crop'
                      },
                      {
                        id: 'site-intelligence',
                        title: 'Site Intelligence 3D Canvas',
                        desc: 'Sun shadow, wind & site reports',
                        imageBefore: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=300&auto=format&fit=crop',
                        imageAfter: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=300&auto=format&fit=crop'
                      }
                    ].map(card => (
                      <div
                        key={card.id}
                        onClick={() => {
                          if (card.id === 'site-intelligence') {
                            navigate('/site-analysis');
                          } else {
                            handleSelectModule(card.id);
                          }
                        }}
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
                    {(() => {
                      const getFilteredStyles = () => {
                        if (selectedModule === 'garden') {
                          return STYLE_OPTIONS.filter(s => ['zen', 'japanese', 'biophilic', 'rustic', 'eco', 'bali', 'tropical', 'mediterranean', 'french_country', 'traditional', 'cottagecore', 'modern', 'minimalist'].includes(s.id));
                        }
                        if (selectedModule === 'exterior') {
                          return STYLE_OPTIONS.filter(s => ['modern', 'minimalist', 'contemporary', 'luxury', 'neoclassic', 'artdeco', 'rustic', 'mediterranean', 'french_country', 'farmhouse', 'industrial', 'soviet', 'cyberpunk'].includes(s.id));
                        }
                        return STYLE_OPTIONS;
                      };
                      
                      return getFilteredStyles().map((st) => (
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
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* ── STEP 3: IMAGE UPLOAD & ROOM BRIEF ── */}
              {/* ── STEP 3: TAILORED UPLOAD & BRIEF FOR ALL 8 TOOLS ── */}
              {currentWorkflowStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                        {selectedModule === 'sketch2image' && 'Upload Blueprint Sketch & CAD Brief'}
                        {selectedModule === 'floorplan2isometric' && 'Upload 2D Floorplan'}
                        {selectedModule === 'virtual-staging' && 'Upload Empty Room & Select Staging Theme'}
                        {selectedModule === 'replace-furniture' && 'Upload Room Photo & Specify Item to Swap'}
                        {selectedModule === 'furniture-removal' && 'Upload Photo for 1-Click Furniture Removal'}
                        {selectedModule === 'exterior' && 'Upload Building / Facade Photo'}
                        {selectedModule === 'garden' && 'Upload Yard & Outdoor Photo'}
                        {(!['sketch2image', 'floorplan2isometric', 'virtual-staging', 'replace-furniture', 'furniture-removal', 'exterior', 'garden'].includes(selectedModule)) && 'Upload Room Photo & Set Brief'}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {selectedModule === 'sketch2image' && 'Convert raw hand sketches or CAD floorplans into photorealistic 3D renders.'}
                        {selectedModule === 'floorplan2isometric' && 'Convert 2D blueprints into high-quality isometric 3D cutaway views.'}
                        {selectedModule === 'virtual-staging' && 'Furnish empty real estate listings with high-end photorealistic furniture packages.'}
                        {selectedModule === 'replace-furniture' && 'Target specific furniture pieces for AI swap or additions.'}
                        {selectedModule === 'furniture-removal' && 'Declutter rooms and clear furniture objects in 1-click.'}
                        {selectedModule === 'exterior' && 'Add your photo and specify building type & target region.'}
                        {selectedModule === 'garden' && 'Add your photo and specify outdoor space type & target region.'}
                        {(!['sketch2image', 'floorplan2isometric', 'virtual-staging', 'replace-furniture', 'furniture-removal', 'exterior', 'garden'].includes(selectedModule)) && 'Add your photo and specify room type, budget & target region.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentWorkflowStep(4)}
                      className="px-4 py-2 rounded-xl bg-[#111111] text-[#CCFF00] font-semibold text-xs hover:bg-black transition cursor-pointer shrink-0"
                    >
                      Next: Select AI Engine →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Photo Uploader */}
                    <div className="space-y-4">
                      <label className="text-xs font-semibold text-gray-900 block">
                        {selectedModule === 'sketch2image' ? 'Blueprint / CAD Sketch Image' : (selectedModule === 'floorplan2isometric' ? '2D Floorplan Image' : 'Room / Site Photo')}
                      </label>

                      {sourceImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-gray-300 h-52 group">
                          <img src={sourceImage} alt="Uploaded Spatial Brief" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setSourceImage(null)}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/80 text-white hover:bg-red-600 transition cursor-pointer"
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
                          <p className="text-xs font-semibold text-gray-800">
                            {selectedModule === 'sketch2image' ? 'Click to upload your CAD blueprint or floorplan sketch' : (selectedModule === 'floorplan2isometric' ? 'Click to upload your 2D floorplan or blueprint' : 'Click to upload your space photo')}
                          </p>
                          <p className="text-[10px] text-gray-400">JPG, PNG, WEBP up to 10MB</p>
                        </div>
                      )}
                    </div>

                    {/* Specialized Brief Options per Tool */}
                    <div className="space-y-5">
                      
                      {/* TOOL 1: SKETCH2IMAGE BRIEF */}
                      {selectedModule === 'sketch2image' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-900 block">Render Output Format</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: '3d-floorplan', label: '3D Floorplan' },
                                { id: 'exterior-elevation', label: 'Facade Elevation' },
                                { id: 'interior-walkthrough', label: 'Interior Walkthrough' }
                              ].map(opt => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setSketchRenderType(opt.id as any)}
                                  className={`p-2 rounded-xl text-[11px] font-semibold transition border ${
                                    sketchRenderType === opt.id
                                      ? 'bg-black text-[#CCFF00] border-black'
                                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-900 block">CAD Detail Level</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'conceptual', label: 'Conceptual Mass' },
                                { id: 'photorealistic', label: 'Photorealistic Material' },
                                { id: 'high-detail', label: 'Raytraced Lighting' }
                              ].map(opt => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setSketchDetailLevel(opt.id as any)}
                                  className={`p-2 rounded-xl text-[11px] font-semibold transition border ${
                                    sketchDetailLevel === opt.id
                                      ? 'bg-black text-[#CCFF00] border-black'
                                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TOOL 2: VIRTUAL STAGING BRIEF */}
                      {selectedModule === 'virtual-staging' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-900 block">Staging Furniture Vibe</label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'luxury-minimalist', label: 'Luxury Minimalist' },
                                { id: 'executive-suite', label: 'Executive Suite' },
                                { id: 'scandi-warmth', label: 'Scandi Warmth' },
                                { id: 'family-cozy', label: 'Family Cozy' }
                              ].map(opt => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setStagingTheme(opt.id as any)}
                                  className={`p-2.5 rounded-xl text-[11px] font-semibold transition border ${
                                    stagingTheme === opt.id
                                      ? 'bg-black text-[#CCFF00] border-black'
                                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-900 block">Target Real Estate Buyer</label>
                            <select
                              value={stagingDemographic}
                              onChange={(e) => setStagingDemographic(e.target.value as any)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold text-gray-900 outline-none"
                            >
                              <option value="luxury">High-End Luxury Buyer</option>
                              <option value="first-time">First-Time Homebuyer</option>
                              <option value="airbnb">Airbnb / Short-Term Rental</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* TOOL 3: REPLACE & ADD FURNITURE BRIEF */}
                      {selectedModule === 'replace-furniture' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-900 block">Item to Swap or Add</label>
                            <div className="flex flex-wrap gap-1.5">
                              {['Sofa / Couch', 'Dining Set', 'Accent Chair', 'Floor Lamp', 'Area Rug', 'Wall Art'].map(item => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => setItemToSwap(item)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                    itemToSwap === item
                                      ? 'bg-black text-[#CCFF00] border-black'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                                  }`}
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-900 block">Replacement Description (Optional)</label>
                            <input
                              type="text"
                              value={swapPrompt}
                              onChange={(e) => setSwapPrompt(e.target.value)}
                              placeholder="e.g. Italian cognac leather sectional sofa..."
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-medium text-gray-900 outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* TOOL 4: FURNITURE REMOVAL BRIEF */}
                      {selectedModule === 'furniture-removal' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-900 block">Declutter Intensity</label>
                            <div className="space-y-2">
                              {[
                                { id: 'complete-declutter', title: '1-Click Complete Empty Room', desc: 'Remove all furniture and loose items completely' },
                                { id: 'loose-objects', title: 'Remove Loose Objects Only', desc: 'Keep main sofa/table but remove clutter and boxes' },
                                { id: 'fixed-walls', title: 'Walls & Flooring Clean', desc: 'Wipe all items and restore architectural shell' }
                              ].map(opt => (
                                <div
                                  key={opt.id}
                                  onClick={() => setRemovalMode(opt.id as any)}
                                  className={`p-3 rounded-xl border cursor-pointer transition ${
                                    removalMode === opt.id
                                      ? 'bg-black text-white border-black ring-1 ring-black'
                                      : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-200'
                                  }`}
                                >
                                  <h4 className={`text-xs font-bold ${removalMode === opt.id ? 'text-[#CCFF00]' : 'text-gray-900'}`}>{opt.title}</h4>
                                  <p className={`text-[10px] ${removalMode === opt.id ? 'text-gray-300' : 'text-gray-500'}`}>{opt.desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STANDARD BRIEF (FOR INTERIOR, EXTERIOR, GARDEN) */}
                      {(!['sketch2image', 'floorplan2isometric', 'virtual-staging', 'replace-furniture', 'furniture-removal'].includes(selectedModule)) && (
                        <>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-900 block">{selectedModule === 'exterior' ? 'Building Type' : (selectedModule === 'garden' ? 'Outdoor Space Type' : 'Space Type')}</label>
                            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                              {(() => {
                                if (selectedModule === 'garden') return ['Backyard Garden', 'Front Yard', 'Balcony & Patio', 'Rooftop Terrace', 'Courtyard', 'Pool Area'];
                                if (selectedModule === 'exterior') return ['Exterior Facade', 'Modern Villa', 'Suburban Home', 'Cottage Front', 'Commercial Building', 'Log Cabin'];
                                return ['Living Room', 'Bedroom', 'Dining Room', 'Kitchen', 'Master Suite', 'Home Office', 'Bathroom', 'Commercial Cafe'];
                              })().map(r => (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => setRoomType(r)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                    roomType === r
                                      ? 'bg-[#111111] text-[#CCFF00] shadow-2xs ring-1 ring-black'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/60'
                                  }`}
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className={`grid ${selectedModule === 'interior' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
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

                            {selectedModule === 'interior' && (
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
                            )}
                          </div>
                        </>
                      )}

                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 4: AI MODEL ENGINE SELECTION & PRE-RENDER ── */}
              {currentWorkflowStep === 4 && !generatedImage && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs text-center">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
                      Select AI Model Engine &amp; Render
                    </h2>
                    <p className="text-xs text-gray-500">Pick your preferred neural render model to process your spatial brief.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    {AI_MODEL_ENGINES.map(m => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedAiModel(m.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                          selectedAiModel === m.id
                            ? 'border-gray-900 bg-gradient-to-br from-gray-900 to-black text-white shadow-lg ring-2 ring-black scale-[1.01]'
                            : 'border-gray-200 hover:border-gray-400 bg-white text-gray-900 hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{m.icon}</span>
                              <h4 className={`text-xs font-bold tracking-tight ${selectedAiModel === m.id ? 'text-white' : 'text-gray-900'}`}>
                                {m.name}
                              </h4>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              selectedAiModel === m.id
                                ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {m.creditCost === 0 ? 'FREE (0 Cred)' : `${m.creditCost} Cred`}
                            </span>
                          </div>
                          <span className={`text-[10px] font-semibold block ${selectedAiModel === m.id ? 'text-[#CCFF00]' : 'text-gray-500'}`}>
                            Level: {m.level} • {m.speed}
                          </span>
                          <p className={`text-[11px] leading-relaxed pt-1 ${selectedAiModel === m.id ? 'text-gray-300' : 'text-gray-500'}`}>
                            {m.desc}
                          </p>
                        </div>

                        {selectedAiModel === m.id && (
                          <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between text-[10px] text-[#CCFF00] font-semibold">
                            <span>Selected Engine Active</span>
                            <span>✓</span>
                          </div>
                        )}
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

              {/* ── STEP 4 POST-RENDER: AI OUTPUT CANVAS & SHOPPABLE CATALOG ── */}
              {generatedImage && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Your AI Design Render</h2>
                      <p className="text-xs text-gray-500">Drag the slider to compare original photo vs AI render.</p>
                    </div>
                    <button
                      onClick={() => setCurrentWorkflowStep(3)}
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

                    {/* Interactive Visual Hotspot Pins Overlay (ONLY FOR INTERIOR MODULES) */}
                    {(() => {
                      const isInteriorModule = ['interior', 'virtual-staging', 'replace-furniture'].includes(selectedModule);
                      const activeHotspotPins = pins.length > 0 ? pins : (isInteriorModule ? DEFAULT_HOTSPOT_PINS : []);
                      return activeHotspotPins.map((pin: any, idx: number) => {
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
                      });
                    })()}

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
                  <div className="flex items-center justify-between pt-2">
                    {/* Continuous Learning Loop Feedback UI */}
                    <div className="flex items-center gap-2">
                      {feedbackGiven ? (
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <Check size={14} className="text-[#CCFF00]" /> Thank you! AI is learning...
                        </span>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2 hidden sm:block">Train AI:</span>
                          <button
                            onClick={async () => {
                              if (!generatedImage || feedbackGiven || isSubmittingFeedback) return;
                              setIsSubmittingFeedback(true);
                              try {
                                await fetch('/api/ai-design?action=feedback', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    module: selectedModule,
                                    style: selectedStyle,
                                    originalImage: sourceImage,
                                    generatedImage: generatedImage,
                                    promptText: aiDescription || promptText || `${selectedStyle} style redesign for ${roomType}`,
                                    rating: 'positive'
                                  })
                                });
                                setFeedbackGiven('positive');
                              } catch (e) {
                                console.error('Failed to submit feedback', e);
                              } finally {
                                setIsSubmittingFeedback(false);
                              }
                            }}
                            disabled={isSubmittingFeedback}
                            className="bg-gray-100 hover:bg-[#CCFF00] hover:text-black text-gray-600 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title="Save as Golden Example to improve future results"
                          >
                            <ThumbsUp size={14} /> <span className="hidden sm:inline">Golden Example</span>
                          </button>
                          <button
                            onClick={async () => {
                              if (!generatedImage || feedbackGiven || isSubmittingFeedback) return;
                              setIsSubmittingFeedback(true);
                              try {
                                await fetch('/api/ai-design?action=feedback', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    module: selectedModule,
                                    style: selectedStyle,
                                    originalImage: sourceImage,
                                    generatedImage: generatedImage,
                                    promptText: aiDescription || promptText || `${selectedStyle} style redesign for ${roomType}`,
                                    rating: 'negative'
                                  })
                                });
                                setFeedbackGiven('negative');
                              } catch (e) {
                                console.error('Failed to submit feedback', e);
                              } finally {
                                setIsSubmittingFeedback(false);
                              }
                            }}
                            disabled={isSubmittingFeedback}
                            className="bg-gray-100 hover:bg-red-500 hover:text-white text-gray-600 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title="Report poor quality to prevent this in the future"
                          >
                            <ThumbsDown size={14} /> <span className="hidden sm:inline">Poor Quality</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* 3D Walkthrough Button - ONLY FOR INTERIOR MODULES */}
                      {['interior', 'virtual-staging', 'replace-furniture'].includes(selectedModule) && (
                        <button
                          onClick={() => setShow3DViewer(true)}
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold text-xs px-5 py-2.5 rounded-2xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          🏠 3D Room Walkthrough
                        </button>
                      )}
                      <a
                        href={generatedImage}
                        download="anvitam-ai-design.jpg"
                        className="bg-[#111111] hover:bg-black text-[#CCFF00] font-semibold text-xs px-5 py-2.5 rounded-2xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Download size={14} /> Export HD Design
                      </a>
                    </div>
                  </div>

                  {/* 🛍️ SHOPPABLE AFFILIATE RECOMMENDATION CATALOG (STRICTLY RENDERED POST-GENERATION ONLY) */}
                  <div className="pt-8 border-t border-gray-200/80 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-amber-500" />
                          <h3 className="text-lg font-bold text-gray-900">Shoppable Product Recommendations for Your Design</h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Curated product matches for your {selectedStyle} style redesign. Buy directly from verified partner stores.
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

                </div>
              )}

            </div>

            {/* Room 3D Viewer Overlay */}
            {show3DViewer && generatedImage && (
              <Room3DViewer
                imageUrl={generatedImage}
                onClose={() => setShow3DViewer(false)}
              />
            )}

          {/* ── CLAUDE FLOATING PROMPT BAR AT BOTTOM ── */}


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
              8 Active
            </span>
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
                },
                {
                  id: 'site-intelligence',
                  name: 'Site Intelligence 3D Canvas',
                  desc: '3D sun shadows, wind vectors & 11+ site reports',
                  icon: '🌐',
                  badge: 'Flagship'
                }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (t.id === 'site-intelligence') {
                      navigate('/site-analysis');
                    } else {
                      setSelectedModule(t.id);
                      setCurrentWorkflowStep(2);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group ${
                    selectedModule === t.id
                      ? 'bg-white border-black shadow-md ring-1 ring-black'
                      : 'bg-white/80 border-gray-200/80 hover:border-gray-400 hover:bg-white'
                  }`}
                >
                  <span className="text-xl shrink-0 p-2 rounded-xl bg-gray-50 group-hover:scale-110 transition">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-black">{t.name}</h4>
                      <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">{t.badge}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </aside>

      </div>

      {/* Drawers & Modals */}
      <ToolsAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ToolsPaywallOverlay isOpen={showPaywall} onClose={() => setShowPaywall(false)} user={user} />
      <AllToolsDrawer isOpen={showToolsDrawer} onClose={() => setShowToolsDrawer(false)} />
      <ToolsSettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
        user={user} 
        onLogout={() => {}} 
        onUpgrade={() => setShowPaywall(true)}
        onLogin={() => setShowAuthModal(true)}
      />
    </>
  );
}
