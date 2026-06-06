import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTeamBackground } from '../teamPatterns';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name') ?? 'FOOTBALL FAN';
  const countryName = searchParams.get('countryName') ?? 'World';
  const flagEmoji = searchParams.get('flagEmoji') ?? '🏳️';
  const fanId = searchParams.get('fanId') ?? 'WLD-000000';
  const fanLevel = searchParams.get('fanLevel') ?? 'FAN';
  const totalPoints = searchParams.get('totalPoints') ?? '0';
  const accuracyPct = searchParams.get('accuracyPct') ?? '0';
  const streakCount = searchParams.get('streakCount') ?? '0';
  const referralCount = searchParams.get('referralCount') ?? '0';
  const referralCode = searchParams.get('referralCode') ?? '';
  const photoUrl = searchParams.get('photoUrl') ?? null;
  const countryCode = searchParams.get('countryCode') ?? '';
  const primaryColor = searchParams.get('primaryColor') ?? '#080810';
  const secondaryColor = searchParams.get('secondaryColor') ?? '#0a0c1e';

  // Level badge config
  const levelBadge = fanLevel === 'LEGEND'
    ? { icon: '💎', label: 'LEGEND', color: '#a78bfa' }
    : fanLevel === 'SUPPORTER'
    ? { icon: '🌟', label: 'SUPPORTER', color: '#60a5fa' }
    : { icon: '⭐', label: 'FAN', color: '#f0b429' };

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '90px 80px',
          position: 'relative',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Dynamic Country Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          opacity: 0.85,
        }}>
          {getTeamBackground(countryCode, 'right', primaryColor, secondaryColor)}
        </div>
        
        {/* Dark overlay to ensure text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)',
          display: 'flex',
        }} />

        {/* Gold accent top line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, transparent, #f0b429, #ffd166, #f0b429, transparent)',
        }} />

        {/* Tournament Label */}
        <div style={{
          fontSize: 28,
          color: '#666',
          letterSpacing: 8,
          marginBottom: 60,
          textTransform: 'uppercase',
        }}>
          ⚽ WORLD CUP 2026
        </div>

        {/* FAN PASSPORT title */}
        <div style={{
          fontSize: 80,
          fontWeight: 900,
          color: '#f0b429',
          letterSpacing: 12,
          marginBottom: 70,
          textTransform: 'uppercase',
        }}>
          FAN PASSPORT
        </div>

        {/* Photo / Avatar */}
        <div style={{
          width: 260,
          height: 260,
          borderRadius: '50%',
          border: '6px solid #f0b429',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 44,
          background: 'linear-gradient(135deg, #1a1200, #0d0d0d)',
          boxShadow: '0 0 60px rgba(240, 180, 41, 0.3)',
        }}>
          {photoUrl ? (
            <img src={photoUrl} width={260} height={260} style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ fontSize: 120 }}>{flagEmoji}</div>
          )}
        </div>

        {/* Name */}
        <div style={{
          fontSize: 88,
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: 4,
          marginBottom: 16,
          textTransform: 'uppercase',
        }}>
          {name.toUpperCase().slice(0, 14)}
        </div>

        {/* Country */}
        <div style={{
          fontSize: 44,
          color: '#f0b429',
          marginBottom: 40,
          letterSpacing: 2,
        }}>
          {`${flagEmoji} ${countryName}`}
        </div>

        {/* Fan ID */}
        <div style={{
          fontSize: 26,
          color: '#555',
          letterSpacing: 4,
          marginBottom: 40,
          fontFamily: 'monospace',
        }}>
          {`FAN ID: ${fanId}`}
        </div>

        {/* Level Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 32px',
          border: `2px solid ${levelBadge.color}`,
          borderRadius: 40,
          marginBottom: 70,
          background: `${levelBadge.color}20`,
        }}>
          <span style={{ fontSize: 28 }}>{levelBadge.icon}</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: levelBadge.color, letterSpacing: 3 }}>
            {levelBadge.label}
          </span>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap: 0,
          width: '100%',
          marginBottom: 70,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          {[
            { value: `${totalPoints}`, label: 'POINTS' },
            { value: `${accuracyPct}%`, label: 'ACCURACY' },
            { value: `🔥 ${streakCount}`, label: 'STREAK' },
            { value: `👥 ${referralCount}`, label: 'REFERRED' },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '32px 8px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 20, color: '#555', letterSpacing: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Referral code */}
        {referralCode && (
          <div style={{
            fontSize: 28,
            color: '#444',
            letterSpacing: 3,
            marginBottom: 20,
          }}>
            {`ohmykick.com/${referralCode}`}
          </div>
        )}

        {/* Bottom border + wordmark */}
        <div style={{
          width: '100%',
          borderTop: '1px solid rgba(240,180,41,0.3)',
          paddingTop: 20,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: 28, color: '#333', letterSpacing: 6 }}>
            OHMYKICK
          </div>
        </div>

        {/* Gold accent bottom line */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, transparent, #f0b429, #ffd166, #f0b429, transparent)',
        }} />
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
}
