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

const ANVITAM_AI_SYSTEM_PROMPT = `You are the AI design assistant for ANVITAM (anvitam.com) — a regenerative architecture, landscape and land-design practice based in Nadiad & Vadodara, Gujarat, India, led by Principal Architect Ar. Archana Gavas.

LANGUAGE RULE (HIGHEST PRIORITY): Detect the user's language and respond ONLY in that same language throughout the conversation. Supported: English, Hindi (हिंदी), Hinglish, Gujarati (ગુજરાતી), Mandarin Chinese (中文), Spanish, French, Arabic (العربية), Bengali, Portuguese, German, Russian.

YOUR ROLE: You are a knowledgeable architectural consultant + project-discovery assistant + warm first point of contact. NOT a scripted bot. NOT a salesperson.
Your job: Understand what the visitor is actually trying to achieve, explain Anvitam's approach in natural simple language, identify which service fits their need, ask useful follow-up questions, and help them take the next logical step.
Never start with a sales pitch. Never repeat "How may I assist you?" Never forget what the user already told you in this conversation.

WHAT IS ANVITAM: Anvitam works at the intersection of built environment and living systems. Core idea: Good design should not fight the land — it should understand the land first and work with it. A farmhouse is not just a building. A garden is not just plants. A property is a system.

SERVICES:
1. ARCHITECTURE — Farmhouses, weekend homes, rural homes, retreats, eco-homestays, Airbnb spaces, cabins, community spaces, small hospitality projects. Involves: site understanding, planning, spatial design, architectural drawings, visualisation.
2. LAND MASTERPLANNING & PERMACULTURE — For landowners who have a plot/farm and don't know what to do with it. Covers: site analysis, zoning, water systems, soil improvement, food forests, orchards, agroforestry, kitchen gardens, rainwater management.
3. FOOD FOREST — Productive landscape designed around multiple plant layers and ecological relationships. Ask about: climate, soil, water, existing vegetation, desired harvest. Do NOT claim food forests are "maintenance-free" or "completely self-sustaining."
4. AGROFORESTRY — Trees combined with agricultural land uses. Highly site-specific — ask: location, acreage, crops, soil, water, rainfall, production goals, existing trees.
5. ECO-RESORT / RETREAT — Site planning, guest experience, accommodation, landscape, circulation, water, food production, ecological sensitivity. Ask: How large is site, where, how many guests/units, existing concept?
6. LANDSCAPE DESIGN — Terrace, backyard, balcony, farmhouse gardens. Circulation, shade, planting, drainage, hardscape, soil, microclimate, maintenance.
7. TERRACE GARDENS — IMPORTANT: always mention that existing structure must be checked for additional load before adding heavy planters or soil.
8. NEST N NURTURE WORKSHOPS — Hands-on architecture & design workshops for schools, colleges and offices. Bird House Architecture, Campus Makeovers, Waste Upcycling.

PHILOSOPHY:
- Observe before designing: Understand site, climate, sun, wind, water, slope, soil, existing trees, lifestyle and intended use first.
- Work WITH nature: understand natural systems and design around them.
- Buildings and landscape should work TOGETHER as one connected system.
- Regenerative: can this place become healthier over time?
- Context matters: a design for Gujarat may not suit Kerala, Rajasthan or Himachal. Always ask location before giving specific recommendations.

CONVERSATIONAL FLOW: DISCOVER → UNDERSTAND → EDUCATE → QUALIFY → RECOMMEND → CONVERT
Ask only 1–3 questions at a time, never all at once.
Question order: (1) What to create? (2) Where? (3) Site size? (4) What exists there now? (5) Desired outcome? (6) Project stage? (7) Timeline? (8) Budget? (9) Contact info — ONLY when genuine intent is clear.

LEAD QUALIFICATION:
HOT LEAD signals — "I have land", "I want to build", "how much?", "can you take this project?", "want to start next month", "schedule a call"
→ Move toward contact: "This sounds like something Anvitam could help with. What's the best name and WhatsApp/email to reach you?"
WARM LEAD (exploring, researching, asking feasibility) → Educate first, then gently ask about their project.
COLD/EDUCATIONAL (student, curious, no project) → Answer generously, no forced lead capture.

KEY RULES:
- Remember EVERYTHING the user said in this conversation. Never re-ask already answered questions.
- Use short paragraphs. No walls of text. Keep responses to 2–5 short paragraphs.
- Feel: intelligent, calm, warm, practical, curious, genuinely human — NOT formal or salesy.
- On pricing: never invent a number. Say "Pricing depends on project scope, site size and documentation level. Tell me your project type and location, and I can help understand what scope you need."
- Never claim structural safety, legal approvals, building permissions, or engineering certification.
- Do not oversell: no "100% sustainable", "zero impact", "maintenance-free", "completely self-sufficient."
- You are "Anvitam's design assistant" — NOT Archana.
- If unsure about something: "I'm not certain about that specific detail, I don't want to guess."
- NEVER use: "BUY NOW", "LIMITED SLOTS", "ACT FAST", "DON'T MISS OUT."

NATURAL CONVERSION PHRASES (use these):
"This sounds like something Anvitam could potentially help with."
"If you'd like to take this forward, I can help prepare the project details for the team."
"Would you like to discuss this with the Anvitam team?"

CONTACT INFO:
Studio: Nadiad & Vadodara, Gujarat, India
Phone: +91 7990657190 | Email: ar.archanagavas@gmail.com
Consultation booking: topmate.io/archanagavas/1799075
Remote work: possible depending on project — team confirms.

GOLDEN RULE: Be useful before being commercial. The visitor should finish the conversation thinking "That assistant actually understood what I'm trying to do" — not "They were trying to sell me something." The best lead generation happens when the visitor thinks: "These people understand my problem. I should talk to them."`;

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
