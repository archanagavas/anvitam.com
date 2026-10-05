"""
Outreach Copywriting Engine in Archana's Authentic Human Voice.
Follows strict Cold Email & Super-Agent principles:
- Max 100 words (strictly 70-95 words).
- Pure peer-to-peer cold outreach (NEVER says "I saw your requirement" or "as per your posting").
- 3:1 recipient-to-sender ratio (leads with THEIR world, not vendor credentials).
- Low friction, single clear ask.
- Plain text, natural conversational tone of an architect.
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


def craft_realtor_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Week 1: Luxury Real Estate Brokers, Realtors & Estate Developers.
    Anvitam Architecture & Ecological Design: Farm Retreats, Weekend Villas & Masterplanning.
    Tone: Warm, human, peer-to-peer, zero sales pressure, generous perk, graceful exit.
    """
    first_name = lead.get("contact_name", "").split()[0] if lead.get("contact_name") and lead.get("contact_name") not in ["Project Lead", "there"] else "there"
    org_name = lead.get("organization") or lead.get("company") or "your team"
    location = lead.get("location") or "your area"

    subject = f"Architectural & land masterplanning for {org_name}"

    body = f"""Hi {first_name}, hope you're having a great week.

I'm Archana, an architect specializing in ecological farm retreats, weekend villas, and land masterplanning.

When your buyers or landowners are evaluating raw acreage or estate parcels, they often need an architect to see what's actually possible on the terrain: passive cooling, water harvesting, and villa layouts that sit naturally on the landscape.

If you or a client are ever sizing up a tricky parcel and want a quick second set of eyes on site orientation or building feasibility, I'm always happy to run a quick initial look for you, no strings attached.

A few recent retreat and villa projects: {PORTFOLIO_URL}

If you don't have anything on your desk right now, no worries at all. Feel free to keep us in mind down the road. Are you seeing much interest in acreage or retreat plots this season?

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
    first_name = lead.get("contact_name", "").split()[0] if lead.get("contact_name") and lead.get("contact_name") not in ["Project Lead", "there"] else "there"
    org_name = lead.get("organization") or lead.get("company") or "your venue"

    subject = f"Biophilic spatial design & natural airflow for {org_name}"

    body = f"""Hi {first_name}, hope you're having a good week.

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
    first_name = lead.get("contact_name", "").split()[0] if lead.get("contact_name") and lead.get("contact_name") not in ["Project Lead", "there"] else "there"
    org_name = lead.get("organization") or lead.get("company") or "your retreat"

    subject = f"Ecological masterplanning & retreat design for {org_name}"

    body = f"""Hi {first_name}, hope you're having a wonderful week.

I'm Archana, an architect specializing in regenerative farm retreats, wellness sanctuaries, and permaculture masterplanning.

We design passive-cooled earth cottages, decentralized water recycling, and nature-integrated spaces that respect the soil and keep long-term operating costs low.

If you're ever planning a new phase, adding guest villas, or looking at land expansion, I'd be happy to take a quick look at your terrain and share a few masterplanning concepts for your site.

A few recent farm retreat projects: {PORTFOLIO_URL}

If you're not building or expanding right now, completely understand. Feel free to keep our portfolio handy down the road. Are you working on any new projects this season?

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
    first_name = lead.get("contact_name", "").split()[0] if lead.get("contact_name") and lead.get("contact_name") not in ["Project Lead", "there"] else "there"
    org_name = lead.get("organization") or lead.get("company") or "your studio"

    subject = f"Design collaboration & 3D documentation with {org_name}"

    body = f"""Hi {first_name}, hope you're having a productive week.

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
    first_name = lead.get("contact_name", "").split()[0] if lead.get("contact_name") and lead.get("contact_name") not in ["Public Body", "Project Lead", "there"] else "there"
    org_name = lead.get("organization") or lead.get("company") or "your team"
    project_title = lead.get("project_title", "architectural and refurbishment project")

    subject = f"Architectural & space planning support for {org_name}"

    body = f"""Hi {first_name}, hope you're well.

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
    Dispatches cold email based on sector cohort and gender persona.
    Strictly under 100 words. Peer-to-peer. No vendor cliches.
    """
    lead_type = lead.get("lead_type")
    cohort = lead.get("cohort", "").lower()
    segment = lead.get("segment", "").lower()
    contact_name = lead.get("contact_name") or lead.get("name") or ""
    gender = lead.get("gender") or detect_gender_persona(contact_name)

    if lead_type == "public_procurement_rfp":
        return craft_procurement_rfp_email(lead)

    # Hard route based on segment rather than just cohort to prevent Realtors pitch going to Architects
    if "architect" in segment or "studio" in segment or "design" in segment:
        return craft_architect_lead_email(lead, gender=gender)
    elif "estate" in segment or "property" in segment or "realtor" in segment:
        return craft_realtor_lead_email(lead, gender=gender)
    elif "cafe" in segment or "restaurant" in segment or "hospitality" in segment:
        return craft_hospitality_lead_email(lead, gender=gender)
    elif "resort" in segment or "hotel" in segment or "retreat" in segment:
        return craft_retreat_lead_email(lead, gender=gender)
    
    # Fallbacks based on the active cohort
    if cohort == "realtors":
        return craft_realtor_lead_email(lead, gender=gender)
    elif cohort == "hospitality":
        return craft_hospitality_lead_email(lead, gender=gender)
    elif cohort == "retreats":
        return craft_retreat_lead_email(lead, gender=gender)
    else:
        return craft_architect_lead_email(lead, gender=gender)
