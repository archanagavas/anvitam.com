"""
Outreach Copywriting Engine in Archana's Authentic Human Voice.
Follows strict Cold Email, Super-Agent, and Stop-Slop principles:
- Max 100 words (strictly 60-90 words).
- Tailored specifically to recipient archetype (Landowner, Developer, Realtor, Resort, Cafe, Architect, Media, RFP).
- Adapts dynamically to terrain and site conditions (Coastal, Hillside, Rural Acreage, Desert, Historic).
- Pure peer-to-peer human tone (NEVER says "I noticed your portfolio" or "help move listings").
- 3:1 recipient-to-sender ratio (leads with THEIR world, not vendor credentials).
- Generous foot-in-the-door perk (complimentary parcel feasibility review, layout look, or research package).
- Low friction, single clear ask with graceful "if not right now" exit.
- Plain text, natural conversational tone of Principal Architect Archana Gavas.
"""

import sys
import logging
from typing import Dict, Any
from .config import (
    TOPMATE_BOOKING_URL,
    PORTFOLIO_URL,
    ARCHANA_NAME
)
from .cohorts import detect_gender_persona

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

logger = logging.getLogger("autopilot.leadgen.writer")


def extract_terrain_context(lead: Dict[str, Any]) -> str:
    """
    Extracts terrain, climate, or architectural context from lead metadata.
    Ensures pitches speak directly to the recipient's actual site conditions:
    - Coastal / Waterfront
    - Hillside / Sloped terrain
    - Rural acreage / Homestead
    - Desert / Arid microclimate
    - Heritage / Historic structure
    """
    text = " ".join([
        str(lead.get("project_details", "")),
        str(lead.get("project_title", "")),
        str(lead.get("location", "")),
        str(lead.get("segment", "")),
        str(lead.get("company", "")),
        str(lead.get("organization", ""))
    ]).lower()

    if any(k in text for k in ["waterfront", "coastal", "beach", "island", "alibaug", "goa"]):
        return "coastal"
    elif any(k in text for k in ["hillside", "slope", "mountain", "cliff", "valley", "topography"]):
        return "hillside"
    elif any(k in text for k in ["desert", "dubai", "arid", "uae", "gulf"]):
        return "desert"
    elif any(k in text for k in ["rural", "acreage", "homestead", "farmland", "ranch", "pasture", "scottish", "highland", "nsw"]):
        return "acreage"
    elif any(k in text for k in ["heritage", "historic", "refurbishment", "restoration"]):
        return "heritage"
    return "general"


def craft_landowner_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Private Landowners, Farmstead Owners & Acreage Buyers.
    Anvitam Architecture & Ecological Design: Farmhouses, Weekend Villas & Permaculture Masterplanning.
    """
        location = lead.get("location") or "your land"
    terrain = extract_terrain_context(lead)

    if terrain == "coastal":
        site_nuance = "capturing sea breezes, protecting against salt air, and designing shaded verandas"
        subject = f"Architectural design for your coastal retreat in {location}"
    elif terrain == "hillside":
        site_nuance = "contour grading, view orientation, and villa layouts that step naturally down the hill"
        subject = f"Architectural design for your hillside retreat in {location}"
    elif terrain == "acreage":
        site_nuance = "passive cooling, water harvesting, and farmhouse layouts that sit naturally in the landscape"
        subject = f"Farmhouse & retreat design for your land in {location}"
    elif terrain == "desert":
        site_nuance = "thermal mass, passive shading, and courtyard microclimates to stay naturally cool"
        subject = f"Villa & retreat design for your land in {location}"
    else:
        site_nuance = "passive cooling, water harvesting, and villa layouts that sit naturally on the landscape"
        subject = f"Architectural design for your land in {location}"

    body = f"""Hi,

I'm Archana, an architect specializing in ecological farm retreats, weekend villas, and land masterplanning.

When planning to build on {location}, the most critical step is reading the terrain before breaking ground: {site_nuance}.

If you're exploring what to build on your parcel and want a second set of eyes on site orientation or building feasibility, I'm always happy to take a quick initial look at the terrain for you, no strings attached.

A few recent villa and farm retreat projects: {PORTFOLIO_URL}

If you're not planning to build right now, completely understand. Keep our portfolio handy.

