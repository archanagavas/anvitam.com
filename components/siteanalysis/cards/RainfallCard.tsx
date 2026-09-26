// components/siteanalysis/cards/RainfallCard.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ClimateData } from '../../../services/siteAnalysisService';
import { CloudRain } from 'lucide-react';

interface Props { data: ClimateData; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const RainfallCard: React.FC<Props> = ({ data }) => {
  const dryMonths = data.monthly_rain.filter(r => r < 60).length;
  const wetMonths = data.monthly_rain.filter(r => r >= 100).length;

  const chartData = MONTHS.map((month, i) => ({
    month,
    rainfall: data.monthly_rain[i],
  }));

  const harvestPotential = data.annual_rain_total > 600
    ? `~${Math.round(data.annual_rain_total * 0.85)}L per m² roof annual potential`
    : `~${Math.round(data.annual_rain_total * 0.75)}L per m² roof annual potential`;

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <CloudRain size={18} />
          </span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">Rainfall &amp; Roof Catchment</h3>
              <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                ERA5 Gridded
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-normal">
              Monthly precipitation &amp; annual rainwater yield
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">~{data.annual_rain_total}mm</span>
          <span className="text-[10px] text-slate-500 font-medium block">Annual Normal</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-amber-600 block">{dryMonths}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Dry Months</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-blue-600 block">{wetMonths}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Monsoon Mos</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">{Math.max(...data.monthly_rain)}mm</span>
          <span className="text-[10px] text-slate-500 font-medium block">Peak Month</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
          Monthly Rainfall Distribution (mm)
        </p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '11px' }}
              formatter={(v: number) => [`${v}mm`, 'Rainfall']}
            />
            <Bar dataKey="rainfall" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.rainfall >= 100 ? '#0284c7' : entry.rainfall >= 60 ? '#38bdf8' : '#cbd5e1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-0.5 text-[11px]">
        <p className="font-bold text-blue-950">Rainwater Harvesting Potential (85% Runoff)</p>
        <p className="text-blue-800 leading-snug font-normal">{harvestPotential}</p>
      </div>

      <div className="text-[9px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>📡 Open-Meteo ERA5 Precipitation</span>
        <span>NBC Rainwater Sizing</span>
      </div>
    </div>
  );
};
