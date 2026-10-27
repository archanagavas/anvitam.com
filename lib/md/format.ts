// lib/md/format.ts — Shared markdown formatting helpers for the md registry.
import { SITE, absUrl } from '../site.js';

export { absUrl };

export function mdLink(text: string, url: string): string {
  const label = String(text || '').replace(/[\[\]]/g, '').trim() || url;
  const href = url.startsWith('http') ? url : absUrl(url);
  return `[${label}](${href})`;
}

export function fmtDate(v: any): string {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return /^\d{4}-\d{2}-\d{2}/.test(String(v)) ? String(v).slice(0, 10) : '';
  return d.toISOString().split('T')[0];
}

export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&rsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"').replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–').replace(/&hellip;/g, '…');
}

const parseArr = (v: any): any[] => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try { const p = JSON.parse(v); if (Array.isArray(p)) return p; } catch { /* plain text */ }
    return v.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  }
  return [];
};
export { parseArr };

/** Convert stored blog/service HTML (from Firestore/seed data) to clean markdown.
 *  This renders from the same stored content the HTML page uses — not from rendered HTML. */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  let s = String(html);
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => {
    const t = decodeEntities(String(text).replace(/<[^>]+>/g, '')).trim();
    if (!t) return '';
    let u = String(href);
    if (u.startsWith('/')) u = absUrl(u);
    return ` [${t}](${u}) `;
  });
  s = s.replace(/<img\s[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, (_m, alt, src) => `\n\n![${decodeEntities(alt)}](${src.startsWith('/') ? absUrl(src) : src})\n\n`);
  s = s.replace(/<img\s[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, (_m, src) => `\n\n![](${src.startsWith('/') ? absUrl(src) : src})\n\n`);
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');
  s = s.replace(/<\/(ul|ol)>/gi, '\n\n');
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, t) => `\n\n> ${String(t).replace(/<[^>]+>/g, '').trim()}\n\n`);
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(p|div|section|article|tr)>/gi, '\n\n');
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**').replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*').replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  s = s.replace(/<[^>]+>/g, '');
  s = decodeEntities(s);
  return s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function faqMarkdown(faqs: any): string {
  const list = parseArr(faqs);
  if (!list.length) return '';
  return '\n\n## Frequently Asked Questions\n\n' +
    list.map((f: any) => `### ${f.question || ''}\n\n${htmlToMarkdown(String(f.answer || ''))}`).join('\n\n');
}

export function pageShell(opts: {
  title: string; summary: string; path: string; lastUpdated?: string; body: string; related?: { text: string; url: string }[];
}): string {
  const canonical = absUrl(opts.path === '/' ? '/' : opts.path);
  let out = `# ${opts.title}\n\n> ${opts.summary}\n\nCanonical: ${canonical}\n`;
  if (opts.lastUpdated) out += `Last updated: ${opts.lastUpdated}\n`;
  out += `\n${opts.body.trim()}\n`;
  if (opts.related?.length) {
    out += `\n## Related\n` + opts.related.map((r) => `- ${mdLink(r.text, r.url)}`).join('\n') + '\n';
  }
  return out;
}

export const siteRelated = [
  { text: 'Services', url: '/services' },
  { text: 'Projects', url: '/projects' },
  { text: 'Journal (Blog)', url: '/blog' },
  { text: 'Contact', url: '/contact' },
];
export { SITE };
