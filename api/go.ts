/**
 * api/go.ts
 * 
 * Affiliate Link Redirect & Click Analytics Handler.
 * URL format: GET /api/go?id={product_id}
 * 
 * 1. Resolves product from database or initial catalog.
 * 2. Logs click analytics asynchronously.
 * 3. Returns HTTP 302 redirect to destination affiliate_link.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDoc, getAllDocs, upsertDoc } from '../lib/db.js';
import { INITIAL_CATALOG_PRODUCTS, type CatalogProduct } from '../constants/catalogData.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id?: string };

  if (!id) {
    return res.status(400).send('Product ID is required for redirect.');
  }

  try {
    let product: CatalogProduct | null = null;
    const dbDoc = await getDoc<CatalogProduct>('catalog_products', id);

    if (dbDoc && dbDoc.affiliate_link) {
      product = dbDoc;
    } else {
      const matched = INITIAL_CATALOG_PRODUCTS.find(p => p.id === id);
      if (matched) product = matched;
    }

    if (!product || !product.affiliate_link) {
      // Fallback destination if product not found
      return res.redirect(302, 'https://amazon.in');
    }

    // Log click event asynchronously without blocking user redirect
    const clickLogId = `click_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    upsertDoc('affiliate_clicks', clickLogId, {
      product_id: product.id,
      product_name: product.name,
      region: product.region,
      source: product.source,
      clicked_at: new Date().toISOString(),
      user_agent: req.headers['user-agent'] || '',
      referer: req.headers['referer'] || ''
    }).catch(err => console.error('[go/click-log-failed]', err));

    // HTTP 302 Redirect to real affiliate link
    return res.redirect(302, product.affiliate_link);
  } catch (err) {
    console.error('[api/go error]', err);
    return res.redirect(302, 'https://amazon.in');
  }
}
