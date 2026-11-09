import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Shield,
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Cpu,
  Layers
} from 'lucide-react';

export default function AuthView() {
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [farmLocation, setFarmLocation] = useState('');

  const fillFarmerDemo = () => {
    setMode('login');
    setEmail('farmer@shrimpguard.com');
    setPassword('farmer123');
    setError('');
  };

  const fillAdminDemo = () => {
    setMode('admin');
    setEmail('admin@shrimpguard.com');
    setPassword('admin123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name || !mobile || !email || !password || !farmLocation) {
          setError('Please fill in all registration fields.');
          setLoading(false);
          return;
        }

        const res = await register({
          name,
          mobile,
          email,
          password,
          farmLocation
        });

        if (!res.success) {
          setError(res.message || 'Registration failed');
        } else {
          setSuccessMsg('Account registered successfully! Welcome to ShrimpGuard.');
        }
      } else {
        // 'login' or 'admin'
        if (!email || !password) {
          setError('Please provide email and password.');
          setLoading(false);
          return;
        }

        const res = await login(email, password);
        if (!res.success) {
          setError(res.message || 'Invalid credentials');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-3 shadow-xl mb-3">
            <span className="text-4xl">🦐</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Shrimp<span className="text-emerald-400">Guard</span>
          </h2>
          <p className="mt-1 text-xs text-emerald-300/90 font-medium">
            Shrimp Farm Management, Pond Monitoring & Risk Alert System
          </p>
          <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[11px] text-emerald-300">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>Hardware-Free Simulation & Rule-Based Telemetry</span>
          </div>
        </div>

        {/* Demo Quick Fills Card */}
        <div className="mt-6 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl p-3.5 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-xs text-emerald-200 mb-2">
            <span className="font-semibold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Demo Evaluation Accounts:</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillFarmerDemo}
              className="px-3 py-2 rounded-xl bg-emerald-800/70 hover:bg-emerald-700 text-xs font-semibold text-emerald-100 border border-emerald-600/50 flex items-center justify-center space-x-1.5 transition-all shadow-sm"
            >
              <span>👨‍🌾</span>
              <span>Farmer Demo</span>
            </button>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-amber-200 border border-amber-600/40 flex items-center justify-center space-x-1.5 transition-all shadow-sm"
            >
              <span>🛡️</span>
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Main Auth Card */}
        <div className="mt-5 bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-200 text-slate-900">
          
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'login' ? 'bg-white shadow text-emerald-800 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Farmer Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'register' ? 'bg-white shadow text-emerald-800 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Farmer Register
            </button>
            <button
              type="button"
              onClick={() => { setMode('admin'); setError(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'admin' ? 'bg-slate-900 shadow text-amber-300 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Error & Success Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Fields for Farmer Registration */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Reddy"
                      className="block w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. +91 94401 67890"
                      className="block w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Farm Location *
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      placeholder="e.g. Bhimavaram Delta, AP"
                      className="block w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'admin' ? 'admin@shrimpguard.com' : 'farmer@shrimpguard.com'}
                  className="block w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white transition-all ${
                  mode === 'admin'
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-amber-300'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span>
                  {loading
                    ? 'Processing...'
                    : mode === 'register'
                    ? 'Create Farmer Account'
                    : mode === 'admin'
                    ? 'Sign In as System Admin'
                    : 'Sign In to Farm Dashboard'}
                </span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

          </form>

          {/* Quick Demo Credentials Reminder Box */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Pre-seeded Credentials:</div>
            <div className="flex justify-between">
              <span>Farmer Account:</span>
              <span className="font-mono text-emerald-700">farmer@shrimpguard.com / farmer123</span>
            </div>
            <div className="flex justify-between">
              <span>Admin Account:</span>
              <span className="font-mono text-amber-700">admin@shrimpguard.com / admin123</span>
            </div>
          </div>

        </div>

        {/* Footer Disclaimer */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          ShrimpGuard Aquaculture Intelligence &copy; 2026. Demonstration thresholds used for simulated sensor streams.
        </p>

      </div>
    </div>
  );
}
