// components/siteanalysis/cards/ThermalCard.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ThermalComfortData } from '../../../services/siteAnalysisService';

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
    <div className="analysis-card">
      <div className="card-header">
        <span className="card-icon">🌡️</span>
        <div>
          <h3 className="card-title">Thermal Comfort</h3>
          <p className="card-subtitle">Comfortable, hot & cold days per month</p>
        </div>
      </div>
      <div className="metric-grid">
        <div className="metric-item">
          <span className="metric-value" style={{ color: '#16a34a' }}>{data.annual_comfortable_pct}%</span>
          <span className="metric-label">Comfortable hours/yr</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.cooling_degree_days}</span>
          <span className="metric-label">Cooling degree-days</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.heating_degree_days}</span>
          <span className="metric-label">Heating degree-days</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.passive_cooling_viable ? '✅ Yes' : '⚠️ Limited'}</span>
          <span className="metric-label">Passive cooling viable</span>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '11px' }} formatter={(v: number, name: string) => [`${v} days`, name]} />
            <Bar dataKey="Comfortable" stackId="a" fill="#CCFF00" />
            <Bar dataKey="Hot" stackId="a" fill="#fca5a5" />
            <Bar dataKey="Cold" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="recommendation-box">
        <span className="rec-icon">🏡</span>
        <div>
          <p className="rec-title">Comfort Strategy</p>
          <p className="rec-text">
            {data.passive_cooling_viable
              ? 'Passive design can achieve comfort for most of the year. Prioritise cross-ventilation, thermal mass, and shading.'
              : 'Site has significant thermal extremes. Combine passive strategies with high-performance insulation.'}
          </p>
        </div>
      </div>
      <div className="source-badge">
        <span>📡 Calculated from Open-Meteo data · Comfort zone: 18–26°C · Fidelity: Medium</span>
      </div>
    </div>
  );
};
