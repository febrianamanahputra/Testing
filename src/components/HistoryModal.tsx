import { useState, useEffect } from 'react';
import { Material, MaterialHistory } from '../types';
import { X, Clock, MapPin } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError } from '../utils/firestore-error';

interface HistoryModalProps {
  material: Material | null;
  onClose: () => void;
}

export function HistoryModal({ material, onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<MaterialHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!material) {
      setHistory([]);
      return;
    }
    
    setLoading(true);
    const q = query(
      collection(db, 'materials', material.id, 'history'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaterialHistory[];
      setHistory(records);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      handleFirestoreError(error, 'list', `materials/${material.id}/history`);
    });

    return () => unsubscribe();
  }, [material]);

  if (!material) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Riwayat Pergerakan</h2>
            <p className="text-sm text-slate-500 mt-0.5">{material.name} (<span className="font-mono text-xs">{material.sku}</span>)</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors self-start mt-1">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-8 text-slate-400">Loading records...</div>
          ) : history.length === 0 ? (
            <div className="flex justify-center p-8 text-slate-400">No records found.</div>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
              {history.map((record, index) => (
                <div key={record.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          <MapPin size={14} className={index === 0 ? 'text-blue-500' : 'text-slate-400'} />
                          {record.location}
                        </h3>
                        {index === 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-600 bg-blue-50 rounded-full uppercase">Saat Ini</span>
                        )}
                      </div>
                      {record.note && (
                        <p className="text-sm text-slate-600 mt-1">{record.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 sm:mt-0.5">
                      <Clock size={12} />
                      <time dateTime={record.timestamp}>
                        {new Date(record.timestamp).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end flex-shrink-0 bg-white">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
