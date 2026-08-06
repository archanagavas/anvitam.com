import React, { useState } from 'react';
import { Workshop } from '../types';
import { X, Plus, Trash2, ArrowLeft, Save, Sparkles, Image as ImageIcon } from 'lucide-react';

interface WorkshopEditorProps {
  initial?: Workshop | null;
  onSave: (workshop: Workshop) => void;
  onCancel: () => void;
}

export default function WorkshopEditor({ initial, onSave, onCancel }: WorkshopEditorProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [organization, setOrganization] = useState(initial?.organization || '');
  const [location, setLocation] = useState(initial?.location || '');
  const [date, setDate] = useState(initial?.date || new Date().getFullYear().toString());
  const [category, setCategory] = useState<'School' | 'College' | 'Workplace' | 'Community'>(initial?.category || 'School');
  const [attendeesCount, setAttendeesCount] = useState(initial?.attendeesCount || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState<'published' | 'draft'>(initial?.status || 'published');
  
  const [offerings, setOfferings] = useState<string[]>(initial?.offerings || []);
  const [offeringInput, setOfferingInput] = useState('');
  
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const handleAddOffering = () => {
    if (!offeringInput.trim()) return;
    setOfferings([...offerings, offeringInput.trim()]);
    setOfferingInput('');
  };

  const handleRemoveOffering = (idx: number) => {
    setOfferings(offerings.filter((_, i) => i !== idx));
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages([...images, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const workshopData: Workshop = {
      id: initial?.id || `workshop-${Date.now()}`,
      title: title.trim(),
      organization: organization.trim(),
      location: location.trim(),
      date: date.trim(),
      category,
      attendeesCount: attendeesCount.trim(),
      description: description.trim(),
      offerings,
      images,
      status,
      createdAt: initial?.createdAt || new Date().toISOString()
    };

    onSave(workshopData);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {initial ? 'Edit Workshop Entry' : 'Create New Workshop'}
            </h2>
            <p className="text-xs text-gray-500">Manage Nest N Nurture campus workshops and B2B events</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition"
          >
            <Save size={15} /> Save Workshop
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Workshop Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Bird House Architecture & Campus Space Makeover"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
          />
        </div>

        {/* Grid 2 Cols: Organization & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Organization / School / Client *
            </label>
            <input
              type="text"
              required
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              placeholder="e.g. Unique School of Science, Nadiad"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
            >
              <option value="School">School (K-12)</option>
              <option value="College">College / Architecture University</option>
              <option value="Workplace">Workplace / Corporate Team</option>
              <option value="Community">Community / Open Bootcamp</option>
            </select>
          </div>
        </div>

        {/* Grid 3 Cols: Location, Date & Attendees Count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Nadiad, Gujarat"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Year / Date
            </label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="e.g. 2025"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Attendees Count / Grade
            </label>
            <input
              type="text"
              value={attendeesCount}
              onChange={e => setAttendeesCount(e.target.value)}
              placeholder="e.g. 150+ Students (Class 5th - 10th)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Description / Event Highlights
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the activities, student involvement, campus installations, and key outcomes..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
          />
        </div>

        {/* Offerings Chips */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Offerings Executed (Tags)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={offeringInput}
              onChange={e => setOfferingInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddOffering(); } }}
              placeholder="e.g. Bird House Making"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={handleAddOffering}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition"
            >
              Add Offering
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {offerings.map((off, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-xl text-xs font-medium">
                {off}
                <button type="button" onClick={() => handleRemoveOffering(idx)} className="text-gray-400 hover:text-red-500">
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Images Upload & Gallery */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Workshop Photos & Gallery
          </label>

          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrlInput}
                onChange={e => setImageUrlInput(e.target.value)}
                placeholder="Or paste image URL (e.g. /workshops/bird house making.png)"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition"
              >
                Add URL
              </button>
            </div>

            <div className="relative border border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-black transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1 text-gray-500">
                <ImageIcon size={24} />
                <span className="text-xs font-semibold">Click to Upload Workshop Photos</span>
              </div>
            </div>
          </div>

          {/* Photo Previews */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative rounded-xl overflow-hidden h-28 border border-gray-200 group bg-gray-50">
                <img src={img} alt={`Workshop highlight ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Publish Status
          </label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === 'published'}
                onChange={() => setStatus('published')}
                className="text-black focus:ring-black"
              />
              <span className="text-sm text-gray-800 font-medium">Published (Live on Website)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === 'draft'}
                onChange={() => setStatus('draft')}
                className="text-black focus:ring-black"
              />
              <span className="text-sm text-gray-600">Draft</span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
