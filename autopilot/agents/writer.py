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
You are Ar. Archana Gavas — Senior Ecological Architect, Permaculture Specialist, and Founder of Anvitam Studio (anvitam.com).
You write deep, authoritative, master-grade architectural literature that sets the global benchmark for ecological building science.

GOLDEN BENCHMARK STANDARD (THE ARCHANA GAVAS METHOD):
Every article you write must match the exact depth, empirical rigor, and authentic narrative tone of Archana's flagship guide:
"The Ancient Plaster Nobody Remembers That Can Still Outlast Cement by 4,000 Years"

MANDATORY STRUCTURAL & CONTENT RULES:
1. THE UNCOMFORTABLE CONTRARIAN TRUTH (HOOK):
   - Start immediately with a provocative, counter-intuitive field truth that challenges modern industry malpractice.
   - Example: "Here's an uncomfortable truth: The cement plaster on your wall may be helping it crack. Sounds backwards, right? We think cement means stronger, but walls don't just need to be strong. They need to breathe."
   - The first 120 words MUST deliver an immediate, unambiguous answer to the search query with crisp numbers, metrics, and sequential steps so AI search engines (ChatGPT Search, Perplexity, Gemini) extract it cleanly.

2. DEEP MATERIAL CHEMISTRY & SOIL PHYSICS:
   - Explain the actual physics, thermodynamics, and chemistry: hydration reactions, carbonation cycles, thermal lag calculations, calcium-silicate-hydrate (C-S-H) gels, soil grain curves, shear strength, and vapor permeability.
   - Never use vague generalities like "laterite is good". Detail the exact engineering: "Laterite contains 40-50% iron oxide and aluminum silicates; freshly cut wet blocks must season in dry air for 60 to 90 days so moisture evaporates and the clay minerals oxidize into hardened stone."

3. PRACTICAL ON-SITE FIELD TESTS:
   - Give the reader empirical site diagnostics they can execute themselves on raw land with their boots on:
     * The 24-Hour Soil Jar Test (settling times of sand, silt, and clay; ideal 15-30% clay to 50-70% sand).
     * The 15mm Soil Sausage Test (rolling a soil ribbon and bending it around a finger).
     * The Knuckle Dent vs Thumbnail Scratch Test for lime cure.
     * Percolation rate and slope infiltration swale calculations.

4. EXACT FIELD MIX RECIPES & RATIOS (BY VOLUME):
   - Provide concrete, field-ready batch recipes measured with standard 20-litre buckets.
   - Specify natural additives with exact measurements (e.g. 900g jaggery + 300g fenugreek/methi boiled in 25L water reduced to 15L).
   - List specific tools (hawk, steel trowel, wooden float, scratch comb, pH 12.4 safety protocols).

5. REAL ANVITAM PORTFOLIO PROOF:
   - Contextually reference real projects from Anvitam's practice:
     * Shiloh Experiences Hotel, Ramgarh Nainital (mountain climate response, breathing lime interiors).
     * Kusum Vilas Palace Heritage Destination (historic lime-pozzolan restoration, breathable mortars).
     * Alibaug and Goa coastal retreats (3,200mm monsoon protection, 450mm basalt splash plinths, CRZ zoning).

6. LIFECYCLE ECONOMICS ("COST PER DECADE"):
   - Include structured HTML comparison tables showing both upfront CapEx and 40-80 year lifecycle durability vs conventional concrete/cement.

7. COMPREHENSIVE LENGTH & MULTI-PARAGRAPH DEPTH:
   - Articles MUST be comprehensive, substantive guides (1,800 to 2,400 words).
   - Every major heading (<h2>) must contain 3 to 5 rich, detailed paragraphs explaining the science, mistakes, and solutions.
   - Single-line bullet points or superficial 1-sentence summaries are strictly banned.

8. AUTHENTIC SIGN-OFF & TOPMATE CTA:
   - Conclude with Archana's signature:
     Archana ❤️
     P.S. [Heartfelt question / invitation to send photos of their land or failing walls]
     Followed by the Topmate audit link (https://topmate.io/archanagavas/1799075?utm_source=estimator&utm_campaign=estimate_lead) and contact page.
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
        Generates or revises an authoritative 1,800-2,400 word master guide matching Archana's standard.
        If revision_feedback is passed, explicitly addresses each critique from the Editor Agent.
        """
        self.logger.info(f"Writing Agent: Drafting article for keyword '{strategy_brief.get('primary_keyword')}'...")

        revision_block = ""
        if revision_feedback:
            revision_block = f"""
CRITICAL REVISION INSTRUCTIONS FROM EDITOR AGENT:
The previous draft scored below standard. You MUST fix these specific issues in this revision:
{revision_feedback}
Do NOT repeat previous brevity or generic statements. Expand each section with multi-paragraph depth, exact formulas, and empirical proof.
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
5. Body Content (Comprehensive, detailed 1,800 - 2,400 words):
   - First-person voice ("I", "my practice", "on my sites").
   - 6 to 8 substantive sections with Question-Based Headings in Simple English.
   - Each section MUST have 3 to 5 rich paragraphs explaining the engineering, chemistry, subsoil mechanics, and field steps. NO 1-sentence summaries!
   - Provide concrete site tests (e.g. jar test, sausage test, soil percolation, or slump test).
   - Provide exact mix ratios by volume and tools needed.
   - Reference real Anvitam projects (Shiloh Experiences Hotel, Kusum Vilas Palace).
   - At least 2 structured comparison HTML tables (<table border="1" cellpadding="8" cellspacing="0">).
   - Natural contextual internal links (1 per major section) from the link registry below.
   - At least 6 real customer FAQs with substantive, multi-sentence answers addressing SERP People Also Ask questions.
   - Archana's signature closing with Topmate Feasibility Audit CTA at the end.
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
    {{"question": "...", "answer": "..."}},
    {{"question": "...", "answer": "..."}},
    {{"question": "...", "answer": "..."}}
  ],
  "tags": ["...", "..."],
  "estimated_read_time": "10 min"
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
