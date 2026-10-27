"""
Anvitam Master Daily Blueprint & Distribution Orchestrator.
Directly powered by the APPROVED TOPIC CATALOG provided by Archana Gavas.
Orchestrates:
- 1 Master In-Depth Architectural Guide daily (anvitam.com + Medium + Substack)
- 5 Independent Social Posts daily spaced across Buffer (Twitter/X, LinkedIn, Threads) + Bluesky + Mastodon
- 30-Day Milestone Tracker with automated Resend notification to Archana Gavas
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
import requests
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv(".env.autopilot")

logger = logging.getLogger("autopilot.blueprint")

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
ARCHANA_EMAIL = os.getenv("ARCHANA_NOTIFICATION_EMAIL", "ar.archanagavas@gmail.com")

from autopilot.topic_catalog import APPROVED_TOPICS, get_all_approved_topics

# Backwards compatibility aliases
THIRTY_DAY_PLAN = APPROVED_TOPICS[:30]
SIXTY_DAY_PLAN = APPROVED_TOPICS[:60]

def generate_social_posts_for_topic(topic: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generates 5 high-converting, SLAY-framework social posts tailored to the approved topic."""
    title = topic["title"]
    intent = topic["intent"]
    service_url = topic.get("primary_service", "https://www.anvitam.com/services/permaculture-design")
    
    return [
        {
            "slot": "08:30 AM",
            "type": "Myth-Buster Hook",
            "concept": f"Exposing the conventional mistake in {title.lower()}",
            "text": f"Most conventional advice about {title.lower()} is completely backwards.\n\nI see smart landowners and homeowners make this mistake every single month.\n\nThey hire a generic contractor or read surface-level internet tips.\nThey spend lakhs on materials that fail in the first monsoon.\n\nHere is the real truth from the field:\n\n1. Always start with site physics, not aesthetic finishes.\n2. Work with natural contours and soil biology instead of fighting them.\n3. Calculate the 10-year lifecycle cost before breaking ground.\n\nGood design is not an expense.\nIt is the only thing that protects your capital long term.\n\nRead our full technical breakdown at anvitam.com.",
            "twitter_text": f"Most advice on {title.lower()} is backwards.\n\nBefore spending capital, understand the ground physics and lifecycle economics.\n\nRead our deep dive: {service_url}",
            "threads_text": f"Why most people get {title.lower()} wrong:\n\nThey start with surface decoration instead of site biology and physics.\n\nHere's what our architectural practice does instead.\n\nCheck out the full guide on Anvitam.",
            "cta": f"What is your biggest question about {title.lower()}?"
        },
        {
            "slot": "11:30 AM",
            "type": "Show Your Work (Technical Proof)",
            "concept": f"Empirical field metrics for {title.lower()}",
            "text": f"Let's talk real numbers on {title.lower()}.\n\nContractors love vague estimates because it leaves room for budget creep.\n\nIn our studio, we measure three non-negotiable metrics before moving a single shovel:\n\n1. Soil plasticity and percolation rate.\n2. Water catchment volume per 1,000 sq ft.\n3. Thermal lag and passive cooling phase shifts.\n\nWhen you build with physics and biology, maintenance drops to near zero.\n\nStop guessing. Start measuring.",
            "twitter_text": f"Real numbers beat contractor guesswork on {title.lower()}.\n\nMeasure soil bearing, contour runoff, and thermal mass first.\n\nFull engineering framework: {service_url}",
            "threads_text": f"Vague estimates ruin building budgets.\n\nWhen we plan {title.lower()}, we measure:\n• Soil plasticity\n• Microclimate wind flow\n• 10-year lifecycle maintenance\n\nEngineering is about ground truth.",
            "cta": "Have you calculated the true maintenance cost of your project?"
        },
        {
            "slot": "02:30 PM",
            "type": "Horror Story Averted",
            "concept": f"The expensive shortcut to avoid in {title.lower()}",
            "text": f"The most expensive shortcut in {title.lower()}? Skipping site analysis to save money upfront.\n\nHere is the sequence that goes wrong:\nWater pools against the foundation.\nThe soil subsides.\nWork has to be demolished and rebuilt.\n\nPlanning isn't a luxury.\nIt's the cheapest insurance policy you will ever buy.",
            "twitter_text": f"The easiest way to burn money on a build: skip pre-construction site analysis.\n\nFixing mistakes after construction costs far more than designing properly from Day 1.\n\nPlan before you dig.",
            "threads_text": f"Skipping pre-construction feasibility on {title.lower()} is how foundations end up with water pooling against them.\n\nAlways analyze slope and soil before hiring a contractor.",
            "cta": "What was the most expensive lesson you learned during a build?"
        },
        {
            "slot": "05:30 PM",
            "type": "First-Principles Breakdown",
            "concept": f"How nature solves {title.lower()}",
            "text": f"Nature has already spent 3.8 billion years solving spatial engineering.\n\nWhy do we pour concrete when living root systems and breathable earthen walls perform better?\n\nIn our projects, we use:\n• Living biological filtration instead of harsh chemicals\n• Deep roof eaves for 8°C natural cooling\n• Perennial root guilds that build topsoil automatically\n\nLuxury is living in a home that breathes with the earth.",
            "twitter_text": f"Nature is the best structural engineer.\n\nLiving biological systems outperform dead concrete every single time.\n\nExplore our biophilic architecture: {service_url}",
            "threads_text": f"Why pour concrete when living biology does the job better?\n\nBreathable walls, natural microclimate cooling, and zero-chemical systems.\n\nThis is the future of sustainable estates.",
            "cta": "Would you rather live in a concrete box or a home that breathes?"
        },
        {
            "slot": "08:30 PM",
            "type": "Grand Slam Offer CTA",
            "concept": "Pre-Construction Land Feasibility & Strategy Audit",
            "text": f"Are you planning a project involving {title.lower()} this year?\n\nDon't sign a contractor contract until you know your site's physical and regulatory truth.\n\nIn a 30-minute Pre-Construction Strategy Audit with Ar. Archana Gavas, we review:\n• Your site topography, contours, and water flow\n• Subsoil constraints and foundation suitability\n• Phased masterplanning to prevent budget overruns\n\nReserve your session on Topmate: https://topmate.io/archanagavas\nOr explore our work: https://www.anvitam.com",
            "twitter_text": f"Planning {title.lower()} this year?\n\nBook a 30-min Pre-Construction Strategy Audit with Ar. Archana Gavas before signing any contractor:\nhttps://topmate.io/archanagavas",
            "threads_text": f"Before breaking ground on {title.lower()}:\n\nGet an independent architectural feasibility review.\n\nBook a 30-minute Strategy Audit with Ar. Archana Gavas on Topmate.",
            "cta": "Book your 1-on-1 strategy audit on Topmate."
        }
    ]

