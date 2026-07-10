import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';
import { ArrowRight, Plus, Minus } from 'lucide-react';

const Contact: React.FC = () => {
  const { addMessage } = useContent();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Getting started');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setSubmitError(null);

    // ── Optional: Formspree email delivery ──────────────────────────
    // Set VITE_FORMSPREE_ID in .env.local to enable real email delivery.
    const formspreeId = import.meta.env.VITE_FORMSPREE_ID as string;
    if (formspreeId) {
      try {
        const resp = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone || 'Not provided',
            message: formData.message,
          }),
        });
        if (!resp.ok) {
          console.error('[Contact] Formspree error:', resp.status);
          // Still save locally — don't block the UX
        }
      } catch (err) {
        console.error('[Contact] Formspree network error:', err);
      }
    }

    // ── Always save to local admin panel ────────────────────────────
    addMessage({
      id: crypto.randomUUID(),
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      message: `${formData.phone ? `Phone: ${formData.phone}\n` : ''}${formData.message}`,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
    });

    setStatus('success');
    setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    setTimeout(() => setStatus('idle'), 5000);
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
        <meta name="X-Robots-Tag" content="index, follow" />
        <meta name="publisher" content="Anvitam" />
        <link rel="publisher" href="https://www.anvitam.com/" />
        <link rel="canonical" href="https://www.anvitam.com/contact" />
      </Helmet>
      
      {/* Hero Section */}
      <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6 tracking-tight text-[#111]">
          Get in Touch
        </h1>
        <p className="text-gray-500 max-w-lg text-sm md:text-base leading-relaxed font-medium">
          Whether you have a sustainable farmstay project in mind or just want to discuss green building design, we'd love to hear from you.
        </p>
      </div>

      <div className="w-full h-px bg-gray-100 mb-24 max-w-7xl mx-auto"></div>

      {/* Form Section */}
      <div className="max-w-6xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left: Titles */}
          <div>
            <div className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#111] border border-gray-200 rounded-full mb-8">
              Get A Quote
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#111] leading-tight max-w-sm">
              Send us a Message
            </h2>
          </div>

          {/* Right: Form */}
          <div>
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-xl text-center">
                <h4 className="font-bold text-xl mb-2">Message Sent Successfully!</h4>
                <p className="text-sm font-medium">Thank you for reaching out. Our team will get back to you shortly.</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#111] ml-1">Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111]" 
                      placeholder="Type first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#111] ml-1">Last Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111]" 
                      placeholder="Type last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#111] ml-1">Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111]" 
                      placeholder="Type email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#111] ml-1">Phone</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111]" 
                      placeholder="Type phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#111] ml-1">Any other message?</label>
                  <textarea 
                    rows={5} 
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium text-sm text-[#111] resize-none"
                    placeholder="Type your message"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'submitting'}
                  className="w-full bg-[#D1F0AA] text-[#111] rounded-full py-4 text-sm font-bold transition-colors hover:bg-[#bceb81] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Sending...' : 'Submit'}
                </button>
              </form>
            )}
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
            <a href="mailto:contact@anvitam.com" className="inline-block bg-[#D1F0AA] text-[#111] rounded-full px-5 py-2 text-xs font-bold transition-colors hover:bg-[#bceb81]">
              contact@anvitam.com
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
              className="inline-flex items-center bg-[#D1F0AA] text-[#111] px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors hover:bg-[#bceb81]"
            >
              Talk to our project expert <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Contact;