import { Project, BlogPost, TeamMember, Award, Testimonial, ProcessStep, Service, DigitalProduct, EstimatorService, PartnerBrand, Workshop } from './types';

export const INITIAL_WORKSHOPS: Workshop[] = [
  {
    id: 'w-1',
    title: 'Bird House Architecture & Campus Space Makeover',
    organization: 'Unique School of Science, Nadiad',
    location: 'Nadiad, Gujarat',
    city: 'Nadiad',
    state: 'Gujarat',
    country: 'India',
    date: '2025',
    category: 'School',
    attendeesCount: '150+ Students (Class 5th - 10th)',
    offerings: [
      'Bird House Making',
      'Space Makeover',
      'Bird Feeder Making',
      'Plastic Waste Transformation'
    ],
    skillsOutcomes: `Hands-on woodworking, joinery & tool safety
Climate-responsive habitat design principles
Collaborative teamwork & spatial installation
Ecological biodiversity & avian conservation awareness`,
    materialsUsed: `Reclaimed natural pine timber & non-toxic water paints
Upcycled PET bottles for hanging seed dispensers
Organic cotton ropes & rust-resistant hardware
Native potted flora & bio-planters`,
    impact: `Erected 15+ functional bird habitats on campus trees
Diverted over 50kg of single-use plastic into garden art
Boosted campus bird species visitations by 40%
Fulfilled CBSE NEP 2020 vocational skill learning mandates`,
    outcomes: `15 permanent weatherproof bird nest boxes installed
Campus central courtyard transformed into a bio-diverse bird sanctuary
Participating students awarded STEAM eco-stewardship certificates
Eco-Club established for long-term campus habitat maintenance`,
    description: 'Hands-on creative installation workshop conducted with students from Class 5th to 10th. Students built custom bird houses, crafted eco-feeders, and transformed outdoor campus spaces into vibrant, bird-friendly living installations.',
    faqs: [
      { question: 'What grade levels participated in this workshop?', answer: 'Students from 5th to 10th grade participated in hands-on building, painting, and installation.' },
      { question: 'Are all materials and tools provided by Nest N Nurture?', answer: 'Yes! We bring pre-sanded eco-timber, child-safe tool kits, non-toxic organic paints, and safety equipment.' },
      { question: 'How long does a school campus makeover workshop take?', answer: 'Workshops typically run for 1 full day (4-6 hours) or can be expanded into 2-3 day masterclasses.' }
    ],
    slug: 'bird-house-architecture-campus-space-makeover-nadiad',
    metaTitle: 'Bird House Architecture & Campus Makeover Workshop | Nest N Nurture',
    metaDescription: 'Discover our hands-on bird house building and campus space makeover workshop at Unique School of Science, Nadiad. Empowering 150+ students with sustainable skills.',
    primaryKeyword: 'bird house workshop school',
    secondaryKeywords: 'campus space makeover, eco school workshop, bird feeder making',
    images: [
      '/workshops/workshops group images.png',
      '/workshops/bird house making.png',
      '/workshops/innovation installtion and space makeover 1.png',
      '/workshops/bird feeder making.png',
      '/workshops/innovation installtion and space makeover 5.png'
    ],
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w-2',
    title: 'Bird House Architecture & Campus Installation',
    organization: 'Anant National University, Ahmedabad',
    location: 'Ahmedabad, Gujarat',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    date: '2024',
    category: 'College',
    attendeesCount: 'College Design & Architecture Students',
    offerings: [
      'Bird House Architecture',
      'Campus Installation',
      'Natural Materials Crafting'
    ],
    skillsOutcomes: `Microclimate analysis for bird nest orientation
Architectural prototyping with reclaimed timber
Biophilic space integration & structural fastening
Hands-on material testing for outdoor weathering`,
    materialsUsed: `Seasoned reclaimed teak & pine timber
Untreated bamboo structural dowels
Eco-friendly weatherproof sealants
Organic fiber lashings & stainless steel fixtures`,
    impact: `Integrated bio-architecture directly into university courtyard trees
Created live micro-habitats for urban bird species
Engaged architecture students in real-world design-build execution`,
    outcomes: `20 architectural bird shelters mounted at optimal canopy heights
Comprehensive site thermal & wind orientation map completed
Featured in university annual sustainable design exhibition`,
    description: 'Immersive architectural workshop with college students at Anant National University. Students designed, crafted, and permanently installed climate-responsive bird houses across the university green spaces.',
    faqs: [
      { question: 'Is this workshop suitable for architecture & design universities?', answer: 'Yes! It offers design-build experience in biophilic architecture, microclimate study, and natural materials.' },
      { question: 'Do installed bird houses require ongoing university maintenance?', answer: 'They are engineered with durable, weather-resistant reclaimed timber requiring minimal maintenance.' }
    ],
    slug: 'bird-house-architecture-anant-national-university',
    metaTitle: 'Architectural Bird House Workshop at Anant University | Anvitam',
    metaDescription: 'Architectural design-build workshop for university students. Building climate-responsive bird house installations in Ahmedabad.',
    primaryKeyword: 'architectural bird house workshop',
    secondaryKeywords: 'biophilic architecture college, university green makeover',
    images: [
      '/workshops/workshops group images2.png',
      '/workshops/innovation installtion and space makeover 2.png',
      '/workshops/innovation installtion and space makeover 3.png',
      '/workshops/innovation installtion and space makeover 4.png',
      '/workshops/innovation installtion and space makeover 6.png'
    ],
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w-3',
    title: 'Plastic Waste Transformation & Bio-Craft Masterclass',
    organization: 'Campus Eco-Initiative & Upcycling Club',
    location: 'Vadodara, Gujarat',
    city: 'Vadodara',
    state: 'Gujarat',
    country: 'India',
    date: '2024',
    category: 'Workplace',
    attendeesCount: '80+ Corporate & Student Participants',
    offerings: [
      'Plastic Waste Transformation',
      'Tin Can Art',
      'Tote Bag Painting',
      'Wind Chime Art'
    ],
    skillsOutcomes: `Circular design & zero-waste transformation
Creative upcycling techniques for post-consumer waste
Stress-relieving botanical rock & tote bag painting
Team building through collaborative eco-art`,
    materialsUsed: `Post-consumer plastic bottles & aluminium food cans
Organic cotton canvas tote bags & non-toxic acrylics
Reclaimed driftwood & metallic wind chime bells
Selected native succulent & herb plants`,
    impact: `Diverted 100+ kg of waste from municipal landfills
Created 50+ desktop planters and bird feeders for office & home spaces
Promoted ESG sustainability culture in corporate environments`,
    outcomes: `50+ upcycled hanging planters & bird feeders crafted
Custom organic tote bags completed by each participant
Installed kinetic wind chime art garden on office balcony`,
    description: 'A vibrant sustainability retreat transforming discarded plastic bottles, aluminum cans, and organic cotton into functional outdoor garden art and bird feeding stations.',
    faqs: [
      { question: 'Can corporate workplaces book this as an ESG team retreat?', answer: 'Absolutely! It is a hands-on ESG team-building retreat fostering sustainability and creative focus.' }
    ],
    slug: 'plastic-waste-transformation-bio-craft-masterclass',
    metaTitle: 'Plastic Waste Upcycling & Bio-Craft Workshop | Anvitam',
    metaDescription: 'Hands-on corporate and campus eco-workshop turning plastic waste and tin cans into functional garden art and bird feeders.',
    primaryKeyword: 'plastic waste upcycling workshop',
    secondaryKeywords: 'corporate ESG eco workshop, upcycled planter making',
    images: [
      '/workshops/plastic waste transformation 1.png',
      '/workshops/tin can art 2.png',
      '/workshops/innovation installtion and space makeover 7.png'
    ],
    status: 'published',
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_PARTNERS: PartnerBrand[] = [
  { id: 'p1', name: 'Camp Leo', logo: '/logos/Camp leo.png', icon: '🏕️', website: 'https://www.anvitam.com' },
  { id: 'p2', name: 'Jay Bhole', logo: '/logos/Jay Bhole.png', icon: '🌿', website: 'https://www.anvitam.com' },
  { id: 'p3', name: 'Mahadev Construction', logo: '/logos/Mahadev Construction.png', icon: '🏗️', website: 'https://www.anvitam.com' },
  { id: 'p4', name: 'Mossaria', logo: '/logos/Mossaria.png', icon: '🌱', website: 'https://www.anvitam.com' },
  { id: 'p5', name: 'RJ Organics', logo: '/logos/RJ Organics.png', icon: '🍃', website: 'https://www.anvitam.com' },
  { id: 'p6', name: 'SAC', logo: '/logos/SAC.png', icon: '🏫', website: 'https://www.anvitam.com' },
  { id: 'p7', name: 'Shalimar', logo: '/logos/Shalimar.png', icon: '🌸', website: 'https://www.anvitam.com' },
  { id: 'p8', name: 'Stone Age Huts & Hostel', logo: '/logos/Stone Age Huts and hostal.png', icon: '🏕️', website: 'https://www.anvitam.com' },
  { id: 'p9', name: 'Unique School of Science', logo: '/logos/Unique School of Science.png', icon: '🏫', website: 'https://www.anvitam.com' },
  { id: 'p10', name: 'Vanvagado Farm', logo: '/logos/Vanvagado farm.png', icon: '🚜', website: 'https://www.anvitam.com' },
  { id: 'p11', name: 'Vergers du Monde', logo: '/logos/vergersdumonde.png', icon: '🌍', website: 'https://www.anvitam.com' },
  { id: 'p12', name: 'yourweb3guy', logo: '/logos/Yourweb3guy.png', icon: '💻', website: 'https://www.anvitam.com' }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    author: 'Akash Jha',
    role: 'yourweb3guy',
    text: "We're grateful for how thoughtfully the home was designed and executed. The use of natural materials and climate-responsive strategies made the space comfortable, honest, and deeply connected to its surroundings.",
    image: '/avatars/client2.jpg',
  },
  {
    id: 't2',
    author: 'Unique School of Science',
    role: 'Unique School of Science',
    text: "Thank you for engaging our students in such a meaningful way. The hands-on workshop and creative use of waste materials truly inspired them and brought new life to our campus spaces.",
    image: '/avatars/client3.jpg',
  },
  {
    id: 't3',
    author: 'Dennis',
    role: 'The Batukaru Yurt',
    text: "Thank you for designing such a peaceful and well-considered retreat. Every element, from the yurt to the wellness spaces, feels intentional and deeply calming for our guests.",
    image: '/avatars/client4.jpg',
  },
  {
    id: 't4',
    author: 'Mahandra sinh Solanki',
    role: 'Vanvagado Farm',
    text: "We're thankful for how the farm has evolved through your design. The natural pond and food forest have added life, balance, and a sense of harmony that guests genuinely feel.",
    image: '/avatars/client1.jpg',
  },
  {
    id: 't5',
    author: 'Naveen Bhagchandani',
    role: 'Shalimar',
    text: "The terrace garden has become one of our favourite spaces. We really appreciate how reclaimed materials were used so creatively and sustainably.",
    image: '/avatars/client4.jpg',
  }
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'understand',
    number: '1',
    title: 'Listen & Read the Land',
    items: ['Your dream & vision', 'Land walk & soil check', 'Sun & breeze study'],
    description: 'We start by listening to what you want to build and studying your land. We check where the sun rises, how wind flows, and where water goes so your property stays cool and dry naturally.',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'design',
    number: '2',
    title: 'Draw & Plan the Budget',
    items: ['Floor plans & maps', '3D designs', 'Clear cost estimate'],
    description: 'We turn your ideas into easy-to-understand maps, room layouts, and garden designs. We balance comfort, beauty, and cost so you know exactly what everything costs before building starts.',
    image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'deliver',
    number: '3',
    title: 'Guide the Builders',
    items: ['Hire skilled workers', 'Detailed construction maps', 'Site visits & supervision'],
    description: 'We guide your local builders step by step. We make regular site visits to ensure every wall, roof, rainwater pipe, and garden path is built durable and true to design.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop'
  }
];

