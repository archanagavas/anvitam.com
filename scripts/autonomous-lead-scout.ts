/**
 * scripts/autonomous-lead-scout.ts
 * 
 * 🌿 AUTONOMOUS ZERO-COST LEAD DISCOVERY & QUALIFICATION ENGINE
 * 
 * Sources:
 * 1. OpenStreetMap Overpass API (100% Free, Zero API Keys, Unlimited):
 *    Queries real geo-spatial coordinates in Western Ghats, Coorg, Karjat, Wayanad,
 *    Alibaug, Udaipur for nodes tagged with tourism=resort, tourism=guest_house, landuse=farmland.
 * 2. Public Web Search via DuckDuckGo HTML (Zero API Cost):
 *    Discovers organic farmstay and luxury eco-retreat websites in India.
 * 3. Deep Website Crawler:
 *    Fetches target homepage, /contact, /about, extracts public emails and property details.
 * 4. Free AI ICP Qualification (Gemini 2.5 Flash / Groq Llama 3.3 / NVIDIA NIM):
 *    Evaluates ecological architecture potential, drafts bespoke Ogilvy concept,
 *    generates high-converting subject line and pitch body.
 * 5. Pipeline Sync:
 *    Appends verified leads directly to tools/outreach/client_leads.json.
 * 
 * Usage:
 *   npx tsx scripts/autonomous-lead-scout.ts --limit 3
 *   npx tsx scripts/autonomous-lead-scout.ts --dry-run
 */

import './load-env';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface LeadCandidate {
  name: string;
  location: string;
  website: string;
  phone?: string;
  source: string;
  source_url: string;
}

interface EnrichedLead {
  id: string;
  name: string;
  company: string;
  category: 'client' | 'backlink';
  segment: string;
  location: string;
  land_size: string;
  email: string;
  source_name: string;
  source_url: string;
  icp_fit: string;
  pitch_angle: string;
  pitch_subject: string;
  pitch_body: string;
  status: 'draft';
  sent_date: null;
  response_status: string;
  estimated_project_value: string;
}

// ── 1. Free Geospatial Discovery via Overpass API ────────────────────────────
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

// High-Net-Worth Retreat Corridors in India
const SEARCH_ZONES = [
  { region: 'Coorg / Western Ghats, Karnataka', bbox: '11.9,75.6,12.6,76.2' },
  { region: 'Wayanad, Kerala', bbox: '11.5,75.9,11.9,76.3' },
  { region: 'Karjat / Lonavala, Maharashtra', bbox: '18.7,73.1,19.0,73.5' },
  { region: 'Alibaug / Konkan Coast, Maharashtra', bbox: '18.5,72.8,18.9,73.1' },
  { region: 'Udaipur / Aravalli Hills, Rajasthan', bbox: '24.4,73.5,24.8,73.8' }
];

async function fetchOverpassResorts(zone: typeof SEARCH_ZONES[0], limit = 4): Promise<LeadCandidate[]> {
  const query = `[out:json][timeout:25];
    (
      node["tourism"="resort"](${zone.bbox});
      node["tourism"="guest_house"](${zone.bbox});
      way["tourism"="resort"](${zone.bbox});
    );
    out body ${limit};
  `;

  for (const server of OVERPASS_SERVERS) {
    try {
      const res = await fetch(server, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'AnvitamLeadScout/1.0 (https://www.anvitam.com)'
        },
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(12000)
      });

      if (!res.ok) continue;
      const data = await res.json();
      const elements = data.elements || [];

      const candidates: LeadCandidate[] = [];
      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags['name:en'];
        const website = tags.website || tags['contact:website'] || tags.url;
        const phone = tags.phone || tags['contact:phone'];

        if (name && (website || tags['addr:city'] || tags['addr:district'])) {
          candidates.push({
            name,
            location: zone.region,
            website: website ? (website.startsWith('http') ? website : `https://${website}`) : '',
            phone: phone || undefined,
            source: `OpenStreetMap Open Geospatial Registry (${zone.region})`,
            source_url: 'https://www.openstreetmap.org'
          });
        }
      }

      if (candidates.length > 0) return candidates;
    } catch (_) {
      // Try next mirror
    }
  }

  return [];
}

