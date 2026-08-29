// constants/toolsData.ts — Central Registry for Anvitam Architectural Powerhouse Studios
import React from 'react';
import {
  MapPin, Sparkles, Sun, Building, Trees, Sliders, Layers, Mountain, Compass, Wind, Droplets, Zap, FileText
} from 'lucide-react';

export interface SubModuleItem {
  id: string;
  name: string;
  badge: string;
  href: string;
  icon: string;
}

export interface ToolItem {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  subModules: SubModuleItem[];
  href: string;
  status: 'live' | 'phase2';
  badge: string;
  iconBg: string;
  iconColor: string;
  iconSvg: React.ReactNode;
  previewImage: string;
}

export const TOOLS_SUITE: ToolItem[] = [
  {
    id: 'ai-home-design',
    name: 'AI Space & Home Design Studio',
    category: 'Generative AI Studios',
    shortDesc: 'Photorealistic AI Studio for interior restyling, exterior house facades, yard landscapes, furniture swap & decluttering.',
    fullDesc: 'Upload interior room photos, house elevations, or garden yards to generate photorealistic AI designs with shoppable regional furniture catalog matching.',
    features: [
      '🛋️ Interior Room Design & Restyle',
      '🏡 Exterior Facade & Modern Cladding',
      '🌿 Yard, Garden & Landscape Design',
      '🪑 Object Swap & Furniture Replacement',
      '🧹 Furniture Removal & Decluttering',
      '🛒 Shoppable Furniture Pins (India 🇮🇳, USA 🇺🇸, Brazil 🇧🇷)'
    ],
    subModules: [
      { id: 'interior', name: 'Interior Room Design', badge: 'INTERIOR AI', href: '/tools/ai-home-design?module=interior', icon: '🛋️' },
      { id: 'exterior', name: 'Exterior Facade Studio', badge: 'EXTERIOR AI', href: '/tools/ai-home-design?module=exterior', icon: '🏡' },
      { id: 'garden', name: 'Yard & Landscape Studio', badge: 'GARDEN AI', href: '/tools/ai-home-design?module=garden', icon: '🌿' },
      { id: 'replace', name: 'Replace & Add Furniture', badge: 'EDIT AI', href: '/tools/ai-home-design?module=replace', icon: '🪑' },
      { id: 'remove', name: 'Furniture Removal', badge: 'CLEANUP AI', href: '/tools/ai-home-design?module=remove', icon: '🧹' }
    ],
    href: '/tools/ai-home-design',
    status: 'live',
    badge: 'FLAGSHIP AI STUDIO',
    iconBg: 'bg-[#CCFF00] text-black',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Sparkles, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'site-analysis',
    name: 'Site Intelligence & 3D Shadow Canvas',
    category: 'Site & Environmental Studios',
    shortDesc: 'Drop a pin anywhere on Earth to simulate 3D building shadows, wind vectors, soil health, and get 11+ site reports.',
    fullDesc: 'Get automatic reports for sun angles, wind direction, soil health, surrounding building heights, rainwater collection, solar PV power, and 3D shadow tests.',
    features: [
      '☀️ 3D Sun & Shadow Path Simulator (6 AM - 7 PM)',
      '🏢 Building Heights & Area Density Checker',
      '💨 Wind Rose Direction & Breeze Analyzer',
      '🏔️ Hill & Slope Elevation Contours',
      '🧱 Soil Health & Foundation Checker (SoilGrids)',
      '🌧️ Rainwater Tank & Solar PV Calculator',
      '♻️ Green Material Cost & Embodied Carbon'
    ],
    subModules: [
      { id: 'shadow-sim-3d', name: '3D Sun & Shadow Simulator', badge: '3D LIVE', href: '/site-analysis?tool=shadow-sim-3d', icon: '☀️' },
      { id: 'urban-fabric', name: 'Building Heights & Density', badge: 'SITE REPORT', href: '/site-analysis?tool=urban-fabric', icon: '🏢' },
      { id: 'wind-rose-vector', name: 'Wind Direction & Breeze', badge: 'CLIMATE', href: '/site-analysis?tool=wind-rose-vector', icon: '💨' },
      { id: 'topography-slopes', name: 'Hill & Slope Contours', badge: 'ELEVATION', href: '/site-analysis?tool=topography-slopes', icon: '🏔️' },
      { id: 'soil-analysis', name: 'Soil Health & Foundation', badge: 'SOILGRIDS', href: '/site-analysis?tool=soil-analysis', icon: '🧱' },
      { id: 'hydrology-rainwater', name: 'Rainwater Tank & Solar PV', badge: 'SUSTAINABILITY', href: '/site-analysis?tool=hydrology-rainwater', icon: '🌧️' },
      { id: 'embodied-carbon', name: 'Green Material & Cost', badge: 'CARBON & COST', href: '/site-analysis?tool=embodied-carbon', icon: '♻️' }
    ],
    href: '/site-analysis',
    status: 'live',
    badge: 'FLAGSHIP SITE CANVAS',
    iconBg: 'bg-[#111111] text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(MapPin, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=1200&auto=format&fit=crop',
  }
];

// Backward-compatible lookup helper for legacy deep-links
export function findToolById(id: string): ToolItem {
  if (id.startsWith('ai-')) {
    return TOOLS_SUITE[0];
  }
  return TOOLS_SUITE[1];
}

