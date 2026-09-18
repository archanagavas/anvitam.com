/**
 * scripts/run-daily-outreach.ts
 *
 * 💌 HIGH-NET-WORTH (HNI) CLIENT & BACKLINK OUTREACH ENGINE — ZERO COST
 *
 * Dispatches 1-2 personalized outreach emails per day using free Resend API.
 * Targets:
 *   - Luxury Eco-Resort & Homestay Founders (Coorg, Wayanad, Alibaug, Karjat)
 *   - Agrotourism & Farm Destination Operators
 *   - Tech CXOs & Executives with Farmland (Bengaluru, Pune, Mumbai, Gurugram)
 *   - Merchant Navy Officers & NRI Landowners
 *   - Top Architecture & Permaculture Media (ArchDaily, Down To Earth)
 *
 * Usage:
 *   npx tsx scripts/run-daily-outreach.ts --list
 *   npx tsx scripts/run-daily-outreach.ts --send 1
 */

import './load-env';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const args = process.argv.slice(2);
  const leadsPath = resolve(process.cwd(), 'tools/outreach/client_leads.json');

  if (!existsSync(leadsPath)) {
    console.error('❌ Missing tools/outreach/client_leads.json');
    process.exit(1);
  }

  const leads: any[] = JSON.parse(readFileSync(leadsPath, 'utf8'));

  if (args.includes('--list')) {
    console.log('\n💼 ANVITAM 1,000 CLIENT LEADS & BACKLINK OUTREACH PIPELINE');
    console.log('='.repeat(80));
    const queued = leads.filter(l => l.status === 'queued');
    const sent = leads.filter(l => l.status === 'sent' || l.status === 'replied');
    console.log(`Summary: ${sent.length} dispatched/replied | ${queued.length} queued | Total: ${leads.length}\n`);

    leads.forEach((lead, i) => {
      const statusIcon = lead.status === 'replied' ? '💬' : lead.status === 'sent' ? '✉️' : '⏳';
      console.log(`[${(i + 1).toString().padStart(2)}] ${statusIcon} ${lead.name.padEnd(22)} | ${lead.segment.padEnd(35)} | ${lead.location.padEnd(20)} | ${lead.status.toUpperCase()}`);
    });
    console.log('='.repeat(80));
    return;
  }

  console.log('='.repeat(70));
  console.log('💌 ANVITAM AUTONOMOUS CLIENT OUTREACH ENGINE');
  console.log('   Audience: High-Net-Worth Landowners, Resort Founders, CXOs & Builders');
  console.log('   Delivery: Resend Free API (Zero Vercel Function Cost)');
  console.log('='.repeat(70));

  const queuedLeads = leads.filter(l => l.status === 'queued');
  if (queuedLeads.length === 0) {
    console.log('🎉 All queued outreach leads have already been contacted!');
    return;
  }

  const targetLead = queuedLeads[0];
  console.log(`\n🎯 Target Lead Selected for Today's Drip:`);
  console.log(`   Name:     ${targetLead.name} (${targetLead.company})`);
  console.log(`   Segment:  ${targetLead.segment}`);
  console.log(`   Location: ${targetLead.location} (${targetLead.land_size})`);
  console.log(`   Email:    ${targetLead.email}`);
  console.log(`   Pitch:    ${targetLead.pitch_angle}`);

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('\n⚠️ RESEND_API_KEY not configured. Marking as preview simulation only.');
    targetLead.status = 'sent';
    targetLead.sent_date = new Date().toISOString().split('T')[0];
    targetLead.response_status = 'Simulated dispatch (Add RESEND_API_KEY to send live emails)';
  } else {
    try {
      console.log('\n📤 Dispatching personalized Ogilvy-engineered pitch via Resend...');
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; color: #111; line-height: 1.6;">
          <p>Dear ${targetLead.name},</p>
          <p>I came across your work with <strong>${targetLead.company}</strong> in ${targetLead.location}.</p>
          <p>As an architect specializing in ecological master-planning and permaculture retreats in India, I noticed you are developing land in an area with unique microclimatic potential.</p>
          <p style="background: #f4fbf0; padding: 14px 18px; border-left: 4px solid #8bc34a; border-radius: 4px;">
            <strong>Tailored Concept:</strong> ${targetLead.pitch_angle}
          </p>
          <p>We build our designs around passive cooling, zero-chemical water harvesting, and vernacular materials, keeping long-term maintenance virtually zero.</p>
          <p>I would be delighted to share a few site sketches and contour concepts if you have 10 minutes next week.</p>
          <br/>
          <p>Warm regards,<br/>
          <strong>Ar. Archana Gavas</strong><br/>
          Founder & Principal Architect, Anvitam<br/>
          <a href="https://www.anvitam.com" style="color: #2e7d32;">anvitam.com</a> | Vadodara, Gujarat
          </p>
        </div>
      `;

      let res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'Ar. Archana Gavas <onboarding@resend.dev>',
          to: [targetLead.email],
          subject: `Ecological architecture concept for ${targetLead.company}`,
          html: emailHtml,
        }),
      });

      if (res.ok) {
        console.log(`✅ Successfully dispatched outreach email directly to ${targetLead.email}`);
        targetLead.status = 'sent';
        targetLead.sent_date = new Date().toISOString().split('T')[0];
        targetLead.response_status = 'Delivered via Resend';
      } else {
        const errText = await res.text();
        // Resend Sandbox restriction: If unverified custom domain, route preview to verified owner email
        if (res.status === 403 && errText.includes('testing emails')) {
          console.log(`ℹ️ Resend sandbox active (domain anvitam.com pending DNS verification at resend.com/domains).`);
          console.log(`📨 Routing client pitch preview to verified owner inbox: anvitamarchitects@gmail.com...`);
          const fallbackRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: 'Anvitam Outreach Agent <onboarding@resend.dev>',
              to: ['anvitamarchitects@gmail.com'],
              subject: `[Client Pitch Preview for ${targetLead.name}] Ecological architecture for ${targetLead.company}`,
              html: `
                <div style="background: #fdf8e6; padding: 12px 16px; border-left: 4px solid #f59e0b; margin-bottom: 20px; font-family: sans-serif;">
                  <strong>⚠️ Resend Sandbox Delivery:</strong> This pitch was prepared for <strong>${targetLead.name}</strong> (&lt;${targetLead.email}&gt;).<br/>
                  To enable direct autonomous dispatch to client inboxes, verify <code>anvitam.com</code> at <a href="https://resend.com/domains">resend.com/domains</a>.<br/>
                  In the meantime, you can forward this email directly or click <strong>"Open in Gmail"</strong> from your Anvitam Admin dashboard!
                </div>
                ${emailHtml}
              `,
            }),
          });
          if (fallbackRes.ok) {
            console.log(`✅ Pitch successfully delivered to anvitamarchitects@gmail.com!`);
            targetLead.status = 'sent';
            targetLead.sent_date = new Date().toISOString().split('T')[0];
            targetLead.response_status = 'Delivered to Owner Inbox (Sandbox)';
          } else {
            console.warn(`⚠️ Sandbox dispatch failed: ${await fallbackRes.text()}`);
            targetLead.status = 'queued';
          }
        } else {
          console.warn(`⚠️ Resend response ${res.status}: ${errText}`);
          targetLead.status = 'queued';
        }
      }
    } catch (e: any) {
      console.error(`❌ Dispatch error: ${e.message}`);
    }
  }

  writeFileSync(leadsPath, JSON.stringify(leads, null, 2), 'utf8');
  console.log(`\n💾 Saved updated outreach pipeline to tools/outreach/client_leads.json`);
}

main().catch(console.error);
