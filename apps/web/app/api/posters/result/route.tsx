import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name') ?? 'FAN';
  const countryName = searchParams.get('countryName') ?? '';
  const flagEmoji = searchParams.get('flagEmoji') ?? '🏳️';
  const homeTeam = searchParams.get('homeTeam') ?? 'Team A';
  const awayTeam = searchParams.get('awayTeam') ?? 'Team B';
  const homeFlag = searchParams.get('homeFlag') ?? '🏳️';
  const awayFlag = searchParams.get('awayFlag') ?? '🏳️';
  const predictionHome = searchParams.get('predictionHome') ?? '0';
  const predictionAway = searchParams.get('predictionAway') ?? '0';
  const actualHome = searchParams.get('actualHome') ?? '0';
  const actualAway = searchParams.get('actualAway') ?? '0';
  const resultType = searchParams.get('resultType') ?? 'WRONG'; // PERFECT | CORRECT_WINNER | WRONG
  const points = searchParams.get('points') ?? '0';
  const overallRank = searchParams.get('overallRank') ?? '';
  const accuracy = searchParams.get('accuracy') ?? '0';
  const totalPredictions = searchParams.get('totalPredictions') ?? '0';
  const correctPredictions = searchParams.get('correctPredictions') ?? '0';
  const referralCode = searchParams.get('referralCode') ?? '';

  // Design config per result type
  const config = resultType === 'PERFECT'
    ? {
        bgGradient: 'linear-gradient(175deg, #0a0800 0%, #1a1000 50%, #100a00 100%)',
        accentColor: '#f0b429',
        accentLight: '#ffd166',
        headline: 'YOU CALLED IT',
        subline: 'EXACT SCORE! 🎯',
        resultIcon: '🏆',
        predictionColor: '#4ade80',
        predictionIcon: '✅',
      }
    : resultType === 'CORRECT_WINNER'
    ? {
        bgGradient: 'linear-gradient(175deg, #070810 0%, #0d0d1a 50%, #07070e 100%)',
        accentColor: '#c0c0c0',
        accentLight: '#e8e8e8',
        headline: 'ALMOST PERFECT',
        subline: 'RIGHT WINNER, KEEP GOING',
        resultIcon: '🎯',
        predictionColor: '#60a5fa',
        predictionIcon: '⚡',
      }
    : {
        bgGradient: 'linear-gradient(175deg, #050510 0%, #0a0514 50%, #050508 100%)',
        accentColor: '#4a4a6a',
        accentLight: '#6a6a8a',
        headline: 'FOOTBALL CAN BE CRUEL',
        subline: 'NEXT MATCH, SAME PASSION',
        resultIcon: '🌧️',
        predictionColor: '#ef4444',
        predictionIcon: '❌',
      };

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          background: config.bgGradient,
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
          background: `linear-gradient(90deg, transparent, ${config.accentColor}, ${config.accentLight}, ${config.accentColor}, transparent)`,
        }} />

        {/* Tournament label */}
        <div style={{
          fontSize: 28,
          color: '#555',
          letterSpacing: 6,
          marginBottom: 50,
          textTransform: 'uppercase',
        }}>
          ⚽ WORLD CUP 2026
        </div>

        {/* Result icon */}
        <div style={{ fontSize: 100, marginBottom: 20 }}>
          {config.resultIcon}
        </div>

        {/* Headline */}
        <div style={{
          fontSize: resultType === 'PERFECT' ? 108 : 80,
          fontWeight: 900,
          color: config.accentColor,
          textAlign: 'center',
          lineHeight: 1,
          letterSpacing: resultType === 'PERFECT' ? 0 : 2,
          marginBottom: 24,
        }}>
          {config.headline}
        </div>

        {/* Subline */}
        <div style={{
          fontSize: 32,
          color: config.accentLight,
          letterSpacing: 4,
          marginBottom: 64,
          textTransform: 'uppercase',
        }}>
          {config.subline}
        </div>

        {/* Match result */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: 48,
          padding: '40px 48px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{ fontSize: 80 }}>{homeFlag}</div>
            <div style={{ fontSize: 32, color: '#aaa', fontWeight: 600 }}>{homeTeam}</div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{ fontSize: 20, color: '#444', letterSpacing: 4 }}>RESULT</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}>
              <div style={{ fontSize: 96, fontWeight: 900, color: '#fff' }}>{actualHome}</div>
              <div style={{ fontSize: 56, color: '#333' }}>–</div>
              <div style={{ fontSize: 96, fontWeight: 900, color: '#fff' }}>{actualAway}</div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{ fontSize: 80 }}>{awayFlag}</div>
            <div style={{ fontSize: 32, color: '#aaa', fontWeight: 600 }}>{awayTeam}</div>
          </div>
        </div>

        {/* Prediction vs Actual comparison */}
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '40px 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          marginBottom: 56,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 36,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Your prediction</span>
            <span style={{ color: config.predictionColor, fontWeight: 700 }}>
              {`${predictionHome} – ${predictionAway} ${config.predictionIcon}`}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 36,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Actual result</span>
            <span style={{ color: '#888', fontWeight: 700 }}>
              {`${actualHome} – ${actualAway}`}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          marginBottom: 64,
          fontSize: 34,
          color: config.accentColor,
          fontWeight: 700,
        }}>
          <span>{`+${points} pts`}</span>
          <span style={{ color: '#333', fontWeight: 300 }}>·</span>
          {overallRank && <><span>{`#${overallRank}`}</span><span style={{ color: '#333', fontWeight: 300 }}>·</span></>}
          <span>{`${correctPredictions}/${totalPredictions} correct`}</span>
          <span style={{ color: '#333', fontWeight: 300 }}>·</span>
          <span>{`${accuracy}%`}</span>
        </div>

        {/* User name and country */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <div style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: 2,
          }}>
            {name.toUpperCase()}
          </div>
          <div style={{
            fontSize: 40,
            color: '#666',
          }}>
            {`${flagEmoji} ${countryName} Supporter`}
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
          <div style={{ fontSize: 28, color: '#222', letterSpacing: 8 }}>OHMYKICK</div>
        </div>

        {/* Bottom accent line */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, transparent, ${config.accentColor}, ${config.accentLight}, ${config.accentColor}, transparent)`,
        }} />
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
