import { supabase } from '../db/client.js';
import { getUserStats } from '../db/users.js';
import { posterQueue } from '../queues/queue.js';
import { trackEvent } from './analytics.js';

export interface AchievementDetails {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export const ACHIEVEMENTS: Record<string, AchievementDetails> = {
  FIRST_PREDICTION: {
    id: 'FIRST_PREDICTION',
    title: 'First Prediction',
    desc: 'Submitted your first World Cup prediction!',
    icon: '⚽',
  },
  STREAK_7: {
    id: 'STREAK_7',
    title: 'Streak 7',
    desc: 'Predicted matches in 7 consecutive days!',
    icon: '🔥',
  },
  STREAK_30: {
    id: 'STREAK_30',
    title: 'Streak 30',
    desc: 'Predicted matches in 30 consecutive days!',
    icon: '👑',
  },
  CORRECT_UPSET: {
    id: 'CORRECT_UPSET',
    title: 'Correct Upset',
    desc: 'Correctly predicted an underdog victory!',
    icon: '🦁',
  },
  EXACT_SCORE: {
    id: 'EXACT_SCORE',
    title: 'Exact Score',
    desc: 'Called the exact match scoreline!',
    icon: '🎯',
  },
  GIANT_KILLER: {
    id: 'GIANT_KILLER',
    title: 'Giant Killer',
    desc: 'Correctly predicted 3 or more upsets!',
    icon: '🛡️',
  },
  PERFECT_ROUND: {
    id: 'PERFECT_ROUND',
    title: 'Perfect Round',
    desc: 'All predictions in a tournament round correct!',
    icon: '🏆',
  },
  TOP_1000: {
    id: 'TOP_1000',
    title: 'Top 1000',
    desc: 'Reached the top 1000 players globally!',
    icon: '🌟',
  },
  COUNTRY_CAPTAIN: {
    id: 'COUNTRY_CAPTAIN',
    title: 'Country Captain',
    desc: 'Ranked #1 supporter in your country!',
    icon: '⚓',
  },
  TOURNAMENT_VETERAN: {
    id: 'TOURNAMENT_VETERAN',
    title: 'Tournament Veteran',
    desc: 'Predicted in all 64 matches of the World Cup!',
    icon: '🎖️',
  },
};

export async function checkAndAwardAchievements(userId: string): Promise<void> {
  try {
    const stats = await getUserStats(userId);
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!user) return;

    // Get all predictions that are settled
    const { data: predictions } = await supabase
      .from('predictions')
      .select('*, matches(*)')
      .eq('user_id', userId)
      .not('result_type', 'is', null);

    if (!predictions) return;

    // Fetch already unlocked achievements from notification_log
    const { data: unlockedLogs } = await supabase
      .from('notification_log')
      .select('notification_type')
      .eq('user_id', userId)
      .like('notification_type', 'ACHIEVEMENT_%');

    const unlockedSet = new Set(
      unlockedLogs?.map((log) => log.notification_type.replace('ACHIEVEMENT_', '')) ?? []
    );

    const checkUnlock = async (id: string, condition: boolean) => {
      if (condition && !unlockedSet.has(id)) {
        console.log(`[Achievement] User ${userId} unlocked ${id}!`);
        
        // Log achievement in notification_log
        await supabase.from('notification_log').insert({
          user_id: userId,
          channel: user.tg_id ? 'TELEGRAM' : 'WHATSAPP',
          notification_type: `ACHIEVEMENT_${id}`,
          status: 'PENDING',
        });

        // Add to posterQueue
        await posterQueue.add('achievement-poster', {
          type: 'achievement',
          userId,
          achievementId: id,
        });

        trackEvent(userId, 'achievement_unlocked', { achievementId: id });
      }
    };

    // 1. First Prediction
    await checkUnlock('FIRST_PREDICTION', predictions.length >= 1);

    // 2. Streak 7
    await checkUnlock('STREAK_7', user.streak_count >= 7);

    // 3. Streak 30
    await checkUnlock('STREAK_30', user.streak_count >= 30);

    // 4. Exact Score
    const exactCount = predictions.filter((p) => p.result_type === 'PERFECT').length;
    await checkUnlock('EXACT_SCORE', exactCount >= 1);

    // 5. Correct Upset & Giant Killer
    // An upset is defined here as predicting the winner correctly for a match where < 35% of all users predicted that winner
    let upsetCount = 0;
    for (const p of predictions) {
      if (p.result_type !== 'WRONG' && p.predicted_winner !== 'DRAW') {
        const { count: totalPreds } = await supabase
          .from('predictions')
          .select('*', { count: 'exact', head: true })
          .eq('match_id', p.match_id);

        const { count: matchingPreds } = await supabase
          .from('predictions')
          .select('*', { count: 'exact', head: true })
          .eq('match_id', p.match_id)
          .eq('predicted_winner', p.predicted_winner);

        if (totalPreds && matchingPreds && (matchingPreds / totalPreds) < 0.35) {
          upsetCount++;
        }
      }
    }
    await checkUnlock('CORRECT_UPSET', upsetCount >= 1);
    await checkUnlock('GIANT_KILLER', upsetCount >= 3);

    // 6. Perfect Round
    // If user has predicted all matches in a group/stage, and all predictions were correct (result_type !== WRONG)
    // Let's check for GROUP_C as an example round
    const rounds = ['GROUP_A', 'GROUP_B', 'GROUP_C', 'GROUP_D', 'GROUP_E', 'GROUP_F', 'GROUP_G', 'GROUP_H'];
    for (const round of rounds) {
      const { data: roundMatches } = await supabase
        .from('matches')
        .select('id')
        .eq('stage', round)
        .eq('status', 'FINISHED');

      if (roundMatches && roundMatches.length > 0) {
        const roundMatchIds = roundMatches.map((m) => m.id);
        const userRoundPreds = predictions.filter((p) => roundMatchIds.includes(p.match_id));
        if (userRoundPreds.length === roundMatches.length && userRoundPreds.every((p) => p.result_type !== 'WRONG')) {
          await checkUnlock('PERFECT_ROUND', true);
          break;
        }
      }
    }

    // 7. Top 1000
    // Check global leaderboard rank
    const { data: rankData } = await supabase
      .from('global_leaderboard')
      .select('overall_rank, country_rank')
      .eq('user_id', userId)
      .single();
    if (rankData && rankData.overall_rank <= 1000) {
      await checkUnlock('TOP_1000', true);
    }

    // 8. Country Captain
    if (rankData && rankData.country_rank === 1 && stats.totalPoints > 0) {
      await checkUnlock('COUNTRY_CAPTAIN', true);
    }

    // 9. Tournament Veteran
    // Predicted in all 64 matches
    await checkUnlock('TOURNAMENT_VETERAN', predictions.length === 64);

  } catch (err: any) {
    console.error('[checkAndAwardAchievements] Error:', err.message);
  }
}
