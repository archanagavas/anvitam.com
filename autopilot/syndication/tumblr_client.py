"""
Tumblr Syndication Client via official Tumblr API v2 (OAuth 2.0).
Publishes formatted visual stories, architectural case studies, and backlink references.
"""

import os
import logging
from typing import Dict, Any, List, Optional
import requests
from autopilot.config import logger

TUMBLR_BLOG_NAME = os.getenv("TUMBLR_BLOG_NAME", "anvitam")
TUMBLR_CONSUMER_KEY = os.getenv("TUMBLR_CONSUMER_KEY")
TUMBLR_CONSUMER_SECRET = os.getenv("TUMBLR_CONSUMER_SECRET")

class TumblrClient:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.syndication.tumblr")
        self._cached_token = None

    def _get_bearer_token(self) -> Optional[str]:
        """Obtains OAuth 2.0 Bearer token via client_credentials grant."""
        consumer_key = os.getenv("TUMBLR_CONSUMER_KEY")
        consumer_secret = os.getenv("TUMBLR_CONSUMER_SECRET")
        if not consumer_key or not consumer_secret:
            return None

        try:
            token_url = "https://api.tumblr.com/v2/oauth2/token"
            data = {
                "grant_type": "client_credentials",
                "client_id": consumer_key,
                "client_secret": consumer_secret
            }
            res = requests.post(token_url, data=data, timeout=15)
            if res.status_code == 200:
                self._cached_token = res.json().get("access_token")
                return self._cached_token
            else:
                self.logger.warning(f"Tumblr OAuth2 token fetch failed ({res.status_code}): {res.text}")
        except Exception as e:
            self.logger.error(f"Tumblr OAuth2 token exception: {e}")
        return None

    def publish(
        self,
        title: str,
        content_html: str,
        canonical_url: str,
        tags: Optional[List[str]] = None,
        as_draft: bool = False
    ) -> Dict[str, Any]:
        """
        Publishes a post to the Tumblr blog.
        """
        blog_name = os.getenv("TUMBLR_BLOG_NAME", "anvitam")
        blog_host = f"{blog_name}.tumblr.com" if not blog_name.endswith(".tumblr.com") else blog_name

        token = self._get_bearer_token()
        if not token:
            self.logger.warning("Tumblr credentials missing or invalid. Skipping Tumblr publication.")
            return {"platform": "tumblr", "status": "skipped", "reason": "Missing credentials"}

        try:
            url = f"https://api.tumblr.com/v2/blog/{blog_host}/post"
            headers = {"Authorization": f"Bearer {token}"}

            footer = (
                f'<hr><p><em>Originally researched and published by '
                f'<a href="{canonical_url}">Anvitam Architecture &amp; Ecological Design Studio</a>.</em></p>'
            )
            full_body = f"{content_html}\n{footer}"

            tag_list = tags or ["architecture", "rammed earth", "biophilic design", "sustainable living", "anvitam"]
            tag_str = ",".join(tag_list[:10])

            payload = {
                "type": "text",
                "title": title,
                "body": full_body,
                "state": "draft" if as_draft else "published",
                "tags": tag_str,
                "format": "html"
            }

            res = requests.post(url, headers=headers, data=payload, timeout=25)
            if res.status_code in [200, 201]:
                data = res.json().get("response", {})
                post_id = data.get("id_string") or data.get("id")
                post_url = f"https://www.tumblr.com/blog/view/{blog_name}/{post_id}" if post_id else f"https://{blog_host}"
                self.logger.info(f"Published to Tumblr successfully: {post_url}")
                return {
                    "platform": "tumblr",
                    "status": "success",
                    "id": post_id,
                    "url": post_url,
                    "state": "draft" if as_draft else "published"
                }
            else:
                self.logger.error(f"Tumblr publication failed ({res.status_code}): {res.text}")
                return {"platform": "tumblr", "status": "failed", "error": res.text}
        except Exception as e:
            self.logger.error(f"Tumblr publication error: {e}")
            return {"platform": "tumblr", "status": "failed", "error": str(e)}
