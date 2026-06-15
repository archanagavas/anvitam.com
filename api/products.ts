import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';
import { verifyAdminToken, extractToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || (lastPart !== 'products' ? lastPart : undefined);

  if (req.method === 'GET') {
    if (id) {
      const rows = await sql`
        SELECT id, title, description, price, link, image, tags, category, created_at
        FROM digital_products WHERE id = ${id}
      `;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const r = rows[0];
      return res.status(200).json({
        id: r.id,
        title: r.title,
        description: r.description || '',
        price: r.price || '',
        link: r.link || '',
        image: r.image || '',
        tags: r.tags ?? [],
        category: r.category || 'E-Books'
      });
    }

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

  // Admin verification for mutate methods
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { id: bodyId, title, description, price, link, image, tags, category } = req.body ?? {};
    const targetId = id || bodyId;
    if (!targetId) {
      return res.status(400).json({ error: 'Missing product ID' });
    }

    await sql`
      INSERT INTO digital_products (id, title, description, price, link, image, tags, category)
      VALUES (${targetId}, ${title}, ${description ?? ''}, ${price ?? ''}, ${link ?? ''}, ${image ?? ''}, ${JSON.stringify(tags ?? [])}, ${category ?? 'E-Books'})
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

  if (req.method === 'PUT') {
    if (!id) {
      return res.status(400).json({ error: 'Missing product ID' });
    }
    const { title, description, price, link, image, tags, category } = req.body ?? {};

    await sql`
      UPDATE digital_products SET
        title = ${title},
        description = ${description ?? ''},
        price = ${price ?? ''},
        link = ${link ?? ''},
        image = ${image ?? ''},
        tags = ${JSON.stringify(tags ?? [])},
        category = ${category ?? 'E-Books'}
      WHERE id = ${id}
    `;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'Missing product ID' });
    }
    await sql`DELETE FROM digital_products WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
