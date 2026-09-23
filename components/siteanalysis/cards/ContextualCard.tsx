// components/siteanalysis/cards/ContextualCard.tsx — Contextual Spatial Intelligence & Neighborhood Ecosystem Card
import React from 'react';
import type { ContextualData } from '../../../services/siteAnalysisService';
import { MapPin, Trees, Building2, Navigation, Train, Droplet, Landmark, CheckCircle2 } from 'lucide-react';

interface Props {
  data: ContextualData;
}

export const ContextualCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="analysis-card bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-6 text-gray-900 col-span-1 lg:col-span-2">
      
      {/* Header */}
      <div className="card-header flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="card-icon text-2xl p-2.5 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center">
            <MapPin size={22} />
          </span>
          <div>
            <h3 className="card-title text-base font-bold text-gray-900">Contextual Neighborhood &amp; Spatial Analysis</h3>
            <p className="card-subtitle text-xs text-gray-500 font-normal">
              Surrounding vegetation, settlements, mixed-use buildings, road hierarchy &amp; civic amenities
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 Key Spatial Context Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* 1. Green Canopy */}
        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100/90 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
            <Trees size={12} className="text-emerald-600" />
            <span>Green Cover</span>
          </div>
          <p className="text-lg font-black text-gray-900">{data.green_cover_pct}%</p>
          <p className="text-[10px] text-gray-500 leading-tight">{data.tree_canopy_density}</p>
        </div>

        {/* 2. Primary Settlement Mix */}
        <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100/90 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
            <Building2 size={12} className="text-blue-600" />
            <span>Land Use Mix</span>
          </div>
          <p className="text-lg font-black text-gray-900">{data.settlement_breakdown.residential_pct}% Res</p>
          <p className="text-[10px] text-gray-500 leading-tight">{data.settlement_breakdown.commercial_pct}% Comm · {data.settlement_breakdown.mixed_use_pct}% Mix</p>
        </div>

        {/* 3. Road Hierarchy */}
        <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-100/90 space-y-1">
          <div className="flex items-center gap-1.5 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
            <Navigation size={12} className="text-purple-600" />
            <span>Road Access</span>
          </div>
          <p className="text-lg font-black text-gray-900">{data.road_connectivity.rating}</p>
          <p className="text-[10px] text-gray-500 leading-tight truncate">{data.road_connectivity.access_road_type.split('(')[0]}</p>
        </div>

        {/* 4. Transit Proximity */}
        <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100/90 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
            <Train size={12} className="text-amber-600" />
            <span>Transit Hub</span>
          </div>
          <p className="text-lg font-black text-gray-900">{data.railway_transit.distance_km} km</p>
          <p className="text-[10px] text-gray-500 leading-tight truncate">{data.railway_transit.name}</p>
        </div>

      </div>

      {/* Surrounding Settlement Breakdown Progress Bar */}
      <div className="space-y-1.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
          <span>Neighboring Land Use &amp; Building Distribution</span>
          <span className="text-[10px] text-gray-400">Within 1000m radius</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5 bg-gray-200">
          <div style={{ width: `${data.settlement_breakdown.residential_pct}%` }} className="bg-emerald-500" title={`Residential: ${data.settlement_breakdown.residential_pct}%`} />
          <div style={{ width: `${data.settlement_breakdown.commercial_pct}%` }} className="bg-blue-500" title={`Commercial: ${data.settlement_breakdown.commercial_pct}%`} />
          <div style={{ width: `${data.settlement_breakdown.mixed_use_pct}%` }} className="bg-purple-500" title={`Mixed-use: ${data.settlement_breakdown.mixed_use_pct}%`} />
          <div style={{ width: `${data.settlement_breakdown.other_pct}%` }} className="bg-amber-400" title={`Civic / Open: ${data.settlement_breakdown.other_pct}%`} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium pt-0.5 flex-wrap gap-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Residential ({data.settlement_breakdown.residential_pct}%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Commercial ({data.settlement_breakdown.commercial_pct}%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Mixed-use ({data.settlement_breakdown.mixed_use_pct}%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Civic &amp; Open ({data.settlement_breakdown.other_pct}%)</span>
        </div>
      </div>

      {/* Surrounding Amenities & Civic Infrastructure */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Nearby Amenities, Markets &amp; Facilities
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {data.amenities.map((amenity, idx) => (
            <div key={idx} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition flex items-start gap-2.5">
              <span className="text-lg">{amenity.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{amenity.name}</p>
                <p className="text-[10px] text-gray-500 font-mono">{amenity.distance_m}m away</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Water Bodies & Ingress/Egress Logistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        
        <div className="recommendation-box p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
          <span className="rec-icon text-lg">
            <Droplet size={18} className="text-sky-600" />
          </span>
          <div>
            <p className="rec-title text-xs font-bold text-gray-900">Water Bodies &amp; Drainage</p>
            <p className="rec-text text-[11px] text-gray-600 font-normal leading-relaxed mt-0.5">
              {data.water_bodies.present
                ? `${data.water_bodies.type} detected ${data.water_bodies.distance_m}m from plot boundary. ${data.water_bodies.flood_buffer_required ? 'Ensure mandatory 15-30m green riparian buffer.' : 'Adequate natural buffer present.'}`
                : 'No surface water body within immediate 500m plot periphery.'}
            </p>
          </div>
        </div>

        <div className="recommendation-box p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
          <span className="rec-icon text-lg">
            <Landmark size={18} className="text-purple-600" />
          </span>
          <div>
            <p className="rec-title text-xs font-bold text-gray-900">Ingress / Egress &amp; Road ROW</p>
            <p className="rec-text text-[11px] text-gray-600 font-normal leading-relaxed mt-0.5">
              {data.road_connectivity.ingress_egress_notes}
            </p>
          </div>
        </div>

      </div>

      <div className="source-badge text-[10px] text-gray-400 flex items-center gap-2 pt-1 border-t border-gray-100">
        <span>📡 OpenStreetMap Overpass Spatial Engine</span>
        <span>·</span>
        <span>Neighborhood POI Matrix</span>
        <span>·</span>
        <span>1000m Buffer GeoJSON Query</span>
      </div>
    </div>
  );
};