export const SERVICES: Service[] = [
  {
    id: 'permaculture-design',
    title: 'Permaculture & Land Masterplanning',
    category: 'Land & Gardens',
    description: 'We plan your entire property so water flows safely, soil gets richer, and fruit trees and buildings fit naturally together.',
    valueProps: [
      'Healthy Soil - Rebuild land soil naturally without chemical fertilizers', 
      'Rainwater Saving - Catch and store rainwater on site for year-round greening', 
      'Lush Plants & Food - Plant fruit trees, shade trees, and herbs together', 
      'Cool Buildings - Position homes to catch cool breeze and block summer sun'
    ],
    icon: 'Sprout',
    heroImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'Permaculture is a practical way of designing land so nature does most of the heavy lifting. We study how sun, wind, and rain move across your property before drawing a single wall.',
      'We design food forests, water ponds, and building zones that catch rainwater automatically. This reduces maintenance costs and makes your land fertile and self-sustaining.'
    ],
    whoItsFor: ['Farm owners & estate developers', 'Homesteaders & retreat centers', 'Anyone with empty land or large plots'],
    caseStudyId: 'vanvagado-farm',
    process: [
      { title: 'Site Reading', description: 'Checking sun angles, wind paths, water flow, and soil quality on your land.' },
      { title: 'Land Zoning', description: 'Deciding where houses, access roads, ponds, and fruit orchards go.' },
      { title: 'Water & Plant Map', description: 'Connecting rainwater channels directly with fruit trees and gardens.' },
      { title: 'Step-by-Step Guide', description: 'A clear roadmap to build your property over time.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'What is permaculture land design?', answer: 'It is a smart way to layout land so water, soil, and plants work together automatically with less manual labor.' },
      { question: 'What determines the design cost?', answer: 'The size of your land plot and what you want to build on it.' },
      { question: 'What do I receive in the final plan?', answer: 'Masterplan maps, building footprint zones, water channel diagrams, plant lists, and execution guides.' }
    ],
    bookingLink: 'https://topmate.io/archanagavas'
  },
  {
    id: "farm-retreat",
    title: "Farm Retreats & Farmhouses",
    category: "Homes & Retreats",
    description: "Build a cozy farmhouse or weekend retreat that fits your land, stays cool naturally, and feels peaceful.",
    valueProps: [
      "Smart Land Layout - Easy flow for everyday living, gardening, and relaxing",
      "Naturally Cool Rooms - Uses shade and breezes to lower electric & AC bills",
      "Relaxing Verandas - Built for family gatherings, open views, and fresh air",
      "Low Upkeep - Built with strong, long-lasting local stone and lime"
    ],
    icon: "Home",
    heroImage: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "We design farmhouses that give you modern comfort while respecting the surrounding landscape. Your retreat becomes a place to relax, grow organic food, and enjoy nature with family.",
      "We build with regional stone, brick, and shaded roof verandas so rooms stay comfortable in summer and winter without burning energy."
    ],
    whoItsFor: [
      "Families building weekend farmhouses",
      "Landowners starting a farm stay",
      "Investors creating nature getaways"
    ],
    caseStudyId: "carpa-lupa",
    process: [
      { title: "Land Visit", description: "Finding the best spot on your land for light, shade, and scenic views." },
      { title: "Home Design", description: "Drawing room layouts, shaded verandas, and garden paths." },
      { title: "Water & Power", description: "Planning solar power and rainwater collection systems." },
      { title: "Construction Guide", description: "Helping your local builders construct everything accurately." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Can a farmhouse be self-sustaining?", answer: "Yes! We can design it to harvest rainwater and generate solar power." },
      { question: "Are natural materials durable?", answer: "Extremely. Stone, lime, and timber withstand weather for decades with simple care." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "airbnb",
    title: "Airbnb & Rental Stays",
    category: "Hospitality & Resorts",
    description: "Stand out on rental platforms. We design beautiful, easy-to-clean rental cottages that guests love to book and review.",
    valueProps: [
      "Eye-Catching Photos - Distinctive design that gets clicks and bookings",
      "Easy Cleaning - Stain-resistant layouts that cut cleaning time in half",
      "Guest Comfort - Cozy bedrooms, open decks, and scenic photo spots",
      "Great Reviews - Designed for 5-star guest experiences"
    ],
    icon: "Home",
    heroImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A successful rental stay must look attractive online and run smoothly offline. We design cottages and stays that feel like an instant holiday.",
      "We select durable, easy-to-clean materials so your rental stays looking brand new between host check-ins."
    ],
    whoItsFor: [
      "Property owners starting an Airbnb or rental stay",
      "Hosts looking to upgrade existing cottages",
      "Vacation property investors"
    ],
    caseStudyId: "carpa-lupa",
    process: [
      { title: "Market Review", description: "Checking nearby rentals so your property offers something unique." },
      { title: "Space Layout", description: "Designing cozy rooms, outdoor decks, and photo spots." },
      { title: "Material Pick", description: "Selecting strong, stain-resistant flooring and finishes." },
      { title: "Final Details", description: "Creating a 5-star stay experience for guests." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Why hire an architect for an Airbnb?", answer: "Well-designed properties earn higher nightly rates and stay booked year-round." },
      { question: "How does design reduce cleaning work?", answer: "We avoid dust traps and use tough, easy-to-wipe surfaces." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "homestay",
    title: "Homestays & Guest Houses",
    category: "Homes & Retreats",
    description: "Turn your property into a warm, welcoming homestay where guests enjoy local culture and feel right at home.",
    valueProps: [
      "Local Character - Built using regional stone, clay, and timber styles",
      "Host Privacy - Clear separation between guest spaces and family rooms",
      "Naturally Cool - Cool breezes and shade keep rooms fresh and airy",
      "Welcoming Vibes - Cozy gathering spots for dining and conversations"
    ],
    icon: "Home",
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A homestay should feel warm, personal, and authentic. We design guest rooms and dining areas that highlight regional charm and scenic views.",
      "We make sure host families have private living areas while guests enjoy a quiet, memorable stay."
    ],
    whoItsFor: [
      "Families opening a homestay",
      "Rural estate owners",
      "Heritage property owners"
    ],
    caseStudyId: "yourweb3guy",
    process: [
      { title: "Site Study", description: "Understanding local building traditions and landscape views." },
      { title: "Privacy Zoning", description: "Separating guest areas cleanly from family living quarters." },
      { title: "Material Selection", description: "Using regional stone, earth, and wood." },
      { title: "Building Plans", description: "Detailed drawings for local builders." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "What makes a homestay successful?", answer: "Authentic local charm, guest privacy, and warm, comfortable gathering spaces." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "community-center",
    title: "Community & Activity Centers",
    category: "Hospitality & Resorts",
    description: "Build open, friendly spaces for workshops, learning, and health using natural light and durable local materials.",
    valueProps: [
      "Open Gathering - Large, flexible halls for workshops and events",
      "Bright & Airy - Generous windows for natural light and fresh ventilation",
      "Eco-Friendly - Rainwater collection tanks and green roofs",
      "Built to Last - Tough, low-maintenance materials for public use"
    ],
    icon: "Building",
    heroImage: "https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "Community spaces bring people together. We design bright halls, activity rooms, and outdoor courtyards where people learn, work, and celebrate.",
      "Our designs use natural ventilation and rainwater harvesting so running expenses stay low for schools, clubs, and organizations."
    ],
    whoItsFor: [
      "Schools & educational institutions",
      "NGOs & non-profit organizations",
      "Community leaders"
    ],
    caseStudyId: "unique-school",
    process: [
      { title: "Community Input", description: "Understanding the activities and workshops the center will host." },
      { title: "Building Layout", description: "Designing flexible halls, classrooms, and courtyard gardens." },
      { title: "Green Features", description: "Adding rainwater storage and solar lighting." },
      { title: "Safe Delivery", description: "Creating durable, safe spaces for all age groups." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Can these spaces handle daily public use?", answer: "Yes! We use tough, natural materials that withstand daily heavy use." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "weekend-villa",
    title: "Weekend Villas & Getaways",
    category: "Homes & Retreats",
    description: "Design your personal getaway to relax, recharge, and enjoy the outdoors with family and friends.",
    valueProps: [
      "Peaceful Retreat - Open verandas, private courtyards, and garden views",
      "Cool & Shaded - Smart roof overhangs that block harsh summer heat",
      "Low Upkeep - Materials that look great without constant painting",
      "Great Value - Option to rent out to guests when you are away"
    ],
    icon: "Home",
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A weekend villa should feel like an immediate escape from city noise. We design homes with big windows, open living rooms, and shaded verandas.",
      "Using natural ventilation, your villa stays comfortable without relying heavily on air conditioning."
    ],
    whoItsFor: [
      "Families building a weekend getaway home",
      "Landowners wanting a private sanctuary",
      "Vacation home investors"
    ],
    caseStudyId: "yourweb3guy",
    process: [
      { title: "View & Sun Study", description: "Positioning the villa for maximum shade and natural breeze." },
      { title: "Floor Plan", description: "Designing spacious bedrooms, outdoor decks, and living rooms." },
      { title: "Material Pick", description: "Choosing natural stone and timber that require minimal care." },
      { title: "Execution Support", description: "Guiding construction to match the exact design." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Can I build my villa off-grid?", answer: "Yes, we can incorporate solar panels, rainwater storage, and natural cooling." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "eco-resort",
    title: "Eco Resorts & Glamping",
    category: "Hospitality & Resorts",
    description: "Create eco-friendly resorts that give guests luxury stays while protecting trees, soil, and wildlife.",
    valueProps: [
      "Nature First - Cottages placed carefully between existing trees",
      "Zero Waste - On-site water recycling and organic composting",
      "Unique Stays - Timber cabins, bamboo huts, or luxury tents",
      "High Guest Appeal - Distinctive, eco-friendly guest hospitality"
    ],
    icon: "Map",
    heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "Modern travelers look for stays that respect nature. We design eco-resorts with wooden cottages, stone walkways, and natural swimming pools.",
      "We design efficient background systems for water recycling and solar power so your resort stays green and profitable."
    ],
    whoItsFor: [
      "Resort owners & developers",
      "Landowners starting eco-tourism",
      "Glamping site operators"
    ],
    caseStudyId: "carpa-lupa",
    process: [
      { title: "Site Survey", description: "Mapping trees, slopes, and water channels to protect them." },
      { title: "Masterplan", description: "Layout for cottages, dining areas, pool, and walkways." },
      { title: "Eco Systems", description: "Designing water recycling and clean power systems." },
      { title: "Build Guidance", description: "Ensuring construction work respects the land." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Is an eco resort profitable?", answer: "Very! Travelers actively seek out nature-focused, eco-friendly stays." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "wellness-retreat",
    title: "Wellness & Yoga Retreats",
    category: "Hospitality & Resorts",
    description: "Build quiet, peaceful spaces for yoga, meditation, and healthy living using clean, non-toxic materials.",
    valueProps: [
      "Quiet & Peaceful - Sound-softening natural walls for quiet rest",
      "Non-Toxic - Natural lime plaster, untreated timber, and clean paints",
      "Yoga Halls - Open, airy shalas with comfortable timber flooring",
      "Pure Environment - Fresh airflow and soothing natural sunlight"
    ],
    icon: "Heart",
    heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A wellness retreat should help guests feel calm the moment they arrive. We use natural materials like clay, lime, and timber that naturally balance indoor humidity and air quality.",
      "From meditation rooms to outdoor herbal gardens, we create peaceful spaces that support rest and healing."
    ],
    whoItsFor: [
      "Yoga teachers & wellness founders",
      "Health retreat developers",
      "Spa & retreat center owners"
    ],
    caseStudyId: "batukaru-yurt",
    process: [
      { title: "Vision Session", description: "Understanding your retreat programs and guest requirements." },
      { title: "Quiet Layout", description: "Separating quiet shalas cleanly from kitchens and arrival areas." },
      { title: "Pure Materials", description: "Selecting natural lime, timber, and zero-chemical finishes." },
      { title: "Build Supervision", description: "Ensuring every space reflects your vision." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Why use lime and clay plasters?", answer: "They keep rooms naturally cool, fresh, and free from artificial fumes." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "food-forest",
    title: "Food Forests & Organic Orchards",
    category: "Land & Gardens",
    description: "Plant self-growing fruit trees, vegetables, and herbs layered like a natural forest for fresh organic food year-round.",
    valueProps: [
      "Fresh Organic Food - Harvest fresh fruits, nuts, berries, and herbs",
      "Self-Fertilizing - Trees and plants work together to feed soil",
      "Saves Water - Thick leaf mulch and shade retain soil moisture",
      "Low Maintenance - Requires far less weeding once established"
    ],
    icon: "TreePine",
    heroImage: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A food forest mimics a natural jungle. Instead of planting rows of single crops that require chemical spray, we mix fruit trees, berry bushes, herbs, and climbing vines together.",
      "The plants nourish each other, trap moisture, and build rich soil, giving you an abundant garden of fresh food."
    ],
    whoItsFor: [
      "Farm owners wanting organic harvests",
      "Resorts serving farm-to-table meals",
      "Homeowners with land or gardens"
    ],
    caseStudyId: "vanvagado-farm",
    process: [
      { title: "Soil Test", description: "Checking soil texture and natural nutrient levels." },
      { title: "Water Trenches", description: "Digging swales to trap rainwater directly into the soil." },
      { title: "Tree Selection", description: "Selecting fruit and shade trees suited to your region." },
      { title: "Layered Planting", description: "Planting tall trees, shrubs, and herbs together." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "How soon do I get fresh food?", answer: "Herbs and veggies produce within weeks; fruit trees begin producing in 1 to 3 years." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "agrotourism",
    title: "Agrotourism & Farm Visits",
    category: "Hospitality & Resorts",
    description: "Turn your farm into an inviting destination where visitors tour, pick fresh produce, learn, and stay overnight.",
    valueProps: [
      "Safe Farm Layout - Separate tractor routes safely from guest walkways",
      "Fun Farm Activities - Fruit picking, farm walks, and outdoor dining",
      "Extra Farm Revenue - Generate income from tours, farm stays, and produce sales",
      "Authentic Experience - Showcase real farm living while daily work continues"
    ],
    icon: "Map",
    heroImage: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "Agrotourism allows farm owners to earn extra income hosting visitors. We design safe walking paths, tasting pavilions, and cozy stay cottages on your working farm.",
      "We ensure guest areas are separated from tractor routes and heavy farm work so operations run smoothly."
    ],
    whoItsFor: [
      "Farmers wanting to invite visitors",
      "Organic farm owners",
      "Rural estate owners"
    ],
    caseStudyId: "vanvagado-farm",
    process: [
      { title: "Farm Audit", description: "Mapping daily farm work and picking safe visitor spots." },
      { title: "Pathway Layout", description: "Designing walkways, dining gazebos, and farm shops." },
      { title: "Stay Design", description: "Building rustic cottages for overnight guests." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Will visitors interrupt my farm work?", answer: "No, our layout keeps guest areas safely separated from daily farming tasks." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "landscape-design",
    title: "Landscape & Yard Planning",
    category: "Land & Gardens",
    description: "Transform empty yards or fields into green outdoor spaces with shade trees, walking paths, and native flowers.",
    valueProps: [
      "Native Flowers & Trees - Easy to grow and require minimal watering",
      "Rainwater Capture - Ponds and swales keep gardens green naturally",
      "Walking Paths - Beautiful stone paths, benches, and outdoor lighting",
      "Low Upkeep - Uses regional plants that thrive without chemical spray"
    ],
    icon: "TreePine",
    heroImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "Good landscape design turns empty land into a relaxing outdoor space. We design rainwater channels, shade trees, flower beds, and seating areas.",
      "We choose plants native to your region so you don't waste water or money on artificial fertilizers."
    ],
    whoItsFor: [
      "Homeowners wanting a pretty yard",
      "Commercial & office gardens",
      "Farmhouse owners"
    ],
    caseStudyId: "shalimar",
    process: [
      { title: "Land Slope Map", description: "Seeing how rainwater moves across your property." },
      { title: "Garden Layout", description: "Placing lawns, shade trees, flower beds, and stone paths." },
      { title: "Plant Selection", description: "Selecting hardy, regional plants." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Do these gardens require heavy watering?", answer: "No, we use native plants and rainwater channels to conserve water." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "terrace-garden",
    title: "Terrace & Balcony Gardens",
    category: "Land & Gardens",
    description: "Turn your rooftop or balcony into a lush garden with fresh vegetables, flowers, and comfy seating.",
    valueProps: [
      "Cool Roof - Plants block direct sun and keep rooms below cool",
      "Leak-Proof - Safe waterproofing and lightweight soil mixes",
      "Fresh Veggies - Grow herbs, tomatoes, and greens on your roof",
      "Shade Pergolas - Sit outside comfortably day and evening"
    ],
    icon: "Sprout",
    heroImage: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A terrace garden turns hot concrete roofs into private green sanctuaries. We design lightweight soil planters, shade canopies, and seating.",
      "We ensure proper roof waterproofing and weight distribution so your building stays 100% safe and leak-free."
    ],
    whoItsFor: [
      "Apartment & penthouse owners",
      "City homeowners",
      "Rooftop cafes & offices"
    ],
    caseStudyId: "shalimar",
    process: [
      { title: "Roof Safety Check", description: "Checking roof load capacity and waterproofing." },
      { title: "Layout Plan", description: "Designing planter boxes, shade pergolas, and seating." },
      { title: "Light Soil & Planting", description: "Using lightweight coco-peat and hardy plants." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Is a terrace garden safe for roof weight?", answer: "Yes! We use specialized lightweight planter mixes engineered for rooftops." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "backyard-design",
    title: "Backyard & Courtyard Gardens",
    category: "Land & Gardens",
    description: "Turn unused backyards into private outdoor living rooms with stone patios, shade plants, and sitting spots.",
    valueProps: [
      "Cozy Outdoor Sitting - Fire pits, benches, and outdoor dining spots",
      "Chemical-Free Ponds - Natural pools filtered by water plants",
      "Private & Green - Tall hedges and bamboo block outside eyes",
      "Fits Any Size - Great ideas for small or large yards"
    ],
    icon: "Home",
    heroImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "We turn empty backyards into cozy outdoor retreats. We design stone patios, greenery, and seating where you can relax with family.",
      "We can also design chemical-free natural pools that filter water using gravel and water lilies instead of harsh chlorine."
    ],
    whoItsFor: [
      "Homeowners with backyards",
      "Families wanting organic space",
      "Townhouse & villa owners"
    ],
    caseStudyId: "unique-school",
    process: [
      { title: "Yard Visit", description: "Measuring your yard and asking how you want to use it." },
      { title: "Design Layout", description: "Placing patios, paths, plants, and lighting." },
      { title: "Plant & Stone Pick", description: "Selecting durable local stone and healthy plants." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Can you design small backyards?", answer: "Yes! We specialize in making small outdoor spaces feel open and spacious." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  }
];

export const DIGITAL_PRODUCTS: DigitalProduct[] = [
  {
    id: 'portfolio-review',
    title: '1:1 Portfolio Review & Career Guidance',
    description: 'A personalized 45-minute session to review your architectural portfolio, refine your narrative, and position yourself for top international firms. Get actionable feedback from an experienced principal architect.',
    price: '₹999',
    link: 'https://topmate.io/archanagavas/1812019?utm_source=public_profile&utm_campaign=archanagavas',
    // Using founder image/session image
    image: 'https://topmate.io/cdn-cgi/image/width=640,quality=90/https://static.topmate.io/da2bLpNHf3cETP6EKEtsXL.jpeg',
    tags: ['Mentorship', 'Career', 'Architecture']
  },
  {
    id: 'general-consultation',
    title: 'Project Discussion & Consultation',
    description: 'Book a priority 1:1 session to discuss your upcoming project, site feasibility, or sustainability goals. A focused discussion to bring clarity to your vision before you build.',
    price: 'Book Now',
    link: 'https://topmate.io/archanagavas/1799075?utm_source=public_profile&utm_campaign=archanagavas',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop',
    tags: ['Consultation', 'Project Planning', 'Strategy']
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'yourweb3guy',
    title: 'Bihar Natural Eco-Home (yourweb3guy)',
    category: 'Residential',
    location: 'Bihar, India',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
    description: 'A custom home built with local clay, natural stone, and cool breezes to stay comfortable without heavy air conditioning.',
    fullDescription: 'Designed and built a natural home in Bihar using regional lime plaster, red clay tiles, and custom louvered windows. The home stays naturally cool during hot summers and saves energy year-round.',
    isFeatured: true,
    specs: [
      { label: 'Client', value: 'yourweb3guy (Akash Jha)' },
      { label: 'Location', value: 'Bihar, India' },
      { label: 'Techniques', value: 'Lime plaster, natural stone & louver windows' },
      { label: 'Strategy', value: 'Natural cooling & sun control' }
    ]
  },
  {
    id: 'carpa-lupa',
    title: 'Carpa Lupa',
    category: 'Hospitality',
    location: 'Wayanad, Kerala',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop',
    description: 'AIRBNB cottages design integrating wood and bamboo, prioritizing a luxurious eco stay experience.',
    fullDescription: 'An AIRBNB cottages design heavily utilizing natural materials like wood and bamboo. We worked with the site contours to maximize the guest eco stay experience, offering nature luxury complete with waterfront and mountain views in Wayanad, near Karapuzha dam.',
    isFeatured: true,
    specs: [
      { label: 'Location', value: 'Wayanad' },
      { label: 'Typology', value: 'AIRBNB Cottages' },
      { label: 'Materials', value: 'Wood, Bamboo' }
    ]
  },
  {
    id: 'batukaru-yurt',
    title: 'The Batukaru Yurt',
    category: 'Wellness',
    location: 'Bali, Indonesia',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop',
    description: 'An eco-friendly private wellness retreat featuring a yurt, sauna, and yoga shala.',
    fullDescription: 'Designed an eco-friendly private wellness retreat in Bali. The property includes a yurt with a loft bed and skylight dome, a sauna, an ice bath, a yoga shala, a small gym, and a cozy fireplace to offer the ultimate relaxing atmosphere.',
    isFeatured: true,
    specs: [
      { label: 'Location', value: 'Bali' },
      { label: 'Features', value: 'Yurt, Sauna, Yoga Shala' }
    ]
  },
  {
    id: 'unique-school',
    title: 'Unique School of Science',
    category: 'Community',
    location: 'India',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1200&auto=format&fit=crop',
    description: 'A community workshop on bird house making and boundary wall fencing makeover using waste materials.',
    fullDescription: 'Held an interactive workshop with students at the Unique School of Science, teaching them bird house making and performing a boundary wall fencing makeover exclusively with waste materials.',
    isFeatured: false,
    specs: [
      { label: 'Focus', value: 'Upcycling, Education' }
    ]
  },
  {
    id: 'beer-bar',
    title: 'Beer Bar',
    category: 'Commercial',
    location: 'India',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1200&auto=format&fit=crop',
    description: 'A food zone with multiple outdoor seating spaces, walking pavilions, and a canal front view.',
    fullDescription: 'Designed a dynamic food zone with multiple outdoor sitting spaces. The project features overhead walking pavilions and a walkway tree bridge that is oriented towards a scenic canal front view.',
    isFeatured: false,
    specs: [
      { label: 'Typology', value: 'Food & Beverage' },
      { label: 'Features', value: 'Outdoor Seating, Tree Bridge' }
    ]
  },
  {
    id: 'vanvagado-farm',
    title: 'Vanvagado Farm',
    category: 'Hospitality',
    location: 'India',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
    description: 'Eco-farm stays featuring a natural swimming pond and a permaculture food forest.',
    fullDescription: 'Eco-farm stays designed with a deep permaculture approach. Highlights include a natural swimming pond and a lush food forest, seamlessly connecting visitors to sustainable agriculture.',
    isFeatured: false,
    specs: [
      { label: 'Focus', value: 'Permaculture, Eco stay' },
      { label: 'Features', value: 'Natural Pool, Food Forest' }
    ]
  },
  {
    id: 'shalimar',
    title: 'Shalimar',
    category: 'Residential',
    location: 'India',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop',
    description: 'A beautifully designed terrace garden executed entirely with waste materials.',
    fullDescription: 'Designed and uniquely executed a terrace garden space using discarded and waste materials, proving that sustainability and aesthetics can go hand in hand.',
    isFeatured: false,
    specs: [
      { label: 'Typology', value: 'Terrace Garden' },
      { label: 'Materials', value: 'Upcycled Waste' }
    ]
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'biophilic-design',
    slug: 'biophilic-design-connecting-architecture-with-nature',
    title: 'Biophilic Design: Connecting Architecture with Nature',
    date: 'October 25, 2023',
    author: 'Anvitam Team',
    status: 'published',
    metaDescription: 'Explore how biophilic design integrates natural elements into architecture to enhance well-being, productivity, and sustainability.',
    tags: ['Biophilic Design', 'Sustainability', 'Architecture'],
    excerpt: 'Rooted in the belief that humans have an innate connection to nature, biophilic design incorporates natural elements to create spaces that promote well-being.',
    // Updated Image
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop',
    toc: [
      'What is biophilic design',
      'Principles of Biophilic Design',
      'Benefits of Biophilic Design',
      'Implementing Biophilic Design',
      'Comparison: Conventional vs Biophilic',
      'Biophilia in Interiors'
    ],
    authorImage: '/archana.png',
    authorBio: 'Architect & Permaculture Designer | Farm Retreats, Eco Homestays, Food Forests, Agroforestry & Agrotourism | Consultation, Site Planning, Designing & Visualization - 4 years experience',
    content: `
      <h2>What is biophilic design</h2>
      <p>Biophilic design is an architectural approach that integrates natural elements—such as light, air, greenery, and organic materials—into built environments to promote well-being, productivity, and a deeper connection to nature.</p>
      <p>Rooted in the belief that humans have an innate connection to nature, biophilic design incorporates natural elements, materials, and processes to create spaces that promote well-being, enhance productivity, and contribute to environmental sustainability. This approach is not just about aesthetics—it fundamentally improves the quality of life for occupants by fostering a closer connection to the natural world.</p>

      <h2>Principles of Biophilic Design</h2>
      <p>Stephen Kellert, a pioneer in biophilic design, identified six core elements that guide its application:</p>
      
      <h3>1. Environmental Features</h3>
      <p>This principle emphasizes the direct integration of natural elements into the built environment. Incorporating plants, water features, sunlight, fresh air, and natural materials such as wood and stone creates spaces that resonate with human affinity for nature.</p>
      
      <h3>2. Natural Shapes and Forms</h3>
      <p>Biophilic architecture employs shapes and patterns found in nature—such as curves, arches, and organic forms—to evoke a sense of harmony.</p>

      <h3>3. Natural Patterns and Processes</h3>
      <p>This element focuses on incorporating natural variability, richness of detail, and sensory experiences. Patterns in materials, changing light conditions, and textured surfaces mimic the dynamic processes found in nature.</p>

      <h2>Benefits of Biophilic Design</h2>
      <ol>
        <li><strong>Enhances Mental Health:</strong> Being surrounded by natural elements has been shown to reduce stress, anxiety, and depression.</li>
        <li><strong>Boosts Productivity:</strong> Natural lighting and greenery stimulate the mind and reduce fatigue.</li>
        <li><strong>Promotes Physical Health:</strong> Improved air quality and natural ventilation.</li>
      </ol>

      <h2>Comparison: Conventional Design vs Biophilic Design</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse my-8">
          <thead>
            <tr class="border-b-2 border-anvitam-green">
              <th class="py-4 font-serif text-lg">Feature</th>
              <th class="py-4 font-serif text-lg">Conventional Design</th>
              <th class="py-4 font-serif text-lg">Biophilic Design</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-200">
              <td class="py-3">Connection to Nature</td>
              <td class="py-3 text-gray-500">Minimal or incidental</td>
              <td class="py-3 font-medium">100% Integrated</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="py-3">Materials Used</td>
              <td class="py-3 text-gray-500">Often synthetic/industrial</td>
              <td class="py-3 font-medium">Natural, Local, Earthy</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="py-3">User Well-being</td>
              <td class="py-3 text-gray-500">Not always considered</td>
              <td class="py-3 font-medium">Central to design</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Biophilia in Interiors</h2>
      <p>Biophilia shapes not just our architecture but also our interior design philosophy. Across several homes and retreats near Mumbai, we’ve crafted interiors that invite nature inside — through material, light, form, and sensory experience.</p>
      <p>We use natural finishes like lime plaster, reclaimed wood, and earth-based flooring to create tactile warmth. Indoor courtyards, skylights, and large openings bring in sunlight, shadows, and breeze, fostering a constant dialogue between inside and out.</p>

      <h2>Conclusion</h2>
      <p>In an age of rapid urbanisation, biophilic design offers a return to balance. By weaving nature into the fabric of our homes, we create environments that nurture the human spirit. At Anvitam, we see biophilic design not as a style, but as a responsibility.</p>
    `
  },
  {
    id: 'future-sustainable',
    slug: 'future-sustainable-architecture-gujarat',
    title: 'The Future of Sustainable Architecture in Gujarat',
    date: 'October 15, 2023',
    author: 'Archana Gavas',
    status: 'published',
    metaDescription: 'Exploring how traditional Gujarati building techniques can be adapted for modern sustainability needs.',
    tags: ['Sustainability', 'Gujarat', 'Insights'],
    excerpt: 'Exploring how traditional Gujarati building techniques can be adapted for modern sustainability needs.',
    content: '<p>Full article content regarding sustainable practices in Gujarat...</p>',
    // Updated Image
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop',
    authorImage: '/archana.png',
    authorBio: 'Architect & Permaculture Designer | Farm Retreats, Eco Homestays, Food Forests, Agroforestry & Agrotourism | Consultation, Site Planning, Designing & Visualization - 4 years experience',
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 't1',
    name: 'Archana Gavas',
    role: 'Principal Architect, Founder',
    // Updated image link
    image: '/archana.png',
    bio: 'Architect & Permaculture Designer helping landowners turn empty land into beautiful farmhouses, eco-resorts, and food forests.',
    linkedin: 'https://www.linkedin.com/in/archana-gavas/'
  },
];

export const AWARDS: Award[] = []; 

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'tm1',
    text: "We’re grateful for how thoughtfully the home was designed and executed. The use of natural materials and climate-responsive strategies made the space comfortable, honest, and deeply connected to its surroundings.",
    author: 'Akash Jha',
    role: 'yourweb3guy',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80'
  },
  {
    id: 'tm2',
    text: "We’re thankful for how the farm has evolved through your design. The natural pond and food forest have added life, balance, and a sense of harmony that guests genuinely feel.",
    author: 'Mahandra sinh Solanki',
    role: 'Vanvagado ecofarm',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80'
  },
  {
    id: 'tm3',
    text: "Thank you for designing such a peaceful and well-considered retreat. Every element, from the yurt to the wellness spaces, feels intentional and deeply calming for our guests",
    author: 'Dennis',
    role: 'The Batukaru Yurt',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&q=80'
  },
  {
    id: 'tm4',
    text: "The terrace garden has become one of our favourite spaces. We really appreciate how reclaimed materials were used so creatively and sustainably.",
    author: 'Naveen Bhagchandani',
    role: 'Shalimar',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&q=80'
  }
];

export const INITIAL_ESTIMATOR_SERVICES: EstimatorService[] = [
  {
    id: 'permaculture-design',
    title: 'Food Forest & Land Masterplan',
    icon: '🌾',
    desc: 'Water harvesting, soil health & food forest layout',
    subs: ['Site & Climate Check', 'Land Zone Layout', 'Master Plan Map', 'Food Forest Design', 'Rainwater Harvesting Plan', 'Soil Health Plan', 'Native Tree & Plant List', 'Step-by-Step Planting Plan'],
    baseINR: [15000,12000,25000,18000,14000,10000,8000,12000],
  },
  {
    id: 'farm-retreat',
    title: 'Farmhouse & Farm Stay',
    icon: '🏡',
    desc: 'Complete natural architecture for your farm home',
    subs: ['Design Ideas & Mood Board', 'Floor Plan & Room Layout', '3D Building Views', 'Building Measurements', 'Rainwater & Drainage Scheme', 'Garden Integration Plan', 'Detailed Material Cost List', 'Project Budget Estimate'],
    baseINR: [10000,20000,15000,25000,8000,12000,18000,20000,15000],
  },
  {
    id: 'airbnb',
    title: 'Airbnb & Rental Cottage',
    icon: '🏠',
    desc: 'High-yield short-stay design for guest rentals',
    subs: ['Guest Market Study', 'Room Layout & Flow Plan', 'Interior Design Concept', '3D Renders', 'Natural Material List', 'Guest Experience Guide', 'Photo Guide for Listing', 'Pricing & Earnings Estimate'],
    baseINR: [12000,15000,20000,22000,10000,12000,8000,10000],
  },
  {
    id: 'homestay',
    title: 'Homestay & Eco Villa',
    icon: '🏘️',
    desc: 'Vernacular & natural homestay architecture',
    subs: ['Local Building Style Study', 'Land & Site Layout', 'Host & Guest Zone Plan', 'Natural Materials Plan', 'Floor Plans', '3D Building Views', 'Cultural Design Features', 'Material Cost Estimate'],
    baseINR: [12000,15000,10000,12000,18000,22000,8000,15000],
  },
  {
    id: 'weekend-villa',
    title: 'Weekend Villa & Retreat',
    icon: '🌄',
    desc: 'Comfortable luxury villa with natural cooling',
    subs: ['Initial Design Concept', 'Natural Cooling & Light Plan', 'Exterior 3D Renders', 'Interior 3D Renders', 'Garden & Courtyard Layout', 'Rental Potential Guide', 'Complete Builder Drawings', 'Material Cost List'],
    baseINR: [15000,20000,25000,25000,18000,12000,30000,20000],
  },
  {
    id: 'eco-resort',
    title: 'Eco Resort & Wellness Center',
    icon: '🌺',
    desc: 'Masterplan for eco resort cabins, amenities & land',
    subs: ['Land & Climate Survey', 'Complete Sustainable Masterplan', 'Guest Cabin & Cottage Design', 'Dining & Activity Hub Design', 'Eco Wastewater System', 'Solar Energy Plan', 'Resort Landscape Design', 'Detailed Construction Estimate'],
    baseINR: [20000,45000,30000,25000,18000,15000,30000,35000],
  },
];