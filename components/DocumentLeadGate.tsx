import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Link as LinkIcon, Lock, ArrowRight, CheckCircle, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { ProjectDocument } from '../types';

const SESSION_KEY = 'anvitam_doc_access_granted';

function isAccessGranted(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function grantAccess() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {}
}

interface LeadGateModalProps {
  doc: ProjectDocument;
  contextTitle: string; // e.g. "Carpa Lupa" or "Permaculture Site Planning"
  onClose: () => void;
  onSuccess: () => void;
}

const LeadGateModal: React.FC<LeadGateModalProps> = ({ doc, contextTitle, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all required fields to continue.');
      return;
    }
    setBusy(true);
    try {
      const msg = `[DOCUMENT ACCESS REQUEST]\nDocument: ${doc.label}\nContext: ${contextTitle}\nPhone: ${phone}`;
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: msg,
          date: new Date().toISOString(),
        }),
      });
      grantAccess();
      setDone(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg bg-[#121417] text-white rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative"
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#CCFF00]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-white/50 hover:text-white transition-all rounded-full hover:bg-white/10 z-10"
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {/* Header Block */}
        <div className="p-6 sm:p-7 pb-4 border-b border-white/10 relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center shrink-0 shadow-xs">
              <Lock size={18} className="text-[#CCFF00]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00]">Instant Digital Access</p>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Project Resource Files</h2>
            </div>
          </div>

          {/* Full Multi-Line Document Card (No Truncation) */}
          <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] shrink-0 mt-0.5">
              <FileText size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/90 leading-snug whitespace-normal break-words">
                {doc.label}
              </p>
              {doc.description && (
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-medium text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-2 py-0.5 rounded-md inline-block">
                    {doc.description}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">From {contextTitle}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-7 pt-5">
          {done ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3.5 text-center">
              <div className="w-16 h-16 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/40 flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle size={32} className="text-[#CCFF00]" />
              </div>
              <div>
                <p className="font-extrabold text-white text-lg">Access Granted!</p>
                <p className="text-xs text-white/60 mt-1">Opening your requested document now…</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-white/70 leading-relaxed">
                Enter your details to instantly view and download this resource. You'll also receive priority updates on architectural insights by Ar. Archana Gavas.
              </p>

              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Rahul Sharma', value: name, set: setName },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com', value: email, set: setEmail },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 98765 43210', value: phone, set: setPhone },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-1.5">
                    {f.label} <span className="text-[#CCFF00]">*</span>
                  </label>
                  <input
                    required
                    type={f.type}
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/40 transition-all font-medium"
                  />
                </div>
              ))}

              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2.5">
                  {error}
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-[#CCFF00] text-black py-3.5 rounded-2xl text-xs font-black hover:bg-[#d4ff1a] transition-all transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {busy ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      Verifying Access…
                    </span>
                  ) : (
                    <>
                      <span>Get Instant Access</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 pt-1">
                <ShieldCheck size={12} className="text-[#CCFF00]" />
                <span>100% Privacy Protected. No spam guaranteed.</span>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

interface DocumentsListProps {
  documents: ProjectDocument[];
  contextTitle: string;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ documents, contextTitle }) => {
  const [gateDoc, setGateDoc] = useState<ProjectDocument | null>(null);

  if (!documents || documents.length === 0) return null;

  const handleDocClick = (doc: ProjectDocument) => {
    if (!doc.gatedAccess || isAccessGranted()) {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    } else {
      setGateDoc(doc);
    }
  };

  const handleGateSuccess = () => {
    if (gateDoc) {
      window.open(gateDoc.url, '_blank', 'noopener,noreferrer');
    }
    setGateDoc(null);
  };

  return (
    <>
      <div className="mt-8 border-t border-black/8 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-[#111]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#111]">Project Documents & Resources</h3>
        </div>
        <div className="space-y-2.5">
          {documents.map(doc => (
            <button
              key={doc.id}
              onClick={() => handleDocClick(doc)}
              className="w-full flex items-center gap-3.5 bg-[#F5F5F0] hover:bg-[#EAEAE5] border border-black/8 rounded-2xl p-4 text-left transition-all group cursor-pointer shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-black/8 flex items-center justify-center shrink-0 shadow-2xs">
                {doc.gatedAccess && !isAccessGranted() ? (
                  <Lock size={15} className="text-[#555]" />
                ) : (
                  <LinkIcon size={15} className="text-[#111]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#111] group-hover:text-black leading-snug whitespace-normal break-words">
                  {doc.label}
                </p>
                {doc.description && (
                  <p className="text-[11px] text-[#777] mt-0.5 font-medium">{doc.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {doc.gatedAccess && !isAccessGranted() ? (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#111] text-[#CCFF00] px-3 py-1 rounded-full border border-black shadow-2xs flex items-center gap-1">
                    <Sparkles size={10} /> Access
                  </span>
                ) : (
                  <ExternalLink size={14} className="text-[#777] group-hover:text-[#111] transition-colors" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {gateDoc && (
          <LeadGateModal
            doc={gateDoc}
            contextTitle={contextTitle}
            onClose={() => setGateDoc(null)}
            onSuccess={handleGateSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DocumentsList;
