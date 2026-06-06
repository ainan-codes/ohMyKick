# OhMyKick ⚽

> **World Cup 2026 fan prediction platform — WhatsApp & Telegram first.**
> Register in 90 seconds, predict every match, receive a shareable result poster after each game.

---

## Table of Contents

1. [What is OhMyKick?](#what-is-ohmykick)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started (Local Dev)](#getting-started-local-dev)
6. [Environment Variables](#environment-variables)
7. [Deploying to Production](#deploying-to-production)
8. [Supabase Setup](#supabase-setup)
9. [WhatsApp Cloud API Setup](#whatsapp-cloud-api-setup)
10. [Telegram Bot Setup](#telegram-bot-setup)
11. [Vercel (Web + Poster API)](#vercel-web--poster-api)
12. [Railway (Bot Server + Redis)](#railway-bot-server--redis)
13. [API Keys You Need](#api-keys-you-need)
14. [Phase Status](#phase-status)
15. [Launch Checklist](#launch-checklist)

---

## What is OhMyKick?

OhMyKick is a **bot-first fan engagement platform** for FIFA World Cup 2026. Users interact entirely through WhatsApp or Telegram — no app download required.

**Core loop (3 steps):**

1. **Register** → User sends "Hi" to the WhatsApp/Telegram bot → guided onboarding (name + country + optional photo) → receives a personalised **Fan Passport** card.
2. **Predict** → Before every match, user predicts the winner + exact score → receives a beautiful **Pre-match Poster** to share.
3. **Result** → After the match, user receives a **Result Poster** showing their prediction vs actual score with points earned.

**Referral flywheel:** Every poster contains the user's referral link. When a friend joins via that link, the referrer's referral count increments — visible on their Fan Passport, which they share again.

---

## Architecture Overview

```
WhatsApp (2.5B)                Telegram (900M)
     │                              │
     │ HTTPS Webhook                │ HTTPS Webhook
     ▼                              ▼
┌─────────────────────────────────────────────┐
│         BOT SERVER (Railway)                │
│         Node.js 20 + Fastify 4              │
│                                             │
│  Message Router → State Machine             │
│  ┌─────────────────────────────────┐        │
│  │ Onboarding | Prediction | Cmds  │        │
│  └─────────────────────────────────┘        │
│                   │                         │
│       BullMQ: posterQueue / notifyQueue     │
└────────────┬──────────────────┬─────────────┘
             │                  │
     ┌───────▼───┐       ┌──────▼──────────┐
     │ Supabase  │       │   Vercel Edge   │
     │ PostgreSQL│       │ /api/posters/   │
     │ Storage   │◀──────│   passport      │
     │ Auth      │       │   prematch      │
     └───────────┘       │   result        │
                         └─────────────────┘
           ▲
           │ pg_cron (every 2 min)
     ┌─────┴────────────┐
     │  API-Football    │
     │  Match polling   │
     └──────────────────┘
```

---

## Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Bot server | Node.js 20 + Fastify 4 + TypeScript | Railway |
| Database | Supabase (PostgreSQL 15) | Supabase Cloud |
| Storage | Supabase Storage | Supabase Cloud |
| Poster generation | `@vercel/og` (Edge runtime) | Vercel |
| Web / Landing page | Next.js 14 | Vercel |
| Message queue | BullMQ 5 + Redis | Railway (Redis add-on) |
| Messaging — primary | WhatsApp Cloud API (Meta) | Meta Cloud |
| Messaging — secondary | Telegram Bot API | Telegram |
| Match data | API-Football (RapidAPI) | RapidAPI |
| Analytics | PostHog | PostHog Cloud |
| Error tracking | Sentry | Sentry Cloud |

---

## Project Structure

```
ohMyKick/
├── apps/
│   ├── bot/                          # Node.js bot server (Railway)
│   │   ├── src/
│   │   │   ├── index.ts              # Fastify server, cron scheduler
│   │   │   ├── whatsapp/
│   │   │   │   ├── handler.ts        # WhatsApp webhook handler
│   │   │   │   └── sender.ts         # WhatsApp API calls
│   │   │   ├── telegram/
│   │   │   │   ├── handler.ts        # Telegraf setup + handlers
│   │   │   │   └── sender.ts         # Telegram send helpers
│   │   │   ├── flows/
│   │   │   │   ├── onboarding.ts     # NEW → REGISTERED flow
│   │   │   │   ├── prediction.ts     # Prediction flow
│   │   │   │   ├── passport.ts       # Fan Passport request handler
│   │   │   │   └── referral.ts       # Referral flow
│   │   │   ├── state-machine/
│   │   │   │   ├── index.ts          # Main message router
│   │   │   │   └── keywords.ts       # Global keyword constants
│   │   │   ├── queues/
│   │   │   │   └── queue.ts          # Poster + notification BullMQ workers
│   │   │   ├── pipeline/
│   │   │   │   ├── poll.ts           # Match result polling (API-Football)
│   │   │   │   └── results.ts        # Result processing + points
│   │   │   ├── db/
│   │   │   │   ├── client.ts         # Supabase client + User type
│   │   │   │   ├── users.ts          # User CRUD
│   │   │   │   ├── matches.ts        # Match queries
│   │   │   │   └── predictions.ts    # Prediction CRUD
│   │   │   └── utils/
│   │   │       ├── score-parser.ts   # Parse "2-1" style score inputs
│   │   │       ├── countries.ts      # 32 World Cup nations (flag + colour)
│   │   │       ├── i18n.ts           # EN / ML / AR string translations
│   │   │       └── analytics.ts      # PostHog event tracking
│   │   ├── .env                      # Local env (gitignored)
│   │   ├── .env.example              # Template — fill and rename to .env
│   │   ├── Dockerfile                # Production Docker image
│   │   └── package.json
│   │
│   └── web/                          # Next.js 14 app (Vercel)
│       ├── app/
│       │   ├── page.tsx              # Landing page
│       │   ├── [code]/
│       │   │   └── page.tsx          # Referral redirect → bot deep link
│       │   ├── p/[...posterId]/
│       │   │   └── page.tsx          # Public poster viewer
│       │   └── api/posters/
│       │       ├── passport/route.tsx  # Fan Passport image (1080×1920)
│       │       ├── prematch/route.tsx  # Pre-match prediction poster
│       │       └── result/route.tsx    # Match result poster
│       ├── .env.local                  # Local env (gitignored)
│       └── package.json
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Full DB schema (Section 6 of PRD)
│   └── seed/
│       └── matches.ts                # World Cup 2026 match fixture seeder
│
├── .gitignore
└── package.json                      # pnpm workspace root
```

---

## Getting Started (Local Dev)

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Redis (local or `brew install redis` / `redis-server`)
- [ngrok](https://ngrok.com/) (for WhatsApp webhook testing)

### Steps

```bash
# 1. Clone and install
git clone https://github.com/ainandaddy-cloud/ohMyKick.git
cd ohMyKick
pnpm install

# 2. Set up environment variables
cp apps/bot/.env.example apps/bot/.env
cp apps/web/.env.local.example apps/web/.env.local
# → Fill in all values (see Environment Variables section below)

# 3. Push Supabase migrations
supabase link --project-ref ybkryfliqgfqgjwgniew
supabase db push

# 4. Seed World Cup 2026 match fixtures
pnpm --filter bot run seed-matches

# 5. Start Redis locally
redis-server

# 6. Start the bot server
pnpm --filter bot run dev

# 7. Start the web / poster service
pnpm --filter web run dev
# → Poster API now available at http://localhost:3001/api/posters/

# 8. Expose bot to internet for Telegram webhook (separate terminal)
ngrok http 3000
# → Set Telegram webhook:
# curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<ngrok-url>/webhook/telegram"
```

---

## Environment Variables

### `apps/bot/.env`

```env
# ── Supabase ──────────────────────────────────
SUPABASE_URL=https://ybkryfliqgfqgjwgniew.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-key>

# ── WhatsApp Cloud API (Meta) ─────────────────
WHATSAPP_ACCESS_TOKEN=           # ⚠️ PENDING — get from Meta Developer Console
WHATSAPP_PHONE_NUMBER_ID=        # ⚠️ PENDING — from Meta Developer Console
WHATSAPP_BUSINESS_ACCOUNT_ID=    # ⚠️ PENDING — from Meta Developer Console
WHATSAPP_WEBHOOK_VERIFY_TOKEN=ohmykick_webhook_secret

# ── Telegram ──────────────────────────────────
TELEGRAM_BOT_TOKEN=<your-bot-token>

# ── Match Data ────────────────────────────────
API_FOOTBALL_KEY=                # ⚠️ PENDING — from RapidAPI
API_FOOTBALL_HOST=v3.football.api-sports.io

# ── Redis (BullMQ) ────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Services ─────────────────────────────────
POSTER_SERVICE_URL=https://ohmykick.vercel.app   # set after Vercel deploy
APP_URL=https://ohmykick.com

# ── Bot Identity ──────────────────────────────
TG_BOT_USERNAME=ohMyKickbot
WA_NUMBER=919999999999
NODE_ENV=development
PORT=3000

# ── Analytics ─────────────────────────────────
POSTHOG_API_KEY=                 # ⚠️ PENDING — from PostHog Cloud
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://ybkryfliqgfqgjwgniew.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_TG_BOT_USERNAME=ohMyKickbot
NEXT_PUBLIC_WA_NUMBER=919999999999
```

---

## Deploying to Production

### Vercel (Web + Poster API)

1. Push code to GitHub (`https://github.com/ainandaddy-cloud/ohMyKick`).
2. Import the repo in [Vercel](https://vercel.com) → select `apps/web` as the root directory.
3. Set env vars in Vercel project settings (same as `apps/web/.env.local`).
4. Deploy. Note your Vercel deployment URL (e.g. `https://ohmykick.vercel.app`).
5. Update `POSTER_SERVICE_URL` in Railway bot environment.

### Railway (Bot Server)

1. Create a new Railway project.
2. Add a **Redis** service (Railway marketplace).
3. Add a new **Service** → connect to GitHub → select `apps/bot`.
4. Set root directory to `apps/bot` and build command to `npm run build`.
5. Add all env vars from `apps/bot/.env` in Railway settings.
6. Copy the `REDIS_URL` from the Railway Redis service → set it in bot service env.
7. Copy `RAILWAY_PUBLIC_DOMAIN` (auto-injected) — the bot auto-registers the Telegram webhook on startup.

---

## Supabase Setup

Supabase project is already live at: `https://ybkryfliqgfqgjwgniew.supabase.co`

```bash
# Link locally (one time)
supabase link --project-ref ybkryfliqgfqgjwgniew

# Push schema migrations
supabase db push

# Seed World Cup 2026 matches
pnpm --filter bot run seed-matches
```

**Storage buckets** (already created):
- `posters` — public bucket for generated poster images
- `avatars` — public bucket for user photo uploads

**Required DB functions** (created by migration):
- `generate_fan_id(country_code)` — generates unique `ARG-047213` style IDs
- `generate_referral_code()` — generates unique 6-char codes
- `increment_user_points(user_id, points_to_add)` — atomic points increment

---

## WhatsApp Cloud API Setup

> ⚠️ This is currently the **#1 blocker** for a production launch.

1. Go to [Meta Developer Console](https://developers.facebook.com) → your app.
2. Add the **WhatsApp** product.
3. Under **WhatsApp → API Setup**, note:
   - `Phone Number ID`
   - `WhatsApp Business Account ID`
   - `Access Token` (generate a permanent token for production)
4. Set up webhook:
   - URL: `https://<your-railway-url>/webhook/whatsapp`
   - Verify Token: `ohmykick_webhook_secret`
   - Subscribe to: `messages`
5. Submit **5 message templates** for approval (see PRD Section 14).

---

## Telegram Bot Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram.
2. `/newbot` → name: `OhMyKick` → username: `ohMyKickbot`
3. Copy the bot token → set as `TELEGRAM_BOT_TOKEN`.
4. Set bot description and profile photo via BotFather.
5. Webhook is **auto-registered** on bot startup when `RAILWAY_PUBLIC_DOMAIN` is set.

---

## Vercel (Web + Poster API)

The web app serves:
- `/` — Landing page
- `/<referral-code>` — Referral redirect (→ Telegram deep link)
- `/p/<posterId>` — Public poster viewer
- `/api/posters/passport` — Fan Passport PNG (Edge function)
- `/api/posters/prematch` — Pre-match poster PNG (Edge function)
- `/api/posters/result` — Result poster PNG (Edge function, 3 variants: PERFECT/CORRECT_WINNER/WRONG)

All poster endpoints run on Vercel Edge Runtime (`export const runtime = 'edge'`) for low-latency image generation worldwide.

---

## Railway (Bot Server + Redis)

The bot server (`apps/bot`) handles:
- `POST /webhook/whatsapp` — WhatsApp message processing
- `POST /webhook/telegram` — Telegram message processing
- `GET /health` — Health check endpoint
- Cron: `*/2 * * * *` — Match result polling via API-Football

BullMQ workers run in the same process:
- **posterQueue** (concurrency: 20) — generates poster PNG → uploads to Supabase Storage → enqueues notification
- **notifyQueue** (concurrency: 50) — sends poster to user via WhatsApp/Telegram

---

## API Keys You Need

| Key | Where to Get | Status |
|-----|-------------|--------|
| `WHATSAPP_ACCESS_TOKEN` | [Meta Developer Console](https://developers.facebook.com) | ⚠️ **PENDING** |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta Developer Console → WhatsApp API Setup | ⚠️ **PENDING** |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Meta Developer Console → WhatsApp API Setup | ⚠️ **PENDING** |
| `API_FOOTBALL_KEY` | [RapidAPI — API-Football](https://rapidapi.com/api-sports/api/api-football) | ⚠️ **PENDING** |
| `POSTHOG_API_KEY` | [PostHog Cloud](https://app.posthog.com) → Project Settings | ⚠️ **PENDING** |
| `TELEGRAM_BOT_TOKEN` | [@BotFather](https://t.me/BotFather) | ✅ Configured |
| `SUPABASE_URL` + keys | Supabase project settings | ✅ Configured |

---

## Phase Status

### Phase 1 — Core Launch (Current) ✅ In Development

| Feature | Status |
|---------|--------|
| Bot server (Fastify + Telegraf) | ✅ Built |
| WhatsApp webhook handler | ✅ Built |
| Telegram webhook handler | ✅ Built |
| Onboarding flow (NEW → REGISTERED) | ✅ Built |
| Prediction flow (winner + score) | ✅ Built |
| Fan Passport poster (`@vercel/og`) | ✅ Built |
| Pre-match poster | ✅ Built |
| Result poster (3 variants) | ✅ Built |
| Referral system | ✅ Built |
| BullMQ poster queue | ✅ Built |
| BullMQ notification queue | ✅ Built |
| Match result polling (API-Football) | ✅ Built |
| Result processing pipeline | ✅ Built |
| Supabase schema (all tables) | ✅ Deployed |
| Supabase Storage (posters + avatars) | ✅ Deployed |
| Web landing page (Next.js 14) | ✅ Built |
| Referral redirect page | ✅ Built |
| Poster viewer page | ✅ Built |
| i18n (EN / ML / AR) | ✅ Built |
| PostHog event tracking | ✅ Built (pending API key) |
| Railway deploy | 🔲 Pending |
| Vercel deploy | 🔲 Pending |
| WhatsApp API credentials | 🔲 **Pending** |
| API-Football key | 🔲 **Pending** |
| WhatsApp templates approved | 🔲 Pending |
| All 48 matches seeded in DB | 🔲 Pending (run `seed-matches`) |
| Sentry error tracking | 🔲 Not implemented |
| Load test (100 concurrent users) | 🔲 Pending |

### Phase 2 — Growth (Locked until Phase 1 metrics confirmed)

- Global leaderboard (`/leaderboard` command)
- Friend leagues (create/join private groups)
- Fan Level system (FAN → SUPPORTER → LEGEND)
- City Wars leaderboard
- AI match preview (OpenAI/Anthropic)

### Phase 3 — Scale (Post-Phase 2)

- Fan Personality Report (end of tournament)
- World Cup Recap
- AI-generated poster styles
- Live match momentum voting

---

## Launch Checklist

Complete these before Day 8 soft launch:

**Technical**
- [ ] WhatsApp webhook live and verified at Meta Developer Console
- [ ] Telegram webhook live and auto-registered via Railway
- [ ] All 5 WhatsApp message templates submitted and approved
- [ ] All 48 Group Stage matches seeded in Supabase
- [ ] Poster generation tested end-to-end for all 5 types
- [ ] Result pipeline tested with `POST /dev/mock-result`
- [ ] `REDIS_URL` set from Railway Redis service
- [ ] `POSTER_SERVICE_URL` set to production Vercel URL
- [ ] PostHog API key added and events flowing
- [ ] Sentry DSN configured (see Section 24 of PRD)
- [ ] Load test: 100 concurrent users → <800ms bot response

**Business**
- [ ] WhatsApp number has display name + profile photo set
- [ ] Telegram bot profile photo and description set
- [ ] ohmykick.com domain DNS pointed to Vercel
- [ ] 50-person beta complete with passing metrics
- [ ] 30 WhatsApp football group admins identified for outreach

---

*OhMyKick · Phase 1 · World Cup 2026 · Built by the ainandaddy-cloud team*
