import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/index.js';
import { Card, Button } from '../components/ui/index.js';
import { useUIStore } from '../store/uiStore.js';

export function LoginPage() {
  const { loginWithCredentials, registerStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Staff Portal Authentication — RailFood Audit';
  }, []);

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign Up Form States
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('inspector');
  const [zone, setZone] = useState('Northern Zone');
  const [badgeId, setBadgeId] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your Railway Email and Password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginWithCredentials(email, password);
      setIsSubmitting(false);

      if (result.success) {
        useUIStore.getState().showToast({
          type: 'success',
          title: 'Authentication Successful',
          message: `Welcome back, ${result.user.name} (${result.user.zone})`
        });
        if (result.user.role === 'admin') {
          navigate('/admin/batches', { replace: true });
        } else if (result.user.role === 'vendor') {
          navigate('/vendor', { replace: true });
        } else if (result.user.role === 'inspector') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        setErrorMsg(result.error);
        useUIStore.getState().showToast({
          type: 'error',
          title: 'Access Denied',
          message: result.error
        });
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Login failed. Please check your credentials.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please complete all mandatory registration fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerStaff({
        name: fullName,
        email,
        password,
        role,
        zone,
        badgeId
      });
      setIsSubmitting(false);

      if (result.success) {
        useUIStore.getState().showToast({
          type: 'success',
          title: 'Account Registered',
          message: `Staff credentials created for ${result.user.name} [${role.toUpperCase()}].`
        });
        if (result.user.role === 'admin') {
          navigate('/admin/batches', { replace: true });
        } else if (result.user.role === 'vendor') {
          navigate('/vendor', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setErrorMsg(result.error);
        useUIStore.getState().showToast({
          type: 'error',
          title: 'Registration Error',
          message: result.error
        });
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-900">
      {/* Top Navbar */}
      <header className="bg-railway-900 text-white px-4 py-3 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-sm text-white group">
            <span className="text-xl group-hover:scale-110 transition-transform">🚆</span>
            <span>RailFood Audit Public Portal</span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg bg-railway-800 hover:bg-railway-700 text-white font-medium flex items-center gap-1.5 transition-colors border border-railway-700"
            >
              <span>←</span>
              <span>Back to Public Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-2xl border-slate-200 overflow-hidden bg-white">
          <div className="bg-railway-800 text-white p-6 text-center">
            <span className="text-4xl block mb-2" role="img" aria-label="shield">
              🛡️
            </span>
            <h1 className="text-lg font-bold">Railway Staff Audit Gateway</h1>
            <p className="text-xs text-railway-200 mt-1">
              Food Safety Officers & Catering Administration
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 p-1.5 gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
              className={`min-h-[42px] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-railway-900 shadow-sm font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🔑</span>
              <span>Staff Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
              className={`min-h-[42px] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-railway-900 shadow-sm font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📝</span>
              <span>Register New Staff</span>
            </button>
          </div>

          {errorMsg && (
            <div role="alert" className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form 1: Sign In */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="p-6 space-y-4 animate-in fade-in">
              <div>
                <label htmlFor="staff-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Railway Official Email
                </label>
                <input
                  id="staff-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errorMsg) setErrorMsg(''); }}
                  placeholder="e.g. inspector.nr@railfood.gov.in"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-railway-500 min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="staff-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Security Password
                </label>
                <div className="relative">
                  <input
                    id="staff-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errorMsg) setErrorMsg(''); }}
                    placeholder="••••••••••••"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-railway-500 min-h-[44px] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800 p-1"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full min-h-[44px] text-sm font-bold cursor-pointer mt-2"
              >
                {isSubmitting ? 'Verifying Credentials...' : 'Sign In to Official Workspace →'}
              </Button>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
                Need to register official credentials?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
                  className="text-railway-700 font-bold hover:underline cursor-pointer"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          )}

          {/* Form 2: Sign Up (Registration) */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="p-6 space-y-3.5 animate-in fade-in">
              <div>
                <label htmlFor="staff-fullname" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Officer Full Name
                </label>
                <input
                  id="staff-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Officer R. K. Sharma"
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-railway-500 min-h-[42px]"
                />
              </div>

              <div>
                <label htmlFor="staff-reg-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Railway Official Email
                </label>
                <input
                  id="staff-reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sharma.nr@railfood.gov.in"
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-railway-500 min-h-[42px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="staff-role" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Role
                  </label>
                  <select
                    id="staff-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white min-h-[42px]"
                  >
                    <option value="inspector">Safety Inspector</option>
                    <option value="vendor">Catering Vendor / Base Kitchen</option>
                    <option value="admin">Catering Administrator</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="staff-zone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Zone
                  </label>
                  <select
                    id="staff-zone"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white min-h-[42px]"
                  >
                    <option value="Northern Zone">Northern Zone</option>
                    <option value="Western Zone">Western Zone</option>
                    <option value="Southern Zone">Southern Zone</option>
                    <option value="Eastern Zone">Eastern Zone</option>
                    <option value="Central Zone">Central Zone</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="staff-reg-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Create Security Password
                </label>
                <input
                  id="staff-reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-railway-500 min-h-[42px]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full min-h-[44px] text-sm font-bold cursor-pointer mt-2"
              >
                {isSubmitting ? 'Registering Staff Credentials...' : 'Create Staff Credentials & Enter Portal →'}
              </Button>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 text-center">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
                  className="text-railway-700 font-bold hover:underline cursor-pointer"
                >
                  Sign In with Existing Credentials
                </button>
              </div>
            </form>
          )}

          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-xs text-slate-500">
            Are you a passenger?{' '}
            <Link to="/" className="text-railway-700 font-bold hover:underline">
              Return to Public Grievance Portal
            </Link>
          </div>
        </Card>
      </div>

      <footer className="py-4 text-center text-xs text-slate-500">
        RailFood Audit &copy; {new Date().getFullYear()} • Secure 256-Bit SSL Encrypted Gateway
      </footer>
    </div>
  );
}

export default LoginPage;
