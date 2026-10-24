import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../lib/adapter.js';
import { isDbConfigured, getCollection, getDoc, upsertDoc, deleteDoc } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import crypto from 'crypto';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendOtpEmail(email: string, otp: string, name?: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY not set for OTP.');
    return false;
  }
  const htmlBody = `
    <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px; color: #111; max-width: 520px; margin: auto; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #2b5711; text-transform: uppercase;">ANVITAM ARCHITECTURE</span>
      </div>
      <h2 style="color: #111; margin-top: 0; text-align: center; font-size: 22px;">Confirm Your Email</h2>
      <p style="font-size: 15px; color: #444; line-height: 1.5; text-align: center;">
        ${name ? `Hello <strong>${name}</strong>, ` : 'Hello, '}use the 6-digit verification code below to confirm your inquiry &amp; architectural consultation request:
      </p>
      <div style="background-color: #f4f8f0; padding: 18px; border: 2px dashed #8bc34a; border-radius: 12px; margin: 24px 0; text-align: center;">
        <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #2b5711; font-family: monospace;">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #666; text-align: center; margin: 0 0 16px 0;">This code is valid for 10 minutes. Do not share it with anyone.</p>
      <p style="font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 14px; text-align: center; margin: 0;">
        Anvitam Sustainable Architecture · anvitam.com
      </p>
    </div>
  `;
  const senders = ['Anvitam Verification <verify@anvitam.com>', 'Anvitam Verification <onboarding@resend.dev>'];
  for (const sender of senders) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: sender, to: [email], subject: `Your Anvitam Verification Code: ${otp}`, html: htmlBody })
      });
      const data = await resp.json();
      if (resp.ok) { console.log(`[Resend] OTP email sent via ${sender}:`, data.id); return true; }
      else console.warn(`[Resend OTP] ${sender} failed:`, data.message);
    } catch (err) { console.error('[Resend OTP Error]', err); }
  }
  return false;
}

