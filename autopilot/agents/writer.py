"""
Writing Agent: Crafts deep-dive, AEO-dominant master articles using Archana's Raw Mentor Voice.
Employs the proprietary STARVE framework:
SOURCE + SEARCH INTENT + SPECIFICITY + TECHNICAL DEPTH + RELEVANCE +
ACTIONABILITY + EXPERTISE + ORIGINAL SYNTHESIS + UNIQUE VALUE

Enforces:
- 1,500 - 2,500 words.
- Short lines: paragraphs strictly 1-3 sentences with massive white space.
- 3 Title variations + Meta description (150-160 chars).
- Numbered breakdown lists (1, 2, 3) and curiosity-driven H2/H3 hierarchy.
- At least 4 natural internal links to approved blogs, services, and projects.
- Scannable TL;DR block (5-7 bullets).
- 10 FAQs (3-4 lines each).
- 3-5 Infographic ideas.
- Sign off: "- Archana ❤️" followed by a P.S.
- Internal 10-question self-interview grounded in Anvitam projects and services before drafting.
- TRUTH RULE: never invent costs, metrics, dates, client stories or savings figures. Use only facts supplied in the brief/interview; if a number is not supplied, write qualitatively ("measure X on your site") instead of fabricating one.
- Internal links: copy URLs EXACTLY from the supplied link taxonomy. Never invent an anvitam.com URL.
"""

import json
import logging
from typing import Dict, Any, Optional, List
from autopilot.config import generate_llm_response, logger, SITE_BASE_URL
from autopilot.link_registry import format_link_registry_for_prompt

ARCHANA_RAW_MENTOR_SYSTEM = """
You are Ar. Archana Gavas — Senior Architect, Design Thinker, and Founder of Anvitam Studio (anvitam.com).
You write not to impress, but to educate, build trust, and attract serious clients who feel like they just spoke to a trusted professional, not read a generic blog.

ROLE & VOICE:
- Act as a "Raw Mentor" – an experienced female architect and permaculture founder who speaks the unfiltered truth.
- Tone: Calm authority, direct, warm, and highly conversational. You are having coffee with a stressed landowner or intelligent peer.
- Explain like an 8th grader so anyone can understand complex systems without confusion.
- Absolutely ZERO marketing jargon, academic fluff, or generic "In today's fast-paced world" introductions.
- Vulnerable Authority: Share reality checks, industry secrets, and acknowledge the flaws in mainstream architecture to build massive trust.
- Target Audience: HNIs, Builders, manufacturers, homemakers, and individuals age 35-45 with capital looking to build or design properties.

NON-NEGOTIABLE STRUCTURE & READABILITY:
1. Short paragraphs: Never write paragraphs longer than 1-3 sentences. Use massive amounts of white space! Never dump blocks of text.
2. The Hook: Start with a bold, 1-2 sentence statement that challenges an "industry rule" or shares a raw truth.
3. The Breakdown: Use numbered lists (1, 2, 3) to break down systems sequentially.
4. Clear H2/H3 curiosity hierarchy (e.g., "Why the cement rule is dead", "The soil test contractors hate").
5. In every major section explain:
   - What it is
   - Why it works
   - Why most people get it wrong
   - What no one talks about
   - How to apply it in real life
6. Length: Comprehensive deep dive (1,500 to 2,500 words).
7. Natural Internal Links: Weave at least 4 natural internal links from the Anvitam registry (blogs, services, and projects).
8. End Matter:
   - Concise TL;DR / Key Takeaways block (5-7 bullets for Google Featured Snippets).
   - 10 FAQs (each answer strictly 3-4 lines, addressing real search queries).
   - 3-5 Infographic ideas (process flows, comparison charts, before vs after).
   - Warm sign-off: "- Archana ❤️" followed by a P.S. to drive engagement.
"""

