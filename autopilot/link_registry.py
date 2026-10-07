"""
Anvitam Internal Link Registry & Contextual Matching Engine.
Provides a comprehensive taxonomy of all real published URLs across Anvitam:
- Services (15)
- Projects & Case Studies (14)
- Technical Blogs & Guides (13+)
- Interactive Tools & Workshops (5)
- Regional Destination Pages (6)
- High-Value Conversion Anchors (2)

Enforces strict rules:
1. Contextual matching only: links are selected based on the specific paragraph concept, never randomly.
2. Natural anchor text: zero mechanical formulas ("click here", "for more info").
3. Self-updating: automatically scans published_records and constants.ts to keep this file perpetually up to date.
"""

import os
import re
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger("autopilot.link_registry")

# ── TAXONOMY_START ────────────────────────────────────────────────────────────
LINK_TAXONOMY = {
    "architecture_and_retreat_services": [
        {
            "title": "Community & Activity Centers",
            "url": "https://www.anvitam.com/services/community-center",
            "topics": [
                "community center",
                "community & activity centers"
            ],
            "suggested_anchors": [
                "Community & Activity Centers",
                "sustainable community & activity centers"
            ]
        },
        {
            "title": "Agrotourism & Farm Visits",
            "url": "https://www.anvitam.com/services/agrotourism",
            "topics": [
                "agrotourism",
                "agrotourism & farm visits"
            ],
            "suggested_anchors": [
                "Agrotourism & Farm Visits",
                "sustainable agrotourism & farm visits"
            ]
        },
        {
            "title": "Weekend Villas & Getaways",
            "url": "https://www.anvitam.com/services/weekend-villa",
            "topics": [
                "weekend villa",
                "villa architecture",
                "second home",
                "alibaug villa"
            ],
            "suggested_anchors": [
                "biophilic weekend villas",
                "architectural weekend home design"
            ]
        },
        {
            "title": "Farm Retreats & Farmhouses",
            "url": "https://www.anvitam.com/services/farm-retreat",
            "topics": [
                "farmhouse",
                "farm retreat",
                "rural estate",
                "courtyard house"
            ],
            "suggested_anchors": [
                "sustainable farm retreat architecture",
                "regenerative farmstay planning"
            ]
        },
        {
            "title": "Wellness & Yoga Retreats",
            "url": "https://www.anvitam.com/services/wellness-retreat",
            "topics": [
                "wellness retreat",
                "natural swimming pool",
                "living pool",
                "chlorine-free pool"
            ],
            "suggested_anchors": [
                "chemical-free living swimming pools",
                "wellness retreat masterplanning"
            ]
        },
        {
            "title": "Eco Resorts & Glamping",
            "url": "https://www.anvitam.com/services/eco-resort",
            "topics": [
                "eco resort",
                "glamping",
                "tented camp",
                "resort masterplan"
            ],
            "suggested_anchors": [
                "eco-resort architecture",
                "low-impact glamping masterplans"
            ]
        },
        {
            "title": "Homestays & Guest Houses",
            "url": "https://www.anvitam.com/services/homestay",
            "topics": [
                "homestay",
                "bed and breakfast",
                "guest cottages",
                "vernacular cottages"
            ],
            "suggested_anchors": [
                "vernacular homestay design",
                "guest cottage planning"
            ]
        },
        {
            "title": "Airbnb & Rental Stays",
            "url": "https://www.anvitam.com/services/airbnb",
            "topics": [
                "airbnb architecture",
                "vacation rental",
                "rental villa ROI",
                "high occupancy rental"
            ],
            "suggested_anchors": [
                "high-yield boutique rental stays",
                "architectural vacation rentals"
            ]
        },
        {
            "title": "Interior Design & Spatial Styling",
            "url": "https://www.anvitam.com/services/interior-design",
            "topics": [
                "interior design",
                "natural finishes",
                "lime plaster",
                "reclaimed wood"
            ],
            "suggested_anchors": [
                "biophilic interior architecture",
                "natural lime plaster interiors"
            ]
        },
        {
            "title": "Architecture & Design Consultation",
            "url": "https://www.anvitam.com/services/architecture-consultation",
            "topics": [
                "consultation",
                "pre-construction advice",
                "site visit",
                "land feasibility"
            ],
            "suggested_anchors": [
                "architectural feasibility consultation",
                "comprehensive site design review"
            ]
        }
    ],
    "landscape_permaculture_and_land_services": [
        {
            "title": "Permaculture & Land Masterplanning",
            "url": "https://www.anvitam.com/services/permaculture-design",
            "topics": [
                "permaculture",
                "swales",
                "keyline hydrology",
                "contour bunds"
            ],
            "suggested_anchors": [
                "permaculture land masterplanning",
                "regenerative site hydrology"
            ]
        },
        {
            "title": "Food Forests & Organic Orchards",
            "url": "https://www.anvitam.com/services/food-forest",
            "topics": [
                "food forest",
                "syntropic farming",
                "orchard",
                "fruit guilds"
            ],
            "suggested_anchors": [
                "syntropic food forest design",
                "multi-tier edible orchards"
            ]
        },
        {
            "title": "Landscape & Yard Planning",
            "url": "https://www.anvitam.com/services/landscape-design",
            "topics": [
                "landscape architecture",
                "native planting",
                "drought-tolerant garden",
                "stone terracing"
            ],
            "suggested_anchors": [
                "native ecological landscape design",
                "drought-resilient garden planning"
            ]
        },
        {
            "title": "Terrace & Balcony Gardens",
            "url": "https://www.anvitam.com/services/terrace-garden",
            "topics": [
                "terrace garden",
                "balcony garden",
                "roof garden",
                "urban agriculture"
            ],
            "suggested_anchors": [
                "engineered terrace gardens",
                "organic urban balcony sanctuaries"
            ]
        },
        {
            "title": "Backyard & Courtyard Gardens",
            "url": "https://www.anvitam.com/services/backyard-design",
            "topics": [
                "courtyard",
                "chowk",
                "internal patio",
                "microclimate garden"
            ],
            "suggested_anchors": [
                "central courtyard microclimate design",
                "passive cooling courtyard gardens"
            ]
        },
        {
            "title": "Agrotourism & Farm Visits",
            "url": "https://www.anvitam.com/services/agrotourism",
            "topics": [
                "agrotourism",
                "farm visits",
                "visitor zoning",
                "working farm experience"
            ],
            "suggested_anchors": [
                "agrotourism destination development",
                "working farm masterplanning"
            ]
        }
    ],
    "real_projects_and_case_studies": [
        {
            "title": "Odiyar Farm & Homestay Permaculture Masterplan",
            "url": "https://www.anvitam.com/projects/odiyar-farm-and-homestay-permaculture",
            "topics": [
                "farmstay project",
                "permaculture case study",
                "pond excavation",
                "swale system"
            ],
            "suggested_anchors": [
                "our Odiyar Farm Permaculture project",
                "the Odiyar Farm regenerative masterplan"
            ]
        },
        {
            "title": "Kusum Vilas Palace Heritage Destination",
            "url": "https://www.anvitam.com/projects/kusum-vilas-palace-heritage-destination-development",
            "topics": [
                "heritage restoration",
                "palace conservation",
                "traditional stone craftsmanship",
                "lime mortar"
            ],
            "suggested_anchors": [
                "our Kusum Vilas Palace heritage conservation",
                "the Kusum Vilas heritage restoration study"
            ]
        },
        {
            "title": "Kamba Agrotourism & Vardhaman Royal Agri Farm",
            "url": "https://www.anvitam.com/projects/kamba-agrotourism-vardhaman-royal-organic-agri-farm",
            "topics": [
                "agrotourism case study",
                "commercial organic farm",
                "visitor hub",
                "large estate masterplan"
            ],
            "suggested_anchors": [
                "our Kamba Agrotourism masterplan",
                "the Vardhaman Royal Agri Farm development"
            ]
        },
        {
            "title": "Bihar Natural Eco-Home (yourweb3guy)",
            "url": "https://www.anvitam.com/projects/yourweb3guy",
            "topics": [
                "rammed earth home",
                "mud house case study",
                "passive cooling residence",
                "low-carbon home"
            ],
            "suggested_anchors": [
                "our stabilized earth residential case study",
                "the Bihar natural eco-home build"
            ]
        },
        {
            "title": "Vanvagado Farm Rustic Estate",
            "url": "https://www.anvitam.com/projects/vanvagado-farm",
            "topics": [
                "farmhouse project",
                "rustic estate",
                "farm sanctuary",
                "natural materials"
            ],
            "suggested_anchors": [
                "our Vanvagado Farm estate execution",
                "the Vanvagado rustic farmhouse project"
            ]
        },
        {
            "title": "The Batukaru Yurt Wellness Retreat",
            "url": "https://www.anvitam.com/projects/batukaru-yurt",
            "topics": [
                "wellness sanctuary",
                "yurt design",
                "circular architecture",
                "natural bamboo"
            ],
            "suggested_anchors": [
                "the Batukaru Yurt wellness installation",
                "our circular wellness sanctuary design"
            ]
        },
        {
            "title": "Terrace Garden Vadodara Organic Balcony Sanctuary",
            "url": "https://www.anvitam.com/projects/terrace-garden-vadodara-organic-balcony-garden",
            "topics": [
                "urban terrace project",
                "rooftop garden case study",
                "vadodara balcony"
            ],
            "suggested_anchors": [
                "our Vadodara rooftop sanctuary project",
                "the urban terrace garden installation"
            ]
        }
    ],
    "technical_engineering_and_architecture_blogs": [
        {
            "title": "Building in Goa: The Ultimate Guide to Luxury Eco-Resorts and Biophilic Weekend Villas",
            "url": "https://www.anvitam.com/blog/building-in-goa-ultimate-guide",
            "topics": [
                "goa",
                "luxury eco-resorts",
                "biophilic weekend villas",
                "laterite stone"
            ],
            "suggested_anchors": [
                "our guide on building in goa",
                "Building in Goa: The Ultimate Guide to Luxury Eco-Resorts and Biophilic Weekend Villas"
            ]
        },
        {
            "title": "Luxury Villas on Steep Slopes: The 5-Step Masterplan Roadmap",
            "url": "https://www.anvitam.com/blog/luxury-villas-on-steep-slopes-masterplan-roadmap",
            "topics": [
                "luxury villas",
                "steep slopes",
                "karjat",
                "pune"
            ],
            "suggested_anchors": [
                "our guide on luxury villas on steep slopes",
                "Luxury Villas on Steep Slopes: The 5-Step Masterplan Roadmap"
            ]
        },
        {
            "title": "If You Bought 2-10 Acres of Land in Alibaug: The 5-Step Masterplan Roadmap Before Hiring a Contractor",
            "url": "https://www.anvitam.com/blog/if-you-bought-2-10-acres-land-alibaug-masterplan-roadmap",
            "topics": [
                "rammed earth alibaug",
                "monsoon-resistant construction",
                "sustainable architecture",
                "luxury eco-resorts"
            ],
            "suggested_anchors": [
                "our guide on if you bought 2-10 acres of land in alibaug",
                "If You Bought 2-10 Acres of Land in Alibaug: The 5-Step Masterplan Roadmap Before Hiring a Contractor"
            ]
        },
        {
            "title": "If You Bought 2-10 Acres of Land in Alibaug: The 5-Step Masterplan Roadmap Before Hiring a Contractor",
            "url": "https://www.anvitam.com/blog/alibaug-land-masterplan-roadmap",
            "topics": [
                "zero-waste luxury residence design",
                "sustainable architecture",
                "alibaug",
                "permaculture masterplan"
            ],
            "suggested_anchors": [
                "our guide on if you bought 2-10 acres of land in alibaug",
                "If You Bought 2-10 Acres of Land in Alibaug: The 5-Step Masterplan Roadmap Before Hiring a Contractor"
            ]
        },
        {
            "title": "Rural Estate Development Feasibility in Alibaug, Maharashtra: A Comprehensive Guide",
            "url": "https://www.anvitam.com/blog/rural-estate-development-feasibility-alibaug-maharashtra",
            "topics": [
                "rural estate development",
                "rammed earth construction",
                "sustainable architecture",
                "alibaug, maharashtra"
            ],
            "suggested_anchors": [
                "our guide on rural estate development feasibility in alibaug, maharashtra",
                "Rural Estate Development Feasibility in Alibaug, Maharashtra: A Comprehensive Guide"
            ]
        },
        {
            "title": "Laterite vs CSEB vs Stabilized Rammed Earth: The Ultimate Guide to Building in Alibaug, Maharashtra",
            "url": "https://www.anvitam.com/blog/laterite-vs-cseb-vs-stabilized-rammed-earth-alibaug",
            "topics": [
                "laterite",
                "cseb",
                "stabilized rammed earth",
                "alibaug"
            ],
            "suggested_anchors": [
                "our guide on laterite vs cseb vs stabilized rammed earth",
                "Laterite vs CSEB vs Stabilized Rammed Earth: The Ultimate Guide to Building in Alibaug, Maharashtra"
            ]
        },
        {
            "title": "Earthmovers Mistakes on Agricultural Land: A Comprehensive Guide to Avoiding Costly Errors in Alibaug, Maharashtra",
            "url": "https://www.anvitam.com/blog/earthmovers-mistakes-agricultural-land-alibaug",
            "topics": [
                "earthmovers mistakes",
                "agricultural land",
                "alibaug",
                "maharashtra"
            ],
            "suggested_anchors": [
                "our guide on earthmovers mistakes on agricultural land",
                "Earthmovers Mistakes on Agricultural Land: A Comprehensive Guide to Avoiding Costly Errors in Alibaug, Maharashtra"
            ]
        },
        {
            "title": "Passive Solar Orientation in Alibaug: A Comprehensive Guide to Cooling Your Home Naturally",
            "url": "https://www.anvitam.com/blog/passive-solar-orientation-alibaug",
            "topics": [
                "passive solar orientation",
                "alibaug",
                "rammed earth",
                "sustainable building"
            ],
            "suggested_anchors": [
                "our guide on passive solar orientation in alibaug",
                "Passive Solar Orientation in Alibaug: A Comprehensive Guide to Cooling Your Home Naturally"
            ]
        },
        {
            "title": "Keyline Drainage for Black Cotton Soil: The Ultimate Guide to Foundation Crack Solutions in Alibaug",
            "url": "https://www.anvitam.com/blog/keyline-drainage-black-cotton-soil-alibaug",
            "topics": [
                "keyline drainage",
                "black cotton soil",
                "foundation crack solutions",
                "alibaug"
            ],
            "suggested_anchors": [
                "our guide on keyline drainage for black cotton soil",
                "Keyline Drainage for Black Cotton Soil: The Ultimate Guide to Foundation Crack Solutions in Alibaug"
            ]
        },
        {
            "title": "How Much Does a Rammed Earth Villa Cost in Alibaug? (2026 Soil, Monsoon, and Engineering Reality)",
            "url": "https://www.anvitam.com/blog/rammed-earth-villa-cost-alibaug",
            "topics": [
                "rammed earth villa cost",
                "alibaug villa",
                "soil sieve",
                "monsoon defense"
            ],
            "suggested_anchors": [
                "our 2026 Alibaug rammed earth cost guide",
                "the truth about building rammed earth in Alibaug"
            ]
        },
        {
            "title": "Why Cement Walls Are Quietly Making Buildings Hotter, Costlier, and Unhealthier",
            "url": "https://www.anvitam.com/blog/why-cement-walls-are-quietly-making-buildings-hotter-costlier-and-unhealthier",
            "topics": [
                "cement heat",
                "thermal mass",
                "concrete vs earth",
                "air conditioning costs"
            ],
            "suggested_anchors": [
                "why cement walls drive up cooling costs",
                "the thermal heat traps of conventional concrete walls"
            ]
        },
        {
            "title": "Why Traditional Rainwater Harvesting Systems Worked Better Than Modern Systems",
            "url": "https://www.anvitam.com/blog/why-rainwater-harvesting-systems-worked-better-than-modern-systems",
            "topics": [
                "rainwater harvesting",
                "gravity catchment",
                "bioswales",
                "monsoon runoff"
            ],
            "suggested_anchors": [
                "why gravity-fed rainwater harvesting outlasts modern mechanical filters",
                "traditional Konkan catchment physics"
            ]
        },
        {
            "title": "Bamboo Cottages vs Brick Eco-Cottages: What Actually Costs Less Over 15 Years?",
            "url": "https://www.anvitam.com/blog/bamboo-cottages-vs-brick-eco-cottages-what-actually-costs-less-over-15-years",
            "topics": [
                "lifecycle cost",
                "bamboo vs brick",
                "15 year maintenance",
                "construction budget"
            ],
            "suggested_anchors": [
                "what natural building materials actually cost over 15 years",
                "15-year lifecycle cost comparisons"
            ]
        },
        {
            "title": "Soil Degradation Is Killing Indian Farms \u2014 And How Permaculture Actually Fixes It",
            "url": "https://www.anvitam.com/blog/soil-degradation-is-killing-indian-farms-and-how-permaculture-actually-fixes-it",
            "topics": [
                "soil health",
                "soil microbiology",
                "topsoil loss",
                "mycorrhizal fungi"
            ],
            "suggested_anchors": [
                "how permaculture reverses soil degradation on Indian plots",
                "rebuilding living soil biology"
            ]
        },
        {
            "title": "Natural Building Materials in Modern Engineering: Mud, Lime, and Bamboo",
            "url": "https://www.anvitam.com/blog/natural-building-materials-modern-engineering",
            "topics": [
                "engineering standards",
                "mud compression",
                "hydraulic lime",
                "IS code compliance"
            ],
            "suggested_anchors": [
                "engineered mud and hydraulic lime standards",
                "structural physics of natural materials"
            ]
        },
        {
            "title": "Why I Stopped Recommending Chemical Red Oxide: The Shift to Genuine Lime Plasters",
            "url": "https://www.anvitam.com/blog/i-stopped-recommending-red-oxide",
            "topics": [
                "red oxide flooring",
                "lime plaster",
                "natural flooring",
                "breathable finishes"
            ],
            "suggested_anchors": [
                "why genuine lime plasters outperform chemical coatings",
                "breathable lime floor finishes"
            ]
        },
        {
            "title": "Traditional Indian Tiles: Types, Cost, and Restoration Guide",
            "url": "https://www.anvitam.com/blog/traditional-indian-tiles-guide",
            "topics": [
                "athangudi tiles",
                "terracotta tiles",
                "mangalore tiles",
                "roof insulation"
            ],
            "suggested_anchors": [
                "traditional terracotta and Athangudi tile guides",
                "vernacular Indian roofing and flooring tiles"
            ]
        },
        {
            "title": "How to Design a Food Forest Using Syntropic Agroforestry: Step-by-Step Guide",
            "url": "https://www.anvitam.com/blog/how-to-design-a-food-forest-using-syntropic-agroforestry-step-by-step-guide",
            "topics": [
                "syntropic agroforestry",
                "food forest guide",
                "guild planting",
                "canopy management"
            ],
            "suggested_anchors": [
                "step-by-step syntropic food forest guide",
                "establishing multi-species agroforestry guilds"
            ]
        },
        {
            "title": "The Homestay Pricing Guide Nobody's Telling You",
            "url": "https://www.anvitam.com/blog/the-homestay-pricing-guide-nobodys-telling-you",
            "topics": [
                "homestay revenue",
                "ADR",
                "hospitality business model",
                "room pricing"
            ],
            "suggested_anchors": [
                "realistic homestay economics and ADR pricing",
                "the financial realities of boutique farmstay operations"
            ]
        },
        {
            "title": "India's Forgotten Earthquake-Resistant House Design",
            "url": "https://www.anvitam.com/blog/indias-forgotten-earthquake-resistant-house-design",
            "topics": [
                "earthquake resistance",
                "dhajji dewari",
                "seismic engineering",
                "timber framing"
            ],
            "suggested_anchors": [
                "vernacular seismic timber engineering",
                "traditional earthquake-resistant construction methods"
            ]
        },
        {
            "title": "Why I Stopped Buying CenturyPly & Greenply Doors for Sustainable Homes",
            "url": "https://www.anvitam.com/blog/why-i-stopped-buying-centuryply-greenply-doors",
            "topics": [
                "plywood toxic off-gassing",
                "VOC emissions",
                "solid wood doors",
                "healthy home carpentry"
            ],
            "suggested_anchors": [
                "eliminating toxic formaldehyde off-gassing from engineered wood",
                "sustainable solid timber alternatives"
            ]
        },
        {
            "title": "3-Layer Planting Scheme for Low-Maintenance Indian Gardens",
            "url": "https://www.anvitam.com/blog/three-layer-planting-scheme-low-maintenance-garden",
            "topics": [
                "layered planting",
                "drought-hardy shrubs",
                "garden canopy",
                "low maintenance landscape"
            ],
            "suggested_anchors": [
                "three-layer low-maintenance planting schemes",
                "native Indian plant layering strategies"
            ]
        }
    ],
    "interactive_tools_and_workshops": [
        {
            "title": "Site Intelligence & Contour Hydrology Tool",
            "url": "https://www.anvitam.com/site-analysis",
            "topics": [
                "contour mapping",
                "site analysis",
                "slope calculation",
                "water catchment"
            ],
            "suggested_anchors": [
                "Site Intelligence & Contour Hydrology Tool",
                "contour mapping and slope analysis calculator"
            ]
        },
        {
            "title": "RachnaCAD Architectural Planner",
            "url": "https://www.anvitam.com/tools/rachnacad",
            "topics": [
                "architectural CAD",
                "layout planning",
                "microclimate orientation",
                "zoning tool"
            ],
            "suggested_anchors": [
                "RachnaCAD architectural planner",
                "microclimate layout and orientation studio"
            ]
        },
        {
            "title": "AI Home Design Studio",
            "url": "https://www.anvitam.com/tools/ai-home-design",
            "topics": [
                "ai design tool",
                "natural interior visualization",
                "facade preview",
                "landscape visualization"
            ],
            "suggested_anchors": [
                "AI Home Design Studio",
                "biophilic visual preview studio"
            ]
        },
        {
            "title": "Nest N Nurture Earth Building Workshops",
            "url": "https://www.anvitam.com/workshops",
            "topics": [
                "earth workshop",
                "rammed earth training",
                "mason training",
                "hands-on workshop"
            ],
            "suggested_anchors": [
                "Nest N Nurture earth building workshops",
                "hands-on natural masonry training programs"
            ]
        },
        {
            "title": "Anvitam Architecture Tools Hub",
            "url": "https://www.anvitam.com/tools",
            "topics": [
                "architecture calculators",
                "sustainable design tools",
                "free site tools"
            ],
            "suggested_anchors": [
                "Anvitam Architecture Tools Hub",
                "free site planning and feasibility tools"
            ]
        }
    ],
    "regional_destination_guides": [
        {
            "title": "Alibaug Sustainable Architecture & Villa Guide",
            "url": "https://www.anvitam.com/destinations/alibaug",
            "topics": [
                "alibaug",
                "mandwa",
                "awas",
                "kihim"
            ],
            "suggested_anchors": [
                "ecological architecture in Alibaug",
                "our Alibaug coastal design field guide"
            ]
        },
        {
            "title": "Karjat Farmhouse & Eco Retreat Architecture",
            "url": "https://www.anvitam.com/destinations/karjat",
            "topics": [
                "karjat",
                "western ghats foothills",
                "black cotton soil",
                "monsoon runoff karjat"
            ],
            "suggested_anchors": [
                "sustainable farmhouse architecture in Karjat",
                "our Karjat foothill building guide"
            ]
        },
        {
            "title": "Goa Vernacular & Tropical Architecture",
            "url": "https://www.anvitam.com/destinations/goa",
            "topics": [
                "goa",
                "tropical villa",
                "laterite stone",
                "portuguese vernacular"
            ],
            "suggested_anchors": [
                "tropical ecological architecture in Goa",
                "our Goa vernacular design guide"
            ]
        },
        {
            "title": "Coorg Plantation Architecture",
            "url": "https://www.anvitam.com/destinations/coorg",
            "topics": [
                "coorg",
                "coffee estate",
                "heavy hill rainfall",
                "plantation homestay"
            ],
            "suggested_anchors": [
                "plantation architecture in Coorg",
                "sustainable estate design in Coorg"
            ]
        },
        {
            "title": "Wayanad Eco-Resort & Permaculture Estates",
            "url": "https://www.anvitam.com/destinations/wayanad",
            "topics": [
                "wayanad",
                "mountain slope",
                "kerala sustainable design",
                "cloud forest"
            ],
            "suggested_anchors": [
                "eco-resort masterplanning in Wayanad",
                "mountain slope architecture in Wayanad"
            ]
        },
        {
            "title": "Vadodara Sustainable Architecture & Urban Ecology",
            "url": "https://www.anvitam.com/destinations/vadodara",
            "topics": [
                "vadodara",
                "gujarat architecture",
                "semi-arid climate",
                "hot dry passive cooling"
            ],
            "suggested_anchors": [
                "sustainable architecture in Vadodara",
                "semi-arid climate passive cooling strategies"
            ]
        }
    ],
    "conversion_anchors": [
        {
            "title": "Private Pre-Construction Strategy Audit with Ar. Archana Gavas",
            "url": "https://topmate.io/archanagavas",
            "topics": [
                "book consultation",
                "topmate session",
                "pre-construction audit",
                "site feasibility call"
            ],
            "suggested_anchors": [
                "Book a Private Pre-Construction Strategy Audit with Ar. Archana Gavas on Topmate",
                "schedule a 30-minute pre-construction strategy audit"
            ]
        },
        {
            "title": "Anvitam Studio Architectural Commission Desk",
            "url": "https://www.anvitam.com/contact",
            "topics": [
                "contact studio",
                "inquire commission",
                "full architectural design",
                "site masterplan booking"
            ],
            "suggested_anchors": [
                "Anvitam Studio Architectural Commission Desk",
                "contact our architectural studio directly"
            ]
        }
    ]
}
# ── TAXONOMY_END ──────────────────────────────────────────────────────────────


