import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendLeadEmailNotification(name: string, email: string, message: string, date?: string) {
  if (!RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY environment variable is not set.');
    return;
  }

  // Primary lead intake inboxes requested by user
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
      <p style="font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 12px;">Automated lead notification sent from anvitam.com</p>
    </div>
  `;

  // We try custom domain first (leads@anvitam.com), falling back to onboarding@resend.dev
  const senders = ['Anvitam Leads <leads@anvitam.com>', 'Anvitam Leads <onboarding@resend.dev>'];

  for (const sender of senders) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: sender,
          to: targetEmails,
          subject: `🔔 New Anvitam Lead: ${name} (${email})`,
          html: htmlBody
        })
      });
      const data = await resp.json();
      if (resp.ok) {
        console.log(`[Resend Success] Email delivered to ${targetEmails.join(', ')} via ${sender}:`, data.id);
        break; // Successfully delivered!
      } else {
        console.warn(`[Resend Sender Warning] ${sender} failed (Status ${resp.status}):`, data.message || data);
      }
    } catch (err) {
      console.error('[Resend Error]', err);
    }
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
      if (!token || !verifyAdminToken(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      return res.status(200).json([]);
    }
    if (req.method === 'POST') {
      const { name, email, message, date } = req.body ?? {};
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'name, email and message are required.' });
      }
      console.log(`[Mock Message] From: ${name} (${email}) - Msg: ${message}`);
      await sendLeadEmailNotification(name, email, message, date);
      return res.status(201).json({ success: true, mocked: true });
    }
    if (req.method === 'DELETE') {
      const token = extractToken(req.headers.authorization);
      if (!token || !verifyAdminToken(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      return res.status(200).json({ success: true, mocked: true });
    }
    return res.status(503).json({ error: 'Database connection not configured' });
  }

  if (req.method === 'GET') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      if (id) {
        const rows = await sql`
          SELECT id, name, email, message, date, created_at FROM messages WHERE id = ${id}
        `;
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Message not found' });
        }
        return res.status(200).json(rows[0]);
      }
      const rows = await sql`
        SELECT id, name, email, message, date, created_at FROM messages ORDER BY created_at DESC
      `;
      return res.status(200).json(rows);
    } catch (err) {
      console.warn('[messages API] Database query failed, returning empty list fallback:', err);
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    const { id: bodyId, name, email, message, date } = req.body ?? {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required.' });
    }
    const msgId = id || bodyId || crypto.randomUUID();
    let dbSaved = false;
    try {
      await sql`
        INSERT INTO messages (id, name, email, message, date)
        VALUES (${msgId}, ${name}, ${email}, ${message}, ${date ?? new Date().toISOString()})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          message = EXCLUDED.message,
          date = EXCLUDED.date
      `;
      dbSaved = true;
    } catch (err) {
      console.warn('[messages API] Failed to save message to DB, proceeding with email alert:', err);
    }

    // Trigger resilient email alert regardless of DB status
    await sendLeadEmailNotification(name, email, message, date);

    return res.status(201).json({ success: true, dbSaved });
  }

  if (req.method === 'DELETE') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!id) {
      return res.status(400).json({ error: 'Missing message ID' });
    }
    try {
      await sql`DELETE FROM messages WHERE id = ${id}`;
    } catch (err) {
      console.warn('[messages API] Failed to delete message from DB:', err);
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
