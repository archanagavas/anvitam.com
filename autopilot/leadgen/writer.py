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
    Week 1: Luxury Real Estate Brokers, Realtors & Land Developers (80-95 words).
    """
    first_name = lead.get("contact_name", "").split()[0] if lead.get("contact_name") and lead.get("contact_name") != "Project Lead" else "there"
    org_name = lead.get("organization") or lead.get("company") or "your brokerage"
    location = lead.get("location") or "your market"

    subject = f"3D site visuals & land planning for {org_name}"

    body = f"""Hi {first_name},

Noticed the estate portfolio {org_name} is representing in {location}.

Raw land and unbuilt villa parcels often sit on the market because buyers struggle to visualize the potential. My studio creates 3D visual concepts, sun-path studies, and pre-construction masterplans so buyers can see the final build and commit faster.

A few recent site visual sets: {PORTFOLIO_URL}

Open to exploring if this could help move your upcoming listings?

Best,
{ARCHANA_NAME}"""

    return {"subject": subject, "body": body.strip()}


def craft_hospitality_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Week 2: Cafes, Restaurants & Boutique Hospitality (75-90 words).
    """
    first_name = lead.get("contact_name", "").split()[0] if lead.get("contact_name") and lead.get("contact_name") != "Project Lead" else "there"
    org_name = lead.get("organization") or lead.get("company") or "your venue"
    location = lead.get("location") or "your area"

    subject = f"Spatial flow & architectural concepts for {org_name}"

    body = f"""Hi {first_name},

Noticed the atmosphere you've built at {org_name} in {location}.

In hospitality, seating flow, natural light, and acoustic comfort directly drive table turnover and dwell time. My studio designs bioclimatic layouts, natural material palettes, and 3D space plans for boutique venues before fit-out.

A few of our spatial sets: {PORTFOLIO_URL}

Worth a quick chat to exchange ideas?

Best,
{ARCHANA_NAME}"""

    return {"subject": subject, "body": body.strip()}


def craft_retreat_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Week 3: Eco-Resorts, Wellness Retreats & Agritourism Estates (80-95 words).
    """
    first_name = lead.get("contact_name", "").split()[0] if lead.get("contact_name") and lead.get("contact_name") != "Project Lead" else "there"
    org_name = lead.get("organization") or lead.get("company") or "your retreat"
    location = lead.get("location") or "your estate"

    subject = f"Ecological masterplanning & farm retreat concepts for {org_name}"

    body = f"""Hi {first_name},

Noticed the landscape setting of your retreat in {location}.

Building on rural terrain often comes with high energy bills when conventional contractors pour concrete that overheats. My studio designs passive-cooled rammed earth villas, decentralized water recycling, and permaculture masterplans that preserve the land while keeping CapEx low.

A few recent farm retreat projects: {PORTFOLIO_URL}

Open to a quick chat to explore feasibility?

Best,
{ARCHANA_NAME}"""

    return {"subject": subject, "body": body.strip()}


def craft_architect_lead_email(lead: Dict[str, Any], gender: str = "neutral") -> Dict[str, str]:
    """
    Week 4: Architectural Studios & Design-Build Practices (80-95 words).
    """
    first_name = lead.get("contact_name", "").split()[0] if lead.get("contact_name") and lead.get("contact_name") != "Project Lead" else "there"
    org_name = lead.get("organization") or lead.get("company") or "your practice"
    location = lead.get("location") or "your area"

    subject = f"Design & 3D architectural collaboration with {org_name}"

    body = f"""Hi {first_name},

Noticed {org_name}'s recent work around {location}.

When practices hit peak project cycles, drawing production and 3D visualization often become bottlenecks. My studio partners with firms to handle space planning, construction detailing, and site sun-path modeling as a remote extension of your team.

We keep visual turnarounds fast so your architects stay focused on client delivery. A few recent collaborative sets: {PORTFOLIO_URL}

Worth a quick chat to see if we'd be a good backup for overflow work?

Best,
{ARCHANA_NAME}"""

    return {"subject": subject, "body": body.strip()}


def craft_procurement_rfp_email(lead: Dict[str, Any]) -> Dict[str, str]:
    """
    Refurbishment & Public Tenders (80-90 words) — Peer architectural introduction, NOT a bid pitch.
    """
    first_name = lead.get("contact_name", "").split()[0] if lead.get("contact_name") and lead.get("contact_name") != "Public Body" else "there"
    org_name = lead.get("organization") or lead.get("company") or "your team"
    project_title = lead.get("project_title", "heritage project")

    subject = f"Architectural & space planning support for {org_name}"

    body = f"""Hi {first_name},

Reaching out regarding the architectural and refurbishment work underway at {org_name}.

My studio specializes in bioclimatic architecture, space planning, and comprehensive 3D visuals. We help teams develop practical, distinctive schemes that respect character while keeping construction costs in budget.

You can see a few of our completed visual and masterplan sets here: {PORTFOLIO_URL}

I'd love to learn more about the project vision. Are you open to a quick introductory chat?

Best,
{ARCHANA_NAME}"""

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
