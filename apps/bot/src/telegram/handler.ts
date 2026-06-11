import { bot } from '../telegram/sender.js';
import { getUserByTgId, createUser, updateUser, updateConversationState } from '../db/users.js';
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

    if (process.env.USE_OHMYKICK_API === 'true') {
      try {
        const apiResponse = await callRemoteAPI(tgId, 'start', {});
        await updateConversationState(user.id, JSON.stringify(apiResponse.sessionState));
        const mapped = mapRemoteResponse(apiResponse);
        await sendTelegramResponse(ctx.chat.id, mapped);
      } catch (err: any) {
        console.error('[TG start remote]', err.message);
        await sendTelegramResponse(ctx.chat.id, getErrorKeyboard('start'));
      }
    } else {
      const response = await processMessage(
        user,
        { type: 'text', text: 'start' },
        'tg'
      );
      await sendTelegramResponse(ctx.chat.id, response);
    }
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

    if (process.env.USE_OHMYKICK_API === 'true') {
      try {
        let sessionState: any = {};
        if (user.conversation_state && user.conversation_state.startsWith('{')) {
          try {
            sessionState = JSON.parse(user.conversation_state);
          } catch (e) {}
        }

        // Intercept local commands (text matching keywords)
        const lowerText = text.toLowerCase().trim();
        const cleanText = lowerText.startsWith('/') ? lowerText.slice(1) : lowerText;
        const isLeaderboard = ['rank', 'leaderboard', 'standings', 'country war'].some(k => cleanText.startsWith(k)) || cleanText === 'view_leaderboard';
        const isLeague = ['league', 'leagues', 'friend league'].some(k => cleanText.startsWith(k)) || cleanText === 'view_leagues';
        const isRecap = ['recap', 'personality', 'final recap', 'recap card'].some(k => cleanText.startsWith(k)) || cleanText === 'view_recap';

        if (isLeaderboard || isLeague || isRecap) {
          let response = await processMessage(user, { type: 'text', text }, 'tg');
          response = appendLocalMenu(response);
          await sendTelegramResponse(ctx.chat.id, response);
          return;
        }

        const apiResponse = await callRemoteAPI(tgId, text, sessionState);
        await updateConversationState(user.id, JSON.stringify(apiResponse.sessionState));
        const mapped = mapRemoteResponse(apiResponse);
        await sendTelegramResponse(ctx.chat.id, mapped);
      } catch (err: any) {
        console.error('[TG text remote]', err.message);
        await sendTelegramResponse(ctx.chat.id, getErrorKeyboard(text));
      }
    } else {
      const response = await processMessage(user, { type: 'text', text }, 'tg');
      await sendTelegramResponse(ctx.chat.id, response);
    }
  });

  // Callback query (inline keyboard button taps)
  bot.on('callback_query', async (ctx) => {
    // Acknowledge immediately to prevent timeout
    await ctx.answerCbQuery().catch(() => {});

    const tgId = ctx.from.id.toString();
    let data = (ctx.callbackQuery as any).data ?? '';

    // Handle retry callback prefix
    if (data.startsWith('retry:')) {
      data = data.split('retry:')[1] || 'menu';
    }

    const user = await getUserByTgId(tgId);
    if (!user) return;

    if (process.env.USE_OHMYKICK_API === 'true') {
      try {
        let sessionState: any = {};
        if (user.conversation_state && user.conversation_state.startsWith('{')) {
          try {
            sessionState = JSON.parse(user.conversation_state);
          } catch (e) {}
        }

        // Intercept local commands
        const localCommands = ['leaderboard', 'view_leaderboard', 'rankings', 'league', 'view_leagues', 'recap', 'view_recap'];
        if (localCommands.includes(data)) {
          let response = await processMessage(user, { type: 'button_reply', text: data }, 'tg');
          response = appendLocalMenu(response);
          if (ctx.chat) {
            await sendTelegramResponse(ctx.chat.id, response);
          }
          return;
        }

        const apiResponse = await callRemoteAPI(tgId, data, sessionState);
        await updateConversationState(user.id, JSON.stringify(apiResponse.sessionState));
        const mapped = mapRemoteResponse(apiResponse);
        if (ctx.chat) {
          await sendTelegramResponse(ctx.chat.id, mapped);
        }
      } catch (err: any) {
        console.error('[TG callback remote]', err.message);
        if (ctx.chat) {
          await sendTelegramResponse(ctx.chat.id, getErrorKeyboard(data));
        }
      }
    } else {
      const response = await processMessage(user, { type: 'button_reply', text: data }, 'tg');
      if (ctx.chat) {
        await sendTelegramResponse(ctx.chat.id, response);
      }
    }
  });

  // Photo upload (for onboarding passport photo)
  bot.on('photo', async (ctx) => {
    const tgId = ctx.from.id.toString();
    const user = await getUserByTgId(tgId);
    if (!user) return;

    let sessionState: any = {};
    if (user.conversation_state && user.conversation_state.startsWith('{')) {
      try {
        sessionState = JSON.parse(user.conversation_state);
      } catch (e) {}
    }

    const isRemoteOnboardingPhoto = sessionState.conversationState === 'ONBOARDING_PHOTO';
    const isLocalOnboardingPhoto = user.conversation_state === 'ONBOARDING_PHOTO';

    if (process.env.USE_OHMYKICK_API === 'true') {
      if (!isRemoteOnboardingPhoto) return;
    } else {
      if (!isLocalOnboardingPhoto) return;
    }

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

      await updateUser(user.id, { photo_url: urlData.publicUrl });

      if (process.env.USE_OHMYKICK_API === 'true') {
        try {
          const apiResponse = await callRemoteAPI(tgId, 'skip_photo', sessionState);
          await updateConversationState(user.id, JSON.stringify(apiResponse.sessionState));
          const mapped = mapRemoteResponse(apiResponse);
          await sendTelegramResponse(ctx.chat.id, mapped);
        } catch (err: any) {
          console.error('[TG photo remote]', err.message);
          await sendTelegramResponse(ctx.chat.id, getErrorKeyboard('skip_photo'));
        }
      } else {
        const botResponse = await handleOnboardingPhotoUploaded(user, urlData.publicUrl);
        await sendTelegramResponse(ctx.chat.id, botResponse);
      }
    } catch (err: any) {
      console.error('[TG photo handler]', err.message);
      if (process.env.USE_OHMYKICK_API === 'true') {
        await sendTelegramResponse(ctx.chat.id, getErrorKeyboard('skip_photo'));
      } else {
        await ctx.reply('⚠️ Failed to upload photo. You can skip for now and add it later.');
      }
    }
  });
}

