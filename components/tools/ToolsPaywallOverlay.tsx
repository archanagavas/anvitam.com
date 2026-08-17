// components/tools/ToolsPaywallOverlay.tsx — Clear Deliverables & 2-Tier Dodo Paywall
import React from 'react';
import { motion } from 'motion/react';
import { DODO_PRODUCTS } from '../../constants/dodoConfig';
import { ShieldCheck, Zap, Sparkles, CheckCircle2, Globe, FileText, Compass, Layers } from 'lucide-react';

interface Props {
  trialDaysRemaining: number;
  userCountry?: string;
  onSubscribe: (plan: 'monthly' | 'credits_10') => void;
  onLogin: () => void;
}

export const ToolsPaywallOverlay: React.FC<Props> = ({ trialDaysRemaining, userCountry = 'IN', onSubscribe, onLogin }) => {
  const isExpired = trialDaysRemaining <= 0;
  const isIndia = userCountry === 'IN' || Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Kolkata');

  // PPP regional pricing
  const monthlyPrice = isIndia ? DODO_PRODUCTS.pro_monthly.priceINR : DODO_PRODUCTS.pro_monthly.priceUSD;
  const topupPrice = isIndia ? DODO_PRODUCTS.topup_10.priceINR : DODO_PRODUCTS.topup_10.priceUSD;

  return (
    <motion.div
      className="paywall-overlay fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="paywall-card bg-white text-gray-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 shadow-2xl space-y-6 my-auto"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#CCFF00] font-black text-xl flex items-center justify-center mx-auto shadow-md">
            {isExpired ? '🔒' : '⚡'}
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {isExpired ? 'Studio Credits Exhausted' : 'Unlock Anvitam Architectural Suite'}
          </h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Get instant access to 16+ site intelligence, 3D massing, climate & soil analysis tools for architects & planners.
          </p>
        </div>

        {/* 2 Product Options: 10 Credits Top-Up vs Pro Monthly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option 1: 10 Credits Top-Up (Pay-As-You-Go) */}
          <div
            onClick={() => onSubscribe('credits_10')}
            className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between group relative"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Pay-As-You-Go</span>
                <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">One-Time</span>
              </div>
              <div className="text-2xl font-black text-gray-900 my-2">{topupPrice}</div>
              <div className="text-xs font-bold text-gray-700">10 Studio Credits</div>
              <p className="text-[10px] text-gray-500 mt-1">Ideal for single site analysis projects or occasional top-ups.</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSubscribe('credits_10'); }}
              className="mt-4 w-full bg-white border border-gray-300 text-gray-900 font-bold text-xs py-2 rounded-xl group-hover:bg-black group-hover:text-white transition"
            >
              Get 10 Credits ({topupPrice})
            </button>
          </div>

          {/* Option 2: Pro Monthly (250 Credits/mo) */}
          <div
            onClick={() => onSubscribe('monthly')}
            className="bg-[#111111] text-white border-2 border-black rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between relative shadow-lg group overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-[#CCFF00] text-black text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider">
              Best Value
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#CCFF00]">Pro Subscription</span>
              </div>
              <div className="text-2xl font-black text-white my-2">
                {monthlyPrice}
                <span className="text-xs text-gray-400 font-normal"> / month</span>
              </div>
              <div className="text-xs font-black text-[#CCFF00] flex items-center gap-1">
                <Zap size={14} /> 250 Studio Credits / month
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Refilled automatically every 30 days for active studios.</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSubscribe('monthly'); }}
              className="mt-4 w-full bg-[#CCFF00] text-black font-black text-xs py-2 rounded-xl group-hover:bg-white transition shadow-sm"
            >
              Subscribe Pro ({monthlyPrice}/mo) →
            </button>
          </div>
        </div>

        {/* What We Provide to End Users (Clear Deliverables) */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> What Anvitam Studio Delivers
            </span>
            <span className="text-[10px] font-bold text-gray-500">16+ Tools Included</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Automated Solar Path:</strong> Sun angles, azimuth & 3D shadow simulations.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Wind Rose Profiler:</strong> Directional wind vectors & seasonal speed bands.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>SoilGrids Data:</strong> Soil texture (sand/clay %), bulk density & pH profile.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Elevation & Slopes:</strong> Contour maps, terrain gradients & cut/fill feasibility.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>3D Massing Drawer:</strong> Interactive building height extrusion & FAR density.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Bioclimatic Guide:</strong> Passive thermal comfort & microclimate strategies.</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><FileText size={12} /> High-Res Client PDF Exports</span>
            <span className="flex items-center gap-1"><Globe size={12} /> Global Location Coordinates</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onLogin}
            className="w-full text-center text-xs font-bold text-gray-500 hover:text-black transition cursor-pointer"
          >
            Already have an active plan or credits? Sign in
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
