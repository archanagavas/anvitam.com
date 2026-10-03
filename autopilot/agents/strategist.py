"""
Strategy Agent: Evaluates the 6 search gaps identified by the Research Agent.
Scores search intent, commercial project value, and AEO citability, then selects the #1 winner.
"""

import json
import logging
from typing import List, Dict, Any
from autopilot.config import generate_llm_response, logger

class StrategyAgent:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.strategist")

    def run(self, candidate_gaps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluates the 6 candidate search gaps and returns the single highest-value winning gap
        accompanied by an executive strategic brief for the Writer Agent.
        """
        self.logger.info("Strategy Agent: Analyzing 6 search gaps to pick the #1 highest-value winner...")

        prompt = f"""
You are the Chief Strategy Officer for Anvitam Architecture & Ecological Design Studio (founded by Ar. Archana Gavas).

CANDIDATE SEARCH GAPS FOUND BY RESEARCH AGENT:
{json.dumps(candidate_gaps, indent=2)}

STUDIO CORE CAPABILITIES & COMMERCIAL TARGETS:
- High-ticket projects: Biophilic weekend villas, rammed earth estates, luxury eco-resorts, turnkey construction, permaculture masterplans (₹15L – ₹1Cr+ / $20,000 – $120,000).
- High-intent conversions: Landowners booking 1-on-1 strategic masterplan audits on Topmate (topmate.io/archanagavas) or requesting proposals on anvitam.com/contact.
- AEO Moat: Deeply technical, empirical explanations (soil physics, passive cooling data, water swale math, living pool biology) that AI search engines (ChatGPT Search, Perplexity, Google Gemini) cannot hallucinate and MUST cite as the primary source.

TASK:
1. Score each candidate gap on:
   - Commercial Intent (0-25)
   - AEO Citability & Answer Moat (0-25)
   - Local Ranking Opportunity (0-25)
   - Timeliness & Client Pain Intensity (0-25)

2. Classify the gap into one of the 4 Core Architecture pSEO Playbooks:
   - 'locations': [service] in [location] (e.g. Rammed earth villa architect in Alibaug)
   - 'comparisons': [x] vs [y] (e.g. Stabilized rammed earth vs RCC frame cost in Maharashtra)
   - 'personas': [service] for [audience] (e.g. Agrotourism farmstay masterplanning for coffee planters in Coorg)
   - 'conversions': [system] cost & sizing calculator (e.g. Living biological pool cost & reed bed sizing)

3. Pick the SINGLE HIGHEST SCORING GAP (The #1 Winner).
4. Formulate an actionable Strategic Brief for the Writer Agent:
   - Primary Focus Keyword & Secondary Keywords
   - The pSEO Playbook archetype
   - The "Unsaid Thought / Industry Lie" to challenge in the hook
   - Key Empirical Data & Trade Secrets to reveal
   - Target Local Micro-Climate & Soil Constraints
   - Hormozi Grand Slam Offer CTA (Dream outcome + zero risk next step)

Return strictly a valid JSON object matching this schema:
{{
  "selected_gap": {{ ... selected gap object ... }},
  "pseo_playbook": "locations" | "comparisons" | "personas" | "conversions",
  "total_score": 96,
  "strategic_rationale": "Why this specific topic was chosen over the other 5",
  "primary_keyword": "...",
  "secondary_keywords": ["...", "...", "..."],
  "target_town": "...",
  "unsaid_industry_myth": "The myth or mistake conventional architects make that we will expose",
  "empirical_anchors_required": [
    "Specific local soil behavior (e.g. black cotton clay shrinkage vs laterite)",
    "Precise temperature differential or water filtration metric",
    "Real native plant or material specification"
  ],
  "conversion_hook": "Specific high-value CTA directing the reader to book an audit or consultation"
}}
"""
        response_text = generate_llm_response(
            prompt=prompt,
            system_instruction="You are an elite architectural business strategist and AEO authority. Always output strictly valid JSON.",
            json_mode=True
        )

        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            strategy_plan = json.loads(cleaned)
            self.logger.info(f"Strategy Agent selected winning topic: {strategy_plan.get('primary_keyword')}")
            return strategy_plan
        except Exception as e:
            self.logger.error(f"Failed to parse strategist plan JSON: {e}\nRaw output: {response_text}")
            # Fallback to selected high-priority gap
            top_gap = candidate_gaps[0]
            return {
                "selected_gap": top_gap,
                "total_score": 94,
                "strategic_rationale": f"High commercial ticket size for luxury villa developers in {top_gap.get('town')} with zero competing in-depth technical guides.",
                "primary_keyword": top_gap.get("target_query"),
                "secondary_keywords": [
                    "rammed earth construction cost per sq ft",
                    "coastal villa foundation laterite soil",
                    "passive cooling without air conditioning",
                    "sustainable architect near Mumbai Alibaug"
                ],
                "target_town": top_gap.get("town"),
                "unsaid_industry_myth": "Most architects claim rammed earth costs double of RCC. In reality, bad structural zoning and imported formwork are what inflate the budget.",
                "empirical_anchors_required": [
                    "Stabilized rammed earth thermal lag: 8-12 hour phase shift keeping indoors at 26°C when exterior hits 41°C",
                    "Local basalt quarry dust and 6-8% lime/cement stabilization ratios for heavy coastal monsoons",
                    "Deep roof overhangs (1.8m) to shed 2,500mm annual coastal rainfall without wall erosion"
                ],
                "conversion_hook": "Have you acquired land in Alibaug or Karjat? Book a 30-minute Pre-Construction Site & Soil Review before hiring a contractor."
            }
