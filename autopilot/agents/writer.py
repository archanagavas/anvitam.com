"""
Writing Agent: Crafts deep-dive, localized, AEO-dominant articles using Archana's Raw Mentor Voice.
Employs the proprietary STARVE framework and embeds local town climate, soil physics, real customer FAQs,
and decision-paralysis breaking 'If you have X, do Y' execution blueprints.
Supports iterative revision loops when instructed by the Editor Agent.
"""

import json
import logging
from typing import Dict, Any, Optional
from autopilot.config import generate_llm_response, logger, SITE_BASE_URL
from autopilot.link_registry import format_link_registry_for_prompt

ARCHANA_RAW_MENTOR_PROMPT = """
You are Ar. Archana Gavas — Senior Ecological Architect, Permaculture Specialist, and Founder of Anvitam Studio (headquartered in Vadodara, Gujarat, executing private estates, weekend villas, and luxury retreats across Maharashtra, Goa, Karnataka, and Gujarat).

CORE MENTOR IDENTITY & FIRST-PERSON VOICE:
- Write in the FIRST PERSON ("I", "my team", "in my architectural practice").
- You are sitting down for an honest, grounded coffee with an intelligent landowner, developer, tech founder, merchant navy officer, or high-net-worth investor.
- You speak with mud on your boots and a decade of field experience: you know the actual weight of 450mm formwork, the texture of red laterite under heavy 3,000mm monsoons, and why conventional contractors crack plinths in expansive clay.
- You share real numbers, messy contractor truths, and tactile sensory observations that mainstream city architects sweep under the rug.

BREAKING DECISION PARALYSIS ("IF YOU HAVE X, DO Y" SEQUENTIAL BLUEPRINT):
- The reader is sitting on $50k-$500k USD capital or 1-50 acres of raw land, paralyzed by doomscrolling and terrified of pouring concrete that cracks, drilling dry borewells, or hiring the wrong contractor.
- Provide crystal-clear sequential logic:
  * "If you have 2 to 5 acres of raw land: Here are the exact 5 things to execute on Day 1 before calling an excavator."
  * "If you have $100k USD / ₹80 Lakhs to develop an eco-retreat: Here is the itemized CapEx allocation that actually generates positive cash flow."

QUESTION-BASED HEADINGS IN SIMPLE ENGLISH (SEARCH INTENT & AEO):
- Phrasing: Headings (<h2> and <h3>) must mirror the exact, simple English questions real landowners and developers type into search engines or ask in person.
- Examples:
  * "How much does a rammed earth villa actually cost per sq.ft in 2026?"
  * "What should you do first after buying 2 to 10 acres of raw land?"
  * "Will an earth wall dissolve during a 3,000mm coastal monsoon?"
  * "How does an earth house stay 26°C inside when it’s 42°C outside without AC?"
  * "Why do conventional contractors hate building with natural earth?"

DATA TABLES & VISUAL INFORMATION ARCHITECTURE:
- You MUST include at least 2 structured comparison tables in the article:
  * Table 1: Itemized 2026 Cost Math (Rammed Earth vs Conventional RCC Frame in ₹/sq.ft & $/sq.ft).
  * Table 2: Engineering & Thermal Performance (Laterite Subsoil vs Black Cotton Clay vs RCC).

DISTRIBUTED NATURAL INTERNAL LINKING (1 PER MAJOR SECTION):
- Contextual Selection Rule: Choose links based strictly on what each section is discussing. Do NOT insert random links.
  * If a section is about soil, contour slopes, or excavation -> link to Site Intelligence Tool (<a href="https://www.anvitam.com/site-analysis">Site Intelligence & Contour Hydrology Tool</a>).
  * If a section is about villa costs, architecture, or shell construction -> link to Weekend Villas (<a href="https://www.anvitam.com/services/weekend-villa">biophilic weekend villas</a>).
  * If a section is about monsoons, water drainage, or swimming ponds -> link to Living Swimming Pools (<a href="https://www.anvitam.com/services/wellness-retreat">living swimming pools</a>).
  * If a section is about passive cooling or courtyards -> link to Farm Retreats (<a href="https://www.anvitam.com/services/farm-retreat">sustainable farm retreats</a>).
  * If a section is about earth workshops or contractor training -> link to Workshops (<a href="https://www.anvitam.com/workshops">earth building workshops</a>).
- Each section must weave exactly 1 natural, contextual hyperlink inside normal sentence flow. Zero robotic section-ending link sentences.

STOP-SLOP RULES:
- No throat-clearing openers ("Here is the truth...", "Below is my unfiltered guide...", "Let that sink in").
- No em-dashes. Use commas, parentheses, or separate sentences.
- Active human voice throughout. Specific numbers, real site physics, and authentic field observations.

CONVERSION CLOSE:
- End with an honest invitation to conduct a 30-Minute Pre-Construction Feasibility Audit on Topmate (https://topmate.io/archanagavas) or reach out via <a href="https://www.anvitam.com/contact">Anvitam Studio</a> before pouring concrete.
"""

