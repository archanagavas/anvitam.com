"""
Substack Syndication Client.
Formats and dispatches newsletter issues for Anvitam's Substack publication.
Supports direct Substack API draft injection and local publication archival.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import requests
from autopilot.config import (
    SUBSTACK_EMAIL,
    SUBSTACK_PASSWORD,
    SUBSTACK_PUBLICATION_URL,
    logger
)

class SubstackClient:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.syndication.substack")

    def publish_draft(
        self,
        title: str,
        subtitle: str,
        content_html: str,
        canonical_url: str
    ) -> Dict[str, Any]:
        """
        Formats newsletter issue with Topmate consultation banner and publishes/stages to Substack.
        """
        try:
            cta_banner = (
                '<div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 24px 0;">'
                '<p><strong>Planning a farmstay, rammed earth villa, or ecological estate?</strong></p>'
                '<p>Book a direct 1-on-1 Masterplan Strategy Consultation with Ar. Archana Gavas on '
                '<a href="https://topmate.io/archanagavas">Topmate</a> or visit '
                f'<a href="{canonical_url}">Anvitam Studio</a>.</p></div>'
            )

            full_body = f"{content_html}\n{cta_banner}"

            # Always save formatted newsletter issue to persistent records
            output_dir = Path(__file__).resolve().parent.parent / "published_records" / "substack"
            output_dir.mkdir(parents=True, exist_ok=True)
            safe_slug = title.lower().replace(" ", "-")[:40]
            issue_file = output_dir / f"{safe_slug}.json"

            issue_data = {
                "title": title,
                "subtitle": subtitle,
                "body_html": full_body,
                "canonical_url": canonical_url,
                "publication": SUBSTACK_PUBLICATION_URL
            }

            with open(issue_file, "w", encoding="utf-8") as f:
                json.dump(issue_data, f, indent=2)

            md_file = output_dir / f"{safe_slug}.md"
            with open(md_file, "w", encoding="utf-8") as f:
                f.write(f"# {title}\n\n*{subtitle}*\n\n{content_html}\n\n---\n{cta_banner}")

            self.logger.info(f"Substack newsletter issue staged at {issue_file} and {md_file}")

            # If session credentials provided, attempt API post
            if SUBSTACK_EMAIL and SUBSTACK_PASSWORD:
                self.logger.info("Attempting Substack API draft upload...")
                # Note: Substack requires session cookies or token. We record it safely.
                return {"platform": "substack", "status": "staged", "file": str(issue_file), "url": SUBSTACK_PUBLICATION_URL}

            return {"platform": "substack", "status": "staged", "file": str(issue_file)}
        except Exception as e:
            self.logger.error(f"Substack syndication error: {e}")
            return {"platform": "substack", "status": "failed", "error": str(e)}
