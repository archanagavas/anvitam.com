"""
Master Autopilot Engine & CLI Entrypoint.
Orchestrates the autonomous multi-agent growth & publishing loop:
1. Research Agent -> Live SERP scraping, competitor H1/H2 inspection, decision-paralysis gaps
2. Strategy Agent -> Scores gaps, evaluates Hormozi grand-slam offers, selects #1 winner
3. Writing Agent -> Drafts 1,800-word decision-breaking guides in Archana's Raw Mentor voice
4. Editor Agent -> Quality Gate audits against AEO and Stop-Slop (loops until >=92%)
5. Multi-Model Image Generator -> Creates photorealistic architectural imagery (Gemini/FLUX)
6. Publishing Agent -> Stages in Firestore as DRAFT + saves local Markdown records
7. Syndication Hub -> Dispatches to Bluesky, Mastodon, Threads, X, LinkedIn, Medium, Substack, Buffer

Usage:
  python -m autopilot.engine --mode run-all
  python -m autopilot.engine --mode research-gaps
  python -m autopilot.engine --mode write-topic --topic "If you bought 2 acres of land roadmap"
  python -m autopilot.engine --dry-run
"""

import sys
import io
import json
import argparse
import logging
from typing import Optional, Dict, Any
from datetime import datetime

# Ensure UTF-8 output on Windows console safely
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from autopilot.config import logger
from autopilot.agents.researcher import ResearchAgent
from autopilot.agents.strategist import StrategyAgent
from autopilot.agents.writer import WritingAgent
from autopilot.agents.editor import EditorAgent
from autopilot.agents.publisher import PublishingAgent
from autopilot.syndication.syndicator import SyndicationHub
from autopilot.image_generator import generate_architectural_image

