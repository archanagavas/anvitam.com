import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';

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
      const { name, email, message } = req.body ?? {};
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'name, email and message are required.' });
      }
      console.log(`[Mock Message] From: ${name} (${email}) - Msg: ${message}`);
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
  }

  if (req.method === 'POST') {
    const { id: bodyId, name, email, message, date } = req.body ?? {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required.' });
    }
    await sql`
      INSERT INTO messages (id, name, email, message, date)
      VALUES (${id || bodyId || crypto.randomUUID()}, ${name}, ${email}, ${message}, ${date ?? new Date().toISOString()})
    `;

    // ── Email notification alert to Archana via Resend ──────────────
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Anvitam Web Leads <onboarding@resend.dev>',
            to: ['ar.archanagavas@gmail.com'],
            subject: `🔔 New Anvitam Lead: ${name} (${email})`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 24px; color: #111; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
                <h2 style="color: #2b5711; margin-top: 0;">🌿 New Anvitam Website Lead</h2>
                <p style="font-size: 15px;"><strong>Client Name:</strong> ${name}</p>
                <p style="font-size: 15px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0070f3;">${email}</a></p>
                <p style="font-size: 15px;"><strong>Date:</strong> ${date ?? new Date().toLocaleString()}</p>
                <div style="background-color: #f9f9f5; padding: 16px; border-left: 4px solid #8bc34a; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top:0; color: #333; font-size: 14px; text-transform: uppercase; tracking: 1px;">Inquiry & Project Details:</h4>
                  <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; margin: 0; color: #222;">${message}</pre>
                </div>
                <p style="font-size: 12px; color: #999; border-t: 1px solid #eee; pt: 12px;">Automated lead reminder sent to ar.archanagavas@gmail.com from anvitam.com</p>
              </div>
            `
          })
        });
      } catch (err) {
        console.error('[Resend Email Alert Error]', err);
      }
    }

    return res.status(201).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!id) {
      return res.status(400).json({ error: 'Missing message ID' });
    }
    await sql`DELETE FROM messages WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
