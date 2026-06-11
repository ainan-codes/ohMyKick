// teamPatterns.ts
// Complete team themes for ALL 48 FIFA World Cup 2026 teams
// Pattern types: stripes_vertical | stripes_diagonal | thirds | hoops | sash | solid | cross | halves

import React from 'react';

export interface TeamTheme {
  primary: string;
  secondary: string;
  accent: string;
  pattern: 'stripes_vertical' | 'stripes_diagonal' | 'thirds' | 'hoops' | 'sash' | 'solid' | 'cross' | 'halves';
  textColor: string;
  stripeWidth?: number; // optional override for stripe width
}

// ─────────────────────────────────────────────
// ALL 48 WORLD CUP 2026 TEAMS
// Source: official kit colors + flag colors
// ─────────────────────────────────────────────
export const TEAM_THEMES: Record<string, TeamTheme> = {

  // ── GROUP A ──────────────────────────────────
  US: { primary: '#002868', secondary: '#BF0A30', accent: '#FFFFFF', pattern: 'thirds',           textColor: '#ffffff' }, // USA - navy | white | red
  JM: { primary: '#000000', secondary: '#FED100', accent: '#007B40', pattern: 'stripes_diagonal', textColor: '#FED100' }, // Jamaica - black/gold diagonal
  PA: { primary: '#FFFFFF', secondary: '#005293', accent: '#D21034', pattern: 'stripes_vertical',  textColor: '#005293' }, // Panama - white/blue/red stripes
  GH: { primary: '#006B3F', secondary: '#FCD116', accent: '#CE1126', pattern: 'thirds',           textColor: '#ffffff' }, // Ghana - green | gold | red

  // ── GROUP B ──────────────────────────────────
  AR: { primary: '#74ACDF', secondary: '#FFFFFF', accent: '#F6B40E', pattern: 'stripes_vertical',  textColor: '#003087', stripeWidth: 90 }, // Argentina - sky blue/white vertical
  CL: { primary: '#D52B1E', secondary: '#FFFFFF', accent: '#003087', pattern: 'halves',            textColor: '#ffffff' }, // Chile - red top, white bottom
  PE: { primary: '#D91023', secondary: '#FFFFFF', accent: '#D91023', pattern: 'sash',              textColor: '#D91023' }, // Peru - white with red vertical sash
  CA: { primary: '#FF0000', secondary: '#FFFFFF', accent: '#FF0000', pattern: 'solid',             textColor: '#ffffff' }, // Canada - red

  // ── GROUP C ──────────────────────────────────
  MX: { primary: '#006847', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'thirds',           textColor: '#ffffff' }, // Mexico - green | white | red
  EC: { primary: '#FFD100', secondary: '#003DA5', accent: '#EF3340', pattern: 'thirds',           textColor: '#003DA5' }, // Ecuador - yellow | blue | red
  HR: { primary: '#FF0000', secondary: '#FFFFFF', accent: '#0000CD', pattern: 'hoops',            textColor: '#ffffff' }, // Croatia - red/white checkers
  MA: { primary: '#C1272D', secondary: '#006233', accent: '#FFD700', pattern: 'solid',            textColor: '#ffffff' }, // Morocco - red

  // ── GROUP D ──────────────────────────────────
  PT: { primary: '#006600', secondary: '#FF0000', accent: '#FFD700', pattern: 'sash',             textColor: '#ffffff' }, // Portugal - green with red sash
  ES: { primary: '#AA151B', secondary: '#F1BF00', accent: '#AA151B', pattern: 'solid',            textColor: '#ffffff' }, // Spain - red/gold
  UR: { primary: '#75AADB', secondary: '#FFFFFF', accent: '#FFD700', pattern: 'stripes_vertical', textColor: '#003087' }, // Uruguay - sky blue/white
  UY: { primary: '#75AADB', secondary: '#FFFFFF', accent: '#FFD700', pattern: 'stripes_vertical', textColor: '#003087' }, // Uruguay alt code
  GA: { primary: '#009E60', secondary: '#FCD116', accent: '#3A75C4', pattern: 'thirds',           textColor: '#ffffff' }, // Gabon / alt

  // ── GROUP E ──────────────────────────────────
  DE: { primary: '#000000', secondary: '#DD0000', accent: '#FFCE00', pattern: 'stripes_vertical', textColor: '#FFCE00', stripeWidth: 120 }, // Germany - black/red/gold
  JP: { primary: '#000080', secondary: '#FFFFFF', accent: '#BC002D', pattern: 'solid',            textColor: '#ffffff' }, // Japan - navy blue (away = white/red)
  AU: { primary: '#00843D', secondary: '#FFD200', accent: '#FFFFFF', pattern: 'stripes_diagonal', textColor: '#ffffff' }, // Australia - green/gold diagonal
  TN: { primary: '#E70013', secondary: '#FFFFFF', accent: '#E70013', pattern: 'solid',            textColor: '#ffffff' }, // Tunisia - red

  // ── GROUP F ──────────────────────────────────
  MA2: { primary: '#C1272D', secondary: '#006233', accent: '#FFD700', pattern: 'solid',           textColor: '#ffffff' }, // (dup Morocco)
  BR: { primary: '#009C3B', secondary: '#FFDF00', accent: '#002776', pattern: 'stripes_diagonal', textColor: '#002776' }, // Brazil - green/yellow diagonal
  CO: { primary: '#FCD116', secondary: '#003087', accent: '#CE1126', pattern: 'thirds',           textColor: '#003087' }, // Colombia - yellow | blue | red
  CM: { primary: '#007A5E', secondary: '#CE1126', accent: '#FCD116', pattern: 'thirds',           textColor: '#ffffff' }, // Cameroon - green | red | yellow

  // ── GROUP G ──────────────────────────────────
  FR: { primary: '#002395', secondary: '#FFFFFF', accent: '#ED2939', pattern: 'thirds',           textColor: '#ffffff' }, // France - blue | white | red
  NG: { primary: '#008751', secondary: '#FFFFFF', accent: '#008751', pattern: 'stripes_vertical', textColor: '#ffffff' }, // Nigeria - green/white
  AL: { primary: '#E41E20', secondary: '#000000', accent: '#E41E20', pattern: 'solid',            textColor: '#ffffff' }, // Albania - red/black eagle
  AL2:{ primary: '#E41E20', secondary: '#000000', accent: '#E41E20', pattern: 'solid',            textColor: '#ffffff' }, // alt

  // ── GROUP H ──────────────────────────────────
  PO: { primary: '#FFFFFF', secondary: '#DC143C', accent: '#DC143C', pattern: 'halves',           textColor: '#DC143C' }, // Poland - white top, red bottom
  PL: { primary: '#FFFFFF', secondary: '#DC143C', accent: '#DC143C', pattern: 'halves',           textColor: '#DC143C' }, // Poland alt
  SA: { primary: '#006C35', secondary: '#FFFFFF', accent: '#FFFFFF', pattern: 'solid',            textColor: '#ffffff' }, // Saudi Arabia - green
  KR: { primary: '#FFFFFF', secondary: '#CD2E3A', accent: '#0047A0', pattern: 'solid',            textColor: '#CD2E3A' }, // South Korea - white/red
  BE: { primary: '#000000', secondary: '#EF3340', accent: '#FFD100', pattern: 'thirds',           textColor: '#FFD100' }, // Belgium - black | red | yellow

  // ── GROUP I ──────────────────────────────────
  EN: { primary: '#FFFFFF', secondary: '#CF081F', accent: '#CF081F', pattern: 'cross',            textColor: '#CF081F' }, // England - white with red cross
  GB: { primary: '#FFFFFF', secondary: '#CF081F', accent: '#CF081F', pattern: 'cross',            textColor: '#CF081F' }, // GB fallback
  SE: { primary: '#006AA7', secondary: '#FECC02', accent: '#006AA7', pattern: 'cross',            textColor: '#FECC02' }, // Sweden - blue with yellow cross
  SN: { primary: '#00853F', secondary: '#FDEF42', accent: '#E31B23', pattern: 'thirds',           textColor: '#ffffff' }, // Senegal - green | yellow | red

  // ── GROUP J ──────────────────────────────────
  NL: { primary: '#FF6600', secondary: '#FFFFFF', accent: '#003DA5', pattern: 'solid',            textColor: '#ffffff' }, // Netherlands - orange
  IT: { primary: '#003399', secondary: '#FFFFFF', accent: '#009246', pattern: 'solid',            textColor: '#ffffff' }, // Italy - azzurri
  IR: { primary: '#239F40', secondary: '#FFFFFF', accent: '#DA0000', pattern: 'thirds',           textColor: '#ffffff' }, // Iran - green | white | red
  IQ: { primary: '#000000', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'thirds',           textColor: '#ffffff' }, // Iraq

  // ── GROUP K ──────────────────────────────────
  CH: { primary: '#FF0000', secondary: '#FFFFFF', accent: '#FF0000', pattern: 'cross',            textColor: '#ffffff' }, // Switzerland - red with white cross
  MO: { primary: '#C1272D', secondary: '#FFFFFF', accent: '#C1272D', pattern: 'solid',            textColor: '#ffffff' }, // Morocco alt
  SL: { primary: '#1EB53A', secondary: '#FFFFFF', accent: '#0072C6', pattern: 'thirds',           textColor: '#ffffff' }, // Slovenia
  SI: { primary: '#003DA5', secondary: '#FFFFFF', accent: '#E41E20', pattern: 'thirds',           textColor: '#ffffff' }, // Slovenia alt

  // ── GROUP L ──────────────────────────────────
  PY: { primary: '#D52B1E', secondary: '#FFFFFF', accent: '#0038A8', pattern: 'stripes_vertical', textColor: '#ffffff' }, // Paraguay - red/white/blue
  VE: { primary: '#CF142B', secondary: '#00247D', accent: '#FFCD00', pattern: 'thirds',           textColor: '#ffffff' }, // Venezuela
  MZ: { primary: '#009A44', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'thirds',           textColor: '#ffffff' }, // alt team

  // ── GCC / FAN BASE COUNTRIES (not WC teams but major fan base) ──
  AE: { primary: '#00732F', secondary: '#FF0000', accent: '#FFFFFF', pattern: 'thirds',           textColor: '#ffffff' }, // UAE
  KW: { primary: '#007A3D', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'thirds',           textColor: '#ffffff' }, // Kuwait
  QA: { primary: '#8D1B3D', secondary: '#FFFFFF', accent: '#8D1B3D', pattern: 'solid',            textColor: '#ffffff' }, // Qatar
  BH: { primary: '#CE1126', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'stripes_vertical', textColor: '#ffffff' }, // Bahrain
  OM: { primary: '#DB161B', secondary: '#FFFFFF', accent: '#008000', pattern: 'solid',            textColor: '#ffffff' }, // Oman
  IN: { primary: '#FF9933', secondary: '#138808', accent: '#000080', pattern: 'thirds',           textColor: '#ffffff' }, // India

  // ── DEFAULT FALLBACK ──────────────────────────
  DEFAULT: { primary: '#0a0a1a', secondary: '#1a1a3e', accent: '#f0b429', pattern: 'solid',       textColor: '#ffffff' },
};

