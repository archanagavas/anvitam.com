// components/siteanalysis/cards/TopographyCard.tsx
import React from 'react';

interface Props { elevation: number; lat: number; lon: number; }

export const TopographyCard: React.FC<Props> = ({ elevation, lat, lon }) => {
  const elevationCategory = elevation < 50 ? 'Coastal/Lowland' : elevation < 300 ? 'Plains' : elevation < 1000 ? 'Hilly terrain' : elevation < 2500 ? 'Highland' : 'Mountain';
  const drainageNote = elevation < 50 ? '⚠️ Low elevation — flooding risk assessment recommended' : elevation > 1000 ? '✅ Natural drainage by gravity' : '✅ Moderate gradient — good drainage potential';

  return (
    <div className="analysis-card">
      <div className="card-header">
        <span className="card-icon">🌄</span>
        <div>
          <h3 className="card-title">Topography</h3>
          <p className="card-subtitle">Elevation & terrain context</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-item">
          <span className="metric-value">{elevation}m</span>
          <span className="metric-label">Elevation (ASL)</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{elevationCategory}</span>
          <span className="metric-label">Terrain type</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{lat.toFixed(4)}°</span>
          <span className="metric-label">Latitude</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{lon.toFixed(4)}°</span>
          <span className="metric-label">Longitude</span>
        </div>
      </div>

      <div className="recommendation-box">
        <span className="rec-icon">💧</span>
        <div>
          <p className="rec-title">Drainage Assessment</p>
          <p className="rec-text">{drainageNote}</p>
        </div>
      </div>

      <div className="recommendation-box" style={{ marginTop: 8 }}>
        <span className="rec-icon">🏗️</span>
        <div>
          <p className="rec-title">Foundation Consideration</p>
          <p className="rec-text">
            {elevation < 50
              ? 'Coastal area — check flood zone, saltwater corrosion resistance, and foundation depth.'
              : elevation > 1000
              ? 'Highland site — consider seismic activity, wind loads, and temperature extremes.'
              : 'Standard foundation conditions likely. Conduct geotechnical survey before construction.'}
          </p>
        </div>
      </div>

      <div className="source-badge">
        <span>📡 Open-Meteo elevation API · SRTM dataset · Fidelity: Medium (90m resolution)</span>
      </div>
    </div>
  );
};
