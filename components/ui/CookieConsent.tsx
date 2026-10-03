import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('anvitam_cookie_consent');
    if (!consent) {
      // Small delay for smooth entry after initial page load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('anvitam_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('anvitam_cookie_consent', 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-500"
    >
      <div className="bg-[#03160E]/95 backdrop-blur-md text-white border border-[#CCFF00]/30 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-start gap-3.5 mb-3">
          <div className="p-2 rounded-xl bg-[#CCFF00]/10 text-[#CCFF00] shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white tracking-wide">Privacy &amp; Cookie Preferences</h3>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              We use essential cookies to maintain secure sessions, analyze architectural design traffic, and prevent spam. Review our{' '}
              <Link to="/privacy" className="text-[#CCFF00] underline hover:text-[#d4ff33] transition-colors">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link to="/terms" className="text-[#CCFF00] underline hover:text-[#d4ff33] transition-colors">
                Terms
              </Link>.
            </p>
          </div>
          <button
            onClick={handleEssentialOnly}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Dismiss cookie notice"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
          <button
            onClick={handleEssentialOnly}
            className="text-xs font-medium text-gray-300 hover:text-white px-3.5 py-2 rounded-full transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="bg-[#CCFF00] text-black font-bold text-xs px-5 py-2 rounded-full hover:scale-105 transition-transform shadow-md"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CookieConsent;
