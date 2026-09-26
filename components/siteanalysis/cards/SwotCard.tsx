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
    <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4 text-gray-900 transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="p-2 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">Architectural SWOT Matrix</h3>
              <span className="text-[9px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-2 py-0.5 rounded-full">
                {category}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-normal">
              Microclimate, solar &amp; geotechnical synthesis
            </p>
          </div>
        </div>
      </div>

      {/* 4-Quadrant Compact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        
        {/* Quadrant 1: Strengths */}
        <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100/90 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-900 text-[11px] font-bold uppercase tracking-wider border-b border-emerald-200/50 pb-1">
            <Shield size={13} className="text-emerald-700" />
            <span>Strengths</span>
          </div>
          <div className="space-y-1.5">
            {data.strengths.slice(0, 2).map((item, idx) => (
              <div key={idx} className="bg-white p-2 rounded-xl border border-emerald-100/80 shadow-2xs space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] font-bold text-gray-900 truncate">{item.title}</p>
                  <span className="text-[8px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded shrink-0">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 leading-snug line-clamp-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 2: Weaknesses */}
        <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100/90 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-900 text-[11px] font-bold uppercase tracking-wider border-b border-amber-200/50 pb-1">
            <AlertCircle size={13} className="text-amber-700" />
            <span>Weaknesses</span>
          </div>
          <div className="space-y-1.5">
            {data.weaknesses.slice(0, 2).map((item, idx) => (
              <div key={idx} className="bg-white p-2 rounded-xl border border-amber-100/80 shadow-2xs space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] font-bold text-gray-900 truncate">{item.title}</p>
                  <span className="text-[8px] font-semibold text-amber-700 bg-amber-50 px-1 py-0.2 rounded shrink-0">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 leading-snug line-clamp-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 3: Opportunities */}
        <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100/90 space-y-2">
          <div className="flex items-center gap-1.5 text-sky-900 text-[11px] font-bold uppercase tracking-wider border-b border-sky-200/50 pb-1">
            <Lightbulb size={13} className="text-sky-700" />
            <span>Opportunities</span>
          </div>
          <div className="space-y-1.5">
            {data.opportunities.slice(0, 2).map((item, idx) => (
              <div key={idx} className="bg-white p-2 rounded-xl border border-sky-100/80 shadow-2xs space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] font-bold text-gray-900 truncate">{item.title}</p>
                  <span className="text-[8px] font-semibold text-sky-700 bg-sky-50 px-1 py-0.2 rounded shrink-0">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 leading-snug line-clamp-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 4: Threats */}
        <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100/90 space-y-2">
          <div className="flex items-center gap-1.5 text-rose-900 text-[11px] font-bold uppercase tracking-wider border-b border-rose-200/50 pb-1">
            <Zap size={13} className="text-rose-700" />
            <span>Threats</span>
          </div>
          <div className="space-y-1.5">
            {data.threats.slice(0, 2).map((item, idx) => (
              <div key={idx} className="bg-white p-2 rounded-xl border border-rose-100/80 shadow-2xs space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] font-bold text-gray-900 truncate">{item.title}</p>
                  <span className="text-[8px] font-semibold text-rose-700 bg-rose-50 px-1 py-0.2 rounded shrink-0">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 leading-snug line-clamp-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Synthesis Summary */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-start gap-2.5">
        <span className="text-base shrink-0 mt-0.5">🧭</span>
        <div>
          <p className="text-[11px] font-bold text-slate-900">Executive Design Synthesis</p>
          <p className="text-[10px] text-slate-600 font-normal leading-relaxed mt-0.5">{data.summary}</p>
        </div>
      </div>

      <div className="text-[9px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
        <span>Architectural Decision Engine</span>
        <span>Bioclimatic Matrix</span>
      </div>
    </div>
  );
};
