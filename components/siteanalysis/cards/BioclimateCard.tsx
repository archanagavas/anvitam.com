// components/siteanalysis/cards/BioclimateCard.tsx
import React from 'react';
import type { ClimateData } from '../../../services/siteAnalysisService';
import { Leaf, CheckCircle2 } from 'lucide-react';

interface Props { data: ClimateData; }

const ZONE_COLORS: Record<string, string> = {
  Af: '#065f46', Am: '#047857', Aw: '#059669',
  BWh: '#92400e', BSh: '#b45309',
  Cs: '#1d4ed8', Cf: '#2563eb',
  Df: '#1e40af', ET: '#374151', Cwb: '#166534',
};

export const BioclimateCard: React.FC<Props> = ({ data }) => {
  const zoneColor = ZONE_COLORS[data.koppen_zone] || '#059669';

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Leaf size={18} />
          </span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">Bioclimatic Passive Matrix</h3>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200">
                Eco-Design
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-normal">
              Köppen zone &amp; passive energy conservation
            </p>
          </div>
        </div>
      </div>

      {/* Zone Callout */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center gap-3.5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shrink-0 shadow-2xs"
          style={{ backgroundColor: zoneColor }}
        >
          {data.koppen_zone}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gray-900 leading-tight">{data.koppen_label}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Köppen-Geiger Bioclimatic Region</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
            {data.annual_temp_avg}°C normal · {data.annual_rain_total}mm annual
          </p>
        </div>
      </div>

      {/* Passive Strategies */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Passive Ecological Interventions
        </p>
        <div className="space-y-1">
          {data.passive_strategies.slice(0, 4).map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-gray-700 bg-slate-50/70 p-2 rounded-xl border border-slate-100">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[9px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>📡 Open-Meteo Climatological Engine</span>
        <span>Passive Strategies</span>
      </div>
    </div>
  );
};
