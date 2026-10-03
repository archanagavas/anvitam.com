"""
Google Business Profile Direct Syndication Client via official Google My Business API.
Publishes Local Posts ('What's New') with photos and Call-To-Action buttons directly to Google Maps & Search.
"""

import os
import logging
from typing import Dict, Any, Optional
import requests
from autopilot.config import logger

GOOGLE_BUSINESS_CLIENT_ID = os.getenv("GOOGLE_BUSINESS_CLIENT_ID")
GOOGLE_BUSINESS_CLIENT_SECRET = os.getenv("GOOGLE_BUSINESS_CLIENT_SECRET")
GOOGLE_BUSINESS_REFRESH_TOKEN = os.getenv("GOOGLE_BUSINESS_REFRESH_TOKEN")
GOOGLE_BUSINESS_ACCOUNT_ID = os.getenv("GOOGLE_BUSINESS_ACCOUNT_ID")
GOOGLE_BUSINESS_LOCATION_ID = os.getenv("GOOGLE_BUSINESS_LOCATION_ID")

class GoogleBusinessClient:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.syndication.googlebusiness")

    def _get_access_token(self) -> Optional[str]:
        """Exchanges refresh token for fresh short-lived OAuth access token."""
        client_id = os.getenv("GOOGLE_BUSINESS_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_BUSINESS_CLIENT_SECRET")
        refresh_token = os.getenv("GOOGLE_BUSINESS_REFRESH_TOKEN")

        if not client_id or not client_secret or not refresh_token:
            return None

        try:
            url = "https://oauth2.googleapis.com/token"
            payload = {
                "client_id": client_id,
                "client_secret": client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token"
            }
            res = requests.post(url, data=payload, timeout=15)
            if res.status_code == 200:
                return res.json().get("access_token")
            else:
                self.logger.warning(f"Google OAuth refresh failed ({res.status_code}): {res.text}")
        except Exception as e:
            self.logger.error(f"Google OAuth token error: {e}")
        return None

    def publish_local_post(
        self,
        text: str,
        link_url: Optional[str] = "https://topmate.io/archanagavas",
        image_url: Optional[str] = None,
        action_type: str = "BOOK"
    ) -> Dict[str, Any]:
        """
        Publishes a 'What's New' Local Post directly to Google Business Profile.
        """
        account_id = os.getenv("GOOGLE_BUSINESS_ACCOUNT_ID")
        location_id = os.getenv("GOOGLE_BUSINESS_LOCATION_ID")

        if not account_id or not location_id:
            self.logger.warning("Google Business account/location ID not configured. Skipping.")
            return {"platform": "google_business", "status": "skipped", "reason": "Missing account/location ID"}

        token = self._get_access_token()
        if not token:
            self.logger.warning("Could not obtain Google Business access token. Skipping.")
            return {"platform": "google_business", "status": "skipped", "reason": "OAuth token failed"}

        try:
            # Google My Business v4 Local Posts endpoint
            url = f"https://mybusiness.googleapis.com/v4/accounts/{account_id}/locations/{location_id}/localPosts"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            payload: Dict[str, Any] = {
                "languageCode": "en-US",
                "summary": text[:1500],
                "topicType": "STANDARD",
                "callToAction": {
                    "actionType": action_type,  # BOOK, LEARN_MORE, ORDER, SIGN_UP
                    "url": link_url or "https://topmate.io/archanagavas"
                }
            }

            if image_url:
                payload["media"] = [{
                    "mediaFormat": "PHOTO",
                    "sourceUrl": image_url
                }]

            res = requests.post(url, headers=headers, json=payload, timeout=25)
            if res.status_code in [200, 201]:
                data = res.json()
                post_name = data.get("name")
                self.logger.info(f"Published to Google Business Profile successfully: {post_name}")
                return {
                    "platform": "google_business",
                    "status": "success",
                    "name": post_name,
                    "searchUrl": data.get("searchUrl")
                }
            else:
                self.logger.error(f"Google Business publication failed ({res.status_code}): {res.text}")
                return {"platform": "google_business", "status": "failed", "error": res.text}
        except Exception as e:
            self.logger.error(f"Google Business publication exception: {e}")
            return {"platform": "google_business", "status": "failed", "error": str(e)}
