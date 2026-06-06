import { User } from '../db/client.js';
import {
  updateConversationState,
  updateUser,
  getUserStats,
  updateStreak,
} from '../db/users.js';
import {
  getUpcomingMatches,
  getNextMatch,
  getMatchById,
  formatMatchForDisplay,
  formatKickoffTime,
} from '../db/matches.js';
import {
  getUserPredictionForMatch,
  createPrediction,
  calculateResultType,
  getUserRecentPredictions,
} from '../db/predictions.js';
import { posterQueue } from '../queues/queue.js';
import { parseScore, validateScoreConsistency } from '../utils/score-parser.js';
import { getTranslation } from '../utils/i18n.js';
import { trackEvent } from '../utils/analytics.js';
import { Match } from '../db/client.js';

// ─── Channel message interface ─────────────────────────────
export interface ChannelMessage {
  type: 'text' | 'button_reply' | 'list_reply' | 'photo';
  text: string;       // raw text OR button/list reply ID
  title?: string;     // human-readable title for list/button reply
}

export interface BotResponse {
  messages: BotMessage[];
}

export type BotMessage =
  | { kind: 'text'; text: string }
  | { kind: 'buttons'; text: string; buttons: { id: string; label: string }[] }
  | { kind: 'list'; text: string; buttonLabel: string; sections: ListSection[] }
  | { kind: 'image'; url: string; caption?: string; buttons?: { id: string; label: string }[][] };

export interface ListSection {
  title: string;
  rows: { id: string; title: string; description?: string }[];
}

// ─── Prediction flow ─────────────────────────────────────────

export async function startPredictionFlow(user: User): Promise<BotResponse> {
  const upcomingMatches = await getUpcomingMatches(24);
  const predictableMatches = upcomingMatches.filter((m) => m.prediction_open);
  trackEvent(user.id, 'prediction_started', { matchId: predictableMatches[0]?.id ?? null });

  if (predictableMatches.length === 0) {
    const nextMatch = await getNextMatch();
    if (!nextMatch) {
      return {
        messages: [
          {
            kind: 'text',
            text: getTranslation(user.language, 'no_matches'),
          },
        ],
      };
    }

    const timeUntil = getTimeUntilKickoff(nextMatch.kickoff_at);
    return {
      messages: [
        {
          kind: 'text',
          text: getTranslation(
            user.language,
            'predictions_not_open',
            formatMatchForDisplay(nextMatch),
            formatKickoffTime(nextMatch),
            timeUntil
          ),
        },
      ],
    };
  }

  // Filter out matches the user has already predicted
  const predictions = await Promise.all(
    predictableMatches.map(async (m) => {
      const pred = await getUserPredictionForMatch(user.id, m.id);
      return { match: m, prediction: pred };
    })
  );

  const unpredicted = predictions.filter((p) => !p.prediction).map((p) => p.match);
  const predicted = predictions.filter((p) => p.prediction);

  if (unpredicted.length === 0) {
    await updateConversationState(user.id, 'IDLE', {
      pending_match_id: null,
      pending_winner: null,
      state_retries: 0,
    });

    let text = `✅ *You've predicted all upcoming matches!* ⚽\n\n`;
    for (const p of predicted) {
      if (!p.prediction) continue;
      text += `• *${p.match.home_flag_emoji ?? ''} ${p.match.home_team} vs ${p.match.away_team} ${p.match.away_flag_emoji ?? ''}*\n` +
              `  Your prediction: *${p.prediction.predicted_home_score} – ${p.prediction.predicted_away_score}*\n\n`;
    }
    text += `Predictions lock at kickoff. We'll send your matchday poster soon! 📸`;
    return {
      messages: [
        {
          kind: 'buttons',
          text: text.trim(),
          buttons: [
            { id: 'view_passport', label: '🎫 My Passport' },
            { id: 'my_predictions', label: '📋 My Predictions' },
          ],
        },
      ],
    };
  }

  if (unpredicted.length === 1) {
    // Only one unpredicted match — go straight to winner selection
    const match = unpredicted[0];
    await updateConversationState(user.id, 'PREDICTION_WINNER', {
      pending_match_id: match.id,
    });
    return buildWinnerSelectionMessage(match, user);
  }

  // Multiple unpredicted matches — show selection list
  await updateConversationState(user.id, 'PREDICTION_MATCH_SELECT');
  return {
    messages: [
      {
        kind: 'list',
        text: getTranslation(user.language, 'choose_match_prompt'),
        buttonLabel: getTranslation(user.language, 'choose_match_btn'),
        sections: [
          {
            title: 'AVAILABLE MATCHES',
            rows: unpredicted.map((m) => ({
              id: `match_${m.id}`,
              title: safeSlice(`${m.home_flag_emoji ?? ''} ${m.home_team} vs ${m.away_team} ${m.away_flag_emoji ?? ''}`, 24),
              description: formatKickoffTime(m),
            })),
          },
        ],
      },
    ],
  };
}

