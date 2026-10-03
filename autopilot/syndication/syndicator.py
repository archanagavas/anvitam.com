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
        Uses LLM to adapt the master article into bespoke, platform-native formats:
        - Bluesky hook (<280 chars)
        - Mastodon status (<450 chars + hashtags)
        - Threads text (<450 chars)
        - Twitter thread (3 tweets, each <280 chars)
        - LinkedIn thought leadership post (1,000 - 1,400 chars)
        """
        prompt = f"""
You are the Head of Social Distribution for Anvitam Architecture & Ecological Design Studio (Founder: Ar. Archana Gavas).

MASTER ARTICLE DETAILS:
- Title: {title}
- Summary: {excerpt}
- Live Canonical URL: {live_url}
- Content Snippet:
{content_snippet[:1500]}

TASK:
Craft platform-native micro-content for this article. Adhere strictly to tone (Archana's Raw Mentor voice, no hype, no corporate buzzwords, high technical authority).

SPECIFIC FORMATS REQUIRED:
1. "bluesky_text": Punchy statement challenging a conventional rule + teaser. Max 270 chars.
2. "mastodon_text": Educational insight + 4 relevant hashtags (#permaculture #biophilicdesign #rammedearth #architecture). Max 450 chars.
3. "threads_text": Conversational peer-to-peer hook addressing landowners. Max 450 chars.
4. "twitter_thread": An array of exactly 3 tweets:
   - Tweet 1: The bold hook exposing the industry myth.
   - Tweet 2: The surprising data/engineering metric (e.g. soil physics or thermal lag).
   - Tweet 3: The takeaway + link back to {live_url}.
5. "linkedin_post": Deep-dive founder case study for developers & HNIs. Structure: Bold hook -> 3 numbered takeaways -> Question to provoke comments -> Link. (1,000–1,300 characters).

Return strictly a valid JSON object matching this schema:
{{
  "bluesky_text": "...",
  "mastodon_text": "...",
  "threads_text": "...",
  "twitter_thread": ["Tweet 1...", "Tweet 2...", "Tweet 3..."],
  "linkedin_post": "..."
}}
"""
        response_text = generate_llm_response(
            prompt=prompt,
            system_instruction="You are a social distribution specialist for high-ticket design firms. Output strictly valid JSON.",
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

            return json.loads(cleaned)
        except Exception as e:
            self.logger.error(f"Failed to generate social derivatives: {e}")
            return {
                "bluesky_text": f"Why conventional architecture fails in extreme heat: {title[:180]}",
                "mastodon_text": f"{title}\n\nRead our technical analysis: {live_url}\n#sustainablearchitecture #permaculture",
                "threads_text": f"If you're building a farmhouse or villa this season, here's what conventional contractors won't tell you about {title[:100]}.",
                "twitter_thread": [
                    f"Most people think sustainable architecture is just solar panels and big windows. In reality, it starts with soil physics: {title}",
                    "Thermal mass phase-shift and passive solar orientation can keep indoor temperatures at 26°C even when it hits 42°C outside with zero active AC.",
                    f"Read our full regional breakdown and cost comparisons here: {live_url}"
                ],
                "linkedin_post": f"We just published our field analysis on: {title}.\n\nWhen clients acquire rural land, the first mistake they make is hiring conventional RCC contractors who treat climate as an afterthought.\n\nRead the full guide: {live_url}"
            }

    def syndicate_all(
        self,
        article_data: Dict[str, Any],
        platforms: Optional[List[str]] = None,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """
        Syndicates approved article across all selected platforms.
        """
        title = article_data.get("title", "")
        slug = article_data.get("slug", "")
        live_url = article_data.get("url") or f"{SITE_BASE_URL}/blog/{slug}"
        excerpt = article_data.get("excerpt") or article_data.get("meta_description", "")
        content_html = article_data.get("content_html") or article_data.get("content", "")

        self.logger.info(f"Syndication Hub: Distributing '{title}' across platforms...")

        if dry_run:
            self.logger.info("[DRY-RUN] Simulating distribution across 8 channels.")
            return {"status": "simulated", "platforms": ["website", "bluesky", "mastodon", "threads", "twitter", "linkedin", "medium", "substack"]}

        # 1. Generate adapted micro-copy
        derivatives = self.generate_social_derivatives(title, excerpt, live_url, content_html)

        results = {}

        # 0. Buffer (Unified 1-token dispatcher to all connected social channels)
        import os
        if os.getenv("BUFFER_ACCESS_TOKEN") and (not platforms or "buffer" in platforms):
            results["buffer"] = self.buffer.publish_update(
                text=derivatives.get("linkedin_post", "") or derivatives.get("threads_text", ""),
                link_url=live_url,
                title=title,
                description=excerpt
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

        # 4. Threads
        if not platforms or "threads" in platforms:
            results["threads"] = self.threads.publish(
                text=derivatives.get("threads_text", "")
            )

        # 5. Twitter / X
        if not platforms or "twitter" in platforms:
            thread = derivatives.get("twitter_thread", [])
            if len(thread) > 1:
                results["twitter"] = self.twitter.publish_thread(thread)
            else:
                results["twitter"] = self.twitter.publish_tweet(thread[0] if thread else title, live_url)

        # 6. LinkedIn
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
                content_html=content_html,
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


