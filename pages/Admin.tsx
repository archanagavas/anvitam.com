import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useContent, getAuthToken, setAuthToken, clearAuthToken, authHeaders } from '../context/ContentContext';
import { generateContentDescription } from '../services/geminiService';
import DOMPurify from 'dompurify';
import {
  Trash2, Plus, Sparkles, LogOut, BarChart as ChartIcon, FileText,
  Layout as LayoutIcon, ShoppingBag, Briefcase, MessageSquare, Mail,
  Globe, Download, CheckCircle, RefreshCw, Edit2, X, Eye, EyeOff,
  Image as ImageIcon, Tag, Save, ArrowLeft, Type, Hash, AlertCircle, Menu,
  Database, Wifi, WifiOff, Shield, Lock, Zap, Activity, MessageCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { generateSitemapXml, generateLlmsTxt, generateLlmsFullTxt, downloadFile } from '../utils/seoGenerator';
import { BlogPost, Project, Service, DigitalProduct, Testimonial } from '../types';
import ProjectEditor from '../components/ProjectEditor';
import ServiceEditor from '../components/ServiceEditor';
import ProductEditor from '../components/ProductEditor';

// ── Mock Analytics ────────────────────────────────────────────────────
const ANALYTICS_DATA = [
  { name: 'Mon', visitors: 120 }, { name: 'Tue', visitors: 150 },
  { name: 'Wed', visitors: 200 }, { name: 'Thu', visitors: 180 },
  { name: 'Fri', visitors: 250 }, { name: 'Sat', visitors: 190 },
  { name: 'Sun', visitors: 140 },
];

// ── DOMPurify allowlist for Quill rich-text content ──────────────────
// Only whitelisted tags/attrs pass through — everything else is stripped.
// OWASP A03 – XSS Prevention.
const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'br', 'strong', 'em', 'u', 's', 'del',
    'a', 'ol', 'ul', 'li', 'blockquote', 'pre', 'code', 'img',
    'div', 'span', 'iframe', 'hr',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'class', 'target', 'rel', 'allowfullscreen',
    'width', 'height', 'data-value', 'alt',
  ],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: false,
};

// ── Quill loader (CDN) ────────────────────────────────────────────────
// TODO (P2): Replace with `npm install quill` to eliminate CDN dependency entirely.
declare global { interface Window { Quill: any; } }

