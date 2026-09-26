// components/siteanalysis/cards/ThermalCard.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ThermalComfortData } from '../../../services/siteAnalysisService';
import { Thermometer } from 'lucide-react';

interface Props { data: ThermalComfortData; }
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const ThermalCard: React.FC<Props> = ({ data }) => {
  const chartData = MONTHS.map((month, i) => ({
    month,
    Comfortable: Math.round(data.monthly_comfortable_hours[i] / 24),
    Hot: Math.round(data.monthly_hot_hours[i] / 24),
    Cold: Math.round(data.monthly_cold_hours[i] / 24),
  }));

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Thermometer size={18} />
          </span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">Thermal Comfort &amp; Degree Days</h3>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Givoni Model
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-normal">
              Comfortable, hot &amp; cold days per month
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-emerald-600 block">{data.annual_comfortable_pct}%</span>
          <span className="text-[10px] text-slate-500 font-medium block">Comfortable Hrs</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">{data.cooling_degree_days}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Cooling DD</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">{data.heating_degree_days}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Heating DD</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-xs font-black text-slate-900 block truncate">{data.passive_cooling_viable ? '✅ Viable' : '⚠️ Limited'}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Passive Cooling</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
          Monthly Days: Comfortable (Green), Hot (Rose), Cold (Blue)
        </p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '11px' }} formatter={(v: number, name: string) => [`${v} days`, name]} />
            <Bar dataKey="Comfortable" stackId="a" fill="#10b981" />
            <Bar dataKey="Hot" stackId="a" fill="#f87171" />
            <Bar dataKey="Cold" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 leading-snug">
        <p className="font-bold text-slate-900 mb-0.5">Passive Comfort Strategy</p>
        {data.passive_cooling_viable
          ? 'Passive design can achieve comfort for most of the year. Prioritise cross-ventilation, thermal mass, and summer shading.'
          : 'Significant thermal extremes. Combine passive thermal mass with high-performance roof insulation.'}
      </div>

      <div className="text-[9px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>📡 Givoni Psychrometric Model</span>
        <span>Comfort Band: 18–26°C</span>
      </div>
    </div>
  );
};
