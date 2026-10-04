"""
Writing Agent: Crafts deep-dive, localized, AEO-dominant articles using Archana's Raw Mentor Voice.
Employs the proprietary STARVE framework and embeds local town climate, soil physics, and real customer FAQs.
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
- You are sitting down for an honest, grounded coffee with an intelligent landowner or high-net-worth estate investor.
- You speak with mud on your boots and a decade of field experience: you know the actual weight of 450mm formwork, the texture of red laterite under heavy Konkan downpours, and why conventional contractors crack plinths in expansive clay.
- You share real numbers, messy contractor truths, and tactile sensory observations that mainstream city architects sweep under the rug.

QUESTION-BASED HEADINGS IN SIMPLE ENGLISH (SEARCH INTENT & AEO):
- Phrasing: Headings (<h2> and <h3>) must mirror the exact, simple English questions real landowners and developers type into search engines or ask in person.
- Examples:
  * "How much does a rammed earth villa actually cost per sq.ft in 2026?"
  * "Can you use the soil from your own plot, or do you have to buy special dirt?"
  * "Will an earth wall dissolve during a 3,000mm Alibaug monsoon?"
  * "How does an earth house stay 26°C inside when it’s 42°C outside without AC?"
  * "Why do conventional contractors hate building with rammed earth?"

DATA TABLES & VISUAL INFORMATION ARCHITECTURE:
- You MUST include at least 2 structured comparison tables in the article:
  * Table 1: Itemized 2026 Cost Math (Rammed Earth vs Conventional RCC Frame in ₹/sq.ft).
  * Table 2: Engineering & Thermal Performance (Laterite Subsoil vs Black Cotton Clay vs RCC).
- Tables make the article deeply scannable, authoritative, and informative.

DISTRIBUTED NATURAL INTERNAL LINKING (1 PER MAJOR SECTION):
- Contextual Selection Rule: Choose links based strictly on what each section is discussing. Do NOT insert random links.
  * If a section is about soil, contour slopes, or excavation -> link to the Site Intelligence Tool or Permaculture/Soil Regeneration guides.
  * If a section is about villa costs, architecture, or shell construction -> link to Weekend Villas or Cement Walls cost analysis.
  * If a section is about monsoons, water drainage, or swimming ponds -> link to Living Pools or Traditional Rainwater Harvesting.
  * If a section is about thermal mass, passive cooling, or breezes -> link to Farm Retreats or Site Intelligence Tool.
  * If a section is about contractor excuses, equipment, or mason skills -> link to Nest N Nurture Earth Workshops or Natural Building lifecycle costs.
  * If a section references a specific region -> link to that Destination guide (e.g. Alibaug, Karjat, Goa).
- Each section must weave exactly 1 natural, contextual hyperlink inside normal sentence flow.
- ZERO mechanical formulas at paragraph ends ("For more information visit..."). Links must sit naturally inside sentences.

STOP-SLOP RULES:
- No throat-clearing openers ("Here is the truth...", "Below is my unfiltered guide...", "Let that sink in").
- No em-dashes. Use commas, parentheses, or separate sentences.
- Active human voice throughout. Specific numbers and real site observations.

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

        prompt = f"""
{revision_block}

STRATEGIC CONTENT BRIEF:
- Primary Search Query: {strategy_brief.get('primary_keyword')}
- Target Town & Region: {strategy_brief.get('target_town')}
- Secondary Keywords to naturally weave: {json.dumps(strategy_brief.get('secondary_keywords'))}
- Industry Myth to Expose: {strategy_brief.get('unsaid_industry_myth')}
- Empirical Anchors Required: {json.dumps(strategy_brief.get('empirical_anchors_required'), indent=2)}
- Conversion Hook: {strategy_brief.get('conversion_hook')}