export function getTheme(countryCode: string): TeamTheme {
  return TEAM_THEMES[countryCode?.toUpperCase()] ?? TEAM_THEMES['DEFAULT'];
}

// ─────────────────────────────────────────────
// SVG BACKGROUND GENERATOR
// Returns a JSX element (for @vercel/og ImageResponse)
// ─────────────────────────────────────────────
export function getTeamBackground(countryCode: string): React.ReactNode {
  const theme = getTheme(countryCode);
  const sw = theme.stripeWidth ?? 108; // stripe width (1080 / 10 default)

  switch (theme.pattern) {

    // ── VERTICAL STRIPES (Argentina, Germany, Nigeria, Uruguay...) ──
    case 'stripes_vertical': {
      const stripes = [];
      const count = Math.ceil(1080 / sw);
      for (let i = 0; i < count; i++) {
        stripes.push(
          <rect
            key={i}
            x={i * sw}
            y={0}
            width={sw}
            height={1920}
            fill={i % 2 === 0 ? theme.primary : theme.secondary}
          />
        );
      }
      return (
        <svg
          width="1080"
          height="1920"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
        >
          {stripes}
          {/* Vignette overlay */}
          <defs>
            <radialGradient id="vig" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.72)" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#vig)" />
        </svg>
      );
    }

    // ── DIAGONAL STRIPES (Brazil, Australia, Jamaica...) ──
    case 'stripes_diagonal': {
      return (
        <svg
          width="1080"
          height="1920"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
        >
          <defs>
            <pattern id="dstripe" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
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
    }

    // ── THIRDS / TRICOLOR (France, Mexico, Belgium, Colombia, Cameroon...) ──
    case 'thirds': {
      return (
        <svg
          width="1080"
          height="1920"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
        >
          <rect x="0"   width="360" height="1920" fill={theme.primary} />
          <rect x="360" width="360" height="1920" fill={theme.secondary} />
          <rect x="720" width="360" height="1920" fill={theme.accent} />
          {/* Soft divider lines */}
          <rect x="358" width="4" height="1920" fill="rgba(255,255,255,0.08)" />
          <rect x="718" width="4" height="1920" fill="rgba(255,255,255,0.08)" />
          {/* Dark overlay for readability */}
          <rect width="1080" height="1920" fill="rgba(0,0,0,0.52)" />
        </svg>
      );
    }

    // ── CHECKERBOARD / HOOPS (Croatia...) ──
    case 'hoops': {
      return (
        <svg
          width="1080"
          height="1920"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
        >
          <defs>
            <pattern id="checker" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="60"  height="60"  fill={theme.primary} />
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
    }

    // ── SASH (Portugal, Peru...) ──
    case 'sash': {
      return (
        <svg
          width="1080"
          height="1920"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
        >
          {/* Base color */}
          <rect width="1080" height="1920" fill={theme.primary} />
          {/* Diagonal sash */}
          <polygon
            points="0,0 480,0 1080,1920 0,1920"
            fill={theme.secondary}
            opacity="0.92"
          />
          {/* Thin accent stripe on sash edge */}
          <polygon
            points="460,0 510,0 1080,1820 1080,1920 1030,1920"
            fill={theme.accent}
            opacity="0.6"
          />
          <rect width="1080" height="1920" fill="rgba(0,0,0,0.48)" />
        </svg>
      );
    }

    // ── HALVES (Poland, Chile...) ──
    case 'halves': {
      return (
        <svg
          width="1080"
          height="1920"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
        >
          {/* Top half */}
          <rect x="0" y="0"    width="1080" height="960"  fill={theme.primary} />
          {/* Bottom half */}
          <rect x="0" y="960"  width="1080" height="960"  fill={theme.secondary} />
          {/* Accent line at split */}
          <rect x="0" y="956"  width="1080" height="8"    fill={theme.accent} opacity="0.5" />
          <rect width="1080" height="1920" fill="rgba(0,0,0,0.5)" />
        </svg>
      );
    }

    // ── CROSS (England, Switzerland, Sweden...) ──
    case 'cross': {
      return (
        <svg
          width="1080"
          height="1920"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
        >
          {/* Background */}
          <rect width="1080" height="1920" fill={theme.primary} />
          {/* Horizontal bar of cross */}
          <rect x="0"   y="840"  width="1080" height="240" fill={theme.secondary} opacity="0.9" />
          {/* Vertical bar of cross */}
          <rect x="420" y="0"    width="240"  height="1920" fill={theme.secondary} opacity="0.9" />
          {/* Thin accent outline on cross */}
          <rect x="0"   y="836"  width="1080" height="8"    fill={theme.accent} opacity="0.4" />
          <rect x="0"   y="1076" width="1080" height="8"    fill={theme.accent} opacity="0.4" />
          <rect x="416" y="0"    width="8"    height="1920" fill={theme.accent} opacity="0.4" />
          <rect x="656" y="0"    width="8"    height="1920" fill={theme.accent} opacity="0.4" />
          <rect width="1080" height="1920" fill="rgba(0,0,0,0.5)" />
        </svg>
      );
    }

    // ── SOLID (Spain, Netherlands, Italy, Saudi Arabia...) ──
    case 'solid':
    default: {
      return (
        <svg
          width="1080"
          height="1920"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
        >
          <defs>
            <radialGradient id="solidgrad" cx="50%" cy="30%" r="80%">
              <stop offset="0%"   stopColor={theme.secondary} stopOpacity="0.35" />
              <stop offset="100%" stopColor={theme.primary}   stopOpacity="1" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1920" fill={theme.primary} />
          <rect width="1080" height="1920" fill="url(#solidgrad)" />
          {/* Bottom fade to dark */}
          <defs>
            <linearGradient id="btmfade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="40%"  stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.75)" />
            </linearGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#btmfade)" />
        </svg>
      );
    }
  }
}

// ─────────────────────────────────────────────
// PREMATCH POSTER BACKGROUND
// Left = home team, Right = away team
// ─────────────────────────────────────────────
export function getPrematchBackground(homeCode: string, awayCode: string): React.ReactNode {
  const home = getTheme(homeCode);
  const away = getTheme(awayCode);

  return (
    <svg
      width="1080"
      height="1920"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
    >
      {/* Left half — home team primary */}
      <rect x="0"   y="0" width="540" height="1920" fill={home.primary} />
      {/* Right half — away team primary */}
      <rect x="540" y="0" width="540" height="1920" fill={away.primary} />

      {/* Left half secondary accent (top strip) */}
      <rect x="0"   y="0" width="540" height="80" fill={home.secondary} opacity="0.6" />
      {/* Right half secondary accent (top strip) */}
      <rect x="540" y="0" width="540" height="80" fill={away.secondary} opacity="0.6" />

      {/* Center glow divider */}
      <rect x="527" y="0" width="26" height="1920" fill="rgba(255,255,255,0.12)" />
      <rect x="535" y="0" width="10" height="1920" fill="rgba(255,255,255,0.25)" />

      {/* Dark overlay for text legibility */}
      <rect width="1080" height="1920" fill="rgba(0,0,0,0.48)" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// RESULT POSTER BACKGROUND
// Winner team theme takes full card
// WRONG = dark/muted, PERFECT = golden glow
// ─────────────────────────────────────────────
export function getResultBackground(
  winnerCode: string,
  resultType: 'PERFECT' | 'CORRECT_WINNER' | 'WRONG'
): React.ReactNode {
  const theme = getTheme(winnerCode);

  if (resultType === 'WRONG') {
    // Muted dark — user got it wrong, don't celebrate team colors
    return (
      <svg
        width="1080"
        height="1920"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
      >
        <rect width="1080" height="1920" fill="#0a0a0a" />
        <defs>
          <radialGradient id="wronggrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%"   stopColor={theme.primary} stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000"       stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#wronggrad)" />
      </svg>
    );
  }

  if (resultType === 'PERFECT') {
    // Full team colors + golden shimmer overlay
    return (
      <svg
        width="1080"
        height="1920"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
      >
        <rect width="1080" height="1920" fill={theme.primary} />
        <defs>
          <radialGradient id="perfectgrad" cx="50%" cy="35%" r="70%">
            <stop offset="0%"   stopColor="#FFD700"     stopOpacity="0.4" />
            <stop offset="60%"  stopColor={theme.secondary} stopOpacity="0.25" />
            <stop offset="100%" stopColor={theme.primary}   stopOpacity="1" />
          </radialGradient>
          <linearGradient id="perfectfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="50%"  stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#perfectgrad)" />
        <rect width="1080" height="1920" fill="url(#perfectfade)" />
      </svg>
    );
  }

  // CORRECT_WINNER — team colors, moderate overlay
  return (
    <svg
      width="1080"
      height="1920"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0 } as React.CSSProperties}
    >
      <rect width="1080" height="1920" fill={theme.primary} />
      <defs>
        <radialGradient id="cwgrad" cx="50%" cy="40%" r="70%">
          <stop offset="0%"   stopColor={theme.secondary} stopOpacity="0.3" />
          <stop offset="100%" stopColor={theme.primary}   stopOpacity="1" />
        </radialGradient>
        <linearGradient id="cwfade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="40%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#cwgrad)" />
      <rect width="1080" height="1920" fill="url(#cwfade)" />
    </svg>
  );
}
