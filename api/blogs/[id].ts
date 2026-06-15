/**
 * api/blogs/[id].ts
 * PUT    /api/blogs/:id   — update blog (admin, JWT required)
 * DELETE /api/blogs/:id   — delete blog (admin, JWT required)
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
    await sql`DELETE FROM blogs WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
