import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Package,
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

export default function HarvestRecords({ ponds = [] }) {
  const { t } = useLanguage();
  const [harvests, setHarvests] = useState([]);
  const [metrics, setMetrics] = useState({ totalWeightKg: 0, totalRevenue: 0, averageSurvivalRate: 0 });
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedPondId, setSelectedPondId] = useState(ponds[0]?._id || '');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalWeightKg, setTotalWeightKg] = useState('3200');
  const [countPerKg, setCountPerKg] = useState('35');
  const [pricePerKg, setPricePerKg] = useState('380');
  const [survivalRatePercent, setSurvivalRatePercent] = useState('80');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const calculatedRevenue = (Number(totalWeightKg) || 0) * (Number(pricePerKg) || 0);

  const fetchHarvests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/harvests');
      if (res.data.success) {
        setHarvests(res.data.data);
        setMetrics(res.data.metrics || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, []);

  const handleRecordHarvest = async (e) => {
    e.preventDefault();
    if (!selectedPondId) {
      alert('Please select a pond');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/harvests', {
        pondId: selectedPondId,
        harvestDate,
        totalWeightKg: Number(totalWeightKg),
        countPerKg: Number(countPerKg),
        pricePerKg: Number(pricePerKg),
        survivalRatePercent: survivalRatePercent ? Number(survivalRatePercent) : null,
        notes
      });

      if (res.data.success) {
        setNotes('');
        await fetchHarvests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording harvest');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this harvest record?')) return;
    try {
      await api.delete(`/harvests/${id}`);
      await fetchHarvests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <span>🦐 {t('navHarvest')}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Commercial Yield & Revenue
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track final pond harvest weights, shrimp size grade counts, sales proceeds, and survival rates.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Total Biomass Harvested</span>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-slate-900">
              {metrics.totalWeightKg.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block font-medium">All completed crop cycles</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Total Harvest Revenue</span>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-emerald-700">
              ₹{metrics.totalRevenue.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block font-medium">Sales realizations to date</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Average Survival Rate</span>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-teal-700">
              {metrics.averageSurvivalRate}%
            </span>
          </div>
          <span className="text-[11px] text-teal-600 mt-1 block font-medium">Estimated postlarvae survival</span>
        </div>
      </div>

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Record Harvest Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center space-x-2">
            <span>➕ Record Pond Harvest</span>
          </h3>

          <form onSubmit={handleRecordHarvest} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Harvest Pond *</label>
              <select
                value={selectedPondId}
                onChange={(e) => setSelectedPondId(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200"
              >
                {ponds.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.pondNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Harvest Date *</label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Weight (kg) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={totalWeightKg}
                  onChange={(e) => setTotalWeightKg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Count / kg (Size) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={countPerKg}
                  onChange={(e) => setCountPerKg(e.target.value)}
                  placeholder="35"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price / kg (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Survival Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={survivalRatePercent}
                  onChange={(e) => setSurvivalRatePercent(e.target.value)}
                  placeholder="82.5"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold">Calculated Revenue:</span>
              <span className="text-base font-black text-slate-900">
                ₹{calculatedRevenue.toLocaleString()}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Buyer / Packing Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Export processor factory shipment"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20 transition-all"
            >
              {submitting ? 'Recording...' : 'Save Harvest Record'}
            </button>
          </form>
        </div>

        {/* Harvest Records List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              📋 Harvest Cycles Logged
            </h3>
            <span className="text-xs text-slate-500">{harvests.length} crops</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Harvest Date</th>
                  <th className="py-3 px-4">Pond</th>
                  <th className="py-3 px-4 text-center">Weight (kg)</th>
                  <th className="py-3 px-4 text-center">Count/kg</th>
                  <th className="py-3 px-4 text-center">Survival</th>
                  <th className="py-3 px-4 text-right">Revenue (₹)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {harvests.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 text-slate-700">
                      {new Date(h.harvestDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {h.pond?.name || 'Pond'} ({h.pond?.pondNumber || 'P'})
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-slate-800">
                      {h.totalWeightKg.toLocaleString()} kg
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                      {h.countPerKg} pcs/kg
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-teal-700">
                      {h.survivalRatePercent}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-800">
                      ₹{h.totalRevenue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(h._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Harvest"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
