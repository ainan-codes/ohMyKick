# OhMyKick — Poster Wiring Guide

## How to use teamPatterns.ts in your 3 poster routes

---

## 1. PASSPORT POSTER — `apps/web/app/api/posters/passport/route.tsx`

```tsx
import { getTheme, getTeamBackground } from '../teamPatterns';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('countryCode') ?? 'DEFAULT';

  // Theme drives ALL colors — no more hardcoded primaryColor/secondaryColor params
  const theme = getTheme(countryCode);

  return new ImageResponse(
    <div style={{ width: 1080, height: 1920, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', padding: '90px 80px', position: 'relative',
                  fontFamily: 'sans-serif', overflow: 'hidden' }}>

      {/* ✅ TEAM BACKGROUND — replaces your old getTeamBackground call */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
        {getTeamBackground(countryCode)}
      </div>

      {/* Accent top line uses theme.accent instead of hardcoded gold */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
        background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
      }} />

      {/* Rest of your poster JSX stays exactly the same */}
      {/* ... */}

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
        background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
      }} />
    </div>,
    { width: 1080, height: 1920 }
  );
}
```

### Query params for passport:
```
/api/posters/passport?
  name=SALEEM&
  countryCode=BR&        ← drives everything
  countryName=Brazil&
  flagEmoji=🇧🇷&
  fanId=BRA-001337&
  fanLevel=SUPPORTER&
  totalPoints=85&
  accuracyPct=72&
  streakCount=3&
  referralCount=5&
  referralCode=SAL7X2&
  photoUrl=https://...   ← optional
```

---

## 2. PREMATCH POSTER — `apps/web/app/api/posters/prematch/route.tsx`

```tsx
import { getTheme, getPrematchBackground } from '../teamPatterns';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const homeCode = searchParams.get('homeCode') ?? 'DEFAULT';
  const awayCode = searchParams.get('awayCode') ?? 'DEFAULT';
  const homeTheme = getTheme(homeCode);
  const awayTheme = getTheme(awayCode);

  return new ImageResponse(
    <div style={{ width: 1080, height: 1920, display: 'flex', flexDirection: 'column',
                  position: 'relative', fontFamily: 'sans-serif', overflow: 'hidden' }}>

      {/* ✅ SPLIT BACKGROUND — home left, away right */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
        {getPrematchBackground(homeCode, awayCode)}
      </div>

      {/* Home side text uses homeTheme.accent */}
      {/* Away side text uses awayTheme.accent */}
      {/* ... rest of your prematch JSX */}
    </div>,
    { width: 1080, height: 1920 }
  );
}
```

### Query params for prematch:
```
/api/posters/prematch?
  homeTeam=Germany&
  awayTeam=Spain&
  homeCode=DE&           ← drives left half colors
  awayCode=ES&           ← drives right half colors
  homeFlagEmoji=🇩🇪&
  awayFlagEmoji=🇪🇸&
  predictedWinner=HOME&
  predictedHomeScore=2&
  predictedAwayScore=0&
  userName=SALEEM&
  userFlagEmoji=🇮🇳&
  referralCode=SAL7X2
```

---

## 3. RESULT POSTER — `apps/web/app/api/posters/result/route.tsx`

```tsx
import { getTheme, getResultBackground } from '../teamPatterns';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resultType = (searchParams.get('resultType') ?? 'WRONG') as 'PERFECT' | 'CORRECT_WINNER' | 'WRONG';

  // Use winner's country code for background
  // If WRONG, winnerCode still sets a muted tint
  const winnerCode = searchParams.get('winnerCode') ?? 'DEFAULT';

  return new ImageResponse(
    <div style={{ width: 1080, height: 1920, display: 'flex', flexDirection: 'column',
                  position: 'relative', fontFamily: 'sans-serif', overflow: 'hidden' }}>

      {/* ✅ RESULT BACKGROUND — PERFECT=golden glow, CORRECT_WINNER=team colors, WRONG=dark */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
        {getResultBackground(winnerCode, resultType)}
      </div>

      {/* Headline text changes per result type */}
      {resultType === 'PERFECT' && (
        <div style={{ fontSize: 96, fontWeight: 900, color: '#FFD700' }}>🏆 YOU CALLED IT</div>
      )}
      {resultType === 'CORRECT_WINNER' && (
        <div style={{ fontSize: 80, fontWeight: 900, color: '#ffffff' }}>✅ NICE CALL</div>
      )}
      {resultType === 'WRONG' && (
        <div style={{ fontSize: 80, fontWeight: 900, color: '#ff4444' }}>❌ BETTER LUCK NEXT TIME</div>
      )}

      {/* ... rest of your result JSX */}
    </div>,
    { width: 1080, height: 1920 }
  );
}
```

