// components/siteanalysis/AnalysisPanel.tsx
import React, { useState } from 'react';
import type { SiteAnalysisResult } from '../../services/siteAnalysisService';
import { SolarCard } from './cards/SolarCard';
import { WindRoseCard } from './cards/WindRoseCard';
import { ClimateCard } from './cards/ClimateCard';
import { RainfallCard } from './cards/RainfallCard';
import { ThermalCard } from './cards/ThermalCard';
import { UrbanFabricCard } from './cards/UrbanFabricCard';
import { SoilCard } from './cards/SoilCard';
import { OrientationCard } from './cards/OrientationCard';
import { BioclimateCard } from './cards/BioclimateCard';
import { TopographyCard } from './cards/TopographyCard';
import { MapPin, Share2, Sparkles, SlidersHorizontal, Check, Eye } from 'lucide-react';

export type DesignCategory = 'residential' | 'commercial' | 'landscape' | 'institutional' | 'interior';

interface Props {
  result: SiteAnalysisResult | null;
  loading: boolean;
  category: DesignCategory;
  onShare: () => void;
  layoutMode?: 'bento' | 'split';
  activeToolFilter?: string | null;
  onSelectPresetLocation?: (lat: number, lon: number, name: string) => void;
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 sm:p-10 max-w-7xl mx-auto">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10 animate-pulse space-y-4">
        <div className="h-6 bg-white/10 rounded-lg w-1/3" />
        <div className="h-36 bg-white/5 rounded-2xl" />
        <div className="h-4 bg-white/10 rounded-lg w-2/3" />
      </div>
    ))}
  </div>
);

export const AnalysisPanel: React.FC<Props> = ({
  result,
  loading,
  category,
  onShare,
  layoutMode = 'bento',
  activeToolFilter,
  onSelectPresetLocation,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(activeToolFilter || 'all');

  if (!result && !loading) {
    return (
      <div className="p-8 sm:p-12 bg-[#161616] text-white rounded-3xl border border-white/10 shadow-2xl max-w-4xl mx-auto my-8 text-center backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-[#CCFF00] text-black font-black text-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
          <MapPin size={32} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] bg-[#CCFF00]/10 px-3.5 py-1 rounded-full border border-[#CCFF00]/20 inline-block mb-3">
          Interactive Site Intelligence
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
          Drop a Pin on 3D Globe to Begin Analysis
        </h3>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
          Click anywhere on the 3D globe above or search an address to generate 11+ high-precision architectural site diagrams.
        </p>

        {/* Preset Locations Quick Buttons */}
        <div className="mb-8 pt-4 border-t border-white/10">
          <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Try Sample Global Locations:</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              { name: 'Vadodara, India', lat: 22.3072, lon: 73.1812 },
              { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
              { name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
              { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 },
              { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 }
            ].map(loc => (
              <button
                key={loc.name}
                onClick={() => onSelectPresetLocation && onSelectPresetLocation(loc.lat, loc.lon, loc.name)}
                className="bg-white/5 hover:bg-[#CCFF00] text-gray-300 hover:text-black text-xs font-bold px-4 py-2 rounded-2xl border border-white/10 transition cursor-pointer flex items-center gap-1.5"
              >
                <MapPin size={13} /> {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Available Modules Badges */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {['☀️ Solar path 3D', '💨 Wind rose vectors', '🧱 SoilGrids composition', '🏢 Urban context density', '🌿 Bioclimatic strategies', '🌡️ Thermal comfort'].map(f => (
            <span key={f} className="text-xs font-semibold bg-white/5 text-gray-300 px-3.5 py-1.5 rounded-full border border-white/10">
              {f}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;

  const r = result!;

  const allCardsMap: Record<string, { title: string; element: React.ReactNode }> = {
    'solar': { title: '3D Solar Path & SunCalc', element: <SolarCard key="solar" data={r.solar} lat={r.location.lat} /> },
    'wind': { title: 'Wind Rose & Airflow Vectors', element: <WindRoseCard key="wind" data={r.wind_rose} /> },
    'soil': { title: 'SoilGrids Geotechnical Profile', element: <SoilCard key="soil" data={r.soil} /> },
    'urban': { title: 'Urban Fabric & Density', element: <UrbanFabricCard key="urban" data={r.urban} /> },
    'climate': { title: 'Köppen Climate Classification', element: <ClimateCard key="climate" data={r.climate} /> },
    'thermal': { title: 'Thermal Comfort & Degree Days', element: <ThermalCard key="thermal" data={r.thermal} /> },
    'rain': { title: 'Hydrology & Rainwater Catchment', element: <RainfallCard key="rain" data={r.climate} /> },
    'orientation': { title: 'Optimal Building Orientation', element: <OrientationCard key="orientation" data={r.solar} lat={r.location.lat} /> },
    'bioclimate': { title: 'Bioclimatic Passive Matrix', element: <BioclimateCard key="bioclimate" data={r.climate} /> },
    'topo': { title: 'Topography Elevation & Slopes', element: <TopographyCard key="topo" elevation={r.elevation_m} lat={r.location.lat} lon={r.location.lon} /> },
  };

  const getFilteredCards = () => {
    if (selectedFilter === 'all') {
      return Object.values(allCardsMap).map(c => c.element);
    }
    if (allCardsMap[selectedFilter]) {
      return [allCardsMap[selectedFilter].element];
    }
    return Object.values(allCardsMap).map(c => c.element);
  };

  return (
    <div className="analysis-panel p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">

      {/* Location Header Banner (High-contrast Dark Surface) */}
      <div className="bg-[#181818] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-1 rounded-full border border-[#CCFF00]/30">
              Site Intelligence Active
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Category: {category}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{r.place_name}</h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            {r.location.lat.toFixed(4)}° N, {r.location.lon.toFixed(4)}° E · Elevation: {r.elevation_m}m AMSL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="bg-[#CCFF00] hover:bg-white text-black font-extrabold text-xs px-5 py-3 rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
            onClick={onShare}
          >
            <Share2 size={15} /> Share Executive Report
          </button>
        </div>
      </div>

      {/* MODULAR TOOL FILTER BAR (Specific Tool View vs Full Suite) */}
      <div className="bg-[#141414] p-3 rounded-2xl border border-white/10 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 px-2 flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal size={14} className="text-[#CCFF00]" /> Tool Focus:
          </span>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'all' ? 'bg-[#CCFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            All 11+ Site Diagrams
          </button>
          {[
            { id: 'solar', label: '☀️ Solar Path' },
            { id: 'wind', label: '💨 Wind Rose' },
            { id: 'soil', label: '🧱 SoilGrids' },
            { id: 'urban', label: '🏢 Urban Context' },
            { id: 'bioclimate', label: '🌿 Bioclimate' },
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => setSelectedFilter(tool.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedFilter === tool.id ? 'bg-[#CCFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>

        {selectedFilter !== 'all' && (
          <button
            onClick={() => setSelectedFilter('all')}
            className="text-xs font-bold text-[#CCFF00] hover:underline flex items-center gap-1 shrink-0 px-2"
          >
            <Eye size={13} /> View All 11+ Diagrams
          </button>
        )}
      </div>

      {/* Bento Grid layout for cards */}
      <div className={layoutMode === 'bento' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-6'}>
        {getFilteredCards()}
      </div>

    </div>
  );
};
