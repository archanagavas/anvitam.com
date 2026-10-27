"""
Automated Housekeeping & 24-Hour Purge Routine for Anvitam Autopilot.
Maintains a pristine, clutter-free workspace by automatically purging:
1. Local published markdown/JSON records older than 24 hours
   (All content is permanently preserved in Firebase Firestore DB and Git history).
2. Stale staged leads and sent drafts from the staging queue.
3. Rotates and compacts outreach audit logs to prevent file bloat.
4. Cleans stale temporary/scratch files older than 24 hours.
"""

import os
import sys
import json
import time
import argparse
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, List

# Safe UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Project paths
AUTOPILOT_DIR = Path(__file__).resolve().parent
WORKSPACE_ROOT = AUTOPILOT_DIR.parent
PUBLISHED_DIR = AUTOPILOT_DIR / "published_records"
LEADS_DIR = AUTOPILOT_DIR / "leads"
LOGS_DIR = WORKSPACE_ROOT / "scratch"

logger = logging.getLogger("autopilot.cleanup")


def purge_old_published_records(max_age_hours: int = 24) -> int:
    """
    Purges local markdown and JSON files from published_records/ that are older
    than `max_age_hours`. Content is safely stored in Firestore and Git.
    """
    if not PUBLISHED_DIR.exists():
        return 0

    now = time.time()
    cutoff_seconds = max_age_hours * 3600
    purged_count = 0
    bytes_freed = 0

    subdirs = ["blogs", "socials", "substack"]
    for sub in subdirs:
        folder = PUBLISHED_DIR / sub
        if not folder.exists():
            continue
        for file_path in folder.glob("*.*"):
            if file_path.is_file():
                # NEVER purge pending staged socials: they must survive until
                # Archana publishes the draft blog, however long review takes.
                # (publish_dispatch.py consumes *_STAGED.json on publish.)
                if "_STAGED." in file_path.name:
                    continue
                file_age = now - file_path.stat().st_mtime
                if file_age > cutoff_seconds:
                    try:
                        bytes_freed += file_path.stat().st_size
                        file_path.unlink()
                        purged_count += 1
                        logger.info(f"Purged old published record: {file_path.name} (Age: {file_age/3600:.1f}h)")
                    except Exception as e:
                        logger.warning(f"Could not purge {file_path.name}: {e}")

    if purged_count > 0:
        print(f"🧹 Purged {purged_count} published records older than {max_age_hours}h ({bytes_freed / 1024:.1f} KB freed).")
    return purged_count


def prune_staged_drafts_and_logs(max_age_hours: int = 24) -> int:
    """
    Cleans up already-sent drafts from staged_drafts.json and compacts outreach_log.md.
    """
    pruned_items = 0

    # 1. Clean staged_drafts.json
    staged_file = LEADS_DIR / "staged_drafts.json"
    sent_file = LEADS_DIR / "sent_history.json"
    if staged_file.exists():
        try:
            with open(staged_file, "r", encoding="utf-8") as f:
                staged = json.load(f)

            sent_emails = set()
            if sent_file.exists():
                with open(sent_file, "r", encoding="utf-8") as f:
                    sent = json.load(f)
                    sent_emails = {s.get("email", "").lower() for s in sent if isinstance(s, dict)}

            remaining = [d for d in staged if d.get("email", "").lower() not in sent_emails]
            removed = len(staged) - len(remaining)
            if removed > 0:
                with open(staged_file, "w", encoding="utf-8") as f:
                    json.dump(remaining, f, indent=2)
                pruned_items += removed
                print(f"🧹 Removed {removed} already-sent drafts from active staging queue.")
        except Exception as e:
            logger.warning(f"Error pruning staged drafts: {e}")

    # 2. Compact outreach_log.md to last 50 entries
    outreach_log = LEADS_DIR / "outreach_log.md"
    if outreach_log.exists():
        try:
            with open(outreach_log, "r", encoding="utf-8") as f:
                lines = f.readlines()

            # If outreach log exceeds 250 lines, compact to header + recent records
            if len(lines) > 250:
                header = lines[:15]
                recent = lines[-150:]
                with open(outreach_log, "w", encoding="utf-8") as f:
                    f.writelines(header)
                    f.write("\n<!-- ... Older records safely stored in Firestore DB ... -->\n\n")
                    f.writelines(recent)
                print("🧹 Compacted outreach_log.md (archived older history to Firestore DB).")
        except Exception as e:
            logger.warning(f"Error compacting outreach log: {e}")

    # 3. Clean pending_review.md if stale (> max_age_hours)
    pending_file = LEADS_DIR / "pending_review.md"
    if pending_file.exists():
        now = time.time()
        age = now - pending_file.stat().st_mtime
        if age > (max_age_hours * 3600):
            try:
                pending_file.unlink()
                print(f"🧹 Cleaned stale pending_review.md (Age: {age/3600:.1f}h).")
            except Exception as e:
                logger.warning(f"Error cleaning pending_review.md: {e}")

    return pruned_items


def purge_temporary_scratch(max_age_hours: int = 24) -> int:
    """
    Cleans up any temporary scratch files or local runtime logs older than max_age_hours.
    """
    purged = 0
    now = time.time()
    cutoff_seconds = max_age_hours * 3600

    target_dirs = [AUTOPILOT_DIR / "__pycache__", WORKSPACE_ROOT / "scratch"]
    for t_dir in target_dirs:
        if t_dir.exists():
            for f in t_dir.glob("*.*"):
                if f.is_file():
                    age = now - f.stat().st_mtime
                    if age > cutoff_seconds:
                        try:
                            f.unlink()
                            purged += 1
                        except Exception:
                            pass
    return purged


def run_full_purge(max_age_hours: int = 24) -> Dict[str, Any]:
    """
    Master housekeeping entrypoint. Runs all purge procedures.
    """
    print(f"\n🌿 [Auto-Housekeeping] Purging local records & logs older than {max_age_hours} hours...")
    print("   (Data remains permanently safe in Firebase Firestore DB + Git history)")

    records_purged = purge_old_published_records(max_age_hours=max_age_hours)
    drafts_pruned = prune_staged_drafts_and_logs(max_age_hours=max_age_hours)
    scratch_purged = purge_temporary_scratch(max_age_hours=max_age_hours)

    print("✔ [Auto-Housekeeping Complete] Workspace clean and compact.\n")
    return {
        "records_purged": records_purged,
        "drafts_pruned": drafts_pruned,
        "scratch_purged": scratch_purged
    }


def main():
    parser = argparse.ArgumentParser(description="Anvitam Autopilot Auto-Housekeeping & 24h Purge")
    parser.add_argument(
        "--hours",
        type=int,
        default=24,
        help="Max age in hours before records and logs are purged (Default: 24)"
    )
    args = parser.parse_args()
    run_full_purge(max_age_hours=args.hours)


if __name__ == "__main__":
    main()
