import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useConfig } from '../store';
import { publicCardUrl } from '../api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { card, saveStatus } = useConfig();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const copyLink = async () => {
    if (!card?.username) return;
    try {
      await navigator.clipboard.writeText(publicCardUrl(card.username));
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="auth-page dashboard">
      <nav className="auth-nav">
        <Link className="brand" to="/dashboard">
          Tap<span>Card</span>
        </Link>
        <div className="topbar-right">
          <span className="user-email">{user?.email}</span>
          <button className="btn btn-small btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        <h1>Hi{user?.display_name ? ` ${user.display_name}` : ''} 👋</h1>
        <p className="auth-sub">Manage your digital card.</p>

        <div className="dash-card">
          <div className="dash-card-row">
            <div>
              <div className="dash-label">Your link</div>
              {card?.published && card.username ? (
                <a className="dash-link" href={publicCardUrl(card.username)} target="_blank" rel="noreferrer">
                  {card.username}
                </a>
              ) : (
                <div className="dash-link dim">Not published yet</div>
              )}
            </div>
            {card?.published && card.username && (
              <button className="btn btn-small btn-ghost" onClick={copyLink}>
                Copy
              </button>
            )}
          </div>

          <div className="dash-card-meta">
            <span>
              Status:{' '}
              <strong className={card?.published ? 'ok' : ''}>
                {card?.published ? 'Live' : 'Draft'}
              </strong>
            </span>
            <span>
              Saved: <strong>{saveStatus === 'saved' ? 'Yes' : saveStatus === 'saving' ? 'Saving…' : 'Auto'}</strong>
            </span>
          </div>

          <div className="dash-card-actions">
            <Link className="btn" to="/editor">
              Edit card
            </Link>
            {!card?.published && (
              <Link className="btn btn-ghost" to="/onboarding">
                Publish
              </Link>
            )}
          </div>
        </div>

        <div className="dash-hint">
          Tip: add your link to your bio, email signature, or print it as a QR code.
        </div>
      </main>
    </div>
  );
}
