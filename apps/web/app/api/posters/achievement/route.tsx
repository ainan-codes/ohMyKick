// apps/web/app/api/posters/achievement/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';
import { getTheme } from '../teamPatterns';

export const runtime = 'edge';

function renderBadgeIcon(icon: string, color: string) {
  const width = 140;
  const height = 140;
  const fill = color;

  switch (icon) {
    case '⚽': // Soccer Ball
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2v20M2 12h20M12 12l-5.5-5.5M12 12l5.5-5.5M12 12l5.5 5.5M12 12l-5.5 5.5"/>
        </svg>
      );
    case '🔥': // Flame
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
          <path d="M17.66 11.57C17.43 8 15.34 5.08 12.33 3.75c-.2-.09-.4.07-.36.29.35 1.87-.29 4.13-1.8 5.64C8.66 11.19 8 13.13 8 15.5c0 2.2 1.3 4.2 3.3 4.9.22.08.4-.12.34-.35-.29-1.07-.15-2.24.46-3.23.4-.64 1.02-1.08 1.6-1.6 1.4-1.26 2.3-3.06 2.3-4.83.01-.28-.01-.56-.04-.82zm-8.82 5c.18 2.27 1.3 4.43 3.32 5.38.2.09.4-.07.36-.29-.35-1.87.29-4.13 1.8-5.64 1.51-1.51 2.17-3.45 2.17-5.82 0-1-.3-1.9-.8-2.7-.1-.17-.35-.15-.42.03-.4.97-1.12 1.76-2 2.31-.85.53-1.6 1.25-2.12 2.13-.91 1.54-1.23 3.33-.31 4.56z"/>
        </svg>
      );
    case '👑': // Crown
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/>
          <path d="M3 20h18"/>
        </svg>
      );
    case '🦁': // Lion / Shield/Upset
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M12 8v8M9 11h6"/>
        </svg>
      );
    case '🎯': // Target
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      );
    case '🛡️': // Shield
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      );
    case '🏆': // Trophy
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
          <path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z"/>
        </svg>
      );
    case '🌟': // Star
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      );
    case '⚓': // Anchor
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="3"/>
          <line x1="12" y1="8" x2="12" y2="20"/>
          <line x1="9" y1="11" x2="15" y2="11"/>
          <path d="M5 12h2a5 5 0 0 0 10 0h2"/>
        </svg>
      );
    case '🎖️': // Medal
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7"/>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
        </svg>
      );
    default:
      return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name') ?? 'FAN';
  const countryName = searchParams.get('countryName') ?? 'WORLD';
  const countryCode = searchParams.get('countryCode') ?? 'DEFAULT';
  const achievementTitle = searchParams.get('title') ?? 'FIRST PREDICTION';
  const achievementDesc = searchParams.get('desc') ?? 'Submitted your first World Cup prediction!';
  const badgeIcon = searchParams.get('icon') ?? '🏆';
  const referralCode = searchParams.get('referralCode') ?? '';

  const theme = getTheme(countryCode);

  const bgGradient = 'linear-gradient(175deg, #090a15 0%, #101226 50%, #05060b 100%)';
  const accentColor = theme.accent !== '#ffffff' ? theme.accent : '#ffd700'; // Fallback to Gold
  const accentLight = '#fff4b3';

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
          marginBottom: 100,
          textTransform: 'uppercase',
          display: 'flex',
        }}>
          WORLD CUP 2026
        </div>

        {/* Achievement Frame */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 40,
          border: `2px solid ${accentColor}44`,
          padding: '80px 60px',
          marginBottom: 100,
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        }}>
          {/* Badge Icon wrapper */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            border: `6px solid ${accentColor}`,
            marginBottom: 60,
            boxShadow: `0 10px 30px ${accentColor}33`,
          }}>
            {renderBadgeIcon(badgeIcon, accentColor)}
          </div>

          <div style={{
            fontSize: 30,
            color: accentColor,
            fontWeight: 800,
            letterSpacing: 4,
            marginBottom: 20,
            textTransform: 'uppercase',
            display: 'flex',
          }}>
            ACHIEVEMENT UNLOCKED
          </div>

          <div style={{
            fontSize: 76,
            fontWeight: 900,
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 30,
            letterSpacing: 2,
            display: 'flex',
          }}>
            {achievementTitle.toUpperCase()}
          </div>

          <div style={{
            fontSize: 34,
            color: '#999',
            textAlign: 'center',
            lineHeight: 1.5,
            padding: '0 20px',
            display: 'flex',
          }}>
            {achievementDesc}
          </div>
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
            {/* Styled colored split indicator for team instead of emoji */}
            <div style={{
              display: 'flex', width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', marginRight: 14, border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{ flex: 1, backgroundColor: theme.primary }} />
              <div style={{ flex: 1, backgroundColor: theme.secondary }} />
            </div>
            {`${countryName.toUpperCase()} SUPPORTER`}
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
