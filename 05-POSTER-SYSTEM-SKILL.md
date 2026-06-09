# SKILL: OhMyKick Poster System (COMPLETE + UPDATED)
# Covers teamPatterns.ts, all 3 poster routes, 5 passport variants, prematch black-split,
# result backgrounds, bot worker calls, test URLs, and common errors.

---

## WHAT THIS SKILL COVERS
- teamPatterns.ts — 50+ country themes + all SVG background generators
- passport/route.tsx — 5 card variants (V1 Elite, V2 Army, V3 Heritage, V4 Chrome, V5 Glory)
- prematch/route.tsx — team color top half + black bottom half
- result/route.tsx — PERFECT (gold glow) / CORRECT_WINNER / WRONG (dark)
- Bot worker: how to call all 3 poster APIs + upload to Supabase
- Test URLs for every variant
- Common errors + fixes

---

## CRITICAL RULES — READ BEFORE TOUCHING ANY FILE

1. **NEVER use CSS `background` shorthand in @vercel/og JSX** — use `background` only inside `style={{}}` as a string. Tailwind classes DO NOT work in ImageResponse.
2. **NEVER use `<img>` without explicit `width` and `height`** — @vercel/og will crash.
3. **NEVER nest `<defs>` twice in the same SVG** — causes silent render failure.
4. **ALWAYS export `runtime = 'edge'`** at the top of every poster route.
5. **ALL styles must be inline** — no CSS modules, no Tailwind, no className.
6. **`display: 'flex'` is required on EVERY div** — @vercel/og ignores non-flex elements.
7. **Emoji rendering** — @vercel/og supports emoji natively, no font needed.
8. **SVG background must be inside a `display:'flex'` wrapper div** — not returned standalone.
9. **`position: 'absolute'`** on background div, `position: 'relative'` on root div.
10. **Do not use `gap` on flex containers** — use `marginRight`/`marginBottom` instead.
11. **`transform` does NOT work in @vercel/og** — use SVG `patternTransform` for rotated stripes instead.
12. **Watermark text** — use `opacity` on the div, NOT on individual text nodes.
13. **boxShadow IS supported** in @vercel/og for glow effects on div elements.
14. **Photo URL must be Supabase Storage public URL** — never raw Telegram file URLs (CORS blocks them).

---

## FILE LOCATIONS

```
apps/web/app/api/posters/
├── teamPatterns.ts       ← source of truth for all colors/patterns/backgrounds
├── passport/
│   └── route.tsx         ← 5 variants: V1 Elite V2 Army V3 Heritage V4 Chrome V5 Glory
├── prematch/
│   └── route.tsx         ← team color top half + black bottom half
└── result/
    └── route.tsx         ← PERFECT / CORRECT_WINNER / WRONG
```

---

## STEP 1 — teamPatterns.ts (COMPLETE — OVERWRITE EXISTING FILE)

