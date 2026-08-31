/**
 * lib/adapter.ts
 * ─────────────────────────────────────────────────────────────
 * Universal Netlify & Vercel Serverless Function Adapter.
 * 
 * Translates Netlify / AWS Lambda (event, context) invocations seamlessly into 
 * standard Vercel (req, res) signatures with helper methods (.status(), .json(), 
 * .send(), .setHeader()), preventing 502 Bad Gateway crashes across all Netlify functions.
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

    // 2. Running in Netlify / AWS Lambda where arg1 is 'event' and arg2 is 'context'
    const event = arg1 || {};
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

    // Normalize HTTP method
    const httpMethod = (event.httpMethod || event.method || 'GET').toUpperCase();

    // Auto-respond to CORS OPTIONS preflight
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: responseHeaders,
        body: '',
      };
    }

    // Extract headers
    const rawHeaders = event.headers || {};
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawHeaders)) {
      if (k && v !== undefined) {
        headers[k.toLowerCase()] = String(v);
      }
    }

    // Extract query parameters
    const query: Record<string, any> = { ...(event.queryStringParameters || {}) };

    // Safely parse body
    let body: any = {};
    if (event.body) {
      const rawBody = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf-8')
        : event.body;
      if (typeof rawBody === 'string') {
        const trimmed = rawBody.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            body = JSON.parse(trimmed);
          } catch {
            body = rawBody;
          }
        } else {
          body = rawBody;
        }
      } else {
        body = rawBody;
      }
    }

    // Construct URL
    const path = event.path || '/';
    const rawQuery = event.rawQuery ? `?${event.rawQuery}` : '';
    const forwardedUri = headers['x-forwarded-uri'] || headers['x-original-url'];
    const url = forwardedUri || `${path}${rawQuery}`;

    const req: any = {
      method: httpMethod,
      url,
      query,
      headers,
      body,
      rawHeaders,
    };

    try {
      await fn(req, res);

      const finalBody = typeof responseBody === 'string'
        ? responseBody
        : JSON.stringify(responseBody ?? {});

      return {
        statusCode,
        headers: responseHeaders,
        body: finalBody,
      };
    } catch (err: any) {
      console.error('[Netlify Adapter Error]', err);
      return {
        statusCode: 500,
        headers: responseHeaders,
        body: JSON.stringify({ error: err?.message || 'Internal Server Error' }),
      };
    }
  };
}
