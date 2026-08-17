// components/siteanalysis/cards/OrientationCard.tsx
import React from 'react';
import type { SolarData } from '../../../services/siteAnalysisService';

interface Props { data: SolarData; lat: number; }

export const OrientationCard: React.FC<Props> = ({ data, lat }) => {
  const isNorthHemisphere = lat >= 0;
  const optimalAngle = isNorthHemisphere ? 180 : 0; // degrees

  return (
    <div className="analysis-card">
      <div className="card-header">
        <span className="card-icon">🧭</span>
        <div>
          <h3 className="card-title">Building Orientation</h3>
          <p className="card-subtitle">Optimal solar orientation for this latitude</p>
        </div>
      </div>

      {/* Compass SVG */}
      <div className="diagram-container">
        <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 200, margin: '0 auto', display: 'block' }}>
          <circle cx="100" cy="100" r="80" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="55" fill="none" stroke="#f3f4f6" strokeWidth="1" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="#f3f4f6" strokeWidth="1" />

          {/* Cardinal marks */}
          {[['N', 100, 16], ['S', 100, 188], ['E', 188, 104], ['W', 12, 104]].map(([l, x, y]) => (
            <text key={String(l)} x={Number(x)} y={Number(y)} textAnchor="middle" fontSize="12" fill={String(l) === 'S' && isNorthHemisphere ? '#CCFF00' : String(l) === 'N' && !isNorthHemisphere ? '#CCFF00' : '#6b7280'} fontWeight="700">{String(l)}</text>
          ))}

          {/* Tick marks */}
          {Array.from({ length: 36 }, (_, i) => {
            const angle = (i * 10 * Math.PI) / 180;
            const inner = i % 9 === 0 ? 68 : 74;
            return <line key={i} x1={100 + Math.sin(angle) * inner} y1={100 - Math.cos(angle) * inner} x2={100 + Math.sin(angle) * 80} y2={100 - Math.cos(angle) * 80} stroke="#d1d5db" strokeWidth={i % 9 === 0 ? 1.5 : 0.8} />;
          })}

          {/* Optimal orientation arrow */}
          {(() => {
            const rad = (optimalAngle * Math.PI) / 180;
            return (
              <g>
                <line x1="100" y1="100" x2={100 + Math.sin(rad) * 65} y2={100 - Math.cos(rad) * 65} stroke="#CCFF00" strokeWidth="3" strokeLinecap="round" />
                <polygon
                  points={`${100 + Math.sin(rad) * 65},${100 - Math.cos(rad) * 65} ${100 + Math.sin(rad - 0.3) * 52},${100 - Math.cos(rad - 0.3) * 52} ${100 + Math.sin(rad + 0.3) * 52},${100 - Math.cos(rad + 0.3) * 52}`}
                  fill="#CCFF00"
                />
              </g>
            );
          })()}

          {/* Solstice arcs */}
          <text x="100" y="108" textAnchor="middle" fontSize="8" fill="#9ca3af">Summer</text>
          <text x="100" y="118" textAnchor="middle" fontSize="7" fill="#9ca3af">
            rise {data.solstice_summer.rise_az}° · set {data.solstice_summer.set_az}°
          </text>

          <circle cx="100" cy="100" r="5" fill="#111" />
        </svg>
      </div>

      <div className="recommendation-box">
        <span className="rec-icon">✨</span>
        <div>
          <p className="rec-title">{data.optimal_orientation}</p>
          <p className="rec-text">
            Primary glazing and living spaces should face {isNorthHemisphere ? 'south' : 'north'} to maximise winter solar gain.
            Summer solstice sun rises at {data.solstice_summer.rise_az}° and sets at {data.solstice_summer.set_az}°.
            Winter solstice rises at {data.solstice_winter.rise_az}° and sets at {data.solstice_winter.set_az}°.
          </p>
        </div>
      </div>

      <div className="source-badge">
        <span>📡 SunCalc · Solar declination for this latitude · Fidelity: High</span>
      </div>
    </div>
  );
};