export async function handleMatchSelection(
  user: User,
  matchId: string
): Promise<BotResponse> {
  const match = await getMatchById(matchId);
  if (!match || !match.prediction_open) {
    return {
      messages: [
        { kind: 'text', text: getTranslation(user.language, 'match_not_predictable') },
      ],
    };
  }

  // Check if already predicted
  const existing = await getUserPredictionForMatch(user.id, matchId);
  if (existing) {
    return {
      messages: [
        {
          kind: 'text',
          text: getTranslation(user.language, 'already_predicted', existing.predicted_home_score, existing.predicted_away_score),
        },
      ],
    };
  }

  await updateConversationState(user.id, 'PREDICTION_WINNER', {
    pending_match_id: matchId,
  });
  return buildWinnerSelectionMessage(match, user);
}

export async function handleWinnerSelection(
  user: User,
  replyId: string
): Promise<BotResponse> {
  let pendingWinner: 'HOME' | 'DRAW' | 'AWAY' | null = null;
  if (replyId === 'winner_home') pendingWinner = 'HOME';
  if (replyId === 'winner_draw') pendingWinner = 'DRAW';
  if (replyId === 'winner_away') pendingWinner = 'AWAY';

  if (!pendingWinner || !user.pending_match_id) {
    return {
      messages: [{ kind: 'text', text: getTranslation(user.language, 'invalid_session') }],
    };
  }

  const match = await getMatchById(user.pending_match_id);
  if (!match) {
    return { messages: [{ kind: 'text', text: getTranslation(user.language, 'invalid_session') }] };
  }

  await updateConversationState(user.id, 'PREDICTION_SCORE', {
    pending_winner: pendingWinner,
    state_retries: 0,
  });

  const teamName = pendingWinner === 'HOME' ? match.home_team : pendingWinner === 'AWAY' ? match.away_team : 'Draw';
  const teamFlag = pendingWinner === 'HOME' ? match.home_flag_emoji : pendingWinner === 'AWAY' ? match.away_flag_emoji : '🤝';

  return {
    messages: [
      {
        kind: 'text',
        text:
          getTranslation(user.language, 'win_selected', teamFlag ?? '', teamName) + '\n\n' +
          getTranslation(user.language, 'score_prompt', match.home_team, match.away_team),
      },
    ],
  };
}