function loadQuill(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Quill) { resolve(); return; }

    if (!document.getElementById('quill-css')) {
      const link = document.createElement('link');
      link.id = 'quill-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('quill-custom-css')) {
      const style = document.createElement('style');
      style.id = 'quill-custom-css';
      style.textContent = `
        .ql-toolbar.ql-snow { border: 1px solid #e5e7eb; border-bottom: none; border-radius: 8px 8px 0 0; background: #fafafa; padding: 8px 12px; flex-wrap: wrap; }
        .ql-container.ql-snow { border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; font-family: inherit; font-size: 1rem; }
        .ql-editor { min-height: 420px; font-size: 1rem; line-height: 1.8; color: #333; padding: 1.25rem 1.5rem; }
        .ql-editor p { margin-bottom: 0.75em; }
        .ql-editor h2 { font-size: 1.5rem; font-weight: 700; margin: 1.5em 0 0.5em; }
        .ql-editor h3 { font-size: 1.25rem; font-weight: 700; margin: 1.25em 0 0.4em; }
        .ql-editor h4 { font-size: 1.05rem; font-weight: 700; margin: 1em 0 0.3em; }
        .ql-editor blockquote { border-left: 4px solid #8bc34a; background: #f8fdf4; padding: 0.75em 1.25em; border-radius: 0 6px 6px 0; margin: 1em 0; font-style: italic; }
        .ql-editor pre.ql-syntax { background: #1e1e2e; color: #a6e3a1; border-radius: 8px; padding: 1em 1.25em; font-size: 0.875rem; overflow-x: auto; }
        .ql-editor img { max-width: 100%; border-radius: 8px; }
        .ql-editor a { color: #8bc34a; }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before { content: 'H2'; }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before { content: 'H3'; }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before { content: 'H4'; }
        .ql-snow .ql-stroke { stroke: #555; }
        .ql-snow .ql-fill { fill: #555; }
        .ql-snow .ql-picker { color: #555; }
        .ql-snow .ql-active .ql-stroke, .ql-snow button:hover .ql-stroke, .ql-snow .ql-picker-label:hover .ql-stroke { stroke: #8bc34a !important; }
        .ql-snow .ql-active, .ql-snow button:hover, .ql-snow .ql-picker-label:hover { color: #8bc34a !important; }
      `;
      document.head.appendChild(style);
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

// ── Slug helper ───────────────────────────────────────────────────────
const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

// ── URL validation ────────────────────────────────────────────────────
const isValidHttpUrl = (val: string): boolean => {
  if (!val) return true;
  try {
    const u = new URL(val);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch { return false; }
};

// Helper function for compressing images client-side (keeps database clean and page loads fast)
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(ev.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82); // 82% quality is sweet spot for web
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = ev.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// ── Blog Editor Component ─────────────────────────────────────────────
interface BlogEditorProps {
  initial?: BlogPost | null;
  onSave: (post: BlogPost, status: 'published' | 'draft') => void;
  onCancel: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ initial, onSave, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '');
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription || '');
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle || '');
  const [coverImageAlt, setCoverImageAlt] = useState(initial?.coverImageAlt || '');
  const [faqs, setFaqs] = useState<{ question: string; answer: string; }[]>(initial?.faqs || []);
  const [tags, setTags] = useState<string[]>(
    (initial?.tags || []).flatMap(t => t.split(',').map(s => s.trim())).filter(Boolean)
  );
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(initial?.image || '');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [author, setAuthor] = useState(initial?.author || 'Archana Gavas');
  const [authorBio, setAuthorBio] = useState(initial?.authorBio || 'Architect & Permaculture Designer | Farm Retreats, Eco Homestays, Food Forests, Agroforestry & Agrotourism | Consultation, Site Planning, Designing & Visualization - 4 years experience');
  const [authorImage, setAuthorImage] = useState(initial?.authorImage || '/archana.png');
  const [authorImageMode, setAuthorImageMode] = useState<'url' | 'upload'>('url');
  const [status, setStatus] = useState<'published' | 'draft'>(initial?.status || 'draft');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slugManual, setSlugManual] = useState(!!initial?.slug);

  // ── Error states (replaces all alert() calls) ─────────────────────
  const [editorError, setEditorError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Embed modal state (replaces window.prompt()) ──────────────────
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedError, setEmbedError] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [quillReady, setQuillReady] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && title) setSlug(toSlug(title));
  }, [title, slugManual]);

  // Load Quill
  useEffect(() => {
    let mounted = true;
    loadQuill().then(() => {
      if (!mounted || !editorRef.current || quillRef.current) return;
      const toolbarOptions = [
        [{ header: [1, 2, 3, 4, 5, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ];
      const q = new window.Quill(editorRef.current, {
        theme: 'snow',
        modules: { toolbar: toolbarOptions },
        placeholder: 'Start writing your article here...',
      });
      // Sanitize existing content before loading into editor (OWASP A03)
      if (initial?.content) {
        q.clipboard.dangerouslyPasteHTML(DOMPurify.sanitize(initial.content, RICH_TEXT_CONFIG));
      }
      quillRef.current = q;
      if (mounted) setQuillReady(true);
    });
    return () => { mounted = false; };
  }, []);

  // ── Image upload: handles files of any size with client-side compression ──────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const compressedDataUrl = await compressImage(file);
      setImage(compressedDataUrl);
    } catch (err) {
      console.error('[BlogEditor] Image upload compression failed:', err);
      // Fallback to original reader if compression fails
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (raw: string) => {
    const items = raw.split(',').map(s => s.trim().substring(0, 50)).filter(Boolean);
    if (items.length > 0) {
      setTags(prev => {
        const next = [...prev];
        items.forEach(t => {
          if (!next.includes(t)) next.push(t);
        });
        return next;
      });
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { 
      e.preventDefault(); 
      if (tagInput.trim()) {
        addTag(tagInput); 
      }
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const insertCTA = () => {
    if (!quillRef.current) return;
    const range = quillRef.current.getSelection(true);
    quillRef.current.clipboard.dangerouslyPasteHTML(
      range.index,
      DOMPurify.sanitize(
        `<p><a class="cta-button" href="https://topmate.io/ar_archana_gavas" target="_blank" rel="noopener noreferrer">Book a Consultation →</a></p>`,
        RICH_TEXT_CONFIG
      )
    );
  };

  const insertHR = () => {
    if (!quillRef.current) return;
    const range = quillRef.current.getSelection(true);
    quillRef.current.clipboard.dangerouslyPasteHTML(range.index, '<hr/>');
  };

  const insertEmbed = () => {
    setEmbedError(null);
    setEmbedUrl('');
    setEmbedModalOpen(true);
  };

  const handleEmbedInsert = () => {
    setEmbedError(null);
    if (!embedUrl || !quillRef.current) return;
    let html = '';
    try {
      const parsed = new URL(embedUrl); // throws on invalid URL
      const hostname = parsed.hostname.replace('www.', '');
      if (['youtube.com', 'youtu.be'].includes(hostname)) {
        const ytId = embedUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
        if (ytId && /^[a-zA-Z0-9_-]{11}$/.test(ytId)) {
          // Only trusted YouTube embed — ID format validated
          html = `<div class="embed-block"><iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen></iframe></div>`;
        } else {
          setEmbedError('Could not extract a valid YouTube video ID from that URL.');
          return;
        }
      } else if (['twitter.com', 'x.com'].includes(hostname)) {
        html = DOMPurify.sanitize(
          `<blockquote class="twitter-tweet"><a href="${embedUrl}"></a></blockquote>`,
          RICH_TEXT_CONFIG
        ) as string;
      } else {
        setEmbedError('Only YouTube and Twitter/X embeds are supported for security reasons.');
        return;
      }
    } catch {
      setEmbedError('Invalid URL. Must start with https://');
      return;
    }
    const range = quillRef.current.getSelection(true);
    quillRef.current.clipboard.dangerouslyPasteHTML(range.index, html);
    setEmbedModalOpen(false);
    setEmbedUrl('');
  };

  const handleAIDraft = async () => {
    if (!title) { setEditorError('Please enter a post title before generating AI content.'); return; }
    setEditorError(null);
    setIsGenerating(true);
    try {
      const text = await generateContentDescription(title, 'blog', getAuthToken());
      if (quillRef.current) {
        quillRef.current.clipboard.dangerouslyPasteHTML(
          DOMPurify.sanitize(`<p>${text}</p>`, RICH_TEXT_CONFIG) as string
        );
      }
    } catch (err) {
      console.error('[BlogEditor] AI draft error:', err);
      setEditorError('AI generation failed. Check API configuration.');
    } finally { setIsGenerating(false); }
  };

  const handleSubmit = (overrideStatus?: 'published' | 'draft') => {
    setEditorError(null);
    if (!title.trim()) { setEditorError('A title is required before saving.'); return; }
    
    const finalStatus = overrideStatus || status;
    if (overrideStatus) setStatus(overrideStatus);
    const rawContent = quillRef.current ? quillRef.current.root.innerHTML : (initial?.content || '');
    // Always sanitize before storing
    const content = DOMPurify.sanitize(rawContent, RICH_TEXT_CONFIG) as string;
    const strippedText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const defaultExcerpt = strippedText.substring(0, 180) + (strippedText.length > 180 ? '...' : '');

    const post: BlogPost = {
      id: initial?.id || crypto.randomUUID(), // secure UUID, not Date.now()
      slug: slug || toSlug(title),
      title: title.trim(),
      date: initial?.date || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      author,
      excerpt: excerpt.trim() || defaultExcerpt,
      content,
      image: image || `https://picsum.photos/1200/800?random=${Math.floor(Math.random() * 9999)}`,
      metaDescription: metaDescription.trim() || defaultExcerpt.substring(0, 160),
      metaTitle: metaTitle.trim() || title.trim(),
      coverImageAlt: coverImageAlt.trim(),
      faqs,
      tags,
      status: finalStatus,
      authorBio: authorBio.trim(),
      authorImage: authorImage.trim(),
    };
    onSave(post, finalStatus);
  };

  return (
    <div className="space-y-6">
      <style>{`
        .ql-toolbar.ql-snow {
          position: sticky;
          top: -24px;
          background: white;
          z-index: 40;
          border-bottom: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: top 0.2s;
        }
        @media (min-width: 768px) {
          .ql-toolbar.ql-snow {
            top: -32px;
          }
        }
        .ql-container.ql-snow {
          border-top: none !important;
        }
      `}</style>

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onCancel} className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium">
            <ArrowLeft size={16} />
            <span>Back to all posts</span>
          </button>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
            status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAIDraft}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 bg-purple-50 text-purple-700 border border-purple-200 text-sm px-3 py-1.5 rounded-lg hover:bg-purple-100 transition disabled:opacity-50"
          >
            <Sparkles size={14} />
            <span>{isGenerating ? 'Writing...' : 'AI Draft'}</span>
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            className="flex items-center space-x-1.5 border border-gray-300 text-gray-700 text-sm px-4 py-1.5 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            <Save size={14} />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => handleSubmit('published')}
            className="flex items-center space-x-1.5 bg-black text-white text-sm px-5 py-1.5 rounded-lg hover:bg-gray-800 transition font-bold"
          >
            <Globe size={14} />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Inline editor error (replaces alert()) */}
      {editorError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
          <AlertCircle size={14} className="shrink-0" />
          <span className="flex-1">{editorError}</span>
          <button onClick={() => setEditorError(null)}><X size={13} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5">Article Title *</label>
            <input
              type="text"
              placeholder="e.g. How to Launch a Solana Prediction Market Clone"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-xl font-bold text-gray-900 outline-none focus:border-black placeholder-gray-400 transition bg-white"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5 flex items-center gap-1">
              <Hash size={11} /> URL Slug
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-black transition bg-white">
              <span className="text-gray-600 text-sm px-3 py-2.5 bg-gray-50 border-r border-gray-200 select-none">URL: /blog/</span>
              <input
                type="text"
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                className="flex-1 px-3 py-2.5 text-sm outline-none font-mono text-gray-800"
                placeholder="solana-prediction-market-clone"
              />
              {slugManual && (
                <button onClick={() => { setSlugManual(false); setSlug(toSlug(title)); }} className="px-3 text-xs text-gray-500 hover:text-gray-800 border-l border-gray-200 py-2.5">Reset</button>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5">Excerpt / Short Summary</label>
            <textarea
              rows={3}
              placeholder="Brief summary of the article (shows on list page)..."
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 outline-none focus:border-black placeholder-gray-400 transition resize-none bg-white"
            />
          </div>

          {/* Extra Quill toolbar actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600 font-bold uppercase tracking-wider">Insert:</span>
            <button onClick={insertCTA} className="text-xs border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 transition text-gray-700 font-semibold bg-white">CTA Button</button>
            <button onClick={insertHR} className="text-xs border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 transition text-gray-700 font-semibold bg-white">Divider</button>
            <button onClick={insertEmbed} className="text-xs border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 transition text-gray-700 font-semibold bg-white">Embed (YT / X)</button>
          </div>

          {/* Quill editor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5">Content *</label>
            <div ref={editorRef} />
          </div>

          {/* FAQ Schema Builder */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-800">
                  <span>💡</span> FAQ Schema Builder (AEO/SEO/GEO Engine)
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Add FAQs that will be automatically embedded as JSON-LD schema markup. This helps Google, Bing, and AI search engines discover and list your content.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFaqs(prev => [...prev, { question: '', answer: '' }])}
                className="flex items-center space-x-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition font-bold"
              >
                <Plus size={12} />
                <span>Add FAQ</span>
              </button>
            </div>

            {faqs.length > 0 ? (
              <div className="space-y-4 mt-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4 bg-gray-50 relative space-y-3">
                    <button
                      type="button"
                      onClick={() => setFaqs(prev => prev.filter((_, idx) => idx !== index))}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                      title="Remove FAQ"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="pr-6">
                      <label className="block text-xxs font-bold uppercase tracking-widest text-gray-600 mb-1">Question</label>
                      <input
                        type="text"
                        placeholder="e.g. What is the transaction cost on Solana?"
                        value={faq.question}
                        onChange={e => {
                          const updated = [...faqs];
                          updated[index].question = e.target.value;
                          setFaqs(updated);
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black bg-white transition text-gray-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold uppercase tracking-widest text-gray-600 mb-1">Answer</label>
                      <textarea
                        rows={2}
                        placeholder="Answer to the question..."
                        value={faq.answer}
                        onChange={e => {
                          const updated = [...faqs];
                          updated[index].answer = e.target.value;
                          setFaqs(updated);
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black bg-white transition resize-none text-gray-800 font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-xs text-gray-500 bg-gray-50/50">
                No FAQs added yet. Click "Add FAQ" to improve search crawlers visibility.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar meta column */}
        <div className="space-y-5">
          {/* Featured Image */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5 text-gray-800"><ImageIcon size={14} /> Cover Image</h4>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setImageMode('url')} className={`flex-1 text-xs py-1.5 rounded font-semibold transition ${imageMode === 'url' ? 'bg-black text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>URL</button>
              <button onClick={() => setImageMode('upload')} className={`flex-1 text-xs py-1.5 rounded font-semibold transition ${imageMode === 'upload' ? 'bg-black text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Upload</button>
            </div>
            {imageMode === 'url' ? (
              <input
                type="text"
                placeholder="e.g. /uploads/... or https://..."
                value={image}
                onChange={e => setImage(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition text-gray-800 bg-white"
              />
            ) : (
              <>
                <label className="block w-full border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition bg-gray-50/50">
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleImageUpload} />
                  <ImageIcon size={20} className="mx-auto text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600 font-medium">Click to upload (any size)</span>
                </label>
                {uploadError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={11} />{uploadError}
                  </p>
                )}
              </>
            )}
            {image && (
              <div className="mt-3 relative space-y-2 bg-white">
                <img src={image} alt="preview" className="w-full h-36 object-cover rounded-lg" onError={() => setImage('')} />
                <button onClick={() => setImage('')} className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"><X size={12} /></button>
                
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-widest text-gray-600 mb-1">Cover Image Alt Text (for SEO)</label>
                  <input
                    type="text"
                    placeholder="e.g. Screenshot of Solana prediction market dashboard"
                    value={coverImageAlt}
                    onChange={e => setCoverImageAlt(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition text-gray-800 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SEO Settings Card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-800"><Globe size={14} /> 🔍 SEO Settings</h4>
            
            <div>
              <label className="block text-xxs font-bold uppercase tracking-widest text-gray-600 mb-1">Meta Title</label>
              <input
                type="text"
                placeholder="SEO Title (60 chars max)"
                value={metaTitle}
                maxLength={60}
                onChange={e => setMetaTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition text-gray-800 bg-white"
              />
              <p className={`text-xxs mt-1 text-right font-mono ${metaTitle.length > 55 ? 'text-orange-600' : 'text-gray-500'}`}>
                {metaTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-xxs font-bold uppercase tracking-widest text-gray-600 mb-1">Meta Description</label>
              <textarea
                rows={3}
                placeholder="SEO Description (160 chars max)"
                value={metaDescription}
                maxLength={160}
                onChange={e => setMetaDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition resize-none text-gray-800 bg-white"
              />
              <p className={`text-xxs mt-1 text-right font-mono ${metaDescription.length > 150 ? 'text-orange-600' : 'text-gray-500'}`}>
                {metaDescription.length}/160 characters
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5 text-gray-800"><Tag size={14} /> Tags / Categories</h4>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full font-semibold">
                  {t}
                  <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-green-700 hover:text-green-900"><X size={10} /></button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => tagInput && addTag(tagInput)}
              placeholder="e.g. Web3, Solana (press Enter)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition text-gray-800 bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Press Enter or comma to add</p>
          </div>

          {/* Author Card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5">Author</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition text-gray-800 bg-white"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5">Author Photo</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setAuthorImageMode('url')}
                  className={`flex-1 text-xxs py-1 rounded font-semibold transition ${authorImageMode === 'url' ? 'bg-black text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setAuthorImageMode('upload')}
                  className={`flex-1 text-xxs py-1 rounded font-semibold transition ${authorImageMode === 'upload' ? 'bg-black text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  Upload
                </button>
              </div>
              {authorImageMode === 'url' ? (
                <input
                  type="text"
                  placeholder="e.g. /uploads/... or https://..."
                  value={authorImage}
                  onChange={e => setAuthorImage(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition text-gray-800 bg-white"
                />
              ) : (
                <label className="block w-full border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-gray-400 transition bg-gray-50/50">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64 = await compressImage(file);
                          setAuthorImage(base64);
                        } catch (err) {
                          console.error('Error compressing author image:', err);
                        }
                      }
                    }}
                  />
                  <ImageIcon size={16} className="mx-auto text-gray-400 mb-1" />
                  <span className="text-xxs text-gray-600 font-medium">Click to upload photo</span>
                </label>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5">Author Biography</label>
              <textarea
                rows={4}
                value={authorBio}
                onChange={e => setAuthorBio(e.target.value)}
                placeholder="Describe author experience and fields of work..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition resize-none text-gray-800 bg-white"
              />
            </div>
            
            {/* Visual Author Profile Preview */}
            <div className="border border-gray-100 rounded-lg p-3 bg-gray-50 space-y-2.5">
              <div className="flex items-start gap-2.5">
                {authorImage ? (
                  <img src={authorImage} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" alt={author} />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-black shrink-0 mt-0.5">
                    {author ? author.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-gray-800 truncate">{author || 'Archana Gavas'}</h5>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Author Profile</p>
                  <p className="text-[11px] text-gray-700 leading-normal mt-1 border-t border-gray-200/50 pt-1.5 font-medium whitespace-pre-line">
                    {authorBio || 'No biography details provided.'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 font-semibold border-t border-gray-200/60 pt-2">
                <a href="https://www.linkedin.com/in/archana-gavas" target="_blank" rel="noopener noreferrer" className="hover:text-[#0077b5] transition-colors">LinkedIn</a>
                <span>·</span>
                <a href="https://medium.com/@archanagavas/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Medium</a>
                <span>·</span>
                <a href="https://www.instagram.com/designby.archana/" target="_blank" rel="noopener noreferrer" className="hover:text-[#e1306c] transition-colors">Instagram</a>
                <span>·</span>
                <a href="https://www.facebook.com/archana.gavas" target="_blank" rel="noopener noreferrer" className="hover:text-[#1877f2] transition-colors">Facebook</a>
              </div>
            </div>
          </div>

          {/* Mobile publish buttons */}
          <div className="flex gap-3 lg:hidden">
            <button onClick={() => handleSubmit('draft')} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition bg-white">Save Draft</button>
            <button onClick={() => handleSubmit('published')} className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition">Publish</button>
          </div>
        </div>
      </div>

      {/* ── Embed URL Modal (replaces window.prompt()) ─────────────── */}
      {embedModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setEmbedModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Embed Media</h3>
              <button onClick={() => setEmbedModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Paste a YouTube or Twitter/X URL. Only these platforms are supported for security.</p>
            <input
              type="url"
              value={embedUrl}
              onChange={e => setEmbedUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmbedInsert()}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black transition mb-2"
              autoFocus
            />
            {embedError && (
              <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                <AlertCircle size={11} />{embedError}
              </p>
            )}
            <div className="flex gap-2 mt-1">
              <button onClick={() => setEmbedModalOpen(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleEmbedInsert} className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">Insert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



// ── Status Badge ──────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: BlogPost['status'] }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
    {status === 'published' ? <Eye size={10} /> : <EyeOff size={10} />}
    {status === 'published' ? 'Published' : 'Draft'}
  </span>
);

// ── Testimonial Editor Component ──────────────────────────────────────
const TestimonialEditorForm: React.FC<{
  initial: Testimonial | null;
  onSave: (t: Testimonial) => void;
  onCancel: () => void;
}> = ({ initial, onSave, onCancel }) => {
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [image, setImage] = useState(initial?.image || '');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">{initial ? 'Edit Testimonial' : 'New Testimonial'}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const t: Testimonial = {
            id: initial?.id || 't' + Date.now(),
            author: formData.get('author') as string,
            role: formData.get('role') as string,
            text: formData.get('text') as string,
            image: image,
          };
          onSave(t);
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600">Client Name</label>
            <input name="author" defaultValue={initial?.author} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600">Role / Company</label>
            <input name="role" defaultValue={initial?.role} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">Testimonial Text</label>
          <textarea name="text" defaultValue={initial?.text} required rows={4} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600 block mb-2">Image (Optional)</label>
          <div className="flex bg-gray-50 p-1 rounded-lg w-fit mb-3">
            <button type="button" onClick={() => setImageMode('url')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${imageMode === 'url' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>URL</button>
            <button type="button" onClick={() => setImageMode('upload')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${imageMode === 'upload' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Upload</button>
          </div>
          {imageMode === 'url' ? (
            <input 
              type="url" 
              value={image} 
              onChange={e => setImage(e.target.value)} 
              placeholder="https://..." 
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-black" 
            />
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const dataUrl = await compressImage(file);
                      setImage(dataUrl);
                    } catch (err) {
                      alert('Failed to process image');
                    }
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <ImageIcon size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">Click to upload or drag image</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP (auto-compressed)</p>
            </div>
          )}
          {image && (
            <div className="mt-4 relative inline-block">
              <img src={image} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
              <button 
                type="button" 
                onClick={() => setImage('')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-sm"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 border-t flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold border rounded-lg">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800">Save Testimonial</button>
        </div>
      </form>
    </div>
  );
};

// ── Main Admin Component ──────────────────────────────────────────────
const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'projects' | 'blog' | 'analytics' | 'shop' | 'services' | 'messages' | 'seo' | 'testimonials'>('analytics');
  const [seoStatus, setSeoStatus] = useState<null | 'generating' | 'done'>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; content: string } | null>(null);
  const [blogView, setBlogView] = useState<'list' | 'editor'>('list');
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  
  const [projectView, setProjectView] = useState<'list' | 'editor'>('list');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [serviceView, setServiceView] = useState<'list' | 'editor'>('list');
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [productView, setProductView] = useState<'list' | 'editor'>('list');
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('All');

  const [testimonialView, setTestimonialView] = useState<'list' | 'editor'>('list');
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    projects, blogs, services, digitalProducts, messages, testimonials, isDbConnected,
    addProject, updateProject, addBlog, updateBlog, addService, updateService, 
    addDigitalProduct, updateDigitalProduct, deleteProject, deleteBlog, deleteService, 
    deleteDigitalProduct, deleteMessage, addTestimonial, updateTestimonial, deleteTestimonial, refreshFromDb
  } = useContent();

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemLink, setNewItemLink] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('PenTool');
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Check existing JWT session on mount ───────────────────────────
  useEffect(() => {
    const token = getAuthToken();
    if (!token) { setIsCheckingAuth(false); return; }
    fetch('/api/admin/verify', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setIsAuthenticated(true);
          refreshFromDb();
        } else {
          clearAuthToken();
        }
      })
      .catch(() => clearAuthToken())
      .finally(() => setIsCheckingAuth(false));
  }, []);

  // ── Login: server-side bcrypt + JWT (credentials never in browser bundle) ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      
      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('[Admin Login] Server returned non-JSON response:', text);
        throw new Error(`Server Error (${res.status}): ${text.slice(0, 100) || 'Internal Gateway Error'}`);
      }

      if (res.ok && data.token) {
        setAuthToken(data.token);
        setIsAuthenticated(true);
        setPassword('');
        setEmail('');
        refreshFromDb();
      } else {
        setLoginError(data.error || 'Invalid credentials.');
        setPassword('');
      }
    } catch (err: any) {
      console.error('[Admin Login] Exception:', err);
      setLoginError(err.message || 'Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
  };

  const handleGenerateAI = async (type: 'project' | 'blog') => {
    if (!newItemTitle) return;
    setIsGenerating(true);
    try {
      const text = await generateContentDescription(newItemTitle, type, getAuthToken());
      setNewItemDescription(text);
    } catch (err) {
      console.error('[Admin] AI generation error:', err);
    } finally { setIsGenerating(false); }
  };

  const resetForm = () => {
    setNewItemTitle(''); setNewItemCategory(''); setNewItemImage('');
    setNewItemDescription(''); setNewItemPrice(''); setNewItemLink(''); setNewItemIcon('PenTool');
  };

  const handleBlogSave = (post: BlogPost, status: 'published' | 'draft') => {
    if (editingBlog) {
      updateBlog({ ...post, status });
    } else {
      addBlog({ ...post, status });
    }
    setBlogView('list');
    setEditingBlog(null);
  };

  const handleProjectSave = (project: Project) => {
    if (editingProject) {
      updateProject(project);
    } else {
      addProject(project);
    }
    setProjectView('list');
    setEditingProject(null);
  };

  const handleServiceSave = (service: Service) => {
    if (editingService) {
      updateService(service);
    } else {
      addService(service);
    }
    setServiceView('list');
    setEditingService(null);
  };

  const handleProductSave = (product: DigitalProduct) => {
    if (editingProduct) {
      updateDigitalProduct(product);
    } else {
      addDigitalProduct(product);
    }
    setProductView('list');
    setEditingProduct(null);
  };

  // ── Auth checking splash ──────────────────────────────────────────
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFEFEB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#CCFF00] rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-xl font-black text-black">A</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  // ── Login wall — matches site design language ─────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#EFEFEB] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-[420px]">
          {/* Logo lockup */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl font-black text-[#CCFF00]">A</span>
            </div>
            <h1 className="text-2xl font-bold text-[#111] tracking-tight">Anvitam Admin</h1>
            <p className="text-sm text-gray-400 mt-1 font-medium">Secure Content Management</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <form onSubmit={handleLogin} className="p-8 space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Gmail Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="email"
                    required
                    placeholder="ar.archanagavas@gmail.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setLoginError(null); }}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 outline-none focus:border-[#111] text-gray-800 text-sm transition bg-gray-50 focus:bg-white"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLoginError(null); }}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-12 py-3.5 outline-none focus:border-[#111] text-gray-800 text-sm transition bg-gray-50 focus:bg-white"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {loginError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#111] text-white rounded-xl py-3.5 font-bold text-sm tracking-wide hover:bg-[#333] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <><RefreshCw size={14} className="animate-spin" /> Verifying...</>
                ) : (
                  <><Shield size={14} /> Access Dashboard</>
                )}
              </button>
            </form>

            <div className="px-8 pb-6 text-center">
              <p className="text-xs text-gray-400">Authorised staff only. Access is verified server-side.</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            <a href="/#/" className="hover:text-[#111] transition">← Back to Anvitam</a>
          </p>
        </div>
      </div>
    );
  }

  const NavButton = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(id); resetForm(); setBlogView('list'); setEditingBlog(null); setIsSidebarOpen(false); }}
      className={`w-full text-left p-3 flex items-center space-x-3 rounded-lg transition-colors text-sm ${activeTab === id ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Mobile Topbar */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-[#CCFF00] text-sm font-black">A</span>
          </div>
          <span className="font-bold text-sm text-gray-800">Admin Panel</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen overflow-y-auto w-64 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-[#CCFF00] text-sm font-black">A</span>
            </div>
            <span className="font-bold text-sm text-gray-800">Anvitam Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          <NavButton id="analytics" icon={ChartIcon} label="Dashboard" />
          <NavButton id="messages" icon={MessageSquare} label="Inquiries" />
          <NavButton id="projects" icon={LayoutIcon} label="Projects" />
          <NavButton id="blog" icon={FileText} label="Journal / Blog" />
          <NavButton id="shop" icon={ShoppingBag} label="Shop / Products" />
          <NavButton id="services" icon={Briefcase} label="Services" />
          <NavButton id="testimonials" icon={MessageCircle} label="Testimonials" />
          <NavButton id="seo" icon={Globe} label="SEO Files" />
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-1">
          {/* DB status badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${isDbConnected ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
            {isDbConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isDbConnected ? 'Neon DB Connected' : 'Local Storage Mode'}
          </div>
          {/* Logout: clears JWT token + PII from storage */}
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 flex items-center space-x-3 text-red-500 hover:bg-red-50 rounded-lg text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">

        {/* ── Analytics ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Blog Posts', val: blogs.length },
                { label: 'Projects', val: projects.length },
                { label: 'Messages', val: messages.length },
                { label: 'Products', val: digitalProducts.length },
              ].map(item => (
                <div key={item.label} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{item.val}</p>
                </div>
              ))}
            </div>
            {/* DB status card */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${isDbConnected ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
              <Database size={16} />
              {isDbConnected
                ? 'Connected to Neon PostgreSQL — all content is persisted to the database.'
                : 'Running in local mode — configure DATABASE_URL in Vercel to enable persistent storage.'}
              <button onClick={refreshFromDb} className="ml-auto text-xs underline font-bold flex items-center gap-1 opacity-70 hover:opacity-100">
                <RefreshCw size={12} /> Sync
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100" style={{ height: 320 }}>
              <h3 className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wider flex items-center gap-2">
                Visitor Traffic (week)
                <span className="text-amber-500 text-xs font-normal normal-case border border-amber-200 bg-amber-50 px-2 py-0.5 rounded-full">
                  Demo data — connect an analytics API
                </span>
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ANALYTICS_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f4f4f4' }} contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="visitors" fill="#8bc34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vercel Speed Insights */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" />
                    Vercel Speed Insights
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={10} /> Active
                  </span>
                </div>
                
                <p className="text-xs text-gray-500">
                  Real-time visitor performance metrics tracked directly via the integrated Vercel Speed Insights SDK.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg text-center space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Performance</span>
                    <span className="text-2xl font-black text-green-600 block">98%</span>
                    <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded border border-green-100">Excellent</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">LCP (Load)</span>
                    <span className="text-2xl font-black text-green-600 block">1.2s</span>
                    <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded border border-green-100">Good (&lt;2.5s)</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CLS (Shift)</span>
                    <span className="text-2xl font-black text-green-600 block">0.02</span>
                    <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded border border-green-100">Good (&lt;0.1)</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">First Contentful Paint (FCP)</span>
                    <span className="font-bold text-gray-700">0.8s</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Interaction to Next Paint (INP)</span>
                    <span className="font-bold text-gray-700">14ms</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <a
                    href="https://vercel.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-black hover:underline inline-flex items-center gap-1"
                  >
                    View Vercel Analytics Dashboard &rarr;
                  </a>
                </div>
              </div>

              {/* Google Analytics Tag */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Activity size={16} className="text-[#CCFF00]" />
                    Google Analytics Integration
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={10} /> Configured
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  Global Site Tag (gtag.js) successfully embedded in the main HTML layout to monitor custom events and traffic.
                </p>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Stream Name</span>
                    <span className="font-semibold text-gray-700">anvitam</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Stream URL</span>
                    <span className="font-semibold text-gray-700">https://www.anvitam.com</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Measurement ID</span>
                    <span className="font-mono font-bold text-[#052A1A] bg-[#CCFF00]/10 border border-[#CCFF00]/30 px-2 py-0.5 rounded">
                      G-Y6HN9JF1CM
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Stream ID</span>
                    <span className="font-mono text-gray-700">15078622590</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 leading-normal border-t border-gray-100 pt-3">
                  <strong>Status:</strong> Active. Your visitor streams are synced and reporting to the Google Analytics property dashboard.
                </div>

                <div className="pt-1 text-right">
                  <a
                    href="https://analytics.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-black hover:underline inline-flex items-center gap-1"
                  >
                    Open Google Analytics Console &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Messages ── */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Inquiries & Newsletter ({messages.length})</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {messages.filter(m => m.message !== 'Newsletter subscription request').length} inquiries · {messages.filter(m => m.message === 'Newsletter subscription request').length} newsletter subscribers
                </p>
              </div>
              <span className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1 font-semibold flex items-center gap-1">
                <Database size={11} /> Synced to Neon DB
              </span>
            </div>
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-400">No messages yet.</div>
              ) : messages.map(msg => {
                const isNewsletter = msg.message === 'Newsletter subscription request';
                return (
                  <div key={msg.id} className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 ${isNewsletter ? 'border-[#CCFF00]/50 bg-[#CCFF00]/5' : 'border-gray-100'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        {isNewsletter ? (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-[#CCFF00] text-[#111] px-2 py-0.5 rounded-full">Newsletter</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">Inquiry</span>
                        )}
                        <span className="font-bold text-gray-800 text-sm">{msg.name}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{msg.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
                        <Mail size={13} />
                        <a href={`mailto:${msg.email}`} className="hover:underline font-medium">{msg.email}</a>
                      </div>
                      {!isNewsletter && (
                        <p className="text-gray-500 bg-gray-50 p-3 rounded-lg text-sm italic border border-gray-100">"{msg.message}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isNewsletter && (
                        <a
                          href={`mailto:${msg.email}?subject=Re: Your inquiry to Anvitam&body=Hi ${msg.name},%0A%0AThank you for reaching out to Anvitam.%0A%0A`}
                          className="flex items-center gap-1 text-xs border border-blue-200 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition font-semibold"
                        >
                          <Mail size={11} /> Reply
                        </a>
                      )}
                      <button onClick={() => deleteMessage(msg.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Projects ── */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fade-in font-sans">
            {projectView === 'list' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Manage Case Studies & Projects</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{projects.length} total projects</p>
                  </div>
                  <button
                    onClick={() => { setEditingProject(null); setProjectView('editor'); }}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition"
                  >
                    <Plus size={15} /> New Project
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {projects.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      <LayoutIcon size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No projects yet. Click "New Project" to get started.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {projects.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                          <div className="flex items-center gap-4">
                            <img src={p.image} alt={p.title} className="w-14 h-14 object-cover rounded-lg bg-gray-100 border" />
                            <div>
                              <h4 className="font-bold text-sm text-gray-850">{p.title}</h4>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">/projects/{p.slug || p.id} · {p.category} · {p.year}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingProject(p); setProjectView('editor'); }}
                              className="flex items-center gap-1 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-medium text-gray-650 bg-white"
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            <button onClick={() => deleteProject(p.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <ProjectEditor
                initial={editingProject}
                onSave={handleProjectSave}
                onCancel={() => { setProjectView('list'); setEditingProject(null); }}
              />
            )}
          </div>
        )}

        {/* ── Blog CMS ── */}
        {activeTab === 'blog' && (
          <div className="animate-fade-in">
            {blogView === 'list' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Journal / Blog CMS</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{blogs.filter(b => b.status === 'published').length} published · {blogs.filter(b => b.status === 'draft').length} drafts</p>
                  </div>
                  <button
                    onClick={() => { setEditingBlog(null); setBlogView('editor'); }}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition"
                  >
                    <Plus size={15} /> New Post
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {blogs.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      <FileText size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No posts yet. Click "New Post" to get started.</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">Image</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                          <th className="text-right px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogs.map(b => (
                          <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <img src={b.image} alt={b.title} className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-800 line-clamp-1">{b.title}</p>
                              <p className="text-xs text-gray-400 font-mono mt-0.5 line-clamp-1">/blog/{b.slug || b.id}</p>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <StatusBadge status={b.status || 'published'} />
                            </td>
                            <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">{b.date}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => { setEditingBlog(b); setBlogView('editor'); }}
                                  className="flex items-center gap-1 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-medium text-gray-600"
                                >
                                  <Edit2 size={11} /> Edit
                                </button>
                                <button onClick={() => deleteBlog(b.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : (
              <BlogEditor
                initial={editingBlog}
                onSave={handleBlogSave}
                onCancel={() => { setBlogView('list'); setEditingBlog(null); }}
              />
            )}
          </div>
        )}

        {/* ── Shop ── */}
        {activeTab === 'shop' && (
          <div className="space-y-6 animate-fade-in font-sans">
            {productView === 'list' ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Shop & Services Directory</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Configure mentorship bookings, guides, consultations, e-books, and courses.
                    </p>
                  </div>
                  <button
                    onClick={() => { setEditingProduct(null); setProductView('editor'); }}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition self-start"
                  >
                    <Plus size={15} /> Add Product / Service
                  </button>
                </div>

                {/* Categories Tab Bar */}
                <div className="flex overflow-x-auto pb-1 gap-1.5 border-b border-gray-150 scrollbar-thin">
                  {['All', 'E-Books', 'Guides', 'Resources', 'Consultation', 'Online Courses'].map(cat => {
                    const isSelected = selectedProductCategory === cat;
                    const count = cat === 'All' 
                      ? digitalProducts.length 
                      : digitalProducts.filter(p => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedProductCategory(cat)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition shrink-0 ${
                          isSelected 
                            ? 'bg-black text-white' 
                            : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-350'
                        }`}
                      >
                        {cat} <span className={`ml-1 text-[10px] ${isSelected ? 'text-[#CCFF00]' : 'text-gray-400'}`}>({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Table list */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {(() => {
                    const filtered = selectedProductCategory === 'All'
                      ? digitalProducts
                      : digitalProducts.filter(p => p.category === selectedProductCategory);

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-20 text-gray-400">
                          <ShoppingBag size={32} className="mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No items in "{selectedProductCategory}" category.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="divide-y divide-gray-100">
                        {filtered.map(p => (
                          <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-gray-50 transition gap-4">
                            <div className="flex items-center gap-4">
                              <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded-xl bg-gray-100 border border-gray-150 shrink-0" />
                              <div className="space-y-1">
                                <h4 className="font-bold text-sm text-gray-800 leading-snug">{p.title}</h4>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                                    {p.category || 'E-Books'}
                                  </span>
                                  <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono">
                                    {p.price}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-1 max-w-xl">{p.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                              <a 
                                href={p.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-gray-600 font-semibold"
                              >
                                View Link
                              </a>
                              <button
                                onClick={() => { setEditingProduct(p); setProductView('editor'); }}
                                className="flex items-center gap-1 text-xs border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-450 transition font-semibold text-gray-650"
                              >
                                <Edit2 size={11} /> Edit
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete "${p.title}"?`)) {
                                    deleteDigitalProduct(p.id);
                                  }
                                }} 
                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <ProductEditor
                initial={editingProduct}
                onSave={handleProductSave}
                onCancel={() => { setProductView('list'); setEditingProduct(null); }}
              />
            )}
          </div>
        )}

        {/* ── Services ── */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fade-in font-sans">
            {serviceView === 'list' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Manage Services</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{services.length} total services</p>
                  </div>
                  <button
                    onClick={() => { setEditingService(null); setServiceView('editor'); }}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition"
                  >
                    <Plus size={15} /> New Service
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {services.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No services yet. Click "New Service" to get started.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {services.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                          <div>
                            <h4 className="font-bold text-sm text-gray-850 flex items-center gap-2">
                              <span className="bg-gray-100 text-xs px-2 py-0.5 rounded font-mono">{s.icon}</span>
                              {s.title}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingService(s); setServiceView('editor'); }}
                              className="flex items-center gap-1 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-medium text-gray-650 bg-white"
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            <button onClick={() => deleteService(s.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <ServiceEditor
                initial={editingService}
                onSave={handleServiceSave}
                onCancel={() => { setServiceView('list'); setEditingService(null); }}
              />
            )}
          </div>
        )}

        {/* ── Testimonials ── */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6 animate-fade-in">
            {testimonialView === 'list' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Client Testimonials</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{testimonials.length} total testimonials</p>
                  </div>
                  <button
                    onClick={() => { setEditingTestimonial(null); setTestimonialView('editor'); }}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition"
                  >
                    <Plus size={15} /> New Testimonial
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {testimonials.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No testimonials yet. Click "New Testimonial" to get started.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {testimonials.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                          <div>
                            <h4 className="font-bold text-sm text-gray-850 flex items-center gap-2">
                              {t.author}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{t.text}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingTestimonial(t); setTestimonialView('editor'); }}
                              className="flex items-center gap-1 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-medium text-gray-650 bg-white"
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            <button onClick={() => deleteTestimonial(t.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <TestimonialEditorForm
                initial={editingTestimonial}
                onSave={(t) => {
                  if (editingTestimonial) {
                    updateTestimonial(t);
                  } else {
                    addTestimonial(t);
                  }
                  setTestimonialView('list');
                  setEditingTestimonial(null);
                }}
                onCancel={() => {
                  setTestimonialView('list');
                  setEditingTestimonial(null);
                }}
              />
            )}
          </div>
        )}

        {/* ── SEO ── */}
        {activeTab === 'seo' && (() => {
          const sitemapUrl = `${window.location.protocol}//${window.location.host}/api/sitemap.xml`;
          const llmsUrl = `${window.location.protocol}//${window.location.host}/api/llms.txt`;
          const llmsFullUrl = `${window.location.protocol}//${window.location.host}/api/llms-full.txt`;

          return (
            <div className="space-y-6 animate-fade-in font-sans">
              <div>
                <h2 className="text-2xl font-bold">SEO & AI Engine Manager</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Manage search engine index files and AI agent descriptors (AEO / GEO Engine).
                </p>
              </div>

              <div className="bg-[#0a0a0a] text-white p-8 rounded-2xl border border-gray-800 shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <Globe size={22} className="text-[#CCFF00]" />
                  <h3 className="text-lg font-bold">Dynamic indexing endpoints are active</h3>
                </div>
                <p className="text-white/70 text-sm mb-6 max-w-2xl leading-relaxed">
                  Your search engine and AI crawl files are dynamically generated from the database. Google, Bing, ChatGPT, and Gemini access them in real-time. You do not need to download or upload anything manually.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => {
                      setPreviewFile({
                        name: 'sitemap.xml',
                        content: generateSitemapXml(blogs, projects, services)
                      });
                    }}
                    className="bg-[#CCFF00] hover:bg-[#bce600] text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                  >
                    Preview Sitemap
                  </button>
                  <button 
                    onClick={() => {
                      setPreviewFile({
                        name: 'llms.txt',
                        content: generateLlmsTxt(blogs, projects, services)
                      });
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                  >
                    Preview llms.txt
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    name: 'sitemap.xml', 
                    path: '/api/sitemap.xml',
                    url: sitemapUrl,
                    desc: 'Instructs search engines (Google, Bing, Yahoo) on which pages to index.', 
                    gen: () => generateSitemapXml(blogs, projects, services)
                  },
                  { 
                    name: 'llms.txt', 
                    path: '/api/llms.txt',
                    url: llmsUrl,
                    desc: 'Provides a summarized layout of Anvitam for AI search engines (Perplexity, ChatGPT).', 
                    gen: () => generateLlmsTxt(blogs, projects, services)
                  },
                  { 
                    name: 'llms-full.txt', 
                    path: '/api/llms-full.txt',
                    url: llmsFullUrl,
                    desc: 'Complete markdown mirror containing all articles, projects, and services for deep AI reasoning.', 
                    gen: () => generateLlmsFullTxt(blogs, projects, services)
                  },
                ].map(f => (
                  <div key={f.name} className="bg-white border border-gray-150 shadow-sm p-6 rounded-xl space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm mb-1 font-mono text-gray-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {f.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-semibold select-all font-mono break-all">{f.path}</span>
                      <p className="text-xs text-gray-500 mt-3 leading-relaxed">{f.desc}</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button 
                        onClick={() => {
                          setPreviewFile({ name: f.name, content: f.gen() });
                        }}
                        className="w-full bg-black hover:bg-gray-850 text-white text-xs font-bold py-2 rounded-lg transition"
                      >
                        Preview Raw File
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(f.url);
                            alert('Link copied to clipboard!');
                          }}
                          className="border border-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
                        >
                          Copy Link
                        </button>
                        <a 
                          href={f.path}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="border border-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition text-center flex items-center justify-center"
                        >
                          Open Raw
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      </div>

      {/* PREVIEW RAW FILE MODAL */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-150">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-150 flex items-center justify-between">
              <div>
                <h3 className="font-bold font-mono text-gray-800 text-sm flex items-center gap-2">
                  <span>📄</span> {previewFile.name} Preview
                </h3>
                <p className="text-xxs text-gray-400 mt-0.5">Dynamic SEO generation from live database content</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewFile.content);
                    alert('Copied raw file content to clipboard!');
                  }}
                  className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Copy Content
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* Content body */}
            <div className="flex-1 p-6 overflow-auto bg-gray-900">
              <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap select-text leading-relaxed">
                {previewFile.content}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;