import React, { useState } from 'react';
import { MaterialStatus } from '../types';
import { X } from 'lucide-react';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, sku: string, category: string, location: string, status: MaterialStatus) => void;
}

const CATEGORIES = ['Bahan Baku', 'Sparepart', 'Alat', 'Bahan Jadi', 'Lainnya'];
const STATUSES: MaterialStatus[] = ['Tersedia', 'Dalam Perjalanan', 'Sedang Digunakan', 'Dalam Perbaikan', 'Hilang/Rusak'];

export function AddMaterialModal({ isOpen, onClose, onAdd }: AddMaterialModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<MaterialStatus>(STATUSES[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !location) return;
    onAdd(name, sku, category, location, status);
    setName('');
    setSku('');
    setCategory(CATEGORIES[0]);
    setLocation('');
    setStatus(STATUSES[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-slate-800">Input Data Material</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Nama Material</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="Contoh: Semen Portland"
              value={name} onChange={e => setName(e.target.value)} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Kode / SKU</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm placeholder:text-gray-400"
                placeholder="SMN-001"
                value={sku} onChange={e => setSku(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Kategori</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={category} onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Lokasi Awal</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="Contoh: Gudang A"
              value={location} onChange={e => setLocation(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Status</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={status} onChange={e => setStatus(e.target.value as MaterialStatus)}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-6 py-3 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Simpan Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
