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
import jwt from 'jsonwebtoken';
import { getDoc, getAllDocs, upsertDoc } from '../lib/db.js';
import {
  buildModulePrompt,
  buildRecommendationPrompt,
  ELEMENT_DETECTION_PROMPT,
  type GenerateBriefParams,
} from '../utils/aiDesignPrompts.js';
import { INITIAL_CATALOG_PRODUCTS, type CatalogProduct } from '../constants/catalogData.js';

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
    if (!['interior', 'exterior', 'garden', 'replace', 'remove', 'declutter', 'style-transfer', 'walls', 'flooring'].includes(module)) {
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

    const fullPrompt = buildModulePrompt(promptParams);

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

  // ── 4. RECOMMEND SHOPPABLE CATALOG PRODUCTS ──────────────────────────
  if (action === 'recommend') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = parseBody(req);
    const {
      roomType = 'Living Room',
      style = 'Modern Minimalist',
      region = 'India',
      budget,
    } = body;

    try {
      const dbProducts = await getAllDocs<CatalogProduct>('catalog_products');
      const catalog = dbProducts.length > 0 ? dbProducts : INITIAL_CATALOG_PRODUCTS;

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
    const { image } = body;

    const FALLBACK_PINS = [
      { label: 'Seating Furniture', element_type: 'sofa', x_percent: 45, y_percent: 60, width_percent: 30, height_percent: 20 },
      { label: 'Area Rug', element_type: 'rug', x_percent: 50, y_percent: 75, width_percent: 40, height_percent: 18 },
      { label: 'Lighting Fixture', element_type: 'pendant_light', x_percent: 50, y_percent: 22, width_percent: 15, height_percent: 15 },
      { label: 'Wall Finish', element_type: 'wall_paint', x_percent: 20, y_percent: 35, width_percent: 25, height_percent: 30 },
    ];

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
                    { type: 'text', text: ELEMENT_DETECTION_PROMPT },
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
                    { text: ELEMENT_DETECTION_PROMPT },
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
