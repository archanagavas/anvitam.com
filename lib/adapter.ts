/**
 * lib/adapter.ts
 * ─────────────────────────────────────────────────────────────
 * Universal Netlify & Vercel Serverless Function Adapter.
 * 
 * Translates Netlify Functions (v1 AWS Lambda event, v2 Web Request, or Vercel req/res)
 * into standard Vercel (req, res) signatures with helper methods (.status(), .json(), 
 * .send(), .setHeader()), returning Web Standard Response objects required by Netlify v2.
 * ─────────────────────────────────────────────────────────────
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface NetlifyResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export function createHandler(
  fn: (req: VercelRequest, res: VercelResponse) => Promise<any>
) {
  return async (arg1: any, arg2: any): Promise<any> => {
    // 1. Check if running in Vercel or local Express where res.status is a function
    if (arg2 && typeof arg2.status === 'function') {
      return await fn(arg1 as VercelRequest, arg2 as VercelResponse);
    }

    // 2. Running in Netlify (v1 event/context or v2 Request/Context)
    const responseHeaders: Record<string, string> = {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Content-Type, Authorization, X-Requested-With',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };

    let statusCode = 200;
    let responseBody: any = '';

    // Mock VercelResponse
    const res: any = {
      statusCode: 200,
      status(code: number) {
        statusCode = code;
        res.statusCode = code;
        return res;
      },
      setHeader(name: string, value: string) {
        if (name && value) {
          responseHeaders[name.toLowerCase()] = String(value);
        }
        return res;
      },
      getHeader(name: string) {
        return responseHeaders[name.toLowerCase()];
      },
      json(data: any) {
        if (!responseHeaders['content-type']) {
          responseHeaders['content-type'] = 'application/json';
        }
        responseBody = JSON.stringify(data);
        return res;
      },
      send(data: any) {
        if (typeof data === 'object' && !Buffer.isBuffer(data) && data !== null) {
          return res.json(data);
        }
        responseBody = data;
        return res;
      },
      end(data?: any) {
        if (data !== undefined) responseBody = data;
        return res;
      },
    };

    // Extract HTTP Method
    const httpMethod = (
      arg1?.method ||
      arg1?.httpMethod ||
      'GET'
    ).toUpperCase();

    // Auto-respond to CORS OPTIONS preflight
    if (httpMethod === 'OPTIONS') {
      return buildNetlifyResponse(204, responseHeaders, '');
    }

    // Extract Headers
    const headers: Record<string, string> = {};
    if (arg1?.headers) {
      if (typeof arg1.headers.entries === 'function') {
        for (const [k, v] of arg1.headers.entries()) {
          headers[k.toLowerCase()] = String(v);
        }
      } else if (typeof arg1.headers === 'object') {
        for (const [k, v] of Object.entries(arg1.headers)) {
          if (k && v !== undefined) headers[k.toLowerCase()] = String(v);
        }
      }
    }

    // Extract Query Parameters
    const query: Record<string, any> = { ...(arg1?.queryStringParameters || {}) };
    let url = arg1?.path || '/';

    if (arg1?.url) {
      try {
        const parsedUrl = new URL(arg1.url, 'http://localhost');
        url = parsedUrl.pathname + parsedUrl.search;
        for (const [k, v] of parsedUrl.searchParams.entries()) {
          if (!(k in query)) query[k] = v;
        }
      } catch {
        url = arg1.url;
      }
    }

    if (arg1?.rawQuery) {
      url = `${url}${url.includes('?') ? '&' : '?'}${arg1.rawQuery}`;
    }

    const forwardedUri = headers['x-forwarded-uri'] || headers['x-original-url'];
    if (forwardedUri) url = forwardedUri;

    // Extract Request Body
    let body: any = {};
    if (typeof arg1?.text === 'function') {
      try {
        const text = await arg1.text();
        if (text) {
          const trimmed = text.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try { body = JSON.parse(trimmed); } catch { body = text; }
          } else {
            body = text;
          }
        }
      } catch (err) {
        console.warn('[Adapter Body Text Parse Error]', err);
      }
    } else if (arg1?.body) {
      const rawBody = arg1.isBase64Encoded
        ? Buffer.from(arg1.body, 'base64').toString('utf-8')
        : arg1.body;
      if (typeof rawBody === 'string') {
        const trimmed = rawBody.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try { body = JSON.parse(trimmed); } catch { body = rawBody; }
        } else {
          body = rawBody;
        }
      } else {
        body = rawBody;
      }
    }

    const req: any = {
      method: httpMethod,
      url,
      query,
      headers,
      body,
      rawHeaders: arg1?.headers || {},
    };

    try {
      await fn(req, res);

      const finalBody = typeof responseBody === 'string'
        ? responseBody
        : JSON.stringify(responseBody ?? {});

      return buildNetlifyResponse(statusCode, responseHeaders, finalBody);
    } catch (err: any) {
      console.error('[Netlify Adapter Error]', err);
      return buildNetlifyResponse(500, responseHeaders, JSON.stringify({ error: err?.message || 'Internal Server Error' }));
    }
  };
}

function buildNetlifyResponse(statusCode: number, headers: Record<string, string>, body: string) {
  if (typeof Response !== 'undefined') {
    try {
      const res = new Response(body, {
        status: statusCode,
        headers,
      });
      Object.defineProperties(res, {
        statusCode: { value: statusCode, enumerable: true },
        body: { value: body, enumerable: true },
      });
      return res;
    } catch (e) {
      console.warn('[Adapter Web Response Fallback]', e);
    }
  }

  return {
    statusCode,
    headers,
    body,
  };
}