class AutopilotEngine:
    def __init__(self):
        self.logger = logging.getLogger("autopilot.engine")
        self.researcher = ResearchAgent()
        self.strategist = StrategyAgent()
        self.writer = WritingAgent()
        self.editor = EditorAgent()
        self.publisher = PublishingAgent()
        self.syndicator = SyndicationHub()

    def run_nightly_cycle(
        self,
        day_number: Optional[int] = None,
        region_override: Optional[str] = None,
        topic_override: Optional[str] = None,
        dry_run: bool = False,
        skip_syndication: bool = False,
        skip_blog: bool = False
    ) -> Dict[str, Any]:
        """
        Executes the complete autonomous content & distribution cycle:
        1. Master Architectural Technical Guide -> Drafted in Archana's Raw Mentor Voice (Skipped if daily cap reached)
        2. Editor Quality Gate -> Checked against AEO & Stop-Slop anti-robotic rules
        3. Automated AI Image Generation -> Gemini Imagen / FLUX.1 visual generation
        4. Draft Publishing -> Saved as DRAFT in Firestore + Local Markdown review file
        5. 5 Independent Lead-Generating Social Posts -> Spaced & dispatched to Buffer, Bluesky, Mastodon, Tumblr with images
        """
        from autopilot.daily_blueprint import get_blueprint_day, SIXTY_DAY_PLAN

        # Determine target day and load rich continuous 60-day plan
        active_day = day_number or 1
        day_plan = get_blueprint_day(active_day)
        day_theme = day_plan.get('theme')
        cycle_num = day_plan.get('cycle_number', 1)
        base_day = day_plan.get('base_day', active_day)
        
        if cycle_num > 1:
            day_theme = f"{day_theme} (Cycle #{cycle_num} Rotation)"

        self.logger.info("=" * 70)
        self.logger.info(f"🌿 STARTING AUTONOMOUS GROWTH ENGINE — DAY {active_day}: {day_theme}")
        self.logger.info("=" * 70)

        strategy_brief = {}
        approved_draft = None
        pub_result = {}

        if not skip_blog:
            # ── Step 1: Research Agent with Live SERP Inspection ────────────────
            effective_topic = topic_override or (day_plan.get("master_blog", {}).get("title") if day_plan.get("master_blog") else None)
            if effective_topic:
                self.logger.info(f"Blueprint / Target topic directive: '{effective_topic}'")
                candidate_gaps = [{
                    "gap_id": 1,
                    "target_query": effective_topic,
                    "town": region_override or "Global Acreage / Western India (Alibaug / Goa / Gujarat)",
                    "competitor_reference": "Pre-vetted 30-Day Architectural Blueprint",
                    "customer_pain_point": "Decision paralysis on costs, water hydrology, and sequencing after buying land",
                    "buyer_persona": "Tech Founder / Merchant Navy / Developer / HNW Landowner ($100k+ capital)",
                    "search_intent": "Commercial Investigation & Actionable Blueprint"
                }]
            else:
                candidate_gaps = self.researcher.run(region_override=region_override)
                self.logger.info(f"Research Agent identified {len(candidate_gaps)} competitor search gaps.")

            # ── Step 2: Strategy Agent ──────────────────────────────────────────
            strategy_brief = self.strategist.run(candidate_gaps=candidate_gaps)
            winning_topic = strategy_brief.get("primary_keyword")
            self.logger.info(f"Strategy Agent selected winning keyword: '{winning_topic}' (Score: {strategy_brief.get('total_score')})")

            # ── Step 3 & 4: Writing Agent & Editor Quality Gate Loop ────────────
            max_editorial_loops = 3
            current_loop = 1
            revision_feedback = None

            while current_loop <= max_editorial_loops:
                self.logger.info(f"Writing Loop {current_loop}/{max_editorial_loops}: Generating draft...")
                draft = self.writer.run(strategy_brief=strategy_brief, revision_feedback=revision_feedback)

                self.logger.info(f"Editor Quality Gate: Auditing draft (Loop {current_loop})...")
                audit = self.editor.audit(draft=draft, strategy_brief=strategy_brief)
                score = audit.get("overall_score", 0)
                passed = audit.get("passed", False)

                self.logger.info(f"Editor Result: Score {score}/100 | Passed: {passed}")

                if passed or score >= 92:
                    self.logger.info(f"Quality gate PASSED on loop {current_loop} with score {score}/100!")
                    approved_draft = draft
                    approved_draft["editorial_score"] = score
                    approved_draft["editorial_audit"] = audit
                    break
                else:
                    self.logger.warning(f"Quality gate rejected draft. Issues found: {audit.get('issues_to_fix')}")
                    revision_feedback = audit.get("revision_instructions_for_writer")
                    current_loop += 1

            if not approved_draft:
                self.logger.warning("Reached max editorial loops without 92+ score. Proceeding with best current draft.")
                approved_draft = draft

            # ── Step 5: Multi-Model AI Image Generation ─────────────────────────
            self.logger.info("🎨 Image Generator: Creating publication-grade visual asset...")
            img_concept = approved_draft.get("cover_image_prompt") or approved_draft.get("title") or winning_topic
            img_result = generate_architectural_image(concept=img_concept, aspect_ratio="16:9", image_type="hero")
            approved_draft["cover_image"] = img_result.get("local_path")
            self.logger.info(f"✔ Blog Cover Image Ready ({img_result.get('source')}): {img_result.get('local_path')}")

            # ── Step 6: Publishing & Review Staging ──────────────────────────────
            pub_result = self.publisher.publish_article(draft=approved_draft, dry_run=dry_run)
            self.logger.info(f"Master Article Staging Complete: {pub_result}")
        else:
            self.logger.info("ℹ [Daily Blog Cap Active] Skipping article generation. Proceeding directly to independent social assets syndication.")
            pub_result = {"status": "skipped", "reason": "daily_blog_cap_reached"}

        # ── Step 7: Multi-Platform Syndication Hub ──────────────────────────
        syndication_results = {}
        social_dispatches = []

        if not skip_syndication:
            # A. Article overview to social channels (Protected by DRAFT safety)
            if approved_draft:
                article_payload = {
                    "title": approved_draft.get("title"),
                    "slug": pub_result.get("slug"),
                    "url": pub_result.get("url"),
                    "excerpt": approved_draft.get("excerpt") or approved_draft.get("meta_description"),
                    "content_html": approved_draft.get("content_html"),
                    "tags": approved_draft.get("tags"),
                    "image_url": approved_draft.get("cover_image"),
                    "is_draft": pub_result.get("is_draft", True)
                }
                syndication_results = self.syndicator.syndicate_all(
                    article_data=article_payload,
                    dry_run=dry_run
                )

            # B. Dispatch Independent Daily Social Posts
            daily_posts = day_plan.get("social_posts", [])
            print("\n" + "=" * 70)
            print(f"🌿 INDEPENDENT SOCIAL ASSETS — DAY {active_day}: {day_theme}")
            print(f"Engine: SLAY Copywriting Framework (Short Lines, Double Spacing, Zero Hashtags)")
            print("=" * 70)

            records_markdown = [
                f"# 🌿 Anvitam Social Assets — Day {active_day}",
                f"**Theme:** {day_theme}  ",
                f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  ",
                f"**Cadence:** Standalone High-Ticket Lead Assets (SLAY Framework)\n",
                "---\n"
            ]

            for idx, post in enumerate(daily_posts, 1):
                slot = post.get("slot", "Daily")
                p_type = post.get("type", "Asset")
                concept = post.get("concept", "")
                full_text = post.get("text", "")
                cta = post.get("cta", "")
                
                print(f"\n┌──────────────────────────────────────────────────────────────────┐")
                print(f"│ 📢 ASSET #{idx}/{len(daily_posts)} [{slot}] — {p_type.upper()}")
                print(f"│ Concept: {concept}")
                print(f"└──────────────────────────────────────────────────────────────────┘")
                print(f"{full_text}\n")
                if cta:
                    print(f"💬 DISCUSSION / CTA: {cta}\n")

                # Generate bespoke architectural visual asset for this specific social asset
                post_img_concept = post.get("image_prompt") or post.get("concept") or f"{day_theme}: {concept}"
                img_asset = generate_architectural_image(
                    concept=post_img_concept,
                    aspect_ratio="1:1" if slot in ["08:30 AM", "11:30 AM"] else "16:9",
                    image_type=f"social_day{active_day}_{idx}"
                )
                post_img_url = img_asset.get("direct_url") or img_asset.get("local_path")
                post["image_url"] = post_img_url
                post["image_local"] = img_asset.get("local_path")

                print(f"🎨 Visual Asset Generated: {img_asset.get('source')} ({img_asset.get('local_path')})")

                res = self.syndicator.syndicate_social_post(
                    post_data=post,
                    title=f"Anvitam: {concept}",
                    link_url="https://topmate.io/archanagavas",
                    image_url=post_img_url,
                    dry_run=dry_run
                )
                social_dispatches.append({
                    "slot": slot,
                    "type": p_type,
                    "concept": concept,
                    "image": post_img_url,
                    "results": res
                })
                active_channels = [k for k, v in res.items() if isinstance(v, dict) and v.get("status") in ["success", "simulated"]]
                print(f"✔ Dispatched across {len(active_channels)} channels with image: {active_channels}")
                
                records_markdown.append(f"## Asset {idx}: [{slot}] {p_type} — {concept}\n")
                records_markdown.append(f"**Visual Prompt / Asset:** `{post_img_concept}`  \n**Image:** {post_img_url}\n\n")
                records_markdown.append(f"### LinkedIn / Longform (SLAY Format)\n```\n{full_text}\n\n{cta}\n```\n")
                x_post_record = post.get("twitter_text") or post.get("threads_text")
                if x_post_record:
                    records_markdown.append(f"### X / Threads / Bluesky / Mastodon Format (Complete, ≤275 Chars)\n```\n{x_post_record}\n```\n")
                records_markdown.append(f"**Syndication Status:** {json.dumps(res)}\n\n---\n")

                # Respect platform rate limits between rapid social dispatches
                if not dry_run and idx < len(daily_posts):
                    import time
                    time.sleep(8)

            # Save local records
            import os
            social_records_dir = os.path.join(os.path.dirname(__file__), "published_records", "socials")
            os.makedirs(social_records_dir, exist_ok=True)
            today_str = datetime.now().strftime("%Y-%m-%d")
            social_record_file = os.path.join(social_records_dir, f"day_{active_day}_{today_str}.md")
            with open(social_record_file, "w", encoding="utf-8") as f:
                f.write("\n".join(records_markdown))
            print(f"\n📁 Local Social Archive Saved: {social_record_file}")

        self.logger.info("=" * 70)
        self.logger.info(f"🌿 DAY {active_day} AUTONOMOUS MULTI-ASSET CYCLE COMPLETE")
        self.logger.info(f"Master Guide Staged: {pub_result.get('url', 'Simulated')} (isDraft: True)")
        self.logger.info(f"Independent Social Posts Dispatched: {len(social_dispatches)}")
        self.logger.info("=" * 70)

        return {
            "day": active_day,
            "theme": day_theme,
            "strategy": strategy_brief,
            "article": {
                "title": approved_draft.get("title") if approved_draft else "Skipped (Daily Blog Cap Active)",
                "slug": approved_draft.get("slug") if approved_draft else None,
                "score": approved_draft.get("editorial_score") if approved_draft else None,
                "image": approved_draft.get("cover_image") if approved_draft else None
            },
            "publication": pub_result,
            "syndication": syndication_results,
            "social_posts_dispatched": social_dispatches
        }


