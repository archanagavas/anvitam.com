// components/siteanalysis/cards/WindRoseCard.tsx — Meteorological Wind Rose & Passive Airflow Engine
import React, { useState } from 'react';
import type { WindRoseData } from '../../../services/siteAnalysisService';
import { Wind, Compass, ShieldCheck, ArrowUpRight, Gauge } from 'lucide-react';

interface Props {
  data: WindRoseData;
}

// Architectural meteorological color palette
const SPEED_BINS = [
  { label: '0–5', name: 'Light Air', color: '#7dd3fc', text: '#0284c7' },
  { label: '5–10', name: 'Gentle Breeze', color: '#38bdf8', text: '#0369a1' },
  { label: '10–15', name: 'Moderate', color: '#34d399', text: '#059669' },
  { label: '15–20', name: 'Fresh Breeze', color: '#fbbf24', text: '#d97706' },
  { label: '>20', name: 'Strong', color: '#f87171', text: '#dc2626' },
];

export const WindRoseCard: React.FC<Props> = ({ data }) => {
  const [hoveredDir, setHoveredDir] = useState<number | null>(null);

  if (!data?.directions?.length) return null;

  const cx = 130;
  const cy = 130;
  const maxR = 92;

  // Compute total and maximum frequencies
  const totalObservations = data.frequencies.reduce(
    (sum, dirFreqs) => sum + dirFreqs.reduce((s, v) => s + v, 0),
    0
  ) || 1;

  const dirTotals = data.directions.map((_, i) =>
    data.frequencies[i].reduce((s, v) => s + v, 0)
  );
  const maxDirFreq = Math.max(...dirTotals) || 1;
  const maxDirPct = Math.round((maxDirFreq / totalObservations) * 100);

  // Frequency ring percentages (5%, 10%, 15%, 20%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Beaufort description
  const getBeaufortDescription = (speedKmh: number) => {
    if (speedKmh < 6) return 'Light Air (Force 1)';
    if (speedKmh < 12) return 'Light Breeze (Force 2)';
    if (speedKmh < 20) return 'Gentle Breeze (Force 3)';
    if (speedKmh < 29) return 'Moderate Breeze (Force 4)';
    return 'Fresh Breeze (Force 5)';
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
            <Wind size={22} />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900">Wind Rose &amp; Microclimate Airflow</h3>
              <span className="text-[9px] font-bold bg-sky-100 text-sky-900 px-2 py-0.5 rounded-full border border-sky-200">
                ERA5 3-Yr Reanalysis
              </span>
            </div>
            <p className="text-xs text-gray-500 font-normal">
              16-Sector frequency distribution &amp; prevailing passive ventilation vectors
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Prevailing</span>
          <span className="text-sm font-black text-sky-600 flex items-center gap-1 justify-end">
            <Compass size={13} /> {data.dominant_direction}
          </span>
        </div>
      </div>

      {/* Metric Quick Stats Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-sm font-black text-slate-900 block">{data.dominant_direction}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Dominant Vector</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-sm font-black text-sky-600 block">{data.dominant_speed} km/h</span>
          <span className="text-[10px] text-slate-500 font-medium block">Avg Velocity</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-sm font-black text-emerald-600 block">{getBeaufortDescription(data.dominant_speed).split(' ')[0]}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Beaufort Index</span>
        </div>
      </div>

      {/* Meteorological Polar Wind Rose SVG */}
      <div className="relative bg-gradient-to-b from-slate-50/70 to-slate-100/40 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center">
        <svg viewBox="0 0 260 260" className="w-full max-w-[240px] h-auto select-none overflow-visible">
          {/* Concentric Frequency Circles */}
          {rings.map((r, i) => {
            const radius = maxR * r;
            const pctLabel = Math.round((maxDirPct * r));
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray={i < 3 ? '2 2' : 'none'} />
                {/* Ring percentage label */}
                <text x={cx + 3} y={cy - radius + 9} fontSize="6.5" fill="#94a3b8" fontWeight="600">
                  {pctLabel}%
                </text>
              </g>
            );
          })}

          {/* Radial Axis Spokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + Math.sin(rad) * (maxR + 2)}
                y2={cy - Math.cos(rad) * (maxR + 2)}
                stroke="#cbd5e1"
                strokeWidth="0.8"
              />
            );
          })}

          {/* Wind Speed Stacked Petals */}
          {data.directions.map((dir, dirIdx) => {
            const angle = (dirIdx * 45 * Math.PI) / 180;
            const totalDirVal = dirTotals[dirIdx];
            const petalR = (totalDirVal / maxDirFreq) * maxR;
            const halfWidth = (18 * Math.PI) / 180; // 18° wedge width

            let cumulativeR = 0;
            return (
              <g
                key={dir}
                onMouseEnter={() => setHoveredDir(dirIdx)}
                onMouseLeave={() => setHoveredDir(null)}
                className="cursor-pointer transition-opacity"
                opacity={hoveredDir === null || hoveredDir === dirIdx ? 1 : 0.4}
              >
                {data.frequencies[dirIdx].map((freq, speedIdx) => {
                  if (freq <= 0) return null;
                  const innerR = cumulativeR;
                  const outerR = cumulativeR + (freq / (totalDirVal || 1)) * petalR;
                  cumulativeR = outerR;

                  const x1 = cx + Math.sin(angle - halfWidth) * outerR;
                  const y1 = cy - Math.cos(angle - halfWidth) * outerR;
                  const x2 = cx + Math.sin(angle + halfWidth) * outerR;
                  const y2 = cy - Math.cos(angle + halfWidth) * outerR;
                  const ix1 = cx + Math.sin(angle - halfWidth) * innerR;
                  const iy1 = cy - Math.cos(angle - halfWidth) * innerR;
                  const ix2 = cx + Math.sin(angle + halfWidth) * innerR;
                  const iy2 = cy - Math.cos(angle + halfWidth) * innerR;

                  const color = SPEED_BINS[speedIdx]?.color || '#38bdf8';

                  return (
                    <path
                      key={`${dirIdx}-${speedIdx}`}
                      d={`M ${ix1.toFixed(1)} ${iy1.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${outerR.toFixed(1)} ${outerR.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${ix2.toFixed(1)} ${iy2.toFixed(1)} A ${innerR.toFixed(1)} ${innerR.toFixed(1)} 0 0 0 ${ix1.toFixed(1)} ${iy1.toFixed(1)} Z`}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="0.5"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Cardinal & Intercardinal Labels */}
          {data.directions.map((dir, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const labelR = maxR + 15;
            const isDominant = dir === data.dominant_direction;
            return (
              <text
                key={dir}
                x={cx + Math.sin(angle) * labelR}
                y={cy - Math.cos(angle) * labelR + 3}
                textAnchor="middle"
                fontSize={isDominant ? '9' : '7.5'}
                fontWeight={isDominant ? '800' : '600'}
                fill={isDominant ? '#0284c7' : '#64748b'}
              >
                {dir}
              </text>
            );
          })}

          {/* Central Calm Hub */}
          <circle cx={cx} cy={cy} r="6" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="2" fill="#0f172a" />
        </svg>

        {/* Speed Bins Color Scale Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-2 border-t border-slate-200/80 w-full">
          {SPEED_BINS.map((b) => (
            <div key={b.label} className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: b.color }} />
              <span className="text-gray-600 font-medium">{b.label} km/h</span>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Passive Ventilation Strategies */}
      <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100 flex items-start gap-3">
        <span className="text-lg">🌬️</span>
        <div>
          <h4 className="text-xs font-bold text-sky-950">Passive Ventilation &amp; Siting Guidance</h4>
          <p className="text-[11px] text-sky-800 leading-relaxed mt-0.5 font-normal">
            Primary breezes approach from <strong>{data.dominant_direction}</strong> at ~{data.dominant_speed} km/h ({getBeaufortDescription(data.dominant_speed)}).
            Orient major operable fenestration and veranda openings along the windward {data.dominant_direction} face. Pair with high-level clerestory or courtyard exhaust on the leeward face to maximize convective cooling.
          </p>
        </div>
      </div>

      {/* Footer Provenance */}
      <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>📡 ECMWF ERA5 Reanalysis · 3-Year Climatological Average</span>
        <span className="font-semibold text-sky-700">Calibrated Macro Vectors</span>
      </div>
    </div>
  );
};
