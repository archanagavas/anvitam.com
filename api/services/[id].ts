/**
 * api/services/[id].ts
 * PUT    /api/services/:id — update service (admin, JWT required)
 * DELETE /api/services/:id — delete service (admin, JWT required)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { verifyAdminToken, extractToken } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query as { id: string };

  if (req.method === 'PUT') {
    const { title, description, icon, valueProps, heroImage, whatItIs,
            whoItsFor, caseStudyId, caseStudyIds, process, pricing, faq, bookingLink, gallery, videos } = req.body ?? {};
    await sql`
      UPDATE services SET
        title = ${title},
        description = ${description ?? ''},
        icon = ${icon ?? 'PenTool'},
        value_props = ${JSON.stringify(valueProps ?? [])},
        hero_image = ${heroImage ?? ''},
        what_it_is = ${JSON.stringify(whatItIs ?? [])},
        who_its_for = ${JSON.stringify(whoItsFor ?? [])},
        case_study_id = ${caseStudyId ?? ''},
        case_study_ids = ${JSON.stringify(caseStudyIds ?? [])},
        process = ${JSON.stringify(process ?? [])},
        pricing = ${pricing ?? ''},
        faq = ${JSON.stringify(faq ?? [])},
        booking_link = ${bookingLink ?? ''},
        gallery = ${JSON.stringify(gallery ?? [])},
        videos = ${JSON.stringify(videos ?? [])}
      WHERE id = ${id}
    `;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM services WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
