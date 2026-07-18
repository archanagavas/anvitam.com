import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const blogs = await sql`SELECT id, title, slug, status FROM blogs`;
    return res.status(200).json({
      success: true,
      blogsCount: blogs.length,
      blogs: blogs.map(b => ({ id: b.id, title: b.title, slug: b.slug, status: b.status })),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || err.toString(),
      stack: err.stack,
    });
  }
}
