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
import metaHandler from '../api/meta';
import messagesHandler from '../api/messages';
import seoHandler from '../api/seo';
import mdHandler from '../api/md';
import toolsHandler from '../api/tools';
import blogAgentHandler from '../api/blog-agent';

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
    const workshopsIdMatch = pathname.match(/^\/api\/workshops\/([^/]+)$/);
    const testimonialsIdMatch = pathname.match(/^\/api\/testimonials\/([^/]+)$/);
    const partnersIdMatch = pathname.match(/^\/api\/partners\/([^/]+)$/);
    const estimatorIdMatch = pathname.match(/^\/api\/estimator-services\/([^/]+)$/);

    if (pathname === '/ai.txt') {
      vercelReq.query.action = 'ai';
      await seoHandler(vercelReq, vercelRes);
    } else if (pathname.startsWith('/api/md')) {
      await mdHandler(vercelReq, vercelRes);
    } else if (pathname.endsWith('.md')) {
      vercelReq.query.path = pathname.slice(0, -3) || '/';
      await mdHandler(vercelReq, vercelRes);
    } else if (pathname.startsWith('/api/admin') || pathname === '/api/db-init' || pathname === '/api/upload' || pathname === '/api/analytics') {
      await adminHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/blog-agent' || pathname === '/api/blog-agent/') {
      await blogAgentHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/blogs' || pathname === '/api/blogs/') {
      vercelReq.query.resource = 'blogs';
      await metaHandler(vercelReq, vercelRes);
    } else if (blogsIdMatch) {
      vercelReq.query.resource = 'blogs';
      vercelReq.query.id = blogsIdMatch[1];
      await metaHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/projects' || pathname === '/api/projects/') {
      vercelReq.query.resource = 'projects';
      await metaHandler(vercelReq, vercelRes);
    } else if (projectsIdMatch) {
      vercelReq.query.resource = 'projects';
      vercelReq.query.id = projectsIdMatch[1];
      await metaHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/messages' || pathname === '/api/messages/') {
      await messagesHandler(vercelReq, vercelRes);
    } else if (messagesIdMatch) {
      vercelReq.query.id = messagesIdMatch[1];
      await messagesHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/services' || pathname === '/api/services/') {
      vercelReq.query.resource = 'services';
      await metaHandler(vercelReq, vercelRes);
    } else if (servicesIdMatch) {
      vercelReq.query.resource = 'services';
      vercelReq.query.id = servicesIdMatch[1];
      await metaHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/products' || pathname === '/api/products/') {
      vercelReq.query.resource = 'products';
      await metaHandler(vercelReq, vercelRes);
    } else if (productsIdMatch) {
      vercelReq.query.resource = 'products';
      vercelReq.query.id = productsIdMatch[1];
      await metaHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/workshops' || pathname === '/api/workshops/') {
      vercelReq.query.resource = 'workshops';
      await metaHandler(vercelReq, vercelRes);
    } else if (workshopsIdMatch) {
      vercelReq.query.resource = 'workshops';
      vercelReq.query.id = workshopsIdMatch[1];
      await metaHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/testimonials' || pathname === '/api/testimonials/') {
      vercelReq.query.resource = 'testimonials';
      await metaHandler(vercelReq, vercelRes);
    } else if (testimonialsIdMatch) {
      vercelReq.query.resource = 'testimonials';
      vercelReq.query.id = testimonialsIdMatch[1];
      await metaHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/partners' || pathname === '/api/partners/') {
      vercelReq.query.resource = 'partners';
      await metaHandler(vercelReq, vercelRes);
    } else if (partnersIdMatch) {
      vercelReq.query.resource = 'partners';
      vercelReq.query.id = partnersIdMatch[1];
      await metaHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/estimator-services' || pathname === '/api/estimator-services/') {
      vercelReq.query.resource = 'estimator-services';
      await metaHandler(vercelReq, vercelRes);
    } else if (estimatorIdMatch) {
      vercelReq.query.resource = 'estimator-services';
      vercelReq.query.id = estimatorIdMatch[1];
      await metaHandler(vercelReq, vercelRes);
    } else if (pathname.startsWith('/api/meta')) {
      await metaHandler(vercelReq, vercelRes);
    } else if (
      pathname === '/sitemap.xml' ||
      pathname === '/api/sitemap' ||
      pathname === '/api/sitemap/' ||
      pathname === '/api/sitemap.xml'
    ) {
      vercelReq.query.action = 'sitemap';
      await seoHandler(vercelReq, vercelRes);
    } else if (
      pathname === '/llms.txt' ||
      pathname === '/llm.txt' ||
      pathname === '/api/llms' ||
      pathname === '/api/llms/' ||
      pathname === '/api/llms.txt'
    ) {
      vercelReq.query.action = 'llms';
      vercelReq.query.mode = 'short';
      await seoHandler(vercelReq, vercelRes);
    } else if (
      pathname === '/llms-full.txt' ||
      pathname === '/llmsfull.txt' ||
      pathname === '/api/llms-full' ||
      pathname === '/api/llms-full.txt'
    ) {
      vercelReq.query.action = 'llms';
      vercelReq.query.mode = 'full';
      await seoHandler(vercelReq, vercelRes);
    } else if (
      pathname === '/rss.xml' ||
      pathname === '/feed.xml' ||
      pathname === '/api/rss' ||
      pathname === '/api/feed'
    ) {
      vercelReq.query.action = 'rss';
      await seoHandler(vercelReq, vercelRes);
    } else if (
      pathname === '/atom.xml' ||
      pathname === '/api/atom'
    ) {
      vercelReq.query.action = 'atom';
      await seoHandler(vercelReq, vercelRes);
    } else if (
      pathname === '/feed.json' ||
      pathname === '/api/feed.json' ||
      pathname === '/api/feed-json'
    ) {
      vercelReq.query.action = 'feed-json';
      await seoHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/tools' || pathname.startsWith('/api/tools/')) {
      if (pathname.startsWith('/api/tools/')) {
        const actionPart = pathname.replace('/api/tools/', '');
        if (!vercelReq.query.action) {
          vercelReq.query.action = actionPart;
        }
      }
      await toolsHandler(vercelReq, vercelRes);
    } else if (pathname === '/api/seo' || pathname.startsWith('/api/seo/')) {
      await seoHandler(vercelReq, vercelRes);
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
