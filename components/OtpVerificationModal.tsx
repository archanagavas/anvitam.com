import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface OtpVerificationModalProps {
  isOpen: boolean;
  email: string;
  name?: string;
  phone?: string;
  title?: string;
  purposeLabel?: string;
  actionButtonText?: string;
  onVerified: (verificationToken: string) => void | Promise<void>;
  onClose: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  email,
  name,
  phone,
  title = 'Verify Your Email to Continue',
  purposeLabel = 'your request',
  actionButtonText = 'Verify & Continue →',
  onVerified,
  onClose,
}) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(45);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-send OTP when modal opens if not already sent
  useEffect(() => {
    if (isOpen && email) {
      setCode('');
      setErrorMessage(null);
      setStatus('sending');
      sendOtp();
    }
  }, [isOpen, email]);

  // Countdown timer for Resend
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendOtp = async () => {
    try {
      setStatus('sending');
      setErrorMessage(null);
      const res = await fetch('/api/messages?otp=send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name?.trim(), phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }
      setStatus('idle');
      setCountdown(45);
    } catch (err: any) {
      console.warn('[OTP Modal] Send error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Could not send verification code. Please check your email and try again.');
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = code.replace(/\D/g, '').trim();
    if (cleanCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit code sent to your email.');
      return;
    }

    try {
      setStatus('verifying');
      setErrorMessage(null);
      const res = await fetch('/api/messages?otp=verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: cleanCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid or expired verification code.');
      }

      setStatus('success');
      setTimeout(async () => {
        await onVerified(data.token);
      }, 400);
    } catch (err: any) {
      console.warn('[OTP Modal] Verification error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Incorrect code. Please double check your email and try again.');
    }
  };

  const handleCodeChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (errorMessage) setErrorMessage(null);
    if (digits.length === 6) {
      // Auto-trigger verification when 6 digits are typed
      setTimeout(() => {
        const btn = document.getElementById('otp-confirm-btn');
        if (btn) btn.click();
      }, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-[#FAF9F5] border border-black/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-[#111]"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-black hover:bg-black/5 transition cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Icon Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] flex items-center justify-center text-black shadow-sm shrink-0 border border-black/10">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2b5711]">Security Check</span>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#111] leading-snug">
                {title}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed">
            We sent a 6-digit confirmation code to <strong className="text-black">{email}</strong> to verify your email for {purposeLabel}.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            {/* 6-Digit Monospace Code Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 text-center">
                Enter 6-Digit Code
              </label>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={e => handleCodeChange(e.target.value)}
                placeholder="······"
                disabled={status === 'verifying' || status === 'success'}
                className="w-full text-center text-3xl sm:text-4xl font-extrabold font-mono tracking-[0.4em] sm:tracking-[0.5em] py-3.5 bg-white border-2 border-black/15 rounded-2xl focus:border-[#2b5711] focus:ring-4 focus:ring-[#CCFF00]/40 outline-none transition-all shadow-inner text-black placeholder-gray-300"
              />
            </div>

            {/* Error & Status Feedback */}
            {errorMessage && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
                <CheckCircle size={16} />
                <span>Email verified successfully! Processing...</span>
              </div>
            )}

            {/* Primary Verify Button */}
            <button
              id="otp-confirm-btn"
              type="submit"
              disabled={code.length !== 6 || status === 'verifying' || status === 'success'}
              className="w-full py-3.5 px-6 rounded-full bg-[#111] text-[#CCFF00] font-bold text-sm tracking-wide hover:bg-[#222] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              {status === 'verifying' ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Verifying Code...
                </>
              ) : status === 'success' ? (
                'Verified ✅'
              ) : (
                actionButtonText
              )}
            </button>
          </form>

          {/* Resend & Change Email Footer */}
          <div className="mt-5 pt-4 border-t border-black/8 flex items-center justify-between text-xs text-gray-500">
            <div>
              {countdown > 0 ? (
                <span>Resend code in <strong className="text-black font-mono">{countdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={status === 'sending' || status === 'verifying'}
                  className="font-bold text-[#2b5711] hover:underline cursor-pointer transition disabled:opacity-50"
                >
                  {status === 'sending' ? 'Sending new code...' : 'Resend Code →'}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 underline cursor-pointer"
            >
              Change Email
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OtpVerificationModal;
