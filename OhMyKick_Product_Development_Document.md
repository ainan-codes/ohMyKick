# OhMyKick — PRODUCT DEVELOPMENT DOCUMENT
## FIFA World Cup 2026 Fan Prediction Platform
### Version 1.0 | Prepared for Development Team | June 2026

---

## DOCUMENT PURPOSE

This is the complete product specification for OhMyKick — a WhatsApp and Telegram-first football fan platform built for the FIFA World Cup 2026 (June 11 – July 19, 2026). This document is self-contained. The development team requires no prior context. Everything needed to build, deploy, and launch the product is in this document.

Do not build anything not described here in Phase 1. Every feature not in this document is explicitly out of scope until Phase 2 or later.

---

## TABLE OF CONTENTS

1. Product Vision
2. What This Product Is (and Is Not)
3. Target Users
4. Tech Stack
5. System Architecture
6. Database Schema
7. Phase 1 Features — Full Specification
8. Conversation Flows — Verbatim
9. Poster Specifications
10. WhatsApp Integration
11. Telegram Integration
12. Match Data Integration
13. Poster Generation Pipeline
14. Notification Strategy
15. Referral System
16. Leaderboard System
17. Phase 2 Features (Post-Match 5)
18. Phase 3 Features (Post-Round of 16)
19. End of Tournament Features
20. Phase Gate Metrics
21. Non-Functional Requirements
22. What NOT to Build in Phase 1
23. Launch Sequence
24. Monitoring & Analytics Setup

---

# SECTION 1: PRODUCT VISION

**OhMyKick** is a World Cup fan engagement platform that lives entirely inside WhatsApp and Telegram. There is no app to download. There is no website to visit for core functionality. The entire product — onboarding, predictions, passport delivery, result posters, referral-driven growth — happens through conversational bot interfaces.

**The core loop:**
A user sends "Hi" to the OhMyKick WhatsApp number or Telegram bot → completes a 2-minute onboarding → receives a personalised Fan Passport card → predicts upcoming matches → receives a beautiful result poster automatically after each match ends → shares the poster to their WhatsApp Status and groups → friends see it → friends join → loop repeats.

**The primary objective is not monetisation. It is:**
- Building the largest possible database of verified football fans with declared team allegiance
- Maximum viral sharing through every poster
- Daily engagement throughout the 64-day tournament
- Referral-driven user growth

**The product window:** June 11 – July 19, 2026. 64 matches. Every match is an engagement and acquisition event.

---

# SECTION 2: WHAT THIS PRODUCT IS (AND IS NOT)

**IS:**
- A WhatsApp bot that onboards users, takes predictions, and delivers personalised poster images
- A Telegram bot with identical functionality
- A poster generation engine that produces beautiful, shareable PNG images personalised to each user
- A referral tracking system embedded in every poster — the primary user acquisition engine

**IS NOT:**
- A website or web app (the website is a landing page only)
- A native iOS or Android app
- A fantasy football points/team selection game
- A news or content platform
- A betting product
- A product requiring any third-party workflow tool (no n8n, no Zapier)

**The website (ohmykick.com) does exactly three things:**
1. Landing page explaining the product with a "Message us on WhatsApp" / "Open in Telegram" button
2. Referral landing page (`ohmykick.com/[REFERRAL_CODE]`) that deep-links to WhatsApp/Telegram
3. Poster viewer (`ohmykick.com/p/[POSTER_ID]`) — publicly viewable URL for sharing on Instagram and Twitter

---

# SECTION 3: TARGET USERS

**Primary Markets (Phase 1 launch targets):**
- Kerala, India — 35 million football-passionate fans, WhatsApp-saturated, dense social networks
- GCC (UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, Oman) — 15 million Arabic-speaking football fans, WhatsApp and Telegram heavy users

**User Behaviour Profile:**
- Uses WhatsApp 50+ times daily
- Already in multiple football discussion WhatsApp groups
- Shares WhatsApp Status content regularly
- Has strong national/club team allegiance
- Does not want to download another app
- Will share a beautiful image of themselves as a football fan without hesitation

**Languages to support at launch:** English, Malayalam, Arabic
*(All conversation flows must be built with multi-language support from Day 1, even if only English is live at launch)*

---

# SECTION 4: TECH STACK

## 4.1 Core Services

| Layer | Technology | Version | Hosting | Purpose |
|-------|-----------|---------|---------|---------|
| Bot Server | Node.js | 20 LTS | Railway | Webhook handler, state machine, business logic |
| Framework | Fastify | 4.x | Railway | HTTP server (faster than Express for webhooks) |
| Database | Supabase (PostgreSQL 15) | Latest | Supabase Cloud | All persistent data |
| Storage | Supabase Storage | — | Supabase Cloud | Poster PNG files |
| Poster Generation | @vercel/og | Latest | Vercel | HTML/JSX → PNG conversion |
| Web Landing | Next.js 14 | 14.x | Vercel | Landing page + referral redirect + poster viewer |
| Message Queue | BullMQ + Redis | BullMQ 5.x | Railway (Redis add-on) | Async poster generation and delivery queue |
| Scheduler | Supabase pg_cron | — | Supabase | Match result polling, template message scheduling |
| Error Monitoring | Sentry | Latest | Sentry Cloud | Runtime error tracking |
| Analytics | PostHog | Latest | PostHog Cloud | Funnel analytics, event tracking |

## 4.2 Third-Party APIs

| API | Purpose | Plan | Cost Estimate |
|-----|---------|------|--------------|
| WhatsApp Cloud API (Meta) | WhatsApp bot messaging | Direct (Meta Tech Provider) | Per template message only (~$0.005–0.015/msg for India) |
| Telegram Bot API | Telegram bot messaging | Free | $0 |
| API-Football (RapidAPI) | Match schedule, live scores, results | Basic ($10/month) | $10/month |
| OpenAI / Anthropic (Phase 2) | AI football Q&A feature | Pay per use | Phase 2 only |

## 4.3 Key Libraries

```json
{
  "dependencies": {
    "fastify": "^4.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "telegraf": "^4.16.0",
    "bullmq": "^5.0.0",
    "ioredis": "^5.0.0",
    "axios": "^1.6.0",
    "sharp": "^0.33.0",
    "node-cron": "^3.0.0",
    "zod": "^3.22.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "vitest": "^1.0.0"
  }
}
```

## 4.4 Environment Variables

```env
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=

# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# Telegram
TELEGRAM_BOT_TOKEN=

# Match Data
API_FOOTBALL_KEY=
API_FOOTBALL_HOST=v3.football.api-sports.io

# Redis
REDIS_URL=

# Poster Service
POSTER_SERVICE_URL=https://yourapp.vercel.app

# App
APP_URL=https://ohmykick.com
NODE_ENV=production
PORT=3000
```

---

# SECTION 5: SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER CHANNELS                            │
│                                                                 │
│   WhatsApp (2.5B users)        Telegram (900M users)           │
│   Primary channel              Secondary channel               │
│   Kerala + GCC focus           GCC + global                    │
└──────────────┬──────────────────────────┬───────────────────────┘
               │                          │
               │ HTTPS Webhook            │ HTTPS Webhook
               ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BOT SERVER (Railway)                        │
│                   Node.js 20 + Fastify 4                        │
│                                                                 │
│  POST /webhook/whatsapp    POST /webhook/telegram               │
│         │                           │                          │
│         └──────────┬────────────────┘                          │
│                    ▼                                            │
│           Message Router                                        │
│         (identifies platform, user, message type)              │
│                    │                                            │
│                    ▼                                            │
│           State Machine                                         │
│         (loads user state from DB, routes to handler)          │
│                    │                                            │
│         ┌──────────┼──────────────┐                            │
│         ▼          ▼              ▼                             │
│    Onboarding  Prediction    Command                            │
│     Handler    Handler       Handler                            │
│         │          │              │                             │
│         └──────────┴──────────────┘                            │
│                    │                                            │
│           Response Builder                                      │
│         (formats response for WA or TG)                        │
│                    │                                            │
│           Message Sender                                        │
│         (calls WA API or TG API)                               │
└───────────────┬─────────────────────────────────────────────────┘
                │
      ┌─────────┼──────────────────────────────────┐
      │         │                                  │
      ▼         ▼                                  ▼
┌──────────┐ ┌──────────────────┐         ┌──────────────────────┐
│Supabase  │ │  Redis + BullMQ  │         │   Vercel             │
│          │ │  (Railway)       │         │                      │
│PostgreSQL│ │                  │         │  /api/posters/       │
│Storage   │ │  posterQueue     │────────▶│    passport          │
│Auth      │ │  notifyQueue     │         │    prematch          │
│          │ │  resultQueue     │         │    result-win        │
│Tables:   │ │                  │         │    result-partial    │
│- users   │ │  Processes jobs  │         │    result-loss       │
│- matches │ │  concurrently    │         │                      │
│- predict.│ │  (50 at a time)  │◀────────│  Returns PNG buffer  │
│- notifs  │ │                  │         │                      │
│- ...     │ └──────────────────┘         │  Next.js 14          │
└──────────┘                             │  Landing page        │
      ▲                                  │  Poster viewer       │
      │                                  │  Referral redirect   │
      │ pg_cron                          └──────────────────────┘
      │ (every 2 min during
      │  match windows)
      ▼
┌──────────────────────────┐
│  API-Football            │
│  Match result polling    │
│  Triggers result pipeline│
│  when match finishes     │
└──────────────────────────┘
```

---

# SECTION 6: DATABASE SCHEMA

Run these migrations in order. All tables use Row Level Security (RLS) in Supabase.

```sql
-- ============================================================
-- ENABLE EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";

