import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDbConfigured, getCollection, getDoc, upsertDoc, deleteDoc } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { DIGITAL_PRODUCTS } from '../constants.js';

const ALL_MOCK_PRODUCTS = [
  ...DIGITAL_PRODUCTS,
  {
    id: 'c1', title: 'Farm Retreat Design Masterclass',
    description: 'A comprehensive online course covering site analysis, bioclimatic design, permaculture zoning, and how to create profitable eco-retreat experiences from scratch.',
    price: '₹3,999', link: 'https://topmate.io/archanagavas',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
    tags: ['Architecture', 'Permaculture', 'Business'], category: 'Online Courses'
  },
  {
    id: 'c2', title: 'Food Forest Design Blueprint',
    description: 'Design productive food forests and edible gardens using proven permaculture techniques.',
    price: '₹2,499', link: 'https://topmate.io/archanagavas',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
    tags: ['Food Forest', 'Landscape', 'Sustainability'], category: 'Online Courses'
  },
  {
    id: 'c3', title: 'Airbnb & Homestay Design for Revenue',
    description: 'Learn how to design and position your Airbnb for maximum occupancy.',
    price: '₹1,999', link: 'https://topmate.io/archanagavas',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    tags: ['Airbnb', 'Interior', 'Hospitality'], category: 'Online Courses'
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) ||
    (lastPart && lastPart !== 'products' && lastPart !== 'products.ts' && lastPart !== 'products.js' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const p = ALL_MOCK_PRODUCTS.find(p => p.id === id);
        if (!p) return res.status(404).json({ error: 'Product not found' });
        return res.status(200).json(p);
      }
      return res.status(200).json(ALL_MOCK_PRODUCTS);
    }
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
    try {
      if (id) {
        const row = await getDoc('digital_products', id);
        if (!row) {
          const fallback = ALL_MOCK_PRODUCTS.find(p => p.id === id);
          if (fallback) { res.setHeader('x-db-fallback', 'true'); return res.status(200).json(fallback); }
          return res.status(404).json({ error: 'Product not found' });
        }
        return res.status(200).json(normalizeProduct(row));
      }
      const rows = await getCollection('digital_products', 'desc');
      return res.status(200).json(rows.map(normalizeProduct));
    } catch (err) {
      console.warn('[products API] Firestore error:', err);
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const p = ALL_MOCK_PRODUCTS.find(p => p.id === id);
        return p ? res.status(200).json(p) : res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json(ALL_MOCK_PRODUCTS);
    }
  }

  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const b = req.body ?? {};
    const targetId = id || b.id;
    if (!targetId) return res.status(400).json({ error: 'Missing product ID' });
    try {
      await upsertDoc('digital_products', targetId, buildProductDoc(b, targetId));
    } catch (err) { console.warn('[products API] upsert failed:', err); }
    return res.status(201).json({ success: true });
  }

  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'Missing product ID' });
    try {
      await upsertDoc('digital_products', id, buildProductDoc(req.body ?? {}, id));
    } catch (err) { console.warn('[products API] update failed:', err); }
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing product ID' });
    try { await deleteDoc('digital_products', id); } catch (err) { console.warn('[products API] delete failed:', err); }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function buildProductDoc(b: any, id: string) {
  return {
    id, title: b.title || '', description: b.description || '',
    price: b.price || '', link: b.link || '', image: b.image || '',
    tags: b.tags || [], category: b.category || 'E-Books',
    youtubeUrl: b.youtubeUrl || b.youtube_url || '',
    videos: b.videos || [],
    metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || '',
    metaKeywords: b.metaKeywords || '',
    metaRobots: b.metaRobots?.trim() ? b.metaRobots : 'index, follow',
  };
}

function normalizeProduct(r: any) {
  return {
    id: r.id, title: r.title, description: r.description || '',
    price: r.price || '', link: r.link || '', image: r.image || '',
    tags: r.tags || [], category: r.category || 'E-Books',
    youtubeUrl: r.youtubeUrl || r.youtube_url || '',
    videos: r.videos || [],
    metaTitle: r.metaTitle || r.meta_title || '',
    metaDescription: r.metaDescription || r.meta_description || '',
    metaKeywords: r.metaKeywords || r.meta_keywords || '',
    metaRobots: r.metaRobots || r.meta_robots || '',
  };
}
