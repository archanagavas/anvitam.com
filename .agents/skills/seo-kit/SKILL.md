---
name: seo-kit
description: "Matt Berman's SEO Kit adapted for Anvitam Architecture & Ecological Design. Autonomous keyword discovery, strike-zone ranking monitoring, psychology-driven content creation (Puppet Strings, Scroll Traps, Care-to-Click), zero-cost FLUX.1 image generation, technical SEO hygiene, and link acquisition powered by free API keys (NVIDIA NIM, Google Gemini, Cloudflare Workers AI, Hugging Face)."
---

# SEO Kit — Autonomous SEO & Growth Engine for Anvitam

Adapted from **Matt Berman's SEO Kit** (`https://github.com/TheMattBerman/seo-kit`) for **Anvitam Architecture & Ecological Design Studio**.

This skill chains keyword discovery, brand-anchored content writing, publication-grade image generation, and technical SEO hygiene into an automated, compounding organic loop — running at **$0.00 cost** on free-tier APIs.

---

## 1. Zero-Cost Engine Architecture

This kit requires **zero paid subscriptions**. It executes across:

| Layer | Primary ($0) | Fallback ($0) |
|---|---|---|
| **Text / LLM Engine** | **NVIDIA NIM API** (`meta/llama-3.1-70b-instruct`) via `NVIDIA_API_KEY` | **Google Gemini 2.5 Flash** (`GEMINI_API_KEY`) or **Cloudflare Workers AI** |
| **Image Generation** | **Hugging Face Serverless** (`FLUX.1-schnell`) via `HUGGINGFACE_API_KEY` | **Cloudflare Workers AI** (`@cf/black-forest-labs/flux-1-schnell`) or **Pollinations.ai** |
| **Image CDN** | **Cloudinary** (Free Tier: 25GB storage, 25GB bandwidth/mo) | Direct CDN serving |
| **Draft Notifications** | **Resend Email API** (Free Tier: 3,000 emails/mo) | Webhook / Telegram Bot |
| **Database Storage** | **Firebase Firestore** (Free Spark Plan: 50,000 reads/day) | Neon PostgreSQL |
| **Syndication Feeds** | **Dynamic Edge Serverless** (`/rss.xml`, `/atom.xml`, `/feed.json`) | Vercel Edge Cache |

---

## 2. Brand Profile (Anvitam Architecture & Ecological Design)

Before writing any content, inject this brand DNA:

- **Entity**: Anvitam — Boutique architecture and ecological design studio.
- **Principal Architect**: Ar. Archana Gavas (B.Arch, Permaculture & Ecological Design Specialist, Vadodara, Gujarat, India).
- **Core Pillars**:
  1. Biophilic & Sustainable Architecture (custom eco-homes, passive solar villas, rammed earth, lime plasters).
  2. Hospitality Eco-Resorts & Farm Stays (masterplanning, zone planning, agrotourism, revenue-producing retreats).
  3. Permaculture & Agroforestry (food forest layers, water swales, syntropic farming, rainwater harvesting).
  4. Educational & Institutional (birdhouse workshops, campus eco-clubs, school green masterplanning).