-- ============================================================
-- TABLE: users
-- ============================================================
create table public.users (
  id                  uuid primary key default uuid_generate_v4(),
  
  -- Identity (at least one must be set)
  wa_id               text unique,                    -- WhatsApp phone number e.g. "919876543210"
  tg_id               text unique,                    -- Telegram user ID e.g. "123456789"
  
  -- Profile
  name                text not null,
  country_code        text not null,                  -- ISO 3166 alpha-2: 'AR', 'BR', 'IN', etc.
  country_name        text not null,                  -- 'Argentina', 'Brazil', etc.
  country_flag_emoji  text not null,                  -- '🇦🇷', '🇧🇷', etc.
  photo_url           text,                           -- Supabase Storage URL for user photo
  language            text not null default 'en',     -- 'en', 'ml', 'ar'
  
  -- Identity credentials
  fan_id              text unique not null,           -- 'ARG-047213' — never changes
  referral_code       text unique not null,           -- 'SAL7X2' — 6 chars alphanumeric
  referred_by         uuid references public.users(id),
  referral_count      integer not null default 0,
  
  -- Conversation state (bot state machine)
  conversation_state  text not null default 'NEW',
  -- States: NEW, ONBOARDING_NAME, ONBOARDING_COUNTRY, ONBOARDING_PHOTO,
  --         IDLE, PREDICTION_MATCH_SELECT, PREDICTION_WINNER, PREDICTION_SCORE,
  --         LEAGUE_CREATE_NAME, LEAGUE_JOIN_CODE
  
  pending_match_id    uuid,                           -- match being predicted (temp state)
  pending_winner      text,                           -- 'home', 'draw', 'away' (temp state)
  state_retries       integer not null default 0,     -- invalid input retry counter
  
  -- Engagement
  streak_count        integer not null default 0,
  last_prediction_date date,
  last_active_at      timestamptz,
  last_wa_message_at  timestamptz,                   -- track 24h free window
  last_tg_message_at  timestamptz,
  
  -- Fan level (Phase 2)
  fan_level           text not null default 'FAN',   -- 'FAN', 'SUPPORTER', 'LEGEND'
  total_points        integer not null default 0,
  
  -- Posters
  passport_poster_url text,                          -- Supabase Storage URL
  passport_poster_updated_at timestamptz,
  
  -- Meta
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Indexes
create index idx_users_wa_id on public.users(wa_id);
create index idx_users_tg_id on public.users(tg_id);
create index idx_users_referral_code on public.users(referral_code);
create index idx_users_country_code on public.users(country_code);
create index idx_users_total_points on public.users(total_points desc);

-- ============================================================
-- TABLE: matches
-- ============================================================
create table public.matches (
  id                  uuid primary key default uuid_generate_v4(),
  api_match_id        integer unique not null,        -- ID from API-Football
  
  -- Teams
  home_team           text not null,                  -- 'Argentina'
  away_team           text not null,                  -- 'Poland'
  home_country_code   text,                           -- 'AR'
  away_country_code   text,                           -- 'PL'
  home_flag_emoji     text,
  away_flag_emoji     text,
  
  -- Schedule
  kickoff_at          timestamptz not null,
  kickoff_local_ist   text,                           -- '9:00 PM IST' — pre-computed display string
  stage               text not null,                  -- 'GROUP_A', 'R16', 'QF', 'SF', 'FINAL'
  venue               text,
  
  -- Status
  status              text not null default 'SCHEDULED',
  -- SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED
  
  -- Results (null until finished)
  home_score          integer,
  away_score          integer,
  
  -- Prediction window
  prediction_open     boolean not null default true,  -- false = locked at kickoff
  
  -- Content
  match_preview_text  text,                           -- AI or manual match preview (Phase 2)
  
  -- Meta
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_matches_kickoff on public.matches(kickoff_at);
create index idx_matches_status on public.matches(status);
create index idx_matches_api_id on public.matches(api_match_id);

-- ============================================================
-- TABLE: predictions
-- ============================================================
create table public.predictions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  match_id            uuid not null references public.matches(id),
  
  -- Prediction
  predicted_winner    text not null,                  -- 'HOME', 'DRAW', 'AWAY'
  predicted_home_score integer not null,
  predicted_away_score integer not null,
  
  -- Optional Phase 2 predictions
  predicted_first_scorer text,                        -- player name (Phase 2)
  
  -- State
  is_locked           boolean not null default false, -- true when match kicks off
  
  -- Result (null until match finishes)
  result_type         text,
  -- 'PERFECT'          = exact score correct (25 pts)
  -- 'CORRECT_WINNER'   = winner correct, score wrong (10 pts)
  -- 'WRONG'            = everything wrong (0 pts)
  
  points_earned       integer,
  
  -- Poster URLs (Supabase Storage)
  prematch_poster_url text,
  result_poster_url   text,
  
  -- Notification tracking
  prematch_poster_sent_wa  boolean default false,
  prematch_poster_sent_tg  boolean default false,
  result_poster_sent_wa    boolean default false,
  result_poster_sent_tg    boolean default false,
  
  -- Meta
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  
  unique(user_id, match_id)
);

create index idx_predictions_user on public.predictions(user_id);
create index idx_predictions_match on public.predictions(match_id);
create index idx_predictions_result_type on public.predictions(result_type);

-- NOTE: friend_leagues and friend_league_members tables are Phase 2.
-- Do NOT create them now. They will be added via migration when Phase 2 is unlocked.

-- ============================================================
-- TABLE: notification_log
-- ============================================================
create table public.notification_log (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id),
  channel             text not null,                  -- 'WHATSAPP', 'TELEGRAM'
  notification_type   text not null,
  -- 'PASSPORT', 'PREMATCH_POSTER', 'RESULT_POSTER',
  -- 'MATCH_REMINDER', 'STREAK_WARNING', 'WELCOME_BACK'
  status              text not null default 'PENDING', -- 'SENT', 'FAILED', 'PENDING'
  error_message       text,
  sent_at             timestamptz,
  created_at          timestamptz not null default now()
);

create index idx_notif_user on public.notification_log(user_id);
create index idx_notif_type on public.notification_log(notification_type);

-- NOTE: leaderboard VIEW and country_war VIEW are Phase 2.
-- Do NOT create them now. Accuracy % and points for poster display are
-- calculated inline with a simple query against the predictions table.
-- Phase 2 migration will add these views when the leaderboard feature is unlocked.

-- ============================================================
-- FUNCTION: generate_fan_id
-- ============================================================
create or replace function generate_fan_id(p_country_code text)
returns text language plpgsql as $$
declare
  v_num integer;
  v_fan_id text;
  v_exists boolean;
begin
  loop
    v_num := floor(random() * 900000 + 100000)::integer;
    v_fan_id := upper(p_country_code) || '-' || v_num::text;
    select exists(select 1 from public.users where fan_id = v_fan_id) into v_exists;
    exit when not v_exists;
  end loop;
  return v_fan_id;
end;
$$;

-- ============================================================
-- FUNCTION: generate_referral_code
-- ============================================================
create or replace function generate_referral_code()
returns text language plpgsql as $$
declare
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code text := '';
  v_exists boolean;
  i integer;
begin
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::integer, 1);
    end loop;
    select exists(select 1 from public.users where referral_code = v_code) into v_exists;
    exit when not v_exists;
  end loop;
  return v_code;
end;
$$;

-- ============================================================
-- TRIGGER: update updated_at on users
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at before update on public.users
  for each row execute function update_updated_at();

create trigger matches_updated_at before update on public.matches
  for each row execute function update_updated_at();

create trigger predictions_updated_at before update on public.predictions
  for each row execute function update_updated_at();
```

---

# SECTION 7: PHASE 1 FEATURES — FULL SPECIFICATION

Phase 1 is the only thing that ships before the World Cup starts on June 11. It is a complete product with these exact features and nothing else.

## 7.1 Fan Passport

**What it is:** A personalised digital identity card for each user. Generated once at signup. Updated after each match with latest stats (points, rank, streak). Delivered as a PNG image.

**Triggers generation:**
- On completion of onboarding (initial creation)
- When user sends "passport" or "my card" (regenerated with latest stats)
- When user's stats change significantly (Phase 2 — optional re-push)

**Data shown on passport:**
- User's name
- Country flag and name
- Fan ID (e.g., ARG-047213)
- Fan Level badge
- Total points and accuracy % (e.g., "312 pts · 63% accuracy")
- Streak count
- Friends referred count
- Referral code and URL

**Storage:** PNG stored in Supabase Storage at `passports/{user_id}.png`. Public URL used for delivery.

## 7.2 Match Prediction

**What it is:** Before each match, users predict (1) who wins, (2) exact score. Both predictions are locked at kickoff.

**Prediction types:**
- Winner: TEAM1 WIN, DRAW, TEAM2 WIN — stored in DB as `'HOME'`, `'DRAW'`, `'AWAY'` (API convention for first/second listed team, not geographic home/away)
- Exact score: Integer goals for each team (0–20)

**Important:** Buttons shown to users always display the actual team name (e.g., "Argentina / Draw / Poland") — never "Home Win" or "Away Win".

**Points:**
- Correct exact score: 25 points
- Correct winner only: 10 points
- Wrong: 0 points

**Locking:** A Supabase Edge Function runs every 60 seconds and sets `prediction_open = false` on matches where `kickoff_at <= now()`. Once locked, no new predictions accepted and no existing ones modified.

**Validation:**
- If winner = HOME but score has home ≤ away: reject with helpful message
- If winner = AWAY but score has away ≤ home: reject with helpful message
- If winner = DRAW but scores are not equal: auto-correct scores to both equal (use home score for both, or default to 0-0)
- Score values: 0–20 only. Reject anything outside range.
- Maximum 3 invalid inputs per prediction session → clear state → send main menu

## 7.3 Pre-Match Poster

**What it is:** A PNG image delivered to the user immediately after they submit a prediction. Shows their prediction, name, country, referral code.

**Delivery:** Immediately after prediction is confirmed. Poster is generated asynchronously (queued) but should complete within 10 seconds. While generating, send a text confirmation first, then send the image when ready.

**Text confirmation sent immediately:**
```
🔒 Prediction locked in!
[Team 1 Name] 🏳️ [Score] – [Score] 🏳️ [Team 2 Name]
Your poster is being prepared... 📸
```

**Poster sent when ready (within 10 seconds):**
Image + caption with share prompt and referral message.

## 7.4 Result Poster

**What it is:** A PNG image delivered automatically after each match ends. Three design variants based on outcome. The most important feature in the product.

**Delivery timing:** Within 5 minutes of match ending (status = FINISHED from API). Delivered without user needing to do anything.

**Design variants:**
1. **PERFECT** — User predicted exact score. Gold/triumph design. "YOU CALLED IT."
2. **CORRECT_WINNER** — Right winner, wrong score. Silver/respectful design. "Almost Perfect."
3. **WRONG** — Wrong prediction. Dark/dignified design. "Football surprises us all."

**Data shown on result poster:**
- User name and country flag
- Their prediction vs actual result (side by side)
- Points earned this match
- Total points and tournament accuracy % (e.g. "7/10 correct · 70% accuracy")
- Referral code and URL

**Note on rank:** Overall rank is NOT shown on Phase 1 result posters. Accuracy % is the shareable stat — it is personal, specific, and motivates people to share without requiring a global ranking query.

## 7.5 Referral System

**What it is:** Every user has a unique 6-character referral code. This code appears on every poster they receive. When a new user signs up via a referral link or enters a referral code, the referring user gets credit.

**Referral link format:** `ohmykick.com/[REFERRAL_CODE]` — redirects to WhatsApp or Telegram with pre-filled message.

**Credit tracking:** `referral_count` on the referring user's record. Displayed in their profile and on the passport card.

**No referral rewards in Phase 1.** Referral count is visible but no bonus points or rewards until Phase 2.

---

# SECTION 8: CONVERSATION FLOWS — VERBATIM

These are the exact messages the bot sends. Implement them exactly. Do not paraphrase.

## 8.1 State Machine States

```
NEW                     → User's first ever message
ONBOARDING_NAME         → Waiting for user to send their name
ONBOARDING_COUNTRY      → Waiting for user to select country
ONBOARDING_PHOTO        → Waiting for user to send photo or tap skip
IDLE                    → Registered, no active flow
PREDICTION_MATCH_SELECT → Waiting for user to select which match to predict
PREDICTION_WINNER       → Waiting for user to select winner
PREDICTION_SCORE        → Waiting for user to type score
```

Phase 2 will add: `LEAGUE_CREATE_NAME`, `LEAGUE_JOIN_CODE` — do not implement now.

## 8.2 Global Keywords (work in any state)

| User sends | Bot action |
|-----------|-----------|
| `hi`, `hello`, `hey`, `start` (when IDLE or unknown state) | Send main menu |
| `predict`, `prediction` | Start prediction flow for next upcoming match |
| `passport`, `my card`, `card` | Send passport poster |
| `streak` | Send streak status |
| `refer`, `invite`, `referral` | Send referral info |
| `help`, `menu` | Send main menu |
| `stop`, `unsubscribe` | Opt out of proactive notifications |

## 8.3 Flow 1: First Message / Onboarding

---

**TRIGGER:** User sends any first message to the bot.

**BOT → [Text Message]**
```
⚽ Welcome to OhMyKick!

