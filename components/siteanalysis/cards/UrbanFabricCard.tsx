// components/siteanalysis/cards/UrbanFabricCard.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { UrbanFabricData } from '../../../services/siteAnalysisService';
import { Building2 } from 'lucide-react';

interface Props { data: UrbanFabricData; }

export const UrbanFabricCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="p-2 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 size={18} />
          </span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">Urban Fabric &amp; Density</h3>
              <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                OSM 500m Buffer
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-normal">
              Building heights, footprints &amp; street grid
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">{data.building_count}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Buildings</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-purple-600 block">{data.building_density_pct}%</span>
          <span className="text-[10px] text-slate-500 font-medium block">Built Density</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">{data.avg_height_m}m</span>
          <span className="text-[10px] text-slate-500 font-medium block">Avg Height</span>
        </div>
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <span className="text-base font-black text-slate-900 block">{data.max_height_m}m</span>
          <span className="text-[10px] text-slate-500 font-medium block">Max Height</span>
        </div>
      </div>

      <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between text-[11px] text-purple-900">
        <span className="font-semibold">Street Grid Typology:</span>
        <span className="font-bold bg-white px-2 py-0.5 rounded-lg border border-purple-200/60 shadow-2xs">
          {data.street_grid_type}
        </span>
      </div>

      {/* Chart */}
      <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">
          Surrounding Height Distribution
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data.context_heights} margin={{ top: 0, right: 5, bottom: 0, left: -25 }}>
            <XAxis dataKey="range" tick={{ fontSize: 8, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '11px' }} formatter={(v: number) => [`${v} buildings`, 'Count']} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[9px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>📡 OpenStreetMap Overpass Live API</span>
        <span>Urban Morphology</span>
      </div>
    </div>
  );
};
