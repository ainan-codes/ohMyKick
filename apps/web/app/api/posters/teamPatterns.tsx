// apps/web/app/api/posters/teamPatterns.ts
// Complete team themes for ALL 48 FIFA World Cup 2026 teams
// Pattern types: stripes_vertical | stripes_diagonal | thirds | hoops | sash | solid | cross | halves
// 5 Passport variants: V1 Elite | V2 Army | V3 Heritage | V4 Chrome | V5 Glory

import React from 'react';

export interface TeamTheme {
  primary: string;
  secondary: string;
  accent: string;
  pattern: 'stripes_vertical' | 'stripes_diagonal' | 'thirds' | 'hoops' | 'sash' | 'solid' | 'cross' | 'halves';
  textColor: string;
  stripeWidth?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL 48+ WORLD CUP 2026 TEAMS + FAN BASE COUNTRIES
// ─────────────────────────────────────────────────────────────────────────────
export const TEAM_THEMES: Record<string, TeamTheme> = {
  // ── AMERICAS ──────────────────────────────────────────────────────────────
  AR: { primary: '#74ACDF', secondary: '#FFFFFF', accent: '#F6B40E', pattern: 'stripes_vertical',  textColor: '#003087', stripeWidth: 90  },
  BR: { primary: '#009C3B', secondary: '#FFDF00', accent: '#002776', pattern: 'stripes_diagonal',  textColor: '#002776'                  },
  MX: { primary: '#006847', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'thirds',            textColor: '#ffffff'                  },
  US: { primary: '#002868', secondary: '#FFFFFF', accent: '#BF0A30', pattern: 'thirds',            textColor: '#ffffff'                  },
  CA: { primary: '#FF0000', secondary: '#FFFFFF', accent: '#FF0000', pattern: 'solid',             textColor: '#ffffff'                  },
  CO: { primary: '#FCD116', secondary: '#003087', accent: '#CE1126', pattern: 'thirds',            textColor: '#003087'                  },
  EC: { primary: '#FFD100', secondary: '#003DA5', accent: '#EF3340', pattern: 'thirds',            textColor: '#003DA5'                  },
  UY: { primary: '#75AADB', secondary: '#FFFFFF', accent: '#FFD700', pattern: 'stripes_vertical',  textColor: '#003087', stripeWidth: 90  },
  UR: { primary: '#75AADB', secondary: '#FFFFFF', accent: '#FFD700', pattern: 'stripes_vertical',  textColor: '#003087', stripeWidth: 90  },
  CL: { primary: '#D52B1E', secondary: '#FFFFFF', accent: '#003087', pattern: 'halves',            textColor: '#ffffff'                  },
  PE: { primary: '#FFFFFF', secondary: '#D91023', accent: '#D91023', pattern: 'sash',              textColor: '#D91023'                  },
  PY: { primary: '#D52B1E', secondary: '#FFFFFF', accent: '#0038A8', pattern: 'stripes_vertical',  textColor: '#ffffff', stripeWidth: 120 },
  VE: { primary: '#CF142B', secondary: '#003DA5', accent: '#FFCD00', pattern: 'thirds',            textColor: '#ffffff'                  },
  PA: { primary: '#FFFFFF', secondary: '#005293', accent: '#D21034', pattern: 'stripes_vertical',  textColor: '#005293', stripeWidth: 120 },
  JM: { primary: '#000000', secondary: '#FED100', accent: '#007B40', pattern: 'stripes_diagonal',  textColor: '#FED100'                  },
  CR: { primary: '#002B7F', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'thirds',            textColor: '#ffffff'                  },

  // ── EUROPE ────────────────────────────────────────────────────────────────
  FR: { primary: '#002395', secondary: '#FFFFFF', accent: '#ED2939', pattern: 'thirds',            textColor: '#ffffff'                  },
  DE: { primary: '#000000', secondary: '#DD0000', accent: '#FFCE00', pattern: 'stripes_vertical',  textColor: '#FFCE00', stripeWidth: 120 },
  ES: { primary: '#AA151B', secondary: '#F1BF00', accent: '#F1BF00', pattern: 'solid',             textColor: '#ffffff'                  },
  PT: { primary: '#006600', secondary: '#FF0000', accent: '#FFD700', pattern: 'sash',              textColor: '#ffffff'                  },
  EN: { primary: '#FFFFFF', secondary: '#CF081F', accent: '#CF081F', pattern: 'cross',             textColor: '#CF081F'                  },
  GB: { primary: '#FFFFFF', secondary: '#CF081F', accent: '#CF081F', pattern: 'cross',             textColor: '#CF081F'                  },
  NL: { primary: '#FF6600', secondary: '#FFFFFF', accent: '#003DA5', pattern: 'solid',             textColor: '#ffffff'                  },
  IT: { primary: '#003399', secondary: '#FFFFFF', accent: '#009246', pattern: 'solid',             textColor: '#ffffff'                  },
  BE: { primary: '#000000', secondary: '#EF3340', accent: '#FFD100', pattern: 'thirds',            textColor: '#FFD100'                  },
  HR: { primary: '#FF0000', secondary: '#FFFFFF', accent: '#0000CD', pattern: 'hoops',             textColor: '#ffffff'                  },
  PL: { primary: '#FFFFFF', secondary: '#DC143C', accent: '#DC143C', pattern: 'halves',            textColor: '#DC143C'                  },
  PO: { primary: '#FFFFFF', secondary: '#DC143C', accent: '#DC143C', pattern: 'halves',            textColor: '#DC143C'                  },
  CH: { primary: '#FF0000', secondary: '#FFFFFF', accent: '#FFFFFF', pattern: 'cross',             textColor: '#ffffff'                  },
  SE: { primary: '#006AA7', secondary: '#FECC02', accent: '#FECC02', pattern: 'cross',             textColor: '#FECC02'                  },
  DK: { primary: '#C60C30', secondary: '#FFFFFF', accent: '#FFFFFF', pattern: 'cross',             textColor: '#ffffff'                  },
  NO: { primary: '#EF2B2D', secondary: '#FFFFFF', accent: '#002868', pattern: 'cross',             textColor: '#ffffff'                  },
  AT: { primary: '#ED2939', secondary: '#FFFFFF', accent: '#ED2939', pattern: 'stripes_vertical',  textColor: '#ffffff', stripeWidth: 120 },
  CZ: { primary: '#D7141A', secondary: '#FFFFFF', accent: '#11457E', pattern: 'halves',            textColor: '#ffffff'                  },
  HU: { primary: '#CE2939', secondary: '#FFFFFF', accent: '#477050', pattern: 'stripes_vertical',  textColor: '#ffffff', stripeWidth: 120 },
  RS: { primary: '#C6363C', secondary: '#0C4076', accent: '#FFFFFF', pattern: 'stripes_vertical',  textColor: '#ffffff', stripeWidth: 120 },
  UA: { primary: '#005BBB', secondary: '#FFD500', accent: '#FFD500', pattern: 'halves',            textColor: '#005BBB'                  },
  GR: { primary: '#0D5EAF', secondary: '#FFFFFF', accent: '#0D5EAF', pattern: 'cross',             textColor: '#ffffff'                  },
  TR: { primary: '#E30A17', secondary: '#FFFFFF', accent: '#E30A17', pattern: 'solid',             textColor: '#ffffff'                  },
  AL: { primary: '#E41E20', secondary: '#000000', accent: '#E41E20', pattern: 'solid',             textColor: '#ffffff'                  },
  SI: { primary: '#003DA5', secondary: '#FFFFFF', accent: '#E41E20', pattern: 'thirds',            textColor: '#ffffff'                  },
  GE: { primary: '#FFFFFF', secondary: '#FF0000', accent: '#FF0000', pattern: 'cross',             textColor: '#FF0000'                  },

  // ── AFRICA ────────────────────────────────────────────────────────────────
  MA: { primary: '#C1272D', secondary: '#006233', accent: '#FFD700', pattern: 'solid',             textColor: '#ffffff'                  },
  SN: { primary: '#00853F', secondary: '#FDEF42', accent: '#E31B23', pattern: 'thirds',            textColor: '#ffffff'                  },
  NG: { primary: '#008751', secondary: '#FFFFFF', accent: '#008751', pattern: 'stripes_vertical',  textColor: '#ffffff', stripeWidth: 90  },
  CM: { primary: '#007A5E', secondary: '#CE1126', accent: '#FCD116', pattern: 'thirds',            textColor: '#ffffff'                  },
  GH: { primary: '#006B3F', secondary: '#FCD116', accent: '#CE1126', pattern: 'thirds',            textColor: '#ffffff'                  },
  EG: { primary: '#CE1126', secondary: '#FFFFFF', accent: '#000000', pattern: 'stripes_vertical',  textColor: '#ffffff', stripeWidth: 120 },
  TN: { primary: '#E70013', secondary: '#FFFFFF', accent: '#E70013', pattern: 'solid',             textColor: '#ffffff'                  },
  ZA: { primary: '#007A4D', secondary: '#FFB81C', accent: '#DE3831', pattern: 'solid',             textColor: '#ffffff'                  },
  GA: { primary: '#009E60', secondary: '#FCD116', accent: '#3A75C4', pattern: 'thirds',            textColor: '#ffffff'                  },

  // ── ASIA / MIDDLE EAST ───────────────────────────────────────────────────
  JP: { primary: '#000080', secondary: '#FFFFFF', accent: '#BC002D', pattern: 'solid',             textColor: '#ffffff'                  },
  KR: { primary: '#FFFFFF', secondary: '#CD2E3A', accent: '#0047A0', pattern: 'solid',             textColor: '#CD2E3A'                  },
  IR: { primary: '#239F40', secondary: '#FFFFFF', accent: '#DA0000', pattern: 'thirds',            textColor: '#ffffff'                  },
  SA: { primary: '#006C35', secondary: '#FFFFFF', accent: '#FFFFFF', pattern: 'solid',             textColor: '#ffffff'                  },
  AU: { primary: '#00843D', secondary: '#FFD200', accent: '#FFFFFF', pattern: 'stripes_diagonal',  textColor: '#ffffff'                  },
  QA: { primary: '#8D1B3D', secondary: '#FFFFFF', accent: '#8D1B3D', pattern: 'solid',             textColor: '#ffffff'                  },
  IQ: { primary: '#000000', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'thirds',            textColor: '#ffffff'                  },
  IN: { primary: '#FF9933', secondary: '#FFFFFF', accent: '#138808', pattern: 'thirds',            textColor: '#ffffff'                  },
  CN: { primary: '#DE2910', secondary: '#FFDE00', accent: '#DE2910', pattern: 'solid',             textColor: '#ffffff'                  },

  // ── GCC FAN BASE ─────────────────────────────────────────────────────────
  AE: { primary: '#00732F', secondary: '#FF0000', accent: '#FFFFFF', pattern: 'thirds',            textColor: '#ffffff'                  },
  KW: { primary: '#007A3D', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'thirds',            textColor: '#ffffff'                  },
  BH: { primary: '#CE1126', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'stripes_vertical',  textColor: '#ffffff', stripeWidth: 120 },
  OM: { primary: '#DB161B', secondary: '#FFFFFF', accent: '#008000', pattern: 'solid',             textColor: '#ffffff'                  },

  // ── FALLBACK ──────────────────────────────────────────────────────────────
  DEFAULT: { primary: '#0a0a1a', secondary: '#1a1a3e', accent: '#f0b429', pattern: 'solid',        textColor: '#ffffff'                  },
};

export function getTheme(countryCode: string): TeamTheme {
  return TEAM_THEMES[countryCode?.toUpperCase()] ?? TEAM_THEMES['DEFAULT'];
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC TEAM BACKGROUND — used for passport V1/single-team contexts
// ─────────────────────────────────────────────────────────────────────────────
export function getTeamBackground(countryCode: string): React.ReactNode {
  const theme = getTheme(countryCode);
  const sw = theme.stripeWidth ?? 108;

  switch (theme.pattern) {
    case 'stripes_vertical': {
      const count = Math.ceil(1080 / sw);
      const stripes = Array.from({ length: count }, (_, i) => (
        React.createElement('rect', {
          key: i, x: i * sw, y: 0, width: sw, height: 1920,
          fill: i % 2 === 0 ? theme.primary : theme.secondary,
        })
      ));
      return React.createElement('svg', {
        width: 1080, height: 1920, xmlns: 'http://www.w3.org/2000/svg',
        style: { position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties,
      },
        ...stripes,
        React.createElement('defs', null,
          React.createElement('radialGradient', { id: 'vig', cx: '50%', cy: '50%', r: '75%' },
            React.createElement('stop', { offset: '0%', stopColor: 'rgba(0,0,0,0)' }),
            React.createElement('stop', { offset: '100%', stopColor: 'rgba(0,0,0,0.72)' }),
          )
        ),
        React.createElement('rect', { width: 1080, height: 1920, fill: 'url(#vig)' })
      );
    }

    case 'stripes_diagonal':
      return (
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
          <defs>
            <pattern id="dstripe" x="0" y="0" width="200" height="200"
              patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="100" height="200" fill={theme.primary} />
              <rect x="100" width="100" height="200" fill={theme.secondary} />
            </pattern>
            <radialGradient id="vig2" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.68)" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#dstripe)" opacity="0.95" />
          <rect width="1080" height="1920" fill="url(#vig2)" />
        </svg>
      );

    case 'thirds':
      return (
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
          <rect x="0"   width="360" height="1920" fill={theme.primary} />
          <rect x="360" width="360" height="1920" fill={theme.secondary} />
          <rect x="720" width="360" height="1920" fill={theme.accent} />
          <rect x="358" width="4" height="1920" fill="rgba(255,255,255,0.08)" />
          <rect x="718" width="4" height="1920" fill="rgba(255,255,255,0.08)" />
          <rect width="1080" height="1920" fill="rgba(0,0,0,0.52)" />
        </svg>
      );

    case 'hoops':
      return (
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
          <defs>
            <pattern id="checker" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill={theme.primary} />
              <rect x="60" width="60" height="60" fill={theme.secondary} />
              <rect y="60" width="60" height="60" fill={theme.secondary} />
              <rect x="60" y="60" width="60" height="60" fill={theme.primary} />
            </pattern>
            <radialGradient id="vig3" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#checker)" opacity="0.88" />
          <rect width="1080" height="1920" fill="url(#vig3)" />
        </svg>
      );

    case 'sash':
      return (
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
          <rect width="1080" height="1920" fill={theme.primary} />
          <polygon points="0,0 480,0 1080,1920 0,1920" fill={theme.secondary} opacity="0.92" />
          <polygon points="460,0 510,0 1080,1820 1080,1920 1030,1920" fill={theme.accent} opacity="0.6" />
          <rect width="1080" height="1920" fill="rgba(0,0,0,0.48)" />
        </svg>
      );

    case 'halves':
      return (
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
          <rect x="0" y="0"   width="1080" height="960" fill={theme.primary} />
          <rect x="0" y="960" width="1080" height="960" fill={theme.secondary} />
          <rect x="0" y="956" width="1080" height="8"   fill={theme.accent} opacity="0.5" />
          <rect width="1080" height="1920" fill="rgba(0,0,0,0.5)" />
        </svg>
      );

    case 'cross':
      return (
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
          <rect width="1080" height="1920" fill={theme.primary} />
          <rect x="0"   y="840"  width="1080" height="240" fill={theme.secondary} opacity="0.9" />
          <rect x="420" y="0"    width="240"  height="1920" fill={theme.secondary} opacity="0.9" />
          <rect x="0"   y="836"  width="1080" height="8"   fill={theme.accent} opacity="0.4" />
          <rect x="0"   y="1076" width="1080" height="8"   fill={theme.accent} opacity="0.4" />
          <rect x="416" y="0"    width="8"    height="1920" fill={theme.accent} opacity="0.4" />
          <rect x="656" y="0"    width="8"    height="1920" fill={theme.accent} opacity="0.4" />
          <rect width="1080" height="1920" fill="rgba(0,0,0,0.5)" />
        </svg>
      );

    case 'solid':
    default:
      return (
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
          <defs>
            <radialGradient id="solidgrad" cx="50%" cy="30%" r="80%">
              <stop offset="0%"   stopColor={theme.secondary} stopOpacity="0.35" />
              <stop offset="100%" stopColor={theme.primary}   stopOpacity="1" />
            </radialGradient>
            <linearGradient id="btmfade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="40%"  stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.75)" />
            </linearGradient>
          </defs>
          <rect width="1080" height="1920" fill={theme.primary} />
          <rect width="1080" height="1920" fill="url(#solidgrad)" />
          <rect width="1080" height="1920" fill="url(#btmfade)" />
        </svg>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSPORT BACKGROUND — 5 variants
// V1 ELITE    — dark card, subtle flag watermark circle, team color accents
// V2 ARMY     — team color fill, large diagonal "FAN ARMY" watermark text
// V3 HERITAGE — hard left/right color split, flag at center (FLAGSHIP)
// V4 CHROME   — dark/charcoal base, team colors as glowing accent ring only
// V5 GLORY    — deep team color, gold border frame, stars, premium feel
// ─────────────────────────────────────────────────────────────────────────────
export function getPassportBackground(
  countryCode: string,
  variant: 'V1' | 'V2' | 'V3' | 'V4' | 'V5' = 'V3'
): React.ReactNode {
  const theme = getTheme(countryCode);
  const sw = theme.stripeWidth ?? 108;

  switch (variant) {
    // ── V1 ELITE — dark card, subtle team color radial, flag circle watermark
    case 'V1': return (
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
        <defs>
          <radialGradient id="v1bg" cx="50%" cy="35%" r="65%">
            <stop offset="0%"   stopColor={theme.primary}   stopOpacity="0.35" />
            <stop offset="100%" stopColor="#050510"          stopOpacity="1" />
          </radialGradient>
          <radialGradient id="v1flag" cx="50%" cy="38%" r="22%">
            <stop offset="0%"   stopColor={theme.secondary} stopOpacity="0.12" />
            <stop offset="100%" stopColor={theme.secondary} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="v1fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="60%"  stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="#050510" />
        <rect width="1080" height="1920" fill="url(#v1bg)" />
        <circle cx="540" cy="680" r="300" fill="url(#v1flag)" />
        <rect x="0" y="0"    width="1080" height="6" fill={theme.primary} opacity="0.8" />
        <rect x="0" y="6"    width="1080" height="3" fill={theme.accent}  opacity="0.5" />
        <rect x="0" y="1911" width="1080" height="6" fill={theme.primary} opacity="0.8" />
        <rect x="0" y="1908" width="1080" height="3" fill={theme.accent}  opacity="0.5" />
        <rect width="1080" height="1920" fill="url(#v1fade)" />
      </svg>
    );

    // ── V2 ARMY — full team color, large diagonal "FAN ARMY" watermark text
    case 'V2': {
      const count = Math.ceil(1080 / sw);
      const isStripe = theme.pattern === 'stripes_vertical' || theme.pattern === 'stripes_diagonal';
      return (
        <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
          <defs>
            {theme.pattern === 'stripes_diagonal' && (
              <pattern id="v2ds" x="0" y="0" width="200" height="200"
                patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="100" height="200" fill={theme.primary} />
                <rect x="100" width="100" height="200" fill={theme.secondary} />
              </pattern>
            )}
            <linearGradient id="v2fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="50%"  stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.80)" />
            </linearGradient>
          </defs>
          {theme.pattern === 'stripes_diagonal'
            ? <rect width="1080" height="1920" fill="url(#v2ds)" />
            : isStripe
              ? Array.from({ length: count }, (_, i) => (
                  <rect key={i} x={i * sw} y={0} width={sw} height={1920}
                    fill={i % 2 === 0 ? theme.primary : theme.secondary} />
                ))
              : <rect width="1080" height="1920" fill={theme.primary} />
          }
          <rect width="1080" height="1920" fill="rgba(0,0,0,0.38)" />
          <text x="-200" y="1100" fontSize="280" fontWeight="900"
            fill={theme.secondary} fillOpacity="0.07"
            letterSpacing="30" transform="rotate(-30 540 960)">FAN ARMY</text>
          <rect width="1080" height="1920" fill="url(#v2fade)" />
          <rect x="0" y="1908" width="1080" height="12" fill={theme.accent} opacity="0.9" />
        </svg>
      );
    }

    // ── V3 HERITAGE — hard vertical split L=primary R=secondary (FLAGSHIP)
    case 'V3': return (
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
        <defs>
          <linearGradient id="v3fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="55%"  stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.90)" />
          </linearGradient>
        </defs>
        <rect x="0"   y="0" width="540" height="1920" fill={theme.primary} />
        <rect x="540" y="0" width="540" height="1920"
          fill={theme.secondary === '#FFFFFF' ? theme.accent : theme.secondary} />
        <rect x="537" y="0" width="6"   height="1920" fill="rgba(255,255,255,0.25)" />
        <circle cx="540" cy="650" r="165" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" />
        <circle cx="540" cy="650" r="175" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
        <rect width="1080" height="1920" fill="url(#v3fade)" />
        <rect x="0" y="0" width="1080" height="5" fill={theme.accent} opacity="0.8" />
      </svg>
    );

    // ── V4 CHROME — dark charcoal, glowing team color ring
    case 'V4': return (
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
        <defs>
          <radialGradient id="v4ring" cx="50%" cy="34%" r="20%">
            <stop offset="0%"   stopColor={theme.primary} stopOpacity="0.5" />
            <stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="v4bg" cx="50%" cy="0%" r="80%">
            <stop offset="0%"   stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#080808" />
          </radialGradient>
          <linearGradient id="v4fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="50%"  stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#v4bg)" />
        <circle cx="540" cy="650" r="320" fill="url(#v4ring)" />
        <circle cx="540" cy="650" r="180" fill="none" stroke={theme.primary} strokeWidth="4"  opacity="0.9" />
        <circle cx="540" cy="650" r="190" fill="none" stroke={theme.primary} strokeWidth="2"  opacity="0.4" />
        <circle cx="540" cy="650" r="200" fill="none" stroke={theme.primary} strokeWidth="1"  opacity="0.15" />
        <rect x="0" y="0" width="1080" height="4" fill={theme.primary}   opacity="1.0" />
        <rect x="0" y="4" width="1080" height="2" fill={theme.secondary} opacity="0.8" />
        <rect x="0" y="6" width="1080" height="2" fill={theme.accent}    opacity="0.6" />
        <rect x="0" y="1912" width="1080" height="4" fill={theme.primary}   opacity="1.0" />
        <rect x="0" y="1908" width="1080" height="4" fill={theme.secondary} opacity="0.6" />
        <rect width="1080" height="1920" fill="url(#v4fade)" />
      </svg>
    );

    // ── V5 GLORY — rich team color, gold rectangle frame, stars top and bottom
    case 'V5': return (
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
        <defs>
          <radialGradient id="v5bg" cx="50%" cy="30%" r="75%">
            <stop offset="0%"   stopColor={theme.secondary === '#FFFFFF' ? theme.primary : theme.secondary} stopOpacity="0.3" />
            <stop offset="100%" stopColor={theme.primary}   stopOpacity="1" />
          </radialGradient>
          <linearGradient id="v5fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="55%"  stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.88)" />
          </linearGradient>
          <pattern id="v5tex" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="transparent" />
            <circle cx="20" cy="20" r="1" fill={theme.accent} fillOpacity="0.08" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill={theme.primary} />
        <rect width="1080" height="1920" fill="url(#v5bg)"  />
        <rect width="1080" height="1920" fill="url(#v5tex)" />
        <rect x="30" y="30" width="1020" height="1860" fill="none"
          stroke={theme.accent} strokeWidth="4" rx="20" />
        <rect x="44" y="44" width="992" height="1832" fill="none"
          stroke={theme.accent} strokeWidth="1.5" rx="16" opacity="0.5" />
        <rect x="30"  y="30"   width="60" height="4" fill={theme.accent} />
        <rect x="990" y="30"   width="60" height="4" fill={theme.accent} />
        <rect x="30"  y="1886" width="60" height="4" fill={theme.accent} />
        <rect x="990" y="1886" width="60" height="4" fill={theme.accent} />
        <rect width="1080" height="1920" fill="url(#v5fade)" />
        <text x="480" y="100" fontSize="36" fill={theme.accent} textAnchor="middle">★ ★ ★</text>
        <text x="540" y="1870" fontSize="28" fill={theme.accent} textAnchor="middle" fillOpacity="0.7">★ ★ ★ ★ ★</text>
      </svg>
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO FRAME STYLE — glowing circle, variant-aware
// ─────────────────────────────────────────────────────────────────────────────
export function getPhotoFrameStyle(theme: TeamTheme, variant: string): React.CSSProperties {
  const base: React.CSSProperties = {
    width: 260, height: 260,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 44,
    position: 'relative',
  };

  switch (variant) {
    case 'V1': return { ...base,
      border: `4px solid ${theme.primary}`,
      boxShadow: `0 0 40px ${theme.primary}88, 0 0 80px ${theme.primary}33`,
      background: `linear-gradient(135deg, ${theme.primary}33, #0d0d0d)`,
    };
    case 'V2': return { ...base,
      border: `5px solid ${theme.accent}`,
      boxShadow: `0 0 30px ${theme.accent}66`,
      background: `linear-gradient(135deg, ${theme.primary}44, #000)`,
    };
    case 'V3': return { ...base,
      border: `6px solid rgba(255,255,255,0.9)`,
      boxShadow: `0 0 50px rgba(255,255,255,0.3), 0 0 100px ${theme.primary}44`,
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary === '#FFFFFF' ? theme.accent : theme.secondary})`,
    };
    case 'V4': return { ...base,
      border: `3px solid ${theme.primary}`,
      boxShadow: `0 0 60px ${theme.primary}99, 0 0 120px ${theme.primary}44`,
      background: '#111',
    };
    case 'V5': return { ...base,
      border: `4px solid ${theme.accent}`,
      boxShadow: `0 0 40px ${theme.accent}66, 0 0 80px ${theme.primary}44`,
      background: `linear-gradient(135deg, ${theme.primary}66, #0a0a0a)`,
    };
    default: return { ...base,
      border: `6px solid ${theme.accent}`,
      boxShadow: `0 0 60px ${theme.accent}44`,
      background: `linear-gradient(135deg, ${theme.primary}44, #0d0d0d)`,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PREMATCH BACKGROUND
// TOP HALF (0–960px)  = home team left | away team right (team colors)
// BOTTOM HALF (960–1920px) = pure black for prediction section
// ─────────────────────────────────────────────────────────────────────────────
export function getPrematchBackground(homeCode: string, awayCode: string): React.ReactNode {
  const home = getTheme(homeCode);
  const away = getTheme(awayCode);
  return (
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
      {/* TOP HALF — team colors */}
      <rect x="0"   y="0" width="540" height="960" fill={home.primary} />
      <rect x="540" y="0" width="540" height="960" fill={away.primary} />
      {/* Secondary color accent strips at very top */}
      <rect x="0"   y="0" width="540" height="70" fill={home.secondary} opacity="0.45" />
      <rect x="540" y="0" width="540" height="70" fill={away.secondary} opacity="0.45" />
      {/* Center divider glow */}
      <rect x="527" y="0" width="26" height="960" fill="rgba(255,255,255,0.10)" />
      <rect x="535" y="0" width="10" height="960" fill="rgba(255,255,255,0.22)" />
      {/* BOTTOM HALF — pure black */}
      <rect x="0" y="960" width="1080" height="960" fill="#080808" />
      {/* Divider accent line between halves — home color left, away color right */}
      <rect x="0"   y="954" width="540"  height="6" fill={home.accent} opacity="0.7" />
      <rect x="540" y="954" width="540"  height="6" fill={away.accent} opacity="0.7" />
      {/* Subtle dark overlay on top half for text legibility */}
      <rect x="0" y="0" width="1080" height="960" fill="rgba(0,0,0,0.35)" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULT BACKGROUND
// PERFECT       = team colors + golden shimmer glow
// CORRECT_WINNER = team colors, moderate overlay
// WRONG         = near-black, muted team color hint only
// ─────────────────────────────────────────────────────────────────────────────
export function getResultBackground(
  winnerCode: string,
  resultType: 'PERFECT' | 'CORRECT_WINNER' | 'WRONG'
): React.ReactNode {
  const theme = getTheme(winnerCode);

  if (resultType === 'WRONG') return (
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
      <defs>
        <radialGradient id="wrg" cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stopColor={theme.primary} stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000000"        stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="#080808" />
      <rect width="1080" height="1920" fill="url(#wrg)" />
      <rect x="0" y="0" width="1080" height="200" fill="rgba(180,0,0,0.08)" />
    </svg>
  );

  if (resultType === 'PERFECT') return (
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
      <defs>
        <radialGradient id="pfg" cx="50%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#FFD700"         stopOpacity="0.50" />
          <stop offset="40%"  stopColor={theme.secondary}  stopOpacity="0.20" />
          <stop offset="100%" stopColor={theme.primary}    stopOpacity="1" />
        </radialGradient>
        <linearGradient id="pff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="45%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.75)" />
        </linearGradient>
        <linearGradient id="pfsh" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,215,0,0)" />
          <stop offset="50%"  stopColor="rgba(255,215,0,0.15)" />
          <stop offset="100%" stopColor="rgba(255,215,0,0)" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill={theme.primary} />
      <rect width="1080" height="1920" fill="url(#pfg)" />
      <rect x="0" y="200" width="1080" height="3" fill="url(#pfsh)" />
      <rect x="0" y="400" width="1080" height="2" fill="url(#pfsh)" />
      <rect x="0" y="550" width="1080" height="2" fill="url(#pfsh)" />
      <rect width="1080" height="1920" fill="url(#pff)" />
    </svg>
  );

  // CORRECT_WINNER
  return (
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
      <defs>
        <radialGradient id="cwg" cx="50%" cy="35%" r="70%">
          <stop offset="0%"   stopColor={theme.secondary} stopOpacity="0.28" />
          <stop offset="100%" stopColor={theme.primary}   stopOpacity="1" />
        </radialGradient>
        <linearGradient id="cwf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="40%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.70)" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill={theme.primary} />
      <rect width="1080" height="1920" fill="url(#cwg)" />
      <rect width="1080" height="1920" fill="url(#cwf)" />
    </svg>
  );
}