Predict every World Cup 2026 match.
Get your personalised fan poster after each result.
Compete with fans worldwide.

Takes 2 minutes. Free. No app needed.

First — what's your name?
```
*Set state: ONBOARDING_NAME*

---

**USER sends their name (e.g., "Saleem")**

**Validation:** Name must be 2–40 characters, no special characters except spaces and hyphens. If invalid, re-prompt once.

**BOT → [Interactive List Message]**
```
Nice to meet you, Saleem! 🙌

Which country do you support in the World Cup 2026?
```
*[List button label: "Choose Country"]*

*List rows (grouped):*
```
Section: TOP PICKS
  Argentina 🇦🇷
  Brazil 🇧🇷
  France 🇫🇷
  England 🏴󠁧󠁢󠁥󠁮󠁧󠁿
  Portugal 🇵🇹
  Spain 🇪🇸
  Germany 🇩🇪
  Morocco 🇲🇦

Section: ALL TEAMS (A–M)
  Australia 🇦🇺
  Belgium 🇧🇪
  Canada 🇨🇦
  Croatia 🇭🇷
  Denmark 🇩🇰
  Ecuador 🇪🇨
  Iran 🇮🇷
  Japan 🇯🇵
  Mexico 🇲🇽

Section: ALL TEAMS (N–Z)
  Netherlands 🇳🇱
  Nigeria 🇳🇬
  Poland 🇵🇱
  Senegal 🇸🇳
  Serbia 🇷🇸
  South Korea 🇰🇷
  Switzerland 🇨🇭
  USA 🇺🇸
  Uruguay 🇺🇾
  [remaining 32 qualified teams]
```
*Set state: ONBOARDING_COUNTRY*

---

**USER selects a country (e.g., "Argentina 🇦🇷")**

**BOT → [Button Message]**
```
🇦🇷 Argentina — a fan of champions. 

Add a photo to your fan passport?
Your photo makes your match posters personal and more shareable.

(You can skip and add later)
```
*Buttons:*
- `📸 Send My Photo`
- `⏭ Skip for Now`

*Set state: ONBOARDING_PHOTO*

---

**USER sends a photo:**
- Download photo from WhatsApp/Telegram media URL
- Upload to Supabase Storage at `photos/{user_id}.jpg`
- Set `photo_url` on user record

**USER taps "Skip for Now":**
- `photo_url` remains null
- Passport uses country flag as avatar

**[Either path] — Generate Fan Passport, then:**

**BOT → [Image Message — Passport PNG] + caption:**
```
🎉 Your Fan Passport is ready, Saleem!

🆔 Fan ID: ARG-047213
🌍 Team: Argentina 🇦🇷
⭐ Level: Fan

Your referral code: SAL7X2
Every friend who joins with your code is on your record.

Share this to your WhatsApp Status 👆

━━━━━━━━━━━━━━━━
⚽ Ready to make your first prediction?
```
*Buttons:*
- `⚽ Predict Now`
- `📊 See Leaderboard`

*Set state: IDLE*

---

## 8.4 Flow 2: Match Prediction

---

**TRIGGER:** User taps "Predict Now" OR sends keyword `predict`

**Step 1 — Match Selection**

*If only one match upcoming today:*

**BOT → [Button Message]**
```
⚽ Today's match:

🇦🇷 Argentina vs Poland 🇵🇱
📅 June 26 | 9:00 PM IST
🏆 Group C

Who wins?
```
*Buttons:*
- `🇦🇷 Argentina`
- `🤝 Draw`
- `🇵🇱 Poland`

*Set state: PREDICTION_WINNER, store pending_match_id*

---

*If multiple matches today:*

**BOT → [Interactive List Message]**
```
⚽ Today's matches — pick one to predict:
```
*List button: "Choose Match"*
*List rows (one per match):*
```
Argentina 🇦🇷 vs Poland 🇵🇱 — 9:00 PM IST
France 🇫🇷 vs Denmark 🇩🇰 — 6:30 PM IST
Brazil 🇧🇷 vs Cameroon 🇨🇲 — 12:00 AM IST
```

*After user selects:*

**BOT → [Button Message]**
```
⚽ Argentina 🇦🇷 vs Poland 🇵🇱
📅 9:00 PM IST | Group C

Who wins?
```
*Buttons: Argentina / Draw / Poland*

*Set state: PREDICTION_WINNER, store pending_match_id*

---

**Step 2 — Score Input**

**USER taps winner (e.g., "🇦🇷 Argentina")**

**BOT → [Text Message]**
```
Argentina to win 🇦🇷 ✅

Now — what's the exact score?

Type like this: *2-1*
(Argentina goals first, then Poland)

Get it exact = 25 points 🏆
Correct winner only = 10 points
```
*Set state: PREDICTION_SCORE, store pending_winner = 'HOME'*

---

**USER types score (e.g., "2-1")**

**Validation logic:**
```
Parse score from text:
  Accept: "2-1", "2 1", "2:1", "2–1", "2 - 1"
  Reject anything that doesn't yield two non-negative integers ≤ 20

Consistency check:
  If pending_winner = HOME and home_score <= away_score → reject
  If pending_winner = AWAY and away_score <= home_score → reject
  If pending_winner = DRAW and home_score ≠ away_score → auto-set both to home_score

On 3rd consecutive invalid input:
  "Having trouble? Let's start over." → clear state → send main menu
```

**If valid:**

**BOT → [Text Message — Sent Immediately]**
```
🔒 Locked in!

Argentina 🇦🇷 2 – 1 🇵🇱 Poland

Your matchday poster is on its way... 📸
```

*Queue poster generation job. Deliver image within 10 seconds.*

**BOT → [Image Message — Pre-Match Poster] + caption:**
```
Your prediction is live, Saleem 🔥

Share this before the match starts.
If you're right, I'll send you the proof 🏆

Your referral code is on the poster.
Invite friends: ohmykick.com/SAL7X2
```

*Set state: IDLE. Clear pending_match_id and pending_winner.*

---

## 8.5 Flow 3: Result Poster Delivery (Automated)

**This flow is triggered by the result pipeline — not by a user message. The bot initiates contact.**

**TRIGGER:** Match status changes to FINISHED. For all predictions for that match.

---

**Variant A — PERFECT (exact score correct)**

**BOT → [Image Message — Result Poster GOLD] + caption:**
```
🏆 YOU CALLED IT, SALEEM!

Argentina 2 – 1 Poland ✅ EXACT SCORE!

+25 points earned
🎯 Tournament accuracy: 67%
📊 Rank: #1,247 globally | #43 among Argentina fans

You're in the top 5% of Argentina supporters 🇦🇷

Share this. Everyone needs to know 👆
```
*Buttons:*
- `⚽ Predict Next Match`
- `📨 Invite Friends`

---

**Variant B — CORRECT_WINNER (right team, wrong score)**

**BOT → [Image Message — Result Poster SILVER] + caption:**
```
⚽ Nearly perfect, Saleem.

You called the winner: Argentina ✅
Exact score: Not quite (you said 2-1, it was 1-0)

+10 points earned
📊 Rank: #2,891 globally

The exact score is 25 points. Next match 🎯
```
*Buttons:*
- `⚽ Predict Next Match`
- `📨 Invite Friends`

---

**Variant C — WRONG (incorrect)**

**BOT → [Image Message — Result Poster DARK] + caption:**
```
Football can be cruel, Saleem.

Your pick: Argentina 2-1 Poland
What happened: Poland 1-0 Argentina

+0 points this match
📊 5/8 correct · 63% accuracy

Every great predictor gets this wrong sometimes.
Next match is your chance 🔥
```
*Buttons:*
- `⚽ Predict Next Match`
- `📨 Invite Friends`

---

## 8.6 Flow 4: Passport Request

**TRIGGER:** User sends `passport`, `my card`, or taps passport button.

*Regenerate passport poster with latest stats. Replace stored PNG.*

**BOT → [Image Message — Passport PNG] + caption:**
```
Your Fan Passport 🎫

Updated now with your latest:
⚽ 8 predictions | 🎯 63% accuracy
🔥 6-day streak | 👥 4 friends referred

Share it 👆
```

---

## 8.8 Flow 6: Referral

**TRIGGER:** User sends `refer`, `invite`, or `referral`.

**BOT → [Text Message]**
```
📨 INVITE YOUR FRIENDS

Your code: *SAL7X2*
Your link: ohmykick.com/SAL7X2

━━━━━━━━━━━━━━━
Copy and send this:

"I'm predicting every World Cup match on OhMyKick.
My fan passport: ohmykick.com/SAL7X2

Join, predict against me, and let's see who really knows football ⚽🏆"
━━━━━━━━━━━━━━━

Friends referred so far: *4*
```

---

## 8.9 Flow 7: Main Menu

**TRIGGER:** User sends `help`, `menu`, `hi`, `hello`, or an unrecognised message in IDLE state.

**BOT → [Interactive List Message]**
```
⚽ OhMyKick — World Cup 2026

What do you want to do?
```
*List button: "Open Menu"*

```
Section: PREDICTIONS
  ⚽ Predict a match
  📋 My predictions

Section: MY PROFILE
  🎫 My fan passport
  🔥 My streak

Section: INVITE
  📨 Invite friends

Section: HELP
  ℹ️ How does OhMyKick work?
```

---

## 8.10 Flow 8: Streak Status

**TRIGGER:** User sends `streak`.

**BOT → [Text Message]**
```
🔥 YOUR STREAK

Current streak: *14 days*
Best streak: *14 days* (ongoing!)

You've predicted in 14 consecutive days.
Don't break it — predict today's match to keep it alive.