Warmly,
{ARCHANA_NAME}
Principal Architect, Anvitam Architecture & Ecological Design
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_developer_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Estate Developers, Land Subdividers & Community Masterplanners.
    Anvitam Architecture & Ecological Design: Sustainable Masterplans, Villa Typologies & Infrastructure.
    """
        org_name = lead.get("organization") or lead.get("company") or "your team"
    location = lead.get("location") or "your region"

    subject = f"Ecological masterplanning & villa concepts for {org_name}"

    body = f"""Hi,

I'm Archana, an architect specializing in ecological masterplanning, farm retreat communities, and bioclimatic villa typologies.

When masterplanning acreage subdivisions or gated eco-communities, aligning road networks with natural water drainage and optimizing plot solar orientation can cut infrastructure costs significantly while making every parcel more desirable to buyers.

If you're currently evaluating an upcoming parcel or masterplan layout, I'd be glad to share a preliminary density and solar-path review for your site, no strings attached.

A few recent masterplan and villa projects: {PORTFOLIO_URL}

If your masterplanning is already set for this cycle, no worries at all. Keep us in mind for future phases.

Warmly,
{ARCHANA_NAME}
Principal Architect, Anvitam Architecture & Ecological Design
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_media_press_email(lead: Dict[str, Any]) -> Dict[str, str]:
    """
    Architecture Press, Sustainability Media & Editorial Desks (Backlink Outreach).
    Shares real empirical research case studies (rammed earth, passive cooling, constructed wetlands).
    """
        org_name = lead.get("company") or lead.get("organization") or "your publication"
    pitch_angle = lead.get("pitch_angle") or "Empirical study on passive bioclimatic cooling and rammed earth vs. conventional RCC in Western India"

    story_topic = pitch_angle.split(":")[0] if ":" in pitch_angle else "Ecological Architecture Research"
    subject = f"Editorial story pitch for {org_name}: {story_topic}"

    body = f"""Hi,

I'm Archana, principal architect at Anvitam Architecture & Ecological Design. I've been following {org_name}'s coverage on sustainable habitats and vernacular building.

We recently documented a completed case study on: {pitch_angle}.

We have the high-res photography, thermal data sets, and architectural working drawings ready. I'd love to share the full package as an exclusive editorial contribution or guest feature for {org_name} if this fits your upcoming editorial calendar.

A brief look at our completed work: {PORTFOLIO_URL}

If your editorial lineup is currently full, no problem at all. Keep us in mind for future ecological design stories.

Warmly,
{ARCHANA_NAME}
Principal Architect, Anvitam Architecture & Ecological Design
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_realtor_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Week 1: Luxury Real Estate Brokers, Realtors & Land Agents.
    Anvitam Architecture & Ecological Design: Farm Retreats, Weekend Villas & Masterplanning.
    Tone: Warm, human, peer-to-peer, zero sales pressure, generous perk, graceful exit.
    """
        org_name = lead.get("organization") or lead.get("company") or "your team"
    location = lead.get("location") or "your area"
    terrain = extract_terrain_context(lead)

    if terrain == "coastal":
        parcel_type = "coastal parcels and beach estate plots"
        site_nuance = "salt breeze, view orientation, and coastal villa layouts"
    elif terrain == "hillside":
        parcel_type = "hillside lots and sloped estate terrain"
        site_nuance = "contour grading, slope drainage, and stepping villa layouts"
    elif terrain == "desert":
        parcel_type = "villa plots and desert parcels"
        site_nuance = "passive shading, thermal mass, and microclimates that stay naturally cool"
    elif terrain == "acreage":
        parcel_type = "rural acreage and homestead parcels"
        site_nuance = "passive cooling, water harvesting, and layouts that sit naturally on the landscape"
    else:
        parcel_type = "raw acreage and estate parcels"
        site_nuance = "passive cooling, water harvesting, and villa layouts that sit naturally on the landscape"

    subject = f"Architectural & land masterplanning for {org_name}"

    body = f"""Hi,

I'm Archana, an architect specializing in ecological farm retreats, weekend villas, and land masterplanning.

When your buyers or landowners are evaluating {parcel_type}, they often need an architect to see what's actually possible on the terrain: {site_nuance}.

If you or a client are ever sizing up a tricky parcel and want a quick second set of eyes on site orientation or building feasibility, I'm always happy to run a quick initial look for you, no strings attached.

A few recent retreat and villa projects: {PORTFOLIO_URL}

If you don't have anything on your desk right now, no worries at all. Keep us in mind.

Warmly,
{ARCHANA_NAME}
Principal Architect, Anvitam Architecture & Ecological Design
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_hospitality_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Week 2: Cafes, Restaurants & Boutique Hospitality.
    Anvitam Architecture & Ecological Design: Biophilic Interiors, Courtyard Airflow & Natural Materials.
    """
        org_name = lead.get("organization") or lead.get("company") or "your venue"

    subject = f"Biophilic spatial design & natural airflow for {org_name}"

    body = f"""Hi,

I'm Archana, an architect specializing in biophilic spaces, natural material palettes (earth, lime, and timber), and indoor-outdoor dining flow.

In hospitality, natural ventilation, acoustic softness, and daylight make all the difference in guest comfort and dwell time.

If you're ever looking at a new space, planning a patio extension, or refreshing your layout, I'm always happy to share a few spatial flow ideas or do a quick plan review for you.

A few recent hospitality and retreat spaces: {PORTFOLIO_URL}

If you're not planning any changes right now, no worries at all. Just wanted to introduce ourselves. Hope the rest of your week goes well.

Warmly,
{ARCHANA_NAME}
Principal Architect, Anvitam Architecture & Ecological Design
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_retreat_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Week 3: Eco-Resorts, Wellness Retreats & Agritourism Estates.
    Anvitam Architecture & Ecological Design: Passive-Cooled Cottages, Closed-Loop Water & Food Forests.
    """
        org_name = lead.get("organization") or lead.get("company") or "your retreat"
    terrain = extract_terrain_context(lead)

    if terrain == "coastal":
        retreat_context = "nature retreats and coastal eco-stays that capture sea breezes while protecting the landscape"
    elif terrain == "hillside":
        retreat_context = "wellness sanctuaries on sloped terrain that integrate with natural contours and views"
    elif terrain == "desert":
        retreat_context = "desert retreats with passive thermal mass, courtyard shading, and closed-loop water"
    else:
        retreat_context = "regenerative farm retreats, wellness sanctuaries, and permaculture masterplanning"

    subject = f"Ecological masterplanning & retreat design for {org_name}"

    body = f"""Hi,

I'm Archana, an architect specializing in {retreat_context}.

We design passive-cooled earth cottages, decentralized water recycling, and nature-integrated spaces that respect the soil and keep long-term operating costs low.

If you're ever planning a new phase, adding guest villas, or looking at land expansion, I'd be happy to take a quick look at your terrain and share a few masterplanning concepts for your site.

A few recent farm retreat projects: {PORTFOLIO_URL}

If you're not building or expanding right now, completely understand. Keep our portfolio handy.

Warmly,
{ARCHANA_NAME}
Principal Architect, Anvitam Architecture & Ecological Design
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_architect_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Week 4: Architectural Studios & Design-Build Practices.
    Anvitam Architecture & Ecological Design: Bioclimatic Collaboration, 3D Modeling & Drawing Support.
    """
        org_name = lead.get("organization") or lead.get("company") or "your studio"

    subject = f"Design collaboration & 3D documentation with {org_name}"

    body = f"""Hi,

I'm Archana, principal architect at Anvitam. We specialize in bioclimatic architecture, ecological masterplanning, and detailed 3D design documentation.

When practices hit peak project cycles, complex site modeling and space planning can easily bottleneck client delivery. We often collaborate with fellow studios as a remote design and drafting extension.

If your team ever needs a second pair of hands for 3D visual sets, sun-path modeling, or drawing packages during a rush, I'm always happy to hop on a quick call and see how we can assist.

A few recent collaborative sets: {PORTFOLIO_URL}

If you're fully covered right now, no problem at all. Just glad to be on your radar.

Best,
{ARCHANA_NAME}
Principal Architect, Anvitam Architecture & Ecological Design
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_procurement_rfp_email(lead: Dict[str, Any]) -> Dict[str, str]:
    """
    Refurbishment, Heritage & Public Tenders.
    Anvitam Architecture & Ecological Design: Bioclimatic & Heritage Architecture, Space Planning.
    """
        org_name = lead.get("organization") or lead.get("company") or "your team"
    project_title = lead.get("project_title", "architectural and refurbishment project")

    subject = f"Architectural & space planning support for {org_name}"

    body = f"""Hi,

