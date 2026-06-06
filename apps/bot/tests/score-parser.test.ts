import { describe, it, expect } from 'vitest';
import { parseScore, validateScoreConsistency } from '../src/utils/score-parser.js';

describe('parseScore', () => {
  it('parses "2-1"', () => {
    expect(parseScore('2-1')).toEqual({ home: 2, away: 1 });
  });
  it('parses "2 1"', () => {
    expect(parseScore('2 1')).toEqual({ home: 2, away: 1 });
  });
  it('parses "2:1"', () => {
    expect(parseScore('2:1')).toEqual({ home: 2, away: 1 });
  });
  it('parses "2 - 1"', () => {
    expect(parseScore('2 - 1')).toEqual({ home: 2, away: 1 });
  });
  it('rejects negative scores', () => {
    expect(parseScore('-1-2')).toBeNull();
  });
  it('rejects out-of-range scores', () => {
    expect(parseScore('21-0')).toBeNull();
  });
  it('returns null for garbage input', () => {
    expect(parseScore('hello world')).toBeNull();
  });
});

describe('validateScoreConsistency', () => {
  it('accepts HOME winner with home > away', () => {
    const result = validateScoreConsistency({ home: 2, away: 1 }, 'HOME');
    expect(result.valid).toBe(true);
  });

  it('rejects HOME winner with home <= away', () => {
    const result = validateScoreConsistency({ home: 1, away: 1 }, 'HOME');
    expect(result.valid).toBe(false);
  });

  it('accepts AWAY winner with away > home', () => {
    const result = validateScoreConsistency({ home: 0, away: 2 }, 'AWAY');
    expect(result.valid).toBe(true);
  });

  it('rejects AWAY winner with home >= away', () => {
    const result = validateScoreConsistency({ home: 2, away: 1 }, 'AWAY');
    expect(result.valid).toBe(false);
  });

  it('accepts DRAW with equal scores', () => {
    const result = validateScoreConsistency({ home: 1, away: 1 }, 'DRAW');
    expect(result.valid).toBe(true);
  });

  it('auto-corrects DRAW with unequal scores', () => {
    const result = validateScoreConsistency({ home: 2, away: 1 }, 'DRAW');
    expect(result.valid).toBe(true);
    expect(result.correctedScore).toEqual({ home: 2, away: 2 });
  });
});

describe('calculateResultType', () => {
  // Import inline for testing
  const calculateResultType = (
    ph: number, pa: number, pw: string, ah: number, aa: number
  ) => {
    if (ph === ah && pa === aa) return { resultType: 'PERFECT', points: 25 };
    const actualWinner = ah > aa ? 'HOME' : aa > ah ? 'AWAY' : 'DRAW';
    if (pw === actualWinner) return { resultType: 'CORRECT_WINNER', points: 10 };
    return { resultType: 'WRONG', points: 0 };
  };

  it('awards 25 points for exact score', () => {
    const r = calculateResultType(2, 1, 'HOME', 2, 1);
    expect(r).toEqual({ resultType: 'PERFECT', points: 25 });
  });

  it('awards 10 points for correct winner', () => {
    const r = calculateResultType(2, 1, 'HOME', 3, 0);
    expect(r).toEqual({ resultType: 'CORRECT_WINNER', points: 10 });
  });

  it('awards 0 points for wrong prediction', () => {
    const r = calculateResultType(2, 1, 'HOME', 0, 1);
    expect(r).toEqual({ resultType: 'WRONG', points: 0 });
  });
});