Streaks reset at midnight if you miss a day.
```

---

# SECTION 9: POSTER SPECIFICATIONS

## 9.1 Technical Specifications

| Property | Value |
|---------|-------|
| Dimensions | 1080 × 1920 px |
| Ratio | 9:16 (WhatsApp Status + Instagram Stories native) |
| Format | PNG |
| Max file size | 2MB (optimised) |
| Safe zone | 900 × 1700 px (90px margin all sides) |
| Colour space | sRGB |
| DPI | 72 (screen only) |
| Delivery format | Downloaded binary uploaded to Supabase Storage → public URL |

## 9.2 Poster Types and Design Requirements

### Passport Card

**Purpose:** User identity. First thing they receive and share.

**Required elements:**
- Background: Dark gradient (navy to black). Premium feel.
- Top: "WORLD CUP 2026" in small caps, subtle, top center
- Center-top: "FAN PASSPORT" in large display font, gold colour
- Center: User photo (circular, 280px diameter, gold border 6px) OR country flag (if no photo)
- Name: Large display font, white, below photo. All caps.
- Country: Flag emoji + country name, gold colour
- Fan ID: Monospace font, grey, small. "FAN ID: ARG-047213"
- Fan Level badge: Small pill badge "⭐ FAN" / "🌟 SUPPORTER" / "💎 LEGEND"
- Points + Streak: Small stats row
- Bottom: Referral URL "ohmykick.com/SAL7X2" in small grey text
- Bottom edge: Thin gold horizontal line, "OhMyKick" wordmark centered below

**Tone:** Prestigious. Like a real document someone would be proud to own.

### Pre-Match Poster

**Purpose:** Declaration of prediction. Shared BEFORE the match to groups.

**Required elements:**
- Background: Team colours blend (left half = home team's primary colour, right half = away team's primary colour, blended at center with gradient)
- Top: Match stage + date ("Group C · June 26, 2026")
- Center: Home flag | "VS" | Away flag — large, proud
- Below flags: Team names in large type
- User's prediction: Styled score display "2 – 1" with team abbreviations
- User name: "Predicted by SALEEM" in medium type
- Country allegiance: User's flag + "🇦🇷 Argentina Supporter"
- Bottom: Referral code + URL
- Tone: Confident. A public declaration.

### Result Poster — PERFECT (Gold)

**Purpose:** Celebration. The product's crown jewel. Must look like winning something real.

**Required elements:**
- Background: Deep black with gold particle/confetti effect
- Very top: "⚽ WORLD CUP 2026" small
- Large centered: "YOU CALLED IT" in massive gold display type
- Below: Match result "Argentina 2 – 1 Poland" with both team flags
- Below: User's prediction "Your prediction: 2 – 1" in green ✅
- Trophy or star graphic: Prominent center element
- Stats row: "+25 pts · #1,247 globally · 67% accuracy"
- User name + country flag
- Bottom: Referral code + "Share your gift: ohmykick.com/SAL7X2"
- Tone: Championship. User must feel like they won something.

### Result Poster — CORRECT WINNER (Silver)

**Purpose:** Respectful acknowledgment. Good but not perfect.

**Required elements:**
- Background: Dark silver/steel gradient
- Top: "⚽ WORLD CUP 2026"
- Large: "ALMOST PERFECT" in silver display type
- Match result with flags
- Two rows: "Your prediction: 2-1 ❌" | "Actual result: 1-0"
- Tick on winner: "Winner: ✅ Argentina"
- Stats: "+10 pts · current rank"
- User name + country flag
- Bottom: Referral code + URL
- Tone: Dignified recognition. Not embarrassing.

### Result Poster — WRONG (Dark/Dignified)

**Purpose:** Beautiful heartbreak. Must be shareable despite being a loss. Key insight: beauty makes loss shareable.

**Required elements:**
- Background: Very dark blue/navy, subtle rain or fog texture overlay
- Top: "⚽ WORLD CUP 2026"
- Large: "FOOTBALL CAN BE CRUEL" in dark grey, almost whispered
- Match result with flags
- User's prediction crossed out: "Your call: Argentina 2-1 ❌"
- Actual result: "What happened: Poland 1-0"
- Stats: "+0 pts this match · rank position"
- User name + country flag
- Small: "Next match. Same passion." at bottom
- Referral code
- Tone: A true fan accepts defeat with dignity. Make it feel emotional, not shameful.

## 9.3 Design Assets Required from Designer

The designer must produce before development begins:

1. Figma file with all 5 poster types at 1080×1920px — final design, not wireframe
2. Export all fonts used as `.ttf` files (must be Google Fonts or licensed)
3. Country colour map: primary and secondary hex colours for all 32 World Cup nations
4. Country flag SVG/PNG files for all 32 nations (high resolution)
5. OhMyKick wordmark/logo in SVG format, white and gold variants
6. Icon set: trophy, star, streak fire, referral icon (SVG, white)

---

# SECTION 10: WHATSAPP INTEGRATION

## 10.1 API Details

**API Type:** WhatsApp Cloud API (Meta's direct API — no BSP intermediary needed)

**Base URL:** `https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages`

**Auth:** Bearer token (`WHATSAPP_ACCESS_TOKEN`)

**Webhook verification:**
```
GET /webhook/whatsapp
Query params: hub.mode, hub.verify_token, hub.challenge
If hub.verify_token === WHATSAPP_WEBHOOK_VERIFY_TOKEN → return hub.challenge
```

**Webhook events:**
```
POST /webhook/whatsapp
Body: { object: 'whatsapp_business_account', entry: [...] }
Always return HTTP 200 immediately, then process asynchronously
```

## 10.2 Message Types Used

**Text message:**
```json
{
  "messaging_product": "whatsapp",
  "to": "919876543210",
  "type": "text",
  "text": { "body": "Message content here" }
}
```

**Interactive — Buttons (max 3 buttons):**
```json
{
  "messaging_product": "whatsapp",
  "to": "919876543210",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": { "text": "Who wins?" },
    "action": {
      "buttons": [
        { "type": "reply", "reply": { "id": "winner_home", "title": "🇦🇷 Argentina" } },
        { "type": "reply", "reply": { "id": "winner_draw", "title": "🤝 Draw" } },
        { "type": "reply", "reply": { "id": "winner_away", "title": "🇵🇱 Poland" } }
      ]
    }
  }
}
```

**Interactive — List (max 10 rows per section, multiple sections):**
```json
{
  "messaging_product": "whatsapp",
  "to": "919876543210",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "body": { "text": "Which country do you support?" },
    "action": {
      "button": "Choose Country",
      "sections": [
        {
          "title": "TOP PICKS",
          "rows": [
            { "id": "country_AR", "title": "Argentina 🇦🇷" },
            { "id": "country_BR", "title": "Brazil 🇧🇷" }
          ]
        }
      ]
    }
  }
}
```

**Image message:**
```json
{
  "messaging_product": "whatsapp",
  "to": "919876543210",
  "type": "image",
  "image": {
    "link": "https://your-supabase-url/storage/v1/object/public/posters/result_uuid.png",
    "caption": "You called it! Share this 🏆"
  }
}
```

**Template message (pre-approved — for business-initiated contact):**
```json
{
  "messaging_product": "whatsapp",
  "to": "919876543210",
  "type": "template",
  "template": {
    "name": "match_reminder",
    "language": { "code": "en" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Argentina vs Poland" },
          { "type": "text", "text": "3" }
        ]
      }
    ]
  }
}
```

## 10.3 Incoming Message Parsing

```typescript
interface WhatsAppWebhookBody {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: Array<{
          id: string;
          from: string;        // wa_id of sender
          type: string;        // 'text', 'interactive', 'image', 'audio', etc.
          timestamp: string;
          text?: { body: string };
          interactive?: {
            type: string;      // 'button_reply' or 'list_reply'
            button_reply?: { id: string; title: string };
            list_reply?: { id: string; title: string };
          };
          image?: { id: string; mime_type: string; sha256: string };
        }>;
        statuses?: Array<any>; // delivery receipts — ignore
      };
      field: string;
    }>;
  }>;
}

// Extract the meaningful parts:
function extractWhatsAppMessage(body: WhatsAppWebhookBody) {
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return null;

  return {
    waId: message.from,
    messageType: message.type,
    text: message.text?.body ?? '',
    buttonReplyId: message.interactive?.button_reply?.id ?? '',
    listReplyId: message.interactive?.list_reply?.id ?? '',
    hasImage: message.type === 'image',
    imageId: message.image?.id ?? null,
    timestamp: new Date(parseInt(message.timestamp) * 1000),
  };
}
```

## 10.4 Downloading User Photos from WhatsApp

```typescript
async function downloadWhatsAppMedia(mediaId: string): Promise<Buffer> {
  // Step 1: Get the media URL
  const urlResponse = await axios.get(
    `https://graph.facebook.com/v18.0/${mediaId}`,
    { headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` } }
  );
  const mediaUrl = urlResponse.data.url;

  // Step 2: Download the media
  const mediaResponse = await axios.get(mediaUrl, {
    headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` },
    responseType: 'arraybuffer',
  });

  return Buffer.from(mediaResponse.data);
}
```

## 10.5 Pre-Approved Templates Required

Submit these to Meta before launch. Approval takes 24–72 hours.

**Template 1: match_reminder**
```
Category: UTILITY
Body: ⚽ {{1}} kicks off in {{2}} hours!
You haven't predicted yet.
Reply "predict" to lock in your pick before kickoff.
```
Variables: {{1}} = match name (e.g., "Argentina vs Poland"), {{2}} = hours until kickoff

**Template 2: streak_warning**
```
Category: UTILITY
Body: ⚠️ {{1}}, your {{2}}-day prediction streak ends tonight!
Reply "predict" now to keep it alive.
```
Variables: {{1}} = user name, {{2}} = streak count

**Template 3: result_ready**
```
Category: UTILITY
Body: 🏆 The {{1}} result is in, {{2}}.
Your result poster is ready. Reply "result" to see it.
```
Variables: {{1}} = match name, {{2}} = user name

**Template 4: welcome_back**
```
Category: MARKETING
Body: ⚽ {{1}}, you've been away for {{2}} days!
{{3}} World Cup matches have been played since your last prediction.
Your rank has changed. Reply "predict" to get back in.
```

**Template 5: referral_joined**
```
Category: UTILITY
Body: 🎉 {{1}} just joined OhMyKick using your referral code!
You've now referred {{2}} friend(s).
```

---

# SECTION 11: TELEGRAM INTEGRATION

## 11.1 Setup

Create bot via @BotFather on Telegram:
```
/newbot → follow prompts → get TELEGRAM_BOT_TOKEN
/setcommands → set command list:
  predict - Predict a match
  passport - My fan passport
  rank - Leaderboard
  streak - My prediction streak
  refer - Invite friends
  help - Main menu
```

Set webhook:
```
POST https://api.telegram.org/bot{TOKEN}/setWebhook
Body: { url: "https://your-server.railway.app/webhook/telegram" }
```

## 11.2 Library: Telegraf.js

```typescript
import { Telegraf, Markup } from 'telegraf';
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Webhook mode (not polling — use for production)
app.post('/webhook/telegram', (req, reply) => {
  bot.handleUpdate(req.body);
  reply.send({ ok: true });
});
```

## 11.3 Sending Messages

**Text:**
```typescript
await bot.telegram.sendMessage(chatId, 'Message text', {
  parse_mode: 'Markdown'  // supports *bold*, _italic_, `code`
});
```

**Inline keyboard (buttons):**
```typescript
await bot.telegram.sendMessage(chatId, 'Who wins?',
  Markup.inlineKeyboard([
    [
      Markup.button.callback('🇦🇷 Argentina', 'winner_home'),
      Markup.button.callback('🤝 Draw', 'winner_draw'),
      Markup.button.callback('🇵🇱 Poland', 'winner_away'),
    ]
  ])
);
```

**Image with caption:**
```typescript
await bot.telegram.sendPhoto(chatId, {
  url: 'https://supabase-url/posters/result_uuid.png'
}, {
  caption: 'You called it! 🏆',
  parse_mode: 'Markdown',
  reply_markup: Markup.inlineKeyboard([
    [Markup.button.callback('⚽ Predict Next', 'predict')],
  ]).reply_markup
});
```

**Sending photo as buffer (for freshly generated posters):**
```typescript
await bot.telegram.sendPhoto(chatId, {
  source: imageBuffer,
  filename: 'result_poster.png'
}, { caption: 'Caption here' });
```

## 11.4 Receiving Messages

```typescript
// Text messages
bot.on('text', async (ctx) => {
  const tgId = ctx.from.id.toString();
  const text = ctx.message.text;
  const user = await getOrCreateUser(tgId, 'telegram');
  const response = await processMessage(user, { type: 'text', text });
  await sendTelegramResponse(ctx, response);
});

