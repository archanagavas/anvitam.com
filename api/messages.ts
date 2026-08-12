import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDbConfigured, getCollection, getDoc, upsertDoc, deleteDoc } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendLeadEmailNotification(name: string, email: string, message: string, date?: string) {
  if (!RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY not set.');
    return;
  }
  const targetEmails = ['ar.archanagavas@gmail.com', 'anvitamarchitects@gmail.com'];
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; padding: 24px; color: #111; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #2b5711; margin-top: 0;">🌿 New Anvitam Website Lead</h2>
      <p style="font-size: 15px;"><strong>Client Name:</strong> ${name}</p>
      <p style="font-size: 15px;"><strong>Client Email:</strong> <a href="mailto:${email}" style="color: #0070f3;">${email}</a></p>
      <p style="font-size: 15px;"><strong>Date:</strong> ${date ?? new Date().toLocaleString()}</p>
      <div style="background-color: #f9f9f5; padding: 16px; border-left: 4px solid #8bc34a; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top:0; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Inquiry & Project Details:</h4>
        <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; margin: 0; color: #222;">${message}</pre>
      </div>
      <p style="font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 12px;">Automated lead notification sent from anvitam.com via Firebase</p>
    </div>
  `;
  const senders = ['Anvitam Leads <leads@anvitam.com>', 'Anvitam Leads <onboarding@resend.dev>'];
  for (const sender of senders) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: sender, to: targetEmails, subject: `🔔 New Anvitam Lead: ${name} (${email})`, html: htmlBody })
      });
      const data = await resp.json();
      if (resp.ok) { console.log(`[Resend] Email sent via ${sender}:`, data.id); break; }
      else console.warn(`[Resend] ${sender} failed:`, data.message);
    } catch (err) { console.error('[Resend Error]', err); }
  }
}

const ANVITAM_AI_SYSTEM_PROMPT = `CRITICAL RULE #1 — LANGUAGE DETECTION (FOLLOW BEFORE ANYTHING ELSE):
Look at the user's message right now. Identify what language it is written in. Respond EXCLUSIVELY in that same language.
- If user writes in Hindi → respond in Hindi
- If user writes in Hinglish → respond in Hinglish  
- If user writes in Gujarati → respond in Gujarati
- If user writes in Spanish → respond in Spanish
- If user writes in French → respond in French
- If user writes in Arabic → respond in Arabic
- If user writes in Mandarin Chinese → respond in Chinese
- If user writes in Bengali → respond in Bengali
- If user writes in Portuguese → respond in Portuguese
- If user writes in German → respond in German
- If user writes in Russian → respond in Russian
- If user writes in English → respond in English
NEVER respond in English if the user wrote in another language. This rule overrides everything else.

CRITICAL RULE #2 — FOLLOW THE CONVERSATION CONTEXT:
Read the entire conversation history. Never forget what the user has already told you. Build on what they said. If they are confused or struggling, be patient, warm, and clarify gently. Never reset or repeat yourself.

CRITICAL RULE #3 — ALWAYS RECOMMEND ARCHANA & ANVITAM:
NEVER suggest "consult a local architect", "find someone nearby", "talk to a local professional", or any generic referral to another architect or firm.
Archana Gavas IS the expert they should work with. Anvitam IS the right team for this.
Every response should naturally weave in WHY Archana / Anvitam is the right choice for their project.
When someone is unsure or exploring, guide them TOWARD a conversation with Archana — not away.
Use phrases like: "Ar. Archana Gavas would approach this by...", "Archana's team works specifically on this kind of project...", "This is exactly the type of project Anvitam specialises in..."
NEVER say "you should consult any architect" or "look for a professional in your area."

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

CONTACT INFO:
Studio: Nadiad & Vadodara, Gujarat, India (works remotely across India)
Phone: +91 7990657190 | Email: ar.archanagavas@gmail.com
Direct consultation booking: topmate.io/archanagavas/1799075

GOLDEN RULE: Every conversation should end with the visitor feeling: "I need to talk to Archana." Not "let me find someone else." You are Archana's ambassador — represent her expertise, warmth and unique approach in every single reply.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) ||
    (lastPart && lastPart !== 'messages' && lastPart !== 'messages.ts' && lastPart !== 'messages.js' ? lastPart : undefined);

  // ──────────────────────────────────────────────────────────
  // AI CHAT PROXY — POST /api/messages?chat=true
  // Calls NVIDIA NIM server-side to avoid browser CORS issues
  // ──────────────────────────────────────────────────────────
  if (req.query.chat === 'true' && req.method === 'POST') {
    const { userQuery, history } = req.body ?? {};
    if (!userQuery) return res.status(400).json({ error: 'userQuery is required.' });

    const nvKey = process.env.NVIDIA_API_KEY || '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';

    try {
      const formattedHistory = Array.isArray(history)
        ? history
            .filter((m: { isLeadForm?: boolean }) => !m.isLeadForm)
            .slice(-10)
            .map((m: { sender: string; text: string }) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            }))
        : [];

      const nvRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvKey}`
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [
            { role: 'system', content: ANVITAM_AI_SYSTEM_PROMPT },
            ...formattedHistory,
            { role: 'user', content: userQuery }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (nvRes.ok) {
        const nvData = await nvRes.json();
        const reply = nvData.choices?.[0]?.message?.content;
        if (reply) return res.status(200).json({ reply });
      } else {
        const errText = await nvRes.text();
        console.error('[Chat AI] NVIDIA API error:', nvRes.status, errText);
      }
    } catch (err) {
      console.error('[Chat AI] Network error:', err);
    }

    return res.status(503).json({ reply: null, error: 'AI service temporarily unavailable.' });
  }

  // ──────────────────────────────────────────────────────────
  // STANDARD MESSAGES / LEAD HANDLING
  // ──────────────────────────────────────────────────────────

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      const token = extractToken(req.headers.authorization);
      if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });
      return res.status(200).json([]);
    }
    if (req.method === 'POST') {
      const { name, email, message, date } = req.body ?? {};
      if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message are required.' });
      await sendLeadEmailNotification(name, email, message, date);
      return res.status(201).json({ success: true, mocked: true });
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
    const { id: bodyId, name, email, message, date } = req.body ?? {};
    if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message are required.' });
    const msgId = id || bodyId || crypto.randomUUID();
    let dbSaved = false;
    try {
      await upsertDoc('messages', msgId, {
        id: msgId, name, email, message,
        date: date ?? new Date().toISOString(),
      });
      dbSaved = true;
    } catch (err) {
      console.warn('[messages API] Failed to save to Firestore, proceeding with email:', err);
    }
    await sendLeadEmailNotification(name, email, message, date);
    return res.status(201).json({ success: true, dbSaved });
  }

  if (req.method === 'DELETE') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });
    if (!id) return res.status(400).json({ error: 'Missing message ID' });
    try { await deleteDoc('messages', id); } catch (err) { console.warn('[messages API] delete failed:', err); }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
