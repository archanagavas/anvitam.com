/**
 * scripts/run-daily-blogs.ts
 *
 * 🌿 AUTONOMOUS DAILY BLOG AGENT — "ARCHANA'S RAW MENTOR VOICE"
 *
 * Designed to run on a daily schedule (GitHub Actions Cron or local runner).
 * 1. Discovers live search intent via Google Autocomplete API ($0, no key).
 * 2. Focuses on high-ticket buyers (landowners, retreat builders with capital).
 * 3. Writes 3-4 deep-dive SEO/AEO blogs (1,500–2,000 words) using the STARVE framework.
 * 4. Weaves in 4 natural internal links to Anvitam blogs, services, and projects.
 * 5. Saves strictly as 'draft' in Firebase Firestore.
 * 6. NO AI image generation (user will attach curated photos manually).
 * 7. Sends ONE consolidated daily digest email via Resend when all 3-4 blogs are complete.
 * 8. Consumes ZERO Vercel function credits!
 *
 * Usage:
 *   npx tsx scripts/run-daily-blogs.ts
 *   npx tsx scripts/run-daily-blogs.ts --count 3
 *   npx tsx scripts/run-daily-blogs.ts --dry-run
 */

import './load-env';
import { isDbConfigured, upsertDoc, getCollection } from '../lib/db';

