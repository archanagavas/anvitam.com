"""
Strategy Agent: Formulates the Executive Strategic Content Brief for the Writer Agent.
Ensures the topic remains strictly aligned with the Approved Topic Catalog, target HNI personas,
and Anvitam's core services and projects.
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
        Formulates an actionable Strategic Brief for the Writer Agent based on the chosen approved candidate gap.
        """
        top_gap = candidate_gaps[0] if candidate_gaps else {}
        target_topic = top_gap.get("target_query") or "Permaculture Garden ROI: How Much Can You Produce?"
        
        self.logger.info(f"Strategy Agent: Preparing strategic brief for approved topic: '{target_topic}'...")

        prompt = f"""
You are the Chief Strategy Officer for Anvitam Architecture & Ecological Design Studio (founded by Ar. Archana Gavas).

TARGET APPROVED TOPIC:
{json.dumps(top_gap, indent=2)}

STUDIO CORE CAPABILITIES & COMMERCIAL TARGETS:
- Target Audience: HNIs, Builders, manufacturers, homemakers, individuals age 35-45 with budget to spend on rural retreats, second homes, farms, villas, and landscapes.
- High-ticket projects: Biophilic weekend villas, rammed earth estates, luxury eco-resorts, turnkey construction, permaculture masterplans, living biological pools.
- Conversions: Landowners booking a 1-on-1 Pre-Construction Land Feasibility Audit on Topmate (https://topmate.io/archanagavas) or requesting proposals on anvitam.com.
- Tone: The "Raw Mentor" – direct, warm, highly conversational, no marketing fluff, explaining like an 8th grader so anyone can understand.

TASK:
Formulate an actionable Strategic Brief for the Writer Agent for the topic: "{target_topic}".
1. Primary Focus Keyword & 3-4 Secondary Keywords (naturally matching search intent).
2. The Contrarian Hook / Industry Myth: A bold 1-2 sentence statement challenging an industry rule or exposing conventional contractor malpractice.
3. Key Empirical Data & Trade Secrets to reveal (soil mechanics, water volumes, lifecycle cost math, plant guilds, or construction details).
4. Concrete Anvitam Project References to weave in (Shiloh Experiences Ramgarh Nainital, Kusum Vilas Palace, Terrace Garden Vadodara, Vanvagado Farm, Kamba Agrotourism, Shalimar, Beer Bar, or YourWeb3Guy).
5. High-Value Conversion CTA directing the reader to Topmate or anvitam.com.

Return strictly a valid JSON object matching this schema:
{{
  "selected_gap": {json.dumps(top_gap)},
  "primary_keyword": "{target_topic}",
  "secondary_keywords": ["...", "...", "..."],
  "target_audience": "HNIs, builders, estate owners, and homemakers age 35-45",
  "unsaid_industry_myth": "The industry mistake or conventional myth to challenge in the hook",
  "empirical_anchors_required": [
    "Specific metric, formula, or field test",
    "Real cost comparison or lifecycle figure",
    "Specific material or ecological species guideline"
  ],
  "case_study_anchors": [
    "Anvitam real project case study 1",
    "Anvitam real project case study 2"
  ],
  "conversion_hook": "Specific, low-friction call to action booking a Pre-Construction Land Feasibility Audit on Topmate"
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
            self.logger.info(f"Strategy Agent brief ready for: {strategy_plan.get('primary_keyword')}")
            return strategy_plan
        except Exception as e:
            self.logger.warning(f"Failed to parse strategist plan JSON ({e}). Using robust fallback.")
            return {
                "selected_gap": top_gap,
                "primary_keyword": target_topic,
                "secondary_keywords": [
                    f"{target_topic} cost",
                    f"{target_topic} guide",
                    f"{target_topic} mistakes"
                ],
                "target_audience": "HNIs, builders, estate owners, and homemakers age 35-45",
                "unsaid_industry_myth": "Most conventional contractors sell what is easiest for them, ignoring long-term lifecycle economics and site biology.",
                "empirical_anchors_required": [
                    "Direct lifecycle CapEx and maintenance calculations",
                    "Practical field diagnostics and soil/water tests",
                    "Material specifications and ecological design principles"
                ],
                "case_study_anchors": [
                    "Shiloh Experiences Hotel in Ramgarh Nainital",
                    "Kusum Vilas Palace heritage conservation"
                ],
                "conversion_hook": "Have you acquired land or planning a build? Book a 30-minute Pre-Construction Strategy Audit before signing a contractor."
            }
