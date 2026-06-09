import { User, supabase } from '../db/client.js';
import { getUserStats } from '../db/users.js';
import { posterQueue } from '../queues/queue.js';
import { BotResponse } from './prediction.js';

export async function handleRecapRequest(user: User): Promise<BotResponse> {
  const stats = await getUserStats(user.id);
  
  // Get exact scorelines count
  const { data: predictions } = await supabase
    .from('predictions')
    .select('result_type')
    .eq('user_id', user.id);

  const exactCount = predictions?.filter(p => p.result_type === 'PERFECT').length ?? 0;

  // Get global rank from leaderboard
  const { data: rankData } = await supabase
    .from('global_leaderboard')
    .select('overall_rank')
    .eq('user_id', user.id)
    .maybeSingle();

  const rank = rankData?.overall_rank ?? 1;

  // Classify personality based on stats
  let personality = 'THE SUPERFAN';
  let personalityDesc = 'You followed every kick and lived every prediction. A true enthusiast!';
  let personalityIcon = '⚡';

  if (stats.total >= 10 && stats.accuracyPct >= 60) {
    personality = 'THE ORACLE';
    personalityDesc = 'Uncanny football instincts. You see the matches before they even start!';
    personalityIcon = '🔮';
  } else if (exactCount >= 4) {
    personality = 'THE SNIPER';
    personalityDesc = 'Laser-sharp precision. You don\'t just call results; you pinpoint exact scores!';
    personalityIcon = '🎯';
  } else if (stats.total >= 15 && stats.accuracyPct < 30) {
    personality = 'THE WEAK LINK';
    personalityDesc = 'Your dedication is unmatched, even if the results tell a different story!';
    personalityIcon = '🤡';
  } else if (stats.total >= 5 && stats.accuracyPct >= 40) {
    personality = 'THE ANALYST';
    personalityDesc = 'Methodical and smart. You analyze the form and make calculated, solid choices.';
    personalityIcon = '📊';
  }

  // Queue recap poster generation
  await posterQueue.add('recap', {
    type: 'recap',
    userId: user.id,
    personality,
    personalityDesc,
    personalityIcon,
    predictions: stats.total,
    accuracy: stats.accuracyPct,
    exact: exactCount,
    streak: user.streak_count,
    referrals: user.referral_count,
    rank,
  });

  // Log in notification_log
  await supabase.from('notification_log').insert({
    user_id: user.id,
    channel: user.tg_id ? 'TELEGRAM' : 'WHATSAPP',
    notification_type: 'RECAP',
    status: 'PENDING',
  });

  return {
    messages: [
      {
        kind: 'text',
        text: `📊 *Generating your Tournament Recap Card...*\n\nWe are compiling your stats and determining your Fan Personality. We will send your card shortly! 📸`,
      }
    ]
  };
}