def main():
    parser = argparse.ArgumentParser(description="Anvitam Autopilot: Autonomous Competitor Loop & Multi-Platform Syndication")
    parser.add_argument("--mode", choices=["run-all", "research-gaps", "write-topic", "syndicate", "day"], default="run-all", help="Execution mode")
    parser.add_argument("--day", type=int, default=1, help="Day number in blueprint (1-30 or continuous expansion)")
    parser.add_argument("--topic", type=str, help="Manual topic override to research and write")
    parser.add_argument("--region", type=str, help="Target region/corridor (e.g. 'Global Acreage', 'Alibaug', 'Goa')")
    parser.add_argument("--dry-run", action="store_true", help="Simulate without publishing live or dispatching posts")
    parser.add_argument("--skip-syndication", action="store_true", help="Only publish to website, skip social networks")

    args = parser.parse_args()

    engine = AutopilotEngine()

    if args.mode == "research-gaps":
        gaps = engine.researcher.run(region_override=args.region)
        print("\n🔍 6 UNCOVERED SEARCH GAPS FOUND WITH LIVE SERP INTEL:")
        print(json.dumps(gaps, indent=2))
        return

    if args.mode == "write-topic":
        if not args.topic:
            print("Error: --topic is required when using --mode write-topic")
            sys.exit(1)
        engine.run_nightly_cycle(
            topic_override=args.topic,
            region_override=args.region,
            dry_run=args.dry_run,
            skip_syndication=args.skip_syndication
        )
        return

    # Default / Day run: Run full cycle for target day
    engine.run_nightly_cycle(
        day_number=args.day,
        topic_override=args.topic,
        region_override=args.region,
        dry_run=args.dry_run,
        skip_syndication=args.skip_syndication
    )


if __name__ == "__main__":
    main()
