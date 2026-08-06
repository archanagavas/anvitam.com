import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  School, 
  Building2, 
  Users, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Instagram, 
  Award, 
  X,
  Send,
  Layers,
  HeartHandshake,
  Image as ImageIcon
} from 'lucide-react';
import { useContent } from '../context/ContentContext';

const OFFERINGS = [
  {
    title: 'Bird House Making',
    icon: '🐦',
    image: '/workshops/offerings/bird-house.png',
    desc: 'Students design and construct functional, climate-responsive wooden bird houses to welcome urban biodiversity back into campus gardens.'
  },
  {
    title: 'Bird Feeder Making',
    icon: '🌾',
    image: '/workshops/offerings/bird-feeder.png',
    desc: 'Crafting eco-friendly bird feeders using natural bamboo, reclaimed wood, and sustainable ceramics.'
  },
  {
    title: 'Space Makeovers & Installations',
    icon: '🌿',
    image: '/workshops/offerings/space-makeover.png',
    desc: 'Transforming unused campus outdoor corners into vibrant living art installations with native plants and eco-structures.'
  },
  {
    title: 'Plastic Waste Transformation',
    icon: '♻️',
    image: '/workshops/offerings/upcycling.png',
    desc: 'Upcycling discarded single-use plastic into artistic planters, hanging gardens, and decorative campus art.'
  },
  {
    title: 'Tote Bag Painting',
    icon: '🎨',
    image: '/workshops/offerings/tote-bag.png',
    desc: 'Expressing ecological themes through custom organic cotton tote bag canvas painting.'
  },
  {
    title: 'Wind Chime Art',
    icon: '🎐',
    image: '/workshops/offerings/wind-chime.png',
    desc: 'Creating melodious outdoor wind chimes using upcycled metal, bamboo, and natural shell elements.'
  },
  {
    title: 'Tin Can Art',
    icon: '🥫',
    image: '/workshops/offerings/upcycling.png',
    desc: 'Transforming discarded tin food cans into decorative lantern lights and desktop succulent planters.'
  },
  {
    title: 'Rainbow Twisters',
    icon: '🌈',
    image: '/workshops/offerings/wind-chime.png',
    desc: 'Vibrant kinetic wind spinners crafted from eco-materials to bring dynamic color to school courtyards.'
  },
  {
    title: 'DIY Painted Small Rocks',
    icon: '🪨',
    image: '/workshops/offerings/space-makeover.png',
    desc: 'Botanical rock painting to label herb gardens and create inspirational pathway borders.'
  },
  {
    title: 'DIY Straw Art',
    icon: '🌾',
    image: '/workshops/offerings/bird-feeder.png',
    desc: 'Crafting intricate bio-degradable straw geometries and traditional natural weaving patterns.'
  },
  {
    title: 'Glass Bulb Crafts',
    icon: '💡',
    image: '/workshops/offerings/bird-house.png',
    desc: 'Repurposing fused lightbulbs into delicate hydroponic plant propagators and mini terrariums.'
  }
];

const GROUP_PHOTOS = [
  {
    src: '/workshops/group/group1.png',
    title: 'Bird House Crafting in Action',
    caption: 'Students assembling and painting eco-wooden bird houses'
  },
  {
    src: '/workshops/group/group2.png',
    title: 'School Campus Group Workshop',
    caption: 'Class 5th–10th students showcasing their finished bird habitats'
  },
  {
    src: '/workshops/group/group3.png',
    title: 'Innovation & Space Makeover',
    caption: 'Students collaborating on outdoor campus installations'
  },
  {
    src: '/workshops/group/group4.png',
    title: 'Hands-On Eco-Crafting',
    caption: 'Creating upcycled planters and green living structures'
  },
  {
    src: '/workshops/group/group5.png',
    title: 'University Campus Installation',
    caption: 'Design students building bird house grids on campus trees'
  },
  {
    src: '/workshops/group/group6.png',
    title: 'Teamwork & Sustainability',
    caption: 'Fostering environmental leadership through team projects'
  }
];

