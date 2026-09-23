import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from './store';
import { AuthProvider, useAuth } from './auth';
import { ThemeProvider } from './theme';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConfigProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/login"
                element={<RequireGuest><Login /></RequireGuest>}
              />
              <Route
                path="/signup"
                element={<RequireGuest><Signup /></RequireGuest>}
              />
              <Route
                path="/onboarding"
                element={<RequireAuth><Onboarding /></RequireAuth>}
              />
              <Route
                path="/editor"
                element={<RequireAuth><Editor /></RequireAuth>}
              />
              <Route
                path="/dashboard"
                element={<RequireAuth><Dashboard /></RequireAuth>}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ConfigProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
