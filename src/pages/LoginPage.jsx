import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, MOCK_USERS } from '../features/auth/index.js';
import { Card, Button } from '../components/ui/index.js';
import { useUIStore } from '../store/uiStore.js';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Staff & Admin Portal Login — RailFood Audit';
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  // Demo credential sets
  const demoAccounts = {
    inspector: {
      email: 'inspector.nr@railfood.gov.in',
      password: 'Railway@2026',
      role: 'inspector',
      label: 'Food Safety Inspector (Northern Zone)'
    },
    admin: {
      email: 'admin.hq@railfood.gov.in',
      password: 'AdminHQ@2026',
      role: 'admin',
      label: 'Catering Authority Administrator (HQ)'
    }
  };

  const handleQuickFill = (roleKey) => {
    const creds = demoAccounts[roleKey];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setErrorMsg('');
      useUIStore.getState().showToast({
        type: 'info',
        title: 'Credentials Loaded',
        message: `Filled demo credentials for ${creds.label}.`
      });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your Railway Email and Password.');
      return;
    }

    setIsSubmitting(true);

    // Simulate verification delay
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      
      if (
        normalizedEmail === demoAccounts.inspector.email.toLowerCase() &&
        password === demoAccounts.inspector.password
      ) {
        login('inspector');
        useUIStore.getState().showToast({
          type: 'success',
          title: 'Authentication Successful',
          message: 'Welcome back, Inspector R. K. Sharma (Northern Zone)'
        });
        navigate(from, { replace: true });
      } else if (
        normalizedEmail === demoAccounts.admin.email.toLowerCase() &&
        password === demoAccounts.admin.password
      ) {
        login('admin');
        useUIStore.getState().showToast({
          type: 'success',
          title: 'Admin Session Activated',
          message: 'Welcome back, Director P. Verma (Catering Administration HQ)'
        });
        navigate('/admin/batches', { replace: true });
      } else {
        setIsSubmitting(false);
        setErrorMsg('Invalid Railway Employee credentials. Please verify your Email and Password.');
        useUIStore.getState().showToast({
          type: 'error',
          title: 'Access Denied',
          message: 'Incorrect email or password entered for Railway Staff Portal.'
        });
      }
    }, 400);
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
          <Link
            to="/"
            className="text-xs text-railway-300 hover:text-white flex items-center gap-1"
          >
            &larr; Back to Public Website
          </Link>
        </div>
      </header>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-slate-200 overflow-hidden bg-white">
          <div className="bg-railway-800 text-white p-6 text-center">
            <span className="text-4xl block mb-2" role="img" aria-label="shield">
              🛡️
            </span>
            <h1 className="text-lg font-bold">Railway Staff Audit Portal</h1>
            <p className="text-xs text-railway-200 mt-1">
              Authorized Quality Inspectors & Administrators Only
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {errorMsg && (
              <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="staff-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Railway Employee ID / Email
              </label>
              <input
                id="staff-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
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
              {isSubmitting ? 'Verifying Credentials...' : 'Sign In to Workspace →'}
            </Button>

            {/* Quick-Fill Evaluator Chips */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                ⚡ Quick-Fill Demo Credentials (For Evaluation):
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('inspector')}
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-railway-50 hover:border-railway-300 text-left text-xs transition-colors cursor-pointer"
                >
                  <strong className="text-slate-900 block font-semibold">1. Inspector (Northern Zone)</strong>
                  <span className="text-[11px] text-slate-500 font-mono block">inspector.nr@railfood.gov.in • Pass: Railway@2026</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-railway-50 hover:border-railway-300 text-left text-xs transition-colors cursor-pointer"
                >
                  <strong className="text-slate-900 block font-semibold">2. Administrator (Catering HQ)</strong>
                  <span className="text-[11px] text-slate-500 font-mono block">admin.hq@railfood.gov.in • Pass: AdminHQ@2026</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-slate-500">
              Are you a passenger?{' '}
              <Link to="/" className="text-railway-700 font-bold hover:underline">
                Return to Public Grievance Portal
              </Link>
            </div>
          </form>
        </Card>
      </div>

      <footer className="py-4 text-center text-xs text-slate-500">
        RailFood Audit &copy; {new Date().getFullYear()} • Secure 256-Bit SSL Encrypted Staff Gateway
      </footer>
    </div>
  );
}

export default LoginPage;