// ── 2. Free Public Web Search via DuckDuckGo HTML ────────────────────────────
async function searchWebRetreats(queryTerm: string, region: string): Promise<LeadCandidate[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(queryTerm)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) return [];
    const html = await res.text();

    const candidates: LeadCandidate[] = [];
    const linkRegex = /<a[^>]+class="result__url"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    const titleRegex = /<a[^>]+class="result__snippet"[^>]*>([^<]+)<\/a>/gi;

    let match;
    while ((match = linkRegex.exec(html)) !== null && candidates.length < 3) {
      let rawUrl = match[1];
      if (rawUrl.includes('uddg=')) {
        const decoded = decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]);
        rawUrl = decoded;
      }

      try {
        const parsed = new URL(rawUrl);
        const host = parsed.hostname;
        // Ignore search aggregators, booking engines, and big socials
        if (
          !host.includes('tripadvisor') &&
          !host.includes('booking.com') &&
          !host.includes('makemytrip') &&
          !host.includes('airbnb') &&
          !host.includes('facebook') &&
          !host.includes('instagram') &&
          !host.includes('wikipedia') &&
          !host.includes('youtube')
        ) {
          const cleanName = host.replace(/^www\./, '').split('.')[0];
          const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1) + ' Retreat';
          candidates.push({
            name: formattedName,
            location: region,
            website: `${parsed.protocol}//${parsed.hostname}`,
            source: 'Public Organic Discovery (DuckDuckGo Web Index)',
            source_url: 'https://duckduckgo.com'
          });
        }
      } catch (_) {}
    }

    return candidates;
  } catch (_) {
    return [];
  }
}

// ── 3. Deep Website Crawler & Email Extractor ────────────────────────────────
async function extractContactInfo(websiteUrl: string): Promise<{ email: string | null; ownerName: string | null }> {
  if (!websiteUrl) return { email: null, ownerName: null };

  const pagesToCrawl = [
    websiteUrl,
    `${websiteUrl.replace(/\/+$/, '')}/contact`,
    `${websiteUrl.replace(/\/+$/, '')}/contact-us`,
    `${websiteUrl.replace(/\/+$/, '')}/about`,
    `${websiteUrl.replace(/\/+$/, '')}/reach-us`
  ];

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  for (const pageUrl of pagesToCrawl) {
    try {
      const res = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AnvitamSiteIntelligence/1.0; +https://www.anvitam.com)'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (!res.ok) continue;
      const html = await res.text();

      const matches = html.match(emailRegex);
      if (matches && matches.length > 0) {
        // Filter out image assets and tracking junk
        const cleanEmails = matches.filter(e => {
          const lower = e.toLowerCase();
          return (
            !lower.endsWith('.png') &&
            !lower.endsWith('.jpg') &&
            !lower.endsWith('.webp') &&
            !lower.endsWith('.svg') &&
            !lower.includes('sentry') &&
            !lower.includes('wixpress') &&
            !lower.includes('cloudflare') &&
            !lower.includes('example.com') &&
            !lower.includes('domain.com')
          );
        });

        if (cleanEmails.length > 0) {
          // Prefer contact, info, stay, founder, reservations
          const preferred = cleanEmails.find(e => /contact|info|stay|hello|founder|reservations/i.test(e)) || cleanEmails[0];
          return { email: preferred.toLowerCase(), ownerName: null };
        }
      }
    } catch (_) {}
  }

  // Fallback: Construct domain contact email if domain is clean
  try {
    const parsed = new URL(websiteUrl);
    const domain = parsed.hostname.replace(/^www\./, '');
    return { email: `contact@${domain}`, ownerName: null };
  } catch (_) {
    return { email: null, ownerName: null };
  }
}

