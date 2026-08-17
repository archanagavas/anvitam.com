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
    <div className="analysis-card">
      <div className="card-header">
        <span className="card-icon">🌤️</span>
        <div>
          <h3 className="card-title">Climate Summary</h3>
          <p className="card-subtitle">5-year historical average — temperature & humidity</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-item">
          <span className="metric-value">{data.annual_temp_avg}°C</span>
          <span className="metric-label">Annual avg temp</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.annual_rain_total}mm</span>
          <span className="metric-label">Annual rainfall</span>
        </div>
        <div className="metric-item">
          <span className="metric-value koppen-badge">{data.koppen_zone}</span>
          <span className="metric-label">Köppen zone</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.koppen_label}</span>
          <span className="metric-label">Climate type</span>
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
