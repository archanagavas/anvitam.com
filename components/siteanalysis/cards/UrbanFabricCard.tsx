// components/siteanalysis/cards/UrbanFabricCard.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { UrbanFabricData } from '../../../services/siteAnalysisService';

interface Props { data: UrbanFabricData; }

export const UrbanFabricCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="analysis-card">
      <div className="card-header">
        <span className="card-icon">🗺️</span>
        <div>
          <h3 className="card-title">Urban Fabric</h3>
          <p className="card-subtitle">Building density & context within 500m radius</p>
        </div>
      </div>
      <div className="metric-grid">
        <div className="metric-item">
          <span className="metric-value">{data.building_count}</span>
          <span className="metric-label">Buildings nearby</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.building_density_pct}%</span>
          <span className="metric-label">Built area density</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.avg_height_m}m</span>
          <span className="metric-label">Avg building height</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.max_height_m}m</span>
          <span className="metric-label">Max building height</span>
        </div>
      </div>
      <div className="info-pill">{data.street_grid_type}</div>
      <div className="chart-container">
        <p className="bar-title" style={{ marginBottom: 8, fontSize: 11, color: '#6b7280' }}>Context Height Distribution</p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={data.context_heights} margin={{ top: 0, right: 5, bottom: 0, left: -20 }}>
            <XAxis dataKey="range" tick={{ fontSize: 8, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '11px' }} formatter={(v: number) => [`${v} buildings`, 'Count']} />
            <Bar dataKey="count" fill="#CCFF00" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="source-badge">
        <span>📡 OpenStreetMap via Overpass API · Live data · Fidelity depends on OSM coverage</span>
      </div>
    </div>
  );
};
