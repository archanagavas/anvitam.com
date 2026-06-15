import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';
import { verifyAdminToken, extractToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || (lastPart !== 'services' ? lastPart : undefined);

  if (req.method === 'GET') {
    if (id) {
      const rows = await sql`
        SELECT id, title, description, icon, value_props, hero_image, what_it_is,
               who_its_for, case_study_id, case_study_ids, process, pricing, faq, booking_link, gallery, videos, created_at
        FROM services WHERE id = ${id}
      `;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }
      const r = rows[0];
      return res.status(200).json({
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
      });
    }

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

  // Admin verification for mutate methods
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { id: bodyId, title, description, icon, valueProps, heroImage, whatItIs,
            whoItsFor, caseStudyId, caseStudyIds, process, pricing, faq, bookingLink, gallery, videos } = req.body ?? {};
    const targetId = id || bodyId;
    if (!targetId) {
      return res.status(400).json({ error: 'Missing service ID' });
    }

    await sql`
      INSERT INTO services (id, title, description, icon, value_props, hero_image, what_it_is,
                            who_its_for, case_study_id, case_study_ids, process, pricing, faq, booking_link, gallery, videos)
      VALUES (${targetId}, ${title}, ${description ?? ''}, ${icon ?? 'PenTool'}, ${JSON.stringify(valueProps ?? [])},
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

  if (req.method === 'PUT') {
    if (!id) {
      return res.status(400).json({ error: 'Missing service ID' });
    }
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
    if (!id) {
      return res.status(400).json({ error: 'Missing service ID' });
    }
    await sql`DELETE FROM services WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
