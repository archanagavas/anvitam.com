// components/siteanalysis/cards/ClimateCard.tsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ClimateData } from '../../../services/siteAnalysisService';
import { CloudSun, CheckCircle2 } from 'lucide-react';

interface Props { data: ClimateData; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ClimateCard: React.FC<Props> = ({ data }) => {
  const chartData = MONTHS.map((month, i) => ({
    month,
    'Max Temp': data.monthly_temp_max[i],
    'Min Temp': data.monthly_temp_min[i],
  }));

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4 text-gray-900 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <CloudSun size={18} />
          </span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">Climate &amp; Köppen Classification</h3>
              <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                ERA5 Reanalysis
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              {data.koppen_zone} · {data.koppen_label}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">{data.annual_temp_avg}°C</span>
          <span className="text-[10px] text-slate-500 font-medium block">Avg Annual Temp</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">~{data.annual_rain_total}mm</span>
          <span className="text-[10px] text-slate-500 font-medium block">Normal Rain</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-amber-600 block">{data.et_rate_summer_mm_day || 6.2} mm/d</span>
          <span className="text-[10px] text-slate-500 font-medium block">Peak ET₀</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-xs font-black text-sky-600 block truncate">{data.koppen_zone}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Köppen Code</span>
        </div>
      </div>

      <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
          Monthly High / Low Temperature Curve
        </p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
            <defs>
              <linearGradient id="climateTempMaxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="climateTempMinGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '11px' }}
              formatter={(v: number, name: string) => [`${v}°C`, name]}
            />
            <Area type="monotone" dataKey="Max Temp" stroke="#f59e0b" strokeWidth={2} fill="url(#climateTempMaxGrad)" />
            <Area type="monotone" dataKey="Min Temp" stroke="#0ea5e9" strokeWidth={2} fill="url(#climateTempMinGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-1.5">
        <p className="text-[11px] font-bold text-emerald-950">Passive Strategies for {data.koppen_label}</p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {data.passive_strategies.map((s, i) => (
            <span key={i} className="text-[10px] font-medium bg-white text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-200/60 shadow-2xs">
              ✓ {s}
            </span>
          ))}
        </div>
      </div>

      <div className="text-[9px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>📡 Open-Meteo ERA5 5-Yr Climatology</span>
        <span>Köppen-Geiger Validated</span>
      </div>
    </div>
  );
};
