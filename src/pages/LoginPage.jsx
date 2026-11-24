import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, MOCK_USERS } from '../features/auth/index.js';
import { Card, Button } from '../components/ui/index.js';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Railway Portal Access — RailFood Audit';
  }, []);

  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'passenger'
  const [selectedRole, setSelectedRole] = useState('inspector');
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = (e) => {
    e.preventDefault();
    login(selectedRole);
    navigate(from, { replace: true });
  };

  const sampleTokens = [
    { token: 'Xk9PqA72mZ', meal: 'Standard Veg Thali', train: '12424 Rajdhani' },
    { token: 'Lm7RzW91pQ', meal: 'Paneer Kulcha Combo', train: '12004 Shatabdi' },
    { token: 'Nt5DsF41hS', meal: 'Jain Meal Box', train: '12951 Tejas' }
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Card className="max-w-xl w-full shadow-2xl border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-railway-900 text-white p-6 text-center">
          <Link to="/dashboard" className="inline-block group focus:outline-none">
            <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform" role="img" aria-label="train">
              🚆
            </span>
            <h1 className="text-xl font-bold tracking-tight">RailFood Audit Platform</h1>
          </Link>
          <p className="text-xs text-railway-300 mt-1 max-w-sm mx-auto">
            Indian Railways Real-Time Food Safety, Traceability & Grievance Network
          </p>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`min-h-[44px] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white text-railway-900 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>🛡️</span>
            <span>Staff Portal (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('passenger')}
            className={`min-h-[44px] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'passenger'
                ? 'bg-white text-railway-900 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>📱</span>
            <span>Passenger Portal (Public)</span>
          </button>
        </div>

        {/* Tab 1: Staff Portal Login */}
        {activeTab === 'staff' && (
          <form onSubmit={handleLogin} className="p-6 space-y-4 animate-in fade-in">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
              <strong className="text-slate-800">Role-Based Staff Access:</strong> Select an authorized inspector or administrator credentials to enter the audit workspace.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Authorized Staff Identity
              </label>
              <div className="space-y-2.5">
                {MOCK_USERS.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedRole === user.role
                        ? 'border-railway-600 bg-railway-50/70 ring-1 ring-railway-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={user.role}
                      checked={selectedRole === user.role}
                      onChange={() => setSelectedRole(user.role)}
                      className="mt-0.5 text-railway-600 focus:ring-railway-500 min-h-[20px] min-w-[20px]"
                    />
                    <div className="text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 block font-bold">{user.name}</strong>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                          {user.role}
                        </span>
                      </div>
                      <span className="text-slate-600">Zone: {user.zone}</span>
                      <a
                        href={`mailto:${user.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] text-railway-700 hover:text-railway-900 hover:underline block font-mono mt-0.5"
                      >
                        {user.email}
                      </a>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full min-h-[44px] text-sm font-semibold cursor-pointer">
              Sign In to {selectedRole.toUpperCase()} Workspace &rarr;
            </Button>
          </form>
        )}

        {/* Tab 2: Passenger Portal (Module A) */}
        {activeTab === 'passenger' && (
          <div className="p-6 space-y-4 animate-in fade-in">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <span>📱</span>
                <span>Module A: Public Passenger Web App</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                Railway passengers <strong>do not need to log in or create an account</strong>. In live operations, passengers scan the unique tamper-evident QR sticker on their meal packaging to launch this mobile feedback interface instantly.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Launch Passenger Experiences:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/f/Xk9PqA72mZ"
                  className="p-4 rounded-xl border border-railway-200 bg-white hover:bg-railway-50/60 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-2xl block mb-1">📸</span>
                    <strong className="text-sm font-bold text-slate-900 group-hover:text-railway-800">
                      File Food Grievance
                    </strong>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Simulate scanning a live meal package, rate quality, and attach camera photo evidence.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-railway-700 mt-3 inline-flex items-center gap-1">
                    Open QR Portal &rarr;
                  </span>
                </Link>

                <Link
                  to="/track"
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-2xl block mb-1">🔎</span>
                    <strong className="text-sm font-bold text-slate-900 group-hover:text-railway-800">
                      Track Grievance Status
                    </strong>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      Check real-time resolution progress and inspector action notes using your reference code.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 mt-3 inline-flex items-center gap-1">
                    Track by Ref # &rarr;
                  </span>
                </Link>
              </div>

              {/* Sample QR Codes to Test */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Sample Authorized Packaging Tokens to Test:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {sampleTokens.map((item) => (
                    <Link
                      key={item.token}
                      to={`/f/${item.token}`}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-railway-300 text-left transition-colors"
                    >
                      <code className="text-xs font-mono font-bold text-railway-800 block">{item.token}</code>
                      <span className="text-[11px] text-slate-600 block truncate">{item.meal}</span>
                      <span className="text-[10px] text-slate-400 block">{item.train}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-between">
          <span>RailFood Audit &copy; {new Date().getFullYear()}</span>
          <span className="text-[11px]">Toll Free Rail Madad: <a href="tel:139" className="text-railway-700 font-bold hover:underline">139</a></span>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
