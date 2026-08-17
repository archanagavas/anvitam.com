// constants/toolsData.ts — Central Registry for All 16+ Anvitam Architectural Tools
import React from 'react';
import {
  MapPin, Sun, Compass, Layers3, Droplets, Wind, Mountain, Layers,
  FileSpreadsheet, Zap, Building, Sliders, Scale, Sparkles, Trees
} from 'lucide-react';

export interface ToolItem {
  id: string;
  name: string;
  category: 'Site & Urban' | '3D & Shadow (Phase 2)' | 'Climate' | 'Ecology & Soil' | 'Building Science';
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
  // Category 1: Site & Urban
  {
    id: 'site-analysis',
    name: 'Site Analysis by Anvitam',
    category: 'Site & Urban',
    shortDesc: 'Drop a pin anywhere in the world and instantly generate 11+ live site diagrams.',
    fullDesc: 'Automated solar path, wind rose, Köppen climate classification, SoilGrids foundation data, urban fabric density, and interactive 3D building footprint drawer.',
    features: [
      '☀️ Solar path & SunCalc solar angles',
      '💨 Wind rose direction & speed bands',
      '🌍 Soil composition & clay/sand %',
      '🏢 Urban fabric heights & density',
      '🌡️ Thermal comfort & degree days',
      '🌿 Bioclimatic passive design strategies',
      '🏗️ Interactive 3D building massing drawer'
    ],
    href: '/site-analysis',
    status: 'live',
    badge: 'LIVE TOOL',
    iconBg: 'bg-[#111111] text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(MapPin, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'urban-fabric',
    name: 'Urban Fabric & Density Analyzer',
    category: 'Site & Urban',
    shortDesc: '3D building height mapping and surrounding urban fabric density profile.',
    fullDesc: 'Analyzes adjacent building footprint heights, volumetric density, and road setback offsets to evaluate context massing.',
    features: [
      '🏢 3D Building extrusion heights',
      '📐 Urban FAR & site coverage ratio',
      '🛣️ Setback & adjacent context clearance'
    ],
    href: '/site-analysis?tool=urban-fabric',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-stone-900 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Building, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'topography-slopes',
    name: 'Contour & Topography Elevation Mapper',
    category: 'Site & Urban',
    shortDesc: 'Terrain slope gradients, elevation contours, and cut-and-fill feasibility.',
    fullDesc: 'Fetches digital elevation model (DEM) contours to calculate site slope percentages and steepness vectors for earthworks.',
    features: [
      '🏔️ Digital Elevation Model contours',
      '📐 Slope gradient percentage breakdown',
      '🚜 Cut & fill volume feasibility'
    ],
    href: '/site-analysis?tool=topography-slopes',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-emerald-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Mountain, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'circulation-vectors',
    name: 'Circulation & Access Movement Mapper',
    category: 'Site & Urban',
    shortDesc: 'Road connectivity, pedestrian movement vectors, and site access points.',
    fullDesc: 'Maps surrounding primary/secondary roads, pedestrian footpaths, and optimal site entry gates.',
    features: [
      '🚗 Primary arterial road connectivity',
      '🚶 Pedestrian movement & walkability',
      '🚪 Optimal site entry & gate orientation'
    ],
    href: '/site-analysis?tool=circulation-vectors',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-zinc-900 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Compass, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200&auto=format&fit=crop',
  },

