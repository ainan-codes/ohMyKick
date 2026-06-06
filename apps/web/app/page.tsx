import styles from './page.module.css';

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919999999999';
const TG_BOT_USERNAME = process.env.NEXT_PUBLIC_TG_BOT_USERNAME ?? 'ohmykickbot';

export default function LandingPage() {
  const waUrl = `https://wa.me/${WA_NUMBER}?text=Hi%20OhMyKick`;
  const tgUrl = `https://t.me/${TG_BOT_USERNAME}`;

  return (
    <main className={styles.main}>
      {/* Background glow elements */}
      <div className={styles.glowTopRight} />
      <div className={styles.glowBottomLeft} />

      {/* NAV */}
      <nav className={styles.nav}>
        <span className={styles.logo}>
          <span className={styles.logoEmoji}>⚽</span>
          <span className={styles.logoText}>OhMyKick</span>
        </span>
        <a href={waUrl} className={styles.navCta}>
          Get Started →
        </a>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          FIFA World Cup 2026 · June 11 – July 19
        </div>

        <h1 className={styles.heroTitle}>
          Predict Every Match.
          <br />
          <span className={styles.heroTitleGold}>Get Your Fan Poster.</span>
        </h1>

        <p className={styles.heroSubtitle}>
          The only World Cup experience that lives inside WhatsApp and Telegram.
          No app. No website. Just predict, share, and compete with fans worldwide.
        </p>

        <div className={styles.heroCtas}>
          <a href={waUrl} className={styles.ctaWhatsApp}>
            <span className={styles.ctaIcon}>💬</span>
            Open in WhatsApp
          </a>
          <a href={tgUrl} className={styles.ctaTelegram}>
            <span className={styles.ctaIcon}>✈️</span>
            Open in Telegram
          </a>
        </div>

        <p className={styles.heroNote}>Free · No signup · 2 minutes to start</p>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howSection}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.steps}>
          {[
            {
              emoji: '👋',
              step: '01',
              title: 'Send "Hi"',
              desc: 'Message OhMyKick on WhatsApp or Telegram. Complete onboarding in 2 minutes.',
            },
            {
              emoji: '🎫',
              step: '02',
              title: 'Get Your Fan Passport',
              desc: 'Receive your personalised digital fan card. Share it to your WhatsApp Status.',
            },
            {
              emoji: '⚽',
              step: '03',
              title: 'Predict Each Match',
              desc: 'Pick the winner and exact score before every match. Lock in your prediction.',
            },
            {
              emoji: '🏆',
              step: '04',
              title: 'Get Your Result Poster',
              desc: 'Automatically receive a beautiful result card after the match ends. Share it.',
            },
          ].map((item) => (
            <div key={item.step} className={styles.stepCard}>
              <div className={styles.stepNumber}>{item.step}</div>
              <div className={styles.stepEmoji}>{item.emoji}</div>
              <h3 className={styles.stepTitle}>{item.title}</h3>
              <p className={styles.stepDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POSTERS PREVIEW */}
      <section className={styles.postersSection}>
        <h2 className={styles.sectionTitle}>Beautiful Shareable Posters</h2>
        <p className={styles.sectionSubtitle}>
          Every prediction. Every result. Personalised to you. Designed to be shared.
        </p>
        <div className={styles.posterGrid}>
          {[
            { label: 'Fan Passport', color: '#f0b429', bg: 'linear-gradient(135deg, #0a0a0a, #1a1200)', icon: '🎫' },
            { label: 'Pre-Match Prediction', color: '#3b82f6', bg: 'linear-gradient(135deg, #0a0a2a, #1a0a1a)', icon: '⚽' },
            { label: 'YOU CALLED IT', color: '#f0b429', bg: 'linear-gradient(135deg, #0a0800, #1a1000)', icon: '🏆' },
            { label: 'Almost Perfect', color: '#9ca3af', bg: 'linear-gradient(135deg, #0a0a0a, #0d0d1a)', icon: '🎯' },
          ].map((poster) => (
            <div key={poster.label} className={styles.posterCard} style={{ background: poster.bg }}>
              <div className={styles.posterIcon} style={{ color: poster.color }}>{poster.icon}</div>
              <div className={styles.posterLabel} style={{ color: poster.color }}>{poster.label}</div>
              <div className={styles.posterDim}>1080 × 1920 · PNG</div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className={styles.statsSection}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>64</span>
          <span className={styles.statLabel}>Matches to Predict</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statCard}>
          <span className={styles.statNum}>25 pts</span>
          <span className={styles.statLabel}>For Exact Score</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statCard}>
          <span className={styles.statNum}>39</span>
          <span className={styles.statLabel}>Days of Competition</span>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className={styles.bottomCta}>
        <h2 className={styles.bottomCtaTitle}>Ready to Compete?</h2>
        <p className={styles.bottomCtaSubtitle}>
          Join thousands of fans predicting the World Cup 2026.
        </p>
        <div className={styles.heroCtas}>
          <a href={waUrl} className={styles.ctaWhatsApp}>
            <span className={styles.ctaIcon}>💬</span>
            Open in WhatsApp
          </a>
          <a href={tgUrl} className={styles.ctaTelegram}>
            <span className={styles.ctaIcon}>✈️</span>
            Open in Telegram
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span className={styles.footerLogo}>⚽ OhMyKick</span>
        <span className={styles.footerText}>FIFA World Cup 2026 · Built for football fans</span>
      </footer>
    </main>
  );
}