```typescript
// apps/web/app/api/posters/teamPatterns.ts
import React from 'react';

export interface TeamTheme {
  primary: string;
  secondary: string;
  accent: string;
  pattern: 'stripes_vertical' | 'stripes_diagonal' | 'thirds' | 'hoops' | 'sash' | 'solid' | 'cross' | 'halves';
  textColor: string;
  stripeWidth?: number;
}

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
  CH: { primary: '#FF0000', secondary: '#FFFFFF', accent: '#FFFFFF', pattern: 'cross',             textColor: '#ffffff'                  },
  SE: { primary: '#006AA7', secondary: '#FECC02', accent: '#FECC02', pattern: 'cross',             textColor: '#FECC02'                  },
  DK: { primary: '#C60C30', secondary: '#FFFFFF', accent: '#FFFFFF', pattern: 'cross',             textColor: '#ffffff'                  },
  NO: { primary: '#EF2B2D', secondary: '#FFFFFF', accent: '#002868', pattern: 'cross',             textColor: '#ffffff'                  },
  AT: { primary: '#ED2939', secondary: '#FFFFFF', accent: '#ED2939', pattern: 'stripes_vertical',  textColor: '#ffffff', stripeWidth: 120 },
  CZ: { primary: '#D7141A', secondary: '#FFFFFF', accent: '#11457E', pattern: 'halves',            textColor: '#ffffff'                  },
  SK: { primary: '#FFFFFF', secondary: '#0B4EA2', accent: '#EE1C25', pattern: 'thirds',            textColor: '#0B4EA2'                  },
  HU: { primary: '#CE2939', secondary: '#FFFFFF', accent: '#477050', pattern: 'stripes_vertical',  textColor: '#ffffff', stripeWidth: 120 },
  RO: { primary: '#002B7F', secondary: '#FCD116', accent: '#CE1126', pattern: 'thirds',            textColor: '#FCD116'                  },
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
  CI: { primary: '#F77F00', secondary: '#FFFFFF', accent: '#009A44', pattern: 'thirds',            textColor: '#ffffff'                  },
  TN: { primary: '#E70013', secondary: '#FFFFFF', accent: '#E70013', pattern: 'solid',             textColor: '#ffffff'                  },
  ZA: { primary: '#007A4D', secondary: '#FFB81C', accent: '#DE3831', pattern: 'solid',             textColor: '#ffffff'                  },
  ML: { primary: '#14B53A', secondary: '#FCD116', accent: '#CE1126', pattern: 'thirds',            textColor: '#ffffff'                  },
  GA: { primary: '#009E60', secondary: '#FCD116', accent: '#3A75C4', pattern: 'thirds',            textColor: '#ffffff'                  },

  // ── ASIA / MIDDLE EAST ───────────────────────────────────────────────────
  JP: { primary: '#000080', secondary: '#FFFFFF', accent: '#BC002D', pattern: 'solid',             textColor: '#ffffff'                  },
  KR: { primary: '#FFFFFF', secondary: '#CD2E3A', accent: '#0047A0', pattern: 'solid',             textColor: '#CD2E3A'                  },
  IR: { primary: '#239F40', secondary: '#FFFFFF', accent: '#DA0000', pattern: 'thirds',            textColor: '#ffffff'                  },
  SA: { primary: '#006C35', secondary: '#FFFFFF', accent: '#FFFFFF', pattern: 'solid',             textColor: '#ffffff'                  },
  AU: { primary: '#00843D', secondary: '#FFD200', accent: '#FFFFFF', pattern: 'stripes_diagonal',  textColor: '#ffffff'                  },
  QA: { primary: '#8D1B3D', secondary: '#FFFFFF', accent: '#8D1B3D', pattern: 'solid',             textColor: '#ffffff'                  },
  IQ: { primary: '#000000', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'thirds',            textColor: '#ffffff'                  },
  UZ: { primary: '#1EB53A', secondary: '#FFFFFF', accent: '#CE1126', pattern: 'thirds',            textColor: '#ffffff'                  },
  CN: { primary: '#DE2910', secondary: '#FFDE00', accent: '#DE2910', pattern: 'solid',             textColor: '#ffffff'                  },
  IN: { primary: '#FF9933', secondary: '#FFFFFF', accent: '#138808', pattern: 'thirds',            textColor: '#ffffff'                  },

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
// PASSPORT BACKGROUND — 5 variants matching CEO reference designs
// variant: 'V1' | 'V2' | 'V3' | 'V4' | 'V5'
// V1 ELITE    — dark card, subtle flag watermark circle, team color accents
// V2 ARMY     — team color fill, large diagonal "FAN ARMY" watermark text
// V3 HERITAGE — hard left/right color split, flag at center intersection
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
            <stop offset="100%" stopColor="#050510"          stopOpacity="1"    />
          </radialGradient>
          <radialGradient id="v1flag" cx="50%" cy="38%" r="22%">
            <stop offset="0%"   stopColor={theme.secondary} stopOpacity="0.12" />
            <stop offset="100%" stopColor={theme.secondary} stopOpacity="0"    />
          </radialGradient>
          <linearGradient id="v1fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="60%"  stopColor="rgba(0,0,0,0)"    />
            <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="#050510" />
        <rect width="1080" height="1920" fill="url(#v1bg)" />
        {/* Subtle flag watermark circle behind photo area */}
        <circle cx="540" cy="680" r="300" fill="url(#v1flag)" />
        {/* Team color thin accent bar at top */}
        <rect x="0" y="0" width="1080" height="6" fill={theme.primary} opacity="0.8" />
        <rect x="0" y="6" width="1080" height="3" fill={theme.accent}  opacity="0.5" />
        {/* Team color thin accent bar at bottom */}
        <rect x="0" y="1911" width="1080" height="6" fill={theme.primary} opacity="0.8" />
        <rect x="0" y="1908" width="1080" height="3" fill={theme.accent}  opacity="0.5" />
        <rect width="1080" height="1920" fill="url(#v1fade)" />
      </svg>
    );

    // ── V2 ARMY — full team color, large diagonal watermark text
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
              <stop offset="50%"  stopColor="rgba(0,0,0,0)"    />
              <stop offset="100%" stopColor="rgba(0,0,0,0.80)" />
            </linearGradient>
          </defs>
          {/* Background — use team pattern */}
          {theme.pattern === 'stripes_diagonal'
            ? <rect width="1080" height="1920" fill="url(#v2ds)" />
            : isStripe
              ? Array.from({ length: count }, (_, i) => (
                  <rect key={i} x={i * sw} y={0} width={sw} height={1920}
                    fill={i % 2 === 0 ? theme.primary : theme.secondary} />
                ))
              : <rect width="1080" height="1920" fill={theme.primary} />
          }
          {/* Dark overlay */}
          <rect width="1080" height="1920" fill="rgba(0,0,0,0.38)" />
          {/* "FAN ARMY" diagonal watermark — large, very subtle */}
          <text
            x="-200" y="1100"
            fontSize="280" fontWeight="900"
            fill={theme.secondary}
            fillOpacity="0.07"
            letterSpacing="30"
            transform="rotate(-30 540 960)"
          >FAN ARMY</text>
          <rect width="1080" height="1920" fill="url(#v2fade)" />
          {/* Gold bottom bar */}
          <rect x="0" y="1908" width="1080" height="12" fill={theme.accent} opacity="0.9" />
        </svg>
      );
    }

    // ── V3 HERITAGE — hard vertical split L=primary R=secondary, flagship design
    case 'V3': return (
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
        <defs>
          <linearGradient id="v3fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="55%"  stopColor="rgba(0,0,0,0)"    />
            <stop offset="100%" stopColor="rgba(0,0,0,0.90)" />
          </linearGradient>
        </defs>
        {/* Hard left/right split */}
        <rect x="0"   y="0" width="540"  height="1920" fill={theme.primary}   />
        <rect x="540" y="0" width="540"  height="1920" fill={theme.secondary === '#FFFFFF' ? theme.accent : theme.secondary} />
        {/* Thin white center divider */}
        <rect x="537" y="0" width="6"    height="1920" fill="rgba(255,255,255,0.25)" />
        {/* Glow ring at center where flag/photo sits (visual guide — actual photo rendered in JSX) */}
        <circle cx="540" cy="650" r="165" fill="none"
          stroke="rgba(255,255,255,0.25)" strokeWidth="6" />
        <circle cx="540" cy="650" r="175" fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
        {/* Dark fade for bottom stats area */}
        <rect width="1080" height="1920" fill="url(#v3fade)" />
        {/* Accent line top */}
        <rect x="0" y="0" width="1080" height="5" fill={theme.accent} opacity="0.8" />
      </svg>
    );

    // ── V4 CHROME — dark charcoal base, team color as glowing ring accent only
    case 'V4': return (
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
        <defs>
          <radialGradient id="v4ring" cx="50%" cy="34%" r="20%">
            <stop offset="0%"   stopColor={theme.primary} stopOpacity="0.5" />
            <stop offset="100%" stopColor={theme.primary} stopOpacity="0"   />
          </radialGradient>
          <radialGradient id="v4bg" cx="50%" cy="0%" r="80%">
            <stop offset="0%"   stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#080808" />
          </radialGradient>
          <linearGradient id="v4fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="50%"  stopColor="rgba(0,0,0,0)"    />
            <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#v4bg)" />
        {/* Team color glow behind photo circle */}
        <circle cx="540" cy="650" r="320" fill="url(#v4ring)" />
        {/* Team color glow ring — the signature V4 element */}
        <circle cx="540" cy="650" r="180" fill="none"
          stroke={theme.primary} strokeWidth="4"  opacity="0.9" />
        <circle cx="540" cy="650" r="190" fill="none"
          stroke={theme.primary} strokeWidth="2"  opacity="0.4" />
        <circle cx="540" cy="650" r="200" fill="none"
          stroke={theme.primary} strokeWidth="1"  opacity="0.15" />
        {/* Team color stripe accents — top bar trio */}
        <rect x="0" y="0" width="1080" height="4" fill={theme.primary}    opacity="1.0" />
        <rect x="0" y="4" width="1080" height="2" fill={theme.secondary}  opacity="0.8" />
        <rect x="0" y="6" width="1080" height="2" fill={theme.accent}     opacity="0.6" />
        {/* Bottom bar */}
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
            <stop offset="100%" stopColor={theme.primary}   stopOpacity="1"   />
          </radialGradient>
          <linearGradient id="v5fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="55%"  stopColor="rgba(0,0,0,0)"    />
            <stop offset="100%" stopColor="rgba(0,0,0,0.88)" />
          </linearGradient>
          {/* Subtle texture pattern */}
          <pattern id="v5tex" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="transparent" />
            <circle cx="20" cy="20" r="1" fill={theme.accent} fillOpacity="0.08" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill={theme.primary} />
        <rect width="1080" height="1920" fill="url(#v5bg)"  />
        <rect width="1080" height="1920" fill="url(#v5tex)" />
        {/* Gold border frame — outer */}
        <rect x="30" y="30" width="1020" height="1860" fill="none"
          stroke={theme.accent} strokeWidth="4" rx="20" />
        {/* Gold border frame — inner thin */}
        <rect x="44" y="44" width="992" height="1832" fill="none"
          stroke={theme.accent} strokeWidth="1.5" rx="16" opacity="0.5" />
        {/* Corner flourishes */}
        <rect x="30"  y="30"  width="60" height="4" fill={theme.accent} />
        <rect x="990" y="30"  width="60" height="4" fill={theme.accent} />
        <rect x="30"  y="1886" width="60" height="4" fill={theme.accent} />
        <rect x="990" y="1886" width="60" height="4" fill={theme.accent} />
        <rect width="1080" height="1920" fill="url(#v5fade)" />
        {/* Stars row top */}
        <text x="480" y="100" fontSize="36" fill={theme.accent} textAnchor="middle">★ ★ ★</text>
        {/* Stars row bottom */}
        <text x="540" y="1870" fontSize="28" fill={theme.accent} textAnchor="middle" fillOpacity="0.7">★ ★ ★ ★ ★</text>
      </svg>
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO FRAME — glowing circle, variant-aware
// Returns JSX wrapper styles — apply to the photo container div
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
// TOP HALF (0–960px)  = home team left | away team right
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
      {/* Divider accent line between halves */}
      <rect x="0" y="954" width="1080" height="6" fill={home.accent} opacity="0.7" />
      <rect x="540" y="954" width="540" height="6" fill={away.accent} opacity="0.7" />
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
          <stop offset="100%" stopColor="#000000"        stopOpacity="1"   />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="#080808" />
      <rect width="1080" height="1920" fill="url(#wrg)" />
      {/* Subtle red tint at top — communicates "wrong" */}
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
          <stop offset="100%" stopColor={theme.primary}    stopOpacity="1"   />
        </radialGradient>
        <linearGradient id="pff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="45%"  stopColor="rgba(0,0,0,0)"    />
          <stop offset="100%" stopColor="rgba(0,0,0,0.75)" />
        </linearGradient>
        {/* Gold shimmer lines */}
        <linearGradient id="pfsh" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,215,0,0)"    />
          <stop offset="50%"  stopColor="rgba(255,215,0,0.15)" />
          <stop offset="100%" stopColor="rgba(255,215,0,0)"    />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill={theme.primary}  />
      <rect width="1080" height="1920" fill="url(#pfg)"      />
      {/* Gold shimmer horizontal bands */}
      <rect x="0" y="200" width="1080" height="3" fill="url(#pfsh)" />
      <rect x="0" y="400" width="1080" height="2" fill="url(#pfsh)" />
      <rect x="0" y="550" width="1080" height="2" fill="url(#pfsh)" />
      <rect width="1080" height="1920" fill="url(#pff)"      />
    </svg>
  );

  // CORRECT_WINNER
  return (
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0, display: 'flex' } as React.CSSProperties}>
      <defs>
        <radialGradient id="cwg" cx="50%" cy="35%" r="70%">
          <stop offset="0%"   stopColor={theme.secondary} stopOpacity="0.28" />
          <stop offset="100%" stopColor={theme.primary}   stopOpacity="1"   />
        </radialGradient>
        <linearGradient id="cwf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="40%"  stopColor="rgba(0,0,0,0)"    />
          <stop offset="100%" stopColor="rgba(0,0,0,0.70)" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill={theme.primary} />
      <rect width="1080" height="1920" fill="url(#cwg)"     />
      <rect width="1080" height="1920" fill="url(#cwf)"     />
    </svg>
  );
}
```

