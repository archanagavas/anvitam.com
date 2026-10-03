"""
Twitter / X Syndication Client via Twitter API v2 (Tweepy).
Supports single tweets and high-signal multi-tweet threads.
"""

import logging
from typing import Dict, Any, List, Optional
from autopilot.config import (
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET,
    TWITTER_BEARER_TOKEN,
    logger
)

class TwitterClient:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.syndication.twitter")

    def publish_tweet(
        self,
        text: str,
        link_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Publishes a single tweet (under 280 characters) via Twitter API v2.
        """
        if not (TWITTER_API_KEY and TWITTER_API_SECRET and TWITTER_ACCESS_TOKEN and TWITTER_ACCESS_SECRET):
            self.logger.warning("Twitter API keys not configured. Skipping.")
            return {"platform": "twitter", "status": "skipped", "reason": "Missing credentials"}

        try:
            import tweepy
            client = tweepy.Client(
                bearer_token=TWITTER_BEARER_TOKEN,
                consumer_key=TWITTER_API_KEY,
                consumer_secret=TWITTER_API_SECRET,
                access_token=TWITTER_ACCESS_TOKEN,
                access_token_secret=TWITTER_ACCESS_SECRET
            )

            tweet_content = text
            if link_url and link_url not in tweet_content:
                tweet_content = f"{text}\n\nFull study: {link_url}"

            # 280-char safeguard
            res = client.create_tweet(text=tweet_content[:280])
            tweet_id = res.data.get("id")
            self.logger.info(f"Published tweet successfully: ID {tweet_id}")
            return {"platform": "twitter", "status": "success", "id": tweet_id}
        except Exception as e:
            self.logger.error(f"Twitter publication error: {e}")
            return {"platform": "twitter", "status": "failed", "error": str(e)}

    def publish_thread(
        self,
        tweets: List[str]
    ) -> Dict[str, Any]:
        """
        Publishes a connected Twitter thread.
        """
        if not (TWITTER_API_KEY and TWITTER_API_SECRET and TWITTER_ACCESS_TOKEN and TWITTER_ACCESS_SECRET):
            return {"platform": "twitter", "status": "skipped", "reason": "Missing credentials"}

        try:
            import tweepy
            client = tweepy.Client(
                bearer_token=TWITTER_BEARER_TOKEN,
                consumer_key=TWITTER_API_KEY,
                consumer_secret=TWITTER_API_SECRET,
                access_token=TWITTER_ACCESS_TOKEN,
                access_token_secret=TWITTER_ACCESS_SECRET
            )

            tweet_ids = []
            previous_id = None
            for tweet_text in tweets:
                clean_text = tweet_text[:280]
                if previous_id:
                    res = client.create_tweet(text=clean_text, in_reply_to_tweet_id=previous_id)
                else:
                    res = client.create_tweet(text=clean_text)
                previous_id = res.data.get("id")
                tweet_ids.append(previous_id)

            self.logger.info(f"Published Twitter thread with {len(tweet_ids)} tweets.")
            return {"platform": "twitter", "status": "success", "thread_ids": tweet_ids}
        except Exception as e:
            self.logger.error(f"Twitter thread error: {e}")
            return {"platform": "twitter", "status": "failed", "error": str(e)}
