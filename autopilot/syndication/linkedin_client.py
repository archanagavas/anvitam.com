"""
LinkedIn Syndication Client via LinkedIn REST API (UGC Post).
Publishes long-form thought-leadership case studies.
"""

import json
import logging
from typing import Dict, Any, Optional
import requests
from autopilot.config import LINKEDIN_ACCESS_TOKEN, LINKEDIN_AUTHOR_URN, logger

class LinkedInClient:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.syndication.linkedin")

    def publish(
        self,
        text: str,
        link_url: Optional[str] = None,
        title: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Publishes a post to LinkedIn via UGC Posts API.
        """
        if not LINKEDIN_ACCESS_TOKEN or not LINKEDIN_AUTHOR_URN:
            self.logger.warning("LinkedIn credentials not configured (LINKEDIN_ACCESS_TOKEN / LINKEDIN_AUTHOR_URN). Skipping.")
            return {"platform": "linkedin", "status": "skipped", "reason": "Missing credentials"}

        try:
            url = "https://api.linkedin.com/v2/ugcPosts"
            headers = {
                "Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}",
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0"
            }

            share_media = []
            if link_url:
                share_media.append({
                    "status": "READY",
                    "originalUrl": link_url,
                    "title": {"text": title or "Anvitam Architecture & Ecological Design"}
                })

            share_content = {
                "shareCommentary": {"text": text[:2900]},
                "shareMediaCategory": "ARTICLE" if link_url else "NONE"
            }
            if share_media:
                share_content["media"] = share_media

            payload = {
                "author": LINKEDIN_AUTHOR_URN,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": share_content
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }

            res = requests.post(url, headers=headers, json=payload, timeout=20)
            if res.status_code in [200, 201]:
                data = res.json()
                urn = data.get("id")
                self.logger.info(f"Published to LinkedIn successfully: URN {urn}")
                return {"platform": "linkedin", "status": "success", "urn": urn}
            else:
                self.logger.error(f"LinkedIn publication failed: {res.text}")
                return {"platform": "linkedin", "status": "failed", "error": res.text}
        except Exception as e:
            self.logger.error(f"LinkedIn publication error: {e}")
            return {"platform": "linkedin", "status": "failed", "error": str(e)}
