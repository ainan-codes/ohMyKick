import { supabase } from '../db/client.js';
import dotenv from 'dotenv';

dotenv.config();

const POSTHOG_KEY = process.env.POSTHOG_API_KEY ?? '';

export async function logNotification(
  userId: string,
  channel: 'WHATSAPP' | 'TELEGRAM',
  type: string,
  status: 'SENT' | 'FAILED' | 'PENDING'
): Promise<void> {
  try {
    await supabase.from('notification_log').insert({
      user_id: userId,
      channel,
      notification_type: type.toUpperCase(),
      status,
      sent_at: status === 'SENT' ? new Date().toISOString() : null,
    });
  } catch (err: any) {
    console.error('[analytics] logNotification error:', err.message);
  }
}

export function trackEvent(
  userId: string,
  event: string,
  properties?: Record<string, any>
): void {
  if (!POSTHOG_KEY) return;

  // Fire-and-forget PostHog capture via HTTP
  fetch('https://app.posthog.com/capture/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      event,
      distinct_id: userId,
      properties: {
        ...properties,
        $lib: 'ohmykick-bot',
      },
    }),
  }).catch(() => {}); // Ignore errors — analytics should never break the main flow
}
