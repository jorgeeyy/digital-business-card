import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useConfig } from '../store';
import { publicCardUrl } from '../api';
import { generateCardHtml } from '../utils/generateCard';
import AppShell from '../components/AppShell';

export default function Dashboard() {
  const { user } = useAuth();
  const { card, saveStatus, config } = useConfig();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const thumbRef = useRef<HTMLIFrameElement>(null);

  const thumbHtml = useMemo(() => generateCardHtml(config), [config]);

  useEffect(() => {
    const iframe = thumbRef.current;
    if (!iframe || !thumbHtml) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(thumbHtml);
    doc.close();
    // Scale the full card into the thumbnail
    const inner = doc.documentElement;
    if (inner) {
      const scale = 0.48;
      const body = doc.body;
      if (body) {
        body.style.transform = `scale(${scale})`;
        body.style.transformOrigin = 'top left';
        body.style.width = `${100 / scale}%`;
        body.style.height = `${100 / scale}%`;
      }
    }
  }, [thumbHtml]);

  const copyLink = async () => {
    if (!card?.username) return;
    try {
      await navigator.clipboard.writeText(publicCardUrl(card.username));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const isLive = !!card?.published && !!card.username;
  const hasUsername = !!user?.username;

  return (
    <AppShell>
      <main className="dashboard-main">
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Your workspace
        </div>
        <h1>Hi{user?.display_name ? ` ${user.display_name}` : ''}</h1>
        <p className="auth-sub">Manage your digital card, link, and publish status.</p>

        <div className="dash-grid">
          <div className="dash-thumb" aria-label="Card preview">
            {thumbHtml ? (
              <iframe ref={thumbRef} title="Card thumbnail" sandbox="allow-same-origin" />
            ) : (
              <div className="dash-thumb-empty">Your card preview will appear here.</div>
            )}
          </div>

          <div className="dash-card">
            <div className="dash-card-row">
              <div>
                <div className="dash-label">Your link</div>
                {isLive ? (
                  <a
                    className="dash-link"
                    href={publicCardUrl(card!.username!)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {card!.username}
                  </a>
                ) : hasUsername ? (
                  <div className="dash-link dim">Ready to publish</div>
                ) : (
                  <div className="dash-link dim">Not claimed yet</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`chip ${isLive ? 'chip-live' : 'chip-draft'}`}>
                  {isLive ? 'Live' : 'Draft'}
                </span>
                {isLive && (
                  <button className="btn btn-small btn-ghost" onClick={copyLink}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

            <div className="dash-card-meta">
              <span>
                Status:{' '}
                <strong className={isLive ? 'ok' : ''}>{isLive ? 'Live' : 'Draft'}</strong>
              </span>
              <span>
                Saved:{' '}
                <strong>
                  {saveStatus === 'saving'
                    ? 'Saving…'
                    : saveStatus === 'saved'
                      ? 'Yes'
                      : saveStatus === 'error'
                        ? 'Failed'
                        : 'Auto'}
                </strong>
              </span>
              {card?.updated_at && (
                <span>
                  Updated:{' '}
                  <strong>{new Date(card.updated_at).toLocaleDateString()}</strong>
                </span>
              )}
            </div>

            <div className="dash-card-actions">
              <Link className="btn" to="/editor">
                Edit card
              </Link>
              {!hasUsername && (
                <Link className="btn btn-ghost" to="/onboarding">
                  Claim link
                </Link>
              )}
              {hasUsername && !isLive && (
                <Link className="btn btn-ghost" to="/editor">
                  Publish
                </Link>
              )}
              {isLive && (
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate('/editor')}
                >
                  Open editor
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="dash-hint">
          Tip: add your link to your bio, email signature, or print it as a QR code from the
          editor.
        </div>
      </main>
    </AppShell>
  );
}