class WritingAgent:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.writer")

    def _conduct_internal_self_interview(self, topic: str, strategy_brief: Dict[str, Any]) -> str:
        """
        Executes an internal 10-question self-interview grounded in Anvitam's actual projects and services
        before drafting the blog. This surfaces authentic field experience and original synthesis.
        """
        self.logger.info(f"Writing Agent: Conducting 10-question architect self-interview for '{topic}'...")

        interview_prompt = f"""
You are Ar. Archana Gavas, founder of Anvitam Architecture & Ecological Design Studio.
You are preparing to write an authoritative master guide on the approved topic: "{topic}".

YOUR REAL PROJECTS & SERVICES TO DRAW UPON:
- Kusum Vilas Palace Heritage Destination (traditional breathable lime-pozzolan restoration)
- Shiloh Experiences Hotel, Ramgarh Nainital (mountain boutique hotel, natural thermal comfort)
- YourWeb3Guy Residence, Bihar (stabilized rammed earth, passive cooling, low-carbon home)
- Terrace Garden Vadodara (organic rooftop sanctuary, engineered drainage and lightweight media)
- Vanvagado Farm Eco Forest Retreat (permaculture reforestation, rustic farmstead, bio-corridors)
- Kamba Agrotourism / Vardhaman Royal Agri Farm (large-scale commercial agrotourism, visitor zoning)
- Shalimar Luxury Residence & Garden (residential estate, private courtyard gardens)
- The Beer Bar (biophilic commercial hospitality venue)
- Core Services: Permaculture Design, Food Forests, Landscape Design, Weekend Villas, Homestays, Eco-Resorts, Wellness Retreats (Living Pools), Community Centers, Architecture Feasibility Reports.

TASK:
Simulate the internal expert self-interview by answering:
"I’m writing a blog post answering this question: {topic}.
Ask me anything you’d need to know the answer to in order to write a blog post that is truly helpful and unique. It should include my experience, expertise, case studies, examples, opinions, etc. Keep it limited to 10 questions."

Formulate 10 insightful, penetrating architectural and practical questions, and answer each ONLY from the projects/services listed above. Do NOT invent specific costs, savings, percentages, timelines or client outcomes that are not stated above — if a figure is not given, answer with the method/test used to establish it on a real site instead of a made-up number.

Format as:
Q1: [Question]
A1: [Direct, unfiltered answer with specific metrics, case references, or cost realities]
...
Q10: [Question]
A10: [Direct, unfiltered answer]
"""
        interview_text = generate_llm_response(
            prompt=interview_prompt,
            system_instruction="You are Ar. Archana Gavas conducting an expert self-interview. Give raw, empirical, highly specific answers.",
            json_mode=False
        )
        return interview_text

    def run(
        self,
        strategy_brief: Dict[str, Any],
        revision_feedback: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates or revises a 1,500-2,500 word master guide matching Archana's Raw Mentor voice and STARVE framework.
        """
        topic = strategy_brief.get("primary_keyword", "Permaculture Garden ROI: How Much Can You Produce?")
        self.logger.info(f"Writing Agent: Drafting master article for '{topic}'...")

        # Step 1: Conduct Internal Self-Interview grounded in Anvitam's practice
        internal_interview = self._conduct_internal_self_interview(topic, strategy_brief)

        revision_block = ""
        if revision_feedback:
            revision_block = f"""
CRITICAL REVISION INSTRUCTIONS FROM EDITOR AGENT:
The previous draft scored below standard. You MUST fix these specific issues in this revision:
{revision_feedback}
Do NOT repeat previous mistakes. Ensure paragraphs are strictly 1-3 sentences with plenty of white space.
"""

        link_taxonomy_text = format_link_registry_for_prompt()

        prompt = f"""
{revision_block}

STRATEGIC BRIEF:
- Topic / Primary Search Query: {topic}
- Target Audience: {strategy_brief.get('target_audience', 'HNIs, builders, manufacturers, homemakers age 35-45')}
- Industry Myth to Expose: {strategy_brief.get('unsaid_industry_myth')}
- Secondary Keywords to naturally weave: {json.dumps(strategy_brief.get('secondary_keywords'))}
- Conversion Hook: {strategy_brief.get('conversion_hook')}

ARCHANA'S INTERNAL SELF-INTERVIEW & EMPIRICAL INSIGHTS:
{internal_interview}

INTERNAL LINK TAXONOMY:
{link_taxonomy_text}

MANDATORY DELIVERABLE REQUIREMENTS:
1. Title: Provide 3 intelligent, click-worthy title variations (curiosity + competence, no cheap clickbait).
2. Meta Description: 150-160 characters, written for humans, clearly stating the value gained.
3. Word Count: Must be between 1,500 and 2,500 words.
4. Structure & Readability:
   - Short paragraphs: NEVER write paragraphs longer than 1-3 sentences.
   - Massive white space between thoughts.
   - Bold 1-2 sentence hook challenging an industry rule.
   - Numbered breakdown lists (1, 2, 3) for systems.
   - Curiosity-driven H2/H3 headings.
5. In each section, explain: What it is, why it works, why most people get it wrong, what no one talks about, and how to apply it in real life.
6. Internal Links: Naturally weave at least 4 internal links from the taxonomy into the body text using descriptive anchor text.
7. End Matter:
   - TL;DR / Key Takeaways block: 5-7 concise bullet points for Google Featured Snippets.
   - 10 FAQs: 3-4 line answers for each, answering real search questions with unique value.
   - 3-5 Infographic ideas: process flows, comparison charts, framework diagrams.
   - Sign off warmly: "- Archana ❤️" followed by an engaging P.S.

Output strictly a valid JSON object matching this schema:
{{
  "title_variations": [
    "Title Variation 1",
    "Title Variation 2",
    "Title Variation 3"
  ],
  "title": "Selected Primary Title (Best Variation)",
  "slug": "url-friendly-slug-for-blog",
  "meta_description": "150-160 char compelling meta description",
  "excerpt": "Short 2-sentence summary of the article",
  "cover_image_prompt": "Architectural line sketch with subtle earthy watercolor washes of [specific scene], annotated elements, scale bar, off-white paper background",
  "content_html": "<h2>...</h2><p>...</p>",
  "tldr_bullets": [
    "Bullet 1",
    "Bullet 2",
    "Bullet 3",
    "Bullet 4",
    "Bullet 5"
  ],
  "faqs": [
    {{"question": "Q1", "answer": "3-4 lines answer"}},
    {{"question": "Q2", "answer": "3-4 lines answer"}},
    {{"question": "Q3", "answer": "3-4 lines answer"}},
    {{"question": "Q4", "answer": "3-4 lines answer"}},
    {{"question": "Q5", "answer": "3-4 lines answer"}},
    {{"question": "Q6", "answer": "3-4 lines answer"}},
    {{"question": "Q7", "answer": "3-4 lines answer"}},
    {{"question": "Q8", "answer": "3-4 lines answer"}},
    {{"question": "Q9", "answer": "3-4 lines answer"}},
    {{"question": "Q10", "answer": "3-4 lines answer"}}
  ],
  "infographic_ideas": [
    "Infographic 1 description",
    "Infographic 2 description",
    "Infographic 3 description"
  ],
  "tags": ["permaculture", "landscape design", "ecological architecture"],
  "estimated_read_time": "9 min"
}}
"""

        response_text = generate_llm_response(
            prompt=prompt,
            system_instruction=ARCHANA_RAW_MENTOR_SYSTEM,
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
