import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, MOCK_USERS } from '../features/auth/index.js';
import { Card, Button } from '../components/ui/index.js';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Staff Portal Sign In — RailFood Audit';
  }, []);

  const [selectedRole, setSelectedRole] = useState('inspector');
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = (e) => {
    e.preventDefault();
    login(selectedRole);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-slate-200">
        <div className="bg-railway-800 text-white p-6 text-center">
          <Link to="/dashboard" className="inline-block group focus:outline-none">
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform" role="img" aria-label="train">
              🚆
            </span>
            <h2 className="text-lg font-bold">Railway Staff Portal Login</h2>
          </Link>
          <p className="text-xs text-railway-200 mt-1">
            Indian Railways Food Safety & Quality Audit Platform
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Authorized Staff Identity
            </label>
            <div className="space-y-2">
              {MOCK_USERS.map((user) => (
                <label
                  key={user.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedRole === user.role
                      ? 'border-railway-600 bg-railway-50 ring-1 ring-railway-500'
                      : 'border-slate-200 hover:border-slate-300'
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
                  <div className="text-xs">
                    <strong className="text-slate-900 block font-semibold">{user.name}</strong>
                    <span className="text-slate-600 capitalize">{user.role} • {user.zone}</span>
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

          <Button type="submit" variant="primary" size="md" className="w-full min-h-[44px] text-sm font-semibold">
            Sign In to {selectedRole.toUpperCase()} Workspace
          </Button>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link to="/track" className="text-railway-700 hover:underline">
              🔎 Track Passenger Grievance
            </Link>
            <Link to="/f/Xk9PqA72mZ" className="text-railway-700 hover:underline">
              📱 Passenger QR Form
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default LoginPage;
