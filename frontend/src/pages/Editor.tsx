import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../store';
import { useAuth } from '../auth';
import { generateCardHtml } from '../utils/generateCard';
import { publicCardUrl } from '../api';
import Configurator from '../components/Configurator';
import CardPreview from '../components/CardPreview';

export default function Editor() {
  const { config, card, saveStatus, setLatestHtml, saveNow, publish } = useConfig();
  const { user } = useAuth();
  const [cardHtml, setCardHtml] = useState<string | null>(null);
  const [showPublish, setShowPublish] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep autosave HTML fresh immediately; debounce only the iframe rewrite
  useEffect(() => {
    const html = generateCardHtml(config);
    setLatestHtml(html);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setCardHtml(html), 250);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [config, setLatestHtml]);

  const handleDownload = useCallback(() => {
    const html = generateCardHtml(config);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tap-card.html';
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  const handleSave = useCallback(async () => {
    await saveNow(generateCardHtml(config));
  }, [config, saveNow]);

  const handlePublish = useCallback(
    async (username: string) => {
      setPublishing(true);
      setPublishError(null);
      try {
        await publish(username, generateCardHtml(config));
        setShowPublish(false);
      } catch (err) {
        setPublishError(err instanceof Error ? err.message : 'Publish failed');
      } finally {
        setPublishing(false);
      }
    },
    [config, publish],
  );

  const copyLink = useCallback(async () => {
    if (!card?.username) return;
    try {
      await navigator.clipboard.writeText(publicCardUrl(card.username));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  }, [card]);

  const statusLabel =
    saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Save failed' : '';

  return (
    <div className="editor-page">
      <header className="editor-topbar">
        <Link className="brand" to="/dashboard">
          Tap<span>Card</span>
        </Link>
        <div className="topbar-right">
          <span className={`save-indicator ${saveStatus}`}>{statusLabel}</span>
          <button className="btn btn-small btn-ghost" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-small btn-ghost" onClick={handleDownload}>
            Download Card
          </button>
          {card?.published && card.username ? (
            <button className="btn btn-small" onClick={copyLink}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          ) : (
            <button className="btn btn-small" onClick={() => setShowPublish(true)} disabled={!cardHtml}>
              Publish
            </button>
          )}
        </div>
      </header>

      {card?.published && card.username && (
        <div className="published-banner">
          Your card is live at{' '}
          <a href={publicCardUrl(card.username)} target="_blank" rel="noreferrer">
            {card.username}
          </a>
        </div>
      )}

      <div className="app">
        <Configurator onDownload={handleDownload} hasPreview={!!cardHtml} />
        <CardPreview html={cardHtml} />
      </div>

      {showPublish && (
        <PublishModal
          defaultUsername={user?.username || ''}
          busy={publishing}
          error={publishError}
          onPublish={handlePublish}
          onClose={() => { setShowPublish(false); setPublishError(null); }}
        />
      )}
    </div>
  );
}

function PublishModal({
  defaultUsername,
  busy,
  error,
  onPublish,
  onClose,
}: {
  defaultUsername: string;
  busy: boolean;
  error: string | null;
  onPublish: (username: string) => void;
  onClose: () => void;
}) {
  const [username, setUsername] = useState(defaultUsername);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Publish your card</h2>
        <p className="modal-sub">Choose the username for your public link.</p>
        <div className="username-field valid">
          <span className="prefix">tapcard.app/</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
            placeholder="johndoe"
            autoFocus
            spellCheck={false}
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn"
            disabled={busy || username.length < 3}
            onClick={() => onPublish(username)}
          >
            {busy ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
