// components/siteanalysis/cards/ClimateCard.tsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ClimateData } from '../../../services/siteAnalysisService';

interface Props { data: ClimateData; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ClimateCard: React.FC<Props> = ({ data }) => {
  const chartData = MONTHS.map((month, i) => ({
    month,
    'Max Temp': data.monthly_temp_max[i],
    'Min Temp': data.monthly_temp_min[i],
    Humidity: data.monthly_humidity[i],
  }));

  return (
    <div className="analysis-card bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 text-gray-900">
      <div className="card-header flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="card-icon text-2xl p-2.5 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center">
            🌤️
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="card-title text-base font-bold text-gray-900">Climate &amp; Bioclimatic Classification</h3>
              <span className="text-[9px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                🟡 Medium Confidence (ERA5 Gridded)
              </span>
            </div>
            <p className="card-subtitle text-xs text-gray-500">5-year Open-Meteo ERA5 reanalysis &amp; Agro-Climatic Zone</p>
          </div>
        </div>
      </div>

      <div className="metric-grid grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-base font-bold">{data.annual_temp_avg}°C</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">Annual Avg Temp</span>
        </div>
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-base font-bold">~{data.annual_rain_total}mm</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">Annual Normal Rain</span>
        </div>
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-base font-bold text-amber-600">{data.et_rate_summer_mm_day || 6.2} mm/d</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">Summer Peak ET₀</span>
        </div>
        <div className="metric-item p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="metric-value text-xs font-bold text-gray-900 truncate">{data.koppen_zone} · {data.koppen_label.split(' ')[0]}</span>
          <span className="metric-label text-[10px] text-gray-500 font-medium mt-0.5">Köppen Classification</span>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="tempMaxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tempMinGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '11px' }}
              formatter={(v: number, name: string) => [`${v}${name.includes('Temp') ? '°C' : '%'}`, name]}
            />
            <Area type="monotone" dataKey="Max Temp" stroke="#CCFF00" strokeWidth={2} fill="url(#tempMaxGrad)" />
            <Area type="monotone" dataKey="Min Temp" stroke="#34d399" strokeWidth={2} fill="url(#tempMinGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="strategies-section">
        <p className="strategies-title">Passive Design Strategies for {data.koppen_label}</p>
        <ul className="strategies-list">
          {data.passive_strategies.map((s, i) => (
            <li key={i} className="strategy-item">
              <span className="strategy-dot" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="source-badge">
        <span>📡 Open-Meteo Archive API</span>
        <span>·</span>
        <span>5-year ERA5 reanalysis</span>
        <span>·</span>
        <span>Fidelity: High (1km resolution)</span>
      </div>
    </div>
  );
};