export async function handleScoreInput(
  user: User,
  text: string
): Promise<BotResponse> {
  const match = user.pending_match_id ? await getMatchById(user.pending_match_id) : null;
  if (!match || !user.pending_winner) {
    return { messages: [{ kind: 'text', text: getTranslation(user.language, 'invalid_session') }] };
  }

  const pendingWinner = user.pending_winner as 'HOME' | 'DRAW' | 'AWAY';
  const parsedScore = parseScore(text);

  if (!parsedScore) {
    return await handleInvalidScore(user, match, getTranslation(user.language, 'invalid_score_format'));
  }

  const consistency = validateScoreConsistency(parsedScore, pendingWinner);
  if (!consistency.valid) {
    return await handleInvalidScore(user, match, consistency.rejectionReason ?? getTranslation(user.language, 'invalid_score_consistency'));
  }

  const finalScore = consistency.correctedScore ?? parsedScore;

  // Save prediction
  const prediction = await createPrediction({
    user_id: user.id,
    match_id: match.id,
    predicted_winner: pendingWinner,
    predicted_home_score: finalScore.home,
    predicted_away_score: finalScore.away,
  });

  if (!prediction) {
    const existing = await getUserPredictionForMatch(user.id, match.id);
    await updateConversationState(user.id, 'IDLE', {
      pending_match_id: null,
      pending_winner: null,
      state_retries: 0,
    });

    if (existing) {
      return {
        messages: [
          {
            kind: 'text',
            text: getTranslation(user.language, 'already_predicted', existing.predicted_home_score, existing.predicted_away_score),
          },
        ],
      };
    }

    return {
      messages: [{ kind: 'text', text: '⚠️ Error saving prediction. Please try again.' }],
    };
  }

  // Phase 2: If score > 0, ask for First Goal Scorer
  if (finalScore.home > 0 || finalScore.away > 0) {
    await updateConversationState(user.id, 'PREDICTION_FIRST_SCORER', {
      pending_match_id: match.id,
      pending_winner: null,
      state_retries: 0,
    });
    return {
      messages: [{ kind: 'text', text: 'Who do you think will score the FIRST goal of the match?\n\n(Type the player name, or type "skip" to ignore)' }]
    };
  }

  trackEvent(user.id, 'prediction_completed', {
    matchId: match.id,
    resultType: 'score',
  });

  // Update streak and clear state
  await updateStreak(user.id);
  await updateConversationState(user.id, 'IDLE', {
    pending_match_id: null,
    pending_winner: null,
    state_retries: 0,
  });

  // Queue prematch poster generation
  await posterQueue.add('prematch-poster', {
    type: 'prematch',
    userId: user.id,
    matchId: match.id,
    predictionId: prediction.id,
  });

  const correctionNote =
    consistency.correctedScore && consistency.correctedScore.away !== parsedScore.away
      ? getTranslation(user.language, 'auto_correct_note', finalScore.home, finalScore.away)
      : '';

  return {
    messages: [
      {
        kind: 'text',
        text: getTranslation(
          user.language,
          'locked_in',
          match.home_flag_emoji ?? '',
          match.home_team,
          finalScore.home,
          finalScore.away,
          match.away_flag_emoji ?? '',
          match.away_team
        ) + correctionNote,
      },
    ],
  };
}

// ─── Helpers ───────────────────────────────────────────────

async function handleInvalidScore(
  user: User,
  match: Match,
  reason: string
): Promise<BotResponse> {
  const retries = (user.state_retries ?? 0) + 1;

  if (retries >= 3) {
    await updateConversationState(user.id, 'IDLE', {
      pending_match_id: null,
      pending_winner: null,
      state_retries: 0,
    });
    return {
      messages: [
        {
          kind: 'text',
          text: getTranslation(user.language, 'trouble_start_over'),
        },
      ],
    };
  }

  await updateConversationState(user.id, 'PREDICTION_SCORE', {
    state_retries: retries,
  });

  return {
    messages: [
      {
        kind: 'text',
        text: getTranslation(user.language, 'invalid_score_retry', reason, match.home_team, match.away_team, retries),
      },
    ],
  };
}

function buildWinnerSelectionMessage(match: Match, user: User): BotResponse {
  return {
    messages: [
      {
        kind: 'buttons',
        text:
          `⚽ *${match.home_flag_emoji ?? ''} ${match.home_team} vs ${match.away_team} ${match.away_flag_emoji ?? ''}*\n` +
          `📅 ${formatKickoffTime(match)} | ${match.stage.replace('_', ' ')}\n\n` +
          getTranslation(user.language, 'who_wins'),
        buttons: [
          { id: 'winner_home', label: safeSlice(`${match.home_flag_emoji ?? ''} ${match.home_team}`, 20) },
          { id: 'winner_draw', label: getTranslation(user.language, 'draw') },
          { id: 'winner_away', label: safeSlice(`${match.away_flag_emoji ?? ''} ${match.away_team}`, 20) },
        ],
      },
    ],
  };
}

