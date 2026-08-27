import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import VerifyOTPPage from './pages/auth/VerifyOTPPage';
import ProfilePage from './pages/auth/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import StudentsPage from './pages/students/StudentsPage';
import StaffPage from './pages/staff/StaffPage';
import DashboardLayout from './components/layout/DashboardLayout';
import ClassesPage from './pages/classes/ClassesPage';
import FinancePage from './pages/finance/FinancePage';
import AcademicYearsPage from './pages/academic-years/AcademicYearsPage';

// ─── Protected Route ────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ─── Public Route (redirect to dashboard if already authenticated) ─
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

// ─── App Content (inside AuthProvider) ──────────────────────────
function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />
        <Route path="/verify-otp" element={
          <PublicRoute><VerifyOTPPage /></PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute>
            <DashboardLayout>
              <StudentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/staff" element={
          <ProtectedRoute>
            <DashboardLayout>
              <StaffPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/finance" element={
          <ProtectedRoute>
            <DashboardLayout>
              <FinancePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <DashboardLayout>
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>
                <h2>Tasks Module</h2>
                <p>Coming soon</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/classes" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ClassesPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/academic-years" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AcademicYearsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/roles" element={
          <ProtectedRoute>
            <DashboardLayout>
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>
                <h2>Roles & Permissions</h2>
                <p>Coming soon</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'var(--font-family)',
            fontSize: '0.875rem',
            borderRadius: 'var(--radius-sm)',
          },
        }}
      />
    </Router>
  );
}

// ─── Root App ──────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
