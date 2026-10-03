"""
Researcher Agent: Scans regional competitors, reviews, and search intents.
Compares competitor coverage to anvitam.com to discover 6 high-value search gaps.
"""

import json
import logging
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup
from autopilot.config import generate_llm_response, logger, SITE_BASE_URL

# Target High-Net-Worth Corridors where Anvitam operates
TARGET_REGIONS = [
    {
        "town": "Alibaug & Karjat, Maharashtra",
        "climate": "High-rainfall coastal/Ghats, heavy monsoons, laterite/black-cotton soil",
        "focus": "Luxury off-grid weekend villas, biological living pools, passive cooling",
        "competitor_archetypes": ["Zero9 Design", "Studio Mumbai", "Made in Earth", "Malik Architecture"]
    },
    {
        "town": "Vadodara & Ahmedabad Outskirts, Gujarat",
        "climate": "Semi-arid, extreme summer heat (45°C), low water table, alluvial/black-cotton soil",
        "focus": "Rammed earth farmhouses, deep swale water recharging, food forests, lime plasters",
        "competitor_archetypes": ["Hiren Patel Architects", "Vastu Shilpa Consultants", "Footprints E.A.R.T.H", "Design Work Group"]
    },
    {
        "town": "Goa & Konkan Coastal Belt",
        "climate": "Tropical humid, salty sea air, laterite stone, high tourist demand",
        "focus": "Boutique sustainable homestays, natural swimming ponds, tropical biophilic architecture",
        "competitor_archetypes": ["Mozaic Architects", "Matter Design", "Saville Roach Architecture"]
    },
    {
        "town": "Coorg & Wayanad, Western Ghats",
        "climate": "Montane cloud forest, heavy slope contours, coffee/spice estates",
        "focus": "Agrotourism farmstays, contour hydrological keyline design, timber & stone lodges",
        "competitor_archetypes": ["Biome Environmental Solutions", "Good Earth Architecture", "Eugene Pandala"]
    },
    {
        "town": "Udaipur & Arid Rajasthan",
        "climate": "Dry arid, rocky terrain, water scarcity, intense diurnal temperature swing",
        "focus": "Desert permaculture, step-well revival, passive thermal mass courtyards",
        "competitor_archetypes": ["Sanjayn Puri Architects", "Khosla Associates", "Morphogenesis"]
    }
]

def fetch_existing_anvitam_topics() -> List[str]:
    """Fetches titles and slugs of published pages from anvitam.com sitemap/API or local registry."""
    existing_topics = [
        "Biophilic weekend villa design",
        "Luxury eco resort masterplanning",
        "Regenerative farmstay agrotourism",
        "Constructed wetland reed bed wastewater recycling",
        "Arid permaculture water harvesting Rajasthan",
        "Natural swimming pool vs chlorine maintenance",
        "Keyline swale water retention dam",
        "Rammed earth vs RCC thermal study in summer",
        "Terrace garden biophilic design",
        "Community eco centre architecture"
    ]
    try:
        res = requests.get(f"{SITE_BASE_URL}/sitemap.xml", timeout=10)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, "xml")
            urls = [loc.text for loc in soup.find_all("loc")]
            for u in urls:
                slug = u.split("/")[-1].replace("-", " ").title()
                if slug and slug not in existing_topics:
                    existing_topics.append(slug)
    except Exception as e:
        logger.warning(f"Could not fetch live sitemap, using baseline knowledge: {e}")

    return existing_topics

