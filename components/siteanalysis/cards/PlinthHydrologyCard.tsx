// components/siteanalysis/cards/PlinthHydrologyCard.tsx — Plinth Height & Flood Hydrology Engineering Card
import React from 'react';
import type { PlinthHydrologyData } from '../../../services/siteAnalysisService';
import { Droplets, ShieldCheck, AlertTriangle, Waves, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface Props {
  data: PlinthHydrologyData;
}

export const PlinthHydrologyCard: React.FC<Props> = ({ data }) => {
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Severe':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><AlertTriangle size={11} /> Severe Flood Risk</span>;
      case 'High':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1"><AlertTriangle size={11} /> High Waterlogging</span>;
      case 'Moderate':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1"><Waves size={11} /> Moderate Runoff</span>;
      default:
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><ShieldCheck size={11} /> Low Flood Risk</span>;
    }
  };

  return (
    <div className="analysis-card bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5 text-gray-900">
      
      {/* Header */}
      <div className="card-header flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="card-icon text-2xl p-2.5 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center">
            <Droplets size={22} />
          </span>
          <div>
            <h3 className="card-title text-base font-bold text-gray-900">Plinth Level & Flood Hydrology</h3>
            <p className="card-subtitle text-xs text-gray-500 font-normal">
              Finished floor elevation above road datum & monsoon runoff safety
            </p>
          </div>
        </div>
        {getRiskBadge(data.waterlogging_risk)}
      </div>

      {/* Main Plinth Metric Callout */}
      <div className="p-5 bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white rounded-2xl border border-gray-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#CCFF00] flex items-center gap-1 mb-1">
            <ArrowUpRight size={12} /> Recommended Finished Plinth Level
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              +{data.recommended_plinth_mm} mm
            </span>
            <span className="text-sm font-semibold text-[#CCFF00]">
              {data.recommended_plinth_inches}
            </span>
          </div>
          <p className="text-[11px] text-gray-300 mt-1 font-normal">
            Measured above the highest crowned centerline of the adjacent municipal road.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 shrink-0 text-left sm:text-right">
          <p className="text-[10px] text-gray-300 font-medium">Recharge Pit Sizing</p>
          <p className="text-lg font-bold text-[#CCFF00]">{data.recharge_pit_vol_m3} m³</p>
          <p className="text-[9px] text-gray-400">Min bioswale capacity</p>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="metric-grid grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <span className="metric-value block text-base font-bold text-gray-900">{data.peak_monthly_rain_mm}mm</span>
          <span className="metric-label block text-[10px] text-gray-500 font-medium mt-0.5">Peak Month Rain</span>
        </div>
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <span className="metric-value block text-base font-bold text-gray-900">{Math.round(data.surface_runoff_factor * 100)}%</span>
          <span className="metric-label block text-[10px] text-gray-500 font-medium mt-0.5">Runoff Coeff (C)</span>
        </div>
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center col-span-2">
          <span className="metric-value block text-xs font-bold text-gray-900 truncate">{data.soil_infiltration_rate}</span>
          <span className="metric-label block text-[10px] text-gray-500 font-medium mt-0.5">Soil Infiltration Rate</span>
        </div>
      </div>

      {/* Engineering Specs */}
      <div className="space-y-2.5 pt-1">
        <div className="recommendation-box p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
          <span className="rec-icon text-lg">🧱</span>
          <div>
            <p className="rec-title text-xs font-bold text-gray-900">Damp Proof Course (DPC) Engineering Spec</p>
            <p className="rec-text text-[11px] text-gray-600 font-normal leading-relaxed mt-0.5">{data.dpc_specification}</p>
          </div>
        </div>

        <div className="recommendation-box p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
          <span className="rec-icon text-lg">🌊</span>
          <div>
            <p className="rec-title text-xs font-bold text-gray-900">Hydrological Justification</p>
            <p className="rec-text text-[11px] text-gray-600 font-normal leading-relaxed mt-0.5">{data.rationale}</p>
          </div>
        </div>
      </div>

      <div className="source-badge text-[10px] text-gray-400 flex items-center gap-2 pt-1 border-t border-gray-100">
        <span>📡 Open-Meteo Precipitation Archive</span>
        <span>·</span>
        <span>ISRIC Soil Permeability Index</span>
        <span>·</span>
        <span>IS 1904 &amp; National Building Code</span>
      </div>
    </div>
  );
};
