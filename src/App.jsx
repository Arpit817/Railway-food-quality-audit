import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './features/auth/index.js';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { Toast } from './components/ui/Toast.jsx';
import { useUIStore } from './store/uiStore.js';

// Lazy loaded page components
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const DashboardLayout = lazy(() => import('./pages/DashboardLayout.jsx'));
const ComplaintsPage = lazy(() => import('./pages/ComplaintsPage.jsx'));
const VendorsPage = lazy(() => import('./pages/VendorsPage.jsx'));
const QualityAnalyticsPage = lazy(() => import('./pages/QualityAnalyticsPage.jsx'));
const AdminBatchesPage = lazy(() => import('./pages/AdminBatchesPage.jsx'));
const QRLandingPage = lazy(() => import('./pages/QRLandingPage.jsx'));
const TrackPage = lazy(() => import('./pages/TrackPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
      <div className="flex items-center gap-2.5">
        <span className="animate-spin text-2xl">🚆</span>
        <span className="font-medium text-slate-700">Connecting to Railway Audit Ledger...</span>
      </div>
    </div>
  );
}

function GlobalToastContainer() {
  const activeToast = useUIStore((state) => state.activeToast);
  const clearToast = useUIStore((state) => state.clearToast);

  return <Toast toast={activeToast} onClose={clearToast} />;
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <GlobalToastContainer />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/f/:token" element={<QRLandingPage />} />
              <Route path="/track" element={<TrackPage />} />
              <Route path="/track/:referenceNo" element={<TrackPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Staff Dashboard */}
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
                <Route path="analytics" element={<QualityAnalyticsPage />} />
              </Route>

              {/* Protected Admin Portal */}
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

              {/* Custom 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
