// components/siteanalysis/cards/OrientationCard.tsx — Architectural Solar Orientation & Sun Vault Compass
import React, { useState } from 'react';
import type { SolarData } from '../../../services/siteAnalysisService';
import { Compass, Sun, ShieldAlert, CheckCircle2, ArrowUpRight, Info } from 'lucide-react';

interface Props {
  data: SolarData;
  lat: number;
}

export const OrientationCard: React.FC<Props> = ({ data, lat }) => {
  const [activeSeason, setActiveSeason] = useState<'summer' | 'winter' | 'equinox'>('summer');

  const isNorthHemisphere = lat >= 0;
  // Optimal long-axis orientation is East-West, so primary glazing faces South (in Northern Hemisphere) or North (in Southern Hemisphere)
  const optimalSolarAzimuth = isNorthHemisphere ? 180 : 0; // South in North, North in South

  // Solar coordinates
  const summer = data.solstice_summer || { rise_az: 64, set_az: 296, noon_alt: 89 };
  const winter = data.solstice_winter || { rise_az: 116, set_az: 244, noon_alt: 44 };
  const equinox = data.equinox || { rise_az: 90, set_az: 270, noon_alt: 67 };

  // SVG parameters for 260x260 compass
  const cx = 130;
  const cy = 130;
  const outerR = 100;
  const compassR = 90;
  const buildingWidth = 60;
  const buildingHeight = 24;

  // Helper to convert azimuth degrees (0=N, 90=E, 180=S, 270=W) to SVG coordinates
  const azToXY = (azimuthDeg: number, radius: number) => {
    const rad = (azimuthDeg * Math.PI) / 180;
    return {
      x: cx + Math.sin(rad) * radius,
      y: cy - Math.cos(rad) * radius,
    };
  };

  // Helper to create an SVG arc path between two azimuth angles
  const createArc = (startAz: number, endAz: number, radius: number) => {
    const start = azToXY(startAz, radius);
    const end = azToXY(endAz, radius);
    // Determine large arc flag
    let sweep = endAz - startAz;
    if (sweep < 0) sweep += 360;
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  };

  const currentSeasonData = activeSeason === 'summer' ? summer : activeSeason === 'winter' ? winter : equinox;
  const seasonColor = activeSeason === 'summer' ? '#f59e0b' : activeSeason === 'winter' ? '#0ea5e9' : '#10b981';

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Compass size={22} />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900">Building Orientation &amp; Solar Vault</h3>
              <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                Astronomical SunCalc
              </span>
            </div>
            <p className="text-xs text-gray-500 font-normal">
              Latitude {lat.toFixed(2)}° · Optimal massing axis &amp; seasonal solar azimuth arcs
            </p>
          </div>
        </div>

        {/* Season Selector Pill */}
        <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200 shrink-0 text-[10px] font-bold">
          <button
            onClick={() => setActiveSeason('summer')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeSeason === 'summer' ? 'bg-amber-500 text-white shadow-2xs' : 'text-gray-600 hover:text-black'
            }`}
          >
            Summer
          </button>
          <button
            onClick={() => setActiveSeason('equinox')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeSeason === 'equinox' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-gray-600 hover:text-black'
            }`}
          >
            Equinox
          </button>
          <button
            onClick={() => setActiveSeason('winter')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeSeason === 'winter' ? 'bg-sky-600 text-white shadow-2xs' : 'text-gray-600 hover:text-black'
            }`}
          >
            Winter
          </button>
        </div>
      </div>

      {/* Interactive Architectural Compass & Solar Trajectory Dial */}
      <div className="relative bg-gradient-to-b from-slate-50/70 to-slate-100/40 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center">
        <svg viewBox="0 0 260 260" className="w-full max-w-[240px] h-auto select-none overflow-visible">
          <defs>
            <radialGradient id="solarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={seasonColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={seasonColor} stopOpacity="0" />
            </radialGradient>
            <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Compass Outer Shaded Rings */}
          <circle cx={cx} cy={cy} r={outerR} fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={compassR} fill="none" stroke="#f1f5f9" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={65} fill="none" stroke="#f1f5f9" strokeWidth="0.8" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={40} fill="none" stroke="#f1f5f9" strokeWidth="0.8" />

          {/* Subtle Dial Ticks every 10° */}
          {Array.from({ length: 36 }, (_, i) => {
            const angle = (i * 10 * Math.PI) / 180;
            const isMajor = i % 9 === 0;
            const isSemi = i % 3 === 0;
            const inner = isMajor ? outerR - 10 : isSemi ? outerR - 6 : outerR - 4;
            return (
              <line
                key={i}
                x1={cx + Math.sin(angle) * inner}
                y1={cy - Math.cos(angle) * inner}
                x2={cx + Math.sin(angle) * outerR}
                y2={cy - Math.cos(angle) * outerR}
                stroke={isMajor ? '#64748b' : '#cbd5e1'}
                strokeWidth={isMajor ? 1.5 : 0.8}
              />
            );
          })}

          {/* Glare Hazard Sector (South-West afternoon radiation in Sub-tropics) */}
          <path
            d={`M ${cx} ${cy} L ${azToXY(200, compassR).x} ${azToXY(200, compassR).y} A ${compassR} ${compassR} 0 0 1 ${azToXY(260, compassR).x} ${azToXY(260, compassR).y} Z`}
            fill="#fee2e2"
            opacity="0.5"
          />

          {/* Seasonal Solar Trajectory Arc */}
          <path
            d={createArc(currentSeasonData.rise_az, currentSeasonData.set_az, compassR - 8)}
            fill="none"
            stroke={seasonColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Solar Rise / Set Markers */}
          {(() => {
            const risePos = azToXY(currentSeasonData.rise_az, compassR - 8);
            const setPos = azToXY(currentSeasonData.set_az, compassR - 8);
            return (
              <g>
                <circle cx={risePos.x} cy={risePos.y} r="5" fill="#ffffff" stroke={seasonColor} strokeWidth="2.5" />
                <circle cx={setPos.x} cy={setPos.y} r="5" fill="#ffffff" stroke={seasonColor} strokeWidth="2.5" />
                <text x={risePos.x} y={risePos.y - 8} fontSize="7" fontWeight="bold" fill={seasonColor} textAnchor="middle">
                  Rise {currentSeasonData.rise_az}°
                </text>
                <text x={setPos.x} y={setPos.y - 8} fontSize="7" fontWeight="bold" fill={seasonColor} textAnchor="middle">
                  Set {currentSeasonData.set_az}°
                </text>
              </g>
            );
          })()}

          {/* Architectural Building Footprint (East-West elongated massing) */}
          <g transform={`rotate(${0}, ${cx}, ${cy})`}>
            {/* Building mass outline */}
            <rect
              x={cx - buildingWidth / 2}
              y={cy - buildingHeight / 2}
              width={buildingWidth}
              height={buildingHeight}
              rx="4"
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="1.5"
              filter="url(#shadowGlow)"
            />
            {/* Long glazing indicators (North & South faces) */}
            <line x1={cx - buildingWidth / 2 + 6} y1={cy + buildingHeight / 2} x2={cx + buildingWidth / 2 - 6} y2={cy + buildingHeight / 2} stroke="#38bdf8" strokeWidth="2" />
            <line x1={cx - buildingWidth / 2 + 6} y1={cy - buildingHeight / 2} x2={cx + buildingWidth / 2 - 6} y2={cy - buildingHeight / 2} stroke="#38bdf8" strokeWidth="2" />
            <text x={cx} y={cy + 3} textAnchor="middle" fontSize="6.5" fill="#f8fafc" fontWeight="bold">
              E-W AXIS
            </text>
          </g>

          {/* Primary Solar Gain Target Arrow (South for NH, North for SH) */}
          {(() => {
            const targetPos = azToXY(optimalSolarAzimuth, compassR - 18);
            return (
              <g>
                <line x1={cx} y1={cy + (isNorthHemisphere ? 12 : -12)} x2={targetPos.x} y2={targetPos.y} stroke="#f59e0b" strokeWidth="2" strokeDasharray="2 2" />
                <polygon
                  points={`${targetPos.x},${targetPos.y} ${targetPos.x - 4},${targetPos.y - (isNorthHemisphere ? 7 : -7)} ${targetPos.x + 4},${targetPos.y - (isNorthHemisphere ? 7 : -7)}`}
                  fill="#f59e0b"
                />
              </g>
            );
          })()}

          {/* Cardinal & Intercardinal Labels */}
          {[
            { label: 'N', az: 0, color: '#dc2626', weight: 'bold' },
            { label: 'NE', az: 45, color: '#94a3b8', weight: 'normal' },
            { label: 'E', az: 90, color: '#475569', weight: 'bold' },
            { label: 'SE', az: 135, color: '#94a3b8', weight: 'normal' },
            { label: 'S', az: 180, color: isNorthHemisphere ? '#f59e0b' : '#475569', weight: 'bold' },
            { label: 'SW', az: 225, color: '#ef4444', weight: 'bold' },
            { label: 'W', az: 270, color: '#475569', weight: 'bold' },
            { label: 'NW', az: 315, color: '#94a3b8', weight: 'normal' },
          ].map(({ label, az, color, weight }) => {
            const p = azToXY(az, outerR - 14);
            return (
              <text
                key={label}
                x={p.x}
                y={p.y + 3}
                textAnchor="middle"
                fontSize={label.length === 1 ? '10' : '7'}
                fontWeight={weight}
                fill={color}
              >
                {label}
              </text>
            );
          })}

          {/* Center Pivot Marker */}
          <circle cx={cx} cy={cy} r="2.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
        </svg>

        {/* Dynamic Season Status Pill */}
        <div className="mt-3 flex items-center justify-between w-full px-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seasonColor }} />
            <span className="capitalize">{activeSeason} Solstice Vault:</span>
            <span className="font-mono text-gray-900 font-bold">{currentSeasonData.noon_alt}° Noon Alt</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">
            {currentSeasonData.rise_az}° → {currentSeasonData.set_az}° Azimuth
          </span>
        </div>
      </div>

      {/* Architectural Guidance Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-950">Optimal Axis (E-W)</h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5 font-normal">
              Elongate building on East-West axis. Face main habitable zones {isNorthHemisphere ? 'South' : 'North'} for controllable daylight and passive winter heating.
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100 flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-950">South-West Heat Shield</h4>
            <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5 font-normal">
              Critical afternoon solar radiation peak (SW sector). Minimize windows or deploy vertical louvers, cavity walls, and buffer services (stairs/toilets).
            </p>
          </div>
        </div>
      </div>

      {/* Sub-tropical Latitude Guidance (e.g. India / Gulf) */}
      {data.is_sub_tropical_north && (
        <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-start gap-2.5 text-blue-900 text-[11px]">
          <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Sub-Tropic of Cancer Solar Transit:</strong> In May-July, solar noon altitude exceeds 90° and reaches the northern sky. North facades require horizontal overhangs just like South facades.
          </p>
        </div>
      )}

      {/* Footer Provenance */}
      <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>📡 SunCalc Ephemeris · Astronomical Declination</span>
        <span className="font-semibold text-emerald-700">±0.1° Solar Precision</span>
      </div>
    </div>
  );
};
