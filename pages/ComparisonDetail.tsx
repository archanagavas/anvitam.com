import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, Scale, ChevronRight, HelpCircle } from 'lucide-react';
import StickyConsultationBar from '../components/StickyConsultationBar';

export interface ComparisonData {
  slug: string;
  title: string;
  subtitle: string;
  optionA: {
    name: string;
    badge: string;
    tagline: string;
    upfrontCost: string;
    tenYearCost: string;
    thermalPerformance: string;
    embodiedCarbon: string;
    lifespan: string;
    pros: string[];
    cons: string[];
  };
  optionB: {
    name: string;
    badge: string;
    tagline: string;
    upfrontCost: string;
    tenYearCost: string;
    thermalPerformance: string;
    embodiedCarbon: string;
    lifespan: string;
    pros: string[];
    cons: string[];
  };
  architectVerdict: string;
  caseStudyAnchor: { title: string; link: string; description: string };
  faqs: { question: string; answer: string }[];
}

export const COMPARISONS: Record<string, ComparisonData> = {
  'rammed-earth-vs-rcc': {
    slug: 'rammed-earth-vs-rcc',
    title: 'Stabilized Rammed Earth vs RCC Frame Construction in India',
    subtitle: 'An objective architectural breakdown of real construction costs, 40°C thermal comfort, embodied carbon, and 50-year maintenance realities.',
    optionA: {
      name: 'Stabilized Rammed Earth (CSRE)',
      badge: 'Natural & Ecological',
      tagline: 'Monolithic monolithic earth walls built using compacted subsoil, sand, and 5-8% lime/cement stabilizer.',
      upfrontCost: '₹2,600 – ₹3,800 per sq. ft.',
      tenYearCost: 'Lowest (No repainting, zero plaster peeling)',
      thermalPerformance: 'Superior (Maintains indoor 25–28°C when outside is 42°C)',
      embodiedCarbon: '70–85% reduction vs RCC frame',
      lifespan: '100+ years with proper plinth and roof overhangs',
      pros: [
        'Massive thermal mass dampens extreme day-night temperature swings completely.',
        'Zero VOCs and natural indoor humidity regulation between 40% and 60%.',
        'Eliminates repetitive exterior painting and plaster repair cycles.',
        'Sourced primarily from on-site foundation excavation earth.'
      ],
      cons: [
        'Requires specialized craftsmanship and experienced rammed earth formwork teams.',
        'Walls are thicker (300mm–450mm), slightly reducing internal net carpet ratio.'
      ]
    },
    optionB: {
      name: 'Conventional RCC Frame + Fly Ash Brick',
      badge: 'Standard Industrial',
      tagline: 'Reinforced cement concrete columns and beams with commercial brick infill and acrylic paint finishes.',
      upfrontCost: '₹2,400 – ₹3,500 per sq. ft.',
      tenYearCost: 'High (Requires 2–3 rounds of waterproofing & repaint)',
      thermalPerformance: 'Poor (Heats up like an oven; demands continuous AC)',
      embodiedCarbon: 'Extreme high carbon footprint (cement & rebar heavy)',
      lifespan: '40–60 years before concrete carbonation & spalling',
      pros: [
        'Readily available local labor and standard contractor familiarity.',
        'Thinner 200mm wall profiles allow marginally more carpet area.'
      ],
      cons: [
        'Stores intense daytime solar heat and radiates it indoors all night.',
        'High monthly air conditioning electricity bills across Indian summers.',
        'Prone to moisture seeping, hairline plaster cracking, and paint bubbling.'
      ]
    },
    architectVerdict: 'For rural farm retreats, weekend villas, and eco-resorts, Stabilized Rammed Earth wins decisively. Although labor requires experienced supervision during the compaction phase, the 8°C cooler indoor temperatures, zero repaint maintenance, and timeless natural aesthetics deliver vastly superior lifetime value.',
    caseStudyAnchor: {
      title: 'Our Bihar Eco-Home Project (Lime & Earth)',
      link: '/projects/yourweb3guy',
      description: 'Explore how passive earth walls and lime plaster created a sanctuary that stays naturally cool without running ACs all day.'
    },
    faqs: [
      {
        question: 'Does rammed earth wash away in heavy Indian monsoons?',
        answer: 'No. Stabilized rammed earth contains 5–8% mineral stabilizers and is placed on elevated stone plinths with generous roof overhangs. Monolithic rammed earth structures in torrential monsoon zones have stood intact for centuries.'
      },
      {
        question: 'Is rammed earth construction cheaper than RCC in India?',
        answer: 'Upfront square-foot costs are comparable (₹2,600–₹3,800/sq.ft). However, rammed earth saves ₹15,000–₹30,000 per month on AC power bills and eliminates periodic exterior plastering and repainting costs.'
      }
    ]
  },
  'natural-pool-vs-chlorine-pool': {
    slug: 'natural-pool-vs-chlorine-pool',
    title: 'Natural Living Swimming Pool vs Chemical Chlorine Pool for Resorts',
    subtitle: 'Cost, operational maintenance, water ecology, and guest experience compared for luxury retreats and private estates.',
    optionA: {
      name: 'Natural Biological Pool (NSP)',
      badge: 'Living Ecosystem',
      tagline: 'Pure, chemical-free freshwater filtered naturally through aquatic plants, biological gravel filters, and gentle aeration.',
      upfrontCost: '₹3,500 – ₹5,500 per sq. ft. of water surface',
      tenYearCost: '₹1,500/month (Zero chemical purchases, minimal pump wattage)',
      thermalPerformance: 'Naturally balanced; silky freshwater feel',
      embodiedCarbon: 'Low (Natural gravel, bio-membrane, indigenous plants)',
      lifespan: 'Permanent ecological asset that matures over time',
      pros: [
        '100% free of chlorine, ozone, or chemical algicides, yielding pure, drinkable quality freshwater.',
        'No burning eyes, chemical smells, or dry skin for swimmers.',
        'Attracts beneficial dragonflies, birds, and creates an Instagram-magnet amenity.',
        'Water never needs draining; can be repurposed directly for farm irrigation.'
      ],
      cons: [
        'Requires 30–50% additional footprint area for the regeneration plant filter zone.',
        'Ecosystem requires 4–6 weeks to biologically stabilize initially.'
      ]
    },
    optionB: {
      name: 'Conventional Chemical Chlorine Pool',
      badge: 'Industrial Standard',
      tagline: 'Concrete basin lined with ceramic tiles, requiring continuous chlorine dosing, acid balancing, and high-wattage pumps.',
      upfrontCost: '₹3,000 – ₹4,800 per sq. ft. of water surface',
      tenYearCost: '₹25,000 – ₹45,000/month in chemicals, power, and backwashing',
      thermalPerformance: 'Cold and chemical-smelling',
      embodiedCarbon: 'High concrete, ceramic tile, and continuous toxic chemical usage',
      lifespan: 'Requires tile regrouting and pump overhaul every 4–5 years',
      pros: [
        'Fits into smaller, tighter footprints with no vegetative zone.',
        'Fast initial fill and chemically sterilized within 24 hours.'
      ],
      cons: [
        'Heavy ongoing monthly expense on chlorine granules, stabilizers, and algicides.',
        'Chloramines irritate eyes, cause respiratory discomfort, and fade swimwear.',
        'Backwash water is contaminated with chlorine and cannot be used on plants.'
      ]
    },
    architectVerdict: 'For any boutique resort, wellness sanctuary, or farm estate, a Natural Swimming Pool is one of the highest-ROI investments you can make. The zero monthly chemical overhead combined with the unmatched biophilic guest experience makes chlorine pools obsolete for nature-conscious properties.',
    caseStudyAnchor: {
      title: 'Vanvagado 15-Acre Natural Water Retention & Living Pond',
      link: '/projects/vanvagado-farm',
      description: 'See how biological filtration and natural earth contouring created self-purifying living water bodies.'
    },
    faqs: [
      {
        question: 'Do natural swimming pools breed mosquitoes?',
        answer: 'No. Mosquitoes only breed in stagnant, low-oxygen water. Natural biological pools feature continuous gentle water circulation through biological filters and are inhabited by surface-feeding fish and predatory dragonflies that consume mosquito larvae immediately.'
      },
      {
        question: 'How much does a natural pool cost to maintain monthly?',
        answer: 'Unlike chlorine pools which consume ₹25,000–₹45,000 monthly in chlorine, pH balancers, and high-pressure backwashing, a natural pool costs less than ₹2,000/month in simple skimmer cleaning and low-wattage aeration.'
      }
    ]
  },
  'permaculture-planner-vs-landscape-architect': {
    slug: 'permaculture-planner-vs-landscape-architect',
    title: 'Permaculture Masterplanner vs Conventional Landscape Architect',
    subtitle: 'Why ornamental landscaping fails large rural estates, and how ecological masterplanning creates self-funding regenerative landscapes.',
    optionA: {
      name: 'Ecological Permaculture Masterplanner',
      badge: 'Holistic Regeneration',
      tagline: 'Designs multi-acre hydrology, soil microbiology, windbreaks, syntropic food forests, and circular resource systems.',
      upfrontCost: 'Value-engineered integrated masterplan',
      tenYearCost: 'Generates revenue (Fruit yields, timber, groundwater security)',
      thermalPerformance: 'Cools the surrounding microclimate by 3–6°C via evapotranspiration',
      embodiedCarbon: 'Active carbon sequestration into soil and biomass',
      lifespan: 'Perpetually self-multiplying ecological resilience',
      pros: [
        'Solves dry borewells through keyline earthworks and groundwater recharge swales.',
        'Replaces high-maintenance lawns with productive, edible syntropic agroforestry.',
        'Designs biological windbreaks that protect orchards and villas from storms.',
        'Eliminates toxic chemical fertilizers and synthetic pesticides forever.'
      ],
      cons: [
        'Requires 1–3 years for natural food forest succession to reach peak density.'
      ]
    },
    optionB: {
      name: 'Conventional Nursery Landscape Architect',
      badge: 'Ornamental / Cosmetic',
      tagline: 'Decorates plots with imported exotic lawn turf, trimmed hedges, and decorative ornamental nursery shrubs.',
      upfrontCost: 'High nursery plant purchase and heavy grading',
      tenYearCost: 'Extremely high water, fertilizer, and mowing expenses',
      thermalPerformance: 'Minimal microclimatic impact; large manicured lawns consume water',
      embodiedCarbon: 'High chemical inputs, frequent plant replacements, and mowing fuel',
      lifespan: 'Collapses as soon as city water tankers or gardening labor stops',
      pros: [
        'Instant cosmetic "manicured resort" look on day one.'
      ],
      cons: [
        'Exotic turf grass consumes 25,000+ liters of water daily per acre.',
        'Requires constant chemical sprays, weedkillers, and weekly lawnmower maintenance.',
        'Does nothing to address failing borewells, soil compaction, or high wind exposure.'
      ]
    },
    architectVerdict: 'On plots greater than 1 acre, conventional ornamental landscaping is an expensive, water-guzzling trap. A permaculture masterplanner designs living infrastructure: water security, rich living soil, and edible abundance that increases property value year after year.',
    caseStudyAnchor: {
      title: 'Kamba Agrotourism 45-Acre Masterplan',
      link: '/projects/kamba-agrotourism-vardhaman-royal-organic-agri-farm',
      description: 'Discover how 45 acres of agricultural land were organized into syntropic zones, agroforestry, and visitor trails.'
    },
    faqs: [
      {
        question: 'When should we hire a permaculture masterplanner for our land?',
        answer: 'Before you dig a borewell, cut a road, or pour a foundation. Earth contouring, rainwater capture, and sun/wind zoning dictate where your buildings, cottages, and driveways should sit to minimize costly excavation mistakes.'
      },
      {
        question: 'Can permaculture design look luxurious and manicured?',
        answer: 'Absolutely. We design organized wildness by combining structured stone pathways, flowering perennial borders, and reflection ponds with dense multi-tier food forests, creating a sophisticated biophilic sanctuary.'
      }
    ]
  }
};

const ComparisonDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const cleanSlug = (slug || '').toLowerCase().trim();
  const data = COMPARISONS[cleanSlug] || COMPARISONS['rammed-earth-vs-rcc'];

  const canonicalUrl = `https://www.anvitam.com/compare/${data.slug}`;

  return (
    <div className="bg-[#FAF9F5] text-[#111] min-h-screen font-sans selection:bg-[#CCFF00] selection:text-[#111]">
      <Helmet>
        <title>{`${data.title} | Anvitam Architecture`}</title>
        <meta name="description" content={data.subtitle} />
        <link rel="canonical" href={canonicalUrl} data-rh="true" id="canonical-url" />
        <meta property="og:title" content={`${data.title} | Anvitam Architecture`} />
        <meta property="og:description" content={data.subtitle} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta name="robots" content="index, follow" />

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

      {/* Hero Header */}
      <section className="pt-32 pb-14 px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#556B2F] mb-6">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight size={12} />
          <span>Architectural Comparisons</span>
          <ChevronRight size={12} />
          <span className="text-[#111]">{data.optionA.name} vs {data.optionB.name}</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EED9] text-[#334D11] text-xs font-bold uppercase tracking-wider mb-6">
          <Scale size={14} />
          <span>High-Intent Architectural Comparison</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-serif font-medium text-[#111] leading-tight mb-6">
          {data.title}
        </h1>

        <p className="text-lg md:text-xl text-gray-700 font-light leading-relaxed max-w-3xl mb-8">
          {data.subtitle}
        </p>
      </section>

      {/* Head-to-Head Comparison Matrix Table */}
      <section className="pb-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Option A Card */}
          <div className="p-8 rounded-3xl bg-white border-2 border-[#556B2F]/30 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#334D11] bg-[#E8EED9] px-3 py-1 rounded-full">
                {data.optionA.badge}
              </span>
              <h2 className="text-2xl font-bold text-[#111] mt-4 mb-2">{data.optionA.name}</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">{data.optionA.tagline}</p>

              <div className="space-y-3 py-4 border-y border-gray-150 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Estimated CapEx:</span><span className="font-bold text-[#111]">{data.optionA.upfrontCost}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">10-Year Opex:</span><span className="font-bold text-[#334D11]">{data.optionA.tenYearCost}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Thermal Comfort:</span><span className="font-bold text-[#111]">{data.optionA.thermalPerformance}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Carbon Impact:</span><span className="font-bold text-[#334D11]">{data.optionA.embodiedCarbon}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Lifespan:</span><span className="font-bold text-[#111]">{data.optionA.lifespan}</span></div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Key Advantages</p>
                <ul className="space-y-2">
                  {data.optionA.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                      <CheckCircle2 size={16} className="text-[#556B2F] shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Option B Card */}
          <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {data.optionB.badge}
              </span>
              <h2 className="text-2xl font-bold text-[#111] mt-4 mb-2">{data.optionB.name}</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">{data.optionB.tagline}</p>

              <div className="space-y-3 py-4 border-y border-gray-150 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Estimated CapEx:</span><span className="font-bold text-[#111]">{data.optionB.upfrontCost}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">10-Year Opex:</span><span className="font-bold text-amber-800">{data.optionB.tenYearCost}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Thermal Comfort:</span><span className="font-bold text-[#111]">{data.optionB.thermalPerformance}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Carbon Impact:</span><span className="font-bold text-rose-800">{data.optionB.embodiedCarbon}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Lifespan:</span><span className="font-bold text-[#111]">{data.optionB.lifespan}</span></div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Critical Drawbacks</p>
                <ul className="space-y-2">
                  {data.optionB.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                      <XCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Architect Verdict Box */}
        <div className="p-8 md:p-10 rounded-3xl bg-[#111] text-white">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={24} className="text-[#CCFF00]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
              The Architect's Verdict (Ar. Archana Gavas)
            </span>
          </div>
          <p className="text-base md:text-lg leading-relaxed font-light text-gray-200 mb-6">
            "{data.architectVerdict}"
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-800">
            <div>
              <p className="text-xs text-gray-400">Related Case Study:</p>
              <Link to={data.caseStudyAnchor.link} className="text-sm font-bold text-[#CCFF00] hover:underline flex items-center gap-1 mt-0.5">
                <span>{data.caseStudyAnchor.title}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <a
              href="https://topmate.io/archanagavas"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#CCFF00] text-[#111] font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider hover:bg-[#b8e600] transition-colors"
            >
              Consult with Archana
            </a>
          </div>
        </div>
      </section>

      {/* Comparison Directory Switcher */}
      <section className="py-8 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Other Technical Comparisons
          </p>
          <div className="flex flex-wrap gap-2.5">
            {Object.values(COMPARISONS).map(comp => (
              <Link
                key={comp.slug}
                to={`/compare/${comp.slug}`}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
                  comp.slug === data.slug
                    ? 'bg-[#111] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {comp.optionA.name} vs {comp.optionB.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#556B2F] mb-2 block">
            AEO Questions
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-[#111]">
            Common Decision Inquiries
          </h2>
        </div>

        <div className="space-y-4">
          {data.faqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-base font-bold text-[#111] mb-2 flex items-center gap-2">
                <HelpCircle size={16} className="text-[#556B2F] shrink-0" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-6">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Consultation Bar */}
      <StickyConsultationBar 
        customHeadline="Evaluating material or hydrology options for your project?"
        customSubtext="Review real CapEx, soil test results, and lifecycle economics with Ar. Archana Gavas."
        customButtonText="Book 1-on-1 Review"
      />
    </div>
  );
};

export default ComparisonDetail;
