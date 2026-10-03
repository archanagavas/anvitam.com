"""
Bluesky Syndication Client via official AT Protocol SDK (atproto).
"""

import logging
from typing import Dict, Any, Optional
from autopilot.config import BLUESKY_HANDLE, BLUESKY_APP_PASSWORD, logger

class BlueskyClient:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.syndication.bluesky")

    def publish(
        self,
        text: str,
        link_url: Optional[str] = None,
        title: Optional[str] = None,
        description: Optional[str] = None,
        image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Publishes a post to Bluesky using the AT Protocol.
        Supports external link embed card.
        """
        if not BLUESKY_HANDLE or not BLUESKY_APP_PASSWORD:
            self.logger.warning("Bluesky credentials not configured (BLUESKY_HANDLE / BLUESKY_APP_PASSWORD). Skipping.")
            return {"platform": "bluesky", "status": "skipped", "reason": "Missing credentials"}

        try:
            from atproto import Client, client_utils, models
            client = Client()
            client.login(BLUESKY_HANDLE, BLUESKY_APP_PASSWORD)

            # Ensure post stays within 300 character limit
            post_text = text[:280]

            # Build external embed card if link provided
            embed = None
            if link_url and title:
                embed = models.AppBskyEmbedExternal.Main(
                    external=models.AppBskyEmbedExternal.External(
                        title=title[:250],
                        description=(description or "")[:300],
                        uri=link_url
                    )
                )

            if embed:
                res = client.send_post(text=post_text, embed=embed)
            else:
                res = client.send_post(text=post_text)

            self.logger.info(f"Published to Bluesky successfully: {res.uri}")
            return {"platform": "bluesky", "status": "success", "uri": res.uri, "cid": res.cid}
        except Exception as e:
            self.logger.error(f"Bluesky publication error: {e}")
            return {"platform": "bluesky", "status": "failed", "error": str(e)}
