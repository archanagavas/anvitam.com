// components/siteanalysis/cards/ContextualCard.tsx — Contextual Spatial Intelligence & Neighborhood Ecosystem Card
import React from 'react';
import type { ContextualData } from '../../../services/siteAnalysisService';
import { MapPin, Trees, Building2, Navigation, Train, Droplet, Landmark } from 'lucide-react';

interface Props {
  data: ContextualData;
}

export const ContextualCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="p-2 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center shrink-0">
            <MapPin size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Contextual Neighborhood Ecosystem</h3>
            <p className="text-[11px] text-gray-500 font-normal">
              Canopy, land-use zoning &amp; 1000m civic infrastructure
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 Key Spatial Context Highlights */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* 1. Green Canopy */}
        <div className="p-2.5 bg-emerald-50/70 rounded-2xl border border-emerald-100/90">
          <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
            <Trees size={12} className="text-emerald-600" />
            <span>Green Canopy</span>
          </div>
          <p className="text-base font-black text-gray-900 mt-0.5">{data.green_cover_pct}%</p>
          <p className="text-[10px] text-gray-500 truncate">{data.tree_canopy_density}</p>
        </div>

        {/* 2. Primary Settlement Mix */}
        <div className="p-2.5 bg-blue-50/70 rounded-2xl border border-blue-100/90">
          <div className="flex items-center gap-1.5 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
            <Building2 size={12} className="text-blue-600" />
            <span>Settlement</span>
          </div>
          <p className="text-base font-black text-gray-900 mt-0.5">{data.settlement_breakdown.residential_pct}% Res</p>
          <p className="text-[10px] text-gray-500 truncate">{data.settlement_breakdown.commercial_pct}% Comm · {data.settlement_breakdown.mixed_use_pct}% Mix</p>
        </div>

        {/* 3. Road Hierarchy */}
        <div className="p-2.5 bg-purple-50/70 rounded-2xl border border-purple-100/90">
          <div className="flex items-center gap-1.5 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
            <Navigation size={12} className="text-purple-600" />
            <span>Road Access</span>
          </div>
          <p className="text-base font-black text-gray-900 mt-0.5">{data.road_connectivity.rating}</p>
          <p className="text-[10px] text-gray-500 truncate">{data.road_connectivity.access_road_type.split('(')[0]}</p>
        </div>

        {/* 4. Transit Proximity */}
        <div className="p-2.5 bg-amber-50/70 rounded-2xl border border-amber-100/90">
          <div className="flex items-center gap-1.5 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
            <Train size={12} className="text-amber-600" />
            <span>Transit Hub</span>
          </div>
          <p className="text-base font-black text-gray-900 mt-0.5">{data.railway_transit.distance_km} km</p>
          <p className="text-[10px] text-gray-500 truncate">{data.railway_transit.name}</p>
        </div>

      </div>

      {/* Surrounding Settlement Breakdown Progress Bar */}
      <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
          <span>Land Use Distribution</span>
          <span className="text-[9px] text-gray-400">1000m Buffer</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 bg-gray-200">
          <div style={{ width: `${data.settlement_breakdown.residential_pct}%` }} className="bg-emerald-500" title={`Residential: ${data.settlement_breakdown.residential_pct}%`} />
          <div style={{ width: `${data.settlement_breakdown.commercial_pct}%` }} className="bg-blue-500" title={`Commercial: ${data.settlement_breakdown.commercial_pct}%`} />
          <div style={{ width: `${data.settlement_breakdown.mixed_use_pct}%` }} className="bg-purple-500" title={`Mixed-use: ${data.settlement_breakdown.mixed_use_pct}%`} />
          <div style={{ width: `${data.settlement_breakdown.other_pct}%` }} className="bg-amber-400" title={`Civic / Open: ${data.settlement_breakdown.other_pct}%`} />
        </div>
        <div className="flex items-center justify-between text-[9px] text-gray-500 font-medium pt-0.5 flex-wrap gap-1">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Res {data.settlement_breakdown.residential_pct}%</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Comm {data.settlement_breakdown.commercial_pct}%</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Mix {data.settlement_breakdown.mixed_use_pct}%</span>
        </div>
      </div>

      {/* Surrounding Amenities */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Nearby Amenities (Within 1km)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {data.amenities.slice(0, 4).map((amenity, idx) => (
            <div key={idx} className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 min-w-0">
              <span className="text-sm shrink-0">{amenity.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-gray-900 truncate">{amenity.name}</p>
                <p className="text-[9px] text-gray-500 font-mono">{amenity.distance_m}m away</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Water Bodies & Ingress/Egress Logistics */}
      <div className="space-y-2 pt-1 border-t border-gray-100 text-[11px] text-gray-600">
        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <Droplet size={14} className="text-sky-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            {data.water_bodies.present
              ? `${data.water_bodies.type} detected ${data.water_bodies.distance_m}m away. Ensure riparian buffer.`
              : 'No major surface water body within immediate 500m periphery.'}
          </p>
        </div>
      </div>

      <div className="text-[9px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>📡 OpenStreetMap Spatial Query</span>
        <span>1000m Buffer GeoJSON</span>
      </div>
    </div>
  );
};
