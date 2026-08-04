import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, CheckCircle, Calculator, MapPin, ChevronRight } from 'lucide-react';

// ── Service definitions with sub-services and INR base prices ──────────────
const SERVICES_DATA = [
  {
    id: 'permaculture-design',
    title: 'Permaculture Design',
    icon: '🌿',
    description: 'Site analysis, zoning, food forest & land masterplan',
    subServices: [
      { id: 'site-reading', label: 'Site Reading & Analysis', price: 15000 },
      { id: 'zonation-plan', label: 'Zonation Plan', price: 12000 },
      { id: 'master-plan', label: 'Master Plan / Layout', price: 25000 },
      { id: 'food-forest', label: 'Food Forest Design', price: 18000 },
      { id: 'water-harvest', label: 'Water Harvesting System', price: 14000 },
      { id: 'soil-plan', label: 'Soil Improvement Plan', price: 10000 },
      { id: 'plant-guild', label: 'Plant Guild & Species List', price: 8000 },
      { id: 'implementation', label: 'Implementation Roadmap', price: 12000 },
    ],
  },
  {
    id: 'farm-retreat',
    title: 'Farm Retreat Design',
    icon: '🏡',
    description: 'Complete architecture & landscape for farm stays',
    subServices: [
      { id: 'concept-design', label: 'Conceptual Mood Board', price: 10000 },
      { id: 'layout', label: 'Layout Plan', price: 20000 },
      { id: 'design-pres', label: 'Design Presentation', price: 15000 },
      { id: '3d-views', label: 'Exterior 3D Views', price: 25000 },
      { id: 'bldg-measurement', label: 'Building Measurement', price: 8000 },
      { id: 'drainage', label: 'Site Drainage Scheme', price: 12000 },
      { id: 'landscape', label: 'Landscape Integration', price: 18000 },
      { id: 'boq', label: 'Bill of Quantity', price: 20000 },
      { id: 'dev-estimate', label: 'Development Estimate', price: 15000 },
    ],
  },
  {
    id: 'airbnb',
    title: 'Airbnb Design',
    icon: '🏠',
    description: 'Revenue-optimised Airbnb & short-stay design',
    subServices: [
      { id: 'market-analysis', label: 'Market Analysis', price: 12000 },
      { id: 'spatial-strategy', label: 'Spatial Strategy', price: 15000 },
      { id: 'interior-concept', label: 'Interior Concept', price: 20000 },
      { id: '3d-renders', label: '3D Renders', price: 22000 },
      { id: 'material-selection', label: 'Material Selection', price: 10000 },
      { id: 'guest-experience', label: 'Guest Experience Curation', price: 12000 },
      { id: 'listing-photos', label: 'Listing Photo Guide', price: 8000 },
      { id: 'pricing-strategy', label: 'Pricing Strategy Report', price: 10000 },
    ],
  },
  {
    id: 'homestay',
    title: 'Homestay Design',
    icon: '🏘️',
    description: 'Vernacular & biophilic homestay architecture',
    subServices: [
      { id: 'vernacular-study', label: 'Vernacular Study', price: 12000 },
      { id: 'site-integration', label: 'Site Integration Plan', price: 15000 },
      { id: 'host-guest-zoning', label: 'Host–Guest Zoning', price: 10000 },
      { id: 'natural-materials', label: 'Natural Materials Plan', price: 12000 },
      { id: 'layout-plan', label: 'Layout Plan', price: 18000 },
      { id: '3d-views-hs', label: '3D Views', price: 22000 },
      { id: 'cultural-expression', label: 'Cultural Expression Guide', price: 8000 },
      { id: 'boq-hs', label: 'Bill of Quantity', price: 15000 },
    ],
  },
  {
    id: 'weekend-villa',
    title: 'Weekend Villa',
    icon: '🌄',
    description: 'Biophilic luxury weekend villa architecture',
    subServices: [
      { id: 'concept-villa', label: 'Conceptual Design', price: 15000 },
      { id: 'biophilic-design', label: 'Biophilic Design Plan', price: 20000 },
      { id: 'exterior-3d', label: 'Exterior 3D Views', price: 25000 },
      { id: 'interior-3d', label: 'Interior 3D Views', price: 25000 },
      { id: 'landscape-villa', label: 'Landscape Design', price: 18000 },
      { id: 'rental-optim', label: 'Rental Optimisation', price: 12000 },
      { id: 'working-drawings', label: 'Working Drawings', price: 30000 },
      { id: 'boq-villa', label: 'Bill of Quantity', price: 20000 },
    ],
  },
  {
    id: 'eco-resort',
    title: 'Eco Resort',
    icon: '🌺',
    description: 'Full masterplan for eco-resorts & wellness retreats',
    subServices: [
      { id: 'eco-baseline', label: 'Ecological Baseline Study', price: 20000 },
      { id: 'regen-masterplan', label: 'Regenerative Masterplan', price: 45000 },
      { id: 'cabin-design', label: 'Cabin / Unit Design', price: 30000 },
      { id: 'amenity-design', label: 'Amenity Block Design', price: 25000 },
      { id: 'wastewater', label: 'Wastewater System Design', price: 18000 },
      { id: 'solar-wind', label: 'Solar & Wind Plan', price: 15000 },
      { id: 'resort-landscape', label: 'Resort Landscape', price: 30000 },
      { id: 'boq-resort', label: 'Bill of Quantity', price: 35000 },
    ],
  },
  {
    id: 'community-center',
    title: 'Community Center',
    icon: '🏛️',
    description: 'Inclusive, sustainable civic & community spaces',
    subServices: [
      { id: 'civic-listening', label: 'Civic Needs Study', price: 12000 },
      { id: 'program-synergy', label: 'Programmatic Synergy Plan', price: 15000 },
      { id: 'concept-cc', label: 'Conceptual Design', price: 20000 },
      { id: 'accessibility', label: 'Accessibility Design', price: 12000 },
      { id: 'eco-integ', label: 'Ecological Integration', price: 15000 },
      { id: 'working-cc', label: 'Working Drawings', price: 35000 },
      { id: 'boq-cc', label: 'Bill of Quantity', price: 22000 },
      { id: 'grant-report', label: 'Grant Readiness Report', price: 18000 },
    ],
  },
];