def save_registry_to_disk() -> bool:
    """
    Persists the in-memory LINK_TAXONOMY back into this file between
    # ── TAXONOMY_START ── and # ── TAXONOMY_END ──.
    Ensures this file stays perpetually up-to-date and trackable in git.
    """
    try:
        current_file = Path(__file__).resolve()
        content = current_file.read_text(encoding="utf-8")
        
        start_marker = "# ── TAXONOMY_START ────────────────────────────────────────────────────────────"
        end_marker = "# ── TAXONOMY_END ──────────────────────────────────────────────────────────────"
        
        start_idx = content.find(start_marker)
        end_idx = content.find(end_marker)
        
        if start_idx == -1 or end_idx == -1:
            logger.warning("Could not find TAXONOMY markers in link_registry.py")
            return False
            
        formatted_json = json.dumps(LINK_TAXONOMY, indent=4)
        new_block = f"{start_marker}\nLINK_TAXONOMY = {formatted_json}\n{end_marker}"
        
        updated_content = content[:start_idx] + new_block + content[end_idx + len(end_marker):]
        current_file.write_text(updated_content, encoding="utf-8")
        logger.info("Successfully updated autopilot/link_registry.py on disk.")
        return True
    except Exception as e:
        logger.error(f"Failed to persist link registry to disk: {e}")
        return False


