import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Compass, Droplets, Sun, Wind, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import StickyConsultationBar from '../components/StickyConsultationBar';

export interface DestinationData {
  slug: string;
  name: string;
  state: string;
  region: string;
  heroHeadline: string;
  subheadline: string;
  elevation: string;
  rainfall: string;
  soilType: string;
  climateZone: string;
  localRegulations: string;
  architecturalStrategy: string[];
  recommendedMaterials: { name: string; why: string }[];
  caseStudyAnchor: { title: string; link: string; description: string };
  faqs: { question: string; answer: string }[];
}

export const DESTINATIONS: Record<string, DestinationData> = {
  'karjat': {
    slug: 'karjat',
    name: 'Karjat & Western Ghats',
    state: 'Maharashtra',
    region: 'Mumbai & Pune Luxury Farmhouse Belt',
    heroHeadline: 'Sustainable Farmhouse & Eco-Retreat Architecture in Karjat',
    subheadline: 'Biophilic estate masterplanning, basalt stone masonry, and monsoon hydrology engineered for 1 to 20-acre private retreats in the Western Ghats.',
    elevation: '100m – 350m ASL',
    rainfall: '3,200mm annual monsoon deluge',
    soilType: 'Basalt rock base with thin, erosion-prone red clay topsoil',
    climateZone: 'Humid Tropical Monsoonal',
    localRegulations: 'Collector NA permission / Agricultural zoning with strict green buffer & contour runoff norms.',
    architecturalStrategy: [
      'Elevated stone plinths (minimum 600mm) to prevent monsoon moisture penetration and flash flood pooling.',
      'Massive 1.8m to 2.4m roof overhangs to protect natural lime-plastered walls from torrential monsoonal winds.',
      'Keyline drainage swales and step-down detention ponds to recharge dry borewells without causing slope failure.',
      'Cross-ventilated pavilions oriented along the SW-NE wind axis to eliminate artificial air-conditioning from November to March.'
    ],
    recommendedMaterials: [
      { name: 'Locally Quarried Basalt', why: 'High thermal mass for base plinths and perimeter retaining walls that resist torrential monsoon runoff.' },
      { name: 'Stabilized Rammed Earth (CSRE)', why: 'Breathable, non-toxic internal partitions with natural humidity buffering.' },
      { name: 'Clay Mangalore Roofing Tiles', why: 'Excellent acoustic damping during heavy rains with continuous passive attic ridge ventilation.' }
    ],
    caseStudyAnchor: {
      title: 'Vanvagado 15-Acre Eco-Farm Stay & Hydrology Masterplan',
      link: '/projects/vanvagado-farm',
      description: 'See how we contoured natural slopes, restored dead borewells, and built earth-integrated guest cottages.'
    },
    faqs: [
      {
        question: 'How much does it cost to build an eco-farmhouse in Karjat per square foot?',
        answer: 'Sustainable natural construction using dressed basalt plinths, stabilized earth blocks (CSEB), and timber roof trusses in Karjat typically ranges between ₹2,800 and ₹4,200 per sq. ft., depending on site contour steepness and finish grade.'
      },
      {
        question: 'How do you handle Karjat’s 3,000mm+ monsoons with earth walls?',
        answer: 'We follow the timeless vernacular rule: "a good pair of boots and a broad hat." Earth walls are placed on elevated basalt plinths (600mm+) with generous 2-meter roof overhangs and protected by hydrophobic natural slaked lime washes.'
      },
      {
        question: 'Can you masterplan our borewell and water retention ponds before building?',
        answer: 'Yes. Our permaculture masterplanning team analyzes site topography with GIS contour models to position swales and groundwater percolation ponds, preventing seasonal water shortages entirely.'
      }
    ]
  },
  'alibaug': {
    slug: 'alibaug',
    name: 'Alibaug Coastal Belt',
    state: 'Maharashtra',
    region: 'Coastal Luxury Villa Corridor',
    heroHeadline: 'Coastal Passive Villa & Eco-Resort Architecture in Alibaug',
    subheadline: 'Saline-resistant biophilic homes, courtyards, and natural biological pools designed for high-net-worth Mumbai weekenders.',
    elevation: '5m – 25m ASL',
    rainfall: '2,800mm coastal monsoon',
    soilType: 'Coastal alluvium with high saline water table',
    climateZone: 'Tropical Coastal Maritime (High Humidity)',
    localRegulations: 'CRZ (Coastal Regulation Zone) clearances and local Gram Panchayat / Town Planning guidelines.',
    architecturalStrategy: [
      'Courtyard (Angan) layouts engineered to create stack-effect passive cooling and wind scoops capturing sea breezes.',
      'Elimination of exposed steel rebar near coastlines to prevent irreversible spalling and rust degradation.',
      'Biological natural swimming pools filtered by reeds and gravel beds instead of skin-irritating chlorinated systems.',
      'Dune-stabilizing coastal permaculture buffers with casuarina, coconut, and vetiver to prevent sand intrusion.'
    ],
    recommendedMaterials: [
      { name: 'Laterite Stone Blocks', why: 'High natural porosity and phenomenal aesthetic patina in maritime salt-spray environments.' },
      { name: 'Teak and Treated Bamboo', why: 'Salt-tolerant hardwoods treated with natural linseed oils for shaded ocean-facing verandahs.' },
      { name: 'Hydrated Slaked Lime Plaster', why: 'Mildew-resistant and breathable finish that actively deters coastal fungal growth.' }
    ],
    caseStudyAnchor: {
      title: 'Carpa Lupa Bamboo & Biophilic Cottages',
      link: '/projects/carpa-lupa',
      description: 'Explore our waterfront timber and bamboo architecture designed for high-humidity coastal microclimates.'
    },
    faqs: [
      {
        question: 'Why does conventional RCC concrete crack and deteriorate so fast in Alibaug?',
        answer: 'Coastal salt spray infiltrates micro-cracks in conventional concrete, reacting with internal steel reinforcement to cause severe rusting and structural spalling within 7–10 years. We use lime-based mortars, stone masonry, and timber framing.'
      },
      {
        question: 'Can we build a natural swimming pool in Alibaug without chlorine?',
        answer: 'Yes. A natural living pool uses a designated regeneration zone filled with gravel and aquatic plants (canna, reeds) that naturally purify the water, saving up to ₹40,000 monthly in chemical and pump maintenance.'
      }
    ]
  },
  'coorg': {
    slug: 'coorg',
    name: 'Coorg (Kodagu)',
    state: 'Karnataka',
    region: 'Western Ghats Coffee Plantation Belt',
    heroHeadline: 'Plantation Estate Masterplanning & Eco-Retreat Design in Coorg',
    subheadline: 'Contour keyline hydrology, shade-grown food forestry, and heritage vernacular estate architecture for 10 to 100-acre estates.',
    elevation: '900m – 1,750m ASL',
    rainfall: '2,500mm – 4,000mm intense rainfall',
    soilType: 'Humus-rich acidic red loamy soil',
    climateZone: 'Subtropical Highland Montane',
    localRegulations: 'Coffee plantation zoning regulations, tree preservation guidelines, and eco-tourism hospitality norms.',
    architecturalStrategy: [
      'Zero-cut, zero-fill structural foundations on steep contours using pile piers to prevent slope landslides.',
      'High thermal-retention living rooms with internal stone fireplaces for misty monsoon and winter nights.',
      'Integration of syntropic coffee, black pepper, and cardamom multi-tier food forests directly into guest circulation trails.',
      'Ridge-line rainwater harvesting feeding decentralized gravity-fed micro-hydro and drip irrigation systems.'
    ],
    recommendedMaterials: [
      { name: 'Rough Hewn Granite & Quartzite', why: 'Dense thermal mass sourced from ethical nearby quarries that anchors mountain structures.' },
      { name: 'Reclaimed Plantation Timber', why: 'Authentic Kodagu estate visual heritage with zero virgin forest harvesting.' },
      { name: 'Porous Terracotta Pavers', why: '100% permeable walkways allowing rain to seep into the plantation root zone.' }
    ],
    caseStudyAnchor: {
      title: 'Batukaru Yurt & Eco-Wellness Sanctuary',
      link: '/projects/batukaru-yurt',
      description: 'Private mountain wellness retreat engineered with natural timber framing, sauna, and panoramic valley decks.'
    },
    faqs: [
      {
        question: 'How do you build on steep 25-degree coffee plantation slopes in Coorg?',
        answer: 'We utilize stilt and pier foundations anchored into bedrock, avoiding devastating bulldozing or earth excavation that triggers soil erosion and land slippage during heavy monsoon months.'
      },
      {
        question: 'What is the approval process for eco-homestays on Coorg plantations?',
        answer: 'Karnataka Tourism and local Panchayat guidelines permit registered homestays within plantation limits under specific room quotas. We optimize your masterplan to remain strictly compliant while maximizing guest tariff value.'
      }
    ]
  },
  'wayanad': {
    slug: 'wayanad',
    name: 'Wayanad',
    state: 'Kerala',
    region: 'Highland Forest & Agrotourism Corridor',
    heroHeadline: 'Biophilic Airbnb Cottages & Regenerative Resort Architecture in Wayanad',
    subheadline: 'Treated bamboo framing, earth block construction, and forest canopy living spaces designed for high-occupancy eco-tourism.',
    elevation: '700m – 2,100m ASL',
    rainfall: '3,000mm high-intensity precipitation',
    soilType: 'Forest loam over laterite sub-strata',
    climateZone: 'Tropical Wet Forest Highland',
    localRegulations: 'Ecologically sensitive zone (ESZ) norms and Kerala Panchayat Building Rules (KMBR).',
    architecturalStrategy: [
      'Hyper-lightweight timber and borax-treated bamboo structural envelopes that sit gently on sensitive forest floor ecologies.',
      'Large panoramic glass openings shaded by extended bamboo lattice louvers that capture panoramic misty valley views.',
      'Greywater phyto-purification systems utilizing reed beds to ensure zero untreated discharge into mountain streams.',
      'Solar passive thermal orientation harnessing morning solar heat while deflecting harsh afternoon glare.'
    ],
    recommendedMaterials: [
      { name: 'Borate-Treated Structural Bamboo', why: 'Tensile strength comparable to mild steel with negative embodied carbon.' },
      { name: 'Interlocking Stabilized Mud Blocks', why: 'Manufactured on-site from excavated soil without energy-intensive kiln baking.' },
      { name: 'Natural Thatched / Shingle Roofing', why: 'Organic mountain aesthetic with superior thermal and acoustic insulation.' }
    ],
    caseStudyAnchor: {
      title: 'Carpa Lupa Bamboo & Waterfront Retreat',
      link: '/projects/carpa-lupa',
      description: 'Award-winning bamboo cottages designed for high nightly Airbnb RevPAR in Wayanad.'
    },
    faqs: [
      {
        question: 'Does structural bamboo last in Kerala’s heavy monsoon climate?',
        answer: 'Yes, when properly pressure-treated with non-toxic borate salts and detailed with proper plinths and roof overhangs, structural bamboo lasts 40+ years without termite or fungal infestation.'
      },
      {
        question: 'What nightly tariff can biophilic cottages command in Wayanad?',
        answer: 'Our completed nature-integrated cottages in Wayanad command nightly rates between ₹8,500 and ₹18,000 with 65–80% year-round occupancy, delivering full CapEx payback within 2.5 to 3.5 years.'
      }
    ]
  },
  'goa': {
    slug: 'goa',
    name: 'Goa (North & South)',
    state: 'Goa',
    region: 'Tropical Boutique Hospitality & Heritage Belt',
    heroHeadline: 'Sustainable Boutique Resort & Portuguese Villa Architecture in Goa',
    subheadline: 'Vernacular laterite restoration, biological living pools, and passive courtyard villas tailored for luxury conscious travelers.',
    elevation: '10m – 80m ASL',
    rainfall: '3,000mm monsoon',
    soilType: 'Deep red laterite stone',
    climateZone: 'Warm Humid Maritime',
    localRegulations: 'Town & Country Planning (TCP), Conservation Zone regulations, and Coastal CRZ norms.',
    architecturalStrategy: [
      'Central cooling courtyards and wrap-around Balcão verandahs that foster open-air communal living without high AC bills.',
      'Deep roof eaves with clay Mangalore tiles and copper water gutters directing rainwater into subterranean cisterns.',
      'Preservation of mature mango, cashew, and coconut canopies as primary microclimate cooling buffers.'
    ],
    recommendedMaterials: [
      { name: 'Exposed Hand-Cut Laterite', why: 'The quintessential Goan building block with superb local character and thermal comfort.' },
      { name: 'Recycled Teak & Jackwood', why: 'Salvaged timber doors and window shutters that outlast contemporary synthetic laminates.' },
      { name: 'Lime and Oxide Flooring', why: 'Silky smooth, cool-to-touch floors in traditional mustard, terracotta, and olive hues.' }
    ],
    caseStudyAnchor: {
      title: 'Ramgarh Shiloh Boutique Hospitality Experience',
      link: '/projects/ramgarh-nainital-interior-project-shiloh-experiences-hotel',
      description: 'See our high-end boutique hospitality interiors blending vernacular textures with luxury comfort.'
    },
    faqs: [
      {
        question: 'Can you restore old Portuguese homes in Goa sustainably?',
        answer: 'Yes. We specialize in sensitive heritage retrofitting—replacing cement patches with breathable slaked lime, restoring timber trusses, and introducing discreet modern plumbing and solar heating.'
      },
      {
        question: 'Why choose natural pools over conventional chemical pools for Goan luxury villas?',
        answer: 'Natural living pools eliminate chlorine eye burn, reduce monthly chemical costs to zero, and provide an ultra-luxurious, Instagram-worthy amenity that eco-conscious luxury renters seek.'
      }
    ]
  },
  'vadodara': {
    slug: 'vadodara',
    name: 'Vadodara & Central Gujarat',
    state: 'Gujarat',
    region: 'Semi-Arid Luxury Farmhouse & Orchard Belt',
    heroHeadline: 'Sustainable Farmhouse & Permaculture Masterplanning in Vadodara',
    subheadline: 'Thermal comfort architecture, groundwater recharge swales, and food forest design for 2 to 50-acre agricultural estates.',
    elevation: '35m ASL',
    rainfall: '850mm semi-arid monsoon',
    soilType: 'Heavy Black Cotton Soil with shrink-swell characteristics',
    climateZone: 'Semi-Arid Hot & Dry (Peak Summers 44°C+)',
    localRegulations: 'VUDA / GIDC / Agricultural land zoning and groundwater conservation regulations.',
    architecturalStrategy: [
      'Deep under-reamed pile foundations engineered specifically to withstand heavy black cotton soil swell and shrinkage.',
      'Thick 350mm stabilized earth walls and cavity wall envelopes that keep indoor temperatures 8°C cooler than the 44°C Gujarat summer heat.',
      'Keyline swales and deep percolation recharge shafts to capture every drop of the brief 850mm monsoon and recharge failing borewells.',
      'Integrated shade-house courtyards with humidifying water mist fountains to temper dry desert winds.'
    ],
    recommendedMaterials: [
      { name: 'Compressed Stabilized Earth Blocks (CSEB)', why: 'Engineered with local clay-sand soil for massive thermal damping and minimal embodied energy.' },
      { name: 'Lime & Stone Plasters', why: 'Reflects 85%+ of solar radiation, eliminating heat accumulation in building mass.' },
      { name: 'Handcrafted Terracotta Jali Screens', why: 'Provides diffuse natural daylight while cutting intense desert sun glare.' }
    ],
    caseStudyAnchor: {
      title: 'Vanvagado 15-Acre Eco-Farm Masterplan & Pond',
      link: '/projects/vanvagado-farm',
      description: 'Our flagship Gujarat regenerative farm estate featuring water retention, fruit orchards, and earth architecture.'
    },
    faqs: [
      {
        question: 'How do you build foundations safely on Gujarat’s black cotton soil?',
        answer: 'Black cotton soil expands drastically when wet and shrinks when dry, cracking standard strip footings. We engineer under-reamed pile foundations that bypass the expansive top layer and anchor into stable strata below.'
      },
      {
        question: 'Can a home in Vadodara stay cool in 44°C heat without air conditioning all day?',
        answer: 'Yes. By utilizing 350mm compressed earth block walls, double-glazed low-E windows, reflective lime roofs, and evening cross-ventilation flues, indoor temperatures remain comfortably between 26°C and 29°C naturally.'
      }
    ]
  }
};