// ── Currency config ────────────────────────────────────────────────────────
const CURRENCIES: Record<string, { symbol: string; code: string; rate: number }> = {
  IN:  { symbol: '₹', code: 'INR', rate: 1 },
  US:  { symbol: '$', code: 'USD', rate: 0.012 },
  AU:  { symbol: 'A$', code: 'AUD', rate: 0.018 },
  GB:  { symbol: '£', code: 'GBP', rate: 0.0095 },
  EU:  { symbol: '€', code: 'EUR', rate: 0.011 },
  AE:  { symbol: 'AED', code: 'AED', rate: 0.044 },
  SG:  { symbol: 'S$', code: 'SGD', rate: 0.016 },
  ID:  { symbol: 'Rp', code: 'IDR', rate: 192 },
  DEFAULT: { symbol: '$', code: 'USD', rate: 0.012 },
};

function formatPrice(inr: number, currency: { symbol: string; rate: number }) {
  const val = Math.round(inr * currency.rate);
  if (val >= 100000) return `${currency.symbol}${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${currency.symbol}${(val / 1000).toFixed(0)}K`;
  return `${currency.symbol}${val.toLocaleString()}`;
}

// ── Component ──────────────────────────────────────────────────────────────
interface Props { onClose: () => void; }

type Step = 'service' | 'sub' | 'contact' | 'result';

