"""
Anvitam Internal Link Registry & Contextual Matching Engine.
Provides a comprehensive taxonomy of all real published URLs across Anvitam:
- Approved Technical Blogs & Guides (12+)
- Core Architectural & Retreat Services (15)
- Real Projects & Case Studies (8)
- Conversion Anchors (Topmate Audit & Contact)

Enforces strict rules:
1. Contextual matching only: links are selected based on the specific paragraph concept, never randomly.
2. Natural anchor text: zero mechanical formulas ("click here", "for more info").
3. Self-updating: automatically registers newly published approved blogs.
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
    "approved_existing_blogs": [
        {
            "title": "The Biggest Mistakes Indians Make When Starting a Terrace Garden",
            "url": "https://www.anvitam.com/blog/the-biggest-mistakes-indians-make-when-starting-a-terrace-garden",
            "topics": ["terrace garden mistakes", "balcony garden drainage", "urban rooftop garden waterproofing", "rooftop weight load"],
            "suggested_anchors": ["the biggest mistakes made when starting a terrace garden", "our guide on avoiding terrace garden structural failures"]
        },
        {
            "title": "India's Forgotten Earthquake-Resistant House Design: The Dhajji Dewari & Kath-Kuni Truth",
            "url": "https://www.anvitam.com/blog/indias-forgotten-earthquake-resistant-house-design",
            "topics": ["earthquake resistant architecture", "traditional timber frame", "vernacular structural engineering", "kath-kuni construction"],
            "suggested_anchors": ["India's forgotten vernacular earthquake-resistant systems", "our analysis of traditional seismic timber framing"]
        },
        {
            "title": "Soil Degradation Is Killing Indian Farms — And How Permaculture Actually Fixes It",
            "url": "https://www.anvitam.com/blog/soil-degradation-is-killing-indian-farms-and-how-permaculture-actually-fixes-it",
            "topics": ["soil degradation", "permaculture soil regeneration", "chemical fertilizer damage", "subsoil microbial biology", "biochar"],
            "suggested_anchors": ["how permaculture actually restores degraded farm soil", "our field report on reversing agricultural soil depletion"]
        },
        {
            "title": "The Homestay Pricing Guide Nobody's Telling You: RevPAR Math for Rural Estates",
            "url": "https://www.anvitam.com/blog/the-homestay-pricing-guide-nobodys-telling-you",
            "topics": ["homestay pricing", "rural estate ROI", "farmstay occupancy", "vacation rental RevPAR math"],
            "suggested_anchors": ["the realistic homestay pricing math nobody discusses", "our rural farmstay revenue and pricing breakdown"]
        },
        {
            "title": "Can You Live Completely Off a Permaculture Garden? The Calorie & Acreage Math",
            "url": "https://www.anvitam.com/blog/can-you-live-completely-off-a-permaculture-garden",
            "topics": ["off-grid food security", "permaculture self sufficiency", "calorie yield per acre", "perennial food systems"],
            "suggested_anchors": ["can you realistically live off a permaculture garden", "our empirical calorie and land math for self-sufficiency"]
        },
        {
            "title": "If You Bought 2 Acres of Land: The 5-Step Masterplan Roadmap Before Hiring a Contractor",
            "url": "https://www.anvitam.com/blog/if-you-bought-2-acres-land-masterplan-roadmap",
            "topics": ["buying rural land", "2 acres masterplan", "pre-construction site planning", "contour hydrology", "soil testing before building"],
            "suggested_anchors": ["the 5-step roadmap if you bought 2 acres of land", "our pre-construction masterplanning sequence for rural acreage"]
        },
        {
            "title": "The Ancient Plaster That Can Outlast Cement by 4,000 Years",
            "url": "https://www.anvitam.com/blog/the-ancient-plaster-that-can-outlast-cement-4000-years",
            "topics": ["traditional lime plaster", "hydraulic lime vs cement", "breathable wall finishes", "carbonation chemistry", "historic mortars"],
            "suggested_anchors": ["the ancient breathable plaster that outlasts cement", "our study on traditional lime chemistry and wall breathability"]
        },
        {
            "title": "Turnkey Sustainable Architecture & Construction Management: Cost Breakdown",
            "url": "https://www.anvitam.com/blog/turnkey-sustainable-architecture-construction-management-cost-5842",
            "topics": ["turnkey sustainable architecture", "construction management fee", "cost per square foot eco build", "contractor supervision"],
            "suggested_anchors": ["the real costs of turnkey sustainable architecture", "our breakdown of end-to-end ecological construction management"]
        },
        {
            "title": "What Can You Actually Do With 5 Acres of Land? Masterplanning Strategies",
            "url": "https://www.anvitam.com/blog/what-can-you-do-with-5-acres-of-land-",
            "topics": ["5 acres land layout", "rural estate zoning", "food forest and villa integration", "farm retreat planning"],
            "suggested_anchors": ["what you can strategically do with 5 acres of land", "our 5-acre regenerative zoning and layout framework"]
        },
        {
            "title": "Site Analysis Architecture: Microclimate Simulation & Solar Azimuth Guide",
            "url": "https://www.anvitam.com/blog/site-analysis-architecture-microclimate-simulation-guide-0618",
            "topics": ["site analysis architecture", "solar orientation passive cooling", "wind patterns microclimate", "contour slope mapping"],
            "suggested_anchors": ["architectural site analysis and microclimate simulation", "how we map solar paths and prevailing breezes on raw land"]
        },
        {
            "title": "Architectural Land Feasibility: What to Check Before You Buy Acreage",
            "url": "https://www.anvitam.com/blog/architectural-land-feasibility-before-you-buy-acreage-7687",
            "topics": ["land feasibility study", "due diligence before buying land", "water table percolation", "zoning setbacks access roads"],
            "suggested_anchors": ["pre-purchase architectural land feasibility checks", "what to evaluate before acquiring rural acreage"]
        },
        {
            "title": "Bamboo Cottages vs Brick Eco-Cottages: What Actually Costs Less Over 15 Years",
            "url": "https://www.anvitam.com/blog/bamboo-cottages-vs-brick-eco-cottages-what-actually-costs-less-over-15-years",
            "topics": ["engineered bamboo vs brick", "eco-cottage lifecycle cost", "hospitality chalet maintenance", "boron treatment bamboo"],
            "suggested_anchors": ["bamboo cottages vs brick eco-cottages over 15 years", "our 15-year lifecycle cost comparison for retreat chalets"]
        }
    ],
    "approved_services": [
        {
            "title": "Community Center Architecture & Design",
            "url": "https://www.anvitam.com/services/community-center",
            "topics": ["community center", "civic spaces", "gathering hall", "activity center", "social infrastructure"],
            "suggested_anchors": ["community and activity center architecture", "our community center spatial design services"]
        },
        {
            "title": "Homestays & Guest Houses",
            "url": "https://www.anvitam.com/services/homestay",
            "topics": ["homestay", "farmstay", "guest cottage", "bed and breakfast", "vernacular hospitality"],
            "suggested_anchors": ["vernacular homestay architecture", "our boutique homestay design services"]
        },
        {
            "title": "Eco Resorts & Glamping Masterplans",
            "url": "https://www.anvitam.com/services/eco-resort",
            "topics": ["eco resort", "glamping", "luxury tented camp", "resort masterplanning", "hospitality architecture"],
            "suggested_anchors": ["luxury eco-resort masterplanning", "our bioclimatic eco-resort architectural services"]
        },
        {
            "title": "Wellness & Yoga Retreats",
            "url": "https://www.anvitam.com/services/wellness-retreat",
            "topics": ["wellness retreat", "yoga shala", "natural biological pool", "spa design", "healing architecture"],
            "suggested_anchors": ["wellness retreat architecture", "chemical-free biological living pool engineering"]
        },
        {
            "title": "Weekend Villas & Second Homes",
            "url": "https://www.anvitam.com/services/weekend-villa",
            "topics": ["weekend villa", "villa architecture", "second home", "custom residence", "biophilic villa"],
            "suggested_anchors": ["biophilic weekend villa architecture", "our custom luxury villa design practice"]
        },
        {
            "title": "Agrotourism & Working Farm Destinations",
            "url": "https://www.anvitam.com/services/agrotourism",
            "topics": ["agrotourism", "farm visits", "educational farm", "u-pick orchard", "farm-to-table destination"],
            "suggested_anchors": ["agrotourism destination development", "our working farm masterplanning services"]
        },
        {
            "title": "Food Forests & Syntropic Agroforestry",
            "url": "https://www.anvitam.com/services/food-forest",
            "topics": ["food forest", "syntropic agriculture", "edible orchard", "7 layers", "perennial guild"],
            "suggested_anchors": ["syntropic food forest design", "multi-tier edible food forest planning"]
        },
        {
            "title": "Landscape Design & Masterplanning",
            "url": "https://www.anvitam.com/services/landscape-design",
            "topics": ["landscape design", "landscape architecture", "native planting", "outdoor living", "contour terracing"],
            "suggested_anchors": ["native ecological landscape design", "professional landscape architecture services"]
        },
        {
            "title": "Terrace & Balcony Gardens",
            "url": "https://www.anvitam.com/services/terrace-garden",
            "topics": ["terrace garden", "balcony garden", "rooftop garden", "urban farming", "container garden"],
            "suggested_anchors": ["engineered terrace garden design", "urban balcony sanctuary planning"]
        },
        {
            "title": "Backyard & Courtyard Gardens",
            "url": "https://www.anvitam.com/services/backyard-design",
            "topics": ["backyard design", "courtyard garden", "small garden", "outdoor patio", "privacy screening"],
            "suggested_anchors": ["custom backyard sanctuary design", "passive cooling courtyard garden planning"]
        },
        {
            "title": "Airbnb & Short-Term Rental Interior Design",
            "url": "https://www.anvitam.com/services/airbnb",
            "topics": ["airbnb interior design", "short term rental", "vacation rental ROI", "rental styling", "high RevPAR"],
            "suggested_anchors": ["high-yield Airbnb interior design", "boutique vacation rental design services"]
        },
        {
            "title": "Farm Retreats & Farmhouses",
            "url": "https://www.anvitam.com/services/farm-retreat",
            "topics": ["farmhouse architecture", "farm retreat", "rural homestead", "courtyard house", "sustainable estate"],
            "suggested_anchors": ["sustainable farm retreat architecture", "regenerative farmhouse masterplanning"]
        },
        {
            "title": "Permaculture Design & Land Masterplanning",
            "url": "https://www.anvitam.com/services/permaculture-design",
            "topics": ["permaculture design", "keyline hydrology", "swales", "water harvesting", "soil regeneration"],
            "suggested_anchors": ["permaculture land masterplanning", "regenerative site hydrology and permaculture design"]
        },
        {
            "title": "Interior Design & Spatial Styling",
            "url": "https://www.anvitam.com/services/interior-design",
            "topics": ["interior design", "natural lime plaster", "reclaimed timber", "biophilic interiors", "furniture layout"],
            "suggested_anchors": ["biophilic interior design", "natural lime plaster interior styling"]
        },
        {
            "title": "Architecture & Land Feasibility Consultation Report",
            "url": "https://www.anvitam.com/services/architecture-design-consultation-report",
            "topics": ["architecture consultation", "land feasibility report", "pre-purchase site review", "topographical audit"],
            "suggested_anchors": ["our comprehensive Architectural Land Feasibility Report", "booking a pre-construction site feasibility audit"]
        }
    ],
    "approved_projects": [
        {
            "title": "Bihar Natural Eco-Home (YourWeb3Guy Residence)",
            "url": "https://www.anvitam.com/projects/yourweb3guy",
            "topics": ["rammed earth home", "mud house case study", "passive cooling residence", "low-carbon architecture"],
            "suggested_anchors": ["our stabilized earth residential case study", "the YourWeb3Guy natural eco-home build"]
        },
        {
            "title": "The Beer Bar Biophilic Hospitality Venue",
            "url": "https://www.anvitam.com/projects/beer-bar",
            "topics": ["hospitality interior", "biophilic restaurant", "microbrewery design", "timber and stone venue"],
            "suggested_anchors": ["our commercial biophilic hospitality work at The Beer Bar", "our commercial dining spatial design"]
        },
        {
            "title": "Shalimar Luxury Residence & Garden",
            "url": "https://www.anvitam.com/projects/shalimar",
            "topics": ["luxury estate", "villa landscape", "courtyard garden", "high-end residential interior"],
            "suggested_anchors": ["our private residential execution at Shalimar", "the Shalimar estate landscape transformation"]
        },
        {
            "title": "Ramgarh Nainital Interior Project — Shiloh Experiences Hotel",
            "url": "https://www.anvitam.com/projects/ramgarh-nainital-interior-project-shiloh-experiences-hotel",
            "topics": ["mountain boutique hotel", "himalayan hospitality", "natural lime interiors", "ramgarh nainital", "hotel restoration"],
            "suggested_anchors": ["our mountain hospitality interior project at Shiloh Experiences in Ramgarh Nainital", "the Shiloh Experiences Hotel restoration"]
        },
        {
            "title": "Terrace Garden Vadodara — Organic Balcony Garden Sanctuary",
            "url": "https://www.anvitam.com/projects/terrace-garden-vadodara-organic-balcony-garden",
            "topics": ["urban terrace garden", "vadodara rooftop", "organic balcony garden", "sub-irrigation planters"],
            "suggested_anchors": ["our organic terrace garden sanctuary in Vadodara", "the Vadodara rooftop garden case study"]
        },
        {
            "title": "Vanvagado Farm Eco Forest Retreat",
            "url": "https://www.anvitam.com/projects/vanvagado-farm-eco-forest-retreat",
            "topics": ["eco forest retreat", "rustic farm estate", "native reforestation", "agro-retreat architecture"],
            "suggested_anchors": ["our Vanvagado Farm Eco Forest Retreat masterplan", "the Vanvagado regenerative farm sanctuary"]
        },
        {
            "title": "Kamba Agrotourism — Vardhaman Royal Organic Agri Farm",
            "url": "https://www.anvitam.com/projects/kamba-agrotourism-vardhaman-royal-organic-agri-farm",
            "topics": ["commercial agrotourism", "organic farm destination", "visitor center", "vardhaman royal farm"],
            "suggested_anchors": ["our large-scale masterplan at Kamba Agrotourism", "the Vardhaman Royal Organic Agri Farm project"]
        },
        {
            "title": "Kusum Vilas Palace Heritage Destination Development",
            "url": "https://www.anvitam.com/projects/kusum-vilas-palace-heritage-destination-development",
            "topics": ["heritage restoration", "palace conservation", "traditional stone masonry", "breathable lime mortar"],
            "suggested_anchors": ["our heritage conservation work at Kusum Vilas Palace", "the Kusum Vilas Palace destination development"]
        }
    ]
}

def register_new_blog(title: str, slug: str, meta_description: str = "", auto_save: bool = True) -> bool:
    """Registers a newly published blog into LINK_TAXONOMY."""
    url = f"https://www.anvitam.com/blog/{slug}"
    existing_urls = {item["url"] for item in LINK_TAXONOMY.get("approved_existing_blogs", [])}
    if url in existing_urls:
        return False
    
    words = [w.lower() for w in re.findall(r"\b[A-Za-z]{3,}\b", title) if w.lower() not in {"the", "and", "for", "with", "from", "how", "what", "why"}]
    LINK_TAXONOMY.setdefault("approved_existing_blogs", []).append({
        "title": title,
        "url": url,
        "topics": words[:5],
        "suggested_anchors": [title, f"our comprehensive guide on {title.lower()}"]
    })
    logger.info(f"Registered new blog in LINK_TAXONOMY: {title} ({url})")
    return True

def format_link_registry_for_prompt() -> str:
    """
    Renders the complete Anvitam Internal Link Taxonomy into a clean, categorized
    markdown reference for the Writing Agent's prompt.
    """
    output = []
    output.append("### ANVITAM AUTHORITATIVE INTERNAL LINK TAXONOMY & MATCHING RULES")
    output.append("MANDATORY: You MUST naturally weave at least 4 internal links into the article from the lists below.")
    output.append("Do NOT use mechanical phrases ('click here', 'learn more', 'visit our website'). Use natural descriptive anchors.\n")

    output.append("#### APPROVED EXISTING BLOGS (Choose at least 1-2 when relevant):")
    for item in LINK_TAXONOMY.get("approved_existing_blogs", []):
        output.append(f"- **<{item['url']}>** — Anchor: \"{item['suggested_anchors'][0]}\" (Topics: {', '.join(item['topics'][:3])})")

    output.append("\n#### CORE ANVITAM SERVICES (Choose at least 1-2 when relevant):")
    for item in LINK_TAXONOMY.get("approved_services", []):
        output.append(f"- **<{item['url']}>** — Anchor: \"{item['suggested_anchors'][0]}\" (Topics: {', '.join(item['topics'][:3])})")

    output.append("\n#### REAL CASE STUDIES & PROJECTS (Choose at least 1 when relevant):")
    for item in LINK_TAXONOMY.get("approved_projects", []):
        output.append(f"- **<{item['url']}>** — Anchor: \"{item['suggested_anchors'][0]}\" (Context: {', '.join(item['topics'][:3])})")

    return "\n".join(output)
