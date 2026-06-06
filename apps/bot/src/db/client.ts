import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Partial<User>;
        Update: Partial<User>;
      };
      matches: {
        Row: Match;
        Insert: Partial<Match>;
        Update: Partial<Match>;
      };
      predictions: {
        Row: Prediction;
        Insert: Partial<Prediction>;
        Update: Partial<Prediction>;
      };
    };
  };
};

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
