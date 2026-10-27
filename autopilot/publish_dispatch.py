"""
Publish Dispatch Watcher.

Draft-hold rule (owner decision): autopilot blogs are staged as DRAFTS and
their social posts are staged locally (engine.py writes *_STAGED.json).
Nothing goes to socials at staging time.

This watcher closes the loop: it checks Firestore for each staged slug.
The moment Archana publishes that blog in the Admin panel
(status == 'published'), it dispatches the staged social posts with the
LIVE blog URL (never Topmate, never the draft), marks the staging file
*_DISPATCHED.json so it can never fire twice, and saves a dispatch record.

Run once:   python -m autopilot.publish_dispatch --once
Dry run:    python -m autopilot.publish_dispatch --once --dry-run
Also invoked by autopilot.scheduler at the start of every cycle.
"""

import argparse
import json
import logging
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from autopilot.config import SITE_BASE_URL, logger

SOCIALS_DIR = Path(__file__).resolve().parent / "published_records" / "socials"


def _firestore():
    from autopilot.agents.publisher import get_firestore_client
    return get_firestore_client()


def _blog_is_live(db: Any, slug: str) -> Dict[str, Any] | None:
    """Return the Firestore blog doc if it is published live, else None."""
    try:
        docs = db.collection("blogs").where("slug", "==", slug).limit(1).stream()
        for doc in docs:
            data = doc.to_dict() or {}
            if data.get("status") == "published" and data.get("isDraft") is not True:
                return data
            # Admin 'Publish' sets status='published'; treat that as live even
            # if a legacy isDraft flag lingers (Admin now clears it on save).
            if data.get("status") == "published":
                return data
    except Exception as e:
        logger.warning(f"publish_dispatch: Firestore check failed for {slug}: {e}")
    return None


def dispatch_staged_once(dry_run: bool = False) -> List[Dict[str, Any]]:
    """Dispatch every staged social set whose blog is now live. Returns outcomes."""
    outcomes: List[Dict[str, Any]] = []
    staged_files = sorted(SOCIALS_DIR.glob("*_STAGED.json"))
    if not staged_files:
        return outcomes

    db = _firestore()
    if db is None:
        logger.warning("publish_dispatch: no Firestore connection — cannot check publish status.")
        return outcomes

    from autopilot.syndication.syndicator import SyndicationHub
    from autopilot.image_generator import generate_architectural_image

    hub = SyndicationHub()

    for staged_file in staged_files:
        try:
            staged = json.loads(staged_file.read_text(encoding="utf-8"))
        except Exception as e:
            logger.warning(f"publish_dispatch: unreadable staging file {staged_file.name}: {e}")
            continue

        slug = staged.get("slug")
        if not slug:
            continue

        live_blog = _blog_is_live(db, slug)
        if not live_blog:
            logger.info(f"publish_dispatch: '{slug}' still a draft — socials remain staged.")
            outcomes.append({"slug": slug, "status": "still_draft"})
            continue

        live_url = staged.get("live_url") or f"{SITE_BASE_URL}/blog/{slug}"
        logger.info(f"publish_dispatch: '{slug}' is LIVE at {live_url} — dispatching staged socials now.")

        dispatches = []
        for idx, post in enumerate(staged.get("posts", []), 1):
            img = generate_architectural_image(
                concept=post.get("image_prompt") or post.get("concept") or staged.get("title") or slug,
                aspect_ratio="16:9",
                image_type=f"publish_{slug[:24]}_{idx}",
            )
            image_url = img.get("direct_url") if str(img.get("direct_url", "")).startswith("http") else None
            res = hub.syndicate_social_post(
                post_data=post,
                title=f"Anvitam: {post.get('concept', '')}",
                link_url=live_url,
                image_url=image_url,
                dry_run=dry_run,
            )
            dispatches.append({"slot": post.get("slot"), "concept": post.get("concept"), "image": image_url, "results": res})
            if not dry_run and idx < len(staged.get("posts", [])):
                time.sleep(8)

        record = {
            **staged,
            "dispatched_at": datetime.now().isoformat(),
            "live_url": live_url,
            "dry_run": dry_run,
            "dispatches": dispatches,
        }
        if not dry_run:
            done_file = staged_file.with_name(staged_file.name.replace("_STAGED.json", "_DISPATCHED.json"))
            done_file.write_text(json.dumps(record, indent=2, ensure_ascii=False, default=str), encoding="utf-8")
            staged_file.unlink()
            logger.info(f"publish_dispatch: '{slug}' dispatched and archived -> {done_file.name}")
        outcomes.append({"slug": slug, "status": "dispatched" if not dry_run else "dry_run_simulated", "posts": len(dispatches)})

    return outcomes


def main() -> None:
    parser = argparse.ArgumentParser(description="Dispatch staged socials for blogs that are now published")
    parser.add_argument("--once", action="store_true", help="Check once and exit (scheduler also calls this each cycle)")
    parser.add_argument("--dry-run", action="store_true", help="Simulate dispatch without posting live")
    args = parser.parse_args()
    results = dispatch_staged_once(dry_run=args.dry_run)
    print(json.dumps(results, indent=2, ensure_ascii=False, default=str))


if __name__ == "__main__":
    main()
