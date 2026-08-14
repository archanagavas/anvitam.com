import DOMPurify from 'dompurify';

/**
 * Strict OWASP-compliant DOMPurify allowlist configuration for CMS rich content.
 */
export const CMS_PURIFY_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
    'a', 'ol', 'ul', 'li', 'blockquote', 'pre', 'code', 'img',
    'div', 'span', 'hr', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'figure', 'figcaption'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'class', 'target', 'rel',
    'width', 'height', 'alt', 'title', 'align', 'colspan', 'rowspan'
  ],
  ALLOWED_URI_REGEXP: /^(?:https?:|data:image\/[a-z0-9\+\-\.]+;(?:base64,|[a-z0-9\=]+)|\/|\.\/|\.\.\/)/i,
  ALLOW_DATA_ATTR: false,
};

/**
 * Formats and sanitizes CMS input content into rich, structured HTML.
 * Handles Quill WYSIWYG HTML, raw Markdown, multi-line paragraph arrays, bullet lists, and section headers.
 */
export function formatCMSContent(input?: string | string[]): string {
  if (!input) return '';

  let rawText = '';
  if (Array.isArray(input)) {
    rawText = input.filter(Boolean).join('\n\n');
  } else {
    rawText = input.trim();
  }

  if (!rawText) return '';

  // Check if content already contains HTML tags (e.g. from Quill WYSIWYG editor)
  const containsHtml = /<[a-z][\s\S]*>/i.test(rawText);

  let htmlToSanitize = '';

  if (containsHtml) {
    // If it's already HTML, auto-enhance generic <p> headers or plain text blocks
    htmlToSanitize = autoEnhanceHtml(rawText);
  } else {
    // Convert plain text / Markdown to structured HTML
    htmlToSanitize = convertMarkdownToHtml(rawText);
  }

  return DOMPurify.sanitize(htmlToSanitize, CMS_PURIFY_CONFIG) as string;
}

/**
 * Auto-enhances HTML from Quill where titles/subheadings or lists might be wrapped in generic <p> tags
 */
function autoEnhanceHtml(html: string): string {
  // If HTML already contains heading tags or lists, preserve as is
  if (/<h[1-6]|<ul|<ol|<blockquote/i.test(html)) {
    return html;
  }

  // Convert generic <p> containing short section title text (no ending period, <= 70 chars) to <h3> subheadings
  return html.replace(/<p>\s*([^<]{3,70})\s*<\/p>/gi, (match, p1) => {
    const trimmed = p1.trim();
    // Don't convert if it ends with sentence punctuation (. ? !) or contains URL/email
    if (/[.?!]$/.test(trimmed) || /@|http|\//i.test(trimmed)) {
      return match;
    }
    // If it looks like a section title, format as <h3>
    return `<h3>${trimmed}</h3>`;
  });
}

/**
 * Converts Markdown or plain text into semantic HTML tags (headings, lists, bold text, blockquotes, paragraphs)
 */
function convertMarkdownToHtml(text: string): string {
  // Split into double-newline separated blocks
  const blocks = text.split(/\n\s*\n/);
  const resultBlocks: string[] = [];

  for (let block of blocks) {
    block = block.trim();
    if (!block) continue;

    // 1. Markdown Headings (# Header, ## Header, ### Header)
    if (block.startsWith('#')) {
      const levelMatch = block.match(/^(#{1,6})\s+(.*)$/s);
      if (levelMatch) {
        const level = Math.min(levelMatch[1].length + 1, 4); // Map # to h2, ## to h3, etc.
        const headerText = inlineFormat(levelMatch[2]);
        resultBlocks.push(`<h${level}>${headerText}</h${level}>`);
        continue;
      }
    }

    // 2. Blockquote (> quote)
    if (block.startsWith('>')) {
      const quoteText = inlineFormat(block.replace(/^>\s*/gm, ''));
      resultBlocks.push(`<blockquote><p>${quoteText}</p></blockquote>`);
      continue;
    }

    // 3. Bullet / Numbered Lists (- item, * item, • item, 1. item)
    const lines = block.split('\n');
    const isBulletList = lines.every(line => /^\s*[\-\*\•\d\.]+\s+/.test(line));
    if (isBulletList && lines.length > 0) {
      const listItems = lines.map(line => {
        const itemText = line.replace(/^\s*[\-\*\•\d\.]+\s+/, '');
        return `<li>${inlineFormat(itemText)}</li>`;
      }).join('');
      const isNumeric = /^\s*\d+\./.test(lines[0]);
      const listTag = isNumeric ? 'ol' : 'ul';
      resultBlocks.push(`<${listTag}>${listItems}</${listTag}>`);
      continue;
    }

    // 4. Standalone short section headers (e.g., "The Brief", "What We Found", "Our Approach — Six Zones")
    if (lines.length === 1 && block.length <= 70 && !/[.?!]$/.test(block) && !block.includes(':')) {
      resultBlocks.push(`<h3>${inlineFormat(block)}</h3>`);
      continue;
    }

    // 5. Paragraphs with inline list / bold header handling
    const formattedParagraph = lines.map(line => inlineFormat(line)).join('<br/>');
    resultBlocks.push(`<p>${formattedParagraph}</p>`);
  }

  return resultBlocks.join('\n');
}

/**
 * Handles inline formatting: **bold**, *italic*, `code`, and Title: values
 */
function inlineFormat(text: string): string {
  let formatted = text
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Inline code: `text`
    .replace(/`(.*?)`/g, '<code>$1</code>');

  // Format "Title:" prefix as bold e.g. "Location: Gujarat" -> "<strong>Location:</strong> Gujarat"
  formatted = formatted.replace(/^([A-Z][a-zA-Z0-9\s—–\-]{2,30}:)/, '<strong>$1</strong>');

  return formatted;
}
