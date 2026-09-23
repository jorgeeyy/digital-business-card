import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Landing() {
  const { user, loading } = useAuth();

  return (
    <div className="auth-page landing">
      <nav className="auth-nav">
        <div className="brand">
          Tap<span>Card</span>
        </div>
        {loading ? null : user ? (
          <Link className="nav-link" to="/dashboard">Dashboard</Link>
        ) : (
          <>
            <Link className="nav-link" to="/login">Log in</Link>
            <Link className="btn btn-small" to="/signup">Get started</Link>
          </>
        )}
      </nav>

      <main className="landing-hero">
        <div className="hero-badge">Digital business card</div>
        <h1>
          Your link.
          <br />
          <span className="accent">Your card.</span>
        </h1>
        <p className="hero-sub">
          Build a beautiful digital card in minutes. One link you can share anywhere —
          bio, email signature, QR code, or NFC tap.
        </p>
        <div className="hero-cta">
          <Link className="btn btn-large" to={user ? '/editor' : '/signup'}>
            {user ? 'Open editor' : 'Claim your link'}
          </Link>
          {!user && (
            <Link className="btn btn-large btn-ghost" to="/login">
              Log in
            </Link>
          )}
        </div>

        <div className="hero-steps">
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-title">Create account</div>
            <div className="step-desc">Email or Google — takes seconds.</div>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div className="step-title">Build your card</div>
            <div className="step-desc">Colors, fonts, layout, photo, socials.</div>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-title">Publish & share</div>
            <div className="step-desc">Get your unique link — yourapp.com/you.</div>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        TapCard — a Linktree alternative built for real business cards.
      </footer>
    </div>
  );
}