def register_new_content_item(
    category: str,
    title: str,
    url: str,
    topics: List[str],
    suggested_anchors: List[str],
    auto_save: bool = True
) -> bool:
    """
    Registers a new content item into LINK_TAXONOMY and saves to disk.
    Avoids duplicate entries by URL.
    """
    if category not in LINK_TAXONOMY:
        LINK_TAXONOMY[category] = []
        
    existing_urls = {item["url"] for item in LINK_TAXONOMY[category]}
    if url in existing_urls:
        return False
        
    entry = {
        "title": title,
        "url": url,
        "topics": topics[:4],
        "suggested_anchors": suggested_anchors[:2]
    }
    LINK_TAXONOMY[category].insert(0, entry)
    logger.info(f"Registered new {category} link: {url}")
    
    if auto_save:
        save_registry_to_disk()
    return True


def register_new_blog(
    title: str,
    slug: str,
    meta_description: str = "",
    tags: Optional[List[str]] = None,
    auto_save: bool = True
) -> bool:
    """
    Convenience method to register a newly generated or published blog post.
    """
    url = f"https://www.anvitam.com/blog/{slug}"
    topics = []
    if tags:
        topics.extend([t.strip().lower() for t in tags if t.strip()])
    if not topics:
        clean_words = [w.lower() for w in re.findall(r"\b[A-Za-z]{3,}\b", title) if w.lower() not in {"the", "and", "about", "for", "with"}]
        topics = clean_words[:4]
        
    anchors = [
        f"our guide on {title.split(':')[0].strip().lower()}",
        title
    ]
    
    return register_new_content_item(
        category="technical_engineering_and_architecture_blogs",
        title=title,
        url=url,
        topics=topics,
        suggested_anchors=anchors,
        auto_save=auto_save
    )


