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
    "id": "homestay",
    "title": "Homestays & Guest Houses",
    "category": "Homes & Retreats",
    "description": "Turn your property into a warm, welcoming homestay where guests enjoy local culture and feel right at home.",
    "valueProps": [
      "Homestay layout & floor plan",
      "3D renders of rooms and outdoor spaces",
      "Material and finish recommendations",
      "Guest-flow and privacy planning",
      "Construction management (if needed)",
      "Guidance on homestay website setup"
    ],
    "icon": "Home",
    "heroImage": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Homestay design turns your extra land or old house into a place guests love to stay in.",
      "We keep the design simple, warm, and true to local culture — not a copy-paste hotel room.",
      "A good homestay design plan balances guest privacy with a friendly, home-like feel.",
      "We can design in wood, stone, or mud-based finishes if you want a village homestay design look.",
      "Every homestay we design is built to earn strong reviews and repeat bookings.",
      "If you already run a homestay, we can also help set up your homestay website template so guests can find and book you easily."
    ],
    "whoItsFor": [
      "Landowners wanting a second income stream",
      "Families converting an old house into a guest stay",
      "Farm owners wanting to host rural tourism guests",
      "Anyone starting a homestay business from scratch"
    ],
    "caseStudyId": "yourweb3guy",
    "process": [
      {
        "title": "Site & Guest Profile Study",
        "description": "We visit your property and learn who your guests are (families, backpackers, couples)."
      },
      {
        "title": "Concept Design",
        "description": "We create a simple homestay design plan that fits your land and budget."
      },
      {
        "title": "3D Visualization",
        "description": "See exactly how each room and outdoor sitting area will look before building."
      },
      {
        "title": "Design Finalization",
        "description": "We finalize layouts, materials, and finishing touches like wooden accents."
      },
      {
        "title": "Execution (PMC)",
        "description": "We manage contractors and materials so your homestay opens on time and on budget."
      },
      {
        "title": "Handover & Branding Support",
        "description": "You receive the finished homestay, ready for guests and photos."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "What is homestay design?",
        "answer": "It's planning a guest-friendly version of your home or land, so visitors feel comfortable and experience local culture."
      },
      {
        "question": "Can you design a simple, low-cost homestay?",
        "answer": "Yes. We offer simple homestay designs that use local materials to keep costs down without cutting comfort."
      },
      {
        "question": "Do you design wooden or village-style homestays?",
        "answer": "Yes, we design wooden homestay design options and village homestay design styles based on what fits your land."
      },
      {
        "question": "Can you help set up my homestay website?",
        "answer": "We can guide you toward the right homestay website template so your property is easy to find online."
      },
      {
        "question": "How long does a homestay design project take?",
        "answer": "Most homestay design plans are ready in 2–4 weeks, and full construction depends on size and scope."
      },
      {
        "question": "Do you offer consultation online if I'm not in Vadodara?",
        "answer": "Yes. We offer both in-person consultation near Vadodara and online architecture design consultation."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Homestay Design Services | Simple & Village-Style Homestay Architects",
    "metaDescription": "From simple homestay design to full village-style builds — we design warm, welcoming guest houses ready for bookings. Get a free consultation.",
    "metaKeywords": "homestays design, simple homestay design, village homestay design, homestay design plan, wooden homestay design, homestay website template",
    "metaRobots": "index, follow"
  },
  {
    "id": "weekend-villa",
    "title": "Weekend Villas & Getaways",
    "category": "Homes & Retreats",
    "description": "Design your private weekend villa getaway to relax, recharge, and spend quality time with family.",
    "valueProps": [
      "Villa floor plan & layout design",
      "3D exterior & interior visualizations",
      "Landscape & courtyard integration",
      "Structural & utility drawings",
      "Construction management (PMC)",
      "Rental stay setup guidance"
    ],
    "icon": "Home",
    "heroImage": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "A weekend villa is your private escape from city noise, designed for pure rest and family time.",
      "Whether you want a simple 1 BHK getaway, a wooden weekend villa design, or a luxury pool villa, we design it around your land.",
      "We focus on passive cooling — using shade, breeze, and green courtyards so rooms stay comfortable with less air conditioning.",
      "If you want to earn passive income, we also design your getaway to double as a rental stay.",
      "If you need a weekend villa design drawing, 3D visualization, or full construction guidance, we cover it all."
    ],
    "whoItsFor": [
      "Families wanting a peaceful private getaway",
      "Landowners building on farm plots",
      "Investors building rental getaway villas",
      "City residents looking for a nature escape"
    ],
    "caseStudyId": "yourweb3guy",
    "process": [
      {
        "title": "Site & Land Study",
        "description": "We check sun angles, winds, and views to pick the best spot for your villa."
      },
      {
        "title": "Concept & Layout Plan",
        "description": "We create floor plans matching your lifestyle — open verandas, cozy bedrooms, private yards."
      },
      {
        "title": "3D Villa Visualization",
        "description": "Walk through your future villa design in 3D before making any building decisions."
      },
      {
        "title": "Detailed Drawings",
        "description": "We provide complete structural, electrical, and plumbing drawings for local builders."
      },
      {
        "title": "PMC & Site Supervision",
        "description": "We guide contractors step-by-step to make sure the villa matches the design."
      },
      {
        "title": "Handover",
        "description": "Your villa is ready to move in or list for guests."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "How much land do I need for a weekend villa?",
        "answer": "You can build a great weekend villa on as small as 2,000 sq ft or on multi-acre land plots."
      },
      {
        "question": "Do you design wooden weekend villas?",
        "answer": "Yes, we design wooden weekend villa options using durable, weather-tested materials."
      },
      {
        "question": "Can I get weekend villa design drawings without full construction management?",
        "answer": "Yes, we offer drawing-only design packages as well as full PMC services."
      },
      {
        "question": "Can my weekend villa be listed on Airbnb?",
        "answer": "Yes, we can design private guest entry and lockable owner storage so it functions as a rental stay."
      },
      {
        "question": "What is the timeline for a weekend villa project?",
        "answer": "Design plans take 3–6 weeks; construction typically takes 4–9 months depending on size."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Weekend Villa Design Services | Getaway & Pool Villa Architects",
    "metaDescription": "Design your dream weekend villa or getaway stay with Anvitam. From simple 1 BHK designs to luxury pool villas. Free consultation available.",
    "metaKeywords": "weekend villa design, weekend villa design drawing, weekend villa getaway, 1 bhk weekend villa design, wooden weekend villa design, luxury weekend villa design",
    "metaRobots": "index, follow"
  },
  {
    "id": "wellness-retreat",
    "title": "Wellness & Yoga Retreats",
    "category": "Hospitality & Resorts",
    "description": "Build quiet, peaceful spaces for yoga, meditation, and healthy living using natural, non-toxic materials.",
    "valueProps": [
      "Yoga shala & meditation room design",
      "Masterplanning for retreat grounds",
      "3D renders & natural lighting plan",
      "Non-toxic material specifications",
      "Acoustics & quiet-zone planning",
      "Construction supervision (PMC)"
    ],
    "icon": "Heart",
    "heroImage": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "A wellness retreat must feel peaceful from the moment a guest steps in.",
      "We design open-air yoga shalas, meditation rooms, spa spaces, and peaceful guest rooms.",
      "We use natural materials — lime plaster, stone, clay, bamboo, and wood — that breathe and keep indoor air fresh.",
      "Every layout is designed for quiet sound insulation, soft natural light, and smooth movement between spaces.",
      "If you want a modern wellness center design or an eco-retreat, we design to match your healing philosophy."
    ],
    "whoItsFor": [
      "Yoga teachers & wellness founders",
      "Ayurveda & spa operators",
      "Landowners starting a retreat business",
      "Resort owners adding a wellness wing"
    ],
    "caseStudyId": "batukaru-yurt",
    "process": [
      {
        "title": "Healing Concept Study",
        "description": "We understand your wellness model (yoga, Ayurveda, detox, sound healing)."
      },
      {
        "title": "Masterplan & Layout",
        "description": "We zone shalas, rooms, kitchens, and gardens for complete quiet and privacy."
      },
      {
        "title": "3D Design & Lighting Plan",
        "description": "We plan natural sunlight, shadow, and soft lighting for calm environments."
      },
      {
        "title": "Material Selection",
        "description": "We pick chemical-free, non-toxic lime plasters, stone flooring, and natural timber."
      },
      {
        "title": "PMC & Site Build Guidance",
        "description": "We supervise local builders to ensure high-quality construction."
      },
      {
        "title": "Final Walkthrough",
        "description": "Your retreat is ready for guests, workshops, and wellness programs."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "What makes a retreat design different from a regular resort?",
        "answer": "Retreat designs prioritize silence, natural materials, air quality, natural light, and privacy."
      },
      {
        "question": "Do you design yoga shalas separately?",
        "answer": "Yes, we can design standalone yoga shalas or full multi-building wellness retreats."
      },
      {
        "question": "Why do you use lime plaster and stone in retreat architecture?",
        "answer": "Lime and stone keep rooms cool naturally, absorb moisture, and contain zero harmful chemicals."
      },
      {
        "question": "Can a wellness retreat be built on farm or forest land?",
        "answer": "Yes, farm and forest settings are ideal for nature-connected retreat spaces."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Wellness & Yoga Retreat Architecture | Eco Healing Center Designers",
    "metaDescription": "Design peaceful wellness retreats, yoga shalas, and healing centers with natural materials and eco-friendly plans. Contact Anvitam today.",
    "metaKeywords": "wellness retreat design, yoga retreat architecture, eco retreat design, wellness center design, natural building materials, healing space design",
    "metaRobots": "index, follow"
  },
  {
    "id": "eco-resort",
    "title": "Eco Resorts & Glamping",
    "category": "Hospitality & Resorts",
    "description": "Create eco-friendly resorts and glamping stays that give guests luxury comfort while protecting trees, soil, and wildlife.",
    "valueProps": [
      "Resort masterplan & cottage layout",
      "3D renders for guest cottages & dining",
      "Off-grid solar & water planning",
      "Zero-tree-loss placement map",
      "Local material sourcing guide",
      "Construction management (PMC)"
    ],
    "icon": "Map",
    "heroImage": "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Eco resort design builds luxury guest stays that fit into nature without cutting trees or ruining the soil.",
      "We design wooden cottages, bamboo stay huts, mud-brick villas, and luxury glamping tent setups.",
      "We incorporate off-grid systems — solar power, rainwater harvesting, and natural waste filtration.",
      "Guests love nature stays that look unique and feel responsible, earning higher rates and positive reviews.",
      "Whether you want an eco luxury resort design or a small glamping project, we design for high occupancy and low environmental impact."
    ],
    "whoItsFor": [
      "Tourism entrepreneurs & resort owners",
      "Landowners with scenic forest/hill land",
      "Hospitality groups expanding into eco-tourism",
      "Farmers adding glamping stays"
    ],
    "caseStudyId": "carpa-lupa",
    "process": [
      {
        "title": "Site & Eco Survey",
        "description": "We map existing trees, water channels, and slopes to protect natural land features."
      },
      {
        "title": "Masterplan & Cottage Placement",
        "description": "We plan guest stays, reception, dining, and pool areas for privacy and views."
      },
      {
        "title": "3D Resort Renders",
        "description": "Visualize your eco resort design before construction starts."
      },
      {
        "title": "Material & Off-Grid Setup",
        "description": "We specify local stone, bamboo, timber, solar grids, and bio-septic tanks."
      },
      {
        "title": "PMC & Site Supervision",
        "description": "We manage construction so building work does not damage surrounding nature."
      },
      {
        "title": "Launch Preparation",
        "description": "Your resort is handed over, ready for guests and photos."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "What is glamping design?",
        "answer": "Glamping design combines the outdoor experience of camping with high-end luxury interiors, private bathrooms, and decks."
      },
      {
        "question": "Can an eco resort run completely off-grid?",
        "answer": "Yes, with solar power, rainwater storage, and natural waste systems, your resort can function off-grid."
      },
      {
        "question": "Do eco resorts cost more to build than standard hotels?",
        "answer": "Not necessarily. Using local materials and lighter structures often reduces foundation and building costs."
      },
      {
        "question": "How long does an eco resort design take?",
        "answer": "Masterplanning and cottage designs take 4–8 weeks; building phase depends on project size."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Eco Resort & Glamping Design Services | Sustainable Hospitality Architects",
    "metaDescription": "Design eco-friendly resorts, luxury glamping setups, and nature cottages. Low environmental impact, high return on investment. Free consultation.",
    "metaKeywords": "eco resort design, glamping design, eco luxury resort design, sustainable resort architecture, nature stay design, off-grid resort design",
    "metaRobots": "index, follow"
  },
  {
    "id": "food-forest",
    "title": "Food Forests & Organic Orchards",
    "category": "Land & Gardens",
    "description": "Plant self-growing fruit trees, vegetables, and herbs layered like a natural forest for fresh organic food year-round.",
    "valueProps": [
      "Layered planting map (canopy to root)",
      "Rainwater swale & trench design",
      "Native fruit & herb plant selection",
      "Soil restoration strategy",
      "Planting supervision on site",
      "Long-term maintenance guide"
    ],
    "icon": "TreePine",
    "heroImage": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "A food forest design mimics a natural jungle to grow fresh organic food with minimal daily labor.",
      "Instead of single crops, we mix tall fruit trees, berry shrubs, herbal ground covers, root crops, and climbing vines.",
      "The plants protect each other, catch moisture, build rich topsoil, and keep pests away naturally.",
      "We design organic orchard layouts that look beautiful, produce fresh harvests, and attract birds and pollinators.",
      "If you want a food forest garden for your farmhouse, resort, or land, we create a step-by-step planting plan."
    ],
    "whoItsFor": [
      "Farmhouse owners wanting organic food",
      "Resorts offering farm-to-table dining",
      "Homesteaders & permaculture enthusiasts",
      "Institutions wanting edible landscapes"
    ],
    "caseStudyId": "vanvagado-farm",
    "process": [
      {
        "title": "Soil & Water Audit",
        "description": "We test soil, water availability, and sunshine across your land."
      },
      {
        "title": "Water Trenching & Swales",
        "description": "We design earthworks (swales, bunds) to trap rainwater directly into tree roots."
      },
      {
        "title": "Layered Plant Selection",
        "description": "We pick native fruit trees, shade trees, herbs, and soil-building plants."
      },
      {
        "title": "Masterplan & Planting Map",
        "description": "You receive a clear map showing exactly where every tree and plant goes."
      },
      {
        "title": "Planting Supervision",
        "description": "We guide your team during soil prep, compost addition, and tree planting."
      },
      {
        "title": "Care & Harvest Guide",
        "description": "Simple instructions on mulching, pruning, and harvesting your food forest."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "What is the difference between a food forest and a normal orchard?",
        "answer": "A food forest has multiple plant layers working together like a jungle, requiring less watering and zero chemical sprays."
      },
      {
        "question": "How long does it take for a food forest to produce food?",
        "answer": "Herbs and vegetables produce in weeks; fruit trees start giving yields in 1–3 years."
      },
      {
        "question": "Can I plant a food forest on small land?",
        "answer": "Yes! Food forest gardens can be designed on a 1,000 sq ft backyard or a 10-acre farm."
      },
      {
        "question": "Does a food forest need daily watering?",
        "answer": "No. Swales and thick leaf mulch store rainwater, cutting water needs by up to 70%."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Food Forest Design & Organic Orchard Services | Permaculture Land Planners",
    "metaDescription": "Create self-sustaining food forests and organic orchards with Anvitam. Grow fresh fruits, herbs, and veggies naturally. Book a consultation.",
    "metaKeywords": "food forest design, food forest garden, organic orchard design, permaculture food forest, syntropic farming plan, fruit forest layout",
    "metaRobots": "index, follow"
  },
  {
    "id": "agrotourism",
    "title": "Agrotourism & Farm Visits",
    "category": "Hospitality & Resorts",
    "description": "Turn your working farm into an inviting destination where visitors tour, pick fresh produce, learn, and stay overnight.",
    "valueProps": [
      "Farm masterplan & visitor zoning",
      "Walking trail & activity layout",
      "Farm stay cottage designs",
      "Farm-to-table dining setup",
      "Visitor safety & flow planning",
      "Construction management (PMC)"
    ],
    "icon": "Map",
    "heroImage": "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Agrotourism design helps farm owners earn extra revenue by opening their land to city visitors and families.",
      "We design safe visitor pathways, tasting pavilions, farm-to-table dining areas, and guest stay cottages.",
      "We keep guest areas separate from tractor routes and heavy farm work so your daily farming runs smoothly.",
      "Activities like fruit picking, animal feeding, organic farming workshops, and farm stay visits attract repeat guests.",
      "Whether you need an agritourism business plan design or full site architecture, we help turn your farm into a destination."
    ],
    "whoItsFor": [
      "Organic farm owners",
      "Agricultural land owners",
      "Rural entrepreneurs wanting extra revenue",
      "Farming cooperatives & NGOs"
    ],
    "caseStudyId": "vanvagado-farm",
    "process": [
      {
        "title": "Farm Audit & Zoning",
        "description": "We visit your farm and map farming zones versus safe visitor zones."
      },
      {
        "title": "Masterplan & Path Design",
        "description": "We design walking trails, farm shops, dining gazebos, and parking."
      },
      {
        "title": "Visitor Cottage Design",
        "description": "We create rustic, comfortable stay cottages for overnight guests."
      },
      {
        "title": "3D Layout Renders",
        "description": "Visualize the farm visit setup before building."
      },
      {
        "title": "PMC & Site Supervision",
        "description": "We guide local workers in constructing pathways, huts, and farm shops."
      },
      {
        "title": "Launch Support",
        "description": "Your farm is ready for tour bookings, workshops, and guests."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "What is agrotourism?",
        "answer": "Agrotourism combines agriculture and tourism, allowing visitors to experience farm life, buy fresh produce, and stay overnight."
      },
      {
        "question": "Will visitors disrupt my daily farm work?",
        "answer": "No. Our zoning designs keep guest paths safely separated from daily machinery and farming tasks."
      },
      {
        "question": "How much land do I need for agrotourism?",
        "answer": "Agrotourism setups can start on 1–2 acres up to large multi-acre farm estates."
      },
      {
        "question": "Can agrotourism generate year-round income?",
        "answer": "Yes, through farm stays, seasonal harvest events, school visits, and weekend farm-to-table dining."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Agrotourism Design Services | Farm Visit & Agri Stay Architects",
    "metaDescription": "Turn your farm into a profitable agrotourism destination with visitor paths, farm stays, and dining setups. Contact Anvitam today.",
    "metaKeywords": "agrotourism design, agritourism business plan, farm stay architecture, agri tourism project, farm visit layout, rural tourism design",
    "metaRobots": "index, follow"
  },
  {
    "id": "landscape-design",
    "title": "Landscape & Yard Planning",
    "category": "Land & Gardens",
    "description": "Transform empty yards or fields into green outdoor spaces with shade trees, walking paths, seating, and native flowers.",
    "valueProps": [
      "Master landscape plan & layout",
      "3D yard renders & lighting map",
      "Native plant selection guide",
      "Rainwater drainage & swale plan",
      "Hardscape (stone, paving) details",
      "Site supervision for execution"
    ],
    "icon": "TreePine",
    "heroImage": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Landscape design turns raw land or bare yards into beautiful, functional outdoor spaces.",
      "We design walkways, outdoor seating, shade pergolas, lawns, and native flower beds.",
      "We choose plants that thrive in your local climate, requiring minimal water and zero chemical fertilizers.",
      "Our plans manage rainwater runoff, preventing mud and pooling during heavy rains.",
      "Whether you need front yard landscape design, backyard planning, or farm yard layouts, we create clear drawings."
    ],
    "whoItsFor": [
      "Homeowners with empty front or back yards",
      "Farmhouse owners wanting structured green spaces",
      "Commercial offices & resort properties",
      "Institutions wanting sustainable grounds"
    ],
    "caseStudyId": "shalimar",
    "process": [
      {
        "title": "Site & Soil Analysis",
        "description": "We study land slopes, soil quality, sunlight, and water movement."
      },
      {
        "title": "Landscape Concept Plan",
        "description": "We sketch pathways, lawns, flower beds, trees, and seating areas."
      },
      {
        "title": "3D Landscape Renders",
        "description": "See how your yard will look with trees, plants, and lights."
      },
      {
        "title": "Plant & Material Map",
        "description": "Detailed list of local plants, stone pavers, and outdoor lighting."
      },
      {
        "title": "Execution Supervision",
        "description": "We guide gardeners and masons during planting and hardscaping."
      },
      {
        "title": "Final Walkthrough",
        "description": "Your green, beautiful yard is ready to enjoy."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Why use native plants in landscape design?",
        "answer": "Native plants need less water, withstand local weather, and grow healthy without chemical sprays."
      },
      {
        "question": "Do you design small front yards?",
        "answer": "Yes, we design everything from small front yards to multi-acre land plots."
      },
      {
        "question": "How do your designs handle heavy rain?",
        "answer": "We integrate natural swales, gravel channels, and soak pits so rainwater waters your plants instead of flooding."
      },
      {
        "question": "Can I get landscape design drawings online?",
        "answer": "Yes, we provide full digital landscape plans and planting maps remotely."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Landscape & Yard Design Services | Yard Planning & Garden Architects",
    "metaDescription": "Transform your yard with eco-friendly landscape design, native plants, walking paths, and outdoor seating. Get a free consultation.",
    "metaKeywords": "landscape design, yard planning, front yard landscape design, eco landscape architecture, garden masterplan, native plant landscaping",
    "metaRobots": "index, follow"
  },
  {
    "id": "terrace-garden",
    "title": "Terrace & Balcony Gardens",
    "category": "Land & Gardens",
    "description": "Turn your rooftop or balcony into a lush green garden with fresh vegetables, shade plants, and cozy seating.",
    "valueProps": [
      "Rooftop layout & seating plan",
      "3D renders of terrace space",
      "Safe waterproofing & drainage detail",
      "Lightweight soil & plant selection",
      "Drip irrigation layout",
      "Installation supervision on site"
    ],
    "icon": "Sprout",
    "heroImage": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "A terrace garden design turns hot concrete roofs into cool, peaceful green spaces.",
      "We design lightweight planter boxes, shade pergolas, seating corners, and rooftop vegetable beds.",
      "We use lightweight soil mixes and proper drainage layers so your roof stays 100% leak-proof and safe.",
      "Plants on your roof absorb heat, keeping the rooms directly below much cooler during summer.",
      "Whether you want a terrace garden design for a home, apartment balcony, or rooftop cafe, we design to match."
    ],
    "whoItsFor": [
      "Apartment & villa owners with terrace access",
      "City residents wanting home-grown organic veggies",
      "Rooftop cafes & office buildings",
      "Anyone wanting a cooler, greener roof"
    ],
    "caseStudyId": "shalimar",
    "process": [
      {
        "title": "Roof Structure & Safety Check",
        "description": "We check load capacity, sun exposure, and existing waterproofing."
      },
      {
        "title": "Layout & Seating Plan",
        "description": "We map planter positions, shade pergolas, paths, and sitting areas."
      },
      {
        "title": "3D Terrace Render",
        "description": "Preview your rooftop garden layout in 3D before buying plants."
      },
      {
        "title": "Lightweight Soil & Plant Selection",
        "description": "We select hardy plants, herbs, and light coco-peat soil mixes."
      },
      {
        "title": "Installation Guidance",
        "description": "We supervise planter setup, drip irrigation, and plant arrangement."
      },
      {
        "title": "Handover",
        "description": "Your private rooftop garden is ready to enjoy."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Will a terrace garden cause water leakage?",
        "answer": "No. We use raised planter beds and proper drainage mats so water drains safely without affecting the slab."
      },
      {
        "question": "Can a roof hold the weight of a garden?",
        "answer": "Yes. We use specialized lightweight potting mixes (coco-peat, compost) instead of heavy topsoil."
      },
      {
        "question": "Can I grow vegetables on my terrace?",
        "answer": "Yes! Tomatoes, leafy greens, peppers, herbs, and small fruit trees grow very well on sunny terraces."
      },
      {
        "question": "Does a terrace garden cool the house?",
        "answer": "Yes, soil and plants block direct sun, lowering indoor temperatures in rooms below by 2–5°C."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Terrace & Balcony Garden Design Services | Rooftop Garden Architects",
    "metaDescription": "Turn your roof or balcony into a lush garden with lightweight planters, fresh veggies, and seating. Safe, leak-proof designs. Free consultation.",
    "metaKeywords": "terrace garden design, rooftop garden design, balcony garden setup, terrace vegetable garden, cool roof garden, lightweight planter design",
    "metaRobots": "index, follow"
  },
  {
    "id": "backyard-design",
    "title": "Backyard & Courtyard Gardens",
    "category": "Land & Gardens",
    "description": "Turn unused backyards and inner courtyards into private outdoor living rooms with stone patios, shade plants, and sitting spots.",
    "valueProps": [
      "Backyard layout & patio design",
      "3D renders of outdoor seating & lighting",
      "Privacy screening & hedge plan",
      "Natural pool / pond design (optional)",
      "Material & stone sourcing guide",
      "Construction supervision (PMC)"
    ],
    "icon": "Home",
    "heroImage": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Backyard garden design converts neglected space into a cozy outdoor room for relaxation, dining, and family time.",
      "We design central courtyards, stone patios, fire pit corners, shade trees, and climbing vines.",
      "We can also design chemical-free natural pools or koi ponds filtered naturally by water plants.",
      "Tall hedges, bamboo, and stone walls create complete privacy from neighbors.",
      "Whether you have a small backyard garden or a large villa courtyard, we make every square foot beautiful."
    ],
    "whoItsFor": [
      "Homeowners with empty backyards",
      "Villa & bungalow owners wanting central courtyards",
      "Families wanting private outdoor dining spaces",
      "Renovation projects updating old yards"
    ],
    "caseStudyId": "unique-school",
    "process": [
      {
        "title": "Space & Privacy Audit",
        "description": "We measure your backyard and note sun, wind, and neighbor views."
      },
      {
        "title": "Concept & Patio Plan",
        "description": "We layout stone sitting areas, plant beds, water features, and lighting."
      },
      {
        "title": "3D Backyard Visuals",
        "description": "Walk through your future backyard garden in 3D."
      },
      {
        "title": "Plant & Stone Pick",
        "description": "We choose long-lasting local stone pavers, shade plants, and privacy hedges."
      },
      {
        "title": "Execution Supervision",
        "description": "We guide masons and gardeners through patio laying and planting."
      },
      {
        "title": "Handover",
        "description": "Your private outdoor living space is ready."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Can you design small backyards?",
        "answer": "Yes! We specialize in maximizing small backyards with smart seating, vertical gardens, and mirrors."
      },
      {
        "question": "What is a natural courtyard pool?",
        "answer": "A natural pool uses plants and gravel beds to filter water clean — zero chlorine, zero chemicals."
      },
      {
        "question": "How do you create privacy in backyards?",
        "answer": "We use natural bamboo screens, tall hedges, pergolas, and climbing vines."
      },
      {
        "question": "What materials do you use for backyard patios?",
        "answer": "We use natural local stone, gravel, terracotta tiles, and weather-tested wood."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Backyard & Courtyard Garden Design | Outdoor Living Space Architects",
    "metaDescription": "Create private backyard gardens, stone patios, and courtyard sitting spaces with Anvitam. Beautiful, low-maintenance plans. Book a consultation.",
    "metaKeywords": "backyard garden design, courtyard design, outdoor patio plan, small backyard design, natural pool design, privacy hedge garden",
    "metaRobots": "index, follow"
  },
  {
    "id": "permaculture-design",
    "title": "Permaculture & Land Masterplanning",
    "category": "Land & Gardens",
    "description": "Plan your entire land plot so water flows safely, soil gets richer, and buildings, roads, and food forests fit naturally together.",
    "valueProps": [
      "Full site contour & water flow map",
      "Building, road & orchard zoning plan",
      "3D land masterplan visualization",
      "Rainwater dam & swale engineering",
      "Soil restoration & planting roadmap",
      "On-site execution supervision (PMC)"
    ],
    "icon": "Sprout",
    "heroImage": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Permaculture land masterplanning is the smart way to layout multi-acre land plots so nature does most of the heavy lifting.",
      "We study sun, wind, rain, slope, and soil before deciding where houses, roads, ponds, and orchards belong.",
      "We design earthworks (swales, dams) that catch and store millions of liters of rainwater directly on your land.",
      "Buildings are placed for passive cooling, reducing lifelong energy and water bills.",
      "Whether you have a 1-acre farm plot or a 50-acre estate, a permaculture masterplan protects your investment."
    ],
    "whoItsFor": [
      "Multi-acre land & farm plot owners",
      "Retreat & eco-resort developers",
      "Homesteaders & organic farmers",
      "Real estate developers planning green projects"
    ],
    "caseStudyId": "vanvagado-farm",
    "process": [
      {
        "title": "Site Reading & Contour Mapping",
        "description": "We analyze elevation, sun path, wind direction, and soil health."
      },
      {
        "title": "Water & Access Zoning",
        "description": "We design roads, water harvesting dams, and swale channels first."
      },
      {
        "title": "Building & Farm Placement",
        "description": "We zone houses, animal areas, food forests, and green zones."
      },
      {
        "title": "3D Masterplan Visuals",
        "description": "See your full land layout in detailed 3D masterplan maps."
      },
      {
        "title": "Phase-by-Phase Roadmap",
        "description": "A step-by-step building guide so you can develop land over time."
      },
      {
        "title": "On-Site PMC & Supervision",
        "description": "We guide earthmovers, masons, and planters during execution."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "What is permaculture land masterplanning?",
        "answer": "It is designing land using natural patterns so water, soil, plants, and buildings work together efficiently."
      },
      {
        "question": "When should I get a permaculture masterplan?",
        "answer": "Before building any house, road, or wall — planning first saves huge costs and prevents land damage."
      },
      {
        "question": "How does permaculture catch rainwater?",
        "answer": "We use swales (contour trenches), ponds, and keyline channels that direct rain into topsoil."
      },
      {
        "question": "Can permaculture be applied to farmhouses and resorts?",
        "answer": "Yes! It is the foundation for sustainable farmhouses, eco resorts, and rural retreat estates."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Permaculture Land Masterplanning | Sustainable Farm & Land Planners",
    "metaDescription": "Masterplan your land with permaculture swales, water harvesting, food forests, and eco-building zones. Contact Anvitam for a free consultation.",
    "metaKeywords": "permaculture masterplanning, land masterplan design, permaculture land design, water harvesting land plan, farm layout planning, contour swale design",
    "metaRobots": "index, follow"
  },
  {
    "id": "farm-retreat",
    "title": "Farm Retreats & Farmhouses",
    "category": "Homes & Retreats",
    "description": "Build a cozy farmhouse or weekend farm retreat that fits your land, stays cool naturally, and feels peaceful.",
    "valueProps": [
      "Farmhouse floor plan & elevation",
      "3D interior & exterior renders",
      "Passive cooling & shade design",
      "Solar & rainwater integration",
      "Structural & utility drawings",
      "Construction management (PMC)"
    ],
    "icon": "Home",
    "heroImage": "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Farm retreat architecture blends cozy home living with the open beauty of farm land.",
      "We design farmhouses with wide verandas, courtyard gardens, stone walls, and high shaded roofs.",
      "We use passive solar design — placing windows and roofs to catch cool breezes and block summer heat.",
      "We connect your farmhouse directly to surrounding food forests, outdoor dining spots, and water ponds.",
      "From modern farmhouse designs to traditional village farm stays, we cover design drawings and full construction."
    ],
    "whoItsFor": [
      "Families building weekend farmhouses",
      "Retirees settling on farm land",
      "Landowners starting farm stays",
      "Investors building rural retreats"
    ],
    "caseStudyId": "carpa-lupa",
    "process": [
      {
        "title": "Land Visit & Orientation",
        "description": "We pick the best house location for light, breeze, and land views."
      },
      {
        "title": "Architectural Layout Plan",
        "description": "Floor plans with spacious verandas, living areas, and cozy bedrooms."
      },
      {
        "title": "3D Farmhouse Renders",
        "description": "Walk through your farmhouse design in 3D before building."
      },
      {
        "title": "Off-Grid & Water Planning",
        "description": "Integrating solar power, rainwater tanks, and waste recycling."
      },
      {
        "title": "PMC & Site Supervision",
        "description": "We manage local builders to ensure sturdy, high-quality construction."
      },
      {
        "title": "Handover",
        "description": "Your farmhouse retreat is ready for relaxing and hosting."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "What is passive cooling in farmhouse design?",
        "answer": "Using high roofs, stone walls, wide verandas, and wind paths to keep rooms cool naturally without heavy AC."
      },
      {
        "question": "Do you design off-grid farmhouses?",
        "answer": "Yes, we design farmhouses with solar power, rainwater harvesting, and bio-septic tanks."
      },
      {
        "question": "How much does a farmhouse design plan cost?",
        "answer": "Costs depend on square footage and scope — we offer drawing plans as well as full PMC."
      },
      {
        "question": "Can a farmhouse be built using local stone and lime?",
        "answer": "Yes! Stone and lime create beautiful, breathable, long-lasting farmhouses."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Farmhouse Design Services | Sustainable Farm Retreat Architects",
    "metaDescription": "Design eco-friendly farmhouses and farm retreats with wide verandas, natural cooling, and garden views. Get a free consultation.",
    "metaKeywords": "farmhouse design, farm retreat architecture, sustainable farmhouse design, passive cooling farmhouse, modern farmhouse plan, off-grid farmhouse",
    "metaRobots": "index, follow"
  },
  {
    "id": "airbnb",
    "title": "Airbnb & Rental Stays",
    "category": "Hospitality & Resorts",
    "description": "Stand out on rental platforms. We design beautiful, easy-to-clean rental cottages that guests love to book and review.",
    "valueProps": [
      "Cottage floor plan & photo-spot layout",
      "3D renders for guest listing photos",
      "Low-maintenance material selection",
      "Privacy & outdoor deck planning",
      "Construction management (PMC)",
      "Listing & photo setup advice"
    ],
    "icon": "Home",
    "heroImage": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Airbnb design creates unique vacation stay cottages that get high clicks, strong nightly rates, and 5-star reviews.",
      "We design photogenic outdoor decks, cozy bedrooms, open-air shower spots, and scenic window views.",
      "We select tough, stain-resistant materials so cleaning between check-ins is fast and low cost.",
      "Whether you are building a single A-frame cabin, container stay, wooden hut, or villa rental, we design for high return.",
      "We also assist with interior styling and Airbnb listing photos setup to attract bookings immediately."
    ],
    "whoItsFor": [
      "Landowners starting an Airbnb business",
      "Hosts upgrading existing rental stays",
      "Vacation property investors",
      "Farm stay operators wanting rental income"
    ],
    "caseStudyId": "carpa-lupa",
    "process": [
      {
        "title": "Market & Concept Study",
        "description": "We analyze nearby rentals so your property offers a unique experience."
      },
      {
        "title": "Stay Layout & Photo-Spots",
        "description": "Floor plans designed for guest comfort and Instagram-worthy photos."
      },
      {
        "title": "3D Cottage Renders",
        "description": "Preview every room and deck design in 3D."
      },
      {
        "title": "Material & Finish Pick",
        "description": "Stain-resistant flooring, durable furniture, and low-upkeep finishes."
      },
      {
        "title": "PMC & Site Build Guidance",
        "description": "We manage construction so your rental opens quickly."
      },
      {
        "title": "Listing Setup Guidance",
        "description": "Guidance on photos, amenities, and setting up your host listing."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Why hire an architect for an Airbnb stay?",
        "answer": "Unique architecture gets up to 3x more clicks, higher booking rates, and top nightly prices."
      },
      {
        "question": "How do you design for fast cleaning?",
        "answer": "We avoid dust-trapping corners, use stain-proof floors, and plan efficient laundry flow."
      },
      {
        "question": "Can a small land plot fit an Airbnb stay?",
        "answer": "Yes! Small cottages, A-frame cabins, and tiny homes fit easily on small plots."
      },
      {
        "question": "What is the return on investment for rental stays?",
        "answer": "Well-designed stays often recover build costs within 18–36 months of operation."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Airbnb & Rental Stay Architecture | Vacation Cottage Designers",
    "metaDescription": "Design high-revenue Airbnb stays, A-frame cabins, and rental cottages with Anvitam. Designed for 5-star reviews and fast payback.",
    "metaKeywords": "airbnb design, rental stay architecture, vacation cottage design, a-frame cabin plan, high revenue airbnb design, tiny home stay design",
    "metaRobots": "index, follow"
  },
  {
    "id": "community-center",
    "title": "Community & Activity Centers",
    "category": "Hospitality & Resorts",
    "description": "Build open, friendly spaces for workshops, learning, and health using natural light and durable local materials.",
    "valueProps": [
      "Open Gathering - Large, flexible halls for workshops and events",
      "Bright & Airy - Generous windows for natural light and fresh ventilation",
      "Eco-Friendly - Rainwater collection tanks and green roofs",
      "Built to Last - Tough, low-maintenance materials for public use"
    ],
    "icon": "Building",
    "heroImage": "https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Community spaces bring people together. We design bright halls, activity rooms, and outdoor courtyards where people learn, work, and celebrate.",
      "Our designs use natural ventilation and rainwater harvesting so running expenses stay low for schools, clubs, and organizations."
    ],
    "whoItsFor": [
      "Schools & educational institutions",
      "NGOs & non-profit organizations",
      "Community leaders"
    ],
    "caseStudyId": "unique-school",
    "process": [
      {
        "title": "Community Input",
        "description": "Understanding the activities and workshops the center will host."
      },
      {
        "title": "Building Layout",
        "description": "Designing flexible halls, classrooms, and courtyard gardens."
      },
      {
        "title": "Green Features",
        "description": "Adding rainwater storage and solar lighting."
      },
      {
        "title": "Safe Delivery",
        "description": "Creating durable, safe spaces for all age groups."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Can these spaces handle daily public use?",
        "answer": "Yes! We use tough, natural materials that withstand daily heavy use."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Community & Activity Center Architecture | Anvitam Studio",
    "metaDescription": "Eco-friendly community center design, activity halls, and campus space planning by Anvitam.",
    "metaKeywords": "community center design, activity center architecture, eco friendly campus design, school space planning",
    "metaRobots": "index, follow"
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

export const INITIAL_BLOGS: BlogPost[] = [];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 't1',
    name: 'Archana Gavas',
    role: 'Principal Architect, Founder',
    // Updated image link
    image: '/archana.webp',
    bio: 'Architect & Permaculture Designer helping landowners turn empty land into beautiful farmhouses, eco-resorts, and food forests.',
    linkedin: 'https://www.linkedin.com/in/archana-gavas/'
  },
];

export const AWARDS: Award[] = []; 

export const TESTIMONIALS: Testimonial[] = INITIAL_TESTIMONIALS;

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