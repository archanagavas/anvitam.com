/**
 * api/blog-agent.ts
 *
 * 🤖 AUTONOMOUS ZERO-COST AI BLOG AGENT — ANVITAM
 *
 * Implements Matt Berman's SEO-Forge & SEO-Images frameworks at $0.00 cost:
 * 1. Strategic Topic & Intent Formulation (Puppet Strings + Scroll Traps + Anti-AI-Overview)
 * 2. LLM Synthesis via NVIDIA NIM API (Llama 3.1 70B) with Gemini Flash fallback ($0)
 * 3. Photorealistic 16:9 Cover Image via Hugging Face FLUX.1-schnell ($0) -> Cloudinary CDN ($0)
 * 4. Stored safely as 'draft' in Firebase Firestore ($0)
 * 5. Instant Notification with 1-click Review link via Resend ($0)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../lib/adapter.js';
import { isDbConfigured, upsertDoc, getCollection } from '../lib/db.js';
import { verifyAdminToken, extractToken } from '../lib/auth.js';

export const maxDuration = 60; // 60s max execution on Vercel

const TOPIC_IDEAS = [
  {
    topic: 'Passive Solar Architecture for Farm Villas: Cooling Without AC',
    drive: 'Wealth & Escape',
    keywords: ['passive solar architecture', 'farm villa cooling', 'sustainable farmhouse design', 'biophilic cooling'],
  },
  {
    topic: 'Food Forest Zoning for Eco-Resorts: Layered Masterplanning Guide',
    drive: 'Wealth & Status',
    keywords: ['food forest design', 'eco resort masterplanning', 'syntropic agroforestry retreat', 'agrotourism planning'],
  },
  {
    topic: 'Rammed Earth & Lime Plasters: The Non-Toxic Building Envelope',
    drive: 'Health & Legacy',
    keywords: ['rammed earth construction', 'lime plaster homes', 'breathable walls eco architecture', 'natural building materials'],
  },
  {
    topic: 'Swale Hydrology: How to Recharge Dying Borewells on Rural Land',
    drive: 'Wealth & Escape',
    keywords: ['swale water harvesting', 'groundwater recharge farm', 'permaculture water management', 'keyline design India'],
  },
  {
    topic: 'The 5-Acre Farmstay Blueprint: Designing for 40%+ Annual Occupancy',
    drive: 'Wealth & Status',
    keywords: ['farmstay architecture', 'Airbnb retreat design', 'weekend villa ROI', 'boutique hospitality architecture'],
  },
  {
    topic: 'Syntropic Agroforestry for Landowners: From Barren Soil to Living Canopy in 18 Months',
    drive: 'Health & Legacy',
    keywords: ['syntropic farming guide', 'regenerative farm planning', 'soil regeneration architecture', 'Gujarat food forest'],
  },
];

// Helper: Slugify title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── 1. Zero-Cost LLM Content Generator ───────────────────────────────────────
async function generateArticleContent(topic: string, drive: string, keywords: string[]): Promise<any> {
  const systemPrompt = `You are the Principal Lead AI Content Strategist for Anvitam Architecture & Ecological Design Studio (founded by Ar. Archana Gavas, Vadodara, India).
You follow Matt Berman's SEO-Forge methodology:
1. PUPPET STRINGS: Target the core psychological drive: "${drive}".
2. SCROLL TRAPS: The first 300 words MUST use:
   - Term Branding (invent/name a memorable architectural/permaculture framework with a proper noun)
   - Embedded Truths (no hedge words like "maybe" or "try to")
   - Thought Narration (voice what the property owner or resort builder is secretly worrying about)
   - Exact specificity (square footages, temperature drops, rainfall volumes, plant species).
3. CARE-TO-CLICK PERSUASION ARC:
   - Care: Make the pain of traditional concrete heat boxes or depleted water tables visceral.
   - Believe: Anchor in real architectural physics, soil biology, and Archana Gavas's ecological design philosophy.
   - See: Detailed step-by-step masterplanning breakdown with clear sections.
   - Want: Vividly depict the thriving, low-maintenance, revenue-generating sanctuary.
   - Click: Soft, natural invitation to book an architectural masterplanning consultation on topmate.io/archanagavas.
4. ANTI-AI-OVERVIEW MOAT:
   - Include 3+ hyper-specific real-world experience anchors (e.g. black cotton soil behavior, surkhi lime mortar, Moringa/Gliricidia nitrogen-fixing guilds, passive thermal mass ratios).
   - Reject generic AI fluff. Write with authoritative, grounded, poetic precision.

TARGET KEYWORDS: ${keywords.join(', ')}

YOU MUST RESPOND ONLY WITH A VALID JSON OBJECT (no markdown ticks, no surrounding text):
{
  "title": "Compelling, punchy SEO title under 60 characters",
  "excerpt": "Curiosity-inducing meta excerpt under 155 characters",
  "content": "Full rich HTML article (1,200 to 1,800 words) using <h2>, <h3>, <p>, <blockquote>, <ul>, <ol>, <strong>, and structured callouts. Do NOT include <h1>.",
  "tags": ["Architecture", "Permaculture", "Eco Resort"],
  "read_time": "6 min read",
  "image_prompt": "A detailed, photorealistic prompt for FLUX.1-schnell depicting an editorial architectural photograph (16:9) of this concept (e.g., Hasselblad, warm golden light, rammed earth, lush foliage)"
}`;

  const userPrompt = `Topic: "${topic}"\nKeywords: ${keywords.join(', ')}\nPlease forge this article now in JSON format.`;

  // Try NVIDIA NIM API first (Llama 3.1 70B - fast, authoritative, zero-cost)
  const nvidiaKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
  if (nvidiaKey) {
    try {
      console.log('[blog-agent] Calling NVIDIA NIM (Llama 3.1 70B)...');
      const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvidiaKey}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 4096,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const rawContent = data.choices?.[0]?.message?.content?.trim() || '';
        const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        return parsed;
      } else {
        console.warn(`[blog-agent] NVIDIA NIM returned ${resp.status}:`, await resp.text());
      }
    } catch (err: any) {
      console.warn('[blog-agent] NVIDIA NIM failed, falling back:', err.message);
    }
  }

  // Fallback 1: Google Gemini 2.5 Flash
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log('[blog-agent] Falling back to Gemini 2.5 Flash...');
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.6,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (resp.ok) {
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn('[blog-agent] Gemini failed:', err.message);
    }
  }

  // Fallback 2: OpenRouter
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    try {
      console.log('[blog-agent] Falling back to OpenRouter...');
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const text = data.choices?.[0]?.message?.content?.trim() || '{}';
        const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (err: any) {
      console.warn('[blog-agent] OpenRouter failed:', err.message);
    }
  }

  throw new Error('All AI text generation providers failed or are unconfigured.');
}

// ── 2. Zero-Cost Image Generation via FLUX.1 & Cloudinary ────────────────────
async function generateAndUploadCoverImage(promptText: string, slug: string): Promise<string> {
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudKey = process.env.CLOUDINARY_API_KEY;
  const cloudSecret = process.env.CLOUDINARY_API_SECRET;

  const enrichedPrompt = `${promptText}, 8k resolution, architectural digest photography, cinematic natural daylight, realistic textures, highly detailed, photorealistic, 16:9 ratio`;

  let imageBuffer: Buffer | null = null;

  // 1. Try Google Gemini Imagen API
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && !imageBuffer) {
    try {
      console.log('[blog-agent] Generating architectural cover with Gemini Imagen API...');
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`;
      const gResp = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: enrichedPrompt }],
          parameters: { sampleCount: 1, aspectRatio: '16:9', outputMimeType: 'image/jpeg' }
        })
      });
      if (gResp.ok) {
        const gData = await gResp.json();
        const b64 = gData?.predictions?.[0]?.bytesBase64Encoded;
        if (b64) {
          imageBuffer = Buffer.from(b64, 'base64');
          console.log('[blog-agent] Image generated via Gemini Imagen');
        }
      }
    } catch (err: any) {
      console.warn('[blog-agent] Gemini image generation note:', err.message);
    }
  }

  // 2. Try HuggingFace Serverless FLUX.1-schnell
  if (hfKey && !imageBuffer) {
    try {
      console.log('[blog-agent] Generating image with HF FLUX.1-schnell...');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const hfResp = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: enrichedPrompt }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (hfResp.ok) {
        const arrayBuf = await hfResp.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
      }
    } catch (err: any) {
      console.warn('[blog-agent] HF image gen failed or timed out:', err.message);
    }
  }

  // If no image generated, return fallback architectural cover
  if (!imageBuffer) {
    return 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80';
  }

  // Upload to Cloudinary for permanent high-speed CDN delivery
  if (cloudName && cloudKey && cloudSecret) {
    try {
      console.log('[blog-agent] Uploading generated cover image to Cloudinary CDN...');
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({
        cloud_name: cloudName,
        api_key: cloudKey,
        api_secret: cloudSecret,
        secure: true,
      });

      const base64Data = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
      const uploadRes = await cloudinary.uploader.upload(base64Data, {
        folder: 'anvitam/blog',
        public_id: `cover_${slug}_${Date.now()}`,
        resource_type: 'image',
        format: 'webp',
        transformation: [{ width: 1600, crop: 'limit' }, { quality: 'auto' }],
      });

      return uploadRes.secure_url;
    } catch (err: any) {
      console.warn('[blog-agent] Cloudinary upload failed:', err.message);
    }
  }

  // Fallback to direct unsplash image if Cloudinary not configured
  return 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80';
}

// ── 3. Draft Notification via Resend ─────────────────────────────────────────
async function sendDraftNotificationEmail(blog: {
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  read_time: string;
  tags: string[];
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('[blog-agent] RESEND_API_KEY not configured. Skipping email notification.');
    return false;
  }

  const reviewUrl = `https://www.anvitam.com/admin?tab=blogs&edit=${blog.slug}`;
  const targetEmails = ['ar.archanagavas@gmail.com', 'anvitamarchitects@gmail.com'];

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1b382b 0%, #2f5d47 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
        <span style="background-color: rgba(255, 255, 255, 0.2); font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 9999px; font-weight: 700;">
          Autonomous AI Blog Agent
        </span>
        <h1 style="margin: 16px 0 8px; font-size: 22px; font-weight: 700; line-height: 1.3;">
          New Blog Draft Ready for Review 🌿
        </h1>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">
          Drafted using Matt Berman's SEO-Forge &amp; FLUX.1 image synthesis.
        </p>
      </div>

      <div style="padding: 24px;">
        ${
          blog.cover_image
            ? `<div style="margin-bottom: 20px; border-radius: 12px; overflow: hidden; max-height: 260px;">
                <img src="${blog.cover_image}" alt="Cover Preview" style="width: 100%; height: 260px; object-fit: cover; display: block;" />
              </div>`
            : ''
        }

        <h2 style="font-size: 18px; color: #111827; margin: 0 0 10px; font-weight: 700;">
          ${blog.title}
        </h2>
        
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 16px;">
          ${blog.excerpt}
        </p>

        <div style="display: flex; gap: 8px; margin-bottom: 24px;">
          <span style="font-size: 12px; background-color: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 6px; font-weight: 600;">
            ⏱️ ${blog.read_time || '6 min read'}
          </span>
          <span style="font-size: 12px; background-color: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 6px; font-weight: 700; text-transform: uppercase;">
            Status: Draft
          </span>
        </div>

        <div style="text-align: center; margin: 32px 0 16px;">
          <a href="${reviewUrl}" style="background-color: #2b5711; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(43, 87, 17, 0.25);">
            Review &amp; 1-Click Publish Draft →
          </a>
        </div>

        <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 16px;">
          This post is safely stored in <strong>Draft mode</strong>. It will NOT appear publicly until you click Publish in your Admin dashboard.
        </p>
      </div>

      <div style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280;">
        Anvitam Architecture &amp; Ecological Design Studio • Vadodara, India
      </div>
    </div>
  `;

  try {
    const senders = ['Anvitam Blog Agent <leads@anvitam.com>', 'Anvitam Blog Agent <onboarding@resend.dev>'];
    for (const sender of senders) {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          to: targetEmails,
          subject: `📝 New SEO Blog Draft: ${blog.title} (Ready to Review)`,
          html,
        }),
      });

      if (resp.ok) {
        console.log(`[blog-agent] Notification email sent successfully via ${sender}`);
        return true;
      }
    }
  } catch (err: any) {
    console.error('[blog-agent] Failed to send notification email:', err.message);
  }
  return false;
}

// ── 4. Main Serverless Handler ──────────────────────────────────────────────
export default createHandler(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Admin authentication (optional if triggered via server CLI secret)
  const token = extractToken(req.headers.authorization);
  const internalSecret = req.headers['x-agent-secret'] || req.query.secret;
  const isInternal = internalSecret && internalSecret === process.env.ADMIN_INIT_SECRET;

  if (!isInternal) {
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized. Admin token or secret required.' });
    }
  }

  const {
    topic: customTopic,
    keywords: customKeywords,
    drive: customDrive,
    generateImage = true,
    notify = true,
  } = req.body || {};

  // Pick or construct topic
  let selected = TOPIC_IDEAS[Math.floor(Math.random() * TOPIC_IDEAS.length)];
  const topic = customTopic || selected.topic;
  const drive = customDrive || selected.drive;
  const keywords = Array.isArray(customKeywords) && customKeywords.length > 0 ? customKeywords : selected.keywords;

  console.log(`[blog-agent] Initiating generation for topic: "${topic}"...`);

  try {
    // 1. Generate Article Content
    const generated = await generateArticleContent(topic, drive, keywords);
    const title = generated.title || topic;
    const rawSlug = slugify(title);
    const slug = `${rawSlug}-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];

    // 2. Generate Cover Image
    let coverImageUrl = '';
    if (generateImage) {
      const imagePrompt = generated.image_prompt || `${title}, architectural photography, biophilic design, golden hour`;
      coverImageUrl = await generateAndUploadCoverImage(imagePrompt, slug);
    }

    // 3. Construct Blog Document (Status strictly set to 'draft')
    const blogDoc = {
      id: slug,
      slug,
      title,
      excerpt: generated.excerpt || '',
      content: generated.content || '',
      cover_image: coverImageUrl,
      author: 'Ar. Archana Gavas',
      date: today,
      status: 'draft' as const,
      tags: generated.tags || ['Architecture', 'Permaculture'],
      read_time: generated.read_time || '6 min read',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      seo_drive: drive,
      seo_keywords: keywords,
    };

    // 4. Save into Database (Firestore / DB)
    if (isDbConfigured) {
      await upsertDoc('blogs', slug, blogDoc);
      console.log(`[blog-agent] Saved draft post to Firestore with ID: ${slug}`);
    } else {
      console.warn('[blog-agent] Database not configured. Returning draft object directly.');
    }

    // 5. Send Notification Email
    let notificationSent = false;
    if (notify) {
      notificationSent = await sendDraftNotificationEmail(blogDoc);
    }

    return res.status(200).json({
      success: true,
      message: 'Autonomous SEO blog draft generated, image rendered, and notification sent.',
      blog: blogDoc,
      notificationSent,
      reviewUrl: `https://www.anvitam.com/admin?tab=blogs&edit=${slug}`,
    });
  } catch (err: any) {
    console.error('[blog-agent] Generation failed:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate blog draft.',
    });
  }
});
