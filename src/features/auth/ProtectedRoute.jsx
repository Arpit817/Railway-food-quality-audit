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
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-xl border border-red-200 shadow-sm">
        <span className="text-4xl block mb-2" role="img" aria-label="forbidden">🚫</span>
        <h2 className="text-lg font-bold text-red-800">403 - Access Forbidden</h2>
        <p className="text-xs text-slate-600 mt-2">
          Your role (<strong>{role}</strong>) does not have authorization to view this administrative resource.
        </p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
