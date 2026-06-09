// apps/web/app/api/posters/result/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';
import { getTheme, getResultBackground } from '../teamPatterns';

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

  const name = (searchParams.get('name') ?? searchParams.get('userName') ?? 'FAN').toUpperCase().slice(0, 14);
  const countryName = searchParams.get('countryName') ?? 'World';
  const homeTeam = searchParams.get('homeTeam') ?? 'Team A';
  const awayTeam = searchParams.get('awayTeam') ?? 'Team B';
  const predictionHome = searchParams.get('predictionHome') ?? searchParams.get('predictedHomeScore') ?? '0';
  const predictionAway = searchParams.get('predictionAway') ?? searchParams.get('predictedAwayScore') ?? '0';
  const actualHome = searchParams.get('actualHome') ?? searchParams.get('actualHomeScore') ?? '0';
  const actualAway = searchParams.get('actualAway') ?? searchParams.get('actualAwayScore') ?? '0';
  const resultType = (searchParams.get('resultType') ?? 'WRONG') as 'PERFECT' | 'CORRECT_WINNER' | 'WRONG';
  const points = searchParams.get('points') ?? searchParams.get('pointsEarned') ?? '0';
  const accuracy = searchParams.get('accuracy') ?? searchParams.get('accuracyPct') ?? '0';
  const totalPredictions = searchParams.get('totalPredictions') ?? searchParams.get('totalPredicted') ?? '0';
  const correctPredictions = searchParams.get('correctPredictions') ?? searchParams.get('totalCorrect') ?? '0';
  const referralCode = searchParams.get('referralCode') ?? '';

  const homeCode = searchParams.get('homeCode') ?? searchParams.get('homeCountryCode') ?? 'DEFAULT';
  const awayCode = searchParams.get('awayCode') ?? searchParams.get('awayCountryCode') ?? 'DEFAULT';
  const userCountryCode = searchParams.get('countryCode') ?? 'DEFAULT';

  // Compute winner code dynamically if not provided
  let winnerCode = searchParams.get('winnerCode') ?? '';
  if (!winnerCode || winnerCode === 'DEFAULT') {
    const homeGoals = parseInt(actualHome);
    const awayGoals = parseInt(actualAway);
    if (homeGoals > awayGoals) {
      winnerCode = homeCode;
    } else if (awayGoals > homeGoals) {
      winnerCode = awayCode;
    } else {
      winnerCode = homeCode; // tie fallback
    }
  }

  const theme = getTheme(winnerCode);
  const userTheme = getTheme(userCountryCode);
  const homeTheme = getTheme(homeCode);
  const awayTheme = getTheme(awayCode);

  // Styling and content configurations based on resultType
  const config = resultType === 'PERFECT'
    ? {
        accentColor: '#f0b429',
        accentLight: '#ffd166',
        headline: 'YOU CALLED IT',
        subline: 'EXACT SCORELINE MATCHED!',
        predictionColor: '#4ade80',
        hasTrophy: true,
        isPerfect: true,
      }
    : resultType === 'CORRECT_WINNER'
    ? {
        accentColor: '#ffffff',
        accentLight: theme.accent,
        headline: 'NICE CALL',
        subline: 'RIGHT WINNER, KEEP GOING!',
        predictionColor: '#60a5fa',
        hasTrophy: false,
        isCorrectWinner: true,
      }
    : {
        accentColor: '#ff4444',
        accentLight: '#ff8888',
        headline: 'SO CLOSE',
        subline: 'NEXT MATCH, SAME PASSION!',
        predictionColor: '#ef4444',
        hasTrophy: false,
        isWrong: true,
      };

  return new ImageResponse(
    (
      <div style={{
        width: 1080, height: 1920,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '80px 80px 60px',
        position: 'relative', overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}>
        {/* BACKGROUND */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
          {getResultBackground(winnerCode, resultType)}
        </div>

        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: `linear-gradient(90deg, transparent, ${config.accentColor}, ${theme.accent}, ${config.accentColor}, transparent)`,
          display: 'flex',
        }} />

        {/* Tournament label */}
        <div style={{
          fontSize: 22, color: 'rgba(255,255,255,0.4)',
          letterSpacing: 8, marginBottom: 50, display: 'flex',
          fontWeight: 700,
        }}>
          OHMYKICK · WORLD CUP 2026
        </div>

        {/* Headline with inline SVG icon instead of emoji */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          {config.hasTrophy ? (
            <svg width="76" height="76" viewBox="0 0 24 24" fill="none" stroke={config.accentColor} strokeWidth="2" style={{ marginRight: 20, display: 'flex' }}>
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
              <path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z"/>
            </svg>
          ) : config.isCorrectWinner ? (
            <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke={config.accentColor} strokeWidth="2.5" style={{ marginRight: 20, display: 'flex' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ) : (
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={config.accentColor} strokeWidth="2.5" style={{ marginRight: 20, display: 'flex' }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          )}

          <span style={{
            fontSize: resultType === 'PERFECT' ? 90 : 76,
            fontWeight: 900,
            color: config.accentColor,
            letterSpacing: 2,
            display: 'flex',
            textShadow: `0 4px 30px ${config.accentColor}88`,
          }}>
            {config.headline}
          </span>
        </div>

        {/* Subline */}
        <div style={{
          fontSize: 28,
          color: config.accentLight,
          letterSpacing: 4,
          marginBottom: 60,
          display: 'flex',
          fontWeight: 700,
        }}>
          {config.subline}
        </div>

        {/* Match result block */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: 48,
          padding: '44px 48px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Home team */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 260,
          }}>
            <div style={{ marginBottom: 12, display: 'flex' }}>
              <CircularBadge primary={homeTheme.primary} secondary={homeTheme.secondary} size={90} />
            </div>
            <div style={{ fontSize: 28, color: '#e0e0e0', fontWeight: 700, textTransform: 'uppercase', display: 'flex', textAlign: 'center' }}>
              {homeTeam}
            </div>
          </div>

          {/* VS/Scores */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', letterSpacing: 4, fontWeight: 700, marginBottom: 8, display: 'flex' }}>
              FINAL RESULT
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 88, fontWeight: 900, color: '#fff', display: 'flex' }}>{actualHome}</span>
              <span style={{ fontSize: 56, color: 'rgba(255,255,255,0.2)', marginLeft: 20, marginRight: 20, display: 'flex' }}>–</span>
              <span style={{ fontSize: 88, fontWeight: 900, color: '#fff', display: 'flex' }}>{actualAway}</span>
            </div>
          </div>

          {/* Away team */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 260,
          }}>
            <div style={{ marginBottom: 12, display: 'flex' }}>
              <CircularBadge primary={awayTheme.primary} secondary={awayTheme.secondary} size={90} />
            </div>
            <div style={{ fontSize: 28, color: '#e0e0e0', fontWeight: 700, textTransform: 'uppercase', display: 'flex', textAlign: 'center' }}>
              {awayTeam}
            </div>
          </div>
        </div>

        {/* Prediction vs Actual comparison */}
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '40px 48px',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 50,
        }}>
          {/* Row 1: Prediction */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 32, color: 'rgba(255,255,255,0.4)', display: 'flex' }}>Your prediction</span>
            <span style={{ fontSize: 36, color: config.predictionColor, fontWeight: 800, display: 'flex', alignItems: 'center' }}>
              {predictionHome} – {predictionAway} &nbsp;&nbsp;
              {config.isPerfect ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" style={{ display: 'flex' }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : config.isCorrectWinner ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="3" style={{ display: 'flex' }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" style={{ display: 'flex' }}>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', width: '100%', marginBottom: 20, display: 'flex' }} />

          {/* Row 2: Actual */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 32, color: 'rgba(255,255,255,0.4)', display: 'flex' }}>Actual result</span>
            <span style={{ fontSize: 36, color: '#ffffff', fontWeight: 800, display: 'flex' }}>
              {actualHome} – {actualAway}
            </span>
          </div>
        </div>

        {/* Points and statistics badges */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          marginBottom: 50,
        }}>
          {/* Points badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.06)',
            padding: '12px 28px',
            borderRadius: 30,
            border: `1.5px solid ${config.accentColor}44`,
            marginRight: 16,
          }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: config.accentColor, display: 'flex' }}>
              +{points} PTS
            </span>
          </div>

          {/* Accuracy badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.06)',
            padding: '12px 28px',
            borderRadius: 30,
            border: '1px solid rgba(255,255,255,0.1)',
            marginRight: 16,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="2.5" style={{ marginRight: 8, display: 'flex' }}>
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#e0e0e0', display: 'flex' }}>
              {accuracy}% ACC
            </span>
          </div>

          {/* Correct Count badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.06)',
            padding: '12px 28px',
            borderRadius: 30,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#e0e0e0" style={{ marginRight: 8, display: 'flex' }}>
              <path d="M17.66 11.57C17.43 8 15.34 5.08 12.33 3.75c-.2-.09-.4.07-.36.29.35 1.87-.29 4.13-1.8 5.64C8.66 11.19 8 13.13 8 15.5c0 2.2 1.3 4.2 3.3 4.9.22.08.4-.12.34-.35-.29-1.07-.15-2.24.46-3.23.4-.64 1.02-1.08 1.6-1.6 1.4-1.26 2.3-3.06 2.3-4.83.01-.28-.01-.56-.04-.82z"/>
            </svg>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#e0e0e0', display: 'flex' }}>
              {correctPredictions}/{totalPredictions} OK
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: 'flex' }} />

        {/* User name and country */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 40,
        }}>
          <div style={{
            fontSize: name.length > 10 ? 60 : 76,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: 2,
            marginBottom: 10,
            display: 'flex',
            textShadow: `0 4px 20px ${theme.primary}55`,
          }}>
            {name}
          </div>
          <div style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
          }}>
            <CircularBadge primary={userTheme.primary} secondary={userTheme.secondary} size={36} />
            <span style={{ marginLeft: 12 }}>{countryName.toUpperCase()}</span>
          </div>
        </div>

        {/* Referral */}
        {referralCode && (
          <div style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 3,
            marginBottom: 20,
            display: 'flex',
            fontFamily: 'monospace',
          }}>
            ohmykick.com/{referralCode}
          </div>
        )}

        {/* Bottom wordmark */}
        <div style={{
          width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 16,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.2)', letterSpacing: 8, display: 'flex' }}>OHMYKICK</div>
        </div>

        {/* Bottom accent line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
          background: `linear-gradient(90deg, transparent, ${config.accentColor}, ${theme.accent}, ${config.accentColor}, transparent)`,
          display: 'flex',
        }} />
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
