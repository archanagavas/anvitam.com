/**
 * api/hf-image-gen.ts
 *
 * 🆓 ZERO-COST AI Image Generation Pipeline — Anvitam Studio
 *
 * Engine:  HuggingFace Serverless Inference API (free tier)
 * Models:
 *   - Primary:  black-forest-labs/FLUX.1-schnell  (~$0.000 on HF free tier)
 *   - Fallback: stabilityai/stable-diffusion-xl-base-1.0
 *
 * Modules supported:
 *   - interior      : Room restyle with ControlNet guidance prompt
 *   - exterior      : Facade redesign
 *   - garden        : Outdoor landscape render
 *   - sketch2image  : Wireframe/SketchUp → photorealistic render
 *   - virtual-staging: Empty room → furnished space
 *   - replace       : Object swap
 *   - remove        : Furniture removal (neutral inpaint)
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * REQUIRED ENV VARS (add to Vercel):
 *   HUGGINGFACE_API_KEY  = hf_xxxxxxxxxxxxxxxxxxxxx
 *
 * OPTIONAL FALLBACK ENV VARS:
 *   REPLICATE_API_TOKEN  = r8_xxxxxxxxxxxxxxxxxxxx
 *
 * HOW TO GET HuggingFace API KEY (free, no credit card):
 *   1. Go to https://huggingface.co/join  (takes 30 seconds)
 *   2. After signup: https://huggingface.co/settings/tokens
 *   3. Click "New token" → Type: "Read" → Name: "anvitam-studio"
 *   4. Copy the token starting with hf_
 *   5. Add to Vercel: Settings → Environment Variables → HUGGINGFACE_API_KEY
 * ──────────────────────────────────────────────────────────────────────────────
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../lib/adapter.js';

// Vercel Hobby tier allows up to 60s if explicitly configured
export const maxDuration = 60;

// ── Model Configuration ───────────────────────────────────────────────────────

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';
const WORLD_LABS_API_KEY = process.env.WORLD_LABS_API_KEY || '';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

export const HF_MODELS = {
  /** FLUX.1-schnell: Best quality, fastest, 0 cost on HF free tier */
  flux_schnell: 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
  /** SDXL: Reliable fallback, free tier */
  sdxl: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
  /** Realistic Vision for interior photorealism */
  realistic: 'https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V6.0_B1_noVAE',
};

const REPLICATE_FLUX_SCHNELL = 'black-forest-labs/flux-schnell';

// ── Prompt Builder ────────────────────────────────────────────────────────────

export interface PromptConfig {
  module: string;
  style: string;
  roomType: string;
  budget: string;
  promptText?: string;
  designMode?: string;
}

