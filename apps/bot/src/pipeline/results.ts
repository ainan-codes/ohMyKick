import { supabase } from '../db/client.js';
import { getUserById, getUserStats } from '../db/users.js';
import { getMatchById } from '../db/matches.js';
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
  awayScore: number
): Promise<void> {
  console.log(`[Results] Processing match ${matchId}: ${homeScore}-${awayScore}`);

  // Lock all remaining predictions for this match
  await lockMatchPredictions(matchId);

  // Get all locked predictions for this match
  const predictions = await getAllPredictionsForMatch(matchId);
  console.log(`[Results] Found ${predictions.length} predictions to settle`);

  // Settle each prediction
  for (const prediction of predictions) {
    try {
      // Determine actual winner from scores
      const actualWinner =
        homeScore > awayScore ? 'HOME' : awayScore > homeScore ? 'AWAY' : 'DRAW';

      const { resultType, points } = calculateResultType(
        prediction.predicted_home_score,
        prediction.predicted_away_score,
        prediction.predicted_winner,
        homeScore,
        awayScore
      );

      // Update prediction with result
      await updatePredictionResult(prediction.id, resultType, points);

      // Update user total points
      await supabase.rpc('increment_user_points', {
        user_id: prediction.user_id,
        points_to_add: points,
      });

      // Queue result poster generation
      await posterQueue.add('result-poster', {
        type: 'result',
        userId: prediction.user_id,
        matchId,
        predictionId: prediction.id,
      }, {
        // Stagger jobs slightly to avoid hitting poster API all at once
        delay: Math.floor(Math.random() * 30000), // 0-30 second random delay
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
