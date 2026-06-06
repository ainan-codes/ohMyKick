import { supabase, Prediction } from './client.js';

export async function getUserPredictionForMatch(
  userId: string,
  matchId: string
): Promise<Prediction | null> {
  const { data } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .single();
  return data;
}

export async function deletePrediction(predictionId: string): Promise<void> {
  await supabase
    .from('predictions')
    .delete()
    .eq('id', predictionId)
    .eq('is_locked', false);
}

export async function createPrediction(params: {
  user_id: string;
  match_id: string;
  predicted_winner: string;
  predicted_home_score: number;
  predicted_away_score: number;
}): Promise<Prediction | null> {
  const { data, error } = await supabase
    .from('predictions')
    .insert({
      ...params,
      is_locked: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[createPrediction] Error:', error.message);
    return null;
  }
  return data;
}

export async function lockMatchPredictions(matchId: string): Promise<void> {
  await supabase
    .from('predictions')
    .update({ is_locked: true, updated_at: new Date().toISOString() })
    .eq('match_id', matchId)
    .eq('is_locked', false);
}

export async function updatePredictionResult(
  predictionId: string,
  resultType: 'PERFECT' | 'CORRECT_WINNER' | 'WRONG',
  pointsEarned: number
): Promise<void> {
  await supabase
    .from('predictions')
    .update({
      result_type: resultType,
      points_earned: pointsEarned,
      updated_at: new Date().toISOString(),
    })
    .eq('id', predictionId);
}

export async function updatePredictionPosterUrl(
  predictionId: string,
  type: 'prematch' | 'result',
  url: string
): Promise<void> {
  const field = type === 'prematch' ? 'prematch_poster_url' : 'result_poster_url';
  await supabase
    .from('predictions')
    .update({ [field]: url, updated_at: new Date().toISOString() })
    .eq('id', predictionId);
}

export async function markPosterSent(
  predictionId: string,
  type: 'prematch' | 'result',
  channel: 'wa' | 'tg'
): Promise<void> {
  const field =
    type === 'prematch'
      ? channel === 'wa' ? 'prematch_poster_sent_wa' : 'prematch_poster_sent_tg'
      : channel === 'wa' ? 'result_poster_sent_wa' : 'result_poster_sent_tg';
  await supabase
    .from('predictions')
    .update({ [field]: true, updated_at: new Date().toISOString() })
    .eq('id', predictionId);
}

export async function getAllPredictionsForMatch(matchId: string): Promise<Prediction[]> {
  const { data } = await supabase
    .from('predictions')
    .select('*')
    .eq('match_id', matchId)
    .eq('is_locked', true);
  return data ?? [];
}

export async function getUserRecentPredictions(userId: string, limit = 10): Promise<Prediction[]> {
  const { data } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export function calculateResultType(
  predictedHome: number,
  predictedAway: number,
  predictedWinner: string,
  actualHome: number,
  actualAway: number
): { resultType: 'PERFECT' | 'CORRECT_WINNER' | 'WRONG'; points: number } {
  // Exact score match
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return { resultType: 'PERFECT', points: 25 };
  }

  // Determine actual winner
  const actualWinner =
    actualHome > actualAway ? 'HOME' : actualAway > actualHome ? 'AWAY' : 'DRAW';

  if (predictedWinner === actualWinner) {
    return { resultType: 'CORRECT_WINNER', points: 10 };
  }

  return { resultType: 'WRONG', points: 0 };
}
