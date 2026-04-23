import { useState, useMemo } from 'react';
import { useMaterials } from './hooks/useMaterials';
import { useAuth } from './components/AuthProvider';
import { useWorkspaces } from './hooks/useWorkspaces';
import { AddMaterialModal } from './components/AddMaterialModal';
import { MoveMaterialModal } from './components/MoveMaterialModal';
import { HistoryModal } from './components/HistoryModal';
import { TeamModal } from './components/TeamModal';
import { Material } from './types';
import { 
  Package, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  MoreVertical, 
  ArrowRightLeft,
  Trash2,
  Box,
  Truck,
  Wrench,
  AlertTriangle,
  LogOut,
  Users
} from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { workspaces, activeWorkspace, setActiveWorkspace, loadingWorkspaces } = useWorkspaces();
  const { materials, addMaterial, updateLocation, deleteMaterial } = useMaterials(activeWorkspace);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [materialToMove, setMaterialToMove] = useState<Material | null>(null);
  const [materialHistory, setMaterialHistory] = useState<Material | null>(null);

  // Stats
  const stats = useMemo(() => {
    return {
      total: materials.length,
      available: materials.filter(m => m.status === 'Tersedia').length,
      inTransit: materials.filter(m => m.status === 'Dalam Perjalanan').length,
      issues: materials.filter(m => m.status === 'Hilang/Rusak' || m.status === 'Dalam Perbaikan').length
    };
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return materials;
    const query = searchQuery.toLowerCase();
    return materials.filter(
      m => m.name.toLowerCase().includes(query) || 
           m.sku.toLowerCase().includes(query) || 
           m.currentLocation.toLowerCase().includes(query)
    );
  }, [materials, searchQuery]);

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'Tersedia': return 'bg-emerald-50 text-emerald-600';
      case 'Dalam Perjalanan': return 'bg-blue-50 text-blue-600';
      case 'Sedang Digunakan': return 'bg-purple-50 text-purple-600';
      case 'Dalam Perbaikan': return 'bg-amber-50 text-amber-600';
      case 'Hilang/Rusak': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-slate-600';
    }
  };

  if (authLoading || loadingWorkspaces) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Box size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">TrackMat.sys</h1>
          <p className="text-slate-500 mb-8 border-b border-gray-100 pb-8">Log in to view and manage material tracking data in the cloud.</p>
          <button 
            onClick={signIn}
            className="w-full flex justify-center items-center gap-3 px-6 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="text-xl font-bold tracking-tight text-blue-600">MAT-TRAK<span className="text-slate-400 font-light">.sys</span></div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                <Users size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-700">{activeWorkspace?.name || 'Workspace'}</span>
                <button 
                  onClick={() => setIsTeamModalOpen(true)}
                  className="ml-2 text-[10px] uppercase font-bold tracking-wider text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Manage
                </button>
              </div>

              <div className="hidden sm:block text-right">
                <p className="font-semibold text-slate-800">{user.displayName || 'Operator'}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic mt-0.5">{user.email}</p>
              </div>
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 overflow-hidden border-2 border-white shadow-sm cursor-pointer">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button 
                    onClick={signOut}
                    className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors rounded-xl"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-gray-100 text-slate-800">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Material</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-emerald-600">
              <Box size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tersedia</p>
              <p className="text-2xl font-bold text-slate-800">{stats.available}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-600">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dalam Perjalanan</p>
              <p className="text-2xl font-bold text-slate-800">{stats.inTransit}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Perbaikan / Rusak</p>
              <p className="text-2xl font-bold text-slate-800">{stats.issues}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama, SKU, atau lokasi..."
              className="pl-11 pr-4 py-3 w-full bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Input Material Baru
          </button>
        </div>

        {/* Desktop List */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">ID / SKU</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Current Site</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No material records found.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-slate-800 bg-gray-100 px-2 py-1 rounded-md">{item.sku}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{item.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin size={16} className="text-slate-400" />
                          <span className="font-medium">{item.currentLocation}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <Clock size={12} />
                          {new Date(item.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setMaterialHistory(item)}
                            title="Riwayat Pergerakan"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent shadow-none hover:border-blue-100"
                          >
                            <Clock size={16} />
                          </button>
                          <button 
                            onClick={() => setMaterialToMove(item)}
                            title="Update Lokasi"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent shadow-none hover:border-emerald-100"
                          >
                            <ArrowRightLeft size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if(window.confirm('Yakin ingin menghapus data material ini?')) {
                                deleteMaterial(item.id);
                              }
                            }}
                            title="Hapus"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent shadow-none hover:border-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile List Cards */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredMaterials.length === 0 ? (
             <div className="bg-white p-8 text-center text-slate-400 rounded-2xl border border-gray-200 shadow-sm">
             No material records found.
           </div>
          ) : (
            filteredMaterials.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-800 bg-gray-100 px-2 py-1 rounded inline-block mb-2">{item.sku}</span>
                    <h3 className="font-bold text-slate-800 leading-tight">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
                  </div>
                  <button className="p-1 text-slate-400 hover:text-slate-800 rounded">
                    <MoreVertical size={20} />
                  </button>
                </div>
                
                <div className="flex flex-col gap-3 mt-1">
                  <div className="flex items-start gap-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                    <MapPin size={16} className="text-slate-400 mt-0.5 min-w-[16px]" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.currentLocation}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                         {new Date(item.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase ${getStatusBadgeColor(item.status)}`}>
                      {item.status}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setMaterialHistory(item)}
                        className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Riwayat
                      </button>
                      <button 
                        onClick={() => setMaterialToMove(item)}
                        className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors rounded-lg shadow-sm"
                      >
                        Pindah
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {isAddModalOpen && (
        <AddMaterialModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={addMaterial} 
        />
      )}

      {isTeamModalOpen && (
        <TeamModal 
          workspace={activeWorkspace}
          onClose={() => setIsTeamModalOpen(false)}
        />
      )}
      
      {materialToMove && (
        <MoveMaterialModal 
          material={materialToMove} 
          onClose={() => setMaterialToMove(null)} 
          onMove={updateLocation} 
        />
      )}
      
      <HistoryModal 
        material={materialHistory} 
        onClose={() => setMaterialHistory(null)} 
      />

      {/* Status Bar */}
      <footer className="h-8 bg-slate-900 text-white text-[10px] flex items-center justify-between px-6 uppercase tracking-tighter flex-shrink-0">
        <div className="flex gap-6">
          <span>Status: <span className="text-emerald-400">Operational</span></span>
          <span>Local Sync: OK</span>
        </div>
        <div>
          © 2024 MAT-TRAK Management Suite
        </div>
      </footer>
    </div>
  );
}
