// components/siteanalysis/cards/SoilCard.tsx
import React from 'react';
import type { SoilData } from '../../../services/siteAnalysisService';

interface Props { data: SoilData; }

export const SoilCard: React.FC<Props> = ({ data }) => {
  const phColor = data.ph < 5.5 ? '#ef4444' : data.ph > 7.5 ? '#f97316' : '#22c55e';
  const phLabel = data.ph < 5.5 ? 'Acidic' : data.ph > 7.5 ? 'Alkaline' : 'Neutral';

  return (
    <div className="analysis-card bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 text-gray-900">
      <div className="card-header flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="card-icon text-2xl p-2.5 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center">
            🌍
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="card-title text-base font-bold text-gray-900">Soil &amp; Geotechnical Profile</h3>
              <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                🔴 Regional Model Estimate
              </span>
            </div>
            <p className="card-subtitle text-xs text-gray-500">ISRIC SoilGrids 250m global model (Laboratory soil sample mandatory)</p>
          </div>
        </div>
      </div>
      <div className="metric-grid grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-base font-bold" style={{ color: phColor }}>{data.ph}</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">pH — {phLabel}</span>
        </div>
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-base font-bold">{data.organic_carbon} g/kg</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">Organic Carbon</span>
        </div>
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-base font-bold">{data.bulk_density} kg/m³</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">Bulk Density</span>
        </div>
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-base font-bold">{data.soil_texture}</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">Texture (Model)</span>
        </div>
      </div>

      {/* Soil composition bar */}
      <div className="mt-3">
        <div className="flex justify-between items-center text-[11px] text-gray-500 font-semibold mb-1.5">
          <span>Soil Particle Fractions</span>
          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.2 rounded-md">Topsoil Erosion Risk: {data.topsoil_erosion_risk || 'Moderate'}</span>
        </div>
        <div className="flex h-5 rounded-lg overflow-hidden gap-0.5 bg-gray-100 p-0.5 border border-gray-200">
          <div style={{ width: `${data.clay_pct}%` }} className="bg-purple-400 rounded-sm flex items-center justify-center">
            {data.clay_pct > 10 && <span className="text-[9px] text-white font-bold">Clay {data.clay_pct}%</span>}
          </div>
          <div style={{ width: `${data.silt_pct}%` }} className="bg-teal-400 rounded-sm flex items-center justify-center">
            {data.silt_pct > 10 && <span className="text-[9px] text-gray-900 font-bold">Silt {data.silt_pct}%</span>}
          </div>
          <div style={{ width: `${data.sand_pct}%` }} className="bg-amber-300 rounded-sm flex items-center justify-center">
            {data.sand_pct > 10 && <span className="text-[9px] text-gray-900 font-bold">Sand {data.sand_pct}%</span>}
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="recommendation-box p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-2.5">
          <span className="rec-icon text-base">🏗️</span>
          <div>
            <p className="rec-title text-xs font-bold text-gray-900">Foundation Engineering Consideration</p>
            <p className="rec-text text-[11px] text-gray-600 leading-relaxed">{data.foundation_suitability}</p>
          </div>
        </div>
        <div className="recommendation-box p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-2.5">
          <span className="rec-icon text-base">🌿</span>
          <div>
            <p className="rec-title text-xs font-bold text-gray-900">Landscape &amp; Planting Compatibility</p>
            <p className="rec-text text-[11px] text-gray-600 leading-relaxed">{data.agriculture_potential}</p>
          </div>
        </div>
      </div>

      <div className="source-badge text-[10px] text-gray-400 flex items-center gap-2 pt-2 border-t border-gray-100">
        <span>📡 ISRIC SoilGrids v2.0 (250m global raster)</span>
        <span>·</span>
        <span>Confidence: Low / Modeled Estimate</span>
        <span>·</span>
        <span>Lab sample testing required</span>
      </div>
    </div>
  );
};