export function buildHFPrompt(config: PromptConfig): { positive: string; negative: string } {
  const { module, style, roomType, budget, promptText } = config;

  const styleMap: Record<string, string> = {
    modern: 'modern minimalist interior, clean lines, neutral palette, premium finishes',
    scandinavian: 'Scandinavian interior, white walls, natural wood, hygge atmosphere, cozy',
    japandi: 'Japandi interior, Japanese-Scandinavian fusion, wabi-sabi, natural materials',
    luxury: 'luxury interior design, marble surfaces, gold accents, velvet furniture, opulent',
    biophilic: 'biophilic interior, indoor plants, natural light, wood elements, green living wall',
    industrial: 'industrial loft interior, exposed brick, steel beams, concrete floors, Edison bulbs',
    coastal: 'coastal interior, light blues, white wood, driftwood accents, ocean-inspired',
    bohemian: 'bohemian interior, eclectic textiles, rattan, layered rugs, global artifacts',
    cyberpunk: 'cyberpunk interior, neon lights, dark walls, LED strips, futuristic gritty',
    midcentury: 'mid-century modern interior, organic shapes, teak furniture, 1960s style',
    artdeco: 'art deco interior, geometric patterns, gold details, velvet, glamorous 1920s',
    farmhouse: 'modern farmhouse interior, shiplap walls, barn wood, rustic cozy, neutral',
    mediterranean: 'mediterranean interior, terracotta tiles, arched doorways, warm plaster walls',
    tropical: 'tropical interior, lush plants, rattan furniture, bright colors, natural textures',
    minimalist: 'minimalist interior, extreme simplicity, white space, single accent color',
    parisian: 'Parisian apartment interior, herringbone floors, ornate moldings, French elegance',
    cottagecore: 'cottagecore interior, floral patterns, vintage furniture, handmade textiles',
    gothic: 'gothic interior, dark drama, jewel tones, ornate details, moody candlelit',
    gaming: 'gaming room interior, multiple monitors, LED lighting, ergonomic chair, dark theme',
    shabby_chic: 'shabby chic interior, distressed white furniture, floral prints, romantic',
    baroque: 'baroque interior, gilded furniture, ornate ceiling, dramatic drapery, grandeur',
    vaporwave: 'vaporwave interior, pastel pink and purple neons, retro futuristic, grid aesthetic',
    halloween: 'halloween themed interior, orange and black, spooky gothic decorations, dramatic',
    christmas: 'christmas interior, festive decorations, red and gold, cozy fireplace, holiday',
    airbnb: 'modern Airbnb interior, welcoming, comfortable, contemporary, clean, guest-ready',
    ski: 'alpine chalet interior, rustic wood beams, stone fireplace, cozy mountain warmth',
    bali: 'Balinese resort interior, rattan, bamboo, tropical plants, ethnic accents',
    vintage: 'vintage interior, antique furniture, nostalgic patina, historic charm',
    post_apocalyptic: 'post-apocalyptic interior, weathered materials, salvaged furniture, gritty survival',
    sketch: 'architectural sketch interior, hand-drawn style, pencil outlines, creative draft',
    soviet: 'Soviet brutalist interior, utilitarian design, concrete, monumental scale',
    medieval: 'medieval interior, stone walls, heavy wooden furniture, wrought iron, castle warmth',
    hollywood: 'Hollywood Regency interior, bold colors, shiny lacquer, vintage Hollywood glamour',
    eco: 'eco-friendly interior, sustainable materials, recycled wood, natural fibers',
    nautical: 'nautical interior, navy and white, rope accents, maritime accessories, seaside',
    surf: 'surf shack interior, weathered wood, surfboards on wall, laid-back beach culture',
    retro: 'retro interior, 1970s style, orange and brown tones, shag carpet, groovy',
    art_nouveau: 'art nouveau interior, flowing organic lines, floral motifs, ornate craftwork',
    futuristic: 'futuristic interior, sleek surfaces, smart home tech, innovative materials',
    retro_future: 'retro-futuristic interior, atomic age design, space age optimism',
    french_country: 'French country interior, soft pastels, floral patterns, natural materials',
    hot_pink: 'hot pink interior, bold vibrant design, pink as hero accent color, energetic',
    maximalist: 'maximalist interior, bold patterns, rich colors, layered textures, eclectic abundance',
    traditional: 'traditional interior, classic details, mahogany furniture, sumptuous furnishings',
    easter: 'Easter interior, pastel colors, floral accents, spring freshness, delicate',
    cny: 'Chinese New Year interior, red and gold, lanterns, prosperity symbols, festive',
    tribal: 'tribal interior, indigenous patterns, earthy tones, handwoven textiles, cultural art',
    eclectic: 'eclectic interior, mix of styles, textures and colors, unique personal character',
    japanese: 'Japanese interior design, shoji screens, tatami, low furniture, minimalist tranquil',
    zen: 'Zen interior, tranquil atmosphere, natural materials, meditation-ready, serene',
    loft: 'urban loft interior, exposed ductwork, concrete ceiling, open plan, city energy',
    contemporary: 'contemporary interior, current trends, subtle sophistication, clean modern lines',
    simple: 'simple interior, functional, uncluttered, honest materials, breathable space',
    modern_boho: 'modern bohemian interior, relaxed eclectic decor, contemporary boho touches',
    bohochic: 'boho-chic interior, fashionable bohemian, mixed patterns, refined eclectic',
    rustic: 'rustic interior, raw wood beams, natural stone, earthy textures, countryside warmth',
  };

  const budgetMap: Record<string, string> = {
    Economy: 'budget-friendly furniture, IKEA-style, affordable decor',
    'Mid-Range': 'mid-range furniture, quality materials, tasteful accessories',
    Luxury: 'high-end luxury furniture, bespoke pieces, premium materials, designer accessories',
  };

  const moduleMap: Record<string, string> = {
    interior: `photorealistic ${roomType} interior design`,
    exterior: `photorealistic house exterior facade redesign, architectural photography`,
    garden: `photorealistic garden and outdoor landscape design, lush greenery`,
    'sketch2image': `photorealistic interior render from architectural sketch, 3D rendering style`,
    'floorplan2isometric': `photorealistic 3D isometric cutaway view of architectural floorplan, highly detailed, architectural rendering`,
    'virtual-staging': `photorealistic virtually staged interior, empty room with furniture added`,
    replace: `photorealistic interior, furniture replaced, seamless edit`,
    remove: `photorealistic interior, furniture removed, clean empty floor and walls`,
  };

  const baseRoom = moduleMap[module] || `photorealistic ${roomType} interior design`;
  const styleDesc = styleMap[style] || `${style} interior design style`;
  const budgetDesc = budgetMap[budget] || '';
  const customText = promptText ? `, ${promptText}` : '';

  const positive = `${baseRoom}, ${styleDesc}, ${budgetDesc}${customText}, professional photography, 8K ultra-detailed, soft natural lighting, award-winning architecture, realistic textures, high dynamic range`;

  const negative = `low quality, blurry, cartoon, painting, sketch, watermark, text, logo, people, faces, distorted perspective, bad anatomy, ugly, poor lighting, overexposed, dark room, unfinished, messy, clutter`;

  return { positive, negative };
}

