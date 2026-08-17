// components/siteanalysis/cards/WindRoseCard.tsx
import React from 'react';
import type { WindRoseData } from '../../../services/siteAnalysisService';

interface Props { data: WindRoseData; }

const COLORS = ['#d1fae5', '#6ee7b7', '#34d399', '#10b981', '#CCFF00'];

export const WindRoseCard: React.FC<Props> = ({ data }) => {
  if (!data?.directions?.length) return null;

  const cx = 120, cy = 120, maxR = 85;
  const totalFreq = data.frequencies.reduce((sum, dir) => sum + dir.reduce((s, v) => s + v, 0), 0);
  const maxDirFreq = Math.max(...data.directions.map((_, i) => data.frequencies[i].reduce((s, v) => s + v, 0)));

  return (
    <div className="analysis-card">
      <div className="card-header">
        <span className="card-icon">💨</span>
        <div>
          <h3 className="card-title">Wind Rose</h3>
          <p className="card-subtitle">Frequency & speed by direction — 3-year average</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-item">
          <span className="metric-value">{data.dominant_direction}</span>
          <span className="metric-label">Dominant wind</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{data.dominant_speed} km/h</span>
          <span className="metric-label">Avg speed</span>
        </div>
      </div>

      <div className="diagram-container">
        <svg viewBox="0 0 240 240" className="wind-rose-svg">
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((r, i) => (
            <circle key={i} cx={cx} cy={cy} r={maxR * r} fill="none" stroke="#e5e7eb" strokeWidth="0.8" />
          ))}
          {/* Cardinal lines */}
          {[0, 45, 90, 135].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return <line key={i} x1={cx} y1={cy} x2={cx + Math.sin(rad) * maxR} y2={cy - Math.cos(rad) * maxR} stroke="#e5e7eb" strokeWidth="0.8" />;
          })}
          {/* Petals */}
          {data.directions.map((dir, dirIdx) => {
            const angle = (dirIdx * 45 * Math.PI) / 180;
            const totalDirFreq = data.frequencies[dirIdx].reduce((s, v) => s + v, 0);
            const petalR = (totalDirFreq / maxDirFreq) * maxR;
            const halfWidth = (20 * Math.PI) / 180; // 20° half-width per petal

            let cumulativeR = 0;
            return data.frequencies[dirIdx].map((freq, speedIdx) => {
              if (freq === 0) { cumulativeR += 0; return null; }
              const innerR = cumulativeR;
              const outerR = cumulativeR + (freq / (totalDirFreq || 1)) * petalR;
              cumulativeR = outerR;

              const x1 = cx + Math.sin(angle - halfWidth) * outerR;
              const y1 = cy - Math.cos(angle - halfWidth) * outerR;
              const x2 = cx + Math.sin(angle + halfWidth) * outerR;
              const y2 = cy - Math.cos(angle + halfWidth) * outerR;
              const ix1 = cx + Math.sin(angle - halfWidth) * innerR;
              const iy1 = cy - Math.cos(angle - halfWidth) * innerR;
              const ix2 = cx + Math.sin(angle + halfWidth) * innerR;
              const iy2 = cy - Math.cos(angle + halfWidth) * innerR;

              return (
                <path
                  key={`${dirIdx}-${speedIdx}`}
                  d={`M ${ix1.toFixed(1)} ${iy1.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${outerR.toFixed(1)} ${outerR.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${ix2.toFixed(1)} ${iy2.toFixed(1)} A ${innerR.toFixed(1)} ${innerR.toFixed(1)} 0 0 0 ${ix1.toFixed(1)} ${iy1.toFixed(1)} Z`}
                  fill={COLORS[speedIdx] || COLORS[4]}
                  opacity="0.85"
                />
              );
            });
          })}
          {/* Direction labels */}
          {data.directions.map((dir, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const labelR = maxR + 14;
            return (
              <text key={dir} x={cx + Math.sin(angle) * labelR} y={cy - Math.cos(angle) * labelR + 4} textAnchor="middle" fontSize="9" fill="#4b5563" fontWeight="700">
                {dir}
              </text>
            );
          })}
          {/* Centre dot */}
          <circle cx={cx} cy={cy} r="3" fill="#111" />
        </svg>

        {/* Legend */}
        <div className="wind-legend">
          {data.speed_labels.map((label, i) => (
            <div key={label} className="legend-item">
              <div className="legend-dot" style={{ background: COLORS[i] }} />
              <span className="legend-text">{label} km/h</span>
            </div>
          ))}
        </div>
      </div>

      <div className="recommendation-box">
        <span className="rec-icon">🏠</span>
        <div>
          <p className="rec-title">Design Implication</p>
          <p className="rec-text">
            Primary winds from <strong>{data.dominant_direction}</strong> at avg {data.dominant_speed} km/h.
            Orient main openings to capture prevailing breeze. Shield exposed faces with windbreaks or buffer zones.
          </p>
        </div>
      </div>

      <div className="source-badge">
        <span>📡 Open-Meteo ERA5 reanalysis</span>
        <span>·</span>
        <span>3-year hourly average</span>
        <span>·</span>
        <span>Fidelity: High (regional scale)</span>
      </div>
    </div>
  );
};
