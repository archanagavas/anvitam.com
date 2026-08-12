import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
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
  X,
  Send,
  Wrench,
  Compass,
  Palette,
  Check,
  Star,
  Pencil,
  Calculator,
  GraduationCap,
  Award,
  BookOpen,
  ShieldCheck,
  Leaf
} from 'lucide-react';
import CardFlip from '../components/CardFlip';
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
    src: '/workshops/campus/campus1.png',
    title: 'Bird House Crafting Group Action',
    institution: 'Unique School of Science (Nadiad)',
    caption: 'Students assembling and painting eco-wooden bird houses'
  },
  {
    src: '/workshops/campus/campus2.png',
    title: 'School Campus Group Showcase',
    institution: 'Unique School of Science (Nadiad)',
    caption: 'Students displaying finished bird houses before campus installation'
  },
  {
    src: '/workshops/campus/campus3.png',
    title: 'Campus Space Makeover & Bio-Art',
    institution: 'Anant National University (Ahmedabad)',
    caption: 'University students collaborating on permanent campus bio-installations'
  },
  {
    src: '/workshops/campus/campus4.png',
    title: 'Eco-Craft Workshop Assembly',
    institution: 'Anant National University (Ahmedabad)',
    caption: 'Hands-on crafting with natural building materials'
  },
  {
    src: '/workshops/campus/campus5.png',
    title: 'Environmental Design & Leadership',
    institution: 'Campus Outdoor Workshop',
    caption: 'Fostering environmental leadership through hands-on team projects'
  },
  {
    src: '/workshops/campus/campus6.png',
    title: 'Permanent Campus Installation Grid',
    institution: 'Anant National University (Ahmedabad)',
    caption: 'Completed bird house and feeder grid integrated into campus trees'
  }
];

