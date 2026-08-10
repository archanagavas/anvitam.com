import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { ArrowRight, Plus, Minus, MoveUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { TESTIMONIALS } from '../constants';
import VerticalTimeline from '../components/VerticalTimeline';
import FlowButton from '../components/ui/flow-button';

const Services: React.FC = () => {
  const { services, testimonials } = useContent();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    { label: 'All Services', value: 'All' },
    { label: '🏡 Homes & Retreats', value: 'Homes & Retreats' },
    { label: '🏨 Hospitality & Resorts', value: 'Hospitality & Resorts' },
    { label: '🌾 Land & Gardens', value: 'Land & Gardens' }
  ];

  const filteredServices = selectedCategory === 'All' 
    ? services 
    : services.filter(s => s.category === selectedCategory || (selectedCategory === 'Homes & Retreats' && (s.id.includes('home') || s.id.includes('villa') || s.id.includes('retreat'))) || (selectedCategory === 'Land & Gardens' && (s.id.includes('permaculture') || s.id.includes('forest') || s.id.includes('garden') || s.id.includes('landscape'))));

  const faqs = [
    { question: 'What is your architectural design process?', answer: 'We follow a simple 4-step process: Site reading & land analysis, masterplan & 3D designs, detailed drawings, and site visits to guide your local builders.' },
    { question: 'Do you work on projects outside Gujarat?', answer: 'Yes, we design farmhouses, eco resorts, and land masterplans across India and internationally.' },
    { question: 'How do you keep rooms cool naturally?', answer: 'We align windows and roof overhangs with local winds and sun angles, and use natural materials like lime plaster, clay tiles, and stone that absorb heat.' },
    { question: 'What is the typical timeline for a project?', answer: 'Early design masterplans take 4 to 6 weeks. Full architectural drawing packages range between 2 to 4 months depending on project scale.' },
  ];

  return (
    <div className="bg-[#ffffff] text-[#0a0a0a] min-h-screen font-sans selection:bg-[#CCFF00] selection:text-[#111]">
      <Helmet>
        <title>Services | Farm Retreat, Eco Resort & Permaculture Architect</title>
        <meta name="description" content="Explore simple, outcome-focused architecture and land design services by Anvitam. Farmhouses, eco resorts, food forests, and garden masterplanning." />
        <meta name="keywords" content="farmhouse architect, eco resort design, permaculture masterplan, food forest design, natural home design" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.anvitam.com/services" />
      </Helmet>

      {/* Hero Section */}
      <div className="relative pt-40 pb-28 flex flex-col items-center justify-center text-center overflow-hidden min-h-[50vh]">
        <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
          <img 
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#ffffff] via-[#ffffff]/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl px-4 mt-8 md:mt-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-sans font-bold text-white mb-4 leading-[1.1]"
          >
            What Are You Planning to Build?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-base md:text-lg text-white/90 font-light mb-8 max-w-2xl mx-auto"
          >
            Clear design services for farmhouses, eco-resorts, food forests, and land masterplans.
          </motion.p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 pt-8 pb-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-gray-900 text-[#CCFF00] shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services List Section */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="space-y-20 md:space-y-24">
          {filteredServices.map((service, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              key={service.id} 
              className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-start"
            >
              {/* Column 1: Title & Desc */}
              <div className="md:col-span-3">
                <h3 className="text-2xl md:text-3xl font-medium text-[#0a0a0a] mb-4 leading-tight">{service.title}</h3>
                <p className="text-[#0a0a0a]/60 text-sm md:text-base leading-relaxed">{service.description}</p>
              </div>

              {/* Column 2: Image */}
              <div 
                className="md:col-span-5 h-[300px] md:h-[450px] w-full cursor-pointer overflow-hidden rounded-xl bg-gray-100" 
                onClick={() => navigate(`/services/${service.id}`)}
              >
                <img 
                  src={service.heroImage} 
                  alt={service.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                />
              </div>

              {/* Column 3: Whats Included */}
              <div className="md:col-span-4 flex flex-col items-start bg-white z-10 w-full lg:w-11/12 mx-auto">
                <h4 className="text-lg md:text-xl text-[#0a0a0a] mb-6 md:mb-8 font-medium">Whats Included</h4>
                <ul className="space-y-4 mb-8 md:mb-10 w-full">
                  {service.valueProps.map((prop, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-[#0a0a0a] shrink-0" />
                      <p className="text-sm text-[#0a0a0a]/70">
                        {prop}
                      </p>
                    </li>
                  ))}
                  {service.process.slice(0, 2).map((p, i) => (
                    <li key={`p-${i}`} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-[#0a0a0a] shrink-0" />
                      <p className="text-sm text-[#0a0a0a]/70">
                        {p.title}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-4">
                  <a 
                    href={service.bookingLink} 
                    target="_blank" 
                    rel="noreferrer" 
                  >
                    <FlowButton text="Book a Design Consultation" variant="lime" />
                  </a>
                  <button 
                    onClick={() => navigate(`/services/${service.id}`)} 
                    className="text-xs font-bold flex items-center gap-1 hover:text-[#5A5A40] transition-colors pl-4 text-[#0a0a0a]/60 hover:text-[#0a0a0a] cursor-pointer"
                  >
                    <MoveUpRight size={14} /> Full Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── OUR METHODOLOGY SECTION ── */}
      <div className="bg-[#f9f9f6] py-20 md:py-24 border-t border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <VerticalTimeline />
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-[#fcfcfc] py-20 md:py-24 border-t border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 text-center mb-16">
          <span className="inline-block py-1.5 px-4 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-[#0a0a0a]/60 mb-6 bg-white">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#0a0a0a] font-medium leading-[1.2]">
            Trusted by Leading<br />Architectural Innovators
          </h2>
        </div>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.slice(0, 4).map((t, i) => (
             <div 
               key={t.id} 
               className={`p-8 rounded-2xl flex flex-col justify-between ${
                 i === 0 ? 'bg-[#CCFF00] lg:col-span-1' :
                 i === 3 ? 'bg-[#06261c] text-white lg:col-span-1' : 
                 'bg-white border border-black/5 text-[#0a0a0a] lg:col-span-1'
               }`}
             >
               <p className={`text-sm md:text-base leading-relaxed mb-8 ${
                 i === 3 ? 'text-white/90' : 'text-[#0a0a0a]/80'
               } font-medium`}>
                 "{t.text}"
               </p>
               <div className="flex items-center gap-3">
                 {t.image ? (
                   <img src={t.image} alt={t.author} className="w-10 h-10 rounded-full object-cover" />
                 ) : (
                   <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold text-black/60">
                     {t.author ? t.author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C'}
                   </div>
                 )}
                 <div>
                   <p className={`text-xs font-bold ${i === 3 ? 'text-white' : 'text-[#0a0a0a]'}`}>{t.author}</p>
                   <p className={`text-[10px] ${i === 3 ? 'text-white/60' : 'text-[#0a0a0a]/50'}`}>{t.role}</p>
                 </div>
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-20 md:py-24 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 resize-none">
          <div className="lg:col-span-4">
            <span className="inline-block py-1 px-3 rounded-md bg-[#CCFF00]/20 text-[#0a0a0a] text-xs font-bold uppercase tracking-wider mb-4">
              FAQs
            </span>
            <h2 className="text-4xl md:text-5xl text-[#0a0a0a] font-medium mt-2 mb-6">Got questions?</h2>
            <p className="text-sm text-[#0a0a0a]/60 leading-relaxed mb-10">
              If you have any further questions about our architectural services, please feel free to browse through our frequently asked questions.
            </p>
            <div className="bg-[#fcfcfc] border border-gray-100 p-6 rounded-2xl shadow-sm">
              <h4 className="font-bold text-sm mb-2 text-[#0a0a0a]">Still have questions?</h4>
              <button onClick={() => navigate('/contact')} className="bg-[#CCFF00] text-[#0a0a0a] px-6 py-2.5 rounded-full text-xs font-bold mt-2 hover:bg-[#bce600] transition-colors">
                Contact Us
              </button>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="space-y-0 border-t border-gray-200">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-gray-200 py-6">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center text-left"
                  >
                    <span className="font-medium text-base md:text-lg pr-8 text-[#0a0a0a]">{faq.question}</span>
                    {openFaq === i ? <Minus size={20} className="text-gray-400 shrink-0" /> : <Plus size={20} className="text-gray-400 shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-4 text-sm text-[#0a0a0a]/60 leading-relaxed max-w-2xl">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Services;
