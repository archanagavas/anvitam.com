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
    <div className="analysis-card">
      <div className="card-header">
        <span className="card-icon">☔</span>
        <div>
          <h3 className="card-title">Rainfall Pattern</h3>
          <p className="card-subtitle">Monthly distribution & water harvesting potential</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-item">
          <span className="metric-value">{data.annual_rain_total}mm</span>
          <span className="metric-label">Annual total</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{dryMonths}</span>
          <span className="metric-label">Dry months (&lt;60mm)</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{wetMonths}</span>
          <span className="metric-label">Wet months (&gt;100mm)</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{Math.round(data.annual_rain_total / 12)}mm</span>
          <span className="metric-label">Monthly avg</span>
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

      <div className="recommendation-box">
        <span className="rec-icon">💧</span>
        <div>
          <p className="rec-title">Rainwater Harvesting Potential</p>
          <p className="rec-text">{harvestPotential}</p>
        </div>
      </div>

      <div className="source-badge">
        <span>📡 Open-Meteo 5-year archive</span>
        <span>·</span>
        <span>ERA5 precipitation data</span>
        <span>·</span>
        <span>Limitations: excludes extreme events</span>
      </div>
    </div>
  );
};
