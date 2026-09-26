// components/siteanalysis/cards/SoilCard.tsx
import React from 'react';
import type { SoilData } from '../../../services/siteAnalysisService';
import { Layers, ShieldAlert } from 'lucide-react';

interface Props { data: SoilData; }

export const SoilCard: React.FC<Props> = ({ data }) => {
  const phColor = data.ph < 5.5 ? '#ef4444' : data.ph > 7.5 ? '#f97316' : '#10b981';
  const phLabel = data.ph < 5.5 ? 'Acidic' : data.ph > 7.5 ? 'Alkaline' : 'Neutral';

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">Soil &amp; Geotechnical Profile</h3>
              <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                SoilGrids 250m
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-normal">
              Particle fractions &amp; foundation suitability model
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black block" style={{ color: phColor }}>{data.ph}</span>
          <span className="text-[10px] text-slate-500 font-medium block">pH ({phLabel})</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">{data.organic_carbon}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Carbon (g/kg)</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">{data.bulk_density}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Bulk Density</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-xs font-black text-slate-900 block truncate">{data.soil_texture}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Texture</span>
        </div>
      </div>

      {/* Soil composition bar */}
      <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="flex justify-between items-center text-[10px] text-slate-600 font-semibold">
          <span>Soil Particle Fractions</span>
          <span className="text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded font-bold">
            Erosion: {data.topsoil_erosion_risk || 'Moderate'}
          </span>
        </div>
        <div className="flex h-3.5 rounded-lg overflow-hidden gap-0.5 bg-slate-200">
          <div style={{ width: `${data.clay_pct}%` }} className="bg-purple-500 rounded-sm" title={`Clay: ${data.clay_pct}%`} />
          <div style={{ width: `${data.silt_pct}%` }} className="bg-teal-500 rounded-sm" title={`Silt: ${data.silt_pct}%`} />
          <div style={{ width: `${data.sand_pct}%` }} className="bg-amber-400 rounded-sm" title={`Sand: ${data.sand_pct}%`} />
        </div>
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-medium pt-0.5">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Clay {data.clay_pct}%</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Silt {data.silt_pct}%</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Sand {data.sand_pct}%</span>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px]">
        <p className="font-bold text-slate-900">Foundation Engineering Consideration</p>
        <p className="text-slate-600 leading-snug font-normal">{data.foundation_suitability}</p>
      </div>

      <div className="text-[9px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>📡 ISRIC SoilGrids 250m Global Model</span>
        <span>Laboratory Borehole Mandatory</span>
      </div>
    </div>
  );
};
