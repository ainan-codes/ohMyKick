import { User } from '../db/client.js';
import { updateConversationState, updateLastActive, updateUser } from '../db/users.js';
import {
  startOnboarding,
  handleOnboardingName,
  handleOnboardingCountry,
  handleOnboardingPhotoSkipped,
} from '../flows/onboarding.js';
import {
  startPredictionFlow,
  handleMatchSelection,
  handleWinnerSelection,
  handleScoreInput,
  type BotResponse,
  type ChannelMessage,
} from '../flows/prediction.js';
import { handlePassportRequest } from '../flows/passport.js';
import { handleReferralRequest } from '../flows/referral.js';
import { getTranslation } from '../utils/i18n.js';

// Global keywords that work in any state
const PREDICT_KEYWORDS = ['predict', 'prediction', 'predictions'];
const PASSPORT_KEYWORDS = ['passport', 'my card', 'card', 'fan card'];
const REFERRAL_KEYWORDS = ['refer', 'invite', 'referral', 'share'];
const MENU_KEYWORDS = ['hi', 'hello', 'hey', 'start', 'help', 'menu'];
const STREAK_KEYWORDS = ['streak'];
const LANGUAGE_KEYWORDS = ['lang', 'language', 'ഭാഷ', 'اللغة'];

export async function processMessage(
  user: User,
  msg: ChannelMessage,
  channel: 'wa' | 'tg'
): Promise<BotResponse> {
  await updateLastActive(user.id, channel);

  // Global language setting intercept from buttons
  if (msg.text.startsWith('language_')) {
    const lang = msg.text.replace('language_', '');
    await updateUser(user.id, { language: lang });
    const successMsg = lang === 'ml'
      ? '✅ ഭാഷ വിജയകരമായി മലയാളത്തിലേക്ക് മാറ്റി!'
      : lang === 'ar'
      ? '✅ تم تغيير اللغة إلى العربية بنجاح!'
      : '✅ Language successfully changed to English!';
    return {
      messages: [{ kind: 'text', text: successMsg }],
    };
  }

  const text = msg.text?.toLowerCase().trim() ?? '';
  const cleanText = text.startsWith('/') ? text.slice(1) : text;
  const state = user.conversation_state;

  // ─── Global keyword overrides (except during active onboarding) ───
  if (!['ONBOARDING_NAME', 'ONBOARDING_COUNTRY', 'ONBOARDING_PHOTO'].includes(state)) {
    if (PREDICT_KEYWORDS.some((k) => cleanText.startsWith(k)) || msg.text === 'predict_now') {
      return startPredictionFlow(user);
    }

    if (PASSPORT_KEYWORDS.some((k) => cleanText.startsWith(k)) || msg.text === 'view_passport') {
      return handlePassportRequest(user);
    }

    if (REFERRAL_KEYWORDS.some((k) => cleanText.startsWith(k)) || msg.text === 'referral_info') {
      return handleReferralRequest(user);
    }

    if (STREAK_KEYWORDS.some((k) => cleanText === k)) {
      return buildStreakResponse(user);
    }

    if (LANGUAGE_KEYWORDS.some((k) => cleanText === k)) {
      return buildLanguageSelection(user);
    }

    if (MENU_KEYWORDS.some((k) => cleanText === k) && state === 'IDLE') {
      return buildMainMenu(user);
    }
  }

  // ─── State machine routing ───────────────────────────────────────
  switch (state) {
    case 'NEW':
      return startOnboarding(user);

    case 'ONBOARDING_NAME':
      return handleOnboardingName(user, msg.text);

    case 'ONBOARDING_COUNTRY': {
      // Extract country code from list reply ID: "country_AR" → "AR"
      const replyId = msg.text; // state machine passes the raw ID
      const countryCode = replyId.startsWith('country_')
        ? replyId.replace('country_', '')
        : replyId;
      return handleOnboardingCountry(user, countryCode);
    }

    case 'ONBOARDING_PHOTO': {
      if (msg.type === 'photo') {
        // Photo handling is done upstream — this state just shows the skip option
        return handleOnboardingPhotoSkipped(user);
      }
      if (msg.text === 'photo_skip' || text === 'skip') {
        return handleOnboardingPhotoSkipped(user);
      }
      // Remind user
      return {
        messages: [
          {
            kind: 'buttons',
            text: `📷 *To add a photo:* Tap the paperclip 📎 or camera icon next to your message box and upload your picture.\n\nOtherwise, tap Skip for Now:`,
            buttons: [
              { id: 'photo_skip', label: '⏭ Skip for Now' },
            ],
          },
        ],
      };
    }

    case 'PREDICTION_MATCH_SELECT': {
      const matchId = msg.text.startsWith('match_')
        ? msg.text.replace('match_', '')
        : null;
      if (matchId) return handleMatchSelection(user, matchId);
      // Unrecognized — re-show prediction flow
      return startPredictionFlow(user);
    }

    case 'PREDICTION_WINNER': {
      if (['winner_home', 'winner_draw', 'winner_away'].includes(msg.text)) {
        return handleWinnerSelection(user, msg.text);
      }
      // Text fallback
      return {
        messages: [
          {
            kind: 'text',
            text: '⚠️ Please tap one of the buttons to choose the winner.',
          },
        ],
      };
    }

    case 'PREDICTION_SCORE':
      return handleScoreInput(user, msg.text);

    case 'IDLE':
    default:
      return buildMainMenu(user);
  }
}

function buildMainMenu(user: User): BotResponse {
  return {
    messages: [
      {
        kind: 'list',
        text: `⚽ *OhMyKick — World Cup 2026*\n\nWhat do you want to do?`,
        buttonLabel: 'Open Menu',
        sections: [
          {
            title: 'PREDICTIONS',
            rows: [
              { id: 'predict_now', title: '⚽ Predict a match' },
              { id: 'my_predictions', title: '📋 My predictions' },
            ],
          },
          {
            title: 'MY PROFILE',
            rows: [
              { id: 'view_passport', title: '🎫 My fan passport' },
              { id: 'streak_check', title: '🔥 My streak' },
            ],
          },
          {
            title: 'INVITE',
            rows: [{ id: 'referral_info', title: '📨 Invite friends' }],
          },
          {
            title: 'HELP',
            rows: [{ id: 'how_it_works', title: 'ℹ️ How does OhMyKick work?' }],
          },
        ],
      },
    ],
  };
}

function buildStreakResponse(user: User): BotResponse {
  const streakText =
    user.streak_count > 0
      ? `Current streak: *${user.streak_count} day${user.streak_count !== 1 ? 's' : ''}*\n\n` +
        `You've predicted in ${user.streak_count} consecutive day${user.streak_count !== 1 ? 's' : ''}.\n` +
        `Don't break it — predict today's match to keep it alive.`
      : `You don't have an active streak yet.\n\nPredict today's match to start one! 🔥`;

  return {
    messages: [
      {
        kind: 'text',
        text: `🔥 *YOUR STREAK*\n\n${streakText}\n\nStreaks reset at midnight if you miss a day.`,
      },
    ],
  };
}

function buildLanguageSelection(user: User): BotResponse {
  return {
    messages: [
      {
        kind: 'buttons',
        text:
          '🌐 Choose your language:\n' +
          'വിജയകരമായി ഭാഷ തിരഞ്ഞെടുക്കുക:\n' +
          'اختر لغتك المفضلة:',
        buttons: [
          { id: 'language_en', label: 'English 🇬🇧' },
          { id: 'language_ml', label: 'മലയാളം 🇮🇳' },
          { id: 'language_ar', label: 'العربية 🇸🇦' },
        ],
      },
    ],
  };
}
