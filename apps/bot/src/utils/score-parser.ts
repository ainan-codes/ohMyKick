/**
 * Score Parser
 * Accepts variants: "2-1", "2 1", "2:1", "2–1" (en-dash), "2 - 1"
 * Returns { home, away } or null if invalid
 */

const SCORE_REGEX = /\b(\d{1,2})\s*[-:–\s]\s*(\d{1,2})\b/;

export interface ParsedScore {
  home: number;
  away: number;
}

export function parseScore(text: string): ParsedScore | null {
  const trimmed = text.trim();
  const match = SCORE_REGEX.exec(trimmed);
  if (!match) return null;

  // Reject if preceded by a minus sign (indicating a negative score, e.g. -1-2)
  const matchIndex = match.index;
  const beforeMatch = trimmed.substring(0, matchIndex).trim();
  if (beforeMatch.endsWith('-') || beforeMatch.endsWith('–')) {
    return null;
  }

  const home = parseInt(match[1], 10);
  const away = parseInt(match[2], 10);

  // Validate bounds
  if (home < 0 || home > 20 || away < 0 || away > 20) return null;

  return { home, away };
}

/**
 * Validate score consistency against predicted winner
 * Returns corrected score or null if rejection needed
 */
export function validateScoreConsistency(
  score: ParsedScore,
  predictedWinner: 'HOME' | 'DRAW' | 'AWAY'
): { valid: boolean; correctedScore?: ParsedScore; rejectionReason?: string } {
  const { home, away } = score;

  if (predictedWinner === 'HOME') {
    if (home <= away) {
      return {
        valid: false,
        rejectionReason: `If you're predicting a home win, the score must have home goals > away goals (e.g. 2-0, 3-1). You said ${home}-${away}.`,
      };
    }
  }

  if (predictedWinner === 'AWAY') {
    if (away <= home) {
      return {
        valid: false,
        rejectionReason: `If you're predicting an away win, the score must have away goals > home goals (e.g. 0-2, 1-3). You said ${home}-${away}.`,
      };
    }
  }

  if (predictedWinner === 'DRAW') {
    if (home !== away) {
      // Auto-correct: use home score for both
      return {
        valid: true,
        correctedScore: { home, away: home },
      };
    }
  }

  return { valid: true };
}