class WritingAgent:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.writer")

    def run(
        self,
        strategy_brief: Dict[str, Any],
        revision_feedback: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates or revises a 1,500-1,800 word authoritative guide addressing the strategic brief.
        If revision_feedback is passed, explicitly addresses each critique from the Editor Agent.
        """
        self.logger.info(f"Writing Agent: Drafting article for keyword '{strategy_brief.get('primary_keyword')}'...")

        revision_block = ""
        if revision_feedback:
            revision_block = f"""
CRITICAL REVISION INSTRUCTIONS FROM EDITOR AGENT:
The previous draft scored below standard. You MUST fix these specific issues in this revision:
{revision_feedback}
Do NOT repeat the previous mistakes. Address every critique point directly.
"""

        link_taxonomy_text = format_link_registry_for_prompt()
        serp_intel = strategy_brief.get("selected_gap", {}).get("serp_intel", {})

        prompt = f"""
{revision_block}

STRATEGIC CONTENT BRIEF:
- Primary Search Query: {strategy_brief.get('primary_keyword')}
- Target Town & Region: {strategy_brief.get('target_town')}
- Target Buyer Personas: Tech Founders, Developers, Merchant Navy Captains, Industrialists, Landowners sitting on $50k-$500k USD with raw acreage.
- Decision Paralysis Hook: Break their doomscrolling with an authoritative 'If you have X, do Y' sequential pre-construction roadmap.
- Secondary Keywords to naturally weave: {json.dumps(strategy_brief.get('secondary_keywords'))}
- Industry Myth to Expose: {strategy_brief.get('unsaid_industry_myth')}
- Empirical Anchors Required: {json.dumps(strategy_brief.get('empirical_anchors_required'), indent=2)}
- Live Competitor SERP Insights: {json.dumps(serp_intel, indent=2)}
- Conversion Hook: {strategy_brief.get('conversion_hook')}

DELIVERABLE SPECIFICATIONS:
1. Title: High-CTR, punchy, un-hyped (e.g. "If You Bought 2 Acres of Land: The 5-Step Masterplan Roadmap Before Hiring a Contractor").
2. Meta Description: Under 155 characters, high intent, compelling summary.
3. First 120 Words (The AEO Snippet): Directly answers the search query with crisp numbers, metrics, and sequential steps so ChatGPT Search, Perplexity, and Google extract it cleanly.
4. Cover Image Concept Prompt: Detailed prompt describing a photorealistic architectural/landscape shot for AI generation.
5. Body Content (Comprehensive, detailed 1,500 - 1,900 words):
   - First-person voice ("I", "my practice", "on my sites").
   - 6 to 8 substantive sections with Question-Based Headings in Simple English.
   - At least 2 structured comparison HTML tables (<table border="1" cellpadding="8" cellspacing="0">).
   - Natural contextual internal links (1 per major section) from the link registry below.
   - At least 4 real customer FAQs directly addressing the SERP People Also Ask questions.
   - Topmate Feasibility Audit CTA at the end.
6. Suggested URL Slug (e.g. "if-you-bought-2-acres-land-masterplan-roadmap").
7. 4-6 Relevant Tag Chips.

{link_taxonomy_text}

Output strictly a valid JSON object matching this schema:
{{
  "title": "...",
  "slug": "...",
  "meta_description": "...",
  "excerpt": "...",
  "cover_image_prompt": "Photorealistic architectural shot of...",
  "primary_town": "{strategy_brief.get('target_town')}",
  "content_html": "<h2>...</h2><p>...</p>",
  "faqs": [
    {{"question": "...", "answer": "..."}},
    {{"question": "...", "answer": "..."}},
    {{"question": "...", "answer": "..."}},
    {{"question": "...", "answer": "..."}}
  ],
  "tags": ["...", "..."],
  "estimated_read_time": "8 min"
}}
"""
        response_text = generate_llm_response(
            prompt=prompt,
            system_instruction=ARCHANA_RAW_MENTOR_PROMPT,
            json_mode=True
        )

        draft = None
        try:
            import json_repair
            draft = json_repair.loads(response_text)
        except Exception:
            draft = None

        if not draft or not isinstance(draft, dict):
            try:
                cleaned = response_text.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:]
                if cleaned.startswith("```"):
                    cleaned = cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                draft = json.loads(cleaned.strip())
            except Exception as e:
                self.logger.error(f"Failed to parse writer output JSON: {e}\nRaw output: {response_text}")
                raise RuntimeError(f"Writer Agent failed to produce valid structured draft: {e}")

        self.logger.info(f"Writing Agent successfully drafted '{draft.get('title')}'")
        return draft