---

## STEP 2 — passport/route.tsx (COMPLETE REWRITE)

```tsx
// apps/web/app/api/posters/passport/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTheme, getPassportBackground, getPhotoFrameStyle } from '../teamPatterns';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name         = (searchParams.get('name') ?? 'FOOTBALL FAN').toUpperCase().slice(0, 14);
  const countryCode  = searchParams.get('countryCode') ?? 'DEFAULT';
  const countryName  = searchParams.get('countryName') ?? 'World';
  const flagEmoji    = searchParams.get('flagEmoji') ?? '🏳️';
  const fanId        = searchParams.get('fanId') ?? 'WLD-000000';
  const fanLevel     = searchParams.get('fanLevel') ?? 'FAN';
  const totalPoints  = searchParams.get('totalPoints') ?? '0';
  const accuracyPct  = searchParams.get('accuracyPct') ?? '0';
  const streakCount  = searchParams.get('streakCount') ?? '0';
  const referralCount= searchParams.get('referralCount') ?? '0';
  const referralCode = searchParams.get('referralCode') ?? '';
  const photoUrl     = searchParams.get('photoUrl') ?? null;
  // variant: V1 V2 V3 V4 V5 — defaults to V3 Heritage (flagship)
  const variant      = (searchParams.get('variant') ?? 'V3') as 'V1'|'V2'|'V3'|'V4'|'V5';

  const theme = getTheme(countryCode);

  const levelBadge = fanLevel === 'LEGEND'
    ? { icon: '💎', label: 'LEGEND',   color: '#a78bfa' }
    : fanLevel === 'SUPPORTER'
    ? { icon: '🌟', label: 'SUPPORTER', color: '#60a5fa' }
    : { icon: '⭐', label: 'FAN',       color: theme.accent };

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

        {/* PHOTO CIRCLE */}
        <div style={photoFrameStyle}>
          {photoUrl ? (
            <img src={photoUrl} width={260} height={260} style={{ objectFit: 'cover' }} />
          ) : (
            // Flag emoji as avatar fallback
            <div style={{
              fontSize: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 260, height: 260,
            }}>
              {flagEmoji}
            </div>
          )}
        </div>

        {/* COUNTRY row */}
        <div style={{
          fontSize: 32, color: 'rgba(255,255,255,0.8)',
          letterSpacing: 6, marginBottom: 16, display: 'flex', alignItems: 'center',
        }}>
          {flagEmoji}&nbsp;&nbsp;{countryName.toUpperCase()}&nbsp;&nbsp;{flagEmoji}
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
          border: `2px solid ${levelBadge.color}`,
          borderRadius: 40, marginBottom: 60,
          background: `${levelBadge.color}20`,
        }}>
          <span style={{ fontSize: 24, marginRight: 10, display: 'flex' }}>{levelBadge.icon}</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: levelBadge.color, letterSpacing: 3, display: 'flex' }}>
            {levelBadge.label}
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
            { value: totalPoints,        label: 'POINTS'   },
            { value: `${accuracyPct}%`,  label: 'ACCURACY' },
            { value: `🔥 ${streakCount}`, label: 'STREAK'   },
            { value: `👥 ${referralCount}`,label: 'REFERRED' },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '28px 8px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', marginBottom: 6, display: 'flex' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, display: 'flex' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* SPACER */}
        <div style={{ flex: 1, display: 'flex' }} />

        {/* REFERRAL LINK */}
        {referralCode && (
          <div style={{
            fontSize: 26, color: 'rgba(255,255,255,0.35)',
            letterSpacing: 3, marginBottom: 16, display: 'flex',
          }}>
            ohmykick.com/{referralCode}
          </div>
        )}

        {/* BOTTOM WORDMARK */}
        <div style={{
          width: '100%', paddingTop: 16, display: 'flex', justifyContent: 'center',
          borderTop: `1px solid ${theme.accent}44`,
        }}>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.25)', letterSpacing: 8, display: 'flex' }}>
            OHMYKICK
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
```

