"""
Anvitam Internal Link Registry & Contextual Matching Engine.
Provides a comprehensive taxonomy of all real published URLs across Anvitam:
- Services (15)
- Projects & Case Studies (14)
- Technical Blogs & Guides (13)
- Interactive Tools & Workshops (5)
- Regional Destination Pages (6)
- High-Value Conversion Anchors (2)

Enforces strict rules:
1. Contextual matching only: links are selected based on the specific paragraph concept, never randomly.
2. Natural anchor text: zero mechanical formulas ("click here", "for more info").
"""

from typing import List, Dict, Any

LINK_TAXONOMY = {
    "architecture_and_retreat_services": [
        {
            "title": "Weekend Villas & Getaways",
            "url": "https://www.anvitam.com/services/weekend-villa",
            "topics": ["weekend villa", "villa architecture", "second home", "alibaug villa", "karjat home", "coastal residence", "rammed earth villa"],
            "suggested_anchors": ["biophilic weekend villas", "architectural weekend home design", "sustainable private villa planning"]
        },
        {
            "title": "Farm Retreats & Farmhouses",
            "url": "https://www.anvitam.com/services/farm-retreat",
            "topics": ["farmhouse", "farm retreat", "rural estate", "courtyard house", "agro-estate", "farmland architecture"],
            "suggested_anchors": ["sustainable farm retreat architecture", "regenerative farmstay planning", "farmhouse courtyard design"]
        },
        {
            "title": "Wellness & Yoga Retreats",
            "url": "https://www.anvitam.com/services/wellness-retreat",
            "topics": ["wellness retreat", "natural swimming pool", "living pool", "chlorine-free pool", "spa architecture", "healing sanctuary"],
            "suggested_anchors": ["chemical-free living swimming pools", "wellness retreat masterplanning", "ecological sanctuary architecture"]
        },
        {
            "title": "Eco Resorts & Glamping",
            "url": "https://www.anvitam.com/services/eco-resort",
            "topics": ["eco resort", "glamping", "tented camp", "resort masterplan", "hospitality architecture"],
            "suggested_anchors": ["eco-resort architecture", "low-impact glamping masterplans", "sustainable hospitality design"]
        },
        {
            "title": "Homestays & Guest Houses",
            "url": "https://www.anvitam.com/services/homestay",
            "topics": ["homestay", "bed and breakfast", "guest cottages", "vernacular cottages", "experiential stay"],
            "suggested_anchors": ["vernacular homestay design", "guest cottage planning", "experiential retreat architecture"]
        },
        {
            "title": "Airbnb & Rental Stays",
            "url": "https://www.anvitam.com/services/airbnb",
            "topics": ["airbnb architecture", "vacation rental", "rental villa ROI", "high occupancy rental"],
            "suggested_anchors": ["high-yield boutique rental stays", "architectural vacation rentals", "experiential Airbnb design"]
        },
        {
            "title": "Interior Design & Spatial Styling",
            "url": "https://www.anvitam.com/services/interior-design",
            "topics": ["interior design", "natural finishes", "lime plaster", "reclaimed wood", "earth interiors", "biophilic interiors"],
            "suggested_anchors": ["biophilic interior architecture", "natural lime plaster interiors", "healthy non-toxic interiors"]
        },
        {
            "title": "Architecture & Design Consultation",
            "url": "https://www.anvitam.com/services/architecture-consultation",
            "topics": ["consultation", "pre-construction advice", "site visit", "land feasibility", "design advisory"],
            "suggested_anchors": ["architectural feasibility consultation", "comprehensive site design review", "private architectural advisory"]
        }
    ],

    "landscape_permaculture_and_land_services": [
        {
            "title": "Permaculture & Land Masterplanning",
            "url": "https://www.anvitam.com/services/permaculture-design",
            "topics": ["permaculture", "swales", "keyline hydrology", "contour bunds", "land masterplan", "regenerative land"],
            "suggested_anchors": ["permaculture land masterplanning", "regenerative site hydrology", "keyline water harvesting design"]
        },
        {
            "title": "Food Forests & Organic Orchards",
            "url": "https://www.anvitam.com/services/food-forest",
            "topics": ["food forest", "syntropic farming", "orchard", "fruit guilds", "agroforestry", "edible landscape"],
            "suggested_anchors": ["syntropic food forest design", "multi-tier edible orchards", "regenerative agroforestry planning"]
        },
        {
            "title": "Landscape & Yard Planning",
            "url": "https://www.anvitam.com/services/landscape-design",
            "topics": ["landscape architecture", "native planting", "drought-tolerant garden", "stone terracing", "biodiversity"],
            "suggested_anchors": ["native ecological landscape design", "drought-resilient garden planning", "biodiverse outdoor spaces"]
        },
        {
            "title": "Terrace & Balcony Gardens",
            "url": "https://www.anvitam.com/services/terrace-garden",
            "topics": ["terrace garden", "balcony garden", "roof garden", "urban agriculture", "lightweight potting soil"],
            "suggested_anchors": ["engineered terrace gardens", "organic urban balcony sanctuaries", "lightweight rooftop planting systems"]
        },
        {
            "title": "Backyard & Courtyard Gardens",
            "url": "https://www.anvitam.com/services/backyard-design",
            "topics": ["courtyard", "chowk", "internal patio", "microclimate garden", "shaded backyard"],
            "suggested_anchors": ["central courtyard microclimate design", "passive cooling courtyard gardens", "private backyard sanctuaries"]
        },
        {
            "title": "Agrotourism & Farm Visits",
            "url": "https://www.anvitam.com/services/agrotourism",
            "topics": ["agrotourism", "farm visits", "visitor zoning", "working farm experience", "educational farm"],
            "suggested_anchors": ["agrotourism destination development", "working farm masterplanning", "experiential farm tourism"]
        }
    ],

    "real_projects_and_case_studies": [
        {
            "title": "Odiyar Farm & Homestay Permaculture Masterplan",
            "url": "https://www.anvitam.com/projects/odiyar-farm-and-homestay-permaculture",
            "topics": ["farmstay project", "permaculture case study", "pond excavation", "swale system", "mud architecture"],
            "suggested_anchors": ["our Odiyar Farm Permaculture project", "the Odiyar Farm regenerative masterplan"]
        },
        {
            "title": "Kusum Vilas Palace Heritage Destination",
            "url": "https://www.anvitam.com/projects/kusum-vilas-palace-heritage-destination-development",
            "topics": ["heritage restoration", "palace conservation", "traditional stone craftsmanship", "lime mortar"],
            "suggested_anchors": ["our Kusum Vilas Palace heritage conservation", "the Kusum Vilas heritage restoration study"]
        },
        {
            "title": "Kamba Agrotourism & Vardhaman Royal Agri Farm",
            "url": "https://www.anvitam.com/projects/kamba-agrotourism-vardhaman-royal-organic-agri-farm",
            "topics": ["agrotourism case study", "commercial organic farm", "visitor hub", "large estate masterplan"],
            "suggested_anchors": ["our Kamba Agrotourism masterplan", "the Vardhaman Royal Agri Farm development"]
        },
        {
            "title": "Bihar Natural Eco-Home (yourweb3guy)",
            "url": "https://www.anvitam.com/projects/yourweb3guy",
            "topics": ["rammed earth home", "mud house case study", "passive cooling residence", "low-carbon home"],
            "suggested_anchors": ["our stabilized earth residential case study", "the Bihar natural eco-home build"]
        },
        {
            "title": "Vanvagado Farm Rustic Estate",
            "url": "https://www.anvitam.com/projects/vanvagado-farm",
            "topics": ["farmhouse project", "rustic estate", "farm sanctuary", "natural materials"],
            "suggested_anchors": ["our Vanvagado Farm estate execution", "the Vanvagado rustic farmhouse project"]
        },
        {
            "title": "The Batukaru Yurt Wellness Retreat",
            "url": "https://www.anvitam.com/projects/batukaru-yurt",
            "topics": ["wellness sanctuary", "yurt design", "circular architecture", "natural bamboo"],
            "suggested_anchors": ["the Batukaru Yurt wellness installation", "our circular wellness sanctuary design"]
        },
        {
            "title": "Terrace Garden Vadodara Organic Balcony Sanctuary",
            "url": "https://www.anvitam.com/projects/terrace-garden-vadodara-organic-balcony-garden",
            "topics": ["urban terrace project", "rooftop garden case study", "vadodara balcony"],
            "suggested_anchors": ["our Vadodara rooftop sanctuary project", "the urban terrace garden installation"]
        }
    ],

    "technical_engineering_and_architecture_blogs": [
        {
            "title": "Why Cement Walls Are Quietly Making Buildings Hotter, Costlier, and Unhealthier",
            "url": "https://www.anvitam.com/blog/why-cement-walls-are-quietly-making-buildings-hotter-costlier-and-unhealthier",
            "topics": ["cement heat", "thermal mass", "concrete vs earth", "air conditioning costs", "building biology"],
            "suggested_anchors": ["why cement walls drive up cooling costs", "the thermal heat traps of conventional concrete walls"]
        },
        {
            "title": "Why Traditional Rainwater Harvesting Systems Worked Better Than Modern Systems",
            "url": "https://www.anvitam.com/blog/why-rainwater-harvesting-systems-worked-better-than-modern-systems",
            "topics": ["rainwater harvesting", "gravity catchment", "bioswales", "monsoon runoff", "groundwater recharge"],
            "suggested_anchors": ["why gravity-fed rainwater harvesting outlasts modern mechanical filters", "traditional Konkan catchment physics"]
        },
        {
            "title": "Bamboo Cottages vs Brick Eco-Cottages: What Actually Costs Less Over 15 Years?",
            "url": "https://www.anvitam.com/blog/bamboo-cottages-vs-brick-eco-cottages-what-actually-costs-less-over-15-years",
            "topics": ["lifecycle cost", "bamboo vs brick", "15 year maintenance", "construction budget", "contractor quotes"],
            "suggested_anchors": ["what natural building materials actually cost over 15 years", "15-year lifecycle cost comparisons"]
        },
        {
            "title": "Soil Degradation Is Killing Indian Farms — And How Permaculture Actually Fixes It",
            "url": "https://www.anvitam.com/blog/soil-degradation-is-killing-indian-farms-and-how-permaculture-actually-fixes-it",
            "topics": ["soil health", "soil microbiology", "topsoil loss", "mycorrhizal fungi", "land regeneration"],
            "suggested_anchors": ["how permaculture reverses soil degradation on Indian plots", "rebuilding living soil biology"]
        },
        {
            "title": "Natural Building Materials in Modern Engineering: Mud, Lime, and Bamboo",
            "url": "https://www.anvitam.com/blog/natural-building-materials-modern-engineering",
            "topics": ["engineering standards", "mud compression", "hydraulic lime", "IS code compliance"],
            "suggested_anchors": ["engineered mud and hydraulic lime standards", "structural physics of natural materials"]
        },
        {
            "title": "Why I Stopped Recommending Chemical Red Oxide: The Shift to Genuine Lime Plasters",
            "url": "https://www.anvitam.com/blog/i-stopped-recommending-red-oxide",
            "topics": ["red oxide flooring", "lime plaster", "natural flooring", "breathable finishes"],
            "suggested_anchors": ["why genuine lime plasters outperform chemical coatings", "breathable lime floor finishes"]
        },
        {
            "title": "Traditional Indian Tiles: Types, Cost, and Restoration Guide",
            "url": "https://www.anvitam.com/blog/traditional-indian-tiles-guide",
            "topics": ["athangudi tiles", "terracotta tiles", "mangalore tiles", "roof insulation", "vernacular flooring"],
            "suggested_anchors": ["traditional terracotta and Athangudi tile guides", "vernacular Indian roofing and flooring tiles"]
        },
        {
            "title": "How to Design a Food Forest Using Syntropic Agroforestry: Step-by-Step Guide",
            "url": "https://www.anvitam.com/blog/how-to-design-a-food-forest-using-syntropic-agroforestry-step-by-step-guide",
            "topics": ["syntropic agroforestry", "food forest guide", "guild planting", "canopy management"],
            "suggested_anchors": ["step-by-step syntropic food forest guide", "establishing multi-species agroforestry guilds"]
        },
        {
            "title": "The Homestay Pricing Guide Nobody's Telling You",
            "url": "https://www.anvitam.com/blog/the-homestay-pricing-guide-nobodys-telling-you",
            "topics": ["homestay revenue", "ADR", "hospitality business model", "room pricing"],
            "suggested_anchors": ["realistic homestay economics and ADR pricing", "the financial realities of boutique farmstay operations"]
        },
        {
            "title": "India's Forgotten Earthquake-Resistant House Design",
            "url": "https://www.anvitam.com/blog/indias-forgotten-earthquake-resistant-house-design",
            "topics": ["earthquake resistance", "dhajji dewari", "seismic engineering", "timber framing"],
            "suggested_anchors": ["vernacular seismic timber engineering", "traditional earthquake-resistant construction methods"]
        },
        {
            "title": "Why I Stopped Buying CenturyPly & Greenply Doors for Sustainable Homes",
            "url": "https://www.anvitam.com/blog/why-i-stopped-buying-centuryply-greenply-doors",
            "topics": ["plywood toxic off-gassing", "VOC emissions", "solid wood doors", "healthy home carpentry"],
            "suggested_anchors": ["eliminating toxic formaldehyde off-gassing from engineered wood", "sustainable solid timber alternatives"]
        },
        {
            "title": "3-Layer Planting Scheme for Low-Maintenance Indian Gardens",
            "url": "https://www.anvitam.com/blog/three-layer-planting-scheme-low-maintenance-garden",
            "topics": ["layered planting", "drought-hardy shrubs", "garden canopy", "low maintenance landscape"],
            "suggested_anchors": ["three-layer low-maintenance planting schemes", "native Indian plant layering strategies"]
        }
    ],

    "interactive_tools_and_workshops": [
        {
            "title": "Site Intelligence & Contour Hydrology Tool",
            "url": "https://www.anvitam.com/site-analysis",
            "topics": ["contour mapping", "site analysis", "slope calculation", "water catchment", "cut and fill volume", "sun path"],
            "suggested_anchors": ["Site Intelligence & Contour Hydrology Tool", "contour mapping and slope analysis calculator"]
        },
        {
            "title": "RachnaCAD Architectural Planner",
            "url": "https://www.anvitam.com/tools/rachnacad",
            "topics": ["architectural CAD", "layout planning", "microclimate orientation", "zoning tool", "floor plan generator"],
            "suggested_anchors": ["RachnaCAD architectural planner", "microclimate layout and orientation studio"]
        },
        {
            "title": "AI Home Design Studio",
            "url": "https://www.anvitam.com/tools/ai-home-design",
            "topics": ["ai design tool", "natural interior visualization", "facade preview", "landscape visualization"],
            "suggested_anchors": ["AI Home Design Studio", "biophilic visual preview studio"]
        },
        {
            "title": "Nest N Nurture Earth Building Workshops",
            "url": "https://www.anvitam.com/workshops",
            "topics": ["earth workshop", "rammed earth training", "mason training", "hands-on workshop", "bamboo workshop", "mud craft"],
            "suggested_anchors": ["Nest N Nurture earth building workshops", "hands-on natural masonry training programs"]
        },
        {
            "title": "Anvitam Architecture Tools Hub",
            "url": "https://www.anvitam.com/tools",
            "topics": ["architecture calculators", "sustainable design tools", "free site tools"],
            "suggested_anchors": ["Anvitam Architecture Tools Hub", "free site planning and feasibility tools"]
        }
    ],

    "regional_destination_guides": [
        {
            "title": "Alibaug Sustainable Architecture & Villa Guide",
            "url": "https://www.anvitam.com/destinations/alibaug",
            "topics": ["alibaug", "mandwa", "awas", "kihim", "konkan coast", "coastal villa"],
            "suggested_anchors": ["ecological architecture in Alibaug", "our Alibaug coastal design field guide"]
        },
        {
            "title": "Karjat Farmhouse & Eco Retreat Architecture",
            "url": "https://www.anvitam.com/destinations/karjat",
            "topics": ["karjat", "western ghats foothills", "black cotton soil", "monsoon runoff karjat"],
            "suggested_anchors": ["sustainable farmhouse architecture in Karjat", "our Karjat foothill building guide"]
        },
        {
            "title": "Goa Vernacular & Tropical Architecture",
            "url": "https://www.anvitam.com/destinations/goa",
            "topics": ["goa", "tropical villa", "laterite stone", "portuguese vernacular", "coastal humidity"],
            "suggested_anchors": ["tropical ecological architecture in Goa", "our Goa vernacular design guide"]
        },
        {
            "title": "Coorg Plantation Architecture",
            "url": "https://www.anvitam.com/destinations/coorg",
            "topics": ["coorg", "coffee estate", "heavy hill rainfall", "plantation homestay"],
            "suggested_anchors": ["plantation architecture in Coorg", "sustainable estate design in Coorg"]
        },
        {
            "title": "Wayanad Eco-Resort & Permaculture Estates",
            "url": "https://www.anvitam.com/destinations/wayanad",
            "topics": ["wayanad", "mountain slope", "kerala sustainable design", "cloud forest"],
            "suggested_anchors": ["eco-resort masterplanning in Wayanad", "mountain slope architecture in Wayanad"]
        },
        {
            "title": "Vadodara Sustainable Architecture & Urban Ecology",
            "url": "https://www.anvitam.com/destinations/vadodara",
            "topics": ["vadodara", "gujarat architecture", "semi-arid climate", "hot dry passive cooling"],
            "suggested_anchors": ["sustainable architecture in Vadodara", "semi-arid climate passive cooling strategies"]
        }
    ],

    "conversion_anchors": [
        {
            "title": "Private Pre-Construction Strategy Audit with Ar. Archana Gavas",
            "url": "https://topmate.io/archanagavas",
            "topics": ["book consultation", "topmate session", "pre-construction audit", "site feasibility call"],
            "suggested_anchors": ["Book a Private Pre-Construction Strategy Audit with Ar. Archana Gavas on Topmate", "schedule a 30-minute pre-construction strategy audit"]
        },
        {
            "title": "Anvitam Studio Architectural Commission Desk",
            "url": "https://www.anvitam.com/contact",
            "topics": ["contact studio", "inquire commission", "full architectural design", "site masterplan booking"],
            "suggested_anchors": ["Anvitam Studio Architectural Commission Desk", "contact our architectural studio directly"]
        }
    ]
}


def format_link_registry_for_prompt() -> str:
    """
    Renders the complete Anvitam Internal Link Taxonomy into a clean, categorized
    markdown reference for the Writing Agent's prompt.
    """
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
