// components/siteanalysis/cards/RainfallCard.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ClimateData } from '../../../services/siteAnalysisService';

interface Props { data: ClimateData; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const RainfallCard: React.FC<Props> = ({ data }) => {
  const maxRain = Math.max(...data.monthly_rain, 1);
  const dryMonths = data.monthly_rain.filter(r => r < 60).length;
  const wetMonths = data.monthly_rain.filter(r => r >= 100).length;

  const chartData = MONTHS.map((month, i) => ({
    month,
    rainfall: data.monthly_rain[i],
  }));

  const harvestPotential = data.annual_rain_total > 600
    ? `High — ${Math.round(data.annual_rain_total * 0.8)}L per m² of roof area annually`
    : data.annual_rain_total > 300
    ? `Moderate — ${Math.round(data.annual_rain_total * 0.75)}L per m² annually. Supplement with storage.`
    : 'Low — site requires alternative water supply strategies';

  return (
    <div className="analysis-card bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 text-gray-900">
      <div className="card-header flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="card-icon text-2xl p-2.5 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center">
            ☔
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="card-title text-base font-bold text-gray-900">Rainfall Pattern &amp; Hydrology</h3>
              <span className="text-[9px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                🟡 Medium Confidence (ERA5 Gridded)
              </span>
            </div>
            <p className="card-subtitle text-xs text-gray-500">Monthly distribution &amp; water harvesting potential</p>
          </div>
        </div>
      </div>

      <div className="metric-grid grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-base font-bold">~{data.annual_rain_total}mm</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">Annual Total</span>
        </div>
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-base font-bold">{dryMonths}</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">Dry Months (&lt;60mm)</span>
        </div>
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-base font-bold">{wetMonths}</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">Monsoon Months (&gt;100mm)</span>
        </div>
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-base font-bold">{Math.max(...data.monthly_rain)}mm</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">Peak Monsoon Month</span>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '11px' }}
              formatter={(v: number) => [`${v}mm`, 'Rainfall']}
            />
            <Bar dataKey="rainfall" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.rainfall >= 100 ? '#CCFF00' : entry.rainfall >= 60 ? '#86efac' : '#d1d5db'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="recommendation-box p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-2.5">
        <span className="rec-icon text-base">💧</span>
        <div>
          <p className="rec-title text-xs font-bold text-gray-900">Rainwater Harvesting Potential (85% Runoff Coeff)</p>
          <p className="rec-text text-[11px] text-gray-600 leading-relaxed">{harvestPotential}</p>
        </div>
      </div>

      <div className="source-badge text-[10px] text-gray-400 flex items-center gap-2 pt-2 border-t border-gray-100">
        <span>📡 Open-Meteo 5-year ERA5 archive (0.25° grid)</span>
        <span>·</span>
        <span>IMD regional alignment</span>
        <span>·</span>
        <span>On-site storm model required</span>
      </div>
    </div>
  );
};
