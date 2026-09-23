import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  {
    title: 'Live preview',
    desc: 'Every edit renders instantly. What you see is exactly what visitors get.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 12h6M12 9v6" />
      </svg>
    ),
    wide: false,
  },
  {
    title: 'One shareable link',
    desc: 'tapcard.app/you — drop it in your bio, email signature, or QR.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    wide: true,
  },
  {
    title: 'vCard download',
    desc: 'Visitors save you straight to contacts in one tap.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <circle cx="8" cy="12" r="2.5" />
        <path d="M14 10h4M14 14h3" />
      </svg>
    ),
    wide: false,
  },
  {
    title: 'QR & NFC ready',
    desc: 'Print it, tap it, scan it — the same card everywhere.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM20 14h1M14 20h3M20 17v4" />
      </svg>
    ),
    wide: false,
  },
  {
    title: 'Socials & branding',
    desc: 'Colors, fonts, layout, photo, and every social link you use.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
      </svg>
    ),
    wide: true,
  },
];

const steps = [
  { n: '01', title: 'Create account', desc: 'Email or Google — ready in seconds.' },
  { n: '02', title: 'Build your card', desc: 'Layout, colors, photo, socials.' },
  { n: '03', title: 'Publish & share', desc: 'Your unique link goes live instantly.' },
];

export default function Landing() {
  const { user, loading } = useAuth();

  return (
    <div className="lp">
      <nav className="lp-nav">
        <Link className="brand lp-brand" to="/">
          Tap<span>Card</span>
        </Link>
        <div className="lp-nav-links" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </div>
        <div className="auth-nav-right">
          <ThemeToggle />
          {loading ? null : user ? (
            <Link className="btn btn-small btn-vercel" to="/dashboard">
              Dashboard
            </Link>
          ) : (
            <>
              <Link className="auth-nav-link" to="/login">
                Log in
              </Link>
              <Link className="btn btn-small btn-vercel" to="/signup">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="lp-main">
        <section className="lp-hero">
          <div className="lp-grid" aria-hidden="true" />
          <div className="lp-glow" aria-hidden="true" />

          <div className="lp-badge">
            <span className="lp-badge-dot" aria-hidden="true" />
            Digital business card · free to start
          </div>

          <h1 className="lp-title">
            Your link.
            <br />
            <span className="lp-title-accent">Your card.</span>
          </h1>

          <p className="lp-sub">
            A Vercel-clean digital business card you can build in minutes.
            One link for your bio, email signature, QR code, or NFC tap.
          </p>

          <div className="lp-cta">
            <Link className="btn btn-large btn-vercel" to={user ? '/editor' : '/signup'}>
              {user ? 'Open editor' : 'Claim your link'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            {!user && (
              <Link className="btn btn-large btn-ghost" to="/login">
                Log in
              </Link>
            )}
          </div>
        </section>

        <section className="lp-section" id="features">
          <div className="lp-section-head">
            <p className="eyebrow">Features</p>
            <h2>Everything a modern card needs</h2>
            <p className="lp-section-sub">
              Precise, fast, and shareable — designed like the tools you already use.
            </p>
          </div>

          <div className="lp-bento">
            {features.map((f) => (
              <article key={f.title} className={`lp-bento-card${f.wide ? ' wide' : ''}`}>
                <div className="lp-bento-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-section" id="how">
          <div className="lp-section-head">
            <p className="eyebrow">How it works</p>
            <h2>Three steps. Zero friction.</h2>
          </div>

          <ol className="lp-steps">
            {steps.map((s) => (
              <li key={s.n} className="lp-step">
                <span className="lp-step-num">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="lp-cta-band">
          <div className="lp-cta-band-inner">
            <h2>Ready to float above the rest?</h2>
            <p>Claim your link and put a real card behind every tap.</p>
            <Link className="btn btn-large btn-vercel" to={user ? '/editor' : '/signup'}>
              {user ? 'Open editor' : 'Get started free'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <Link className="brand lp-brand" to="/">
          Tap<span>Card</span>
        </Link>
        <p>A Linktree alternative built for real business cards.</p>
      </footer>
    </div>
  );
}
