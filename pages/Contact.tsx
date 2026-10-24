import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { ArrowRight, Plus, Minus, CheckCircle, Calendar, MapPin, Mail, Phone, Navigation, Clock, Calculator, Sparkles } from 'lucide-react';
import FlowButton from '../components/ui/flow-button';
import PhoneInput from '../components/ui/PhoneInput';
import { checkClientRateLimit, recordClientSubmission } from '../utils/rateLimiter';

const Contact: React.FC = () => {
  const { addMessage } = useContent();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceType: 'Farm Retreat Architecture',
    location: '',
    area: '',
    timeline: '1-3 Months (Immediate)',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [activeTab, setActiveTab] = useState('Getting started');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Email OTP Verification state to eliminate fake leads
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSendOtp = async () => {
    setOtpMessage(null);
    setSubmitError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setOtpMessage('Please enter a valid email address first.');
      return;
    }
    setOtpBusy(true);
    try {
      const res = await fetch('/api/messages?otp=send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, name: `${formData.firstName} ${formData.lastName}`.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code.');
      setOtpSent(true);
      setOtpMessage('A 6-digit verification code has been sent to your email.');
    } catch (err: any) {
      setOtpMessage(err?.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setOtpBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpMessage(null);
    setSubmitError(null);
    if (!otpCode || otpCode.trim().length < 6) {
      setOtpMessage('Please enter the 6-digit verification code.');
      return;
    }
    setOtpBusy(true);
    try {
      const res = await fetch('/api/messages?otp=verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code.');
      setOtpVerified(true);
      setVerificationToken(data.token);
      setOtpMessage('Email successfully verified!');
    } catch (err: any) {
      setOtpMessage(err?.message || 'Invalid code. Please try again.');
    } finally {
      setOtpBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Anti-bot Honeypot Trap (Spam Protection) ─────────────────────
    if (honeypot) {
      setStatus('success');
      return;
    }

    // Strict SaaS Rate limit: max 2 attempts per 15 minutes, 30s cooldown
    const rl = checkClientRateLimit({ key: 'contact', cooldownSeconds: 30, maxAttempts: 2, windowMinutes: 15 });
    if (!rl.allowed) {
      setSubmitError(rl.message || 'Please wait a moment before sending another message.');
      setStatus('error');
      return;
    }

    // ── Email format validation ──────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      setSubmitError('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    // ── Phone validation ─────────────────────────────────────────────
    const digits = (formData.phone || '').replace(/[^\d]/g, '');
    if (!formData.phone || digits.length < 7) {
      setSubmitError('Please enter a valid phone number with your country code.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setSubmitError(null);

    const isVerifiedClient = otpVerified;
    const formattedMessage = `[DIRECT CONTACT INQUIRY${isVerifiedClient ? ' - VERIFIED CLIENT ✅' : ''}]
Service Requested: ${formData.serviceType}
Location/Country: ${formData.location || 'Not specified'}
Project Area: ${formData.area || 'Standard'}
Timeline: ${formData.timeline}
Phone: ${formData.phone || 'Not provided'}
Email Verified: ${isVerifiedClient ? 'YES' : 'NO'}

Client Message:
${formData.message}`;

    // ── Optional: Formspree email delivery ──────────────────────────
    const formspreeId = import.meta.env.VITE_FORMSPREE_ID as string;
    if (formspreeId) {
      try {
        await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone || 'Not provided',
            message: formattedMessage,
          }),
        });
      } catch (err) {
        console.error('[Contact] Formspree network error:', err);
      }
    }

    // ── Always save to local admin panel & trigger email alert ───────
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          message: formattedMessage,
          date: new Date().toISOString(),
          verificationToken
        }),
      });

      await addMessage({
        id: crypto.randomUUID(),
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        message: formattedMessage,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      });

      recordClientSubmission('contact', 10);
      setStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        serviceType: 'Farm Retreat Architecture',
        location: '',
        area: '',
        timeline: '1-3 Months (Immediate)',
        message: ''
      });
      setOtpSent(false);
      setOtpVerified(false);
      setVerificationToken(null);
    } catch (err: any) {
      console.error('[Contact] Submission error:', err);
      setSubmitError(err?.message || 'Failed to send message. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const faqData: Record<string, {q: string, a: string}[]> = {
    'Getting started': [
      { q: 'How long does a typical design project take?', a: 'Depending on the scale and complexity, initial conceptual design usually takes 4-8 weeks, while full architectural documentation can take 3-6 months.' },
      { q: 'Do I need land before contacting you?', a: 'While having a site allows us to be more specific, we often consult with clients during the land acquisition phase to assess feasibility and permaculture potential.' },
      { q: 'Is there an initial consultation fee?', a: 'We offer a complimentary 30-minute discovery call to understand your vision, assess alignment, and outline the next potential steps.' },
      { q: 'What is your core design philosophy?', a: 'We focus on sustainable, biophilic design that integrates seamlessly with natural ecosystems, minimizing environmental impact while maximizing human well-being.' },
      { q: 'Do you work internationally?', a: 'Yes, we take on select international eco-resort and farmstay projects, utilizing local materials and context-driven design.' }
    ],
    'Collaboration': [
      { q: 'How involved will I be in the design process?', a: 'Highly involved. We view our clients as co-creators. We hold regular workshops and reviews to ensure the design perfectly reflects your vision.' },
      { q: 'Do you collaborate with local contractors?', a: 'Yes, we prefer to work with local artisans and contractors to reduce carbon footprint and support the local economy.' }
    ],
    'Support': [
      { q: 'Do you oversee the construction phase?', a: 'Yes, we offer comprehensive project management and site supervision to ensure the design is executed faithfully.' },
      { q: 'Can you help with sustainable certifications?', a: 'Absolutely. We can guide your project through LEED, WELL, or Living Building Challenge certification processes.' }
    ]
  };

  const tabs = ['Getting started', 'Collaboration', 'Support'];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-white text-[#111] min-h-screen font-sans">
      <Helmet>
        <title>Contact Us | Anvitam Sustainable Architecture</title>
        <meta name="description" content="Get in touch with Anvitam for your next sustainable architecture, permaculture design, or wellness retreat project." />
        <meta name="keywords" content="contact anvitam, architecture consultation, sustainable architecture vadodara, permaculture design inquiry, eco retreat builders" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.anvitam.com/contact" />
      </Helmet>
      
      {/* Combined Hero Section */}
      <div className="pt-28 pb-12 px-6 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#111] bg-[#CCFF00] border border-black/10 rounded-full mb-4 shadow-xs">
          <Sparkles size={12} /> Contact &amp; Consultation
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#111] mb-4">
          Get in Touch
        </h1>
        <p className="text-gray-600 max-w-2xl text-sm md:text-base leading-relaxed font-normal">
          Whether you have a sustainable farmstay project, eco-resort master plan, or want to discuss biophilic architecture, share your project details below to schedule a tailored consultation.
        </p>
      </div>

      <div className="w-full h-px bg-gray-100 mb-16 max-w-7xl mx-auto"></div>

      {/* Form & Studio Details Section */}
      <div className="max-w-6xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left: Studio Info & Estimator CTA Card */}
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Not Sure? Get Instant Estimate Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#092E20] via-stone-900 to-black text-white shadow-xl border border-emerald-500/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-xs uppercase tracking-wider">
                  <Calculator size={16} /> Not Sure About Your Budget or Area?
                </div>
                <h3 className="text-lg font-bold text-white">Generate an Instant Project Estimate</h3>
                <p className="text-xs text-stone-300 leading-relaxed font-normal">
                  Calculate itemized budget estimates for Food Forests, Farmhouses, and Eco-Resorts instantly on screen.
                </p>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-estimator'))}
                  className="inline-flex items-center gap-2 bg-[#CCFF00] text-black px-5 py-2.5 rounded-full text-xs font-bold hover:scale-105 transition-all shadow-md cursor-pointer mt-1"
                >
                  <Calculator size={15} /> Get Instant Estimate →
                </button>
              </div>

              {/* Quick Contact & Office Location Card */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/90 border border-gray-100">
                  <div className="p-2.5 rounded-full bg-[#D1F0AA] text-[#111] shrink-0 mt-0.5 shadow-xs">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Studio Address</h4>
                    <p className="text-xs sm:text-sm font-semibold text-[#111] leading-snug">
                      2ND Floor, alisha chambers, Santram Mandir Rd, Nadiad, Gujarat 387001
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/90 border border-gray-100">
                    <div className="p-2 rounded-full bg-gray-200 text-[#111] shrink-0">
                      <Phone size={15} />
                    </div>
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Phone</h4>
                      <a href="tel:+917990657190" className="text-xs font-semibold text-[#111] hover:text-[#8bc34a]">
                        +91 7990657190
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/90 border border-gray-100">
                    <div className="p-2 rounded-full bg-gray-200 text-[#111] shrink-0">
                      <Mail size={15} />
                    </div>
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Email</h4>
                      <a href="mailto:ar.archanagavas@gmail.com" className="text-xs font-semibold text-[#111] hover:text-[#8bc34a] truncate block">
                        ar.archanagavas@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            {status === 'success' ? (
              <div className="bg-[#f9fdf5] border border-[#8bc34a]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3.5 bg-[#D1F0AA]/40 border border-[#8bc34a]/50 rounded-2xl p-5">
                  <CheckCircle className="text-[#2b5711] shrink-0" size={28} />
                  <div>
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg">Message Received!</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                      Thank you for reaching out. We will review your project details and reach out to you within <strong>24 hours</strong>.
                    </p>
                  </div>
                </div>

                {/* Archana Consultation Card */}
                <div className="bg-[#111] text-white rounded-2xl p-5 sm:p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    <img
                      src="/archana.webp"
                      alt="Ar. Archana Gavas"
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#D1F0AA] shrink-0 shadow-md bg-[#222]"
                    />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#D1F0AA] mb-1">Want to connect right away?</p>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1">Book a Call with Ar. Archana Gavas</h3>
                      <p className="text-xs text-gray-300 mb-4 leading-relaxed">Schedule a 15-minute 1:1 consultation to discuss site context, design scope & project timelines directly.</p>
                      <a
                        href="https://topmate.io/archanagavas/1799075?utm_source=contact_page&utm_campaign=contact_lead"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#D1F0AA] text-[#111] px-6 py-3 rounded-full text-xs sm:text-sm font-bold hover:scale-105 transition-transform cursor-pointer shadow-md"
                      >
                        <Calendar size={16} /> Book Free 1:1 Consultation
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStatus('idle')}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline block mx-auto pt-2 cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Honeypot field - hidden from humans, traps bots */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input
                    type="text"
                    name="client_website_verification"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={e => setHoneypot(e.target.value)}
                  />
                </div>

                {submitError && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#111] ml-1">First Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111]" 
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#111] ml-1">Last Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111]" 
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-semibold text-[#111]">Email Address *</label>
                      {otpVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          ✓ Email Verified
                        </span>
                      )}
                    </div>
                    <input 
                      type="email" 
                      required
                      disabled={otpVerified}
                      value={formData.email}
                      onChange={e => {
                        setFormData({...formData, email: e.target.value});
                        setOtpSent(false);
                        setOtpVerified(false);
                        setVerificationToken(null);
                      }}
                      className={`w-full bg-white border rounded-full px-5 py-3 focus:outline-none transition-all font-medium text-sm text-[#111] ${
                        otpVerified ? 'border-emerald-400 bg-emerald-50/20' : 'border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400'
                      }`}
                      placeholder="you@email.com"
                    />
                    {!otpVerified && (
                      <div className="pt-1 ml-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpBusy || !formData.email}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline transition disabled:opacity-50 cursor-pointer"
                          >
                            {otpBusy && !otpSent ? 'Sending verification code…' : otpSent ? 'Resend 6-digit code' : 'Verify Email with 6-digit OTP (Optional) →'}
                          </button>
                        </div>
                        {otpSent && (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="6-digit code"
                              value={otpCode}
                              onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                              className="w-36 bg-white border border-emerald-300 rounded-full px-4 py-2 text-xs font-mono tracking-widest text-[#111] placeholder-[#aaa] outline-none focus:border-emerald-600"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={otpBusy || otpCode.length < 6}
                              className="bg-[#111] text-[#CCFF00] px-4 py-2 rounded-full text-xs font-bold hover:bg-[#222] transition disabled:opacity-50 cursor-pointer"
                            >
                              {otpBusy ? 'Verifying…' : 'Confirm'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {otpMessage && (
                      <p className={`text-[11px] ml-1 pt-0.5 ${otpVerified ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}`}>
                        {otpMessage}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#111] ml-1">Phone Number *</label>
                    <PhoneInput 
                      required
                      variant="pill"
                      value={formData.phone}
                      onChange={(fullNumber, country) => {
                        setFormData(prev => ({
                          ...prev,
                          phone: fullNumber,
                          location: prev.location || country.name,
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#111] ml-1">What are you planning to build? *</label>
                    <select
                      value={formData.serviceType}
                      onChange={e => setFormData({...formData, serviceType: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111] cursor-pointer"
                    >
                      <option value="Farmhouse or Weekend Home">Farmhouse or Weekend Home</option>
                      <option value="Farmstay, Airbnb or Eco Resort">Farmstay, Airbnb or Eco Resort</option>
                      <option value="Food Forest & Permaculture Garden">Food Forest & Permaculture Garden</option>
                      <option value="Landscape & Rainwater Planning">Landscape & Rainwater Planning</option>
                      <option value="General Land Consultation">General Land Consultation</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#111] ml-1">Project Location / Country *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111]" 
                      placeholder="e.g. Vadodara, India or California, USA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#111] ml-1">Approx. Site / Land Size</label>
                    <input 
                      type="text" 
                      value={formData.area}
                      onChange={e => setFormData({...formData, area: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111]" 
                      placeholder="e.g. 5 Acres or 2,500 Sq. Ft."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#111] ml-1">Target Timeline *</label>
                    <select
                      value={formData.timeline}
                      onChange={e => setFormData({...formData, timeline: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111] cursor-pointer"
                    >
                      <option value="1-3 Months (Immediate)">1-3 Months (Immediate)</option>
                      <option value="3-6 Months">3-6 Months</option>
                      <option value="6-12 Months">6-12 Months</option>
                      <option value="Exploring & Early Planning">Exploring & Early Planning</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#111] ml-1">Tell us about your vision & goals *</label>
                  <textarea 
                    rows={4} 
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111] resize-none"
                    placeholder="Describe your site context, key objectives, or specific requirements..."
                  ></textarea>
                </div>

                <FlowButton
                  type="submit" 
                  disabled={status === 'submitting'}
                  text={status === 'submitting' ? 'Submitting Details...' : 'Submit Inquiry'}
                  variant="lime"
                  className="w-full py-4 mt-2"
                />
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 mb-24 max-w-7xl mx-auto"></div>

      {/* Interactive Google Map Locator Section */}
      <div className="max-w-6xl mx-auto px-6 mb-32">
        <div className="bg-[#0a0a0a] text-white rounded-3xl p-8 lg:p-12 overflow-hidden shadow-2xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#D1F0AA] border border-[#D1F0AA]/30 rounded-full">
                <MapPin size={12} /> Studio Locator
              </div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white leading-tight">
                Visit Our Studio in Nadiad
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Drop by our workspace to discuss your sustainable architecture, farm retreat, or permaculture master plan in person.
              </p>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#D1F0AA] shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-white/50 font-medium">Exact Address</p>
                    <p className="text-sm font-semibold text-white mt-0.5 leading-snug">
                      2ND Floor, alisha chambers, Santram Mandir Rd, Nadiad, Gujarat 387001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="text-[#D1F0AA] shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-white/50 font-medium">Working Hours</p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      Mon – Sat: 10:00 AM – 7:00 PM IST
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=22.6913212,72.8614304"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#D1F0AA] text-[#111] px-6 py-3 rounded-full text-xs font-bold hover:bg-[#bceb81] transition-all cursor-pointer shadow-md hover:scale-105"
                >
                  <Navigation size={14} /> Get Google Maps Directions
                </a>
              </div>
            </div>

            {/* Right Embedded Interactive Map */}
            <div className="lg:col-span-7 h-[350px] md:h-[420px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-gray-900 relative">
              <iframe
                title="Anvitam Studio Location Map"
                src="https://maps.google.com/maps?q=22.6913212,72.8614304+(Anvitam+Sustainable+Architecture)&t=&z=16&ie=UTF8&iwloc=B&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 mb-24 max-w-7xl mx-auto"></div>

      {/* FAQ Section */}
      <div className="max-w-6xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left: Titles */}
          <div>
            <div className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#111] border border-gray-200 rounded-full mb-8">
              FAQS
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#111] leading-tight mb-6">
              Got questions?
            </h2>
            <p className="text-gray-500 max-w-md text-sm md:text-base leading-relaxed font-medium mb-16">
              We're here to make sustainable design easy to understand. Find answers to the most common questions below.
            </p>

            <h3 className="text-lg font-bold text-[#111] mb-4">Still got questions?</h3>
            <a href="mailto:ar.archanagavas@gmail.com" className="inline-block bg-[#D1F0AA] text-[#111] rounded-full px-5 py-2 text-xs font-bold transition-colors hover:bg-[#bceb81]">
              ar.archanagavas@gmail.com
            </a>
          </div>

          {/* Right: FAQ Tabs and Accordions */}
          <div>
             {/* Tabs */}
             <div className="flex space-x-8 border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
               {tabs.map(tab => (
                 <button
                   key={tab}
                   onClick={() => { setActiveTab(tab); setOpenFaq(0); }}
                   className={`whitespace-nowrap pb-4 text-xs font-bold transition-colors relative ${
                     activeTab === tab ? 'text-[#111]' : 'text-gray-400 hover:text-gray-600'
                   }`}
                 >
                   {tab}
                   {activeTab === tab && (
                     <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#111]"></div>
                   )}
                 </button>
               ))}
             </div>

             {/* Accordion List */}
             <div className="space-y-0 relative min-h-[400px]">
               {faqData[activeTab]?.map((item, index) => (
                 <div key={index} className="border-b border-gray-100">
                   <button 
                     onClick={() => toggleFaq(index)}
                     className="w-full flex items-center justify-between py-6 text-left group"
                   >
                     <span className={`text-sm md:text-base font-bold pr-8 transition-colors ${openFaq === index ? 'text-[#8bc34a]' : 'text-[#111] group-hover:text-gray-600'}`}>
                       {item.q}
                     </span>
                     <span className="flex-shrink-0 text-gray-400 group-hover:text-[#111] transition-colors">
                       {openFaq === index ? <Minus className="w-5 h-5" strokeWidth={2}/> : <Plus className="w-5 h-5" strokeWidth={2}/>}
                     </span>
                   </button>
                   <div 
                     className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                   >
                     <p className="text-gray-500 font-medium text-sm leading-relaxed pr-8">
                       {item.a}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Pre-Footer CTA */}
      <div className="bg-[#111111] text-white pt-20 pb-20 px-6 rounded-t-3xl md:rounded-t-[3rem]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-semibold max-w-lg leading-tight mb-8 md:mb-0 tracking-tight text-[#f9f9f9]">
            Ready to Transform Your Space With Anvitam?
          </h2>
          <div className="flex-shrink-0">
            <a 
              href="https://topmate.io/archanagavas" 
              target="_blank" 
              rel="noopener noreferrer" 
            >
              <FlowButton text="Talk to our project expert" variant="lime" />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Contact;