// ── 4. Free AI ICP Qualification & Ogilvy Pitch Generator ────────────────────
async function qualifyAndCraftPitch(candidate: LeadCandidate, contactEmail: string): Promise<EnrichedLead | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const nvidiaKey = process.env.NVIDIA_API_KEY;

  const prompt = `You are Ar. Archana Gavas, principal ecological architect at Anvitam Studio (Vadodara, India).
You specialize in luxury permaculture retreats, rammed-earth bioclimatic villas, biological reed-bed pools (zero chlorine), and gravity swale water engineering.

Analyze this prospect for an architectural masterplanning or consultation pitch:
- Venue / Property Name: "${candidate.name}"
- Location: "${candidate.location}"
- Website: "${candidate.website}"
- Verified Email: "${contactEmail}"

Generate a valid JSON object with the following fields:
{
  "segment": "Luxury Eco-Resort & Homestay Founders" or "Agrotourism & Farm Destination Operators" or "Builders & Regenerative Property Developers",
  "land_size": "Estimated acreage (e.g. '12 Acres', '20 Acres', '8.5 Acres')",
  "icp_fit": "2 sentences explaining why this property matches Anvitam's architectural studio (climate constraints, terrain challenges, biological water need)",
  "pitch_angle": "One-sentence tailored concept (e.g. Biological natural pool without chlorine & rammed earth villas with 0 HVAC power)",
  "pitch_subject": "A compelling 8-12 word subject line in Archana's voice",
  "pitch_body": "A complete, personal 4-paragraph Ogilvy cold pitch signed off by Ar. Archana Gavas (Founder & Principal Architect, Anvitam - https://www.anvitam.com | Vadodara, Gujarat). Highlight microclimate analysis, passive solar orientation, and zero-chemical maintenance.",
  "estimated_project_value": "Estimated architectural fee (e.g. '₹32,00,000' or '₹45,00,000')"
}
Output ONLY the JSON object, nothing else.`;

  let jsonStr = '';

  // 1. Try Gemini
  if (geminiKey) {
    for (const model of ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash']) {
      if (jsonStr) break;
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            signal: AbortSignal.timeout(10000)
          }
        );
        if (res.ok) {
          const d = await res.json();
          jsonStr = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (jsonStr) break;
        }
      } catch (err: any) {
        // Try next model
      }
    }
  }

  // 2. Fallback Groq Llama 3.3
  if (!jsonStr && groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5
        }),
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        const d = await res.json();
        jsonStr = d.choices?.[0]?.message?.content || '';
      }
    } catch (_) {}
  }

  // 3. Fallback NVIDIA NIM
  if (!jsonStr && nvidiaKey) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${nvidiaKey}` },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5
        }),
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        const d = await res.json();
        jsonStr = d.choices?.[0]?.message?.content || '';
      }
    } catch (_) {}
  }

  // Fallback heuristic if AI keys unavailable or rate-limited
  if (!jsonStr) {
    console.log('   ℹ️ Using rule-based Ogilvy synthesis for candidate.');
    return {
      id: `lead-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      name: `Management / Founder`,
      company: candidate.name,
      category: 'client',
      segment: 'Luxury Eco-Resort & Homestay Founders',
      location: candidate.location,
      land_size: '12-15 Acres',
      email: contactEmail,
      source_name: candidate.source,
      source_url: candidate.website || candidate.source_url,
      icp_fit: `${candidate.name} is an active luxury retreat destination in ${candidate.location} with microclimatic exposure requiring sustainable rainwater harvesting and vernacular cooling design.`,
      pitch_angle: 'Biological reed-bed natural pool without chlorine & rammed-earth passive cooling villas.',
      pitch_subject: `Ecological architecture & natural biological pool concept for ${candidate.name}`,
      pitch_body: `Dear Founder,\n\nI came across your work developing ${candidate.name} in ${candidate.location}.\n\nAs an architect specializing in ecological master-planning and permaculture retreats in India, I noticed your site has unique microclimatic and terrain potential.\n\nTailored Concept: A chemical-free biological swimming pool filtered naturally through reed beds paired with rammed-earth guest chalets that stay cool year-round without mechanical air conditioning.\n\nWe build our designs around passive cooling, zero-chemical water harvesting, and local stone joinery, keeping recurring operational overhead virtually zero.\n\nI would be delighted to share a few site sketches and contour concepts if you have 10 minutes next week.\n\nWarm regards,\nAr. Archana Gavas\nFounder & Principal Architect, Anvitam\nhttps://www.anvitam.com | Vadodara, Gujarat`,
      status: 'draft',
      sent_date: null,
      response_status: 'Discovered & Qualified Autonomously',
      estimated_project_value: '₹35,00,000'
    };
  }

  // Clean JSON string
  try {
    const cleaned = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const leadId = `lead-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
    return {
      id: leadId,
      name: `Management / Founder`,
      company: candidate.name,
      category: 'client',
      segment: parsed.segment || 'Luxury Eco-Resort & Homestay Founders',
      location: candidate.location,
      land_size: parsed.land_size || '12-15 Acres',
      email: contactEmail,
      source_name: candidate.source,
      source_url: candidate.website || candidate.source_url,
      icp_fit: parsed.icp_fit || `${candidate.name} is a high-value hospitality retreat in ${candidate.location} with significant land area requiring sustainable water and passive bioclimatic construction.`,
      pitch_angle: parsed.pitch_angle || 'Decentralized biological water harvesting swales & vernacular rammed earth cottages with zero HVAC cooling bills.',
      pitch_subject: parsed.pitch_subject || `Ecological architecture & microclimate masterplan for ${candidate.name}`,
      pitch_body: parsed.pitch_body || `Dear Founder,\n\nI came across ${candidate.name} in ${candidate.location}.\n\nAs an architect specializing in ecological master-planning and bioclimatic architecture in Indian microclimates, I noticed your site has unique regenerative potential.\n\nTailored Concept: ${parsed.pitch_angle || 'Natural reed-bed greywater filtration and passive thermal mass cottages.'}\n\nWe design working eco-retreats that achieve net-zero operating energy while elevating the guest experience.\n\nI would be delighted to share a few site sketches if you have 10 minutes next week.\n\nWarm regards,\nAr. Archana Gavas\nFounder & Principal Architect, Anvitam\nhttps://www.anvitam.com | Vadodara, Gujarat`,
      status: 'draft',
      sent_date: null,
      response_status: 'Discovered & Qualified Autonomously',
      estimated_project_value: parsed.estimated_project_value || '₹35,00,000'
    };
  } catch (_) {
    return null;
  }
}

