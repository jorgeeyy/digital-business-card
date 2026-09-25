import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useConfig } from '../store';
import { useAuth } from '../auth';
import { generateCardHtml } from '../utils/generateCard';
import { publicCardUrl } from '../api';
import { usernameSchema } from '../validation';
import Configurator from '../components/Configurator';
import CardPreview from '../components/CardPreview';
import AppShell from '../components/AppShell';

export default function Editor() {
  const { config, card, setLatestHtml, saveNow, publish } = useConfig();
  const { user } = useAuth();
  const [cardHtml, setCardHtml] = useState<string | null>(null);
  const [showPublish, setShowPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const linkUsername = card?.username ?? user?.username ?? null;

  useEffect(() => {
    const html = generateCardHtml(config, linkUsername);
    setLatestHtml(html);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setCardHtml(html), 250);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [config, linkUsername, setLatestHtml]);

  const handlePublishClick = useCallback(async () => {
    if (card?.published && card.username) {
      const url = publicCardUrl(card.username);
      const tab = window.open('about:blank', '_blank');
      await saveNow(generateCardHtml(config, linkUsername));
      if (tab) {
        tab.location.replace(url);
      } else {
        window.open(url, '_blank');
      }
    } else {
      setShowPublish(true);
    }
  }, [card, config, linkUsername, saveNow]);

  const handlePublish = useCallback(
    async (username: string) => {
      setPublishing(true);
      const tab = window.open('about:blank', '_blank');
      try {
        const published = await publish(username, generateCardHtml(config, username));
        const url = publicCardUrl(published.username ?? username);
        if (tab) {
          tab.location.replace(url);
        } else {
          window.open(url, '_blank');
        }
        setShowPublish(false);
      } catch (err) {
        if (tab) tab.close();
        toast.error(err instanceof Error ? err.message : 'Publish failed');
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
    } catch {
      /* clipboard unavailable */
    }
  }, [card]);

  const actions = (
    <>
      <button className="btn btn-small" onClick={handlePublishClick}>
        Publish
      </button>
      {card?.published && card.username && (
        <button className="btn btn-small btn-ghost" onClick={copyLink}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      )}
    </>
  );

  return (
    <AppShell actions={actions}>
      <div className="editor-layout">
        <Configurator />
        <CardPreview html={cardHtml} />
      </div>

      {showPublish && (
        <PublishModal
          defaultUsername={user?.username || ''}
          busy={publishing}
          onPublish={handlePublish}
          onClose={() => setShowPublish(false)}
        />
      )}
    </AppShell>
  );
}

function PublishModal({
  defaultUsername,
  busy,
  onPublish,
  onClose,
}: {
  defaultUsername: string;
  busy: boolean;
  onPublish: (username: string) => void;
  onClose: () => void;
}) {
  const [username, setUsername] = useState(defaultUsername);
  const parsed = usernameSchema.safeParse(username);
  const isValid = parsed.success;
  const usernameError = parsed.success ? null : (parsed.error.issues[0]?.message ?? 'Invalid username');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="publish-title">Publish your card</h2>
        <p className="modal-sub">Choose the username for your public link.</p>
        <div className={`username-field${isValid ? ' valid' : ''}`}>
          <span className="prefix">tapcard.app/</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
            placeholder="johndoe"
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
          />
        </div>
        {username.length > 0 && usernameError && (
          <div className="hint bad" role="status" style={{ marginTop: 8 }}>
            {usernameError}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn"
            disabled={busy || !isValid}
            onClick={() => onPublish(username)}
          >
            {busy ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
