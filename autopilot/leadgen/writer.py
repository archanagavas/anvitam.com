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


def craft_introduction_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Archana's Authentic Human Voice — Warm, humble, professional peer introduction.
    Subject: A quick introduction — Anvitam
    """
    contact_name = (lead.get("contact_name") or lead.get("name") or "").strip()
    first_name = ""
    if contact_name and contact_name.lower() not in [
        "project lead", "head of development", "team", "inquiry", "partner", "general", "manager", "director"
    ]:
        first_name = contact_name.split()[0]

    salutation = f"Hi {first_name}," if first_name else "Hi,"

    company_name = (lead.get("company") or lead.get("organization") or lead.get("project_title") or "").strip()
    target_mention = company_name if company_name and company_name.lower() not in ["direct opportunity", "company", "lead", "n/a"] else "your work"

    subject = "A quick introduction — Anvitam"

    body = f"""{salutation}

I came across {target_mention} and wanted to reach out and introduce myself.

I'm Archana, Founder and Principal Architect at Anvitam. We work across sustainable architecture, landscape planning, and regenerative design, with a focus on creating thoughtful spaces that respond to the land, nature, and the people who use them.

Our work spans homes, farms, retreats, eco-homestays, hospitality spaces, and larger landscape and land-planning projects.

I always enjoy connecting with people working on interesting projects, and I thought it would be lovely to get to know your work as well. Perhaps there's an opportunity to collaborate on a future project, exchange ideas, or support each other along the way.

Would love to stay in touch and see where our work might align.

You can explore our work here: https://anvitam.com

Warm regards,
Archana Gavas
Founder & Principal Architect
Anvitam"""

    return {"subject": subject, "body": body.strip()}


def craft_landowner_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Private Landowners, Farmstead Owners & Acreage Buyers.
    Tailored to custom residential space planning, villa/farmhouse concepts, budget control, and 3D visuals.
    Tone: Warm, joyful, enthusiastic, and passionate about biophilic architecture.
    """
    contact_name = (lead.get("contact_name") or lead.get("name") or "").strip()
    first_name = contact_name.split()[0] if contact_name and contact_name.lower() not in ["project lead", "head of development", "team", "inquiry", "partner", "general", "manager"] else ""
    salutation = f"Hi {first_name}!" if first_name else "Hi!"

    location = lead.get("location") or "your area"
    city = location.split(",")[0].strip() if "," in location else location.strip()

    subject = f"Architectural Design & Space Planning for your land in {city} 🌱"

    body = f"""{salutation}

Hope you're having a wonderful and creative week! 😊

I came across your land and property plans in {city} — it sounds like such a beautiful canvas to build upon.

I'm Archana, an architect specializing in sustainable residential architecture, biophilic villas, and climate-attuned farmhouses. I'm truly passionate about shaping homes that blend seamlessly into their natural surroundings while staying comfortable, practical, and light on budget.

I would love to help you bring your dream space to life! Through 3D walkthroughs, sun-path orientation studies, and detailed spatial drawings, we can explore and visualize every room together before a single stone is laid.

I'd be thrilled to take a look at your land or sketches and share a few complimentary preliminary concept ideas tailored to your orientation and vision.

Here is a glimpse of some of our recent villa and farmstead projects:
{PORTFOLIO_URL}

Whenever you'd like to say hello, bounce some ideas around, or have an initial chat, feel free to pick a time that suits you best:
{TOPMATE_BOOKING_URL}

Really looking forward to hearing all about your vision!

Warmest regards,
{ARCHANA_NAME}
Principal Architect | Anvitam Studio
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_developer_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Estate Developers, Land Subdividers & Community Masterplanners.
    Tailored to masterplanning, spatial layouts, villa typologies, drawings, and 3D visuals.
    Tone: Warm, joyful, visionary, and eager to collaborate.
    """
    contact_name = (lead.get("contact_name") or lead.get("name") or "").strip()
    first_name = contact_name.split()[0] if contact_name and contact_name.lower() not in ["project lead", "head of development", "team", "inquiry", "partner", "general", "manager"] else ""
    salutation = f"Hi {first_name}!" if first_name else "Hi!"

    org_name = lead.get("organization") or lead.get("company") or "your development"
    location = lead.get("location") or "your area"
    city = location.split(",")[0].strip() if "," in location else location.strip()

    subject = f"Masterplanning & Architectural Concepts for {org_name} ✨"

    body = f"""{salutation}

Hope you're having a fantastic week! 😊

I’ve been following the inspiring work you're doing with {org_name} in {city} — the scope and vision of your development is truly exciting.

I'm Archana, an architect and masterplanner specializing in ecological community layouts, nature-integrated villa typologies, and biophilic architectural design.

I would love to explore collaborating with your team! Whether you're planning an upcoming phase, looking to maximize site value and view corridors, or need evocative 3D visualizations and drawing packages that captivate buyers, we bring fresh energy, rigorous spatial planning, and deep sustainable know-how.

I'd be delighted to offer a complimentary masterplan feasibility review for any parcel or upcoming typology you're evaluating.

A few recent masterplanning and residential concepts:
{PORTFOLIO_URL}

If you'd like to connect for a quick introductory video call to brainstorm ideas, you can pick a time directly here:
{TOPMATE_BOOKING_URL}

Wishing you tremendous success with your project, and really looking forward to connecting!

Warmest regards,
{ARCHANA_NAME}
Principal Architect | Anvitam Studio
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
    Tone: Warm, human, friendly, helpful ally with a complimentary site feasibility perk.
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

    contact_name = (lead.get("contact_name") or lead.get("name") or "").strip()
    first_name = contact_name.split()[0] if contact_name and contact_name.lower() not in ["project lead", "head of development", "team", "inquiry", "partner", "general", "manager"] else ""
    salutation = f"Hi {first_name}!" if first_name else "Hi!"

    subject = f"Architectural & land masterplanning collaboration for {org_name} 🏡"

    body = f"""{salutation}

