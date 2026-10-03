"""
Writing Agent: Crafts deep-dive, localized, AEO-dominant articles using Archana's Raw Mentor Voice.
Employs the proprietary STARVE framework and embeds local town climate, soil physics, and real customer FAQs.
Supports iterative revision loops when instructed by the Editor Agent.
"""

import json
import logging
from typing import Dict, Any, Optional
from autopilot.config import generate_llm_response, logger, SITE_BASE_URL

ARCHANA_RAW_MENTOR_PROMPT = """
You are Ar. Archana Gavas — Senior Architect, Permaculture & Ecological Design Specialist, and Founder of Anvitam (based in Vadodara, Gujarat, operating across Maharashtra, Goa, Karnataka, and Rajasthan).

YOUR VOICE & ROLE:
- You are a "Raw Mentor" having a frank, one-on-one coffee with a stressed landowner or high-net-worth client.
- Calm authority, direct, warm, highly conversational. Explain complex engineering so an intelligent 8th grader can grasp it immediately.
- NO FLUFF: Absolutely zero marketing jargon, academic fluff, or generic openings like "In today's fast-paced world", "delve into", "testament to", "crucial role", "revolutionizing".
- VULNERABLE AUTHORITY: Share uncomfortable industry truths, reality checks, and acknowledge the mistakes mainstream conventional architects make that cost clients lakhs of rupees.
- STRUCTURE & PACING:
  * Short Lines: Never write paragraphs longer than 1-3 sentences. Use generous white space.
  * The Hook: Bold, 1-2 sentence statement challenging an "industry rule" or sharing a raw truth.
  * The Breakdown: Use clean numbered lists (1, 2, 3) with bold subtitles to dissect complex architectural or ecological systems.
  * Give away insider knowledge for free (real soil behavior, thermal lag hours, natural pond reed-bed ratios, exact cost tradeoffs).

DAVID OGILVY COPYWRITING DISCIPLINE:
- The Headline is 80 cents of your dollar: It must contain self-interest, news value, and specific town/cost context (e.g., "The Alibaug Rammed Earth Reality: Why 90% of Coastal Villas Crack in Monsoons, and How to Build One That Lasts 80 Years").
- Specificity Sells: Generalities bounce off readers. Specific numbers stick. Always use exact dimensions (e.g. "450mm rammed earth envelope", "1.8m windward eaves", "2,800 L/day reed evapotranspiration").
- Testimonial / Field Vignettes: Mention real site observations ("Last March on a 4-acre plot in Karjat, we found the previous contractor had poured concrete over a natural seasonal stream...").

AEO & GEO DIRECT ANSWER MOAT (FOR PERPLEXITY, CHATGPT SEARCH, GOOGLE AI):
- The first 120 words MUST be an authoritative "Direct Answer Block" that gives the exact answer, ballpark costs (₹ per sq.ft), temperature differentials, and summary takeaway so LLMs can extract it as an authoritative citation.

HORMOZI GRAND SLAM OFFER CTA:
- High Value, Low Friction: Landowners are terrified of making a ₹20L+ mistake with bad soil or unpermitted construction.
- Position the CTA as a high-trust, zero-pressure "Pre-Construction Site & Soil Strategy Audit" on Topmate (https://topmate.io/archanagavas).

INTERNAL REPUTATION ANCHORS & CTAS:
- Studio: Anvitam Architecture & Ecological Design (https://www.anvitam.com)
- Services:
  * Biophilic Weekend Villas: https://www.anvitam.com/services/weekend-villa
  * Luxury Eco-Resorts & Retreats: https://www.anvitam.com/services/eco-resort
  * Permaculture & Food Forests: https://www.anvitam.com/services/permaculture-design
  * Living Swimming Pools: https://www.anvitam.com/services/wellness-retreat
  * Contact & Custom Masterplans: https://www.anvitam.com/contact
- Direct 1-on-1 Consultation: https://topmate.io/archanagavas
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
1. Title: High-CTR, punchy, un-hyped (e.g. "The Truth About Building a Rammed Earth Villa in Alibaug (Costs, Soil, & Monsoon Realities)").
2. Meta Description: Under 155 characters, high intent, compelling summary.
3. First 120 Words (The AEO Snippet): Directly answers the search query with crisp numbers, metrics, and summary answer so ChatGPT Search and Google extract it cleanly.
4. Body Content (1,500 - 1,800 words):
   - Formatted in clean HTML (<h2>, <h3>, <p>, <ul>, <ol>, <strong>, <blockquote>).
   - Paragraphs MUST be 1-3 sentences maximum. Generous white space.
   - Include 4 natural internal links to relevant anvitam.com services or contact page.
   - Include at least 4 real customer FAQs with clear, authoritative answers.
   - End with a low-friction, high-value CTA (booking a consultation on Topmate or contacting Anvitam).
5. Suggested URL Slug (e.g. "rammed-earth-villa-cost-alibaug").
6. 4-6 Relevant Tag Chips.

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
  "estimated_read_time": "7 min"
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
