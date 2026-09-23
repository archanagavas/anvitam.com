// components/siteanalysis/cards/SwotCard.tsx — 4-Quadrant Architectural & Ecological SWOT Matrix Card
import React from 'react';
import type { SwotAnalysisData, DesignCategory } from '../../../services/siteAnalysisService';
import { Sparkles, Shield, AlertCircle, Lightbulb, Zap } from 'lucide-react';

interface Props {
  data: SwotAnalysisData;
  category: DesignCategory;
}

export const SwotCard: React.FC<Props> = ({ data, category }) => {
  return (
    <div className="analysis-card bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-6 text-gray-900 col-span-1 lg:col-span-2">
      
      {/* Header */}
      <div className="card-header flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="card-icon text-2xl p-2.5 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center">
            <Sparkles size={22} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="card-title text-base font-bold text-gray-900">Architectural &amp; Ecological SWOT Matrix</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-2.5 py-0.5 rounded-full">
                {category}
              </span>
            </div>
            <p className="card-subtitle text-xs text-gray-500 font-normal">
              Synthesis of microclimate, topography, orientation, and geotechnical constraints
            </p>
          </div>
        </div>
      </div>

      {/* 4-Quadrant Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Quadrant 1: Strengths */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/90 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-200/60 text-emerald-900">
            <Shield size={16} className="text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Strengths (Site Advantages)</h4>
          </div>
          <div className="space-y-2.5">
            {data.strengths.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-100/80 shadow-2xs space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-gray-900">{item.title}</p>
                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-md">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 2: Weaknesses */}
        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100/90 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-200/60 text-amber-900">
            <AlertCircle size={16} className="text-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Weaknesses (Microclimate Constraints)</h4>
          </div>
          <div className="space-y-2.5">
            {data.weaknesses.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-100/80 shadow-2xs space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-gray-900">{item.title}</p>
                  <span className="text-[9px] font-semibold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded-md">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 3: Opportunities */}
        <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100/90 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-sky-200/60 text-sky-900">
            <Lightbulb size={16} className="text-sky-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Opportunities (Passive Design Interventions)</h4>
          </div>
          <div className="space-y-2.5">
            {data.opportunities.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-sky-100/80 shadow-2xs space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-gray-900">{item.title}</p>
                  <span className="text-[9px] font-semibold text-sky-700 bg-sky-100/70 px-1.5 py-0.2 rounded-md">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 4: Threats */}
        <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100/90 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-rose-200/60 text-rose-900">
            <Zap size={16} className="text-rose-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Threats (Environmental &amp; Structural Risks)</h4>
          </div>
          <div className="space-y-2.5">
            {data.threats.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-rose-100/80 shadow-2xs space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-gray-900">{item.title}</p>
                  <span className="text-[9px] font-semibold text-rose-700 bg-rose-100/70 px-1.5 py-0.2 rounded-md">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Synthesis Summary */}
      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
        <span className="text-lg">🧭</span>
        <div>
          <p className="text-xs font-bold text-gray-900">Executive Design Synthesis</p>
          <p className="text-[11px] text-gray-600 font-normal leading-relaxed mt-0.5">{data.summary}</p>
        </div>
      </div>

      <div className="source-badge text-[10px] text-gray-400 flex items-center gap-2 pt-1 border-t border-gray-100">
        <span>Architectural Decision Engine</span>
        <span>·</span>
        <span>Multi-parameter Bioclimatic Matrix</span>
      </div>
    </div>
  );
};
