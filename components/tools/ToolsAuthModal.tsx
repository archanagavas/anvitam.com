// components/tools/ToolsAuthModal.tsx
// Login, Register, and Forgot Password for Anvitam Tools
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

export interface ToolUser {
  id: string | number;
  email: string;
  name: string;
  trial_days_remaining: number;
  is_subscribed: boolean;
  subscription_end?: string | null;
  has_access: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: ToolUser, token: string) => void;
  initialMode?: 'login' | 'register';
}

type Mode = 'login' | 'register' | 'forgot';

export const ToolsAuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const res = await fetch('/api/tools/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send password reset request');
        setForgotSent(true);
        setLoading(false);
        return;
      }

      const endpoint = mode === 'register' ? '/api/tools/register' : '/api/tools/login';
      const body = mode === 'register' ? { email, password, name } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      localStorage.setItem('anvitam_tool_token', data.token);
      localStorage.setItem('anvitam_tool_user', JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent('anvitam-user-updated', { detail: data.user }));
      onSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="auth-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="auth-modal-header">
              <div>
                <div className="auth-logo-badge">SA</div>
                <h2 id="auth-modal-title" className="auth-title">Site Analysis by Anvitam</h2>
                <p className="auth-subtitle">
                  {mode === 'register' ? '5 Free Credits included. No credit card required.' :
                   mode === 'forgot' ? 'Enter your email to receive password reset instructions.' :
                   'Sign in to access your architectural tools.'}
                </p>
              </div>
              <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
            </div>

            {/* Tabs (login/register) */}
            {mode !== 'forgot' && (
              <div className="auth-tabs">
                <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>
                  Sign In
                </button>
                <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>
                  Create Account
                </button>
              </div>
            )}

            {/* Forgot sent state */}
            {forgotSent ? (
              <div className="forgot-sent-state">
                <div style={{ fontSize: 40 }}>📧</div>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Check your inbox</p>
                <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center' }}>If an account exists for <strong>{email}</strong>, password reset instructions have been sent.</p>
                <button className="auth-submit-btn" onClick={() => { setMode('login'); setForgotSent(false); }}>Back to sign in</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                {mode === 'register' && (
                  <div className="auth-field">
                    <label className="auth-label">Name</label>
                    <input className="auth-input text-gray-900 bg-white placeholder-gray-400" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                )}
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input className="auth-input text-gray-900 bg-white placeholder-gray-400" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                {mode !== 'forgot' && (
                  <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <input className="auth-input text-gray-900 bg-white placeholder-gray-400" type="password" placeholder={mode === 'register' ? 'Min 8 characters' : '••••••••'} value={password} onChange={e => setPassword(e.target.value)} required minLength={mode === 'register' ? 8 : 1} />
                  </div>
                )}

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Please wait…' :
                   mode === 'register' ? 'Start Free Trial (5 Credits) →' :
                   mode === 'forgot' ? 'Send Reset Request' :
                   'Sign In →'}
                </button>

                <div className="auth-footer-links">
                  {mode === 'login' && (
                    <button type="button" className="auth-link" onClick={() => { setMode('forgot'); setError(''); }}>
                      Forgot password?
                    </button>
                  )}
                  {mode === 'forgot' && (
                    <button type="button" className="auth-link" onClick={() => { setMode('login'); setError(''); }}>
                      ← Back to sign in
                    </button>
                  )}
                </div>

                {mode === 'register' && (
                  <p className="auth-terms">By creating an account you agree to our Terms of Service and Privacy Policy. Get 5 free credits on signup; top up 10 credits or get Pro Monthly when you need more.</p>
                )}
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
