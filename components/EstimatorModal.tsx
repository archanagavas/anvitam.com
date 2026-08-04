import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X, ArrowRight, CheckCircle, Calculator, ChevronRight, Calendar } from 'lucide-react';

const TOPMATE = 'https://topmate.io/archanagavas/1799075?utm_source=estimator&utm_campaign=estimate_lead';

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳', tier: 1 },
  { code: 'US', name: 'United States', flag: '🇺🇸', tier: 4 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', tier: 3.5 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', tier: 4 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', tier: 3.5 },
  { code: 'FR', name: 'France', flag: '🇫🇷', tier: 3.5 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', tier: 3.5 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', tier: 3 },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', tier: 3.5 },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', tier: 3 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', tier: 3.5 },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', tier: 3 },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', tier: 2 },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', tier: 1.5 },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', tier: 2 },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', tier: 2 },
  { code: 'OTHER', name: 'Other country', flag: '🌍', tier: 2.5 },
];

const SERVICES_DATA = [
  {
    id: 'permaculture-design', title: 'Permaculture Design', icon: '🌿',
    desc: 'Site analysis, food forest & land masterplan',
    subs: ['Site Reading & Analysis','Zonation Plan','Master Plan / Layout','Food Forest Design','Water Harvesting System','Soil Improvement Plan','Plant Guild & Species List','Implementation Roadmap'],
    baseINR: [15000,12000,25000,18000,14000,10000,8000,12000],
  },
  {
    id: 'farm-retreat', title: 'Farm Retreat Design', icon: '🏡',
    desc: 'Complete architecture for farm stays',
    subs: ['Conceptual Mood Board','Layout Plan','Design Presentation','Exterior 3D Views','Building Measurement','Site Drainage Scheme','Landscape Integration','Bill of Quantity','Development Estimate'],
    baseINR: [10000,20000,15000,25000,8000,12000,18000,20000,15000],
  },
  {
    id: 'airbnb', title: 'Airbnb Design', icon: '🏠',
    desc: 'Revenue-optimised short-stay design',
    subs: ['Market Analysis','Spatial Strategy','Interior Concept','3D Renders','Material Selection','Guest Experience Curation','Listing Photo Guide','Pricing Strategy Report'],
    baseINR: [12000,15000,20000,22000,10000,12000,8000,10000],
  },
  {
    id: 'homestay', title: 'Homestay Design', icon: '🏘️',
    desc: 'Vernacular & biophilic homestay architecture',
    subs: ['Vernacular Study','Site Integration Plan','Host–Guest Zoning','Natural Materials Plan','Layout Plan','3D Views','Cultural Expression Guide','Bill of Quantity'],
    baseINR: [12000,15000,10000,12000,18000,22000,8000,15000],
  },
  {
    id: 'weekend-villa', title: 'Weekend Villa', icon: '🌄',
    desc: 'Biophilic luxury villa architecture',
    subs: ['Conceptual Design','Biophilic Design Plan','Exterior 3D Views','Interior 3D Views','Landscape Design','Rental Optimisation','Working Drawings','Bill of Quantity'],
    baseINR: [15000,20000,25000,25000,18000,12000,30000,20000],
  },
  {
    id: 'eco-resort', title: 'Eco Resort', icon: '🌺',
    desc: 'Full masterplan for eco-resorts & retreats',
    subs: ['Ecological Baseline Study','Regenerative Masterplan','Cabin / Unit Design','Amenity Block Design','Wastewater System Design','Solar & Wind Plan','Resort Landscape','Bill of Quantity'],
    baseINR: [20000,45000,30000,25000,18000,15000,30000,35000],
  },
  {
    id: 'community-center', title: 'Community Center', icon: '🏛️',
    desc: 'Inclusive sustainable civic spaces',
    subs: ['Civic Needs Study','Programmatic Synergy Plan','Conceptual Design','Accessibility Design','Ecological Integration','Working Drawings','Bill of Quantity','Grant Readiness Report'],
    baseINR: [12000,15000,20000,12000,15000,35000,22000,18000],
  },
];

type Step = 'service' | 'sub' | 'contact' | 'result';

