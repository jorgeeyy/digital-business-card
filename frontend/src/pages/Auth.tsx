import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import AuthLayout from '../components/AuthLayout';

type Mode = 'login' | 'signup' | 'claim';
type Phase = 'idle' | 'out-left' | 'out-right' | 'in-left' | 'in-right';

const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.97 10.97 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);

function initialMode(pathname: string): Mode {
  if (pathname.includes('login')) return 'login';
  if (pathname.includes('onboarding')) return 'claim';
  return 'signup';
}

const order: Mode[] = ['login', 'signup', 'claim'];

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, login, signup, refresh } = useAuth();

  const [mode, setMode] = useState<Mode>(() => initialMode(location.pathname));
  const [phase, setPhase] = useState<Phase>('idle');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Claim
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncUrl = useCallback((m: Mode) => {
    if (m === 'login' || m === 'signup') {
      window.history.replaceState(null, '', `/${m}`);
    }
  }, []);

  const goMode = useCallback(
    (next: Mode) => {
      if (next === mode || phase !== 'idle') return;
      const dir: 1 | -1 = order.indexOf(next) >= order.indexOf(mode) ? 1 : -1;
      setError(null);
      setPhase(dir === 1 ? 'out-left' : 'out-right');
      window.setTimeout(() => {
        setMode(next);
        syncUrl(next);
        setPhase(dir === 1 ? 'in-right' : 'in-left');
        window.setTimeout(() => setPhase('idle'), 380);
      }, 220);
    },
    [mode, phase, syncUrl],
  );

  // Redirects
  useEffect(() => {
    if (authLoading) return;
    if (mode === 'claim') {
      if (!user) {
        goMode('login');
        return;
      }
      if (user.username) navigate('/editor', { replace: true });
      return;
    }
    if (user) {
      if (!user.username) goMode('claim');
      else navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, mode, navigate, goMode]);

  // Username availability
  useEffect(() => {
    if (mode !== 'claim') return;
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
  }, [username, mode]);

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const submitSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      await signup(signupEmail, signupPassword);
      await refresh();
      goMode('claim');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setBusy(false);
    }
  };

  const submitClaim = async (e: FormEvent) => {
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

  const formPhaseClass =
    phase === 'out-left'
      ? 'exit-left'
      : phase === 'out-right'
        ? 'exit-right'
        : phase === 'in-right'
          ? 'enter-right'
          : phase === 'in-left'
            ? 'enter-left'
            : '';

  if (authLoading) {
    return (
      <AuthLayout>
        <div className="page-loading">Loading…</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="split-auth">
        {/* Left: form panel */}
        <div className="split-form-col">
          <div className={`split-form ${formPhaseClass}`} key={mode}>
            {mode === 'signup' && (
              <>
                <div className="eyebrow">Free forever</div>
                <h1>Create your account</h1>
                <p className="auth-sub">Claim your link and build a card worth sharing.</p>

                <a className="btn btn-google" href="/api/auth/google">
                  <GoogleIcon />
                  Continue with Google
                </a>

                <div className="auth-divider"><span>or</span></div>

                <form onSubmit={submitSignup} className="auth-form">
                  <label>
                    Email
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      autoComplete="new-password"
                      minLength={8}
                    />
                  </label>
                  {error && <div className="form-error">{error}</div>}
                  <button className="btn btn-full" type="submit" disabled={busy}>
                    {busy ? 'Creating account…' : 'Sign up'}
                  </button>
                </form>

                <p className="auth-switch">
                  Already have an account?{' '}
                  <button type="button" className="auth-link-btn" onClick={() => goMode('login')}>
                    Log in
                  </button>
                </p>
              </>
            )}

            {mode === 'login' && (
              <>
                <div className="eyebrow">Welcome back</div>
                <h1>Log in to your card</h1>
                <p className="auth-sub">Edit, publish, and share your digital business card.</p>

                <a className="btn btn-google" href="/api/auth/google">
                  <GoogleIcon />
                  Continue with Google
                </a>

                <div className="auth-divider"><span>or</span></div>

                <form onSubmit={submitLogin} className="auth-form">
                  <label>
                    Email
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </label>
                  {error && <div className="form-error">{error}</div>}
                  <button className="btn btn-full" type="submit" disabled={busy}>
                    {busy ? 'Logging in…' : 'Log in'}
                  </button>
                </form>

                <p className="auth-switch">
                  No account?{' '}
                  <button type="button" className="auth-link-btn" onClick={() => goMode('signup')}>
                    Sign up free
                  </button>
                </p>
              </>
            )}

            {mode === 'claim' && (
              <>
                <div className="eyebrow">Step 2 of 2</div>
                <h1>Claim your link</h1>
                <p className="auth-sub">
                  Pick the username for your public card — this is the link you&apos;ll share everywhere.
                </p>

                <form onSubmit={submitClaim} className="auth-form">
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
                  <button className="btn btn-full" type="submit" disabled={busy || status !== 'available'}>
                    {busy ? 'Claiming…' : 'Claim username'}
                  </button>
                </form>

                <p className="auth-switch">
                  Next you&apos;ll build your card in the editor.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right: marketing / descriptions — differs by mode */}
        <aside className="split-aside" aria-hidden="true">
          <div className="split-aside-inner">
            <div className="split-aside-logo">Tap<span>Card</span></div>

            {mode === 'signup' && (
              <>
                <h2 className="split-aside-title">
                  Claim your link.
                  <br />
                  <em>Build your card.</em>
                </h2>
                <p className="split-aside-desc">
                  Sign up free and get a shareable digital business card in minutes — no design skills needed.
                </p>
                <ul className="split-aside-list">
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    Unique username link
                  </li>
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    Live preview while you edit
                  </li>
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    vCard download for contacts
                  </li>
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    QR &amp; NFC ready
                  </li>
                </ul>
                <div className="split-aside-foot">
                  Free forever. Upgrade only if you need to.
                </div>
              </>
            )}

            {mode === 'login' && (
              <>
                <h2 className="split-aside-title">
                  Welcome back.
                  <br />
                  <em>Pick up where you left off.</em>
                </h2>
                <p className="split-aside-desc">
                  Log in to edit your card, update links, and keep your public profile fresh.
                </p>
                <ul className="split-aside-list">
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    Edit and republish instantly
                  </li>
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    Update socials anytime
                  </li>
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    Manage your claim status
                  </li>
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    Same link — always current
                  </li>
                </ul>
                <div className="split-aside-foot">
                  No account yet? Sign up takes under a minute.
                </div>
              </>
            )}

            {mode === 'claim' && (
              <>
                <h2 className="split-aside-title">
                  One last step.
                  <br />
                  <em>Your link is waiting.</em>
                </h2>
                <p className="split-aside-desc">
                  Choose the username people will type — or scan — to reach your card.
                </p>
                <ul className="split-aside-list">
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    Lowercase, numbers, - and _
                  </li>
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    3–30 characters
                  </li>
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    Available check in real time
                  </li>
                  <li>
                    <span className="check" aria-hidden="true">✓</span>
                    Editable later in settings
                  </li>
                </ul>
                <div className="split-aside-foot">
                  After claiming, you&apos;ll land in the card editor.
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </AuthLayout>
  );
}
