import { supabase, User } from './client.js';
import { trackEvent } from '../utils/analytics.js';

export async function getUserByWaId(waId: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('wa_id', waId)
    .single();
  return data;
}

export async function getUserByTgId(tgId: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('tg_id', tgId)
    .single();
  return data;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

export async function createUser(params: {
  wa_id?: string;
  tg_id?: string;
  name: string;
  country_code: string;
  country_name: string;
  country_flag_emoji: string;
  referred_by_code?: string;
}): Promise<User | null> {
  // Look up referrer
  let referred_by: string | null = null;
  if (params.referred_by_code) {
    const { data: referrer } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', params.referred_by_code.toUpperCase())
      .single();
    if (referrer) referred_by = referrer.id;
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      wa_id: params.wa_id ?? null,
      tg_id: params.tg_id ?? null,
      name: params.name,
      country_code: params.country_code,
      country_name: params.country_name,
      country_flag_emoji: params.country_flag_emoji,
      referred_by,
      // fan_id and referral_code are generated server-side via DB function
      fan_id: `${params.country_code.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      referral_code: generateReferralCode(),
      conversation_state: 'ONBOARDING_NAME',
    })
    .select()
    .single();

  if (error) {
    console.error('[createUser] Error:', error.message);
    return null;
  }

  // Increment referrer's referral_count
  if (referred_by) {
    await supabase.rpc('increment_referral_count', { user_id: referred_by });
    trackEvent(referred_by, 'referral_completed', { referredUserId: data.id });
  }

  return data;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

export async function updateConversationState(
  id: string,
  state: string,
  extras?: Partial<Pick<User, 'pending_match_id' | 'pending_winner' | 'state_retries'>>
): Promise<void> {
  await supabase
    .from('users')
    .update({
      conversation_state: state,
      ...extras,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
}

export async function updateLastActive(id: string, channel: 'wa' | 'tg'): Promise<void> {
  const now = new Date().toISOString();
  const updates: Record<string, string> = {
    last_active_at: now,
    updated_at: now,
  };
  if (channel === 'wa') updates.last_wa_message_at = now;
  if (channel === 'tg') updates.last_tg_message_at = now;

  await supabase.from('users').update(updates).eq('id', id);
}

export async function getUserStats(userId: string): Promise<{
  total: number;
  correct: number;
  totalPoints: number;
  accuracyPct: number;
}> {
  const { data } = await supabase
    .from('predictions')
    .select('points_earned, result_type')
    .eq('user_id', userId)
    .not('result_type', 'is', null);

  if (!data || data.length === 0) {
    return { total: 0, correct: 0, totalPoints: 0, accuracyPct: 0 };
  }

  const total = data.length;
  const correct = data.filter((p) => p.result_type !== 'WRONG').length;
  const totalPoints = data.reduce((sum, p) => sum + (p.points_earned ?? 0), 0);
  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { total, correct, totalPoints, accuracyPct };
}

export async function updateStreak(userId: string): Promise<void> {
  const user = await getUserById(userId);
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (user.last_prediction_date === today) return;

  const newStreak =
    user.last_prediction_date === yesterday ? user.streak_count + 1 : 1;

  await supabase
    .from('users')
    .update({
      streak_count: newStreak,
      last_prediction_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

// Helpers
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