---

## STEP 3 — prematch/route.tsx KEY CHANGES

Add to imports:
```typescript
import { getTheme, getPrematchBackground } from '../teamPatterns';
```

Add inside GET():
```typescript
const homeCode   = searchParams.get('homeCode') ?? 'DEFAULT';
const awayCode   = searchParams.get('awayCode') ?? 'DEFAULT';
const homeTheme  = getTheme(homeCode);
const awayTheme  = getTheme(awayCode);
```

Replace background div:
```tsx
<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
  {getPrematchBackground(homeCode, awayCode)}
</div>
```

Score numbers — home in home team color, away in away team color:
```tsx
{/* Predicted score */}
<div style={{ display: 'flex', alignItems: 'center' }}>
  <span style={{ fontSize: 140, fontWeight: 900, color: homeTheme.accent, display: 'flex' }}>
    {predictedHomeScore}
  </span>
  <span style={{ fontSize: 80, color: 'rgba(255,255,255,0.4)', marginLeft: 24, marginRight: 24, display: 'flex' }}>
    –
  </span>
  <span style={{ fontSize: 140, fontWeight: 900, color: awayTheme.accent, display: 'flex' }}>
    {predictedAwayScore}
  </span>
</div>
```

"PREDICTION LOCKED" pill — sits in the black bottom half:
```tsx
<div style={{
  display: 'flex', alignItems: 'center',
  padding: '18px 48px',
  border: `2px solid ${homeTheme.accent}`,
  borderRadius: 60,
  background: 'rgba(0,0,0,0.6)',
  marginTop: 40,
}}>
  <span style={{ fontSize: 28, color: homeTheme.accent, letterSpacing: 4, fontWeight: 700, display: 'flex' }}>
    🔒 PREDICTION LOCKED 🔒
  </span>
</div>
```

