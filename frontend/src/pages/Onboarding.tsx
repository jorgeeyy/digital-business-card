import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import AuthLayout from '../components/AuthLayout';

const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

export default function Onboarding() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (user?.username) {
      navigate('/editor', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const u = username.toLowerCase().trim();
    if (!u) {
      setStatus('idle');
      return;
    }
    if (!USERNAME_RE.test(u)) {
      setStatus('invalid');
      return;
    }
    setStatus('checking');
    timer.current = setTimeout(async () => {
      try {
        const res = await api.usernameAvailable(u);
        setStatus(res.available ? 'available' : 'taken');
      } catch {
        setStatus('idle');
      }
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [username]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const u = username.toLowerCase().trim();
    if (!USERNAME_RE.test(u) || status !== 'available') return;
    setBusy(true);
    try {
      await api.claimUsername(u);
      await refresh();
      navigate('/editor', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const hint =
    status === 'invalid'
      ? '3–30 chars. Letters, numbers, - or _ only.'
      : status === 'checking'
        ? 'Checking…'
        : status === 'available'
          ? 'Available — looks good!'
          : status === 'taken'
            ? 'Already taken. Try another.'
            : 'Lowercase letters, numbers, - and _';

  const hintClass =
    status === 'available' ? 'hint ok' : status === 'taken' || status === 'invalid' ? 'hint bad' : 'hint';

  const fieldClass =
    `username-field${status === 'available' ? ' valid' : ''}${status === 'taken' || status === 'invalid' ? ' invalid' : ''}`;

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="onboard-badge">
          <span className="chip chip-draft">Step 1 of 2 · Claim link</span>
        </div>
        <h1>Claim your link</h1>
        <p className="auth-sub">
          Pick the username for your public card — this is the link you&apos;ll share everywhere.
        </p>

        <form onSubmit={submit} className="auth-form">
          <label>
            Username
            <div className={fieldClass}>
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
          </label>
          <div className={hintClass} role="status" aria-live="polite">
            {hint}
          </div>
          {error && <div className="form-error">{error}</div>}
          <button
            className="btn btn-full"
            type="submit"
            disabled={busy || status !== 'available'}
          >
            {busy ? 'Claiming…' : 'Claim username'}
          </button>
        </form>

        <p className="auth-switch">
          Next you&apos;ll build your card in the editor. Step 2 of 2.
        </p>
      </div>
    </AuthLayout>
  );
}
