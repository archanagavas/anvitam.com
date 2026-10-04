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

    args = parser.parse_args()
    is_dry_run = not args.live
    chosen_cohort = None if args.cohort == "auto" else args.cohort
    cohort_info = get_active_cohort(chosen_cohort)

    print("=" * 70)
    print("🌿 ANVITAM ARCHITECTURAL LEAD & OUTREACH ENGINE")
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


if __name__ == "__main__":
    main()