# ICP-first rotation: high-ticket landowner/developer topics (the studio's
# actual buyers) run before consumer garden/interior topics, which otherwise
# dilute the calendar for months. All 706 topics stay reachable.
ICP_PRIORITY_CATEGORIES = [
    "ecological_architecture", "architect_hiring", "farmhouse_design",
    "resort_design", "villa_architecture", "wellness_retreat",
    "airbnb_design", "agritourism", "permaculture_roi", "food_forest",
]
ICP_ORDERED_TOPICS = (
    [t for t in APPROVED_TOPICS if t.get("category") in ICP_PRIORITY_CATEGORIES]
    + [t for t in APPROVED_TOPICS if t.get("category") not in ICP_PRIORITY_CATEGORIES]
)

def get_blueprint_day(day_number: int) -> Dict[str, Any]:
    """
    Retrieves the strategic blueprint for any day number.
    Cycles through APPROVED_TOPICS in ICP-priority order (see above).
    """
    total_topics = len(ICP_ORDERED_TOPICS)
    idx = (day_number - 1) % total_topics
    cycle_num = ((day_number - 1) // total_topics) + 1

    selected_topic = ICP_ORDERED_TOPICS[idx]
    
    return {
        "day": day_number,
        "base_day": idx + 1,
        "cycle_number": cycle_num,
        "theme": selected_topic["title"],
        "category": selected_topic["category"],
        "primary_service": selected_topic.get("primary_service"),
        "master_blog": {
            "title": selected_topic["title"],
            "keyword": selected_topic["primary_keyword"],
            "focus": selected_topic["intent"],
            "secondary_keywords": selected_topic.get("secondary_keywords", [])
        },
        "social_posts": generate_social_posts_for_topic(selected_topic)
    }

def send_milestone_review_email(current_day: int = 30) -> Dict[str, Any]:
    """Sends the performance review notification to Archana Gavas via Resend."""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured. Cannot send milestone email.")
        return {"status": "skipped", "reason": "Missing RESEND_API_KEY"}

    subject = f"🌿 Anvitam Autopilot: Day {current_day} Strategic Milestone & Review Trigger"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #14532d; padding: 24px; color: white;">
        <h1 style="margin: 0; font-size: 22px;">Anvitam Architecture & Ecological Design</h1>
        <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Autonomous Syndication & Approved Lead Engine</p>
      </div>
      <div style="padding: 24px;">
        <h2>Greetings Ar. Archana Gavas,</h2>
        <p>Your <strong>Multi-Platform Distribution Cycle</strong> has completed Day {current_day}.</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #166534;">Strategic Distribution Summary:</h3>
          <ul style="margin-bottom: 0; padding-left: 20px;">
            <li><strong>Topic Pipeline:</strong> Strictly running approved catalog topics.</li>
            <li><strong>Articles Staged:</strong> High-intent draft master guides with full STARVE framework and internal links.</li>
            <li><strong>Independent Social Posts:</strong> 5 SLAY-framework posts dispatched daily.</li>
            <li><strong>Direct Conversion CTA:</strong> Topmate Pre-Construction Strategy Audit.</li>
          </ul>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Autonomous Growth Engine • Anvitam Studio</p>
      </div>
    </div>
    """

    recipient = ARCHANA_EMAIL
    sender = "Anvitam Autopilot <onboarding@resend.dev>"

    try:
        res = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            json={
                "from": sender,
                "to": [recipient],
                "subject": subject,
                "html": html_content
            },
            timeout=15
        )
        data = res.json()
        if res.status_code == 200:
            logger.info(f"Milestone review email sent successfully to {recipient} (ID: {data.get('id')})")
            return {"status": "success", "recipient": recipient, "id": data.get("id")}
        else:
            logger.warning(f"Resend returned {res.status_code}: {res.text}")
            return {"status": "failed", "error": res.text}
    except Exception as e:
        logger.error(f"Error sending milestone email: {e}")
        return {"status": "failed", "error": str(e)}

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Anvitam Approved Blueprint Manager")
    parser.add_argument("--day", type=int, default=1, help="Day number to inspect")
    args = parser.parse_args()
    
    plan = get_blueprint_day(args.day)
    print(f"Day {args.day} Plan: {json.dumps(plan, indent=2)}")
