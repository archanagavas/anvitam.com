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
    "id": "architecture-consultation",
    "title": "Architecture & Design Consultation",
    "category": "Consultation",
    "order": 1,
    "description": "Expert architecture, land planning, and design guidance in person or online before committing to a full build.",
    "valueProps": [
      "Expert 1-on-1 Design Session",
      "Site & Land Analysis (Soil, Light & Slope)",
      "Budget & Feasibility Audit",
      "Actionable Step-by-Step Design Roadmap",
      "Material & Microclimate Guidance",
      "Online or On-Site Delivery"
    ],
    "icon": "PenTool",
    "heroImage": "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Get direct, professional architectural and ecological land planning advice tailored to your property goals.",
      "Whether you are purchasing land, building a farmhouse, or designing an eco-resort, an initial design consultation gives you total clarity before committing major capital.",
      "We review site contours, solar orientation, local regulations, and spatial layouts to formulate a practical execution plan."
    ],
    "whoItsFor": [
      "Landowners planning a new project",
      "Property developers and hospitality hosts",
      "Families building farmhouses or weekend villas"
    ],
    "caseStudyId": "vanvagado-farm",
    "process": [
      {
        "title": "Pre-Session Brief",
        "description": "Reviewing site location, contour maps, and project ambitions."
      },
      {
        "title": "1-on-1 Consultation",
        "description": "In-depth review of spatial planning, bioclimatic orientation, and materials."
      },
      {
        "title": "Actionable Roadmap",
        "description": "Delivered summary report with clear next steps and budget framework."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "What is covered in an architectural consultation?",
        "answer": "We analyze site conditions, orientation, space requirements, budget estimates, and building regulations."
      },
      {
        "question": "Can consultation be conducted remotely?",
        "answer": "Yes! We conduct online design consultations globally using site photos, drone footage, and maps."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Architecture & Design Consultation | Anvitam Studio",
    "metaDescription": "1-on-1 online and on-site architecture design consultations by Anvitam.",
    "metaKeywords": "architecture consultation, design consultation, land planning, eco architect guidance",
    "metaRobots": "index, follow"
  },
  {
    "id": "airbnb",
    "title": "Airbnb & Rental Stays",
    "category": "Hospitality & Resorts",
    "order": 2,
    "description": "High-yield short-stay cottages and villas crafted for unforgettable guest experiences and simple host operations.",
    "valueProps": [
      "Immersive, photogenic architecture",
      "Layouts optimized for quick turnaround cleaning",
      "Durable, natural material specifications",
      "Guest experience & amenity planning",
      "3D Renders & interior styling",
      "Listing photo optimization guidance"
    ],
    "icon": "Home",
    "heroImage": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "An Airbnb operates as a micro-hotel requiring distinct spatial character and hospitality logistics.",
      "We design short-stay properties that stand out on booking platforms while choosing materials that simplify host maintenance.",
      "Every layout balances guest privacy, scenic views, and high operational efficiency."
    ],
    "whoItsFor": [
      "Property owners launching boutique stays",
      "Real estate investors targeting high rental yields",
      "Hosts wanting low-maintenance luxury cottages"
    ],
    "caseStudyId": "carpa-lupa",
    "process": [
      {
        "title": "Market & Site Brief",
        "description": "Analyzing target guest persona and site highlights."
      },
      {
        "title": "Spatial Strategy",
        "description": "Maximizing views, indoor-outdoor flow, and room layout."
      },
      {
        "title": "Material & Interior Selection",
        "description": "Durable, beautiful natural materials that resist wear."
      },
      {
        "title": "Execution Packet",
        "description": "Complete drawings for fast, accurate construction."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Why is specialized design important for an Airbnb?",
        "answer": "Properties designed specifically for guest stay psychology command higher night rates and 5-star reviews."
      },
      {
        "question": "How does your design reduce cleaning time?",
        "answer": "We select flush joinery, stain-resistant natural plasters, and smart storage layouts."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Airbnb & Rental Cottage Design Architect | Anvitam",
    "metaDescription": "Boutique Airbnb architecture and rental cottage design for high rental yields.",
    "metaKeywords": "airbnb design architect, rental cottage layout, eco stay design, boutique hospitality architecture",
    "metaRobots": "index, follow"
  },
  {
    "id": "food-forest",
    "title": "Food Forests & Organic Orchards",
    "category": "Land & Gardens",
    "order": 3,
    "description": "Regenerative multi-layered agriculture that mimics wild ecosystems to transform land into self-sustaining abundance.",
    "valueProps": [
      "7-Layer perennial ecosystem design",
      "Rainwater harvesting & swale planning",
      "Soil microbiology rehabilitation",
      "Zero-waste nutrient cycling",
      "High-yield organic crop selection",
      "Phased planting & guild guides"
    ],
    "icon": "TreePine",
    "heroImage": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "A food forest is an agricultural system that mimics natural woodland layers to grow fruit, nuts, herbs, and timber with minimal labor.",
      "Instead of monoculture farming requiring heavy chemical inputs, we design plant guilds that feed and protect each other naturally.",
      "Once established, a food forest generates high yields year after year while enriching topsoil and storing rainwater."
    ],
    "whoItsFor": [
      "Farmhouse owners wanting productive land",
      "Eco-resort developers integrating farm-to-table dining",
      "Landowners rehabilitating degraded soil"
    ],
    "caseStudyId": "vanvagado-farm",
    "process": [
      {
        "title": "Site & Soil Analysis",
        "description": "Assessing microclimate, soil composition, and water flow."
      },
      {
        "title": "Earthworks Design",
        "description": "Planning swales, ponds, and hydration channels."
      },
      {
        "title": "Guild & Plant Selection",
        "description": "Curating species for canopy, sub-canopy, shrub, and groundcover layers."
      },
      {
        "title": "Implementation Plan",
        "description": "Step-by-step planting schedule and pioneer species kickstart."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "How long does a food forest take to establish?",
        "answer": "Initial harvests begin in year 1; canopy abundance matures fully within 3 to 5 years."
      },
      {
        "question": "Does a food forest require continuous irrigation?",
        "answer": "Our designs incorporate passive swales and mulch layers that drastically cut water demand."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Food Forest & Permaculture Masterplan Design | Anvitam Studio",
    "metaDescription": "Regenerative food forest design, soil repair, and organic orchard planning by Anvitam.",
    "metaKeywords": "food forest design, permaculture masterplan, organic orchard planning, soil rehabilitation",
    "metaRobots": "index, follow"
  },
  {
    "id": "interior-design",
    "title": "Interior Design & Spatial Styling",
    "category": "Homes & Retreats",
    "order": 4,
    "description": "End-to-end interior architecture and styling for homes, villas, farmhouses, and boutique stays using natural, high-performance materials.",
    "valueProps": [
      "Biophilic interior space planning",
      "3D Interior Renders & Walkthroughs",
      "Custom furniture & joinery drawings",
      "Lime plaster, stone & timber finish selection",
      "Lighting & electrical layouts",
      "Comprehensive BOQ & material schedules"
    ],
    "icon": "Home",
    "heroImage": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "We design interior spaces that feel calm, tactile, and connected to the outdoors.",
      "Combining functional space planning, natural textures, and custom furniture details, we create interiors that age gracefully without feeling sterile.",
      "Our documentation packages include full 3D visualizations, joinery blueprints, and contractor-ready schedules."
    ],
    "whoItsFor": [
      "Homeowners & villa owners seeking custom interiors",
      "Boutique stay hosts aiming for distinctive guest rooms",
      "Farmhouse and eco-resort owners"
    ],
    "caseStudyId": "yourweb3guy",
    "process": [
      {
        "title": "Concept & Moodboard",
        "description": "Setting spatial palette, natural finishes, and mood."
      },
      {
        "title": "3D Renders & Layouts",
        "description": "Visualizing rooms with exact textures and lighting."
      },
      {
        "title": "Working Drawings",
        "description": "Contractor blueprints for furniture, joinery, and electricals."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Do you design interiors for eco-resorts and farmhouses?",
        "answer": "Yes! We specialize in low-VOC, breathable, earth-aligned interiors."
      },
      {
        "question": "What drawings are included?",
        "answer": "We supply 3D views, ceiling plans, joinery elevations, lighting diagrams, and material specs."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Interior Design & Biophilic Interior Architecture | Anvitam Studio",
    "metaDescription": "Natural interior design, 3D spatial visualization, and custom joinery planning by Anvitam.",
    "metaKeywords": "interior design architect, natural interior design, biophilic interiors, farmhouse interior design",
    "metaRobots": "index, follow"
  },
  {
    "id": "farm-retreat",
    "title": "Farm Retreats & Farmhouses",
    "category": "Homes & Retreats",
    "order": 5,
    "description": "Natural architecture for living farmhouses that sit gracefully on the land with passive cooling and organic integration.",
    "valueProps": [
      "Authentic farm masterplanning",
      "Bioclimatic natural architecture",
      "Passive solar & wind layout",
      "Indoor-outdoor courtyard integration",
      "Rainwater & greywater systems",
      "Builder supervision & site visits"
    ],
    "icon": "Home",
    "heroImage": "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "We design farmhouses that connect deeply with the surrounding fields and climate.",
      "Rather than imposing urban concrete boxes onto rural land, we build with natural stone, lime, and wood to create cool, airy sanctuaries.",
      "Every farm retreat integrates living water features, shade verandas, and gardens into a harmonious homestead."
    ],
    "whoItsFor": [
      "Families building weekend farmhouses",
      "Landowners creating private retreats",
      "Agricultural estate owners"
    ],
    "caseStudyId": "carpa-lupa",
    "process": [
      {
        "title": "Site Resonance",
        "description": "Reading sun paths, breezes, and soil topography."
      },
      {
        "title": "Architectural Design",
        "description": "Creating floor plans, elevations, and 3D perspectives."
      },
      {
        "title": "Detailed Drawings",
        "description": "Preparing complete builder packets for execution."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "How do your farmhouse designs stay cool naturally?",
        "answer": "We position verandas, courtyards, and high roofs to catch prevailing winds while shading walls."
      },
      {
        "question": "Can you help supervise local builders?",
        "answer": "Yes, we provide site visits and remote contractor guidance."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Farmhouse Architecture & Farm Retreat Design | Anvitam Studio",
    "metaDescription": "Natural farmhouse design and eco retreat architecture by Anvitam Studio.",
    "metaKeywords": "farmhouse architect, farm retreat design, natural home design, bioclimatic farmhouse",
    "metaRobots": "index, follow"
  },
  {
    "id": "homestay",
    "title": "Homestays & Guest Houses",
    "category": "Homes & Retreats",
    "order": 6,
    "description": "Warm, culturally rooted homestays designed to welcome guests while preserving host privacy and family life.",
    "valueProps": [
      "Host-guest privacy zoning",
      "Vernacular material palettes",
      "3D room renders & floor plans",
      "Energy & natural cooling strategies",
      "Low maintenance interior finishes",
      "Cost estimates & BOQ"
    ],
    "icon": "Home",
    "heroImage": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Homestay design turns extra land or family homes into cozy, authentic guest accommodations.",
      "We emphasize local craftsmanship and warm materials, crafting spaces that feel personal rather than corporate.",
      "Careful zoning ensures guest interaction and host privacy coexist effortlessly."
    ],
    "whoItsFor": [
      "Families opening heritage homestays",
      "Rural estate hosts",
      "Culture-focused hospitality entrepreneurs"
    ],
    "caseStudyId": "yourweb3guy",
    "process": [
      {
        "title": "Vernacular Study",
        "description": "Exploring local architectural heritage and native materials."
      },
      {
        "title": "Zoning & Layout",
        "description": "Separating private host living areas from guest suites."
      },
      {
        "title": "Finish & Styling",
        "description": "Selecting durable, authentic interior and garden elements."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "How is a homestay different from a resort?",
        "answer": "Homestays offer an intimate, local experience centered around host hospitality and regional architecture."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Homestay Design & Guest House Architecture | Anvitam Studio",
    "metaDescription": "Vernacular homestay design and guest house architecture by Anvitam Studio.",
    "metaKeywords": "homestay architect, guest house design, vernacular homestay, eco homestay",
    "metaRobots": "index, follow"
  },
  {
    "id": "weekend-villa",
    "title": "Weekend Villas & Getaways",
    "category": "Homes & Retreats",
    "order": 7,
    "description": "Sanctuary homes designed for restful escapes with open courtyards, natural ventilation, and low maintenance requirement.",
    "valueProps": [
      "Biophilic architectural design",
      "Solar passive thermal comfort",
      "Private pool & veranda integration",
      "Low-upkeep material selection",
      "3D Renders & structural plans",
      "Rental readiness strategy"
    ],
    "icon": "Home",
    "heroImage": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "A weekend villa should provide immediate decompression from urban noise.",
      "We design climate-responsive villas with generous outdoor living spaces, natural stone decks, and lush garden surrounds.",
      "Built with timeless materials, these homes require minimal maintenance when left unattended."
    ],
    "whoItsFor": [
      "Families building getaway residences",
      "Investors creating premium holiday rentals"
    ],
    "caseStudyId": "yourweb3guy",
    "process": [
      {
        "title": "Orientation & View Capture",
        "description": "Positioning spaces for sunset views and prevailing winds."
      },
      {
        "title": "3D Villa Design",
        "description": "Developing open-plan living, verandas, and bedrooms."
      },
      {
        "title": "Working Drawings",
        "description": "Full contractor execution blueprints."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Can the villa run off-grid?",
        "answer": "Yes, we integrate solar arrays, rainwater collection, and natural cooling."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Weekend Villa Design & Holiday Home Architect | Anvitam",
    "metaDescription": "Biophilic weekend villa architecture and luxury getaway design by Anvitam Studio.",
    "metaKeywords": "weekend villa design, holiday home architect, biophilic villa, eco getaway",
    "metaRobots": "index, follow"
  },
  {
    "id": "eco-resort",
    "title": "Eco Resorts & Glamping",
    "category": "Hospitality & Resorts",
    "order": 8,
    "description": "Regenerative masterplanning for luxury eco-resorts, glamping pods, and wellness sanctuaries built with zero ecological damage.",
    "valueProps": [
      "Zero-footprint masterplans",
      "Eco cabin & tent structure design",
      "Decentralized wastewater treatment",
      "Off-grid power & water loops",
      "Biodiversity landscape integration",
      "Resort amenity planning"
    ],
    "icon": "Map",
    "heroImage": "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "We create world-class eco-resorts where guest luxury enhances rather than damages the surrounding ecosystem.",
      "Masterplans include eco-cabins, central dining pavilions, natural pools, and walking trails.",
      "Systems operate on closed-loop principles for water, waste, and power."
    ],
    "whoItsFor": [
      "Hospitality groups & developers",
      "Pioneers of eco-tourism",
      "Resort investors seeking sustainable luxury"
    ],
    "caseStudyId": "carpa-lupa",
    "process": [
      {
        "title": "Ecological Mapping",
        "description": "Evaluating flora, contours, and drainage to protect fragile soil."
      },
      {
        "title": "Masterplan & Cabin Design",
        "description": "Designing light-touch cabins and shared amenities."
      },
      {
        "title": "System Loop Design",
        "description": "Integrating reedbed filtration, solar grids, and food gardens."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "What defines a true eco-resort?",
        "answer": "Closed-loop waste management, native materials, renewable energy, and ecological restoration."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Eco Resort Masterplan & Glamping Architecture | Anvitam Studio",
    "metaDescription": "Sustainable eco resort masterplanning and eco cabin design by Anvitam.",
    "metaKeywords": "eco resort design, glamping masterplan, sustainable hospitality architect, eco cabin design",
    "metaRobots": "index, follow"
  },
  {
    "id": "permaculture-design",
    "title": "Permaculture & Land Masterplanning",
    "category": "Land & Gardens",
    "order": 9,
    "description": "Designing with the land, not over it. Comprehensive masterplanning that aligns water cycles, soil, and buildings.",
    "valueProps": [
      "Topographical water flow maps",
      "Land zone & sector planning",
      "Soil repair & swale designs",
      "Bioclimatic structure placement",
      "Phased masterplan roadmaps",
      "CAD & GIS site maps"
    ],
    "icon": "Sprout",
    "heroImage": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Permaculture masterplanning reads the land to create resilient, self-maintaining property systems.",
      "We map water movement, wind paths, solar angles, and soil types to determine optimal building placements and planting zones.",
      "The result is a holistic site vision that yields fruit, conserves water, and cuts maintenance cost."
    ],
    "whoItsFor": [
      "New land buyers & farm owners",
      "Eco-village developers",
      "Institutions & retreat centers"
    ],
    "caseStudyId": "vanvagado-farm",
    "process": [
      {
        "title": "Site Reading",
        "description": "Reading slope, sun, wind, and water flow."
      },
      {
        "title": "Zone Strategy",
        "description": "Placing intense activity near living hubs and wilderness on outer edges."
      },
      {
        "title": "Masterplan Map",
        "description": "Delivering detailed masterplan drawings with phased roadmaps."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Why is a permaculture masterplan necessary before building?",
        "answer": "It prevents placing structures in flood paths, maximizes passive cooling, and reduces future earthwork costs."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Permaculture Land Masterplanning & Site Design | Anvitam",
    "metaDescription": "Ecological land masterplanning and permaculture site design by Anvitam Studio.",
    "metaKeywords": "permaculture masterplan, land design, site planning, rainwater harvesting plan",
    "metaRobots": "index, follow"
  },
  {
    "id": "wellness-retreat",
    "title": "Wellness & Yoga Retreats",
    "category": "Hospitality & Resorts",
    "order": 10,
    "description": "Healing space architecture crafted to lower cortisol with biophilic acoustics, yoga shalas, and non-toxic natural materials.",
    "valueProps": [
      "Acoustically calm yoga shala design",
      "Non-toxic, zero-VOC natural plasters",
      "Biophilic sensory landscaping",
      "Meditation & water garden features",
      "Retreat cabin masterplans",
      "Energy flow layout"
    ],
    "icon": "Heart",
    "heroImage": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "We design wellness centers that actively promote relaxation and physiological healing.",
      "Utilizing earth, lime, and timber, our architecture maintains natural humidity control and soft acoustics.",
      "From meditation pavilions to treatment rooms, spaces are tuned for deep restoration."
    ],
    "whoItsFor": [
      "Yoga teacher & wellness founders",
      "Holistic resort developers",
      "Retreat leaders creating fixed centers"
    ],
    "caseStudyId": "batukaru-yurt",
    "process": [
      {
        "title": "Modality Alignment",
        "description": "Understanding practice requirements for yoga, breathwork, or sound healing."
      },
      {
        "title": "Spatial Tuning",
        "description": "Selecting natural materials and natural light openings for calming ambience."
      },
      {
        "title": "Detailed Blueprints",
        "description": "Developing construction packets for shalas and therapy spaces."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Why are non-toxic materials critical for retreat design?",
        "answer": "Enclosed healing spaces require breathable, zero-VOC materials to foster true bodily restoration."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Wellness & Yoga Retreat Architecture | Anvitam Studio",
    "metaDescription": "Biophilic wellness retreat design and yoga shala architecture by Anvitam.",
    "metaKeywords": "wellness retreat architect, yoga shala design, healing architecture, biophilic retreat",
    "metaRobots": "index, follow"
  },
  {
    "id": "landscape-design",
    "title": "Landscape & Yard Planning",
    "category": "Land & Gardens",
    "order": 11,
    "description": "Ecological landscape design using native flora, stone pathways, and rainwater earthworks for resilient outdoor living.",
    "valueProps": [
      "Native drought-tolerant plant lists",
      "Swale & rainwater drainage design",
      "Outdoor seating & fire pit layouts",
      "Stone paving & hardscape details",
      "Irrigation & lighting plans",
      "3D garden renders"
    ],
    "icon": "TreePine",
    "heroImage": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "We move beyond decorative manicured lawns to build living outdoor ecosystems.",
      "By pairing native plants with intelligent water-capture earthworks, your yard stays green with minimal watering.",
      "Our designs create usable outdoor living rooms for relaxation and family gatherings."
    ],
    "whoItsFor": [
      "Villa & farmhouse owners",
      "Commercial properties wanting eco-landscaping",
      "Remote clients seeking global design plans"
    ],
    "caseStudyId": "shalimar",
    "process": [
      {
        "title": "Site & Drainage Survey",
        "description": "Mapping sunlight, soil quality, and runoff patterns."
      },
      {
        "title": "Hardscape & Plant Layout",
        "description": "Designing pathways, stone walls, and native plant beds."
      },
      {
        "title": "Planting Guide",
        "description": "Supplying plant species lists and installation drawings."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Does ecological landscape design reduce maintenance?",
        "answer": "Yes! Native species and passive water swales eliminate regular mowing and heavy watering."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Landscape & Ecological Yard Planning | Anvitam Studio",
    "metaDescription": "Native landscape design and ecological yard masterplanning by Anvitam.",
    "metaKeywords": "landscape design architect, yard planning, native plant landscaping, eco landscape",
    "metaRobots": "index, follow"
  },
  {
    "id": "agrotourism",
    "title": "Agrotourism & Farm Visits",
    "category": "Hospitality & Resorts",
    "order": 12,
    "description": "Designing working farm destinations that welcome visitors safely while boosting agricultural revenue streams.",
    "valueProps": [
      "Farm guest-flow choreography",
      "Safety zoning between machinery & visitors",
      "Farm-to-table pavilion design",
      "Visitor workshop & demo spaces",
      "Rustic guest cottage designs",
      "Revenue diversification guide"
    ],
    "icon": "Map",
    "heroImage": "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Agrotourism combines active agriculture with visitor education and hospitality.",
      "We design farm masterplans that keep agricultural operations safe while offering visitors memorable experiences.",
      "Features include farm shops, tasting pavilions, animal zones, and stay cabins."
    ],
    "whoItsFor": [
      "Working farms expanding into tourism",
      "Orchard owners",
      "Agricultural co-ops"
    ],
    "caseStudyId": "vanvagado-farm",
    "process": [
      {
        "title": "Farm Audit",
        "description": "Reviewing active farm routines and visitor touchpoints."
      },
      {
        "title": "Safety & Flow Zoning",
        "description": "Creating clear public trails away from heavy equipment."
      },
      {
        "title": "Architectural Nodes",
        "description": "Designing visitor hubs, farm stands, and dining spaces."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Will visitor access interfere with daily farming?",
        "answer": "No, our layout explicitly separates guest pathways from tractor routes and working fields."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Agrotourism Architecture & Farm Destination Design | Anvitam",
    "metaDescription": "Masterplanning for agrotourism destinations, farm stays, and farm visit hubs.",
    "metaKeywords": "agrotourism architect, farm visit design, eco farm masterplan, farm destination",
    "metaRobots": "index, follow"
  },
  {
    "id": "terrace-garden",
    "title": "Terrace & Balcony Gardens",
    "category": "Land & Gardens",
    "order": 13,
    "description": "Transforming urban rooftops into lush, food-producing shade sanctuaries with structural load safety.",
    "valueProps": [
      "Structural load-bearing checks",
      "Lightweight growth media selection",
      "Windbreak & shade canopy design",
      "Drip irrigation & drainage plans",
      "Rooftop veggie planter layouts",
      "Urban heat island reduction"
    ],
    "icon": "Sprout",
    "heroImage": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Terrace garden design turns hot concrete roofs into cool, productive living spaces.",
      "We ensure strict structural load limits and waterproofing safety before introducing soil and plants.",
      "Shade structures and wind barriers convert harsh rooftops into comfortable outdoor lounges."
    ],
    "whoItsFor": [
      "Urban apartment & penthouse owners",
      "Commercial office buildings",
      "City cafes & restaurants"
    ],
    "caseStudyId": "shalimar",
    "process": [
      {
        "title": "Structural Audit",
        "description": "Checking roof weight capacity and waterproofing."
      },
      {
        "title": "Microclimate Plan",
        "description": "Designing shade pergolas and wind-resistant plant layouts."
      },
      {
        "title": "Installation Drawings",
        "description": "Supplying planter details, soil specs, and irrigation lines."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Is a terrace garden safe for existing roof slabs?",
        "answer": "Yes, we specify engineered lightweight soil mixes and lightweight planters tailored to your structural limits."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Terrace Garden Design & Rooftop Landscaping | Anvitam Studio",
    "metaDescription": "Urban terrace garden design and lightweight rooftop masterplanning by Anvitam.",
    "metaKeywords": "terrace garden design, rooftop landscape architect, balcony garden design, urban farming",
    "metaRobots": "index, follow"
  },
  {
    "id": "backyard-design",
    "title": "Backyard & Courtyard Gardens",
    "category": "Land & Gardens",
    "order": 14,
    "description": "Converting domestic yards into serene biophilic retreats with native plantings, courtyards, and natural pools.",
    "valueProps": [
      "Biophilic courtyard layouts",
      "Permeable hardscapes & paths",
      "Chemical-free natural pool options",
      "Privacy screening with native plants",
      "3D courtyard visualizations",
      "Turnkey material specs"
    ],
    "icon": "Home",
    "heroImage": "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "We redesign residential backyards and internal courtyards to act as private outdoor living rooms.",
      "Focusing on natural stone, shade trees, and tranquil water features, we maximize privacy and natural light.",
      "Designs replace high-maintenance lawns with eco-friendly native gardens."
    ],
    "whoItsFor": [
      "Homeowners updating residential yards",
      "Families seeking private courtyard retreats"
    ],
    "caseStudyId": "unique-school",
    "process": [
      {
        "title": "Spatial Brief",
        "description": "Mapping family lifestyle needs and privacy goals."
      },
      {
        "title": "Courtyard Concept",
        "description": "Designing seating nooks, water features, and plant layers."
      },
      {
        "title": "Construction Drawings",
        "description": "Delivering detailed paving, lighting, and planting plans."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Can you design natural pools without chlorine?",
        "answer": "Yes! We specialize in biological swimming ponds that filter water through plants and gravel."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Backyard & Courtyard Garden Design | Anvitam Studio",
    "metaDescription": "Residential backyard design and courtyard landscape architecture by Anvitam.",
    "metaKeywords": "backyard garden design, courtyard architect, natural pool design, residential landscape",
    "metaRobots": "index, follow"
  },
  {
    "id": "community-center",
    "title": "Community & Activity Centers",
    "category": "Hospitality & Resorts",
    "order": 15,
    "description": "Resilient civic and community spaces designed for multi-generational gatherings, learning hubs, and cultural activity.",
    "valueProps": [
      "Multi-generational gathering layouts",
      "Daylighting & passive cooling",
      "Rainwater & eco-system integration",
      "Durable, upcycled material choices",
      "Accessible civic flow design",
      "3D spatial masterplans"
    ],
    "icon": "Building",
    "heroImage": "https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=1200&auto=format&fit=crop",
    "whatItIs": [
      "Community centers anchor local neighborhood life through inclusive, adaptable architecture.",
      "We design gathering halls, activity spaces, and educational pavilions that teach sustainability through their very construction.",
      "Materials are durable, natural, and low maintenance for long-term public use."
    ],
    "whoItsFor": [
      "NGOs & community trusts",
      "Municipalities & eco-villages",
      "Educational institutions"
    ],
    "caseStudyId": "unique-school",
    "process": [
      {
        "title": "Civic Needs Brief",
        "description": "Understanding community activities, gathering sizes, and accessibility."
      },
      {
        "title": "Flexible Spatial Design",
        "description": "Creating multi-use halls, open courtyards, and green edges."
      },
      {
        "title": "Masterplan Packet",
        "description": "Complete drawings ready for municipal review and construction."
      }
    ],
    "pricing": "Consult for Pricing",
    "faq": [
      {
        "question": "Can these community centers handle heavy daily usage?",
        "answer": "Yes! We utilize robust stone, earth-brick, and metal elements built to endure public use."
      }
    ],
    "bookingLink": "https://topmate.io/archanagavas",
    "metaTitle": "Community & Activity Center Architecture | Anvitam Studio",
    "metaDescription": "Eco-friendly community center design and activity hall architecture by Anvitam.",
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
    "id": "project-consultation-reports",
    "title": "Project Consultation Reports",
    "icon": "🌿",
    "desc": "If you are unsure if you should move forward on your project, take this without thinking.",
    "subs": [
      "Initial Consultation & Site Reading",
      "Development Consultation Report Site Clarity Report",
      "Detailed Feasibility & Strategy Report"
    ],
    "baseINR": [
      5000,
      10000,
      20000
    ]
  },
  {
    "id": "airbnb",
    "title": "Airbnb & Rental Cottage",
    "icon": "🏠",
    "desc": "High-yield short-stay design for guest rentals",
    "subs": [
      "Guest Market Study",
      "Room Layout & Flow Plan",
      "Interior Design Concept",
      "3D Renders",
      "Natural Material List",
      "Guest Experience Guide",
      "Photo Guide for Listing",
      "Pricing & Earnings Estimate"
    ],
    "baseINR": [
      12000,
      15000,
      20000,
      22000,
      10000,
      12000,
      8000,
      10000
    ]
  },
  {
    "id": "permaculture-design",
    "title": "Food Forest & Land Masterplan",
    "icon": "🌾",
    "desc": "Water harvesting, soil health & food forest layout",
    "subs": [
      "Site & Climate Check",
      "Land Zone Layout",
      "Master Plan Map",
      "Food Forest Design",
      "Rainwater Harvesting Plan",
      "Soil Health Plan",
      "Native Tree & Plant List",
      "Step-by-Step Planting Plan"
    ],
    "baseINR": [
      15000,
      12000,
      25000,
      18000,
      14000,
      10000,
      8000,
      12000
    ]
  },
  {
    "id": "interior-design",
    "title": "Interior Design",
    "icon": "🛋️",
    "desc": "End-to-end interior design for homes, apartments, villas, and weekend residences from space planning and material selection to detailed drawings and design documentation.",
    "subs": [
      "Initial Consultation & Site Reading",
      "Space Planning & Furniture Layout",
      "Concept & Moodboard",
      "3D Interior Views",
      "Detailed Interior Drawings",
      "Custom Furniture & Joinery Drawings",
      "Material & Finish Selection",
      "Lighting Design",
      "Kitchen & Wardrobe Design",
      "BOQ / Material Schedule",
      "Site Coordination / Design Support"
    ],
    "baseINR": [
      5000,
      15000,
      10000,
      20000,
      15000,
      20000,
      10000,
      5000,
      10000,
      20000,
      20000
    ]
  },
  {
    "id": "farm-retreat",
    "title": "Farmhouse & Farm Stay",
    "icon": "🏡",
    "desc": "Complete natural architecture for your farm home",
    "subs": [
      "Design Ideas & Mood Board",
      "Floor Plan & Room Layout",
      "3D Building Views",
      "Building Measurements",
      "Rainwater & Drainage Scheme",
      "Garden Integration Plan",
      "Detailed Material Cost List",
      "Project Budget Estimate"
    ],
    "baseINR": [
      10000,
      20000,
      15000,
      25000,
      8000,
      12000,
      18000,
      20000,
      15000
    ]
  },
  {
    "id": "homestay",
    "title": "Homestay & Eco Villa",
    "icon": "🏘️",
    "desc": "Vernacular & natural homestay architecture",
    "subs": [
      "Local Building Style Study",
      "Land & Site Layout",
      "Host & Guest Zone Plan",
      "Natural Materials Plan",
      "Floor Plans",
      "3D Building Views",
      "Cultural Design Features",
      "Material Cost Estimate"
    ],
    "baseINR": [
      12000,
      15000,
      10000,
      12000,
      18000,
      22000,
      8000,
      15000
    ]
  },
  {
    "id": "weekend-villa",
    "title": "Weekend Villa & Retreat",
    "icon": "🌄",
    "desc": "Comfortable luxury villa with natural cooling",
    "subs": [
      "Initial Design Concept",
      "Natural Cooling & Light Plan",
      "Exterior 3D Renders",
      "Interior 3D Renders",
      "Garden & Courtyard Layout",
      "Rental Potential Guide",
      "Complete Builder Drawings",
      "Material Cost List"
    ],
    "baseINR": [
      15000,
      20000,
      25000,
      25000,
      18000,
      12000,
      30000,
      20000
    ]
  },
  {
    "id": "eco-resort",
    "title": "Eco Resort & Wellness Center",
    "icon": "🌺",
    "desc": "Masterplan for eco resort cabins, amenities & land",
    "subs": [
      "Land & Climate Survey",
      "Complete Sustainable Masterplan",
      "Guest Cabin & Cottage Design",
      "Dining & Activity Hub Design",
      "Eco Wastewater System",
      "Solar Energy Plan",
      "Resort Landscape Design",
      "Detailed Construction Estimate"
    ],
    "baseINR": [
      20000,
      45000,
      30000,
      25000,
      18000,
      15000,
      30000,
      35000
    ]
  }
];