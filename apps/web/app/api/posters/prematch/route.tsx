import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const userName = searchParams.get('name') ?? 'FAN';
  const userFlag = searchParams.get('flagEmoji') ?? '🏳️';
  const userCountry = searchParams.get('countryName') ?? '';
  const homeTeam = searchParams.get('homeTeam') ?? 'Team A';
  const awayTeam = searchParams.get('awayTeam') ?? 'Team B';
  const homeFlag = searchParams.get('homeFlag') ?? '🏳️';
  const awayFlag = searchParams.get('awayFlag') ?? '🏳️';
  const predictionHome = parseInt(searchParams.get('predictionHome') ?? '0');
  const predictionAway = parseInt(searchParams.get('predictionAway') ?? '0');
  const stage = searchParams.get('stage') ?? 'GROUP STAGE';
  const matchDate = searchParams.get('matchDate') ?? '';
  const kickoffTime = searchParams.get('kickoffTime') ?? '';
  const referralCode = searchParams.get('referralCode') ?? '';
  const homePrimary = searchParams.get('homePrimary') ?? '#1a1a6e';
  const awayPrimary = searchParams.get('awayPrimary') ?? '#6e1a1a';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          background: `linear-gradient(175deg, ${homePrimary}cc 0%, #07080f 50%, ${awayPrimary}cc 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '90px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Dark overlay for readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}>
          {/* Stage + Date */}
          <div style={{
            fontSize: 30,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: 5,
            marginBottom: 80,
            textTransform: 'uppercase',
          }}>
            {`${stage} · ${matchDate}`}
          </div>

          {/* Teams row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 60,
          }}>
            {/* Home team */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              flex: 1,
            }}>
              <div style={{ fontSize: 140 }}>{homeFlag}</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', textAlign: 'center', letterSpacing: 2 }}>
                {homeTeam.toUpperCase()}
              </div>
            </div>

            {/* VS divider */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: 4 }}>VS</div>
            </div>

            {/* Away team */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              flex: 1,
            }}>
              <div style={{ fontSize: 140 }}>{awayFlag}</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', textAlign: 'center', letterSpacing: 2 }}>
                {awayTeam.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Kickoff time */}
          <div style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 80,
            letterSpacing: 3,
          }}>
            🕐 {kickoffTime}
          </div>

          {/* Prediction box */}
          <div style={{
            width: '100%',
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '48px 60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            marginBottom: 60,
          }}>
            <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.5)', letterSpacing: 5, textTransform: 'uppercase' }}>
              MY PREDICTION
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 40,
            }}>
              <div style={{ fontSize: 100, fontWeight: 900, color: '#fff' }}>{predictionHome}</div>
              <div style={{ fontSize: 56, color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>—</div>
              <div style={{ fontSize: 100, fontWeight: 900, color: '#fff' }}>{predictionAway}</div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              fontSize: 32,
              color: 'rgba(255,255,255,0.4)',
            }}>
              <span>{homeTeam}</span>
              <span>{awayTeam}</span>
            </div>
          </div>

          {/* Predicted by */}
          <div style={{ fontSize: 36, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
            Predicted by
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', letterSpacing: 2, marginBottom: 16 }}>
            {userName.toUpperCase()}
          </div>
          <div style={{ fontSize: 40, marginBottom: 'auto' }}>
            {`${userFlag} ${userCountry} Supporter`}
          </div>

          {/* Referral */}
          {referralCode && (
            <div style={{
              fontSize: 30,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: 3,
              marginBottom: 10,
            }}>
              {`ohmykick.com/${referralCode}`}
            </div>
          )}

          <div style={{
            width: '100%',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.2)', letterSpacing: 8 }}>
              OHMYKICK
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
