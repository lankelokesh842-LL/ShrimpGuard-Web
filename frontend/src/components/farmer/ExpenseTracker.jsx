import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  CreditCard,
  Plus,
  Trash2,
  TrendingDown,
  PieChart as PieIcon,
  Calendar,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#059669', '#0d9488', '#0284c7', '#d97706', '#dc2626', '#8b5cf6', '#64748b'];

export default function ExpenseTracker({ ponds = [] }) {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  // Form states
  const [category, setCategory] = useState('Feed');
  const [amount, setAmount] = useState('25000');
  const [pondId, setPondId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses');
      if (res.data.success) {
        setExpenses(res.data.data);
        setTotalAmount(res.data.totalAmount || 0);
        setByCategory(res.data.byCategory || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/expenses', {
        category,
        amount: Number(amount),
        pondId: pondId || null,
        date,
        description
      });
      if (res.data.success) {
        setDescription('');
        await fetchExpenses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      await fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const pieData = Object.entries(byCategory).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <span>💰 {t('navExpenses')}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Farm Cost Management
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track input operational expenses across feed batches, seed postlarvae, electricity/diesel, and probiotics.
          </p>
        </div>

        <div className="bg-slate-50 py-3 px-5 rounded-2xl border border-slate-200 text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Culture Cost</span>
          <span className="text-2xl font-black text-slate-900">
            ₹{totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Grid: Form & Category Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Expense Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center space-x-2">
            <span>➕ Record New Operational Cost</span>
          </h3>

          <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cost Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
              >
                <option value="Feed">Feed (Pellets & Supplements)</option>
                <option value="Seed/Postlarvae">Seed / Postlarvae (PL)</option>
                <option value="Electricity/Fuel">Electricity / Diesel for Aerators</option>
                <option value="Chemicals/Probiotics">Chemicals, Lime & Probiotics</option>
                <option value="Labor">Farm Labor & Watchman</option>
                <option value="Maintenance">Equipment & Paddlewheel Maintenance</option>
                <option value="Testing & Lab">Water Testing & Lab Analysis</option>
                <option value="Other">Other Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-black text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Applicable Pond</label>
              <select
                value={pondId}
                onChange={(e) => setPondId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              >
                <option value="">Farm-wide (General Cost)</option>
                {ponds.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.pondNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 10 bags of starter feed, dolomite lime"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20 transition-all"
            >
              {submitting ? 'Saving...' : 'Save Expense'}
            </button>
          </form>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="font-bold text-slate-900 text-sm mb-1">
            📊 Cost Distribution By Category
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Visual breakdown of all logged input costs
          </p>

          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expense data recorded yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Expense History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            📋 Logged Expense Receipts
          </h3>
          <span className="text-xs text-slate-500">{expenses.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Pond</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 text-slate-700">
                    {new Date(exp.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-800">
                    {exp.category}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {exp.pond ? `${exp.pond.name} (${exp.pond.pondNumber})` : 'Farm-wide'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {exp.description || '--'}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    ₹{exp.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(exp._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Entry"
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
