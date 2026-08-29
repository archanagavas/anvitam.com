/**
 * api/hf-depth.ts
 *
 * 🆓 ZERO-COST Depth Map Estimation — Anvitam Studio
 *
 * Model cascade (all HuggingFace Serverless, $0.00):
 *   1. depth-anything/Depth-Anything-V2-Small-hf   (best quality)
 *   2. LiheYoung/depth-anything-small-hf            (reliable fallback)
 *   3. Intel/dpt-hybrid-midas                       (legacy fallback)
 *
 * Input:  image as base64 data URL or HTTPS URL
 * Output: grayscale depth map as base64 PNG
 *
 * Used by Room3DViewer.tsx to displace a Three.js PlaneGeometry mesh,
 * producing a real 3D walkthrough room experience in the browser.
 * Zero server cost after this one API call — all 3D rendering is client-side WebGL.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';

const DEPTH_MODELS = [
  'https://api-inference.huggingface.co/models/depth-anything/Depth-Anything-V2-Small-hf',
  'https://api-inference.huggingface.co/models/LiheYoung/depth-anything-small-hf',
  'https://api-inference.huggingface.co/models/Intel/dpt-hybrid-midas',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!HF_API_KEY) {
    return res.status(503).json({
      error: 'HUGGINGFACE_API_KEY not configured. Add it in Vercel Environment Variables.',
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { image } = body;

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "image" parameter (base64 data URL or HTTPS URL)' });
  }

  try {
    // Decode image to binary buffer for HF vision pipeline
    let imageBuffer: Buffer;
    if (image.startsWith('data:')) {
      const base64Data = image.split(',')[1];
      if (!base64Data) return res.status(400).json({ error: 'Invalid base64 image format' });
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else if (image.startsWith('https://') || image.startsWith('http://')) {
      const imgRes = await fetch(image, { headers: { 'User-Agent': 'AnvitamStudio/1.0' } });
      if (!imgRes.ok) return res.status(400).json({ error: `Failed to fetch image from URL: ${imgRes.statusText}` });
      imageBuffer = Buffer.from(await imgRes.arrayBuffer());
    } else {
      return res.status(400).json({ error: 'Image must be a base64 data URL or https:// URL' });
    }

    let depthImageB64: string | null = null;
    let usedModel = '';

    for (const modelUrl of DEPTH_MODELS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 50_000);

        const hfRes = await fetch(modelUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/octet-stream',
            'x-wait-for-model': 'true',
          },
          body: imageBuffer,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (hfRes.ok) {
          const depthBuf = await hfRes.arrayBuffer();
          if (depthBuf.byteLength > 1000) {
            const contentType = hfRes.headers.get('content-type') || 'image/png';
            depthImageB64 = `data:${contentType};base64,${Buffer.from(depthBuf).toString('base64')}`;
            usedModel = modelUrl.split('/').slice(-2).join('/');
            break;
          }
        } else {
          const errText = await hfRes.text().catch(() => hfRes.statusText);
          console.warn(`[hf-depth] ${modelUrl} -> ${hfRes.status}: ${errText.substring(0, 100)}`);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn(`[hf-depth] Timeout on ${modelUrl}`);
        } else {
          console.warn(`[hf-depth] Error on ${modelUrl}: ${err.message}`);
        }
      }
    }

    if (!depthImageB64) {
      return res.status(503).json({
        error: 'Depth estimation temporarily unavailable. AI models may be loading (cold start). Please retry in 20 seconds.',
        retry_after: 20,
      });
    }

    return res.status(200).json({
      success: true,
      depthMap: depthImageB64,
      model_used: usedModel,
      cost_usd: 0.000,
    });
  } catch (err: any) {
    console.error('[hf-depth] Unhandled error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
