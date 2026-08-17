// components/siteanalysis/ShadowSimulator3D.tsx — Phase 2 Client-Side 3D Solar Shadow Simulator
import React, { useState, useEffect } from 'react';
import { Sun, Clock, Calendar, ShieldAlert, Sparkles, Sliders, Layers, Play, Pause, RefreshCw } from 'lucide-react';
import * as SunCalc from 'suncalc';

interface ShadowSimulator3DProps {
  lat: number;
  lon: number;
  buildingHeightMeters?: number;
  onLightChange?: (sunPosition: { azimuth: number; altitude: number; position: [number, number, number] }) => void;
}

export const ShadowSimulator3D: React.FC<ShadowSimulator3DProps> = ({
  lat,
  lon,
  buildingHeightMeters = 12,
  onLightChange,
}) => {
  const [hour, setHour] = useState<number>(14); // 2:00 PM default
  const [season, setSeason] = useState<'summer' | 'equinox' | 'winter'>('summer');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [calculatedSun, setCalculatedSun] = useState<{
    azimuthDeg: number;
    altitudeDeg: number;
    shadowLengthMultiplier: number;
    solarRadiationKwh: number;
  }>({ azimuthDeg: 210, altitudeDeg: 45, shadowLengthMultiplier: 1, solarRadiationKwh: 4.8 });

  // Season dates
  const getSeasonDate = (s: 'summer' | 'equinox' | 'winter') => {
    const year = new Date().getFullYear();
    if (s === 'summer') return new Date(year, 5, 21); // June 21 Solstice
    if (s === 'winter') return new Date(year, 11, 21); // Dec 21 Solstice
    return new Date(year, 2, 21); // March 21 Equinox
  };

  // Calculate sun position & shadow physics client-side
  useEffect(() => {
    const date = getSeasonDate(season);
    date.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

    const sunPos = SunCalc.getPosition(date, lat, lon);
    const azimuthDeg = Math.round(((sunPos.azimuth * 180) / Math.PI + 180) % 360);
    const altitudeDeg = Math.round((sunPos.altitude * 180) / Math.PI);

    // Shadow length multiplier: height / tan(altitude)
    const radAlt = Math.max(0.05, sunPos.altitude);
    const shadowMult = Math.min(10, Math.max(0.1, 1 / Math.tan(radAlt)));

    // Solar radiation estimation based on solar altitude
    const radKwh = altitudeDeg > 0 ? parseFloat((Math.sin(radAlt) * 6.5).toFixed(1)) : 0;

    setCalculatedSun({
      azimuthDeg,
      altitudeDeg,
      shadowLengthMultiplier: parseFloat(shadowMult.toFixed(2)),
      solarRadiationKwh: radKwh,
    });

    if (onLightChange) {
      const r = 1.5;
      const mapboxAzimuth = (azimuthDeg + 180) % 360;
      const mapboxAltitude = Math.max(5, altitudeDeg);
      onLightChange({
        azimuth: azimuthDeg,
        altitude: altitudeDeg,
        position: [r, mapboxAzimuth, mapboxAltitude],
      });
    }
  }, [hour, season, lat, lon, onLightChange]);

  // Animated solar time-lapse
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setHour((prev) => {
          if (prev >= 18.5) {
            setIsPlaying(false);
            return 6;
          }
          return parseFloat((prev + 0.25).toFixed(2));
        });
      }, 250);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const estimatedShadowLength = Math.round(buildingHeightMeters * calculatedSun.shadowLengthMultiplier);

  return (
    <div className="bg-white text-gray-900 p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black text-[#CCFF00] flex items-center justify-center font-bold">
            <Sun size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Phase 2: 3D Solar Shadow Simulator
              <span className="text-[9px] bg-black text-[#CCFF00] px-2 py-0.5 rounded-full font-bold">
                Interactive
              </span>
            </h4>
            <p className="text-[11px] text-gray-500 font-normal">
              Simulates solar rays, shadow casting &amp; roof solar heat gain in real-time.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            isPlaying
              ? 'bg-amber-400 text-black shadow-sm animate-pulse'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          {isPlaying ? 'Pause Time-Lapse' : 'Play Time-Lapse'}
        </button>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
        {/* Time Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 font-semibold flex items-center gap-1">
              <Clock size={13} className="text-black" /> Time of Day
            </span>
            <span className="font-mono font-bold text-black bg-white px-2 py-0.5 rounded-md border border-gray-200">
              {Math.floor(hour).toString().padStart(2, '0')}:
              {Math.round((hour % 1) * 60)
                .toString()
                .padStart(2, '0')}{' '}
              {hour >= 12 ? 'PM' : 'AM'}
            </span>
          </div>
          <input
            type="range"
            min={6}
            max={19}
            step={0.25}
            value={hour}
            onChange={(e) => setHour(parseFloat(e.target.value))}
            className="w-full accent-black cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>6:00 AM (Sunrise)</span>
            <span>12:00 PM (Noon)</span>
            <span>7:00 PM (Sunset)</span>
          </div>
        </div>

        {/* Season Selector */}
        <div className="space-y-2">
          <span className="text-xs text-gray-600 font-semibold flex items-center gap-1">
            <Calendar size={13} className="text-black" /> Seasonal Preset
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'summer', label: 'Summer Solstice (June 21)' },
              { id: 'equinox', label: 'Equinox (March/Sept)' },
              { id: 'winter', label: 'Winter Solstice (Dec 21)' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSeason(item.id as any)}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition text-center cursor-pointer ${
                  season === item.id
                    ? 'bg-black text-[#CCFF00] shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Physics Readouts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sun Altitude</p>
          <p className="text-lg font-mono font-bold text-gray-900 mt-0.5">
            {calculatedSun.altitudeDeg > 0 ? `${calculatedSun.altitudeDeg}°` : '0° (Night)'}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sun Azimuth</p>
          <p className="text-lg font-mono font-bold text-gray-900 mt-0.5">
            {calculatedSun.azimuthDeg}°
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Shadow Projection</p>
          <p className="text-lg font-mono font-bold text-gray-900 mt-0.5">
            {calculatedSun.altitudeDeg > 0 ? `~${estimatedShadowLength}m` : 'Infinite (Night)'}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Solar Radiation</p>
          <p className="text-lg font-mono font-bold text-emerald-700 mt-0.5">
            {calculatedSun.solarRadiationKwh} kWh/m²
          </p>
        </div>
      </div>
    </div>
  );
};
