// components/tools/ToolsPaywallOverlay.tsx — Clear Deliverables & 2-Tier Dodo Paywall
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { DODO_PRODUCTS } from '../../constants/dodoConfig';
import { getToolUser } from '../../utils/userAuth';
import { ShieldCheck, Zap, Sparkles, CheckCircle2, Globe, FileText, Compass, Layers, X, ArrowRight } from 'lucide-react';

interface Props {
  isOpen?: boolean;
  trialDaysRemaining?: number;
  creditsRemaining?: number;
  userCountry?: string;
  onSubscribe?: (plan: 'monthly' | 'credits_10') => void;
  onLogin?: () => void;
  onClose?: () => void;
  onUseFreeTrial?: () => void;
}

export const ToolsPaywallOverlay: React.FC<Props> = ({
  isOpen = true,
  trialDaysRemaining,
  creditsRemaining: propCredits,
  userCountry = 'IN',
  onSubscribe,
  onLogin,
  onClose,
  onUseFreeTrial,
}) => {
  const user = getToolUser();
  const currentCredits = propCredits ?? user?.credits_remaining ?? 5;
  const daysLeft = trialDaysRemaining ?? user?.trial_days_remaining ?? 15;
  const isExpired = currentCredits <= 0 && !user?.is_subscribed;

  const isIndia = userCountry === 'IN' || Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Kolkata');
  const monthlyPrice = isIndia ? DODO_PRODUCTS.pro_monthly.priceINR : DODO_PRODUCTS.pro_monthly.priceUSD;
  const topupPrice = isIndia ? DODO_PRODUCTS.topup_10.priceINR : DODO_PRODUCTS.topup_10.priceUSD;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubscribe = (plan: 'monthly' | 'credits_10') => {
    if (onSubscribe) {
      onSubscribe(plan);
    } else {
      const product = plan === 'monthly' ? DODO_PRODUCTS.pro_monthly : DODO_PRODUCTS.topup_10;
      window.open(product.checkoutUrl, '_blank');
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="paywall-overlay fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            className="paywall-card bg-white text-gray-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 shadow-2xl space-y-5 my-auto relative max-h-[92vh] overflow-y-auto"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition cursor-pointer"
                aria-label="Close paywall"
              >
                <X size={18} />
              </button>
            )}

            {/* Header */}
            <div className="text-center space-y-1.5 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#CCFF00] font-black text-xl flex items-center justify-center mx-auto shadow-md">
                {isExpired ? '🔒' : '⚡'}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {isExpired ? 'Studio Credits Exhausted' : 'Unlock Anvitam Architectural Suite'}
              </h2>
              <p className="text-xs text-gray-600 font-normal max-w-sm mx-auto leading-relaxed">
                Get instant access to 16+ site intelligence, 3D massing, climate &amp; soil analysis tools for architects &amp; planners.
              </p>
            </div>

            {/* FREE TRIAL / FREE CREDITS CALLOUT BANNER */}
            {currentCredits > 0 ? (
              <div className="bg-[#CCFF00]/20 border-2 border-black/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Sparkles size={15} className="text-amber-600" />
                    <span>You have {currentCredits} Free Trial Credits!</span>
                  </div>
                  <p className="text-[11px] text-gray-700 mt-0.5 font-normal">
                    Test any of our 16 architectural tools for free right now.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onUseFreeTrial) onUseFreeTrial();
                    else if (onClose) onClose();
                  }}
                  className="bg-[#111111] hover:bg-black text-[#CCFF00] font-bold text-xs px-4 py-2.5 rounded-full transition shadow-sm whitespace-nowrap cursor-pointer hover:scale-105 shrink-0 flex items-center gap-1"
                >
                  Use Free Credits <ArrowRight size={13} />
                </button>
              </div>
            ) : !user ? (
              <div className="bg-[#CCFF00]/20 border-2 border-black/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Sparkles size={15} className="text-amber-600" />
                    <span>Get 5 Free Credits on Signup</span>
                  </div>
                  <p className="text-[11px] text-gray-700 mt-0.5 font-normal">
                    No credit card needed. Start testing tools in 10 seconds.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onLogin) onLogin();
                  }}
                  className="bg-[#111111] hover:bg-black text-[#CCFF00] font-bold text-xs px-4 py-2.5 rounded-full transition shadow-sm whitespace-nowrap cursor-pointer hover:scale-105 shrink-0 flex items-center gap-1"
                >
                  Start Free (5 Credits) <ArrowRight size={13} />
                </button>
              </div>
            ) : null}

            {/* 2 Product Options: 10 Credits Top-Up vs Pro Monthly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option 1: 10 Credits Top-Up (Pay-As-You-Go) */}
              <div
                onClick={() => handleSubscribe('credits_10')}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Pay-As-You-Go</span>
                    <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">One-Time</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 my-2">{topupPrice}</div>
                  <div className="text-xs font-bold text-gray-800">10 Studio Credits</div>
                  <p className="text-[10px] text-gray-500 mt-1 font-normal leading-relaxed">Ideal for single site analysis or quick project reports.</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSubscribe('credits_10'); }}
                  className="mt-4 w-full bg-white border border-gray-300 text-gray-900 font-bold text-xs py-2.5 rounded-xl group-hover:bg-black group-hover:text-white transition cursor-pointer"
                >
                  Get 10 Credits ({topupPrice})
                </button>
              </div>

              {/* Option 2: Pro Monthly (250 Credits/mo) */}
              <div
                onClick={() => handleSubscribe('monthly')}
                className="bg-[#111111] text-white border-2 border-black rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between relative shadow-lg group overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-[#CCFF00] text-black text-[9px] font-bold px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider">
                  Best Value
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#CCFF00]">Pro Subscription</span>
                  </div>
                  <div className="text-2xl font-bold text-white my-2">
                    {monthlyPrice}
                    <span className="text-xs text-gray-400 font-normal"> / month</span>
                  </div>
                  <div className="text-xs font-bold text-[#CCFF00] flex items-center gap-1">
                    <Zap size={14} /> 250 Studio Credits / month
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-normal leading-relaxed">Refilled automatically every 30 days for active studios.</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSubscribe('monthly'); }}
                  className="mt-4 w-full bg-[#CCFF00] text-black font-bold text-xs py-2.5 rounded-xl group-hover:bg-white transition shadow-sm cursor-pointer"
                >
                  Subscribe Pro ({monthlyPrice}/mo) →
                </button>
              </div>
            </div>

            {/* What We Provide to End Users (Clear Deliverables) */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" /> What Anvitam Studio Delivers
                </span>
                <span className="text-[10px] font-bold text-gray-500">16+ Tools Included</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 font-normal">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Automated Solar Path:</strong> Sun angles, azimuth &amp; 3D shadow simulations.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Wind Rose Profiler:</strong> Directional wind vectors &amp; seasonal speed bands.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>SoilGrids Data:</strong> Soil texture (sand/clay %), bulk density &amp; pH profile.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Elevation &amp; Slopes:</strong> Contour maps, terrain gradients &amp; cut/fill feasibility.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>3D Massing Drawer:</strong> Interactive building height extrusion &amp; FAR density.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Bioclimatic Guide:</strong> Passive thermal comfort &amp; microclimate strategies.</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500 font-normal">
                <span className="flex items-center gap-1"><FileText size={12} /> High-Res Client PDF Exports</span>
                <span className="flex items-center gap-1"><Globe size={12} /> Global Location Coordinates</span>
              </div>
            </div>

            {/* Footer actions */}
            <div className="space-y-2 pt-1 text-center">
              {!user ? (
                <button
                  onClick={onLogin}
                  className="text-xs font-bold text-gray-600 hover:text-black transition cursor-pointer underline underline-offset-4"
                >
                  Already have an account? Sign in
                </button>
              ) : onClose ? (
                <button
                  onClick={onClose}
                  className="text-xs font-semibold text-gray-500 hover:text-black transition cursor-pointer"
                >
                  Continue to Studio Workspace →
                </button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
