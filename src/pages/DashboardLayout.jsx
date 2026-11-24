import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/index.js';
import { AuditClock } from '../components/AuditClock.jsx';

/**
 * DashboardLayout with responsive mobile navigation and persistent enterprise footer
 * Features:
 * - Clickable brand logo routing to /dashboard
 * - Mobile hamburger slide-down menu with touch targets >= 44px
 * - Dynamic copyright year and clickable FSSAI / Rail Madad compliance modals
 * - Clickable phone & email links
 * - Zero horizontal overflow
 */
export function DashboardLayout() {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'fssai' | 'guidelines' | 'contact'

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

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 antialiased overflow-x-hidden">
      {/* Mobile Top App Bar (visible on md:hidden) */}
      <header className="md:hidden bg-railway-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-railway-300 rounded-lg p-1"
          aria-label="RailFood Audit Home"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="text-2xl" role="img" aria-label="train">🚆</span>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">RailFood Audit</h1>
            <p className="text-[10px] text-railway-300">Staff Portal</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg bg-railway-800 hover:bg-railway-700 text-white focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Nav Menu */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden bg-railway-950 text-white px-4 py-3 space-y-1.5 border-b border-railway-800 animate-in slide-in-from-top-2 z-30"
        >
          <div className="text-[11px] font-semibold tracking-wider text-railway-400 uppercase px-2 mb-1">
            Staff Navigation
          </div>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-railway-700 text-white shadow-xs'
                    : 'text-railway-200 hover:bg-railway-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}

          <div className="text-[11px] font-semibold tracking-wider text-railway-400 uppercase px-2 pt-2 border-t border-railway-800">
            Public Passenger Portals
          </div>
          <Link
            to="/f/Xk9PqA72mZ"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-emerald-400 hover:bg-railway-800"
          >
            <span>📱</span>
            <span>Passenger QR Portal (Module A)</span>
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-railway-200 hover:bg-railway-800"
          >
            <span>🔎</span>
            <span>Track Grievance</span>
          </Link>

          <div className="pt-3 border-t border-railway-800 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-railway-400">User:</span>
              <strong className="text-white">{currentUser?.name || 'Staff User'}</strong>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-railway-400">Role:</span>
              <span className="text-emerald-400 capitalize font-medium">{role} ({currentUser?.zone || 'NR'})</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 w-full min-h-[44px] flex items-center justify-center rounded bg-railway-800 hover:bg-red-600 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </nav>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-railway-900 text-white flex-shrink-0 border-r border-railway-800">
        <div className="p-5 border-b border-railway-800">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-railway-400 rounded-lg p-1 -m-1"
            title="RailFood Audit Home"
          >
            <div className="w-10 h-10 rounded-xl bg-railway-700 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
              🚆
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">RailFood Audit</h1>
              <p className="text-xs text-railway-300">Staff Portal</p>
            </div>
          </Link>
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

          <div className="text-[11px] font-semibold tracking-wider text-railway-400 uppercase px-3 pt-3 pb-1 border-t border-railway-800/80 mt-2">
            Public Passenger Portals
          </div>
          <Link
            to="/f/Xk9PqA72mZ"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-railway-800 hover:text-emerald-300 transition-all"
            title="Open Passenger Mobile Web App (Module A)"
          >
            <span className="text-sm">📱</span>
            <span>Passenger QR Portal</span>
          </Link>
          <Link
            to="/track"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-railway-200 hover:bg-railway-800 hover:text-white transition-all"
            title="Public Grievance Tracker"
          >
            <span className="text-sm">🔎</span>
            <span>Track Grievance</span>
          </Link>
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-railway-800 bg-railway-950/60">
          <div className="text-[11px] text-railway-400 font-medium">Logged in as:</div>
          <div className="text-xs font-bold text-white truncate">{currentUser?.name || 'Staff User'}</div>
          <div className="text-[10px] text-emerald-400 capitalize mt-0.5">Role: {role} • {currentUser?.zone || 'NR'}</div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full min-h-[38px] flex items-center justify-center text-xs text-center py-1.5 rounded bg-railway-800 hover:bg-red-600 text-white font-medium transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane with Nested Outlet */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link
              to="/f/Xk9PqA72mZ"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
              title="Launch Passenger Mobile QR Simulation (Module A)"
            >
              <span>📱</span>
              <span>Passenger QR View (Module A)</span>
            </Link>
            <div className="hidden sm:block text-xs text-slate-500">
              Environment: <strong className="text-slate-800 font-mono">React 19 / Fast Refresh</strong>
            </div>
          </div>
          <AuditClock />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Dynamic, responsive enterprise footer */}
        <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-4 text-xs text-slate-600">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="font-semibold text-slate-800">
                Indian Railways Food Quality Audit Platform &copy; {currentYear}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Compliant with FSSAI Food Safety Act & IRCTC Catering Policy
              </p>
            </div>

            {/* Clickable links and actions */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveModal('guidelines')}
                className="text-railway-700 hover:text-railway-900 hover:underline cursor-pointer min-h-[32px] flex items-center"
              >
                Catering Guidelines
              </button>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={() => setActiveModal('fssai')}
                className="text-railway-700 hover:text-railway-900 hover:underline cursor-pointer min-h-[32px] flex items-center"
              >
                FSSAI Standards
              </button>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <Link
                to="/track"
                className="text-railway-700 hover:text-railway-900 hover:underline min-h-[32px] flex items-center"
              >
                Public Grievance Tracker
              </Link>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={() => setActiveModal('contact')}
                className="text-railway-700 hover:text-railway-900 hover:underline cursor-pointer min-h-[32px] flex items-center"
              >
                Support & Helpline
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Information Modals */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === 'guidelines' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>📜</span> IRCTC Catering Quality Guidelines
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
                  <p>
                    <strong>Clause 8 (Hygiene & Food Safety):</strong> Base kitchens must maintain thermal insulation of cooked meals between 65°C and 70°C prior to train loading.
                  </p>
                  <p>
                    <strong>Packaging & QR Traceability:</strong> All casserole trays and meal boxes must feature an authorized QR security seal identifying the production kitchen, batch number, and expiration timeframe.
                  </p>
                  <p>
                    <strong>Escalation Threshold:</strong> 3 or more hygiene or foreign object complaints within any 2-hour window triggers an immediate supervisor alert and mandatory kitchen inspection.
                  </p>
                </div>
              </>
            )}

            {activeModal === 'fssai' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🛡️</span> FSSAI Compliance Protocols
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
                  <p>
                    All empanelled caterers operate under valid 14-digit FSSAI licenses. Regular microbiological swab tests and potable water audits are documented in this system.
                  </p>
                  <p>
                    Inspectors verify batch expiry dates, tamper-evident seals, and cold-chain integrity during random station audit stops.
                  </p>
                </div>
              </>
            )}

            {activeModal === 'contact' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>📞</span> Support & Official Helplines
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Rail Madad 24x7 Helpline:</span>
                    <a
                      href="tel:139"
                      className="text-base font-bold text-railway-800 hover:text-railway-900 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <span>📞</span> Dial 139 (Toll Free)
                    </a>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Quality Audit Support Desk:</span>
                    <a
                      href="mailto:support@railfood-audit.gov.in"
                      className="text-xs font-semibold text-railway-800 hover:text-railway-900 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <span>✉️</span> support@railfood-audit.gov.in
                    </a>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Emergency Vendor Escalations:</span>
                    <a
                      href="tel:+911123340000"
                      className="text-xs font-semibold text-railway-800 hover:text-railway-900 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <span>📞</span> +91 11 2334 0000 (Northern Railway HQ)
                    </a>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
