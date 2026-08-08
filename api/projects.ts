import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_PROJECTS } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || 
             (lastPart && lastPart !== 'projects' && lastPart !== 'projects.ts' && lastPart !== 'projects.js' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      res.setHeader('x-db-fallback', 'true');
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
                 full_description, gallery, specs, story, is_featured, tags, faqs, videos, status, created_at,
                 meta_title, meta_description, meta_keywords, meta_robots
          FROM projects WHERE id = ${id} OR slug = ${id}
        `;
        if (rows.length === 0) {
          const mockProj = INITIAL_PROJECTS.find(p => p.id === id || p.slug === id);
          if (mockProj) {
            res.setHeader('x-db-fallback', 'true');
            return res.status(200).json(mockProj);
          }
          return res.status(404).json({ error: 'Project not found' });
        }
        const r = rows[0];
        return res.status(200).json({
          id: r.id, title: r.title, slug: r.slug || r.id, category: r.category, location: r.location,
          year: r.year, image: r.image, heroImage: r.hero_image || '', description: r.description,
          fullDescription: r.full_description || '', 
          gallery: typeof r.gallery === 'string' ? JSON.parse(r.gallery) : r.gallery ?? [],
          specs: typeof r.specs === 'string' ? JSON.parse(r.specs) : r.specs ?? [], 
          story: typeof r.story === 'string' ? JSON.parse(r.story) : r.story ?? [], 
          isFeatured: r.is_featured,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags ?? [], 
          faqs: typeof r.faqs === 'string' ? JSON.parse(r.faqs) : r.faqs ?? [], 
          videos: typeof r.videos === 'string' ? JSON.parse(r.videos) : r.videos ?? [], 
          status: r.status || '',
          metaTitle: r.meta_title || '', metaDescription: r.meta_description || '',
          metaKeywords: r.meta_keywords || '', metaRobots: r.meta_robots || ''
        });
      }

      const rows = await sql`
        SELECT id, title, slug, category, location, year, image, hero_image, description,
               full_description, gallery, specs, story, is_featured, tags, faqs, videos, status, created_at,
               meta_title, meta_description, meta_keywords, meta_robots
        FROM projects ORDER BY created_at DESC
      `;
      const projects = rows.map(r => ({
        id: r.id, title: r.title, slug: r.slug || r.id, category: r.category, location: r.location,
        year: r.year, image: r.image, heroImage: r.hero_image || '', description: r.description,
        fullDescription: r.full_description || '', 
        gallery: typeof r.gallery === 'string' ? JSON.parse(r.gallery) : r.gallery ?? [],
        specs: typeof r.specs === 'string' ? JSON.parse(r.specs) : r.specs ?? [], 
        story: typeof r.story === 'string' ? JSON.parse(r.story) : r.story ?? [], 
        isFeatured: r.is_featured,
        tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags ?? [], 
        faqs: typeof r.faqs === 'string' ? JSON.parse(r.faqs) : r.faqs ?? [], 
        videos: typeof r.videos === 'string' ? JSON.parse(r.videos) : r.videos ?? [], 
        status: r.status || '',
        metaTitle: r.meta_title || '', metaDescription: r.meta_description || '',
        metaKeywords: r.meta_keywords || '', metaRobots: r.meta_robots || ''
      }));
      return res.status(200).json(projects);
    } catch (dbError) {
      console.warn('[projects API] Database query failed, falling back to static constants:', dbError);
      res.setHeader('x-db-fallback', 'true');
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
            fullDescription, gallery, specs, story, isFeatured, tags, faqs, videos, status,
            metaTitle, metaDescription, metaKeywords, metaRobots } = req.body ?? {};
    const targetId = id || bodyId;
    if (!targetId) {
      return res.status(400).json({ error: 'Missing project ID' });
    }

    try {
      await sql`
        INSERT INTO projects (id, title, slug, category, location, year, image, hero_image, description,
                              full_description, gallery, specs, story, is_featured, tags, faqs, videos, status,
                              meta_title, meta_description, meta_keywords, meta_robots)
        VALUES (${targetId}, ${title}, ${slug ?? ''}, ${category ?? ''}, ${location ?? ''}, ${year ?? ''},
                ${image ?? ''}, ${heroImage ?? ''}, ${description ?? ''}, ${fullDescription ?? null},
                ${JSON.stringify(gallery ?? [])}, ${JSON.stringify(specs ?? [])},
                ${JSON.stringify(story ?? [])}, ${isFeatured ?? false},
                ${JSON.stringify(tags ?? [])}, ${JSON.stringify(faqs ?? [])},
                ${JSON.stringify(videos ?? [])}, ${status ?? null},
                ${metaTitle ?? null}, ${metaDescription ?? null}, ${metaKeywords ?? null}, ${metaRobots && metaRobots.trim() ? metaRobots : 'index, follow'})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title, slug = EXCLUDED.slug, category = EXCLUDED.category, location = EXCLUDED.location,
          year = EXCLUDED.year, image = EXCLUDED.image, hero_image = EXCLUDED.hero_image, description = EXCLUDED.description,
          full_description = EXCLUDED.full_description, gallery = EXCLUDED.gallery,
          specs = EXCLUDED.specs, story = EXCLUDED.story, is_featured = EXCLUDED.is_featured,
          tags = EXCLUDED.tags, faqs = EXCLUDED.faqs, videos = EXCLUDED.videos, status = EXCLUDED.status,
          meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description,
          meta_keywords = EXCLUDED.meta_keywords, meta_robots = EXCLUDED.meta_robots
      `;
    } catch (err) {
      console.warn('[projects API] Failed to insert/update project in DB:', err);
    }
    return res.status(201).json({ success: true });
  }

  if (req.method === 'PUT') {
    if (!id) {
      return res.status(400).json({ error: 'Missing project ID' });
    }
    const { title, slug, category, location, year, image, heroImage, description,
            fullDescription, gallery, specs, story, isFeatured, tags, faqs, videos, status,
            metaTitle, metaDescription, metaKeywords, metaRobots } = req.body ?? {};

    try {
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
          videos = ${JSON.stringify(videos ?? [])},
          status = ${status ?? null},
          meta_title = ${metaTitle ?? null},
          meta_description = ${metaDescription ?? null},
          meta_keywords = ${metaKeywords ?? null},
          meta_robots = ${metaRobots && metaRobots.trim() ? metaRobots : 'index, follow'}
        WHERE id = ${id}
      `;
    } catch (err) {
      console.warn(`[projects API] Failed to update project ${id} in DB:`, err);
    }
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'Missing project ID' });
    }
    try {
      await sql`DELETE FROM projects WHERE id = ${id}`;
    } catch (err) {
      console.warn(`[projects API] Failed to delete project ${id} from DB:`, err);
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