// ─── Remote API Helpers ─────────────────────────────────────

async function callRemoteAPI(userId: string, message: string, sessionState: any = {}): Promise<any> {
  const baseUrl = process.env.BACKEND_API_URL || 'https://ohmykick.com';
  const url = `${baseUrl}/api/bot/message`;
  const payload = {
    userId,
    channel: 'telegram',
    message,
    timezone: 'Asia/Calcutta',
    sessionState,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Remote API error: ${response.status}`);
  }

  return response.json();
}

function getErrorKeyboard(lastCommand: string): BotResponse {
  const retryData = `retry:${lastCommand.substring(0, 50)}`;
  return {
    messages: [
      {
        kind: 'buttons',
        text: '⚠️ Something went wrong.',
        buttons: [
          [
            { id: retryData, label: '🔄 Retry' },
            { id: 'menu', label: '🏠 Main Menu' }
          ]
        ]
      }
    ]
  };
}

function mapRemoteResponse(apiResponse: any): BotResponse {
  const messages = apiResponse.messages || [];
  let mappedMessages = messages.map((msg: any) => {
    if (msg.type === 'text') {
      if (msg.text.includes('*OhMyKick Menu*') && msg.text.includes('*predict*')) {
        return {
          kind: 'buttons',
          text: `⚽ *OhMyKick Menu*\n\nHere's what you can do:`,
          buttons: [
            [{ id: 'predict', label: '🔮 Predict' }],
            [{ id: 'passport', label: '🪪 Passport' }, { id: 'stats', label: '📊 Stats' }],
            [{ id: 'leaderboard', label: '🏆 Leaderboard' }, { id: 'nations', label: '🌍 Nations' }],
            [{ id: 'referral', label: '🔗 Referral' }, { id: 'profile', label: '👤 Profile' }]
          ]
        };
      }
      return { kind: 'text', text: msg.text };
    }
    if (msg.type === 'buttons') {
      return {
        kind: 'buttons',
        text: msg.text,
        buttons: msg.buttons.map((b: any) => ({ id: b.id, label: b.title })),
      };
    }
    if (msg.type === 'list') {
      return {
        kind: 'list',
        text: msg.text,
        sections: [
          {
            title: '',
            rows: msg.listItems.map((item: any) => ({
              id: item.id,
              title: item.title,
            })),
          },
        ],
      };
    }
    if (msg.type === 'image') {
      let imageUrl = msg.imageUrl;
      if (imageUrl.startsWith('/')) {
        const domain = (process.env.APP_URL || 'https://ohmykick.com').replace('www.ohmykick.com', 'ohmykick.com').replace(/\/$/, '');
        imageUrl = `${domain}${imageUrl}`;
      }
      return {
        kind: 'image',
        url: imageUrl,
        caption: msg.caption || msg.text || '',
        buttons: msg.buttons ? msg.buttons.map((b: any) => ({ id: b.id, label: b.title })) : undefined,
      };
    }
    return { kind: 'text', text: '' };
  });

  // Filter out any empty text messages to keep responses clean
  mappedMessages = mappedMessages.filter((msg: any) => msg.kind !== 'text' || msg.text !== '');

  // Automatically append the Telegram navigation menu when conversationState is IDLE
  const sessionState = apiResponse.sessionState || {};
  if (sessionState.conversationState === 'IDLE') {
    // Check if the menu is already in the list
    const hasMenuAlready = mappedMessages.some((msg: any) =>
      msg.kind === 'buttons' &&
      (msg.text?.includes('Menu') || (Array.isArray(msg.buttons) && msg.buttons.flat().some((b: any) => b.id === 'predict')))
    );

    if (!hasMenuAlready) {
      mappedMessages.push({
        kind: 'buttons',
        text: '⚽ *OhMyKick Menu*',
        buttons: [
          [{ id: 'predict', label: '🔮 Predict' }],
          [{ id: 'passport', label: '🪪 Passport' }, { id: 'stats', label: '📊 Stats' }],
          [{ id: 'leaderboard', label: '🏆 Leaderboard' }, { id: 'nations', label: '🌍 Nations' }],
          [{ id: 'referral', label: '🔗 Referral' }, { id: 'profile', label: '👤 Profile' }]
        ]
      });
    }
  }

  return { messages: mappedMessages };
}


// ─── Response dispatcher ──────────────────────────────────────

function appendLocalMenu(response: BotResponse): BotResponse {
  const hasMenuAlready = response.messages.some((msg: any) =>
    msg.kind === 'buttons' &&
    (msg.text?.includes('Menu') || (Array.isArray(msg.buttons) && msg.buttons.flat().some((b: any) => b.id === 'predict')))
  );

  if (!hasMenuAlready) {
    return {
      messages: [
        ...response.messages,
        {
          kind: 'buttons',
          text: '⚽ *OhMyKick Menu*',
          buttons: [
            [{ id: 'predict', label: '🔮 Predict' }],
            [{ id: 'passport', label: '🪪 Passport' }, { id: 'stats', label: '📊 Stats' }],
            [{ id: 'leaderboard', label: '🏆 Leaderboard' }, { id: 'nations', label: '🌍 Nations' }],
            [{ id: 'referral', label: '🔗 Referral' }, { id: 'profile', label: '👤 Profile' }]
          ]
        }
      ]
    };
  }
  return response;
}

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