- **Brand Voice**: Authoritative, grounded in Indian ecology and climate realities, warm, practical, non-generic. Reject generic AI fluff. Use precise terminology (e.g. *micro-climate, swale hydrology, lime mortar breathable envelopes, passive thermal mass, Guild planting*).
- **Call-To-Action (CTA)**: Direct booking for architectural consultations or masterplanning on [topmate.io/archanagavas](https://topmate.io/archanagavas).

---

## 3. The SEO Forge Content Framework (Matt Berman)

Every article produced by this agent must satisfy the three core psychological frameworks:

### A. Puppet Strings (Core Human Drive)
Every article must commit to one primary drive before writing:
- **Wealth**: Financial ROI from eco-resorts, farm retreat bookings, energy savings from passive solar, increased land valuation.
- **Health / Wellbeing**: Non-toxic building materials, cleaner indoor air, circadian lighting, mental calm from biophilic views.
- **Status / Legacy**: Building a multi-generational estate, leading regenerative stewardship, architectural prestige.
- **Escape**: Breaking free from polluted urban sprawl into a self-sustaining food forest sanctuary.

### B. Scroll Traps (The First 300 Words)
Must deploy at least 3 of the following techniques:
1. **Term Branding**: Give the concept a proper noun (e.g., *"The Hydrological Micro-Sponge Strategy"*, *"The 7-Layer Syntropic Villa Matrix"*).
2. **Embedded Truths**: Replace "if you want to" with "when you install...".
3. **Thought Narration**: Speak the reader's unsaid thought (*"You're probably thinking a sustainable farm villa takes 3x the budget. In reality, bad zoning is what costs you."*).
4. **Pattern Interrupt**: Staccato sentences, punchy paragraphs, immediate data hooks.
5. **Specificity**: Specific dimensions, plant species, temperature differentials, square footage figures.
6. **Tribal Signaling**: *"If you own 2+ acres of rural land and want to stop burning money on borewells that run dry in May, this is for you."*

### C. Care-To-Click Persuasion Arc
1. **Care**: Open with the cost of ignoring the problem (e.g., failing borewells, concrete heat islands, toxic VOCs).
2. **Believe**: Anchor in real architectural principles, climate data, and Archana's field insights.
3. **See**: Walk through the step-by-step design roadmap with diagrams or structured tables.
4. **Want**: Paint the finished reality — a regenerative retreat that pays for itself and stays cool naturally.
5. **Stay**: Loop openers before each major heading (*"Here's the mistake 90% of resort owners make at Stage 2..."*).
6. **Click**: Contextual consultation CTA.

### D. Anti-AI-Overview Moat
Google's AI Overviews summarize generic articles. To rank permanently and build trust:
- Every post must include **at least 3 "Only I Can Write This" experience anchors**:
  - Exact local soil context (e.g., black cotton soil behavior vs alluvial plains in Western India).
  - Specific plant guilds (e.g., Moringa, Gliricidia, Vetiver grass for slope stabilization).
  - Concrete material specifications (surkhi lime plaster, local basalt stone foundation, fly-ash vs stabilized earth blocks).

---

## 4. Zero-Cost Image Generation (SEO-Images)

Generate publication-quality hero and inline images using the **Hugging Face Serverless Inference API**:

### FLUX.1 Prompt Presets for Anvitam:
1. **Cinematic Architectural Exterior**:
   `"Photorealistic architectural photography of a modern biophilic rammed-earth villa in lush tropical landscape, rainwater pond foreground, warm golden hour sun, Hasselblad H6D-100c, 35mm lens, f/2.8, architectural digest feature --ar 16:9"`
2. **Permaculture Food Forest & Landscape**:
   `"Lush multi-layered permaculture food forest design with tiered swales, stone pathways, edible canopy, dappled sunlight, rich fertile soil, high dynamic range editorial documentary style --ar 16:9"`
3. **Interior Biophilic Design**:
   `"Modern minimalist eco-resort interior with natural lime plaster walls, exposed reclaimed teak timber beams, large floor-to-ceiling glass looking out to green foliage, warm soft natural lighting, Kinfolk aesthetic --ar 16:9"`

Images are generated via `FLUX.1-schnell` -> uploaded to Cloudinary CDN -> stored as the blog's `cover_image`.

---

## 5. Automation & Publication Protocol

1. **Generation**: The agent writes the complete article in markdown / HTML format (1,200–2,000 words).
2. **Image Gen**: FLUX.1 generates a matching 16:9 cover image, uploaded to Cloudinary.
3. **Draft Retention**: The post is saved to Firestore with `status = 'draft'` and `date = TODAY`.
4. **Notification**: Resend sends an immediate preview email to `ar.archanagavas@gmail.com` with:
   - Blog Title, Excerpt, Word Count, Primary Keywords.
   - High-resolution cover image preview.
   - One-click Admin review link: `https://www.anvitam.com/admin?tab=blogs`.
5. **Approval**: When the user clicks "Publish" in the Admin panel:
   - Status changes to `'published'`.
   - The post immediately reflects on `/blog` and `/blog/:slug`.
   - Dynamically injected into `/sitemap.xml`, `/rss.xml`, `/feed.xml`, `/atom.xml`, `/feed.json`, and `/llms-full.txt` without any rebuild!
