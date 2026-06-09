// apps/web/app/api/posters/recap/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';
import { getTheme } from '../teamPatterns';

export const runtime = 'edge';

const CircularBadge = ({ primary, secondary, size = 44 }: { primary: string, secondary: string, size?: number }) => (
  <div style={{
    display: 'flex',
    width: size, height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.8)',
    position: 'relative',
  }}>
    <div style={{ flex: 1, backgroundColor: primary, display: 'flex' }} />
    <div style={{ flex: 1, backgroundColor: secondary, display: 'flex' }} />
  </div>
);

function renderPersonalityIcon(icon: string, color: string) {
  const width = 110;
  const height = 110;
  const fill = color;

  switch (icon) {
    case '⚡': // Lightning (Superfan)
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      );
    case '🔮': // Crystal Ball (Oracle)
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="10" r="8"/>
          <path d="M12 18v4M9 22h6M5 19.5c1.8-1 5.2-1.5 7-1.5s5.2.5 7 1.5"/>
        </svg>
      );
    case '📊': // Bar Chart (Analyst)
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      );
    case '🛡️': // Shield (Diehard)
    default:
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name') ?? 'FAN';
  const countryName = searchParams.get('countryName') ?? 'WORLD';
  const countryCode = searchParams.get('countryCode') ?? 'DEFAULT';
  const personalityType = searchParams.get('personality') ?? 'THE ORACLE';
  const personalityDesc = searchParams.get('personalityDesc') ?? 'Top 5% accuracy globally. Uncanny matching instincts.';
  const personalityIcon = searchParams.get('personalityIcon') ?? '⚡';
  
  // Stats
  const predictions = searchParams.get('predictions') ?? '0';
  const accuracy = searchParams.get('accuracy') ?? '0';
  const exactScores = searchParams.get('exact') ?? '0';
  const streak = searchParams.get('streak') ?? '0';
  const referrals = searchParams.get('referrals') ?? '0';
  const rank = searchParams.get('rank') ?? '1';
  
  const referralCode = searchParams.get('referralCode') ?? '';

  const theme = getTheme(countryCode);

  const bgGradient = 'linear-gradient(175deg, #0f0714 0%, #1a0b24 50%, #08030b 100%)';
  const accentColor = '#e879f9'; // Neon Pink/Purple
  const accentLight = '#fdf4ff';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          background: bgGradient,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '80px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, transparent, ${accentColor}, ${accentLight}, ${accentColor}, transparent)`,
        }} />

        {/* Tournament label */}
        <div style={{
          fontSize: 28,
          color: '#555',
          letterSpacing: 6,
          marginBottom: 60,
          textTransform: 'uppercase',
          display: 'flex',
        }}>
          WORLD CUP 2026 JOURNEY
        </div>

        {/* Personality Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 36,
          border: '1px solid rgba(232,121,249,0.15)',
          padding: '48px 48px',
          marginBottom: 48,
        }}>
          <div style={{ marginBottom: 16, display: 'flex' }}>
            {renderPersonalityIcon(personalityIcon, accentColor)}
          </div>
          <div style={{
            fontSize: 24,
            color: '#a21caf',
            fontWeight: 800,
            letterSpacing: 3,
            marginBottom: 8,
            display: 'flex',
          }}>
            FAN PERSONALITY
          </div>
          <div style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#fff',
            marginBottom: 16,
            letterSpacing: 1,
            textAlign: 'center',
            display: 'flex',
          }}>
            {personalityType.toUpperCase()}
          </div>
          <div style={{
            fontSize: 28,
            color: '#aaa',
            textAlign: 'center',
            lineHeight: 1.4,
            display: 'flex',
          }}>
            {personalityDesc}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 36,
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '48px 48px',
          marginBottom: 48,
        }}>
          <div style={{
            fontSize: 28,
            color: '#555',
            fontWeight: 700,
            letterSpacing: 2,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            paddingBottom: 16,
            textTransform: 'uppercase',
            marginBottom: 24,
            display: 'flex',
          }}>
            Tournament Stats
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 34, marginBottom: 24 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', display: 'flex' }}>Predictions Made</span>
            <span style={{ color: '#fff', fontWeight: 700, display: 'flex' }}>{predictions}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 34, marginBottom: 24 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', display: 'flex' }}>Accuracy Rate</span>
            <span style={{ color: accentColor, fontWeight: 700, display: 'flex' }}>{accuracy}%</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 34, marginBottom: 24 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', display: 'flex' }}>Exact Scorelines</span>
            <span style={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              {exactScores} &nbsp;
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" style={{ display: 'flex' }}>
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
                <path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z"/>
              </svg>
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 34, marginBottom: 24 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', display: 'flex' }}>Best Daily Streak</span>
            <span style={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              {streak} Days &nbsp;
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#ef4444" style={{ display: 'flex' }}>
                <path d="M17.66 11.57C17.43 8 15.34 5.08 12.33 3.75c-.2-.09-.4.07-.36.29.35 1.87-.29 4.13-1.8 5.64C8.66 11.19 8 13.13 8 15.5c0 2.2 1.3 4.2 3.3 4.9.22.08.4-.12.34-.35-.29-1.07-.15-2.24.46-3.23.4-.64 1.02-1.08 1.6-1.6 1.4-1.26 2.3-3.06 2.3-4.83.01-.28-.01-.56-.04-.82z"/>
              </svg>
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 34 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', display: 'flex' }}>Friends Referred</span>
            <span style={{ color: '#fff', fontWeight: 700, display: 'flex' }}>{referrals}</span>
          </div>
        </div>

        {/* Global Rank Highlight */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          background: 'linear-gradient(90deg, rgba(232,121,249,0.1) 0%, rgba(232,121,249,0.2) 50%, rgba(232,121,249,0.1) 100%)',
          border: '1px solid rgba(232,121,249,0.3)',
          borderRadius: 24,
          padding: '24px',
          fontSize: 38,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: 2,
          marginBottom: 48,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2.5" style={{ marginRight: 12, display: 'flex' }}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
            <path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z"/>
          </svg>
          FINAL RANK: #{rank} GLOBALLY
        </div>

        {/* User profile */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: 2,
            marginBottom: 12,
            display: 'flex',
          }}>
            {name.toUpperCase()}
          </div>

          <div style={{
            fontSize: 40,
            color: '#666',
            display: 'flex',
            alignItems: 'center',
          }}>
            <CircularBadge primary={theme.primary} secondary={theme.secondary} size={36} />
            <span style={{ marginLeft: 12 }}>{countryName.toUpperCase()} SUPPORTER</span>
          </div>
        </div>

        {/* Referral */}
        {referralCode && (
          <div style={{
            fontSize: 28,
            color: '#333',
            letterSpacing: 3,
            marginTop: 40,
            marginBottom: 20,
            display: 'flex',
          }}>
            {`ohmykick.com/${referralCode}`}
          </div>
        )}

        {/* Bottom wordmark */}
        <div style={{
          width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 20,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: 28, color: '#222', letterSpacing: 8, display: 'flex' }}>OHMYKICK</div>
        </div>

        {/* Bottom accent line */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, transparent, ${accentColor}, ${accentLight}, ${accentColor}, transparent)`,
        }} />
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
