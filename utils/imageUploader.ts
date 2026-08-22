/**
 * utils/imageUploader.ts
 * 
 * High-Resolution Image Processing & Cloudinary Upload Utility.
 * Preserves high architectural detail (2400px max resolution, 0.92 quality)
 * and uploads to CDN when available to avoid base64 bloat.
 */

import { getAuthToken } from '../context/ContentContext';

interface UploadOptions {
  maxDim?: number;
  quality?: number;
}

/**
 * Converts a file to a high-resolution Base64 data URL.
 * Preserves ultra-crisp architectural details.
 */
export function processHighResImage(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const { maxDim = 2400, quality = 0.92 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if (!src) return reject(new Error('Failed to read file'));

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Only downscale if larger than 2400px
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

        // Try WebP at high quality (0.92) first
        let resultUrl = canvas.toDataURL('image/webp', quality);
        if (!resultUrl.startsWith('data:image/webp')) {
          resultUrl = canvas.toDataURL('image/jpeg', quality);
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
 * Uploads an image file or high-res base64 string to Cloudinary CDN if configured.
 * Falls back to high-res data URL if server upload is unavailable.
 */
export async function uploadOrProcessImage(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const highResBase64 = await processHighResImage(file, options);
  const token = getAuthToken();

  if (!token) {
    return highResBase64;
  }

  try {
    const res = await fetch('/api/admin?path=upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ image: highResBase64 }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('[imageUploader] CDN upload fallback to high-res base64:', err);
  }

  return highResBase64;
}
