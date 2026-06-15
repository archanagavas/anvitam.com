/**
 * api/projects/index.ts
 * GET  /api/projects    — list all projects (public)
 * POST /api/projects    — create project (admin, JWT required)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { verifyAdminToken, extractToken } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql`
      SELECT id, title, slug, category, location, year, image, hero_image, description,
             full_description, gallery, specs, story, is_featured, tags, faqs, videos, created_at
      FROM projects ORDER BY created_at DESC
    `;
    const projects = rows.map(r => ({
      id: r.id, title: r.title, slug: r.slug || r.id, category: r.category, location: r.location,
      year: r.year, image: r.image, heroImage: r.hero_image || '', description: r.description,
      fullDescription: r.full_description || '', gallery: r.gallery ?? [],
      specs: r.specs ?? [], story: r.story ?? [], isFeatured: r.is_featured,
      tags: r.tags ?? [], faqs: r.faqs ?? [], videos: r.videos ?? []
    }));
    return res.status(200).json(projects);
  }
 
  if (req.method === 'POST') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id, title, slug, category, location, year, image, heroImage, description,
            fullDescription, gallery, specs, story, isFeatured, tags, faqs, videos } = req.body ?? {};
    await sql`
      INSERT INTO projects (id, title, slug, category, location, year, image, hero_image, description,
                            full_description, gallery, specs, story, is_featured, tags, faqs, videos)
      VALUES (${id}, ${title}, ${slug ?? ''}, ${category ?? ''}, ${location ?? ''}, ${year ?? ''},
              ${image ?? ''}, ${heroImage ?? ''}, ${description ?? ''}, ${fullDescription ?? null},
              ${JSON.stringify(gallery ?? [])}, ${JSON.stringify(specs ?? [])},
              ${JSON.stringify(story ?? [])}, ${isFeatured ?? false},
              ${JSON.stringify(tags ?? [])}, ${JSON.stringify(faqs ?? [])},
              ${JSON.stringify(videos ?? [])})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, slug = EXCLUDED.slug, category = EXCLUDED.category, location = EXCLUDED.location,
        year = EXCLUDED.year, image = EXCLUDED.image, hero_image = EXCLUDED.hero_image, description = EXCLUDED.description,
        full_description = EXCLUDED.full_description, gallery = EXCLUDED.gallery,
        specs = EXCLUDED.specs, story = EXCLUDED.story, is_featured = EXCLUDED.is_featured,
        tags = EXCLUDED.tags, faqs = EXCLUDED.faqs, videos = EXCLUDED.videos
    `;
    return res.status(201).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
