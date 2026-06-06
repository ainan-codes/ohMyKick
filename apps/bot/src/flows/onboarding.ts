import { User } from '../db/client.js';
import { updateConversationState, updateUser, getUserStats } from '../db/users.js';
import { COUNTRIES, getAllCountriesForMenu, TOP_PICK_CODES } from '../utils/countries.js';
import { posterQueue } from '../queues/queue.js';
import { getTranslation } from '../utils/i18n.js';
import { trackEvent } from '../utils/analytics.js';
import type { BotResponse, ListSection } from './prediction.js';

export async function startOnboarding(user: User, waName?: string): Promise<BotResponse> {
  await updateConversationState(user.id, 'ONBOARDING_NAME');
  trackEvent(user.id, 'onboarding_started');
  return {
    messages: [
      {
        kind: 'text',
        text: getTranslation(user.language, 'welcome'),
      },
    ],
  };
}

export async function handleOnboardingName(
  user: User,
  text: string
): Promise<BotResponse> {
  const name = text.trim();

  // Validate: 2-40 chars, letters/spaces/hyphens only
  if (name.length < 2 || name.length > 40 || !/^[a-zA-Z\s\-']+$/.test(name)) {
    return {
      messages: [
        {
          kind: 'text',
          text: getTranslation(user.language, 'invalid_name'),
        },
      ],
    };
  }

  // Save name and move to country selection
  await updateUser(user.id, { name });
  await updateConversationState(user.id, 'ONBOARDING_COUNTRY');
  trackEvent(user.id, 'onboarding_name_entered');

  const topPicks = TOP_PICK_CODES.map((code) => {
    const c = COUNTRIES[code];
    return { id: `country_${code}`, title: `${c.name} ${c.flag}` };
  });

  const allCodes = Object.keys(COUNTRIES).filter((c) => !TOP_PICK_CODES.includes(c)).sort();
  const midpoint = Math.ceil(allCodes.length / 2);
  const firstHalf = allCodes.slice(0, midpoint);
  const secondHalf = allCodes.slice(midpoint);

  const sections: ListSection[] = [
    { title: 'TOP PICKS', rows: topPicks },
    {
      title: 'ALL TEAMS (A–M)',
      rows: firstHalf.map((code) => {
        const c = COUNTRIES[code];
        return { id: `country_${code}`, title: `${c.name} ${c.flag}` };
      }),
    },
    {
      title: 'ALL TEAMS (N–Z)',
      rows: secondHalf.map((code) => {
        const c = COUNTRIES[code];
        return { id: `country_${code}`, title: `${c.name} ${c.flag}` };
      }),
    },
  ];

  return {
    messages: [
      {
        kind: 'list',
        text: getTranslation(user.language, 'greet_name', name),
        buttonLabel: getTranslation(user.language, 'choose_country'),
        sections,
      },
    ],
  };
}

export async function handleOnboardingCountry(
  user: User,
  countryCode: string
): Promise<BotResponse> {
  const country = COUNTRIES[countryCode];
  if (!country) {
    return {
      messages: [
        { kind: 'text', text: `⚠️ Country not recognized. Please select from the list.` },
      ],
    };
  }

  // Save country and move to photo step
  await updateUser(user.id, {
    country_code: countryCode,
    country_name: country.name,
    country_flag_emoji: country.flag,
  });
  await updateConversationState(user.id, 'ONBOARDING_PHOTO');
  trackEvent(user.id, 'onboarding_country_selected', { country: countryCode });

  return {
    messages: [
      {
        kind: 'buttons',
        text: getTranslation(user.language, 'photo_prompt', country.flag, country.name),
        buttons: [
          { id: 'photo_send', label: '📸 Send My Photo' },
          { id: 'photo_skip', label: '⏭ Skip for Now' },
        ],
      },
    ],
  };
}

export async function handleOnboardingPhotoSkipped(user: User): Promise<BotResponse> {
  trackEvent(user.id, 'onboarding_photo_skipped');
  return await completeOnboarding(user);
}

export async function handleOnboardingPhotoUploaded(
  user: User,
  photoUrl: string
): Promise<BotResponse> {
  await updateUser(user.id, { photo_url: photoUrl });
  trackEvent(user.id, 'onboarding_photo_uploaded');
  return await completeOnboarding(user);
}

async function completeOnboarding(user: User): Promise<BotResponse> {
  // Update state to IDLE
  await updateConversationState(user.id, 'IDLE');
  trackEvent(user.id, 'onboarding_completed');

  // Re-fetch user to get latest data
  const stats = await getUserStats(user.id);

  // Queue passport generation
  await posterQueue.add('passport', {
    type: 'passport',
    userId: user.id,
  });

  const appUrl = process.env.APP_URL ?? 'https://ohmykick.com';

  return {
    messages: [
      {
        kind: 'text',
        text: getTranslation(
          user.language,
          'onboarding_preparing',
          user.name,
          user.fan_id,
          user.country_flag_emoji,
          user.country_name,
          user.referral_code
        ),
      },
      {
        kind: 'buttons',
        text: `━━━━━━━━━━━━━━━━\n⚽ Ready to make your first prediction?`,
        buttons: [
          { id: 'predict_now', label: getTranslation(user.language, 'predict_now') },
          { id: 'referral_info', label: getTranslation(user.language, 'invite_friends') },
        ],
      },
    ],
  };
}
