import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

interface AuthLayoutProps {
  children: ReactNode;
  /** Extra right-side nav content */
  right?: ReactNode;
}

export default function AuthLayout({ children, right }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <nav className="auth-nav">
        <Link className="brand" to="/">
          Tap<span>Card</span>
        </Link>
        <div className="auth-nav-right">
          <ThemeToggle />
          {right ?? (
            <Link className="auth-nav-link" to="/">
              Home
            </Link>
          )}
        </div>
      </nav>
      {children}
    </div>
  );
}
