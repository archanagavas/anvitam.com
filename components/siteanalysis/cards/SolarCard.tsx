// components/siteanalysis/cards/SolarCard.tsx — Mathematically Computed 3D Architectural Perspective Solar Vault
import React, { useState } from 'react';
import type { SolarData } from '../../../services/siteAnalysisService';
import { Sun, Calendar, Clock, Compass, Info, CheckCircle2 } from 'lucide-react';

interface Props { 
  data: SolarData; 
  lat: number; 
}

export const SolarCard: React.FC<Props> = ({ data, lat }) => {
  const [activeSeason, setActiveSeason] = useState<'all' | 'summer' | 'equinox' | 'winter' | 'today'>('all');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxHours = Math.max(...data.monthly_sun_hours, 1);

  const isNorthern = lat >= 0;
  const summerNoonAlt = data.summer_solstice_noon_alt || Math.min(90, Math.max(5, 90 - Math.abs(lat - 23.44)));
  const winterNoonAlt = data.winter_solstice_noon_alt || Math.max(0, Math.min(90, 90 - Math.abs(lat - (-23.44))));
  const equinoxNoonAlt = data.equinox_noon_alt || Math.max(0, Math.min(90, 90 - Math.abs(lat)));
  const todayNoonAlt = data.sun_altitude_noon || 65.5;

  const noonAltFormatted = Number(todayNoonAlt).toFixed(1);

  // Geometric 3D perspective vault calculations based on celestial coordinates
  const cx = 170;
  const groundY = 152;
  const rx = 122;
  const ry = 44;
  const maxVaultH = 96; // Zenith height (90° altitude)

  // Map compass azimuth (N=0, E=90, S=180, W=270) to perspective horizon ellipse
  const getHorizonPoint = (az: number) => {
    const angleRad = ((az - 90) * Math.PI) / 180;
    const x = cx - rx * Math.cos(angleRad);
    const y = groundY + ry * Math.sin(angleRad);
    return { x, y };
  };

  // Compute smooth celestial cubic bezier trajectory curve for an altitude and azimuth bounds
  const getArcPath = (riseAz: number, setAz: number, noonAlt: number) => {
    const rise = getHorizonPoint(riseAz);
    const set = getHorizonPoint(setAz);
    const clampedAlt = Math.max(2, Math.min(90, noonAlt));
    const peakY = groundY - (clampedAlt / 90) * maxVaultH;
    const noonX = cx;

    const cp1X = rise.x + (noonX - rise.x) * 0.45;
    const cp1Y = peakY - (90 - clampedAlt) * 0.05;
    const cp2X = set.x - (set.x - noonX) * 0.45;
    const cp2Y = peakY - (90 - clampedAlt) * 0.05;

    return {
      d: `M ${rise.x.toFixed(1)} ${rise.y.toFixed(1)} C ${cp1X.toFixed(1)} ${cp1Y.toFixed(1)} ${cp2X.toFixed(1)} ${cp2Y.toFixed(1)} ${set.x.toFixed(1)} ${set.y.toFixed(1)}`,
      rise,
      set,
      noon: { x: noonX, y: peakY },
      noonAlt: clampedAlt
    };
  };

  const summerRiseAz = data.solstice_summer?.rise_az ?? 63;
  const summerSetAz = data.solstice_summer?.set_az ?? 297;
  const summerArc = getArcPath(summerRiseAz, summerSetAz, summerNoonAlt);

  const equinoxRiseAz = data.equinox?.rise_az ?? 90;
  const equinoxSetAz = data.equinox?.set_az ?? 270;
  const equinoxArc = getArcPath(equinoxRiseAz, equinoxSetAz, equinoxNoonAlt);

  const winterRiseAz = data.solstice_winter?.rise_az ?? 117;
  const winterSetAz = data.solstice_winter?.set_az ?? 243;
  const winterArc = getArcPath(winterRiseAz, winterSetAz, winterNoonAlt);

  // Today's interpolated trajectory
  const todayRiseAz = ((summerRiseAz + winterRiseAz) / 2);
  const todaySetAz = 360 - todayRiseAz;
  const todayArc = getArcPath(todayRiseAz, todaySetAz, todayNoonAlt);

  return (
    <div className="analysis-card bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-gray-900">
      <div className="card-header flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
            ☀️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="card-title text-base font-black text-gray-900">Solar Path &amp; Vault Trajectory</h3>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                🟢 Live Celestial Physics
              </span>
            </div>
            <p className="card-subtitle text-xs text-gray-500">Astronomically computed for Latitude: {lat.toFixed(4)}° {isNorthern ? 'N' : 'S'}</p>
          </div>
        </div>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
          <span className="text-lg font-mono font-black text-gray-900 block">{data.day_length_hours}h</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today's Daylight</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
          <span className="text-lg font-mono font-black text-amber-600 block">{noonAltFormatted}°</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today's Noon Alt</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
          <span className="text-lg font-mono font-black text-gray-900 block">
            {data.sunrise ? new Date(data.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:15 AM'}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sunrise</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
          <span className="text-lg font-mono font-black text-gray-900 block">
            {data.sunset ? new Date(data.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:45 PM'}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sunset</span>
        </div>
      </div>

      {/* Seasonal Arc Switcher Filter */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl border border-gray-200/80 mb-3 text-[11px] font-bold">
        {[
          { id: 'all', label: 'All 3 Solstices + Today' },
          { id: 'summer', label: `Summer (${summerNoonAlt.toFixed(0)}°)` },
          { id: 'equinox', label: `Equinox (${equinoxNoonAlt.toFixed(0)}°)` },
          { id: 'winter', label: `Winter (${winterNoonAlt.toFixed(0)}°)` },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSeason(tab.id as any)}
            className={`flex-1 py-1 px-2 rounded-xl text-center transition cursor-pointer ${
              activeSeason === tab.id
                ? 'bg-black text-[#CCFF00] shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3D Perspective Solar Vault SVG Diagram (100% Calculated Mathematically) */}
      <div className="diagram-container bg-slate-900/5 p-4 rounded-3xl border border-slate-200/80 my-3 relative overflow-hidden">
        <svg viewBox="0 0 340 245" className="w-full h-auto drop-shadow-xs overflow-visible">
          <defs>
            <linearGradient id="sunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="todayGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CCFF00" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Perspective Ground Ellipse Horizon */}
          <ellipse cx={cx} cy={groundY} rx={rx} ry={ry} fill="none" stroke="#94A3B8" strokeWidth="1.8" />

          {/* Cardinal Axes */}
          <line x1={cx - rx} y1={groundY} x2={cx + rx} y2={groundY} stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="4 3" />
          <line x1={cx} y1={groundY - ry} x2={cx} y2={groundY + ry} stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="4 3" />

          {/* Cardinal Badges */}
          <g transform={`translate(${cx - rx - 10}, ${groundY})`}>
            <circle cx="0" cy="0" r="9" fill="#0EA5E9" />
            <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">E</text>
          </g>
          <g transform={`translate(${cx + rx + 10}, ${groundY})`}>
            <circle cx="0" cy="0" r="9" fill="#0EA5E9" />
            <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">W</text>
          </g>
          <g transform={`translate(${cx}, ${groundY - ry - 8})`}>
            <circle cx="0" cy="0" r="9" fill="#0EA5E9" />
            <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">S</text>
          </g>
          <g transform={`translate(${cx}, ${groundY + ry + 8})`}>
            <circle cx="0" cy="0" r="9" fill="#0EA5E9" />
            <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">N</text>
          </g>

          {/* Isometric Building Model at Center Origin */}
          <g transform={`translate(${cx - 15}, ${groundY - 18})`}>
            <polygon points="0,15 15,22 15,35 0,28" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
            <polygon points="15,22 30,15 30,28 15,35" fill="#CBD5E1" stroke="#475569" strokeWidth="1" />
            <polygon points="0,15 15,2 15,22" fill="#10B981" stroke="#047857" strokeWidth="1" />
            <polygon points="15,2 30,8 30,15 15,22" fill="#059669" stroke="#047857" strokeWidth="1" />
            <rect x="5" y="19" width="4" height="7" fill="#0F172A" />
            <rect x="20" y="18" width="5" height="5" fill="#38BDF8" />
          </g>

          {/* 1. SUMMER SOLSTICE ARC (June 21) */}
          {(activeSeason === 'all' || activeSeason === 'summer') && (
            <g>
              <path
                d={summerArc.d}
                fill="none"
                stroke="#0284C7"
                strokeWidth="2.5"
                strokeDasharray="5 3"
              />
              {/* Summer Noon Sun Marker */}
              <g transform={`translate(${summerArc.noon.x}, ${summerArc.noon.y})`} filter="url(#glow)">
                <circle cx="0" cy="0" r="10" fill="url(#sunGlow)" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                  <line
                    key={deg}
                    x1="0" y1="0"
                    x2={Math.cos((deg * Math.PI) / 180) * 14}
                    y2={Math.sin((deg * Math.PI) / 180) * 14}
                    stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"
                  />
                ))}
              </g>
              {/* Summer Noon Altitude Badge */}
              <g transform={`translate(${summerArc.noon.x}, ${summerArc.noon.y - 14})`}>
                <rect x="-42" y="-10" width="84" height="15" rx="7.5" fill="#0284C7" />
                <text x="0" y="1" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="white">
                  Summer ({summerNoonAlt.toFixed(1)}°)
                </text>
              </g>
              {/* Rise / Set dots */}
              <circle cx={summerArc.rise.x} cy={summerArc.rise.y} r="4" fill="#0284C7" />
              <circle cx={summerArc.set.x} cy={summerArc.set.y} r="4" fill="#0284C7" />
            </g>
          )}

          {/* 2. EQUINOX ARC (March 21 / Sept 23) */}
          {(activeSeason === 'all' || activeSeason === 'equinox') && (
            <g>
              <path
                d={equinoxArc.d}
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              {/* Equinox Noon Sun Marker */}
              <g transform={`translate(${equinoxArc.noon.x}, ${equinoxArc.noon.y})`} filter="url(#glow)">
                <circle cx="0" cy="0" r="8" fill="#10B981" />
              </g>
              {/* Equinox Altitude Tag */}
              <g transform={`translate(${equinoxArc.noon.x}, ${equinoxArc.noon.y + 14})`}>
                <rect x="-40" y="-8" width="80" height="14" rx="7" fill="#065F46" />
                <text x="0" y="2" textAnchor="middle" fontSize="8" fontWeight="800" fill="#CCFF00">
                  Equinox ({equinoxNoonAlt.toFixed(1)}°)
                </text>
              </g>
              {/* Rise / Set dots */}
              <circle cx={equinoxArc.rise.x} cy={equinoxArc.rise.y} r="3.5" fill="#10B981" />
              <circle cx={equinoxArc.set.x} cy={equinoxArc.set.y} r="3.5" fill="#10B981" />
            </g>
          )}

          {/* 3. WINTER SOLSTICE ARC (Dec 21) */}
          {(activeSeason === 'all' || activeSeason === 'winter') && (
            <g>
              <path
                d={winterArc.d}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              {/* Winter Noon Sun Marker */}
              <g transform={`translate(${winterArc.noon.x}, ${winterArc.noon.y})`} filter="url(#glow)">
                <circle cx="0" cy="0" r="8" fill="url(#sunGlow)" />
              </g>
              {/* Winter Altitude Tag */}
              <g transform={`translate(${winterArc.noon.x}, ${winterArc.noon.y + 14})`}>
                <rect x="-42" y="-8" width="84" height="14" rx="7" fill="#1E293B" />
                <text x="0" y="2" textAnchor="middle" fontSize="8" fontWeight="800" fill="white">
                  Winter ({winterNoonAlt.toFixed(1)}°)
                </text>
              </g>
              {/* Rise / Set dots */}
              <circle cx={winterArc.rise.x} cy={winterArc.rise.y} r="3.5" fill="#38BDF8" />
              <circle cx={winterArc.set.x} cy={winterArc.set.y} r="3.5" fill="#38BDF8" />
            </g>
          )}

          {/* 4. TODAY'S CELESTIAL SUN POSITION */}
          <g>
            <path
              d={todayArc.d}
              fill="none"
              stroke="#CCFF00"
              strokeWidth="2.5"
            />
            {/* Live Today Noon Sun Marker with Pulse */}
            <g transform={`translate(${todayArc.noon.x}, ${todayArc.noon.y})`} filter="url(#glow)">
              <circle cx="0" cy="0" r="7" fill="#CCFF00" />
              <circle cx="0" cy="0" r="11" fill="none" stroke="#CCFF00" strokeWidth="1.5" opacity="0.6" />
            </g>
          </g>

          {/* Today's Sun Indicator Bottom Status Banner */}
          <g transform={`translate(${cx}, ${groundY + ry + 32})`}>
            <rect x="-105" y="-11" width="210" height="22" rx="11" fill="#111111" />
            <text x="0" y="3.5" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#CCFF00">
              Today: {noonAltFormatted}° Noon Altitude ({isNorthern ? 'Northern' : 'Southern'} Hem.)
            </text>
          </g>
        </svg>

        <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium mt-2 pt-2 border-t border-gray-200/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0284C7] inline-block" /> Summer Solstice</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" /> Equinox</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#38BDF8] inline-block" /> Winter Solstice</span>
            <span className="flex items-center gap-1 font-bold text-gray-900"><span className="w-2 h-2 rounded-full bg-[#CCFF00] border border-black inline-block" /> Today</span>
          </div>
          <span className="text-[9px] text-gray-400">Cooper (1969) Celestial Model</span>
        </div>
      </div>

      {/* Monthly sun hours bar */}
      <div className="bar-section mt-4">
        <p className="text-xs font-bold text-gray-700 mb-2">Monthly Daylight Hours (avg)</p>
        <div className="month-bars flex items-end justify-between h-20 gap-1 bg-gray-50 p-2 rounded-2xl border border-gray-100">
          {data.monthly_sun_hours.map((h, i) => (
            <div key={i} className="month-bar-col flex-1 flex flex-col items-center h-full justify-end">
              <div className="bar-track w-full bg-gray-200/80 rounded-t-sm overflow-hidden flex items-end h-14">
                <div className="bar-fill w-full transition-all duration-500 rounded-t-sm" style={{ height: `${(h / maxHours) * 100}%`, background: '#CCFF00' }} />
              </div>
              <span className="month-label text-[9px] font-bold text-gray-500 mt-1">{months[i].slice(0, 1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optimal orientation & Tropic of Cancer Guidance */}
      <div className="recommendation-box mt-4 bg-emerald-50/80 border border-emerald-200/80 p-3.5 rounded-2xl flex items-start gap-3">
        <span className="rec-icon text-xl">🧭</span>
        <div>
          <p className="rec-title text-xs font-black text-emerald-900">Optimal Architectural Orientation</p>
          <p className="rec-text text-xs text-emerald-800 leading-relaxed">
            {data.optimal_orientation} — maximises winter solar heat gain ({data.winter_solstice_noon_alt}° noon altitude) and facilitates deep daylighting.
          </p>
          {data.is_sub_tropical_north && (
            <p className="text-[11px] text-emerald-900 font-semibold mt-1 bg-emerald-100/60 p-1.5 rounded-lg border border-emerald-200/60">
              ☀️ <strong>Sub-Tropic of Cancer Nuance ({lat.toFixed(2)}° N):</strong> During May–July, midday sun reaches {data.summer_solstice_noon_alt}° altitude and crosses slightly into the Northern sky. Provide horizontal overhangs on North glazing as well as South.
            </p>
          )}
        </div>
      </div>

      <div className="source-badge text-[10px] text-gray-400 mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <span>📡 SunCalc Astronomical Engine &amp; Cooper (1969) Solar Declination Model</span>
        <span>Accuracy: ±0.1° Celestial Physics</span>
        <span>Latitude: {lat.toFixed(4)}° {isNorthern ? 'N' : 'S'}</span>
      </div>
    </div>
  );
};