Hope you're having a wonderful and productive week! 😊

I’ve been admiring your beautiful property listings and land portfolios across {location}.

I'm Archana, an architect specializing in ecological farm retreats, countryside villas, and site masterplanning.

When your clients are evaluating {parcel_type}, one of the biggest hurdles before making an offer is often picturing what can actually be built: {site_nuance}. Having clear architectural guidance turns hesitation into confidence.

I would love to be a helpful creative ally for your team! If you ever have a buyer sizing up a unique or tricky parcel, I’d be delighted to run a quick, complimentary preliminary site feasibility and orientation review for you — completely on the house.

A look at some of our recent retreat and residential projects:
{PORTFOLIO_URL}

Always glad to hop on a quick video chat to say hello and connect:
{TOPMATE_BOOKING_URL}

Wishing you many wonderful closings, and really looking forward to staying in touch!

Warmest regards,
{ARCHANA_NAME}
Principal Architect | Anvitam Studio
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_hospitality_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Week 2: Cafes, Restaurants & Boutique Hospitality.
    Tone: Warm, joyful, sensory, and passionate about vibrant dining atmospheres.
    """
    contact_name = (lead.get("contact_name") or lead.get("name") or "").strip()
    raw_first = contact_name.split()[0] if contact_name else ""
    invalid_names = {
        "project", "head", "team", "inquiry", "partner", "general", "manager",
        "development", "principal", "founder", "estates", "lead", "director",
        "studio", "estate", "design", "office", "admin", "info"
    }
    first_name = raw_first if raw_first and raw_first.lower() not in invalid_names else ""
    salutation = f"Hi {first_name}!" if first_name else "Hi!"

    location = lead.get("location") or "your area"
    city = location.split(",")[0].strip() if "," in location else location.strip()
    
    project_title = (lead.get("project_title") or "").strip()
    company = (lead.get("company") or lead.get("organization") or "").lower()
    all_context = f"{project_title} {company}".lower()

    if "cafe" in all_context or "coffee" in all_context or "roastery" in all_context:
        venue_noun = "cafe"
        clean_requirement = "cafe interior design"
        subject = f"Creative Cafe Interior & Spatial Design - {city} ☕"
    elif "restaurant" in all_context or "brasserie" in all_context or "dining" in all_context or "kitchen" in all_context or "eatery" in all_context:
        venue_noun = "restaurant"
        clean_requirement = "restaurant interior design"
        subject = f"Boutique Restaurant Interior Design - {city} 🍽️"
    elif "bar" in all_context or "pub" in all_context or "bistro" in all_context:
        venue_noun = "bistro"
        clean_requirement = "interior design and space planning"
        subject = f"Bistro Interior Design & Ambience - {city} ✨"
    else:
        venue_noun = "space"
        clean_requirement = project_title.lower() if project_title else "commercial interior design"
        subject = f"Commercial Interior & Biophilic Design - {city} 🌿"

    body = f"""{salutation}

Hope you're having a vibrant and wonderful week! 😊

I came across your plans for {clean_requirement} in {city} — such an exciting concept and a great addition to the area!

