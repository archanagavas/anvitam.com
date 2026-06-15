import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, isDbConfigured } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { DIGITAL_PRODUCTS } from '../constants.js';

const ALL_MOCK_PRODUCTS = [
  ...DIGITAL_PRODUCTS,
  {
    id: 'c1',
    title: 'Farm Retreat Design Masterclass',
    description: 'A comprehensive online course covering site analysis, bioclimatic design, permaculture zoning, and how to create profitable eco-retreat experiences from scratch.',
    price: '₹3,999',
    link: 'https://topmate.io/ar_archana_gavas',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
    tags: ['Architecture', 'Permaculture', 'Business'],
    category: 'Online Courses'
  },
  {
    id: 'c2',
    title: 'Food Forest Design Blueprint',
    description: 'Design productive food forests and edible gardens for farm stays, community spaces, and personal properties using proven permaculture techniques.',
    price: '₹2,499',
    link: 'https://topmate.io/ar_archana_gavas',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
    tags: ['Food Forest', 'Landscape', 'Sustainability'],
    category: 'Online Courses'
  },
  {
    id: 'c3',
    title: 'Airbnb & Homestay Design for Revenue',
    description: 'Learn how to design, style, and position your Airbnb or homestay for maximum occupancy, guest satisfaction, and profitable returns.',
    price: '₹1,999',
    link: 'https://topmate.io/ar_archana_gavas',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    tags: ['Airbnb', 'Interior', 'Hospitality'],
    category: 'Online Courses'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) || (lastPart !== 'products' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      if (id) {
        const prod = ALL_MOCK_PRODUCTS.find(p => p.id === id);
        if (!prod) return res.status(404).json({ error: 'Product not found' });
        return res.status(200).json(prod);
      }
      return res.status(200).json(ALL_MOCK_PRODUCTS);
    }
    return res.status(503).json({ error: 'Database connection not configured' });
  }

  if (req.method === 'GET') {
    try {
      if (id) {
        const rows = await sql`
          SELECT id, title, description, price, link, image, tags, category, created_at
          FROM digital_products WHERE id = ${id}
        `;
        if (rows.length === 0) {
          const mockProd = ALL_MOCK_PRODUCTS.find(p => p.id === id);
          if (mockProd) return res.status(200).json(mockProd);
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
    } catch (dbError) {
      console.warn('[products API] Database query failed, falling back to static constants:', dbError);
      if (id) {
        const prod = ALL_MOCK_PRODUCTS.find(p => p.id === id);
        if (!prod) return res.status(404).json({ error: 'Product not found' });
        return res.status(200).json(prod);
      }
      return res.status(200).json(ALL_MOCK_PRODUCTS);
    }
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
