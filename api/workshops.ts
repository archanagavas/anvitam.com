import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_WORKSHOPS } from '../constants.js';

function formatWorkshopRow(row: any) {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization || '',
    location: row.location || '',
    city: row.city || '',
    state: row.state || '',
    country: row.country || '',
    date: row.date || '',
    category: row.category || 'School',
    description: row.description || '',
    attendeesCount: row.attendees_count || '',
    offerings: typeof row.offerings === 'string' ? JSON.parse(row.offerings) : row.offerings || [],
    skillsOutcomes: row.skills_outcomes || '',
    materialsUsed: row.materials_used || '',
    impact: row.impact || '',
    outcomes: row.outcomes || '',
    faqs: typeof row.faqs === 'string' ? JSON.parse(row.faqs) : row.faqs || [],
    images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images || [],
    galleryDetails: typeof row.gallery_details === 'string' ? JSON.parse(row.gallery_details) : row.gallery_details || [],
    relatedProjectIds: typeof row.related_project_ids === 'string' ? JSON.parse(row.related_project_ids) : row.related_project_ids || [],
    relatedServiceIds: typeof row.related_service_ids === 'string' ? JSON.parse(row.related_service_ids) : row.related_service_ids || [],
    relatedArticleIds: typeof row.related_article_ids === 'string' ? JSON.parse(row.related_article_ids) : row.related_article_ids || [],
    slug: row.slug || '',
    metaTitle: row.meta_title || '',
    metaDescription: row.meta_description || '',
    primaryKeyword: row.primary_keyword || '',
    secondaryKeywords: row.secondary_keywords || '',
    canonicalUrl: row.canonical_url || '',
    ogTitle: row.og_title || '',
    ogDescription: row.og_description || '',
    ogImage: row.og_image || '',
    status: row.status || 'published',
    createdAt: row.created_at
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || 
             (lastPart && lastPart !== 'workshops' && lastPart !== 'workshops.ts' && lastPart !== 'workshops.js' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const item = INITIAL_WORKSHOPS.find(i => i.id === id);
        if (!item) return res.status(404).json({ error: 'Workshop not found' });
        return res.status(200).json(item);
      }
      return res.status(200).json(INITIAL_WORKSHOPS);
    }
    return res.status(503).json({ error: 'Database connection not configured' });
  }

  if (req.method === 'GET') {
    try {
      if (id) {
        const rows = await sql`SELECT * FROM workshops WHERE id = ${id}`;
        if (rows.length === 0) {
          const mockItem = INITIAL_WORKSHOPS.find(i => i.id === id);
          if (mockItem) {
            res.setHeader('x-db-fallback', 'true');
            return res.status(200).json(mockItem);
          }
          return res.status(404).json({ error: 'Workshop not found' });
        }
        return res.status(200).json(formatWorkshopRow(rows[0]));
      }
      const rows = await sql`SELECT * FROM workshops ORDER BY created_at DESC`;
      if (rows.length === 0) {
        return res.status(200).json(INITIAL_WORKSHOPS);
      }
      return res.status(200).json(rows.map(formatWorkshopRow));
    } catch (dbError) {
      console.warn('[workshops API] Database query failed, falling back to static constants:', dbError);
      res.setHeader('x-db-fallback', 'true');
      return res.status(200).json(INITIAL_WORKSHOPS);
    }
  }

  // Admin verification for mutate methods
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const b = req.body ?? {};
    const targetId = id || b.id || `workshop-${Date.now()}`;

    await sql`
      INSERT INTO workshops (
        id, title, organization, location, city, state, country, date, category, description,
        attendees_count, offerings, skills_outcomes, materials_used, impact, outcomes, images,
        gallery_details, related_project_ids, related_service_ids, related_article_ids, slug,
        meta_title, meta_description, primary_keyword, secondary_keywords, canonical_url,
        og_title, og_description, og_image, status
      )
      VALUES (
        ${targetId}, ${b.title}, ${b.organization || ''}, ${b.location || ''}, ${b.city || ''}, ${b.state || ''}, ${b.country || ''},
        ${b.date || ''}, ${b.category || 'School'}, ${b.description || ''}, ${b.attendeesCount || ''},
        ${JSON.stringify(b.offerings || [])}, ${b.skillsOutcomes || ''}, ${b.materialsUsed || ''}, ${b.impact || ''}, ${b.outcomes || ''},
        ${JSON.stringify(b.images || [])}, ${JSON.stringify(b.galleryDetails || [])},
        ${JSON.stringify(b.relatedProjectIds || [])}, ${JSON.stringify(b.relatedServiceIds || [])}, ${JSON.stringify(b.relatedArticleIds || [])},
        ${b.slug || ''}, ${b.metaTitle || ''}, ${b.metaDescription || ''}, ${b.primaryKeyword || ''}, ${b.secondaryKeywords || ''}, ${b.canonicalUrl || ''},
        ${b.ogTitle || ''}, ${b.ogDescription || ''}, ${b.ogImage || ''}, ${b.status || 'published'}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        organization = EXCLUDED.organization,
        location = EXCLUDED.location,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        country = EXCLUDED.country,
        date = EXCLUDED.date,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        attendees_count = EXCLUDED.attendees_count,
        offerings = EXCLUDED.offerings,
        skills_outcomes = EXCLUDED.skills_outcomes,
        materials_used = EXCLUDED.materials_used,
        impact = EXCLUDED.impact,
        outcomes = EXCLUDED.outcomes,
        images = EXCLUDED.images,
        gallery_details = EXCLUDED.gallery_details,
        related_project_ids = EXCLUDED.related_project_ids,
        related_service_ids = EXCLUDED.related_service_ids,
        related_article_ids = EXCLUDED.related_article_ids,
        slug = EXCLUDED.slug,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        primary_keyword = EXCLUDED.primary_keyword,
        secondary_keywords = EXCLUDED.secondary_keywords,
        canonical_url = EXCLUDED.canonical_url,
        og_title = EXCLUDED.og_title,
        og_description = EXCLUDED.og_description,
        og_image = EXCLUDED.og_image,
        status = EXCLUDED.status
    `;
    return res.status(201).json({ success: true, id: targetId });
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing workshop ID' });
    const b = req.body ?? {};
    const targetId = id || b.id;
    await sql`
      INSERT INTO workshops (
        id, title, organization, location, city, state, country, date, category, description,
        attendees_count, offerings, skills_outcomes, materials_used, impact, outcomes, images,
        gallery_details, related_project_ids, related_service_ids, related_article_ids, slug,
        meta_title, meta_description, primary_keyword, secondary_keywords, canonical_url,
        og_title, og_description, og_image, status
      )
      VALUES (
        ${targetId}, ${b.title}, ${b.organization || ''}, ${b.location || ''}, ${b.city || ''}, ${b.state || ''}, ${b.country || ''},
        ${b.date || ''}, ${b.category || 'School'}, ${b.description || ''}, ${b.attendeesCount || ''},
        ${JSON.stringify(b.offerings || [])}, ${b.skillsOutcomes || ''}, ${b.materialsUsed || ''}, ${b.impact || ''}, ${b.outcomes || ''},
        ${JSON.stringify(b.images || [])}, ${JSON.stringify(b.galleryDetails || [])},
        ${JSON.stringify(b.relatedProjectIds || [])}, ${JSON.stringify(b.relatedServiceIds || [])}, ${JSON.stringify(b.relatedArticleIds || [])},
        ${b.slug || ''}, ${b.metaTitle || ''}, ${b.metaDescription || ''}, ${b.primaryKeyword || ''}, ${b.secondaryKeywords || ''}, ${b.canonicalUrl || ''},
        ${b.ogTitle || ''}, ${b.ogDescription || ''}, ${b.ogImage || ''}, ${b.status || 'published'}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        organization = EXCLUDED.organization,
        location = EXCLUDED.location,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        country = EXCLUDED.country,
        date = EXCLUDED.date,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        attendees_count = EXCLUDED.attendees_count,
        offerings = EXCLUDED.offerings,
        skills_outcomes = EXCLUDED.skills_outcomes,
        materials_used = EXCLUDED.materials_used,
        impact = EXCLUDED.impact,
        outcomes = EXCLUDED.outcomes,
        images = EXCLUDED.images,
        gallery_details = EXCLUDED.gallery_details,
        related_project_ids = EXCLUDED.related_project_ids,
        related_service_ids = EXCLUDED.related_service_ids,
        related_article_ids = EXCLUDED.related_article_ids,
        slug = EXCLUDED.slug,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        primary_keyword = EXCLUDED.primary_keyword,
        secondary_keywords = EXCLUDED.secondary_keywords,
        canonical_url = EXCLUDED.canonical_url,
        og_title = EXCLUDED.og_title,
        og_description = EXCLUDED.og_description,
        og_image = EXCLUDED.og_image,
        status = EXCLUDED.status
    `;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing workshop ID' });
    await sql`DELETE FROM workshops WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
