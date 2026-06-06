/**
 * Global keyword definitions for the OhMyKick state machine.
 *
 * These are recognised in *any* conversation state and override
 * the current state-specific handler.  Import from this file to keep
 * keyword strings in one place.
 */

export const PREDICT_KEYWORDS  = ['predict', 'prediction', 'predictions'];
export const PASSPORT_KEYWORDS = ['passport', 'my card', 'card', 'fan card'];
export const REFERRAL_KEYWORDS = ['refer', 'invite', 'referral', 'share'];
export const MENU_KEYWORDS     = ['hi', 'hello', 'hey', 'start', 'help', 'menu'];
export const STREAK_KEYWORDS   = ['streak'];
export const LANGUAGE_KEYWORDS = ['lang', 'language', 'ഭാഷ', 'اللغة'];

/** Returns true if the lowercased text matches any keyword in the list. */
export function matchesKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase().trim();
  return keywords.some((kw) => lower === kw || lower.startsWith(kw + ' '));
}
