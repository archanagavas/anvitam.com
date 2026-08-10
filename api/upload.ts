/**
 * api/upload.ts
 * Admin-only image upload → Cloudinary CDN
 *
 * Free tier: 25 GB storage, 25 GB bandwidth, auto WebP/AVIF delivery.
 * POST /api/upload   Content-Type: multipart/form-data  (field: "file")
 * Returns: { url, publicId, width, height, bytes }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdminToken, extractToken } from '../lib/auth.js';

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
  secure:      true,
});

// Vercel: disable default body parser so we can read raw stream
export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth: only logged-in admin can upload
  const token = extractToken(req.headers.authorization);
  if (!token || !verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' });

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({ error: 'Cloudinary not configured on server.' });
  }

  try {
    // Collect raw body chunks
    const chunks: Buffer[] = [];
    for await (const chunk of req as any) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const rawBody   = Buffer.concat(chunks);
    const contentType = req.headers['content-type'] || '';

    // Parse multipart to extract the base64/binary file
    const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
    if (!boundaryMatch) {
      return res.status(400).json({ error: 'Missing multipart boundary.' });
    }
    const boundary = boundaryMatch[1];
    const parts    = rawBody.toString('binary').split(`--${boundary}`);

    let fileBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';

    for (const part of parts) {
      if (part.includes('Content-Disposition') && part.includes('filename=')) {
        const mimeMatch = part.match(/Content-Type:\s*([^\r\n]+)/i);
        if (mimeMatch) mimeType = mimeMatch[1].trim();
        // Body starts after double CRLF
        const bodyStart = part.indexOf('\r\n\r\n') + 4;
        const bodyEnd   = part.lastIndexOf('\r\n');
        if (bodyStart > 4 && bodyEnd > bodyStart) {
          fileBuffer = Buffer.from(part.slice(bodyStart, bodyEnd), 'binary');
        }
        break;
      }
    }

    if (!fileBuffer) {
      return res.status(400).json({ error: 'No file found in request. Send field named "file".' });
    }

    // Upload to Cloudinary as a data URI
    const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder:          'anvitam',
      resource_type:   'image',
      quality:         'auto',
      fetch_format:    'auto',
      // Auto-resize: cap max width at 2400px so huge files don't bloat
      transformation:  [{ width: 2400, crop: 'limit' }],
    });

    // Build optimized delivery URL (WebP/AVIF auto, auto quality)
    const optimizedUrl = cloudinary.url(result.public_id, {
      fetch_format: 'auto',
      quality:      'auto',
      secure:       true,
    });

    return res.status(200).json({
      url:       optimizedUrl,
      publicId:  result.public_id,
      width:     result.width,
      height:    result.height,
      bytes:     result.bytes,
      format:    result.format,
    });
  } catch (err: any) {
    console.error('[upload] Error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed.' });
  }
}
