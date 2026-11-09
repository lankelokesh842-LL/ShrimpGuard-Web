import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Scale,
  Waves,
  Activity,
  Wind,
  Droplets,
  Thermometer,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw
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

export default function PondComparison({ ponds = [] }) {
  const { t } = useLanguage();
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/compare');
      if (res.data.success) {
        setComparisonData(res.data.data);
      }
    } catch (err) {
      console.error('Pond comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  const chartData = comparisonData.map((p) => ({
    name: p.pondNumber,
    fullName: p.name,
    healthScore: p.healthScore,
    dissolvedOxygen: p.lastReading?.dissolvedOxygen || 0,
    totalFeedKg: p.totalFeedKg
  }));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <span>⚖️ {t('navComparison')}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Side-by-Side Analytics
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Compare growth stages, water quality adherence, feed conversion, and environmental risks across all your ponds.
          </p>
        </div>

        <button
          onClick={fetchComparison}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm"
          title="Refresh Comparison Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Visual Comparison Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm mb-1">
          📊 Comparative Health Score & Dissolved Oxygen by Pond
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Compare environmental health and oxygen levels across individual ponds
        </p>

        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="healthScore" name="Health Score (0-100)" fill="#059669" radius={[6, 6, 0, 0]} />
                <Bar dataKey="dissolvedOxygen" name="DO (mg/L)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No comparison metrics available yet.
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">
            📋 Side-by-Side Parameters Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Metric</th>
                {comparisonData.map((p) => (
                  <th key={p.pondId} className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                    {p.name} ({p.pondNumber})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {/* Species */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-700">Species</td>
                {comparisonData.map((p) => (
                  <td key={p.pondId} className="py-3 px-4 text-slate-600 italic">
                    {p.species}
                  </td>
                ))}
              </tr>

              {/* Status */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-700">Condition Status</td>
                {comparisonData.map((p) => (
                  <td key={p.pondId} className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      p.status === 'critical'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : p.status === 'warning'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Health Score */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-700">Health Score</td>
                {comparisonData.map((p) => (
                  <td key={p.pondId} className="py-3 px-4 font-black text-slate-800">
                    {p.healthScore} / 100
                  </td>
                ))}
              </tr>

              {/* DOC */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-700">Culture Age (DOC)</td>
                {comparisonData.map((p) => (
                  <td key={p.pondId} className="py-3 px-4 font-semibold text-emerald-700">
                    {p.doc} Days
                  </td>
                ))}
              </tr>

              {/* Size */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-700">Pond Area</td>
                {comparisonData.map((p) => (
                  <td key={p.pondId} className="py-3 px-4 text-slate-800">
                    {p.sizeHectares} Ha
                  </td>
                ))}
              </tr>

              {/* Stock Count */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-700">Shrimp Stocked</td>
                {comparisonData.map((p) => (
                  <td key={p.pondId} className="py-3 px-4 text-slate-800">
                    {(p.shrimpCount).toLocaleString()} PL
                  </td>
                ))}
              </tr>

              {/* Cumulative Feed */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-700">Cumulative Feed To Date</td>
                {comparisonData.map((p) => (
                  <td key={p.pondId} className="py-3 px-4 font-bold text-slate-900">
                    {p.totalFeedKg} kg
                  </td>
                ))}
              </tr>

              {/* Dissolved Oxygen */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-700">Latest DO (mg/L)</td>
                {comparisonData.map((p) => (
                  <td key={p.pondId} className="py-3 px-4 font-black text-teal-700">
                    {p.lastReading?.dissolvedOxygen !== null ? `${p.lastReading.dissolvedOxygen} mg/L` : '--'}
                  </td>
                ))}
              </tr>

              {/* pH */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-700">Latest pH</td>
                {comparisonData.map((p) => (
                  <td key={p.pondId} className="py-3 px-4 font-black text-emerald-700">
                    {p.lastReading?.pH !== null ? p.lastReading.pH : '--'}
                  </td>
                ))}
              </tr>

              {/* Temperature */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-700">Latest Temp (°C)</td>
                {comparisonData.map((p) => (
                  <td key={p.pondId} className="py-3 px-4 font-black text-amber-700">
                    {p.lastReading?.temperature !== null ? `${p.lastReading.temperature} °C` : '--'}
                  </td>
                ))}
              </tr>

              {/* Turbidity */}
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-700">Latest Turbidity (NTU)</td>
                {comparisonData.map((p) => (
                  <td key={p.pondId} className="py-3 px-4 font-black text-indigo-700">
                    {p.lastReading?.turbidity !== null ? `${p.lastReading.turbidity} NTU` : '--'}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
