import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ArrowLeft,
  Activity,
  Droplets,
  Thermometer,
  Wind,
  Layers,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

export default function PondDetailsView({ pondId, onBack, onTriggerAlertUpdate }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [historyReadings, setHistoryReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [activeParam, setActiveParam] = useState('dissolvedOxygen');

  // Manual entry modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [tempInput, setTempInput] = useState('28.5');
  const [phInput, setPhInput] = useState('7.9');
  const [doInput, setDoInput] = useState('6.2');
  const [turbidityInput, setTurbidityInput] = useState('32.0');
  const [notesInput, setNotesInput] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  const fetchPondDetails = async () => {
    try {
      const res = await api.get(`/ponds/${pondId}`);
      if (res.data.success) {
        setData(res.data.data);
      }
      const histRes = await api.get(`/water-quality/history/${pondId}?limit=25`);
      if (histRes.data.success) {
        setHistoryReadings(histRes.data.data.readings || []);
      }
    } catch (err) {
      console.error('Error fetching pond details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPondDetails();
  }, [pondId]);

  const handleSimulate = async (scenario) => {
    try {
      setSimLoading(true);
      const res = await api.post('/water-quality/simulate', {
        pondId,
        scenario
      });
      if (res.data.success) {
        await fetchPondDetails();
        if (onTriggerAlertUpdate) onTriggerAlertUpdate();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Simulation error');
    } finally {
      setSimLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      setManualLoading(true);
      const res = await api.post('/water-quality/manual', {
        pondId,
        temperature: Number(tempInput),
        pH: Number(phInput),
        dissolvedOxygen: Number(doInput),
        turbidity: Number(turbidityInput),
        notes: notesInput
      });
      if (res.data.success) {
        setManualModalOpen(false);
        await fetchPondDetails();
        if (onTriggerAlertUpdate) onTriggerAlertUpdate();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit manual reading');
    } finally {
      setManualLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-slate-500 shadow-sm border border-slate-200">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="font-semibold text-sm">Loading pond telemetry and analysis...</p>
      </div>
    );
  }

  const { pond, recentFeeds = [], pondAlerts = [] } = data;
  const last = pond.lastReading || {};

  const doc = Math.max(
    0,
    Math.floor((new Date().getTime() - new Date(pond.stockingDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-sm"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                {pond.pondNumber}
              </span>
              <h2 className="text-xl font-black text-slate-900">
                {pond.name}
              </h2>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                pond.status === 'critical'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : pond.status === 'warning'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {pond.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {pond.species} &bull; {pond.sizeHectares} Hectares &bull; Stocked: {pond.shrimpCount?.toLocaleString()} PL &bull; DOC: {doc} Days
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setManualModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <span>📝</span>
            <span>Manual Entry</span>
          </button>
          <button
            onClick={fetchPondDetails}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm"
            title="Refresh Readings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hardware-Free Simulation Controls Card */}
      <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                  Hardware-Free Simulation Controls
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
                  Target Pond: {pond.pondNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Generate instant telemetry to test rule-based threshold evaluation and alert triggers.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSimulate('normal')}
              disabled={simLoading}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>Simulate Normal</span>
            </button>
            <button
              onClick={() => handleSimulate('warning')}
              disabled={simLoading}
              className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-amber-600/20"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
              <span>Simulate Warning</span>
            </button>
            <button
              onClick={() => handleSimulate('critical')}
              disabled={simLoading}
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-rose-600/20"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-200" />
              <span>Simulate Critical</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Telemetry Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* DO */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Dissolved Oxygen</span>
            <Wind className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-slate-900">
              {last.dissolvedOxygen !== undefined ? last.dissolvedOxygen : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">mg/L</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target: &ge; 5.0</span>
            <span className={`font-bold ${
              last.dissolvedOxygen >= 5.0
                ? 'text-emerald-600'
                : last.dissolvedOxygen >= 3.5
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}>
              {last.dissolvedOxygen >= 5.0 ? 'Optimal' : last.dissolvedOxygen >= 3.5 ? 'Suboptimal' : 'Severe Hypoxia'}
            </span>
          </div>
        </div>

        {/* pH */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">pH Level</span>
            <Droplets className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-slate-900">
              {last.pH !== undefined ? last.pH : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">pH</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target: 7.5 - 8.5</span>
            <span className={`font-bold ${
              last.pH >= 7.5 && last.pH <= 8.5
                ? 'text-emerald-600'
                : (last.pH >= 7.0 && last.pH < 7.5) || (last.pH > 8.5 && last.pH <= 9.0)
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}>
              {last.pH >= 7.5 && last.pH <= 8.5 ? 'Optimal' : 'Out of range'}
            </span>
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Water Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-slate-900">
              {last.temperature !== undefined ? last.temperature : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">°C</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target: 26 - 32</span>
            <span className={`font-bold ${
              last.temperature >= 26.0 && last.temperature <= 32.0
                ? 'text-emerald-600'
                : (last.temperature >= 24.0 && last.temperature < 26.0) || (last.temperature > 32.0 && last.temperature <= 34.0)
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}>
              {last.temperature >= 26.0 && last.temperature <= 32.0 ? 'Optimal' : 'Thermal stress'}
            </span>
          </div>
        </div>

        {/* Turbidity */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Turbidity / Plankton</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-slate-900">
              {last.turbidity !== undefined ? last.turbidity : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">NTU</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target: 25 - 45</span>
            <span className={`font-bold ${
              last.turbidity >= 25.0 && last.turbidity <= 45.0
                ? 'text-emerald-600'
                : (last.turbidity >= 18.0 && last.turbidity < 25.0) || (last.turbidity > 45.0 && last.turbidity <= 60.0)
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}>
              {last.turbidity >= 25.0 && last.turbidity <= 45.0 ? 'Balanced' : 'Plankton crash/silt'}
            </span>
          </div>
        </div>

      </div>

      {/* Pond Health Analysis & Advisory Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl ${
              pond.currentHealthScore >= 85
                ? 'bg-emerald-100 text-emerald-800'
                : pond.currentHealthScore >= 60
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Rule-Based Pond Environmental Health Score
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {pond.currentHealthScore} / 100
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Calculated from real-time parameter adherence against configurable aquaculture targets
              </p>
            </div>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${
            pond.status === 'critical'
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : pond.status === 'warning'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}>
            Overall Condition: {pond.status}
          </span>
        </div>

        {/* Advisory Action */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <span className="font-bold text-slate-900 block mb-1">
            📢 Recommended Farmer Action:
          </span>
          <p className="text-slate-700 leading-relaxed font-medium">
            {pond.status === 'critical'
              ? 'CRITICAL ALERT: Turn on ALL auxiliary paddlewheel aerators immediately! Suspend daily feeding until Dissolved Oxygen levels recover above 5.0 mg/L. Buffer alkalinity or exchange surface water if pH is above 9.0.'
              : pond.status === 'warning'
              ? 'WARNING NOTICE: Engage additional aeration during dawn or high-noon hours. Reduce feeding ration by 20% to avoid biological oxygen demand spikes.'
              : 'NORMAL STABILITY: Water quality is within optimal commercial shrimp parameters. Maintain scheduled feed distribution and standard aerator rotation.'}
          </p>
        </div>

        {/* Disclaimer Alert */}
        <div className="mt-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-[11px] flex items-start space-x-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>Agri-Tech Notice:</strong> Demonstration threshold rule-based analysis. Water quality parameters indicate environmental stress and risk factors, but do NOT confirm clinical shrimp diseases or biological infection. Health score is a demonstrative risk indicator.
          </span>
        </div>
      </div>

      {/* History Telemetry Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <span>📈 Water Quality Telemetry Curve</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {historyReadings.length} data points
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical progression of sensor readings for this pond
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveParam('dissolvedOxygen')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeParam === 'dissolvedOxygen' ? 'bg-white shadow text-teal-700 font-bold' : 'text-slate-600'
              }`}
            >
              DO (mg/L)
            </button>
            <button
              onClick={() => setActiveParam('pH')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeParam === 'pH' ? 'bg-white shadow text-emerald-700 font-bold' : 'text-slate-600'
              }`}
            >
              pH
            </button>
            <button
              onClick={() => setActiveParam('temperature')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeParam === 'temperature' ? 'bg-white shadow text-amber-700 font-bold' : 'text-slate-600'
              }`}
            >
              Temp (°C)
            </button>
            <button
              onClick={() => setActiveParam('turbidity')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeParam === 'turbidity' ? 'bg-white shadow text-indigo-700 font-bold' : 'text-slate-600'
              }`}
            >
              Turbidity
            </button>
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          {historyReadings.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="formattedTime" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey={activeParam}
                  stroke={
                    activeParam === 'dissolvedOxygen'
                      ? '#0d9488'
                      : activeParam === 'pH'
                      ? '#059669'
                      : activeParam === 'temperature'
                      ? '#d97706'
                      : '#6366f1'
                  }
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No historical telemetry points found. Click a simulation button above to generate readings.
            </div>
          )}
        </div>
      </div>

      {/* Manual Reading Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              📝 Enter Manual Water Quality Readings
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter physical water test measurements taken from pond test kits or hand probes.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Water Temperature (°C) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  pH Level *
                </label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={phInput}
                  onChange={(e) => setPhInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dissolved Oxygen (mg/L) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={doInput}
                  onChange={(e) => setDoInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Turbidity (NTU) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={turbidityInput}
                  onChange={(e) => setTurbidityInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observation Notes
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Test kit reading taken after sunrise"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  {manualLoading ? 'Saving...' : 'Save Manual Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
