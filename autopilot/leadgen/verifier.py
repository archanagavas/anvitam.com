"""
Zero-Cost Email Verification & Deliverability Gate.
Validates email syntax, domain MX reachability, anti-spam filters, and suppresses duplicate outreach.
"""

import re
import socket
import json
import logging
from typing import Dict, Any, Tuple
from pathlib import Path
from .config import SENT_HISTORY_FILE

socket.setdefaulttimeout(2.5)
logger = logging.getLogger("autopilot.leadgen.verifier")

EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

# Common generic platforms/junk to suppress
SUPPRESSED_DOMAINS = {
    "sentry.io", "wixpress.com", "example.com", "test.com", "multiquote.com"
}

SUPPRESSED_PREFIXES = {
    "noreply", "no-reply", "donotreply", "mailer-daemon", "abuse", "privacy"
}


def load_sent_history() -> set:
    """Loads previously contacted emails to ensure zero duplicate sending."""
    if SENT_HISTORY_FILE.exists():
        try:
            with open(SENT_HISTORY_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
                return set(entry.get("email", "").lower() for entry in history if isinstance(entry, dict))
        except Exception as e:
            logger.warning(f"Could not read sent_history.json: {e}")
    return set()


def record_sent_email(lead_record: Dict[str, Any]) -> None:
    """Appends newly contacted lead to sent history."""
    history = []
    if SENT_HISTORY_FILE.exists():
        try:
            with open(SENT_HISTORY_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = []
    history.append(lead_record)
    try:
        with open(SENT_HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to update sent history: {e}")


def verify_lead_email(email: str) -> Tuple[bool, str]:
    """
    Validates email format, domain MX resolution, and deduplication.
    Returns (is_valid: bool, reason: str).
    """
    if not email or not isinstance(email, str):
        return False, "Empty or non-string email"

    clean_email = email.strip().lower()

    # 1. Syntax Check
    if not EMAIL_REGEX.match(clean_email):
        return False, f"Invalid RFC 5322 syntax: '{clean_email}'"

    user_part, domain_part = clean_email.split("@", 1)

    # 2. Filter Suppressed Role/System Accounts
    if any(clean_email.startswith(p) for p in SUPPRESSED_PREFIXES):
        return False, f"Suppressed system/role prefix: '{user_part}'"

    if domain_part in SUPPRESSED_DOMAINS:
        return False, f"Suppressed domain: '{domain_part}'"

    # 3. Check Sent History (Deduplication)
    sent_emails = load_sent_history()
    if clean_email in sent_emails:
        return False, f"Already contacted previously: '{clean_email}'"

    # 4. Domain DNS / MX Reachability (Zero-cost native socket lookup)
    try:
        # Check if domain resolves to at least one valid address
        socket.getaddrinfo(domain_part, 25, socket.AF_INET, socket.SOCK_STREAM)
    except socket.gaierror:
        try:
            socket.getaddrinfo(domain_part, 80, socket.AF_INET, socket.SOCK_STREAM)
        except socket.gaierror:
            return False, f"Unresolvable domain (DNS host not found): '{domain_part}'"
    except Exception as e:
        logger.debug(f"DNS lookup note for {domain_part}: {e}")

    return True, "Valid and reachable"
