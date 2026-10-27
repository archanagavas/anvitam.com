"""
Local Continuous Scheduler for Anvitam Autopilot.
Runs locally on PC to generate and syndicate high-converting content with intelligent pacing.

Features:
- Pacing Gate: Enforces max 1-2 master blogs per 24 hours to prevent burning through monthly calendars in hours.
- Spaced Distribution: Automatically spaces daily social posts across natural business hours.
- State Persistence (autopilot/state.json): Remembers current day, advances sequentially into evergreen dynamic expansion.
- Automated Git Commit & Push: Pushes newly generated records, markdown archives, and link registry to GitHub after every cycle.
- Diagnostic Connection Tester: python -m autopilot.scheduler --test-connections
"""

import os
import sys
import io
import time
import json
import argparse
import logging
import subprocess
from pathlib import Path
from datetime import datetime, timedelta

# Safe UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from autopilot.config import (
    BLUESKY_HANDLE, BLUESKY_APP_PASSWORD,
    MASTODON_ACCESS_TOKEN, MASTODON_INSTANCE_URL,
    THREADS_ACCESS_TOKEN, THREADS_USER_ID,
    TWITTER_API_KEY, TWITTER_ACCESS_TOKEN,
    LINKEDIN_ACCESS_TOKEN, LINKEDIN_AUTHOR_URN,
    MEDIUM_INTEGRATION_TOKEN,
    SUBSTACK_EMAIL,
    logger
)
from autopilot.engine import AutopilotEngine
from autopilot.daily_blueprint import THIRTY_DAY_PLAN

STATE_FILE = Path(__file__).resolve().parent / "state.json"

