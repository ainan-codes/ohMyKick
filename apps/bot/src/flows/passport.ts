import { User } from '../db/client.js';
import { getUserStats } from '../db/users.js';
import { posterQueue } from '../queues/queue.js';
import type { BotResponse } from './prediction.js';

export async function handlePassportRequest(user: User): Promise<BotResponse> {
  const stats = await getUserStats(user.id);

  // Queue passport regeneration with latest stats
  await posterQueue.add('passport', {
    type: 'passport',
    userId: user.id,
  });

  return {
    messages: [
      {
        kind: 'text',
        text:
          `🎫 *Your Fan Passport*\n\n` +
          `Updated now with your latest:\n` +
          `⚽ ${stats.total} predictions | 🎯 ${stats.accuracyPct}% accuracy\n` +
          `🔥 ${user.streak_count}-day streak | 👥 ${user.referral_count} friends referred\n\n` +
          `Generating your updated passport... 📸`,
      },
    ],
  };
}