def scan_and_sync_all(auto_save: bool = True) -> int:
    """
    Scans the local filesystem and project constants for any new blogs, services,
    workshops, or projects, and registers them into LINK_TAXONOMY.
    Returns the number of new items added.
    """
    added_count = 0
    workspace = Path(__file__).resolve().parent.parent
    
    # 1. Scan published_records/blogs (*.md)
    blogs_dir = workspace / "autopilot" / "published_records" / "blogs"
    if blogs_dir.exists():
        for md_path in blogs_dir.glob("*.md"):
            try:
                content = md_path.read_text(encoding="utf-8")
                slug = md_path.stem
                url = f"https://www.anvitam.com/blog/{slug}"
                
                # Check if already present
                existing_urls = {item["url"] for item in LINK_TAXONOMY.get("technical_engineering_and_architecture_blogs", [])}
                if url not in existing_urls:
                    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
                    title = title_match.group(1).strip() if title_match else slug.replace("-", " ").title()
                    
                    desc_match = re.search(r"Meta Description:\*\*\s*(.+)$", content, re.MULTILINE)
                    meta_desc = desc_match.group(1).strip() if desc_match else ""
                    
                    if register_new_blog(title, slug, meta_desc, auto_save=False):
                        added_count += 1
            except Exception as e:
                logger.warning(f"Error scanning blog markdown {md_path.name}: {e}")
                
    # 2. Scan constants.ts for any new services or projects
    constants_path = workspace / "constants.ts"
    if constants_path.exists():
        try:
            ts_content = constants_path.read_text(encoding="utf-8")
            
            # Match top-level services
            services_match = re.search(r"export const SERVICES: Service\[\] = \[(.*?)\];\s*export const DIGITAL_PRODUCTS", ts_content, re.DOTALL)
            if services_match:
                block = services_match.group(1)
                for m in re.finditer(r'{\s*["\']id["\']:\s*["\']([^"\']+)["\'],\s*["\']title["\']:\s*["\']([^"\']+)["\'],\s*["\']category["\']:\s*["\']([^"\']+)["\']', block):
                    s_id = m.group(1)
                    s_title = m.group(2)
                    s_cat = m.group(3)
                    s_url = f"https://www.anvitam.com/services/{s_id}"
                    
                    target_cat = "landscape_permaculture_and_land_services" if s_cat == "Land & Gardens" else "architecture_and_retreat_services"
                    existing_urls = {item["url"] for item in LINK_TAXONOMY.get(target_cat, [])}
                    if s_url not in existing_urls:
                        if register_new_content_item(
                            category=target_cat,
                            title=s_title,
                            url=s_url,
                            topics=[s_id.replace("-", " "), s_title.lower()],
                            suggested_anchors=[s_title, f"sustainable {s_title.lower()}"],
                            auto_save=False
                        ):
                            added_count += 1
        except Exception as e:
            logger.warning(f"Error scanning constants.ts: {e}")
            
    if added_count > 0 and auto_save:
        save_registry_to_disk()
        logger.info(f"Auto-sync completed. Added {added_count} new items to link_registry.py.")
        
    return added_count


