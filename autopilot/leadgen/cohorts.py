"""
Weekly Industry Sector Cohorts & Niche Rotation Schedule.
Allows systematic testing of 4 global sectors across 4 weeks to measure response and booking rates:
- Week 1: Global Realtors, Luxury Land Brokers, Estate Developers & Acreage Agents (UK, US, Australia, UAE, Europe, India)
- Week 2: Boutique Hospitality, Farm-to-Table Dining, Cafes & Commercial Space Owners
- Week 3: Eco-Resorts, Wellness Retreats, Homestays & Agritourism Farmland Owners (Global + Indian retreat belts)
- Week 4: Architectural Studios, Design-Build Contractors, and Private HNW Investors (Tech Founders, Merchant Navy Captains, Industrialists)

Ratio: 90% Global (US, UK, Australia, UAE, Europe, NRI Corridors) · 10% Indian Regional (Alibaug, Goa, Western Ghats, Gujarat).
Gender Balance: ~40% Female Founders/Directors · ~60% Male Principals/Owners.
Core Hook: Breaking decision paralysis for landowners & capital investors ("If you have X, do Y before spending on concrete").
Core Offer: $100 Pre-Construction Feasibility & Space Planning Consultation (via Topmate).
"""

from datetime import datetime
from typing import Dict, Any, List

COHORTS: Dict[str, Dict[str, Any]] = {
    "realtors": {
        "id": "realtors",
        "week_number": 1,
        "name": "Global Luxury Real Estate Brokers, Land Developers & Acreage Agents",
        "short_name": "Realtors & Land Agents",
        "target_geos": ["United States", "United Kingdom", "Australia", "United Arab Emirates", "Spain/Portugal", "India (Alibaug/Goa/Pune)"],
        "osm_filters": [
            'node["office"="estate_agent"]["contact:email"]',
            'node["office"="estate_agent"]["email"]',
            'node["office"="property_management"]["contact:email"]',
            'node["office"="property_management"]["email"]'
        ],
        "pain_point": "HNW buyers with $100k-$1M+ capital hesitate on raw acreage because they suffer from decision paralysis: they can't visualize site slope, sun orientation, permitting constraints, or true construction cost math.",
        "pitch_angle": "Architectural feasibility masterplans, bioclimatic 3D space layouts, and off-grid eco-villa concepts that give land buyers instant confidence to close deals on raw parcels.",
        "intro_offer_name": "Complimentary Initial Site Feasibility & Terrain Orientation Review (Foot-in-the-door perk)",
        "why_target": "Realtors and land brokers are the primary gatekeepers for landowners who need an architectural feasibility partner before pouring concrete.",
        "female_nuance": "Emphasizes biophilic harmony, natural material palettes, sensory landscape flow, and ecological legacy.",
        "male_nuance": "Emphasizes site feasibility, slope hydrology, passive cooling ROI, and maximum usable land yield."
    },
    "hospitality": {
        "id": "hospitality",
        "week_number": 2,
        "name": "Boutique Hospitality, Farm-to-Table Cafes, Restaurants & Dining Spaces",
        "short_name": "Cafes & Dining Spaces",
        "target_geos": ["UK", "US", "Australia", "UAE", "Europe", "India"],
        "osm_filters": [
            'node["amenity"="cafe"]["contact:email"]',
            'node["amenity"="cafe"]["email"]',
            'node["amenity"="restaurant"]["contact:email"]',
            'node["amenity"="restaurant"]["email"]'
        ],
        "pain_point": "Dining spaces suffer from sterile industrial aesthetics, poor indoor-outdoor flow, noisy acoustics, or excessive AC bills that hurt customer dwell time and table turnover.",
        "pitch_angle": "Bioclimatic spatial layouts, microclimate garden courtyards, rammed-earth/lime plaster acoustics, and 3D architectural detailing that increase customer dwell time and revenue per sqft.",
        "intro_offer_name": "30-min Spatial Feasibility & Interior Flow Consultation ($100 introductory session)",
        "why_target": "Hospitality owners and founders constantly seek distinctive, Instagrammable natural atmospheres that drive footfall and recurring reservations.",
        "female_nuance": "Emphasizes sensorial atmosphere, organic textures, natural greenery integration, and guest emotional connection.",
        "male_nuance": "Emphasizes table density optimization, acoustic reverberation control, HVAC efficiency, and contractor-ready drawings."
    },
    "retreats": {
        "id": "retreats",
        "week_number": 3,
        "name": "Eco-Resorts, Wellness Retreats, Glamping, Homestays & Agritourism Farmlands",
        "short_name": "Eco-Resorts & Retreats",
        "target_geos": ["Global (Costa Rica, Bali, Southern Europe, US, Australia)", "UAE/Oman", "India (Goa, Western Ghats, Alibaug, Udaipur)"],
        "osm_filters": [
            'node["tourism"="hotel"]["contact:email"]',
            'node["tourism"="hotel"]["email"]',
            'node["tourism"="guest_house"]["contact:email"]',
            'node["tourism"="guest_house"]["email"]',
            'node["tourism"="chalet"]["contact:email"]'
        ],
        "pain_point": "Landowners with 1 to 50+ acres want to build revenue-generating retreats but get trapped in decision paralysis — conventional contractors over-engineer RCC concrete boxes that overheat, rack up ₹15L+ in utility bills, and destroy the land.",
        "pitch_angle": "The 'If you have 2–10 acres, do this 5-stage roadmap' blueprint: decentralized water swales, biological living pools (zero chlorine), rammed earth/natural cottages, and solar passive zoning.",
        "intro_offer_name": "30-min Agro-Tourism Feasibility & Masterplan Consultation ($100 introductory session)",
        "why_target": "Estate and retreat owners need specialized ecological expertise (solar path, soil permaculture, biological water) before committing capital to construction.",
        "female_nuance": "Emphasizes regenerative land stewardship, calm wellness spaces, guest emotional restoration, and biophilic serenity.",
        "male_nuance": "Emphasizes CapEx reduction, passive cooling energy savings, rainwater aquifer recharge, and structural durability."
    },
    "architects": {
        "id": "architects",
        "week_number": 4,
        "name": "Global Architectural Studios, Developers & HNW Investors (Founders, Merchant Navy, Industrialists)",
        "short_name": "Architects & Private Investors",
        "target_geos": ["Global (US, UK, Europe, UAE, Australia, Singapore)", "India"],
        "osm_filters": [
            'node["office"="architect"]["contact:email"]',
            'node["office"="architect"]["email"]'
        ],
        "pain_point": "Design practices need specialized ecological/BIM support during peak delivery; while HNW professionals (Tech Founders, Merchant Navy Captains, Industrialists) sitting on $100k-$500k USD are doomscrolling without knowing the exact sequential roadmap to build.",
        "pitch_angle": "White-label 3D BIM visualization, bioclimatic site analysis, AutoCAD/Revit drawing packages, and turn-key pre-construction feasibility blueprints.",
        "intro_offer_name": "30-min Collaboration Feasibility Call ($100 introductory session)",
        "why_target": "Global architectural practices frequently outsource drafting, while private investors seek authoritative guidance to de-risk high-ticket projects.",
        "female_nuance": "Emphasizes peer-to-peer design synergy, collaborative aesthetic alignment, and meticulous detailing.",
        "male_nuance": "Emphasizes production turnaround speed, construction-ready drawing compliance, and seamless remote coordination."
    }
}