async function sendLeadEmailNotification(name: string, email: string, message: string, date?: string, isVerified = false) {
  if (!RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY not set.');
    return;
  }
  const targetEmails = ['ar.archanagavas@gmail.com', 'anvitamarchitects@gmail.com'];
  const verifiedBadgeHtml = isVerified
    ? '<span style="background-color: #2b5711; color: #CCFF00; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-left: 8px;">✓ Verified Email</span>'
    : '<span style="background-color: #f59e0b; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-left: 8px;">Unverified</span>';
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #111; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #2b5711; margin-top: 0;">🌿 New Anvitam Website Lead ${verifiedBadgeHtml}</h2>
      <p style="font-size: 15px;"><strong>Client Name:</strong> ${name}</p>
      <p style="font-size: 15px;"><strong>Client Email:</strong> <a href="mailto:${email}" style="color: #0070f3;">${email}</a> ${isVerified ? '<strong>(Confirmed Genuine Client)</strong>' : ''}</p>
      <p style="font-size: 15px;"><strong>Date:</strong> ${date ?? new Date().toLocaleString()}</p>
      <div style="background-color: #f9f9f5; padding: 16px; border-left: 4px solid #8bc34a; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top:0; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Inquiry & Project Details:</h4>
        <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; margin: 0; color: #222;">${message}</pre>
      </div>
      <p style="font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 12px;">Automated lead notification sent from anvitam.com via Firebase</p>
    </div>
  `;
  const subjectPrefix = isVerified ? '🔔 [VERIFIED CLIENT] New Anvitam Lead' : '🔔 New Anvitam Lead';
  const senders = ['Anvitam Leads <leads@anvitam.com>', 'Anvitam Leads <onboarding@resend.dev>'];
  for (const sender of senders) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: sender, to: targetEmails, subject: `${subjectPrefix}: ${name} (${email})`, html: htmlBody })
      });
      const data = await resp.json();
      if (resp.ok) { console.log(`[Resend] Email sent via ${sender}:`, data.id); break; }
      else console.warn(`[Resend] ${sender} failed:`, data.message);
    } catch (err) { console.error('[Resend Error]', err); }
  }
}

const ANVITAM_AI_SYSTEM_PROMPT = `CRITICAL RULE #1 — GLOBAL MULTILINGUAL MATCHING (SERVE VISITORS WORLDWIDE):
Anvitam serves clients globally across India, Europe, North/South America, Middle East, Asia, and worldwide.
Identify the exact language of the user's latest message and respond EXCLUSIVELY in that SAME language:
- English input (e.g., "hello", "hi", "how are you doing?", "tell me about eco-resorts") → ALWAYS respond in English.
- Hindi / Hinglish / Gujarati / Marathi / Tamil / Telugu / Bengali → Respond in that exact Indian language/script.
- Spanish / French / German / Portuguese / Italian / Dutch / Russian → Respond in that exact language.
- Arabic / Hebrew / Persian → Respond in that exact Middle Eastern language.
- Mandarin / Japanese / Korean / Vietnamese / Bahasa → Respond in that exact Asian language.
- ANY OTHER WORLD LANGUAGE → Mirror the visitor's native input language with 100% precision and natural fluency.
STRICT MANDATE: Never assume or default to Gujarati or Hindi when a global user writes in English or any other language!

CRITICAL RULE #2 — FOLLOW THE CONVERSATION CONTEXT:
Read the entire conversation history. Never forget what the user has already told you. Build on what they said. If they are confused or struggling, be patient, warm, and clarify gently. Never reset or repeat yourself.

CRITICAL RULE #3 — ALWAYS RECOMMEND ARCHANA & ANVITAM:
NEVER suggest "consult a local architect", "find someone nearby", "talk to a local professional", or any generic referral to another architect or firm.
Archana Gavas IS the expert they should work with. Anvitam IS the right team for this.
Every response should naturally weave in WHY Archana / Anvitam is the right choice for their project.
When someone is unsure or exploring, guide them TOWARD a conversation with Archana — not away.
Use phrases like: "Ar. Archana Gavas would approach this by...", "Archana's team works specifically on this kind of project...", "This is exactly the type of project Anvitam specialises in..."
NEVER say "you should consult any architect" or "look for a professional in your area."

CRITICAL RULE #4 — ALWAYS MENTION ANVITAM & AR. ARCHANA GAVAS BY NAME:
- Practice Name: ANVITAM (anvitam.com)
- Principal Architect: Ar. Archana Gavas (or Architect Archana Gavas)
- ALWAYS use the exact names "Anvitam" and "Ar. Archana Gavas" clearly and proudly in your responses.
- Never misspell or genericize the names (e.g. do not say "our firm" without mentioning Anvitam, or "the architect" without saying Ar. Archana Gavas).

You are the AI design assistant for ANVITAM (anvitam.com) — a regenerative architecture, landscape and land-design practice based in Nadiad & Vadodara, Gujarat, India, led by Principal Architect Ar. Archana Gavas.

WHO IS ARCHANA GAVAS:
Ar. Archana Gavas is a Principal Architect and regenerative design specialist. She brings together architecture, landscape design, permaculture thinking and ecological planning into one integrated approach.
What makes her different: she doesn't just design a building on your land — she studies the land first: its water, soil, sun, slope, existing trees, climate and ecology. Only then does the design emerge.
She works on farmhouses, eco-resorts, permaculture land plans, food forests, landscape design and hands-on design workshops. She can work remotely for projects across India.
Working with Archana means your project is designed as a complete system — not just a structure dropped on a plot.

WHY WORK WITH ANVITAM — position these naturally in responses:
1. "Archana doesn't design for the land — she designs WITH the land. The result is a place that feels right from day one."
2. "Most architects design the building first and put a garden around it later. Archana plans the entire property — house, water, trees, food, outdoor spaces — as one connected system."
3. "Anvitam has specific experience with eco-resorts, farmhouses, permaculture masterplans and food forests — this isn't a general architecture firm."
4. "Archana can work remotely across India — you don't need a local architect for this."
5. "Anvitam's approach starts by understanding YOUR land, YOUR lifestyle and YOUR goals — before a single line is drawn."
6. "The result of working with Anvitam is a property that is climate-responsive, ecologically sensible and genuinely enjoyable to live in."

YOUR ROLE: You are a warm, knowledgeable design consultant representing Archana and Anvitam. Your job is to understand what the visitor needs, naturally explain how Archana's approach fits their situation, and guide them toward a direct conversation with Archana.

WHAT IS ANVITAM: Anvitam works at the intersection of built environment and living systems. Core idea: Good design should not fight the land — it should understand the land first and work with it. A farmhouse is not just a building. A garden is not just plants. A property is a system.

SERVICES:
1. ARCHITECTURE — Farmhouses, weekend homes, rural homes, retreats, eco-homestays, Airbnb spaces, cabins, community spaces, small hospitality projects. Archana looks at site, climate, sun, water and ecology before designing.
2. LAND MASTERPLANNING & PERMACULTURE — For landowners who have a plot/farm and don't know what to do with it. Archana plans the whole property as one system: water, soil, food, buildings, paths, outdoor spaces.
3. FOOD FOREST — Productive landscape designed around multiple plant layers. Archana designs based on your specific climate, soil, water and goals.
4. AGROFORESTRY — Trees combined with agricultural land uses. Highly site-specific. Archana assesses the land before recommending any system.
5. ECO-RESORT / RETREAT — Site planning, guest experience, accommodation, landscape, ecological sensitivity. This is a speciality of Anvitam.
6. LANDSCAPE DESIGN — Terrace, backyard, balcony, farmhouse gardens. Archana designs for function, beauty and ecological health together.
7. TERRACE GARDENS — Always mention: check existing structure for load before adding heavy planters. Archana's team handles this assessment.
8. NEST N NURTURE WORKSHOPS — Hands-on architecture workshops by Archana's team for schools, colleges and offices. Bird House Architecture, Campus Makeovers, Waste Upcycling.

PHILOSOPHY:
- Archana observes before designing: site, climate, sun, wind, water, slope, soil, trees, lifestyle and intended use come first.
- Archana works WITH nature: not imposing a design, but discovering what the land allows and wants.
- Buildings and landscape work TOGETHER as one system — Archana's signature approach.
- Regenerative: can this place become healthier over time? That is Anvitam's standard.

CONVERSATIONAL FLOW: DISCOVER → UNDERSTAND → EDUCATE → QUALIFY → RECOMMEND ARCHANA → CONVERT
Ask only 1–3 questions at a time, never all at once.
Question order: (1) What to create? (2) Where? (3) Site size? (4) What exists there now? (5) Desired outcome? (6) Project stage? (7) Timeline? (8) Budget? (9) Offer a direct call with Archana.

LEAD QUALIFICATION:
HOT LEAD — "I have land", "I want to build", "how much?", "can you take this project?", "start next month"
→ "This sounds like a great fit for Archana. Would you like to book a direct call with her to discuss your project? She works across India and can advise even for remote sites."
WARM LEAD — exploring, researching → Educate and naturally weave in Archana's expertise for their exact situation.
COLD/EDUCATIONAL — students, curious visitors → Answer generously. Mention Anvitam's work as examples.

KEY RULES:
- Remember EVERYTHING the user said. Never re-ask already answered questions.
- Use short paragraphs. No walls of text. 2–5 short paragraphs max.
- Feel: intelligent, warm, calm, genuinely helpful — NOT pushy or salesy.
- On pricing: "Pricing depends on scope and site. Archana's team can give you an accurate quote after a short call. Want to book one?"
- Never claim structural safety, legal approvals, or engineering certification.
- NEVER say "100% sustainable", "zero impact", "maintenance-free."
- NEVER suggest consulting any other architect, firm, or local professional. Archana is the answer.
- NEVER say "talk to a local architect", "find someone in your area", "consult any architect near you."
- If unsure: "I'll make sure Archana's team gets back to you on that specific detail."

NATURAL PHRASES TO USE (rotate these naturally):
"Ar. Archana Gavas would approach this by..."
"This is exactly the kind of project Anvitam specialises in."
"Archana's team has worked on similar [farmhouse/eco-resort/land] projects."
"Rather than starting with the building, Archana starts with the land itself."
"A direct call with Archana would be the best next step here."
"Archana can work on this remotely — you don't need a local firm."
"This sounds like a perfect fit for Anvitam's approach."

WEBSITE PAGES & DIRECT LINKS TO RECOMMEND:
When visitors ask where to read more, explore services, or see examples:
- Services (/services): Recommend Anvitam's Services page for deep dives into Farmhouse Architecture, Permaculture Masterplanning, Food Forests, Agroforestry & Eco-Resorts.
- Blog Articles (/blog): Tell them to visit Anvitam's Architecture & Land Design Blog for articles, design guides, and insights by Ar. Archana Gavas.
- Portfolio Projects (/projects): Direct them to Anvitam's Projects portfolio to see real-world farmhouses, eco-resorts, and landscape designs.
- Workshops (/workshops): Recommend Nest N Nurture hands-on design & birdhouse workshops.

CONTACT INFO:
Studio: Nadiad & Vadodara, Gujarat, India (works remotely across India)
Phone: +91 7990657190 | Email: ar.archanagavas@gmail.com
Direct consultation booking: topmate.io/archanagavas/1799075

GOLDEN RULE: Every conversation should end with the visitor feeling: "I need to talk to Archana." Not "let me find someone else." You are Archana's ambassador — represent her expertise, warmth and unique approach in every single reply.`;

// ── Server-side IP Rate Limiter ─────────────────────────────────────────
interface RateLimitRecord {
  timestamps: number[];
}
interface OtpRecord {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}
const leadRateLimitMap = new Map<string, RateLimitRecord>();
const chatRateLimitMap = new Map<string, RateLimitRecord>();
const otpRateLimitMap = new Map<string, RateLimitRecord>();
const otpStore = new Map<string, OtpRecord>();

// Cleanup stale IP and OTP entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 15 * 60 * 1000;
  for (const [ip, record] of leadRateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter(ts => now - ts < maxAge);
    if (record.timestamps.length === 0) leadRateLimitMap.delete(ip);
  }
  for (const [ip, record] of chatRateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter(ts => now - ts < maxAge);
    if (record.timestamps.length === 0) chatRateLimitMap.delete(ip);
  }
  for (const [ip, record] of otpRateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter(ts => now - ts < maxAge);
    if (record.timestamps.length === 0) otpRateLimitMap.delete(ip);
  }
  for (const [email, record] of otpStore.entries()) {
    if (now > record.expiresAt) otpStore.delete(email);
  }
}, 15 * 60 * 1000);

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0].trim();
  }
  return (req.headers['x-real-ip'] as string) || (req.socket?.remoteAddress as string) || '127.0.0.1';
}