// Button callbacks
bot.on('callback_query', async (ctx) => {
  await ctx.answerCbQuery(); // must acknowledge within 10 seconds
  const tgId = ctx.from.id.toString();
  const data = ctx.callbackQuery.data;
  const user = await getOrCreateUser(tgId, 'telegram');
  const response = await processMessage(user, { type: 'callback', text: data });
  await sendTelegramResponse(ctx, response);
});

// Photo messages (for profile photo upload)
bot.on('photo', async (ctx) => {
  const tgId = ctx.from.id.toString();
  const user = await getOrCreateUser(tgId, 'telegram');
  if (user.conversation_state === 'ONBOARDING_PHOTO') {
    // Get the largest photo version
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const file = await ctx.telegram.getFile(photo.file_id);
    const photoUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    // Download and store
    await handlePhotoUpload(user, photoUrl, 'telegram');
  }
});
```

## 11.5 Telegram Advantages Over WhatsApp (for this product)

- No template approval needed — send any message to any user at any time for free
- No rate limits at small/medium scale (up to ~30 messages/second on free tier)
- File size limit is 50MB (vs 5MB for WhatsApp) — irrelevant for posters but good to know
- **Use Telegram as your primary notification channel** — match reminders, streak warnings, result alerts sent via Telegram even for users who primarily use WhatsApp (if they've also connected Telegram)
- Build and test conversation flows on Telegram first — iterate faster without API approval concerns

---

# SECTION 12: MATCH DATA INTEGRATION

## 12.1 API-Football (RapidAPI)

**Base URL:** `https://v3.football.api-sports.io`
**Headers:** `x-rapidapi-key: {API_FOOTBALL_KEY}` and `x-rapidapi-host: v3.football.api-sports.io`

**World Cup 2026 league ID:** Confirm from API-Football dashboard after tournament begins. Typically: FIFA World Cup = league ID 1. Season = 2026.

## 12.2 Key Endpoints

**Get all fixtures (matches):**
```
GET /fixtures?league=1&season=2026
```
Returns all 64 matches. Run once to seed the `matches` table. Re-run daily to sync any schedule changes.

**Get fixture by ID (for live score polling):**
```
GET /fixtures?id={api_match_id}
```
Returns current status and score. Use this in the polling loop.

**Response — match status values to handle:**
```
NS    = Not Started
1H    = First Half
HT    = Halftime
2H    = Second Half
ET    = Extra Time
PEN   = Penalties
FT    = Full Time (match finished — trigger result pipeline)
AET   = After Extra Time
P     = Penalties
SUSP  = Suspended
INT   = Interrupted
PST   = Postponed
CANC  = Cancelled
ABD   = Abandoned
```

**Trigger result pipeline when status changes to:** `FT`, `AET`, `P` (and score is set)

## 12.3 Match Seeding Script

```typescript
// Run once before tournament, re-run if schedule changes
async function seedMatches() {
  const response = await apifootball.get('/fixtures?league=1&season=2026');
  const fixtures = response.data.response;

  for (const fixture of fixtures) {
    await supabase.from('matches').upsert({
      api_match_id: fixture.fixture.id,
      home_team: fixture.teams.home.name,
      away_team: fixture.teams.away.name,
      home_country_code: getCountryCode(fixture.teams.home.name),
      away_country_code: getCountryCode(fixture.teams.away.name),
      home_flag_emoji: getFlagEmoji(fixture.teams.home.name),
      away_flag_emoji: getFlagEmoji(fixture.teams.away.name),
      kickoff_at: new Date(fixture.fixture.timestamp * 1000).toISOString(),
      kickoff_local_ist: formatISTTime(fixture.fixture.timestamp),
      stage: parseStage(fixture.league.round),
      venue: fixture.fixture.venue.name,
      status: 'SCHEDULED',
    }, { onConflict: 'api_match_id' });
  }
}
```

## 12.4 Match Polling Loop

```typescript
// Runs every 2 minutes — triggered by Supabase pg_cron
// Schedule: during tournament, run every 2 min from 12:00 to 23:59 UTC daily
// pg_cron: select cron.schedule('poll-matches', '*/2 * * * *', $$select poll_active_matches()$$);

async function pollActiveMatches() {
  // Get matches that should be live or recently finished
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .in('status', ['SCHEDULED', 'LIVE'])
    .lt('kickoff_at', new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()) // within 2 hours
    .gt('kickoff_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()); // within 4 hours ago

  for (const match of matches ?? []) {
    const apiData = await apifootball.get(`/fixtures?id=${match.api_match_id}`);
    const fixture = apiData.data.response[0];
    const apiStatus = fixture.fixture.status.short;

    // Lock predictions at kickoff
    if (['1H', 'HT', '2H', 'ET', 'PEN'].includes(apiStatus) && match.prediction_open) {
      await supabase.from('matches').update({ status: 'LIVE', prediction_open: false })
        .eq('id', match.id);
    }

    // Match finished — trigger result pipeline
    if (['FT', 'AET', 'P'].includes(apiStatus) && match.status !== 'FINISHED') {
      const homeScore = fixture.goals.home;
      const awayScore = fixture.goals.away;

      await supabase.from('matches').update({
        status: 'FINISHED',
        home_score: homeScore,
        away_score: awayScore,
        prediction_open: false,
      }).eq('id', match.id);

      // Trigger result processing
      await processMatchResult(match.id, homeScore, awayScore);
    }
  }
}
```

---

# SECTION 13: POSTER GENERATION PIPELINE

## 13.1 Architecture

Poster generation is the most performance-critical operation in the system. After a match ends, up to 50,000 posters may need to generate within 5 minutes. This requires:

1. **Async queue** (BullMQ + Redis) — jobs added to queue, workers process concurrently
2. **@vercel/og** — fast serverless HTML→PNG generation
3. **Supabase Storage** — persistent poster file storage
4. **Public URLs** — used for WhatsApp image delivery and Telegram photo delivery

## 13.2 Queue Configuration

```typescript
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Queues
export const posterQueue = new Queue('poster-generation', { connection: redis });
export const notifyQueue = new Queue('notifications', { connection: redis });

// Poster worker — 20 concurrent jobs
const posterWorker = new Worker('poster-generation', async (job) => {
  const { type, userId, matchId, resultType } = job.data;

  // 1. Fetch user and match data
  const [user, match, prediction] = await fetchPosterData(userId, matchId);

  // 2. Get user's current rank
  const rank = await getUserRank(userId);

  // 3. Build poster URL with parameters
  const posterUrl = buildPosterApiUrl(type, user, match, prediction, rank);

  // 4. Download poster PNG from Vercel
  const imageBuffer = await fetch(posterUrl).then(r => r.arrayBuffer());
  const buffer = Buffer.from(imageBuffer);

  // 5. Upload to Supabase Storage
  const path = `${type}/${userId}_${matchId}.png`;
  await supabase.storage.from('posters').upload(path, buffer, {
    contentType: 'image/png',
    upsert: true,
  });

  const publicUrl = supabase.storage.from('posters').getPublicUrl(path).data.publicUrl;

  // 6. Update prediction record with poster URL
  if (type === 'prematch') {
    await supabase.from('predictions').update({ prematch_poster_url: publicUrl })
      .eq('user_id', userId).eq('match_id', matchId);
  } else {
    await supabase.from('predictions').update({ result_poster_url: publicUrl })
      .eq('user_id', userId).eq('match_id', matchId);
  }

  // 7. Add to notification queue
  await notifyQueue.add('send-poster', { userId, posterUrl: publicUrl, type, resultType });

}, { connection: redis, concurrency: 20 });

// Notification worker — 50 concurrent sends
const notifyWorker = new Worker('notifications', async (job) => {
  const { userId, posterUrl, type, resultType } = job.data;

  const user = await getUser(userId);
  const caption = buildCaption(type, resultType, user);

  // Send via WhatsApp if user has wa_id and was active within 24h
  if (user.wa_id) {
    const isInFreeWindow = user.last_wa_message_at &&
      (Date.now() - new Date(user.last_wa_message_at).getTime()) < 24 * 60 * 60 * 1000;

    if (isInFreeWindow) {
      await sendWhatsAppImage(user.wa_id, posterUrl, caption);
    } else if (type === 'result') {
      // Use template for result notification if not in free window
      await sendWhatsAppTemplate(user.wa_id, 'result_ready', [
        matchName, user.name
      ]);
    }
  }

  // Send via Telegram if user has tg_id (no restrictions)
  if (user.tg_id) {
    await sendTelegramPhoto(user.tg_id, posterUrl, caption);
  }

  // Log notification
  await logNotification(userId, type, 'SENT');

}, { connection: redis, concurrency: 50 });
```

## 13.3 Poster API Routes (Vercel)

Create one API route per poster type. All routes are in the Next.js app at `/api/posters/`.

```typescript
// /api/posters/result/route.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name') ?? 'Fan';
  const countryName = searchParams.get('countryName') ?? '';
  const flagEmoji = searchParams.get('flagEmoji') ?? '🏳️';
  const photoUrl = searchParams.get('photoUrl') ?? null;
  const predictionHome = searchParams.get('predictionHome') ?? '0';
  const predictionAway = searchParams.get('predictionAway') ?? '0';
  const actualHome = searchParams.get('actualHome') ?? '0';
  const actualAway = searchParams.get('actualAway') ?? '0';
  const homeTeam = searchParams.get('homeTeam') ?? '';
  const awayTeam = searchParams.get('awayTeam') ?? '';
  const resultType = searchParams.get('resultType') ?? 'WRONG'; // PERFECT, CORRECT_WINNER, WRONG
  const points = searchParams.get('points') ?? '0';
  const overallRank = searchParams.get('overallRank') ?? '';
  const accuracy = searchParams.get('accuracy') ?? '0';
  const referralCode = searchParams.get('referralCode') ?? '';

  // Load fonts (cache in production)
  const bebasNeue = await fetch(
    'https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXoo9WdhyyTh89ZNpQ.woff2'
  ).then(r => r.arrayBuffer());

  const bgColor = resultType === 'PERFECT'
    ? 'linear-gradient(180deg, #0a0a0a 0%, #1a1200 100%)'
    : resultType === 'CORRECT_WINNER'
    ? 'linear-gradient(180deg, #0a0a0a 0%, #0a0a1a 100%)'
    : 'linear-gradient(180deg, #050510 0%, #0a0514 100%)';

  const headlineText = resultType === 'PERFECT'
    ? 'YOU CALLED IT'
    : resultType === 'CORRECT_WINNER'
    ? 'ALMOST PERFECT'
    : 'FOOTBALL CAN BE CRUEL';

  const headlineColor = resultType === 'PERFECT'
    ? '#FFD700'
    : resultType === 'CORRECT_WINNER'
    ? '#C0C0C0'
    : '#4a4a6a';

  return new ImageResponse(
    (
      <div style={{
        width: 1080, height: 1920,
        background: bgColor,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '80px 80px',
        fontFamily: 'Bebas Neue',
        position: 'relative',
      }}>
        {/* Tournament label */}
        <div style={{ fontSize: 32, color: '#666', letterSpacing: 8, marginBottom: 40 }}>
          ⚽ WORLD CUP 2026
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 120, color: headlineColor,
          textAlign: 'center', lineHeight: 1,
          marginBottom: 60,
        }}>
          {headlineText}
        </div>

        {/* Match result */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 40 }}>
          <div style={{ fontSize: 64, textAlign: 'center' }}>
            <div>{homeTeam}</div>
          </div>
          <div style={{ fontSize: 96, color: '#fff', fontWeight: 'bold' }}>
            {actualHome} – {actualAway}
          </div>
          <div style={{ fontSize: 64, textAlign: 'center' }}>
            <div>{awayTeam}</div>
          </div>
        </div>

        {/* Prediction vs actual */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 16, padding: '32px 48px',
          display: 'flex', flexDirection: 'column', gap: 16,
          marginBottom: 48, width: '100%',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 40, color: resultType === 'PERFECT' ? '#4ade80' : '#ef4444',
          }}>
            <span>Your prediction</span>
            <span>{predictionHome} – {predictionAway} {resultType === 'PERFECT' ? '✅' : '❌'}</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 40, color: '#888',
          }}>
            <span>Actual result</span>
            <span>{actualHome} – {actualAway}</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 40, marginBottom: 60,
          fontSize: 36, color: '#888',
        }}>
          <span>+{points} pts</span>
          <span>·</span>
          <span>#{overallRank} globally</span>
          <span>·</span>
          <span>{accuracy}% accuracy</span>
        </div>

        {/* User name and country */}
        <div style={{ fontSize: 72, color: '#fff', marginBottom: 8 }}>
          {name.toUpperCase()}
        </div>
        <div style={{ fontSize: 48, color: '#888', marginBottom: 'auto' }}>
          {flagEmoji} {countryName} Supporter
        </div>

        {/* Referral code */}
        <div style={{ fontSize: 32, color: '#555', marginTop: 40 }}>
          ohmykick.com/{referralCode}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [{ name: 'Bebas Neue', data: bebasNeue, weight: 400 }],
    }
  );
}
```

