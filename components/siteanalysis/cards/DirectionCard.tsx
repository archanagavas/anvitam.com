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
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><ShieldAlert size={10} /> Severe Glare</span>;
      case 'High':
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1"><Sun size={10} /> High Glare</span>;
      case 'Moderate':
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1"><Eye size={10} /> Moderate</span>;
      default:
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 size={10} /> Minimal</span>;
    }
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="p-2 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center shrink-0">
            <Compass size={18} />
          </span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">Cardinal Direction &amp; Space Zoning</h3>
              <span className="text-[9px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-2 py-0.5 rounded-full">
                {category}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-normal">
              8-point orientation physics &amp; space layout
            </p>
          </div>
        </div>
      </div>

      {/* 8-Direction Compass Selector Buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
        {data.sectors.map(sector => (
          <button
            key={sector.dir}
            type="button"
            onClick={() => setSelectedDir(sector.dir)}
            className={`py-1.5 px-1 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
              selectedDir === sector.dir
                ? 'bg-black text-[#CCFF00] font-bold shadow-2xs scale-102'
                : 'bg-white text-gray-700 hover:bg-slate-200/80 border border-slate-200/50 font-medium'
            }`}
          >
            <span className="text-[11px] font-bold leading-tight">{sector.dir}</span>
            <span className="text-[8px] opacity-75">{sector.azimuth}°</span>
          </button>
        ))}
      </div>

      {/* Active Sector Deep Dive */}
      <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-slate-200/60">
          <div>
            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <span>{activeSector.label} Sector</span>
              <span className="text-[10px] font-mono text-gray-400 font-normal">({activeSector.azimuth}° Azimuth)</span>
            </h4>
            <p className="text-[10px] text-gray-600 font-medium mt-0.5">{activeSector.radiation_index}</p>
          </div>
          {getGlareBadge(activeSector.glare_risk)}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-white rounded-xl border border-slate-200/60 space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Sun size={10} className="text-amber-500" /> Direct Sun
            </span>
            <p className="font-semibold text-gray-800 text-[11px] truncate">{activeSector.sun_hours}</p>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200/60 space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Wind size={10} className="text-sky-500" /> Airflow
            </span>
            <p className="font-semibold text-gray-800 text-[11px] truncate">{activeSector.wind_influence}</p>
          </div>
        </div>

        {/* Typology Specific Room Recommendation */}
        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-1.5 py-0.2 rounded inline-block">
            Recommended {category.charAt(0).toUpperCase() + category.slice(1)} Layout
          </span>
          <p className="text-[11px] text-gray-800 font-medium leading-relaxed mt-0.5">
            {activeSector.typology_guidance}
          </p>
        </div>
      </div>

      {/* Global Glazing & Shading Summary Rules */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Optimal Axis</p>
          <p className="text-[11px] text-gray-900 font-semibold truncate">{data.optimal_facade}</p>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Glazing Ratio</p>
          <p className="text-[11px] text-gray-900 font-semibold truncate">{data.glazing_ratio_guide}</p>
        </div>
      </div>

      <div className="text-[9px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>🧭 SunCalc Azimuth Vectoring</span>
        <span>Bioclimatic Principles</span>
      </div>
    </div>
  );
};
