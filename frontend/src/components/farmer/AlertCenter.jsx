import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Bell,
  Trash2,
  Check,
  Filter,
  RefreshCw,
  Radio,
  Mail,
  MessageSquare
} from 'lucide-react';
import api from '../../services/api';

export default function AlertCenter({ onAlertCountChange }) {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all' | 'critical' | 'warning' | 'unread'

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/alerts?limit=50');
      if (res.data.success) {
        setAlerts(res.data.data);
        if (onAlertCountChange) onAlertCountChange();
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/alerts/${id}/read`);
      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
      if (onAlertCountChange) onAlertCountChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/alerts/mark-all-read');
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      if (onAlertCountChange) onAlertCountChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      if (onAlertCountChange) onAlertCountChange();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'critical') return a.severity === 'critical';
    if (severityFilter === 'warning') return a.severity === 'warning';
    if (severityFilter === 'unread') return !a.isRead;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <span>🚨 {t('navAlerts')}</span>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated environmental warnings generated whenever a pond crosses critical biological thresholds.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{t('markAllRead')}</span>
            </button>
          )}
          <button
            onClick={fetchAlerts}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm"
            title="Refresh Alerts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-Channel Architecture Notice */}
      <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-emerald-300">
              Notification Dispatch Architecture
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              In-app notifications are delivered instantly. Backend architecture is prepared for SMS and SMTP email gateway integration.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <div className="flex items-center space-x-1 text-emerald-400">
            <Bell className="w-3.5 h-3.5" />
            <span className="font-semibold">In-App (Live)</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>SMS (Architecture Ready)</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <Mail className="w-3.5 h-3.5" />
            <span>Email (Architecture Ready)</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSeverityFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            severityFilter === 'all'
              ? 'bg-slate-900 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setSeverityFilter('critical')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            severityFilter === 'critical'
              ? 'bg-rose-600 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Critical ({criticalCount})
        </button>
        <button
          onClick={() => setSeverityFilter('warning')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            severityFilter === 'warning'
              ? 'bg-amber-600 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Warnings ({warningCount})
        </button>
        <button
          onClick={() => setSeverityFilter('unread')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            severityFilter === 'unread'
              ? 'bg-emerald-700 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Alerts Cards Feed */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 shadow-sm border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">{t('noAlerts')}</h3>
            <p className="text-xs text-slate-400 mt-1">
              No alert records matching the selected filter.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert._id}
              className={`rounded-3xl p-5 border transition-all ${
                !alert.isRead
                  ? alert.severity === 'critical'
                    ? 'bg-rose-50/70 border-rose-200 shadow-sm'
                    : 'bg-amber-50/70 border-amber-200 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-2xl flex-shrink-0 mt-0.5 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-200/80 text-rose-800'
                      : 'bg-amber-200/80 text-amber-800'
                  }`}>
                    {alert.severity === 'critical' ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {alert.pond?.pondNumber || 'Pond'}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {alert.pond?.name || 'Pond'}
                      </span>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 mt-1.5">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {alert.message}
                    </p>

                    {/* Recommended Action Box */}
                    <div className="mt-3 p-3 rounded-2xl bg-white/90 border border-slate-200 text-xs text-slate-800 flex items-start space-x-2">
                      <span className="font-bold text-emerald-700 flex-shrink-0">
                        Recommended Action:
                      </span>
                      <span className="font-medium">{alert.recommendedAction}</span>
                    </div>

                    <div className="mt-2.5 flex items-center space-x-3 text-[11px] text-slate-400">
                      <span>Logged: {new Date(alert.timestamp).toLocaleString()}</span>
                      <span>&bull;</span>
                      <span>Target: {alert.threshold || 'Aquaculture Target'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-start">
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkRead(alert._id)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark Read</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(alert._id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
