/**
 * api/products/[id].ts
 * PUT    /api/products/:id — update product (admin, JWT required)
 * DELETE /api/products/:id — delete product (admin, JWT required)
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
    await sql`DELETE FROM digital_products WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
