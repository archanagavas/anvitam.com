/**
 * api/blogs/index.ts
 * GET  /api/blogs        — list all published blogs (public)
 * POST /api/blogs        — create blog (admin, JWT required)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { verifyAdminToken, extractToken } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql`
      SELECT id, title, slug, date, excerpt, content, image, author,
             meta_description, meta_title, cover_image_alt, faqs, tags, status, toc, author_bio, author_image, created_at
      FROM blogs ORDER BY created_at DESC
    `;
    const blogs = rows.map(r => ({
      id: r.id, title: r.title, slug: r.slug, date: r.date,
      excerpt: r.excerpt, content: r.content, image: r.image,
      author: r.author, metaDescription: r.meta_description,
      metaTitle: r.meta_title, coverImageAlt: r.cover_image_alt,
      faqs: r.faqs ?? [],
      tags: r.tags ?? [], status: r.status, toc: r.toc ?? [],
      authorBio: r.author_bio || '',
      authorImage: r.author_image || '',
    }));
    return res.status(200).json(blogs);
  }

  if (req.method === 'POST') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id, title, slug, date, excerpt, content, image, author,
            metaDescription, metaTitle, coverImageAlt, faqs, tags, status, toc, authorBio, authorImage } = req.body ?? {};

    await sql`
      INSERT INTO blogs (id, title, slug, date, excerpt, content, image, author,
                         meta_description, meta_title, cover_image_alt, faqs, tags, status, toc, author_bio, author_image)
      VALUES (${id}, ${title}, ${slug}, ${date}, ${excerpt}, ${content},
              ${image}, ${author ?? 'Anvitam Team'}, ${metaDescription ?? null},
              ${metaTitle ?? null}, ${coverImageAlt ?? null}, ${JSON.stringify(faqs ?? [])},
              ${JSON.stringify(tags ?? [])}, ${status ?? 'draft'}, ${JSON.stringify(toc ?? [])}, ${authorBio ?? null}, ${authorImage ?? null})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, slug = EXCLUDED.slug, date = EXCLUDED.date,
        excerpt = EXCLUDED.excerpt, content = EXCLUDED.content, image = EXCLUDED.image,
        author = EXCLUDED.author, meta_description = EXCLUDED.meta_description,
        meta_title = EXCLUDED.meta_title, cover_image_alt = EXCLUDED.cover_image_alt,
        faqs = EXCLUDED.faqs,
        tags = EXCLUDED.tags, status = EXCLUDED.status, toc = EXCLUDED.toc,
        author_bio = EXCLUDED.author_bio, author_image = EXCLUDED.author_image
    `;
    return res.status(201).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
