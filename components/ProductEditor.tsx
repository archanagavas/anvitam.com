import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Sparkles, AlertCircle, X, Plus, Trash2, 
  Image as ImageIcon, Link as LinkIcon, Tag, CheckCircle
} from 'lucide-react';
import { DigitalProduct } from '../types';
import { generateContentDescription } from '../services/geminiService';
import { getAuthToken } from '../context/ContentContext';

// Client-side image compression
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 800; // Digital products need smaller thumb resolution
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = ev.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

interface ProductEditorProps {
  initial?: DigitalProduct | null;
  onSave: (product: DigitalProduct) => void;
  onCancel: () => void;
}

const PRODUCT_CATEGORIES = [
  'E-Books',
  'Guides',
  'Resources',
  'Consultation',
  'Online Courses'
];

const ProductEditor: React.FC<ProductEditorProps> = ({ initial, onSave, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [link, setLink] = useState(initial?.link || '');
  const [category, setCategory] = useState(initial?.category || 'E-Books');
  const [image, setImage] = useState(initial?.image || '');
  const [description, setDescription] = useState(initial?.description || '');
  
  // Tags
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initial?.tags || []);

  const [isCompressing, setIsCompressing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
    } catch (err: any) {
      setError('Failed to process image: ' + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags(prev => [...prev, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleGenerateAI = async () => {
    if (!title) {
      setError('Please provide a title first to guide the AI.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const prompt = `Write a high-converting digital product description (2 to 3 paragraphs) for a product titled "${title}". Category: ${category}. Price: ${price || 'Free'}. Focus on sustainability, architecture, permaculture, or professional guidance matching the principal architect theme. Do not write HTML wrappers. Just return plain text paragraphs.`;
      const generated = await generateContentDescription(prompt, 'blog', getAuthToken());
      setDescription(generated);
    } catch (err: any) {
      setError('AI generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Product title is required.');
      return;
    }
    if (!price.trim()) {
      setError('Price is required.');
      return;
    }
    if (!link.trim()) {
      setError('Purchase / booking link is required.');
      return;
    }

    const payload: DigitalProduct = {
      id: initial?.id || crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      price: price.trim(),
      link: link.trim(),
      image: image || 'https://picsum.photos/400/300?random=product',
      tags,
      category
    };

    setSaveSuccess(true);
    setTimeout(() => {
      onSave(payload);
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 py-5 bg-gray-50 border-b border-gray-150 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-150 rounded-xl transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {initial ? 'Edit Product' : 'Create New Product'}
            </h3>
            <p className="text-xxs text-gray-400 mt-0.5">
              {initial ? 'Update shop listing fields' : 'Fill details to add to shop index'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saveSuccess}
          className="bg-black hover:bg-gray-850 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          {saveSuccess ? (
            <><CheckCircle size={14} /> Saved!</>
          ) : (
            <><Save size={14} /> Save Product</>
          )}
        </button>
      </div>

      {/* Main body */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main fields (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Name / Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Masterclass: Biophilic Architecture Portfolio"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition text-gray-800"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition uppercase tracking-wider"
                >
                  <Sparkles size={11} /> {isGenerating ? 'Drafting...' : 'Generate with Gemini'}
                </button>
              </div>
              <textarea 
                rows={5}
                required
                placeholder="Describe what resources, files, or services are included in this item..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition text-gray-800 leading-relaxed"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Links and Prices grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Link */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Topmate or Booking Link</label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="url" 
                    required
                    placeholder="https://topmate.io/ar_archana_gavas/..."
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-black transition text-gray-800"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price label</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. ₹999 or Free or ₹4,999"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition text-gray-800"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right sidebar fields (Category, Tags, Image) */}
          <div className="space-y-6">
            {/* Category dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shop Category Section</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black bg-white transition text-gray-800"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Thumbnail Image */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Thumbnail</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-gray-450 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-gray-50 relative aspect-video overflow-hidden group"
              >
                {image ? (
                  <>
                    <img src={image} alt="Upload preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="text-white text-xs font-bold">Replace Image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-1">
                    <ImageIcon size={28} className="mx-auto text-gray-300" />
                    <p className="text-xxs font-bold text-gray-500">
                      {isCompressing ? 'Processing...' : 'Upload cover photo'}
                    </p>
                    <p className="text-[9px] text-gray-400">JPG, PNG (max 8MB, auto compressed)</p>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <input 
                type="text"
                placeholder="Or paste external image URL..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black transition text-gray-650"
                value={image}
                onChange={e => setImage(e.target.value)}
              />
            </div>

            {/* Tag system */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Features / Tags</label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 border border-gray-155 rounded-xl bg-gray-50/50">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 text-[10px] font-bold bg-gray-150 text-gray-750 px-2.5 py-1 rounded-full">
                    {t}
                    <button type="button" onClick={() => handleRemoveTag(t)} className="text-gray-400 hover:text-red-500 transition">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {tags.length === 0 && <span className="text-xxs text-gray-400 p-1">No tags yet.</span>}
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Guided Session"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-black transition text-gray-750"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-black hover:bg-gray-850 text-white text-[10px] font-bold uppercase tracking-wider px-3 rounded-lg transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductEditor;