Build separate route files for: `/api/posters/passport`, `/api/posters/prematch`, `/api/posters/result`.

---

# SECTION 14: NOTIFICATION STRATEGY

## 14.1 Notification Types and Triggers

| Notification | Trigger | Channel | Template Required? |
|-------------|---------|---------|-------------------|
| Passport delivered | Onboarding complete | WA + TG | No (in free window) |
| Pre-match poster | User submits prediction | WA + TG | No (in free window) |
| Result poster | Match status → FINISHED | WA + TG | Only if >24h since user message |
| Match reminder | 3h before kickoff, if no prediction yet | TG (always) + WA (template) | WA: Yes |
| Streak warning | 9 PM local time, if no activity today | TG (always) + WA (template) | WA: Yes |
| Welcome back | 3 days of inactivity | TG (always) + WA (template) | WA: Yes |

## 14.2 Notification Scheduling (Supabase pg_cron)

```sql
-- Match reminder: 3 hours before each match
-- Run every 15 minutes, check for matches starting in 2.5–3.5 hours
select cron.schedule(
  'match-reminders',
  '*/15 * * * *',
  $$select send_match_reminders()$$
);

-- Streak warning: 9 PM IST (3:30 PM UTC) every day
select cron.schedule(
  'streak-warnings',
  '30 15 * * *',
  $$select send_streak_warnings()$$
);

-- Match polling: every 2 minutes
select cron.schedule(
  'poll-matches',
  '*/2 * * * *',
  $$select poll_active_matches()$$
);
```

## 14.3 24-Hour Window Strategy

The key design principle: **trigger user messages before you need to send them something.**

Match reminder templates sent 3 hours before kickoff. When users respond ("predict"), their 24-hour window opens. By the time the match ends 3–5 hours later, all users who responded are in a free window. Result poster delivered free.

For users who never responded to the reminder: send result poster via Telegram (free, unrestricted). For WhatsApp-only users who didn't respond: send the `result_ready` template. This costs ~$0.01 per user. At 10,000 users, worst case $100/match. Acceptable.

---

# SECTION 15: REFERRAL SYSTEM

## 15.1 Referral Flow

1. User A shares their referral link `ohmykick.com/SAL7X2`
2. User B clicks the link → redirected to WhatsApp deep link with message pre-filled:
   ```
   wa.me/[YOUR_WA_NUMBER]?text=Hi+OhMyKick+SAL7X2
   ```
   OR Telegram deep link:
   ```
   t.me/[YOUR_BOT]?start=SAL7X2
   ```
3. User B's first message to the bot includes the referral code
4. Bot extracts referral code from message, stores in session
5. When User B completes onboarding, `referred_by` is set to User A's ID
6. User A's `referral_count` incremented by 1

## 15.2 Referral Link Redirect Page (Next.js)

```typescript
// /app/[code]/page.tsx
export default function ReferralPage({ params }: { params: { code: string } }) {
  const waUrl = `https://wa.me/${WA_NUMBER}?text=Hi+OhMyKick+${params.code}`;
  const tgUrl = `https://t.me/${TG_BOT_USERNAME}?start=${params.code}`;

  return (
    <div>
      <h1>Join OhMyKick — World Cup 2026</h1>
      <p>Your friend invited you to predict every match and get your fan poster.</p>
      <a href={waUrl}>Open in WhatsApp</a>
      <a href={tgUrl}>Open in Telegram</a>
    </div>
  );
}
```

## 15.3 Extracting Referral Code from First Message

**WhatsApp:** If first message body contains a 6-character alphanumeric string matching referral code format, extract and store in session.

**Telegram:** `/start SAL7X2` — Telegram automatically passes the parameter after `/start`. Extract `ctx.startPayload`.

```typescript
// Telegram start with referral code
bot.start(async (ctx) => {
  const referralCode = ctx.startPayload; // 'SAL7X2' or empty
  const user = await getOrCreateUser(ctx.from.id.toString(), 'telegram', referralCode);
  await startOnboarding(ctx, user);
});
```

---

# SECTION 15.4: ACQUISITION CHAIN — HOW NEW USERS ARRIVE FROM DAY 1

This is the primary growth engine. Every feature in Phase 1 exists to serve or strengthen this chain. Developers must understand it, not just implement individual features in isolation.

## The Chain

```
Step 1: User A sends "Hi" to the bot
        ↓
Step 2: Onboarding (2 min) → Fan Passport PNG delivered
        Passport contains: name, country, accuracy stats, referral code + URL
        ↓
Step 3: User A shares passport to WhatsApp Status / groups
        Reach: ~150 contacts per share
        ↓
Step 4: User A predicts a match → Pre-match prediction poster delivered
        Poster contains: their prediction, name, referral code + URL
        ↓
Step 5: User A shares prediction poster to WhatsApp groups (as a challenge to friends)
        ↓
Step 6: Match ends → Result poster auto-delivered within 5 minutes
        Poster contains: "YOU CALLED IT" or "Almost Perfect" + accuracy stats + referral URL
        This is the highest-emotion moment. Users share immediately.
        ↓
Step 7: Friend sees any poster (passport / prediction / result) in Status or group
        Referral URL ohmykick.com/SAL7X2 is visible at bottom of every poster
        ↓
Step 8: Friend taps the URL → referral redirect page loads
        Two buttons: "Open in WhatsApp" | "Open in Telegram"
        Pre-filled message: "Hi OhMyKick SAL7X2"
        ↓
Step 9: Friend sends message to bot → becomes User B
        Bot extracts referral code SAL7X2 → User A's referral_count +1
        ↓
Step 10: User B completes onboarding → gets their own passport with their referral code
         User B shares → their contacts see it → loop continues
```

## What Drives Sharing at Each Step

| Poster | Why Users Share It |
|--------|-------------------|
| Fan Passport | Identity pride. "This is me as a football fan." Shareable like a profile card. |
| Pre-match poster | Challenge / brag. "I'm calling it. Argentina 2-1." Group conversation starter. |
| Result poster (PERFECT) | Triumph. "I called the exact score." Highest share rate of all. |
| Result poster (CORRECT) | Respectability. "I got the winner right." Still shareable. |
| Result poster (WRONG) | Solidarity. "Football surprised us all." Shared as relatable content. |

## What the Developer Must Ensure

1. **Every poster must have the referral URL visible.** Bottom of every poster, every time. No exceptions.
2. **Referral redirect page must load fast** — it's on Vercel, serverless. But test it: a 3-second load kills the conversion.
3. **Pre-filled WhatsApp message must include the referral code** — `Hi OhMyKick SAL7X2`. Bot must parse this on first message.
4. **Result poster must arrive within 5 minutes of match end** — this is when emotional sharing impulse is highest. After 20 minutes, users have moved on.
5. **Passport must regenerate on every request** — when users want to share their latest stats, the poster must be current.

## 64 Acquisition Events

The World Cup has 64 matches. Each match = one result poster per user = one share opportunity = one acquisition event. A user who predicts all 64 matches generates 64 shareable moments over 39 days. There is no other product that gives this many organic sharing opportunities within a single tournament window.

---

# SECTION 16: POINTS SYSTEM

Points are tracked per prediction. They appear on result posters and the fan passport as accuracy % and total points. No ranking query is performed in Phase 1 — accuracy is calculated from the user's own prediction records only.

## 16.1 Points Table

| Outcome | Points |
|---------|--------|
| Correct exact score | 25 |
| Correct winner, wrong score | 10 |
| Wrong prediction | 0 |

Phase 2 additions (build when Phase 2 unlocked):
| First goal scorer correct | +20 |
| Correct prediction in knockout round | ×1.5 multiplier |

## 16.2 Accuracy Calculation (Phase 1)

This is the only stats query needed in Phase 1. Run it when generating a result poster or passport:

```typescript
async function getUserStats(userId: string) {
  const { data } = await supabase
    .from('predictions')
    .select('points_earned, result_type')
    .eq('user_id', userId)
    .not('result_type', 'is', null); // settled predictions only

  const total = data.length;
  const correct = data.filter(p => p.result_type !== 'WRONG').length;
  const totalPoints = data.reduce((sum, p) => sum + (p.points_earned || 0), 0);
  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { total, correct, totalPoints, accuracyPct };
  // Example: { total: 8, correct: 5, totalPoints: 125, accuracyPct: 63 }
}
```

Display on poster as: `"5/8 correct · 63% accuracy · 125 pts"`

## 16.3 Leaderboard (Phase 2 — do not build now)

The global leaderboard (ranked comparison across all users) is a Phase 2 feature. It requires the `leaderboard` database VIEW (noted in Section 6 as Phase 2) and a dedicated bot flow. Build it only after Phase 2 gate metrics are confirmed.

---

# SECTION 17: PHASE 2 FEATURES (Unlock after Match 5)

**Unlock Phase 2 only when all three of these metrics are met after Match 5:**
- ≥ 40% of users shared at least one poster unprompted
- ≥ 50% Day 2 retention (returned for second match)
- ≥ 0.3 referral coefficient (3 new users per 10 existing)

**Features to add in Phase 2 (in priority order):**

### P2.1 Global Leaderboard

A ranked view of all users by total points. Two views: overall and by country. Delivered as a text message.

Bot commands: `rank`, `leaderboard`, `standings`

Build the `leaderboard` PostgreSQL VIEW (documented in Section 6 Phase 2 note) and wire to the bot command. Display:
- Top 5 overall
- User's own rank (always shown)
- Top 3 in user's country
- User's country rank

Add back to main menu under a new "COMPETE" section.

### P2.2 Friend Leagues

Users create a private league with a join code (e.g., `MESSI6`). Share join code via WhatsApp. Friends join. Private leaderboard for the group.

Bot commands:
```
User: "create league"
Bot: "What do you want to call your league?" 
User: "Kerala Gang"
Bot: "League created! 🏆
      Name: Kerala Gang
      Join code: MESSI6
      
      Share this with your friends:
      'Join my World Cup league on OhMyKick!
      Use code: MESSI6
      Or link: ohmykick.com/league/MESSI6'"