I'm Archana, an architect and spatial designer. I have a huge passion for creating warm, sensory dining spaces, artisan cafes, and boutique hospitality interiors that make guests feel instantly welcome, linger longer, and keep coming back.

I would love to help you bring the space to life! From optimizing guest seating flow and barista/kitchen ergonomics to warm lighting, natural textures, and immersive 3D walkthroughs, we make sure every square foot works beautifully and stays within budget.

I'd be delighted to take a look at your floor plan and share a complimentary initial layout concept with a few creative mood-boards.

You can explore some of our design aesthetics here:
{PORTFOLIO_URL}

If you'd like to chat or brainstorm ideas over a quick call, you can pick a time here:
{TOPMATE_BOOKING_URL}

Eagerly wishing you all the best with the launch, and hope to connect soon!

Warmest regards,
{ARCHANA_NAME}
Principal Architect | Anvitam Studio
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_retreat_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Week 3: Eco-Resorts, Wellness Retreats & Agritourism Estates.
    Anvitam Architecture & Ecological Design: Passive-Cooled Cottages, Closed-Loop Water & Food Forests.
    Tone: Warm, joyful, heartfelt, and deeply passionate about wellness sanctuaries.
    """
    contact_name = (lead.get("contact_name") or lead.get("name") or "").strip()
    first_name = contact_name.split()[0] if contact_name and contact_name.lower() not in ["project lead", "head of development", "team", "inquiry", "partner", "general", "manager"] else ""
    salutation = f"Hi {first_name}!" if first_name else "Hi!"

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

    subject = f"Ecological masterplanning & retreat design for {org_name} 🌱"

    body = f"""{salutation}

Hope you're having a wonderful and peaceful day! 😊

I came across {org_name} and was immediately drawn to your vision. It is so inspiring to see sanctuaries dedicated to nature, well-being, and authentic hospitality.

I'm Archana, an architect and ecological planner with a deep heart for {retreat_context}. We craft earth-conscious cottages, natural swimming pools, passive cooling strategies, and biophilic spaces that embrace the landscape while keeping long-term maintenance wonderfully low.

I would absolutely love to collaborate with you! If you are ever dreaming up a new phase, adding guest villas, or refining your masterplan, I’d be thrilled to prepare a complimentary initial spatial & contour concept review for your grounds.

Here is a look at a few of our recent farm retreats and wellness projects:
{PORTFOLIO_URL}

I'd be so happy to hop on a quick call to say hello and exchange ideas:
{TOPMATE_BOOKING_URL}

Sending lots of warmth and wishing you continued joy with your sanctuary!

Warmest regards,
{ARCHANA_NAME}
Principal Architect | Anvitam Studio
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}


def craft_architect_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Week 4: Architectural Studios & Design-Build Practices.
    Anvitam Architecture & Ecological Design: Bioclimatic Collaboration, 3D Modeling & Drawing Support.
    Tone: Warm, collegiate, supportive, and enthusiastic fellow architect.
    """
    contact_name = (lead.get("contact_name") or lead.get("name") or "").strip()
    first_name = contact_name.split()[0] if contact_name and contact_name.lower() not in ["project lead", "head of development", "team", "inquiry", "partner", "general", "manager"] else ""
    salutation = f"Hi {first_name}!" if first_name else "Hi!"

    org_name = lead.get("organization") or lead.get("company") or "your studio"

    subject = f"Design collaboration & 3D visual support for {org_name} ✨"

    body = f"""{salutation}

Hope you and your studio are having an inspiring and creative week! 😊

I've long admired the exceptional design standard and projects coming out of {org_name}.

I'm Archana, principal architect at Anvitam Studio. We specialize in bioclimatic architecture, ecological masterplanning, and high-detail 3D visual sets and drawing packages.

When studios hit peak deadlines or take on complex sites, having reliable, like-minded design support can be a lifesaver. We love collaborating with fellow architects as a dedicated remote design and modeling extension — taking care of sun-path simulations, 3D renderings, and spatial drawing sets with care and precision.

I would love to connect and see if we can support your practice when project surges arise! I'd be so happy to hop on a quick call just to say hello and share some of our drawing sets:
{PORTFOLIO_URL}

Direct chat link:
{TOPMATE_BOOKING_URL}

Wishing your studio continued creative inspiration, and looking forward to connecting!

Warmest regards,
{ARCHANA_NAME}
Principal Architect | Anvitam Studio
https://www.anvitam.com"""

    return {"subject": subject, "body": body.strip()}

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

    # Standard & High-intent client / partner outreach:
    # Uses Archana's signature warm, humble, peer-to-peer introduction:
    return craft_introduction_email(lead, gender=gender)
