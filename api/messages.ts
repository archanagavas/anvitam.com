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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) ||
    (lastPart && lastPart !== 'messages' && lastPart !== 'messages.ts' && lastPart !== 'messages.js' ? lastPart : undefined);

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
