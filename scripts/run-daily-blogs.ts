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
// Explicitly targeting high-paying global clients across US, Europe, UK, Australia, Costa Rica, UAE, Bali:
// 1. Luxury Eco-Resort & Glamping Developers ($1M–$5M builds, high-RevPAR hospitality)
// 2. High-Net-Worth Off-Grid Estate Owners ($1.5M–$4M private luxury sanctuaries)
// 3. Commercial Living Pool & Wellness Retreat Founders (chemical-free biological water architecture)
// 4. Regenerative Agrotourism & Large Farmland Developers (15–100+ acre masterplanning)
// 5. Arid & Tropical Passive Solar Villa Builders (extreme heat passive cooling, zero energy bills)
const SEED_NICHES = [
  {
    seed: 'cost of building 5 acre luxury eco resort glamping masterplan',
    niche: 'International Luxury Eco-Resort & Glamping Developers (Costa Rica, Portugal, Bali, US)',
    targetPersona: 'Hospitality investors and boutique resort developers commissioning 10–35 key luxury eco-resorts ($1M–$5M build budget) commanding $400–$1,200/night RevPAR, seeking bioclimatic zoning, passive cooling chalets, and chemical-free biological pools',
    primaryService: 'https://www.anvitam.com/services/eco-resort',
    serviceAnchor: 'luxury eco-resort masterplanning and bioclimatic hospitality architecture',
  },
  {
    seed: 'off grid luxury rammed earth villa architect modern biophilic design cost',
    niche: 'High-Net-Worth Off-Grid Estate Builders (California, Mediterranean, Texas, Australia)',
    targetPersona: 'Ultra-high-net-worth families, entrepreneurs, and tech executives commissioning 4,000–12,000 sq.ft biophilic private estates built with stabilized rammed earth, mass timber, solar microgrids, and passive cooling ($1.5M–$4M construction)',
    primaryService: 'https://www.anvitam.com/services/weekend-villa',
    serviceAnchor: 'off-grid biophilic villa and luxury estate architecture',
  },
  {
    seed: 'natural biological swimming pool vs chlorine resort cost maintenance roi',
    niche: 'Luxury Hospitality & Estate Founders (Water Architecture: Living Pool vs Chemical)',
    targetPersona: 'Boutique resort founders and luxury estate owners calculating the long-term ROI, filtration biology, and operational savings of chemical-free natural living pools filtered through gravel-root wetland reed beds vs chlorinated concrete pools',
    primaryService: 'https://www.anvitam.com/services/wellness-retreat',
    serviceAnchor: 'natural biological swimming pool and wellness sanctuary engineering',
  },
  {
    seed: 'regenerative farmstay masterplan design agrotourism business model roi',
    niche: 'Regenerative Farmstay & Agrotourism Entrepreneurs (Europe, US, New Zealand, Australia)',
    targetPersona: 'Agricultural estate owners, rural heritage property investors, and vineyard operators transforming 20–100+ acres into high-margin farm-to-table guest lodges, boutique tasting pavilions, and working agroforestry stays ($35k–$75k masterplan fee)',
    primaryService: 'https://www.anvitam.com/services/agrotourism',
    serviceAnchor: 'regenerative agrotourism and farmstay masterplanning',
  },
  {
    seed: 'keyline design swale water retention dam cost per acre large estate',
    niche: 'Large Acreage Estate Hydrology & Swale Earthworks (Drought-Proofing 10–100+ Acres)',
    targetPersona: 'Acreage buyers and ranch owners in arid or Mediterranean climates (Texas, California, Portugal, Spain, Australia) designing passive rainwater harvesting swales, keyline dams, and deep subterranean aquifers for permanent water sovereignty',
    primaryService: 'https://www.anvitam.com/services/permaculture-design',
    serviceAnchor: 'keyline water hydrology and permaculture estate zoning',
  },
  {
    seed: 'syntropic agroforestry food forest design cost per acre layout guide',
    niche: 'Farmland Owners & Permaculture Estate Developers (Syntropic Food Forests)',
    targetPersona: 'Estate builders and regenerative landowners transforming 5 to 50 acres of land into resilient, drought-proof 7-layer syntropic food forests that produce organic food, high-value timber, and privacy windbreaks without chemical fertilizers',
    primaryService: 'https://www.anvitam.com/services/food-forest',
    serviceAnchor: 'syntropic agroforestry and food forest masterplanning',
  },
  {
    seed: 'passive cooling architecture extreme heat zero energy villa design',
    niche: 'Arid & Tropical Passive Solar Villa Builders (UAE, Arizona, Mediterranean, Bali)',
    targetPersona: 'Commercial resort developers and luxury homeowners building in hot desert or tropical zones seeking zero-energy passive cooling through 450mm thermal mass, venturi airflow wind catchers, and bioclimatic shading cantilevers',
    primaryService: 'https://www.anvitam.com/services/weekend-villa',
    serviceAnchor: 'passive solar bioclimatic cooling architecture',
  },
  {
    seed: 'wellness retreat masterplan architect yoga shala sound healing pavilion cost',
    niche: 'Boutique Wellness & Yoga Sanctuary Founders (Bali, Costa Rica, Thailand, Europe)',
    targetPersona: 'International wellness entrepreneurs building 10–30 key retreat centers featuring sacred geometry yoga shalas, sound healing pavilions, natural hot-spring thermal spas, and biophilic lodging commanding $350–$800/night per guest',
    primaryService: 'https://www.anvitam.com/services/wellness-retreat',
    serviceAnchor: 'wellness retreat masterplanning and yoga sanctuary design',
  },
  {
    seed: 'boutique glamping cabins architectural design cost roi per unit',
    niche: 'High-Yield Boutique Glamping & Vacation Rental Investors (UK, US, Canada, Australia)',
    targetPersona: 'Hospitality entrepreneurs and landowners developing clusters of 6–15 luxury nature cabins (mass timber, panoramic glass, outdoor soaking tubs) achieving 75%+ year-round occupancy and $350–$650 average daily rate (ADR)',
    primaryService: 'https://www.anvitam.com/services/airbnb',
    serviceAnchor: 'boutique nature cabin and luxury vacation rental architecture',
  },
  {
    seed: 'permaculture masterplanner vs landscape architect estate design cost',
    niche: 'Estate Owners & Land Buyers (Commercial Decision: Permaculture vs Landscape)',
    targetPersona: 'Discerning property owners choosing between an ecological permaculture masterplanner (focusing on hydrology, soil regeneration, windbreak physics, passive microclimate) and a conventional landscape architect',
    primaryService: 'https://www.anvitam.com/services/permaculture-design',
    serviceAnchor: 'ecological land masterplanning and permaculture zoning',
  },
];

