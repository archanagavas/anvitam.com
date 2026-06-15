/**
 * api/products/index.ts
 * GET  /api/products    — list all products (public)
 * POST /api/products    — create/upsert product (admin, JWT required)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { verifyAdminToken, extractToken } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql`
      SELECT id, title, description, price, link, image, tags, category, created_at
      FROM digital_products ORDER BY created_at DESC
    `;
    const products = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      price: r.price || '',
      link: r.link || '',
      image: r.image || '',
      tags: r.tags ?? [],
      category: r.category || 'E-Books'
    }));
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id, title, description, price, link, image, tags, category } = req.body ?? {};
    await sql`
      INSERT INTO digital_products (id, title, description, price, link, image, tags, category)
      VALUES (${id}, ${title}, ${description ?? ''}, ${price ?? ''}, ${link ?? ''}, ${image ?? ''}, ${JSON.stringify(tags ?? [])}, ${category ?? 'E-Books'})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        link = EXCLUDED.link,
        image = EXCLUDED.image,
        tags = EXCLUDED.tags,
        category = EXCLUDED.category
    `;
    return res.status(201).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
