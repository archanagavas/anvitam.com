/**
 * Vercel Serverless Function: /api/generate
 *
 * Proxies content generation requests to the Gemini API server-side,
 * keeping the API key off the client bundle entirely.
 *
 * OWASP A02: Cryptographic Failures / Secrets Exposure — key never reaches the browser.
 * Set GEMINI_API_KEY in Vercel Dashboard → Project → Settings → Environment Variables.
 */

import { extractToken, verifyAdminToken } from '../lib/auth';

export default async function handler(req: any, res: any) {
  // Enforce JWT validation to prevent API abuse
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, type } = req.body ?? {};

  // Input validation
  if (!topic || !type) {
    return res.status(400).json({ error: 'Missing required fields: topic, type' });
  }
  if (!['project', 'blog'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be "project" or "blog".' });
  }
  if (typeof topic !== 'string' || topic.length > 200) {
    return res.status(400).json({ error: 'Topic must be a string under 200 characters.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[api/generate] GEMINI_API_KEY environment variable is not set.');
    return res.status(500).json({ error: 'AI service is not configured on the server.' });
  }

  // Build prompt
  const prompt = type === 'project'
    ? `Write a sophisticated, professional architectural project description for: "${topic}". Focus on materials, light, space, and context. Under 100 words. Tone: Minimalist, Artistic.`
    : `Write an engaging intro paragraph for an architecture blog about: "${topic}". Focus on design philosophy. Under 150 words. Tone: Thoughtful, Insightful.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) {
      console.error(`[api/generate] Gemini API responded with ${response.status}`);
      return res.status(502).json({ error: 'Upstream AI service error.' });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No content generated.';
    return res.status(200).json({ text });

  } catch (err) {
    console.error('[api/generate] Unexpected error:', err);
    return res.status(500).json({ error: 'Content generation failed. Please try again.' });
  }
}
