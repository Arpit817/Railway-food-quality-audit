import React from 'react';

/**
 * Common Layout component providing application shell, top header, and main container.
 */
export function Layout({ children, userRole = 'Passenger' }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              🚆
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                RailFood Audit
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Indian Railways Packaging Traceability & Hygiene Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium border border-slate-200">
              Role: <strong className="text-slate-800">{userRole}</strong>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Railway Food Quality Audit Platform &copy; {new Date().getFullYear()} • INT252 & EM Academic Project
      </footer>
    </div>
  );
}

export default Layout;