// ── Seed Themes for High-Net-Worth Target Audience & Search Intent Discovery ──
// Explicitly targeting high-paying earners with capital ready to build:
// 1. Software Developers & Tech Founders (escaping city burnout, building off-grid retreats)
// 2. Merchant Navy Officers & Chief Engineers (high USD savings, investing in farmland retreats)
// 3. CXO-Level Executives & Business Leaders (luxury weekend villas, generational family estates)
// 4. Real Estate Builders & Resort Founders (eco-resort masterplans, high-RevPAR farmstays)
// 5. High-Net-Worth Landowners (2–50+ acres ready for regenerative masterplanning)
const SEED_NICHES = [
  {
    seed: 'tech founder off grid farmhouse design india',
    niche: 'Tech Founders & Software Engineers (Off-Grid Farm Retreats & Remote Work Sanctuary)',
    targetPersona: 'Senior Software Engineers, Tech Founders, and CXOs with ₹1Cr–₹3Cr+ budget seeking quiet, off-grid solar farm retreats with high-speed satellite internet, permaculture food zones, and zero city noise',
    primaryService: 'https://www.anvitam.com/services/weekend-villa',
    serviceAnchor: 'luxury weekend villa & off-grid farmhouse architecture',
  },
  {
    seed: 'merchant navy farmland investment eco retreat india',
    niche: 'Merchant Navy Officers & NRI Seafarers (Generational Farmland & Agro-Retreats)',
    targetPersona: 'Merchant Navy Captains and Chief Engineers earning high tax-free USD packages seeking secure, self-sustaining 5–20 acre farm retreats, managed food forests, and passive-income homestay masterplans',
    primaryService: 'https://www.anvitam.com/services/farm-retreat',
    serviceAnchor: 'farm retreat architecture and land masterplanning',
  },
  {
    seed: 'cxo luxury weekend villa architect maharashtra gujarat',
    niche: 'CXO & Business Leaders (Passive Solar Luxury Villas & Private Family Sanctuaries)',
    targetPersona: 'Corporate CXOs, Directors, and High-Net-Worth Families commissioning 4,000–10,000 sq.ft biophilic weekend villas built with rammed earth, passive cooling, and natural private swimming pools',
    primaryService: 'https://www.anvitam.com/services/weekend-villa',
    serviceAnchor: 'passive solar weekend villa design',
  },
  {
    seed: 'cost of building 5 acre eco resort india',
    niche: 'Resort Founders & Hospitality Developers (Boutique Eco-Resorts & High-RevPAR Stays)',
    targetPersona: 'Hospitality investors and boutique resort founders developing eco-resorts, wellness glamping retreats, and agrotourism hubs commanding ₹15,000 to ₹35,000 per night RevPAR',
    primaryService: 'https://www.anvitam.com/services/eco-resort',
    serviceAnchor: 'eco-resort masterplanning and zoning',
  },
  {
    seed: 'permaculture food forest zoning cost per acre india',
    niche: 'Farmland Owners & Builders (Food Forests & Syntropic Agroforestry)',
    targetPersona: 'Estate builders and landowners transforming 5 to 50 acres of degraded agricultural soil into high-yield, drought-proof 7-layer syntropic food forests and natural water retention systems',
    primaryService: 'https://www.anvitam.com/services/food-forest',
    serviceAnchor: 'food forest and syntropic agroforestry design',
  },
  {
    seed: 'groundwater recharge borewell swale cost per acre',
    niche: 'Water Hydrology & Swale Earthworks (Drought-Proofing Large Estates)',
    targetPersona: 'Farm retreat developers and rural property owners fixing dry borewells, stopping soil erosion, and capturing millions of liters of rainwater through keyline swales and percolation ponds',
    primaryService: 'https://www.anvitam.com/services/permaculture-design',
    serviceAnchor: 'permaculture zoning and water hydrology design',
  },
  {
    seed: 'boutique homestay architectural design guide roi',
    niche: 'Boutique Homestay & Agrotourism Entrepreneurs (Commercial Feasibility & Stays)',
    targetPersona: 'High-income individuals and rural heritage property owners monetizing scenic estates into profitable boutique homestays and farm-to-table visitor experiences',
    primaryService: 'https://www.anvitam.com/services/homestay',
    serviceAnchor: 'boutique homestay and Airbnb architectural design',
  },
  {
    seed: 'airbnb cottage design cost wayanad goa lonavala',
    niche: 'Airbnb & Vacation Rental Investors (High-Yield Biophilic Cottages)',
    targetPersona: 'Property investors and Airbnb superhosts looking to build high-occupancy 4-8 cottage nature stays with bamboo, wood, waterfront views, and vernacular biophilic aesthetics that command ₹12k–₹25k nightly tariffs',
    primaryService: 'https://www.anvitam.com/services/airbnb',
    serviceAnchor: 'Airbnb and vacation rental cottage architecture',
  },
  {
    seed: 'heritage homestay architecture design cost india',
    niche: 'Boutique Homestay Hosts & Heritage Property Renovators',
    targetPersona: 'Estate heirs and hospitality operators converting ancestral or rural properties into authentic, culturally rooted guest houses with distinct host-guest zoning and vernacular finishes',
    primaryService: 'https://www.anvitam.com/services/homestay',
    serviceAnchor: 'homestay design and guest house architecture',
  },
  {
    seed: 'wellness resort yoga retreat masterplan cost bali india',
    niche: 'Luxury Eco-Resort & Wellness Sanctuary Founders',
    targetPersona: 'Global investors and wellness entrepreneurs building 10–30 key eco-sanctuaries featuring meditation pavilions, healing shalas, yurts, and biological natural pools for international retreats',
    primaryService: 'https://www.anvitam.com/services/wellness-retreat',
    serviceAnchor: 'wellness and yoga retreat masterplanning',
  },
  {
    seed: 'agrotourism farm setup cost profit business model india',
    niche: 'Agrotourism & Working Farm Destination Operators',
    targetPersona: 'Forward-thinking orchardists, organic farm cooperatives, and agricultural landowners monetizing 20–50 acre farms with guided harvest trails, farm-to-table dining pavilions, and rustic stay cottages',
    primaryService: 'https://www.anvitam.com/services/agrotourism',
    serviceAnchor: 'agrotourism masterplanning and farm visit destination design',
  },
  {
    seed: 'gated farmland community masterplan architect developer india',
    niche: 'Luxury Farmland Developers & High-End Realtors (Managed Communities)',
    targetPersona: 'Real estate syndicates, luxury brokers, and land aggregators developing 20–100 acre managed gated farmland communities with shared clubhouses, internal roads, ecological hydrology, and high appreciation rates',
    primaryService: 'https://www.anvitam.com/services/community-center',
    serviceAnchor: 'managed farmland masterplanning and community activity center design',
  },
];

