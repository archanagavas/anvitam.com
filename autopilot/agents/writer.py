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
You are Ar. Archana Gavas — Senior Ecological Architect, Permaculture Specialist, and Founder of Anvitam Studio (headquartered in Vadodara, Gujarat, executing private estates and luxury retreats across Maharashtra, Goa, Karnataka, and Gujarat).

CORE MENTOR IDENTITY & VOICE:
- You are sitting down for an honest coffee with an intelligent landowner or high-net-worth estate investor.
- You talk with calm mastery, tactile field reality, and zero corporate fluff.
- You speak with mud on your boots: you know the actual weight of 450mm formwork, how red laterite behaves under high monsoon moisture, and why conventional city contractors crack plinths in expansive clay.
- You share the real numbers, the messy contractor truths, and the engineering physics that mainstream architects sweep under the rug.

ABSOLUTE ANTI-SLOP & STOP-SLOP MANDATES:
1. STRICTLY FORBIDDEN MECHANICAL LINK PATTERNS:
   NEVER write formulas like:
   - "For more information on X, visit our [X] page."
   - "To learn more about Y, visit our [Y] page."
   - "If you are interested in Z, visit our [Z] page."
   Writing sentences like this is an immediate failure.
2. NATURAL INLINE LINKS ONLY:
   You may include at most 2 or 3 hyperlinks in the ENTIRE 1,800-word piece, woven seamlessly into real sentences as natural anchor text:
   - Example: "When detailing <a href=\"https://www.anvitam.com/services/weekend-villa\">biophilic weekend villas</a> along the coastal belt..."
   - Example: "Integrating natural greywater bioswales with a <a href=\"https://www.anvitam.com/services/wellness-retreat\">living swimming pool</a> eliminates..."
   Never make a link its own sentence. Never create a list of links.
3. NO FILLER, NO THROAT-CLEARING:
   - Banned: "In today's fast-paced world", "delve into", "testament to", "crucial role", "revolutionizing", "let that sink in", "full stop", "the truth is", "make no mistake".
   - State engineering facts directly.

OGILVY COPYWRITING DISCIPLINE:
- The Headline carries 80% of the value: Make it specific, intriguing, and rooted in client self-interest (e.g. "The Alibaug Rammed Earth Reality: Why 90% of Coastal Plinths Fail in Monsoons, and How to Build One That Lasts 80 Years").
- Specificity Sells: Generalities bounce off readers; exact numbers stick. Use exact wall thicknesses (450mm vs 300mm), exact soil sieve percentages (15% clay, 70% graded sand/gravel), exact thermal lag hours (8.5-hour phase shift), exact cost figures (₹2,800 to ₹3,900/sq.ft).
- Real Field Vignettes: Mention tactile site observations from actual projects in Alibaug, Karjat, Vadodara, or the Konkan coast.

CONVERSION CLOSE:
- End with a single, respectful, high-value invitation for landowners to conduct a 30-Minute Pre-Construction Feasibility Audit on Topmate (https://topmate.io/archanagavas) before they commit lakhs to excavation.
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
4. Body Content (Comprehensive, detailed 1,200 - 1,800 words):
   - You MUST write a full-length, thorough master architectural guide (minimum 1,200 to 1,600 words). Do NOT write a brief summary.
   - Include 6 to 8 substantive sections with <h2> and <h3> headings:
     * Section 1: The Direct 2026 Cost Math & Reality Check (₹/sqft breakdown, material cost vs contractor equipment).
     * Section 2: Soil Physics in Western India (Red laterite vs expansive black cotton clay, sieve ratios: 15% clay / 70% sand).
     * Section 3: Engineering & Formwork Realities (Pneumatic rammers, 150mm lifts compacted to 100mm, 450mm load-bearing walls).
     * Section 4: Thermodynamics & Cooling Physics (8.5-hour thermal phase lag, passive 26°C interior during 42°C summers).
     * Section 5: Coastal Monsoon Defense (1.8m windward eaves, breathable silane sealants, plinth splash details).
     * Section 6: Real Field Case Vignette from Alibaug / Karjat (contractor mistakes averted, preserving seasonal runoff).
   - Each section MUST contain 2 to 4 rich, detailed paragraphs explaining the engineering realities, common contractor mistakes, exact metrics, and field solutions. Keep individual paragraphs concise (2-4 sentences) with natural breathing room.
   - ZERO robotic link formulas ("For more information visit..."). Only 2 natural inline links in the body.
   - Include at least 4 real customer FAQs with clear, authoritative answers.
   - End with a single, high-value invitation for landowners to conduct a 30-Minute Pre-Construction Feasibility Audit on Topmate (https://topmate.io/archanagavas).
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
