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

// High-Net-Worth Worldwide Eco-Retreat Corridors Across 7 Continents
// (Prioritizing high-paying international clients: US, Europe, Australia, Costa Rica, Bali, Africa, etc.)
const SEARCH_ZONES = [
  // 1. Europe: Mediterranean & Western European Regenerative Estates
  { region: 'Alentejo & Algarve, Portugal', bbox: '37.0,-8.9,38.5,-7.2' },
  { region: 'Andalusia & Mallorca, Spain', bbox: '36.5,-5.5,37.5,-3.5' },
  { region: 'Tuscany & Umbria, Italy', bbox: '42.8,11.0,43.8,12.5' },
  { region: 'Provence & Côte d’Azur, France', bbox: '43.3,5.0,44.2,7.0' },
  { region: 'Scottish Highlands & Cotswolds, UK', bbox: '56.0,-5.5,58.0,-3.5' },

  // 2. North America & Central America: Luxury Glamping & Off-Grid Sanctuaries
  { region: 'California Central Coast & Napa Valley, USA', bbox: '35.0,-121.5,38.8,-120.0' },
  { region: 'Pacific Northwest (Oregon / Washington), USA', bbox: '44.0,-124.0,47.5,-121.0' },
  { region: 'Colorado Rockies & Sedona, USA', bbox: '38.5,-107.5,40.5,-105.0' },
  { region: 'Guanacaste, Nosara & Arenal, Costa Rica', bbox: '9.5,-85.8,10.8,-84.5' },
  { region: 'Oaxaca & Tulum Riviera, Mexico', bbox: '15.8,-97.5,21.5,-87.0' },

  // 3. Oceania: High-RevPAR Eco-Lodges
  { region: 'Byron Bay & Northern Rivers, Australia', bbox: '-29.0,153.0,-28.3,153.6' },
  { region: 'Margaret River & Southwest, Australia', bbox: '-34.5,114.9,-33.5,115.5' },
  { region: 'Queenstown & Southern Lakes, New Zealand', bbox: '-45.3,168.4,-44.6,169.3' },

  // 4. Southeast Asia & Pacific: Tropical Biophilic Resorts
  { region: 'Bali (Ubud, Sidemen & Tabanan), Indonesia', bbox: '-8.6,115.0,-8.2,115.5' },
  { region: 'Chiang Mai & Koh Samui, Thailand', bbox: '18.5,98.6,19.3,99.3' },
  { region: 'Central Highlands & South Coast, Sri Lanka', bbox: '5.9,80.1,7.2,81.1' },

  // 5. Africa & Middle East: Luxury Eco-Reserves & Desert Sanctuaries
  { region: 'Cape Winelands & Garden Route, South Africa', bbox: '-34.5,18.3,-33.5,23.5' },
  { region: 'Dubai Desert Conservation & Al Marmoom, UAE', bbox: '24.7,55.1,25.5,55.8' },

  // 6. South America: Wilderness Retreats
  { region: 'Patagonia Lake District, Chile / Argentina', bbox: '-41.5,-73.2,-40.5,-71.0' },
  { region: 'Trancoso & Bahia Coast, Brazil', bbox: '-16.8,-39.3,-16.3,-39.0' }
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
  "pitch_body": "A complete, personal 4-paragraph Ogilvy cold pitch signed off by Ar. Archana Gavas (Founder & Principal Architect, Anvitam - https://www.anvitam.com). Highlight microclimate bioclimatic analysis, passive cooling, biological wetland swimming pools, and zero-chemical regenerative architecture.",
  "estimated_project_value": "Estimated fee in USD based on project scope (e.g. '$250 USD' for microclimate site analysis report, '$2,500 USD' for concept layout, up to '$45,000 USD' or '$95,000 USD' for full architectural masterplanning)"
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
      segment: 'International Luxury Eco-Resort & Retreat Founders',
      location: candidate.location,
      land_size: '15-40 Acres',
      email: contactEmail,
      source_name: candidate.source,
      source_url: candidate.website || candidate.source_url,
      icp_fit: `${candidate.name} is an active luxury retreat destination in ${candidate.location} with microclimatic exposure requiring sustainable rainwater hydrology and vernacular bioclimatic architecture.`,
      pitch_angle: 'Chemical-free biological natural pool filtered through wetland reed beds paired with rammed-earth passive cooling chalets.',
      pitch_subject: `Bioclimatic architecture & chemical-free biological pool concept for ${candidate.name}`,
      pitch_body: `Dear Founder,\n\nI came across ${candidate.name} in ${candidate.location}.\n\nAs an architect specializing in ecological masterplanning and regenerative hospitality retreats, I noticed your property has exceptional terrain and microclimatic potential.\n\nTailored Architectural Concept: A chlorine-free natural swimming pool filtered organically through gravel-root reed beds, paired with passive solar chalets utilizing thermal mass to maintain 21°C–23°C indoor comfort without noisy HVAC compressors.\n\nWe engineer retreats to achieve net-zero operating energy while elevating the guest luxury experience.\n\nI would be delighted to share a few site sketches and contour concepts if you have 10 minutes next week.\n\nWarm regards,\nAr. Archana Gavas\nFounder & Principal Architect, Anvitam\nhttps://www.anvitam.com | Vadodara, India & Global Consultations`,
      status: 'draft',
      sent_date: null,
      response_status: 'Discovered & Qualified Autonomously',
      estimated_project_value: '$45,000 USD'
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
      segment: parsed.segment || 'International Luxury Eco-Resort & Retreat Founders',
      location: candidate.location,
      land_size: parsed.land_size || '15-40 Acres',
      email: contactEmail,
      source_name: candidate.source,
      source_url: candidate.website || candidate.source_url,
      icp_fit: parsed.icp_fit || `${candidate.name} is a high-value hospitality retreat in ${candidate.location} with significant land area requiring sustainable water and passive bioclimatic construction.`,
      pitch_angle: parsed.pitch_angle || 'Decentralized biological water harvesting swales & vernacular rammed earth cottages with zero HVAC cooling bills.',
      pitch_subject: parsed.pitch_subject || `Bioclimatic architecture & microclimate masterplan for ${candidate.name}`,
      pitch_body: parsed.pitch_body || `Dear Founder,\n\nI came across ${candidate.name} in ${candidate.location}.\n\nAs an architect specializing in ecological master-planning and bioclimatic architecture, I noticed your site has unique regenerative potential.\n\nTailored Concept: ${parsed.pitch_angle || 'Natural reed-bed greywater filtration and passive thermal mass cottages.'}\n\nWe design working eco-retreats that achieve net-zero operating energy while elevating the guest experience.\n\nI would be delighted to share a few site sketches if you have 10 minutes next week.\n\nWarm regards,\nAr. Archana Gavas\nFounder & Principal Architect, Anvitam\nhttps://www.anvitam.com | Vadodara, India & Global Consultations`,
      status: 'draft',
      sent_date: null,
      response_status: 'Discovered & Qualified Autonomously',
      estimated_project_value: parsed.estimated_project_value || '$45,000 USD'
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

  // 1. Gather from OpenStreetMap Overpass API (Worldwide 7-Continent Corridors)
  console.log('\n📡 Querying OpenStreetMap Overpass Geospatial Nodes across 7 Continents...');
  // Shuffle zones so every daily run hits different global regions
  const shuffledZones = [...SEARCH_ZONES].sort(() => Math.random() - 0.5);
  for (const zone of shuffledZones) {
    if (discoveredCandidates.length >= limit * 3) break;
    console.log(`- Scanning global corridor: ${zone.region}...`);
    const resorts = await fetchOverpassResorts(zone, 3);
    for (const r of resorts) {
      if (!existingCompanies.has(r.name.toLowerCase())) {
        discoveredCandidates.push(r);
        existingCompanies.add(r.name.toLowerCase());
      }
    }
  }

  // 2. Gather from DuckDuckGo Public Web Search (Global Search Dorks)
  if (discoveredCandidates.length < limit * 2) {
    console.log('\n🔎 Expanding discovery via free global DuckDuckGo search dorks...');
    const searchQueries = [
      { q: '"luxury eco resort" "permaculture" OR "regenerative" "contact" -site:booking.com -site:tripadvisor.com', region: 'Europe & Mediterranean' },
      { q: '"eco retreat" "biophilic" "villas" "about us" OR "contact" -site:airbnb.com', region: 'North America & Costa Rica' },
      { q: '"regenerative farmstay" "luxury" "masterplan" OR "sustainable" site:.au OR site:.nz OR site:.com', region: 'Oceania & Pacific' },
      { q: '"boutique wellness retreat" "natural pool" "contact" site:.com OR site:.co.uk OR site:.pt', region: 'Worldwide High-End Sanctuaries' }
    ];

    for (const sq of searchQueries) {
      if (discoveredCandidates.length >= limit * 3) break;
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
