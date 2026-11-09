import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Plus,
  Edit2,
  Trash2,
  Waves,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import api from '../../services/api';

export default function PondManager({ ponds = [], onRefresh, onSelectPond }) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPond, setEditingPond] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [pondNumber, setPondNumber] = useState('');
  const [sizeHectares, setSizeHectares] = useState('');
  const [stockingDate, setStockingDate] = useState('');
  const [shrimpCount, setShrimpCount] = useState('');
  const [species, setSpecies] = useState('Pacific White Shrimp (Litopenaeus vannamei)');
  const [feedBrand, setFeedBrand] = useState('CP Aqua Blanca #2');
  const [pelletSize, setPelletSize] = useState('0.8mm Starter Crumble');
  const [initialQuantityKg, setInitialQuantityKg] = useState('15');

  const openAddModal = () => {
    setEditingPond(null);
    setName('');
    setPondNumber(`P-0${ponds.length + 1}`);
    setSizeHectares('1.0');
    setStockingDate(new Date().toISOString().split('T')[0]);
    setShrimpCount('150000');
    setSpecies('Pacific White Shrimp (Litopenaeus vannamei)');
    setFeedBrand('CP Aqua Blanca #2');
    setPelletSize('0.8mm Starter Crumble');
    setInitialQuantityKg('15');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (pond) => {
    setEditingPond(pond);
    setName(pond.name);
    setPondNumber(pond.pondNumber);
    setSizeHectares(pond.sizeHectares.toString());
    setStockingDate(new Date(pond.stockingDate).toISOString().split('T')[0]);
    setShrimpCount(pond.shrimpCount.toString());
    setSpecies(pond.species);
    setFeedBrand(pond.initialFeedDetails?.feedBrand || 'CP Aqua');
    setPelletSize(pond.initialFeedDetails?.pelletSize || '0.8mm Crumble');
    setInitialQuantityKg(pond.initialFeedDetails?.initialQuantityKg?.toString() || '15');
    setError('');
    setModalOpen(true);
  };

  const handleSavePond = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        pondNumber,
        sizeHectares: Number(sizeHectares),
        stockingDate,
        shrimpCount: Number(shrimpCount),
        species,
        initialFeedDetails: {
          feedBrand,
          pelletSize,
          initialQuantityKg: Number(initialQuantityKg)
        }
      };

      if (editingPond) {
        await api.put(`/ponds/${editingPond._id}`, payload);
      } else {
        await api.post('/ponds', payload);
      }

      setModalOpen(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save pond');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePond = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/ponds/${id}`);
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete pond');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <span>🌊 {t('navPonds')}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {ponds.length} Registered
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Register new culture ponds, configure stocking density, feed regime, and track environmental health.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-emerald-700/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addPond')}</span>
        </button>
      </div>

      {/* Ponds Table & Cards */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Pond Identifier</th>
                <th className="py-3.5 px-4">Pond Name & Species</th>
                <th className="py-3.5 px-4">Size & Stocking</th>
                <th className="py-3.5 px-4">Stocking Date & DOC</th>
                <th className="py-3.5 px-4">Condition & Health</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ponds.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No ponds registered yet. Click "Register New Pond" to get started!
                  </td>
                </tr>
              ) : (
                ponds.map((pond) => {
                  const doc = Math.max(
                    0,
                    Math.floor((new Date().getTime() - new Date(pond.stockingDate).getTime()) / (1000 * 60 * 60 * 24))
                  );

                  return (
                    <tr key={pond._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-800">
                        <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
                          {pond.pondNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-sm">{pond.name}</div>
                        <div className="text-[11px] text-slate-500 italic mt-0.5">{pond.species}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{pond.sizeHectares} Hectares</div>
                        <div className="text-[11px] text-emerald-700 font-medium">
                          {(pond.shrimpCount).toLocaleString()} postlarvae
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-800 font-medium">
                          {new Date(pond.stockingDate).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                          {doc} Days of Culture
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            pond.status === 'critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : pond.status === 'warning'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {pond.status}
                          </span>
                          <span className="font-bold text-xs text-slate-700">
                            {pond.currentHealthScore}/100
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onSelectPond(pond)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="Inspect Pond Telemetry"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(pond)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Edit Pond Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(pond._id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                            title="Delete Pond"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Are you sure you want to delete this pond? All linked feed consumption, water telemetry, alerts, and records will be permanently removed.
            </p>
            <div className="mt-5 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeletePond(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/20"
              >
                Delete Pond
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Pond Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingPond ? t('editPond') : t('addPond')}
                  </h3>
                  <p className="text-xs text-slate-500">Enter culture configuration details</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSavePond} className="mt-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('pondNumber')} *</label>
                  <input
                    type="text"
                    required
                    value={pondNumber}
                    onChange={(e) => setPondNumber(e.target.value)}
                    placeholder="e.g. P-01"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('pondName')} *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. North Bay Pond"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('pondSize')} *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={sizeHectares}
                    onChange={(e) => setSizeHectares(e.target.value)}
                    placeholder="1.2"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('stockingDate')} *</label>
                  <input
                    type="date"
                    required
                    value={stockingDate}
                    onChange={(e) => setStockingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('shrimpCount')} *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={shrimpCount}
                    onChange={(e) => setShrimpCount(e.target.value)}
                    placeholder="150000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('species')} *</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Pacific White Shrimp (Litopenaeus vannamei)">
                      Pacific White Shrimp (Litopenaeus vannamei)
                    </option>
                    <option value="Black Tiger Shrimp (Penaeus monodon)">
                      Black Tiger Shrimp (Penaeus monodon)
                    </option>
                    <option value="Indian White Prawn (Fenneropenaeus indicus)">
                      Indian White Prawn (Fenneropenaeus indicus)
                    </option>
                  </select>
                </div>
              </div>

              {/* Feed Details */}
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block mb-2">Initial Feeding Details:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Feed Brand</label>
                    <input
                      type="text"
                      value={feedBrand}
                      onChange={(e) => setFeedBrand(e.target.value)}
                      placeholder="CP Aqua"
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Pellet Size</label>
                    <input
                      type="text"
                      value={pelletSize}
                      onChange={(e) => setPelletSize(e.target.value)}
                      placeholder="0.8mm Crumble"
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Start Qty (kg)</label>
                    <input
                      type="number"
                      value={initialQuantityKg}
                      onChange={(e) => setInitialQuantityKg(e.target.value)}
                      placeholder="15"
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20"
                >
                  {loading ? 'Saving...' : t('save')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
