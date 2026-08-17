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
      <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200/80 animate-pulse space-y-4 shadow-xs">
        <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
        <div className="h-36 bg-gray-100 rounded-2xl" />
        <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
      </div>
    ))}
  </div>
);

export const AnalysisPanel: React.FC<Props> = ({
  result,
  loading,
  category,
  onShare,
  activeToolFilter,
  onSelectPresetLocation,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(activeToolFilter || 'all');

  if (!result && !loading) {
    return (
      <div className="p-8 sm:p-12 bg-white text-gray-900 rounded-3xl border border-gray-200/80 shadow-xs max-w-4xl mx-auto my-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-black text-[#CCFF00] font-bold text-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
          <MapPin size={32} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-3.5 py-1 rounded-full inline-block mb-3">
          Interactive Site Intelligence
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          Drop a Pin on 3D Map to Begin Analysis
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed font-normal">
          Click anywhere on the 3D map above or search an address to generate 11+ high-precision architectural site diagrams.
        </p>

        {/* Preset Locations Quick Buttons */}
        <div className="mb-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Try Sample Global Locations:</p>
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
                className="bg-gray-100 hover:bg-black hover:text-[#CCFF00] text-gray-800 text-xs font-semibold px-4 py-2 rounded-2xl border border-gray-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <MapPin size={13} /> {loc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Available Modules Badges */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {['☀️ Solar path 3D', '💨 Wind rose vectors', '🧱 SoilGrids composition', '🏢 Urban context density', '🌿 Bioclimatic strategies', '🌡️ Thermal comfort'].map(f => (
            <span key={f} className="text-xs font-medium bg-gray-100 text-gray-700 px-3.5 py-1.5 rounded-full border border-gray-200/60">
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

      {/* Location Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-gray-900">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-3 py-1 rounded-full">
              Site Intelligence Active
            </span>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Category: {category}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{r.place_name}</h2>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            {r.location.lat.toFixed(4)}° N, {r.location.lon.toFixed(4)}° E · Elevation: {r.elevation_m}m AMSL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="bg-black hover:bg-gray-800 text-[#CCFF00] font-bold text-xs px-5 py-3 rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            onClick={onShare}
          >
            <Share2 size={15} /> Share Executive Report
          </button>
        </div>
      </div>

      {/* MODULAR TOOL FILTER BAR */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 px-2 flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal size={14} className="text-black" /> Tool Focus:
          </span>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'all' ? 'bg-black text-[#CCFF00] shadow-xs' : 'text-gray-600 hover:text-black bg-gray-100 font-normal'
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
              className={`px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer whitespace-nowrap ${
                selectedFilter === tool.id ? 'bg-black text-[#CCFF00] font-bold shadow-xs' : 'text-gray-600 hover:text-black bg-gray-100 font-normal'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>

        {selectedFilter !== 'all' && (
          <button
            onClick={() => setSelectedFilter('all')}
            className="text-xs font-bold text-black hover:underline flex items-center gap-1 shrink-0 px-2"
          >
            <Eye size={13} /> View All 11+ Diagrams
          </button>
        )}
      </div>

      {/* Grid layout for cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredCards()}
      </div>

    </div>
  );
};
