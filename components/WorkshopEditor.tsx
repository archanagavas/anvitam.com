import React, { useState } from 'react';
import { Workshop } from '../types';
import { X, Plus, Trash2, ArrowLeft, Save, Sparkles, Image as ImageIcon, Link as LinkIcon, Globe, Share2, FileText, Check } from 'lucide-react';

interface WorkshopEditorProps {
  initial?: Workshop | null;
  onSave: (workshop: Workshop) => void;
  onCancel: () => void;
}

export default function WorkshopEditor({ initial, onSave, onCancel }: WorkshopEditorProps) {
  // BASIC INFORMATION
  const [title, setTitle] = useState(initial?.title || '');
  const [organization, setOrganization] = useState(initial?.organization || '');
  const [category, setCategory] = useState<'School' | 'College' | 'Workplace' | 'Community'>(initial?.category || 'School');
  const [location, setLocation] = useState(initial?.location || '');
  const [city, setCity] = useState(initial?.city || '');
  const [state, setState] = useState(initial?.state || '');
  const [country, setCountry] = useState(initial?.country || 'India');
  const [date, setDate] = useState(initial?.date || new Date().getFullYear().toString());
  const [attendeesCount, setAttendeesCount] = useState(initial?.attendeesCount || '');
  const [description, setDescription] = useState(initial?.description || '');

  // WORKSHOP DETAILS
  const [offerings, setOfferings] = useState<string[]>(initial?.offerings || ['Bird House Making', 'Space Makeover', 'Bird Feeder Making']);
  const [offeringInput, setOfferingInput] = useState('');
  const [skillsOutcomes, setSkillsOutcomes] = useState(initial?.skillsOutcomes || '');
  const [materialsUsed, setMaterialsUsed] = useState(initial?.materialsUsed || '');
  const [impact, setImpact] = useState(initial?.impact || '');
  const [outcomes, setOutcomes] = useState(initial?.outcomes || '');

  // MEDIA (Images + Gallery Details + Video)
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageAltInput, setImageAltInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl || initial?.youtubeUrl || '');

  // RELATED CONTENT
  const [relatedProjectIds, setRelatedProjectIds] = useState<string[]>(initial?.relatedProjectIds || []);
  const [relatedServiceIds, setRelatedServiceIds] = useState<string[]>(initial?.relatedServiceIds || []);
  const [relatedArticleIds, setRelatedArticleIds] = useState<string[]>(initial?.relatedArticleIds || []);
  
  const [projectInput, setProjectInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [articleInput, setArticleInput] = useState('');

  // SEO SETTINGS
  const [slug, setSlug] = useState(initial?.slug || '');
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription || '');
  const [primaryKeyword, setPrimaryKeyword] = useState(initial?.primaryKeyword || '');
  const [secondaryKeywords, setSecondaryKeywords] = useState(initial?.secondaryKeywords || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl || '');

  // SOCIAL SHARING
  const [ogTitle, setOgTitle] = useState(initial?.ogTitle || '');
  const [ogDescription, setOgDescription] = useState(initial?.ogDescription || '');
  const [ogImage, setOgImage] = useState(initial?.ogImage || '');

  // PUBLISHING
  const [status, setStatus] = useState<'published' | 'draft'>(initial?.status || 'published');

  // Auto-generate slug & SEO defaults when title changes
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleAddOffering = (text?: string) => {
    const val = (text || offeringInput).trim();
    if (!val || offerings.includes(val)) return;
    setOfferings([...offerings, val]);
    if (!text) setOfferingInput('');
  };

  const handleRemoveOffering = (idx: number) => {
    setOfferings(offerings.filter((_, i) => i !== idx));
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setImages([...images, imageUrlInput.trim()]);
    setImageUrlInput('');
    setImageAltInput('');
    setImageCaptionInput('');
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1400;
          const MAX_HEIGHT = 1400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(dataUrl);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const compressedPromises = Array.from(files).map((file: File) => compressImageFile(file));
      const compressedImages = await Promise.all(compressedPromises);
      setImages(prev => [...prev, ...compressedImages.filter(Boolean)]);
    } catch (err) {
      console.error('Failed to compress uploaded images:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const workshopData: Workshop = {
      id: initial?.id || `workshop-${Date.now()}`,
      title: title.trim(),
      organization: organization.trim(),
      category,
      location: location.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      date: date.trim(),
      attendeesCount: attendeesCount.trim(),
      description: description.trim(),
      offerings,
      skillsOutcomes: skillsOutcomes.trim(),
      materialsUsed: materialsUsed.trim(),
      impact: impact.trim(),
      outcomes: outcomes.trim(),
      images,
      videoUrl: videoUrl.trim(),
      youtubeUrl: videoUrl.trim(),
      relatedProjectIds,
      relatedServiceIds,
      relatedArticleIds,
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      metaTitle: metaTitle.trim(),
      metaDescription: metaDescription.trim(),
      primaryKeyword: primaryKeyword.trim(),
      secondaryKeywords: secondaryKeywords.trim(),
      canonicalUrl: canonicalUrl.trim(),
      ogTitle: ogTitle.trim(),
      ogDescription: ogDescription.trim(),
      ogImage: ogImage.trim() || images[0] || '',
      status,
      createdAt: initial?.createdAt || new Date().toISOString()
    };

    onSave(workshopData);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initial ? 'Edit Workshop Entry' : 'Create New Workshop'}
            </h2>
            <p className="text-xs text-gray-500">Manage Nest N Nurture campus workshops, B2B events, and SEO settings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#CCFF00] text-black text-xs font-extrabold rounded-xl hover:scale-105 transition shadow-sm"
          >
            <Save size={16} /> Save Workshop
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            BASIC INFORMATION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
              <FileText size={14} /> Basic Information
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Workshop Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. Bird House Architecture & Campus Space Makeover"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Organization / Client *
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                placeholder="e.g. Unique School of Science, Nadiad"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 bg-white"
              >
                <option value="School">School (K-12)</option>
                <option value="College">College / Architecture University</option>
                <option value="Workplace">Workplace / Corporate Team</option>
                <option value="Community">Community / Open Bootcamp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Nadiad, Gujarat"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Nadiad"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={e => setState(e.target.value)}
                placeholder="e.g. Gujarat"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="e.g. India"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Year / Date
              </label>
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="e.g. 2025"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Attendees / Grade
              </label>
              <input
                type="text"
                value={attendeesCount}
                onChange={e => setAttendeesCount(e.target.value)}
                placeholder="e.g. Class 5th - 10th (150+ Students)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Description / Event Highlights
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Hands-on creative installation workshop conducted with students..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            WORKSHOP DETAILS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
              <Sparkles size={14} /> Workshop Details
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Offerings / Activities
            </label>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {['Bird House Making', 'Space Makeover', 'Bird Feeder Making', 'Plastic Waste Transformation', 'Tote Bag Painting', 'Wind Chime Art'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddOffering(preset)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                    offerings.includes(preset)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {offerings.includes(preset) ? '✓ ' : '+ '}[ {preset} ]
                </button>
              ))}
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={offeringInput}
                onChange={e => setOfferingInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddOffering(); } }}
                placeholder="Add custom offering..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={() => handleAddOffering()}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition"
              >
                Add Offering
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {offerings.map((off, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold">
                  {off}
                  <button type="button" onClick={() => handleRemoveOffering(idx)} className="text-emerald-700 hover:text-red-600">
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Skills / Learning Outcomes
              </label>
              <textarea
                rows={3}
                value={skillsOutcomes}
                onChange={e => setSkillsOutcomes(e.target.value)}
                placeholder="Hands-on carpentry, ecological awareness, teamwork, spatial installation..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Materials Used
              </label>
              <textarea
                rows={3}
                value={materialsUsed}
                onChange={e => setMaterialsUsed(e.target.value)}
                placeholder="Reclaimed timber, non-toxic paints, upcycled PET containers, organic ropes..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Environmental / Social Impact
              </label>
              <textarea
                rows={3}
                value={impact}
                onChange={e => setImpact(e.target.value)}
                placeholder="Increased campus biodiversity, native bird nesting shelters installed..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Workshop Outcomes
              </label>
              <textarea
                rows={3}
                value={outcomes}
                onChange={e => setOutcomes(e.target.value)}
                placeholder="15 permanent bird habitat units erected, courtyard green makeover completed..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            MEDIA (IMAGES & YOUTUBE VIDEO)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
              <ImageIcon size={14} /> Media Gallery & Live Video Embed
            </h3>
          </div>

          {/* YouTube Video Section */}
          <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200/70 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
              <Share2 size={14} className="text-emerald-700" /> YouTube Video URL (Live Action & Workshop Footage)
            </label>
            <p className="text-xs text-gray-600">
              Embed YouTube videos of campus workshops, student interviews, or space makeover transformations. These will be playable on the workshop sub-page.
            </p>
            <input
              type="text"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 bg-white font-mono"
            />

            {/* YouTube Live Preview */}
            {(() => {
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
              const match = videoUrl.match(regExp);
              const ytId = (match && match[2].length === 11) ? match[2] : null;
              if (!ytId) return null;
              return (
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-2">▶ Live Video Preview:</span>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-300 max-w-md shadow-sm">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                      title="YouTube Preview"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Slideshow Gallery Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Workshop Slideshow Gallery ({images.length} Images)
              </label>
              <span className="text-[11px] text-gray-400 font-mono">Use arrows to change slide sequence order</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                value={imageUrlInput}
                onChange={e => setImageUrlInput(e.target.value)}
                placeholder="Image URL (e.g. /workshops/bird-house.png)"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
              <input
                type="text"
                value={imageAltInput}
                onChange={e => setImageAltInput(e.target.value)}
                placeholder="Alt Text (for SEO)"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageCaptionInput}
                  onChange={e => setImageCaptionInput(e.target.value)}
                  placeholder="Caption..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition"
                >
                  Add URL
                </button>
              </div>
            </div>

            <div className="relative border border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-600 transition bg-gray-50/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 text-gray-500">
                <ImageIcon size={28} className="text-emerald-600" />
                <span className="text-xs font-bold text-gray-800">[ Add / Upload Gallery Slides ]</span>
                <span className="text-[11px] text-gray-400">Click or drag images to upload slideshow photos</span>
              </div>
            </div>

            {/* Gallery Previews Grid with Re-ordering */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden h-36 border border-gray-200 group bg-gray-100 shadow-sm flex flex-col justify-between">
                  <img src={img} alt={`Workshop slide ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold bg-black/80 text-[#CCFF00] px-2 py-0.5 rounded-full">
                        Slide #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="bg-red-600 text-white p-1 rounded-lg hover:bg-red-700 transition"
                        title="Remove slide"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newArr = [...images];
                            const temp = newArr[idx - 1];
                            newArr[idx - 1] = newArr[idx];
                            newArr[idx] = temp;
                            setImages(newArr);
                          }}
                          className="bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded hover:bg-white transition"
                        >
                          ← Move Left
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newArr = [...images];
                            const temp = newArr[idx + 1];
                            newArr[idx + 1] = newArr[idx];
                            newArr[idx] = temp;
                            setImages(newArr);
                          }}
                          className="bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded hover:bg-white transition ml-auto"
                        >
                          Move Right →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            RELATED CONTENT
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
              <LinkIcon size={14} /> Related Content
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Related Projects
              </label>
              <input
                type="text"
                value={projectInput}
                onChange={e => setProjectInput(e.target.value)}
                placeholder="e.g. Unique School Courtyard"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Related Services
              </label>
              <input
                type="text"
                value={serviceInput}
                onChange={e => setServiceInput(e.target.value)}
                placeholder="e.g. Permaculture Design"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Related Articles
              </label>
              <input
                type="text"
                value={articleInput}
                onChange={e => setArticleInput(e.target.value)}
                placeholder="e.g. Biophilic Learning Spaces"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SEO SETTINGS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
              <Globe size={14} /> SEO Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={e => setMetaTitle(e.target.value)}
                placeholder="e.g. Bird House Architecture Workshop | Anvitam"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="bird-house-architecture-workshop"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={e => setMetaDescription(e.target.value)}
              placeholder="Hands-on bird house building and campus space makeover workshop for schools and universities..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Primary Keyword
              </label>
              <input
                type="text"
                value={primaryKeyword}
                onChange={e => setPrimaryKeyword(e.target.value)}
                placeholder="e.g. bird house workshop"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Secondary Keywords
              </label>
              <input
                type="text"
                value={secondaryKeywords}
                onChange={e => setSecondaryKeywords(e.target.value)}
                placeholder="campus makeover, school eco workshop"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Canonical URL
              </label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={e => setCanonicalUrl(e.target.value)}
                placeholder="https://anvitam.com/workshops/..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SOCIAL SHARING
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
              <Share2 size={14} /> Social Sharing (Open Graph)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                OG Title
              </label>
              <input
                type="text"
                value={ogTitle}
                onChange={e => setOgTitle(e.target.value)}
                placeholder="Title for social media shares"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                OG Image URL
              </label>
              <input
                type="text"
                value={ogImage}
                onChange={e => setOgImage(e.target.value)}
                placeholder="Social banner preview image"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              OG Description
            </label>
            <input
              type="text"
              value={ogDescription}
              onChange={e => setOgDescription(e.target.value)}
              placeholder="Description displayed on Facebook/Twitter/LinkedIn cards..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PUBLISHING
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-4 pt-4 border-t border-gray-200">
          <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2">
            Publishing Status
          </label>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === 'draft'}
                onChange={() => setStatus('draft')}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-600"
              />
              <span className="text-sm text-gray-700 font-bold">Draft</span>
            </label>
            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === 'published'}
                onChange={() => setStatus('published')}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-600"
              />
              <span className="text-sm text-emerald-800 font-black flex items-center gap-1">
                <Check size={16} /> Published (Live on Website)
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 text-xs font-extrabold rounded-xl hover:bg-gray-100 transition"
            >
              [ Cancel ]
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[#CCFF00] text-black text-xs font-black rounded-xl hover:scale-105 transition shadow-md"
            >
              [ Save Workshop ]
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
