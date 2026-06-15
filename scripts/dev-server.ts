/**
 * scripts/dev-server.ts
 * 
 * Lightweight local API runner for development.
 * Maps Vercel serverless function handlers in api/ to a native Node HTTP server on port 3005.
 */
import './load-env';
import { createServer } from 'http';
import { parse } from 'url';


// ── Import handlers ───────────────────────────────────────────────────
import loginHandler from '../api/admin/login';
import verifyHandler from '../api/admin/verify';
import dbInitHandler from '../api/db-init';
import generateHandler from '../api/generate';
import blogsIndexHandler from '../api/blogs/index';
import blogsIdHandler from '../api/blogs/[id]';
import projectsIndexHandler from '../api/projects/index';
import projectsIdHandler from '../api/projects/[id]';
import messagesIndexHandler from '../api/messages/index';
import messagesIdHandler from '../api/messages/[id]';
import servicesIndexHandler from '../api/services/index';
import servicesIdHandler from '../api/services/[id]';
import sitemapHandler from '../api/sitemap';
import llmsHandler from '../api/llms';
import llmsFullHandler from '../api/llms-full';
import productsIndexHandler from '../api/products/index';
import productsIdHandler from '../api/products/[id]';

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

    if (pathname === '/api/admin/login') {
      await loginHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/admin/verify') {
      await verifyHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/db-init') {
      await dbInitHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/generate') {
      await generateHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/blogs' || pathname === '/api/blogs/') {
      await blogsIndexHandler(vercelReq, vercelRes);
    } else if (blogsIdMatch) {
      vercelReq.query.id = blogsIdMatch[1];
      await blogsIdHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/projects' || pathname === '/api/projects/') {
      await projectsIndexHandler(vercelReq, vercelRes);
    } else if (projectsIdMatch) {
      vercelReq.query.id = projectsIdMatch[1];
      await projectsIdHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/messages' || pathname === '/api/messages/') {
      await messagesIndexHandler(vercelReq, vercelRes);
    } else if (messagesIdMatch) {
      vercelReq.query.id = messagesIdMatch[1];
      await messagesIdHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/services' || pathname === '/api/services/') {
      await servicesIndexHandler(vercelReq, vercelRes);
    } else if (servicesIdMatch) {
      vercelReq.query.id = servicesIdMatch[1];
      await servicesIdHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/products' || pathname === '/api/products/') {
      await productsIndexHandler(vercelReq, vercelRes);
    } else if (productsIdMatch) {
      vercelReq.query.id = productsIdMatch[1];
      await productsIdHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/sitemap' || pathname === '/api/sitemap/' || pathname === '/api/sitemap.xml') {
      await sitemapHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/llms' || pathname === '/api/llms/' || pathname === '/api/llms.txt') {
      await llmsHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/llms-full' || pathname === '/api/llms-full/' || pathname === '/api/llms-full.txt') {
      await llmsFullHandler(vercelReq, vercelRes);
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
