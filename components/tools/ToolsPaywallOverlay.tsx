// components/tools/ToolsPaywallOverlay.tsx — Premium Architectural Studio Paywall Modal
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { DODO_PRODUCTS } from '../../constants/dodoConfig';
import { getToolUser, isUserAdmin } from '../../utils/userAuth';
import { ShieldCheck, Zap, Sparkles, CheckCircle2, Globe, FileText, X, ArrowRight, Star } from 'lucide-react';

interface Props {
  isOpen?: boolean;
  trialDaysRemaining?: number;
  creditsRemaining?: number;
  userCountry?: string;
  onSubscribe?: (plan: 'monthly' | 'credits_10' | 'credits_50') => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onClose?: () => void;
  onUseFreeTrial?: () => void;
}

export const ToolsPaywallOverlay: React.FC<Props> = ({
  isOpen = true,
  trialDaysRemaining,
  creditsRemaining: propCredits,
  userCountry,
  onSubscribe,
  onLogin,
  onRegister,
  onClose,
  onUseFreeTrial,
}) => {
  const user = getToolUser();
  const isAdmin = isUserAdmin() || user?.is_admin || user?.role === 'admin';
  if (isAdmin) return null;

  const currentCredits = propCredits ?? (user ? user.credits_remaining : 0);
  const isExpired = user ? (currentCredits <= 0 && !user.is_subscribed) : false;

  const detectedCountry = userCountry || user?.country;
  const isIndia = detectedCountry ? detectedCountry === 'IN' : true; // Default to INR

  const monthlyPrice = isIndia ? DODO_PRODUCTS.pro_monthly.priceINR : DODO_PRODUCTS.pro_monthly.priceUSD;
  const topup10Price = isIndia ? DODO_PRODUCTS.topup_10.priceINR : DODO_PRODUCTS.topup_10.priceUSD;
  const topup50Price = isIndia ? DODO_PRODUCTS.topup_50.priceINR : DODO_PRODUCTS.topup_50.priceUSD;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSubscribe = (plan: 'monthly' | 'credits_10' | 'credits_50') => {
    if (onSubscribe) {
      onSubscribe(plan);
    } else {
      const product = plan === 'monthly' ? DODO_PRODUCTS.pro_monthly : plan === 'credits_50' ? DODO_PRODUCTS.topup_50 : DODO_PRODUCTS.topup_10;
      window.open(product.checkoutUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="paywall-overlay fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-scrollbar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            className="paywall-card bg-white text-gray-900 rounded-3xl p-5 sm:p-7 max-w-3xl w-full border border-gray-200/90 shadow-2xl space-y-6 my-auto relative no-scrollbar max-h-[94vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Unlock Anvitam Architectural Suite"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition cursor-pointer"
                aria-label="Close paywall"
              >
                <X size={18} />
              </button>
            )}

            {/* Header */}
            <div className="text-center space-y-2 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] text-[#CCFF00] text-xs font-bold shadow-xs">
                <span>{isExpired ? '🔒 Studio Credits Exhausted' : '⚡ Anvitam Architectural Studio'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {isExpired ? 'Refill Your Studio Credits to Render' : 'Unlock High-Precision AI Renders & 16+ Site Tools'}
              </h2>
              <p className="text-xs text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
                Get instant access to 3D sun shadow simulations, photorealistic spatial rendering, soil analytics, and CAD exports.
              </p>
            </div>

            {/* FREE TRIAL / FREE CREDITS CALLOUT BANNER */}
            {user && currentCredits > 0 ? (
              <div className="bg-[#CCFF00]/20 border border-black/20 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>You have {currentCredits} Free Credits Available!</span>
                  </div>
                  <p className="text-[11px] text-gray-700 font-medium">
                    Render your spatial brief right now without purchasing.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onUseFreeTrial) onUseFreeTrial();
                    else if (onClose) onClose();
                  }}
                  className="bg-[#111111] hover:bg-black text-[#CCFF00] font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm whitespace-nowrap cursor-pointer hover:scale-105 shrink-0 flex items-center gap-1"
                >
                  Use Free Credits <ArrowRight size={13} />
                </button>
              </div>
            ) : !user ? (
              <div className="bg-[#CCFF00]/20 border border-black/20 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>Get 3 Free Credits on Instant Sign Up</span>
                  </div>
                  <p className="text-[11px] text-gray-700 font-medium">
                    No credit card required. Test all studio tools in 10 seconds.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onRegister) onRegister();
                    else if (onLogin) onLogin();
                  }}
                  className="bg-[#111111] hover:bg-black text-[#CCFF00] font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm whitespace-nowrap cursor-pointer hover:scale-105 shrink-0 flex items-center gap-1"
                >
                  Start Free (3 Credits) <ArrowRight size={13} />
                </button>
              </div>
            ) : null}

            {/* 2 Tier Pricing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Starter Pack */}
              <div
                onClick={() => handleSubscribe('credits_10')}
                className="bg-gray-50/90 hover:bg-white border border-gray-200/90 hover:border-gray-900 rounded-2xl p-3 cursor-pointer transition-all flex flex-col justify-between group relative hover:shadow-md"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500">Pay-As-You-Go</span>
                    <span className="text-[9px] font-bold bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full">10 Creds</span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-gray-900">{topup10Price}</div>
                    <div className="text-xs font-bold text-gray-800">Starter Pack</div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-snug">Single project quick site report &amp; 3D render test.</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSubscribe('credits_10'); }}
                  className="mt-3 w-full bg-white border border-gray-300 text-gray-900 font-bold text-xs py-1.5 rounded-xl group-hover:bg-black group-hover:text-white transition cursor-pointer"
                >
                  Buy 10 ({topup10Price})
                </button>
              </div>


              {/* Option 3: Pro Monthly (120 Credits/mo) */}
              <div
                onClick={() => handleSubscribe('monthly')}
                className="bg-gradient-to-b from-gray-900 to-black text-white border-2 border-black rounded-2xl p-3 cursor-pointer transition-all flex flex-col justify-between relative shadow-xl hover:scale-[1.01] group overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-[#CCFF00] text-black text-[8px] font-extrabold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  Best Value
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#CCFF00] flex items-center gap-1">
                      <Star size={9} className="fill-[#CCFF00]" /> Pro Pass
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">
                      {monthlyPrice}
                      <span className="text-[10px] text-gray-400 font-medium"> / mo</span>
                    </div>
                    <div className="text-xs font-extrabold text-[#CCFF00] flex items-center gap-1">
                      <Zap size={11} className="fill-[#CCFF00]" /> 120 Credits / mo
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-300 leading-snug">Automatic monthly refill for commercial studios.</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSubscribe('monthly'); }}
                  className="mt-3 w-full bg-[#CCFF00] text-black font-extrabold text-xs py-1.5 rounded-xl group-hover:bg-white transition shadow-sm cursor-pointer"
                >
                  Subscribe ({monthlyPrice})
                </button>
              </div>
            </div>

            {/* Studio Included Capabilities */}
            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-gray-200/70 pb-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" /> 16+ Architectural Tools Included
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Instant Access
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>3D Sun &amp; Shadow:</strong> Azimuth &amp; seasonal path</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>Wind Rose Profiler:</strong> Speed bands &amp; vectors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>Soil &amp; Terrain Data:</strong> Texture &amp; pH profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span><strong>3D Massing Extruder:</strong> FAR density &amp; heights</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><FileText size={11} /> High-Res Client PDF Reports</span>
                <span className="flex items-center gap-1"><Globe size={11} /> Global Lat/Lng Mapping</span>
              </div>
            </div>

            {/* Footer actions */}
            <div className="text-center pt-1">
              {!user ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-bold">
                  <button
                    onClick={() => {
                      if (onRegister) onRegister();
                      else if (onLogin) onLogin();
                    }}
                    className="text-black bg-[#CCFF00] px-5 py-2.5 rounded-xl hover:bg-black hover:text-[#CCFF00] transition cursor-pointer shadow-xs"
                  >
                    Sign Up Free (3 Credits)
                  </button>
                  {onLogin && (
                    <button
                      onClick={onLogin}
                      className="text-gray-600 hover:text-black transition cursor-pointer underline underline-offset-4"
                    >
                      Already have an account? Sign in
                    </button>
                  )}
                </div>
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