const DestinationDetail: React.FC = () => {
  const { destination } = useParams<{ destination: string }>();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [destination]);

  // Clean slug
  const cleanSlug = (destination || '').toLowerCase().replace(/-architect|-architecture|-retreat|-farmhouse/g, '').trim();
  const data = DESTINATIONS[cleanSlug] || DESTINATIONS['karjat'];

  const canonicalUrl = `https://www.anvitam.com/destinations/${data.slug}`;

  return (
    <div className="bg-[#FAF9F5] text-[#111] min-h-screen font-sans selection:bg-[#CCFF00] selection:text-[#111]">
      <Helmet>
        <title>{`${data.heroHeadline} | Anvitam Architects`}</title>
        <meta name="description" content={data.subheadline} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${data.heroHeadline} | Anvitam Architects`} />
        <meta property="og:description" content={data.subheadline} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />

        {/* LocalBusiness & Service Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": `Anvitam - ${data.name} Eco Architecture & Masterplanning`,
            "description": data.subheadline,
            "url": canonicalUrl,
            "telephone": "+917990657190",
            "address": {
              "@type": "PostalAddress",
              "addressRegion": data.state,
              "addressCountry": "IN"
            },
            "areaServed": {
              "@type": "AdministrativeArea",
              "name": data.name
            },
            "founder": {
              "@type": "Person",
              "name": "Archana Gavas",
              "jobTitle": "Principal Architect & Ecological Designer"
            }
          })}
        </script>

        {/* FAQPage Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": data.faqs.map(f => ({
              "@type": "Question",
              "name": f.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": f.answer
              }
            }))
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#556B2F] mb-6">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight size={12} />
          <span>Regional Practice</span>
          <ChevronRight size={12} />
          <span className="text-[#111]">{data.name}</span>
        </div>

        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EED9] text-[#334D11] text-xs font-bold uppercase tracking-wider mb-6">
            <MapPin size={13} />
            <span>{data.region}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-[#111] tracking-tight leading-[1.12] mb-6">
            {data.heroHeadline}
          </h1>

          <p className="text-lg md:text-xl text-gray-700 font-light leading-relaxed mb-8 max-w-3xl">
            {data.subheadline}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://topmate.io/archanagavas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#111] font-bold px-7 py-3.5 rounded-full text-sm hover:bg-[#b8e600] transition-transform hover:scale-[1.02] shadow-sm"
            >
              <span>Book Masterplanning Review</span>
              <ArrowRight size={16} />
            </a>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-[#111] font-semibold px-6 py-3.5 rounded-full text-sm transition-colors"
            >
              <span>Explore Realized Projects</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Climate & Site Matrix Grid */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">
            Geographic &amp; Microclimatic Baseline Matrix
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-gray-150">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
                <Compass size={14} className="text-[#556B2F]" /> Elevation &amp; Terrain
              </div>
              <p className="text-base font-bold text-[#111]">{data.elevation}</p>
              <p className="text-xs text-gray-500 mt-1">{data.climateZone}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-gray-150">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
                <Droplets size={14} className="text-[#2F6B55]" /> Rainfall &amp; Hydrology
              </div>
              <p className="text-base font-bold text-[#111]">{data.rainfall}</p>
              <p className="text-xs text-gray-500 mt-1">Requires active storm detention &amp; swales</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-gray-150">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
                <Sun size={14} className="text-[#856404]" /> Soil Profile
              </div>
              <p className="text-base font-bold text-[#111]">{data.soilType}</p>
              <p className="text-xs text-gray-500 mt-1">Informs foundation engineering</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-gray-150">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
                <ShieldCheck size={14} className="text-[#556B2F]" /> Planning &amp; Bylaws
              </div>
              <p className="text-sm font-semibold text-[#111] leading-snug">{data.localRegulations}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Principles & Strategies */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#556B2F] mb-3 block">
              Site-Responsive Engineering
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#111] leading-tight mb-6">
              How We Architect for {data.name}
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
              Cookie-cutter urban architecture fails disastrously in rural environments. In {data.name}, 
              extreme weather swings and specific soil compositions require customized structural details 
              that blend vernacular heritage with modern structural engineering.
            </p>

            {/* Case Study Anchor Card */}
            <div className="p-6 rounded-2xl bg-[#F4F7EC] border border-[#D5E5B8]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D5A12] bg-[#E2ECC8] px-2.5 py-1 rounded-full">
                Featured Case Study
              </span>
              <h3 className="text-base font-bold text-[#111] mt-3 mb-1">{data.caseStudyAnchor.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">{data.caseStudyAnchor.description}</p>
              <Link
                to={data.caseStudyAnchor.link}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D5A12] hover:underline"
              >
                <span>View Full Case Study</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {data.architecturalStrategy.map((strat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-gray-150 shadow-sm flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#CCFF00]/30 text-[#111] font-bold flex items-center justify-center shrink-0 text-sm">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-[#111] font-medium text-sm md:text-base leading-relaxed">{strat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Indigenous Materials */}
      <section className="py-16 bg-[#F5F4EE] border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#556B2F] mb-2 block">
              Indigenous Material Sourcing
            </span>
            <h2 className="text-3xl font-serif font-medium text-[#111]">
              Low-Carbon Materials Sourced for {data.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.recommendedMaterials.map((mat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-gray-200">
                <CheckCircle2 size={20} className="text-[#556B2F] mb-3" />
                <h3 className="text-lg font-bold text-[#111] mb-2">{mat.name}</h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{mat.why}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Directory Links for High Programmatic DA */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            Explore Other Destination Practices
          </p>
          <div className="flex flex-wrap gap-2.5">
            {Object.values(DESTINATIONS).map(dest => (
              <Link
                key={dest.slug}
                to={`/destinations/${dest.slug}`}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
                  dest.slug === data.slug
                    ? 'bg-[#111] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {dest.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#556B2F] mb-2 block">
            AEO &amp; Technical Questions
          </span>
          <h2 className="text-3xl font-serif font-medium text-[#111]">
            Frequently Asked Questions for {data.name}
          </h2>
        </div>

        <div className="space-y-4">
          {data.faqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-base md:text-lg font-bold text-[#111] mb-2.5">{faq.question}</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Consultation Bar */}
      <StickyConsultationBar 
        customHeadline={`Planning an estate, farm retreat, or villa in ${data.name}?`}
        customSubtext="Review your site contours, soil report, and water planning directly with Ar. Archana Gavas."
        customButtonText="Book Site Review"
      />
    </div>
  );
};

export default DestinationDetail;