User: "join league"
Bot: "Enter the league code:"
User: "MESSI6"
Bot: "You've joined Kerala Gang! [shows current league standings]"
```

### P2.3 Country War

Home screen / leaderboard includes country-level aggregated standings. Shows when user checks rank:
```
🌍 COUNTRY WAR STANDINGS
━━━━━━━━━━━━━━━━━━
🥇 Brazil 🇧🇷 — 2,847,321 pts (12,441 fans)
🥈 Argentina 🇦🇷 — 2,801,442 pts (14,203 fans)
🥉 France 🇫🇷 — 2,644,109 pts (9,877 fans)
...
Your country: Argentina 🇦🇷 — 2nd place
```

### P2.4 Fan Levels

Three levels with upgrade notifications:
- **FAN** — Default (0+ predictions)
- **SUPPORTER** — 5+ predictions made (any result)
- **LEGEND** — 15+ predictions AND 50%+ accuracy

When user levels up:
```
🎉 LEVEL UP, SALEEM!

You are now a LEGEND FAN 💎

Your fan passport has been upgraded.
[Send new passport image]
```

### P2.5 First Goal Scorer Prediction

Add as optional third field after score input:
```
Bot: "Want to predict the first goal scorer for bonus points? (+20 if correct)
      Type a player name or tap Skip."
Buttons: [Skip Bonus] 
User can type player name as free text
```
Validation: fuzzy match against World Cup 2026 squad lists (pre-load into database).

### P2.6 Daily Streak Counter

Track consecutive days with at least one prediction. Already in schema (`streak_count`, `last_prediction_date`).

Implement streak update on every prediction confirmation:
```typescript
async function updateStreak(userId: string) {
  const user = await getUser(userId);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (user.last_prediction_date === today) {
    // Already predicted today, no change
    return;
  } else if (user.last_prediction_date === yesterday) {
    // Consecutive day — increment
    await supabase.from('users').update({
      streak_count: user.streak_count + 1,
      last_prediction_date: today,
    }).eq('id', userId);
  } else {
    // Streak broken — reset to 1
    await supabase.from('users').update({
      streak_count: 1,
      last_prediction_date: today,
    }).eq('id', userId);
  }
}
```

---

# SECTION 18: PHASE 3 FEATURES (Post-Round of 16)

**Build these in parallel with running the platform during knockout rounds. Ship only when stable.**

### P3.1 Shareable Achievement Cards

10 achievements. Each generates a shareable card when earned.

| Achievement | Trigger |
|------------|---------|
| First Prediction | First prediction submitted |
| Streak 7 | 7-day consecutive prediction streak |
| Streak 30 | 30-day streak |
| Correct Upset | Correctly predicted a result where the underdog won |
| Exact Score | Any exact score prediction correct |
| Giant Killer | 3+ correct upset predictions |
| Perfect Round | All predictions in a round correct |
| Top 1000 | Overall rank reaches top 1000 |
| Country Captain | #1 in your country |
| Tournament Veteran | Predicted in all 64 matches |

Delivery: Auto-send achievement card image to user when triggered.

### P3.2 Upset Amplifier

When a match ends with a statistically unexpected result (lower-ranked team wins), immediately identify all users who predicted it correctly. Send a special "GIANT KILLER" notification within 5 minutes:

```
🦁 GIANT KILLER ALERT!

Saleem, you are one of only 247 fans who predicted
Saudi Arabia would beat Argentina!

Your special Giant Killer badge is ready.
[Send badge image]

You're in elite company today 🏆
```

This is your highest-engagement notification. Build it as a priority in Phase 3.

### P3.3 Halftime Poster

For matches where a user has predicted, send a halftime update (15 seconds after halftime whistle):
```
⏱ HALFTIME

Your prediction: Argentina 2-1 Poland
Current score: Argentina 1-0 Poland

On track ✅ — keep the faith!
```
Simple text message, no image. Image added Phase 3+ if engagement warrants.

---

# SECTION 19: END OF TOURNAMENT FEATURES

**Build during the second half of the tournament. Deliver on July 20, 2026 (day after final).**

### Fan Personality Report

Generated for all users who made 10+ predictions during the tournament.

Five personality types based on prediction patterns:

| Type | Criteria |
|------|---------|
| The Oracle | Top 5% accuracy, 50+ predictions |
| The Giant Killer | 3+ correct upset predictions |
| The Loyalist | Only predicted own team's matches |
| The Risk Taker | Consistently predicted high-scoring games |
| The Loyal Supporter | Consistent participation, all stages |

Delivered as a rich image card (new poster type) and text:
```
🏆 YOUR WORLD CUP 2026 JOURNEY

Personality: THE ORACLE ⚡

64 matches. 52 predictions. 67% accuracy.
4 exact scores. 3 upsets called correctly.
Best prediction: Argentina 3-1 France (Semi-Final)

Final rank: #847 of 50,000+ fans worldwide
Top 2% globally. Top 5 among Argentina fans.

[Send Personality Report image]
```

### World Cup Recap

A personal summary of the entire tournament for each user. Image + text. Designed for maximum sharing:
```
🌍 MY WORLD CUP 2026

⚽ 52 predictions made
🎯 35 correct (67% accuracy)
🏆 4 exact scores
🔥 Best streak: 22 days
👥 11 friends referred

🥇 Final rank: #847 globally
🇦🇷 #5 among Argentina fans

📅 June 11 – July 19, 2026
I was here. I predicted. I competed.

#WorldCup2026 #OhMyKick
```

End with CTA: "Euro 2028 begins soon. Register your interest: [link]" — starts building next tournament's database.

---

# SECTION 20: PHASE GATE METRICS

### Gate 1: Launch (Day 8)
Criteria from 50-person beta:
- [ ] 80%+ complete onboarding without asking for help
- [ ] 70%+ make at least one prediction
- [ ] 40%+ share at least one poster unprompted
- [ ] Result poster delivered within 5 minutes of match end (automated, no manual trigger)
- [ ] Zero critical bugs in the core prediction loop

If any item fails: do not launch. Fix the failing item first.

### Gate 2: Phase 2 (After Match 5)
- [ ] Poster share rate ≥ 40%
- [ ] Day 2 retention ≥ 50%
- [ ] Referral coefficient ≥ 0.3

If metrics not met: do not build Phase 2 features. Diagnose the failing metric. Root cause is almost always poster quality or onboarding friction.

### Gate 3: Phase 3 (Post-Round of 16, ~Match 48)
- [ ] Total users ≥ 25,000
- [ ] Weekly active users / total users ≥ 55%
- [ ] Referral coefficient ≥ 0.5 (compounding growth confirmed)

---

# SECTION 21: NON-FUNCTIONAL REQUIREMENTS

## Performance

| Operation | Target Response Time | Notes |
|-----------|---------------------|-------|
| Bot message response (text) | < 500ms | From webhook receipt to reply sent |
| Bot message response (button send) | < 800ms | |
| Poster generation | < 10 seconds | User gets text confirmation immediately |
| Result pipeline (all users) | < 5 minutes | For up to 50,000 users |
| User stats query (accuracy %) | < 200ms | Simple aggregate on predictions table |
| WhatsApp webhook acknowledge | < 200ms | Must return 200 before processing |

## Reliability

- Bot server uptime: 99.9% during tournament (June 11 – July 19)
- Result pipeline: zero manual intervention required for any match result
- Poster generation failure rate: < 0.1% (retry 3 times before logging failure)
- If API-Football is down: use cached match data, retry every 30 seconds

## Scalability

- Architecture must handle 50,000 concurrent users without configuration changes
- Poster queue: auto-scale workers based on queue depth (BullMQ supports this)
- Supabase: upgrade to Pro plan before launch (handles 500 concurrent connections)
- Vercel: serverless auto-scales — no configuration needed

## Security

- No sensitive user data stored beyond: name, phone number (wa_id/tg_id), country, photo URL
- Supabase Row Level Security enabled on all tables (service role key used server-side only)
- Webhook signature verification for both WhatsApp (X-Hub-Signature-256) and Telegram
- All environment variables in Railway + Vercel secrets — never in code

## Data Retention

- User data: retained for 24 months after tournament
- Poster images: retained in Supabase Storage for 6 months
- Notification logs: retained for 90 days
- Match data: retained indefinitely (small data, useful for future products)

---

# SECTION 22: WHAT NOT TO BUILD IN PHASE 1

This is an explicit list. If a team member suggests adding any of these before Phase 2 gate metrics are confirmed, the answer is no.

| Feature | Reason Excluded |
|---------|----------------|
| Global leaderboard command | Phase 2. Requires leaderboard DB view and bot flow. Acquisition works without it. |
| Friend leagues | Phase 2. Requires 2 DB tables, 2 state machine states, join code system. Zero acquisition value. |
| Native iOS/Android app | PWA sufficient. App Store review takes 7 days minimum. |
| Web-based registration or prediction | Web is landing page only. All core flows are in bots. |
| Man of the Match prediction | Niche. Adds complexity. Marginal engagement return. |
| Fan card collections | Depth mechanic. Not an acquisition mechanic. Phase 3 at earliest. |
| AI-generated poster styles (Midjourney/Stable Diffusion) | Complex pipeline. Delays MVP. Phase 2+. |
| City Wars leaderboard | Requires critical mass per city. Not enough users at launch. |
| AI football Q&A (RAG) | Significant complexity. Phase 2+. |
| n8n or workflow automation tools | No role in user-facing real-time bot. Internal tools only. |
| Email marketing | Not the channel for this audience. |
| Paid advertising campaigns | No paid ads at launch. Organic-first. |
| Push notifications via web | Bot channels are sufficient. |
| Live match momentum voting | Complex real-time infrastructure. Phase 3+. |
| Fan Personality Report | End of tournament only. |
| World Cup Recap | End of tournament only. |
| Multiple poster art style choices | 3 templates at launch. Add weekly in Phase 2. |
| Social feed (other users' content) | Privacy, UX complexity. Not in scope. |
| In-app chat or forums | Not in scope. |

---

# SECTION 23: LAUNCH SEQUENCE

## Pre-Launch Checklist (Complete Before Day 8)

**Technical:**
- [ ] WhatsApp webhook live and verified
- [ ] Telegram webhook live and verified
- [ ] All 5 WhatsApp templates submitted and approved
- [ ] All 48 Group Stage matches seeded in database
- [ ] Poster generation tested for all 5 types (passport, prematch, 3 result types)
- [ ] Result pipeline tested with manual match result trigger
- [ ] All 20 conversation states tested end-to-end on real WhatsApp and Telegram
- [ ] Leaderboard query returns correct ranks
- [ ] Referral tracking tested: User B joins via User A's link → User A's referral_count increments
- [ ] Sentry connected and receiving errors
- [ ] PostHog connected and receiving events
- [ ] Load test: 100 concurrent users on bot server (no errors, < 800ms response)
- [ ] Supabase plan upgraded to Pro

**Design:**
- [ ] All 5 poster types designed at 1080×1920 in Figma
- [ ] All 5 poster types implemented in @vercel/og and tested on real phone screens
- [ ] Poster quality sign-off: 5 people shown the result poster without context — do 3+ say they'd share it?

**Business:**
- [ ] WhatsApp number verified with a clear display name and profile photo
- [ ] Telegram bot name, description, and profile photo set
- [ ] ohmykick.com domain registered and Next.js landing page deployed
- [ ] 50-person beta complete with passing metrics
- [ ] 30 WhatsApp group admin contacts identified for outreach

**Day 8: Soft Launch Actions (in order):**
1. Founder sends personal WhatsApp message (not broadcast) to 30 football group admins with own passport card attached
2. Founder posts own passport to personal WhatsApp Status
3. Founder posts to personal Instagram/Twitter
4. Monitor PostHog in real-time: registration drop-off, prediction rate, share rate
5. Be ready to fix critical bugs within 1 hour

---

# SECTION 24: MONITORING & ANALYTICS

## PostHog Events to Track (Implement from Day 1)

```typescript
// Install: npm install posthog-node
import { PostHog } from 'posthog-node';
const posthog = new PostHog(POSTHOG_API_KEY, { host: 'https://app.posthog.com' });