function getTimeUntilKickoff(kickoffAt: string): string {
  const ms = new Date(kickoffAt).getTime() - Date.now();
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} minutes`;
}

function safeSlice(str: string, limit: number): string {
  const chars = Array.from(str);
  if (chars.length <= limit) return str;
  return chars.slice(0, limit).join('');
}

export async function handleMyPredictionsRequest(user: User): Promise<BotResponse> {
  const predictions = await getUserRecentPredictions(user.id, 5);

  if (predictions.length === 0) {
    return {
      messages: [
        {
          kind: 'buttons',
          text: `📋 *YOUR PREDICTIONS*\n\nYou haven't made any predictions yet!\n\nClick "Predict Now" below to get started.`,
          buttons: [{ id: 'predict_now', label: '⚽ Predict Now' }],
        },
      ],
    };
  }

  let text = `📋 *YOUR RECENT PREDICTIONS*\n\n`;

  for (const p of predictions) {
    const match = await getMatchById(p.match_id);
    if (!match) continue;

    const matchName = `${match.home_flag_emoji ?? ''} ${match.home_team} vs ${match.away_team} ${match.away_flag_emoji ?? ''}`;
    const predictionText = `${p.predicted_home_score} – ${p.predicted_away_score}`;

    let statusIcon = '⏳';
    let statusText = 'Pending kickoff';

    if (p.is_locked) {
      statusIcon = '🔒';
      statusText = 'Locked';
    }

    if (p.result_type) {
      if (p.result_type === 'PERFECT') {
        statusIcon = '✅🏆';
        statusText = `Perfect! (+${p.points_earned} pts)`;
      } else if (p.result_type === 'CORRECT_WINNER') {
        statusIcon = '✅⚽';
        statusText = `Correct winner (+${p.points_earned} pts)`;
      } else {
        statusIcon = '❌';
        statusText = `Wrong (+0 pts)`;
      }
    }

    text += `• *${matchName}*\n  Your pick: *${predictionText}* · ${statusIcon} _${statusText}_\n\n`;
  }

  return {
    messages: [
      {
        kind: 'buttons',
        text: text.trim(),
        buttons: [
          { id: 'predict_now', label: '⚽ Predict Match' },
          { id: 'view_passport', label: '🎫 My Passport' },
        ],
      },
    ],
  };
}
export async function handleFirstScorerInput(user: User, text: string): Promise<BotResponse> {
  const matchId = user.pending_match_id;
  if (!matchId) {
    return { messages: [{ kind: 'text', text: getTranslation(user.language, 'invalid_session') }] };
  }

  const scorerName = text.toLowerCase().trim() === 'skip' ? null : text;

  if (scorerName) {
    const { error } = await supabase
      .from('predictions')
      .update({ predicted_first_scorer: scorerName })
      .eq('user_id', user.id)
      .eq('match_id', matchId);
    
    if (error) {
      console.error('Failed to update first goal scorer', error);
    }
  }

  trackEvent(user.id, 'prediction_completed', {
    matchId: matchId,
    resultType: 'score_with_scorer',
  });

  await updateStreak(user.id);

  await updateConversationState(user.id, 'IDLE', {
    pending_match_id: null,
    pending_winner: null,
    state_retries: 0,
  });

  await posterQueue.add('prematch-poster', {
    type: 'prematch',
    userId: user.id,
    matchId: matchId,
  });

  return {
    messages: [
      {
        kind: 'text',
        text: '🔒 Locked in!\n\nYour matchday poster is on its way... 📸',
      },
    ],
  };
}
