"""
Medium Syndication Client via official Medium REST API.
Publishes canonical long-form articles preserving SEO authority on anvitam.com.
"""

import logging
from typing import Dict, Any, List, Optional
import requests
from autopilot.config import MEDIUM_INTEGRATION_TOKEN, MEDIUM_USER_ID, logger

class MediumClient:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.syndication.medium")

    def _get_user_id(self) -> Optional[str]:
        if MEDIUM_USER_ID:
            return MEDIUM_USER_ID
        if not MEDIUM_INTEGRATION_TOKEN:
            return None
        try:
            res = requests.get(
                "https://api.medium.com/v1/me",
                headers={"Authorization": f"Bearer {MEDIUM_INTEGRATION_TOKEN}"},
                timeout=15
            )
            if res.status_code == 200:
                return res.json().get("data", {}).get("id")
        except Exception as e:
            self.logger.warning(f"Could not retrieve Medium User ID: {e}")
        return None

    def publish(
        self,
        title: str,
        content_html: str,
        canonical_url: str,
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Publishes canonical story to Medium.
        canonical_url ensures Google attributes full SEO authority to anvitam.com.
        """
        if not MEDIUM_INTEGRATION_TOKEN:
            self.logger.warning("Medium credentials not configured (MEDIUM_INTEGRATION_TOKEN). Skipping.")
            return {"platform": "medium", "status": "skipped", "reason": "Missing credentials"}

        user_id = self._get_user_id()
        if not user_id:
            return {"platform": "medium", "status": "failed", "error": "Unable to determine Medium user ID"}

        try:
            url = f"https://api.medium.com/v1/users/{user_id}/posts"
            headers = {
                "Authorization": f"Bearer {MEDIUM_INTEGRATION_TOKEN}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }

            # Embed canonical notice at bottom
            footer_html = (
                f'<hr><p><em>This article was originally published on '
                f'<a href="{canonical_url}">Anvitam Architecture &amp; Ecological Design</a>.</em></p>'
            )
            full_html = f"<h1>{title}</h1>\n{content_html}\n{footer_html}"

            payload = {
                "title": title,
                "contentFormat": "html",
                "content": full_html,
                "canonicalUrl": canonical_url,
                "tags": (tags or ["Architecture", "Sustainability", "Permaculture"])[:5],
                "publishStatus": "public"
            }

            res = requests.post(url, headers=headers, json=payload, timeout=30)
            if res.status_code in [200, 201]:
                data = res.json().get("data", {})
                medium_url = data.get("url")
                self.logger.info(f"Published to Medium successfully: {medium_url}")
                return {"platform": "medium", "status": "success", "url": medium_url}
            else:
                self.logger.error(f"Medium publication failed: {res.text}")
                return {"platform": "medium", "status": "failed", "error": res.text}
        except Exception as e:
            self.logger.error(f"Medium publication error: {e}")
            return {"platform": "medium", "status": "failed", "error": str(e)}