---

## STEP 4 — result/route.tsx KEY CHANGES

Add to imports:
```typescript
import { getTheme, getResultBackground } from '../teamPatterns';
```

Add inside GET():
```typescript
const resultType = (searchParams.get('resultType') ?? 'WRONG') as 'PERFECT' | 'CORRECT_WINNER' | 'WRONG';
// winnerCode = country code of the team that actually won
const winnerCode = searchParams.get('winnerCode') ?? 'DEFAULT';
```

Replace background div:
```tsx
<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
  {getResultBackground(winnerCode, resultType)}
</div>
```

Headline per result type:
```tsx
{resultType === 'PERFECT' && (
  <div style={{ fontSize: 96, fontWeight: 900, color: '#FFD700', display: 'flex', letterSpacing: 2 }}>
    🏆 YOU CALLED IT
  </div>
)}
{resultType === 'CORRECT_WINNER' && (
  <div style={{ fontSize: 80, fontWeight: 900, color: '#ffffff', display: 'flex', letterSpacing: 2 }}>
    ✅ NICE CALL
  </div>
)}
{resultType === 'WRONG' && (
  <div style={{ fontSize: 72, fontWeight: 900, color: '#ff4444', display: 'flex', letterSpacing: 2 }}>
    ❌ SO CLOSE
  </div>
)}
```

