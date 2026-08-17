// components/siteanalysis/cards/SoilCard.tsx
import React from 'react';
import type { SoilData } from '../../../services/siteAnalysisService';

interface Props { data: SoilData; }

export const SoilCard: React.FC<Props> = ({ data }) => {
  const phColor = data.ph < 5.5 ? '#ef4444' : data.ph > 7.5 ? '#f97316' : '#22c55e';
  const phLabel = data.ph < 5.5 ? 'Acidic' : data.ph > 7.5 ? 'Alkaline' : 'Neutral';

  return (
    <div className="analysis-card">
      <div className="card-header">
        <span className="card-icon">🌍</span>
        <div>
          <h3 className="card-title">Soil Analysis</h3>
          <p className="card-subtitle">Texture, chemistry & foundation suitability</p>
        </div>
      </div>
      <div className="metric-grid">
        <div className="metric-item">
          <span className="metric-value" style={{ color: phColor }}>{data.ph}</span>
          <span className="metric-label">pH — {phLabel}</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.organic_carbon}g/kg</span>
          <span className="metric-label">Organic carbon</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.bulk_density}</span>
          <span className="metric-label">Bulk density (kg/m³)</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.soil_texture}</span>
          <span className="metric-label">Soil texture</span>
        </div>
      </div>

      {/* Soil composition bar */}
      <div style={{ marginTop: 12 }}>
        <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Soil Composition</p>
        <div style={{ display: 'flex', height: 20, borderRadius: 6, overflow: 'hidden', gap: 1 }}>
          <div style={{ width: `${data.clay_pct}%`, background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {data.clay_pct > 10 && <span style={{ fontSize: 9, color: 'white', fontWeight: 700 }}>Clay {data.clay_pct}%</span>}
          </div>
          <div style={{ width: `${data.silt_pct}%`, background: '#6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {data.silt_pct > 10 && <span style={{ fontSize: 9, color: '#111', fontWeight: 700 }}>Silt {data.silt_pct}%</span>}
          </div>
          <div style={{ flex: 1, background: '#fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 9, color: '#111', fontWeight: 700 }}>Sand {data.sand_pct}%</span>
          </div>
        </div>
      </div>

      <div className="strategies-list" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="recommendation-box">
          <span className="rec-icon">🏗️</span>
          <div><p className="rec-title">Foundation</p><p className="rec-text">{data.foundation_suitability}</p></div>
        </div>
        <div className="recommendation-box">
          <span className="rec-icon">🌿</span>
          <div><p className="rec-title">Agriculture / Permaculture</p><p className="rec-text">{data.agriculture_potential}</p></div>
        </div>
      </div>

      <div className="source-badge" style={{ marginTop: 8 }}>
        <span>📡 SoilGrids v2.0 (ISRIC) · 250m resolution · Fidelity: Medium — site-level testing recommended</span>
      </div>
    </div>
  );
};
