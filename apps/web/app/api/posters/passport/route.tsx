// apps/web/app/api/posters/passport/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';
import { getTheme, getPassportBackground, getPhotoFrameStyle } from '../teamPatterns';

export const runtime = 'edge';

const CircularBadge = ({ primary, secondary }: { primary: string, secondary: string }) => (
  <div style={{
    display: 'flex',
    width: 44, height: 44,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.8)',
    position: 'relative',
    marginRight: 12,
  }}>
    <div style={{ flex: 1, backgroundColor: primary, display: 'flex' }} />
    <div style={{ flex: 1, backgroundColor: secondary, display: 'flex' }} />
  </div>
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name          = (searchParams.get('name') ?? 'FOOTBALL FAN').toUpperCase().slice(0, 14);
  const countryCode   = searchParams.get('countryCode') ?? 'DEFAULT';
  const countryName   = searchParams.get('countryName') ?? 'World';
  const fanId         = searchParams.get('fanId') ?? 'WLD-000000';
  const fanLevel      = searchParams.get('fanLevel') ?? 'FAN';
  const totalPoints   = searchParams.get('totalPoints') ?? '0';
  const accuracyPct   = searchParams.get('accuracyPct') ?? '0';
  const streakCount   = searchParams.get('streakCount') ?? '0';
  const referralCount = searchParams.get('referralCount') ?? '0';
  const referralCode  = searchParams.get('referralCode') ?? '';
  const photoUrl      = searchParams.get('photoUrl') ?? null;
  const variant       = (searchParams.get('variant') ?? 'V3') as 'V1' | 'V2' | 'V3' | 'V4' | 'V5';

  const theme = getTheme(countryCode);

  let photoDataUrl: string | null = null;
  if (photoUrl) {
    try {
      const imgRes = await fetch(photoUrl);
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        photoDataUrl = `data:${contentType};base64,${base64}`;
      } else {
        console.error(`Failed to fetch photoUrl: ${photoUrl}, status: ${imgRes.status}`);
      }
    } catch (err) {
      console.error(`Error fetching photoUrl: ${photoUrl}`, err);
    }
  }

  let badgeColor = theme.accent;
  if (fanLevel === 'LEGEND') badgeColor = '#a78bfa';
  else if (fanLevel === 'SUPPORTER') badgeColor = '#60a5fa';

  const photoFrameStyle = getPhotoFrameStyle(theme, variant);

  return new ImageResponse(
    (
      <div style={{
        width: 1080, height: 1920,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '80px 80px 60px',
        position: 'relative', overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}>
        {/* BACKGROUND — variant-specific */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
          {getPassportBackground(countryCode, variant)}
        </div>

        {/* OHMYKICK wordmark */}
        <div style={{
          fontSize: 22, color: 'rgba(255,255,255,0.5)',
          letterSpacing: 10, marginBottom: 8, display: 'flex',
        }}>
          OHMYKICK
        </div>
        <div style={{
          fontSize: 16, color: 'rgba(255,255,255,0.3)',
          letterSpacing: 5, marginBottom: 50, display: 'flex',
        }}>
          FAN PASSPORT · WORLD CUP 2026
        </div>

        {/* PHOTO CIRCLE — glowing, variant-aware */}
        <div style={photoFrameStyle}>
          {photoDataUrl ? (
            <img src={photoDataUrl} width={260} height={260} style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{
              fontSize: 100, fontWeight: 900, color: theme.textColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 260, height: 260,
              backgroundColor: theme.primary,
            }}>
              {name.charAt(0)}
            </div>
          )}
        </div>

        {/* COUNTRY row */}
        <div style={{
          fontSize: 32, color: 'rgba(255,255,255,0.8)',
          letterSpacing: 6, marginBottom: 16, display: 'flex', alignItems: 'center',
        }}>
          <CircularBadge primary={theme.primary} secondary={theme.secondary} />
          {countryName.toUpperCase()}
        </div>

        {/* NAME */}
        <div style={{
          fontSize: name.length > 10 ? 72 : 92,
          fontWeight: 900, color: '#ffffff',
          letterSpacing: 4, marginBottom: 20,
          display: 'flex', textShadow: `0 2px 20px ${theme.primary}88`,
        }}>
          {name}
        </div>

        {/* FAN ID */}
        <div style={{
          fontSize: 22, color: 'rgba(255,255,255,0.35)',
          letterSpacing: 5, marginBottom: 10, display: 'flex',
          fontFamily: 'monospace',
        }}>
          FAN ID · {fanId}
        </div>

        {/* LEVEL BADGE */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '10px 28px',
          border: `2px solid ${badgeColor}`,
          borderRadius: 40, marginBottom: 60,
          background: `${badgeColor}20`,
        }}>
          {fanLevel === 'LEGEND' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={badgeColor} strokeWidth="2.5" style={{ marginRight: 10, display: 'flex' }}>
              <path d="M6 3h12l4 6-10 12L2 9z"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={badgeColor} strokeWidth="2.5" style={{ marginRight: 10, display: 'flex' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          )}
          <span style={{ fontSize: 22, fontWeight: 700, color: badgeColor, letterSpacing: 3, display: 'flex' }}>
            {fanLevel}
          </span>
        </div>

        {/* STATS ROW */}
        <div style={{
          display: 'flex', width: '100%', marginBottom: 50,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          {[
            { value: totalPoints,         label: 'PREDICTIONS' },
            { value: `${accuracyPct}%`,   label: 'ACCURACY' },
            { value: streakCount, label: 'STREAK', isStreak: true },
            { value: referralCount, label: 'REFERRED', isReferred: true },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '28px 8px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                {stat.isStreak && (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="#ef4444" style={{ marginRight: 6, display: 'flex' }}>
                    <path d="M17.66 11.57C17.43 8 15.34 5.08 12.33 3.75c-.2-.09-.4.07-.36.29.35 1.87-.29 4.13-1.8 5.64C8.66 11.19 8 13.13 8 15.5c0 2.2 1.3 4.2 3.3 4.9.22.08.4-.12.34-.35-.29-1.07-.15-2.24.46-3.23.4-.64 1.02-1.08 1.6-1.6 1.4-1.26 2.3-3.06 2.3-4.83.01-.28-.01-.56-.04-.82z"/>
                  </svg>
                )}
                {stat.isReferred && (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" style={{ marginRight: 6, display: 'flex' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                )}
                <span style={{ fontSize: 40, fontWeight: 800, color: '#fff', display: 'flex' }}>
                  {stat.value}
                </span>
              </div>
              <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, display: 'flex' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER ROW */}
        <div style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${theme.accent}44`,
          paddingTop: 30,
          marginTop: 'auto',
        }}>
          {/* LEFT: Referral Text */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              fontSize: 20,
              fontWeight: 800,
              color: theme.accent,
              letterSpacing: 2,
              marginBottom: 8,
              display: 'flex',
            }}>
              RECRUIT YOUR TEAM! JOIN THE ARMY.
            </div>
            {referralCode && (
              <div style={{
                fontSize: 32,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: 3,
                display: 'flex',
              }}>
                ohmykick.com/{referralCode}
              </div>
            )}
          </div>

          {/* RIGHT: QR Code */}
          {referralCode && (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=000000&bgcolor=ffffff&data=${encodeURIComponent(`https://ohmykick.com/${referralCode}`)}`}
              width={120}
              height={120}
              style={{
                display: 'flex',
                borderRadius: 8,
                border: '4px solid #ffffff',
              }}
            />
          )}
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