// Curated internal links strictly from verified recent live anvitam.com assets
const INTERNAL_BLOGS = [
  { url: 'https://www.anvitam.com/blog/soil-degradation-is-killing-indian-farms-and-how-permaculture-actually-fixes-it', anchor: 'how permaculture restores depleted farm soil' },
  { url: 'https://www.anvitam.com/blog/the-biggest-mistakes-indians-make-when-starting-a-terrace-garden', anchor: 'critical mistakes when designing productive rooftop and terrace gardens' },
  { url: 'https://www.anvitam.com/blog/indias-forgotten-earthquake-resistant-house-design', anchor: "India's traditional climate and earthquake-resilient architectural techniques" },
  { url: 'https://www.anvitam.com/blog/the-homestay-pricing-guide-nobodys-telling-you', anchor: 'unfiltered homestay pricing, RevPAR economics, and revenue realities' },
];

const INTERNAL_PROJECTS = [
  { url: 'https://www.anvitam.com/projects/vanvagado-farm', anchor: 'our Vanvagado Farm 15-acre eco-farm stay & food forest masterplan' },
  { url: 'https://www.anvitam.com/projects/carpa-lupa', anchor: 'our Carpa Lupa bamboo and timber Airbnb cottages in Wayanad' },
  { url: 'https://www.anvitam.com/projects/batukaru-yurt', anchor: 'our Batukaru Yurt private wellness retreat with sauna & yoga shala' },
  { url: 'https://www.anvitam.com/projects/yourweb3guy', anchor: 'our Bihar natural eco-home engineered with lime plaster and passive cooling' },
  { url: 'https://www.anvitam.com/projects/shalimar', anchor: 'our Shalimar upcycled terrace sanctuary and biophilic garden' },
];

// ── Helper: Live Search Intent Discovery via Google Autocomplete ($0) ────────
async function fetchGoogleAutocompleteQueries(seed: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(seed)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[1]) && data[1].length > 0) {
        return data[1].slice(0, 4);
      }
    }
  } catch (e) {
    // Graceful fallback
  }
  return [seed];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── Archana's Voice Generator (STARVE Framework) ─────────────────────────────
