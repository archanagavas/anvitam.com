/**
 * AI content generation service.
 *
 * Production: calls /api/generate (Vercel serverless function) — API key stays server-side.
 * Local dev:  if VITE_GEMINI_API_KEY is set in .env.local, calls Gemini directly as fallback.
 *             Run `vercel dev` locally for full parity with production.
 */

export const generateContentDescription = async (
  topic: string,
  type: 'project' | 'blog',
  token?: string | null
): Promise<string> => {
  // ── Production path: secure server-side proxy with Authorization ──
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ topic, type }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `Request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.text ?? 'No content generated.';
};