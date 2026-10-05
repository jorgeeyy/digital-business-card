import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, Copy, CreditCard, ExternalLink, Sparkles } from 'lucide-react';
import { useConfig } from '../store';
import { useAuth } from '../auth';
import { publicCardUrl, mediaSrc } from '../api';
import { generateCardHtml } from '../utils/generateCard';
import { socialHandleError } from '../utils/socials';
import { clearOnboardingStep, readOnboardingStep } from '../utils/onboarding';
import { validateField, emailSchema } from '../validation';
import AppShell from '../components/AppShell';

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { config, card, cardLoading, publish } = useConfig();
  const { user } = useAuth();
  const navigate = useNavigate();
  const linkUsername = card?.username ?? user?.username ?? null;
  const published = Boolean(card?.published && linkUsername);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const name = user?.display_name || user?.email?.split('@')[0] || 'there';
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  const portrait = config.portrait;

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

  const handlePublish = async () => {
    if (!user?.username) return;
    if (!config.name.trim()) {
      toast.error('Add your name before publishing');
      navigate('/onboarding');
      return;
    }
    const emailError = validateField(emailSchema, config.email);
    if (emailError) {
      toast.error(emailError);
      navigate('/onboarding');
      return;
    }
    const badSocial = config.socials.find((s) => socialHandleError(s.platform, s.handle));
    if (badSocial) {
      toast.error(`Add a handle for ${badSocial.platform} before publishing`);
      navigate('/onboarding');
      return;
    }
    setPublishing(true);
    try {
      await publish(user.username, generateCardHtml(config, user.username));
      clearOnboardingStep(user.id);
      toast.success('Your card is live!', {
        description: `tapcard.app/${user.username}`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  if (user && !user.username) return <Navigate to="/onboarding" replace />;

  if (cardLoading) {
    return (
      <AppShell>
        <div className="page-loading">Loading…</div>
      </AppShell>
    );
  }

  // A draft exists server-side, or locally (e.g. just finished onboarding).
  const hasDraft = Boolean(card) || config.name.trim().length > 0;

  if (!hasDraft) {
    const resumeStep = user ? readOnboardingStep(user.id) : null;
    return (
      <AppShell>
        <div className="dash-empty">
          <div className="dash-empty-icon" aria-hidden="true">
            <CreditCard size={40} strokeWidth={1.5} />
          </div>
          <h1>Create your card</h1>
          <p>You don&apos;t have a card yet — build one in a couple of minutes.</p>
          {resumeStep && (
            <Link className="btn btn-ghost" to="/onboarding">
              Continue setup
            </Link>
          )}
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

        <div className="dash-row">
          <div className="dash-tile">
            <div className={`dash-avatar${portrait ? '' : ' is-mono'}`}>
              {portrait ? (
                portrait.type === 'video' ? (
                  <video src={mediaSrc(portrait.dataUrl)} autoPlay loop muted playsInline />
                ) : (
                  <img src={mediaSrc(portrait.dataUrl)} alt="" />
                )
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
            </div>
            {published && linkUsername ? (
              <a
                className="dash-link"
                href={publicCardUrl(linkUsername)}
                target="_blank"
                rel="noopener"
              >
                {linkUsername}
              </a>
            ) : (
              <span className="dash-link is-muted">Not published yet</span>
            )}
          </div>
          <div className="dash-actions" aria-label="Card actions">
            {published ? (
              <button
                type="button"
                className="dash-round"
                title="Open your public card"
                aria-label="View public card"
                onClick={() => {
                  if (linkUsername) window.open(publicCardUrl(linkUsername), '_blank');
                }}
              >
                <ExternalLink size={17} />
              </button>
            ) : (
              <button
                type="button"
                className="btn dash-publish"
                disabled={publishing}
                onClick={handlePublish}
              >
                {publishing ? 'Publishing…' : 'Publish'}
              </button>
            )}
            <Link className="btn btn-ghost dash-edit" to="/editor">
              Edit
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