def format_link_registry_for_prompt() -> str:
    """
    Renders the complete Anvitam Internal Link Taxonomy into a clean, categorized
    markdown reference for the Writing Agent's prompt.
    Automatically triggers scan_and_sync_all() first to ensure 100% fresh data.
    """
    # Auto-sync on each prompt generation
    scan_and_sync_all(auto_save=True)
    
    output = []
    output.append("### ANVITAM AUTHORITATIVE INTERNAL LINK TAXONOMY & MATCHING RULES")
    output.append("You MUST distribute 1 natural, contextual internal link into each major section.")
    output.append("SELECTION RULE: Choose links based strictly on what the section is about. DO NOT insert random links.\n")

    for category, links in LINK_TAXONOMY.items():
        cat_name = category.replace("_", " ").title()
        output.append(f"#### {cat_name}:")
        for item in links:
            topics_str = ", ".join(item["topics"][:4])
            anchors_str = " | ".join([f'"{a}"' for a in item["suggested_anchors"][:2]])
            output.append(f"- **<{item['url']}>** ({item['title']})")
            output.append(f"  * Best used when section discusses: {topics_str}")
            output.append(f"  * Recommended Anchor Phrasings: {anchors_str}")
        output.append("")

    return "\n".join(output)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Running link_registry self-sync...")
    new_found = scan_and_sync_all(auto_save=True)
    print(f"Scan complete. New items added: {new_found}")
    total_links = sum(len(items) for items in LINK_TAXONOMY.values())
    print(f"Total active links in registry: {total_links}")
