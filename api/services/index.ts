/**
 * api/services/index.ts
 * GET  /api/services    — list all services (public)
 * POST /api/services    — create service (admin, JWT required)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { verifyAdminToken, extractToken } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql`
      SELECT id, title, description, icon, value_props, hero_image, what_it_is,
             who_its_for, case_study_id, case_study_ids, process, pricing, faq, booking_link, gallery, videos, created_at
      FROM services ORDER BY created_at ASC
    `;
    const services = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      icon: r.icon,
      valueProps: r.value_props ?? [],
      heroImage: r.hero_image || '',
      whatItIs: r.what_it_is ?? [],
      whoItsFor: r.who_its_for ?? [],
      caseStudyId: r.case_study_id || '',
      caseStudyIds: r.case_study_ids ?? [],
      process: r.process ?? [],
      pricing: r.pricing || '',
      faq: r.faq ?? [],
      bookingLink: r.booking_link || '',
      gallery: r.gallery ?? [],
      videos: r.videos ?? []
    }));
    return res.status(200).json(services);
  }
 
  if (req.method === 'POST') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id, title, description, icon, valueProps, heroImage, whatItIs,
            whoItsFor, caseStudyId, caseStudyIds, process, pricing, faq, bookingLink, gallery, videos } = req.body ?? {};
    await sql`
      INSERT INTO services (id, title, description, icon, value_props, hero_image, what_it_is,
                            who_its_for, case_study_id, case_study_ids, process, pricing, faq, booking_link, gallery, videos)
      VALUES (${id}, ${title}, ${description ?? ''}, ${icon ?? 'PenTool'}, ${JSON.stringify(valueProps ?? [])},
              ${heroImage ?? ''}, ${JSON.stringify(whatItIs ?? [])}, ${JSON.stringify(whoItsFor ?? [])},
              ${caseStudyId ?? ''}, ${JSON.stringify(caseStudyIds ?? [])}, ${JSON.stringify(process ?? [])}, ${pricing ?? ''},
              ${JSON.stringify(faq ?? [])}, ${bookingLink ?? ''}, ${JSON.stringify(gallery ?? [])}, ${JSON.stringify(videos ?? [])})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, icon = EXCLUDED.icon,
        value_props = EXCLUDED.value_props, hero_image = EXCLUDED.hero_image, what_it_is = EXCLUDED.what_it_is,
        who_its_for = EXCLUDED.who_its_for, case_study_id = EXCLUDED.case_study_id, case_study_ids = EXCLUDED.case_study_ids,
        process = EXCLUDED.process, pricing = EXCLUDED.pricing, faq = EXCLUDED.faq, booking_link = EXCLUDED.booking_link, gallery = EXCLUDED.gallery, videos = EXCLUDED.videos
    `;
    return res.status(201).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
