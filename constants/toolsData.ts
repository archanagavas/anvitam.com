// constants/toolsData.ts — Central Registry for All 16+ Anvitam Architectural Tools (7th-Grade Clear Copy)
import React from 'react';
import {
  MapPin, Sun, Compass, Layers3, Droplets, Wind, Mountain, Layers,
  Zap, Building, Sliders, Sparkles, Trees, ShieldCheck, Scale, FileText
} from 'lucide-react';

export interface ToolItem {
  id: string;
  name: string;
  category: 'Sun & Site' | '3D & Shadows' | 'Weather & Wind' | 'Soil & Water' | 'Building Cost & Carbon';
  shortDesc: string;
  fullDesc: string;
  features: string[];
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
    name: 'AI Home Design & Restyle Studio',
    category: 'Sun & Site',
    shortDesc: '10 master AI prompt modules: interior restyle, exterior facade, garden, replace furniture & shoppable catalog pins.',
    fullDesc: 'Transform room photos into photorealistic interior, exterior, landscape, flooring, and furniture designs with shoppable catalog product matching across India, USA, and Brazil.',
    features: [
      '✨ 10 DecAI-mirrored prompt design modules',
      '↔️ Draggable before/after visual comparison slider',
      '🏷️ Interactive element bounding box pins on redesign',
      '🛒 Shoppable catalog product recommendations',
      '🇮🇳 Regional pricing for India, USA, and Brazil',
      '💎 Watermark-free HD export downloads'
    ],
    href: '/tools/ai-home-design',
    status: 'live',
    badge: 'NEW AI TOOL',
    iconBg: 'bg-[#CCFF00] text-black',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Sparkles, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
  },
  // Category 1: Sun & Site
  {
    id: 'site-analysis',
    name: 'Complete Site Report',
    category: 'Sun & Site',
    shortDesc: 'Click anywhere on the map to get 11+ instant site reports for your building.',
    fullDesc: 'Get automatic reports for sun angles, wind direction, soil health, surrounding buildings, rain collection, and 3D shadow tests.',
    features: [
      '☀️ Sun path and hourly sun angles',
      '💨 Wind direction and seasonal breeze',
      '🌍 Soil composition (sand, clay & silt)',
      '🏢 Nearby building heights and density',
      '🌡️ Weather comfort and degree days',
      '🌿 Natural cooling ideas for your site',
      '🏗️ Easy 3D building drawer'
    ],
    href: '/site-analysis',
    status: 'live',
    badge: 'POPULAR TOOL',
    iconBg: 'bg-[#111111] text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(MapPin, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'urban-fabric',
    name: 'Building Heights & Area Checker',
    category: 'Sun & Site',
    shortDesc: 'See surrounding building heights, street space, and neighborhood density.',
    fullDesc: 'Shows how tall nearby houses and buildings are so you can plan your building height and property setbacks.',
    features: [
      '🏢 Nearby building height maps',
      '📐 Land area and building coverage ratios',
      '🛣️ Boundary and street clearance guides'
    ],
    href: '/site-analysis?tool=urban-fabric',
    status: 'live',
    badge: 'INCLUDED IN SITE REPORT',
    iconBg: 'bg-stone-900 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Building, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'topography-slopes',
    name: 'Hill & Slope Elevation Mapper',
    category: 'Sun & Site',
    shortDesc: 'Check ground steepness, land elevation contours, and digging/leveling needs.',
    fullDesc: 'Uses terrain satellite data to show how steep your plot is and how much ground needs to be leveled for construction.',
    features: [
      '🏔️ Land elevation contour lines',
      '📐 Ground slope percentage breakdown',
      '🚜 Earth digging & land leveling estimates'
    ],
    href: '/site-analysis?tool=topography-slopes',
    status: 'live',
    badge: 'INCLUDED IN SITE REPORT',
    iconBg: 'bg-emerald-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Mountain, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'circulation-vectors',
    name: 'Road & Gate Access Mapper',
    category: 'Sun & Site',
    shortDesc: 'Find the best spots for main driveways, walking paths, and entrance gates.',
    fullDesc: 'Shows main roads, side streets, and walking routes around your plot to help you pick the safest entry gate.',
    features: [
      '🚗 Main road and street access routes',
      '🚶 Walking paths and neighborhood access',
      '🚪 Recommended main gate location'
    ],
    href: '/site-analysis?tool=circulation-vectors',
    status: 'live',
    badge: 'INCLUDED IN SITE REPORT',
    iconBg: 'bg-zinc-900 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Compass, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200&auto=format&fit=crop',
  },

  // Category 2: 3D & Shadows
  {
    id: 'shadow-sim-3d',
    name: '3D Sun & Shadow Simulator',
    category: '3D & Shadows',
    shortDesc: 'Draw your building in 3D and watch how shadows move from 6 AM to 7 PM.',
    fullDesc: 'Animate sunlight across your 3D building. Choose summer or winter dates to see where shadows fall throughout the day.',
    features: [
      '⏱️ Time slider from 6:00 AM to 7:00 PM',
      '📅 Summer and winter solstice presets',
      '🏗️ 3D building height shadow test',
      '📊 Sunlight hours on your walls and yard'
    ],
    href: '/site-analysis?tool=shadow-sim-3d',
    status: 'live',
    badge: '3D LIVE TOOL',
    iconBg: 'bg-[#CCFF00] text-black',
    iconColor: 'text-black',
    iconSvg: React.createElement(Sun, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'adjacent-shadow-heatmap',
    name: 'Neighbor Shadow & Sun Heatmap',
    category: '3D & Shadows',
    shortDesc: 'See how much sunlight your building gets compared to nearby structures.',
    fullDesc: 'Measures how many hours of direct sunlight hit your plot vs how much shadow is cast by tall nearby buildings.',
    features: [
      '☀️ Direct sun hours for every plot corner',
      '🏙️ Shadows cast by neighboring buildings',
      '🌿 Courtyard daylight & shade score'
    ],
    href: '/site-analysis?tool=adjacent-shadow-heatmap',
    status: 'live',
    badge: '3D LIVE TOOL',
    iconBg: 'bg-amber-900 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Layers, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'facade-exposure',
    name: 'Sun Heat & Window Guide',
    category: '3D & Shadows',
    shortDesc: 'Find out which walls get the hottest sun so you can place windows and shades.',
    fullDesc: 'Calculates heat build-up on north, south, east, and west walls so you know where to add window shades or louvers.',
    features: [
      '🧭 Wall heat exposure score (North, East, South, West)',
      '🪟 Recommended window size ratios',
      '🕶️ Roof overhang and shade depth advice'
    ],
    href: '/site-analysis?tool=facade-exposure',
    status: 'live',
    badge: '3D LIVE TOOL',
    iconBg: 'bg-orange-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Sparkles, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
  },

  // Category 3: Weather & Wind
  {
    id: 'wind-rose-vector',
    name: 'Wind Direction & Breeze Analyzer',
    category: 'Weather & Wind',
    shortDesc: 'See where summer and winter winds blow so you can place windows for fresh air.',
    fullDesc: 'Creates a wind chart using real weather data to show main wind speeds and directions for natural cooling.',
    features: [
      '🧭 16 wind directions mapped for your plot',
      '💨 Summer vs winter breeze changes',
      '🍃 Window placement tips for cross-breeze'
    ],
    href: '/site-analysis?tool=wind-rose-vector',
    status: 'live',
    badge: 'INCLUDED IN SITE REPORT',
    iconBg: 'bg-sky-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Wind, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'koppen-climate',
    name: 'Weather & Air Comfort Guide',
    category: 'Weather & Wind',
    shortDesc: 'Learn local temperature patterns and natural cooling strategies for your home.',
    fullDesc: 'Uses yearly weather data to tell you how many days need AC or heating, plus smart architectural cooling tips.',
    features: [
      '🌡️ Official Köppen climate zone rating',
      '📊 Hot vs comfortable days breakdown',
      '💧 Humidity level & air quality profile'
    ],
    href: '/site-analysis?tool=koppen-climate',
    status: 'live',
    badge: 'INCLUDED IN SITE REPORT',
    iconBg: 'bg-cyan-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Sliders, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'sunpath-suncalc',
    name: 'Sun Position & Angle Finder',
    category: 'Weather & Wind',
    shortDesc: 'Find the exact angle of the sun for any hour, day, or season of the year.',
    fullDesc: 'Calculates precise sun height and compass angles for any month so you can design solar panels and overhangs.',
    features: [
      '☀️ Exact sun height and direction angles',
      '📅 Solstice & Equinox solar movement curves',
      '🕰️ Hourly sun trajectory chart'
    ],
    href: '/site-analysis?tool=sunpath-suncalc',
    status: 'live',
    badge: 'INCLUDED IN SITE REPORT',
    iconBg: 'bg-amber-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Sun, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
  },

  // Category 4: Soil & Water
  {
    id: 'soil-analysis',
    name: 'Soil Health & Ground Checker',
    category: 'Soil & Water',
    shortDesc: 'Check clay, sand, silt %, pH levels, and ground strength for foundations.',
    fullDesc: 'Fetches global SoilGrids ground data to tell you if the soil is sturdy for foundations or great for gardens.',
    features: [
      '🧱 Clay, sand & silt percentage breakdown',
      '🌱 Soil pH and organic plant food levels',
      '🏗️ Safe foundation recommendations'
    ],
    href: '/site-analysis?tool=soil-analysis',
    status: 'live',
    badge: 'INCLUDED IN SITE REPORT',
    iconBg: 'bg-yellow-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Trees, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'hydrology-rainwater',
    name: 'Rainwater Tank & Saver Calculator',
    category: 'Soil & Water',
    shortDesc: 'Calculate how much rain your roof can collect and what size water tank you need.',
    fullDesc: 'Uses local rain data and your roof area to estimate how many liters of rainwater you can store each year.',
    features: [
      '🌧️ Yearly water collection estimate (Liters)',
      '🛢️ Water storage tank size guide',
      '🌊 Ground water soak & drainage advice'
    ],
    href: '/site-analysis?tool=hydrology-rainwater',
    status: 'live',
    badge: 'INCLUDED IN SITE REPORT',
    iconBg: 'bg-blue-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Droplets, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'solar-pv-calculator',
    name: 'Solar Panel Power Calculator',
    category: 'Soil & Water',
    shortDesc: 'Find out how much solar electricity your roof can make and how much money you save.',
    fullDesc: 'Estimates solar panel power output (kWh/year) and money saved on electric bills based on your roof space.',
    features: [
      '⚡ Yearly solar power output (kWh)',
      '🌱 Clean energy environmental savings',
      '💰 Estimated electric bill money saved'
    ],
    href: '/site-analysis?tool=solar-pv-calculator',
    status: 'live',
    badge: 'INCLUDED IN SITE REPORT',
    iconBg: 'bg-lime-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Zap, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
  },

  // Category 5: Building Cost & Carbon
  {
    id: 'embodied-carbon',
    name: 'Green Building Material Cost Estimator',
    category: 'Building Cost & Carbon',
    shortDesc: 'Compare eco-friendly materials like mud blocks, bamboo, wood, steel, and concrete.',
    fullDesc: 'Calculates building carbon footprint and compares costs between traditional concrete and eco-friendly materials.',
    features: [
      '♻️ Carbon footprint score (kg CO2 per sq. meter)',
      '💵 Material cost comparison overview',
      '🌿 Eco-friendly alternative building options'
    ],
    href: '/site-analysis?tool=embodied-carbon',
    status: 'live',
    badge: 'INCLUDED IN SITE REPORT',
    iconBg: 'bg-teal-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(FileText, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1200&auto=format&fit=crop',
  },
];