  // Category 2: 3D & Shadow (Phase 2 Focus)
  {
    id: 'shadow-sim-3d',
    name: '3D Solar Shadow Simulator',
    category: '3D & Shadow (Phase 2)',
    shortDesc: 'Draw 3D building footprints and animate real-time solar shadows from 6 AM to 7 PM.',
    fullDesc: 'Interactive 3D building massing tool with Solstice/Equinox presets, real-time sun azimuth animation, and shadow casting on surrounding context.',
    features: [
      '⏱️ Time-lapse slider (6:00 AM – 7:00 PM)',
      '📅 Solstice & Equinox preset dates',
      '🏗️ Multi-story extrusion shadow test',
      '📊 Facade heat gain & shadow length multiplier'
    ],
    href: '/site-analysis?tool=shadow-sim-3d',
    status: 'live',
    badge: 'PHASE 2 LIVE',
    iconBg: 'bg-[#CCFF00] text-black',
    iconColor: 'text-black',
    iconSvg: React.createElement(Sun, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'adjacent-shadow-heatmap',
    name: 'Adjacent Context Shadow Heatmap',
    category: '3D & Shadow (Phase 2)',
    shortDesc: 'Evaluate shadow cast on neighboring structures and courtyard shading.',
    fullDesc: 'Calculates the hours of direct solar exposure vs shadow cast on neighboring plots across the year.',
    features: [
      '☀️ Direct sun hours per plot quadrant',
      '🏙️ Neighboring shadow cast impact',
      '🌿 Courtyard daylight factor optimization'
    ],
    href: '/site-analysis?tool=adjacent-shadow-heatmap',
    status: 'live',
    badge: 'PHASE 2 LIVE',
    iconBg: 'bg-amber-900 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Layers, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'facade-exposure',
    name: 'Facade Daylight & Radiation Matrix',
    category: '3D & Shadow (Phase 2)',
    shortDesc: 'Determine which building facade takes the highest solar radiation exposure.',
    fullDesc: 'Computes orientation-based vertical solar radiation (kWh/m²) to advise window-to-wall ratios and louver placement.',
    features: [
      '🧭 N, E, S, W vertical radiation intensity',
      '🪟 Window-to-Wall Ratio (WWR) recommendation',
      '🕶️ Shading overhang depth calculator'
    ],
    href: '/site-analysis?tool=facade-exposure',
    status: 'live',
    badge: 'PHASE 2 LIVE',
    iconBg: 'bg-orange-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Sparkles, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
  },

  // Category 3: Climate
  {
    id: 'wind-rose-vector',
    name: 'Wind Rose & Airflow Directional Vector',
    category: 'Climate',
    shortDesc: 'Analyze prevailing wind directions and seasonal cross-ventilation vectors.',
    fullDesc: 'Generates 16-point wind velocity polar charts using Open-Meteo climate data to optimize passive cooling.',
    features: [
      '🧭 16-cardinal direction wind distribution',
      '💨 Summer vs winter prevailing wind shift',
      '🍃 Cross-ventilation window placement tips'
    ],
    href: '/site-analysis?tool=wind-rose-vector',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-sky-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Wind, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'koppen-climate',
    name: 'Köppen Climate & Thermal Comfort Model',
    category: 'Climate',
    shortDesc: 'Köppen classification, heating/cooling degree days, and humidity ranges.',
    fullDesc: 'Fetches historical temperature trends and thermal comfort thresholds to tailor building envelopes.',
    features: [
      '🌡️ Köppen climate zone classification',
      '📊 Cooling Degree Days (CDD) & HDD',
      '💧 Relative humidity & comfort zones'
    ],
    href: '/site-analysis?tool=koppen-climate',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-cyan-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Sliders, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'sunpath-suncalc',
    name: 'Solar Path & SunCalc Analyzer',
    category: 'Climate',
    shortDesc: 'Calculates exact sun altitude, azimuth angles, and seasonal solar trajectory.',
    fullDesc: 'Uses astronomical solar formulas to plot sun paths across Solstices and Equinoxes for any location on Earth.',
    features: [
      '☀️ High precision solar azimuth & altitude',
      '📅 Solstice & Equinox solar path curves',
      '🕰️ Hourly sun position calculation'
    ],
    href: '/site-analysis?tool=sunpath-suncalc',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-amber-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Sun, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
  },

  // Category 4: Ecology & Soil
  {
    id: 'soil-analysis',
    name: 'SoilGrids Geotechnical Soil Analyzer',
    category: 'Ecology & Soil',
    shortDesc: 'Foundation soil composition: clay %, sand %, silt %, pH & organic carbon.',
    fullDesc: 'Fetches global SoilGrids geotechnical data to determine foundation bearing suitability and permaculture planting advice.',
    features: [
      '🧱 Clay, sand & silt percentage breakdown',
      '🌱 Soil pH & organic carbon content',
      '🏗️ Foundation type recommendations'
    ],
    href: '/site-analysis?tool=soil-analysis',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-yellow-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Trees, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'hydrology-rainwater',
    name: 'Hydrology & Rainwater Catchment Sizer',
    category: 'Ecology & Soil',
    shortDesc: 'Annual rainfall runoff volume (Liters) and rainwater tank sizing.',
    fullDesc: 'Calculates potential rainwater harvesting yields from roof area based on local precipitation data.',
    features: [
      '🌧️ Annual catchment yield (Liters/year)',
      '🛢️ Storage tank sizing recommendations',
      '🌊 Site drainage & permeability estimation'
    ],
    href: '/site-analysis?tool=hydrology-rainwater',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-blue-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Droplets, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'solar-pv-calculator',
    name: 'Solar PV Energy Generation Potential',
    category: 'Ecology & Soil',
    shortDesc: 'Roof solar panel kWh/year generation potential and carbon offset.',
    fullDesc: 'Estimates solar photovoltaic energy output (kWh/year) and grid displacement savings based on available roof area.',
    features: [
      '⚡ Annual solar energy generation (kWh)',
      '🌱 CO2 offset equivalent',
      '💰 Estimated electricity bill savings'
    ],
    href: '/site-analysis?tool=solar-pv-calculator',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-lime-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Zap, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
  },

  // Category 5: Building Science
  {
    id: 'embodied-carbon',
    name: 'Embodied Carbon & Material Estimator',
    category: 'Building Science',
    shortDesc: 'Compare CSEB earth blocks, bamboo, timber, steel & concrete emissions.',
    fullDesc: 'Calculates total embodied carbon (kg CO2e/m²) and compares sustainable alternative construction budgets.',
    features: [
      '♻️ Embodied carbon footprint (kg CO2e/m²)',
      '💵 Comparative construction budget range',
      '🌿 Sustainable material swap options'
    ],
    href: '/site-analysis?tool=embodied-carbon',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-teal-950 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Layers3, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'bioclimatic-matrix',
    name: 'Bioclimatic Passive Strategy Matrix',
    category: 'Building Science',
    shortDesc: 'Tailored architectural passive heating, cooling & thermal mass strategies.',
    fullDesc: 'Generates site-specific passive design guidelines based on Givoni bioclimatic comfort charts.',
    features: [
      '🏡 Thermal mass & nocturnal ventilation rules',
      '☀️ Evaporative cooling & shading priorities',
      '🪟 Insulation & glazing recommendations'
    ],
    href: '/site-analysis?tool=bioclimatic-matrix',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-slate-900 text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(Scale, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'executive-pdf-export',
    name: 'Executive Site PDF Report Generator',
    category: 'Building Science',
    shortDesc: 'Export clean, professional 11-page site analysis PDF reports for clients.',
    fullDesc: 'Generates branded executive site analysis reports with high-resolution site maps, climate charts, and methodology notes.',
    features: [
      '📄 Branded 11-diagram PDF report export',
      '🔍 Complete methodology & data source citations',
      '💼 Shareable client link generator'
    ],
    href: '/site-analysis?tool=executive-pdf-export',
    status: 'live',
    badge: 'INCLUDED IN SITE ANALYSIS',
    iconBg: 'bg-[#111111] text-[#CCFF00]',
    iconColor: 'text-[#CCFF00]',
    iconSvg: React.createElement(FileSpreadsheet, { size: 24 }),
    previewImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
  },
];
