/**
* scripts/dev-server.ts
* 
* Lightweight local API runner for development.
* Maps Vercel serverless function handlers in api/ to a native Node HTTP server on port 3005.
*/
import './load-env';
import { createServer } from 'http';
import { parse } from 'url';

// ── Import consolidated handlers ──────────────────────────────────────
import adminHandler from '../api/admin';
import generateHandler from '../api/generate';
import blogsHandler from '../api/blogs';
import projectsHandler from '../api/projects';
import messagesHandler from '../api/messages';
import servicesHandler from '../api/services';
import productsHandler from '../api/products';

const PORT = 3005;

const server = createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const parsedUrl = parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  // Setup Vercel-like response interface
  const vercelRes: any = res;
  vercelRes.status = (code: number) => {
    res.statusCode = code;
    return vercelRes;
  };
  vercelRes.json = (data: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
  vercelRes.send = (content: any) => {
    res.end(content);
  };

  // Setup Vercel-like request interface
  const vercelReq: any = req;
  vercelReq.query = parsedUrl.query;

  // Stream request body
  let body = '';
  await new Promise<void>((resolve) => {
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => { resolve(); });
  });

  if (body) {
    try {
      vercelReq.body = JSON.parse(body);
    } catch {
      vercelReq.body = body;
    }
  } else {
    vercelReq.body = {};
  }

  // Routing Table
  try {
    const blogsIdMatch = pathname.match(/^\/api\/blogs\/([^/]+)$/);
    const projectsIdMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
    const messagesIdMatch = pathname.match(/^\/api\/messages\/([^/]+)$/);
    const servicesIdMatch = pathname.match(/^\/api\/services\/([^/]+)$/);
    const productsIdMatch = pathname.match(/^\/api\/products\/([^/]+)$/);

    if (pathname.startsWith('/api/admin') || pathname === '/api/db-init') {
      await adminHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/generate') {
      await generateHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/blogs' || pathname === '/api/blogs/') {
      await blogsHandler(vercelReq, vercelRes);
    } else if (blogsIdMatch) {
      vercelReq.query.id = blogsIdMatch[1];
      await blogsHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/projects' || pathname === '/api/projects/') {
      await projectsHandler(vercelReq, vercelRes);
    } else if (projectsIdMatch) {
      vercelReq.query.id = projectsIdMatch[1];
      await projectsHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/messages' || pathname === '/api/messages/') {
      await messagesHandler(vercelReq, vercelRes);
    } else if (messagesIdMatch) {
      vercelReq.query.id = messagesIdMatch[1];
      await messagesHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/services' || pathname === '/api/services/') {
      await servicesHandler(vercelReq, vercelRes);
    } else if (servicesIdMatch) {
      vercelReq.query.id = servicesIdMatch[1];
      await servicesHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/products' || pathname === '/api/products/') {
      await productsHandler(vercelReq, vercelRes);
    } else if (productsIdMatch) {
      vercelReq.query.id = productsIdMatch[1];
      await productsHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/sitemap' || pathname === '/api/sitemap/' || pathname === '/api/sitemap.xml') {
      // Served as static pre-generated sitemap.xml on Vercel; dev-server mocks it
      res.setHeader('Content-Type', 'application/xml');
      res.end('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    } else if (pathname === '/api/llms' || pathname === '/api/llms/' || pathname === '/api/llms.txt' || pathname === '/api/llms-full') {
      res.setHeader('Content-Type', 'text/plain');
      res.end('# LLMs documentation (Mocked in dev server)');
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Route not found' }));
    }
  } catch (err: any) {
    console.error(`[dev-server] Error handling ${pathname}:`, err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`🔌 Local API Server listening on http://localhost:${PORT}`);
});
