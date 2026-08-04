import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { EstimatorService } from '../types';
import { Plus, Trash2, Edit2, Save, ArrowLeft, AlertCircle, CheckCircle, Calculator, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { PPP_COUNTRIES, calculatePPPPrice, getCountryByCode } from '../utils/pppPricing';

export default function EstimatorEditor({ showToast }: { showToast: (msg: string) => void }) {
  const { estimatorServices, addEstimatorService, updateEstimatorService, deleteEstimatorService } = useContent();

  const [editingService, setEditingService] = useState<EstimatorService | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPppTable, setShowPppTable] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🌿');
  const [desc, setDesc] = useState('');
  const [subs, setSubs] = useState<string[]>([]);
  const [baseINR, setBaseINR] = useState<number[]>([]);

  const startEdit = (s: EstimatorService) => {
    setEditingService(s);
    setIsCreating(false);
    setTitle(s.title);
    setIcon(s.icon || '🌿');
    setDesc(s.desc || '');
    setSubs([...s.subs]);
    setBaseINR([...s.baseINR]);
  };

  const startCreate = () => {
    setEditingService(null);
    setIsCreating(true);
    setTitle('');
    setIcon('🌿');
    setDesc('');
    setSubs(['Initial Consultation & Site Reading', 'Concept Layout & Master Plan']);
    setBaseINR([15000, 25000]);
  };

  const cancel = () => {
    setEditingService(null);
    setIsCreating(false);
  };

  const handleSubChange = (index: number, newName: string) => {
    const updated = [...subs];
    updated[index] = newName;
    setSubs(updated);
  };

  const handlePriceChange = (index: number, newPrice: string) => {
    const num = parseInt(newPrice.replace(/[^0-9]/g, ''), 10) || 0;
    const updated = [...baseINR];
    updated[index] = num;
    setBaseINR(updated);
  };

  const addSubService = () => {
    setSubs([...subs, 'New Deliverable Scope']);
    setBaseINR([...baseINR, 10000]);
  };

  const removeSubService = (index: number) => {
    if (subs.length <= 1) {
      alert('A service must have at least one deliverable/sub-service.');
      return;
    }
    setSubs(subs.filter((_, i) => i !== index));
    setBaseINR(baseINR.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a service title.');
      return;
    }

    const serviceId = editingService ? editingService.id : title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const updatedItem: EstimatorService = {
      id: serviceId,
      title: title.trim(),
      icon: icon.trim() || '🌿',
      desc: desc.trim(),
      subs: subs.map(s => s.trim()).filter(Boolean),
      baseINR: baseINR.map(p => Math.max(0, Number(p) || 0))
    };

    if (editingService) {
      await updateEstimatorService(updatedItem);
      showToast(`Updated "${updatedItem.title}" estimator pricing!`);
    } else {
      await addEstimatorService(updatedItem);
      showToast(`Added new estimator service "${updatedItem.title}"!`);
    }

    cancel();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the cost estimator?`)) {
      await deleteEstimatorService(id);
      showToast(`Deleted "${name}" service.`);
    }
  };

  if (isCreating || editingService) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <button
            onClick={cancel}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Services List
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {editingService ? `Edit "${editingService.title}"` : 'Create New Estimator Service'}
          </h2>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Icon (Emoji / Symbol)</label>
              <input
                type="text"
                required
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder="e.g. 🌿 or 🏡"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Permaculture Design or Farm Retreat Architecture"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none transition font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Short Description</label>
            <input
              type="text"
              required
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="e.g. Comprehensive site analysis, food forest zonation & land masterplan"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none transition"
            />
          </div>

          {/* Sub-services / Deliverables Table */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Calculator size={18} className="text-[#8bc34a]" /> Deliverables & Base Pricing Breakdown (₹ INR)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set base price in Indian Rupees (₹). World Bank PPP parity automatically converts and scales pricing for USA, UK, Europe, Australia & 40+ countries.
                </p>
              </div>
              <button
                type="button"
                onClick={addSubService}
                className="inline-flex items-center gap-1.5 bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer shrink-0"
              >
                <Plus size={14} /> Add Deliverable
              </button>
            </div>

            <div className="space-y-4">
              {subs.map((subName, i) => {
                const inr = baseINR[i] || 0;
                return (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/90 space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-6 shrink-0">{i + 1}.</span>
                      <input
                        type="text"
                        required
                        value={subName}
                        onChange={e => handleSubChange(i, e.target.value)}
                        placeholder="Deliverable name (e.g. Master Plan Layout)"
                        className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold bg-white focus:border-black outline-none"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative w-40">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">₹</span>
                          <input
                            type="number"
                            required
                            value={inr}
                            onChange={e => handlePriceChange(i, e.target.value)}
                            placeholder="Base INR"
                            className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-xs font-bold font-mono bg-white focus:border-black outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSubService(i)}
                          className="p-2.5 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                          title="Remove deliverable"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* PPP Country Previews Pill */}
                    <div className="pl-9 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mr-1">PPP Live Previews:</span>
                      <span className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-mono">🇮🇳 {calculatePPPPrice(inr, 'IN')}</span>
                      <span className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-mono">🇺🇸 {calculatePPPPrice(inr, 'US')}</span>
                      <span className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-mono">🇬🇧 {calculatePPPPrice(inr, 'GB')}</span>
                      <span className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-mono">🇪🇺 {calculatePPPPrice(inr, 'DE')}</span>
                      <span className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-mono">🇦🇺 {calculatePPPPrice(inr, 'AU')}</span>
                      <span className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-mono">🇨🇦 {calculatePPPPrice(inr, 'CA')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={cancel}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Save size={15} /> Save Estimator Service
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="text-black" size={24} /> Estimator Pricing & Services Manager
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Add, remove, or modify services, sub-services, and base INR pricing. Changes instantly reflect on the client Estimator Modal.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-[#CCFF00] text-black px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#b8e600] transition shadow-sm cursor-pointer shrink-0"
        >
          <Plus size={16} /> Add New Estimator Service
        </button>
      </div>

      {/* Services List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {estimatorServices.map(s => {
          const minCost = s.baseINR.length ? Math.min(...s.baseINR) : 0;
          const maxCost = s.baseINR.length ? Math.max(...s.baseINR) : 0;

          return (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-gray-50 p-2.5 rounded-2xl border border-gray-100">{s.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base">{s.title}</h3>
                      <p className="text-xs text-gray-400 font-medium">{s.subs.length} Deliverable Options</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(s)}
                      className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
                      title="Edit Service"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.title)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Service"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">{s.desc}</p>

                {/* Deliverables tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {s.subs.slice(0, 5).map((sub, i) => (
                    <span key={i} className="text-[11px] bg-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded-md">
                      {sub} (₹{(s.baseINR[i] || 0).toLocaleString('en-IN')})
                    </span>
                  ))}
                  {s.subs.length > 5 && (
                    <span className="text-[11px] bg-gray-50 text-gray-400 font-semibold px-2 py-1 rounded-md">
                      +{s.subs.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">INR Range:</span>
                <span className="font-bold text-black font-mono">
                  ₹{minCost.toLocaleString('en-IN')} – ₹{maxCost.toLocaleString('en-IN')} / deliverable
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* World Bank Purchasing Power Parity (PPP) Reference Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Globe className="text-blue-600" size={20} />
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Purchasing Power Parity (PPP) Pricing Reference</h3>
              <p className="text-xs text-gray-500">
                Benchmarked against base ₹100 in India (IN) using World Bank PPP data. Default prices increase proportionally for high purchasing power countries.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPppTable(!showPppTable)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            {showPppTable ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showPppTable ? 'Hide PPP Benchmarks' : 'View World Bank PPP Benchmarks'}
          </button>
        </div>

        {showPppTable && (
          <div className="border-t border-gray-100 pt-4 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto pr-1">
              {PPP_COUNTRIES.map(c => {
                const targetRatio = c.targetPriceRatio;
                const sampleDisplay = calculatePPPPrice(100, c.code);
                return (
                  <div key={c.code} className="bg-gray-50 border border-gray-200/80 rounded-xl p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-gray-800">
                      <span className="truncate">{c.flag} {c.name}</span>
                      <span className="text-[10px] text-gray-400">({c.code})</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gray-400">Base ₹100</span>
                      <span className="font-bold text-emerald-700">₹{targetRatio}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 text-right font-bold font-mono border-t border-gray-200/60 pt-1">
                      {sampleDisplay}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