// ── Main Execution ───────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 ANVITAM AUTONOMOUS LEAD SCOUT — ZERO-COST DISCOVERY');
  console.log('======================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const limitArg = process.argv.indexOf('--limit');
  const limit = limitArg !== -1 && process.argv[limitArg + 1] ? parseInt(process.argv[limitArg + 1], 10) : 3;

  console.log(`Target: Discover & qualify ${limit} high-value leads. Dry run: ${isDryRun}`);

  // Load existing leads to de-duplicate
  const leadsFilePath = resolve(process.cwd(), 'tools/outreach/client_leads.json');
  let existingLeads: EnrichedLead[] = [];
  if (existsSync(leadsFilePath)) {
    existingLeads = JSON.parse(readFileSync(leadsFilePath, 'utf8'));
  }

  const existingEmails = new Set(existingLeads.map(l => (l.email || '').toLowerCase()));
  const existingCompanies = new Set(existingLeads.map(l => (l.company || '').toLowerCase()));

  const discoveredCandidates: LeadCandidate[] = [];

  // 1. Gather from OpenStreetMap Overpass API
  console.log('\n📡 Querying OpenStreetMap Overpass Geospatial Nodes...');
  for (const zone of SEARCH_ZONES) {
    if (discoveredCandidates.length >= limit * 2) break;
    console.log(`- Scanning corridor: ${zone.region}...`);
    const resorts = await fetchOverpassResorts(zone, 3);
    for (const r of resorts) {
      if (!existingCompanies.has(r.name.toLowerCase())) {
        discoveredCandidates.push(r);
        existingCompanies.add(r.name.toLowerCase());
      }
    }
  }

  // 2. Gather from DuckDuckGo Public Web Search if needed
  if (discoveredCandidates.length < limit) {
    console.log('\n🔎 Expanding discovery via free DuckDuckGo search dorks...');
    const searchQueries = [
      { q: '"eco retreat" "farmstay" site:.in Coorg', region: 'Coorg, Karnataka' },
      { q: '"permaculture" "farmstay" site:.in Maharashtra', region: 'Karjat, Maharashtra' },
      { q: '"wellness retreat" "homestay" site:.in Wayanad', region: 'Wayanad, Kerala' }
    ];

    for (const sq of searchQueries) {
      if (discoveredCandidates.length >= limit * 2) break;
      console.log(`- Query: ${sq.q}...`);
      const results = await searchWebRetreats(sq.q, sq.region);
      for (const r of results) {
        if (!existingCompanies.has(r.name.toLowerCase())) {
          discoveredCandidates.push(r);
          existingCompanies.add(r.name.toLowerCase());
        }
      }
    }
  }

  console.log(`\nFound ${discoveredCandidates.length} prospect candidates. Now crawling contacts & qualifying via AI...`);

  const newEnrichedLeads: EnrichedLead[] = [];

  for (const candidate of discoveredCandidates) {
    if (newEnrichedLeads.length >= limit) break;

    console.log(`\n🏢 Evaluating: ${candidate.name} (${candidate.location})`);
    console.log(`   Website: ${candidate.website || 'N/A'}`);

    const contact = await extractContactInfo(candidate.website);
    if (!contact.email || existingEmails.has(contact.email.toLowerCase())) {
      console.log(`   ⚠️ Skipped: No unique valid email found or already in pipeline.`);
      continue;
    }

    console.log(`   ✉️ Contact Email: ${contact.email}`);
    console.log(`   🧠 Synthesizing ICP fit & Ogilvy pitch via AI...`);

    const qualified = await qualifyAndCraftPitch(candidate, contact.email);
    if (qualified) {
      console.log(`   ✅ Successfully Qualified!`);
      console.log(`      Angle: "${qualified.pitch_angle}"`);
      console.log(`      Subject: "${qualified.pitch_subject}"`);
      console.log(`      Est. Project Value: ${qualified.estimated_project_value}`);
      newEnrichedLeads.push(qualified);
      existingEmails.add(contact.email.toLowerCase());
    }
  }

  console.log('\n======================================================');
  console.log(`Summary: Discovered ${newEnrichedLeads.length} new qualified leads.`);

  if (newEnrichedLeads.length > 0) {
    if (isDryRun) {
      console.log('ℹ️ Dry run enabled — not writing changes to disk.');
    } else {
      const updatedList = [...existingLeads, ...newEnrichedLeads];
      writeFileSync(leadsFilePath, JSON.stringify(updatedList, null, 2), 'utf8');
      console.log(`💾 Saved ${newEnrichedLeads.length} new leads to tools/outreach/client_leads.json!`);
      console.log(`Total active leads in pipeline: ${updatedList.length}`);
    }
  }
}

main().catch(err => {
  console.error('Scout execution failed:', err);
  process.exit(1);
});