export default function EstimatorModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<typeof SERVICES_DATA[0] | null>(null);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [currency, setCurrency] = useState(CURRENCIES.DEFAULT);
  const [countryCode, setCountryCode] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-detect country
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const code = data.country_code || 'DEFAULT';
        setCountryCode(code);
        setCurrency(CURRENCIES[code] || CURRENCIES.DEFAULT);
      })
      .catch(() => {});
  }, []);

  const totalINR = selectedSubs.reduce((sum, id) => {
    const sub = selectedService?.subServices.find(s => s.id === id);
    return sum + (sub?.price || 0);
  }, 0);

  const toggleSub = (id: string) =>
    setSelectedSubs(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const subLabels = selectedSubs.map(id => selectedService?.subServices.find(s => s.id === id)?.label).filter(Boolean).join(', ');
    const msg = `[ESTIMATE REQUEST]\nService: ${selectedService?.title}\nSub-services: ${subLabels}\nEstimate (${currency.code}): ${formatPrice(totalINR, currency)} (Base ₹${totalINR.toLocaleString()})\nCountry: ${countryCode}`;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: msg + `\nPhone: ${form.phone}`, date: new Date().toISOString() }),
      });
    } catch {}
    setSubmitting(false);
    setSubmitted(true);
    setStep('result');
  };

  const stepNum = { service: 1, sub: 2, contact: 3, result: 4 }[step];
  const totalSteps = 3;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#EFEFEB] rounded-3xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#EFEFEB]/95 backdrop-blur-md px-8 pt-8 pb-5 border-b border-black/5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calculator size={18} className="text-[#111]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#888]">Cost Estimator</span>
                  {countryCode && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold bg-[#CCFF00] text-[#111] px-2 py-0.5 rounded-full">
                      <MapPin size={10} /> {currency.code}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-[#111]">
                  {step === 'service' && 'What can we design for you?'}
                  {step === 'sub' && selectedService?.title}
                  {step === 'contact' && 'Almost there!'}
                  {step === 'result' && 'Your Estimate is Ready'}
                </h2>
                {step !== 'result' && (
                  <p className="text-sm text-[#888] mt-1">Step {stepNum} of {totalSteps}</p>
                )}
              </div>
              <button onClick={onClose} className="text-[#888] hover:text-[#111] transition-colors p-1">
                <X size={22} />
              </button>
            </div>
            {/* Progress bar */}
            {step !== 'result' && (
              <div className="mt-4 h-1.5 bg-black/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#CCFF00] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stepNum / totalSteps) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>

          <div className="px-8 py-6">
            {/* STEP 1: Service Selection */}
            {step === 'service' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICES_DATA.map(svc => (
                  <button
                    key={svc.id}
                    onClick={() => { setSelectedService(svc); setSelectedSubs([]); setStep('sub'); }}
                    className="text-left bg-white border border-black/8 rounded-2xl p-5 hover:border-[#CCFF00] hover:shadow-md transition-all group"
                  >
                    <div className="text-3xl mb-3">{svc.icon}</div>
                    <h3 className="font-bold text-[#111] mb-1 group-hover:text-[#111]">{svc.title}</h3>
                    <p className="text-xs text-[#888] leading-relaxed">{svc.description}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-[#555] group-hover:text-[#111]">
                      Select <ChevronRight size={12} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 2: Sub-service Selection */}
            {step === 'sub' && selectedService && (
              <div>
                <p className="text-sm text-[#666] mb-5">Toggle the deliverables you need. Estimate updates instantly.</p>

                {/* Running total */}
                <div className="bg-[#111] text-white rounded-2xl p-5 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Estimated Total</p>
                    <p className="text-3xl font-bold text-[#CCFF00]">
                      {totalINR > 0 ? formatPrice(totalINR, currency) : `${currency.symbol}0`}
                    </p>
                    {currency.code !== 'INR' && totalINR > 0 && (
                      <p className="text-xs text-white/40 mt-1">≈ ₹{totalINR.toLocaleString()} INR base</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">{selectedSubs.length} selected</p>
                    <p className="text-[10px] text-white/30 mt-1">Indicative pricing</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedService.subServices.map(sub => {
                    const active = selectedSubs.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => toggleSub(sub.id)}
                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all text-left ${
                          active
                            ? 'bg-[#CCFF00] border-[#CCFF00] text-[#111]'
                            : 'bg-white border-black/8 text-[#333] hover:border-[#CCFF00]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${active ? 'border-[#111] bg-[#111]' : 'border-black/20'}`}>
                            {active && <div className="w-2 h-2 rounded-full bg-[#CCFF00]" />}
                          </div>
                          <span className="text-sm font-medium">{sub.label}</span>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ml-4 ${active ? 'text-[#111]' : 'text-[#888]'}`}>
                          {formatPrice(sub.price, currency)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep('service')} className="flex-1 border border-black/15 text-[#555] py-3 rounded-full text-sm font-semibold hover:bg-black/5 transition-colors">
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep('contact')}
                    disabled={selectedSubs.length === 0}
                    className="flex-1 bg-[#111] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Get Full Estimate <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Contact Form */}
            {step === 'contact' && (
              <form onSubmit={handleSubmit}>
                <div className="bg-white border border-black/8 rounded-2xl p-5 mb-6">
                  <p className="text-xs text-[#888] uppercase tracking-widest mb-1">Your selection</p>
                  <p className="font-bold text-[#111]">{selectedService?.title}</p>
                  <p className="text-sm text-[#555] mt-1">{selectedSubs.length} deliverable{selectedSubs.length !== 1 ? 's' : ''} selected</p>
                  <p className="text-2xl font-bold text-[#111] mt-3">{formatPrice(totalINR, currency)}</p>
                </div>

                <p className="text-sm text-[#666] mb-5">Enter your details to receive the full breakdown and a personalised offer.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#888] mb-2">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-white border border-black/12 rounded-xl px-4 py-3 text-sm text-[#111] placeholder-[#aaa] outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#888] mb-2">Email Address *</label>
                    <input
                      required
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-white border border-black/12 rounded-xl px-4 py-3 text-sm text-[#111] placeholder-[#aaa] outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#888] mb-2">Phone Number *</label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 99999 99999"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-white border border-black/12 rounded-xl px-4 py-3 text-sm text-[#111] placeholder-[#aaa] outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                </div>

                <p className="text-xs text-[#aaa] mt-4">We'll reach out with a personalised offer. No spam, ever.</p>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setStep('sub')} className="flex-1 border border-black/15 text-[#555] py-3 rounded-full text-sm font-semibold hover:bg-black/5 transition-colors">
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#CCFF00] text-[#111] py-3 rounded-full text-sm font-bold hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Sending…' : <><span>Show My Estimate</span> <ArrowRight size={14} /></>}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Result */}
            {step === 'result' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="text-[#CCFF00] bg-[#111] rounded-full p-1 shrink-0" size={36} />
                  <div>
                    <p className="font-bold text-[#111]">Estimate sent to your email!</p>
                    <p className="text-sm text-[#888]">Our team will reach out with a custom offer within 24 hours.</p>
                  </div>
                </div>

                <div className="bg-[#111] rounded-3xl p-7 text-white mb-5">
                  <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Estimated Cost Range</p>
                  <p className="text-5xl font-bold text-[#CCFF00] mb-1">{formatPrice(totalINR, currency)}</p>
                  {currency.code !== 'INR' && (
                    <p className="text-sm text-white/40 mb-4">≈ ₹{totalINR.toLocaleString()} INR</p>
                  )}
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Selected: {selectedService?.title}</p>
                    <div className="space-y-1.5">
                      {selectedSubs.map(id => {
                        const sub = selectedService?.subServices.find(s => s.id === id);
                        if (!sub) return null;
                        return (
                          <div key={id} className="flex justify-between items-center text-sm">
                            <span className="text-white/70">{sub.label}</span>
                            <span className="text-[#CCFF00] font-semibold">{formatPrice(sub.price, currency)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#999] mb-6 leading-relaxed">
                  * This is an indicative estimate. Final pricing depends on site complexity, location, and scope. Our team will send a detailed proposal.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep('service'); setSelectedService(null); setSelectedSubs([]); setForm({ name: '', email: '', phone: '' }); setSubmitted(false); }}
                    className="flex-1 border border-black/15 text-[#555] py-3 rounded-full text-sm font-semibold hover:bg-black/5 transition-colors"
                  >
                    New Estimate
                  </button>
                  <button onClick={onClose} className="flex-1 bg-[#111] text-white py-3 rounded-full text-sm font-bold hover:bg-[#333] transition-colors">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