// Track every meaningful user action
posthog.capture({ distinctId: userId, event: 'onboarding_started' });
posthog.capture({ distinctId: userId, event: 'onboarding_name_entered' });
posthog.capture({ distinctId: userId, event: 'onboarding_country_selected', properties: { country: countryCode } });
posthog.capture({ distinctId: userId, event: 'onboarding_photo_uploaded' });
posthog.capture({ distinctId: userId, event: 'onboarding_photo_skipped' });
posthog.capture({ distinctId: userId, event: 'onboarding_completed' });
posthog.capture({ distinctId: userId, event: 'passport_delivered', properties: { channel: 'whatsapp' | 'telegram' } });
posthog.capture({ distinctId: userId, event: 'prediction_started', properties: { matchId } });
posthog.capture({ distinctId: userId, event: 'prediction_completed', properties: { matchId, resultType: 'winner_only' | 'score' } });
posthog.capture({ distinctId: userId, event: 'prematch_poster_delivered', properties: { channel } });
posthog.capture({ distinctId: userId, event: 'result_poster_delivered', properties: { channel, resultType } });
posthog.capture({ distinctId: userId, event: 'referral_link_requested' });
posthog.capture({ distinctId: userId, event: 'referral_completed', properties: { referredUserId } });
posthog.capture({ distinctId: userId, event: 'streak_updated', properties: { streakCount } });
```

## Dashboard Metrics (Check Daily)

| Metric | Formula | Target |
|--------|---------|--------|
| Onboarding completion rate | onboarding_completed / onboarding_started | > 70% |
| Prediction rate | Users who predicted / total registered | > 60% per match day |
| Poster delivery success | Delivered / generated | > 99% |
| Day 1 retention | Active Day 1 / registered Day 0 | > 65% |
| Day 7 retention | Active Day 7 / registered Day 0 | > 35% |
| Referral coefficient | New users from referral / total predictors | > 0.3 |
| Poster share rate | Cannot measure directly — use referral link clicks as proxy | |

## Sentry Error Tracking

Track all errors in:
- Webhook handler (WhatsApp + Telegram)
- Poster generation (failed jobs)
- Match result pipeline (failed result processing)
- API-Football calls (rate limits, timeouts)
- Supabase queries (connection errors, timeouts)

Set alerts for:
- Error rate > 1% on bot webhook
- Poster generation failure rate > 0.5%
- Match result pipeline: any failure to process a finished match within 10 minutes

---

# APPENDIX A: DIRECTORY STRUCTURE

```
roar/
├── apps/
│   ├── bot/                        # Node.js bot server (Railway)
│   │   ├── src/
│   │   │   ├── index.ts            # Fastify server, webhook routes
│   │   │   ├── whatsapp/
│   │   │   │   ├── handler.ts      # WhatsApp message extraction + routing
│   │   │   │   ├── sender.ts       # WhatsApp API calls
│   │   │   │   └── templates.ts    # Template message builders
│   │   │   ├── telegram/
│   │   │   │   ├── handler.ts      # Telegraf setup + handlers
│   │   │   │   └── sender.ts       # Telegram send helpers
│   │   │   ├── flows/
│   │   │   │   ├── onboarding.ts   # NEW → REGISTERED flow
│   │   │   │   ├── prediction.ts   # Prediction flow
│   │   │   │   ├── passport.ts     # Passport request handler
│   │   │   │   └── referral.ts     # Referral flow
│   │   │   ├── state-machine/
│   │   │   │   ├── index.ts        # Main message router
│   │   │   │   └── keywords.ts     # Global keyword handler
│   │   │   ├── queues/
│   │   │   │   ├── poster.ts       # Poster generation queue + worker
│   │   │   │   └── notify.ts       # Notification queue + worker
│   │   │   ├── pipeline/
│   │   │   │   ├── poll.ts         # Match result polling
│   │   │   │   └── results.ts      # Result processing pipeline
│   │   │   ├── db/
│   │   │   │   ├── client.ts       # Supabase client
│   │   │   │   ├── users.ts        # User CRUD
│   │   │   │   ├── matches.ts      # Match queries
│   │   │   │   └── predictions.ts  # Prediction CRUD
│   │   │   └── utils/
│   │   │       ├── score-parser.ts # Score text parsing
│   │   │       ├── countries.ts    # Country code/flag/colour map
│   │   │       └── analytics.ts    # PostHog event tracking
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── web/                        # Next.js 14 (Vercel)
│       ├── app/
│       │   ├── page.tsx            # Landing page
│       │   ├── [code]/
│       │   │   └── page.tsx        # Referral redirect page
│       │   ├── p/[posterId]/
│       │   │   └── page.tsx        # Poster viewer
│       │   └── api/
│       │       └── posters/
│       │           ├── passport/
│       │           │   └── route.tsx
│       │           ├── prematch/
│       │           │   └── route.tsx
│       │           └── result/
│       │               └── route.tsx
│       └── package.json
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Full schema from Section 6
│   └── seed/
│       └── matches.ts              # World Cup 2026 match seeder
│
└── package.json                    # Monorepo root (use pnpm workspaces)
```

---

# APPENDIX B: COUNTRY DATA MAP (32 World Cup Nations)

```typescript
export const COUNTRIES: Record<string, {
  name: string;
  flag: string;
  primaryColor: string;
  secondaryColor: string;
}> = {
  AR: { name: 'Argentina', flag: '🇦🇷', primaryColor: '#74ACDF', secondaryColor: '#FFFFFF' },
  BR: { name: 'Brazil', flag: '🇧🇷', primaryColor: '#009C3B', secondaryColor: '#FFDF00' },
  FR: { name: 'France', flag: '🇫🇷', primaryColor: '#002395', secondaryColor: '#ED2939' },
  DE: { name: 'Germany', flag: '🇩🇪', primaryColor: '#000000', secondaryColor: '#DD0000' },
  ES: { name: 'Spain', flag: '🇪🇸', primaryColor: '#AA151B', secondaryColor: '#F1BF00' },
  PT: { name: 'Portugal', flag: '🇵🇹', primaryColor: '#006600', secondaryColor: '#FF0000' },
  GB_ENG: { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', primaryColor: '#CF081F', secondaryColor: '#FFFFFF' },
  NL: { name: 'Netherlands', flag: '🇳🇱', primaryColor: '#FF6600', secondaryColor: '#FFFFFF' },
  BE: { name: 'Belgium', flag: '🇧🇪', primaryColor: '#EF3340', secondaryColor: '#000000' },
  HR: { name: 'Croatia', flag: '🇭🇷', primaryColor: '#FF0000', secondaryColor: '#FFFFFF' },
  MA: { name: 'Morocco', flag: '🇲🇦', primaryColor: '#006233', secondaryColor: '#C1272D' },
  SN: { name: 'Senegal', flag: '🇸🇳', primaryColor: '#00853F', secondaryColor: '#FDEF42' },
  NG: { name: 'Nigeria', flag: '🇳🇬', primaryColor: '#008751', secondaryColor: '#FFFFFF' },
  JP: { name: 'Japan', flag: '🇯🇵', primaryColor: '#BC002D', secondaryColor: '#FFFFFF' },
  KR: { name: 'South Korea', flag: '🇰🇷', primaryColor: '#CD2E3A', secondaryColor: '#003478' },
  AU: { name: 'Australia', flag: '🇦🇺', primaryColor: '#00843D', secondaryColor: '#FFD100' },
  US: { name: 'USA', flag: '🇺🇸', primaryColor: '#002868', secondaryColor: '#BF0A30' },
  CA: { name: 'Canada', flag: '🇨🇦', primaryColor: '#FF0000', secondaryColor: '#FFFFFF' },
  MX: { name: 'Mexico', flag: '🇲🇽', primaryColor: '#006847', secondaryColor: '#FFFFFF' },
  EC: { name: 'Ecuador', flag: '🇪🇨', primaryColor: '#FFD100', secondaryColor: '#003087' },
  UY: { name: 'Uruguay', flag: '🇺🇾', primaryColor: '#75AADB', secondaryColor: '#FFFFFF' },
  PL: { name: 'Poland', flag: '🇵🇱', primaryColor: '#DC143C', secondaryColor: '#FFFFFF' },
  RS: { name: 'Serbia', flag: '🇷🇸', primaryColor: '#C6363C', secondaryColor: '#0C4076' },
  DK: { name: 'Denmark', flag: '🇩🇰', primaryColor: '#C60C30', secondaryColor: '#FFFFFF' },
  CH: { name: 'Switzerland', flag: '🇨🇭', primaryColor: '#FF0000', secondaryColor: '#FFFFFF' },
  IR: { name: 'Iran', flag: '🇮🇷', primaryColor: '#239F40', secondaryColor: '#DA0000' },
  SA: { name: 'Saudi Arabia', flag: '🇸🇦', primaryColor: '#006C35', secondaryColor: '#FFFFFF' },
  QA: { name: 'Qatar', flag: '🇶🇦', primaryColor: '#8D1B3D', secondaryColor: '#FFFFFF' },
  // Add remaining qualified nations when final qualification is confirmed
};
```

---

# APPENDIX C: QUICK-START FOR NEW DEVELOPERS

1. Clone the repo. Run `pnpm install` in root.
2. Copy `.env.example` to `.env` in both `apps/bot` and `apps/web`. Fill all values.
3. Run Supabase migration: `supabase db push` (requires Supabase CLI).
4. Seed World Cup matches: `pnpm --filter bot run seed-matches`.
5. Start bot locally: `pnpm --filter bot run dev`.
6. Set up local Telegram webhook using ngrok: `ngrok http 3000`, then update Telegram webhook URL.
7. For WhatsApp local testing: Use Meta's test phone number in the Developer Console (does not require real approval).
8. Run poster service locally: `pnpm --filter web run dev` — posters available at `localhost:3001/api/posters/`.

---

*Document version: 1.0 | Prepared: June 2026 | Status: Ready for Development*
*Owner: Product Team | For questions, contact the product lead*
