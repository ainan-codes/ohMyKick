import { User } from '../db/client.js';
import {
  updateConversationState,
  updateUser,
  getUserStats,
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

  if (predictableMatches.length === 1) {
    // Only one match — go straight to winner selection
    const match = predictableMatches[0];
    await updateConversationState(user.id, 'PREDICTION_WINNER', {
      pending_match_id: match.id,
    });
    return buildWinnerSelectionMessage(match, user);
  }

  // Multiple matches — show selection list
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
            rows: predictableMatches.map((m) => ({
              id: `match_${m.id}`,
              title: `${m.home_flag_emoji ?? ''} ${m.home_team} vs ${m.away_team} ${m.away_flag_emoji ?? ''}`.slice(0, 24),
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
    return {
      messages: [{ kind: 'text', text: '⚠️ Error saving prediction.' }],
    };
  }

  trackEvent(user.id, 'prediction_completed', {
    matchId: match.id,
    resultType: 'score',
  });

  // Update streak and clear state
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
          { id: 'winner_home', label: `${match.home_flag_emoji ?? ''} ${match.home_team}`.slice(0, 20) },
          { id: 'winner_draw', label: getTranslation(user.language, 'draw') },
          { id: 'winner_away', label: `${match.away_flag_emoji ?? ''} ${match.away_team}`.slice(0, 20) },
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