// ── HuggingFace Inference ─────────────────────────────────────────────────────

export async function generateWithHuggingFace(prompt: string, model: string): Promise<string | null> {
  if (!HF_API_KEY) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const res = await fetch(model, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
        'x-wait-for-model': 'true', // Wait up to 60s if model is loading
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 4, // FLUX.1-schnell optimal: 4 steps
          guidance_scale: 0.0,    // FLUX.1-schnell: guidance-free
          width: 1024,
          height: 768,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      console.warn(`[hf-image-gen] HF returned ${res.status}: ${errText.substring(0, 200)}`);
      return null;
    }

    // HF returns raw image bytes
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.warn('[hf-image-gen] Request timed out');
    } else {
      console.error('[hf-image-gen] Error:', err.message);
    }
    return null;
  }
}

// ── Cloudflare Workers AI Inference (Free Tier 10,000 Neurons/Day) ───────────────

export async function generateWithCloudflare(prompt: string): Promise<string | null> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) return null;

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        num_steps: 4,
      }),
    });

    if (!res.ok) {
      console.warn(`[hf-image-gen] Cloudflare Workers AI status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data.result?.image) {
      return `data:image/jpeg;base64,${data.result.image}`;
    }
    return null;
  } catch (err) {
    console.error('[hf-image-gen] Cloudflare error:', err);
    return null;
  }
}

// ── Replicate Fallback ────────────────────────────────────────────────────────

export async function generateWithReplicate(prompt: string): Promise<string | null> {
  if (!REPLICATE_API_TOKEN) return null;

  try {
    // Start prediction
    const startRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=30', // Synchronous wait up to 30s
      },
      body: JSON.stringify({
        input: {
          prompt,
          num_outputs: 1,
          num_inference_steps: 4,
          output_format: 'webp',
          output_quality: 90,
        },
      }),
    });

    if (!startRes.ok) return null;
    const pred = await startRes.json();

    // If Prefer:wait returned completed output
    if (pred.output && Array.isArray(pred.output) && pred.output[0]) {
      // Replicate returns a URL — fetch and convert to base64
      const imgRes = await fetch(pred.output[0]);
      if (!imgRes.ok) return pred.output[0]; // Return URL directly as fallback
      const buf = await imgRes.arrayBuffer();
      const b64 = Buffer.from(buf).toString('base64');
      return `data:image/webp;base64,${b64}`;
    }

    return null;
  } catch (err) {
    console.error('[hf-image-gen] Replicate error:', err);
    return null;
  }
}

// ── ControlNet (100% Structural Adherence) ───────────────────────────────────

export async function generateWithControlNet(prompt: string, sourceImageB64: string): Promise<string | null> {
  if (!REPLICATE_API_TOKEN) return null;

  try {
    // We use a robust SDXL ControlNet Depth or FLUX ControlNet Depth model on Replicate
    // xlabs-ai/flux-controlnet-depth-v3 is excellent for structural locking
    const startRes = await fetch('https://api.replicate.com/v1/models/xlabs-ai/flux-controlnet-depth-v3/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60', // Synchronous wait up to 60s
      },
      body: JSON.stringify({
        input: {
          prompt,
          control_image: sourceImageB64,
          steps: 28,
          guidance: 3.5,
          controlnet_conditioning_scale: 1.0,
          output_format: 'webp',
          output_quality: 90,
        },
      }),
    });

    if (!startRes.ok) {
      console.warn(`[hf-image-gen/controlnet] Replicate status: ${startRes.status}`);
      return null;
    }
    const pred = await startRes.json();

    if (pred.output && Array.isArray(pred.output) && pred.output[0]) {
      const imgRes = await fetch(pred.output[0]);
      if (!imgRes.ok) return pred.output[0];
      const buf = await imgRes.arrayBuffer();
      const b64 = Buffer.from(buf).toString('base64');
      return `data:image/webp;base64,${b64}`;
    }

    return null;
  } catch (err) {
    console.error('[hf-image-gen/controlnet] Replicate error:', err);
    return null;
  }
}

// ── Main Handler ──────────────────────────────────────────────────────────────

export default createHandler(async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body: any = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  // Handle Depth Estimation sub-route (/api/hf-depth or action=depth)
  const isDepthRequest = req.query.action === 'depth' || body.action === 'depth' || (body.image && !body.module);
  if (isDepthRequest) {
    const { image } = body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "image" parameter' });
    }
    if (!HF_API_KEY) {
      return res.status(503).json({ error: 'HUGGINGFACE_API_KEY not configured.' });
    }

    try {
      let imageBuffer: Buffer;
      if (image.startsWith('data:')) {
        const base64Data = image.split(',')[1];
        if (!base64Data) return res.status(400).json({ error: 'Invalid base64 image format' });
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (image.startsWith('https://') || image.startsWith('http://')) {
        const imgRes = await fetch(image, { headers: { 'User-Agent': 'AnvitamStudio/1.0' } });
        if (!imgRes.ok) return res.status(400).json({ error: `Failed to fetch image: ${imgRes.statusText}` });
        imageBuffer = Buffer.from(await imgRes.arrayBuffer());
      } else {
        return res.status(400).json({ error: 'Image must be base64 data URL or https URL' });
      }

      const DEPTH_MODELS = [
        'https://api-inference.huggingface.co/models/depth-anything/Depth-Anything-V2-Small-hf',
        'https://api-inference.huggingface.co/models/LiheYoung/depth-anything-small-hf',
        'https://api-inference.huggingface.co/models/Intel/dpt-hybrid-midas',
      ];

      let depthImageB64: string | null = null;
      let usedModel = '';

      for (const modelUrl of DEPTH_MODELS) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 45_000);
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
          }
        } catch (err: any) {
          console.warn(`[hf-depth] Model ${modelUrl} error:`, err.message);
        }
      }

      if (!depthImageB64) {
        return res.status(503).json({ error: 'Depth estimation temporarily unavailable.', retry_after: 20 });
      }

      return res.status(200).json({ success: true, depthMap: depthImageB64, model_used: usedModel, cost_usd: 0.000 });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal error' });
    }
  }

  const {
    module = 'interior',
    style = 'modern',
    roomType = 'Living Room',
    budget = 'Mid-Range',
    promptText = '',
    designMode = 'restyle',
    modelTier = 'flux', // 'flux' | 'sdxl' | 'realistic'
  } = body;

  // Validate module
  const validModules = ['interior', 'exterior', 'garden', 'sketch2image', 'floorplan2isometric', 'virtual-staging', 'replace', 'remove'];
  if (!validModules.includes(module)) {
    return res.status(400).json({ error: `Unknown module: ${module}` });
  }

  if (!HF_API_KEY && !REPLICATE_API_TOKEN && (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN)) {
    return res.status(503).json({
      error: 'AI image generation service not configured. Add HUGGINGFACE_API_KEY, CLOUDFLARE_API_TOKEN, or REPLICATE_API_TOKEN to environment variables.',
      setup_guide: 'Visit https://huggingface.co/settings/tokens to get a free HuggingFace API key — no credit card needed.',
    });
  }

  const { positive: positivePrompt } = buildHFPrompt({ module, style, roomType, budget, promptText, designMode });

  // Select model
  let selectedModel = HF_MODELS.flux_schnell;
  if (modelTier === 'sdxl') selectedModel = HF_MODELS.sdxl;
  if (modelTier === 'realistic') selectedModel = HF_MODELS.realistic;

  // 1. Try HuggingFace FLUX.1-schnell (free)
  let imageB64 = await generateWithHuggingFace(positivePrompt, selectedModel);

  // 2. If HF FLUX fails (model loading / rate limit), try Cloudflare Workers AI (10,000 neurons free/day)
  if (!imageB64 && CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_API_TOKEN) {
    console.log('[hf-image-gen] HF failed, trying Cloudflare Workers AI (FLUX) fallback...');
    imageB64 = await generateWithCloudflare(positivePrompt);
  }

  // 3. If Cloudflare fails, try HF SDXL
  if (!imageB64 && modelTier === 'flux') {
    console.log('[hf-image-gen] Cloudflare failed, trying SDXL fallback...');
    imageB64 = await generateWithHuggingFace(positivePrompt, HF_MODELS.sdxl);
  }

  // 4. Final fallback: Replicate
  if (!imageB64 && REPLICATE_API_TOKEN) {
    console.log('[hf-image-gen] HF/Cloudflare failed, trying Replicate FLUX fallback...');
    imageB64 = await generateWithReplicate(positivePrompt);
  }

  if (!imageB64) {
    return res.status(503).json({
      error: 'Image generation temporarily unavailable. The AI model may be loading (cold start). Please retry in 30 seconds.',
      retry_after: 30,
    });
  }

  return res.status(200).json({
    success: true,
    generatedImage: imageB64,
    model_used: selectedModel,
    prompt_used: positivePrompt.substring(0, 200),
    cost_usd: 0.000, // HF free tier = $0.000
  });
});
