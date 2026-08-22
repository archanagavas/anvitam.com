import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { signAdminToken, verifyAdminToken, extractToken } from '../lib/auth.js';
import { initDatabase } from '../lib/db.js';

const attempts: Record<string, { count: number; until: number }> = {};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const urlPath = (req.url || '').split('?')[0];
  const queryPath = req.query.path;
  const action = (Array.isArray(queryPath) ? queryPath[0] : queryPath) || urlPath.split('/').pop() || '';

  // 1. Database Initialization
  if (action === 'db-init' || req.url?.includes('db-init')) {
    const force = req.query.force === 'true' || req.body?.force === true;
    if (force && req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Forced reseed requires a POST request to prevent accidental execution.' });
    }
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const secret = (req.query.secret as string) || req.body?.secret;
    if (!process.env.ADMIN_INIT_SECRET || secret !== process.env.ADMIN_INIT_SECRET) {
      return res.status(403).json({ error: 'Forbidden. Provide valid secret parameter.' });
    }
    try {
      const result = await initDatabase(force);
      return res.status(200).json(result);
    } catch (err: any) {
      // Log full details server-side only — never expose internal error messages to clients
      console.error('[db-init] Error:', err);
      return res.status(500).json({ error: 'Database initialization failed. Check server logs.' });
    }
  }

  // 2. Admin Verification (GET)
  if (action === 'verify' || req.method === 'GET') {
    const token = extractToken(req.headers.authorization);
    if (!token) return res.status(401).json({ valid: false, error: 'No token provided.' });

    const payload = verifyAdminToken(token);
    if (!payload) return res.status(401).json({ valid: false, error: 'Invalid or expired token.' });

    if (action === 'tool-users') {
      try {
        const { getCollection } = await import('../lib/db.js');
        const users = await getCollection('tool_users');
        const safeUsers = users.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name || u.email.split('@')[0],
          credits_remaining: u.credits_remaining ?? u.credits ?? 5,
          credits_used: u.credits_used ?? 0,
          is_subscribed: u.is_subscribed ?? false,
          subscription_tier: u.subscription_plan || u.subscription_tier || (u.is_subscribed ? 'pro_monthly' : 'free_trial'),
          country: u.country ?? 'Unknown',
          created_at: u.created_at || u.updated_at || new Date().toISOString()
        }));
        return res.status(200).json({ users: safeUsers });
      } catch (err: any) {
        console.error('[admin/tool-users] Failed to fetch users:', err);
        return res.status(500).json({ error: 'Failed to fetch tool users list.' });
      }
    }

    return res.status(200).json({ valid: true, email: payload.email });
  }

  // 3. Admin Login (POST)
  if (action === 'login' || req.method === 'POST') {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown';
    const now = Date.now();

    if (attempts[ip] && attempts[ip].count >= 5 && now < attempts[ip].until) {
      const secs = Math.ceil((attempts[ip].until - now) / 1000);
      return res.status(429).json({ error: `Too many attempts. Try again in ${secs}s.` });
    }

    const { email, password } = req.body ?? {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const expectedEmail = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();
    const expectedHash  = process.env.ADMIN_PASSWORD_HASH ?? '';

    if (!expectedEmail || !expectedHash) {
      console.error('[admin/login] ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured.');
      return res.status(500).json({ error: 'Authentication not configured on server.' });
    }

    const emailMatches    = email.toLowerCase().trim() === expectedEmail;
    const passwordMatches = await bcrypt.compare(password, expectedHash);

    if (!emailMatches || !passwordMatches) {
      if (!attempts[ip] || now >= attempts[ip].until) {
        attempts[ip] = { count: 1, until: now + 30_000 };
      } else {
        attempts[ip].count++;
        if (attempts[ip].count >= 5) {
          attempts[ip].until = now + 30_000;
          return res.status(429).json({ error: 'Too many failed attempts. Locked for 30s.' });
        }
      }
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    delete attempts[ip];
    const token = signAdminToken(email.toLowerCase().trim());
    return res.status(200).json({ token });
  }

  // 4. Content Generation (POST /api/generate)
  if (action === 'generate' || req.url?.includes('generate')) {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const { topic, type } = req.body ?? {};
    if (!topic || !type) {
      return res.status(400).json({ error: 'Missing required fields: topic, type' });
    }
    if (!['project', 'blog'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be "project" or "blog".' });
    }
    if (typeof topic !== 'string' || topic.length > 200) {
      return res.status(400).json({ error: 'Topic must be a string under 200 characters.' });
    }
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!openrouterKey && !geminiKey) {
      console.error('[api/generate] Neither OPENROUTER_API_KEY nor GEMINI_API_KEY is set.');
      return res.status(500).json({ error: 'AI service is not configured on the server.' });
    }
    const prompt = type === 'project'
      ? `Write a sophisticated, professional architectural project description for: "${topic}". Focus on materials, light, space, and context. Under 100 words. Tone: Minimalist, Artistic.`
      : `Write an engaging intro paragraph for an architecture blog about: "${topic}". Focus on design philosophy. Under 150 words. Tone: Thoughtful, Insightful.`;
    
    try {
      // 1. Try OpenRouter API if available
      if (openrouterKey) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openrouterKey}`,
              'HTTP-Referer': 'https://anvitam.com',
              'X-Title': 'Anvitam'
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o',
              messages: [{ role: 'user', content: prompt }],
            }),
          });
          if (response.ok) {
            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content ?? 'No content generated.';
            return res.status(200).json({ text });
          }
          console.warn(`[api/generate] OpenRouter returned status ${response.status}. Attempting Gemini fallback.`);
        } catch (orErr) {
          console.warn('[api/generate] OpenRouter request failed:', orErr);
        }
      }

      // 2. Try Gemini API fallback
      if (geminiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No content generated.';
          return res.status(200).json({ text });
        }
        console.error(`[api/generate] Gemini API responded with ${response.status}`);
      }

      return res.status(502).json({ error: 'Upstream AI service error.' });
    } catch (err) {
      console.error('[api/generate] Unexpected error:', err);
      return res.status(500).json({ error: 'Content generation failed. Please try again.' });
    }
  }

  // 5. Image Upload (POST /api/upload -> action === 'upload')
  if (action === 'upload' || req.url?.includes('upload')) {
    const token = extractToken(req.headers.authorization);
    if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ error: 'Cloudinary not configured on server.' });
    }

    try {
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });

      const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const fileData = bodyData?.file || bodyData?.image;
      if (!fileData) {
        return res.status(400).json({ error: 'No image file or data URI provided.' });
      }

      const result = await cloudinary.uploader.upload(fileData, {
        folder: 'anvitam',
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        transformation: [{ width: 2400, crop: 'limit' }],
      });

      return res.status(200).json({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      });
    } catch (err: any) {
      console.error('[api/admin/upload] Error:', err);
      return res.status(500).json({ error: err.message || 'Upload failed.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
