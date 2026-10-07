"""
Buffer Syndication Client via Buffer's official GraphQL API (https://api.buffer.com/graphql).
Enables unified publishing to connected channels (Twitter/X, LinkedIn, Threads, Facebook, Instagram).
"""

import os
import logging
from typing import Dict, Any, List, Optional
import requests
from autopilot.config import logger

BUFFER_ACCESS_TOKEN = os.getenv("BUFFER_ACCESS_TOKEN")
BUFFER_GRAPHQL_ENDPOINT = "https://api.buffer.com/graphql"

class BufferClient:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.syndication.buffer")

    def _get_headers(self) -> Dict[str, str]:
        token = os.getenv("BUFFER_ACCESS_TOKEN")
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    def get_profiles(self) -> List[Dict[str, Any]]:
        """Fetches all channels connected to the Buffer organization."""
        token = os.getenv("BUFFER_ACCESS_TOKEN")
        if not token:
            return []

        try:
            # Step 1: Query account organizations
            acct_q = """
            query {
              account {
                organizations {
                  id
                  name
                }
              }
            }
            """
            res = requests.post(BUFFER_GRAPHQL_ENDPOINT, headers=self._get_headers(), json={"query": acct_q}, timeout=15)
            if res.status_code != 200:
                self.logger.warning(f"Buffer account query returned {res.status_code}: {res.text}")
                return []

            orgs = res.json().get("data", {}).get("account", {}).get("organizations", [])
            if not orgs:
                self.logger.warning("No organizations found for Buffer account.")
                return []

            org_id = orgs[0]["id"]

            # Step 2: Query channels for organization
            chan_q = """
            query GetChannels($input: ChannelsInput!) {
              channels(input: $input) {
                id
                name
                service
              }
            }
            """
            res_chan = requests.post(
                BUFFER_GRAPHQL_ENDPOINT,
                headers=self._get_headers(),
                json={"query": chan_q, "variables": {"input": {"organizationId": org_id}}},
                timeout=15
            )
            if res_chan.status_code == 200:
                channels = res_chan.json().get("data", {}).get("channels", [])
                self.logger.info(f"Found {len(channels)} connected Buffer channels: {[(c.get('service'), c.get('name')) for c in channels]}")
                return channels
            else:
                self.logger.warning(f"Buffer channels query failed ({res_chan.status_code}): {res_chan.text}")
        except Exception as e:
            self.logger.error(f"Error fetching Buffer channels: {e}")
        return []

    def publish_update(
        self,
        text: str,
        link_url: Optional[str] = None,
        title: Optional[str] = None,
        description: Optional[str] = None,
        image_url: Optional[str] = None,
        publish_now: bool = True,
        platform_texts: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Publishes an update to all connected Buffer channels simultaneously via GraphQL createPost.
        Supports platform-specific customized text via `platform_texts` and image attachments via `image_url`.
        """
        token = os.getenv("BUFFER_ACCESS_TOKEN")
        if not token:
            self.logger.warning("Buffer credentials not configured (BUFFER_ACCESS_TOKEN). Skipping.")
            return {"platform": "buffer", "status": "skipped", "reason": "Missing BUFFER_ACCESS_TOKEN"}

        channels = self.get_profiles()
        if not channels:
            return {"platform": "buffer", "status": "failed", "error": "No connected channels found in Buffer account"}

        # Combine text and link
        post_content = text
        if link_url and link_url not in post_content:
            post_content = f"{text}\n\n{link_url}"

        mutation = """
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            ... on PostActionSuccess {
              post {
                id
                text
              }
            }
            ... on MutationError {
              message
            }
          }
        }
        """

        published_ids = []
        errors = []
        skip_linkedin = os.getenv("SKIP_BUFFER_LINKEDIN", "true").lower() in ("true", "1", "yes")

        for ch in channels:
            ch_id = ch["id"]
            service = ch.get("service", "unknown").lower()
            
            # If user opted for manual LinkedIn, skip Buffer's LinkedIn channel
            if service == "linkedin" and skip_linkedin:
                self.logger.info(f"Skipping Buffer channel '{ch.get('name')}' (LinkedIn) because manual posting mode is active for Archana.")
                continue

            # Use platform-tailored text if provided
            if platform_texts and service in platform_texts:
                ch_text = platform_texts[service]
            elif platform_texts and service in ("googlebusiness", "google_business") and ("googlebusiness" in platform_texts or "google_business" in platform_texts):
                ch_text = platform_texts.get("googlebusiness") or platform_texts.get("google_business")
            elif platform_texts and service == "facebook" and "facebook" in platform_texts:
                ch_text = platform_texts["facebook"]
            elif platform_texts and service == "facebook" and "linkedin" in platform_texts:
                ch_text = platform_texts["linkedin"]
                if link_url and link_url not in ch_text:
                    ch_text = f"{ch_text}\n\n{link_url}"
            else:
                ch_text = post_content

            # Enforce platform-specific limits and rules
            if service in ("twitter", "x") and len(ch_text) > 280:
                if link_url and link_url in ch_text:
                    prefix_limit = max(50, 280 - len(link_url) - 5)
                    ch_text = f"{text[:prefix_limit]}...\n{link_url}"
                else:
                    ch_text = ch_text[:280]
            elif service == "threads" and len(ch_text) > 490:
                if link_url and link_url in ch_text:
                    prefix_limit = max(50, 490 - len(link_url) - 5)
                    ch_text = f"{text[:prefix_limit]}...\n{link_url}"
                else:
                    ch_text = ch_text[:490]
            elif service == "bluesky" and len(ch_text) > 280:
                ch_text = ch_text[:275] + "…"
            elif service == "mastodon" and len(ch_text) > 490:
                ch_text = ch_text[:485] + "…"
            elif service in ("googlebusiness", "google_business") and len(ch_text) > 1400:
                ch_text = ch_text[:1390] + "…"

            buffer_mode_env = os.getenv("BUFFER_POST_MODE", "shareNow").strip().lower()
            use_queue = (buffer_mode_env in ("queue", "addtoqueue")) or (not publish_now)
            post_mode = "addToQueue" if use_queue else "shareNow"

            payload: Dict[str, Any] = {
                "channelId": ch_id,
                "text": ch_text,
                "mode": post_mode,
                "schedulingType": "automatic",
                "needsApproval": False,
                "saveToDraft": False,
                "assets": []
            }

            if image_url:
                payload["assets"] = [{"image": {"url": image_url}}]

            if service == "facebook":
                payload["metadata"] = {"facebook": {"type": "post"}}

            try:
                res = requests.post(
                    BUFFER_GRAPHQL_ENDPOINT,
                    headers=self._get_headers(),
                    json={"query": mutation, "variables": {"input": payload}},
                    timeout=20
                )
                data = res.json().get("data", {}).get("createPost", {})
                if "post" in data:
                    self.logger.info(f"Published to Buffer channel '{ch.get('name')}' ({service}) successfully!")
                    published_ids.append({"channel": ch.get("name"), "service": service, "id": data["post"]["id"]})
                else:
                    err_msg = data.get("message") or res.text
                    self.logger.error(f"Buffer publish failed for '{service}': {err_msg}")
                    errors.append({"service": service, "error": err_msg})
            except Exception as e:
                self.logger.error(f"Buffer publish exception for '{service}': {e}")
                errors.append({"service": service, "error": str(e)})

        status = "success" if published_ids else ("partial" if errors and published_ids else "failed")
        return {
            "platform": "buffer",
            "status": status,
            "published": published_ids,
            "errors": errors if errors else None
        }

