/**
 * api/projects/[id].ts
 * DELETE /api/projects/:id — delete project (admin, JWT required)
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
    const { title, slug, category, location, year, image, heroImage, description,
            fullDescription, gallery, specs, story, isFeatured, tags, faqs, videos } = req.body ?? {};
    await sql`
      UPDATE projects SET
        title = ${title}, slug = ${slug ?? ''}, category = ${category ?? ''},
        location = ${location ?? ''}, year = ${year ?? ''}, image = ${image ?? ''},
        hero_image = ${heroImage ?? ''}, description = ${description ?? ''},
        full_description = ${fullDescription ?? null},
        gallery = ${JSON.stringify(gallery ?? [])},
        specs = ${JSON.stringify(specs ?? [])},
        story = ${JSON.stringify(story ?? [])},
        is_featured = ${isFeatured ?? false},
        tags = ${JSON.stringify(tags ?? [])},
        faqs = ${JSON.stringify(faqs ?? [])},
        videos = ${JSON.stringify(videos ?? [])}
      WHERE id = ${id}
    `;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM projects WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
