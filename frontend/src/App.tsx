import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from './store';
import { AuthProvider, useAuth } from './auth';
import { ThemeProvider } from './theme';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConfigProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/onboarding" element={<Auth />} />
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
