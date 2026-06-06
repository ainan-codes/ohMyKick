import styles from './page.module.css';

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919999999999';
const TG_BOT_USERNAME = process.env.NEXT_PUBLIC_TG_BOT_USERNAME ?? 'OhMyKickbot';

// Live poster API — built on Vercel Edge, served instantly
const POSTER_BASE = process.env.NEXT_PUBLIC_POSTER_BASE ?? '';

// Sample poster URLs — all parameters pre-filled with realistic demo data
const SAMPLE_POSTERS = [
  {
    label: 'Fan Passport',
    badge: 'Your Identity',
    badgeColor: '#f0b429',
    url: `${POSTER_BASE}/api/posters/passport?name=Ainan&countryName=India&flagEmoji=%F0%9F%87%AE%F0%9F%87%B3&fanId=IND-047213&fanLevel=FAN&totalPoints=85&accuracyPct=68&streakCount=4&referralCount=7&referralCode=AIN7X2`,
  },
  {
    label: 'Pre-Match',
    badge: 'Before Kickoff',
    badgeColor: '#3b82f6',
    url: `${POSTER_BASE}/api/posters/prematch?name=Ainan&flagEmoji=%F0%9F%87%AE%F0%9F%87%B3&countryName=India&homeTeam=Argentina&awayTeam=France&homeFlag=%F0%9F%87%A6%F0%9F%87%B7&awayFlag=%F0%9F%87%AB%F0%9F%87%B7&predictionHome=2&predictionAway=1&stage=GROUP%20A&matchDate=Jun%2014&kickoffTime=9:00%20PM%20IST&referralCode=AIN7X2&homePrimary=%2374ACDF&awayPrimary=%23002395`,
  },
  {
    label: 'YOU CALLED IT',
    badge: 'Perfect Score ⚡',
    badgeColor: '#f0b429',
    url: `${POSTER_BASE}/api/posters/result?name=Ainan&countryName=India&flagEmoji=%F0%9F%87%AE%F0%9F%87%B3&homeTeam=Argentina&awayTeam=France&homeFlag=%F0%9F%87%A6%F0%9F%87%B7&awayFlag=%F0%9F%87%AB%F0%9F%87%B7&predictionHome=2&predictionAway=1&actualHome=2&actualAway=1&resultType=PERFECT&points=25&accuracy=72&totalPredictions=8&correctPredictions=6&referralCode=AIN7X2`,
  },
  {
    label: 'Almost Perfect',
    badge: 'Right Winner',
    badgeColor: '#9ca3af',
    url: `${POSTER_BASE}/api/posters/result?name=Ainan&countryName=India&flagEmoji=%F0%9F%87%AE%F0%9F%87%B3&homeTeam=Brazil&awayTeam=Germany&homeFlag=%F0%9F%87%A7%F0%9F%87%B7&awayFlag=%F0%9F%87%A9%F0%9F%87%AA&predictionHome=2&predictionAway=0&actualHome=1&actualAway=0&resultType=CORRECT_WINNER&points=10&accuracy=65&totalPredictions=12&correctPredictions=8&referralCode=AIN7X2`,
  },
  {
    label: 'Next Match',
    badge: 'Missed It',
    badgeColor: '#ef4444',
    url: `${POSTER_BASE}/api/posters/result?name=Ainan&countryName=India&flagEmoji=%F0%9F%87%AE%F0%9F%87%B3&homeTeam=Spain&awayTeam=England&homeFlag=%F0%9F%87%AA%F0%9F%87%B8&awayFlag=%F0%9F%8F%B4%F3%A0%81%A7%F3%A0%81%A2%F3%A0%81%A5%F3%A0%81%AE%F3%A0%81%A7%F3%A0%81%BF&predictionHome=2&predictionAway=1&actualHome=0&actualAway=1&resultType=WRONG&points=0&accuracy=61&totalPredictions=15&correctPredictions=9&referralCode=AIN7X2`,
  },
];

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
        <a href={tgUrl} className={styles.navCta} id="nav-get-started">
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
          <a href={tgUrl} className={styles.ctaTelegram} id="hero-open-telegram">
            <span className={styles.ctaIcon}>✈️</span>
            Open in Telegram
          </a>
          <a href={waUrl} className={styles.ctaWhatsApp} id="hero-open-whatsapp">
            <span className={styles.ctaIcon}>💬</span>
            Open in WhatsApp
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

      {/* POSTERS PREVIEW — Live images from the API */}
      <section className={styles.postersSection}>
        <h2 className={styles.sectionTitle}>Beautiful Shareable Posters</h2>
        <p className={styles.sectionSubtitle}>
          Every prediction. Every result. Personalised to you. Designed to be shared.
        </p>
        <div className={styles.posterStrip}>
          {SAMPLE_POSTERS.map((poster) => (
            <div key={poster.label} className={styles.posterWrapper}>
              <div className={styles.posterBadge} style={{ color: poster.badgeColor, borderColor: `${poster.badgeColor}33` }}>
                {poster.badge}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster.url}
                alt={poster.label}
                className={styles.posterImg}
                loading="lazy"
                width={270}
                height={480}
              />
              <div className={styles.posterLabel} style={{ color: poster.badgeColor }}>
                {poster.label}
              </div>
            </div>
          ))}
        </div>
        <p className={styles.posterNote}>1080 × 1920 · PNG · Generated in real-time</p>
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
          <span className={styles.statNum}>32</span>
          <span className={styles.statLabel}>Nations Competing</span>
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
          Join fans from 32 countries predicting the World Cup 2026.
        </p>
        <div className={styles.heroCtas}>
          <a href={tgUrl} className={styles.ctaTelegram} id="bottom-open-telegram">
            <span className={styles.ctaIcon}>✈️</span>
            Open in Telegram
          </a>
          <a href={waUrl} className={styles.ctaWhatsApp} id="bottom-open-whatsapp">
            <span className={styles.ctaIcon}>💬</span>
            Open in WhatsApp
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