export default function EstimatorModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('service');
  const [svc, setSvc] = useState<typeof SERVICES_DATA[0] | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: 'IN' });
  const [busy, setBusy] = useState(false);

  const country = COUNTRIES.find(c => c.code === form.country) || COUNTRIES[0];
  const totalINR = selected.reduce((s, i) => s + (svc?.baseINR[i] || 0), 0);

  const getFormattedPrice = (baseINR: number) => {
    const adjusted = baseINR * country.tier;
    if (form.country === 'IN') {
      return `₹${Math.round(adjusted).toLocaleString('en-IN')}`;
    }
    const usd = Math.round(adjusted / 83);
    return `$${usd.toLocaleString('en-US')}`;
  };

  const totalBase = selected.reduce((s, i) => s + (svc?.baseINR[i] || 0), 0);
  const formattedTotal = getFormattedPrice(totalBase);

  const toggle = (i: number) => setSelected(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const subList = selected.map(i => `${svc?.subs[i]} (${getFormattedPrice(svc?.baseINR[i] || 0)})`).filter(Boolean).join(', ');
    const msg = `[ESTIMATE REQUEST]\nService: ${svc?.title}\nDeliverables & Costs: ${subList}\nTotal Estimate: ${formattedTotal}\nCountry: ${form.country} (${country.name})\nPhone: ${form.phone}`;
    try {
      await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: msg, date: new Date().toISOString() }),
      });
    } catch {}
    setBusy(false);
    setStep('result');
  };

  const stepNum = { service: 1, sub: 2, contact: 3, result: 3 }[step];

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 modal-overlay"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto no-scrollbar bg-[#EFEFEB] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#EFEFEB]/98 backdrop-blur-md px-5 sm:px-7 pt-5 sm:pt-6 pb-3 sm:pb-4 border-b border-black/8 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calculator size={14} className="text-[#111]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#777]">Cost Estimator</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#111]">
                {step === 'service' && 'What can we design for you?'}
                {step === 'sub' && svc?.title}
                {step === 'contact' && 'Tell us about yourself'}
                {step === 'result' && "Your Estimate Summary 🎉"}
              </h2>
              {step !== 'result' && <p className="text-xs text-[#888] mt-0.5">Step {stepNum} of 3</p>}
            </div>
            <button onClick={onClose} className="p-2 text-[#777] hover:text-[#111] hover:bg-black/5 rounded-full transition-colors cursor-pointer shrink-0">
              <X size={20} />
            </button>
          </div>
          {step !== 'result' && (
            <div className="mt-3 h-1 bg-black/10 rounded-full overflow-hidden">
              <motion.div className="h-full bg-[#CCFF00] rounded-full" animate={{ width: `${(stepNum / 3) * 100}%` }} transition={{ duration: 0.3 }} />
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="px-5 sm:px-7 py-5 sm:py-6 flex-1 overflow-y-auto no-scrollbar">

          {/* STEP 1: Service */}
          {step === 'service' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICES_DATA.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSvc(s); setSelected([]); setStep('sub'); }}
                  className="text-left bg-white border border-black/8 rounded-2xl p-4 sm:p-5 hover:border-[#111] hover:shadow-lg transition-all group cursor-pointer active:scale-[0.98]"
                >
                  <div className="text-2xl sm:text-3xl mb-2">{s.icon}</div>
                  <p className="font-bold text-[#111] text-sm mb-1">{s.title}</p>
                  <p className="text-xs text-[#777] leading-relaxed">{s.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-[#888] group-hover:text-[#111] transition-colors">
                    Select <ChevronRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: Sub-services */}
          {step === 'sub' && svc && (
            <div>
              <p className="text-xs sm:text-sm text-[#555] mb-4 sm:mb-5">Select the deliverables you need. Choose as many as applicable.</p>
              <div className="space-y-2 mb-6">
                {svc.subs.map((sub, i) => {
                  const active = selected.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggle(i)}
                      className={`w-full flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border transition-all text-left cursor-pointer active:scale-[0.99] ${
                        active ? 'bg-[#CCFF00] border-[#CCFF00] shadow-sm' : 'bg-white border-black/8 hover:border-[#111]/30'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${active ? 'border-[#111] bg-[#111]' : 'border-black/20'}`}>
                        {active && <div className="w-2 h-2 rounded-full bg-[#CCFF00]" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#111]">{sub}</span>
                    </button>
                  );
                })}
              </div>
              {selected.length > 0 && (
                <div className="bg-[#111] text-white rounded-xl px-4 sm:px-5 py-3 flex items-center justify-between mb-4 shadow-sm">
                  <span className="text-xs sm:text-sm text-white/80">{selected.length} deliverable{selected.length !== 1 ? 's' : ''} selected</span>
                  <span className="text-xs text-[#CCFF00] font-semibold">Tailored proposal will be prepared</span>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('service')}
                  className="flex-1 border border-black/15 text-[#555] py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-black/5 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep('contact')}
                  disabled={selected.length === 0}
                  className="flex-1 bg-[#111] text-white py-3 rounded-full text-xs sm:text-sm font-bold hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  Next <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Contact */}
          {step === 'contact' && (
            <form onSubmit={submit}>
              <div className="bg-white border border-black/8 rounded-xl p-4 mb-5">
                <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest mb-1">Your selection</p>
                <p className="font-bold text-[#111] text-sm sm:text-base">{svc?.title}</p>
                <p className="text-xs text-[#666] mt-0.5">{selected.length} deliverable{selected.length !== 1 ? 's' : ''} · Personalised quote will be sent</p>
              </div>
              <p className="text-xs sm:text-sm text-[#555] mb-4">Enter your details to receive your customized proposal within 24 hours.</p>
              <div className="space-y-3.5">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
                  { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@email.com' },
                  { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 99999 99999' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#777] mb-1.5">{f.label} *</label>
                    <input
                      required
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-white border border-black/12 rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#111] placeholder-[#aaa] outline-none focus:border-[#111] transition-colors cursor-text"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#777] mb-1.5">Your Country *</label>
                  <select
                    required
                    value={form.country}
                    onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                    className="w-full bg-white border border-black/12 rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#111] outline-none focus:border-[#111] transition-colors cursor-pointer"
                  >
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-[#aaa] mt-3">No spam. Strictly for sending your tailored proposal.</p>
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setStep('sub')}
                  className="flex-1 border border-black/15 text-[#555] py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-black/5 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 bg-[#CCFF00] text-[#111] py-3 rounded-full text-xs sm:text-sm font-bold hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {busy ? 'Sending…' : <><span>View Estimate</span><ArrowRight size={14} /></>}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Result */}
          {step === 'result' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-[#CCFF00]/20 border border-[#CCFF00] rounded-2xl p-4 sm:p-5">
                <CheckCircle className="text-[#111] shrink-0" size={24} />
                <div>
                  <p className="font-bold text-[#111] text-sm sm:text-base">Request Received!</p>
                  <p className="text-xs text-[#444] mt-0.5">We'll review your requirements and follow up within 24 hours.</p>
                </div>
              </div>

              {/* Itemized Deliverables & Pricing Breakdown */}
              <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-black/8 pb-3 mb-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#777]">Your Selected Service</p>
                    <h4 className="font-bold text-[#111] text-sm sm:text-base flex items-center gap-1.5 mt-0.5">
                      <span>{svc?.icon}</span> {svc?.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 bg-[#111] text-[#CCFF00] rounded-full shrink-0">
                    {country.flag} {country.name}
                  </span>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-widest text-[#888] mb-2">Itemized Deliverables</p>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto no-scrollbar pr-1">
                  {selected.map((index) => {
                    const name = svc?.subs[index];
                    const baseCost = svc?.baseINR[index] || 0;
                    return (
                      <div key={index} className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-black/5 last:border-0">
                        <span className="text-[#333] font-medium flex items-center gap-2 pr-2">
                          <span className="text-[#CCFF00] bg-[#111] w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0">✓</span>
                          {name}
                        </span>
                        <span className="font-bold text-[#111] shrink-0">{getFormattedPrice(baseCost)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 border-t-2 border-black/10">
                  <span className="font-bold text-xs sm:text-sm text-[#111]">Estimated Total</span>
                  <span className="text-sm sm:text-base font-black text-[#111] bg-[#CCFF00] px-3 py-1 rounded-lg">
                    {formattedTotal}
                  </span>
                </div>
              </div>

              {/* Founder Consultation Section with Archana Photo */}
              <div className="bg-[#111] rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop"
                    alt="Ar. Archana Gavas"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#CCFF00] shrink-0 shadow-md"
                  />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#CCFF00] mb-0.5">Want to discuss right away?</p>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">Book a Call with Ar. Archana Gavas</h3>
                    <p className="text-xs text-white/70 mb-3">15-minute intro call to discuss site context, design scope & timelines.</p>
                    <a
                      href={TOPMATE}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#111] px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold hover:scale-105 transition-transform cursor-pointer shadow-md"
                    >
                      <Calendar size={15} /> Book Free Consultation
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setStep('service'); setSvc(null); setSelected([]); setForm({ name: '', email: '', phone: '', country: 'IN' }); }}
                  className="flex-1 border border-black/15 text-[#555] py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-black/5 transition-colors cursor-pointer"
                >
                  New Estimate
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-[#111] text-white py-3 rounded-full text-xs sm:text-sm font-bold hover:bg-[#333] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
}
