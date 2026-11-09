import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell,
  LogOut,
  User,
  Shield,
  Layers,
  Cpu,
  Globe,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, unreadAlerts = [], onOpenAlerts }) {
  const { user, logout, isAdmin } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = unreadAlerts.filter((a) => !a.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-900 via-forest-900 to-emerald-950 text-white shadow-lg border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 shadow-inner flex items-center justify-center text-emerald-950">
              <span className="text-2xl font-black">🦐</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white flex items-center">
                  Shrimp<span className="text-emerald-400">Guard</span>
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {isAdmin ? t('adminBadge') : t('farmerBadge')}
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 hidden sm:block">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Center: Hardware-Free Simulated Sensor Badge */}
          <div className="hidden lg:flex items-center space-x-2 bg-emerald-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-700/50 text-xs text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Cpu className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-medium">Sensor Engine:</span>
            <span className="text-white font-semibold">Simulated & Manual Mode (Hardware-Free)</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Language Switcher */}
            <button
              onClick={() => toggleLanguage()}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/60 border border-emerald-700/50 text-xs font-medium text-emerald-100 transition-colors"
              title="Switch Language / భాషను మార్చండి"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/60 border border-emerald-700/50 text-emerald-100 transition-colors focus:outline-none"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-emerald-700" />
                      <span className="font-semibold text-sm text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-rose-100 text-rose-700 font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        if (onOpenAlerts) onOpenAlerts();
                      }}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                    >
                      View All
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {unreadAlerts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                        No unread alerts. All ponds are safe!
                      </div>
                    ) : (
                      unreadAlerts.slice(0, 5).map((alert) => (
                        <div
                          key={alert._id}
                          className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setShowNotifications(false);
                            if (onOpenAlerts) onOpenAlerts();
                          }}
                        >
                          <div className="flex items-start space-x-2">
                            {alert.severity === 'critical' ? (
                              <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {alert.title}
                              </p>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                                {alert.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Info & Profile */}
            <div className="flex items-center space-x-2 pl-2 border-l border-emerald-800">
              <div
                onClick={() => setActiveTab('profile')}
                className="hidden sm:flex items-center space-x-2 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white border border-emerald-500 group-hover:bg-emerald-600 transition-colors">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-emerald-300/80 truncate max-w-[120px]">
                    {user?.farmLocation || user?.email}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-emerald-800/60 hover:bg-rose-900/60 hover:text-rose-200 border border-emerald-700/50 text-emerald-200 transition-colors"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-emerald-800/60 text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950 border-t border-emerald-800 px-4 py-3 space-y-2">
          <div className="text-xs text-emerald-300 font-medium px-2 py-1">
            Logged in as: <span className="text-white font-bold">{user?.name}</span> ({user?.role})
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {!isAdmin ? (
              <>
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  📊 {t('navDashboard')}
                </button>
                <button
                  onClick={() => { setActiveTab('ponds'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'ponds' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  🌊 {t('navPonds')}
                </button>
                <button
                  onClick={() => { setActiveTab('water'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'water' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  🧪 {t('navWater')}
                </button>
                <button
                  onClick={() => { setActiveTab('feed'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'feed' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  🥣 {t('navFeed')}
                </button>
                <button
                  onClick={() => { setActiveTab('alerts'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'alerts' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  🚨 {t('navAlerts')}
                </button>
                <button
                  onClick={() => { setActiveTab('compare'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'compare' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  ⚖️ {t('navComparison')}
                </button>
                <button
                  onClick={() => { setActiveTab('expenses'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'expenses' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  💰 {t('navExpenses')}
                </button>
                <button
                  onClick={() => { setActiveTab('harvest'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'harvest' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  🦐 {t('navHarvest')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveTab('admin-dashboard'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'admin-dashboard' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  🏛️ Overview
                </button>
                <button
                  onClick={() => { setActiveTab('admin-farmers'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'admin-farmers' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  👨‍🌾 Farmers
                </button>
                <button
                  onClick={() => { setActiveTab('admin-ponds'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'admin-ponds' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  🌊 All Ponds
                </button>
                <button
                  onClick={() => { setActiveTab('admin-alerts'); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 text-xs rounded-lg text-left font-medium ${activeTab === 'admin-alerts' ? 'bg-emerald-600 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}
                >
                  🚨 System Alerts
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
