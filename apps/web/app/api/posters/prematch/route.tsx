import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTeamBackground } from '../teamPatterns';

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
  const homeCode = searchParams.get('homeCountryCode') ?? '';
  const awayCode = searchParams.get('awayCountryCode') ?? '';

  const homePrimaryColor = homePrimary;
  const homeSecondaryColor = '#FFFFFF'; // or custom secondary
  const awayPrimaryColor = awayPrimary;
  const awaySecondaryColor = '#FFFFFF';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          backgroundColor: '#07080f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 540, height: 1080, display: 'flex' }}>
          {getTeamBackground(homeCode, 'left', homePrimary, '#FFFFFF')}
        </div>

        {/* Right Background */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 540, height: 1080, display: 'flex' }}>
          {getTeamBackground(awayCode, 'right', awayPrimary, '#FFFFFF')}
        </div>

        {/* Dark overlay over the upper flag section */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1080,
          background: 'linear-gradient(180deg, rgba(7, 8, 15, 0.4) 0%, rgba(7, 8, 15, 0.85) 100%)',
          display: 'flex',
        }} />

        {/* Bottom solid dark background for prediction details */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 840,
          backgroundColor: '#07080f',
          display: 'flex',
        }} />

        {/* Divider line between flag area and prediction details */}
        <div style={{
          position: 'absolute',
          top: 1080,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, #1a1a6e, #ef4444)',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '90px 80px',
        }}>
          {/* Mock label at top left */}
          <div style={{
            position: 'absolute',
            top: 90,
            left: 80,
            border: '2px solid #1e3a8a',
            borderRadius: '8px',
            padding: '4px 12px',
            color: '#3b82f6',
            fontSize: 22,
            fontWeight: 'bold',
            letterSpacing: 2,
          }}>
            MOCK
          </div>

          {/* Header text */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 80,
          }}>
            <div style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: 8,
              textTransform: 'uppercase',
            }}>
              OH MY KICK
            </div>
            <div style={{
              fontSize: 20,
              color: '#555',
              letterSpacing: 4,
              marginTop: 10,
              textTransform: 'uppercase',
            }}>
              · PREDICTION CARD · WC 2026 ·
            </div>
          </div>

          {/* Teams / Jersey Area */}
          <div style={{
            display: 'flex',
            width: '100%',
            height: 600,
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            marginBottom: 80,
          }}>
            {/* Home Side */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 320,
            }}>
              {/* Home Pill */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: '6px 20px',
                borderRadius: 20,
                color: '#aaa',
                fontSize: 20,
                letterSpacing: 2,
                fontWeight: 'bold',
                marginBottom: 20,
              }}>
                HOME
              </div>
              
              {/* Flag inside rounded box */}
              <div style={{
                width: 130,
                height: 90,
                borderRadius: 16,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                marginBottom: 30,
                fontSize: 64,
              }}>
                {homeFlag}
              </div>

              {/* Jersey Badge */}
              <div style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                position: 'relative',
                boxShadow: '0 0 40px rgba(0,0,0,0.3)',
              }}>
                <svg width="110" height="120" viewBox="0 0 100 110" fill="none">
                  <path 
                    d="M50 0 C75 0 95 10 95 30 C95 65 70 100 50 110 C30 100 5 65 5 30 C5 10 25 0 50 0 Z" 
                    fill={homePrimaryColor} 
                  />
                  <path 
                    d="M20 15 C35 25 65 25 80 15 L85 28 C65 40 35 40 15 28 Z" 
                    fill="#ff4d4d" 
                  />
                </svg>
              </div>

              {/* Name */}
              <div style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#fff',
                marginTop: 30,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}>
                {homeTeam}
              </div>
            </div>

            {/* VS Badge in the center */}
            <div style={{
              position: 'absolute',
              left: 450,
              top: 250,
              width: 100,
              height: 100,
              borderRadius: '50%',
              backgroundColor: '#07080f',
              border: '4px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#aaa' }}>VS</span>
            </div>

            {/* Away Side */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 320,
            }}>
              {/* Away Pill */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: '6px 20px',
                borderRadius: 20,
                color: '#aaa',
                fontSize: 20,
                letterSpacing: 2,
                fontWeight: 'bold',
                marginBottom: 20,
              }}>
                AWAY
              </div>

              {/* Flag inside rounded box */}
              <div style={{
                width: 130,
                height: 90,
                borderRadius: 16,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                marginBottom: 30,
                fontSize: 64,
              }}>
                {awayFlag}
              </div>

              {/* Jersey Badge */}
              <div style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                position: 'relative',
                boxShadow: '0 0 40px rgba(0,0,0,0.3)',
              }}>
                <svg width="110" height="120" viewBox="0 0 100 110" fill="none">
                  <path 
                    d="M50 0 C75 0 95 10 95 30 C95 65 70 100 50 110 C30 100 5 65 5 30 C5 10 25 0 50 0 Z" 
                    fill={awayPrimaryColor} 
                  />
                  <path 
                    d="M20 15 C35 25 65 25 80 15 L85 28 C65 40 35 40 15 28 Z" 
                    fill="#333333" 
                  />
                </svg>
              </div>

              {/* Name */}
              <div style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#fff',
                marginTop: 30,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}>
                {awayTeam}
              </div>
            </div>
          </div>

          {/* MY PREDICTION TITLE */}
          <div style={{
            fontSize: 22,
            color: '#555',
            letterSpacing: 4,
            marginBottom: 20,
            textTransform: 'uppercase',
            fontWeight: 'bold',
          }}>
            MY PREDICTION
          </div>

          {/* Predict Score (Green/Red and Gold palette) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 130, fontWeight: 900, color: '#ff4d4d' }}>{predictionHome}</span>
            <span style={{ fontSize: 90, fontWeight: 300, color: '#333' }}>-</span>
            <span style={{ fontSize: 130, fontWeight: 900, color: '#ffda79' }}>{predictionAway}</span>
          </div>

          {/* Team names small labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: 400,
            fontSize: 22,
            color: '#444',
            marginBottom: 44,
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: 1,
          }}>
            <span>{homeTeam}</span>
            <span>{awayTeam}</span>
          </div>

          {/* Prediction locked golden button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #f0b429',
            padding: '16px 60px',
            borderRadius: 40,
            color: '#f0b429',
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 2,
            marginBottom: 60,
          }}>
            🔒 PREDICTION LOCKED 🔒
          </div>

          {/* Predicted by footer */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 'auto',
          }}>
            <div style={{
              fontSize: 20,
              color: '#555',
              letterSpacing: 2,
              marginBottom: 10,
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}>
              PREDICTED BY
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 30,
            }}>
              <span style={{ fontSize: 44 }}>{userFlag}</span>
              <span style={{ fontSize: 56, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>
                {userName}
              </span>
            </div>

            {/* Recruit your nation */}
            <div style={{
              fontSize: 18,
              color: '#333',
              letterSpacing: 2,
              marginBottom: 6,
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}>
              RECRUIT YOUR NATION
            </div>
            <div style={{
              fontSize: 24,
              color: '#555',
              letterSpacing: 1,
              fontFamily: 'monospace',
            }}>
              {`ohmykick.com/${referralCode}`}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
}
