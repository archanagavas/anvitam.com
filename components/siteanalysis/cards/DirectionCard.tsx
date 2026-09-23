// components/siteanalysis/cards/DirectionCard.tsx — 8-Point Cardinal Orientation & Spatial Planning Card
import React, { useState } from 'react';
import type { CardinalDirectionData, DesignCategory } from '../../../services/siteAnalysisService';
import { Compass, Sun, Wind, Eye, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  data: CardinalDirectionData;
  category: DesignCategory;
}

export const DirectionCard: React.FC<Props> = ({ data, category }) => {
  const [selectedDir, setSelectedDir] = useState<string>('N');

  const activeSector = data.sectors.find(s => s.dir === selectedDir) || data.sectors[0];

  const getGlareBadge = (risk: string) => {
    switch (risk) {
      case 'Severe':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><ShieldAlert size={10} /> Severe Glare</span>;
      case 'High':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1"><Sun size={10} /> High Glare</span>;
      case 'Moderate':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1"><Eye size={10} /> Moderate</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 size={10} /> Minimal</span>;
    }
  };

  return (
    <div className="analysis-card bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5 text-gray-900">
      
      {/* Header */}
      <div className="card-header flex items-start gap-3">
        <span className="card-icon text-2xl p-2.5 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center">
          <Compass size={22} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="card-title text-base font-bold text-gray-900">Cardinal Direction & Space Zoning</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-2.5 py-0.5 rounded-full">
              {category}
            </span>
          </div>
          <p className="card-subtitle text-xs text-gray-500 font-normal">
            8-point orientation physics, direct sun exposure & architectural space layout
          </p>
        </div>
      </div>

      {/* 8-Direction Compass Selector Buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
        {data.sectors.map(sector => (
          <button
            key={sector.dir}
            type="button"
            onClick={() => setSelectedDir(sector.dir)}
            className={`py-2 px-1 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
              selectedDir === sector.dir
                ? 'bg-black text-[#CCFF00] font-bold shadow-xs scale-102'
                : 'bg-white text-gray-700 hover:bg-gray-200/70 border border-gray-100 font-medium'
            }`}
          >
            <span className="text-xs font-bold leading-tight">{sector.dir}</span>
            <span className="text-[9px] opacity-75">{sector.azimuth}°</span>
          </button>
        ))}
      </div>

      {/* Active Sector Deep Dive */}
      <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/70 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gray-200/60">
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <span>{activeSector.label} Sector</span>
              <span className="text-xs font-mono text-gray-400 font-normal">({activeSector.azimuth}° Azimuth)</span>
            </h4>
            <p className="text-[11px] text-gray-600 font-medium mt-0.5">{activeSector.radiation_index}</p>
          </div>
          {getGlareBadge(activeSector.glare_risk)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-white rounded-xl border border-gray-200/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Sun size={11} className="text-amber-500" /> Direct Sun Hours
            </span>
            <p className="font-semibold text-gray-800">{activeSector.sun_hours}</p>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-gray-200/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Wind size={11} className="text-sky-500" /> Breeze & Microclimate
            </span>
            <p className="font-semibold text-gray-800 leading-snug">{activeSector.wind_influence}</p>
          </div>
        </div>

        {/* Typology Specific Room / Functional Recommendation */}
        <div className="p-3 bg-white rounded-xl border border-gray-200/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-2 py-0.5 rounded-md inline-block">
            Recommended {category.charAt(0).toUpperCase() + category.slice(1)} Layout
          </span>
          <p className="text-xs text-gray-800 font-medium leading-relaxed mt-1">
            {activeSector.typology_guidance}
          </p>
        </div>
      </div>

      {/* Global Glazing & Shading Summary Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="recommendation-box p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-2.5">
          <span className="rec-icon text-base">📐</span>
          <div>
            <p className="rec-title text-xs font-bold text-gray-900">Optimal Axis</p>
            <p className="rec-text text-[11px] text-gray-600 font-normal leading-relaxed">{data.optimal_facade}</p>
          </div>
        </div>
        <div className="recommendation-box p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-2.5">
          <span className="rec-icon text-base">☀️</span>
          <div>
            <p className="rec-title text-xs font-bold text-gray-900">Window-to-Wall Ratio</p>
            <p className="rec-text text-[11px] text-gray-600 font-normal leading-relaxed">{data.glazing_ratio_guide}</p>
          </div>
        </div>
      </div>

      <div className="source-badge text-[10px] text-gray-400 flex items-center gap-2 pt-1 border-t border-gray-100">
        <span>🧭 SunCalc Azimuth Vectoring</span>
        <span>·</span>
        <span>Bioclimatic Orientation Principles</span>
      </div>
    </div>
  );
};
