import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ConfigProvider } from './store';
import { AuthProvider, useAuth } from './auth';
import { ThemeProvider, useTheme } from './theme';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Onboarding from './pages/Onboarding';
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

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster position="top-center" richColors closeButton theme={theme} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConfigProvider>
          <ThemedToaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
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