async function generateArchanaBlog(nicheInfo: typeof SEED_NICHES[0], targetQueries: string[]): Promise<any> {
  const chosenBlogLink = INTERNAL_BLOGS[Math.floor(Math.random() * INTERNAL_BLOGS.length)];
  const chosenProjectLink = INTERNAL_PROJECTS[Math.floor(Math.random() * INTERNAL_PROJECTS.length)];

  const systemPrompt = `You are Ar. Archana Gavas — a senior architect, permaculture designer, and founder of Anvitam Architecture & Ecological Design Studio based in Vadodara, Gujarat, India.

ROLE & VOICE ("RAW MENTOR"):
- You speak the unfiltered truth. You write not to impress, but to educate, build trust, and attract serious high-net-worth clients who want to build things that actually work.
- Target Audience: High-earning software engineers, tech founders escaping city burnout, merchant navy officers investing USD packages into Indian farmland, CXO-level corporate leaders building private luxury weekend villas, and eco-resort founders. People who HAVE capital (budget ₹50L to ₹5Cr+) and are looking to build now, NOT casual hobbyists.
- Target Persona for this article: ${nicheInfo.targetPersona}
- Tone: Calm authority, direct, warm, and highly conversational. You are sitting with a coffee across from a stressed property owner, explaining complex architectural and permaculture engineering so simply an 8th grader immediately understands it.
- NO FLUFF: Absolutely ZERO marketing jargon, academic fluff, or generic openings like "In today's fast-paced world", "Imagine a place", or "Sustainability is more important than ever".
- Vulnerable Authority: Share real numbers, contractor reality checks, soil failures, why mainstream cement/concrete architecture is broken in Indian heat, and what no one talks about.

THE STARVE FRAMEWORK (MANDATORY IN EVERY ARTICLE):
1. SOURCE & SEARCH INTENT: Address the exact practical dilemma: "${targetQueries.join(' / ')}".
2. SPECIFICITY: Use exact numbers (e.g., 4.5°C temperature drop, 18-inch thick rammed earth, 35,000 liters per rainfall event, 7-layer food forest canopy, ₹1,800/sq.ft vs ₹3,200/sq.ft).
3. TECHNICAL DEPTH: Explain the physics simply (passive solar shading, thermal lag, U-value of lime mortar, keyline water swales, nitrogen-fixing root zones).
4. ACTIONABILITY: Step-by-step numbered breakdown (1, 2, 3) that readers can implement.
5. EXPERTISE & ORIGINAL SYNTHESIS: Provide hidden, high-value insider knowledge NOT available in generic Google search results.

STRUCTURE & FORMATTING (CRITICAL):
- The Hook: Start with a bold 1–2 sentence statement that challenges an industry lie or shares a raw truth.
- Short Lines: Paragraphs MUST be 1–3 sentences max. Use massive white space.
- Headings: Clear, punchy H2 and H3 tags (e.g., "<h2>Why the 6-Inch RCC Slab is a Slow Microwave</h2>").
- Mandatory 4 Internal Links (must be naturally embedded with context):
  1. Primary Service: <a href="${nicheInfo.primaryService}">${nicheInfo.serviceAnchor}</a>
  2. Blog: <a href="${chosenBlogLink.url}">${chosenBlogLink.anchor}</a>
  3. Real Project Case Study: <a href="${chosenProjectLink.url}">${chosenProjectLink.anchor}</a>
  4. 1-on-1 Consultation: <a href="https://topmate.io/archanagavas">booking a 1-on-1 architectural and land masterplanning consultation</a>
- Scannable TL;DR Block (Key Takeaways): 5–7 bullet points written for Google Featured Snippets and AEO summary engines.
- 6 FAQs: Exactly 6 practical questions with 3–4 line direct answers.
- 3–5 Infographic Suggestions: Conceptual diagram ideas to visualize the engineering.
- Sign-Off: Conclude warmly with:
  <p>— Archana ❤️</p>
  <p><strong>P.S.</strong> [One conversational, warm closing thought asking what they're planning for their land]</p>

RETURN ONLY A VALID JSON OBJECT (no markdown ticks, no commentary):
{
  "title": "Bold, click-worthy, non-clickbait title under 60 chars",
  "excerpt": "Curiosity-inducing meta excerpt under 155 chars written for humans",
  "content": "Full rich HTML article (1,500 to 2,000 words) using <h2>, <h3>, <p>, <ul>, <ol>, <blockquote>, <table>. Do NOT include <h1>.",
  "tags": ["Architecture", "Eco Resort", "Permaculture"],
  "read_time": "7 min read",
  "keywords": ["${nicheInfo.seed}", "${targetQueries[0] || ''}"]
}`;

  const userPrompt = `Target Niche: ${nicheInfo.niche}\nLive Google Intent Queries: ${targetQueries.join(', ')}\n\nWrite this complete, unfiltered deep-dive article now in Archana's voice.`;

  // 1. Primary: NVIDIA NIM API (Llama 3.1 70B - ultra fast, free)
  const nvidiaKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
  if (nvidiaKey) {
    try {
      console.log(`[daily-blog] Calling NVIDIA NIM (Llama 3.1 70B) for: "${nicheInfo.niche}"...`);
      const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${nvidiaKey}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.65,
          max_tokens: 4096,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const rawContent = data.choices?.[0]?.message?.content?.trim() || '';
        const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (err: any) {
      console.warn(`[daily-blog] NVIDIA NIM failed: ${err.message}. Trying Gemini...`);
    }
  }

  // 2. Fallback 1: Groq (Llama 3.3 70B - Free, Ultra Fast)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log(`[daily-blog] Calling Groq (Llama 3.3 70B) fallback...`);
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.65,
          max_tokens: 4096,
          response_format: { type: 'json_object' },
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const rawContent = data.choices?.[0]?.message?.content?.trim() || '';
        return JSON.parse(rawContent);
      }
    } catch (err: any) {
      console.warn(`[daily-blog] Groq fallback failed: ${err.message}. Trying Gemini...`);
    }
  }

  // 3. Fallback 2: Google Gemini 2.5 Flash
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[daily-blog] Calling Gemini Flash fallback...`);
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: { temperature: 0.65, responseMimeType: 'application/json' },
          }),
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn(`[daily-blog] Gemini fallback failed: ${err.message}`);
    }
  }

  throw new Error(`Failed to generate article for niche: ${nicheInfo.niche}`);
}

// ── Consolidated Daily Digest Email via Resend ($0) ──────────────────────────
async function sendConsolidatedDailyDigest(blogs: any[]) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('[daily-blog] RESEND_API_KEY not configured. Skipping email notification.');
    return;
  }

  const targetEmails = ['ar.archanagavas@gmail.com', 'anvitamarchitects@gmail.com'];
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const blogsListHtml = blogs
    .map(
      (b, idx) => `
    <div style="background: #f9fbf9; border: 1px solid #e0ebd9; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #2b5711; text-transform: uppercase; letter-spacing: 0.8px;">
          Draft #${idx + 1} • ${b.tags?.[0] || 'Architecture'}
        </span>
        <span style="font-size: 11px; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-weight: 700;">
          DRAFT
        </span>
      </div>
      <h3 style="margin: 0 0 8px; font-size: 17px; color: #111827; line-height: 1.3;">
        ${b.title}
      </h3>
      <p style="margin: 0 0 14px; font-size: 13px; color: #4b5563; line-height: 1.5;">
        ${b.excerpt}
      </p>
      <div style="display: flex; gap: 12px; align-items: center;">
        <a href="https://www.anvitam.com/admin?tab=blogs&edit=${b.slug}" style="background-color: #2b5711; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-block;">
          Open in Editor &amp; Add Images →
        </a>
        <span style="font-size: 12px; color: #6b7280;">⏱️ ${b.read_time || '7 min read'}</span>
      </div>
    </div>
  `
    )
    .join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1b382b 0%, #2f5d47 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
        <span style="background-color: rgba(255, 255, 255, 0.2); font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 9999px; font-weight: 700;">
          Daily Content Digest
        </span>
        <h1 style="margin: 16px 0 8px; font-size: 22px; font-weight: 700; line-height: 1.3;">
          ${blogs.length} New SEO Drafts Ready for Review 🌿
        </h1>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">
          Written in Archana's Raw Mentor Voice (STARVE framework) for ${todayStr}
        </p>
      </div>

      <div style="padding: 24px;">
        <p style="font-size: 14px; color: #374151; line-height: 1.6; margin-top: 0;">
          Good morning Archana! Your autonomous agent forged <strong>${blogs.length} high-intent articles</strong> targeting high-ticket landowners and resort developers.
        </p>

        <p style="font-size: 13px; color: #6b7280; margin-bottom: 20px;">
          All posts are safely stored in <strong>Draft mode</strong>. Click any draft below to read, adjust, attach your curated photography, and publish when ready!
        </p>

        ${blogsListHtml}

        <div style="text-align: center; margin: 32px 0 16px;">
          <a href="https://www.anvitam.com/admin?tab=blogs" style="background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
            Open Anvitam Blog CMS →
          </a>
        </div>
      </div>

      <div style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280;">
        Anvitam Architecture &amp; Ecological Design Studio • Vadodara, Gujarat, India
      </div>
    </div>
  `;

  try {
    const senders = ['Anvitam Blog Agent <leads@anvitam.com>', 'Anvitam Blog Agent <onboarding@resend.dev>'];
    for (const sender of senders) {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          to: targetEmails,
          subject: `🌿 Daily SEO Digest: ${blogs.length} New Drafts Ready for Review (${todayStr})`,
          html,
        }),
      });

      if (resp.ok) {
        console.log(`[daily-blog] Consolidated daily digest email sent successfully via ${sender}`);
        return true;
      }
    }
  } catch (err: any) {
    console.error('[daily-blog] Failed to send digest email:', err.message);
  }
  return false;
}

