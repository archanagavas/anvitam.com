import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractToken, verifyAdminToken } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const { urlList } = req.body ?? {};

  // Input validation
  if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
    return res.status(400).json({ error: 'Missing required field: urlList (must be non-empty string array)' });
  }

  const HOST = 'www.anvitam.com';
  // Never use a hardcoded fallback — the key is now in the public repo via git history.
  // If INDEXNOW_KEY is missing, fail explicitly rather than submitting with a known key.
  const KEY = process.env.INDEXNOW_KEY;
  if (!KEY) {
    console.error('[api/indexnow] INDEXNOW_KEY env var not set.');
    return res.status(500).json({ error: 'IndexNow is not configured on the server.' });
  }
  const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

  // Sanity check all URLs to make sure they belong to the host (prevent spam/abuse)
  const invalidUrls = urlList.filter(url => {
    if (typeof url !== 'string') return true;
    try {
      const u = new URL(url);
      return u.hostname !== HOST && u.hostname !== 'anvitam.com';
    } catch {
      return true;
    }
  });

  if (invalidUrls.length > 0) {
    return res.status(400).json({
      error: `All URLs must belong to host ${HOST}. Invalid entries detected: ${invalidUrls.join(', ')}`
    });
  }

  // Normalize URLs to match the canonical HOST (with www prefix)
  const normalizedUrls = urlList.map(url => {
    const u = new URL(url);
    u.hostname = HOST; // Force www prefix
    return u.toString();
  });

  try {
    const indexNowResponse = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: normalizedUrls
      })
    });

    const statusCode = indexNowResponse.status;

    if (statusCode === 200) {
      return res.status(200).json({
        success: true,
        message: 'URLs submitted to IndexNow successfully!'
      });
    } else {
      let errorDetail = '';
      try {
        errorDetail = await indexNowResponse.text();
      } catch {}

      let humanReason = 'Unknown error';
      if (statusCode === 400) humanReason = 'Bad request / Invalid format';
      if (statusCode === 403) humanReason = 'Forbidden / Invalid key or key file not found/matching';
      if (statusCode === 422) humanReason = 'Unprocessable Entity / URLs do not belong to the host or key schema mismatch';
      if (statusCode === 429) humanReason = 'Too Many Requests (potential Spam rate limiting)';

      return res.status(statusCode).json({
        success: false,
        error: `${humanReason} (IndexNow API returned status code ${statusCode})`,
        detail: errorDetail
      });
    }
  } catch (err: any) {
    // Log full details server-side only
    console.error('[api/indexnow] HTTP post failed:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to communicate with IndexNow API. Check server logs.'
    });
  }
}
