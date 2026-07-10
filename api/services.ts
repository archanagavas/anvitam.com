import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { SERVICES } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || (lastPart !== 'services' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      if (id) {
        const service = SERVICES.find(s => s.id === id);
        if (!service) return res.status(404).json({ error: 'Service not found' });
        return res.status(200).json(service);
      }
      return res.status(200).json(SERVICES);
    }
    return res.status(503).json({ error: 'Database connection not configured' });
  }

  if (req.method === 'GET') {
    try {
      if (id) {
        const rows = await sql`
          SELECT id, title, description, icon, value_props, hero_image, what_it_is,
                 who_its_for, case_study_id, case_study_ids, process, pricing, faq, booking_link, gallery, videos, created_at,
                 meta_title, meta_description, meta_keywords, meta_robots
          FROM services WHERE id = ${id}
        `;
        if (rows.length === 0) {
          const mockSvc = SERVICES.find(s => s.id === id);
          if (mockSvc) return res.status(200).json(mockSvc);
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
          videos: r.videos ?? [],
          metaTitle: r.meta_title || '',
          metaDescription: r.meta_description || '',
          metaKeywords: r.meta_keywords || '',
          metaRobots: r.meta_robots || ''
        });
      }

      const rows = await sql`
        SELECT id, title, description, icon, value_props, hero_image, what_it_is,
               who_its_for, case_study_id, case_study_ids, process, pricing, faq, booking_link, gallery, videos, created_at,
               meta_title, meta_description, meta_keywords, meta_robots
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
        videos: r.videos ?? [],
        metaTitle: r.meta_title || '',
        metaDescription: r.meta_description || '',
        metaKeywords: r.meta_keywords || '',
        metaRobots: r.meta_robots || ''
      }));
      return res.status(200).json(services);
    } catch (dbError) {
      console.warn('[services API] Database query failed, falling back to static constants:', dbError);
      if (id) {
        const service = SERVICES.find(s => s.id === id);
        if (!service) return res.status(404).json({ error: 'Service not found' });
        return res.status(200).json(service);
      }
      return res.status(200).json(SERVICES);
    }
  }

  // Admin verification for mutate methods
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { id: bodyId, title, description, icon, valueProps, heroImage, whatItIs,
            whoItsFor, caseStudyId, caseStudyIds, process, pricing, faq, bookingLink, gallery, videos,
            metaTitle, metaDescription, metaKeywords, metaRobots } = req.body ?? {};
    const targetId = id || bodyId;
    if (!targetId) {
      return res.status(400).json({ error: 'Missing service ID' });
    }

    await sql`
      INSERT INTO services (id, title, description, icon, value_props, hero_image, what_it_is,
                            who_its_for, case_study_id, case_study_ids, process, pricing, faq, booking_link, gallery, videos,
                            meta_title, meta_description, meta_keywords, meta_robots)
      VALUES (${targetId}, ${title}, ${description ?? ''}, ${icon ?? 'PenTool'}, ${JSON.stringify(valueProps ?? [])},
              ${heroImage ?? ''}, ${JSON.stringify(whatItIs ?? [])}, ${JSON.stringify(whoItsFor ?? [])},
              ${caseStudyId ?? ''}, ${JSON.stringify(caseStudyIds ?? [])}, ${JSON.stringify(process ?? [])}, ${pricing ?? ''},
              ${JSON.stringify(faq ?? [])}, ${bookingLink ?? ''}, ${JSON.stringify(gallery ?? [])}, ${JSON.stringify(videos ?? [])},
              ${metaTitle ?? null}, ${metaDescription ?? null}, ${metaKeywords ?? null}, ${metaRobots ?? null})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, icon = EXCLUDED.icon,
        value_props = EXCLUDED.value_props, hero_image = EXCLUDED.hero_image, what_it_is = EXCLUDED.what_it_is,
        who_its_for = EXCLUDED.who_its_for, case_study_id = EXCLUDED.case_study_id, case_study_ids = EXCLUDED.case_study_ids,
        process = EXCLUDED.process, pricing = EXCLUDED.pricing, faq = EXCLUDED.faq, booking_link = EXCLUDED.booking_link, gallery = EXCLUDED.gallery, videos = EXCLUDED.videos,
        meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description, meta_keywords = EXCLUDED.meta_keywords, meta_robots = EXCLUDED.meta_robots
    `;
    return res.status(201).json({ success: true });
  }

  if (req.method === 'PUT') {
    if (!id) {
      return res.status(400).json({ error: 'Missing service ID' });
    }
    const { title, description, icon, valueProps, heroImage, whatItIs,
            whoItsFor, caseStudyId, caseStudyIds, process, pricing, faq, bookingLink, gallery, videos,
            metaTitle, metaDescription, metaKeywords, metaRobots } = req.body ?? {};

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
        videos = ${JSON.stringify(videos ?? [])},
        meta_title = ${metaTitle ?? null},
        meta_description = ${metaDescription ?? null},
        meta_keywords = ${metaKeywords ?? null},
        meta_robots = ${metaRobots ?? null}
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
