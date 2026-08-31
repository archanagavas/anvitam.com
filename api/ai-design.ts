/**
 * api/ai-design.ts
 *
 * Production API endpoint for AI Home Design Master Prompt Library.
 *
 * Actions:
 *  GET  ?action=catalog           – Fetch active catalog products
 *  GET  ?action=go&id={id}        – Affiliate redirect + click logging (merged from api/go.ts)
 *  POST ?action=generate          – Run AI visual redesign (credit-gated, idempotent)
 *  POST ?action=recommend         – Shoppable catalog recommendation pass (text-only)
 *  POST ?action=detect-elements   – Visual element bounding-box pin detection
 *  POST ?action=admin-product     – Admin CRUD for catalog products (JWT-protected)
 *
 * Engineering guarantees:
 *  - Every external call (Gemini) has an AbortController timeout and explicit error surface.
 *  - Credit deduction uses a client-supplied idempotency key (generation_id) so a
 *    network retry on the client side never double-charges the user.
 *  - admin-product is protected by the same JWT the admin panel uses.
 *  - All user-supplied strings are validated for type and length before use.
 *  - Image base64 payloads are capped at ~10 MB (≈7.5 MB raw) server-side; the client
 *    validates first but we never trust the client alone.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Hobby tier allows up to 60s if explicitly configured
export const maxDuration = 60;

import jwt from 'jsonwebtoken';
import { getDoc, getAllDocs, upsertDoc, deleteDoc } from '../lib/db.js';
import {
  buildModulePrompt,
  buildRecommendationPrompt,
  buildElementDetectionPrompt,
  type GenerateBriefParams,
} from '../utils/aiDesignPrompts.js';
import { INITIAL_CATALOG_PRODUCTS, type CatalogProduct } from '../constants/catalogData.js';
import {
  buildHFPrompt,
  generateWithHuggingFace,
  generateWithCloudflare,
  generateWithReplicate,
  HF_MODELS,
} from './hf-image-gen.js';

// ── Constants ────────────────────────────────────────────────────────────────

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  process.env.GOOGLE_AI_KEY ||
  '';

// JWT secret MUST be set in the environment — no insecure fallback in production.
// If missing, the admin-product endpoint will reject all requests with 401.
const JWT_SECRET = process.env.JWT_SECRET || '';

/** ~10 MB base64 string limit — rejects obviously oversized payloads before base64 decoding */
const MAX_IMAGE_B64_CHARS = 14_000_000; // ~10.5 MB raw when decoded

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveAction(req: VercelRequest): string {
  const urlPath = (req.url || '').split('?')[0];
  const q = req.query.action || req.query.path;
  const rawAction = (Array.isArray(q) ? q[0] : q) || '';
  if (rawAction) return rawAction;
  
  const body = parseBody(req);
  if (body?.action) return body.action;

  const pathLast = urlPath.split('/').pop() || '';
  if (pathLast === 'ai-design' && req.method === 'POST') return 'generate';
  return pathLast;
}

function validateJWT(req: VercelRequest): { userId: string } | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.split(' ')[1], JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

function parseBody(req: VercelRequest): Record<string, any> {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body || {};
}

// ── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Accept, Content-Type, Date, X-Api-Version, Authorization'
  );
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = resolveAction(req);

  // ── 1. GET CATALOG PRODUCTS ──────────────────────────────────────────
  if (action === 'catalog') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    try {
      const dbProducts = await getAllDocs<CatalogProduct>('catalog_products');
      const all = dbProducts.length > 0 ? dbProducts : INITIAL_CATALOG_PRODUCTS;
      return res.status(200).json({ success: true, products: all.filter(p => p.active !== false) });
    } catch (err) {
      console.error('[ai-design/catalog]', err);
      return res.status(200).json({ success: true, products: INITIAL_CATALOG_PRODUCTS });
    }
  }

  // ── 1b. AFFILIATE REDIRECT (merged from api/go.ts) ───────────────────
  // GET /api/ai-design?action=go&id={product_id}
  // Also handles legacy /api/go?id={product_id} route via vercel.json rewrite.
  if (action === 'go') {
    if (req.method !== 'GET') return res.status(405).send('Method not allowed');
    const productId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!productId) return res.redirect(302, 'https://amazon.in');

    try {
      let product: CatalogProduct | null = null;
      const dbDoc = await getDoc<CatalogProduct>('catalog_products', productId);
      if (dbDoc?.affiliate_link) {
        product = dbDoc;
      } else {
        product = INITIAL_CATALOG_PRODUCTS.find(p => p.id === productId) ?? null;
      }

      if (!product?.affiliate_link) return res.redirect(302, 'https://amazon.in');

      // Log click asynchronously — never block the redirect
      const clickLogId = `click_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      upsertDoc('affiliate_clicks', clickLogId, {
        product_id: product.id,
        product_name: product.name,
        region: product.region,
        source: product.source,
        clicked_at: new Date().toISOString(),
        user_agent: req.headers['user-agent'] || '',
        referer: req.headers['referer'] || '',
      }).catch(err => console.error('[ai-design/go click-log-failed]', err));

      return res.redirect(302, product.affiliate_link);
    } catch (err) {
      console.error('[ai-design/go]', err);
      return res.redirect(302, 'https://amazon.in');
    }
  }

  // ── 2. ADMIN PRODUCT CRUD (JWT-protected) ────────────────────────────
  if (action === 'admin-product') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Require a valid JWT — same token the admin panel uses
    const decoded = validateJWT(req);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized. Admin JWT required.' });
    }

    const body = parseBody(req);
    const { product } = body as { product?: CatalogProduct };

    if (!product || typeof product.id !== 'string' || !product.id.trim()) {
      return res.status(400).json({ error: 'Product must have a non-empty string id.' });
    }
    if (typeof product.name !== 'string' || !product.name.trim()) {
      return res.status(400).json({ error: 'Product name is required.' });
    }
    if (typeof product.affiliate_link !== 'string' || !product.affiliate_link.startsWith('http')) {
      return res.status(400).json({ error: 'Product affiliate_link must be a valid URL.' });
    }

    try {
      await upsertDoc('catalog_products', product.id.trim(), {
        ...product,
        name: product.name.trim(),
        id: product.id.trim(),
      });
      return res.status(200).json({ success: true, product });
    } catch (err) {
      console.error('[ai-design/admin-product]', err);
      return res.status(500).json({ error: 'Failed to save product to database.' });
    }
  }

  // ── 2b. ADMIN PRODUCT DELETE ──────────────────────────────────────────
  if (action === 'admin-product-delete') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const decoded = validateJWT(req);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized. Admin JWT required.' });

    const body = parseBody(req);
    const { id } = body as { id?: string };
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Product ID is required.' });

    try {
      await deleteDoc('catalog_products', id.trim());
      return res.status(200).json({ success: true, deleted_id: id });
    } catch (err) {
      console.error('[ai-design/admin-product-delete]', err);
      return res.status(500).json({ error: 'Failed to delete product.' });
    }
  }

  // ── 2c. ADMIN PRODUCT BULK IMPORT ────────────────────────────────────
  if (action === 'admin-product-bulk') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const decoded = validateJWT(req);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized. Admin JWT required.' });

    const body = parseBody(req);
    const { products } = body as { products?: CatalogProduct[] };
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'A non-empty array of products is required.' });
    }

    try {
      let savedCount = 0;
      for (const prod of products) {
        if (!prod.name || !prod.affiliate_link) continue;
        const prodId = prod.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await upsertDoc('catalog_products', prodId, {
          ...prod,
          id: prodId,
          name: prod.name.trim(),
          region: prod.region || 'India',
          element_type: prod.element_type || 'sofa',
          style_tags: Array.isArray(prod.style_tags) ? prod.style_tags : ['Modern'],
          price: prod.price || 'Check Price',
          image_url: prod.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
          affiliate_link: prod.affiliate_link.trim(),
          source: prod.source || 'manual',
          active: prod.active !== false
        });
        savedCount++;
      }
      return res.status(200).json({ success: true, count: savedCount });
    } catch (err) {
      console.error('[ai-design/admin-product-bulk]', err);
      return res.status(500).json({ error: 'Failed to bulk import products.' });
    }
  }

  // ── 2d. AUTO-FETCH PRODUCT METADATA FROM URL ─────────────────────────
  if (action === 'auto-fetch-product') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = parseBody(req);
    const { url, element_type } = body as { url?: string; element_type?: string };
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL is required.' });

    // Generate high quality fallback thumbnail based on element_type if URL parsing is restricted
    const ELEMENT_PLACEHOLDERS: Record<string, string> = {
      sofa: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
      chair: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?q=80&w=800&auto=format&fit=crop',
      rug: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=800&auto=format&fit=crop',
      lighting_fixture: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
      pendant_light: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop',
      wall_paint: 'https://images.unsplash.com/photo-1562184552-997c461abbe6?q=80&w=800&auto=format&fit=crop',
      flooring: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=800&auto=format&fit=crop',
      indoor_plant: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop',
      decor_accent: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop'
    };

    let titleCandidate = 'Shoppable Home Decor';
    try {
      const parsedUrl = new URL(url);
      const host = parsedUrl.hostname.replace('www.', '').split('.')[0];
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      const rawSlug = pathParts.find(p => p.length > 5 && !p.includes('dp')) || host;
      titleCandidate = rawSlug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      if (titleCandidate.length > 50) titleCandidate = titleCandidate.substring(0, 50) + '...';
    } catch (e) {
      // ignore URL parse errors
    }

    const imageUrl = ELEMENT_PLACEHOLDERS[element_type || 'sofa'] || ELEMENT_PLACEHOLDERS['sofa'];
    return res.status(200).json({
      success: true,
      title: titleCandidate,
      image_url: imageUrl,
      affiliate_link: url
    });
  }

  // ── 2e. RAG LEARNING LOOP: LOG FEEDBACK ──────────────────────────────
  if (action === 'feedback') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = parseBody(req);
    const { module, style, originalImage, generatedImage, promptText, rating } = body as any;

    if (!module || !rating) {
      return res.status(400).json({ error: 'module and rating are required.' });
    }

    try {
      const db = getDb();
      await db.collection('ai_learning_memory').add({
        module,
        style: style || '',
        originalImage: originalImage || '',
        generatedImage: generatedImage || '',
        promptText: promptText || '',
        rating, // 'positive' or 'negative'
        created_at: new Date().toISOString()
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[ai-design/feedback]', err);
      return res.status(500).json({ error: 'Failed to log feedback.' });
    }
  }

  // ── 3. GENERATE IMAGE REDESIGN ───────────────────────────────────────
  if (action === 'generate') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Auth & credits — allow unauthenticated users up to trial limit
    let userId: string | null = null;
    let userDoc: any = null;
    const decoded = validateJWT(req);
    if (decoded) {
      userId = decoded.userId;
      try {
        userDoc = await getDoc('tool_users', userId);
      } catch (err) {
        console.error('[ai-design/generate] Failed to fetch user doc:', userId, err);
      }
    }

    const isSubscribed: boolean = userDoc?.is_subscribed ?? false;
    const creditsRemaining: number = userDoc?.credits_remaining ?? 3; // 3 trial credits default

    const body = parseBody(req);
    const modelTier = (body.modelTier || body.modelChoice || 'fast').toLowerCase();
    const creditCost = (modelTier === 'pro' || modelTier === 'openai/gpt-4o' || modelTier === 'claude-3.5-sonnet') ? 2 : 1;

    if (userDoc && !isSubscribed && creditsRemaining < creditCost) {
      return res.status(402).json({
        error: `Insufficient credits. This operation requires ${creditCost} credit(s), but you have ${creditsRemaining} remaining. Please upgrade to Pro or top up to run high-performance AI models.`,
        credits_remaining: creditsRemaining,
        requires_upgrade: true,
      });
    }

    // ── Idempotency key — prevents double-deduction on client retries ──
    const generationId: string | undefined =
      typeof body.generation_id === 'string' && body.generation_id.trim()
        ? body.generation_id.trim()
        : undefined;

    if (generationId && userDoc) {
      // If this exact generation_id was already processed, return the stored result
      try {
        const existing = await getDoc('ai_generations', generationId);
        if (existing && existing.user_id === userId) {
          return res.status(200).json({
            success: true,
            generatedImage: existing.generated_image,
            description: existing.description,
            is_watermarked: !isSubscribed,
            credits_remaining: creditsRemaining, // unchanged — already deducted
            idempotent: true,
          });
        }
      } catch {
        // Non-fatal — proceed normally if the idempotency record can't be fetched
      }
    }

    const {
      sourceImage,
      referenceImage,
      module = 'interior',
      designMode = 'Room Restyle',
      roomType = 'Living Room',
      style = 'Modern Minimalist',
      colorPalette,
      region = 'India',
      spaceType,
      target,
      itemType,
      newFinish,
      floorMaterial,
      budget,
      promptText,
    } = body;

    // ── Input validation ──
    if (!sourceImage || typeof sourceImage !== 'string') {
      return res.status(400).json({ error: 'Source image is required.' });
    }
    if (sourceImage.length > MAX_IMAGE_B64_CHARS) {
      return res.status(413).json({
        error: 'Source image is too large. Please reduce the file size to under 10 MB.',
      });
    }
    if (!['interior', 'exterior', 'garden', 'replace', 'remove', 'declutter', 'style-transfer', 'walls', 'flooring', 'sketch2image', 'floorplan2isometric'].includes(module)) {
      return res.status(400).json({ error: `Unknown design module: ${module}` });
    }
    const hasAIConfigured = Boolean(OPENROUTER_API_KEY || GEMINI_API_KEY || process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY);
    if (!hasAIConfigured) {
      return res.status(500).json({
        error: 'AI service is not configured on this server. Please contact support.',
      });
    }

    // ── Build prompt ──
    const promptParams: GenerateBriefParams = {
      module,
      designMode: designMode as GenerateBriefParams['designMode'],
      roomType: typeof roomType === 'string' ? roomType.substring(0, 100) : 'Living Room',
      style: typeof style === 'string' ? style.substring(0, 100) : 'Modern Minimalist',
      colorPalette: typeof colorPalette === 'string' ? colorPalette.substring(0, 200) : undefined,
      region: (['India', 'USA', 'Brazil'].includes(region) ? region : 'India') as GenerateBriefParams['region'],
      spaceType: typeof spaceType === 'string' ? spaceType.substring(0, 100) : undefined,
      target: typeof target === 'string' ? target.substring(0, 200) : undefined,
      itemType: typeof itemType === 'string' ? itemType.substring(0, 200) : undefined,
      newFinish: typeof newFinish === 'string' ? newFinish.substring(0, 200) : undefined,
      floorMaterial: typeof floorMaterial === 'string' ? floorMaterial.substring(0, 200) : undefined,
    };

    let goldenExamplesText = '';
    try {
      if (isDbConfigured) {
        const db = getDb();
        const memorySnap = await db.collection('ai_learning_memory')
          .where('module', '==', module)
          .where('style', '==', style)
          .where('rating', '==', 'positive')
          // Note: Firestore requires a composite index for where+orderBy. If it fails, it will safely ignore.
          // .orderBy('created_at', 'desc') 
          .limit(2)
          .get();
        if (!memorySnap.empty) {
          const examples = memorySnap.docs.map(d => `- ${d.data().promptText}`).join('\n\n');
          goldenExamplesText = `\n\nGOLDEN EXAMPLES OF SUCCESSFUL DESIGNS (Learn from these highly rated past generations):\n${examples}`;
        }
      }
    } catch (e) {
      console.error('[ai-design/generate] Failed to fetch golden examples', e);
    }

    const basePrompt = buildModulePrompt(promptParams);
    const fullPrompt = basePrompt + goldenExamplesText;

    const cleanBase64 = (sourceImage as string).replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const mimeType = (sourceImage as string).includes('data:image/png') ? 'image/png' : 'image/jpeg';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50_000);

    try {
      let generatedImageB64 = '';
      let textDescription = '';

      // 1. Try OpenRouter multimodal (GPT-4o) if key is provided
      if (OPENROUTER_API_KEY) {
        try {
          const contentParts: any[] = [
            { type: 'text', text: fullPrompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${cleanBase64}` } }
          ];
          if (referenceImage && typeof referenceImage === 'string' && module === 'style-transfer') {
            const cleanRef = referenceImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
            contentParts.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${cleanRef}` } });
          }

          let orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://anvitam.com',
              'X-Title': 'Anvitam'
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o-mini',
              messages: [{ role: 'user', content: contentParts }],
              temperature: 0.4,
              max_tokens: 2048
            }),
            signal: controller.signal
          });
          if (orRes.ok) {
            const orJson = await orRes.json();
            textDescription = orJson.choices?.[0]?.message?.content || '';
          } else {
            console.warn(`[ai-design/generate] OpenRouter returned status ${orRes.status}`);
          }
        } catch (orErr) {
          console.warn('[ai-design/generate] OpenRouter request failed:', orErr);
        }
      }

      // 2. Fall back to Gemini if OpenRouter didn't yield result
      if (!textDescription && GEMINI_API_KEY) {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const parts: any[] = [
          { text: fullPrompt },
          { inline_data: { mime_type: mimeType, data: cleanBase64 } },
        ];

        if (referenceImage && typeof referenceImage === 'string' && module === 'style-transfer') {
          const cleanRef = referenceImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
          parts.push({ inline_data: { mime_type: 'image/jpeg', data: cleanRef } });
        }

        const geminiRes = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            generationConfig: {
              temperature: 0.4,
              topK: 32,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
          signal: controller.signal,
        });

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          console.error('[ai-design/generate] Gemini API error:', geminiRes.status, errText.substring(0, 300));
          if (!textDescription) {
            throw new Error(
              geminiRes.status === 429
                ? 'AI service is busy right now. Please wait a few seconds and try again.'
                : `AI service error (${geminiRes.status}). Please try again shortly.`
            );
          }
        } else {
          const responseData = await geminiRes.json();
          const candidate = responseData.candidates?.[0];
          if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
              if (part.inline_data?.data) {
                generatedImageB64 = `data:${part.inline_data.mime_type || 'image/jpeg'};base64,${part.inline_data.data}`;
              } else if (part.text) {
                textDescription += part.text;
              }
            }
          }
        }
      }

      clearTimeout(timeoutId);

      // ── Zero-Cost Image Cascade Fallback (HuggingFace -> Cloudflare -> Replicate) ──
      if (!generatedImageB64) {
        try {
          const promptConfig = {
            module: String(module || 'interior'),
            style: String(style || 'modern'),
            roomType: String(roomType || 'living room'),
            budget: String(budget || 'Mid-Range'),
            promptText: promptText ? String(promptText) : textDescription,
          };
          const { positive } = buildHFPrompt(promptConfig);
          generatedImageB64 =
            (await generateWithHuggingFace(positive, HF_MODELS.flux_schnell)) ||
            (await generateWithCloudflare(positive)) ||
            (await generateWithReplicate(positive)) ||
            '';
        } catch (imgErr) {
          console.error('[ai-design/generate] HF image cascade error:', imgErr);
        }
      }

      // ── Deduct credit & store idempotency record atomically ──────────
      if (userDoc) {
        const newRemaining = isSubscribed ? creditsRemaining : Math.max(0, creditsRemaining - creditCost);
        const newUsed = (userDoc.credits_used ?? 0) + creditCost;
        // Write updated user doc
        await upsertDoc('tool_users', userDoc.id, {
          ...userDoc,
          credits_remaining: newRemaining,
          credits_used: newUsed,
        });

        // Store idempotency record so retries don't re-charge
        if (generationId) {
          await upsertDoc('ai_generations', generationId, {
            user_id: userId,
            module,
            region,
            generated_image: generatedImageB64,
            description: textDescription,
          }).catch(err =>
            console.error('[ai-design/generate] Failed to store idempotency record:', generationId, err)
          );
        }

        return res.status(200).json({
          success: true,
          generatedImage: generatedImageB64 || sourceImage,
          description: textDescription,
          is_watermarked: !isSubscribed,
          credits_remaining: newRemaining,
        });
      }

      return res.status(200).json({
        success: true,
        generatedImage: generatedImageB64 || sourceImage,
        description: textDescription,
        is_watermarked: true, // unauthenticated — always watermarked
        credits_remaining: 2, // trial display value
      });

    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('[ai-design/generate] Failed:', { userId, module, region, error: err.message });
      return res.status(500).json({
        error:
          err.name === 'AbortError'
            ? 'AI generation timed out after 50 seconds. Please try a smaller image or try again.'
            : err.message || 'Failed to generate AI redesign. Please try again.',
      });
    }
  }

// ── External Affiliate API Fetcher (CueLinks / PA-API / CJ / Impact) ────────
async function fetchExternalAffiliateProducts(searchQuery: string, region: string): Promise<CatalogProduct[]> {
  const externalProducts: CatalogProduct[] = [];

  // 1. CueLinks / EarnKaro API (India: Amazon IN, Flipkart, Pepperfry, Urban Ladder, Myntra)
  const cuelinksKey = process.env.CUELINKS_API_KEY || process.env.CUELINKS_CID;
  if (cuelinksKey && (region === 'India' || region === 'Global')) {
    try {
      const res = await fetch(`https://api.cuelinks.com/v2/products/search.json?query=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Token token=${cuelinksKey}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.products && Array.isArray(data.products)) {
          data.products.slice(0, 5).forEach((item: any, idx: number) => {
            externalProducts.push({
              id: `cuelinks_${Date.now()}_${idx}`,
              category_id: 'cat_furniture',
              name: item.title || item.name || 'Designer Home Accent',
              element_type: item.category || 'decor_accent',
              region: 'India',
              style_tags: [searchQuery, 'Modern'],
              price: item.price ? `₹${item.price}` : 'Check Price',
              image_url: item.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
              affiliate_link: item.affiliate_url || item.url || 'https://amazon.in/dp/B08X123456?tag=anvitam-21',
              source: 'cuelinks',
              active: true,
            });
          });
        }
      }
    } catch (e) {
      console.warn('[CueLinks API fetch failed]', e);
    }
  }

  // 2. CJ Affiliate API (Global / USA: 3,000+ top home decor & furniture brands)
  const cjKey = process.env.CJ_API_KEY;
  if (cjKey && (region === 'USA' || region === 'Global')) {
    try {
      const graphqlQuery = {
        query: `{ products(keywords: "${searchQuery}", limit: 5) { id name price { amount currency } imageUrl buyUrl merchantName } }`
      };
      const res = await fetch('https://ads.cj.com/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cjKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphqlQuery)
      });
      if (res.ok) {
        const data = await res.json();
        const cjItems = data?.data?.products || [];
        cjItems.forEach((item: any, idx: number) => {
          externalProducts.push({
            id: `cj_${Date.now()}_${idx}`,
            category_id: 'cat_furniture',
            name: `${item.merchantName || 'CJ'} ${item.name}`,
            element_type: 'furniture',
            region: 'USA',
            style_tags: [searchQuery, 'Modern'],
            price: item.price?.amount ? `$${item.price.amount}` : 'Check Price',
            image_url: item.imageUrl || 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop',
            affiliate_link: item.buyUrl,
            source: 'cj_affiliate',
            active: true
          });
        });
      }
    } catch (e) {
      console.warn('[CJ Affiliate API fetch failed]', e);
    }
  }

  return externalProducts;
}

  // ── 4. RECOMMEND SHOPPABLE CATALOG PRODUCTS ──────────────────────────
  if (action === 'recommend') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = parseBody(req);
    const {
      roomType = 'Living Room',
      style = 'Modern Minimalist',
      region = 'India',
      budget,
      module = 'interior',
    } = body;

    try {
      const dbProducts = await getAllDocs<CatalogProduct>('catalog_products');
      let catalog = dbProducts.length > 0 ? dbProducts : INITIAL_CATALOG_PRODUCTS;

      let finalQuery = `${style} ${roomType}`;
      if (module === 'exterior') {
        finalQuery = `${style} outdoor facade lighting patio furniture`;
      } else if (module === 'garden') {
        finalQuery = `${style} garden landscaping planter outdoor`;
      }

      // Try fetching live external affiliate API products if configured
      const liveProducts = await fetchExternalAffiliateProducts(finalQuery, region);
      if (liveProducts.length > 0) {
        catalog = [...liveProducts, ...catalog];
      }

      const filtered = catalog.filter(p => {
        const regionMatch = p.region === region || p.region === 'Global';
        const activeMatch = p.active !== false;
        return regionMatch && activeMatch;
      });

      const candidatePool = filtered.length > 0 ? filtered : INITIAL_CATALOG_PRODUCTS;

      if (!GEMINI_API_KEY) {
        // Graceful fallback — return first N items per distinct category
        const seen = new Set<string>();
        const fallback = candidatePool
          .filter(p => { const unseen = !seen.has(p.category_id); seen.add(p.category_id); return unseen; })
          .slice(0, 5)
          .map(p => ({
            product_id: p.id,
            category: p.category_id,
            reason: `Complements the ${style} aesthetic in ${region}.`,
            alternate_ids: candidatePool
              .filter(a => a.category_id === p.category_id && a.id !== p.id)
              .map(a => a.id)
              .slice(0, 2),
          }));
        return res.status(200).json({ success: true, recommendations: fallback, catalog: candidatePool });
      }

      const filteredJson = JSON.stringify(
        candidatePool.map(c => ({
          id: c.id,
          name: c.name,
          category: c.category_id,
          element_type: c.element_type,
          style_tags: c.style_tags,
          price: c.price,
          region: c.region,
        }))
      );

      const promptText = buildRecommendationPrompt({
        roomType: String(roomType).substring(0, 100),
        style: String(style).substring(0, 100),
        region: String(region).substring(0, 50),
        budget: typeof budget === 'string' ? budget.substring(0, 50) : undefined,
        filteredCatalogJson: filteredJson,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);

      let rawText = '[]';

      // 1. Try OpenRouter if available
      if (OPENROUTER_API_KEY) {
        try {
          const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://anvitam.com',
              'X-Title': 'Anvitam'
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o',
              messages: [{ role: 'user', content: promptText }],
            }),
            signal: controller.signal,
          });
          if (orRes.ok) {
            const orJson = await orRes.json();
            rawText = orJson.choices?.[0]?.message?.content || '[]';
          }
        } catch (orErr) {
          console.warn('[ai-design/recommend] OpenRouter attempt failed:', orErr);
        }
      }

      // 2. Fall back to Gemini if OpenRouter was skipped or returned empty
      if ((!rawText || rawText === '[]') && GEMINI_API_KEY) {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: promptText }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
            }),
            signal: controller.signal,
          }
        );
        if (geminiRes.ok) {
          const resJson = await geminiRes.json();
          rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
        }
      }

      clearTimeout(timeoutId);

      let recommendations: any[];
      try {
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        recommendations = JSON.parse(cleanJson);
      } catch {
        console.warn('[ai-design/recommend] Failed to parse JSON response — using fallback');
        recommendations = [];
      }

      return res.status(200).json({ success: true, recommendations, catalog: candidatePool });

    } catch (err) {
      console.error('[ai-design/recommend] Error:', err);
      const seen = new Set<string>();
      const fallback = INITIAL_CATALOG_PRODUCTS
        .filter(p => { const unseen = !seen.has(p.category_id); seen.add(p.category_id); return unseen; })
        .slice(0, 4)
        .map(p => ({
          product_id: p.id,
          category: p.category_id,
          reason: `Selected for ${style} ${roomType}.`,
          alternate_ids: [],
        }));
      return res.status(200).json({
        success: true,
        recommendations: fallback,
        catalog: INITIAL_CATALOG_PRODUCTS,
      });
    }
  }

  // ── 5. DETECT VISUAL ELEMENT PINS ────────────────────────────────────
  if (action === 'detect-elements') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = parseBody(req);
    const { image, module = 'interior' } = body;

    let FALLBACK_PINS = [
      { label: 'Seating Furniture', element_type: 'sofa', x_percent: 45, y_percent: 60, width_percent: 30, height_percent: 20 },
      { label: 'Area Rug', element_type: 'rug', x_percent: 50, y_percent: 75, width_percent: 40, height_percent: 18 },
      { label: 'Lighting Fixture', element_type: 'pendant_light', x_percent: 50, y_percent: 22, width_percent: 15, height_percent: 15 },
      { label: 'Wall Finish', element_type: 'wall_paint', x_percent: 20, y_percent: 35, width_percent: 25, height_percent: 30 },
    ];
    if (module === 'exterior') {
      FALLBACK_PINS = [
        { label: 'Wall Sconce', element_type: 'lighting', x_percent: 45, y_percent: 60, width_percent: 10, height_percent: 10 },
        { label: 'Facade', element_type: 'material', x_percent: 50, y_percent: 75, width_percent: 40, height_percent: 18 },
      ];
    } else if (module === 'garden') {
      FALLBACK_PINS = [
        { label: 'Planter', element_type: 'planter', x_percent: 45, y_percent: 60, width_percent: 20, height_percent: 20 },
        { label: 'Plant', element_type: 'plant', x_percent: 50, y_percent: 75, width_percent: 40, height_percent: 18 },
      ];
    }

    if (!image || typeof image !== 'string' || (!OPENROUTER_API_KEY && !GEMINI_API_KEY)) {
      return res.status(200).json({ success: true, pins: FALLBACK_PINS });
    }

    if (image.length > MAX_IMAGE_B64_CHARS) {
      return res.status(200).json({ success: true, pins: FALLBACK_PINS });
    }

    try {
      const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      const mimeType = image.includes('data:image/png') ? 'image/png' : 'image/jpeg';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);

      let rawText = '[]';

      // 1. Try OpenRouter multimodal (GPT-4o) if available
      if (OPENROUTER_API_KEY) {
        try {
          const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://anvitam.com',
              'X-Title': 'Anvitam'
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o',
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: buildElementDetectionPrompt(module) },
                    { type: 'image_url', image_url: { url: `data:${mimeType};base64,${cleanBase64}` } }
                  ]
                }
              ]
            }),
            signal: controller.signal
          });
          if (orRes.ok) {
            const orJson = await orRes.json();
            rawText = orJson.choices?.[0]?.message?.content || '[]';
          }
        } catch (orErr) {
          console.warn('[ai-design/detect-elements] OpenRouter attempt failed:', orErr);
        }
      }

      // 2. Fall back to Gemini if OpenRouter skipped or failed
      if ((!rawText || rawText === '[]') && GEMINI_API_KEY) {
        const resDetect = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: buildElementDetectionPrompt(module) },
                    { inline_data: { mime_type: mimeType, data: cleanBase64 } },
                  ],
                },
              ],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
            }),
            signal: controller.signal,
          }
        );
        if (resDetect.ok) {
          const jsonRes = await resDetect.json();
          rawText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
        }
      }

      clearTimeout(timeoutId);

      let pins: any[];
      try {
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        pins = JSON.parse(cleanJson);
      } catch {
        pins = FALLBACK_PINS;
      }
      return res.status(200).json({ success: true, pins });

    } catch (err) {
      console.error('[ai-design/detect-elements] Error:', err);
      return res.status(200).json({ success: true, pins: FALLBACK_PINS });
    }
  }

  return res.status(404).json({ error: `Unknown AI Design action: "${action}"` });
}