const AUDIENCES = [
  {
    id: 'school',
    icon: School,
    title: 'Schools & K-12 Institutes',
    subtitle: 'Classes 5th to 10th Grade',
    desc: 'Foster creativity, hands-on crafting, and environmental stewardship through interactive campus activities and space makeovers.',
    benefits: ['Curriculum-aligned STEM & Art learning', '95% student engagement boost', 'Hands-on campus improvement'],
    backImage: '/workshops/audience/card_3.png'
  },
  {
    id: 'college',
    icon: Building2,
    title: 'Colleges & Design Universities',
    subtitle: 'Undergraduate & Graduate Students',
    desc: 'Deep dive into microclimate design, bird habitat architecture, and permanent sustainable installations on university grounds.',
    benefits: ['Real-world design-build experience', 'Portfolio-grade installation work', 'Eco-material experimentation'],
    backImage: '/workshops/audience/card_1.png'
  },
  {
    id: 'corporate',
    icon: Users,
    title: 'Workplaces & Corporate Teams',
    subtitle: 'Sustainability & ESG Offsites',
    desc: 'Engage employees in hands-on green retreats, office eco-upcycling, and collaborative biophilic installation projects.',
    benefits: ['Unique team-building experience', 'Corporate ESG & Sustainability impact', 'Stress-relieving creative crafting'],
    backImage: '/workshops/audience/card_2.png'
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
  const [selectedPlan, setSelectedPlan] = useState('General Campus Workshop Inquiry');
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  // Structured Workshop Lead Capture Form State
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    org: '',
    city: '',
    studentsCount: '100-250',
    selectedActivities: ['Bird House Making', 'Space Makeovers & Installations'],
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const publishedWorkshops = workshops?.filter(w => w.status === 'published') || [];

  useEffect(() => {
    if (inquiryModalOpen || activePhotoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [inquiryModalOpen, activePhotoModal]);

  const handleOpenLeadModal = (planOrOffering: string = 'General Campus Workshop Inquiry') => {
    setSelectedPlan(planOrOffering);
    setSubmitted(false);
    setInquiryModalOpen(true);
  };

  const toggleActivitySelect = (activityTitle: string) => {
    setFormState(prev => {
      const exists = prev.selectedActivities.includes(activityTitle);
      return {
        ...prev,
        selectedActivities: exists
          ? prev.selectedActivities.filter(a => a !== activityTitle)
          : [...prev.selectedActivities, activityTitle]
      };
    });
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formattedMessage = `[WORKSHOP BOOKING LEAD]
Package/Target: ${selectedPlan}
Organization/School: ${formState.org}
Contact Person: ${formState.name}
Phone/WhatsApp: ${formState.phone}
Email: ${formState.email}
City/Location: ${formState.city || 'Not specified'}
Expected Attendees: ${formState.studentsCount}
Requested Activities: ${formState.selectedActivities.join(', ') || 'General'}
Additional Notes: ${formState.notes || 'None'}`;

      await addMessage({
        id: `msg-workshop-${Date.now()}`,
        name: `${formState.name} (${formState.org || 'Campus Lead'})`,
        email: formState.email,
        message: formattedMessage,
        date: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit workshop lead:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white text-[#111] min-h-screen font-sans overflow-hidden">
      <Helmet>
        <title>Hands-On Workshops for Schools, offices &amp; colleges | Nest N Nurture</title>
        <meta name="description" content="Nest N Nurture by Anvitam offers hands-on bird house architecture, campus space makeovers, and eco-craft workshops for schools, colleges, and workplaces." />
        <meta name="keywords" content="nest n nurture, bird house workshop, sustainable architecture workshop, campus space makeover, eco school workshop, plastic waste upcycling" />
      </Helmet>

      {/* ══════════════════════════════════════════
          1. HERO SECTION — Clean High-Converting SaaS Funnel
      ══════════════════════════════════════════ */}
      <section className="relative pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#CCFF00] text-[#111] text-[11px] font-bold uppercase tracking-wider mb-4 shadow-sm border border-black/10"
          >
            <Sparkles size={13} /> Nest N Nurture Workshops
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.18] mb-4 max-w-3xl mx-auto text-gray-900"
          >
            Hands-On Workshops for Schools, offices &amp; colleges
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal"
          >
            Transforming school campuses, colleges, and workplaces with bird house architecture, plastic upcycling, and vibrant outdoor space makeovers.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-10"
          >
            <button
              onClick={() => handleOpenLeadModal('Book Workshop for Campus')}
              className="inline-flex items-center gap-2 bg-[#CCFF00] text-black px-6 py-3 rounded-full text-xs sm:text-sm font-bold hover:scale-105 transition-all duration-300 shadow-md shadow-lime-200/80 border border-black/10 cursor-pointer"
            >
              Book Workshop for Campus <ArrowRight size={16} />
            </button>
            <a
              href="#offerings"
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-800 hover:bg-gray-50 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300"
            >
              Explore 10+ Offerings
            </a>
          </motion.div>

          {/* Social Proof Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto p-5 rounded-2xl bg-white border border-gray-200 shadow-sm mb-10">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">95%</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-semibold tracking-wider">Educator Engagement</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">80%</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-semibold tracking-wider">Problem-Solving Growth</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">500+</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-semibold tracking-wider">Student Capacity</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">100%</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-semibold tracking-wider">NEP 2020 Aligned</p>
            </div>
          </div>

          {/* Institutional Partner Bar */}
          <div className="pt-1 max-w-3xl mx-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Trusted by Leading Educational &amp; Architectural Institutions
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 shadow-xs">
                <img src="/workshops/logos/uss-logo.png" alt="Unique School of Science" className="w-5 h-5 rounded-full object-cover border border-gray-200" />
                <span className="text-xs font-bold text-gray-800">Unique School of Science</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 shadow-xs">
                <img src="/workshops/logos/anant-logo.png" alt="Anant National University" className="w-5 h-5 rounded-lg object-contain bg-white p-0.5 border border-gray-200" />
                <span className="text-xs font-bold text-gray-800">Anant National University</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 shadow-xs">
                <img src="/workshops/logos/campleo-logo.png" alt="Camp Leo" className="w-5 h-5 rounded-full object-cover border border-gray-200" />
                <span className="text-xs font-bold text-gray-800">Camp Leo Eco Resorts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. FEATURED INSTITUTIONAL CASE STUDIES & PAST CAMPUS TRANSFORMATIONS
      ══════════════════════════════════════════ */}
      {publishedWorkshops.length > 0 && (
        <section className="py-12 md:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
              Proven Track Record
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">
              Featured Institutional Case Studies &amp; Past Campus Transformations
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-normal">
              See how we collaborated with schools and design universities to build functional bird habitats and space makeovers.
            </p>
          </div>

          {/* Dynamic Database Workshops Showcase */}
          <div className="space-y-6">
            <div className="space-y-6">
              {publishedWorkshops.map((w) => (
                <div 
                  key={w.id}
                  className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center hover:border-gray-300 transition-all"
                >
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        {w.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <MapPin size={13} className="text-emerald-600" /> {w.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Calendar size={13} className="text-emerald-600" /> {w.date}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-3xl font-bold text-gray-900">{w.title}</h3>
                    <p className="text-xs font-bold text-emerald-700">{w.organization}</p>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{w.description}</p>

                    {w.attendeesCount && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-800 font-medium">
                        <Users size={13} className="text-emerald-600" />
                        <span>{w.attendeesCount}</span>
                      </div>
                    )}

                    {w.offerings && w.offerings.length > 0 && (
                      <div className="pt-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Offerings Executed:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {w.offerings.map((offering, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[11px] text-gray-700 font-medium">
                              {offering}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex flex-wrap items-center gap-2.5">
                      <Link
                        to={`/workshops/${w.slug || w.id}`}
                        className="inline-flex items-center gap-2 bg-[#111] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-emerald-600 transition-all shadow-xs"
                      >
                        View Full Story, Gallery & Videos →
                      </Link>
                      <button
                        onClick={() => handleOpenLeadModal(`Case Study Inquiry: ${w.title}`)}
                        className="inline-flex items-center gap-2 bg-[#CCFF00] text-black px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition-all shadow-xs"
                      >
                        Book Similar Workshop <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Photo Gallery Grid */}
                  <Link to={`/workshops/${w.slug || w.id}`} className="lg:col-span-5 grid grid-cols-2 gap-2.5 group/img">
                    {(() => {
                      const validImages = (w.images && w.images.filter(img => Boolean(img && img.trim())).length > 0)
                        ? w.images.filter(img => Boolean(img && img.trim()))
                        : ['/workshops/birds house making.png'];
                      return validImages.slice(0, 4).map((img, idx) => (
                        <div key={idx} className={`rounded-xl overflow-hidden h-32 bg-gray-100 border border-gray-200 ${idx === 0 ? 'col-span-2 h-40' : ''} relative`}>
                          <img src={img} alt={`${w.title} highlight ${idx + 1}`} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = '/workshops/birds house making.png'; }} />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-transparent transition" />
                        </div>
                      ));
                    })()}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          3. SOLUTIONS / 10+ CREATIVE OFFERINGS MATRIX
      ══════════════════════════════════════════ */}
      <section id="offerings" className="py-12 md:py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-1.5">Unleashing Creativity</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">Our Unique Workshop Offerings</h2>
            <p className="text-gray-600 text-xs sm:text-sm font-normal leading-relaxed">
              Each workshop is fully customized with raw eco-materials, professional guidance, and permanent campus installations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFERINGS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                className="group rounded-2xl bg-white border border-gray-200 shadow-xs overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex flex-col"
              >
                <div className="h-48 relative overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3.5 left-3.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-lg shadow-sm">
                    {item.icon}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                    <p className="text-gray-600 text-xs leading-relaxed font-normal">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleOpenLeadModal(`Offering: ${item.title}`)}
                    className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-black transition-colors"
                  >
                    Request Offering Details &amp; Pricing <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. BENEFITS & AUDIENCE TARGETING
      ══════════════════════════════════════════ */}
      <section className="py-12 md:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-1.5">Tailored For Institutions</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Who Are Our Workshops Designed For?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AUDIENCES.map((aud) => (
            <CardFlip
              key={aud.id}
              icon={aud.icon}
              subtitle={aud.subtitle}
              title={aud.title}
              description={aud.desc}
              features={aud.benefits}
              backImage={aud.backImage}
              ctaText={`Book For ${aud.title.split(' ')[0]}`}
              onCtaClick={() => handleOpenLeadModal(`Audience: ${aud.title}`)}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4B. CURRICULUM & NEP 2020 EDUCATIONAL ALIGNMENT (Redesigned Asymmetric Feature Grid)
      ══════════════════════════════════════════ */}
      <section className="py-12 md:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider inline-block mb-2">
            Academic Excellence &amp; Compliance
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Aligned with NEP 2020 &amp; STEAM Curriculum
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm max-w-xl mx-auto font-normal leading-relaxed">
            Our workshops go beyond simple crafts—they build tangible vocational skills, spatial geometry, and environmental responsibility required by modern education standards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Featured Institutional Seal Banner */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 p-6 md:p-8 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                <GraduationCap size={15} /> Official Curriculum Seal
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                Hands-On Vocational Skill Credits for Campuses
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed font-normal">
                Designed alongside educators and ecological architects, our modules empower schools to fulfill national green mandates effortlessly.
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-emerald-200/60">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-700 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-gray-800">Fulfills CBSE &amp; NEP 2020 mandatory vocational skill modules</p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-700 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-gray-800">Complete tool safety gear &amp; pre-sanded non-toxic timber provided</p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-700 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-gray-800">Official STEAM participation certificates for every student</p>
              </div>
            </div>

            <button
              onClick={() => handleOpenLeadModal('Curriculum & Syllabus Request')}
              className="w-full py-3 rounded-full bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              Request Syllabus &amp; Curriculum PDF <ArrowRight size={14} />
            </button>
          </div>

          {/* Right Column: 3 Structured Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-base font-bold text-gray-900">STEAM Integration</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  Integrates Science (Ornithology), Technology (Tools), Engineering (Habitats), Art (Eco-paint), and Math (Geometry).
                </p>
              </div>
              <span className="inline-block text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full w-max">
                Interdisciplinary
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                  <Leaf size={20} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Eco-Club Directives</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  Empowers campus Eco-Clubs to achieve green school audit points with permanent bird nest installations and plastic waste reduction.
                </p>
              </div>
              <span className="inline-block text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full w-max">
                Green Audit Points
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all space-y-3 sm:col-span-2 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-base font-bold text-gray-900">100% Tool &amp; Material Safety Assurance</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  All timber is pre-sanded with rounded edges. Child-safe hand tools, protective gloves, organic non-toxic paints, and certified instructor-to-student ratio (1:15) guaranteed.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  1:15 Instructor Ratio
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Zero Harm Certified
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. PROCESS — 3 SIMPLE STEPS (Redesigned Connected Timeline)
      ══════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider inline-block mb-2">
              Effortless Execution
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              How It Works in 3 Simple Steps
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm font-normal">
              From initial selection to live campus transformation—we handle materials, tools, and instructor logistics from start to finish.
            </p>
          </div>

          <div className="relative">
            {/* Horizontal Connecting Timeline Line on Desktop */}
            <div className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-emerald-200 via-[#CCFF00] to-emerald-200 -translate-y-6 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              
              {/* Step 1 */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 text-left relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#CCFF00] text-black font-bold flex items-center justify-center text-lg shadow-sm border border-black/10">
                      <Palette size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Step 01
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Choose Your Offerings</h3>
                  <p className="text-gray-600 text-xs leading-relaxed font-normal">
                    Select from bird house making, space makeovers, or custom eco-crafts based on your institution's age group and goals.
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                  <Sparkles size={13} className="text-emerald-600" /> Customized for age groups 6 to 22+
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 text-left relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#CCFF00] text-black font-bold flex items-center justify-center text-lg shadow-sm border border-black/10">
                      <Compass size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Step 02
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Co-Design &amp; Schedule</h3>
                  <p className="text-gray-600 text-xs leading-relaxed font-normal">
                    We bring all raw building timber, safety gear, non-toxic paints, and certified lead instructors directly to your campus.
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                  <Wrench size={13} className="text-emerald-600" /> Full logistics &amp; safety handled by us
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 text-left relative flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#CCFF00] text-black font-bold flex items-center justify-center text-lg shadow-sm border border-black/10">
                      <Wrench size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Step 03
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Install &amp; Transform</h3>
                  <p className="text-gray-600 text-xs leading-relaxed font-normal">
                    Students construct permanent campus installations, enhancing biodiversity and creating long-term environmental pride.
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Permanent green campus upgrade
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. PRICING & SUBSCRIPTION CARDS (Aligned with Brand Theme)
      ══════════════════════════════════════════ */}
      <section className="py-12 md:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold uppercase tracking-wider inline-block mb-2">
            Investment In Innovation
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Pricing &amp; Subscription Plans
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm max-w-xl mx-auto font-normal">
            Flexible options tailored for single-day campus events, multi-day space transformations, or long-term partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
          {PRICING_PLANS.map((plan, idx) => {
            const icons = [Pencil, Star, Sparkles];
            const CardIcon = icons[idx % icons.length];

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`bg-white rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 border ${
                  plan.popular 
                    ? 'border-[#CCFF00] ring-2 ring-[#CCFF00]/50 shadow-md md:scale-[1.02] z-10' 
                    : 'border-gray-200 shadow-xs hover:shadow-lg hover:border-emerald-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#CCFF00] text-black border border-black/10 font-bold text-[10px] px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center mb-4 shadow-xs">
                    <CardIcon size={18} className="stroke-[2]" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-1">{plan.name}</h3>
                  <p className="text-xs text-gray-500 font-medium mb-4 leading-relaxed">{plan.tagline}</p>

                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{plan.price}</span>
                    <span className="text-xs text-gray-500 font-semibold">/ {plan.unit}</span>
                  </div>

                  <div className="space-y-2.5 mb-6">
                    {plan.features.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="pt-0.5 leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenLeadModal(`Pricing Plan: ${plan.name}`)}
                  className={`w-full py-3 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                    plan.popular
                      ? 'bg-[#CCFF00] text-black hover:scale-105 shadow-md shadow-lime-200/60 border border-black/10'
                      : 'border border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  {plan.cta} <ArrowRight size={14} />
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 p-5 rounded-xl bg-white border border-gray-200 shadow-xs text-center text-xs text-gray-600 space-y-1 max-w-3xl mx-auto">
          <p><strong className="text-gray-900 font-semibold">Payment Terms:</strong> 50% upfront upon booking confirmation, 50% upon completion of the workshop / makeover.</p>
          <p><strong className="text-emerald-700 font-semibold">Bulk Booking Discount:</strong> Special pricing available for annual school partnerships and multi-campus bookings.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. TESTIMONIALS & INSTITUTIONAL REVIEWS (Diagram Alignment)
      ══════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              Real Institutional Results
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">
              What School &amp; University Leaders Say
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm font-normal">
              Hear from educators, design professors, and administrators who transformed their campuses with Nest N Nurture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 relative flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                </div>
                <p className="text-gray-700 text-xs italic leading-relaxed font-normal">
                  "The Nest N Nurture bird house workshop brought incredible energy to our school. Over 150 students from Class 5th to 10th built wooden habitats with their own hands. Our campus trees are now full of life!"
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2.5">
                <img
                  src="/workshops/logos/uss-logo.png"
                  alt="Unique School of Science Logo"
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs flex-shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Unique School of Science</h4>
                  <p className="text-[11px] text-gray-500 font-medium">School Administration, Nadiad</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 relative flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                </div>
                <p className="text-gray-700 text-xs italic leading-relaxed font-normal">
                  "Archana and her team delivered a masterclass in bio-design and space makeover. Our undergraduate students gained hands-on experience building permanent microclimate bird structures on campus."
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2.5">
                <img
                  src="/workshops/logos/anant-logo.png"
                  alt="Anant National University Logo"
                  className="w-10 h-10 rounded-lg object-contain bg-white p-0.5 border border-gray-200 shadow-xs flex-shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Anant National University</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Design Faculty, Ahmedabad</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 relative flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                  <Star size={14} className="fill-amber-400" />
                </div>
                <p className="text-gray-700 text-xs italic leading-relaxed font-normal">
                  "The upcycling tin can and tote bag workshops engaged all our participants. It combined environmental education with genuine creative joy. Highly recommended for any educational institution."
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2.5">
                <img
                  src="/workshops/logos/campleo-logo.png"
                  alt="Camp Leo Logo"
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs flex-shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Camp Leo Jungle Theme Resorts</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Resort Eco-Retreat &amp; Eco-Club Lead</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. CONTACT & DIRECT COLLABORATION CTA
      ══════════════════════════════════════════ */}
      <section className="py-12 md:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 md:p-12 rounded-2xl bg-white border border-gray-200 relative overflow-hidden shadow-md">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">Let's Bring Creativity to Your Campus</h2>
          <p className="text-gray-600 text-xs sm:text-sm max-w-xl mx-auto mb-6 font-normal leading-relaxed">
            Ready to engage your students or corporate team with high-impact eco workshops? Reach out directly to book dates.
          </p>

          <button
            onClick={() => handleOpenLeadModal('Custom Proposal Request')}
            className="inline-flex items-center gap-2 bg-[#CCFF00] text-black px-6 py-3 rounded-full text-xs sm:text-sm font-bold hover:scale-105 transition-all shadow-md shadow-lime-200/80 border border-black/10 cursor-pointer"
          >
            Submit Custom Proposal Request <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PHOTO LIGHTBOX MODAL (PORTAL)
      ══════════════════════════════════════════ */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activePhotoModal && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) setActivePhotoModal(null);
              }}
            >
              <div className="relative max-w-4xl w-full">
                <button
                  onClick={() => setActivePhotoModal(null)}
                  className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2 cursor-pointer"
                >
                  <X size={28} />
                </button>
                <img src={activePhotoModal} alt="Workshop detail photo" className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ══════════════════════════════════════════
          WORKSHOP LEAD CAPTURE POPUP MODAL (PORTAL)
      ══════════════════════════════════════════ */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {inquiryModalOpen && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) setInquiryModalOpen(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto my-auto"
              >
                <button
                  onClick={() => setInquiryModalOpen(false)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>

                <div className="mb-6">
                  <span className="px-3 py-1 rounded-full bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-widest inline-block mb-2">
                    Campus Workshop Booking
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">Book Nest N Nurture Workshop</h3>
                  <p className="text-xs text-emerald-700 font-bold mt-1">
                    Selected Target: <span className="text-gray-900">{selectedPlan}</span>
                  </p>
                </div>

                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-[#CCFF00] text-black flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircle2 size={44} />
                    </div>
                    <h4 className="text-2xl font-extrabold text-gray-900">Inquiry Received!</h4>
                    <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-gray-900">{formState.name}</strong>! Our workshop team will reach out to <strong className="text-gray-900">{formState.org || 'your institution'}</strong> via email or phone within 24 hours regarding <strong className="text-emerald-700">{selectedPlan}</strong>.
                    </p>
                    <button
                      onClick={() => setInquiryModalOpen(false)}
                      className="mt-4 px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    {/* ── PACKAGE / PLAN SELECTOR ── */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-800 flex items-center justify-between">
                        <span>Select Package / Plan To Buy or Inquire: *</span>
                        <span className="text-[10px] text-emerald-700 font-bold">Tap to change option</span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          {
                            id: '1-Day Workshop',
                            label: '1-Day Workshop',
                            price: '₹200 / student',
                            tag: 'Single Day'
                          },
                          {
                            id: '2-5 Days Bootcamp / Makeover',
                            label: '2-5 Days Bootcamp',
                            price: '₹40k - ₹2L',
                            tag: 'Most Popular'
                          },
                          {
                            id: '1-Month Subscription',
                            label: '1-Month Subscription',
                            price: '₹75,000 / mo',
                            tag: 'Full Campus'
                          }
                        ].map(p => {
                          const isSelected = selectedPlan.includes(p.id) || selectedPlan.includes(p.label);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedPlan(p.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/30 text-gray-900 shadow-sm'
                                  : 'bg-white/80 border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                    isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    {p.tag}
                                  </span>
                                  {isSelected && <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />}
                                </div>
                                <p className="text-xs font-extrabold text-gray-900 leading-tight mt-0.5">{p.label}</p>
                              </div>
                              <p className="text-[10px] font-extrabold text-emerald-700 mt-1">{p.price}</p>
                            </button>
                          );
                        })}
                      </div>

                      <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-black transition cursor-pointer"
                      >
                        <option value="1-Day Workshop">1-Day Workshop — ₹200 per student</option>
                        <option value="2-5 Days Bootcamp / Makeover">2-5 Days Bootcamp / Makeover — ₹40,000 - ₹2,00,000</option>
                        <option value="1-Month Subscription">1-Month Campus Eco-Subscription — ₹75,000 / month</option>
                        <option value="Custom Proposal Request">Custom Campus Package Request</option>
                        <option value="Audience: Schools & K-12 Institutes">Audience: Schools & K-12 Institutes</option>
                        <option value="Audience: Colleges & Design Universities">Audience: Colleges & Design Universities</option>
                        <option value="Audience: Workplaces & Corporate Teams">Audience: Workplaces & Corporate Teams</option>
                        <option value="Bird House Making Workshop">Offering: Bird House Making Workshop</option>
                        <option value="Bird Feeder Crafting Workshop">Offering: Bird Feeder Crafting Workshop</option>
                        <option value="Campus Space Makeover & Bio-Art">Offering: Campus Space Makeover & Bio-Art</option>
                        <option value="Plastic Waste Upcycling Workshop">Offering: Plastic Waste Upcycling Workshop</option>
                        <option value="Tote Bag Painting Workshop">Offering: Tote Bag Painting Workshop</option>
                        <option value="Upcycling Masterclass">Offering: Upcycling Masterclass</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                          Contact Person Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={e => setFormState({ ...formState, name: e.target.value })}
                          placeholder="e.g. Archana Gavas"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                          School / Institution / Org *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.org}
                          onChange={e => setFormState({ ...formState, org: e.target.value })}
                          placeholder="e.g. Unique Science School / University"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                          Phone / WhatsApp Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formState.phone}
                          onChange={e => setFormState({ ...formState, phone: e.target.value })}
                          placeholder="+91 9876543210"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={e => setFormState({ ...formState, email: e.target.value })}
                          placeholder="name@school.com"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                          City / Campus Location
                        </label>
                        <input
                          type="text"
                          value={formState.city}
                          onChange={e => setFormState({ ...formState, city: e.target.value })}
                          placeholder="e.g. Nadiad / Ahmedabad / Mumbai"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                          Expected Attendees
                        </label>
                        <select
                          value={formState.studentsCount}
                          onChange={e => setFormState({ ...formState, studentsCount: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black transition"
                        >
                          <option value="50-100">50 – 100 Students</option>
                          <option value="100-250">100 – 250 Students</option>
                          <option value="250-500">250 – 500 Students</option>
                          <option value="500+">500+ Students</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-2">
                        Select Preferred Activities:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Bird House Making',
                          'Bird Feeder Making',
                          'Space Makeovers & Installations',
                          'Plastic Waste Transformation',
                          'Tote Bag Painting',
                          'Upcycling Masterclass'
                        ].map((activity) => {
                          const isSelected = formState.selectedActivities.includes(activity);
                          return (
                            <button
                              key={activity}
                              type="button"
                              onClick={() => toggleActivitySelect(activity)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}{activity.replace('&amp;', '&')}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                        Additional Requirements / Preferred Event Dates
                      </label>
                      <textarea
                        rows={3}
                        value={formState.notes}
                        onChange={e => setFormState({ ...formState, notes: e.target.value })}
                        placeholder="Mention any specific dates, student grade levels, or campus goals..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-[#CCFF00] text-black font-black text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-200 border border-black/10 cursor-pointer"
                    >
                      {submitting ? 'Submitting Order / Inquiry...' : `Proceed with ${selectedPlan.replace('Pricing Plan: ', '')}`} <Send size={16} />
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
