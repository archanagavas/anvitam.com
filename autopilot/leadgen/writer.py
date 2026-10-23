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
    Tailored to custom residential space planning, villa/farmhouse concepts, budget control, and 3D visuals.
    """
    contact_name = (lead.get("contact_name") or lead.get("name") or "").strip()
    first_name = contact_name.split()[0] if contact_name and contact_name.lower() not in ["project lead", "head of development", "team", "inquiry", "partner", "general", "manager"] else ""
    salutation = f"Hi {first_name}," if first_name else "Hi,"

    location = lead.get("location") or "your area"
    city = location.split(",")[0].strip() if "," in location else location.strip()

    subject = f"Architectural Design & Space Planning - {city}"

    body = f"""{salutation}

I came across your land and building plans in {city}.

I'm an architect with 3.7+ years of experience across residential architecture, space planning, architectural drawings, detailing, materials, and 3D visualization.

I'd be happy to help develop a modern, practical design that works within your land, orientation, and budget while giving the home a distinctive look.

I can work remotely and take the project forward through video calls, drawings, and 3D visuals, so you can clearly review every space before implementation.

I'd be happy to share some relevant villa and farmhouse work and understand a little more about your site and the concept you have in mind.

If you'd like to discuss the concept or hop on a quick call, you can pick a time directly here:
{TOPMATE_BOOKING_URL}

Would love to hear from you.

Best,
{ARCHANA_NAME}
Principal Architect | Anvitam
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_developer_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Estate Developers, Land Subdividers & Community Masterplanners.
    Tailored to masterplanning, spatial layouts, villa typologies, drawings, and 3D visuals.
    """
    contact_name = (lead.get("contact_name") or lead.get("name") or "").strip()
    first_name = contact_name.split()[0] if contact_name and contact_name.lower() not in ["project lead", "head of development", "team", "inquiry", "partner", "general", "manager"] else ""
    salutation = f"Hi {first_name}," if first_name else "Hi,"

    org_name = lead.get("organization") or lead.get("company") or "your development"
    location = lead.get("location") or "your area"
    city = location.split(",")[0].strip() if "," in location else location.strip()

    subject = f"Masterplanning & Architectural Concepts - {org_name}"

    body = f"""{salutation}

Reaching out regarding your development at {org_name} in {city}.

I'm an architect with 3.7+ years of experience across residential masterplanning, space planning, architectural drawings, detailing, materials, and 3D visualization.

I'd be happy to help develop modern, practical spatial layouts and villa typologies that maximize your site value within budget while giving the development a distinctive look.

I can work remotely and take the project forward through video calls, drawings, and 3D visuals, so your team can clearly review the design before implementation.

I'd be happy to share some relevant masterplanning and residential work and understand a little more about your upcoming phases.

If you'd like to explore how we can support your project or hop on a quick call, you can pick a time directly here:
{TOPMATE_BOOKING_URL}

Would love to hear from you.

Best,
{ARCHANA_NAME}
Principal Architect | Anvitam
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
    Direct & Minimalist format: ultra-concise, client-centric, strictly no platforms mentioned.
    Accurately synchronizes the Subject, Requirement, and Venue Type to what the client actually needs.
    """
    contact_name = (lead.get("contact_name") or lead.get("name") or "").strip()
    raw_first = contact_name.split()[0] if contact_name else ""
    invalid_names = {
        "project", "head", "team", "inquiry", "partner", "general", "manager",
        "development", "principal", "founder", "estates", "lead", "director",
        "studio", "estate", "design", "office", "admin", "info"
    }
    first_name = raw_first if raw_first and raw_first.lower() not in invalid_names else ""
    salutation = f"Hi {first_name}," if first_name else "Hi,"

    location = lead.get("location") or "your area"
    city = location.split(",")[0].strip() if "," in location else location.strip()
    
    project_title = (lead.get("project_title") or "").strip()
    company = (lead.get("company") or lead.get("organization") or "").lower()
    all_context = f"{project_title} {company}".lower()

    if "cafe" in all_context or "coffee" in all_context or "roastery" in all_context:
        venue_noun = "cafe"
        clean_requirement = "cafe interior design"
        subject = f"Cafe Interior Design - {city}"
    elif "restaurant" in all_context or "brasserie" in all_context or "dining" in all_context or "kitchen" in all_context or "eatery" in all_context:
        venue_noun = "restaurant"
        clean_requirement = "restaurant interior design"
        subject = f"Restaurant Interior Design - {city}"
    elif "bar" in all_context or "pub" in all_context or "bistro" in all_context:
        venue_noun = "bistro"
        clean_requirement = "interior design and space planning"
        subject = f"Bistro Interior Design - {city}"
    else:
        venue_noun = "space"
        clean_requirement = project_title.lower() if project_title else "commercial interior design"
        subject = f"Commercial Interior Design - {city}"

    body = f"""{salutation}

I came across your requirement for the {clean_requirement} in {city}.

I'm an architect with 3.7+ years of experience across commercial interiors, space planning, architectural drawings, detailing, materials, and 3D visualization.

I'd be happy to help develop a modern, practical interior that works within your space and budget while giving the {venue_noun} a distinctive look.

I can work remotely and take the project forward through video calls, drawings, and 3D visuals, so you can clearly review the design before implementation.

I'd be happy to share some relevant interior work and understand a little more about the {venue_noun} and the concept you have in mind.

If you'd like to discuss the concept or hop on a quick call, you can pick a time directly here:
{TOPMATE_BOOKING_URL}

Would love to hear from you.

Best,
{ARCHANA_NAME}
Principal Architect | Anvitam
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

    # 5. Eco-Resort / Retreat / Wellness Sanctuary / Homestay
    if any(k in all_text for k in ["resort", "retreat", "wellness", "hotel", "homestay", "glamping", "chalet", "guest house", "steep-slope", "farmstay"]) or cohort == "retreats":
        return craft_retreat_lead_email(lead, gender=gender)

    # 6. Cafe / Restaurant / Boutique Dining
    if any(k in all_text for k in ["cafe", "coffee", "restaurant", "bistro", "dining", "eatery", "roastery", "brasserie"]) or cohort == "hospitality":
        return craft_hospitality_lead_email(lead, gender=gender)

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