---

## STEP 5 — TEST URLS

```
# V1 ELITE — Argentina (dark, flag watermark)
http://localhost:3000/api/posters/passport?name=SALEEM&countryCode=AR&countryName=Argentina&flagEmoji=🇦🇷&fanId=ARG-001337&fanLevel=FAN&totalPoints=0&accuracyPct=0&streakCount=0&referralCount=0&referralCode=SAL7X2&variant=V1

# V2 ARMY — Brazil (green/yellow + FAN ARMY watermark)
http://localhost:3000/api/posters/passport?name=SALEEM&countryCode=BR&countryName=Brazil&flagEmoji=🇧🇷&fanId=BRA-001337&fanLevel=FAN&totalPoints=0&accuracyPct=0&streakCount=0&referralCount=0&referralCode=SAL7X2&variant=V2

# V3 HERITAGE — France (blue/red hard split) ← FLAGSHIP
http://localhost:3000/api/posters/passport?name=SALEEM&countryCode=FR&countryName=France&flagEmoji=🇫🇷&fanId=FRA-001337&fanLevel=SUPPORTER&totalPoints=150&accuracyPct=80&streakCount=5&referralCount=10&referralCode=SAL7X2&variant=V3

# V4 CHROME — Germany (dark + glowing color ring)
http://localhost:3000/api/posters/passport?name=SALEEM&countryCode=DE&countryName=Germany&flagEmoji=🇩🇪&fanId=DEU-001337&fanLevel=LEGEND&totalPoints=300&accuracyPct=90&streakCount=8&referralCount=20&referralCode=SAL7X2&variant=V4

# V5 GLORY — Portugal (deep green + gold frame + stars)
http://localhost:3000/api/posters/passport?name=SALEEM&countryCode=PT&countryName=Portugal&flagEmoji=🇵🇹&fanId=PRT-001337&fanLevel=FAN&totalPoints=0&accuracyPct=0&streakCount=0&referralCount=0&referralCode=SAL7X2&variant=V5

# PREMATCH — France vs Denmark (split top + black bottom)
http://localhost:3000/api/posters/prematch?homeTeam=France&awayTeam=Denmark&homeCode=FR&awayCode=DK&homeFlagEmoji=🇫🇷&awayFlagEmoji=🇩🇰&predictedWinner=HOME&predictedHomeScore=3&predictedAwayScore=1&userName=SALEEM&userFlagEmoji=🇮🇳&referralCode=SAL7X2

# RESULT PERFECT — Brazil wins (gold glow)
http://localhost:3000/api/posters/result?resultType=PERFECT&winnerCode=BR&homeTeam=Brazil&awayTeam=Spain&homeCode=BR&awayCode=ES&actualHomeScore=2&actualAwayScore=0&predictedHomeScore=2&predictedAwayScore=0&pointsEarned=25&userName=SALEEM&userFlagEmoji=🇮🇳&referralCode=SAL7X2

# RESULT CORRECT_WINNER
http://localhost:3000/api/posters/result?resultType=CORRECT_WINNER&winnerCode=DE&homeTeam=Germany&awayTeam=Argentina&homeCode=DE&awayCode=AR&actualHomeScore=2&actualAwayScore=1&predictedHomeScore=3&predictedAwayScore=0&pointsEarned=10&userName=SALEEM&userFlagEmoji=🇮🇳&referralCode=SAL7X2

# RESULT WRONG
http://localhost:3000/api/posters/result?resultType=WRONG&winnerCode=FR&homeTeam=France&awayTeam=Morocco&homeCode=FR&awayCode=MA&actualHomeScore=2&actualAwayScore=0&predictedHomeScore=0&predictedAwayScore=1&pointsEarned=0&userName=SALEEM&userFlagEmoji=🇮🇳&referralCode=SAL7X2
```

