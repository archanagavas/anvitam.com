"""
Central Configuration for Autopilot Lead Generation & Global B2B Partner Outreach.
Focus: 90% Global (UK, Europe, Australia, US, UAE) · 10% High-Ticket Indian Regional.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

LEADGEN_DIR = Path(__file__).resolve().parent
AUTOPILOT_DIR = LEADGEN_DIR.parent
WORKSPACE_ROOT = AUTOPILOT_DIR.parent

# Load environment
load_dotenv(WORKSPACE_ROOT / ".env.autopilot")
load_dotenv(WORKSPACE_ROOT / ".env.local")
load_dotenv(WORKSPACE_ROOT / ".env")

# Storage directory for leads and review queues
LEADS_DATA_DIR = AUTOPILOT_DIR / "leads"
LEADS_DATA_DIR.mkdir(parents=True, exist_ok=True)

PROSPECTS_FILE = LEADS_DATA_DIR / "prospects.json"
STAGED_DRAFTS_FILE = LEADS_DATA_DIR / "staged_drafts.json"
SENT_HISTORY_FILE = LEADS_DATA_DIR / "sent_history.json"
REVIEW_REPORT_FILE = LEADS_DATA_DIR / "pending_review.md"
OUTREACH_AUDIT_LOG_FILE = LEADS_DATA_DIR / "outreach_log.md"

# Archana's Exact Persona & Booking Links
ARCHANA_NAME = "Archana Gavas"
ARCHANA_TITLE = "Principal Architect & Ecological Planner"
ARCHANA_STUDIO = "Anvitam Studio"
ARCHANA_EMAIL = os.getenv("ARCHANA_NOTIFICATION_EMAIL", "ar.archanagavas@gmail.com")
CC_NOTIFICATIONS = ["ar.archanagavas@gmail.com"]

# Action Links & 2-Step Consultation Funnel
TOPMATE_BOOKING_URL = "https://topmate.io/archanagavas/2322246?utm_source=public_profile&utm_campaign=archanagavas"
PORTFOLIO_URL = "https://www.anvitam.com/projects"
SITE_ANALYSIS_URL = "https://www.anvitam.com/site-analysis"
CONSULTATION_FEE_USD = "$100"
CONSULTATION_OFFER_NAME = "30-Minute Pre-Construction Feasibility & Space Planning Audit"

# Regional Targeting Ratios: 95% Global / 5% Indian Regional High-Ticket
GLOBAL_TARGET_RATIO = 0.95
INDIAN_TARGET_RATIO = 0.05

# Gender Persona Targets: ~40% Female / ~60% Male
FEMALE_TARGET_RATIO = 0.40
MALE_TARGET_RATIO = 0.60

# Safe Sending Caps: Max 100 emails/day (Resend Tier Cap)
# Spaced at ~5 minute intervals (290-310s) as requested by Archana.
MAX_DAILY_SENDS = 100
DAILY_OPERATING_START_HOUR = 7   # 07:00 AM
DAILY_OPERATING_END_HOUR = 23    # 11:00 PM
MIN_SECONDS_BETWEEN_EMAILS = 290 # ~5 minutes
MAX_SECONDS_BETWEEN_EMAILS = 310 # ~5 minutes

# Resend Config (anvitam.com is verified!)
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_SENDER = os.getenv("RESEND_OUTREACH_SENDER", "Archana Gavas <archana@anvitam.com>")
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

