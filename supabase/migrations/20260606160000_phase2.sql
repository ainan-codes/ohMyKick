-- ============================================================
-- PHASE 2 MIGRATION: Friend Leagues & Leaderboards
-- ============================================================

-- ============================================================
-- TABLE: friend_leagues
-- ============================================================
create table public.friend_leagues (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  join_code           text unique not null,
  creator_id          uuid not null references public.users(id) on delete cascade,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_friend_leagues_code on public.friend_leagues(join_code);
create trigger friend_leagues_updated_at before update on public.friend_leagues
  for each row execute function update_updated_at();

-- ============================================================
-- TABLE: friend_league_members
-- ============================================================
create table public.friend_league_members (
  league_id           uuid not null references public.friend_leagues(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete cascade,
  joined_at           timestamptz not null default now(),
  primary key (league_id, user_id)
);

create index idx_flm_user on public.friend_league_members(user_id);

-- ============================================================
-- VIEW: global_leaderboard
-- ============================================================
create or replace view public.global_leaderboard as
select 
  id as user_id, 
  name, 
  country_name, 
  country_flag_emoji,
  total_points,
  fan_level,
  rank() over (order by total_points desc, created_at asc) as overall_rank,
  rank() over (partition by country_code order by total_points desc, created_at asc) as country_rank
from public.users;

-- ============================================================
-- VIEW: country_war_standings
-- ============================================================
create or replace view public.country_war_standings as
select 
  country_code,
  country_name,
  country_flag_emoji,
  count(id) as total_fans,
  sum(total_points) as country_total_points,
  rank() over (order by sum(total_points) desc) as country_rank
from public.users
group by country_code, country_name, country_flag_emoji;
