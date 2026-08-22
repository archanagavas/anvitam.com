// components/tools/ToolsSettingsModal.tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Zap, User, LogOut, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import { ToolUser, logoutToolUser } from '../../utils/userAuth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: ToolUser | null;
  onLogout: () => void;
  onUpgrade: () => void;
}

export const ToolsSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpgrade,
}) => {
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

  const handleSignOut = () => {
    logoutToolUser();
    onLogout();
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 font-sans antialiased text-[#111111] border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-900 shrink-0">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 leading-tight">Account & Studio Settings</h3>
                  <p className="text-xs text-gray-500 font-medium">Manage preferences and plan subscription</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black flex items-center justify-center transition cursor-pointer"
                aria-label="Close settings"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="py-5 space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black text-[#CCFF00] font-semibold flex items-center justify-center text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{user?.name || 'Anvitam Member'}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{user?.email || 'Guest User'}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                  user?.is_subscribed ? 'bg-[#CCFF00] text-black' : 'bg-gray-200 text-gray-700'
                }`}>
                  {user?.is_subscribed ? 'PRO PLAN' : 'FREE TRIAL'}
                </span>
              </div>

              {/* Credit Status Card */}
              <div className="p-4 rounded-2xl bg-black text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-[#CCFF00] fill-[#CCFF00]" />
                    <span className="text-xs font-semibold">Available Studio Credits</span>
                  </div>
                  <span className="text-base font-semibold text-[#CCFF00]">
                    {user?.is_subscribed ? 'Unlimited' : `${user?.credits_remaining ?? 5} Credits`}
                  </span>
                </div>

                <p className="text-[11px] text-gray-300 font-normal leading-relaxed">
                  {user?.is_subscribed
                    ? 'Your Pro Subscription is active. Enjoy watermarked-free 4K downloads and unlimited AI runs.'
                    : '1 Credit is used per standard AI design or 3D site report. Top up 10 credits anytime or upgrade to Pro.'}
                </p>

                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => { onClose(); onUpgrade(); }}
                    className="flex-1 bg-[#CCFF00] text-black font-semibold text-xs py-2 rounded-xl hover:bg-white transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={13} />
                    <span>Get Pro / Top Up</span>
                  </button>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Studio Preferences</h4>

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition">
                  <div className="flex items-center gap-2.5 text-xs font-medium text-gray-800">
                    <ShieldCheck size={16} className="text-gray-500" />
                    <span>Watermark-Free Export</span>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500">
                    {user?.is_subscribed ? 'Enabled' : 'Pro Only'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition">
                  <div className="flex items-center gap-2.5 text-xs font-medium text-gray-800">
                    <CreditCard size={16} className="text-gray-500" />
                    <span>Default Market Catalog</span>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-700">India / Global</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 transition cursor-pointer py-1 px-2 rounded-lg hover:bg-red-50"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>

              <button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
