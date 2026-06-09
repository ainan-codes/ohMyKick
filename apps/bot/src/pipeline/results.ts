import { supabase } from '../db/client.js';
import { getUserById, getUserStats } from '../db/users.js';
import { getMatchById } from '../db/matches.js';
import { checkAndAwardAchievements } from '../utils/achievements.js';
import {
  getAllPredictionsForMatch,
  updatePredictionResult,
  calculateResultType,
  lockMatchPredictions,
} from '../db/predictions.js';
import { posterQueue } from '../queues/queue.js';

export async function processMatchResult(
  matchId: string,
  homeScore: number,
  awayScore: number,
  firstScorer: string | null = null
): Promise<void> {
  console.log(`[Results] Processing match ${matchId}: ${homeScore}-${awayScore}`);

  // Lock all remaining predictions for this match
  await lockMatchPredictions(matchId);

  // Persist the actual final score to the match record
  await supabase.from('matches').update({
    home_score: homeScore,
    away_score: awayScore,
    status: 'FINISHED',
    prediction_open: false,
    updated_at: new Date().toISOString(),
  }).eq('id', matchId);

  // Get all locked predictions for this match
  const predictions = await getAllPredictionsForMatch(matchId);
  console.log(`[Results] Found ${predictions.length} predictions to settle`);

  // Settle each prediction
  for (const prediction of predictions) {
    try {
      // Determine actual winner from scores
      const actualWinner =
        homeScore > awayScore ? 'HOME' : awayScore > homeScore ? 'AWAY' : 'DRAW';

      let { resultType, points } = calculateResultType(
        prediction.predicted_home_score,
        prediction.predicted_away_score,
        prediction.predicted_winner,
        homeScore,
        awayScore
      );

      // Add First Goal Scorer bonus points (20 points)
      if (
        firstScorer &&
        prediction.predicted_first_scorer &&
        prediction.predicted_first_scorer.toLowerCase() === firstScorer.toLowerCase()
      ) {
        points += 20;
      }

      // Update prediction with result
      await updatePredictionResult(prediction.id, resultType, points);

      // Update user total points
      await supabase.rpc('increment_user_points', {
        user_id: prediction.user_id,
        points_to_add: points,
      });

      // Fan Level Logic
      const stats = await getUserStats(prediction.user_id);
      const user = await getUserById(prediction.user_id);
      if (user && stats) {
        let newLevel = user.fan_level;
        if (stats.total >= 15 && stats.accuracyPct >= 50) {
          newLevel = 'LEGEND';
        } else if (stats.total >= 5) {
          newLevel = 'SUPPORTER';
        }
        
        if (newLevel !== user.fan_level) {
          await supabase.from('users').update({ fan_level: newLevel }).eq('id', user.id);
          // Queue passport poster update
          await posterQueue.add('passport-poster', {
            type: 'passport',
            userId: user.id
          });
        }
      }

      // Check and award any achievements unlocked by this match result
      await checkAndAwardAchievements(prediction.user_id);

      // Queue result poster generation (no random delay — poster API handles concurrency)
      await posterQueue.add('result-poster', {
        type: 'result',
        userId: prediction.user_id,
        matchId,
        predictionId: prediction.id,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      });

      console.log(`[Results] Settled prediction ${prediction.id}: ${resultType} (+${points} pts)`);
    } catch (err: any) {
      console.error(`[Results] Error settling prediction ${prediction.id}:`, err.message);
    }
  }

  console.log(`[Results] Done processing match ${matchId}`);
}

