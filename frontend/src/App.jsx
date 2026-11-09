import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/common/Navbar';
import AuthView from './components/common/AuthView';
import FarmerDashboard from './components/farmer/FarmerDashboard';
import PondManager from './components/farmer/PondManager';
import PondDetailsView from './components/farmer/PondDetailsView';
import FeedManager from './components/farmer/FeedManager';
import WaterMonitoringView from './components/farmer/WaterMonitoringView';
import PondComparison from './components/farmer/PondComparison';
import AlertCenter from './components/farmer/AlertCenter';
import ExpenseTracker from './components/farmer/ExpenseTracker';
import HarvestRecords from './components/farmer/HarvestRecords';
import FarmerProfile from './components/farmer/FarmerProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import api from './services/api';

function MainApp() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { t } = useLanguage();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPond, setSelectedPond] = useState(null);

  // Global state for farmer data
  const [dashboardData, setDashboardData] = useState(null);
  const [ponds, setPonds] = useState([]);
  const [unreadAlerts, setUnreadAlerts] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch farmer dashboard data
  const loadFarmerData = async () => {
    if (!user || isAdmin) return;
    try {
      const [dashRes, pondsRes, alertsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/ponds'),
        api.get('/alerts?isRead=false&limit=10')
      ]);

      if (dashRes.data.success) {
        setDashboardData(dashRes.data.data);
      }
      if (pondsRes.data.success) {
        setPonds(pondsRes.data.data);
      }
      if (alertsRes.data.success) {
        setUnreadAlerts(alertsRes.data.data);
      }
    } catch (err) {
      console.error('Error loading farmer data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        setActiveTab('admin-dashboard');
      } else {
        setActiveTab('dashboard');
        loadFarmerData();
      }
    }
  }, [user, isAdmin]);

  // Handle Quick Simulation Preset from Dashboard
  const handleSimulatePreset = async (scenario) => {
    if (!ponds || ponds.length === 0) {
      alert('Please register at least one pond before running simulation.');
      return;
    }
    // Simulate on the first pond or critical on third pond for rich visual demo
    const targetPond = scenario === 'critical' && ponds.length > 2
      ? ponds[2]
      : scenario === 'warning' && ponds.length > 1
      ? ponds[1]
      : ponds[0];

    try {
      setIsSimulating(true);
      const res = await api.post('/water-quality/simulate', {
        pondId: targetPond._id,
        scenario
      });
      if (res.data.success) {
        await loadFarmerData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Simulation error');
    } finally {
      setIsSimulating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-3 shadow-xl mb-3 mx-auto animate-bounce">
            <span className="text-4xl">🦐</span>
          </div>
          <h2 className="text-lg font-bold">Initializing ShrimpGuard...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlerts={unreadAlerts}
        onOpenAlerts={() => setActiveTab('alerts')}
      />

      {/* Secondary Navigation Bar (Farmer Tabs) */}
      {!isAdmin && (
        <nav className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-sm overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 sm:space-x-2 py-2">
              
              <button
                onClick={() => { setActiveTab('dashboard'); setSelectedPond(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>📊</span>
                <span>{t('navDashboard')}</span>
              </button>

              <button
                onClick={() => { setActiveTab('ponds'); setSelectedPond(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === 'ponds' || activeTab === 'pond-details'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>🌊</span>
                <span>{t('navPonds')}</span>
              </button>

              <button
                onClick={() => { setActiveTab('feed'); setSelectedPond(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === 'feed'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>🥣</span>
                <span>{t('navFeed')}</span>
              </button>

              <button
                onClick={() => { setActiveTab('water'); setSelectedPond(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === 'water'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>🧪</span>
                <span>{t('navWater')}</span>
              </button>

              <button
                onClick={() => { setActiveTab('compare'); setSelectedPond(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === 'compare'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>⚖️</span>
                <span>{t('navComparison')}</span>
              </button>

              <button
                onClick={() => { setActiveTab('alerts'); setSelectedPond(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 relative ${
                  activeTab === 'alerts'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>🚨</span>
                <span>{t('navAlerts')}</span>
                {unreadAlerts.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>

              <button
                onClick={() => { setActiveTab('expenses'); setSelectedPond(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === 'expenses'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>💰</span>
                <span>{t('navExpenses')}</span>
              </button>

              <button
                onClick={() => { setActiveTab('harvest'); setSelectedPond(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === 'harvest'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>🦐</span>
                <span>{t('navHarvest')}</span>
              </button>

              <button
                onClick={() => { setActiveTab('profile'); setSelectedPond(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>👤</span>
                <span>{t('navProfile')}</span>
              </button>

            </div>
          </div>
        </nav>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isAdmin ? (
          <AdminDashboard />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <FarmerDashboard
                dashboardData={dashboardData}
                onSelectPond={(pond) => {
                  setSelectedPond(pond);
                  setActiveTab('pond-details');
                }}
                onAddPond={() => setActiveTab('ponds')}
                onOpenFeed={() => setActiveTab('feed')}
                onOpenWaterMonitoring={() => setActiveTab('water')}
                onOpenAlerts={() => setActiveTab('alerts')}
                onSimulatePreset={handleSimulatePreset}
                isSimulating={isSimulating}
              />
            )}

            {activeTab === 'ponds' && (
              <PondManager
                ponds={ponds}
                onRefresh={loadFarmerData}
                onSelectPond={(pond) => {
                  setSelectedPond(pond);
                  setActiveTab('pond-details');
                }}
              />
            )}

            {activeTab === 'pond-details' && selectedPond && (
              <PondDetailsView
                pondId={selectedPond._id}
                onBack={() => {
                  setSelectedPond(null);
                  setActiveTab('dashboard');
                }}
                onTriggerAlertUpdate={loadFarmerData}
              />
            )}

            {activeTab === 'feed' && (
              <FeedManager ponds={ponds} />
            )}

            {activeTab === 'water' && (
              <WaterMonitoringView
                ponds={ponds}
                onTriggerAlertUpdate={loadFarmerData}
              />
            )}

            {activeTab === 'compare' && (
              <PondComparison ponds={ponds} />
            )}

            {activeTab === 'alerts' && (
              <AlertCenter onAlertCountChange={loadFarmerData} />
            )}

            {activeTab === 'expenses' && (
              <ExpenseTracker ponds={ponds} />
            )}

            {activeTab === 'harvest' && (
              <HarvestRecords ponds={ponds} />
            )}

            {activeTab === 'profile' && (
              <FarmerProfile />
            )}
          </>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">ShrimpGuard</span>
            <span>&bull;</span>
            <span>Aquaculture Risk Intelligence</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold">Bilingual (English & తెలుగు)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Rule-Based Demonstration Model &bull; Hardware-Free Simulated Telemetry Engine
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
