import { User } from '../db/client.js';
import { supabase } from '../db/client.js';
import { getTranslation } from '../utils/i18n.js';
import type { BotResponse } from './prediction.js';

export async function handleLeaderboardRequest(user: User): Promise<BotResponse> {
  const t = getTranslation(user.language);

  // Fetch the user's global rank
  const { data: rankData, error: rankError } = await supabase
    .from('global_leaderboard')
    .select('overall_rank, total_points, fan_level, country_rank')
    .eq('user_id', user.id)
    .single();

  if (rankError || !rankData) {
    return {
      messages: [{ kind: 'text', text: "❌ Could not fetch leaderboard data." }]
    };
  }

  // Fetch country war standings
  const { data: countryData } = await supabase
    .from('country_war_standings')
    .select('country_flag_emoji, country_total_points, country_rank')
    .eq('country_code', user.country_code)
    .single();

  const msg = `🏆 *Global Leaderboard*

🏅 *Your Rank:* #${rankData.overall_rank}
📈 *Total Points:* ${rankData.total_points}
🌟 *Fan Level:* ${rankData.fan_level}

🌍 *Country Rank (${user.country_flag_emoji}):* #${rankData.country_rank}

⚔️ *Country War Standings*
Your country is currently ranked #${countryData?.country_rank ?? '?'} with ${countryData?.country_total_points ?? 0} points!`;

  return {
    messages: [{ kind: 'text', text: msg }]
  };
}