### Query params for result:
```
/api/posters/result?
  resultType=PERFECT&       ← PERFECT | CORRECT_WINNER | WRONG
  winnerCode=DE&            ← actual match winner country code
  homeTeam=Germany&
  awayTeam=Spain&
  homeCode=DE&
  awayCode=ES&
  homeFlagEmoji=🇩🇪&
  awayFlagEmoji=🇪🇸&
  actualHomeScore=2&
  actualAwayScore=0&
  predictedHomeScore=2&
  predictedAwayScore=0&
  pointsEarned=25&
  totalCorrect=4&
  totalPredicted=5&
  accuracyPct=80&
  userName=SALEEM&
  userFlagEmoji=🇮🇳&
  referralCode=SAL7X2
```

---

## Country Code → Pattern Reference

| Country | Code | Pattern | Colors |
|---------|------|---------|--------|
| Argentina | AR | Vertical stripes | Sky blue / White |
| Brazil | BR | Diagonal stripes | Green / Yellow |
| France | FR | Thirds | Blue / White / Red |
| Germany | DE | Vertical stripes | Black / Red / Gold |
| Spain | ES | Solid | Red / Gold |
| Portugal | PT | Sash | Green / Red |
| England | EN/GB | Cross | White / Red |
| Switzerland | CH | Cross | Red / White |
| Sweden | SE | Cross | Blue / Yellow |
| Netherlands | NL | Solid | Orange |
| Italy | IT | Solid | Azzurri blue |
| Croatia | HR | Checkers | Red / White |
| Poland | PL | Halves | White / Red |
| Chile | CL | Halves | Red / White |
| Belgium | BE | Thirds | Black / Red / Yellow |
| Mexico | MX | Thirds | Green / White / Red |
| Colombia | CO | Thirds | Yellow / Blue / Red |
| Senegal | SN | Thirds | Green / Yellow / Red |
| USA | US | Thirds | Navy / White / Red |
| Morocco | MA | Solid | Red |
| Saudi Arabia | SA | Solid | Green |
| South Korea | KR | Solid | White / Red |
| Japan | JP | Solid | Navy |
| Australia | AU | Diagonal stripes | Green / Gold |
| Jamaica | JM | Diagonal stripes | Black / Gold |
| Uruguay | UY | Vertical stripes | Sky blue / White |
| Nigeria | NG | Vertical stripes | Green / White |
| Peru | PE | Sash | White / Red |
| Paraguay | PY | Vertical stripes | Red / White / Blue |
| Iran | IR | Thirds | Green / White / Red |
| Cameroon | CM | Thirds | Green / Red / Yellow |
| Ecuador | EC | Thirds | Yellow / Blue / Red |

---

## How the Bot Calls the Poster API

```typescript
// In your queue worker (posterQueue processor)
async function generatePassportPoster(user: User): Promise<string> {
  const params = new URLSearchParams({
    name: user.name,
    countryCode: user.country_code,   // ← THIS is what drives the whole design
    countryName: user.country_name,
    flagEmoji: user.country_flag_emoji,
    fanId: user.fan_id,
    fanLevel: user.fan_level,
    totalPoints: String(user.total_points),
    accuracyPct: String(calculateAccuracy(user)),
    streakCount: String(user.streak_count),
    referralCount: String(user.referral_count),
    referralCode: user.referral_code,
    ...(user.photo_url ? { photoUrl: user.photo_url } : {}),
  });

  const posterUrl = `${process.env.POSTER_SERVICE_URL}/api/posters/passport?${params}`;
  const response = await fetch(posterUrl);
  const buffer = await response.arrayBuffer();

  // Upload to Supabase Storage
  const filename = `${user.id}_${Date.now()}.png`;
  const { data } = await supabase.storage
    .from('posters')
    .upload(`passport/${filename}`, Buffer.from(buffer), {
      contentType: 'image/png',
      upsert: true,
    });

  return supabase.storage.from('posters').getPublicUrl(`passport/${filename}`).data.publicUrl;
}
```