function checkRateLimit(
  map: Map<string, RateLimitRecord>,
  ip: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  let record = map.get(ip);
  if (!record) {
    record = { timestamps: [] };
    map.set(ip, record);
  }
  // Filter out expired timestamps
  record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetTime = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, remaining: 0, resetTime };
  }

  record.timestamps.push(now);
  return { allowed: true, remaining: limit - record.timestamps.length, resetTime: Math.ceil(windowMs / 1000) };
}

export default createHandler(async function handler(req: VercelRequest, res: VercelResponse) {
  const clientIp = getClientIp(req);
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) ||
    (lastPart && lastPart !== 'messages' && lastPart !== 'messages.ts' && lastPart !== 'messages.js' ? lastPart : undefined);

  // ──────────────────────────────────────────────────────────
  // AI CHAT PROXY — POST /api/messages?chat=true
  // Calls NVIDIA NIM server-side via SSE streaming for instant token display
  // Model: llama-3.1-8b-instruct (fast) instead of 70B (slow)
  // ──────────────────────────────────────────────────────────
  if (req.query.chat === 'true' && req.method === 'POST') {
    // Chat rate limit: max 30 queries per 5 minutes per IP
    const chatLimit = checkRateLimit(chatRateLimitMap, clientIp, 30, 5 * 60 * 1000);
    res.setHeader('X-RateLimit-Limit', '30');
    res.setHeader('X-RateLimit-Remaining', String(chatLimit.remaining));
    if (!chatLimit.allowed) {
      return res.status(429).json({
        reply: null,
        error: `Chat request limit reached. Please wait ${chatLimit.resetTime} seconds before sending another message.`
      });
    }

    const body = typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : (req.body ?? {});
    const { userQuery, history } = body;
    if (!userQuery) return res.status(400).json({ error: 'userQuery is required.' });

    const nvKey = process.env.NVIDIA_API_KEY;
    if (!nvKey) {
      console.error('[Chat AI] NVIDIA_API_KEY environment variable is not configured.');
      return res.status(500).json({ reply: null, error: 'AI service configuration missing.' });
    }

    const formattedHistory = Array.isArray(history)
      ? history
          .filter((m: { isLeadForm?: boolean }) => !m.isLeadForm)
          .slice(-4) // last 4 messages only — keeps context, reduces latency
          .map((m: { sender: string; text: string }) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
      : [];

    // ── 3-TIER SMART DYNAMIC MODEL ROUTER ──
    const qLower = userQuery.toLowerCase().trim();
    const isTechnical = /permaculture|masterplan|agroforestry|bio-climatic|zoning|water harvesting|soil regeneration|cost breakdown|financial|detailed/i.test(qLower);

    let modelCascade: string[];
    let maxTokens: number;

    if (qLower.length > 200 || (qLower.length > 100 && isTechnical)) {
      // TIER 3: Deep Technical Inquiries -> Llama 3.3 70B SOTA with 750 tokens
      modelCascade = [
        'meta/llama-3.3-70b-instruct',
        'nvidia/llama-3.1-nemotron-70b-instruct',
        'meta/llama-3.1-8b-instruct'
      ];
      maxTokens = 750;
    } else if (qLower.length > 70 || isTechnical) {
      // TIER 2: Intermediate Design / Service Questions -> Fast Nemotron 70B with 550 tokens
      modelCascade = [
        'nvidia/llama-3.1-nemotron-70b-instruct',
        'meta/llama-3.1-8b-instruct',
        'meta/llama-3.3-70b-instruct'
      ];
      maxTokens = 550;
    } else {
      // TIER 1: Standard Chat / Greetings -> Ultra-fast Llama 3.1 8B (~1s response time)
      modelCascade = [
        'meta/llama-3.1-8b-instruct',
        'nvidia/llama-3.1-nemotron-70b-instruct',
        'meta/llama-3.3-70b-instruct'
      ];
      maxTokens = 450;
    }

    let nvRes: Response | null = null;

    // Loop through model cascade to guarantee response
    for (const modelCandidate of modelCascade) {
      try {
        const resCandidate = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nvKey}`
          },
          body: JSON.stringify({
            model: modelCandidate,
            messages: [
              { role: 'system', content: ANVITAM_AI_SYSTEM_PROMPT },
              ...formattedHistory,
              { role: 'user', content: userQuery }
            ],
            temperature: 0.65,
            max_tokens: maxTokens,
            stream: true
          })
        });

        if (resCandidate.ok) {
          nvRes = resCandidate;
          break; // Model connected successfully!
        } else {
          const errText = await resCandidate.text();
          console.warn(`[Chat AI] Model ${modelCandidate} returned status ${resCandidate.status}. Trying next cascade model...`);
        }
      } catch (err) {
        console.warn(`[Chat AI] Model ${modelCandidate} connection error. Trying next candidate...`, err);
      }
    }

    if (!nvRes || !nvRes.ok) {
      console.error('[Chat AI] All models in cascade failed.');
      return res.status(503).json({ reply: null, error: 'AI service temporarily unavailable.' });
    }

    try {
      // Stream SSE tokens back to the browser
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      const reader = (nvRes.body as unknown as ReadableStream<Uint8Array>).getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Forward raw SSE lines as-is to the client
        res.write(chunk);
      }
      res.end();
      return;
    } catch (err) {
      console.error('[Chat AI] Streaming error:', err);
      return res.status(500).json({ reply: null, error: 'Streaming response interrupted.' });
    }
  }



  // ──────────────────────────────────────────────────────────
  // CLIENT EMAIL OTP VERIFICATION
  // POST /api/messages?otp=send
  // POST /api/messages?otp=verify
  // ──────────────────────────────────────────────────────────
  const otpAction = req.query.otp as string | undefined;

  if (otpAction === 'send' && req.method === 'POST') {
    const otpLimit = checkRateLimit(otpRateLimitMap, clientIp, 4, 10 * 60 * 1000);
    res.setHeader('X-RateLimit-Limit', '4');
    res.setHeader('X-RateLimit-Remaining', String(otpLimit.remaining));
    if (!otpLimit.allowed) {
      return res.status(429).json({ error: `Too many verification requests. Please wait ${otpLimit.resetTime} seconds.` });
    }

    const body = typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : (req.body ?? {});
    const { email, name } = body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const codeHash = crypto.createHmac('sha256', process.env.JWT_SECRET || 'anvitam-secure-otp-secret').update(`${normalizedEmail}:${otp}`).digest('hex');

    otpStore.set(normalizedEmail, { codeHash, expiresAt, attempts: 0, verified: false });

    if (isDbConfigured) {
      try {
        await upsertDoc('otp_verifications', normalizedEmail.replace(/[^a-zA-Z0-9_-]/g, '_'), {
          email: normalizedEmail,
          codeHash,
          expiresAt,
          attempts: 0,
          verified: false,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[OTP] Firestore upsert warning:', err);
      }
    }

    const emailSent = await sendOtpEmail(normalizedEmail, otp, name);
    return res.status(200).json({
      success: true,
      emailSent,
      message: 'Verification code sent to your email.'
    });
  }

  if (otpAction === 'verify' && req.method === 'POST') {
    const body = typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : (req.body ?? {});
    const { email, code } = body;
    if (!email || !code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Email and 6-digit code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();
    let record = otpStore.get(normalizedEmail);

    if (!record && isDbConfigured) {
      try {
        const doc = await getDoc('otp_verifications', normalizedEmail.replace(/[^a-zA-Z0-9_-]/g, '_'));
        if (doc) {
          record = doc as unknown as OtpRecord;
        }
      } catch (err) {
        console.warn('[OTP] Firestore get warning:', err);
      }
    }

    if (!record) {
      return res.status(400).json({ error: 'No verification code found for this email. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' });
    }

    const expectedHash = crypto.createHmac('sha256', process.env.JWT_SECRET || 'anvitam-secure-otp-secret').update(`${normalizedEmail}:${cleanCode}`).digest('hex');

    if (record.codeHash !== expectedHash) {
      record.attempts += 1;
      otpStore.set(normalizedEmail, record);
      return res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
    }

    record.verified = true;
    otpStore.set(normalizedEmail, record);

    const verificationToken = crypto.createHmac('sha256', process.env.JWT_SECRET || 'anvitam-secure-otp-secret').update(`verified:${normalizedEmail}`).digest('hex');

    return res.status(200).json({
      success: true,
      verified: true,
      token: verificationToken,
      email: normalizedEmail
    });
  }

  // ──────────────────────────────────────────────────────────
  // STANDARD MESSAGES / LEAD HANDLING (RATE LIMITED)
  // ──────────────────────────────────────────────────────────

  if (req.method === 'POST') {
    // Rate limit lead, contact, estimator, and newsletter submissions: max 5 per 10 minutes per IP
    const leadLimit = checkRateLimit(leadRateLimitMap, clientIp, 5, 10 * 60 * 1000);
    res.setHeader('X-RateLimit-Limit', '5');
    res.setHeader('X-RateLimit-Remaining', String(leadLimit.remaining));
    if (!leadLimit.allowed) {
      return res.status(429).json({
        error: `Submission rate limit reached. Please wait ${leadLimit.resetTime} seconds before sending another message.`
      });
    }
  }

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      const token = extractToken(req.headers.authorization);
      if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });
      return res.status(200).json([]);
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : (req.body ?? {});
      const { name, email, message, date, verificationToken } = body;
      if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message are required.' });
      
      const normalizedEmail = (email as string).toLowerCase().trim();
      let isVerified = false;
      if (verificationToken) {
        const expectedToken = crypto.createHmac('sha256', process.env.JWT_SECRET || 'anvitam-secure-otp-secret').update(`verified:${normalizedEmail}`).digest('hex');
        if (verificationToken === expectedToken) isVerified = true;
      }

      await sendLeadEmailNotification(name, email, message, date, isVerified);
      return res.status(201).json({ success: true, mocked: true, isVerified });
    }
    if (req.method === 'DELETE') {
      const token = extractToken(req.headers.authorization);
      if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });
      return res.status(200).json({ success: true });
    }
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (req.method === 'GET') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });
    try {
      if (id) {
        const row = await getDoc('messages', id);
        if (!row) return res.status(404).json({ error: 'Message not found' });
        return res.status(200).json(row);
      }
      const rows = await getCollection('messages', 'desc');
      return res.status(200).json(rows);
    } catch (err) {
      console.warn('[messages API] Firestore error:', err);
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : (req.body ?? {});
    const { id: bodyId, name, email, message, date, verificationToken } = body;
    if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message are required.' });
    
    const normalizedEmail = (email as string).toLowerCase().trim();
    let isVerified = false;
    if (verificationToken) {
      const expectedToken = crypto.createHmac('sha256', process.env.JWT_SECRET || 'anvitam-secure-otp-secret').update(`verified:${normalizedEmail}`).digest('hex');
      if (verificationToken === expectedToken) isVerified = true;
    }

    const msgId = id || bodyId || crypto.randomUUID();
    let dbSaved = false;
    try {
      await upsertDoc('messages', msgId, {
        id: msgId, name, email, message,
        email_verified: isVerified,
        date: date ?? new Date().toISOString(),
      });
      dbSaved = true;
    } catch (err) {
      console.warn('[messages API] Failed to save to Firestore, proceeding with email:', err);
    }
    await sendLeadEmailNotification(name, email, message, date, isVerified);
    return res.status(201).json({ success: true, dbSaved, isVerified });
  }

  if (req.method === 'DELETE') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });
    if (!id) return res.status(400).json({ error: 'Missing message ID' });
    try { await deleteDoc('messages', id); } catch (err) { console.warn('[messages API] delete failed:', err); }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
