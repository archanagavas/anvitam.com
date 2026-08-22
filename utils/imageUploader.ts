/**
 * utils/imageUploader.ts
 *
 * Image upload utility — uploads to Cloudinary CDN via /api/upload.
 * NEVER stores base64 data in Firestore — that causes the 1MB document
 * limit crash. If the CDN upload fails, this throws so the caller can
 * surface a clear error to the admin user.
 */

import { getAuthToken } from '../context/ContentContext';

interface UploadOptions {
  /** Max longest dimension in px before downscaling. Default 2400 */
  maxDim?: number;
  /** JPEG/WebP quality 0–1. Default 0.92 */
  quality?: number;
  /**
   * Output format for the compressed image.
   * 'webp' — best compression, modern browsers only (default).
   * 'jpeg' — universal compatibility.
   * 'png'  — lossless, use only for images that need transparency.
   */
  format?: 'webp' | 'jpeg' | 'png';
}

/** How long to wait for the server-side CDN upload before aborting. */
const UPLOAD_TIMEOUT_MS = 30_000; // 30 seconds

/**
 * Compress + resize a file client-side before uploading.
 * Honours the `format` option — defaults to WebP with JPEG fallback
 * only when format is not explicitly specified.
 *
 * ONLY call this to pre-process before CDN upload — never store the result
 * in Firestore directly.
 */
export function processHighResImage(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const { maxDim = 2400, quality = 0.92, format } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if (!src) return reject(new Error('Failed to read file'));

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let resultUrl: string;
        if (format === 'jpeg') {
          resultUrl = canvas.toDataURL('image/jpeg', quality);
        } else if (format === 'png') {
          // PNG is lossless — quality param is ignored by the browser
          resultUrl = canvas.toDataURL('image/png');
        } else {
          // Default: prefer WebP, fall back to JPEG if browser doesn't support it
          resultUrl = canvas.toDataURL('image/webp', quality);
          if (!resultUrl.startsWith('data:image/webp')) {
            resultUrl = canvas.toDataURL('image/jpeg', quality);
          }
        }

        resolve(resultUrl);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file to Cloudinary CDN via the server-side /api/upload handler.
 *
 * Returns a permanent HTTPS Cloudinary URL (e.g. https://res.cloudinary.com/...).
 *
 * THROWS if the upload fails — do NOT catch silently and fall back to base64.
 * Storing base64 in Firestore will blow the 1 MB document size limit and
 * corrupt the database record.
 *
 * The upload request is bounded to UPLOAD_TIMEOUT_MS (30s) — if the server
 * doesn't respond in time, an error is thrown so the admin isn't left waiting
 * indefinitely with no feedback.
 */
export async function uploadOrProcessImage(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      'You must be logged into the admin panel to upload images. Please refresh and log in again.'
    );
  }

  // Step 1: client-side compress/resize (keeps upload payload reasonable)
  let base64: string;
  try {
    base64 = await processHighResImage(file, options);
  } catch (err: any) {
    throw new Error(`Failed to read image file: ${err.message}`);
  }

  // Step 2: upload to Cloudinary via our secure server endpoint
  // Bound the request duration so serverless cold-start timeouts don't
  // leave the admin staring at a spinner forever.
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch('/api/admin?path=upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ image: base64 }),
      signal: controller.signal,
    });
  } catch (networkErr: any) {
    if (networkErr.name === 'AbortError') {
      throw new Error(
        `Upload timed out after ${UPLOAD_TIMEOUT_MS / 1000}s. ` +
        'The server may be cold-starting. Please try again in a few seconds.'
      );
    }
    throw new Error(
      'Network error while uploading image. Check your internet connection and try again.'
    );
  } finally {
    clearTimeout(timeoutHandle);
  }

  if (!res.ok) {
    let detail = `Upload server returned ${res.status}.`;
    try {
      const errJson = await res.json();
      if (errJson?.error) detail = errJson.error;
    } catch {
      /* non-JSON response */
    }

    if (res.status === 500 && detail.toLowerCase().includes('cloudinary')) {
      throw new Error(
        'Image CDN (Cloudinary) is not configured on the server. ' +
        'Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET ' +
        'to your Vercel Environment Variables, then redeploy.'
      );
    }

    throw new Error(`Upload failed: ${detail}`);
  }

  const data = await res.json();
  if (!data?.url) {
    throw new Error('Upload succeeded but no URL was returned. Check server logs.');
  }

  return data.url as string;
}
