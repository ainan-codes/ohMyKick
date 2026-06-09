import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';

dotenv.config();

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  wa_id: string | null;
  tg_id: string | null;
  name: string;
  country_code: string;
  country_name: string;
  country_flag_emoji: string;
  photo_url: string | null;
  language: string;
  fan_id: string;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  conversation_state: string;
  pending_match_id: string | null;
  pending_winner: string | null;
  state_retries: number;
  streak_count: number;
  last_prediction_date: string | null;
  last_active_at: string | null;
  last_wa_message_at: string | null;
  last_tg_message_at: string | null;
  fan_level: string;
  total_points: number;
  passport_poster_url: string | null;
  passport_poster_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  api_match_id: number;
  home_team: string;
  away_team: string;
  home_country_code: string | null;
  away_country_code: string | null;
  home_flag_emoji: string | null;
  away_flag_emoji: string | null;
  kickoff_at: string;
  kickoff_local_ist: string | null;
  stage: string;
  venue: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  prediction_open: boolean;
  match_preview_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_winner: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_first_scorer: string | null;
  is_locked: boolean;
  result_type: string | null;
  points_earned: number | null;
  prematch_poster_url: string | null;
  result_poster_url: string | null;
  prematch_poster_sent_wa: boolean;
  prematch_poster_sent_tg: boolean;
  result_poster_sent_wa: boolean;
  result_poster_sent_tg: boolean;
  created_at: string;
  updated_at: string;
}

export interface GlobalLeaderboardRow {
  user_id: string;
  name: string;
  country_code: string;
  country_name: string;
  country_flag_emoji: string;
  fan_level: string;
  total_points: number;
  overall_rank: number;
  country_rank: number;
  country_total_points: number;
  streak_count: number;
  referral_count: number;
  fan_id: string;
  passport_poster_url: string | null;
  updated_at: string;
}

export interface FriendLeague {
  id: string;
  name: string;
  invite_code: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface FriendLeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  joined_at: string;
}

export interface CountryWarStanding {
  id: string;
  country_code: string;
  country_name: string;
  country_flag_emoji: string;
  total_points: number;
  member_count: number;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achieved_at: string;
  metadata: Record<string, unknown> | null;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  notification_type: string;
  channel: string;
  status: string;
  sent_at: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── Database type ─────────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: any;
        Update: any;
      };
      matches: {
        Row: Match;
        Insert: any;
        Update: any;
      };
      predictions: {
        Row: Prediction;
        Insert: any;
        Update: any;
      };
      global_leaderboard: {
        Row: GlobalLeaderboardRow;
        Insert: any;
        Update: any;
      };
      friend_leagues: {
        Row: FriendLeague;
        Insert: any;
        Update: any;
      };
      friend_league_members: {
        Row: FriendLeagueMember;
        Insert: any;
        Update: any;
      };
      country_war_standings: {
        Row: CountryWarStanding;
        Insert: any;
        Update: any;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: any;
        Update: any;
      };
      notification_log: {
        Row: NotificationLog;
        Insert: any;
        Update: any;
      };
    };
    Functions: {
      increment_referral_count: {
        Args: { user_id: string };
        Returns: void;
      };
    };
  };
};

// ── Custom fetch (avoids undici issues on Render) ─────────────────────────────

function customFetch(url: string | URL, options: any = {}) {
  const urlString = typeof url === 'string' ? url : url.toString();
  return new Promise((resolve, reject) => {
    const urlObj = new URL(urlString);

    const headers: Record<string, string> = {};
    if (options.headers) {
      if (typeof options.headers.forEach === 'function') {
        options.headers.forEach((value: string, key: string) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    const reqOptions = {
      method: options.method || 'GET',
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      headers: headers,
      timeout: 60000,
    };

    const lib = urlObj.protocol === 'https:' ? https : http;
    const req = lib.request(reqOptions, (res) => {
      const chunks: any[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const rawBuffer = Buffer.concat(chunks);
        resolve({
          ok: res.statusCode && res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode || 200,
          statusText: res.statusMessage || '',
          text: () => Promise.resolve(rawBuffer.toString('utf8')),
          json: () => {
            try {
              return Promise.resolve(JSON.parse(rawBuffer.toString('utf8')));
            } catch (err) {
              return Promise.reject(err);
            }
          },
          arrayBuffer: () => {
            const ab = rawBuffer.buffer.slice(
              rawBuffer.byteOffset,
              rawBuffer.byteOffset + rawBuffer.byteLength
            );
            return Promise.resolve(ab);
          },
          headers: {
            get: (name: string) => {
              const val = res.headers[name.toLowerCase()];
              return Array.isArray(val) ? val.join(', ') : val || null;
            },
          },
        } as any);
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timeout in custom fetch'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Override globally for the entire bot process
if (typeof global !== 'undefined') {
  (global as any).fetch = customFetch as any;
}

// ── Supabase client ───────────────────────────────────────────────────────────

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: customFetch as any,
  },
});
