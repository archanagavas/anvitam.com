import fs from 'fs';

const updatedServices = [
  {
    id: 'farm-retreat',
    title: 'Farm Retreats',
    description: 'A true Farm retreat is a living ecosystem that balances hospitality with the earth. Inspired by natural energy systems, we design spaces that seamlessly integrate into the landscape gracefully.',
    valueProps: [
      'Authentic Masterplanning - Immersive connection',
      'Regenerative Architecture - Utilizing passive systems',
      'Guest Wellbeing - Optimized design frameworks',
      'Hospitality Integration - Seamless operations'
    ],
    icon: 'Home',
    heroImage: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'We bridge the gap between working agriculture and guest comfort. Rather than simply building on the land, we integrate with it—proving that human habitation can be both deeply restorative and productive.',
      'From wellness retreats to a premium Airbnb, the architecture must speak to the soil. We create systems where guests engage with natural rhythms, turning every stay into a truly regenerative experience.'
    ],
    whoItsFor: ['Hospitality entrepreneurs', 'Private investors', 'Farmers expanding into eco-tourism'],
    caseStudyId: 'carpa-lupa',
    process: [
      { title: 'Site Resonance', description: 'Understanding how a retreat belongs on your land.' },
      { title: 'Energy & Flow', description: 'Integrating natural dynamics.' },
      { title: 'Guest Experience', description: 'Structuring spaces for wellness.' },
      { title: 'Functional Logistics', description: 'Invisible, efficient operations.' },
      { title: 'Regenerative Delivery', description: 'Supervising the exact build ethos.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'Why choose a regenerative approach?', answer: "We ensure your retreat isn't just a hotel in a field, but a living ecosystem." },
      { question: 'Are these properties successful?', answer: 'Absolutely. Sustainable stays stand out by offering pure authenticity.' },
      { question: 'Do you design wellness programs?', answer: 'We design the architecture to house your wellness vision.' },
      { question: 'Can we utilize natural power?', answer: 'Yes, we heavily integrate off-grid and sustainable energy solutions.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  },
  {
    id: 'airbnb',
    title: 'Airbnb Design',
    description: 'Generic spaces no longer perform. We craft immersive environments prioritizing both unforgettable guest experiences and seamless host operations.',
    valueProps: [
      'Immersive Aesthetics - Unforgettable design',
      'Operational Efficiency - Layouts for easy cleaning',
      'Experiential Focus - Architecture as the destination',
      'Market Intelligence - Informed by data'
    ],
    icon: 'Home',
    heroImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'An Airbnb operates as a micro-hotel requiring spatial awareness and hospitality logistics. Properties that thrive offer profound experiences, ensuring the property itself is the main destination.',
      'We also prioritize operational reality. Using smart material choices and durable design philosophies, we minimize maintenance and drastically streamline cleaning.'
    ],
    whoItsFor: ['Property Owners', 'Investors', 'Hosts wanting operational ease'],
    caseStudyId: 'carpa-lupa',
    process: [
      { title: 'Market Analysis', description: 'Reviewing local context for a unique angle.' },
      { title: 'Spatial Strategy', description: 'Maximizing both interior flow and awe.' },
      { title: 'Material Selection', description: 'Finishes that support rigorous cleaning.' },
      { title: 'Experience Curation', description: 'Creating five-star moments.' },
      { title: 'Execution', description: 'Bringing the design to life flawlessly.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'Why hire a design studio for an Airbnb?', answer: 'A successful property requires more than furniture; it needs hospitality psychology.' },
      { question: 'How does design affect cleaning?', answer: 'We specify layouts that prevent wear and drastically reduce cleaning times.' },
      { question: 'Are experiences dependent on architecture?', answer: 'Yes. Design-led properties frame the entire guest experience.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  },
  {
    id: 'homestay',
    title: 'Homestay Design',
    description: 'A truly authentic homestay feels like a warm embrace rooted in the local landscape. We focus on cozy environments that reflect your cultural vernacular.',
    valueProps: [
      'Cultural Integration - Honoring local traditions',
      'Natural Alignment - Eco-lodge integration',
      'Host Privacy - Balancing intimacy and privacy',
      'Vernacular Materials - Earth, wood, and stone'
    ],
    icon: 'Home',
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'A cozy homestay is built on connection. The architecture should listen to the setting, using passive cooling and local materials to ground the structure organically into the land.',
      'Our approach ensures that while guests enjoy a culturally rich experience, the host family maintains strict privacy. This delicate, human balance is what gives a space true soul.'
    ],
    whoItsFor: ['Families opening a homestay', 'Rural hosts', 'Cultural entrepreneurs'],
    caseStudyId: 'yourweb3guy',
    process: [
      { title: 'Vernacular Study', description: 'Understanding authentic local materials.' },
      { title: 'Site Integration', description: 'Capturing the best views and breezes.' },
      { title: 'Host-Guest Zoning', description: 'Creating distinct boundaries for privacy.' },
      { title: 'Material Crafting', description: 'Using earth, wood, and stone.' },
      { title: 'Cultural Expression', description: 'Integrating your local heritage.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'How is a homestay different from a resort?', answer: 'A homestay centers around the host family and local culture, requiring a personal touch.' },
      { question: 'Can you design a riverside property safely?', answer: 'Absolutely. We seamlessly integrate proper mitigating foundations.' },
      { question: 'What makes a homestay successful?', answer: 'Authenticity. Guests seek a genuine connection to the place.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  },
  {
    id: 'community-center',
    title: 'Community Centers',
    description: 'True architecture serves the people. We envision community spaces of profound resilience, crafting inclusive learning and health hubs that truly thrive natively.',
    valueProps: [
      'Multi-generational Spaces - Vibrant gathering areas',
      'Educational Hubs - Forward-thinking learning',
      'Health Integration - Adaptable wellness support',
      'Civic Flow - Connecting local amenities seamlessly'
    ],
    icon: 'Building',
    heroImage: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'The modern civic fabric requires more than a simple hall. We focus on daylighting, natural ventilation, and accessibility—frequently co-locating services to create holistic support networks.',
      'By integrating rainwater harvesting and ecological cycles, we teach sustainability through the building itself. These centers become living, breathing anchors for their neighborhoods.'
    ],
    whoItsFor: ['Municipalities', 'NGOs', 'Community Organizations'],
    caseStudyId: 'unique-school',
    process: [
      { title: 'Civic Listening', description: 'Engaging users to understand core needs.' },
      { title: 'Programmatic Synergy', description: 'Aligning various community services.' },
      { title: 'Grant Readiness', description: 'Meeting strict civic design criteria.' },
      { title: 'Ecological Integration', description: 'Connecting green spaces and flows.' },
      { title: 'Accessible Delivery', description: 'Ensuring welcoming facilities for all.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'How do you design for long-term impact?', answer: 'We prioritize sustainability, robust tech integration, and total accessibility.' },
      { question: 'Can health services share the space?', answer: 'Yes, we often co-locate diverse services to maximize civic impact.' },
      { question: 'Are these spaces durable?', answer: 'Absolutely. We utilize robust, upcycled, and natural materials for heavy use.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  },
  {
    id: 'weekend-villa',
    title: 'Weekend Villas',
    description: 'A second home should be an escape from the noise. We focus on biophilic integration to create timeless sanctuaries that breathe perfectly with the landscape.',
    valueProps: [
      'Biophilic Sanctuaries - Distinctive natural designs',
      'Investment Ready - Layouts optimizing yield',
      'Passive Comfort - Naturally cool and serene architecture',
      'Contextual Beauty - Crafting the finest escapes'
    ],
    icon: 'Home',
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'Leaving the city requires architecture that immediately lowers your heart rate. We deliver profound connection through earthy materials and seamless indoor-outdoor living.',
      'The best villas sit lightly on the earth. Utilizing solar passive strategies, we design spaces that require minimal maintenance, resulting in highly desired, stress-free retreats.'
    ],
    whoItsFor: ['Families building private getaways', 'Investors developing premium rentals', 'Entrepreneurs launching luxury retreats'],
    caseStudyId: 'yourweb3guy',
    process: [
      { title: 'Site Empathy', description: 'Positioning to capture the best views.' },
      { title: 'Biophilic Design', description: 'Ensuring deep natural integration.' },
      { title: 'Rental Optimization', description: 'Maximizing the appeal for guests.' },
      { title: 'Low-Upkeep Engineering', description: 'Using robust, timeless materials.' },
      { title: 'Sanctuary Delivery', description: 'Providing the keys to a perfect retreat.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'What makes these top villas?', answer: 'They are defined by seamless integration with nature and passive cooling.' },
      { question: 'Are these designs good for rentals?', answer: 'Yes, the premium aesthetic makes them highly desirable and lucrative.' },
      { question: 'Can I build off-grid?', answer: 'Absolutely, we can integrate solar and rainwater harvesting for self-sustenance.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  },
  {
    id: 'eco-resort',
    title: 'Eco Resorts',
    description: 'Discerning travelers now seek earth-connected stays over concrete towers. Our designs prove that high-end luxury and regenerative ecology exist in the same breath.',
    valueProps: [
      'Regenerative Masterplanning - Systemic zero-footprint design',
      'Zero-Footprint Luxury - The bedrock of authentic hospitality',
      'Cultural Authenticity - True local integration',
      'Biodiversity Design - Ecosystem-led architecture'
    ],
    icon: 'Map',
    heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'Authentic eco resorts require deep systemic thought starting with soil, water, and local flora. They are living systems that restore local ecology rather than taxing it.',
      'By integrating natural materials, decentralized wastewater treatment, and permaculture landscaping, we elevate the standard of regenerative hospitality for modern guests.'
    ],
    whoItsFor: ['Hospitality groups', 'Luxury eco-developers', 'Visionaries pioneering sustainable stay models'],
    caseStudyId: 'carpa-lupa',
    process: [
      { title: 'Ecological Baseline', description: 'Assessing required natural capital.' },
      { title: 'Regenerative Masterplan', description: 'Laying out to minimize footprint.' },
      { title: 'System Closed-Loops', description: 'Designing water & energy cycles.' },
      { title: 'Biophilic Luxury', description: 'Crafting premium guest experiences.' },
      { title: 'Sustainable Delivery', description: 'Execution that protects the site.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'What makes a true eco resort?', answer: 'Operating on closed-loop systems, producing energy, and managing waste on-site.' },
      { question: 'Are eco resorts profitable?', answer: 'Highly. Travelers increasingly prioritize verifiable sustainability.' },
      { question: 'Can luxury exist in these resorts?', answer: 'Yes. The new luxury is profound silence, space, and pure, non-toxic materials.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  },
  {
    id: 'wellness-retreat',
    title: 'Wellness Retreats',
    description: 'Healing begins with space. We design sanctuaries that naturally lower cortisol through biophilia, creating the definitive setting for deep physical and mental restoration.',
    valueProps: [
      'Sensory Architecture - Spaces that heal',
      'Biophilic Interiors - Deep restorative connection',
      'Energetic Flow - Optimized for yoga and stillness',
      'Global Standards - World-class retreat execution'
    ],
    icon: 'Heart',
    heroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'The building itself acts as a practitioner. A successful retreat cannot use toxic materials or harsh lighting. We utilize earth, lime, and timber to naturally regulate acoustics and humidity.',
      'From the reception to the meditation shala, we orchestrate the sensory journey so the architecture hums at a calm frequency, supporting profound healing work.'
    ],
    whoItsFor: ['Wellness Founders', 'Yoga Practitioners', 'Global Holistic Developers'],
    caseStudyId: 'batukaru-yurt',
    process: [
      { title: 'Defining Modality', description: 'Clarifying the vision for your specific retreat.' },
      { title: 'Energetic Zoning', description: 'Separating active zones from deep silence.' },
      { title: 'Material Resonance', description: 'Choosing non-toxic, profound elements.' },
      { title: 'Sensory Calibration', description: 'Tuning precise light and sound levels.' },
      { title: 'Sacred Execution', description: 'Building with utmost respect for the land.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'What is a wellness retreat architecturally?', answer: 'It is a space designed specifically to calm the nervous system.' },
      { question: 'How do you design for yoga?', answer: 'We ensure specific acoustic and thermal comfort using grounding earth materials.' },
      { question: 'Why is air quality so crucial?', answer: 'Healing spaces must emit zero VOCs to provide a genuinely pure environment.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  },
  {
    id: 'food-forest',
    title: 'Food Forests',
    description: 'A food forest is a regenerative approach to agriculture that mimics wild ecosystems. We transform depleted land into thriving, localized, self-sustaining abundance.',
    valueProps: [
      'Perennial Abundance - High-yield forest creation',
      'Ecological Restoration - Rehabilitating degraded land',
      'Zero-Waste Systems - Natural nutrient cycling',
      'Biodiversity Guilds - Plant mutual support'
    ],
    icon: 'TreePine',
    heroImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'A food forest is an intelligent, multi-layered ecosystem. Traditional farmland requires heavy inputs and water. We break this cycle by stacking trees, shrubs, and groundcovers into a system that fertilizes itself.',
      'We analyze soil microbiology to select plant guilds that support one another. Once mature, a food forest provides incredible yields with almost zero ongoing maintenance.'
    ],
    whoItsFor: ['Farmers wanting regenerative models', 'Eco-communities', 'Institutions localizing food'],
    caseStudyId: 'vanvagado-farm',
    process: [
      { title: 'Soil Assessment', description: 'Testing native microbiology.' },
      { title: 'Water Hydration', description: 'Earthworks for passive hydration.' },
      { title: 'Guild Design', description: 'Selecting the 7 layers of vegetation.' },
      { title: 'Waste Integration', description: 'Closed-loop composting systems.' },
      { title: 'Phased Planting', description: 'Kickstarting the pioneer species.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'How long does it take to grow?', answer: 'Full maturity takes 3-5 years, but lower layers yield in the very first year.' },
      { question: 'Does this help reduce food waste?', answer: 'Yes! Localizing production eliminates supply chain losses.' },
      { question: 'Is it high maintenance?', answer: 'Initially yes, but once established, it requires a fraction of the labor.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  },
  {
    id: 'agrotourism',
    title: 'Agrotourism',
    description: 'The beautiful intersection of real agriculture and guest hospitality. We design spaces that honor the farm’s true operations while providing an authentic escape.',
    valueProps: [
      'Dual-Function Design - Balancing guests & crops',
      'Authentic Experiences - Honoring true farm heritage',
      'Operational Safety - Intelligent layout zoning',
      'Revenue Diversification - Profitable hospitality hubs'
    ],
    icon: 'Map',
    heroImage: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'Successful agrotourism means a farm functions efficiently while accommodating guests safely. By distinctly zoning your property, we ensure luxury never disrupts the critical daily harvest.',
      'The magic is authenticity. We design pathways, pavilions, and lodging that educate guests through spatial poetry, ensuring the destination feels like a beautifully working, breathing organism.'
    ],
    whoItsFor: ['Working farms expanding', 'Estate owners', 'Hospitality developers'],
    caseStudyId: 'vanvagado-farm',
    process: [
      { title: 'Farm Choreography', description: 'Understanding your daily operational flow.' },
      { title: 'Safety Zoning', description: 'Separating machinery from guest areas.' },
      { title: 'Authentic Lodging', description: 'Designing beautiful, rustic-chic stays.' },
      { title: 'Experiential Nodes', description: 'Creating safe touchpoints for farm engagement.' },
      { title: 'Seamless Integration', description: 'Building without halting farm workflows.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'What is agrotourism exactly?', answer: 'A model where working farms invite guests to stay and experience agrarian life.' },
      { question: 'Is it safe for a commercial farm?', answer: 'Yes, intelligent architecture zones out hazards completely.' },
      { question: 'Does it disrupt farming?', answer: 'We specialize in layouts that strictly protect and enhance the agricultural workflow.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  },
  {
    id: 'landscape-design',
    title: 'Landscape Design',
    description: 'We design living ecology rather than just decoration. Utilizing native flora and earthworks, we ensure your outdoor spaces capture water, build soil, and remain resilient.',
    valueProps: [
      'Ecological Integration - Native resilience',
      'Versatile Offerings - On-site & remote design',
      'Diverse Scales - From homes to commercial',
      'Transparent Value - High ROI & low upkeep'
    ],
    icon: 'TreePine',
    heroImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'To design landscape properly means understanding site hydrology. We prioritize rainwater harvesting, microclimate creation, and integrating completely natural aquatic systems.',
      'We design outdoor masterplans that significantly lower long-term maintenance. This approach turns sterile areas into thriving, bio-diverse sanctuaries that practically care for themselves.'
    ],
    whoItsFor: ['Homeowners seeking restoration', 'Commercial developers', 'Global remote clients'],
    caseStudyId: 'shalimar',
    process: [
      { title: 'Topographical Mapping', description: 'The essential first step in reading the site.' },
      { title: 'Hydrological Strategy', description: 'Planning water capture and flow.' },
      { title: 'Native Curation', description: 'Selecting species for maximum ecological yield.' },
      { title: 'Budget Alignment', description: 'Ensuring plans match practical realities.' },
      { title: 'Local Execution', description: 'Hands-on management or detailed design packets.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'Why hire an ecological firm?', answer: 'We plant for permanent health, reducing massive long-term landscape costs.' },
      { question: 'Do you offer remote design?', answer: 'Yes, our online portal allows us to deliver profound plans globally.' },
      { question: 'Is this more expensive upfront?', answer: 'No, but you save massively on water and future upkeep.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  },
  {
    id: 'terrace-garden',
    title: 'Terrace Gardens',
    description: 'We convert barren rooftops into productive sanctuaries. With specific structural engineering and shade elements, we bring a thriving, elevated nature back to the city.',
    valueProps: [
      'Urban Cooling - Transforming heat sinks',
      'Structural Safety - Lightweight secure soils',
      'Shade Structures - Architectural cooling',
      'Climate Protection - Wind and sun defense'
    ],
    icon: 'Sprout',
    heroImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'Creating a rooftop sanctuary is an act of urban rebellion. This requires precise waterproofing, drainage, and lightweight soils to ensure total structural integrity.',
      'We heavily integrate wind protection and stylish architectural canopies. These are non-negotiable for human comfort, successfully blending the built environment with lush greenery.'
    ],
    whoItsFor: ['Urban Residents', 'Commercial Buildings', 'Penthouses'],
    caseStudyId: 'shalimar',
    process: [
      { title: 'Structural Audit', description: 'Ensuring your roof can safely support the load.' },
      { title: 'Microclimate Zoning', description: 'Mapping wind to place protective elements.' },
      { title: 'Lightweight Systems', description: 'Using specialized growth mediums.' },
      { title: 'Architectural Integration', description: 'Designing beautiful canopy structures.' },
      { title: 'Lush Execution', description: 'Planting wind-resistant, native species.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'Is a terrace garden safe for my roof?', answer: 'Yes, we conduct incredibly strict load-bearing assessments first.' },
      { question: 'Why do I need a shade structure?', answer: 'Roofs face extreme elements; protection ensures the garden is actually usable.' },
      { question: 'Can I grow food up there?', answer: 'Absolutely. It is fantastic for raised, protected vegetable beds.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  },
  {
    id: 'backyard-design',
    title: 'Backyard Design',
    description: 'We treat the backyard as an outdoor living room. Utilizing native plants and regenerative layouts, we transform ignored domestic spaces into private biophilic retreats.',
    valueProps: [
      'Biophilic Sanctuaries - Restorative philosophy',
      'Spatial Optimization - Brilliant small layouts',
      'Water Integration - Natural pool integration',
      'Expert Execution - Comprehensive outdoor design'
    ],
    icon: 'Home',
    heroImage: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'We elevate basic landscaping by creating outdoor sanctuaries. A modern design should use permeable hardscapes and restorative layouts that maximize utility, even in tight spaces.',
      'We frequently focus on chemical-free, natural swimming ponds. Every masterplan aims to dramatically lower maintenance while significantly increasing the biodiversity right outside your door.'
    ],
    whoItsFor: ['Homeowners', 'Families wanting organic spaces', 'Urban dwellers with small yards'],
    caseStudyId: 'unique-school',
    process: [
      { title: 'Lifestyle Mapping', description: 'Understanding how you will use the space.' },
      { title: 'Spatial Zoning', description: 'Maximizing flow and function.' },
      { title: 'Water Strategy', description: 'Integrating seamless, eco-friendly elements.' },
      { title: 'Native Sourcing', description: 'Selecting plants that thrive locally.' },
      { title: 'Sanctuary Delivery', description: 'Executing an unparalleled retreat.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'Why use professional services?', answer: 'You avoid costly mistakes and ensure your ecosystem thrives long-term.' },
      { question: 'Can you work with very small yards?', answer: 'Yes, our ideas are highly space-efficient.' },
      { question: 'Do you offer natural pools?', answer: 'Absolutely. We specialize in chemical-free swimming environments.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  }
];

const permacultureObjStr = `{
    id: 'permaculture-design',
    title: 'Permaculture Design',
    description: 'Designing with the land, not over it. We create systems that behave like nature—resilient, regenerative, and quietly productive.',
    valueProps: [
      'Ecological Health - Soil regeneration and repair', 
      'Water Cycles - Rainwater harvesting & reuse', 
      'Biodiversity - Layered dynamic planting', 
      'Built Form Integration - Aligning structures to climate'
    ],
    icon: 'Sprout',
    heroImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'Permaculture design understands how water moves and how soil is built. We ensure human habitation strengthens ecosystems instead of degrading them.',
      'We create food forests and landscapes that harvest water naturally, deeply rooted in principles that reduce long-term maintenance costs and increase yield.'
    ],
    whoItsFor: ['Farm retreats', 'Wellness spaces & schools', 'Ecologically-minded landowners'],
    caseStudyId: 'vanvagado-farm',
    process: [
      { title: 'Site Reading', description: 'Assessing climate, soil, sun, wind, and water.' },
      { title: 'System Zoning', description: 'Organizing the land efficiently.' },
      { title: 'Integrated Design', description: 'Connecting food, water, and architecture.' },
      { title: 'Roadmap', description: 'A phased implementation strategy.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'Why choose permaculture?', answer: 'To create self-sustaining ecosystems that work well for decades.' },
      { question: 'What does pricing depend on?', answer: 'Land size, climatic complexity, and required design depth.' },
      { question: 'What is included?', answer: 'Site analysis, concept plans, system diagrams, and land-use visions.' }
    ],
    bookingLink: 'https://topmate.io/ar_archana_gavas'
  }`;

const constantsPath = './constants.ts';
let content = fs.readFileSync(constantsPath, 'utf8');

let allServicesString = 'export const SERVICES: Service[] = [\n  ' + permacultureObjStr;

updatedServices.forEach(s => {
  allServicesString += ',\n  ' + JSON.stringify(s, null, 2).replace(/\"([^(\")"]+)\":/g, "$1:");
});
allServicesString += '\n];';

const startMarker = 'export const SERVICES: Service[] = [';
const endMarker = 'export const DIGITAL_PRODUCTS: DigitalProduct[] = [';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

const newContent = content.substring(0, startIndex) + allServicesString + '\n\n' + content.substring(endIndex);

fs.writeFileSync(constantsPath, newContent, 'utf8');
console.log('Successfully updated constants.ts');
