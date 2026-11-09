import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Waves,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Cpu,
  Plus,
  ArrowRight,
  Droplets,
  Thermometer,
  Activity,
  Wind,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  ChevronRight
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

export default function FarmerDashboard({
  dashboardData,
  onSelectPond,
  onAddPond,
  onOpenFeed,
  onOpenWaterMonitoring,
  onOpenAlerts,
  onSimulatePreset,
  isSimulating
}) {
  const { t } = useLanguage();
  const [selectedChartParam, setSelectedChartParam] = useState('dissolvedOxygen');

  const {
    pondsSummary = { total: 0, normal: 0, warning: 0, critical: 0 },
    feedSummary = { todayKg: 0, weeklyKg: 0, monthlyKg: 0 },
    unreadAlertsCount = 0,
    recentAlerts = [],
    ponds = [],
    telemetryTrends = []
  } = dashboardData || {};

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-700',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-500'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500'
        };
      case 'normal':
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hardware-Free Simulation Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-forest-900 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-emerald-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-800/80 border border-emerald-600/60 text-emerald-300">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-wide uppercase text-emerald-300">
                Hardware-Free Sensor Simulation Engine
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl">
              {t('simulationDesc')} Click presets below to inject telemetry and inspect live rule-based alerts:
            </p>
          </div>
        </div>

        {/* Demo Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => onSimulatePreset('normal')}
            disabled={isSimulating}
            className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-xs font-semibold text-white border border-emerald-400/40 shadow-sm flex items-center justify-center space-x-1.5 transition-all"
            title="Inject optimal temperature, pH, DO"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
            <span>Normal Preset</span>
          </button>
          <button
            onClick={() => onSimulatePreset('warning')}
            disabled={isSimulating}
            className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-xs font-semibold text-white border border-amber-400/40 shadow-sm flex items-center justify-center space-x-1.5 transition-all"
            title="Inject heat stress and minor DO drop"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
            <span>Warning Preset</span>
          </button>
          <button
            onClick={() => onSimulatePreset('critical')}
            disabled={isSimulating}
            className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-xs font-semibold text-white border border-rose-400/40 shadow-sm flex items-center justify-center space-x-1.5 transition-all"
            title="Inject severe hypoxia (DO < 3.0 mg/L) and alkaline shock"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-200" />
            <span>Critical Preset</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Ponds */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t('totalPonds')}</span>
            <Waves className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{pondsSummary.total}</span>
            <span className="text-[11px] text-slate-400">units</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">All registered ponds</div>
        </div>

        {/* Normal Condition */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold">{t('normalPonds')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-600">{pondsSummary.normal}</span>
            <span className="text-[11px] text-emerald-500">ponds</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">Optimal parameters</div>
        </div>

        {/* Warning Condition */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold">{t('warningPonds')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-600">{pondsSummary.warning}</span>
            <span className="text-[11px] text-amber-500">ponds</span>
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">Attention needed</div>
        </div>

        {/* Critical Condition */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-semibold">{t('criticalPonds')}</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-rose-600">{pondsSummary.critical}</span>
            <span className="text-[11px] text-rose-500">ponds</span>
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">Immediate intervention</div>
        </div>

        {/* Today's Feed */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t('todayFeed')}</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black text-slate-900">{feedSummary.todayKg}</span>
            <span className="text-[11px] text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-teal-600 mt-1 font-medium">Morning + Noon + Night</div>
        </div>

        {/* Monthly Feed */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t('monthlyFeed')}</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black text-slate-900">{feedSummary.monthlyKg}</span>
            <span className="text-[11px] text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium">Last 30-day sum</div>
        </div>

      </div>

      {/* Main Grid: Telemetry Trends & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Water Quality Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                <span>🌊 Farm Water Quality Telemetry History</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                  Multi-Pond
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time & simulated readings showing trends and parameter fluctuations
              </p>
            </div>

            {/* Parameter Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setSelectedChartParam('dissolvedOxygen')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedChartParam === 'dissolvedOxygen' ? 'bg-white shadow text-teal-700 font-bold' : 'text-slate-600'
                }`}
              >
                DO (mg/L)
              </button>
              <button
                onClick={() => setSelectedChartParam('pH')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedChartParam === 'pH' ? 'bg-white shadow text-emerald-700 font-bold' : 'text-slate-600'
                }`}
              >
                pH
              </button>
              <button
                onClick={() => setSelectedChartParam('temperature')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedChartParam === 'temperature' ? 'bg-white shadow text-amber-700 font-bold' : 'text-slate-600'
                }`}
              >
                Temp (°C)
              </button>
              <button
                onClick={() => setSelectedChartParam('turbidity')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedChartParam === 'turbidity' ? 'bg-white shadow text-indigo-700 font-bold' : 'text-slate-600'
                }`}
              >
                Turbidity
              </button>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-64 sm:h-72 w-full mt-4">
            {telemetryTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(value, name) => [value, name === 'dissolvedOxygen' ? 'DO (mg/L)' : name]}
                  />
                  <Line
                    type="monotone"
                    dataKey={selectedChartParam}
                    stroke={
                      selectedChartParam === 'dissolvedOxygen'
                        ? '#0d9488'
                        : selectedChartParam === 'pH'
                        ? '#059669'
                        : selectedChartParam === 'temperature'
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
                No telemetry readings recorded yet.
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-2">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              <span>Target DO: &ge; 5.0 mg/L</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Target pH: 7.5 - 8.5</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Target Temp: 26 - 32 °C</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span>Target Turbidity: 25 - 45 NTU</span>
            </span>
          </div>
        </div>

        {/* Right Col: Recent Alerts Widget */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {t('recentAlerts')}
                </h3>
              </div>
              <button
                onClick={onOpenAlerts}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {recentAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  {t('noAlerts')}
                </div>
              ) : (
                recentAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert._id}
                    className={`p-3 rounded-2xl border transition-all ${
                      alert.severity === 'critical'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : 'bg-amber-50/70 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-rose-200 text-rose-800'
                          : 'bg-amber-200 text-amber-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold mt-1.5 line-clamp-1">
                      {alert.pond ? alert.pond.name : 'Pond'}: {alert.title}
                    </h4>
                    <p className="text-[11px] text-slate-700 mt-1 line-clamp-2">
                      {alert.message}
                    </p>

                    {alert.recommendedAction && (
                      <div className="mt-2 text-[10px] bg-white/80 p-2 rounded-xl font-medium text-slate-800 border border-slate-200/60 flex items-start space-x-1.5">
                        <span className="text-emerald-700 font-bold flex-shrink-0">Action:</span>
                        <span className="line-clamp-2">{alert.recommendedAction}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>In-App Dispatch: <span className="text-emerald-600 font-semibold">Active</span></span>
            <span>SMS/Email: <span className="text-slate-400 font-medium">Ready</span></span>
          </div>
        </div>

      </div>

      {/* Ponds Section Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>🌊 My Registered Ponds</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              {ponds.length} active
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click on any pond card to view in-depth telemetry, log feeds, or trigger sensor simulations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenFeed}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <span>🥣</span>
            <span>{t('logFeedTitle')}</span>
          </button>
          <button
            onClick={onAddPond}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-700/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addPond')}</span>
          </button>
        </div>
      </div>

      {/* Individual Pond Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ponds.map((pond) => {
          const statusStyle = getStatusColor(pond.status);
          const last = pond.lastReading || {};

          // Calculate DOC (Days of culture)
          const doc = Math.max(
            0,
            Math.floor((new Date().getTime() - new Date(pond.stockingDate).getTime()) / (1000 * 60 * 60 * 24))
          );

          return (
            <div
              key={pond._id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Pond Name, Identifier, Status Pill */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {pond.pondNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">
                        {pond.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {pond.species}
                    </p>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border flex items-center space-x-1 ${statusStyle.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} animate-pulse`}></span>
                    <span>{pond.status}</span>
                  </span>
                </div>

                {/* Culture Meta Info */}
                <div className="grid grid-cols-3 gap-2 mt-4 py-2.5 px-3 bg-slate-50 rounded-2xl text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Size</div>
                    <div className="text-xs font-bold text-slate-800">{pond.sizeHectares} Ha</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">DOC</div>
                    <div className="text-xs font-bold text-emerald-700">{doc} Days</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Stock</div>
                    <div className="text-xs font-bold text-slate-800">
                      {(pond.shrimpCount / 1000).toFixed(0)}k PL
                    </div>
                  </div>
                </div>

                {/* Health Score Gauge / Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600">{t('healthScore')}</span>
                    <span className={`text-sm ${
                      pond.currentHealthScore >= 85
                        ? 'text-emerald-700'
                        : pond.currentHealthScore >= 60
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}>
                      {pond.currentHealthScore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pond.currentHealthScore >= 85
                          ? 'bg-emerald-500'
                          : pond.currentHealthScore >= 60
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, pond.currentHealthScore)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Water Quality Telemetry Pills */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  
                  {/* DO */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Dissolved O2</span>
                      <Wind className="w-3 h-3 text-teal-600" />
                    </div>
                    <div className="text-sm font-black text-slate-800 mt-0.5">
                      {last.dissolvedOxygen !== undefined ? `${last.dissolvedOxygen} mg/L` : '--'}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Target &ge; 5.0</div>
                  </div>

                  {/* pH */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>pH Level</span>
                      <Droplets className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="text-sm font-black text-slate-800 mt-0.5">
                      {last.pH !== undefined ? last.pH : '--'}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Target 7.5 - 8.5</div>
                  </div>

                  {/* Temp */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Temperature</span>
                      <Thermometer className="w-3 h-3 text-amber-600" />
                    </div>
                    <div className="text-sm font-black text-slate-800 mt-0.5">
                      {last.temperature !== undefined ? `${last.temperature} °C` : '--'}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Target 26 - 32</div>
                  </div>

                  {/* Turbidity */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Turbidity</span>
                      <Activity className="w-3 h-3 text-indigo-600" />
                    </div>
                    <div className="text-sm font-black text-slate-800 mt-0.5">
                      {last.turbidity !== undefined ? `${last.turbidity} NTU` : '--'}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Target 25 - 45</div>
                  </div>

                </div>

              </div>

              {/* Bottom Action Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {last.timestamp ? `Updated ${new Date(last.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No readings'}
                </span>
                <button
                  onClick={() => onSelectPond(pond)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1 transition-all"
                >
                  <span>Inspect Pond</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
