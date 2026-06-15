import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_PROJECTS } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || (lastPart !== 'projects' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      if (id) {
        const project = INITIAL_PROJECTS.find(p => p.id === id || p.slug === id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        return res.status(200).json(project);
      }
      return res.status(200).json(INITIAL_PROJECTS);
    }
    return res.status(503).json({ error: 'Database connection not configured' });
  }

  if (req.method === 'GET') {
    try {
      if (id) {
        const rows = await sql`
          SELECT id, title, slug, category, location, year, image, hero_image, description,
                 full_description, gallery, specs, story, is_featured, tags, faqs, videos, created_at
          FROM projects WHERE id = ${id}
        `;
        if (rows.length === 0) {
          const mockProj = INITIAL_PROJECTS.find(p => p.id === id || p.slug === id);
          if (mockProj) return res.status(200).json(mockProj);
          return res.status(404).json({ error: 'Project not found' });
        }
        const r = rows[0];
        return res.status(200).json({
          id: r.id, title: r.title, slug: r.slug || r.id, category: r.category, location: r.location,
          year: r.year, image: r.image, heroImage: r.hero_image || '', description: r.description,
          fullDescription: r.full_description || '', gallery: r.gallery ?? [],
          specs: r.specs ?? [], story: r.story ?? [], isFeatured: r.is_featured,
          tags: r.tags ?? [], faqs: r.faqs ?? [], videos: r.videos ?? []
        });
      }

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
    } catch (dbError) {
      console.warn('[projects API] Database query failed, falling back to static constants:', dbError);
      if (id) {
        const project = INITIAL_PROJECTS.find(p => p.id === id || p.slug === id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        return res.status(200).json(project);
      }
      return res.status(200).json(INITIAL_PROJECTS);
    }
  }

  // Admin verification for mutate methods
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { id: bodyId, title, slug, category, location, year, image, heroImage, description,
            fullDescription, gallery, specs, story, isFeatured, tags, faqs, videos } = req.body ?? {};
    const targetId = id || bodyId;
    if (!targetId) {
      return res.status(400).json({ error: 'Missing project ID' });
    }

    await sql`
      INSERT INTO projects (id, title, slug, category, location, year, image, hero_image, description,
                            full_description, gallery, specs, story, is_featured, tags, faqs, videos)
      VALUES (${targetId}, ${title}, ${slug ?? ''}, ${category ?? ''}, ${location ?? ''}, ${year ?? ''},
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

  if (req.method === 'PUT') {
    if (!id) {
      return res.status(400).json({ error: 'Missing project ID' });
    }
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
    if (!id) {
      return res.status(400).json({ error: 'Missing project ID' });
    }
    await sql`DELETE FROM projects WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
