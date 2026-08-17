// components/tools/ToolUserDashboardModal.tsx — User Profile, Credits, Tools Launcher & Logout Dashboard
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Zap, Crown, Edit2, X, ArrowRight, MapPin, Sun, Wind, Trees, Layers3 } from 'lucide-react';
import type { ToolUser } from '../../utils/userAuth';
import { useNavigate } from 'react-router-dom';

interface ToolUserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ToolUser | null;
  onLogout: () => void;
  onUpdateUser?: (updated: ToolUser) => void;
  onUpgrade?: () => void;
}

export const ToolUserDashboardModal: React.FC<ToolUserDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateUser,
  onUpgrade,
}) => {
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [activeTab, setActiveTab] = useState<'profile' | 'tools'>('profile');

  if (!isOpen || !user) return null;

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = { ...user, name: nameInput.trim() };
    localStorage.setItem('anvitam_tool_user', JSON.stringify(updated));
    if (onUpdateUser) onUpdateUser(updated);
    setIsEditingName(false);
  };

  const quickTools = [
    { name: 'Site Analysis (11+ Diagrams)', icon: <MapPin size={18} className="text-[#CCFF00]" />, href: '/site-analysis', desc: 'Full automated solar, wind, soil & climate suite' },
    { name: '3D Solar Shadow Simulator', icon: <Sun size={18} className="text-amber-400" />, href: '/site-analysis', desc: 'Real-time 6 AM to 7 PM solar shadow casting' },
    { name: 'Wind Rose & Airflow Vector', icon: <Wind size={18} className="text-sky-400" />, href: '/site-analysis', desc: '16-cardinal direction velocity vectors' },
    { name: 'SoilGrids Geotechnical Soil', icon: <Trees size={18} className="text-emerald-400" />, href: '/site-analysis', desc: 'Clay, sand, silt & foundation suitability' },
    { name: 'Embodied Carbon Estimator', icon: <Layers3 size={18} className="text-[#CCFF00]" />, href: '/site-analysis', desc: 'CSEB vs concrete/steel footprint comparator' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#111111] text-white border border-white/15 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-black font-black text-xl flex items-center justify-center shadow-lg">
                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-white">{user.name || 'Architect User'}</h3>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    user.is_subscribed
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-[#CCFF00]/20 text-[#CCFF00] border-[#CCFF00]/30'
                  }`}>
                    {user.is_subscribed ? 'Pro Member (250/mo)' : 'Free Trial'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 my-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 ${
                activeTab === 'profile'
                  ? 'border-[#CCFF00] text-[#CCFF00]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              👤 Profile & Subscription
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 ${
                activeTab === 'tools'
                  ? 'border-[#CCFF00] text-[#CCFF00]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              🧰 Tools Launcher
            </button>
          </div>

          {/* TAB 1: PROFILE & CREDITS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Credit Status Card */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                    <Zap size={15} className="text-[#CCFF00]" /> Credit Balance
                  </span>
                  <span className="text-sm font-extrabold text-[#CCFF00] font-mono">
                    {user.is_subscribed ? '250 Credits / mo (Pro)' : `${user.credits_remaining ?? 5} / 5 Credits Left`}
                  </span>
                </div>

                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#CCFF00] h-full transition-all duration-500"
                    style={{ width: `${user.is_subscribed ? 100 : Math.min(100, ((user.credits_remaining ?? 5) / 5) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-gray-400">
                    {user.is_subscribed
                      ? '⚡ Pro Plan Active — 250 monthly credits automatically refilled.'
                      : `Trial expires in ${user.trial_days_remaining} days.`}
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onUpgrade) onUpgrade();
                      else navigate('/tools');
                    }}
                    className="bg-[#CCFF00] hover:bg-white text-black text-xs font-black px-3.5 py-1.5 rounded-full transition shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    <Crown size={13} /> {user.is_subscribed ? 'Manage Plan' : 'Upgrade to Pro'}
                  </button>
                </div>
              </div>

              {/* Edit Display Name */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <label className="text-xs text-gray-400 font-bold block">Display Name</label>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="flex-1 bg-black border border-[#CCFF00] rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    />
                    <button
                      onClick={handleSaveName}
                      className="bg-[#CCFF00] text-black font-bold px-3 py-1.5 rounded-xl text-xs"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{user.name || 'Not set'}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-xs text-[#CCFF00] hover:underline flex items-center gap-1"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons: Logout & Switch Account */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogOut size={16} /> Sign Out of Account
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TOOLS LAUNCHER */}
          {activeTab === 'tools' && (
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              <p className="text-xs text-gray-400 mb-3">Quick launch any architectural tool from your studio dashboard:</p>
              {quickTools.map((tool, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onClose();
                    navigate(tool.href);
                  }}
                  className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      {tool.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#CCFF00] transition">{tool.name}</h4>
                      <p className="text-[10px] text-gray-400">{tool.desc}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-gray-400 group-hover:text-[#CCFF00] group-hover:translate-x-1 transition" />
                </div>
              ))}
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
