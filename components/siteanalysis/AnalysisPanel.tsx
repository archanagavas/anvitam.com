// components/siteanalysis/AnalysisPanel.tsx — Master Architectural Analysis Grid with 14+ Analytical Cards
import React, { useState } from 'react';
import type { SiteAnalysisResult, DesignCategory } from '../../services/siteAnalysisService';
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
import { DirectionCard } from './cards/DirectionCard';
import { PlinthHydrologyCard } from './cards/PlinthHydrologyCard';
import { SwotCard } from './cards/SwotCard';
import { ContextualCard } from './cards/ContextualCard';
import { MapPin, Share2, Sparkles, SlidersHorizontal, Eye, Download, Printer, FileText, Check } from 'lucide-react';

export type { DesignCategory };

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
  const [prdExported, setPrdExported] = useState(false);

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
          Click anywhere on the 3D map above or search an address to generate 14+ high-precision architectural site diagrams tailored for {category} development.
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
          {['🧭 Direction & Space Zoning', '🌊 Plinth Level & Hydrology', '📊 SWOT Matrix', '🗺️ Spatial Neighborhood POIs', '☀️ Solar Path 3D', '💨 Wind Rose', '🧱 SoilGrids', '🏢 Urban Fabric', '🌡️ Thermal Comfort'].map(f => (
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

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportPRDDossier = () => {
    const prdContent = `# Architectural & Ecological Site Intelligence PRD Dossier
**Project Location**: ${r.place_name}
**Coordinates**: ${r.location.lat.toFixed(4)}° N, ${r.location.lon.toFixed(4)}° E
**Elevation**: ${r.elevation_m}m AMSL
**Typology Target**: ${category.toUpperCase()}
**Generated by**: Anvitam Studio Site Intelligence Engine
**Date**: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---

## 1. Executive Summary & Recommended Strategy
- **Primary Climate Zone**: ${r.climate?.koppen_code || 'Aw'} (${r.climate?.climate_description || 'Tropical Savanna / Composite'})
- **Recommended Finished Plinth Level**: +${r.plinth_hydrology?.recommended_plinth_mm || 1050} mm (${r.plinth_hydrology?.recommended_plinth_inches || 41}") above road datum
- **Hydrological Risk Assessment**: ${r.plinth_hydrology?.flood_risk_level || 'Moderate'} | Peak Rain: ${r.plinth_hydrology?.peak_month_rainfall_mm || 398} mm
- **Optimal Building Axis**: ${r.direction?.optimal_building_axis || 'East-West longitudinal (glazing North & South)'}
- **Green Canopy & Surrounding Fabric**: ${r.contextual?.green_cover_pct || 28}% vegetation cover | ${r.contextual?.tree_canopy_density || 'Medium Canopy'}

---

## 2. Cardinal Direction & Spatial Layout Zoning
- **North Sector (0°)**: Direct Sun: ${r.direction?.sectors?.[0]?.sun_hours || '0-1 hrs'} | Layout: ${r.direction?.sectors?.[0]?.recommended_spaces || 'Quiet studios, library, shaded workspaces'}
- **East Sector (90°)**: Direct Sun: ${r.direction?.sectors?.[2]?.sun_hours || '3-4 hrs'} | Layout: ${r.direction?.sectors?.[2]?.recommended_spaces || 'Morning spaces, breakfast terraces, early activity zones'}
- **South Sector (180°)**: Direct Sun: ${r.direction?.sectors?.[4]?.sun_hours || '5-7 hrs'} | Layout: ${r.direction?.sectors?.[4]?.recommended_spaces || 'Solar active zones, deep shading cantilevers required'}
- **West Sector (270°)**: Direct Sun: ${r.direction?.sectors?.[6]?.sun_hours || '4-5 hrs'} | Layout: ${r.direction?.sectors?.[6]?.recommended_spaces || 'Service buffers, thermal mass staircase, minimal glazing'}

---

## 3. Plinth Level & Hydrology Engineering Specifications
- **Finished Plinth Elevation**: +${r.plinth_hydrology?.recommended_plinth_mm || 1050} mm
- **Damp Proof Course (DPC)**: ${r.plinth_hydrology?.dpc_spec || '50mm thick M20 concrete DPC with 2 coats elastomeric SBS bitumen'}
- **Rainwater Recharge Pit Sizing**: ${r.plinth_hydrology?.min_recharge_pit_volume_m3 || 20.3} m³ minimum bioswale retention
- **Soil Infiltration Rate**: ${r.plinth_hydrology?.soil_infiltration_rate || 'Slow (< 0.8 cm/hr)'}

---

## 4. Architectural SWOT Synthesis (${category.toUpperCase()})
### Strengths:
${r.swot?.strengths?.map(s => `- **${s.title}** (${s.tag}): ${s.desc}`).join('\n') || '- Favorable solar orientation'}

### Weaknesses:
${r.swot?.weaknesses?.map(w => `- **${w.title}** (${w.tag}): ${w.desc}`).join('\n') || '- High afternoon solar heat gain on west facade'}

### Opportunities:
${r.swot?.opportunities?.map(o => `- **${o.title}** (${o.tag}): ${o.desc}`).join('\n') || '- Rooftop solar harvesting and rainwater bioswales'}

### Threats:
${r.swot?.threats?.map(t => `- **${t.title}** (${t.tag}): ${t.desc}`).join('\n') || '- Urban heat island and storm runoff'}

---

## 5. Contextual Spatial Neighborhood
- **Surrounding Settlements**: ${r.contextual?.settlement_type || 'Mixed Urban / Semi-Urban'}
- **Transit & Rail Connectivity**: ${r.contextual?.transit_connections || 'Connected to main arterial roads'}
- **Civic Amenities within 1km**: ${r.contextual?.key_amenities?.join(', ') || 'Local markets, healthcare, schools'}
- **Water Bodies & Ecology**: ${r.contextual?.water_bodies_proximity || 'Municipal storm drainage network'}

---
*Anvitam Ecological Design & Architectural Intelligence Studio · www.anvitam.com*
`;

    const blob = new Blob([prdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (r.place_name || 'Site').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${cleanName}_Architectural_PRD_Report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPrdExported(true);
    setTimeout(() => setPrdExported(false), 2500);
  };

  // Harmoniously ordered Bento Grid cards to eliminate all column whitespace voids:
  // Row 1: direction (1) + plinth (1) + solar (1) = 3 cols
  // Row 2: swot (2) + wind (1) = 3 cols
  // Row 3: contextual (2) + climate (1) = 3 cols
  // Row 4: soil (1) + thermal (1) + rain (1) = 3 cols
  // Row 5: urban (1) + orientation (1) + bioclimate (1) = 3 cols
  // Row 6: topo (1)
  const allCardsMap: Record<string, { title: string; element: React.ReactNode }> = {
    'direction': { title: 'Cardinal Direction & Space Layout', element: <DirectionCard key="direction" data={r.direction} category={category} /> },
    'plinth': { title: 'Plinth Level & Flood Hydrology', element: <PlinthHydrologyCard key="plinth" data={r.plinth_hydrology} /> },
    'solar': { title: '3D Solar Path & SunCalc', element: <SolarCard key="solar" data={r.solar} lat={r.location.lat} /> },
    'swot': { title: 'Architectural SWOT Matrix', element: <SwotCard key="swot" data={r.swot} category={category} /> },
    'wind': { title: 'Wind Rose & Airflow Vectors', element: <WindRoseCard key="wind" data={r.wind_rose} /> },
    'contextual': { title: 'Contextual Neighborhood Ecosystem', element: <ContextualCard key="contextual" data={r.contextual} /> },
    'climate': { title: 'Köppen Climate Classification', element: <ClimateCard key="climate" data={r.climate} /> },
    'soil': { title: 'SoilGrids Geotechnical Profile', element: <SoilCard key="soil" data={r.soil} /> },
    'thermal': { title: 'Thermal Comfort & Degree Days', element: <ThermalCard key="thermal" data={r.thermal} /> },
    'rain': { title: 'Hydrology & Rainwater Catchment', element: <RainfallCard key="rain" data={r.climate} /> },
    'urban': { title: 'Urban Fabric & Density', element: <UrbanFabricCard key="urban" data={r.urban} /> },
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

      {/* Location Header Banner with 1-Click Client Export & Share */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-gray-900">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-3 py-1 rounded-full">
              Site Intelligence Active
            </span>
            <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Typology: {category}
            </span>
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              14 Diagnostic Engines
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{r.place_name}</h2>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            {r.location.lat.toFixed(4)}° N, {r.location.lon.toFixed(4)}° E · Elevation: {r.elevation_m}m AMSL
          </p>
        </div>

        {/* 1-Click Client Export, PRD Download & Share Action Cluster */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrintReport}
            className="bg-black hover:bg-gray-800 text-[#CCFF00] font-bold text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            title="Export high-resolution printable PDF report for client"
          >
            <Printer size={15} />
            <span>Download Client PDF Dossier</span>
          </button>

          <button
            onClick={handleExportPRDDossier}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs px-4 py-2.5 rounded-2xl border border-gray-200 transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            title="Download architectural site PRD specification markdown file"
          >
            {prdExported ? <Check size={15} className="text-emerald-600" /> : <FileText size={15} />}
            <span>{prdExported ? 'PRD Downloaded!' : 'Export PRD Dossier'}</span>
          </button>

          <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs px-4 py-2.5 rounded-2xl border border-gray-200 transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            onClick={onShare}
            title="Copy shareable link to clipboard"
          >
            <Share2 size={15} />
            <span>Share Link</span>
          </button>
        </div>
      </div>

      {/* MODULAR TOOL FILTER BAR */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 px-2 flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal size={14} className="text-black" /> Focus Filter:
          </span>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'all' ? 'bg-black text-[#CCFF00] shadow-xs' : 'text-gray-600 hover:text-black bg-gray-100 font-normal'
            }`}
          >
            All 14+ Site Engines
          </button>
          {[
            { id: 'direction', label: '🧭 Direction & Space' },
            { id: 'plinth', label: '🌊 Plinth & Flood' },
            { id: 'swot', label: '📊 SWOT Matrix' },
            { id: 'contextual', label: '🗺️ Neighborhood Context' },
            { id: 'solar', label: '☀️ Solar Path' },
            { id: 'wind', label: '💨 Wind Rose' },
            { id: 'soil', label: '🧱 SoilGrids' },
            { id: 'urban', label: '🏢 Urban Fabric' },
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
            className="text-xs font-bold text-black hover:underline flex items-center gap-1 shrink-0 px-2 cursor-pointer"
          >
            <Eye size={13} /> View All 14+ Diagrams
          </button>
        )}
      </div>

      {/* Grid layout for cards with dense auto-packing to prevent any blank column holes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [grid-auto-flow:dense]">
        {getFilteredCards()}
      </div>

    </div>
  );
};
