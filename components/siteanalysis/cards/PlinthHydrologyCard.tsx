// components/siteanalysis/cards/PlinthHydrologyCard.tsx — Architectural Plinth Benchmark & Flood Hydrology Card
import React from 'react';
import type { PlinthHydrologyData } from '../../../services/siteAnalysisService';
import { Droplets, ShieldCheck, AlertTriangle, Waves, ArrowUpRight, CloudRain, Layers } from 'lucide-react';

interface Props {
  data: PlinthHydrologyData;
}

export const PlinthHydrologyCard: React.FC<Props> = ({ data }) => {
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Severe':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
            <AlertTriangle size={11} /> Severe Flood Risk
          </span>
        );
      case 'High':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <AlertTriangle size={11} /> High Waterlogging
          </span>
        );
      case 'Moderate':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Waves size={11} /> Moderate Runoff
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck size={11} /> Low Flood Risk
          </span>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Droplets size={22} />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900">Plinth Level &amp; Flood Hydrology</h3>
              <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                🔴 Provisional Model Estimate
              </span>
            </div>
            <p className="text-xs text-gray-500 font-normal">
              Provisional FFL benchmark &amp; design storm retention (Field topographic survey mandatory)
            </p>
          </div>
        </div>
        {getRiskBadge(data.waterlogging_risk)}
      </div>

      {/* Main Plinth Metric Callout — Styled in Studio Slate & Blue Architectural Aesthetic */}
      <div className="p-5 bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-50/50 rounded-2xl border border-blue-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5 mb-1.5">
            <ArrowUpRight size={13} className="text-blue-600" /> Suggested Finished Plinth Level (Provisional)
          </span>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              +{data.recommended_plinth_mm} mm
            </span>
            <span className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-100/90 border border-blue-200 px-2.5 py-0.5 rounded-lg">
              {data.recommended_plinth_inches} ({((data.recommended_plinth_mm || 900) / 1000).toFixed(2)}m)
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5 font-normal leading-relaxed">
            Suggested benchmark above local road crown. Final FFL must be referenced to surveyed site datum &amp; High Flood Level (HFL).
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-blue-200/90 shadow-2xs shrink-0 text-left sm:text-right">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">50mm Storm Detention</p>
          <p className="text-xl sm:text-2xl font-black text-blue-700">{data.storm_detention_m3_per_100m2 || 4.3} m³</p>
          <p className="text-[9px] text-slate-500 font-medium">per 100m² catchment area</p>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-sm font-bold text-slate-900 block">{data.peak_monthly_rain_mm}mm</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Peak Month Rain</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-sm font-bold text-slate-900 block">{Math.round(data.surface_runoff_factor * 100)}%</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Runoff Coeff (C)</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-sm font-bold text-slate-900 block">~{data.harvest_liters_per_m2_annual || 850} L</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Harvest / m² / yr</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-xs font-bold text-slate-900 block truncate">{data.soil_infiltration_rate}</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Infiltration Speed</span>
        </div>
      </div>

      {/* Engineering Specs */}
      <div className="space-y-2.5 pt-1">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
          <Layers size={18} className="text-slate-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-900">Damp Proof Course (DPC) Engineering Spec</p>
            <p className="text-[11px] text-slate-600 font-normal leading-relaxed mt-0.5">{data.dpc_specification}</p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
          <CloudRain size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-900">Hydrological Rationale &amp; Drainage</p>
            <p className="text-[11px] text-slate-600 font-normal leading-relaxed mt-0.5">{data.rationale}</p>
          </div>
        </div>
      </div>

      {/* Footer Provenance */}
      <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>📡 Open-Meteo Precipitation Archive · ISRIC Soil Permeability Index</span>
        <span className="font-semibold text-slate-600">IS 1904 &amp; NBC Hydrology Sizing</span>
      </div>
    </div>
  );
};
