import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { key } = req.query;
  const envKey = process.env.INDEXNOW_KEY;

  if (envKey && key === envKey) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(envKey);
  }

  return res.status(404).send('Not Found');
}