# Common female first names for persona balancing (~40% target)
FEMALE_FIRST_NAMES = {
    "emma", "sarah", "laura", "sophia", "sophie", "jessica", "rachel", "emily",
    "chloe", "hannah", "charlotte", "olivia", "megan", "zoe", "jodi", "elena",
    "maria", "priya", "ananya", "neha", "pooja", "amanda", "claire", "rebecca",
    "victoria", "anna", "katie", "lucy", "natalie", "stephanie", "vanessa",
    "isabella", "grace", "alice", "fiona", "melissa", "alison", "nicole",
    "michelle", "samantha", "danielle", "natasha", "karen", "susan", "lisa"
}

# Common male first names for persona balancing (~60% target)
MALE_FIRST_NAMES = {
    "jonathan", "mark", "david", "james", "michael", "robert", "paul", "chris",
    "tom", "daniel", "alex", "matt", "simon", "peter", "andrew", "richard",
    "william", "john", "steven", "brian", "kevin", "george", "edward", "harry",
    "samuel", "anthony", "benjamin", "charles", "ryan", "jason", "nicholas",
    "adnan", "neil", "rahul", "amit", "vikram", "rohit", "arun", "sanjay",
    "tariq", "khalid", "omar", "marcus", "stefan", "florian", "lars"
}


def detect_gender_persona(name: str) -> str:
    """
    Detects gender persona based on first name.
    Returns: 'female' (~40% target) | 'male' (~60% target) | 'neutral'
    """
    if not name or not isinstance(name, str):
        return "neutral"

    first_word = name.strip().split()[0].lower().replace(",", "").replace(".", "")
    if first_word in FEMALE_FIRST_NAMES:
        return "female"
    if first_word in MALE_FIRST_NAMES:
        return "male"
    return "neutral"


def get_active_cohort(override: str = None) -> Dict[str, Any]:
    """
    Returns the active sector cohort based on current week of the month (1-4)
    or by explicit override string.
    """
    if override and override.lower() in COHORTS:
        return COHORTS[override.lower()]

    # Default to current calendar week % 4
    week_num = datetime.now().isocalendar()[1]
    cohort_keys = ["realtors", "hospitality", "retreats", "architects"]
    active_key = cohort_keys[(week_num - 1) % 4]
    return COHORTS[active_key]


def get_all_cohorts_summary() -> List[Dict[str, Any]]:
    """Returns overview of all 4 rotational cohorts for dashboard and reports."""
    return list(COHORTS.values())
