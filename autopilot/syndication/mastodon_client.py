"""
Mastodon Syndication Client via Mastodon.py.
"""

import logging
from typing import Dict, Any, Optional
from autopilot.config import MASTODON_INSTANCE_URL, MASTODON_ACCESS_TOKEN, logger

class MastodonClient:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.syndication.mastodon")

    def publish(
        self,
        status_text: str,
        link_url: Optional[str] = None,
        image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Publishes a status update to Mastodon instance with optional architectural image.
        """
        if not MASTODON_ACCESS_TOKEN:
            self.logger.warning("Mastodon credentials not configured (MASTODON_ACCESS_TOKEN). Skipping.")
            return {"platform": "mastodon", "status": "skipped", "reason": "Missing credentials"}

        try:
            from mastodon import Mastodon
            instance_url = MASTODON_INSTANCE_URL or "https://mastodon.social"
            mastodon = Mastodon(
                access_token=MASTODON_ACCESS_TOKEN,
                api_base_url=instance_url
            )

            full_status = status_text
            if link_url and link_url not in full_status:
                full_status = f"{status_text}\n\nRead full architectural breakdown: {link_url}"

            media_ids = []
            if image_url:
                try:
                    import requests, tempfile, os
                    img_resp = requests.get(image_url, timeout=15)
                    if img_resp.status_code == 200:
                        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                            tmp.write(img_resp.content)
                            tmp_path = tmp.name
                        media_dict = mastodon.media_post(tmp_path)
                        if media_dict and "id" in media_dict:
                            media_ids.append(media_dict["id"])
                        try:
                            os.remove(tmp_path)
                        except Exception:
                            pass
                except Exception as me:
                    self.logger.warning(f"Mastodon image upload notice: {me}")

            # Mastodon standard limit is 500 characters
            toot = mastodon.status_post(
                status=full_status[:495],
                media_ids=media_ids if media_ids else None
            )
            self.logger.info(f"Published to Mastodon successfully: {toot.get('url')}")
            return {"platform": "mastodon", "status": "success", "url": toot.get("url")}
        except Exception as e:
            self.logger.error(f"Mastodon publication error: {e}")
            return {"platform": "mastodon", "status": "failed", "error": str(e)}