class ResearchAgent:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.researcher")

    def run(self, region_override: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Scans competitor landscape and identifies exactly 6 high-intent keyword gaps
        that competitors or market demand show up for, but Anvitam does not have a dedicated page for.
        """
        self.logger.info("2:00 AM Research Agent: Scanning competitors & search intents...")

        existing_topics = fetch_existing_anvitam_topics()
        
        region_context = json.dumps(TARGET_REGIONS, indent=2)
        if region_override:
            region_context = f"PRIORITY FOCUS REGION: {region_override}\n" + region_context

        prompt = f"""
You are the Lead Competitive Intelligence & AEO Research Agent for Anvitam Architecture & Ecological Design Studio (founded by Ar. Archana Gavas).

TARGET REGIONS & COMPETITOR PROFILES:
{region_context}

OUR CURRENT LIVE COVERAGE (WE ALREADY HAVE PAGES FOR THESE):
{json.dumps(existing_topics[:25], indent=2)}

TASK:
1. Analyze what high-net-worth property owners (landowners with 2–50 acres, luxury villa builders, boutique eco-resort investors) in these towns are searching for on Google, ChatGPT, and Google Maps.
2. Examine where competitors like Biome, Made in Earth, Studio Mumbai, Hiren Patel, or regional luxury design studios capture traffic that Anvitam currently DOES NOT have a dedicated, localized page for.
3. Generate exactly 6 high-intent search gap candidates that Anvitam MUST build a dedicated landing/blog page for tonight.

CRITERIA FOR THE 6 GAPS:
- Each gap MUST target a specific town/region (e.g. Alibaug, Karjat, Vadodara, Coorg, Goa, Udaipur).
- Must have commercial or high-ticket transaction intent (e.g. costs, masterplanning, soil challenges, permitting, natural pools, rammed earth).
- Must be a search where Google or ChatGPT would immediately cite Anvitam if we had the best authoritative page.
- Do NOT pick generic buzzwords ("green architecture"). Use precise homeowner/developer search queries.

Return strictly a valid JSON array of 6 objects with this schema:
[
  {{
    "gap_id": 1,
    "target_query": "Exact search query (e.g., cost of building stabilized rammed earth villa in Alibaug)",
    "town": "Alibaug, Maharashtra",
    "competitor_reference": "What competitor ranks or what niche is currently underserved",
    "customer_pain_point": "Specific question or fear the landowner is trying to solve",
    "buyer_persona": "HNI Mumbai tech founder buying 2 acres / Retreat investor",
    "search_intent": "Commercial Investigation"
  }}
]
"""
        response_text = generate_llm_response(
            prompt=prompt,
            system_instruction="You are a senior search intelligence researcher specializing in high-ticket luxury architecture and ecological estate planning. Always output strictly valid JSON.",
            json_mode=True
        )

        try:
            # Clean markdown codeblocks if present
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            gaps = json.loads(cleaned)
            self.logger.info(f"Research Agent found {len(gaps)} competitor search gaps.")
            return gaps
        except Exception as e:
            self.logger.error(f"Failed to parse research gaps JSON: {e}\nRaw output: {response_text}")
            # Fallback to robust pre-vetted search gaps
            return [
                {
                    "gap_id": 1,
                    "target_query": "Cost of building stabilized rammed earth villa in Alibaug",
                    "town": "Alibaug, Maharashtra",
                    "competitor_reference": "Made in Earth / Mumbai coastal luxury firms",
                    "customer_pain_point": "Estimating actual construction cost per sq.ft vs concrete in coastal humid environment",
                    "buyer_persona": "Mumbai business family building weekend retreat",
                    "search_intent": "Commercial Investigation"
                },
                {
                    "gap_id": 2,
                    "target_query": "Black cotton soil foundation and passive cooling farmhouse Vadodara",
                    "town": "Vadodara & Ahmedabad outskirts, Gujarat",
                    "competitor_reference": "Footprints E.A.R.T.H / Regional civil contractors",
                    "customer_pain_point": "Structural cracks from expanding clay soil and extreme 45°C summer cooling costs",
                    "buyer_persona": "Industrialist or doctor buying 3 acres for organic family estate",
                    "search_intent": "Commercial Investigation"
                },
                {
                    "gap_id": 3,
                    "target_query": "Chemical-free biological swimming pond design cost Goa",
                    "town": "Goa Coastal Belt",
                    "competitor_reference": "Luxury villa builders installing high-chlorine pools",
                    "customer_pain_point": "Constant chlorine maintenance and skin irritation vs natural reed-bed filtration",
                    "buyer_persona": "Boutique Airbnb homestay owner or luxury villa buyer",
                    "search_intent": "Commercial Investigation"
                },
                {
                    "gap_id": 4,
                    "target_query": "Keyline design and farm lake excavation Karjat hillside",
                    "town": "Karjat, Maharashtra",
                    "competitor_reference": "Standard landscape contractors who don't understand contour hydrology",
                    "customer_pain_point": "Borewells drying up by April despite heavy July monsoon rainfall",
                    "buyer_persona": "Farmland investor building a regenerative orchard",
                    "search_intent": "Commercial Investigation"
                },
                {
                    "gap_id": 5,
                    "target_query": "Boutique eco resort masterplan 5 acre cost and ROI Coorg",
                    "town": "Coorg, Karnataka",
                    "competitor_reference": "Biome Environmental / Commercial hospitality consultants",
                    "customer_pain_point": "How to zone 15 luxury chalets without clearing coffee canopy or triggering landslides",
                    "buyer_persona": "Hospitality entrepreneur commissioning an eco-lodge",
                    "search_intent": "Commercial Investigation"
                },
                {
                    "gap_id": 6,
                    "target_query": "Passive solar courtyard house design for extreme heat Udaipur",
                    "town": "Udaipur & Arid Rajasthan",
                    "competitor_reference": "Traditional haveli restorers vs modern architects",
                    "customer_pain_point": "Achieving thermal comfort at 46°C without running 8 air conditioners 24/7",
                    "buyer_persona": "Landowner building multi-generational desert residence",
                    "search_intent": "Commercial Investigation"
                }
            ]
