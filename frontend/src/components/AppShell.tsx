import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import ThemeToggle from './ThemeToggle';

interface AppShellProps {
  children: ReactNode;
  /** Right-side toolbar (e.g. editor actions). Account menu is always included when signed in. */
  actions?: ReactNode;
  /** Show account email + logout (default true) */
  showAccount?: boolean;
}

export default function AppShell({ children, actions, showAccount = true }: AppShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="editor-page">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>
          <Link className="brand" to="/editor">
            Tap<span>Card</span>
          </Link>
          <nav style={{ display: 'flex', gap: 14 }} aria-label="Primary">
            <Link className="auth-nav-link" to="/editor">
              Editor
            </Link>
          </nav>
        </div>

        <div className="app-header-actions">
          <ThemeToggle />
          {actions}
          {showAccount && user && (
            <div className="account-menu">
              <span className="account-email" title={user.email}>
                {user.email}
              </span>
              <button className="btn btn-small btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
