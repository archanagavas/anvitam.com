import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Link as LinkIcon, Lock, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';
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
      setError('Please fill in all fields to continue.');
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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-[#EFEFEB] rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#111] px-6 pt-6 pb-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center">
              <Lock size={18} className="text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00]">Free Instant Access</p>
              <h2 className="text-base font-bold text-white leading-tight">Project Resource Files</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <FileText size={13} className="text-[#CCFF00] shrink-0" />
            <span className="text-xs text-white/80 font-medium truncate">{doc.label}</span>
            {doc.description && (
              <span className="text-[10px] text-white/40 ml-auto shrink-0">{doc.description}</span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {done ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center">
                <CheckCircle size={28} className="text-[#111]" />
              </div>
              <p className="font-bold text-[#111] text-base">Access Granted!</p>
              <p className="text-xs text-[#666]">Opening the document now…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <p className="text-xs text-[#555] leading-relaxed">
                Enter your details to access this document. We'll also keep you in the loop on similar projects by Ar. Archana Gavas.
              </p>

              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name', value: name, set: setName },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@email.com', value: email, set: setEmail },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 99999 99999', value: phone, set: setPhone },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#777] mb-1.5">{f.label} *</label>
                  <input
                    required
                    type={f.type}
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#111] placeholder-[#aaa] outline-none focus:border-[#111] transition-colors"
                  />
                </div>
              ))}

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <p className="text-[10px] text-[#aaa]">No spam. Only relevant project updates from Anvitam.</p>

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#111] text-white py-3 rounded-full text-xs font-bold hover:bg-[#333] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              >
                {busy ? 'Verifying…' : <><span>Get Instant Access</span><ArrowRight size={14} /></>}
              </button>
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
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#111]">Project Documents</h3>
        </div>
        <div className="space-y-2">
          {documents.map(doc => (
            <button
              key={doc.id}
              onClick={() => handleDocClick(doc)}
              className="w-full flex items-center gap-3 bg-[#F5F5F0] hover:bg-[#EAEAE5] border border-black/8 rounded-xl px-4 py-3 text-left transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-black/8 flex items-center justify-center shrink-0">
                {doc.gatedAccess && !isAccessGranted() ? (
                  <Lock size={14} className="text-[#888]" />
                ) : (
                  <LinkIcon size={14} className="text-[#111]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#111] group-hover:text-black">{doc.label}</p>
                {doc.description && (
                  <p className="text-[10px] text-[#888] mt-0.5 truncate">{doc.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {doc.gatedAccess && !isAccessGranted() ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-[#111] text-[#CCFF00] px-2 py-0.5 rounded-full">
                    Request Access
                  </span>
                ) : (
                  <ExternalLink size={13} className="text-[#888] group-hover:text-[#111] transition-colors" />
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
