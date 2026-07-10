import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Save, Sparkles, AlertCircle, X, Plus, Trash2, 
  Image as ImageIcon, Link as LinkIcon, Hash, CheckCircle, ChevronUp, ChevronDown,
  Video, Play, Globe
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { Project, GalleryItem } from '../types';
import { generateContentDescription } from '../services/geminiService';
import { getAuthToken } from '../context/ContentContext';

// Quill configuration for rich text sanitisation (OWASP A03)
const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
    'ol', 'ul', 'li', 'a', 'img', 'blockquote', 'pre', 'span'
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel']
};

declare global {
  interface Window {
    Quill: any;
  }
}

// Helper to load Quill dynamically
function loadQuill(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Quill) {
      resolve();
      return;
    }
    if (!document.getElementById('quill-css')) {
      const link = document.createElement('link');
      link.id = 'quill-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

// Slug helper
const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

// Image compression client-side
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
            width = MAX_DIM;
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = ev.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

interface ProjectEditorProps {
  initial?: Project | null;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ initial, onSave, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [location, setLocation] = useState(initial?.location || 'Vadodara');
  const [year, setYear] = useState(initial?.year || new Date().getFullYear().toString());
  const [description, setDescription] = useState(initial?.description || '');
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription || '');
  const [metaKeywords, setMetaKeywords] = useState(initial?.metaKeywords || '');
  const [metaRobots, setMetaRobots] = useState(initial?.metaRobots || 'index, follow');
  
  // Cover Image
  const [image, setImage] = useState(initial?.image || '');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  
  // Hero Image
  const [heroImage, setHeroImage] = useState(initial?.heroImage || '');
  const [heroImageMode, setHeroImageMode] = useState<'url' | 'upload'>('url');

  // Tags
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Gallery
  const [gallery, setGallery] = useState<GalleryItem[]>(initial?.gallery || []);

  // Videos
  const [videos, setVideos] = useState<{ url: string; caption: string }[]>(initial?.videos || []);

  // FAQs
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(initial?.faqs || []);

  const [status, setStatus] = useState<'ongoing' | 'delivered' | ''>(initial?.status || '');
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured || false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [slugManual, setSlugManual] = useState(!!initial?.slug);
  const [editorError, setEditorError] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [quillReady, setQuillReady] = useState(false);

  // Auto-generate slug
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
        placeholder: 'Enter rich details or case study text here...',
      });
      if (initial?.fullDescription) {
        q.clipboard.dangerouslyPasteHTML(DOMPurify.sanitize(initial.fullDescription, RICH_TEXT_CONFIG));
      }
      quillRef.current = q;
      if (mounted) setQuillReady(true);
    });
    return () => { mounted = false; };
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImage(file);
        setImage(base64);
      } catch (err) {
        console.error('Error uploading cover image:', err);
      }
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImage(file);
        setHeroImage(base64);
      } catch (err) {
        console.error('Error uploading hero image:', err);
      }
    }
  };

  const handleGalleryItemUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImage(file);
        setGallery(prev => prev.map((item, idx) => idx === index ? { ...item, url: base64 } : item));
      } catch (err) {
        console.error('Error uploading gallery image:', err);
      }
    }
  };

  const handleAIDescription = async () => {
    if (!title) { setEditorError('Please enter a project title before generating AI description.'); return; }
    setEditorError(null);
    setIsGenerating(true);
    try {
      const text = await generateContentDescription(title, 'project', getAuthToken());
      setDescription(text);
    } catch (err) {
      console.error('[ProjectEditor] AI description error:', err);
      setEditorError('AI generation failed. Check API configuration.');
    } finally { setIsGenerating(false); }
  };

  const addTag = (raw: string) => {
    const items = raw.split(',').map(s => s.trim().substring(0, 50)).filter(Boolean);
    if (items.length > 0) {
      setTags(prev => Array.from(new Set([...prev, ...items])));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(prev => prev.filter((_, idx) => idx !== index));
  };

  const moveGalleryItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === gallery.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const nextGallery = [...gallery];
    const temp = nextGallery[index];
    nextGallery[index] = nextGallery[targetIdx];
    nextGallery[targetIdx] = temp;
    setGallery(nextGallery);
  };

  // ── Video embed URL parser ───────────────────────────────────────────
  const getEmbedUrl = (url: string): { embedUrl: string; type: 'youtube' | 'instagram' | 'unknown' } | null => {
    if (!url.trim()) return null;
    // YouTube: watch, shorts, youtu.be
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`, type: 'youtube' };
    // Instagram: /reel/, /p/, /tv/
    const igMatch = url.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
    if (igMatch) return { embedUrl: `https://www.instagram.com/${igMatch[1]}/${igMatch[2]}/embed/`, type: 'instagram' };
    return null;
  };

  const handleSubmit = () => {
    setEditorError(null);
    if (!title.trim()) { setEditorError('Project Name / Client is required.'); return; }
    
    const rawContent = quillRef.current ? quillRef.current.root.innerHTML : (initial?.fullDescription || '');
    const fullDescription = DOMPurify.sanitize(rawContent, RICH_TEXT_CONFIG) as string;

    const project: Project = {
      id: initial?.id || crypto.randomUUID(),
      title: title.trim(),
      slug: slug || toSlug(title),
      category: category.trim() || 'Residential',
      location: location.trim(),
      year: year.trim(),
      image: image || `https://picsum.photos/1200/800?random=${Math.floor(Math.random() * 9999)}`,
      heroImage: heroImage || image || `https://picsum.photos/1200/800?random=${Math.floor(Math.random() * 9999)}`,
      description: description.trim(),
      fullDescription,
      gallery,
      videos,
      isFeatured,
      status: status || undefined,
      tags,
      faqs,
      specs: initial?.specs || [],
      story: initial?.story || [],
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim() || description.trim(),
      metaKeywords: metaKeywords.trim(),
      metaRobots: metaRobots.trim(),
    };
    onSave(project);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium">
          <ArrowLeft size={16} />
          <span>Back to list</span>
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center space-x-1.5 bg-black text-white text-sm px-6 py-2 rounded-lg hover:bg-gray-800 transition font-bold"
        >
          <Save size={14} />
          <span>Save Case Study</span>
        </button>
      </div>

      {editorError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
          <AlertCircle size={14} className="shrink-0" />
          <span className="flex-1">{editorError}</span>
          <button onClick={() => setEditorError(null)}><X size={13} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5">Client / Case Study Name *</label>
            <input
              type="text"
              placeholder="e.g. Malhar Farm Retreat or Solana predictions"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-black placeholder-gray-400 transition bg-white"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5 flex items-center gap-1">
              <Hash size={11} /> URL Slug
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-black transition bg-white">
              <span className="text-gray-600 text-sm px-3 py-2.5 bg-gray-50 border-r border-gray-200 select-none">URL: /projects/</span>
              <input
                type="text"
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                className="flex-1 px-3 py-2.5 text-sm outline-none font-mono text-gray-800"
                placeholder="malhar-farm-retreat"
              />
              {slugManual && (
                <button onClick={() => { setSlugManual(false); setSlug(toSlug(title)); }} className="px-3 text-xs text-gray-500 hover:text-gray-800 border-l border-gray-200 py-2.5">Reset</button>
              )}
            </div>
          </div>

          {/* Short description */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700">Tagline / Brief Summary</label>
              <button onClick={handleAIDescription} disabled={isGenerating} className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                <Sparkles size={11} /> {isGenerating ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Brief tagline or summary of the case study (shows in list pages)..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 outline-none focus:border-black placeholder-gray-400 transition resize-none bg-white"
            />
          </div>

          {/* Full Rich Case Study */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5">Full Case Study Details (Rich Text / CMS)</label>
            <div ref={editorRef} />
          </div>

          {/* Screenshots Gallery Section */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-800">
                  <span>🖼️</span> Slideshow Screenshots Gallery
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Upload multiple screens/photos of the project. Visitors will be able to navigate next/previous.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGallery(prev => [...prev, { url: '', caption: '' }])}
                className="flex items-center space-x-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition font-bold"
              >
                <Plus size={12} />
                <span>Add Screenshot</span>
              </button>
            </div>

            {gallery.length > 0 ? (
              <div className="space-y-3 mt-2">
                {gallery.map((item, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex flex-col md:flex-row gap-4 relative">
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      <button type="button" onClick={() => moveGalleryItem(index, 'up')} className="text-gray-400 hover:text-gray-700 p-1 bg-white border rounded shadow-xs" title="Move Up"><ChevronUp size={12} /></button>
                      <button type="button" onClick={() => moveGalleryItem(index, 'down')} className="text-gray-400 hover:text-gray-700 p-1 bg-white border rounded shadow-xs" title="Move Down"><ChevronDown size={12} /></button>
                      <button type="button" onClick={() => setGallery(prev => prev.filter((_, idx) => idx !== index))} className="text-gray-400 hover:text-red-500 p-1 bg-white border rounded shadow-xs ml-1" title="Remove"><Trash2 size={12} /></button>
                    </div>

                    {/* Left: Image selector */}
                    <div className="w-full md:w-44 flex-shrink-0 space-y-2">
                      <div className="w-full h-24 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.url ? (
                          <img src={item.url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-400" />
                        )}
                      </div>
                      <label className="block w-full border border-gray-200 rounded-lg py-1.5 text-center cursor-pointer hover:border-gray-400 transition bg-white text-xs font-semibold">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleGalleryItemUpload(index, e)}
                        />
                        Upload file
                      </label>
                    </div>

                    {/* Right: Caption & URL fallback */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-xxs font-bold uppercase tracking-widest text-gray-500 mb-1">Or Image URL</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={item.url.startsWith('data:') ? '' : item.url}
                          onChange={e => setGallery(prev => prev.map((it, idx) => idx === index ? { ...it, url: e.target.value } : it))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-black bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xxs font-bold uppercase tracking-widest text-gray-500 mb-1">Caption / Details</label>
                        <input
                          type="text"
                          placeholder="e.g. Aerial planning blueprint"
                          value={item.caption}
                          onChange={e => setGallery(prev => prev.map((it, idx) => idx === index ? { ...it, caption: e.target.value } : it))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-black bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">No screenshots added yet. Add some to display a slideshow.</p>
            )}
          </div>

          {/* ── Videos Section ── */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-800">
                  <Video size={15} className="text-red-500" /> Project Videos
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Paste a <strong>YouTube</strong> or <strong>Instagram</strong> video/reel link — it will be automatically embedded on the project page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVideos(prev => [...prev, { url: '', caption: '' }])}
                className="flex items-center space-x-1.5 bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 transition font-bold"
              >
                <Plus size={12} />
                <span>Add Video</span>
              </button>
            </div>

            {videos.length > 0 ? (
              <div className="space-y-4 mt-2">
                {videos.map((vid, index) => {
                  const embed = getEmbedUrl(vid.url);
                  const isYT = embed?.type === 'youtube';
                  const isIG = embed?.type === 'instagram';
                  return (
                    <div key={index} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => setVideos(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* URL Input */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                          {isYT && <span className="text-red-500">▶ YouTube</span>}
                          {isIG && <span className="text-pink-500">📷 Instagram</span>}
                          {!isYT && !isIG && 'Video URL (YouTube or Instagram)'}
                        </label>
                        <div className="relative">
                          <Play size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="https://youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                            value={vid.url}
                            onChange={e => setVideos(prev => prev.map((v, i) => i === index ? { ...v, url: e.target.value } : v))}
                            className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-black bg-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Caption */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Caption (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Aerial drone walkthrough of the farm retreat"
                          value={vid.caption}
                          onChange={e => setVideos(prev => prev.map((v, i) => i === index ? { ...v, caption: e.target.value } : v))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black bg-white"
                        />
                      </div>

                      {/* Live Preview */}
                      {embed ? (
                        <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border-b border-gray-700">
                            {isYT && <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">▶ YouTube Preview</span>}
                            {isIG && <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">📷 Instagram Preview</span>}
                            <span className="text-[10px] text-gray-500 ml-auto">Live embed</span>
                          </div>
                          <iframe
                            src={embed.embedUrl}
                            className={`w-full border-0 ${isIG ? 'h-[540px]' : 'h-48'}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                            title={vid.caption || 'Video embed'}
                          />
                        </div>
                      ) : vid.url.trim() ? (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <AlertCircle size={13} />
                          <span className="text-xs">Paste a valid YouTube or Instagram link to see a preview.</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <Video size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-400 font-medium">No videos added yet.</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Add YouTube or Instagram links — they'll be embedded automatically.</p>
              </div>
            )}
          </div>

          {/* FAQ Schema Builder */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-800">
                  <span>💡</span> FAQ Schema Builder (AEO/SEO/GEO Engine)
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Add FAQs that will be automatically embedded as JSON-LD schema markup. Helps search engines index client project Q&As.
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
                        placeholder="e.g. How long did this permaculture project take?"
                        value={faq.question}
                        onChange={e => {
                          const next = [...faqs];
                          next[index].question = e.target.value;
                          setFaqs(next);
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold uppercase tracking-widest text-gray-600 mb-1">Answer</label>
                      <textarea
                        rows={2}
                        placeholder="Provide details..."
                        value={faq.answer}
                        onChange={e => {
                          const next = [...faqs];
                          next[index].answer = e.target.value;
                          setFaqs(next);
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition resize-none bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">No project FAQs added yet.</p>
            )}
          </div>

          {/* SEO Settings Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-800">🔍 SEO Settings</h4>
            
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-gray-600 mb-1">Meta Keywords</label>
                <input
                  type="text"
                  placeholder="e.g. permaculture, architecture, eco retreat"
                  value={metaKeywords}
                  onChange={e => setMetaKeywords(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition text-gray-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-gray-600 mb-1">Robots Tag (Meta Robots)</label>
                <select
                  value={metaRobots}
                  onChange={e => setMetaRobots(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition text-gray-800 bg-white"
                >
                  <option value="index, follow">index, follow (Default)</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar settings column */}
        <div className="space-y-5">
          {/* Metadata Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Case Study Metadata</h4>
            
            {/* Category */}
            <div>
              <label className="block text-xxs font-bold uppercase tracking-widest text-gray-700 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Residential, Retreat, Farm"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition bg-white"
              />
            </div>

            {/* Location & Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Vadodara"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition bg-white"
                />
              </div>
              <div>
                <label className="block text-xxs font-bold uppercase tracking-widest text-gray-700 mb-1">Project Year</label>
                <input
                  type="text"
                  placeholder="2026"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition bg-white"
                />
              </div>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-xxs font-bold uppercase tracking-widest text-gray-700 mb-1">Project Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'ongoing' | 'delivered' | '')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition bg-white"
              >
                <option value="">Not specified</option>
                <option value="ongoing">Ongoing</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Featured Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-2 select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
              />
              <span className="text-xs text-gray-700 font-bold">Feature on Homepage</span>
            </label>
          </div>

          {/* Cover Image Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Cover Image</h4>
            
            {image && (
              <img src={image} className="w-full h-36 object-cover rounded-lg border" alt="Cover Preview" />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex-1 py-1.5 text-center text-xxs rounded font-bold border transition ${
                  imageMode === 'url' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                URL Link
              </button>
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`flex-1 py-1.5 text-center text-xxs rounded font-bold border transition ${
                  imageMode === 'upload' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Upload File
              </button>
            </div>

            {imageMode === 'url' ? (
              <div className="relative">
                <LinkIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={image.startsWith('data:') ? '' : image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-black transition bg-white"
                />
              </div>
            ) : (
              <label className="block w-full border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-gray-400 transition bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
                <ImageIcon size={16} className="mx-auto text-gray-400 mb-1" />
                <span className="text-xxs text-gray-600 font-medium">Click to upload image file</span>
              </label>
            )}
          </div>

          {/* Hero Banner Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Hero Image (Large Banner)</h4>
            
            {heroImage && (
              <img src={heroImage} className="w-full h-36 object-cover rounded-lg border" alt="Hero Preview" />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHeroImageMode('url')}
                className={`flex-1 py-1.5 text-center text-xxs rounded font-bold border transition ${
                  heroImageMode === 'url' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                URL Link
              </button>
              <button
                type="button"
                onClick={() => setHeroImageMode('upload')}
                className={`flex-1 py-1.5 text-center text-xxs rounded font-bold border transition ${
                  heroImageMode === 'upload' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Upload File
              </button>
            </div>

            {heroImageMode === 'url' ? (
              <div className="relative">
                <LinkIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={heroImage.startsWith('data:') ? '' : heroImage}
                  onChange={e => setHeroImage(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-black transition bg-white"
                />
              </div>
            ) : (
              <label className="block w-full border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-gray-400 transition bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeroUpload}
                />
                <ImageIcon size={16} className="mx-auto text-gray-400 mb-1" />
                <span className="text-xxs text-gray-600 font-medium">Click to upload hero banner</span>
              </label>
            )}
          </div>

          {/* Tags Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Tags / Tech Stack</h4>
            
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 bg-gray-150 text-gray-800 text-xxs px-2 py-0.5 rounded font-bold">
                  {t}
                  <button type="button" onClick={() => removeTag(idx)} className="hover:text-red-500"><X size={10} /></button>
                </span>
              ))}
              {tags.length === 0 && <span className="text-[10px] text-gray-400">No tags added yet.</span>}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Web3, Solana (comma separated)"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-black bg-white"
              />
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-850"
              >
                Add
              </button>
            </div>
          </div>

          {/* SEO Settings Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 flex items-center gap-1.5"><Globe size={12} /> SEO Settings</h4>
            
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

            <div>
              <label className="block text-xxs font-bold uppercase tracking-widest text-gray-600 mb-1">Meta Keywords</label>
              <input
                type="text"
                placeholder="e.g. permaculture, architecture, eco retreat"
                value={metaKeywords}
                onChange={e => setMetaKeywords(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition text-gray-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-xxs font-bold uppercase tracking-widest text-gray-600 mb-1">Robots Tag (Meta Robots)</label>
              <select
                value={metaRobots}
                onChange={e => setMetaRobots(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition text-gray-800 bg-white"
              >
                <option value="index, follow">index, follow (Default)</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="index, nofollow">index, nofollow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
