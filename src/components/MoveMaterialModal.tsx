import React, { useState, useEffect } from 'react';
import { MaterialStatus, Material } from '../types';
import { X, MapPin } from 'lucide-react';

interface MoveMaterialModalProps {
  material: Material | null;
  onClose: () => void;
  onMove: (id: string, location: string, status: MaterialStatus, note: string) => void;
}

const STATUSES: MaterialStatus[] = ['Tersedia', 'Dalam Perjalanan', 'Sedang Digunakan', 'Dalam Perbaikan', 'Hilang/Rusak'];

export function MoveMaterialModal({ material, onClose, onMove }: MoveMaterialModalProps) {
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<MaterialStatus>(STATUSES[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (material) {
      setLocation('');
      setStatus(material.status);
      setNote('');
    }
  }, [material]);

  if (!material) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    onMove(material.id, location, status, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-slate-800">Perbarui Lokasi</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-4 bg-gray-50 rounded-xl flex gap-3 items-start border border-gray-200">
            <div className="mt-0.5 text-slate-400">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{material.name}</p>
              <p className="text-xs text-slate-500 mt-0.5"><span className="font-mono">{material.sku}</span> &bull; Lokasi saat ini: <span className="font-medium text-slate-700">{material.currentLocation}</span></p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Lokasi Baru</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="Contoh: Site Proyek B"
              value={location} onChange={e => setLocation(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Status Barang</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={status} onChange={e => setStatus(e.target.value as MaterialStatus)}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Catatan Tambahan (Opsional)</label>
            <textarea 
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-400"
              placeholder="Contoh: Dikirim menggunakan truk"
              value={note} onChange={e => setNote(e.target.value)} 
            />
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
              Perbarui Lokasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
