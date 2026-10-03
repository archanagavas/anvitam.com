"""
Local Continuous Scheduler for Anvitam Autopilot.
Runs locally on PC to generate and syndicate high-converting content every N minutes (e.g. 30 mins).
Features:
- Automatic graceful fallback: skips platforms whose keys are missing without crashing.
- Live countdown & rich console reporting.
- Diagnostic connection tester: python -m autopilot.scheduler --test-connections
"""

import os
import sys
import io
import time
import argparse
import logging
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


def run_scheduler(interval_minutes: int = 30, dry_run: bool = False, max_runs: int = 0):
    """
    Continuous local runner executing the autonomous multi-agent and syndication loop
    every `interval_minutes` minutes.
    """
    engine = AutopilotEngine()
    run_count = 0

    print("\n" + "=" * 65)
    print(f"🌿 LOCAL AUTOPILOT SCHEDULER ACTIVE (Interval: Every {interval_minutes} mins)")
    print(f"Mode: {'[DRY-RUN - No Live Publishing]' if dry_run else '[LIVE POSTING]'}")
    print("Press Ctrl+C to stop anytime.")
    print("=" * 65 + "\n")

    try:
        while True:
            run_count += 1
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n▶ [{now_str}] Launching Cycle #{run_count}...")

            try:
                result = engine.run_nightly_cycle(dry_run=dry_run)
                title = result.get("article", {}).get("title", "Untitled")
                score = result.get("article", {}).get("score", "N/A")
                print(f"✔ Cycle #{run_count} Complete: '{title}' (Editor Score: {score}/100)")
            except Exception as e:
                logger.error(f"Error during cycle #{run_count}: {e}")
                print(f"⚠ Cycle #{run_count} encountered error: {e}. Will retry in next interval.")

            if max_runs > 0 and run_count >= max_runs:
                print(f"Completed requested {max_runs} run(s). Exiting.")
                break

            next_run_time = datetime.now() + timedelta(minutes=interval_minutes)
            print(f"⏳ Sleeping for {interval_minutes} minutes... Next post at: {next_run_time.strftime('%H:%M:%S')}")
            time.sleep(interval_minutes * 60)

    except KeyboardInterrupt:
        print("\n🛑 Scheduler stopped by user.")


def main():
    parser = argparse.ArgumentParser(description="Anvitam Autopilot Local 30-Minute Social Scheduler")
    parser.add_argument("--interval", type=int, default=30, help="Posting interval in minutes (default: 30)")
    parser.add_argument("--dry-run", action="store_true", help="Simulate without publishing live")
    parser.add_argument("--test-connections", action="store_true", help="Inspect credentials for all 7 platforms")
    parser.add_argument("--max-runs", type=int, default=0, help="Exit after N runs (default: 0 = continuous)")

    args = parser.parse_args()

    if args.test_connections:
        test_social_connections()
        return

    run_scheduler(
        interval_minutes=args.interval,
        dry_run=args.dry_run,
        max_runs=args.max_runs
    )


if __name__ == "__main__":
    main()
