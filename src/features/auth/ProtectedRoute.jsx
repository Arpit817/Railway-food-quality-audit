import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

/**
 * ProtectedRoute Guard Component
 * Enforces role-based route access:
 * - Redirects unauthenticated visitors to /login (preserving destination via location.state)
 * - Restricts inspector/admin paths based on user roles
 */
export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-2xl border border-amber-200 shadow-md space-y-4">
        <span className="text-4xl block" role="img" aria-label="access control">🛡️</span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Role Authorization Required</h2>
          <p className="text-xs text-slate-600 mt-1">
            You are currently signed in as <strong className="capitalize">{role}</strong>. This section is intended for <strong>{allowedRoles.join(' or ')}</strong> access.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => { window.location.href = '/login'; }}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-railway-800 hover:bg-railway-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Switch Account
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = role === 'inspector' ? '/dashboard' : '/'; }}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