DELIVERABLE SPECIFICATIONS:
1. Title: High-CTR, punchy, un-hyped (e.g. "How Much Does a Rammed Earth Villa Cost in Alibaug? (2026 Soil, Monsoon, and Engineering Reality)").
2. Meta Description: Under 155 characters, high intent, compelling summary.
3. First 120 Words (The AEO Snippet): Directly answers the search query with crisp numbers, metrics, and summary answer so ChatGPT Search and Google extract it cleanly.
4. Body Content (Comprehensive, detailed 1,400 - 1,800 words):
   - You MUST write a full-length, thorough master architectural guide in Ar. Archana Gavas's first-person voice ("I", "my practice", "on my sites").
   - Structure into 6 to 8 substantive sections where HEADINGS (<h2> and <h3>) ARE WRITTEN AS NATURAL SEARCH QUESTIONS IN SIMPLE ENGLISH:
     * e.g. "How much does a rammed earth villa actually cost per sq.ft in 2026?"
     * e.g. "Can you use the soil from your own plot, or do you have to buy special dirt?"
     * e.g. "Will an earth wall melt or wash away during a 3,000mm Konkan monsoon?"
     * e.g. "How does an earth house stay cool at 26°C without running air conditioning?"
     * e.g. "Why do local contractors try to talk you out of rammed earth?"
     * e.g. "What does maintenance look like over 50 years compared to concrete?"
   - Include at least 2 STRUCTURED COMPARISON HTML TABLES (with clean styling like <table border="1" cellpadding="8" cellspacing="0">):
     * Table 1: Itemized 2026 Cost Math (Rammed Earth vs RCC Frame in ₹/sq.ft).
     * Table 2: Engineering & Thermal Performance (Laterite Subsoil vs Black Cotton Clay vs RCC).
   - Each section MUST contain 2 to 4 rich, detailed paragraphs explaining the engineering realities, common contractor errors, exact metrics, and tactile site observations.
   - CONTEXTUAL INTERNAL LINKING RULES:
     * Weave EXACTLY ONE natural, contextual hyperlink into EACH major section.
     * CHOOSE BASED ON SECTION TOPIC — DO NOT ADD RANDOMLY!
       - Soil / Excavation / Grading -> Link to Site Intelligence Tool (<a href="https://www.anvitam.com/site-analysis">Site Intelligence & Contour Hydrology Tool</a>) or Soil Degradation blog (<a href="https://www.anvitam.com/blog/soil-degradation-is-killing-indian-farms-and-how-permaculture-actually-fixes-it">reversing soil degradation</a>).
       - Villa Shell / Costs / Living -> Link to Weekend Villas (<a href="https://www.anvitam.com/services/weekend-villa">biophilic weekend villas</a>) or Cement Heat blog (<a href="https://www.anvitam.com/blog/why-cement-walls-are-quietly-making-buildings-hotter-costlier-and-unhealthier">why cement walls drive up cooling costs</a>).
       - Monsoons / Ponds / Water -> Link to Living Swimming Pools (<a href="https://www.anvitam.com/services/wellness-retreat">living swimming pool</a>) or Rainwater Catchment blog (<a href="https://www.anvitam.com/blog/why-rainwater-harvesting-systems-worked-better-than-modern-systems">gravity-fed rainwater harvesting</a>).
       - Passive Cooling / Courtyards -> Link to Farm Retreats (<a href="https://www.anvitam.com/services/farm-retreat">sustainable farm retreats</a>) or Site Intelligence Tool (<a href="https://www.anvitam.com/site-analysis">Site Intelligence & Contour Hydrology Tool</a>).
       - Contractors / Mason Training -> Link to Earth Workshops (<a href="https://www.anvitam.com/workshops">Nest N Nurture earth building workshops</a>) or Lifecycle Cost blog (<a href="https://www.anvitam.com/blog/bamboo-cottages-vs-brick-eco-cottages-what-actually-costs-less-over-15-years">what natural building materials actually cost over 15 years</a>).
       - Regional Town Insights -> Link to the destination guide (e.g. <a href="https://www.anvitam.com/destinations/alibaug">ecological architecture in Alibaug</a>).
       - Permaculture & Land -> Link to Permaculture Masterplanning (<a href="https://www.anvitam.com/services/permaculture-design">permaculture masterplanning</a>) or Odiyar Farm Project (<a href="https://www.anvitam.com/projects/odiyar-farm-and-homestay-permaculture">our Odiyar Farm Permaculture project</a>).
     * ZERO robotic section-ending link sentences. Links must sit naturally inside real editorial sentences.
   - Include at least 4 real customer FAQs with clear, authoritative answers.
   - End with a single, high-value invitation for landowners to conduct a 30-Minute Pre-Construction Feasibility Audit on Topmate (https://topmate.io/archanagavas) or reach out via <a href="https://www.anvitam.com/contact">Anvitam Studio</a>.
5. Suggested URL Slug (e.g. "rammed-earth-villa-cost-alibaug").
6. 4-6 Relevant Tag Chips.

{link_taxonomy_text}


Output strictly a valid JSON object matching this schema:
{{
  "title": "...",
  "slug": "...",
  "meta_description": "...",
  "excerpt": "...",
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
