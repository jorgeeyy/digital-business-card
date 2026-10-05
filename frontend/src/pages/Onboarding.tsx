import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../auth';
import { useConfig } from '../store';
import { generateCardHtml } from '../utils/generateCard';
import { socialPlatforms } from '../types';
import { getBaseUrl, socialHandleError } from '../utils/socials';
import { validateField, emailSchema } from '../validation';
import SocialIcon from '../components/SocialIcon';
import AppShell from '../components/AppShell';
import {
  ONBOARDING_STEPS,
  readOnboardingStep,
  writeOnboardingStep,
  clearOnboardingStep,
  type OnboardingStep,
} from '../utils/onboarding';

const STEP_META: Record<OnboardingStep, { title: string; sub: string }> = {
  socials: {
    title: 'Add your links',
    sub: 'Pick where people can reach you — handles become tappable links on your card.',
  },
  details: {
    title: 'Your details',
    sub: 'The name and info shown at the top of your card. Colors and layout come next in the editor.',
  },
};

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const {
    config,
    card,
    cardLoading,
    updateConfig,
    addSocial,
    updateSocial,
    removeSocial,
    publish,
  } = useConfig();
  const navigate = useNavigate();

  const [step, setStep] = useState<OnboardingStep>(
    () => (user ? readOnboardingStep(user.id) : null) ?? 'socials',
  );
  const [attempted, setAttempted] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Remember which step the user is on so they can resume later.
  useEffect(() => {
    if (!user || !user.username || cardLoading || card?.published) return;
    writeOnboardingStep(user.id, step);
  }, [user, step, cardLoading, card]);

  const prefillDetails = () => {
    const name = config.name || user?.display_name || user?.email?.split('@')[0] || '';
    const email = config.email || user?.email || '';
    if (name !== config.name || email !== config.email) updateConfig({ name, email });
  };

  const goTo = (next: OnboardingStep) => {
    setStep(next);
    setAttempted(false);
    if (user) writeOnboardingStep(user.id, next);
    if (next === 'details') prefillDetails();
  };

  const next = () => {
    if (step === 'socials') {
      if (config.socials.length < 2) {
        setAttempted(true);
        toast.error('Add at least two links to continue');
        return;
      }
      const bad = config.socials.find((s) => socialHandleError(s.platform, s.handle));
      if (bad) {
        setAttempted(true);
        toast.error(`Add a handle for ${bad.platform}, or remove it`);
        return;
      }
    }
    const i = ONBOARDING_STEPS.indexOf(step);
    if (i < ONBOARDING_STEPS.length - 1) goTo(ONBOARDING_STEPS[i + 1]);
  };

  const back = () => {
    const i = ONBOARDING_STEPS.indexOf(step);
    if (i > 0) goTo(ONBOARDING_STEPS[i - 1]);
  };

  const togglePlatform = (platform: string) => {
    const existing = config.socials.findIndex((s) => s.platform === platform);
    if (existing >= 0) {
      removeSocial(existing);
      return;
    }
    if (config.socials.length >= 6) return;
    const index = config.socials.length;
    addSocial();
    updateSocial(index, 'platform', platform);
  };

  const onHandleChange = (index: number, value: string) => {
    const platform = config.socials[index].platform;
    updateSocial(index, 'handle', value);
    const url = getBaseUrl(platform, value);
    if (url) {
      updateSocial(index, 'url', url);
    } else if (value.startsWith('http://') || value.startsWith('https://')) {
      updateSocial(index, 'url', value);
    } else {
      updateSocial(index, 'url', '');
    }
  };

  const handlePublish = async () => {
    if (!user?.username) return;
    if (config.socials.length < 2) {
      goTo('socials');
      setAttempted(true);
      toast.error('Add at least two links before publishing');
      return;
    }
    const badSocial = config.socials.find((s) => socialHandleError(s.platform, s.handle));
    if (badSocial) {
      goTo('socials');
      setAttempted(true);
      toast.error(`Add a handle for ${badSocial.platform}, or remove it`);
      return;
    }
    if (!config.name.trim()) {
      goTo('details');
      setAttempted(true);
      toast.error('Add your name before publishing');
      return;
    }
    const emailError = validateField(emailSchema, config.email);
    if (emailError) {
      goTo('details');
      setAttempted(true);
      toast.error(emailError);
      return;
    }
    setPublishing(true);
    try {
      await publish(user.username, generateCardHtml(config, user.username));
      clearOnboardingStep(user.id);
      toast.success('Your card is live!', {
        description: `tapcard.app/${user.username}`,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  if (authLoading || (user && cardLoading)) {
    return (
      <AppShell>
        <div className="page-loading">Loading…</div>
      </AppShell>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!user.username) return <Navigate to="/signup" replace />;
  if (card?.published) return <Navigate to="/dashboard" replace />;

  const stepIndex = ONBOARDING_STEPS.indexOf(step);
  const meta = STEP_META[step];
  const nameOk = config.name.trim().length > 0;
  const emailError = validateField(emailSchema, config.email);

  return (
    <AppShell>
      <div className="onb-page">
        <div className="onb-col">
          <div className="onb-steps">
            {ONBOARDING_STEPS.map((s, i) => (
              <span key={s} className={`onb-dot${i <= stepIndex ? ' on' : ''}`} aria-hidden="true" />
            ))}
            <span className="onb-count">Step {stepIndex + 1} of {ONBOARDING_STEPS.length}</span>
          </div>

          <div className="onb-head">
            <h1>{meta.title}</h1>
            <p className="auth-sub">{meta.sub}</p>
          </div>

          {step === 'socials' && (
            <>
              <div className="onb-chips">
                {socialPlatforms.map((p) => {
                  const active = config.socials.some((s) => s.platform === p);
                  const full = config.socials.length >= 6 && !active;
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`onb-chip${active ? ' on' : ''}`}
                      aria-label={p}
                      title={p}
                      aria-pressed={active}
                      disabled={full}
                      onClick={() => togglePlatform(p)}
                    >
                      <SocialIcon platform={p} size={17} />
                    </button>
                  );
                })}
              </div>

              {config.socials.length > 0 && (
                <div className="social-rows onb-rows">
                  {config.socials.map((s, i) => {
                    const error = attempted ? socialHandleError(s.platform, s.handle) : null;
                    return (
                      <div className="onb-social" key={i}>
                        <div className="social-row">
                          <span className="onb-platform" title={s.platform}>
                            <SocialIcon platform={s.platform} size={17} />
                          </span>
                          <input
                            type={s.platform === 'WhatsApp' ? 'tel' : 'text'}
                            value={s.handle}
                            aria-label={`Handle for ${s.platform}`}
                            aria-invalid={Boolean(error)}
                            placeholder={
                              s.platform === 'WhatsApp' ? 'Phone with country code' : 'handle or URL'
                            }
                            onChange={(e) => onHandleChange(i, e.target.value)}
                          />
                          <button
                            type="button"
                            className="social-remove"
                            aria-label={`Remove ${s.platform} link`}
                            onClick={() => removeSocial(i)}
                          >
                            ×
                          </button>
                        </div>
                        {error && (
                          <div className="onb-hint bad" role="alert">
                            {error}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {attempted && config.socials.length < 2 && (
                <div className="onb-hint bad" role="alert">
                  Add at least two links — that’s what makes your card useful.
                </div>
              )}
              <p className="onb-hint">
                Add at least two — you can change or add more anytime later.
              </p>
            </>
          )}

          {step === 'details' && (
            <div className="onb-fields">
              <div className="field">
                <label htmlFor="onb-name">Name</label>
                <input
                  id="onb-name"
                  type="text"
                  value={config.name}
                  placeholder="e.g. Alex Rivera"
                  onChange={(e) => updateConfig({ name: e.target.value })}
                />
                {!nameOk && (
                  <span className={attempted ? 'onb-hint bad' : 'onb-hint'}>
                    Required — this heads your card.
                  </span>
                )}
              </div>
              <div className="field">
                <label htmlFor="onb-role">Role</label>
                <input
                  id="onb-role"
                  type="text"
                  value={config.role}
                  placeholder="e.g. Product Designer"
                  onChange={(e) => updateConfig({ role: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="onb-location">Location</label>
                <input
                  id="onb-location"
                  type="text"
                  value={config.location}
                  placeholder="e.g. Lisbon, Portugal"
                  onChange={(e) => updateConfig({ location: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="onb-email">Email</label>
                <input
                  id="onb-email"
                  type="email"
                  value={config.email}
                  placeholder="you@example.com"
                  onChange={(e) => updateConfig({ email: e.target.value })}
                />
                {emailError && <span className="onb-hint bad">{emailError}</span>}
              </div>
            </div>
          )}

          <div className="onb-nav">
            {step === 'socials' ? (
              <span aria-hidden="true" />
            ) : (
              <button type="button" className="btn btn-ghost" onClick={back}>
                Back
              </button>
            )}
            {step === 'details' ? (
              <button type="button" className="btn" disabled={publishing} onClick={handlePublish}>
                {publishing ? 'Publishing…' : 'Publish my card'}
              </button>
            ) : (
              <button type="button" className="btn" onClick={next}>
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
