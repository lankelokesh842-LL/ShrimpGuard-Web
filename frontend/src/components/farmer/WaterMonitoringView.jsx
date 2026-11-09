import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Activity,
  Cpu,
  Droplets,
  Thermometer,
  Wind,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Square,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

export default function WaterMonitoringView({ ponds = [], onTriggerAlertUpdate }) {
  const { t } = useLanguage();

  const [selectedPondId, setSelectedPondId] = useState(ponds[0]?._id || '');
  const [mode, setMode] = useState('simulation'); // 'simulation' | 'manual'
  const [activePreset, setActivePreset] = useState('normal');

  // Manual inputs
  const [manualTemp, setManualTemp] = useState('28.5');
  const [manualPh, setManualPh] = useState('8.0');
  const [manualDo, setManualDo] = useState('6.2');
  const [manualTurbidity, setManualTurbidity] = useState('32.0');
  const [manualNotes, setManualNotes] = useState('');

  // Latest evaluation state
  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoSimActive, setAutoSimActive] = useState(false);
  const autoSimTimerRef = useRef(null);

  useEffect(() => {
    if (ponds.length > 0 && !selectedPondId) {
      setSelectedPondId(ponds[0]._id);
    }
  }, [ponds]);

  // Load latest pond reading when pond changes
  useEffect(() => {
    if (selectedPondId) {
      loadPondLatest();
    }
  }, [selectedPondId]);

  const loadPondLatest = async () => {
    try {
      const res = await api.get(`/ponds/${selectedPondId}`);
      if (res.data.success && res.data.data.recentWaterQuality?.length > 0) {
        const r = res.data.data.recentWaterQuality[0];
        setLatestResult({
          record: r,
          evaluation: {
            healthScore: r.healthScore,
            status: r.status,
            violations: r.violations || [],
            recommendedAction: r.recommendedAction,
            disclaimer: t('disclaimerText')
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulatePreset = async (scenario) => {
    if (!selectedPondId) return;
    try {
      setLoading(true);
      setActivePreset(scenario);
      const res = await api.post('/water-quality/simulate', {
        pondId: selectedPondId,
        scenario
      });
      if (res.data.success) {
        setLatestResult(res.data.data);
        if (onTriggerAlertUpdate) onTriggerAlertUpdate();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Simulation error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPondId) return;
    try {
      setLoading(true);
      const res = await api.post('/water-quality/manual', {
        pondId: selectedPondId,
        temperature: Number(manualTemp),
        pH: Number(manualPh),
        dissolvedOxygen: Number(manualDo),
        turbidity: Number(manualTurbidity),
        notes: manualNotes
      });
      if (res.data.success) {
        setLatestResult(res.data.data);
        if (onTriggerAlertUpdate) onTriggerAlertUpdate();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Manual entry error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-simulation interval ticker
  useEffect(() => {
    if (autoSimActive) {
      autoSimTimerRef.current = setInterval(() => {
        handleSimulatePreset(activePreset);
      }, 7000);
    } else {
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
    }
    return () => {
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
    };
  }, [autoSimActive, activePreset, selectedPondId]);

  const selectedPond = ponds.find((p) => p._id === selectedPondId);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <span>🧪 {t('waterTitle')}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Dual Mode Engine
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyze physical water quality without hardware sensors via realistic telemetry simulation, or record manual pond test kit measurements.
          </p>
        </div>

        {/* Pond Selector */}
        <div className="w-full sm:w-auto">
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
            Select Active Pond:
          </label>
          <select
            value={selectedPondId}
            onChange={(e) => setSelectedPondId(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-emerald-500"
          >
            {ponds.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.pondNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex rounded-2xl bg-slate-200/80 p-1 text-xs font-bold max-w-md">
        <button
          onClick={() => setMode('simulation')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all ${
            mode === 'simulation'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>⚡ {t('simulationMode')}</span>
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all ${
            mode === 'manual'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📝</span>
          <span>{t('manualMode')}</span>
        </button>
      </div>

      {/* Mode 1: Simulation Mode Controls */}
      {mode === 'simulation' && (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 rounded-3xl p-6 text-white shadow-xl border border-emerald-800/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-emerald-900/60">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-wide uppercase text-emerald-300">
                  Interactive Telemetry Simulation Panel
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  NO HARDWARE REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Trigger simulated sensor telemetry for <strong className="text-white">{selectedPond?.name || 'Selected Pond'}</strong>. The rule-based engine will evaluate environmental stress and trigger automated risk alerts.
              </p>
            </div>

            {/* Auto Sim Ticker Toggle */}
            <button
              onClick={() => setAutoSimActive(!autoSimActive)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow ${
                autoSimActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/50'
              }`}
            >
              {autoSimActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoSimActive ? 'Stop Live Auto-Stream' : 'Start Live Telemetry Loop'}</span>
            </button>
          </div>

          {/* 3 Preset Demonstration Buttons */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Normal Preset */}
            <button
              onClick={() => handleSimulatePreset('normal')}
              disabled={loading}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activePreset === 'normal'
                  ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400'
                  : 'bg-slate-800/60 border-slate-700 hover:border-emerald-500 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase text-emerald-300">Preset 1</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm font-black text-white">NORMAL Scenario</div>
              <p className="text-[11px] text-slate-300 mt-1">
                Temp: 28-30°C &bull; pH: 7.8-8.2 &bull; DO: 6.0-7.2 mg/L
              </p>
              <span className="mt-2 text-[10px] inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                Optimal Culture Comfort
              </span>
            </button>

            {/* Warning Preset */}
            <button
              onClick={() => handleSimulatePreset('warning')}
              disabled={loading}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activePreset === 'warning'
                  ? 'bg-amber-600/30 border-amber-400 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                  : 'bg-slate-800/60 border-slate-700 hover:border-amber-500 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase text-amber-300">Preset 2</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-sm font-black text-white">WARNING Scenario</div>
              <p className="text-[11px] text-slate-300 mt-1">
                Temp: 32.5°C &bull; pH: 8.7 &bull; DO: 4.1 mg/L
              </p>
              <span className="mt-2 text-[10px] inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                Thermal & DO Suboptimal Stress
              </span>
            </button>

            {/* Critical Preset */}
            <button
              onClick={() => handleSimulatePreset('critical')}
              disabled={loading}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activePreset === 'critical'
                  ? 'bg-rose-600/30 border-rose-400 text-white shadow-lg shadow-rose-500/20 ring-1 ring-rose-400'
                  : 'bg-slate-800/60 border-slate-700 hover:border-rose-500 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase text-rose-300">Preset 3</span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-sm font-black text-white">CRITICAL Scenario</div>
              <p className="text-[11px] text-slate-300 mt-1">
                Temp: 34.8°C &bull; pH: 9.3 &bull; DO: 2.6 mg/L
              </p>
              <span className="mt-2 text-[10px] inline-block px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                Hypoxia Emergency & Alkaline Shock
              </span>
            </button>

          </div>
        </div>
      )}

      {/* Mode 2: Manual Entry Form */}
      {mode === 'manual' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                📝 Manual Operator Water Quality Entry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Record actual pond measurements taken with dissolved oxygen meters, pH pens, or Secchi disks.
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
              Operator Entry
            </span>
          </div>

          <form onSubmit={handleManualSubmit} className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Temperature (°C) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={manualTemp}
                  onChange={(e) => setManualTemp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Ideal: 26.0 - 32.0 °C</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  pH Level *
                </label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={manualPh}
                  onChange={(e) => setManualPh(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Ideal: 7.5 - 8.5</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dissolved Oxygen (mg/L) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={manualDo}
                  onChange={(e) => setManualDo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Ideal: &ge; 5.0 mg/L</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Turbidity (NTU) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={manualTurbidity}
                  onChange={(e) => setManualTurbidity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Ideal: 25 - 45 NTU</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Observation / Physical Notes
              </label>
              <input
                type="text"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="e.g. Afternoon testing during cloudy weather"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white font-bold shadow transition-all"
            >
              {loading ? 'Evaluating...' : 'Submit & Analyze Water Quality'}
            </button>
          </form>
        </div>
      )}

      {/* Live Result & Rule-Based Health Analysis */}
      {latestResult && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5 animate-in fade-in">
          
          {/* Header of analysis with simulated/manual badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Pond Health & Parameter Analysis Result
                </h3>
                {latestResult.record?.isSimulated ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center space-x-1">
                    <Cpu className="w-3 h-3" />
                    <span>{t('simulatedTag')}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {t('manualTag')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Timestamp: {new Date(latestResult.record?.timestamp || Date.now()).toLocaleString()}
              </p>
            </div>

            {/* Health Score & Status Badge */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Health Score</span>
                <span className="text-2xl font-black text-slate-900">
                  {latestResult.evaluation?.healthScore} / 100
                </span>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase border ${
                latestResult.evaluation?.status === 'critical'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : latestResult.evaluation?.status === 'warning'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {latestResult.evaluation?.status}
              </span>
            </div>
          </div>

          {/* 4 Measured Values Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Dissolved O2</div>
              <div className="text-xl font-black text-teal-700 mt-0.5">
                {latestResult.record?.dissolvedOxygen} mg/L
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Target &ge; 5.0 mg/L</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">pH Level</div>
              <div className="text-xl font-black text-emerald-700 mt-0.5">
                {latestResult.record?.pH}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Target 7.5 - 8.5</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Temperature</div>
              <div className="text-xl font-black text-amber-700 mt-0.5">
                {latestResult.record?.temperature} °C
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Target 26 - 32 °C</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Turbidity</div>
              <div className="text-xl font-black text-indigo-700 mt-0.5">
                {latestResult.record?.turbidity} NTU
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Target 25 - 45 NTU</div>
            </div>
          </div>

          {/* Rule Violations List if any */}
          {latestResult.evaluation?.violations?.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
              <span className="font-bold text-xs text-rose-900 block">
                Detected Parameter Threshold Deviations:
              </span>
              <ul className="space-y-1.5 text-xs text-rose-800">
                {latestResult.evaluation.violations.map((v, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="font-bold">&bull;</span>
                    <span>{v.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actionable Recommended Action */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950">
            <span className="font-bold text-emerald-900 block mb-1">
              💡 {t('recommendedAction')}:
            </span>
            <p className="leading-relaxed">
              {latestResult.evaluation?.recommendedAction}
            </p>
          </div>

          {/* Clear Non-Clinical Agricultural Disclaimer */}
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] flex items-start space-x-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-500" />
            <span>
              {t('disclaimerText')}
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