const AUDIENCES = [
  {
    id: 'school',
    icon: School,
    title: 'Schools & K-12 Institutes',
    subtitle: 'Classes 5th to 10th Grade',
    desc: 'Foster creativity, hands-on crafting, and environmental stewardship through interactive campus activities and space makeovers.',
    benefits: ['Curriculum-aligned STEM & Art learning', '95% student engagement boost', 'Hands-on campus improvement']
  },
  {
    id: 'college',
    icon: Building2,
    title: 'Colleges & Architecture Universities',
    subtitle: 'Undergraduate & Postgraduate Students',
    desc: 'Deep dive into microclimate design, bird habitat architecture, and permanent sustainable installations on university grounds.',
    benefits: ['Real-world design-build experience', 'Portfolio-grade installation work', 'Eco-material experimentation']
  },
  {
    id: 'corporate',
    icon: Users,
    title: 'Workplaces & Corporate Teams',
    subtitle: 'Sustainability & Team Building',
    desc: 'Engage employees in hands-on green retreats, office eco-upcycling, and collaborative biophilic installation projects.',
    benefits: ['Unique team-building experience', 'Corporate ESG & Sustainability impact', 'Stress-relieving creative crafting']
  }
];

const PRICING_PLANS = [
  {
    name: '1-Day Workshop',
    price: '₹200',
    unit: 'per student',
    tagline: 'Ideal for School & College Campus Events',
    features: [
      'Min 100 students (up to 500 capacity)',
      'All craft & building materials provided',
      'Take-home eco craft / installed on campus',
      'Step-by-step expert guidance'
    ],
    popular: false,
    cta: 'Book 1-Day Workshop'
  },
  {
    name: '2–5 Days Bootcamp / Makeover',
    price: '₹40,000 – ₹2,00,000',
    unit: 'per installation',
    tagline: 'Complete Campus Corner & Garden Makeover',
    features: [
      'Multi-day hands-on design build',
      'Bird house & feeder installation grid',
      'Upcycled plastic & plant space makeover',
      'Pre- & Post-assessment impact report'
    ],
    popular: true,
    cta: 'Request Makeover Proposal'
  },
  {
    name: '1-Month Subscription',
    price: '₹75,000',
    unit: 'per month',
    tagline: 'Continuous Campus Eco-Learning',
    features: [
      'Includes 3 full workshops per month',
      'Custom seasonal themes & offerings',
      'Long-term campus green transformation',
      'Dedicated lead instructor support'
    ],
    popular: false,
    cta: 'Subscribe for Campus'
  }
];

