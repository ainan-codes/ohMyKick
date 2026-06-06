import styles from './page.module.css';

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919999999999';
const TG_BOT_USERNAME = process.env.NEXT_PUBLIC_TG_BOT_USERNAME ?? 'ohmykickbot';

interface Props {
  params: { code: string };
}

export function generateMetadata({ params }: Props) {
  return {
    title: `Join OhMyKick — World Cup 2026 | Referral ${params.code}`,
    description: 'Your friend invited you to predict every World Cup 2026 match. Get your personalised fan passport.',
  };
}

export default function ReferralPage({ params }: Props) {
  const { code } = params;
  const waUrl = `https://wa.me/${WA_NUMBER}?text=Hi%20OhMyKick%20${code}`;
  const tgUrl = `https://t.me/${TG_BOT_USERNAME}?start=${code}`;

  return (
    <main className={styles.main}>
      <div className={styles.glowTopRight} />
      <div className={styles.glowBottomLeft} />

      <div className={styles.referralContainer}>
        <div className={styles.referralCard}>
          <div className={styles.referralBall}>⚽</div>

          <h1 className={styles.referralTitle}>You've been invited!</h1>
          <p className={styles.referralSubtitle}>
            Your friend wants you to predict every FIFA World Cup 2026 match
            and compete on the global fan leaderboard.
          </p>

          <div className={styles.referralCode}>
            <span className={styles.referralCodeLabel}>Referral Code</span>
            <span className={styles.referralCodeValue}>{code}</span>
          </div>

          <div className={styles.referralFeatures}>
            {[
              { icon: '🎫', text: 'Get your personalised Fan Passport card' },
              { icon: '⚽', text: 'Predict the winner & exact score of every match' },
              { icon: '🏆', text: 'Receive a beautiful result poster after each game' },
              { icon: '📊', text: 'Compete with fans from 32 countries' },
            ].map((f) => (
              <div key={f.text} className={styles.referralFeature}>
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div className={styles.referralCtas}>
            <a href={waUrl} className={styles.ctaWhatsApp} id="open-whatsapp">
              <span>💬</span>
              Open in WhatsApp
            </a>
            <a href={tgUrl} className={styles.ctaTelegram} id="open-telegram">
              <span>✈️</span>
              Open in Telegram
            </a>
          </div>

          <p className={styles.referralNote}>
            Free · No app download required · Takes 2 minutes
          </p>
        </div>
      </div>
    </main>
  );
}
