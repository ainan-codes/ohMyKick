import { User } from '../db/client.js';
import type { BotResponse } from './prediction.js';

export async function handleReferralRequest(user: User): Promise<BotResponse> {
  const appUrl = process.env.APP_URL ?? 'https://ohmykick.com';
  const referralLink = `${appUrl}/${user.referral_code}`;

  return {
    messages: [
      {
        kind: 'text',
        text:
          `📨 *INVITE YOUR FRIENDS*\n\n` +
          `Your code: *${user.referral_code}*\n` +
          `Your link: ${referralLink}\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `Copy and send this:\n\n` +
          `_"I'm predicting every World Cup match on OhMyKick.\n` +
          `My fan passport: ${referralLink}\n\n` +
          `Join, predict against me, and let's see who really knows football ⚽🏆"_\n` +
          `━━━━━━━━━━━━━━━\n\n` +
          `Friends referred so far: *${user.referral_count}*`,
      },
    ],
  };
}
