// components/siteanalysis/cards/BioclimateCard.tsx
import React from 'react';
import type { ClimateData } from '../../../services/siteAnalysisService';

interface Props { data: ClimateData; }

const ZONE_COLORS: Record<string, string> = {
  Af: '#065f46', Am: '#047857', Aw: '#059669',
  BWh: '#92400e', BSh: '#b45309',
  Cs: '#1d4ed8', Cf: '#2563eb',
  Df: '#1e40af', ET: '#374151', Cwb: '#166534',
};

export const BioclimateCard: React.FC<Props> = ({ data }) => {
  const zoneColor = ZONE_COLORS[data.koppen_zone] || '#374151';

  return (
    <div className="analysis-card">
      <div className="card-header">
        <span className="card-icon">🌿</span>
        <div>
          <h3 className="card-title">Bioclimatic Zone</h3>
          <p className="card-subtitle">Köppen classification & passive design strategies</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0 12px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: `${zoneColor}15`, border: `2px solid ${zoneColor}40`, borderRadius: 12, padding: '12px 24px' }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: zoneColor, letterSpacing: -1 }}>{data.koppen_zone}</span>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>{data.koppen_label}</p>
            <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Köppen-Geiger Classification</p>
          </div>
        </div>
      </div>

      <div className="strategies-section">
        <p className="strategies-title">Passive Design Strategies</p>
        <ul className="strategies-list">
          {data.passive_strategies.map((s, i) => (
            <li key={i} className="strategy-item">
              <span className="strategy-dot" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="recommendation-box">
        <span className="rec-icon">📖</span>
        <div>
          <p className="rec-title">What this means for design</p>
          <p className="rec-text">
            In a <strong>{data.koppen_label}</strong> climate, passive design can significantly reduce energy loads.
            Annual avg temp: {data.annual_temp_avg}°C, rainfall: {data.annual_rain_total}mm/yr.
          </p>
        </div>
      </div>

      <div className="source-badge">
        <span>📡 Köppen-Geiger algorithm · Based on Open-Meteo historical data · Fidelity: High</span>
      </div>
    </div>
  );
};