// Curated internal links strictly from verified recent live anvitam.com assets
const INTERNAL_BLOGS = [
  { url: 'https://www.anvitam.com/blog/soil-degradation-is-killing-indian-farms-and-how-permaculture-actually-fixes-it', anchor: 'how permaculture restores depleted farm soil' },
  { url: 'https://www.anvitam.com/blog/the-biggest-mistakes-indians-make-when-starting-a-terrace-garden', anchor: 'critical mistakes when designing productive rooftop and terrace gardens' },
  { url: 'https://www.anvitam.com/blog/indias-forgotten-earthquake-resistant-house-design', anchor: 'traditional climate and earthquake-resilient architectural techniques' },
  { url: 'https://www.anvitam.com/blog/the-homestay-pricing-guide-nobodys-telling-you', anchor: 'unfiltered homestay pricing, RevPAR economics, and revenue realities' },
];

const INTERNAL_PROJECTS = [
  { url: 'https://www.anvitam.com/projects/yourweb3guy', anchor: 'our natural eco-home engineered with lime plaster and passive cooling' },
  { url: 'https://www.anvitam.com/projects/beer-bar', anchor: 'our canal front food zone and overhead walking pavilions' },
  { url: 'https://www.anvitam.com/projects/shalimar', anchor: 'our Shalimar upcycled terrace sanctuary and biophilic garden' },
  { url: 'https://www.anvitam.com/projects/vanvagado-farm', anchor: 'our Vanvagado Farm 15-acre eco-farm stay, natural pond and food forest masterplan' },
  { url: 'https://www.anvitam.com/projects/carpa-lupa', anchor: 'our Carpa Lupa bamboo and timber cottages in Wayanad' },
  { url: 'https://www.anvitam.com/projects/batukaru-yurt', anchor: 'our Batukaru Yurt private wellness retreat with sauna and yoga shala' },
  { url: 'https://www.anvitam.com/projects/ramgarh-nainital-interior-project-shiloh-experiences-hotel', anchor: 'our Ramgarh Nainital boutique retreat and hotel project' },
  { url: 'https://www.anvitam.com/projects/kamba-agrotourism-vardhaman-royal-organic-agri-farm', anchor: 'our Kamba Agrotourism 45-acre masterplan' },
  { url: 'https://www.anvitam.com/projects/kusum-vilas-palace-heritage-destination-development', anchor: 'our Kusum Vilas Palace heritage development' },
];

