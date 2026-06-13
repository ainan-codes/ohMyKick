import type { FastifyInstance } from 'fastify';
import { extractWhatsAppMessage, downloadWhatsAppMedia } from '../whatsapp/sender.js';
import { sendWhatsAppText, sendWhatsAppButtons, sendWhatsAppList, sendWhatsAppImage } from '../whatsapp/sender.js';
import { getUserByWaId, createUser } from '../db/users.js';
import { processMessage } from '../state-machine/index.js';
import { handleOnboardingPhotoUploaded } from '../flows/onboarding.js';
import { supabase } from '../db/client.js';
import type { BotResponse, BotMessage } from '../flows/prediction.js';

const WA_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? '';

export function registerWhatsAppHandler(app: FastifyInstance) {
  // Webhook verification (GET)
  app.get('/webhook/whatsapp', async (req, reply) => {
    const query = req.query as any;
    if (
      query['hub.mode'] === 'subscribe' &&
      query['hub.verify_token'] === WA_VERIFY_TOKEN
    ) {
      return reply.send(query['hub.challenge']);
    }
    return reply.status(403).send('Forbidden');
  });

  // Incoming messages (POST)
  app.post('/webhook/whatsapp', async (req, reply) => {
    // Always return 200 immediately
    reply.status(200).send({ ok: true });

    // Process asynchronously
    setImmediate(async () => {
      try {
        await handleWhatsAppWebhook(req.body);
      } catch (err: any) {
        console.error('[WA webhook] Error:', err.message);
      }
    });
  });
}

async function handleWhatsAppWebhook(body: any): Promise<void> {
  const msg = extractWhatsAppMessage(body);
  if (!msg) return;

  let user = await getUserByWaId(msg.waId);

  if (!user) {
    // Extract referral code from first message if present
    const referralCodeMatch = msg.text.match(/\b([A-Z0-9]{6})\b/);
    const referralCode = referralCodeMatch?.[1];

    user = await createUser({
      wa_id: msg.waId,
      name: 'Fan', // Will be updated during onboarding
      country_code: 'XX',
      country_name: 'Unknown',
      country_flag_emoji: '🌍',
      referred_by_code: referralCode,
    });
  }

  if (!user) return;

  // Handle photo upload during onboarding
  if (msg.hasImage && msg.imageId && user.conversation_state === 'ONBOARDING_PHOTO') {
    const photoBuffer = await downloadWhatsAppMedia(msg.imageId);
    if (photoBuffer) {
      const path = `photos/${msg.waId}.jpg`;
      await supabase.storage.from('photos').upload(path, photoBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path);
      const response = await handleOnboardingPhotoUploaded(user, urlData.publicUrl);
      await sendWhatsAppResponse(msg.waId, response);
      return;
    }
  }

  // Determine message text: prefer button/list reply IDs, fall back to text
  const messageText = msg.buttonReplyId || msg.listReplyId || msg.text;

  const response = await processMessage(
    user,
    { type: 'text', text: messageText },
    'wa'
  );

  await sendWhatsAppResponse(msg.waId, response);
}

async function sendWhatsAppResponse(to: string, response: BotResponse): Promise<void> {
  for (const msg of response.messages) {
    await dispatchWhatsAppMessage(to, msg);
  }
}

async function dispatchWhatsAppMessage(to: string, msg: BotMessage): Promise<void> {
  switch (msg.kind) {
    case 'text':
      await sendWhatsAppText(to, msg.text);
      break;

    case 'buttons':
      await sendWhatsAppButtons(
        to,
        msg.text,
        msg.buttons.map((b) => ({ id: b.id, title: b.label }))
      );
      break;

    case 'list':
      await sendWhatsAppList(to, msg.text, msg.buttonLabel, msg.sections);
      break;

    case 'image':
      await sendWhatsAppImage(to, msg.url, msg.caption);
      break;
  }
}
