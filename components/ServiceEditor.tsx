import React, { useState } from 'react';
import { 
  ArrowLeft, Save, Sparkles, AlertCircle, X, Plus, Trash2, 
  Image as ImageIcon, Link as LinkIcon, MoveUp, MoveDown, CheckCircle,
  ChevronUp, ChevronDown, Video, Play
} from 'lucide-react';
import { Service, ServiceProcess, ServiceFAQ, Project, GalleryItem } from '../types';
import { useContent } from '../context/ContentContext';

// Helper for compressing images client-side
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

interface ServiceEditorProps {
  initial?: Service | null;
  onSave: (service: Service) => void;
  onCancel: () => void;
}

const ICONS_LIST = [
  { value: 'PenTool', label: 'Pen & Design' },
  { value: 'Layout', label: 'Layout / Planning' },
  { value: 'Sprout', label: 'Sprout / Permaculture' },
  { value: 'FlaskConical', label: 'Lab / Research' },
  { value: 'Home', label: 'Home / Architecture' },
  { value: 'Heart', label: 'Heart / Wellness' },
  { value: 'Leaf', label: 'Leaf / Green' },
  { value: 'HelpCircle', label: 'General / Support' },
];

const ServiceEditor: React.FC<ServiceEditorProps> = ({ initial, onSave, onCancel }) => {
  const { projects } = useContent();

  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [icon, setIcon] = useState(initial?.icon || 'PenTool');
  const [pricing, setPricing] = useState(initial?.pricing || 'Custom Quote');
  const [bookingLink, setBookingLink] = useState(initial?.bookingLink || 'https://topmate.io/archanagavas/1799075');
  const [caseStudyId, setCaseStudyId] = useState(initial?.caseStudyId || '');
  const [caseStudyIds, setCaseStudyIds] = useState<string[]>(initial?.caseStudyIds || []);

  // Gallery
  const [gallery, setGallery] = useState<GalleryItem[]>(initial?.gallery || []);

  // Hero Image
  const [heroImage, setHeroImage] = useState(initial?.heroImage || '');
  const [heroImageMode, setHeroImageMode] = useState<'url' | 'upload'>('url');

  // Value Props (Deliverables)
  const [valueProps, setValueProps] = useState<string[]>(initial?.valueProps || []);
  const [valPropInput, setValPropInput] = useState('');

  // What It Is (paragraphs)
  const [whatItIs, setWhatItIs] = useState<string[]>(initial?.whatItIs || []);
  const [whatItIsInput, setWhatItIsInput] = useState('');

  // Who It's For (bullet points)
  const [whoItsFor, setWhoItsFor] = useState<string[]>(initial?.whoItsFor || []);
  const [whoItsForInput, setWhoItsForInput] = useState('');

  // Process Steps
  const [process, setProcess] = useState<ServiceProcess[]>(initial?.process || []);
  
  // FAQs
  const [faq, setFaq] = useState<ServiceFAQ[]>(initial?.faq || []);

  // Videos
  const [videos, setVideos] = useState<{ url: string; caption: string }[]>(initial?.videos || []);

  const [editorError, setEditorError] = useState<string | null>(null);

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

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImage(file);
        setHeroImage(base64);
      } catch (err) {
        console.error('Error uploading service image:', err);
      }
    }
  };

  const handleAddValProp = () => {
    if (valPropInput.trim()) {
      setValueProps(prev => [...prev, valPropInput.trim()]);
      setValPropInput('');
    }
  };

  const handleAddWhatItIs = () => {
    if (whatItIsInput.trim()) {
      setWhatItIs(prev => [...prev, whatItIsInput.trim()]);
      setWhatItIsInput('');
    }
  };

  const handleAddWhoItsFor = () => {
    if (whoItsForInput.trim()) {
      setWhoItsFor(prev => [...prev, whoItsForInput.trim()]);
      setWhoItsForInput('');
    }
  };

  const handleAddProcess = () => {
    setProcess(prev => [...prev, { title: '', description: '' }]);
  };

  const handleAddFaq = () => {
    setFaq(prev => [...prev, { question: '', answer: '' }]);
  };

  const getEmbedUrl = (url: string): { embedUrl: string; type: 'youtube' | 'instagram' | 'unknown' } | null => {
    if (!url.trim()) return null;
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`, type: 'youtube' };
    const igMatch = url.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
    if (igMatch) return { embedUrl: `https://www.instagram.com/${igMatch[1]}/${igMatch[2]}/embed/`, type: 'instagram' };
    return null;
  };

  const handleSubmit = () => {
    setEditorError(null);
    if (!title.trim()) { setEditorError('Service Title is required.'); return; }
    if (!description.trim()) { setEditorError('A brief description is required.'); return; }

    const service: Service = {
      id: initial?.id || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: title.trim(),
      description: description.trim(),
      icon,
      valueProps,
      heroImage: heroImage || `https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?random=${Math.floor(Math.random() * 1000)}`,
      whatItIs,
      whoItsFor,
      caseStudyId,
      caseStudyIds,
      process,
      pricing: pricing.trim(),
      faq,
      bookingLink: bookingLink.trim(),
      gallery,
      videos,
    };
    onSave(service);
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
          <span>Save Service</span>
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
        {/* Main Columns */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title & Icon */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5">Service Title *</label>
              <input
                type="text"
                placeholder="e.g. Permaculture Site Planning"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-base font-bold text-gray-900 outline-none focus:border-black placeholder-gray-400 transition bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5">Representing Icon</label>
              <select
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black bg-white"
              >
                {ICONS_LIST.map(ic => (
                  <option key={ic.value} value={ic.value}>{ic.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1.5">Brief Description / Excerpt *</label>
            <textarea
              rows={3}
              placeholder="Short paragraph summary to display on lists..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 outline-none focus:border-black placeholder-gray-400 transition resize-none bg-white"
            />
          </div>

          {/* Detailed Paragraphs (What It Is) */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-800">
              📖 What It Is (Detailed Paragraphs)
            </h4>
            <div className="space-y-3">
              {whatItIs.map((para, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-700 flex-1">{para}</p>
                  <button type="button" onClick={() => setWhatItIs(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add details paragraph about the service..."
                value={whatItIsInput}
                onChange={e => setWhatItIsInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddWhatItIs())}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black bg-white"
              />
              <button type="button" onClick={handleAddWhatItIs} className="bg-black text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-800">Add</button>
            </div>
          </div>

          {/* Process Timeline Steps */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-800">
                ⚙️ Implementation Process Steps
              </h4>
              <button
                type="button"
                onClick={handleAddProcess}
                className="flex items-center space-x-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition font-bold"
              >
                <Plus size={12} />
                <span>Add Process Step</span>
              </button>
            </div>

            {process.length > 0 ? (
              <div className="space-y-3">
                {process.map((step, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-3 bg-gray-50 relative space-y-2">
                    <button
                      type="button"
                      onClick={() => setProcess(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      title="Remove Step"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pr-6">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Step Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Concept Draft"
                          value={step.title}
                          onChange={e => setProcess(prev => prev.map((s, i) => i === idx ? { ...s, title: e.target.value } : s))}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-black bg-white"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Step Details / Deliverables</label>
                        <input
                          type="text"
                          placeholder="e.g. Detailed landscape drafts and moodboards"
                          value={step.description}
                          onChange={e => setProcess(prev => prev.map((s, i) => i === idx ? { ...s, description: e.target.value } : s))}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-black bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">No implementation steps defined yet.</p>
            )}
          </div>

          {/* Service FAQ */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-800">
                💡 Service FAQ
              </h4>
              <button
                type="button"
                onClick={handleAddFaq}
                className="flex items-center space-x-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition font-bold"
              >
                <Plus size={12} />
                <span>Add FAQ</span>
              </button>
            </div>

            {faq.length > 0 ? (
              <div className="space-y-3">
                {faq.map((q, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-3 bg-gray-50 relative space-y-2">
                    <button
                      type="button"
                      onClick={() => setFaq(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      title="Remove FAQ"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="space-y-2 pr-6">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Question</label>
                        <input
                          type="text"
                          placeholder="e.g. Do you do site visits?"
                          value={q.question}
                          onChange={e => setFaq(prev => prev.map((s, i) => i === idx ? { ...s, question: e.target.value } : s))}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-black bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Answer</label>
                        <textarea
                          rows={2}
                          placeholder="Answer details..."
                          value={q.answer}
                          onChange={e => setFaq(prev => prev.map((s, i) => i === idx ? { ...s, answer: e.target.value } : s))}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-black bg-white resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">No service FAQs added yet.</p>
            )}
          </div>

          {/* ── Videos Section ── */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-800">
                  <Video size={15} className="text-red-500" /> Service Videos
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Paste a <strong>YouTube</strong> or <strong>Instagram</strong> video/reel link — it will be automatically embedded on the service page.
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
                          placeholder="e.g. Explaining the site planning draft"
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

          {/* Screenshots Gallery Section */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-gray-800">
                  <span>🖼️</span> Service Showcase Gallery
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Upload multiple screenshot photos for this service. Visitors can browse them in a lightbox.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGallery(prev => [...prev, { url: '', caption: '' }])}
                className="flex items-center space-x-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition font-bold"
              >
                <Plus size={12} />
                <span>Add Photo</span>
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
                          placeholder="e.g. Design mockup view"
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
              <p className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">No custom screenshot photos added yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-5">
          {/* Metadata Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Service Configuration</h4>
            
            {/* Booking Link */}
            <div>
              <label className="block text-xxs font-bold uppercase tracking-widest text-gray-700 mb-1">Booking Link / Calendly</label>
              <input
                type="text"
                placeholder="https://topmate.io/..."
                value={bookingLink}
                onChange={e => setBookingLink(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition bg-white"
              />
            </div>

            {/* Pricing */}
            <div>
              <label className="block text-xxs font-bold uppercase tracking-widest text-gray-700 mb-1">Pricing Guide</label>
              <input
                type="text"
                placeholder="e.g. ₹20,000 / Session or Custom quote"
                value={pricing}
                onChange={e => setPricing(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition bg-white"
              />
            </div>

            {/* Case study mapping */}
            <div>
              <label className="block text-xxs font-bold uppercase tracking-widest text-gray-700 mb-1">Primary Case Study</label>
              <select
                value={caseStudyId}
                onChange={e => setCaseStudyId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-black bg-white"
              >
                <option value="">-- Select Related Project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Showcase Case Studies multi-select */}
            <div>
              <label className="block text-xxs font-bold uppercase tracking-widest text-gray-700 mb-2">Showcase Multiple Case Studies</label>
              <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50/50">
                {projects.map(p => {
                  const isChecked = caseStudyIds.includes(p.id);
                  return (
                    <label key={p.id} className="flex items-center gap-2 text-xs font-semibold text-gray-750 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setCaseStudyIds(prev => prev.filter(id => id !== p.id));
                          } else {
                            setCaseStudyIds(prev => [...prev, p.id]);
                          }
                        }}
                        className="rounded border-gray-350 text-black focus:ring-black focus:ring-1 cursor-pointer"
                      />
                      <span>{p.title}</span>
                    </label>
                  );
                })}
                {projects.length === 0 && (
                  <p className="text-[10px] text-gray-400 text-center py-2">No projects created yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Hero Banner Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Hero Image</h4>
            
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
                <span className="text-xxs text-gray-600 font-medium">Click to upload service banner</span>
              </label>
            )}
          </div>

          {/* Value Props Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Included Deliverables</h4>
            
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {valueProps.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
                  <span className="text-xxs font-semibold text-gray-700 flex-1 truncate">{p}</span>
                  <button type="button" onClick={() => setValueProps(prev => prev.filter((_, i) => i !== idx))} className="hover:text-red-500 text-gray-400"><X size={10} /></button>
                </div>
              ))}
              {valueProps.length === 0 && <span className="text-[10px] text-gray-400">No deliverables listed yet.</span>}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 2D Layout Blueprint"
                value={valPropInput}
                onChange={e => setValPropInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddValProp())}
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-black bg-white"
              />
              <button
                type="button"
                onClick={handleAddValProp}
                className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-850"
              >
                Add
              </button>
            </div>
          </div>

          {/* Who It's For Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Who It's For</h4>
            
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {whoItsFor.map((w, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
                  <span className="text-xxs font-semibold text-gray-700 flex-1 truncate">{w}</span>
                  <button type="button" onClick={() => setWhoItsFor(prev => prev.filter((_, i) => i !== idx))} className="hover:text-red-500 text-gray-400"><X size={10} /></button>
                </div>
              ))}
              {whoItsFor.length === 0 && <span className="text-[10px] text-gray-400">No target points added yet.</span>}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Farmowners wanting agroforestry"
                value={whoItsForInput}
                onChange={e => setWhoItsForInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddWhoItsFor())}
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-black bg-white"
              />
              <button
                type="button"
                onClick={handleAddWhoItsFor}
                className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-850"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceEditor;
