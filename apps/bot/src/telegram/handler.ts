import { bot } from '../telegram/sender.js';
import { getUserByTgId, createUser, updateUser, updateConversationState, getUserStats } from '../db/users.js';
import { processMessage } from '../state-machine/index.js';
import { handleOnboardingPhotoUploaded } from '../flows/onboarding.js';
import { sendTgText, sendTgButtons, sendTgPhoto } from '../telegram/sender.js';
import type { BotResponse, BotMessage } from '../flows/prediction.js';
import type { FastifyInstance } from 'fastify';
import { COUNTRIES } from '../utils/countries.js';

export function registerTelegramHandler(app: FastifyInstance) {
  // Webhook route — Fastify forwards the body to Telegraf
  app.post('/webhook/telegram', (req, reply) => {
    bot.handleUpdate(req.body as any).catch((err) => {
      console.error('[TG webhook] error', err);
    });
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
        await syncUserSessionState(user.id, apiResponse.sessionState);
        const mapped = mapRemoteResponse(apiResponse, 'start');
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
        const sessionState = getUserSessionState(user);

        // Intercept local commands (text matching keywords)
        const lowerText = text.toLowerCase().trim();
        const cleanText = lowerText.startsWith('/') ? lowerText.slice(1) : lowerText;
        const isLeaderboard = ['rank', 'leaderboard', 'standings', 'country war'].some(k => cleanText.startsWith(k)) || cleanText === 'view_leaderboard';
        const isLeague = ['league', 'leagues', 'friend league'].some(k => cleanText.startsWith(k)) || cleanText === 'view_leagues';
        const isRecap = ['recap', 'personality', 'final recap', 'recap card'].some(k => cleanText.startsWith(k)) || cleanText === 'view_recap';
        const isLocalState = ['LEAGUE_CREATE_NAME', 'LEAGUE_JOIN_CODE'].includes(user.conversation_state);

        if (isLeaderboard || isLeague || isRecap || isLocalState) {
          let response = await processMessage(user, { type: 'text', text }, 'tg');
          response = appendLocalMenu(response);
          await sendTelegramResponse(ctx.chat.id, response);
          return;
        }

        const apiResponse = await callRemoteAPI(tgId, text, sessionState);
        await syncUserSessionState(user.id, apiResponse.sessionState);
        const freshUser = await getUserByTgId(tgId) || user;
        const freshSession = getUserSessionState(freshUser);
        const mapped = mapRemoteResponse(apiResponse, text, freshSession);
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
        const sessionState = getUserSessionState(user);

        // Intercept local commands
        const localCommands = [
          'leaderboard', 'view_leaderboard', 'rankings',
          'league', 'view_leagues', 'create_league', 'join_league',
          'recap', 'view_recap'
        ];
        if (localCommands.includes(data)) {
          let response = await processMessage(user, { type: 'button_reply', text: data }, 'tg');
          response = appendLocalMenu(response);
          if (ctx.chat) {
            await sendTelegramResponse(ctx.chat.id, response);
          }
          return;
        }

        // Intercept photo upload prompt to avoid infinite loop
        if (data === 'send_new_photo') {
          const response = {
            messages: [
              {
                kind: 'buttons' as const,
                text: '📸 *Send me a photo now.*\n\nUpload a picture from your gallery or use your camera.',
                buttons: [
                  [{ id: 'cancel_photo', label: '↩ Cancel' }]
                ]
              }
            ]
          };
          if (ctx.chat) {
            await sendTelegramResponse(ctx.chat.id, response);
          }
          return;
        }

        const apiResponse = await callRemoteAPI(tgId, data, sessionState);
        await syncUserSessionState(user.id, apiResponse.sessionState);
        // Re-fetch user to get fresh photo_url after any updates
        const freshUser = await getUserByTgId(tgId) || user;
        const freshSession = getUserSessionState(freshUser);
        const mapped = mapRemoteResponse(apiResponse, data, freshSession);
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

    const sessionState = getUserSessionState(user);

    const isRemoteOnboardingPhoto = ['ONBOARDING_PHOTO', 'UPDATE_PHOTO'].includes(sessionState.conversationState);
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
      sessionState.photoUrl = urlData.publicUrl;
      sessionState.dbId = user.id;

      if (process.env.USE_OHMYKICK_API === 'true') {
        try {
          const isUpdatePhoto = sessionState.conversationState === 'UPDATE_PHOTO';
          const transitionMsg = isUpdatePhoto ? 'cancel_photo' : 'skip_photo';
          const apiResponse = await callRemoteAPI(tgId, transitionMsg, sessionState);
          await syncUserSessionState(user.id, apiResponse.sessionState);
          let mapped = mapRemoteResponse(apiResponse, transitionMsg);

          if (isUpdatePhoto) {
            mapped.messages = mapped.messages.map((m: any) => {
              if (m.text?.includes('unchanged') || m.text?.includes('No change')) {
                return { kind: 'text', text: '📸 Photo updated successfully!' };
              }
              return m;
            });

            // Automatically request and append the updated passport image
            try {
              const updatedSession = getUserSessionState({
                ...user,
                photo_url: urlData.publicUrl,
                conversation_state: JSON.stringify(apiResponse.sessionState)
              });
              const passportRes = await callRemoteAPI(tgId, 'passport', updatedSession);
              await syncUserSessionState(user.id, passportRes.sessionState);
              const mappedPassport = mapRemoteResponse(passportRes, 'passport', updatedSession);
              mapped.messages.push(...mappedPassport.messages);
            } catch (err: any) {
              console.error('[TG photo passport fetch]', err.message);
            }
          }
          await sendTelegramResponse(ctx.chat.id, mapped);
        } catch (err: any) {
          console.error('[TG photo remote]', err.message);
          const failedCmd = sessionState.conversationState === 'ONBOARDING_PHOTO' ? 'skip_photo' : 'cancel_photo';
          await sendTelegramResponse(ctx.chat.id, getErrorKeyboard(failedCmd));
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

function getUserSessionState(user: any): any {
  let sessionState: any = {};
  if (user.conversation_state && user.conversation_state.startsWith('{')) {
    try {
      sessionState = JSON.parse(user.conversation_state);
    } catch (e) {}
  }

  // If the session state is empty or missing key properties, reconstruct it from DB columns
  if (!sessionState.userName || !sessionState.countryCode || !sessionState.referralCode) {
    sessionState = {
      conversationState: sessionState.conversationState || user.conversation_state || 'IDLE',
      phoneNumber: sessionState.phoneNumber || '',
      userName: sessionState.userName || user.name || 'FOOTBALL FAN',
      countryCode: sessionState.countryCode || user.country_code || 'XX',
      countryName: sessionState.countryName || user.country_name || 'Unknown',
      countryFlag: sessionState.countryFlag || user.country_flag_emoji || '🌍',
      referralCode: sessionState.referralCode || user.referral_code || generateFallbackReferralCode(),
      fanId: sessionState.fanId || user.fan_id,
      passportVariant: sessionState.passportVariant || 3,
      preferredLanguage: sessionState.preferredLanguage || user.language || 'en',
      invalidInputCount: sessionState.invalidInputCount || 0,
      totalPredictions: sessionState.totalPredictions || 0,
      correctPredictions: sessionState.correctPredictions || 0,
      totalPoints: sessionState.totalPoints || user.total_points || 0,
      referralCount: sessionState.referralCount || user.referral_count || 0,
      ...sessionState
    };
  }

  // Always ensure dbId and photoUrl are populated in sessionState
  sessionState.dbId = sessionState.dbId || user.id;
  sessionState.photoUrl = sessionState.photoUrl || user.photo_url || '';

  return sessionState;
}

function generateFallbackReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function syncUserSessionState(userId: string, sessionState: any): Promise<void> {
  if (!sessionState) return;

  const updates: any = {
    conversation_state: JSON.stringify(sessionState)
  };

  if (sessionState.userName) updates.name = sessionState.userName;
  if (sessionState.countryCode) updates.country_code = sessionState.countryCode;
  if (sessionState.countryName) updates.country_name = sessionState.countryName;
  if (sessionState.countryFlag) updates.country_flag_emoji = sessionState.countryFlag;
  if (sessionState.referralCode) updates.referral_code = sessionState.referralCode;
  if (sessionState.fanId) updates.fan_id = sessionState.fanId;
  if (sessionState.referralCount !== undefined) updates.referral_count = sessionState.referralCount;
  if (sessionState.totalPoints !== undefined) updates.total_points = sessionState.totalPoints;

  await updateUser(userId, updates);
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

export function buildPassportUrl(sessionState: any): string {
  // Build the real Vercel poster API URL with photoUrl, bypassing the remote mock-poster
  const posterServiceUrl = process.env.POSTER_SERVICE_URL || 'https://ohmykick.vercel.app';
  const userCountry = sessionState.countryCode ? COUNTRIES[sessionState.countryCode] : null;
  const params = new URLSearchParams({
    name: sessionState.userName || 'FAN',
    countryName: sessionState.countryName || '',
    countryCode: sessionState.countryCode || '',
    primaryColor: userCountry?.primaryColor ?? '#f0b429',
    secondaryColor: userCountry?.secondaryColor ?? '#ffd166',
    flagEmoji: sessionState.countryFlag || '',
    fanId: sessionState.fanId || '',
    fanLevel: sessionState.fanLevel || 'FAN',
    totalPoints: String(sessionState.totalPoints || 0),
    accuracyPct: '0',
    streakCount: '0',
    referralCount: String(sessionState.referralCount || 0),
    referralCode: sessionState.referralCode || '',
    variant: sessionState.passportVariant ? `V${sessionState.passportVariant}` : 'V3',
  });
  if (sessionState.photoUrl) {
    params.set('photoUrl', sessionState.photoUrl);
  }
  return `${posterServiceUrl}/api/posters/passport?${params}`;
}

export function mapRemoteResponse(apiResponse: any, command?: string, userSessionState?: any): BotResponse {
  const messages = apiResponse.messages || [];
  const sessionFromResponse = apiResponse.sessionState || {};
  // Merge: prefer userSessionState (has fresh photo_url from DB) over session from response
  const mergedSession = userSessionState ? { ...sessionFromResponse, ...userSessionState } : sessionFromResponse;

  let mappedMessages = messages.map((msg: any) => {
    if (msg.type === 'text') {
      if (msg.text.includes('*OhMyKick Menu*') && msg.text.includes('*predict*')) {
        return {
          kind: 'buttons',
          text: `⚽ What would you like to do next?`,
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
      // ── FIX: Replace mock-poster passport URLs with real Vercel poster API URL ──
      // The remote API returns /api/bot/mock-poster?type=passport&... which does NOT
      // include the user's Supabase photo_url. We intercept it and build the real URL.
      const isMockPassport = imageUrl && (imageUrl.includes('mock-poster') || imageUrl.includes('type=passport'));
      if (isMockPassport && mergedSession.photoUrl) {
        console.log('[mapRemoteResponse] Replacing mock-poster with real Vercel passport URL (photoUrl present)');
        imageUrl = buildPassportUrl(mergedSession);
      } else if (imageUrl && imageUrl.startsWith('/')) {
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

  // Automatically append the Telegram navigation menu when conversationState is IDLE or command is referral
  const sessionState = apiResponse.sessionState || {};
  const isReferral = command === 'referral' || command === 'referral_info' || mappedMessages.some((msg: any) => {
    const txt = msg.text?.toLowerCase() || '';
    return txt.includes('recruit') || txt.includes('referral');
  });

  const isProfileScreen = mappedMessages.some((msg: any) =>
    msg.kind === 'buttons' &&
    Array.isArray(msg.buttons) &&
    msg.buttons.flat().some((b: any) => ['edit_name', 'change_country', 'change_language', 'change_photo'].includes(b.id))
  );

  if (isProfileScreen) {
    mappedMessages = mappedMessages.map((msg: any) => {
      if (
        msg.kind === 'buttons' &&
        Array.isArray(msg.buttons) &&
        msg.buttons.flat().some((b: any) => ['edit_name', 'change_country', 'change_language', 'change_photo'].includes(b.id))
      ) {
        const hasBackMenu = msg.buttons.flat().some((b: any) => b.id === 'menu');
        if (!hasBackMenu) {
          const newButtons = [...msg.buttons];
          newButtons.push([{ id: 'menu', label: '↩ Back to Menu' }]);
          return { ...msg, buttons: newButtons };
        }
      }
      return msg;
    });
  }

  if ((mergedSession.conversationState === 'IDLE' && !isProfileScreen) || isReferral) {
    // Check if the menu is already in the list
    const hasMenuAlready = mappedMessages.some((msg: any) =>
      msg.kind === 'buttons' &&
      (msg.text?.includes('What would you like to do next') || (Array.isArray(msg.buttons) && msg.buttons.flat().some((b: any) => b.id === 'predict')))
    );

    if (!hasMenuAlready) {
      mappedMessages.push({
        kind: 'buttons',
        text: '⚽ What would you like to do next?',
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

function cleanDuplicateMenus(messages: BotMessage[]): BotMessage[] {
  const menuIndexes: number[] = [];
  messages.forEach((msg, idx) => {
    if (
      msg.kind === 'buttons' &&
      (msg.text?.includes('What would you like to do next') || msg.text?.includes('Menu')) &&
      Array.isArray(msg.buttons) &&
      msg.buttons.flat().some((b: any) => b.id === 'predict')
    ) {
      menuIndexes.push(idx);
    }
  });

  if (menuIndexes.length <= 1) {
    return messages;
  }

  const lastMenuIdx = menuIndexes[menuIndexes.length - 1];
  return messages.filter((msg, idx) => {
    if (menuIndexes.includes(idx) && idx !== lastMenuIdx) {
      return false;
    }
    return true;
  });
}

async function sendTelegramResponse(
  chatId: number | string,
  response: BotResponse
): Promise<void> {
  response.messages = cleanDuplicateMenus(response.messages);
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