// ── Main Daily Orchestrator ──────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const countArg = args.find((a, i) => args[i - 1] === '--count');
  const targetCount = countArg ? parseInt(countArg, 10) : 3;

  console.log('=' * 65);
  console.log(`🌿 ANVITAM AUTONOMOUS DAILY BLOG AGENT`);
  console.log(`   Target Output: ${targetCount} deep-dive drafts (STARVE framework)`);
  console.log(`   Voice:         Archana Gavas ("Raw Mentor" - coffee with peer)`);
  console.log(`   Image Gen:     DISABLED (User adds curated images manually)`);
  console.log(`   Storage:       Firestore 'draft' mode`);
  console.log(`   Execution:     100% Free / Zero Vercel Function Credits`);
  console.log('=' * 65);

  if (isDryRun) {
    console.log('🧪 DRY-RUN: Testing Google Suggest Intent Discovery...');
    for (const item of SEED_NICHES.slice(0, 3)) {
      const queries = await fetchGoogleAutocompleteQueries(item.seed);
      console.log(`   Niche: ${item.niche}`);
      console.log(`   Discovered Live Queries:`, queries);
    }
    console.log('✅ Dry-run intent discovery verified.');
    process.exit(0);
  }

  // Shuffle niches to write varied high-intent topics each day
  const shuffledNiches = [...SEED_NICHES].sort(() => 0.5 - Math.random());
  const selectedNiches = shuffledNiches.slice(0, targetCount);

  const completedDrafts: any[] = [];
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < selectedNiches.length; i++) {
    const nicheItem = selectedNiches[i];
    console.log(`\n[${i + 1}/${selectedNiches.length}] Discovering live intent for: "${nicheItem.niche}"...`);
    const liveQueries = await fetchGoogleAutocompleteQueries(nicheItem.seed);

    console.log(`[${i + 1}/${selectedNiches.length}] Forging article via STARVE framework in Archana's voice...`);
    try {
      const article = await generateArchanaBlog(nicheItem, liveQueries);
      const title = article.title || nicheItem.seed;
      const rawSlug = slugify(title);
      const slug = `${rawSlug}-${Date.now().toString().slice(-4)}`;

      const blogDoc = {
        id: slug,
        slug,
        title,
        excerpt: article.excerpt || '',
        content: article.content || '',
        cover_image: '', // Left blank for Archana to attach real photo in CMS
        author: 'Ar. Archana Gavas',
        date: today,
        status: 'draft' as const,
        tags: article.tags || ['Architecture', 'Permaculture'],
        read_time: article.read_time || '7 min read',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        target_niche: nicheItem.niche,
        seo_keywords: article.keywords || [nicheItem.seed],
      };

      if (isDbConfigured) {
        await upsertDoc('blogs', slug, blogDoc);
        console.log(`   ✅ Saved Draft to Firestore: "${title}" (Slug: ${slug})`);
      } else {
        console.warn(`   ⚠️ Firestore not configured. In-memory record created.`);
      }

      completedDrafts.push(blogDoc);
    } catch (err: any) {
      console.error(`   ❌ Failed drafting article ${i + 1}:`, err.message);
    }
  }

  console.log(`\n🎉 Completed forging ${completedDrafts.length} blog drafts for today.`);

  // Send ONE consolidated notification email after all blogs are forged
  if (completedDrafts.length > 0) {
    console.log('📬 Sending consolidated daily digest to ar.archanagavas@gmail.com...');
    await sendConsolidatedDailyDigest(completedDrafts);
  }

  console.log('\nAll daily tasks complete. Have a great day!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error in daily blog runner:', err);
  process.exit(1);
});
