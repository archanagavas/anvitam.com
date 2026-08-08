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
    title: 'Understand',
    items: ['client vision', 'site study', 'climate analysis'],
    description: 'Every project begins with understanding—listening to visions, sensing the site, and learning from climate. We delve deep into the context to build a foundation of empathy and knowledge.',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'design',
    number: '2',
    title: 'Design',
    items: ['conceptual design', 'final design', 'cost estimate'],
    description: 'Ideas take shape, evolving into designs that respond with care. We iterate through concepts, balancing aesthetics with function, and ensuring the budget aligns with the vision.',
    image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'deliver',
    number: '3',
    title: 'Deliver',
    items: ['contractor selection', 'working drawings', 'supervision'],
    description: 'Finally, we guide the making, ensuring each space is built true to its intent. Precision in documentation and on-site supervision ensures the dream becomes a tangible reality.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop'
  }
];

export const SERVICES: Service[] = [
  {
    id: 'permaculture-design',
    title: 'Permaculture & Land Design',
    description: 'We help you design your land so it captures rainwater, builds healthy soil, and grows trees and food naturally with less work.',
    valueProps: [
      'Healthy Soil - We rebuild your land\'s soil naturally', 
      'Rainwater Saving - Catch and store rainwater on site', 
      'Lush Plants - Grow trees, flowers, and food together', 
      'Cool Buildings - Align homes with sun and breeze'
    ],
    icon: 'Sprout',
    heroImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
    whatItIs: [
      'Permaculture helps us understand how water flows and how soil stays rich. We make sure your home or farm makes the land better instead of damaging it.',
      'We design food forests and garden layouts that catch water automatically. This reduces watering costs and gives you fresh growth year after year.'
    ],
    whoItsFor: ['Farm owners & retreats', 'Schools & community spaces', 'Anyone with empty land or gardens'],
    caseStudyId: 'vanvagado-farm',
    process: [
      { title: 'Site Reading', description: 'Checking sun, wind, water, and soil on your land.' },
      { title: 'Land Zoning', description: 'Planning where houses, paths, and gardens go.' },
      { title: 'Water & Plant Plan', description: 'Connecting rainwater channels with fruit trees.' },
      { title: 'Step-by-Step Guide', description: 'A simple roadmap to build over time.' }
    ],
    pricing: 'Consult for Pricing',
    faq: [
      { question: 'What is permaculture design?', answer: 'It is a smart way to plan land so nature does most of the heavy lifting for water and soil.' },
      { question: 'What determines the design cost?', answer: 'The size of your land and what you want to build on it.' },
      { question: 'What do I get in the final plan?', answer: 'Full map drawings, plant lists, water channel diagrams, and building locations.' }
    ],
    bookingLink: 'https://topmate.io/archanagavas'
  },
  {
    id: "farm-retreat",
    title: "Farm Retreats & Farmhouses",
    description: "Build a cozy farmhouse or weekend retreat that fits your land, stays cool naturally, and feels connected to nature.",
    valueProps: [
      "Smart Land Layout - Easy flow for living and farming",
      "Naturally Cool Homes - Uses breeze and shade to cut AC bills",
      "Relaxing Spaces - Built for peace, family time, and fresh air",
      "Low Upkeep - Simple, long-lasting natural materials"
    ],
    icon: "Home",
    heroImage: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "We design farmhouses that give you modern comfort while honoring the land around you. Your retreat becomes a place to relax, grow organic food, and enjoy fresh air.",
      "Whether it is a family farmhouse or a rental stay, we design buildings using local stone, brick, and natural shading so rooms stay comfortable in summer and winter."
    ],
    whoItsFor: [
      "Families building weekend farmhouses",
      "Landowners starting a farm stay",
      "Investors creating eco-resorts"
    ],
    caseStudyId: "carpa-lupa",
    process: [
      { title: "Land Visit", description: "Finding the best spot on your land for light and views." },
      { title: "Home Design", description: "Drawing room layouts, verandas, and garden paths." },
      { title: "Water & Power", description: "Planning solar power and rainwater collection." },
      { title: "Construction Guide", description: "Helping your builders construct it correctly." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Can a farmhouse be self-sustaining?", answer: "Yes! We can design it to catch rainwater and generate solar electricity." },
      { question: "Is natural building durable?", answer: "Extremely. Natural stone, lime, and wood withstand weather for decades." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "airbnb",
    title: "Airbnb & Rental Stays",
    description: "Stand out on rental platforms. We design beautiful, easy-to-clean rental cottages that guests love to book and review.",
    valueProps: [
      "Eye-Catching Photos - Unique look that gets clicks and bookings",
      "Easy Cleaning - Durable layouts that cut cleaning time in half",
      "Guest Comfort - Cozy bedrooms, open views, and relaxing spots",
      "Great Reviews - Designed for 5-star guest experiences"
    ],
    icon: "Home",
    heroImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A great rental property needs to look amazing online and work smoothly offline. We design spaces that feel like an instant vacation destination.",
      "We pick stain-resistant, durable materials so your property stays fresh and requires less repair between host check-ins."
    ],
    whoItsFor: [
      "Property owners starting an Airbnb",
      "Hosts wanting to upgrade their rental",
      "Vacation home investors"
    ],
    caseStudyId: "carpa-lupa",
    process: [
      { title: "Market Review", description: "Checking what nearby rentals miss so your property stands out." },
      { title: "Space Layout", description: "Designing cozy rooms, outdoor decks, and photo spots." },
      { title: "Material Pick", description: "Selecting strong, easy-clean flooring and finishes." },
      { title: "Final Look", description: "Creating a 5-star experience for guests." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Why hire an architect for an Airbnb?", answer: "A well-designed property gets higher nightly rates and constant bookings." },
      { question: "How does design reduce cleaning work?", answer: "We avoid dust-trapping corners and use easy-to-wipe, tough surfaces." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "homestay",
    title: "Homestays & Guest Houses",
    description: "Turn your property into a warm, welcoming homestay where guests enjoy local culture and feel right at home.",
    valueProps: [
      "Local Character - Uses local stone, clay, and wood styles",
      "Host Privacy - Clear areas for guests and host family privacy",
      "Naturally Cool - Cool breezes and shade keep rooms airy",
      "Welcoming Vibes - Cozy gathering spots for food and conversations"
    ],
    icon: "Home",
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A homestay should feel warm, personal, and authentic. We design guest rooms and dining areas that highlight local traditions and scenic views.",
      "We make sure your family has private living areas while guests enjoy a quiet, memorable stay without feeling intrusive."
    ],
    whoItsFor: [
      "Families opening a homestay",
      "Rural landowners",
      "Heritage house owners"
    ],
    caseStudyId: "yourweb3guy",
    process: [
      { title: "Site Study", description: "Understanding your local building style and landscape." },
      { title: "Privacy Zoning", description: "Separating guest spaces from host family rooms." },
      { title: "Material Selection", description: "Using local earth, wood, and stone." },
      { title: "Building Plans", description: "Detailed drawings for local workers." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "What makes a homestay successful?", answer: "Warm atmosphere, guest privacy, and authentic local design." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "community-center",
    title: "Community & Activity Centers",
    description: "Build friendly, open spaces for learning, gathering, and health using strong natural materials and bright daylight.",
    valueProps: [
      "Open Gathering - Spacious areas for workshops and events",
      "Bright & Airy - Big windows for natural light and fresh air",
      "Eco-Friendly - Rainwater tanks and green roofs",
      "Built to Last - Strong, low-maintenance materials"
    ],
    icon: "Building",
    heroImage: "https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "Community spaces bring people together. We design bright halls, activity rooms, and outdoor courtyards where people can learn and celebrate.",
      "Our designs use natural ventilation and rainwater harvesting so operating expenses stay low for schools, clubs, and organizations."
    ],
    whoItsFor: [
      "Schools & educational clubs",
      "NGOs & non-profits",
      "Community leaders"
    ],
    caseStudyId: "unique-school",
    process: [
      { title: "Community Input", description: "Asking what activities the center will host." },
      { title: "Building Layout", description: "Designing flexible halls, classrooms, and gardens." },
      { title: "Green Features", description: "Adding rainwater collection and solar lighting." },
      { title: "Safe Delivery", description: "Creating durable, safe spaces for all ages." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Can these spaces handle daily public use?", answer: "Yes! We use tough, natural materials that stand up to heavy daily traffic." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "weekend-villa",
    title: "Weekend Villas & Getaways",
    description: "Design your personal getaway to relax, recharge, and enjoy the outdoors with family and friends.",
    valueProps: [
      "Peaceful Retreat - Open verandas, quiet courtyards, and garden views",
      "Cool & Shaded - Smart roof design that blocks harsh heat",
      "Low Upkeep - Materials that stay good without constant painting",
      "Great Value - Option to rent out when you are away"
    ],
    icon: "Home",
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A weekend villa should feel like an immediate break from city noise. We design homes with big windows, open living rooms, and shaded verandas.",
      "Using passive cooling methods, your villa stays comfortable without burning electricity on heavy AC."
    ],
    whoItsFor: [
      "Families building a getaway home",
      "Landowners wanting a private sanctuary",
      "Investors building vacation homes"
    ],
    caseStudyId: "yourweb3guy",
    process: [
      { title: "View & Sun Study", description: "Positioning the villa for maximum shade and views." },
      { title: "Floor Plan", description: "Designing spacious bedrooms, living areas, and decks." },
      { title: "Material Pick", description: "Choosing natural stone and wood that need minimal care." },
      { title: "Execution", description: "Guiding construction to match the exact design." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Can I build my villa off-grid?", answer: "Yes, we can include solar panels, rainwater tanks, and natural cooling." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "eco-resort",
    title: "Eco Resorts & Glamping",
    description: "Create eco-friendly resorts that give guests luxury stays while protecting trees, soil, and wildlife.",
    valueProps: [
      "Nature First - Cottages placed carefully between existing trees",
      "Zero Waste - On-site water filtering and organic composting",
      "Unique Stays - Canvas tents, bamboo huts, or timber cabins",
      "High Guest Appeal - Memorable, sustainable hospitality"
    ],
    icon: "Map",
    heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "Modern travelers love stays that respect nature. We design eco-resorts with wooden cottages, stone walkways, and natural swimming pools.",
      "We design behind-the-scenes systems like water recycling and solar power so your resort stays green and profitable."
    ],
    whoItsFor: [
      "Resort owners & developers",
      "Landowners starting eco-tourism",
      "Glamping site operators"
    ],
    caseStudyId: "carpa-lupa",
    process: [
      { title: "Site Survey", description: "Mapping trees, slopes, and water streams to protect them." },
      { title: "Masterplan", description: "Layout for cottages, dining areas, pool, and walkways." },
      { title: "Eco Systems", description: "Designing water recycling and clean power." },
      { title: "Build Guidance", description: "Making sure construction doesn't harm the land." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Is an eco resort profitable?", answer: "Very! Travelers actively look for eco-friendly places to stay." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "wellness-retreat",
    title: "Wellness & Yoga Retreats",
    description: "Build quiet, peaceful spaces for yoga, meditation, and healthy living made with clean, non-toxic materials.",
    valueProps: [
      "Quiet & Peaceful - Noise-reducing natural walls for quiet sleep",
      "Non-Toxic - Lime plaster, untreated timber, and zero-VOC paints",
      "Yoga Halls - Open, airy shalas with timber flooring",
      "Pure Environment - Fresh air flow and clean natural light"
    ],
    icon: "Heart",
    heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A wellness center needs to help people feel calm the moment they arrive. We use natural materials like clay, lime, and timber that naturally balance room humidity and air quality.",
      "From meditation rooms to outdoor herbal gardens, we create soothing spaces that support healing and relaxation."
    ],
    whoItsFor: [
      "Yoga teachers & wellness founders",
      "Health retreat developers",
      "Spa & wellness center owners"
    ],
    caseStudyId: "batukaru-yurt",
    process: [
      { title: "Vision Session", description: "Understanding your healing programs and guest needs." },
      { title: "Quiet Layout", description: "Separating quiet shalas from kitchen & arrival areas." },
      { title: "Pure Materials", description: "Picking natural lime, timber, and non-toxic paints." },
      { title: "Build Supervision", description: "Ensuring every detail stays true to your vision." }
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
    description: "Plant self-growing fruit trees, vegetables, and herbs layered like a natural forest for fresh organic food year-round.",
    valueProps: [
      "Fresh Organic Food - Harvest fruits, nuts, berries, and herbs",
      "Self-Fertilizing - Trees and plants help each other grow",
      "Saves Water - Thick mulch and shade keep soil moist",
      "Low Maintenance - Requires less weeding once established"
    ],
    icon: "TreePine",
    heroImage: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A food forest mimics a natural jungle. Instead of planting rows of a single crop that need chemical spray, we mix fruit trees, berry bushes, groundcover herbs, and climbing vines together.",
      "The plants feed each other, trap moisture, and protect soil, giving you a self-sustaining garden of fresh food."
    ],
    whoItsFor: [
      "Farm owners wanting organic food",
      "Resorts serving farm-to-table meals",
      "Homeowners with garden space"
    ],
    caseStudyId: "vanvagado-farm",
    process: [
      { title: "Soil Test", description: "Checking soil texture and nutrient levels." },
      { title: "Water Trenches", description: "Digging swales to trap rainwater in the soil." },
      { title: "Tree Selection", description: "Choosing fruit and shade trees suited to your area." },
      { title: "Layered Planting", description: "Planting tall trees, shrubs, and herbs together." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "How soon do I get food?", answer: "Herbs and veggies yield in month 1; fruit trees start producing in 1 to 3 years." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "agrotourism",
    title: "Agrotourism & Farm Visits",
    description: "Turn your farm into an exciting place where visitors can tour, learn, pick fresh produce, and stay.",
    valueProps: [
      "Safe Farm Layout - Separate farm machines from visitor paths",
      "Fun Experiences - Fruit picking, farm tours, and farm dining",
      "Extra Income - Generate revenue from farm stays and tours",
      "Authentic Feel - Show real farm life without disrupting work"
    ],
    icon: "Map",
    heroImage: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "Agrotourism lets farm owners earn extra income by hosting guests. We design safe walking paths, tasting pavilions, and cozy stay cottages on your working farm.",
      "We make sure guest areas are separate from tractor routes and heavy farm work so operations run smoothly."
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
    description: "Transform empty yards or fields into green outdoor spaces with shade trees, walking paths, and native flowers.",
    valueProps: [
      "Native Flowers & Trees - Easy to grow and need less water",
      "Rainwater Capture - Swales and ponds keep gardens green",
      "Walking Paths - Beautiful stone paths, benches, and lighting",
      "Low Upkeep - Uses local plants that thrive naturally"
    ],
    icon: "TreePine",
    heroImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "Good landscape design turns empty land into a relaxing outdoor space. We design rainwater channels, shade trees, flower beds, and seating areas.",
      "We choose plants that grow natively in your area so you do not waste water or money on expensive artificial fertilizers."
    ],
    whoItsFor: [
      "Homeowners wanting a pretty yard",
      "Commercial & office gardens",
      "Farmhouse owners"
    ],
    caseStudyId: "shalimar",
    process: [
      { title: "Land Slope Map", description: "Seeing how water moves across your yard." },
      { title: "Garden Layout", description: "Placing lawns, trees, flower beds, and paths." },
      { title: "Plant Selection", description: "Picking hardy, beautiful native plants." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Do these gardens require a lot of watering?", answer: "No, we use native plants and rainwater collection to save water." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "terrace-garden",
    title: "Terrace & Balcony Gardens",
    description: "Turn your rooftop or balcony into a lush garden with fresh vegetables, flowers, and comfy seating.",
    valueProps: [
      "Cool Roof - Plants block direct sun and keep rooms underneath cool",
      "Leak-Proof - Safe waterproofing and light soil mixes",
      "Fresh Veggies - Grow herbs, tomatoes, and greens on your roof",
      "Shade Pergolas - Sit outside comfortably day and evening"
    ],
    icon: "Sprout",
    heroImage: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop",
    whatItIs: [
      "A terrace garden turns hot concrete roofs into private green spots. We design lightweight soil planters, shade canopies, and seating.",
      "We ensure proper roof waterproofing and weight distribution so your building stays 100% safe and leak-free."
    ],
    whoItsFor: [
      "Apartment & penthouse owners",
      "City homeowners",
      "Rooftop cafes & offices"
    ],
    caseStudyId: "shalimar",
    process: [
      { title: "Roof Safety Check", description: "Checking roof weight capacity and waterproofing." },
      { title: "Layout Plan", description: "Designing planter boxes, shade pergolas, and seating." },
      { title: "Light Soil & Planting", description: "Using lightweight coco-peat and hardy plants." }
    ],
    pricing: "Consult for Pricing",
    faq: [
      { question: "Is a terrace garden safe for roof weight?", answer: "Yes! We use specialized lightweight planter mixes designed for rooftops." }
    ],
    bookingLink: "https://topmate.io/archanagavas"
  },
  {
    id: "backyard-design",
    title: "Backyard & Courtyard Gardens",
    description: "Turn unused backyards into private outdoor living rooms with stone patios, shade plants, and sitting spots.",
    valueProps: [
      "Cozy Outdoor Sitting - Fire pits, benches, and dining spots",
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
      { title: "Plant & Stone Pick", description: "Selecting durable local stones and healthy plants." }
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
    title: 'yourweb3guy',
    category: 'Residential',
    location: 'Bihar',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
    description: 'A house built with natural material techniques and passive design strategies for the Bihar climate.',
    fullDescription: 'Designed and executed a house with natural material techniques like kavi flooring, surkhi plaster, and indoor windows with louvers. We integrated passive design strategies tailored specifically according to the Bihar climate to ensure comfort and sustainability.',
    isFeatured: true,
    specs: [
      { label: 'Location', value: 'Bihar' },
      { label: 'Techniques', value: 'Kavi flooring, Surkhi plaster' },
      { label: 'Strategy', value: 'Passive Design' }
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
    bio: 'Rooted in Vadodara, Designing for the world.',
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
    title: 'Permaculture Design',
    icon: '🌿',
    desc: 'Site analysis, food forest & land masterplan',
    subs: ['Site Reading & Analysis','Zonation Plan','Master Plan / Layout','Food Forest Design','Water Harvesting System','Soil Improvement Plan','Plant Guild & Species List','Implementation Roadmap'],
    baseINR: [15000,12000,25000,18000,14000,10000,8000,12000],
  },
  {
    id: 'farm-retreat',
    title: 'Farm Retreat Design',
    icon: '🏡',
    desc: 'Complete architecture for farm stays',
    subs: ['Conceptual Mood Board','Layout Plan','Design Presentation','Exterior 3D Views','Building Measurement','Site Drainage Scheme','Landscape Integration','Bill of Quantity','Development Estimate'],
    baseINR: [10000,20000,15000,25000,8000,12000,18000,20000,15000],
  },
  {
    id: 'airbnb',
    title: 'Airbnb Design',
    icon: '🏠',
    desc: 'Revenue-optimised short-stay design',
    subs: ['Market Analysis','Spatial Strategy','Interior Concept','3D Renders','Material Selection','Guest Experience Curation','Listing Photo Guide','Pricing Strategy Report'],
    baseINR: [12000,15000,20000,22000,10000,12000,8000,10000],
  },
  {
    id: 'homestay',
    title: 'Homestay Design',
    icon: '🏘️',
    desc: 'Vernacular & biophilic homestay architecture',
    subs: ['Vernacular Study','Site Integration Plan','Host–Guest Zoning','Natural Materials Plan','Layout Plan','3D Views','Cultural Expression Guide','Bill of Quantity'],
    baseINR: [12000,15000,10000,12000,18000,22000,8000,15000],
  },
  {
    id: 'weekend-villa',
    title: 'Weekend Villa',
    icon: '🌄',
    desc: 'Biophilic luxury villa architecture',
    subs: ['Conceptual Design','Biophilic Design Plan','Exterior 3D Views','Interior 3D Views','Landscape Design','Rental Optimisation','Working Drawings','Bill of Quantity'],
    baseINR: [15000,20000,25000,25000,18000,12000,30000,20000],
  },
  {
    id: 'eco-resort',
    title: 'Eco Resort',
    icon: '🌺',
    desc: 'Full masterplan for eco-resorts & retreats',
    subs: ['Ecological Baseline Study','Regenerative Masterplan','Cabin / Unit Design','Amenity Block Design','Wastewater System Design','Solar & Wind Plan','Resort Landscape','Bill of Quantity'],
    baseINR: [20000,45000,30000,25000,18000,15000,30000,35000],
  },
  {
    id: 'community-center',
    title: 'Community Center',
    icon: '🏛️',
    desc: 'Inclusive sustainable civic spaces',
    subs: ['Civic Needs Study','Programmatic Synergy Plan','Conceptual Design','Accessibility Design','Ecological Integration','Working Drawings','Bill of Quantity','Grant Readiness Report'],
    baseINR: [12000,15000,20000,12000,15000,35000,22000,18000],
  },
];