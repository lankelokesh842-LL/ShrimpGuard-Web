import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calendar,
  Layers,
  Activity,
  Plus,
  Trash2,
  TrendingUp,
  Clock,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

export default function FeedManager({ ponds = [] }) {
  const { t } = useLanguage();

  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [selectedPondId, setSelectedPondId] = useState(ponds[0]?._id || '');
  const [feedDate, setFeedDate] = useState(new Date().toISOString().split('T')[0]);
  const [morningKg, setMorningKg] = useState('18.0');
  const [afternoonKg, setAfternoonKg] = useState('14.0');
  const [eveningKg, setEveningKg] = useState('16.0');
  const [feedType, setFeedType] = useState('Pellet Feed (38% Crude Protein)');
  const [notes, setNotes] = useState('');

  // Live calculation of daily total
  const calculatedDailyTotal = Number(
    ((Number(morningKg) || 0) + (Number(afternoonKg) || 0) + (Number(eveningKg) || 0)).toFixed(2)
  );

  const fetchFeedData = async () => {
    try {
      setLoading(true);
      const [recordsRes, analyticsRes] = await Promise.all([
        api.get('/feed'),
        api.get('/feed/analytics')
      ]);

      if (recordsRes.data.success) {
        setRecords(recordsRes.data.data);
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching feed data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedData();
  }, []);

  useEffect(() => {
    if (ponds.length > 0 && !selectedPondId) {
      setSelectedPondId(ponds[0]._id);
    }
  }, [ponds]);

  const handleSubmitFeed = async (e) => {
    e.preventDefault();
    if (!selectedPondId) {
      alert('Please select a pond');
      return;
    }

    try {
      setSubmitting(true);
      setSuccessMsg('');
      const res = await api.post('/feed', {
        pondId: selectedPondId,
        date: feedDate,
        morningKg: Number(morningKg),
        afternoonKg: Number(afternoonKg),
        eveningKg: Number(eveningKg),
        feedType,
        notes
      });

      if (res.data.success) {
        setSuccessMsg('Feed consumption recorded and totals updated!');
        await fetchFeedData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording feed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete this feed record?')) return;
    try {
      await api.delete(`/feed/${id}`);
      await fetchFeedData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
          <span>🥣 {t('navFeed')}</span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Automated Calculations Active
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Record morning, afternoon, and evening rations. ShrimpGuard automatically calculates daily, weekly, monthly, and per-pond cumulative consumption.
        </p>
      </div>

      {/* Analytics Summary Cards (Automated Calculations) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Today's Total Feed */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Today's Total Feed</span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">🥣</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-slate-900">
              {analytics?.todayTotal !== undefined ? analytics.todayTotal : 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">
            Across all active ponds today
          </div>
        </div>

        {/* Weekly Consumption */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Weekly Feed Consumption</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">📅</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-slate-900">
              {analytics?.weeklyTotal !== undefined ? analytics.weeklyTotal : 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Last 7 days cumulative total
          </div>
        </div>

        {/* Monthly Consumption */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Monthly Feed Consumption</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">📈</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-slate-900">
              {analytics?.monthlyTotal !== undefined ? analytics.monthlyTotal : 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-1">
            Last 30 days cumulative total
          </div>
        </div>

      </div>

      {/* Main Row: Entry Form & Cumulative Pond Consumption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Log Daily Feed Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 lg:col-span-1">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <span className="text-lg">📝</span>
            <h3 className="font-bold text-slate-900 text-sm">
              {t('logFeedTitle')}
            </h3>
          </div>

          {successMsg && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitFeed} className="mt-4 space-y-3.5 text-xs">
            
            {/* Pond Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('selectPond')} *
              </label>
              <select
                value={selectedPondId}
                onChange={(e) => setSelectedPondId(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium"
              >
                {ponds.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.pondNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t('date')} *
              </label>
              <input
                type="date"
                required
                value={feedDate}
                onChange={(e) => setFeedDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* 3 Time Rations */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Morning (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={morningKg}
                  onChange={(e) => setMorningKg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-center font-bold text-emerald-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Afternoon (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={afternoonKg}
                  onChange={(e) => setAfternoonKg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-center font-bold text-amber-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Evening (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={eveningKg}
                  onChange={(e) => setEveningKg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-center font-bold text-indigo-700"
                />
              </div>
            </div>

            {/* Auto Calculated Total Daily Feed */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Automatically Calculated Daily Total
                </span>
                <span className="text-lg font-black text-slate-900">
                  {calculatedDailyTotal} kg
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Sum: M + A + E
              </span>
            </div>

            {/* Feed Brand */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Feed Brand / Type
              </label>
              <input
                type="text"
                value={feedType}
                onChange={(e) => setFeedType(e.target.value)}
                placeholder="e.g. CP Aqua / Grobest 38%"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tray Observation Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Clean trays, good gut fullness"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20 transition-all"
            >
              {submitting ? 'Recording...' : t('saveFeed')}
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Consumption Chart & Total Consumption Per Pond */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Feed Consumption Trend Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              📊 Daily Feed Consumption Progression (Last 14 Days)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Stacked breakdown of morning, afternoon, and evening rations
            </p>

            <div className="h-64 w-full">
              {analytics?.feedChartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.feedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="morningKg" name="Morning" fill="#10b981" stackId="a" />
                    <Bar dataKey="afternoonKg" name="Afternoon" fill="#f59e0b" stackId="a" />
                    <Bar dataKey="eveningKg" name="Evening" fill="#6366f1" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No feed chart data available yet.
                </div>
              )}
            </div>
          </div>

          {/* Total Feed Consumption Per Pond Cards */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              🌊 Total Cumulative Feed Consumption Per Pond
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Auto-aggregated total feed fed to each pond over the entire culture cycle
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {analytics?.pondTotals?.map((pt) => (
                <div key={pt.pondId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {pt.pondNumber}
                  </span>
                  <div className="font-bold text-slate-900 text-xs mt-2 truncate">
                    {pt.pondName}
                  </div>
                  <div className="text-xl font-black text-emerald-700 mt-1">
                    {pt.totalKg} kg
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {pt.recordCount} daily feed logs recorded
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Feed Records History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            📋 Detailed Daily Feed Log Entries
          </h3>
          <span className="text-xs text-slate-500">
            {records.length} records logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Pond</th>
                <th className="py-3 px-4 text-center">Morning</th>
                <th className="py-3 px-4 text-center">Afternoon</th>
                <th className="py-3 px-4 text-center">Evening</th>
                <th className="py-3 px-4 text-center font-bold text-emerald-800">Total Daily</th>
                <th className="py-3 px-4">Feed Brand & Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {r.pond ? `${r.pond.name} (${r.pond.pondNumber})` : 'Pond'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">
                    {r.morningKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-amber-700">
                    {r.afternoonKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-indigo-700">
                    {r.eveningKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-slate-900 bg-emerald-50/50">
                    {r.totalDailyKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="font-semibold text-slate-700">{r.feedType}</span>
                    {r.notes && <span className="block text-[11px] text-slate-400 italic">{r.notes}</span>}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteRecord(r._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete record"
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
  );
}
