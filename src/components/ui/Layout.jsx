import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Responsive Application Layout
 * Features:
 * - Desktop sidebar (collapses to top-header slideout on mobile/tablet)
 * - Semantic accessibility elements (nav, main, header, footer)
 * - Mode toggle between Passenger Mobile View and Inspector Dashboard
 */
export function Layout({
  children,
  userRole = 'Inspector (Northern Zone)',
  activeView = 'dashboard',
  onViewChange
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Inspector Dashboard', icon: '📋' },
    { id: 'passenger', label: 'Passenger QR Portal', icon: '📱' },
    { id: 'analytics', label: 'Quality Analytics', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 antialiased">
      {/* Mobile Top Header (hidden on md and above) */}
      <header className="md:hidden bg-railway-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <a href="/dashboard" className="flex items-center gap-2.5 focus:outline-none">
          <span className="text-xl" role="img" aria-label="train">🚆</span>
          <div>
            <h1 className="text-sm font-bold tracking-tight">RailFood Audit</h1>
            <p className="text-[10px] text-railway-200">IRCTC Quality Assurance</p>
          </div>
        </a>

        <button
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg bg-railway-700 hover:bg-railway-600 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Dropdown Nav Menu */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden bg-railway-900 text-white px-4 py-3 space-y-2 border-b border-railway-700 animate-in slide-in-from-top-2"
        >
          <div className="text-xs text-railway-300 mb-2 font-medium">Switch View:</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (onViewChange) onViewChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                activeView === item.id ? 'bg-railway-700 text-white font-semibold' : 'text-railway-200 hover:bg-railway-800'
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-2 border-t border-railway-800 text-[11px] text-railway-400">
            Active: <strong>{userRole}</strong>
          </div>
        </nav>
      )}

      {/* Desktop Responsive Sidebar (hidden on mobile, fixed width on md+) */}
      <aside
        aria-label="Sidebar Navigation"
        className="hidden md:flex flex-col w-64 bg-railway-900 text-white border-r border-railway-800 flex-shrink-0"
      >
        <div className="p-5 border-b border-railway-800">
          <a href="/dashboard" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-railway-700 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
              🚆
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">RailFood Audit</h1>
              <p className="text-xs text-railway-300">Food Safety & Traceability</p>
            </div>
          </a>
        </div>

        <nav className="flex-1 p-4 space-y-1.5" aria-label="Main Menu">
          <div className="text-[11px] font-semibold tracking-wider text-railway-400 uppercase px-3 mb-2">
            Workspace
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange && onViewChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-railway-400',
                activeView === item.id
                  ? 'bg-railway-700/90 text-white shadow-xs font-semibold'
                  : 'text-railway-200 hover:bg-railway-800/80 hover:text-white'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Role Card in Sidebar */}
        <div className="p-4 border-t border-railway-800/80 bg-railway-950/40">
          <div className="text-[11px] text-railway-400 font-medium">Logged in Role:</div>
          <div className="text-xs font-bold text-white truncate mt-0.5">{userRole}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Zone: NR (New Delhi)
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-500">
          <p>
            Indian Railways Food Quality Audit Platform &copy; {new Date().getFullYear()} • Compliant with FSSAI & IRCTC Standards
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
