import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './features/auth/index.js';

// Route-based Code Splitting using React.lazy
const DashboardLayout = lazy(() => import('./pages/DashboardLayout.jsx'));
const ComplaintsPage = lazy(() => import('./pages/ComplaintsPage.jsx'));
const VendorsPage = lazy(() => import('./pages/VendorsPage.jsx'));
const AdminBatchesPage = lazy(() => import('./pages/AdminBatchesPage.jsx'));
const QRLandingPage = lazy(() => import('./pages/QRLandingPage.jsx'));
const TrackPage = lazy(() => import('./pages/TrackPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

// Loading Suspense fallback
function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
      <div className="flex items-center gap-2">
        <span className="animate-spin text-xl">🚆</span>
        <span>Switching route track...</span>
      </div>
    </div>
  );
}

/**
 * Stage 13: App Component with React Router Architecture
 * Demonstrates:
 * - Public routes: /f/:token (dynamic params), /track and /track/:referenceNo, /login
 * - Layout Route: /dashboard with shared sidebar & <Outlet />
 * - Nested dynamic routes: /dashboard/complaints, /dashboard/vendors, /dashboard/analytics
 * - Protected Routes with Role Guards: /admin/batches (admin only)
 * - 404 Catch-All Route: path="*"
 * - Code splitting with React.lazy + Suspense
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* 1. Public Passenger Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/f/:token" element={<QRLandingPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/track/:referenceNo" element={<TrackPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* 2. Protected Inspector Dashboard (Layout Route with Nested Children) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['inspector', 'admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ComplaintsPage />} />
              <Route path="complaints" element={<ComplaintsPage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route
                path="analytics"
                element={
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
                    <span className="text-3xl block">📊</span>
                    <h3 className="font-bold text-slate-800">Quality Analytics Hub</h3>
                    <p className="text-xs text-slate-500">Recharts visual analytics will mount here in Stage 14.</p>
                  </div>
                }
              />
            </Route>

            {/* 3. Protected Admin Routes (Role: Admin Only) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/batches" replace />} />
              <Route path="batches" element={<AdminBatchesPage />} />
            </Route>

            {/* 4. 404 Catch-All Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