---

## STEP 6 — BOT WORKER: HOW TO CALL ALL 3 POSTER APIS

```typescript
// apps/bot/src/queues/poster.worker.ts

// PASSPORT — default to V3 Heritage, can be randomised or user-selectable
async function generatePassportPoster(user: User): Promise<string> {
  const params = new URLSearchParams({
    name:          user.name,
    countryCode:   user.country_code,
    countryName:   user.country_name,
    flagEmoji:     user.country_flag_emoji,
    fanId:         user.fan_id,
    fanLevel:      user.fan_level,
    totalPoints:   String(user.total_points),
    accuracyPct:   String(calculateAccuracy(user)),
    streakCount:   String(user.streak_count),
    referralCount: String(user.referral_count),
    referralCode:  user.referral_code,
    variant:       'V3', // flagship — change to V1-V5 or randomise
    ...(user.photo_url ? { photoUrl: user.photo_url } : {}),
  });
  const res = await fetch(`${process.env.POSTER_SERVICE_URL}/api/posters/passport?${params}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = `${user.id}_${Date.now()}.png`;
  await supabase.storage.from('posters')
    .upload(`passport/${filename}`, buf, { contentType: 'image/png', upsert: true });
  return supabase.storage.from('posters').getPublicUrl(`passport/${filename}`).data.publicUrl;
}

