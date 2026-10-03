"""
Meta Threads Syndication Client via Meta Threads Graph API.
"""

import time
import logging
from typing import Dict, Any, Optional
import requests
from autopilot.config import THREADS_ACCESS_TOKEN, THREADS_USER_ID, logger

class ThreadsClient:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.syndication.threads")

    def publish(
        self,
        text: str,
        image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Publishes a post to Meta Threads via the Graph API.
        Step 1: Create media container.
        Step 2: Publish container.
        """
        if not THREADS_ACCESS_TOKEN or not THREADS_USER_ID:
            self.logger.warning("Threads credentials not configured (THREADS_ACCESS_TOKEN / THREADS_USER_ID). Skipping.")
            return {"platform": "threads", "status": "skipped", "reason": "Missing credentials"}

        try:
            base_url = "https://graph.threads.net/v1.0"
            
            # Step 1: Create container
            create_url = f"{base_url}/{THREADS_USER_ID}/threads"
            payload = {
                "access_token": THREADS_ACCESS_TOKEN,
                "text": text[:500]
            }
            if image_url:
                payload["media_type"] = "IMAGE"
                payload["image_url"] = image_url
            else:
                payload["media_type"] = "TEXT"

            res = requests.post(create_url, data=payload, timeout=20)
            if res.status_code != 200:
                self.logger.error(f"Threads container creation failed: {res.text}")
                return {"platform": "threads", "status": "failed", "error": res.text}

            container_id = res.json().get("id")

            # Brief pause for container ingestion
            time.sleep(3)

            # Step 2: Publish container
            publish_url = f"{base_url}/{THREADS_USER_ID}/threads_publish"
            pub_res = requests.post(publish_url, data={
                "access_token": THREADS_ACCESS_TOKEN,
                "creation_id": container_id
            }, timeout=20)

            if pub_res.status_code == 200:
                post_id = pub_res.json().get("id")
                self.logger.info(f"Published to Threads successfully: ID {post_id}")
                return {"platform": "threads", "status": "success", "id": post_id}
            else:
                self.logger.error(f"Threads publish step failed: {pub_res.text}")
                return {"platform": "threads", "status": "failed", "error": pub_res.text}

        except Exception as e:
            self.logger.error(f"Threads publication error: {e}")
            return {"platform": "threads", "status": "failed", "error": str(e)}