export default function Workshops() {
  const { workshops, addMessage } = useContent();
  const [selectedAudience, setSelectedAudience] = useState<'school' | 'college' | 'corporate'>('school');
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    org: '',
    studentsCount: '100',
    workshopType: '1-Day Workshop',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const publishedWorkshops = workshops?.filter(w => w.status === 'published') || [];

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addMessage({
        id: `msg-workshop-${Date.now()}`,
        name: `${formState.name} (${formState.org})`,
        email: formState.email,
        message: `[WORKSHOP INQUIRY] Type: ${formState.workshopType} | Expected Students: ${formState.studentsCount} | Phone: ${formState.phone} | Notes: ${formState.notes}`,
        date: new Date().toISOString()
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setInquiryModalOpen(false);
        setFormState({
          name: '',
          email: '',
          phone: '',
          org: '',
          studentsCount: '100',
          workshopType: '1-Day Workshop',
          notes: ''
        });
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white text-[#111] min-h-screen font-sans overflow-hidden">
      <Helmet>
        <title>Nest N Nurture Workshops | Anvitam Campus & B2B Eco Bootcamps</title>
        <meta name="description" content="Nest N Nurture by Anvitam offers hands-on bird house architecture, campus space makeovers, and eco-craft workshops for schools, colleges, and workplaces." />
        <meta name="keywords" content="nest n nurture, bird house workshop, sustainable architecture workshop, campus space makeover, eco school workshop, plastic waste upcycling" />
      </Helmet>

      {/* ══════════════════════════════════════════
          HERO SECTION — White & Bright Design
      ══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#CCFF00] text-[#111] text-xs font-black uppercase tracking-widest mb-6 shadow-sm"
          >
            <Sparkles size={14} /> Nest N Nurture Workshops
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 max-w-5xl mx-auto text-gray-900"
          >
            Unleashing Creativity & Eco-Consciousness Through <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">Hands-On Workshops</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Transforming school campuses, colleges, and workplaces with bird house architecture, plastic upcycling, and vibrant outdoor space makeovers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => {
                setSelectedPlan('General Inquiry');
                setInquiryModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-[#CCFF00] text-black px-8 py-4 rounded-full text-base font-extrabold hover:scale-105 transition-all duration-300 shadow-xl shadow-lime-200"
            >
              Book Workshop for Campus <ArrowRight size={18} />
            </button>
            <a
              href="#offerings"
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-800 hover:bg-gray-100 px-8 py-4 rounded-full text-base font-bold transition-all duration-300"
            >
              Explore 10+ Offerings
            </a>
          </motion.div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto p-6 rounded-3xl bg-white border border-gray-200 shadow-lg">
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900">95%</p>
              <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">Educator Engagement</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900">80%</p>
              <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">Problem-Solving Growth</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900">500+</p>
              <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">Student Capacity</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900">100%</p>
              <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">Curriculum Aligned</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          REAL WORKSHOP GROUP PHOTOS SHOWCASE
      ══════════════════════════════════════════ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
            Live Action & Real Impact
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-3 mb-4">
            Students in Action Across Campuses
          </h2>
          <p className="text-gray-600 text-base">
            Real moments from our workshops at Unique School of Science (Nadiad) and Anant National University (Ahmedabad).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GROUP_PHOTOS.map((photo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              onClick={() => setActivePhotoModal(photo.src)}
              className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-150 h-72 bg-gray-100"
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-wider mb-1">Nest N Nurture Live</p>
                <h3 className="text-lg font-bold mb-1">{photo.title}</h3>
                <p className="text-xs text-gray-300 font-normal line-clamp-1">{photo.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          B2B AUDIENCE TAB SECTION
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Tailored For Institutions</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">Who Are Our Workshops Designed For?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AUDIENCES.map((aud) => {
              const Icon = aud.icon;
              const isSelected = selectedAudience === aud.id;
              return (
                <div
                  key={aud.id}
                  onClick={() => setSelectedAudience(aud.id as any)}
                  className={`p-8 rounded-3xl cursor-pointer border transition-all duration-300 ${
                    isSelected 
                      ? 'bg-white border-[#CCFF00] shadow-xl ring-2 ring-[#CCFF00]/40 scale-[1.02]' 
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 mb-6">
                    <Icon size={28} />
                  </div>
                  <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider mb-1">{aud.subtitle}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{aud.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{aud.desc}</p>
                  <div className="space-y-2.5">
                    {aud.benefits.map((b, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10+ CREATIVE OFFERINGS MATRIX
      ══════════════════════════════════════════ */}
      <section id="offerings" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-2">Unleashing Creativity</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Our Unique Workshop Offerings</h2>
          <p className="text-gray-600 text-base">
            Each workshop is fully customized with raw eco-materials, professional guidance, and permanent campus installations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {OFFERINGS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="group rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col"
            >
              <div className="h-56 relative overflow-hidden bg-gray-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-xl shadow-md">
                  {item.icon}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlan(item.title);
                    setInquiryModalOpen(true);
                  }}
                  className="mt-6 flex items-center gap-2 text-xs font-extrabold text-emerald-700 hover:text-black transition-colors"
                >
                  Request Offering Details <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PAST WORKSHOPS SHOWCASE (DYNAMIC FROM DB/CONTEXT)
      ══════════════════════════════════════════ */}
      {publishedWorkshops.length > 0 && (
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-2">Proven Track Record</p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Past Campus Transformations</h2>
              <p className="text-gray-600 text-base">
                See how we collaborated with schools and design universities to build functional bird habitats and space makeovers.
              </p>
            </div>

            <div className="space-y-12">
              {publishedWorkshops.map((w) => (
                <div 
                  key={w.id}
                  className="rounded-3xl bg-white border border-gray-200 shadow-md p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                        {w.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                        <MapPin size={13} className="text-emerald-600" /> {w.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                        <Calendar size={13} className="text-emerald-600" /> {w.date}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-4xl font-extrabold text-gray-900">{w.title}</h3>
                    <p className="text-sm font-bold text-emerald-700">{w.organization}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{w.description}</p>

                    {w.attendeesCount && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-xs text-gray-800 font-semibold">
                        <Users size={14} className="text-emerald-600" />
                        <span>{w.attendeesCount}</span>
                      </div>
                    )}

                    {w.offerings && w.offerings.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Offerings Executed:</p>
                        <div className="flex flex-wrap gap-2">
                          {w.offerings.map((offering, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-lg bg-gray-100 border border-gray-200 text-xs text-gray-700 font-medium">
                              {offering}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photo Gallery Grid */}
                  <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                    {w.images && w.images.slice(0, 4).map((img, idx) => (
                      <div key={idx} className={`rounded-2xl overflow-hidden h-36 bg-gray-100 border border-gray-200 ${idx === 0 ? 'col-span-2 h-48' : ''}`}>
                        <img src={img} alt={`${w.title} highlight ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          PRICING & SUBSCRIPTION CARDS
      ══════════════════════════════════════════ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-2">Investment In Innovation</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Pricing & Subscription Plans</h2>
          <p className="text-gray-600 text-base">
            Flexible options tailored for single-day campus events, multi-day space transformations, or long-term partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-8 flex flex-col justify-between border relative transition-all duration-300 ${
                plan.popular 
                  ? 'bg-white border-[#CCFF00] shadow-2xl ring-2 ring-[#CCFF00]/40 scale-[1.02]' 
                  : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#CCFF00] text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-6">{plan.tagline}</p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-xs text-gray-500 font-semibold">{plan.unit}</span>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan(plan.name);
                  setInquiryModalOpen(true);
                }}
                className={`w-full py-3.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-[#CCFF00] text-black hover:scale-105 shadow-md shadow-lime-200'
                    : 'border border-gray-300 text-gray-800 hover:bg-gray-100'
                }`}
              >
                {plan.cta} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-600 space-y-2">
          <p><strong className="text-gray-900 font-bold">Payment Terms:</strong> 50% upfront upon booking confirmation, 50% upon completion of the workshop / makeover.</p>
          <p><strong className="text-emerald-700 font-bold">Bulk Booking Discount:</strong> Special pricing available for annual school partnerships and multi-campus bookings.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CONTACT & DIRECT COLLABORATION CTA
      ══════════════════════════════════════════ */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-b from-emerald-50 via-white to-white border border-emerald-200 relative overflow-hidden shadow-lg">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Let's Bring Creativity to Your Campus</h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto mb-8 font-normal">
            Ready to engage your students or corporate team with high-impact eco workshops? Reach out directly to book dates.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <a
              href="tel:+917990657190"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Phone size={16} className="text-emerald-600" /> +91 7990657190
            </a>
            <a
              href="mailto:nest.nurturee@gmail.com"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Mail size={16} className="text-emerald-600" /> nest.nurturee@gmail.com
            </a>
            <a
              href="https://instagram.com/nest_n_nurture"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Instagram size={16} className="text-emerald-600" /> @nest_n_nurture
            </a>
          </div>

          <button
            onClick={() => {
              setSelectedPlan('Campus Partnership');
              setInquiryModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-[#CCFF00] text-black px-8 py-4 rounded-full text-sm font-extrabold hover:scale-105 transition-all shadow-xl shadow-lime-200"
          >
            Submit Custom Proposal Request <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PHOTO LIGHTBOX MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {activePhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setActivePhotoModal(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
              >
                <X size={28} />
              </button>
              <img src={activePhotoModal} alt="Workshop detail photo" className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          BOOKING & INQUIRY MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {inquiryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 max-w-lg w-full relative overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setInquiryModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Book Nest N Nurture Workshop</h3>
              <p className="text-xs text-emerald-700 font-bold mb-6">
                Selected Package: {selectedPlan || 'General Workshop Inquiry'}
              </p>

              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Inquiry Sent Successfully!</h4>
                  <p className="text-xs text-gray-600">Our team will get in touch with you at {formState.phone || formState.email} within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={e => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Principal / Event Coordinator"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">School / Organization</label>
                      <input
                        type="text"
                        required
                        value={formState.org}
                        onChange={e => setFormState({ ...formState, org: e.target.value })}
                        placeholder="e.g. Unique Science School"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formState.phone}
                        onChange={e => setFormState({ ...formState, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={e => setFormState({ ...formState, email: e.target.value })}
                        placeholder="name@school.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Expected Students</label>
                      <select
                        value={formState.studentsCount}
                        onChange={e => setFormState({ ...formState, studentsCount: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                      >
                        <option value="50-100">50 - 100 Students</option>
                        <option value="100-250">100 - 250 Students</option>
                        <option value="250-500">250 - 500 Students</option>
                        <option value="500+">500+ Students</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Additional Notes / Preferred Dates</label>
                    <textarea
                      rows={3}
                      value={formState.notes}
                      onChange={e => setFormState({ ...formState, notes: e.target.value })}
                      placeholder="Mention your preferred workshop topics, campus location, or dates..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#CCFF00] text-black font-extrabold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    {submitting ? 'Submitting...' : 'Submit Booking Request'} <Send size={16} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
