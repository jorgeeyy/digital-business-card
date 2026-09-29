import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, CreditCard, ExternalLink, Sparkles } from 'lucide-react';
import { useConfig } from '../store';
import { useAuth } from '../auth';
import { publicCardUrl } from '../api';
import { generateCardHtml } from '../utils/generateCard';
import AppShell from '../components/AppShell';

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { config, card, cardLoading } = useConfig();
  const { user } = useAuth();
  const linkUsername = card?.username ?? user?.username ?? null;
  const published = Boolean(card?.published && linkUsername);
  const [copied, setCopied] = useState(false);
  const [frameNode, setFrameNode] = useState<HTMLIFrameElement | null>(null);

  const html = useMemo(
    () => generateCardHtml(config, linkUsername, { solo: true }),
    [config, linkUsername],
  );

  useEffect(() => {
    if (!frameNode || !html) return;
    const doc = frameNode.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [frameNode, html]);

  const name = user?.display_name || user?.email?.split('@')[0] || 'there';

  const copyLink = async () => {
    if (!linkUsername) return;
    try {
      await navigator.clipboard.writeText(publicCardUrl(linkUsername));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (e.g. non-secure context) — ignore
    }
  };

  if (cardLoading) {
    return (
      <AppShell>
        <div className="page-loading">Loading…</div>
      </AppShell>
    );
  }

  if (!card) {
    return (
      <AppShell>
        <div className="dash-empty">
          <div className="dash-empty-icon" aria-hidden="true">
            <CreditCard size={40} strokeWidth={1.5} />
          </div>
          <h1>Create your card</h1>
          <p>You don&apos;t have a card yet — build one in a couple of minutes.</p>
          <Link className="btn" to="/editor">
            Create your card
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="dash-page">
        <header className="dash-top">
          <h1 className="dash-greet">
            {timeGreeting()}, <span>{name}</span>
          </h1>
          {published && linkUsername ? (
            <div className="dash-chip">
              <span className="dash-chip-mark" aria-hidden="true">
                <Sparkles size={15} />
              </span>
              <a href={publicCardUrl(linkUsername)} target="_blank" rel="noopener">
                tapcard.app/{linkUsername}
              </a>
              <button
                type="button"
                className={`dash-chip-copy${copied ? ' is-ok' : ''}`}
                onClick={copyLink}
                aria-label="Copy card link"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
          ) : (
            <span className="dash-chip is-muted">Draft · not published yet</span>
          )}
        </header>

        <h2 className="dash-section">Your card</h2>

        <div className="dash-tile">
          <div className="dash-tile-viewport">
            <iframe
              ref={setFrameNode}
              title="Your card"
              sandbox="allow-same-origin"
              className="dash-tile-frame"
            />
          </div>
          <div className="dash-tile-foot">
            <div className="dash-tile-id">
              <strong>{name}</strong>
              <span>{published ? 'Published' : 'Draft'}</span>
            </div>
            <div className="dash-tile-actions">
              <button
                type="button"
                className="dash-round"
                disabled={!published}
                title={published ? 'Open your public card' : 'Publish your card first'}
                aria-label="View public card"
                onClick={() => {
                  if (published && linkUsername) window.open(publicCardUrl(linkUsername), '_blank');
                }}
              >
                <ExternalLink size={17} />
              </button>
              <Link className="btn btn-ghost dash-edit" to="/editor">
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
