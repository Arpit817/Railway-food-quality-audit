import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/index.js';
import { AuditClock } from '../components/AuditClock.jsx';

/**
 * DashboardLayout with nested routes (<Outlet />)
 * Renders shared navigation sidebar + header, mounting child pages dynamically
 */
export function DashboardLayout() {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Inbox Overview', icon: '📋', end: true },
    { to: '/dashboard/complaints', label: 'All Complaints', icon: '📨' },
    { to: '/dashboard/vendors', label: 'Vendor Scorecards', icon: '🏢' },
    { to: '/dashboard/analytics', label: 'Quality Analytics', icon: '📊' }
  ];

  if (role === 'admin') {
    navLinks.push({ to: '/admin/batches', label: 'Admin Batch Portal', icon: '⚙️' });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-railway-900 text-white flex-shrink-0 flex flex-col border-r border-railway-800">
        <div className="p-5 border-b border-railway-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="train">🚆</span>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">RailFood Audit</h1>
              <p className="text-xs text-railway-300">Staff Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1" aria-label="Dashboard Nav">
          <div className="text-[11px] font-semibold tracking-wider text-railway-400 uppercase px-3 py-1">
            Navigation
          </div>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-railway-700 text-white shadow-xs'
                    : 'text-railway-200 hover:bg-railway-800 hover:text-white'
                }`
              }
            >
              <span className="text-sm">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-railway-800 bg-railway-950/60">
          <div className="text-[11px] text-railway-400 font-medium">Logged in as:</div>
          <div className="text-xs font-bold text-white truncate">{currentUser?.name || 'Staff User'}</div>
          <div className="text-[10px] text-emerald-400 capitalize mt-0.5">Role: {role} • {currentUser?.zone || 'NR'}</div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full text-xs text-center py-1.5 rounded bg-railway-800 hover:bg-red-600 text-white font-medium transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane with Nested Outlet */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Platform Environment: <strong className="text-slate-800 font-mono">React Router v7 / SPA</strong>
          </div>
          <AuditClock />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* NESTED ROUTE VIEW IS INJECTED HERE */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
