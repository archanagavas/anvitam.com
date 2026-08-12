import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDbConfigured, getCollection, getDoc, findWhere, upsertDoc, deleteDoc } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';
import { INITIAL_BLOGS } from '../constants.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlParts = (req.url || '').split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const id = (req.query.id as string | undefined) ||
    (lastPart && lastPart !== 'blogs' && lastPart !== 'blogs.ts' && lastPart !== 'blogs.js' ? lastPart : undefined);

  if (!isDbConfigured) {
    if (req.method === 'GET') {
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const blog = INITIAL_BLOGS.find(b => b.id === id || b.slug === id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        return res.status(200).json(blog);
      }
      return res.status(200).json(INITIAL_BLOGS);
    }
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
    try {
      if (id) {
        // Try by document ID first, then by slug field
        let row = await getDoc('blogs', id);
        if (!row) {
          const bySlug = await findWhere('blogs', 'slug', id);
          row = bySlug[0] || null;
        }
        if (!row) {
          const fallback = INITIAL_BLOGS.find(b => b.id === id || b.slug === id);
          if (fallback) { res.setHeader('x-db-fallback', 'true'); return res.status(200).json(fallback); }
          return res.status(404).json({ error: 'Blog not found' });
        }
        return res.status(200).json(normalizeBlog(row));
      }
      const rows = await getCollection('blogs', 'desc');
      return res.status(200).json(rows.map(normalizeBlog));
    } catch (err) {
      console.warn('[blogs API] Firestore error, falling back:', err);
      res.setHeader('x-db-fallback', 'true');
      if (id) {
        const blog = INITIAL_BLOGS.find(b => b.id === id || b.slug === id);
        return blog ? res.status(200).json(blog) : res.status(404).json({ error: 'Blog not found' });
      }
      return res.status(200).json(INITIAL_BLOGS);
    }
  }

  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});

  if (req.method === 'POST') {
    const targetId = id || b.id;
    if (!targetId) return res.status(400).json({ error: 'Missing blog ID' });
    try {
      await upsertDoc('blogs', targetId, buildBlogDoc(b, targetId));
      return res.status(201).json({ success: true });
    } catch (err: any) {
      console.error('[blogs API] upsert failed:', err);
      return res.status(500).json({ error: err?.message || 'Database save failed' });
    }
  }

  if (req.method === 'PUT') {
    const targetId = id || b.id;
    if (!targetId) return res.status(400).json({ error: 'Missing blog ID' });
    try {
      await upsertDoc('blogs', targetId, buildBlogDoc(b, targetId));
      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error('[blogs API] update failed:', err);
      return res.status(500).json({ error: err?.message || 'Database update failed' });
    }
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing blog ID' });
    try {
      await deleteDoc('blogs', id);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error('[blogs API] delete failed:', err);
      return res.status(500).json({ error: err?.message || 'Database delete failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function buildBlogDoc(b: any, id: string) {
  return {
    id,
    title: b.title || '',
    slug: b.slug || id,
    date: b.date || new Date().toISOString().split('T')[0],
    excerpt: b.excerpt || '',
    content: b.content || '',
    image: b.image || '',
    author: b.author || 'Anvitam Team',
    metaDescription: b.metaDescription || null,
    metaTitle: b.metaTitle || null,
    coverImageAlt: b.coverImageAlt || null,
    faqs: b.faqs || [],
    tags: b.tags || [],
    status: b.status || 'published',
    toc: b.toc || [],
    authorBio: b.authorBio || '',
    authorImage: b.authorImage || '',
    metaKeywords: b.metaKeywords || '',
    metaRobots: b.metaRobots?.trim() ? b.metaRobots : 'index, follow',
  };
}

function normalizeBlog(r: any) {
  return {
    id: r.id, title: r.title, slug: r.slug, date: r.date,
    excerpt: r.excerpt, content: r.content, image: r.image,
    author: r.author,
    metaDescription: r.metaDescription || r.meta_description || '',
    metaTitle: r.metaTitle || r.meta_title || '',
    coverImageAlt: r.coverImageAlt || r.cover_image_alt || '',
    faqs: r.faqs || [], tags: r.tags || [],
    status: r.status || 'published', toc: r.toc || [],
    authorBio: r.authorBio || r.author_bio || '',
    authorImage: r.authorImage || r.author_image || '',
    metaKeywords: r.metaKeywords || r.meta_keywords || '',
    metaRobots: r.metaRobots || r.meta_robots || '',
  };
}
