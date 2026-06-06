import styles from './page.module.css';

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919999999999';
const TG_BOT_USERNAME = process.env.NEXT_PUBLIC_TG_BOT_USERNAME ?? 'ohmykickbot';

interface Props {
  params: { posterId: string[] };
}

export function generateMetadata({ params }: Props) {
  const { posterId } = params;
  const posterPath = Array.isArray(posterId) ? posterId.join('/') : posterId;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const posterUrl = supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/posters/${posterPath}.png`
    : '';

  return {
    title: 'Fan Prediction Poster — OhMyKick World Cup 2026',
    description: 'Check out this fan prediction poster from OhMyKick. Join and predict every World Cup 2026 match.',
    openGraph: {
      title: 'OhMyKick — World Cup 2026 Fan Poster',
      description: 'Predict every match. Get your fan poster. Share the glory.',
      images: posterUrl ? [posterUrl] : [],
    },
  };
}

export default function PosterViewerPage({ params }: Props) {
  const { posterId } = params;
  const posterPath = Array.isArray(posterId) ? posterId.join('/') : posterId;

  // Poster URL would come from Supabase storage
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const posterUrl = supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/posters/${posterPath}.png`
    : null;

  const waUrl = `https://wa.me/${WA_NUMBER}?text=Hi%20OhMyKick`;
  const tgUrl = `https://t.me/${TG_BOT_USERNAME}`;

  return (
    <main className={styles.main}>
      <div className={styles.glow} />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.logo}>⚽ OhMyKick</span>
          <span className={styles.subtitle}>World Cup 2026 Fan Prediction</span>
        </div>

        {/* Poster */}
        <div className={styles.posterWrapper}>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt="Fan prediction poster"
              className={styles.posterImage}
            />
          ) : (
            <div className={styles.posterPlaceholder}>
              <span className={styles.placeholderEmoji}>🎫</span>
              <p className={styles.placeholderText}>Poster not found or still generating...</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Want your own fan poster?</h2>
          <p className={styles.ctaDesc}>
            Join OhMyKick and predict every World Cup 2026 match.
          </p>
          <div className={styles.ctaButtons}>
            <a href={waUrl} className={styles.ctaWhatsApp} id="join-whatsapp">
              <span>💬</span>
              Join on WhatsApp
            </a>
            <a href={tgUrl} className={styles.ctaTelegram} id="join-telegram">
              <span>✈️</span>
              Join on Telegram
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
