"""
Editor Agent: Quality Gate & Adversarial Reviewer for Archana's Raw Mentor Voice.
Audits drafts against Google Helpful Content, STARVE framework standards, short-line readability,
10 FAQs, TL;DR snippet blocks, 3-5 Infographics, and Stop-Slop anti-AI heuristics.
"""

import json
import logging
import re
from typing import Dict, Any, List
from autopilot.config import generate_llm_response, logger

# AI tells and buzzwords that must be rejected
BANNED_AI_SLOP_WORDS = [
    "delve", "testament", "tapestry", "game changer", "in today's fast-paced world",
    "revolutionizing", "beacon of", "vital role", "crucial aspect", "pivotal",
    "embark on", "seamlessly blends", "holistic approach", "more than just", "a symphony of"
]

BANNED_LINK_SLOP_PHRASES = [
    "for more information", "to learn more", "visit our [", "visit our contact page",
    "if you're interested in", "if you are interested"
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
        Conducts an adversarial audit of the draft article against Archana's strict standards.
        """
        self.logger.info(f"Editor Agent: Auditing draft '{draft.get('title')}' against Raw Mentor standards...")

        content = draft.get("content_html", "")
        html_lower = content.lower()
        slop_found = [word for word in BANNED_AI_SLOP_WORDS if word in html_lower]
        link_slop_found = [phrase for phrase in BANNED_LINK_SLOP_PHRASES if phrase in html_lower]
        
        # Word count calculation
        text_only = re.sub(r"<[^>]+>", " ", content)
        words = text_only.split()
        word_count = len(words)

        # Check internal links count (absolute + relative) and validate every
        # anvitam.com URL against the approved link registry — invented or
        # stale slugs are a hard fail, not something an LLM score can wave past.
        internal_links = re.findall(r'href=[\'"](?:https://www\.anvitam\.com)?(/[^\'"]+)[\'"]', content)
        link_count = len(internal_links)
        try:
            from autopilot.link_registry import LINK_TAXONOMY
            approved_urls = set()
            for group in LINK_TAXONOMY.values():
                for item in group:
                    approved_urls.add(item["url"].replace("https://www.anvitam.com", "").rstrip("/"))
            approved_urls |= {"/contact", "/services", "/projects", "/blog", "/why", "/shop", "/workshops", "/tools", "/site-analysis"}
        except Exception:
            approved_urls = set()
        invalid_links = [u for u in internal_links if u.rstrip("/") not in approved_urls] if approved_urls else []

        faq_count = len(draft.get("faqs", []))
        tldr_count = len(draft.get("tldr_bullets", []))
        has_signoff = "- archana ❤️" in html_lower or "archana ❤️" in html_lower or "- archana" in html_lower

        prompt = f"""
You are the Executive Editor and Quality Director for Anvitam Architecture & Ecological Design Studio.
You audit drafts to ensure they reflect Ar. Archana Gavas's authentic "Raw Mentor" standard.

TARGET STRATEGY BRIEF:
- Primary Keyword / Topic: {strategy_brief.get('primary_keyword')}
- Target Audience: {strategy_brief.get('target_audience')}

DRAFT METRICS:
- Title: {draft.get('title')}
- Title Variations Provided: {len(draft.get('title_variations', []))}
- Meta Description Length: {len(draft.get('meta_description', ''))} chars
- Word Count: {word_count} words (Requirement: 1,500 - 2,500 words)
- Internal Links Found: {link_count} (Requirement: Minimum 4 natural links to Anvitam URLs)
- FAQ Count: {faq_count} (Requirement: Exactly 10 FAQs, each 3-4 lines)
- TL;DR Bullets: {tldr_count} (Requirement: 5-7 concise bullets)
- Archana Sign-Off Found: {has_signoff} (Requirement: "- Archana ❤️" followed by P.S.)
- Banned AI Clichés Found: {json.dumps(slop_found)}
- Mechanical Link Spam Found: {json.dumps(link_slop_found)}

SAMPLE CONTENT (First 4,000 chars):
{content[:4000]}

AUDIT CRITERIA (100 TOTAL POINTS):
1. Short Paragraphs & Readability (25 pts): Are paragraphs strictly 1-3 sentences with massive white space? Deduct 15 points if text walls or long academic blocks exist.
2. Authentic Raw Mentor Voice (20 pts): Does it read like having coffee with a stressed landowner or intelligent peer? Explaining like an 8th grader without marketing buzzwords?
3. Empirical Depth & Technical Specificity (20 pts): Does it contain real numbers, metrics, site tests, Anvitam project references, and contrarian insights?
4. SEO/AEO Deliverables (20 pts): Does it include 3 title variations, 150-160 char meta description, TL;DR block, 10 FAQs (3-4 lines each), and 3-5 infographic ideas?
5. Clean Internal Linking & Sign-Off (15 pts): Are at least 4 natural internal links woven cleanly without mechanical phrases? Does it conclude with "- Archana ❤️" and a P.S.?

PASS THRESHOLD: 90/100.
If score < 90, specify 2 to 3 actionable fixes.

Return strictly a valid JSON object matching this schema:
{{
  "overall_score": 93,
  "passed": true,
  "scores": {{
    "readability_short_lines": 24,
    "raw_mentor_voice": 19,
    "empirical_depth": 18,
    "aeo_deliverables": 18,
    "internal_links_signoff": 14
  }},
  "strengths": ["...", "..."],
  "issues_to_fix": [],
  "revision_instructions_for_writer": "None"
}}
"""
        response_text = generate_llm_response(
            prompt=prompt,
            system_instruction="You are an uncompromising architecture editor. Always output strictly valid JSON.",
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
            audit_result = json.loads(cleaned.strip())
            # Deterministic hard gate layered over the LLM score.
            hard_issues = []
            if word_count < 1500 or word_count > 2500:
                hard_issues.append(f"Word count {word_count} outside 1500-2500")
            if link_count < 4:
                hard_issues.append(f"Only {link_count} internal links (need >=4)")
            if invalid_links:
                hard_issues.append(f"Unapproved/invented internal links: {invalid_links}")
            if faq_count != 10:
                hard_issues.append(f"FAQ count {faq_count} (need exactly 10)")
            if slop_found:
                hard_issues.append(f"Banned AI slop words: {slop_found}")
            if hard_issues:
                audit_result["overall_score"] = min(int(audit_result.get("overall_score", 0)), 79)
                audit_result["passed"] = False
                audit_result["issues_to_fix"] = list(audit_result.get("issues_to_fix", [])) + hard_issues
                audit_result["revision_instructions_for_writer"] = (
                    str(audit_result.get("revision_instructions_for_writer", "")) +
                    " HARD GATE FAILURES (fix exactly): " + "; ".join(hard_issues) +
                    ". Copy internal-link URLs exactly from the link taxonomy."
                )
            return audit_result
        except Exception as e:
            self.logger.warning(f"Failed to parse editor audit JSON: {e}")
            # LLM audit unparseable: never auto-pass. Force a revision loop.
            return {
                "overall_score": 70,
                "passed": False,
                "issues_to_fix": ["Ensure paragraphs are 1-3 sentences", "Verify 10 FAQs and 4 internal links"],
                "revision_instructions_for_writer": "Keep paragraphs short and ensure all 10 FAQs and 4 internal links are present."
            }
