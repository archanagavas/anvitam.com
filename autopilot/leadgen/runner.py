"""
Master Runner & CLI Entrypoint for Autopilot Lead Generation & Weekly Sector Rotation.
Usage:
  python -m autopilot.leadgen.runner --mode all --dry-run
  python -m autopilot.leadgen.runner --mode send --live
  python -m autopilot.leadgen.runner --mode harvest --cohort realtors
  python -m autopilot.leadgen.runner --mode all --cohort hospitality --live
"""

import sys
import argparse
import logging

# Ensure UTF-8 console output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from .harvester import run_harvest
from .dispatcher import stage_outreach_drafts, dispatch_staged_leads
from .config import MAX_DAILY_SENDS
from .cohorts import get_active_cohort

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("autopilot.leadgen.runner")


def main():
    parser = argparse.ArgumentParser(description="Anvitam B2B & Architectural Lead Generation Engine")
    parser.add_argument(
        "--mode",
        choices=["all", "harvest", "stage", "send"],
        default="all",
        help="Action: harvest leads, stage drafts, send outreach, or all"
    )
    parser.add_argument(
        "--cohort",
        choices=["auto", "realtors", "hospitality", "retreats", "architects"],
        default="auto",
        help="Weekly sector cohort to target (Default: auto based on week of month)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Simulate actions without sending live emails"
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Execute LIVE email sending via Resend API"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=MAX_DAILY_SENDS,
        help=f"Maximum emails to process (Default: {MAX_DAILY_SENDS})"
    )
    parser.add_argument(
        "--loop",
        action="store_true",
        help="Run continuously in an autonomous recurring loop"
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=240,
        help="Interval between cycles in minutes when --loop is active (Default: 240 / 4 hours)"
    )

    args = parser.parse_args()
    is_dry_run = not args.live
    chosen_cohort = None if args.cohort == "auto" else args.cohort

    def run_single_pipeline(cycle_num: int = 1):
        cohort_info = get_active_cohort(chosen_cohort)
        from datetime import datetime
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        print("\n" + "=" * 70)
        print(f"🌿 ANVITAM ARCHITECTURAL LEAD & OUTREACH ENGINE — Cycle #{cycle_num}")
        print(f"   Time: {now_str}")
        print(f"   Mode: {args.mode.upper()} | Execution: {'🧪 DRY-RUN (Preview)' if is_dry_run else '🚀 LIVE SENDING (Resend API)'}")
        print(f"   Active Sector Cohort: Week {cohort_info['week_number']} — {cohort_info['name']}")
        print(f"   Target: 95% Global / 5% India | ~40% Female / ~60% Male")
        print(f"   CC Inbox: ar.archanagavas@gmail.com")
        print("=" * 70)

        if args.mode in ["harvest", "all"]:
            run_harvest(cohort_name=chosen_cohort)

        if args.mode in ["stage", "all"]:
            stage_outreach_drafts(cohort_name=chosen_cohort)

        if args.mode in ["send", "all"]:
            dispatch_staged_leads(dry_run=is_dry_run, max_sends=args.limit, cohort_name=chosen_cohort)

    if not args.loop:
        run_single_pipeline(1)
        print("\n✔ Lead generation & outreach cycle completed.")
        return

    import time
    from datetime import datetime, timedelta

    cycle = 1
    print("\n" + "=" * 70)
    print("🌿 ANVITAM CONTINUOUS LEAD GEN & OUTREACH LOOP ACTIVE")
    print(f"Loop Cadence: Every {args.interval} Minutes ({args.interval / 60:.1f} hours)")
    print(f"Execution: {'🧪 DRY-RUN (Preview)' if is_dry_run else '🚀 LIVE SENDING (Resend API)'}")
    print("Keep this terminal window open. Press Ctrl+C to halt.")
    print("=" * 70)

    try:
        while True:
            try:
                run_single_pipeline(cycle)
            except Exception as e:
                logger.error(f"Error during leadgen cycle #{cycle}: {e}")
                print(f"⚠ Cycle #{cycle} encountered error: {e}. Will retry in next interval.")

            next_run_time = datetime.now() + timedelta(minutes=args.interval)
            print(f"\n⏳ Cycle #{cycle} completed. Next run at: {next_run_time.strftime('%H:%M:%S')} (in {args.interval} mins)")
            print("   [Press Ctrl+C at any time to stop]\n")

            total_seconds = args.interval * 60
            for remaining in range(total_seconds, 0, -1):
                mins, secs = divmod(remaining, 60)
                hrs, mins = divmod(mins, 60)
                sys.stdout.write(f"\r⏳ Next outreach harvest & dispatch in: {hrs:02d}h {mins:02d}m {secs:02d}s ... ")
                sys.stdout.flush()
                time.sleep(1)

            sys.stdout.write("\r" + " " * 65 + "\r")
            cycle += 1

    except KeyboardInterrupt:
        print("\n🛑 Lead Gen & Outreach Loop stopped by user.")


if __name__ == "__main__":
    main()
