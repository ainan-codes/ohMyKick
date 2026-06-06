import { bot } from '../telegram/sender.js';
import { getUserByTgId, createUser, updateUser } from '../db/users.js';
import { processMessage } from '../state-machine/index.js';
import { handleOnboardingPhotoUploaded } from '../flows/onboarding.js';
import { sendTgText, sendTgButtons, sendTgPhoto } from '../telegram/sender.js';
import type { BotResponse, BotMessage } from '../flows/prediction.js';
import type { FastifyInstance } from 'fastify';

export function registerTelegramHandler(app: FastifyInstance) {
  // Webhook route — Fastify forwards the body to Telegraf
  app.post('/webhook/telegram', async (req, reply) => {
    try {
      await bot.handleUpdate(req.body as any);
    } catch (err) {
      console.error('[TG webhook] error', err);
    }
    reply.send({ ok: true });
  });

  // ─── Telegraf handlers ─────────────────────────────────────

  // /start with optional referral code
  bot.start(async (ctx) => {
    const tgId = ctx.from.id.toString();
    const referralCode = ctx.startPayload ?? undefined;

    let user = await getUserByTgId(tgId);
    if (!user) {
      // Create new user
      user = await createUser({
        tg_id: tgId,
        name: ctx.from.first_name ?? 'Fan',
        country_code: 'XX',
        country_name: 'Unknown',
        country_flag_emoji: '🌍',
        referred_by_code: referralCode,
      });
    }

    if (!user) {
      await ctx.reply('⚠️ Failed to create your account. Please try /start again.');
      return;
    }

    const response = await processMessage(
      user,
      { type: 'text', text: 'start' },
      'tg'
    );
    await sendTelegramResponse(ctx.chat.id, response);
  });

  // Text messages
  bot.on('text', async (ctx) => {
    const tgId = ctx.from.id.toString();
    const text = ctx.message.text;

    const user = await getUserByTgId(tgId);
    if (!user) {
      await ctx.reply('Send /start to begin!');
      return;
    }

    const response = await processMessage(user, { type: 'text', text }, 'tg');
    await sendTelegramResponse(ctx.chat.id, response);
  });

  // Callback query (inline keyboard button taps)
  bot.on('callback_query', async (ctx) => {
    // Acknowledge immediately to prevent timeout
    await ctx.answerCbQuery().catch(() => {});

    const tgId = ctx.from.id.toString();
    const data = (ctx.callbackQuery as any).data ?? '';

    const user = await getUserByTgId(tgId);
    if (!user) return;

    const response = await processMessage(user, { type: 'button_reply', text: data }, 'tg');
    if (ctx.chat) {
      await sendTelegramResponse(ctx.chat.id, response);
    }
  });

  // Photo upload (for onboarding passport photo)
  bot.on('photo', async (ctx) => {
    const tgId = ctx.from.id.toString();
    const user = await getUserByTgId(tgId);

    if (!user || user.conversation_state !== 'ONBOARDING_PHOTO') return;

    try {
      // Get largest photo version
      const photos = ctx.message.photo;
      const largestPhoto = photos[photos.length - 1];
      const file = await ctx.telegram.getFile(largestPhoto.file_id);
      const photoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

      // Download and upload to Supabase Storage
      const response = await fetch(photoUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      const { supabase } = await import('../db/client.js');
      const path = `photos/${user.id}.jpg`;
      await supabase.storage.from('photos').upload(path, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path);

      const botResponse = await handleOnboardingPhotoUploaded(user, urlData.publicUrl);
      await sendTelegramResponse(ctx.chat.id, botResponse);
    } catch (err: any) {
      console.error('[TG photo handler]', err.message);
      await ctx.reply('⚠️ Failed to upload photo. You can skip for now and add it later.');
    }
  });
}

// ─── Response dispatcher ──────────────────────────────────────

async function sendTelegramResponse(
  chatId: number | string,
  response: BotResponse
): Promise<void> {
  for (const msg of response.messages) {
    await dispatchTelegramMessage(chatId, msg);
  }
}

async function dispatchTelegramMessage(
  chatId: number | string,
  msg: BotMessage
): Promise<void> {
  switch (msg.kind) {
    case 'text':
      await sendTgText(chatId, msg.text);
      break;

    case 'buttons':
      await sendTgButtons(chatId, msg.text, msg.buttons, 3);
      break;

    case 'list': {
      // Telegram doesn't have native list menus — convert to inline keyboard buttons
      const allRows = msg.sections.flatMap((s) =>
        s.rows.map((r) => ({ id: r.id, label: r.title }))
      );
      await sendTgButtons(chatId, msg.text, allRows, 1);
      break;
    }

    case 'image':
      await sendTgPhoto(chatId, msg.url, msg.caption, msg.buttons);
      break;
  }
}