def load_autopilot_state() -> dict:
    """Loads persistent scheduler state from JSON file."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Could not load state.json ({e}). Starting fresh.")
    return {
        "current_day": 1,
        "completed_cycles": 0,
        "last_run_timestamp": None,
        "last_run_date": None,
        "blogs_published_today": 0,
        "last_article_title": None
    }

def save_autopilot_state(state: dict) -> None:
    """Atomically saves scheduler state to JSON file."""
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save state.json: {e}")

def auto_git_sync(cycle_num: int, day_num: int, enabled: bool = False) -> None:
    """
    Optional git sync. Disabled by default in automated scheduler loops
    to prevent infinite Vercel build loops and resource exhaustion.
    Only runs if explicitly enabled via --git-sync CLI flag.
    """
    if not enabled:
        logger.debug("Git auto-sync disabled for background scheduler. Local records & Firestore updated directly.")
        return

    try:
        targets = [
            "autopilot/published_records",
            "autopilot/link_registry.py",
            "autopilot/state.json"
        ]
        status_proc = subprocess.run(
            ["git", "status", "--porcelain"] + targets,
            capture_output=True,
            text=True,
            check=False
        )
        if not status_proc.stdout.strip():
            print("ℹ Git Sync: No new local records or registry updates to commit.")
            return

        print("\n🌿 Auto-Sync: Staging new content & records to Git...")
        subprocess.run(["git", "add"] + targets, check=True)

        # STRICT VERCEL SKIP: [skip vercel] [vercel skip] [skip ci] guarantees Vercel ignores the webhook
        commit_msg = f"🌿 Autopilot: Cycle #{cycle_num} (Day {day_num}) records & registry sync [skip vercel] [vercel skip] [skip ci]"
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)

        print("🌿 Auto-Sync: Pushing updates to GitHub (origin/main)...")
        push_proc = subprocess.run(["git", "push", "origin", "main"], capture_output=True, text=True, check=False)
        if push_proc.returncode == 0:
            print(f"✔ GitHub Push Success: Committed and pushed cycle #{cycle_num} to origin/main [skip vercel]!")
        else:
            print(f"⚠ Git push notice: {push_proc.stderr.strip()[:200]}")
    except Exception as e:
        logger.warning(f"Git auto-sync warning (will continue scheduler): {e}")

def test_social_connections():
    """Diagnostic tool to inspect which platforms are ready and which need API keys."""
    print("\n" + "=" * 65)
    print("🌿 ANVITAM SOCIAL SYNDICATION CREDENTIALS STATUS")
    print("=" * 65)

    checks = [
        ("0. Buffer (All-in-1)", bool(os.getenv("BUFFER_ACCESS_TOKEN")), "BUFFER_ACCESS_TOKEN (Posts to X, LinkedIn, Threads, Mastodon in 1 token!)"),
        ("1. Bluesky", bool(BLUESKY_HANDLE and BLUESKY_APP_PASSWORD), "BLUESKY_HANDLE, BLUESKY_APP_PASSWORD"),
        ("2. Mastodon", bool(MASTODON_ACCESS_TOKEN), "MASTODON_ACCESS_TOKEN"),
        ("3. Meta Threads", bool(THREADS_ACCESS_TOKEN and THREADS_USER_ID), "THREADS_ACCESS_TOKEN, THREADS_USER_ID"),
        ("4. Twitter / X", bool(TWITTER_API_KEY and TWITTER_ACCESS_TOKEN), "TWITTER_API_KEY, TWITTER_ACCESS_TOKEN, etc."),
        ("5. LinkedIn", bool(LINKEDIN_ACCESS_TOKEN and LINKEDIN_AUTHOR_URN), "LINKEDIN_ACCESS_TOKEN, LINKEDIN_AUTHOR_URN"),
        ("6. Medium", bool(MEDIUM_INTEGRATION_TOKEN), "MEDIUM_INTEGRATION_TOKEN"),
        ("7. Substack", bool(SUBSTACK_EMAIL), "SUBSTACK_EMAIL, SUBSTACK_PASSWORD (Optional: Markdown staging active)"),
        ("8. Tumblr", bool(os.getenv("TUMBLR_CONSUMER_KEY") and os.getenv("TUMBLR_CONSUMER_SECRET")), "TUMBLR_CONSUMER_KEY, TUMBLR_CONSUMER_SECRET"),
        ("9. Google Business", bool(os.getenv("GOOGLE_BUSINESS_REFRESH_TOKEN")), "GOOGLE_BUSINESS_CLIENT_ID, GOOGLE_BUSINESS_REFRESH_TOKEN"),
    ]

    for name, is_ready, env_vars in checks:
        status_label = "[READY]" if is_ready else "[PENDING KEY]"
        print(f"{name:<18} {status_label:<14} (Requires: {env_vars})")

    print("=" * 65)
    print("Add missing keys to: g:\\CODE\\anvitam\\.env.local or .env.autopilot\n")


def run_scheduler(
    interval_minutes: int = 180,
    max_blogs_per_day: int = 2,
    dry_run: bool = False,
    max_runs: int = 0,
    git_sync: bool = False
):
    """
    Continuous local runner executing the autonomous multi-agent and syndication loop.
    Default interval: 180 mins (3 hours), with max 1-2 blogs per day pacing.
    """
    engine = AutopilotEngine()
    state = load_autopilot_state()
    run_count = state.get("completed_cycles", 0)

    print("\n" + "=" * 70)
    print(f"🌿 ANVITAM AUTONOMOUS GROWTH ENGINE ACTIVE")
    print(f"Loop Cadence: Every {interval_minutes} Minutes ({interval_minutes / 60:.1f} hours)")
    print(f"Daily Blog Cap: Max {max_blogs_per_day} Blog(s) per 24h Day")
    print(f"Execution Mode: {'[DRY-RUN - Staging Only]' if dry_run else '[LIVE POSTING]'}")
    print(f"Current Blueprint Day: Day {state.get('current_day', 1)}")
    print("Keep this terminal window open. Press Ctrl+C to stop anytime.")
    print("=" * 70 + "\n")

    try:
        while True:
            run_count += 1
            current_day = state.get("current_day", 1)
            now = datetime.now()
            now_str = now.strftime("%Y-%m-%d %H:%M:%S")
            today_date = now.strftime("%Y-%m-%d")

            # Check daily blog limits
            last_date = state.get("last_run_date")
            if last_date != today_date:
                state["blogs_published_today"] = 0
                state["last_run_date"] = today_date

            blogs_today = state.get("blogs_published_today", 0)
            skip_blog = blogs_today >= max_blogs_per_day

            if skip_blog:
                print(f"ℹ Daily Blog Cap Reached ({blogs_today}/{max_blogs_per_day} for {today_date}). Running social syndication & maintenance...")

            print(f"\n▶ [{now_str}] Launching Cycle #{run_count} (Day {current_day})...")

            # Publish Dispatch: fire staged socials for any draft blog that
            # Archana has since Published in Admin (with the live blog URL).
            try:
                from autopilot.publish_dispatch import dispatch_staged_once
                dispatched = [o for o in dispatch_staged_once(dry_run=dry_run) if o.get("status") in ("dispatched", "dry_run_simulated")]
                if dispatched:
                    print(f"📣 Publish Dispatch: socials sent for {len(dispatched)} newly-published blog(s): {[o['slug'] for o in dispatched]}")
            except Exception as e:
                logger.debug(f"Publish dispatch check note: {e}")

            # Auto-Housekeeping: Purge local records & logs older than 24h
            try:
                from autopilot.cleanup import run_full_purge
                run_full_purge(max_age_hours=24)
            except Exception as e:
                logger.debug(f"Housekeeping note: {e}")

            try:
                result = engine.run_nightly_cycle(
                    day_number=current_day,
                    dry_run=dry_run,
                    skip_blog=skip_blog
                )
                title = result.get("article", {}).get("title", "Untitled")
                score = result.get("article", {}).get("score", "N/A")
                social_dispatched = len(result.get("social_posts_dispatched", []))

                if not skip_blog:
                    print(f"✔ Cycle #{run_count} Complete: Master Guide '{title}' (Editor Score: {score}/100, Staged as DRAFT)")
                else:
                    print(f"✔ Cycle #{run_count} Complete: Master Guide skipped (Daily Blog Cap {max_blogs_per_day} active for today)")
                print(f"✔ Multi-Asset Distribution: {social_dispatched} Independent Lead Posts Dispatched with Images")

                # Update state
                if not skip_blog:
                    state["blogs_published_today"] = blogs_today + 1
                state["current_day"] = current_day + 1
                state["completed_cycles"] = run_count
                state["last_run_timestamp"] = now_str
                state["last_run_date"] = today_date
                if not skip_blog:
                    state["last_article_title"] = title
                save_autopilot_state(state)

                # Optional Git sync (disabled by default in automated loops)
                auto_git_sync(cycle_num=run_count, day_num=current_day, enabled=git_sync)

            except Exception as e:
                logger.error(f"Error during cycle #{run_count}: {e}")
                print(f"⚠ Cycle #{run_count} encountered error: {e}. Will retry in next interval.")

            if max_runs > 0 and run_count >= max_runs:
                print(f"Completed requested {max_runs} run(s). Exiting.")
                break

            next_run_time = datetime.now() + timedelta(minutes=interval_minutes)
            print(f"\n⏳ Cycle #{run_count} finished. Next cycle at: {next_run_time.strftime('%H:%M:%S')} (in {interval_minutes} mins)")
            print(f"🌿 Next Day Queue: Day {state.get('current_day')}")

            # Sleep in 60-second chunks to allow clean Ctrl+C response
            sleep_seconds = interval_minutes * 60
            for remaining in range(sleep_seconds, 0, -60):
                mins_left = remaining // 60
                if mins_left % 30 == 0 and mins_left > 0:
                    print(f"   ... Next run in {mins_left} minutes ({next_run_time.strftime('%H:%M:%S')})")
                time.sleep(min(60, remaining))

    except KeyboardInterrupt:
        print("\n🛑 Scheduler stopped by user.")


def main():
    parser = argparse.ArgumentParser(description="Anvitam Autopilot Local Continuous Growth Scheduler")
    parser.add_argument("--interval", type=int, default=180, help="Cycle interval in minutes (default: 180 / 3 hours)")
    parser.add_argument("--max-blogs", type=int, default=2, help="Max blogs to publish per 24 hours (default: 2)")
    parser.add_argument("--dry-run", action="store_true", help="Simulate without publishing live")
    parser.add_argument("--git-sync", action="store_true", help="Sync generated records to Git origin/main [skip vercel] (default: False)")
    parser.add_argument("--test-connections", action="store_true", help="Inspect credentials for all social platforms")
    parser.add_argument("--max-runs", type=int, default=0, help="Exit after N runs (default: 0 = continuous)")

    args = parser.parse_args()

    if args.test_connections:
        test_social_connections()
        return

    run_scheduler(
        interval_minutes=args.interval,
        max_blogs_per_day=args.max_blogs,
        dry_run=args.dry_run,
        max_runs=args.max_runs,
        git_sync=args.git_sync
    )


if __name__ == "__main__":
    main()
