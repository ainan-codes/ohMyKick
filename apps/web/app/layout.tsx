import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OhMyKick — World Cup 2026 Fan Prediction Platform',
  description:
    'Predict every FIFA World Cup 2026 match on WhatsApp & Telegram. Get your personalised fan passport and shareable result posters automatically.',
  keywords: 'World Cup 2026, football predictions, WhatsApp bot, Telegram bot, fan passport',
  openGraph: {
    title: 'OhMyKick — World Cup 2026 Predictions',
    description: 'Predict matches. Get your fan poster. Share the glory.',
    type: 'website',
    url: 'https://ohmykick.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OhMyKick Fan Prediction Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OhMyKick — World Cup 2026',
    description: 'Predict every match. Get your fan passport. Compete worldwide.',
  },
  metadataBase: new URL('https://ohmykick.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
