import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Shield,
  Users,
  Waves,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Activity,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('farmers'); // 'farmers' | 'ponds' | 'alerts'
  const [metrics, setMetrics] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [allPonds, setAllPonds] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [metricsRes, farmersRes, pondsRes, alertsRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/farmers'),
        api.get('/admin/ponds'),
        api.get('/alerts?limit=50')
      ]);

      if (metricsRes.data.success) setMetrics(metricsRes.data.data);
      if (farmersRes.data.success) setFarmers(farmersRes.data.data);
      if (pondsRes.data.success) setAllPonds(pondsRes.data.data);
      if (alertsRes.data.success) setAlerts(alertsRes.data.data);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleFarmerStatus = async (farmerId) => {
    try {
      const res = await api.patch(`/admin/farmers/${farmerId}/status`);
      if (res.data.success) {
        setFarmers((prev) =>
          prev.map((f) => (f._id === farmerId ? { ...f, status: res.data.data.status } : f))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update farmer status');
    }
  };

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.farmLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPonds = allPonds.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pondNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white">
                ShrimpGuard Central Administration Hub
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                ADMIN PRIVILEGES
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Platform-wide supervision: Farmer accounts, pond condition monitoring, and critical risk alerts.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
          title="Refresh All System Telemetry"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Farmers */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Registered Farmers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">
              {metrics?.farmers?.total || farmers.length}
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              ({metrics?.farmers?.active || farmers.length} Active)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Account holders</span>
        </div>

        {/* Total Ponds */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Managed Ponds</span>
            <Waves className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">
              {metrics?.ponds?.total || allPonds.length}
            </span>
            <span className="text-xs text-slate-400">ponds</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {metrics?.ponds?.normal || 0} in optimal condition
          </span>
        </div>

        {/* Warning Ponds */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-amber-200">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Warning Status Ponds</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-600">
              {metrics?.ponds?.warning || 0}
            </span>
            <span className="text-xs text-amber-500">ponds</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            Environmental deviations
          </span>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-200">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>Critical Ponds / Alerts</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-600">
              {metrics?.ponds?.critical || 0}
            </span>
            <span className="text-xs text-rose-500">critical</span>
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-1 block">
            High mortality risk
          </span>
        </div>

      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex rounded-2xl bg-slate-200/80 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('farmers')}
            className={`py-2 px-4 rounded-xl transition-all ${
              activeTab === 'farmers' ? 'bg-white shadow text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👨‍🌾 Manage Farmers ({farmers.length})
          </button>
          <button
            onClick={() => setActiveTab('ponds')}
            className={`py-2 px-4 rounded-xl transition-all ${
              activeTab === 'ponds' ? 'bg-white shadow text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌊 All Ponds Telemetry ({allPonds.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-4 rounded-xl transition-all ${
              activeTab === 'alerts' ? 'bg-white shadow text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚨 System Risk Alerts ({alerts.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tab 1: Farmers Management */}
      {activeTab === 'farmers' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Registered Aquaculture Farmers Directory
            </h3>
            <span className="text-xs text-slate-500">
              {filteredFarmers.length} registered accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Farmer Name & Contact</th>
                  <th className="py-3 px-4">Farm Location</th>
                  <th className="py-3 px-4 text-center">Ponds Stocked</th>
                  <th className="py-3 px-4 text-center">Active Alerts</th>
                  <th className="py-3 px-4 text-center">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFarmers.map((farmer) => (
                  <tr key={farmer._id} className="hover:bg-slate-50/70">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-sm">{farmer.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span>{farmer.email}</span>
                        <span>&bull;</span>
                        <span>{farmer.mobile}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {farmer.farmLocation}
                    </td>
                    <td className="py-4 px-4 text-center font-black text-slate-800">
                      {farmer.pondCount || 0} Ponds
                    </td>
                    <td className="py-4 px-4 text-center">
                      {farmer.activeAlerts?.total > 0 ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <span>{farmer.activeAlerts?.critical || 0} Critical</span>
                          <span>&bull;</span>
                          <span>{farmer.activeAlerts?.warning || 0} Warn</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600">
                          ✓ All Clear
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        farmer.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {farmer.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggleFarmerStatus(farmer._id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          farmer.status === 'active'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {farmer.status === 'active' ? 'Suspend Access' : 'Activate Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: All Registered Ponds */}
      {activeTab === 'ponds' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Supervised Ponds Telemetry Grid (Platform Wide)
            </h3>
            <span className="text-xs text-slate-500">
              {filteredPonds.length} ponds supervised
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Pond Identifier</th>
                  <th className="py-3 px-4">Farmer / Farm Location</th>
                  <th className="py-3 px-4">Shrimp Species & Stock</th>
                  <th className="py-3 px-4 text-center">Status & Health</th>
                  <th className="py-3 px-4 text-center">DO (mg/L)</th>
                  <th className="py-3 px-4 text-center">pH</th>
                  <th className="py-3 px-4 text-center">Temp (°C)</th>
                  <th className="py-3 px-4 text-center">Turbidity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPonds.map((p) => {
                  const last = p.lastReading || {};
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {p.pondNumber}
                        </span>
                        <div className="text-xs font-sans font-bold mt-1">{p.name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{p.farmer?.name || 'Farmer'}</div>
                        <div className="text-[11px] text-slate-500">{p.farmer?.farmLocation}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{p.species}</div>
                        <div className="text-[11px] text-emerald-700">
                          {(p.shrimpCount).toLocaleString()} PL &bull; {p.sizeHectares} Ha
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          p.status === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : p.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.status}
                        </span>
                        <div className="text-[11px] font-black text-slate-700 mt-0.5">
                          {p.currentHealthScore}/100
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-teal-700">
                        {last.dissolvedOxygen !== undefined ? `${last.dissolvedOxygen}` : '--'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-emerald-700">
                        {last.pH !== undefined ? `${last.pH}` : '--'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-amber-700">
                        {last.temperature !== undefined ? `${last.temperature}°` : '--'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-indigo-700">
                        {last.turbidity !== undefined ? `${last.turbidity}` : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: System Risk Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-3.5">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Live Warning & Critical Alerts Stream
            </h3>
            <span className="text-xs text-slate-500">
              {alerts.length} total environmental alert records
            </span>
          </div>

          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`rounded-3xl p-5 border ${
                alert.severity === 'critical'
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase text-white ${
                    alert.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-600'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {alert.farmer?.name} ({alert.farmer?.farmLocation})
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="font-semibold text-xs text-slate-700">
                    {alert.pond?.name} ({alert.pond?.pondNumber})
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>

              <h4 className="font-bold text-xs text-slate-900 mt-2">
                {alert.title}
              </h4>
              <p className="text-xs text-slate-700 mt-1">
                {alert.message}
              </p>

              <div className="mt-3 p-3 rounded-2xl bg-white/90 border border-slate-200 text-xs">
                <strong className="text-emerald-800">Prescribed Farmer Action: </strong>
                <span>{alert.recommendedAction}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
