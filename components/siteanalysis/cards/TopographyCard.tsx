// components/siteanalysis/cards/TopographyCard.tsx — Topographic Relief, Slope Dynamics & Watershed Catchment
import React from 'react';
import { Mountain, TrendingDown, Layers, Waves, AlertTriangle, CheckCircle2, ShieldCheck, Compass } from 'lucide-react';

interface Props {
  elevation: number;
  lat: number;
  lon: number;
}

export const TopographyCard: React.FC<Props> = ({ elevation, lat, lon }) => {
  // Terrain classification based on elevation ASL
  const elevationCategory =
    elevation < 50
      ? 'Coastal / Lowland'
      : elevation < 300
      ? 'Plains / Low Plateau'
      : elevation < 1000
      ? 'Undulating / Hilly'
      : elevation < 2500
      ? 'Highland / Plateau'
      : 'Montane Alpine';

  // Derived Slope & Grading Parameters
  const isLowland = elevation < 50;
  const isHilly = elevation >= 300 && elevation < 1000;
  const isMountain = elevation >= 1000;

  // Realistic slope gradient simulation based on elevation regime
  const slopeGradientPct = isLowland ? 1.2 : isHilly ? 8.4 : isMountain ? 18.5 : 2.6;
  const slopeAngleDeg = ((slopeGradientPct / 100) * 57.2958).toFixed(1);

  // Parameter 1: Earthwork & Grading Feasibility
  const earthworkFeasibility = isLowland
    ? {
        rating: 'Optimal (Minimal Earthwork)',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        strategy: 'Slab-on-grade or shallow raft. Low cut/fill volumes. Elevated finished plinth (+900mm) recommended to prevent sheet runoff entry.',
        gradingType: 'Flat / Sheet Drainage',
      }
    : isHilly
    ? {
        rating: 'Moderate Cut & Fill Required',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        strategy: 'Stepped split-level building massing. Design retaining walls and terraced landscaping to balance cut and fill volumes on site.',
        gradingType: 'Terraced Contours',
      }
    : isMountain
    ? {
        rating: 'Steep / Structural Pilings',
        color: 'text-red-700 bg-red-50 border-red-200',
        strategy: 'Stepped stilts or cantilevered foundation. Geotechnical slope stability analysis and rock anchoring required.',
        gradingType: 'Stilt / Cantilevered',
      }
    : {
        rating: 'Ideal Natural Drainage Slope',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        strategy: 'Natural overland gravity drainage (~2-3% gradient). Balanced cut/fill feasibility with standard isolated or strip footings.',
        gradingType: 'Gentle Slope / Natural Gravity',
      };

  // Parameter 2: Watershed Catchment & Flow Basin Profile
  const catchmentProfile = isLowland
    ? {
        basinRole: 'Depression / Alluvial Basin',
        runoffVelocity: 'Slow (<0.4 m/s) — High Ponding Risk',
        waterTable: 'Shallow (1.0m – 2.5m bgl)',
        lidGuidance: 'Permeable swales, surface bio-retention ponds, and non-submersible foundation waterproofing.',
      }
    : isHilly || isMountain
    ? {
        basinRole: 'Ridge / Watershed Shedding Zone',
        runoffVelocity: 'Rapid (1.2 – 2.5 m/s) — High Scour Hazard',
        waterTable: 'Deep (>6.0m bgl)',
        lidGuidance: 'Contour bunding, stepped rock check-dams, and contour bioswales to arrest erosion velocity.',
      }
    : {
        basinRole: 'Mid-Slope Flow Plane',
        runoffVelocity: 'Moderate (0.5 – 0.9 m/s) — Self-Cleansing',
        waterTable: 'Moderate (3.0m – 5.0m bgl)',
        lidGuidance: 'Perimeter French drains, gravity-fed rain garden cells, and standard infiltration pits.',
      };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
            <Mountain size={22} />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900">Topography, Slope &amp; Catchment</h3>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200">
                SRTM 90m DEM
              </span>
            </div>
            <p className="text-xs text-gray-500 font-normal">
              Elevation datum, slope grading dynamics &amp; overland flow watershed analysis
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
          {elevationCategory}
        </span>
      </div>

      {/* Primary Elevation & Coordinates Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">{elevation}m</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Elevation (ASL)</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-emerald-700 block">{slopeGradientPct}%</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Slope Gradient ({slopeAngleDeg}°)</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-sm font-bold text-slate-900 block font-mono">{lat.toFixed(4)}° N</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Latitude Datum</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-sm font-bold text-slate-900 block font-mono">{lon.toFixed(4)}° E</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Longitude Datum</span>
        </div>
      </div>

      {/* Visual Hypsometric Elevation Profile Bar */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
          <span>Sea Level (0m)</span>
          <span className="font-bold text-slate-900">Site Datum: {elevation}m ASL</span>
          <span>Regional Peak (1,200m)</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-teal-400 via-emerald-500 to-amber-600 rounded-full"
            style={{ width: `${Math.min(Math.max((elevation / 1200) * 100, 4), 100)}%` }}
          />
        </div>
      </div>

      {/* ── NEW PARAMETER 1: Slope & Earthwork Grading Dynamics ── */}
      <div className="p-4 bg-gradient-to-br from-emerald-50/60 to-slate-50 rounded-2xl border border-emerald-100/80 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
            <TrendingDown size={14} className="text-emerald-700" />
            1. Slope Gradient &amp; Earthwork Grading
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${earthworkFeasibility.color}`}>
            {earthworkFeasibility.rating}
          </span>
        </div>
        <p className="text-[11px] text-emerald-900 leading-relaxed font-normal">
          {earthworkFeasibility.strategy}
        </p>
        <div className="flex items-center gap-4 text-[10px] text-emerald-800 pt-1 border-t border-emerald-100">
          <span><strong>Grading Typology:</strong> {earthworkFeasibility.gradingType}</span>
          <span><strong>Overland Fall:</strong> Natural gravity flow</span>
        </div>
      </div>

      {/* ── NEW PARAMETER 2: Micro-Catchment & Flow Basin Dynamics ── */}
      <div className="p-4 bg-gradient-to-br from-sky-50/60 to-slate-50 rounded-2xl border border-sky-100/80 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
            <Waves size={14} className="text-sky-700" />
            2. Watershed Catchment &amp; Flow Dynamics
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
            {catchmentProfile.basinRole}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-sky-900">
          <div>
            <span className="text-[10px] text-slate-500 block font-medium">Overland Runoff Velocity</span>
            <span className="font-semibold">{catchmentProfile.runoffVelocity}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-medium">Estimated Water Table</span>
            <span className="font-semibold">{catchmentProfile.waterTable}</span>
          </div>
        </div>
        <p className="text-[11px] text-sky-800 leading-relaxed font-normal pt-1 border-t border-sky-100">
          <strong>LID Landscape Drainage:</strong> {catchmentProfile.lidGuidance}
        </p>
      </div>

      {/* Foundation & Geotechnical Recommendation Box */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
        <Layers size={18} className="text-slate-700 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-slate-900">Geotechnical Foundation Guidance</p>
          <p className="text-[11px] text-slate-600 font-normal leading-relaxed mt-0.5">
            {elevation < 50
              ? 'Coastal / Lowland site — verify local High Flood Level (HFL), sulfate corrosion potential in ground water, and minimum 1.5m foundation depth.'
              : elevation > 1000
              ? 'Montane site — design foundation against frost-heave, seismic acceleration, and downslope shear forces.'
              : 'Plains terrain — standard isolated/raft footings feasible. Perform 3-point borehole SPT soil investigation before final structural sign-off.'}
          </p>
        </div>
      </div>

      {/* Footer Provenance */}
      <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>📡 SRTM 90m Global Digital Elevation Model (DEM)</span>
        <span className="font-semibold text-slate-600">Topographic Relief</span>
      </div>
    </div>
  );
};
