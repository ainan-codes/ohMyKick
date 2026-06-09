// apps/web/app/api/posters/prematch/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';
import { getTheme, getPrematchBackground } from '../teamPatterns';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const homeTeam          = searchParams.get('homeTeam') ?? 'Team A';
  const awayTeam          = searchParams.get('awayTeam') ?? 'Team B';
  const homeCode          = searchParams.get('homeCode') ?? searchParams.get('homeCountryCode') ?? 'DEFAULT';
  const awayCode          = searchParams.get('awayCode') ?? searchParams.get('awayCountryCode') ?? 'DEFAULT';
  const predictedHomeScore = parseInt(searchParams.get('predictedHomeScore') ?? searchParams.get('predictionHome') ?? '0');
  const predictedAwayScore = parseInt(searchParams.get('predictedAwayScore') ?? searchParams.get('predictionAway') ?? '0');
  const userName          = searchParams.get('userName') ?? searchParams.get('name') ?? 'FAN';
  const userCountryCode   = searchParams.get('countryCode') ?? 'DEFAULT';
  const referralCode      = searchParams.get('referralCode') ?? '';
  const stage             = searchParams.get('stage') ?? 'GROUP STAGE';

  const homeTheme = getTheme(homeCode);
  const awayTheme = getTheme(awayCode);
  const userTheme = getTheme(userCountryCode);

  return new ImageResponse(
    (
      <div style={{
        width: 1080, height: 1920,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden',
      }}>
        {/* BACKGROUND */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
          {getPrematchBackground(homeCode, awayCode)}
        </div>

        {/* ── TOP HALF CONTENT (0–960) ── */}
        <div style={{
          position: 'relative', display: 'flex', flexDirection: 'column',
          alignItems: 'center', width: '100%', height: 960,
          padding: '60px 60px 0',
        }}>
          {/* HEADER */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
            <div style={{
              fontSize: 28, fontWeight: 900, color: '#ffffff',
              letterSpacing: 10, display: 'flex',
            }}>
              OHMYKICK
            </div>
            <div style={{
              fontSize: 18, color: 'rgba(255,255,255,0.4)',
              letterSpacing: 4, marginTop: 8, display: 'flex',
            }}>
              PREDICTION CARD · WC 2026
            </div>
          </div>

          {/* STAGE pill */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '6px 24px',
            background: 'rgba(255,255,255,0.10)',
            borderRadius: 20, marginBottom: 60,
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', letterSpacing: 3, display: 'flex' }}>
              {stage.toUpperCase()}
            </span>
          </div>

          {/* TEAMS ROW */}
          <div style={{
            display: 'flex', width: '100%', alignItems: 'center',
            justifyContent: 'space-between', padding: '0 40px',
          }}>
            {/* HOME SIDE */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', width: 340,
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.12)', padding: '5px 20px', borderRadius: 20,
                color: 'rgba(255,255,255,0.6)', fontSize: 18, letterSpacing: 2,
                fontWeight: 700, marginBottom: 20, display: 'flex',
              }}>HOME</div>

              {/* Styled Circular badge instead of flag emoji */}
              <div style={{ marginBottom: 28, display: 'flex' }}>
                <CircularBadge primary={homeTheme.primary} secondary={homeTheme.secondary} size={110} />
              </div>

              {/* Jersey circle with glowing ring */}
              <div style={{
                width: 200, height: 200, borderRadius: '50%',
                border: `3px solid rgba(255,255,255,0.4)`,
                boxShadow: `0 0 40px ${homeTheme.accent}, 0 0 80px ${homeTheme.primary}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.08)',
              }}>
                <svg width="110" height="120" viewBox="0 0 100 110" fill="none">
                  <path d="M50 0 C75 0 95 10 95 30 C95 65 70 100 50 110 C30 100 5 65 5 30 C5 10 25 0 50 0 Z"
                    fill={homeTheme.primary} />
                  <path d="M20 15 C35 25 65 25 80 15 L85 28 C65 40 35 40 15 28 Z"
                    fill={homeTheme.secondary === '#FFFFFF' ? homeTheme.accent : homeTheme.secondary} />
                </svg>
              </div>

              {/* Team name */}
              <div style={{
                fontSize: 32, fontWeight: 700, color: '#fff',
                marginTop: 24, letterSpacing: 2, display: 'flex',
                textTransform: 'uppercase',
              }}>
                {homeTeam}
              </div>
            </div>

            {/* VS badge */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: '#080808', border: '3px solid #333',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#aaa', display: 'flex' }}>VS</span>
            </div>

            {/* AWAY SIDE */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', width: 340,
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.12)', padding: '5px 20px', borderRadius: 20,
                color: 'rgba(255,255,255,0.6)', fontSize: 18, letterSpacing: 2,
                fontWeight: 700, marginBottom: 20, display: 'flex',
              }}>AWAY</div>

              {/* Styled Circular badge instead of flag emoji */}
              <div style={{ marginBottom: 28, display: 'flex' }}>
                <CircularBadge primary={awayTheme.primary} secondary={awayTheme.secondary} size={110} />
              </div>

              {/* Jersey circle with glowing ring */}
              <div style={{
                width: 200, height: 200, borderRadius: '50%',
                border: `3px solid rgba(255,255,255,0.4)`,
                boxShadow: `0 0 40px ${awayTheme.accent}, 0 0 80px ${awayTheme.primary}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.08)',
              }}>
                <svg width="110" height="120" viewBox="0 0 100 110" fill="none">
                  <path d="M50 0 C75 0 95 10 95 30 C95 65 70 100 50 110 C30 100 5 65 5 30 C5 10 25 0 50 0 Z"
                    fill={awayTheme.primary} />
                  <path d="M20 15 C35 25 65 25 80 15 L85 28 C65 40 35 40 15 28 Z"
                    fill={awayTheme.secondary === '#FFFFFF' ? awayTheme.accent : awayTheme.secondary} />
                </svg>
              </div>

              {/* Team name */}
              <div style={{
                fontSize: 32, fontWeight: 700, color: '#fff',
                marginTop: 24, letterSpacing: 2, display: 'flex',
                textTransform: 'uppercase',
              }}>
                {awayTeam}
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM HALF CONTENT (960–1920) ── */}
        <div style={{
          position: 'relative', display: 'flex', flexDirection: 'column',
          alignItems: 'center', width: '100%', height: 960,
          padding: '60px 80px 60px',
        }}>
          {/* MY PREDICTION label */}
          <div style={{
            fontSize: 22, color: 'rgba(255,255,255,0.4)',
            letterSpacing: 5, marginBottom: 24, display: 'flex',
            fontWeight: 700, textTransform: 'uppercase',
          }}>
            MY PREDICTION
          </div>

          {/* SCORE */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 150, fontWeight: 900, color: homeTheme.accent, display: 'flex' }}>
              {predictedHomeScore}
            </span>
            <span style={{ fontSize: 90, color: 'rgba(255,255,255,0.25)', marginLeft: 24, marginRight: 24, display: 'flex' }}>
              –
            </span>
            <span style={{ fontSize: 150, fontWeight: 900, color: awayTheme.accent, display: 'flex' }}>
              {predictedAwayScore}
            </span>
          </div>

          {/* TEAM NAMES labels */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', width: 420,
            fontSize: 22, color: 'rgba(255,255,255,0.3)',
            marginBottom: 40, fontWeight: 700, letterSpacing: 1,
          }}>
            <span style={{ display: 'flex' }}>{homeTeam.toUpperCase()}</span>
            <span style={{ display: 'flex' }}>{awayTeam.toUpperCase()}</span>
          </div>

          {/* PREDICTION LOCKED pill */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '18px 48px',
            border: `2px solid ${homeTheme.accent}`,
            borderRadius: 60,
            background: 'rgba(0,0,0,0.6)',
            marginBottom: 60,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={homeTheme.accent} strokeWidth="2.5" style={{ marginRight: 12, display: 'flex' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{ fontSize: 28, color: homeTheme.accent, letterSpacing: 4, fontWeight: 700, display: 'flex' }}>
              PREDICTION LOCKED
            </span>
          </div>

          {/* SPACER */}
          <div style={{ flex: 1, display: 'flex' }} />

          {/* PREDICTED BY */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              fontSize: 20, color: 'rgba(255,255,255,0.3)',
              letterSpacing: 3, marginBottom: 10, display: 'flex', fontWeight: 700,
            }}>
              PREDICTED BY
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', marginBottom: 30,
            }}>
              <CircularBadge primary={userTheme.primary} secondary={userTheme.secondary} size={44} />
              <span style={{
                fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: 1, display: 'flex',
                textTransform: 'uppercase', marginLeft: 16,
              }}>
                {userName}
              </span>
            </div>
            <div style={{
              fontSize: 18, color: 'rgba(255,255,255,0.2)',
              letterSpacing: 2, marginBottom: 6, display: 'flex', fontWeight: 700,
            }}>
              RECRUIT YOUR NATION
            </div>
            <div style={{
              fontSize: 24, color: 'rgba(255,255,255,0.35)',
              letterSpacing: 1, display: 'flex', fontFamily: 'monospace',
            }}>
              ohmykick.com/{referralCode}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
