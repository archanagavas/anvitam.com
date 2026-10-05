"""
Weekly Industry Sector Cohorts & Niche Rotation Schedule.
Allows systematic testing of 4 global sectors across 4 weeks to measure response and booking rates:
- Week 1: Realtors, Luxury Real Estate Brokers, Land Developers & Estate Agents
- Week 2: Cafes, Restaurants, Boutique Hospitality, Farm-to-Table & Dining Spaces
- Week 3: Eco-Resorts, Wellness Retreats, Homestays, Farmsteads & Agritourism Estates
- Week 4: Architectural Studios, Interior Design Practices & Design-Build Contractors

Ratio: 95% Global (UK, US, Australia, UAE, Europe) · 5% Indian Regional (Alibaug, Goa, Gujarat).
Gender Balance: ~40% Female Founders/Directors · ~60% Male Principals/Owners.
Core Offer: $100 Pre-Construction Feasibility & Space Planning Consultation (via Topmate).
"""

from datetime import datetime
from typing import Dict, Any, List

COHORTS: Dict[str, Dict[str, Any]] = {
    "realtors": {
        "id": "realtors",
        "week_number": 1,
        "name": "Luxury Real Estate Brokers, Realtors & Estate Developers",
        "short_name": "Realtors & Land Agents",
        "osm_filters": [
            'node["office"="estate_agent"]["contact:email"]',
            'node["office"="estate_agent"]["email"]',
            'node["office"="property_management"]["contact:email"]',
            'node["office"="property_management"]["email"]'
        ],
        "pain_point": "When clients evaluate raw land, farm acreage, or estate parcels, they hesitate without architectural clarity on terrain slope, sun orientation, and what can actually be built.",
        "pitch_angle": "Architectural design, farm retreat masterplans, and passive-cooled villa concepts that turn raw land into living, sustainable ecosystems for private buyers and developers.",
        "intro_offer_name": "Complimentary Initial Site Feasibility & Terrain Orientation Review (Foot-in-the-door perk)",
        "why_target": "Realtors and land agents frequently advise high-net-worth buyers and landowners who need an architectural design partner to evaluate and masterplan raw parcels.",
        "female_nuance": "Emphasizes biophilic harmony, natural material palettes, and emotional connection to the landscape.",
        "male_nuance": "Emphasizes site feasibility, passive cooling performance, and efficient land utilization."
    },
    "hospitality": {
        "id": "hospitality",
        "week_number": 2,
        "name": "Cafes, Restaurants, Boutique Hospitality & Dining Spaces",
        "short_name": "Cafes & Dining Spaces",
        "osm_filters": [
            'node["amenity"="cafe"]["contact:email"]',
            'node["amenity"="cafe"]["email"]',
            'node["amenity"="restaurant"]["contact:email"]',
            'node["amenity"="restaurant"]["email"]'
        ],
        "pain_point": "Dining spaces often suffer from poor spatial circulation, noisy acoustics, uncomfortable microclimates, or dull interior aesthetics that hurt table turnover and customer dwell time.",
        "pitch_angle": "Bioclimatic spatial layouts, outdoor garden microclimates, natural materials, and 3D architectural interior detailing that increase footfall and patron dwell time.",
        "intro_offer_name": "30-min Spatial Feasibility & Interior Flow Consultation ($100 introductory session)",
        "why_target": "Hospitality owners constantly seek distinctive spatial ambiance, natural material palettes, and optimized seating layouts that generate high revenue per sqft.",
        "female_nuance": "Emphasizes sensorial atmosphere, natural greenery integration, organic material textures, and warm hospitality flow.",
        "male_nuance": "Emphasizes table density optimization, acoustic reverberation control, HVAC/ventilation efficiency, and contractor-ready drawings."
    },
    "retreats": {
        "id": "retreats",
        "week_number": 3,
        "name": "Eco-Resorts, Wellness Retreats, Homestays & Agritourism Estates",
        "short_name": "Eco-Resorts & Retreats",
        "osm_filters": [
            'node["tourism"="hotel"]["contact:email"]',
            'node["tourism"="hotel"]["email"]',
            'node["tourism"="guest_house"]["contact:email"]',
            'node["tourism"="guest_house"]["email"]',
            'node["tourism"="chalet"]["contact:email"]'
        ],
        "pain_point": "Setting up an eco-retreat or agritourism farm is expensive; conventional contractors over-engineer RCC concrete structures that destroy the landscape and incur high energy bills.",
        "pitch_angle": "Decentralized ecological masterplanning, rammed earth/natural cottages, solar orientation, and constructed wetlands to create high-occupancy nature retreats.",
        "intro_offer_name": "30-min Agro-Tourism Feasibility & Masterplan Consultation ($100 introductory session)",
        "why_target": "Estate and retreat owners need specialized ecological expertise (solar path, soil permaculture, decentralized water) before committing lakhs to construction.",
        "female_nuance": "Emphasizes regenerative land stewardship, calm wellness spaces, guest emotional connection, and biophilic serenity.",
        "male_nuance": "Emphasizes CapEx reduction, passive cooling energy savings, rainwater aquifer recharge, and structural durability."
    },
    "architects": {
        "id": "architects",
        "week_number": 4,
        "name": "Architectural Studios, Interior Design Practices & Design-Build Contractors",
        "short_name": "Architects & Studios",
        "osm_filters": [
            'node["office"="architect"]["contact:email"]',
            'node["office"="architect"]["email"]'
        ],
        "pain_point": "Practices get bottlenecked during peak project cycles and need high-caliber design support for space planning, comprehensive construction drawings, and photorealistic 3D visuals.",
        "pitch_angle": "White-label 3D BIM visualization, bioclimatic site analysis, AutoCAD/Revit drawing packages, and environmental documentation support.",
        "intro_offer_name": "30-min Collaboration Feasibility Call ($100 introductory session)",
        "why_target": "Global architectural practices frequently outsource drafting, 3D visualization, and site solar modeling to reduce overhead while keeping client delivery high.",
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
    "adnan", "neil", "rahul", "amit", "vikram", "rohit", "arun", "sanjay"
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
