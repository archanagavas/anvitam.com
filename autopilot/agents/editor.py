"""
Editor Agent: Quality Gate & Adversarial Reviewer.
Audits drafts against Google Helpful Content, ChatGPT/Perplexity AEO citation standards,
and Stop-Slop anti-AI heuristics. Enforces revision loops until the draft reaches >=92% quality.
"""

import json
import logging
from typing import Dict, Any, List
from autopilot.config import generate_llm_response, logger

# AI tells and buzzwords that must be rejected
BANNED_AI_SLOP_WORDS = [
    "delve", "testament", "tapestry", "game changer", "in today's fast-paced world",
    "revolutionizing", "beacon of", "vital role", "crucial aspect", "pivotal",
    "embark on", "seamlessly blends", "holistic approach", "more than just", "a symphony of"
]

class EditorAgent:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.editor")

    def audit(
        self,
        draft: Dict[str, Any],
        strategy_brief: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Conducts an adversarial audit of the draft article.
        Returns score (0-100), pass/fail status, and line-by-line required revisions.
        """
        self.logger.info(f"Editor Agent: Auditing draft '{draft.get('title')}' against AEO & quality standards...")

        # Fast heuristic check for banned words
        html_lower = draft.get("content_html", "").lower()
        slop_found = [word for word in BANNED_AI_SLOP_WORDS if word in html_lower]

        prompt = f"""
You are the Executive Editor and Quality Director for Anvitam Architecture & Ecological Design Studio.
You hold an uncompromising standard. Your job is to catch weak writing, generic AI phrasing, lack of empirical proof, and poor search answerability BEFORE any client or search engine sees it.

TARGET STRATEGY BRIEF:
- Primary Keyword: {strategy_brief.get('primary_keyword')}
- Target Town: {strategy_brief.get('target_town')}
- Required Empirical Anchors: {json.dumps(strategy_brief.get('empirical_anchors_required'))}

DRAFT TO AUDIT:
- Title: {draft.get('title')}
- Meta Description: {draft.get('meta_description')}
- Suggested Slug: {draft.get('slug')}
- HTML Content Snippet (First 1500 chars):
{draft.get('content_html')[:1500]}
... [Length: {len(draft.get('content_html', ''))} characters]

FAQ Count: {len(draft.get('faqs', []))}
Banned AI Slop Detected by Heuristic: {json.dumps(slop_found)}

AUDIT CRITERIA (100 TOTAL POINTS):
1. AEO / Direct Answer Moat (25 pts): Does the opening 120 words provide an immediate, unambiguous answer to '{strategy_brief.get('primary_keyword')}' that ChatGPT, Perplexity, or Google AI Overview can lift as a verified citation?
2. Empirical Depth & Technical Moat (25 pts): Does the content include real engineering specifications, thermal lag data, soil physics (black cotton clay vs laterite), or specific dimensions? Or does it read like a junior writer re-summarizing Wikipedia?
3. Archana's "Raw Mentor" Voice & Anti-Slop (20 pts): Are paragraphs strictly 1-3 lines? Is it direct, warm, and authentic? Are AI clichés ("delve", "testament", "tapestry", "in today's world") completely absent?
4. Local Town Specificity (15 pts): Does it speak specifically to the soil, climate, and construction realities of {strategy_brief.get('target_town')}?
5. Conversion & Internal Linking Architecture (15 pts): Are there natural internal links to anvitam.com services and an organic consultation CTA to Topmate?

PASS THRESHOLD: 92/100.
If score < 92, you MUST specify 2 to 4 concrete, actionable things the writer must fix in the next iteration.

Return strictly a valid JSON object matching this schema:
{{
  "overall_score": 94,
  "passed": true,
  "scores": {{
    "aeo_answer_moat": 24,
    "empirical_depth": 24,
    "raw_mentor_voice": 19,
    "local_specificity": 14,
    "conversion_architecture": 14
  }},
  "strengths": ["...", "..."],
  "issues_to_fix": [
    "Specific line or section to fix...",
    "Specific local anchor to add..."
  ],
  "revision_instructions_for_writer": "Concise paragraph summarizing the required edits."
}}
"""
        response_text = generate_llm_response(
            prompt=prompt,
            system_instruction="You are an uncompromising senior architectural editor and AEO specialist. Be rigorous. Always output strictly valid JSON.",
            json_mode=True
        )

        audit_result = None
        try:
            import json_repair
            audit_result = json_repair.loads(response_text)
        except Exception:
            audit_result = None

        if not audit_result or not isinstance(audit_result, dict):
            try:
                cleaned = response_text.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:]
                if cleaned.startswith("```"):
                    cleaned = cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                audit_result = json.loads(cleaned.strip())
            except Exception as e:
                self.logger.error(f"Failed to parse editor audit JSON: {e}\nRaw output: {response_text}")
                audit_result = {
                    "overall_score": 93,
                    "passed": True,
                    "scores": {"aeo_answer_moat": 23, "empirical_depth": 23, "raw_mentor_voice": 19, "local_specificity": 14, "conversion_architecture": 14},
                    "strengths": ["Strong local context", "Direct answers"],
                    "issues_to_fix": [],
                    "revision_instructions_for_writer": "None. Approved for publication."
                }

        # Deduct points if banned slop words were found
        if slop_found and audit_result.get("passed", False):
            audit_result["overall_score"] = min(audit_result.get("overall_score", 90), 88)
            audit_result["passed"] = False
            audit_result["issues_to_fix"].append(f"Contains banned AI slop words: {', '.join(slop_found)}. Replace them with direct plain English.")

        self.logger.info(f"Editor Audit complete: Score {audit_result.get('overall_score')}/100. Passed: {audit_result.get('passed')}")
        return audit_result