// Interactive Architectural Intelligence Calculators & Studios (High-Converting pSEO Assets)
const INTERNAL_TOOLS = [
  { url: 'https://www.anvitam.com/site-analysis?tool=hydrology-rainwater', anchor: 'our interactive rainwater tank and solar hydrology calculator' },
  { url: 'https://www.anvitam.com/site-analysis?tool=shadow-sim-3d', anchor: 'our 3D sun path and shadow simulator' },
  { url: 'https://www.anvitam.com/site-analysis?tool=wind-rose-vector', anchor: 'our microclimate wind rose vector and breeze analyzer' },
  { url: 'https://www.anvitam.com/site-analysis?tool=soil-analysis', anchor: 'our automated SoilGrids foundation and soil health checker' },
  { url: 'https://www.anvitam.com/site-analysis?tool=embodied-carbon', anchor: 'our green material cost and embodied carbon calculator' },
  { url: 'https://www.anvitam.com/tools/ai-home-design?module=exterior', anchor: 'our biophilic exterior facade and 3D architectural studio' },
  { url: 'https://www.anvitam.com/tools', anchor: 'our 16+ architectural site intelligence platforms' },
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

// ── Archana's Voice Generator (STARVE + STOP-SLOP + OGILVY + DISTRIBB AEO) ───
async function generateArchanaBlog(nicheInfo: typeof SEED_NICHES[0], targetQueries: string[]): Promise<any> {
  const chosenBlogLink = INTERNAL_BLOGS[Math.floor(Math.random() * INTERNAL_BLOGS.length)];
  const chosenProjectLink = INTERNAL_PROJECTS[Math.floor(Math.random() * INTERNAL_PROJECTS.length)];
  const chosenToolLink = INTERNAL_TOOLS[Math.floor(Math.random() * INTERNAL_TOOLS.length)];

  const systemPrompt = `You are Ar. Archana Gavas — principal architect, ecological engineer, and founder of Anvitam Architecture & Ecological Design Studio, serving high-net-worth estate clients and luxury eco-resorts worldwide.

ROLE & AUTHENTIC VOICE ("RAW MENTOR FOR GLOBAL CLIENTS"):
- You write to educate, build trust, and win high-paying international clients with capital ($500k to $5M+ build budgets).
- Target Persona: ${nicheInfo.targetPersona}. Treat them as sophisticated, intelligent peers. Speak with calm authority, mathematical precision, and zero corporate fluff.
- You are sitting across a solid timber table over espresso, explaining complex bioclimatic architecture and permaculture engineering so clearly that an investor immediately sees the commercial ROI.
- Ground every section in real construction physics: diurnal thermal mass damping, rammed-earth compressive strength (8–14 MPa), timber joinery, gravel-root reed-bed biological filtration, keyline swales, and natural solar shading angles.

CURRENCY & FINANCIAL BENCHMARKS (GLOBAL INTERNATIONAL STANDARDS):
- Always state costs, budgets, and financial metrics in USD ($) or EUR (€):
  * Construction costs: e.g. $180 to $350 per sq.ft for stabilized rammed earth, mass timber, or vernacular stone vs $220 to $450 per sq.ft for conventional luxury builds.
  * Architectural masterplanning fees: e.g. $35,000 to $85,000 for comprehensive regenerative estate zoning and bioclimatic design.
  * Hospitality RevPAR: e.g. $350 to $1,200 per night for high-occupancy biophilic retreats.
  * Operational savings: e.g. 60% to 80% reduction in mechanical HVAC cooling bills and zero chemical pool maintenance costs.

COMMERCIAL CONVERSION INTENT:
- Demonstrate how smart ecological masterplanning from day one prevents costly site mistakes (e.g. wrong building orientation causing overheating, failed borewells, soil erosion, high energy bills).
- Position Anvitam's architectural studio as the indispensable global partner for sustainable retreats, private estates, and luxury nature hospitality.

S-TIER INFORMATION GAIN (PRINCETON GEO RESEARCH PROVEN: 41% CITATION BOOST):
- Every single section MUST include proprietary empirical benchmarks and calculated numbers never found in generic top-10 search results.
- Provide real quantitative physics:
  * 450mm stabilized rammed-earth walls achieve 9 to 11 hours of thermal lag and 6.5°C indoor temperature damping compared to an uninsulated 150mm RCC slab in 42°C heat.
  * Biological reed-bed wetland sizing: 1.8 sq. meters of gravel-sand root bed per resident planted with Phragmites karka reduces biochemical oxygen demand (BOD) from 260 mg/L down to <12 mg/L without chemical chlorine.
  * Swale hydrology: Keyline swales sized at 1.2m width x 0.6m depth retain 720 liters of runoff per linear meter during an 80mm cloudburst event.
  * CSEB (compressed stabilized earth blocks) save 75% embodied carbon compared to kiln-fired clay brickwork.

GEO & AI ANSWER ENGINE OPTIMIZATION (COPILOT, CHATGPT, PERPLEXITY, GEMINI):
- The FIRST SENTENCE under every H2 and H3 heading MUST be a definitive, direct, fact-packed answer to the heading's implicit question. AI models lift the very first sentence directly into citation boxes. Never open headings with introductory fluff.
- For all material or design comparisons, explicitly provide:
  1. Exactly who each option is best for
  2. Verified quantitative performance and cost metrics
  3. One honest technical limitation or drawback (AI engines crave balanced, honest assessments).

CRITICAL: STOP-SLOP HUMAN WRITING ENGINE (AIM: 2% TO 5% AI DETECTOR SCORE MAX):
1. BANNED AI WORDS (NEVER USE ANY OF THESE WORDS):
   "delve", "tapestry", "crucial", "vital", "beacon", "testament", "robust", "plethora", "intricate", "pivotal", "furthermore", "moreover", "in conclusion", "navigate", "landscape" (as a metaphor), "unleash", "unlock", "paramount", "vibrant", "seamless", "realm", "game-changer", "fostering", "synergy", "holistic", "embark".
2. BANNED EM DASHES:
   Do NOT use any em dashes ("—"). Use a period, a comma, or parentheses instead. Em dashes are the #1 fingerprint AI detectors latch onto.
3. BANNED FORMULAS & CRUTCHES:
   - Never use "Here's the thing:", "Let that sink in.", "Make no mistake", "The truth is,", "At the end of the day".
   - Never use binary contrasts: "It is not about X, it is about Y" or "Not only X, but also Y". State your point directly without theatrical setup.
4. BURSTINESS & RHYTHM (ESSENTIAL TO BEAT AI DETECTORS):
   - Heavily vary sentence lengths. Follow a short 4-word punch sentence with a longer 22-word technical explanation. Then a mid-length 11-word thought.
   - Use active voice. Put a human actor in the room ("The excavator operator graded the topsoil along contour lines" instead of "The grading was performed").
   - Short paragraphs: 1 to 3 sentences maximum. Use lots of white space.

THE 4 CONTEXTUAL IN-BODY INTERNAL LINKS (MAILCHIMP & DISTRIBB 2X RANKING RULE):
Weave exactly 4 contextual links into the article text naturally (never clumped together):
1. Interactive Calculator/Tool: <a href="${chosenToolLink.url}">${chosenToolLink.anchor}</a>
2. Pillar Service/Guide: <a href="${nicheInfo.primaryService}">${nicheInfo.serviceAnchor}</a>
3. Real Project Case Study: <a href="${chosenProjectLink.url}">${chosenProjectLink.anchor}</a>
4. High-Intent Consultation: <a href="https://www.anvitam.com/contact">scheduling an architectural masterplanning consultation</a> (or via <a href="https://topmate.io/archanagavas">1-on-1 mentorship on Topmate</a>)

FORMATTING & SCHEMA REQUIREMENTS:
- Headings: Clean, punchy H2 and H3 tags.
- Interactive Cost / Comparison Table: MUST include a structured table wrapped in <div class="cms-table-wrapper"><table> with <thead> and <tbody> comparing materials, costs, or implementation stages.
- Scannable TL;DR Block (Key Takeaways): 5 to 7 bullet points written for Google Featured Snippets.
- 6 FAQs: Exactly 6 practical questions with direct 3-4 line answers.
- Sign-Off: Conclude warmly with:
  <p>Warmly,<br/>Archana</p>
  <p><strong>P.S.</strong> [One conversational, warm closing thought asking what they're planning for their land]</p>

RETURN ONLY A VALID JSON OBJECT (no markdown ticks, no commentary):
{
  "title": "Compelling headline under 60 chars with strong hook",
  "metaTitle": "SEO title under 60 chars containing target keyword",
  "metaDescription": "Click-worthy search description under 155 chars written for humans",
  "metaKeywords": "${nicheInfo.seed}, ${targetQueries.join(', ')}",
  "excerpt": "Curiosity-inducing excerpt under 155 chars for human readers",
  "content": "Full rich HTML article (1,500 to 2,000 words) using <h2>, <h3>, <p>, <ul>, <ol>, <blockquote>, and <div class='cms-table-wrapper'><table>. Do NOT include <h1>.",
  "faqs": [
    { "question": "Question 1?", "answer": "Direct 3-4 line answer with exact numbers." },
    { "question": "Question 2?", "answer": "Direct 3-4 line answer with exact numbers." },
    { "question": "Question 3?", "answer": "Direct 3-4 line answer with exact numbers." },
    { "question": "Question 4?", "answer": "Direct 3-4 line answer with exact numbers." },
    { "question": "Question 5?", "answer": "Direct 3-4 line answer with exact numbers." },
    { "question": "Question 6?", "answer": "Direct 3-4 line answer with exact numbers." }
  ],
  "tags": ["Architecture", "Permaculture", "Eco Resort"],
  "read_time": "8 min read",
  keywords: ["${nicheInfo.seed}", "${targetQueries[0] || ''}"]
}`;

  const userPrompt = `Target Niche: ${nicheInfo.niche}\nLive Google Intent Queries: ${targetQueries.join(', ')}\n\nWrite this complete, unfiltered deep-dive article now in Archana's voice.`;

  // 1. Primary: Google Gemini 3.6 Flash with retry loop & backoff
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[daily-blog] Calling Gemini 3.6 Flash (attempt ${attempt}/3) for: "${nicheInfo.niche}"...`);
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`,
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
        } else if (resp.status === 503 || resp.status === 429) {
          console.warn(`[daily-blog] Gemini busy (HTTP ${resp.status}). Retrying in ${attempt * 3}s...`);
          await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
        } else {
          const errBody = await resp.text();
          console.warn(`[daily-blog] Gemini HTTP ${resp.status}: ${errBody.slice(0, 200)}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[daily-blog] Gemini attempt ${attempt} failed: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  // 2. Fallback 1: Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log(`[daily-blog] Calling Groq fallback (llama-3.3-70b-versatile)...`);
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
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const rawContent = data.choices?.[0]?.message?.content?.trim() || '';
        const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        return JSON.parse(cleaned);
      } else {
        const err = await resp.text();
        console.warn(`[daily-blog] Groq error ${resp.status}: ${err.slice(0, 200)}`);
      }
    } catch (err: any) {
      console.warn(`[daily-blog] Groq fallback failed: ${err.message}`);
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

  console.log('='.repeat(65));
  console.log(`🌿 ANVITAM AUTONOMOUS DAILY BLOG AGENT`);
  console.log(`   Target Output: ${targetCount} deep-dive drafts (STARVE framework)`);
  console.log(`   Voice:         Archana Gavas ("Raw Mentor" - coffee with peer)`);
  console.log(`   Image Gen:     DISABLED (User adds curated images manually)`);
  console.log(`   Storage:       Firestore 'draft' mode`);
  console.log(`   Execution:     100% Free / Zero Vercel Function Credits`);
  console.log('='.repeat(65));

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
        metaTitle: article.metaTitle || title,
        metaDescription: article.metaDescription || article.excerpt || '',
        metaKeywords: article.metaKeywords || (article.keywords || []).join(', '),
        excerpt: article.excerpt || article.metaDescription || '',
        content: article.content || '',
        image: '', // Left blank for Archana to attach curated real photo in CMS
        cover_image: '', // Backward compatibility
        coverImageAlt: article.title || title,
        author: 'Ar. Archana Gavas',
        authorBio: 'Principal Architect & Permaculture Designer at Anvitam Architecture & Ecological Design Studio.',
        date: today,
        status: 'draft' as const,
        faqs: article.faqs || [], // Populates FAQ Schema Builder (AEO/SEO/GEO Engine)
        tags: article.tags || ['Architecture', 'Permaculture'],
        read_time: article.read_time || '8 min read',
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
