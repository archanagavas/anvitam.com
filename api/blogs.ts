import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_BLOGS } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || (lastPart !== 'blogs' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      if (id) {
        const blog = INITIAL_BLOGS.find(b => b.id === id || b.slug === id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        return res.status(200).json(blog);
      }
      return res.status(200).json(INITIAL_BLOGS);
    }
    return res.status(503).json({ error: 'Database connection not configured' });
  }

  if (req.method === 'GET') {
    try {
      if (id) {
        const rows = await sql`
          SELECT id, title, slug, date, excerpt, content, image, author,
                 meta_description, meta_title, cover_image_alt, faqs, tags, status, toc, author_bio, author_image, created_at
          FROM blogs WHERE id = ${id}
        `;
        if (rows.length === 0) {
          const mockBlog = INITIAL_BLOGS.find(b => b.id === id || b.slug === id);
          if (mockBlog) return res.status(200).json(mockBlog);
          return res.status(404).json({ error: 'Blog not found' });
        }
        const r = rows[0];
        return res.status(200).json({
          id: r.id, title: r.title, slug: r.slug, date: r.date,
          excerpt: r.excerpt, content: r.content, image: r.image,
          author: r.author, metaDescription: r.meta_description,
          metaTitle: r.meta_title, coverImageAlt: r.cover_image_alt,
          faqs: r.faqs ?? [],
          tags: r.tags ?? [], status: r.status, toc: r.toc ?? [],
          authorBio: r.author_bio || '',
          authorImage: r.author_image || '',
        });
      }

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
    } catch (dbError) {
      console.warn('[blogs API] Database query failed, falling back to static constants:', dbError);
      if (id) {
        const blog = INITIAL_BLOGS.find(b => b.id === id || b.slug === id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        return res.status(200).json(blog);
      }
      return res.status(200).json(INITIAL_BLOGS);
    }
  }

  // Admin verification for mutate methods
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { id: bodyId, title, slug, date, excerpt, content, image, author,
            metaDescription, metaTitle, coverImageAlt, faqs, tags, status, toc, authorBio, authorImage } = req.body ?? {};

    const targetId = id || bodyId;
    if (!targetId) {
      return res.status(400).json({ error: 'Missing blog ID' });
    }

    await sql`
      INSERT INTO blogs (id, title, slug, date, excerpt, content, image, author,
                         meta_description, meta_title, cover_image_alt, faqs, tags, status, toc, author_bio, author_image)
      VALUES (${targetId}, ${title}, ${slug}, ${date}, ${excerpt}, ${content},
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

  if (req.method === 'PUT') {
    if (!id) {
      return res.status(400).json({ error: 'Missing blog ID' });
    }
    const { title, slug, date, excerpt, content, image, author,
            metaDescription, metaTitle, coverImageAlt, faqs, tags, status, toc, authorBio, authorImage } = req.body ?? {};

    await sql`
      UPDATE blogs SET
        title = ${title}, slug = ${slug}, date = ${date}, excerpt = ${excerpt},
        content = ${content}, image = ${image}, author = ${author},
        meta_description = ${metaDescription ?? null},
        meta_title = ${metaTitle ?? null},
        cover_image_alt = ${coverImageAlt ?? null},
        faqs = ${JSON.stringify(faqs ?? [])},
        tags = ${JSON.stringify(tags ?? [])}, status = ${status},
        toc = ${JSON.stringify(toc ?? [])},
        author_bio = ${authorBio ?? null},
        author_image = ${authorImage ?? null}
      WHERE id = ${id}
    `;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'Missing blog ID' });
    }
    await sql`DELETE FROM blogs WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
