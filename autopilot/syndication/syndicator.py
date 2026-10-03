"""
Master Syndication Orchestrator.
Transforms the approved master article into platform-native formats and distributes across:
1. Website (anvitam.com)
2. Bluesky (AT Protocol)
3. Mastodon (Fediverse)
4. Meta Threads
5. Twitter / X (v2 API)
6. LinkedIn (UGC API)
7. Medium (Canonical REST API)
8. Substack (Newsletter Publication)
"""

import json
import logging
from typing import Dict, Any, List, Optional
from autopilot.config import generate_llm_response, logger, SITE_BASE_URL
from autopilot.syndication.bluesky_client import BlueskyClient
from autopilot.syndication.mastodon_client import MastodonClient
from autopilot.syndication.threads_client import ThreadsClient
from autopilot.syndication.twitter_client import TwitterClient
from autopilot.syndication.linkedin_client import LinkedInClient
from autopilot.syndication.medium_client import MediumClient
from autopilot.syndication.substack_client import SubstackClient
from autopilot.syndication.buffer_client import BufferClient
from autopilot.syndication.tumblr_client import TumblrClient
from autopilot.syndication.google_business_client import GoogleBusinessClient

class SyndicationHub:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.syndication.hub")
        self.bluesky = BlueskyClient()
        self.mastodon = MastodonClient()
        self.threads = ThreadsClient()
        self.twitter = TwitterClient()
        self.linkedin = LinkedInClient()
        self.medium = MediumClient()
        self.substack = SubstackClient()
        self.buffer = BufferClient()
        self.tumblr = TumblrClient()
        self.google_business = GoogleBusinessClient()



    def generate_social_derivatives(
        self,
        title: str,
        excerpt: str,
        live_url: str,
        content_snippet: str
    ) -> Dict[str, Any]:
        """
        Uses LLM to adapt the master article into bespoke, platform-native formats
        strictly following the SLAY Framework (Story, Lesson, Actionable Advice, You)
        and Stop-Slop anti-robotic rules.
        """
        prompt = f"""
Act as an elite LinkedIn & Social Media Copywriter for Ar. Archana Gavas, Founder of Anvitam Architecture & Ecological Design Studio.
Topic: {title}
Summary & Context: {excerpt}
Live Canonical URL: {live_url}
Technical Content Snippet:
{content_snippet[:1500]}

CRAFT HIGH-CONVERTING, VIRAL SOCIAL ASSETS USING THE "SLAY" FRAMEWORK.
NO AI SLOP. NO CORPORATE BUZZWORDS. NO ROBOTIC SUMMARY TEMPLATES.

STRICT SLAY FRAMEWORK FOR LINKEDIN ("linkedin_post"):
Follow this exact 4-step structure:
1. Story (S): Start with a bold, contrarian hook exposing a common mistake the audience makes. Add 2-3 short lines/bullets of real-world context (mini-storytelling).
2. Lesson (L): Provide a 1-2 sentence quick, hard-hitting takeaway about the negative financial or structural result of that mistake.
3. Actionable Advice (A): Write a 4-5 point listicle showing exactly how to fix the problem. Keep the steps highly actionable, showcasing deep architectural and soil engineering authority.
4. You (Y): Talk directly to the reader. Use the word "You". Give them a concluding piece of encouragement and end with a compelling open question to drive comments.

STRICT FORMATTING RULES FOR "linkedin_post":
- Keep sentences short (NO MORE THAN 12 WORDS PER SENTENCE).
- Use plenty of whitespace between lines (DOUBLE LINE BREAKS between lines/thoughts).
- DO NOT USE HASHTAGS.
- DO NOT use markdown bold headers like "**The Truth About...**".
- DO NOT say "As a developer or HNI", "Here are 3 key takeaways", "In today's fast-paced world", "Full stop", "Game changer".
- Total length: 1,000 to 1,500 characters.

ADDITIONAL PLATFORM-NATIVE ASSETS:
1. "twitter_text": Sharp, contrarian hook + 1 brutal engineering fact + discussion question. STRICTLY UNDER 275 CHARACTERS. No hashtags.
2. "bluesky_text": Punchy contrarian insight challenging conventional construction myths. STRICTLY UNDER 275 CHARACTERS. No hashtags.
3. "threads_text": Conversational peer-to-peer hook addressing landowners with generous line breaks. Max 450 characters.
4. "mastodon_text": Educational ecological engineering insight with line breaks + 3 clean hashtags (#rammedearth #biophilicdesign #permaculture). Max 480 characters.
5. "tumblr_html": The full SLAY story formatted cleanly with <p> tags and <h3> subheadings for visual reading.

Return strictly a valid JSON object matching this schema:
{{
  "linkedin_post": "...",
  "twitter_text": "...",
  "bluesky_text": "...",
  "threads_text": "...",
  "mastodon_text": "...",
  "tumblr_html": "..."
}}
"""
        response_text = generate_llm_response(
            prompt=prompt,
            system_instruction="You are an elite architectural copywriter specializing in viral LinkedIn thought leadership and the SLAY framework. Output strictly valid JSON.",
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

            parsed = json.loads(cleaned)
            # Ensure twitter and bluesky are strictly bounded
            if parsed.get("twitter_text") and len(parsed["twitter_text"]) > 275:
                parsed["twitter_text"] = parsed["twitter_text"][:270] + "…"
            if parsed.get("bluesky_text") and len(parsed["bluesky_text"]) > 280:
                parsed["bluesky_text"] = parsed["bluesky_text"][:275] + "…"
            return parsed
        except Exception as e:
            self.logger.error(f"Failed to generate social derivatives: {e}")
            return {
                "linkedin_post": (
                    "A rammed earth villa is not just mud poured into wooden boxes.\n\n"
                    "I see this mistake constantly.\n\n"
                    "Someone buys beautiful land in Western India.\n"
                    "They hire a conventional city contractor.\n"
                    "They try to build an 'earth home' from YouTube clips.\n\n"
                    "The wall goes up fast.\n\n"
                    "Then the first heavy monsoon hits.\n\n"
                    "Rain lashes the unshielded base.\n"
                    "Water pools against the porous soil.\n"
                    "The wall erodes before the family moves in.\n\n"
                    "The result?\n"
                    "A ₹40 Lakh investment washed into the mud.\n\n"
                    "Here is how we engineer rammed earth properly:\n\n"
                    "1. Test the subsoil particle curve.\n"
                    "You need 70% sand and gravel with only 15% clay.\n\n"
                    "2. Compact in strict 100mm lifts.\n"
                    "Use pneumatic rammers to achieve 2.5 MPa compressive strength.\n\n"
                    "3. Build on a 450mm basalt plinth.\n"
                    "Keep the earth wall well above splashback height.\n\n"
                    "4. Extend windward eaves to 1.8 meters.\n"
                    "Protect the upper facade from heavy coastal monsoons.\n\n"
                    "5. Seal with vapor-permeable silane.\n"
                    "Let the wall breathe while shedding torrential rain.\n\n"
                    "A rammed earth villa should outlast concrete.\n\n"
                    "It gives you a 26°C interior in 42°C heat.\n\n"
                    "You are not just building walls.\n"
                    "You are creating a climate-proof sanctuary.\n\n"
                    "What is your biggest fear when building with natural earth?"
                ),
                "twitter_text": (
                    "Rammed earth isn't just mud in a box.\n\n"
                    "Pour it without a 450mm basalt plinth in Alibaug, and the first monsoon ruins it.\n\n"
                    "Engineered with 70% sand and 1.8m eaves, it stays 26°C in 42°C heat with zero AC.\n\n"
                    "Are you building with nature, or on top of it?"
                ),
                "bluesky_text": (
                    "Rammed earth isn't just mud in a box.\n\n"
                    "Pour it without a 450mm basalt plinth in Alibaug, and the first monsoon ruins it.\n\n"
                    "Engineered with 70% sand and 1.8m eaves, it stays 26°C in 42°C heat with zero AC."
                ),
                "threads_text": (
                    "A rammed earth villa is not just mud in wooden boxes.\n\n"
                    "The biggest mistake in Maharashtra:\n"
                    "Pouring earth directly on ground soil without a stone plinth.\n\n"
                    "First monsoon hits. The wall erodes.\n\n"
                    "To build it to last 80 years:\n"
                    "• 70% sand to 15% clay ratio\n"
                    "• 100mm pneumatic lifts\n"
                    "• 1.8m windward eaves\n"
                    "• Breathable silane coat\n\n"
                    "You get 26°C indoors in 42°C heat with zero AC."
                ),
                "mastodon_text": (
                    "Rammed earth is not just mixing mud into formwork.\n\n"
                    "The common mistake in Western India:\n"
                    "Pouring earth directly on ground level without a 450mm basalt splash plinth.\n\n"
                    "How to engineer it right:\n"
                    "• 70% sand, 15% clay, 6% hydraulic lime\n"
                    "• 100mm pneumatic lifts\n"
                    "• 1.8m roof eaves\n\n"
                    "Result: 26°C interior during 42°C summer heat.\n\n"
                    "#sustainablearchitecture #rammedearth #biophilicdesign"
                ),
                "tumblr_html": (
                    "<h2>The Truth About Building With Rammed Earth</h2>"
                    "<p>A rammed earth villa is not just mud poured into wooden boxes.</p>"
                    "<p>I see this mistake constantly: Someone buys beautiful land, hires a conventional contractor, and builds an 'earth home' without analyzing the soil.</p>"
                    "<p>The result? A ₹40 Lakh investment washed away in the first monsoon.</p>"
                    "<h3>How to Engineer It Right</h3>"
                    "<p>1. Test the subsoil particle curve (70% sand, 15% clay).<br>"
                    "2. Compact in strict 100mm lifts with pneumatic rammers.<br>"
                    "3. Build on a 450mm basalt plinth.<br>"
                    "4. Extend windward eaves to 1.8 meters.<br>"
                    "5. Seal with vapor-permeable silane.</p>"
                )
            }

    def syndicate_all(
        self,
        article_data: Dict[str, Any],
        platforms: Optional[List[str]] = None,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """
        Syndicates approved article across all selected platforms.
        EDITORIAL SAFETY: If the article is staged as a DRAFT, public social syndication
        is strictly skipped so unreviewed drafts are never broadcasted to followers.
        """
        title = article_data.get("title", "")
        slug = article_data.get("slug", "")
        live_url = article_data.get("url") or f"{SITE_BASE_URL}/blog/{slug}"
        excerpt = article_data.get("excerpt") or article_data.get("meta_description", "")
        content_html = article_data.get("content_html") or article_data.get("content", "")

        # Check draft protection
        import os
        is_draft = article_data.get("is_draft", False) or os.getenv("BLOG_SAVE_AS_DRAFT", "true").lower() == "true"
        
        if is_draft:
            self.logger.info(
                f"🛡️ EDITORIAL SAFETY ACTIVE: Article '{title}' is staged as a DRAFT for Archana's review. "
                "Skipping public blog link distribution to socials until officially approved."
            )
            results = {}
            # Substack can stage as an internal unpublished draft
            if not platforms or "substack" in platforms:
                results["substack"] = self.substack.publish_draft(
                    title=title,
                    subtitle=excerpt,
                    content_html=content_html,
                    canonical_url=live_url
                )
            return {
                "status": "staged_as_draft",
                "note": "Public social syndication paused until article is reviewed and published by Archana.",
                "results": results
            }

        self.logger.info(f"Syndication Hub: Distributing published '{title}' across platforms...")

        if dry_run:
            self.logger.info("[DRY-RUN] Simulating distribution across 8 channels.")
            return {"status": "simulated", "platforms": ["website", "bluesky", "mastodon", "threads", "twitter", "linkedin", "medium", "substack"]}

        # 1. Generate adapted micro-copy with SLAY framework
        derivatives = self.generate_social_derivatives(title, excerpt, live_url, content_html)

        results = {}

        # 0. Buffer (Unified dispatcher with platform-specific tailored text)
        if os.getenv("BUFFER_ACCESS_TOKEN") and (not platforms or "buffer" in platforms):
            platform_texts = {
                "twitter": derivatives.get("twitter_text", ""),
                "linkedin": derivatives.get("linkedin_post", ""),
                "threads": derivatives.get("threads_text", "")
            }
            results["buffer"] = self.buffer.publish_update(
                text=derivatives.get("linkedin_post", ""),
                link_url=live_url,
                title=title,
                description=excerpt,
                platform_texts=platform_texts
            )

        # 2. Bluesky
        if not platforms or "bluesky" in platforms:
            results["bluesky"] = self.bluesky.publish(
                text=derivatives.get("bluesky_text", ""),
                link_url=live_url,
                title=title,
                description=excerpt
            )

        # 3. Mastodon
        if not platforms or "mastodon" in platforms:
            results["mastodon"] = self.mastodon.publish(
                status_text=derivatives.get("mastodon_text", ""),
                link_url=live_url
            )

        # 4. Threads (Direct)
        if not platforms or "threads" in platforms:
            results["threads"] = self.threads.publish(
                text=derivatives.get("threads_text", "")
            )

        # 5. Twitter (Direct)
        if not platforms or "twitter" in platforms:
            results["twitter"] = self.twitter.publish_tweet(
                text=derivatives.get("twitter_text", "")
            )

        # 6. LinkedIn (Direct)
        if not platforms or "linkedin" in platforms:
            results["linkedin"] = self.linkedin.publish(
                text=derivatives.get("linkedin_post", ""),
                link_url=live_url,
                title=title
            )

        # 7. Medium
        if not platforms or "medium" in platforms:
            results["medium"] = self.medium.publish(
                title=title,
                content_html=content_html,
                canonical_url=live_url,
                tags=article_data.get("tags")
            )

        # 8. Substack
        if not platforms or "substack" in platforms:
            results["substack"] = self.substack.publish_draft(
                title=title,
                subtitle=excerpt,
                content_html=content_html,
                canonical_url=live_url
            )

        # 9. Tumblr
        if not platforms or "tumblr" in platforms:
            results["tumblr"] = self.tumblr.publish(
                title=title,
                content_html=derivatives.get("tumblr_html") or content_html,
                canonical_url=live_url,
                tags=article_data.get("tags")
            )

        # 10. Google Business Profile (Direct Local Post)
        if not platforms or "google_business" in platforms:
            summary_text = derivatives.get("threads_text") or derivatives.get("bluesky_text") or excerpt
            results["google_business"] = self.google_business.publish_local_post(
                text=f"{title}\n\n{summary_text}",
                link_url="https://topmate.io/archanagavas",
                action_type="BOOK"
            )

        self.logger.info(f"Syndication Hub completed distribution with status: {results}")
        return results

    def syndicate_social_post(
        self,
        post_data: Any,
        link_url: Optional[str] = None,
        title: Optional[str] = None,
        platforms: Optional[List[str]] = None,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """
        Dispatches an individual standalone social post across all active channels:
        Buffer (Twitter, LinkedIn, Threads) + Bluesky + Mastodon + Tumblr.
        Strictly enforces platform character limits and uses the SLAY framework.
        """
        if isinstance(post_data, dict):
            linkedin_text = post_data.get("text", "")
            twitter_text = post_data.get("twitter_text") or linkedin_text[:270]
            threads_text = post_data.get("threads_text") or linkedin_text[:450]
            bluesky_text = post_data.get("bluesky_text") or twitter_text[:275]
            mastodon_text = post_data.get("mastodon_text") or threads_text[:480]
            cta_text = post_data.get("cta", "")
            if cta_text and cta_text not in linkedin_text:
                linkedin_text = f"{linkedin_text}\n\n{cta_text}"
        else:
            linkedin_text = str(post_data)
            # Create clean short versions for Twitter and Bluesky if length exceeds limits
            if len(linkedin_text) > 275:
                # Find first punchy paragraph
                paragraphs = [p.strip() for p in linkedin_text.split("\n\n") if p.strip()]
                hook = paragraphs[0] if paragraphs else linkedin_text[:120]
                question = paragraphs[-1] if len(paragraphs) > 1 and "?" in paragraphs[-1] else ""
                short_candidate = f"{hook}\n\n{question}".strip()
                if len(short_candidate) <= 275 and len(short_candidate) > 50:
                    twitter_text = short_candidate
                else:
                    twitter_text = linkedin_text[:265] + "…"
            else:
                twitter_text = linkedin_text

            threads_text = linkedin_text[:440] + "…" if len(linkedin_text) > 450 else linkedin_text
            bluesky_text = twitter_text[:275]
            mastodon_text = linkedin_text[:475] + "…" if len(linkedin_text) > 485 else linkedin_text

        self.logger.info(f"Syndication Hub: Dispatching SLAY social asset (LinkedIn: {len(linkedin_text)} chars, X: {len(twitter_text)} chars)...")

        if dry_run:
            self.logger.info(f"[DRY-RUN] Simulating dispatch of social asset: '{linkedin_text[:60]}...'")
            return {"status": "simulated", "platforms": ["buffer", "bluesky", "mastodon", "tumblr"]}

        results = {}
        import os

        # 1. Buffer (X, LinkedIn, Threads with tailored character counts)
        if os.getenv("BUFFER_ACCESS_TOKEN") and (not platforms or "buffer" in platforms):
            platform_texts = {
                "twitter": twitter_text,
                "linkedin": linkedin_text,
                "threads": threads_text
            }
            results["buffer"] = self.buffer.publish_update(
                text=linkedin_text,
                link_url=link_url,
                platform_texts=platform_texts
            )

        # 2. Bluesky (Strictly <= 280 chars)
        if not platforms or "bluesky" in platforms:
            results["bluesky"] = self.bluesky.publish(
                text=bluesky_text,
                link_url=link_url
            )

        # 3. Mastodon (Strictly <= 490 chars)
        if not platforms or "mastodon" in platforms:
            results["mastodon"] = self.mastodon.publish(
                status_text=mastodon_text,
                link_url=link_url
            )

        # 4. Tumblr (Rich HTML with proper spacing)
        if not platforms or "tumblr" in platforms:
            html_body = "".join(f"<p>{p.strip()}</p>" for p in linkedin_text.split("\n\n") if p.strip())
            results["tumblr"] = self.tumblr.publish(
                title=title or "Anvitam Architectural Insight",
                content_html=html_body,
                canonical_url=link_url or "https://www.anvitam.com",
                tags=["architecture", "ecologicaldesign", "permaculture", "rammedearth"]
            )

        return results