// PREMATCH
async function generatePrematchPoster(user: User, match: Match, prediction: Prediction): Promise<string> {
  const params = new URLSearchParams({
    homeTeam:           match.home_team,
    awayTeam:           match.away_team,
    homeCode:           match.home_country_code,
    awayCode:           match.away_country_code,
    homeFlagEmoji:      match.home_flag_emoji,
    awayFlagEmoji:      match.away_flag_emoji,
    predictedWinner:    prediction.predicted_winner,
    predictedHomeScore: String(prediction.predicted_home_score),
    predictedAwayScore: String(prediction.predicted_away_score),
    userName:           user.name,
    userFlagEmoji:      user.country_flag_emoji,
    referralCode:       user.referral_code,
  });
  const res = await fetch(`${process.env.POSTER_SERVICE_URL}/api/posters/prematch?${params}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = `${user.id}_${match.id}_${Date.now()}.png`;
  await supabase.storage.from('posters')
    .upload(`prematch/${filename}`, buf, { contentType: 'image/png', upsert: true });
  return supabase.storage.from('posters').getPublicUrl(`prematch/${filename}`).data.publicUrl;
}

// RESULT
async function generateResultPoster(
  user: User, match: Match, prediction: Prediction,
  resultType: 'PERFECT' | 'CORRECT_WINNER' | 'WRONG',
  pointsEarned: number
): Promise<string> {
  const winnerCode = match.home_score > match.away_score ? match.home_country_code
                   : match.away_score > match.home_score ? match.away_country_code
                   : 'DEFAULT';
  const params = new URLSearchParams({
    resultType,
    winnerCode,
    homeTeam:           match.home_team,
    awayTeam:           match.away_team,
    homeCode:           match.home_country_code,
    awayCode:           match.away_country_code,
    homeFlagEmoji:      match.home_flag_emoji,
    awayFlagEmoji:      match.away_flag_emoji,
    actualHomeScore:    String(match.home_score),
    actualAwayScore:    String(match.away_score),
    predictedHomeScore: String(prediction.predicted_home_score),
    predictedAwayScore: String(prediction.predicted_away_score),
    pointsEarned:       String(pointsEarned),
    userName:           user.name,
    userFlagEmoji:      user.country_flag_emoji,
    referralCode:       user.referral_code,
  });
  const res = await fetch(`${process.env.POSTER_SERVICE_URL}/api/posters/result?${params}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = `${user.id}_${match.id}_${Date.now()}.png`;
  await supabase.storage.from('posters')
    .upload(`result/${filename}`, buf, { contentType: 'image/png', upsert: true });
  return supabase.storage.from('posters').getPublicUrl(`result/${filename}`).data.publicUrl;
}
```

---

## COMMON ERRORS & FIXES

| Error | Cause | Fix |
|-------|-------|-----|
| Blank/black poster | `display:'flex'` missing on a div | Every single div needs `display:'flex'` |
| `transform` ignored | Not supported in @vercel/og | Use SVG `patternTransform` for rotations |
| Glow not showing | `boxShadow` on wrong element | Only works on div, not svg or text |
| Text overflows | Name too long | Slice to 14 chars + reduce fontSize if >10 chars |
| Photo CORS error | Using Telegram file URL | Always upload to Supabase first, use public URL |
| Gradient IDs clash | Multiple SVGs with same ID | Each function has unique IDs — don't copy between functions |
| `runtime = 'edge'` missing | Not exported | Add at top of every route file |
| Emoji box | — | @vercel/og handles natively, no fix needed |
| Stars not rendering | SVG `text` element | Use `<text>` in SVG, NOT a div with emoji for stars |
| V2 watermark too strong | Opacity too high | Keep `fillOpacity` between 0.05–0.10 |

---

## VARIANT → CEO REFERENCE MAPPING

| Our Variant | CEO Reference | Key Design Element |
|-------------|--------------|-------------------|
| V1 ELITE | V1 Elite | Dark card, team color radial glow, subtle flag watermark |
| V2 ARMY | V2 Army | Full team color BG, "FAN ARMY" diagonal watermark |
| V3 HERITAGE | V3 Heritage | Hard left/right color split, flag at center ← FLAGSHIP |
| V4 CHROME | V4 Chrome | Dark base, glowing team color ring |
| V5 GLORY | V5 Glory | Rich team color, gold border frame, stars |

## COUNTRY CODE QUICK REFERENCE

| Country | Code | Pattern |
|---------|------|---------|
| Argentina | AR | Vertical stripes (sky blue/white) |
| Brazil | BR | Diagonal stripes (green/yellow) |
| France | FR | Thirds (blue/white/red) |
| Germany | DE | Vertical stripes (black/red/gold) |
| Spain | ES | Solid (red/gold) |
| Portugal | PT | Sash (green/red) |
| England | EN/GB | Cross (white/red) |
| Switzerland | CH | Cross (red/white) |
| Sweden | SE | Cross (blue/yellow) |
| Denmark | DK | Cross (red/white) |
| Netherlands | NL | Solid (orange) |
| Italy | IT | Solid (azzurri blue) |
| Croatia | HR | Checkerboard (red/white) |
| Poland | PL | Halves (white/red) |
| Chile | CL | Halves (red/white) |
| Belgium | BE | Thirds (black/red/yellow) |
| Mexico | MX | Thirds (green/white/red) |
| USA | US | Thirds (navy/white/red) |
| Colombia | CO | Thirds (yellow/blue/red) |
| Senegal | SN | Thirds (green/yellow/red) |
| Morocco | MA | Solid (red) |
| Nigeria | NG | Vertical stripes (green/white) |
| Saudi Arabia | SA | Solid (green) |
| Japan | JP | Solid (navy) |
| Australia | AU | Diagonal stripes (green/gold) |
| Jamaica | JM | Diagonal stripes (black/gold) |
| Uruguay | UY | Vertical stripes (sky blue/white) |
| Peru | PE | Sash (white/red) |
| South Korea | KR | Solid (white/red) |
| Iran | IR | Thirds (green/white/red) |
| Cameroon | CM | Thirds (green/red/yellow) |
| Ecuador | EC | Thirds (yellow/blue/red) |
