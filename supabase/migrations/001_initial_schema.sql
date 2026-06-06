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
  --         IDLE, PREDICTION_MATCH_SELECT, PREDICTION_WINNER, PREDICTION_SCORE
  
  pending_match_id    uuid,                           -- match being predicted (temp state)
  pending_winner      text,                           -- 'home', 'draw', 'away' (temp state)
  state_retries       integer not null default 0,     -- invalid input retry counter
  
  -- Engagement
  streak_count        integer not null default 0,
  last_prediction_date date,
  last_active_at      timestamptz,
  last_wa_message_at  timestamptz,                   -- track 24h free window
  last_tg_message_at  timestamptz,
  
  -- Fan level
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
  match_preview_text  text,                           -- AI or manual match preview
  
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
  
  -- Optional predictions
  predicted_first_scorer text,                        -- player name
  
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
-- TRIGGER: update updated_at
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

-- ============================================================
-- RPC: increment_referral_count
-- ============================================================
create or replace function increment_referral_count(user_id uuid)
returns void language sql as $$
  update public.users
  set referral_count = referral_count + 1, updated_at = now()
  where id = user_id;
$$;

-- ============================================================
-- RPC: increment_user_points
-- ============================================================
create or replace function increment_user_points(user_id uuid, points_to_add integer)
returns void language sql as $$
  update public.users
  set total_points = total_points + points_to_add, updated_at = now()
  where id = user_id;
$$;

-- ============================================================
-- RLS: Enable Row Level Security
-- ============================================================
alter table public.users enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.notification_log enable row level security;

-- Service role bypasses RLS (bot uses service role key)
create policy "service_role_all_users" on public.users
  using (true) with check (true);

create policy "service_role_all_matches" on public.matches
  using (true) with check (true);

create policy "service_role_all_predictions" on public.predictions
  using (true) with check (true);

create policy "service_role_all_notifications" on public.notification_log
  using (true) with check (true);