I'm Archana, principal architect at Anvitam Architecture & Ecological Design.

Reaching out regarding the architectural and refurbishment work at {org_name} for {project_title}. My practice specializes in bioclimatic architecture, heritage-sensitive space planning, and detailed 3D design documentation.

We focus on practical, enduring schemes that honor site character while keeping build budgets and carbon footprints controlled.

If your team is reviewing expressions of interest or exploratory concepts, I'd welcome the opportunity to share our capability package and discuss how we can support your delivery.

Our recent work: {PORTFOLIO_URL}

If the timing isn't right, no problem at all. Wishing you a smooth project rollout.

Best regards,
{ARCHANA_NAME}
Principal Architect, Anvitam Architecture & Ecological Design
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def draft_lead_email(lead: Dict[str, Any], use_llm: bool = False) -> Dict[str, str]:
    """
    Intelligently routes each lead to their exact archetype:
    1. Media / Press / Backlink -> Editorial research & case study pitch
    2. Public Procurement / Tender / RFP -> Heritage & bioclimatic architectural pitch
    3. Private Landowner / Farm Owner -> Farmhouse / Villa / Retreat design (NEVER a cafe!)
    4. Estate Developer / Subdivider -> Eco-community masterplanning & villa typologies
    5. Real Estate Broker / Land Agent -> Client land feasibility partner
    6. Cafe / Restaurant / Dining -> Biophilic spatial flow & courtyard ventilation
    7. Resort / Retreat / Homestay -> Eco-cottages & wellness sanctuary masterplanning
    8. Architecture Studio -> Peer collaboration, 3D visualization & drawing overflow
    """
    category = lead.get("category", "").lower()
    lead_type = lead.get("lead_type", "").lower()
    cohort = lead.get("cohort", "").lower()
    segment = lead.get("segment", "").lower()
    company = (lead.get("company") or lead.get("organization") or "").lower()
    details = (lead.get("project_details") or "").lower()
    contact_name = lead.get("contact_name") or lead.get("name") or ""
    gender = lead.get("gender") or detect_gender_persona(contact_name)

    all_text = f"{segment} {company} {details} {category} {lead_type}"

    # 1. Media / Press / Backlink (NEVER send architecture drafting overflow or cafe design to press!)
    if category in ["backlink", "press", "media"] or any(k in all_text for k in ["magazine", "editorial", "press", "journal", "media"]):
        return craft_media_press_email(lead)

    # 2. Public Procurement / RFP / Heritage
    if lead_type == "public_procurement_rfp" or "tender" in lead.get("lead_id", "").lower() or ("heritage" in all_text and "trust" in all_text):
        return craft_procurement_rfp_email(lead)

    # 3. Private Landowner / Farmstead Owner / Acreage Owner (NEVER send cafe design to a landowner!)
    if any(k in all_text for k in ["landowner", "private land", "farmstead owner", "farm owner"]) or (
        "acreage" in details and not any(k in all_text for k in ["broker", "realtor", "agency", "estate agent", "developer", "development marketing"])
    ):
        return craft_landowner_lead_email(lead, gender=gender)

    # 4. Estate Developer / Community Masterplanner
    if any(k in all_text for k in ["development marketing", "subdivision", "land developer", "estate developer", "masterplanned community"]):
        return craft_developer_lead_email(lead, gender=gender)

    # 5. Cafe / Restaurant / Boutique Dining
    if any(k in all_text for k in ["cafe", "coffee", "restaurant", "bistro", "dining", "eatery"]) or cohort == "hospitality":
        return craft_hospitality_lead_email(lead, gender=gender)

    # 6. Eco-Resort / Retreat / Wellness Sanctuary / Homestay
    if any(k in all_text for k in ["resort", "retreat", "wellness", "hotel", "homestay", "glamping", "chalet", "guest house"]) or cohort == "retreats":
        return craft_retreat_lead_email(lead, gender=gender)

    # 7. Real Estate Broker / Land Agent
    if any(k in all_text for k in ["estate agent", "realtor", "broker", "property management", "land agent"]) or cohort == "realtors":
        return craft_realtor_lead_email(lead, gender=gender)

    # 8. Architecture Studio / Design Firm
    if any(k in all_text for k in ["architect", "studio", "design practice", "design-build"]):
        return craft_architect_lead_email(lead, gender=gender)

    # Fallbacks based on active cohort
    if cohort == "realtors":
        return craft_realtor_lead_email(lead, gender=gender)
    elif cohort == "hospitality":
        return craft_hospitality_lead_email(lead, gender=gender)
    elif cohort == "retreats":
        return craft_retreat_lead_email(lead, gender=gender)
    else:
        return craft_architect_lead_email(lead, gender=gender)
