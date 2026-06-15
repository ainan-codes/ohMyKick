import { bot } from '../telegram/sender.js';
import { getUserByTgId, createUser, updateUser, updateConversationState, getUserStats } from '../db/users.js';
import { processMessage } from '../state-machine/index.js';
import { handleOnboardingPhotoUploaded } from '../flows/onboarding.js';
import { sendTgText, sendTgButtons, sendTgPhoto, escapeMarkdown, normalizeButtons } from '../telegram/sender.js';
import { Markup } from 'telegraf';
import type { BotResponse, BotMessage } from '../flows/prediction.js';
import type { FastifyInstance } from 'fastify';
import { COUNTRIES } from '../utils/countries.js';

// ─── Remote API config ─────────────────────────────────────────────────────────
// All state, photo storage, and poster generation happen on ohmykick.com.
// The bot's job is ONLY to relay messages and photos, and render the responses.
const OHMYKICK_API_BASE = (process.env.OHMYKICK_API_BASE ?? 'https://ohmykick.com/api/bot').replace(/\/$/, '');

// ─── In-memory session store (remote API mode) ────────────────────────────────
// Keyed by Telegram chat_id (string).
// On cold restart the Map is empty; we fall back to restoring from the DB
// (conversation_state column, which stores the JSON blob written by syncUserSessionState).
const remoteSessionStore = new Map<string, any>();

function getRemoteSession(chatId: string | number): any {
  return remoteSessionStore.get(String(chatId)) ?? {};
}

function setRemoteSession(chatId: string | number, sessionState: any): void {
  if (sessionState != null) {
    // FULL OVERWRITE — this is how dbId propagates from the API into the bot
    remoteSessionStore.set(String(chatId), sessionState);
    console.log('[DEBUG] new sessionState for chat', chatId, '=', JSON.stringify(sessionState));
  }
}

// ─── Register all Telegram routes + Telegraf event handlers ──────────────────
export function registerTelegramHandler(app: FastifyInstance) {
  // Webhook route — Fastify forwards the body to Telegraf
  app.post('/webhook/telegram', (req, reply) => {
    bot.handleUpdate(req.body as any).catch((err) => {
      console.error('[TG webhook] error', err);
    });
    reply.send({ ok: true });
  });

  // ─── /start ────────────────────────────────────────────────────────────────
  bot.start(async (ctx) => {
    const tgId   = ctx.from.id.toString();
    const chatId = ctx.chat.id;
    const referralCode = ctx.startPayload ?? undefined;

    let user = await getUserByTgId(tgId);
    if (!user) {
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
        // Restore session from DB on cold start if Map has nothing
        const session = ensureSession(chatId, user);

        const apiResponse = await callRemoteAPI(String(chatId), 'start', session);
        setRemoteSession(chatId, apiResponse.sessionState);
        await syncUserSessionState(user.id, apiResponse.sessionState);

        const mapped = mapRemoteResponse(apiResponse, 'start', apiResponse.sessionState);
        await sendTelegramResponse(chatId, mapped);
      } catch (err: any) {
        console.error('[TG start remote]', err.message);
        await sendTelegramResponse(chatId, getErrorKeyboard('start'));
      }
    } else {
      const response = await processMessage(user, { type: 'text', text: 'start' }, 'tg');
      await sendTelegramResponse(chatId, response);
    }
  });

  // ─── Text messages ──────────────────────────────────────────────────────────
  bot.on('text', async (ctx) => {
    const tgId   = ctx.from.id.toString();
    const chatId = ctx.chat.id;
    const text   = ctx.message.text;

    const user = await getUserByTgId(tgId);
    if (!user) {
      await ctx.reply('Send /start to begin!');
      return;
    }

    if (process.env.USE_OHMYKICK_API === 'true') {
      try {
        const session = ensureSession(chatId, user);

        // Intercept commands handled locally (leaderboard, league, recap, etc.)
        const lowerText = text.toLowerCase().trim();
        const cleanText = lowerText.startsWith('/') ? lowerText.slice(1) : lowerText;
        const isLeaderboard = ['rank', 'leaderboard', 'standings', 'country war'].some(k => cleanText.startsWith(k)) || cleanText === 'view_leaderboard';
        const isLeague      = ['league', 'leagues', 'friend league'].some(k => cleanText.startsWith(k)) || cleanText === 'view_leagues';
        const isRecap       = ['recap', 'personality', 'final recap', 'recap card'].some(k => cleanText.startsWith(k)) || cleanText === 'view_recap';
        const isLocalState  = ['LEAGUE_CREATE_NAME', 'LEAGUE_JOIN_CODE'].includes(user.conversation_state);

        if (isLeaderboard || isLeague || isRecap || isLocalState) {
          let response = await processMessage(user, { type: 'text', text }, 'tg');
          response = appendLocalMenu(response);
          await sendTelegramResponse(chatId, response);
          return;
        }

        const apiResponse = await callRemoteAPI(String(chatId), text, session);
        await saveRemotePrediction(user.id, apiResponse, session);
        setRemoteSession(chatId, apiResponse.sessionState);
        await syncUserSessionState(user.id, apiResponse.sessionState);

        const mapped = mapRemoteResponse(apiResponse, text, apiResponse.sessionState);
        await sendTelegramResponse(chatId, mapped);
      } catch (err: any) {
        console.error('[TG text remote]', err.message);
        await sendTelegramResponse(chatId, getErrorKeyboard(text));
      }
    } else {
      const response = await processMessage(user, { type: 'text', text }, 'tg');
      await sendTelegramResponse(chatId, response);
    }
  });

  // ─── Inline keyboard button taps ────────────────────────────────────────────
  bot.on('callback_query', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});

    const tgId   = ctx.from.id.toString();
    const chatId = ctx.chat?.id;
    let data = (ctx.callbackQuery as any).data ?? '';

    // Unwrap retry: prefix
    if (data.startsWith('retry:')) {
      data = data.split('retry:')[1] || 'menu';
    }

    const user = await getUserByTgId(tgId);
    if (!user || !chatId) return;

    if (process.env.USE_OHMYKICK_API === 'true') {
      try {
        const session = ensureSession(chatId, user);

        // Intercept local commands
        const localCommands = [
          'leaderboard', 'view_leaderboard', 'rankings',
          'league', 'view_leagues', 'create_league', 'join_league',
          'recap', 'view_recap',
        ];
        if (localCommands.includes(data)) {
          let response = await processMessage(user, { type: 'button_reply', text: data }, 'tg');
          response = appendLocalMenu(response);
          await sendTelegramResponse(chatId, response, ctx);
          return;
        }

        // Intercept photo upload prompt (prevent loop)
        if (data === 'send_new_photo') {
          const response: BotResponse = {
            messages: [{
              kind: 'buttons',
              text: '📸 *Send me a photo now.*\n\nUpload a picture from your gallery or use your camera.',
              buttons: [[{ id: 'cancel_photo', label: '↩ Cancel' }]],
            }],
          };
          await sendTelegramResponse(chatId, response, ctx);
          return;
        }

        // Send button id as both `message` and `payload` — the API uses payload
        // as the canonical identifier and message as a human-readable label fallback.
        const apiResponse = await callRemoteAPI(String(chatId), data, session, data);
        await saveRemotePrediction(user.id, apiResponse, session);
        setRemoteSession(chatId, apiResponse.sessionState);
        await syncUserSessionState(user.id, apiResponse.sessionState);

        const mapped = mapRemoteResponse(apiResponse, data, apiResponse.sessionState);
        await sendTelegramResponse(chatId, mapped, ctx);
      } catch (err: any) {
        console.error('[TG callback remote]', err.message);
        if (ctx.chat) await sendTelegramResponse(chatId, getErrorKeyboard(data), ctx);
      }
    } else {
      const response = await processMessage(user, { type: 'button_reply', text: data }, 'tg');
      if (ctx.chat) await sendTelegramResponse(chatId, response, ctx);
    }
  });

  // ─── Photo messages ─────────────────────────────────────────────────────────
  // Remote-API mode: relay photo to /api/bot/upload-photo, then call
  // /api/bot/message with message="photo_uploaded". All compositing is
  // server-side — we never touch the image beyond download+resize.
  bot.on('photo', async (ctx) => {
    const tgId   = ctx.from.id.toString();
    const chatId = ctx.chat.id;
    console.log('[DEBUG] photo handler started, chatId =', chatId);

    const user = await getUserByTgId(tgId);
    if (!user) return;

    if (process.env.USE_OHMYKICK_API === 'true') {
      const session = ensureSession(chatId, user);

      // Guard: we need the server-side fan record (dbId) to exist before uploading.
      // dbId is set by the API on the first /api/bot/message call and stored in sessionState.
      if (!session.dbId) {
        await sendTgText(chatId,
          '⚠️ Send me a text message first to set up your profile, then you can upload a photo.');
        return;
      }

      try {
        // 1. Get the largest available photo variant
        const photos = ctx.message.photo;
        const largestPhoto = photos[photos.length - 1];
        const file = await ctx.telegram.getFile(largestPhoto.file_id);
        const telegramFileUrl =
          `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        // 2. Download raw bytes from Telegram CDN
        const downloadRes = await fetch(telegramFileUrl);
        if (!downloadRes.ok) {
          throw new Error(`Telegram file download failed: ${downloadRes.status}`);
        }
        const rawBuffer = Buffer.from(await downloadRes.arrayBuffer());

        // 3. Resize to 400×400 JPEG quality 75.
        //    The upload-photo endpoint rejects base64 payloads > ~680 KB.
        const sharp = (await import('sharp')).default;
        const resizedBuffer = await sharp(rawBuffer)
          .resize(400, 400, { fit: 'cover' })
          .jpeg({ quality: 75 })
          .toBuffer();

        // 4. Encode as a data-URL
        const base64Photo = `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;

        // 5. POST to /api/bot/upload-photo
        console.log('[DEBUG] uploading photo, fan_db_id =', session.dbId);
        const uploadRes = await fetch(`${OHMYKICK_API_BASE}/upload-photo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fan_db_id: session.dbId, photo_b64: base64Photo }),
        });
        // Read body exactly ONCE — .clone() is not supported in this Node fetch implementation
        const uploadResText = await uploadRes.text().catch(() => '');
        console.log('[DEBUG] upload-photo response status:', uploadRes.status, 'body:', uploadResText);

        if (!uploadRes.ok) {
          console.error(`[TG photo] upload-photo failed: HTTP ${uploadRes.status} — ${uploadResText}`);
          await sendTgText(chatId,
            '⚠️ Couldn\'t save your photo — try a smaller or different image.');
          return;
        }

        console.log(`[TG photo] upload-photo OK for dbId=${session.dbId}`);

        // 6. Tell the API the photo was uploaded — it will return the updated
        //    passport poster with the circular photo slot filled in.
        const apiResponse = await callRemoteAPI(String(chatId), 'photo_uploaded', session);
        console.log('[DEBUG] photo_uploaded response:', JSON.stringify(apiResponse, null, 2));
        setRemoteSession(chatId, apiResponse.sessionState);
        await syncUserSessionState(user.id, apiResponse.sessionState);

        // Server-side compositing already done — just render the API's response.
        const mapped = mapRemoteResponse(apiResponse, 'photo_uploaded', apiResponse.sessionState);
        await sendTelegramResponse(chatId, mapped);
      } catch (err: any) {
        console.error('[DEBUG] photo processing error:', err);
        console.error('[DEBUG] error stack:', err instanceof Error ? err.stack : 'no stack');
        await sendTgText(chatId, '⚠️ Couldn\'t process that image, try again.');
      }
    } else {
      // ── Local mode photo handling ──────────────────────────────────────────
      if (user.conversation_state !== 'ONBOARDING_PHOTO') return;

      try {
        const photos = ctx.message.photo;
        const largestPhoto = photos[photos.length - 1];
        const file = await ctx.telegram.getFile(largestPhoto.file_id);
        const photoUrl =
          `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        // Download + resize
        const response = await fetch(photoUrl);
        const rawBuffer = Buffer.from(await response.arrayBuffer());
        const sharp = (await import('sharp')).default;
        const resizedBuffer = await sharp(rawBuffer)
          .resize(400, 400, { fit: 'cover' })
          .jpeg({ quality: 75 })
          .toBuffer();

        // Upload to Supabase storage directly (local mode only)
        const { supabase } = await import('../db/client.js');
        const path = `photos/${tgId}.jpg`;
        await supabase.storage.from('photos').upload(path, resizedBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path);
        const publicUrl = urlData.publicUrl;

        const botResponse = await handleOnboardingPhotoUploaded(user, publicUrl);
        await sendTelegramResponse(chatId, botResponse);
      } catch (err: any) {
        console.error('[TG photo local]', err.message);
        await ctx.reply('⚠️ Failed to upload photo. You can skip for now and add it later.');
      }
    }
  });
}

// ─── Session helpers ──────────────────────────────────────────────────────────

/**
 * Returns the current session for a chat, initialising it from the DB row
 * if the in-memory Map has no entry yet (cold start / service restart).
 */
function ensureSession(chatId: string | number, user: any): any {
  const cached = getRemoteSession(chatId);
  if (Object.keys(cached).length > 0) {
    console.log('[DEBUG] session for chat', chatId, '=', JSON.stringify(cached));
    return cached;
  }

  // Cold-start restore: rebuild from the DB's conversation_state JSON blob
  const restored = getUserSessionState(user);
  if (Object.keys(restored).length > 0) {
    setRemoteSession(chatId, restored);
    console.log('[DEBUG] session for chat', chatId, '=', JSON.stringify(restored));
    return restored;
  }
  console.log('[DEBUG] session for chat', chatId, '= {} (empty, new user)');
  return {};
}

// ─── Remote API caller ────────────────────────────────────────────────────────

async function callRemoteAPI(
  userId: string,
  message: string,
  sessionState: any = {},
  payload?: string,
): Promise<any> {
  const url = `${OHMYKICK_API_BASE}/message`;
  const body: Record<string, any> = {
    userId,
    channel: 'telegram',
    message,
    timezone: 'Asia/Calcutta',
    sessionState,
  };
  if (payload !== undefined) body.payload = payload;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    console.error(`[callRemoteAPI] HTTP ${response.status} — ${errBody}`);
    throw new Error(`Remote API error: ${response.status}`);
  }

  return response.json();
}

// ─── Prediction saver (mirrors remote result into local DB for leaderboard) ───

async function saveRemotePrediction(userId: string, apiResponse: any, prevSession: any): Promise<void> {
  const messages = apiResponse.messages || [];
  const prematchMsg = messages.find((msg: any) =>
    msg.type === 'image' && msg.imageUrl &&
    (msg.imageUrl.includes('type=prematch') || msg.imageUrl.includes('prematch'))
  );
  if (!prematchMsg) return;

  try {
    const urlObj = new URL(prematchMsg.imageUrl, 'https://ohmykick.com');
    const pred      = urlObj.searchParams.get('pred');
    const homeCode  = urlObj.searchParams.get('homeCode');
    const awayCode  = urlObj.searchParams.get('awayCode');
    const winner    = urlObj.searchParams.get('winner');

    if (!pred || !homeCode || !awayCode) return;

    const [homeScoreStr, awayScoreStr] = pred.split('-');
    const homeScore = parseInt(homeScoreStr, 10);
    const awayScore = parseInt(awayScoreStr, 10);

    let predictedWinner = 'DRAW';
    if (winner === 'home') predictedWinner = 'HOME';
    if (winner === 'away') predictedWinner = 'AWAY';

    let apiMatchId: number | null = null;
    const matchIdStr = prevSession?.pendingMatchId || prevSession?.pending_match_id;
    if (matchIdStr) {
      const digits = matchIdStr.replace(/\D/g, '');
      if (digits) apiMatchId = parseInt(digits, 10);
    }

    const { supabase } = await import('../db/client.js');
    let match: any = null;

    if (apiMatchId) {
      const { data } = await supabase.from('matches').select('*').eq('api_match_id', apiMatchId).maybeSingle();
      match = data;
    }

    if (!match) {
      const { data } = await supabase.from('matches').select('*')
        .eq('home_country_code', homeCode).eq('away_country_code', awayCode).maybeSingle();
      match = data;
    }

    if (!match) {
      const homeCountry = COUNTRIES[homeCode];
      const awayCountry = COUNTRIES[awayCode];
      const generatedApiId = apiMatchId || Math.floor(Math.random() * 10000) + 10000;
      const matchData = {
        api_match_id: generatedApiId,
        home_team: homeCountry?.name || homeCode,
        away_team: awayCountry?.name || awayCode,
        home_country_code: homeCode,
        away_country_code: awayCode,
        home_flag_emoji: homeCountry?.flag || '',
        away_flag_emoji: awayCountry?.flag || '',
        kickoff_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        stage: 'GROUP_STAGE',
        status: 'SCHEDULED',
        prediction_open: true,
      };
      const { data: insertedMatch, error: insertError } = await (supabase as any)
        .from('matches').insert(matchData).select().single();
      if (insertError) {
        console.error('[saveRemotePrediction] Match insert error:', insertError.message);
        return;
      }
      match = insertedMatch;
    }

    if (match) {
      const { data: existingPred } = await (supabase as any).from('predictions').select('id')
        .eq('user_id', userId).eq('match_id', (match as any).id).maybeSingle();

      if (existingPred) {
        const { error: updateError } = await (supabase as any).from('predictions').update({
          predicted_winner: predictedWinner,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
          is_locked: false,
          updated_at: new Date().toISOString(),
        }).eq('id', existingPred.id);
        if (updateError) console.error('[saveRemotePrediction] Update error:', updateError.message);
        else console.log(`[saveRemotePrediction] Updated prediction for user=${userId}, match=${match.id}`);
      } else {
        const { error: createError } = await (supabase as any).from('predictions').insert({
          user_id: userId,
          match_id: match.id,
          predicted_winner: predictedWinner,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
          is_locked: false,
        });
        if (createError) console.error('[saveRemotePrediction] Create error:', createError.message);
        else console.log(`[saveRemotePrediction] Created prediction for user=${userId}, match=${match.id}`);
      }
    }
  } catch (err: any) {
    console.error('[saveRemotePrediction] Unexpected error:', err.message);
  }
}

// ─── DB session helpers ───────────────────────────────────────────────────────

function getUserSessionState(user: any): any {
  let sessionState: any = {};
  if (user.conversation_state && user.conversation_state.startsWith('{')) {
    try { sessionState = JSON.parse(user.conversation_state); } catch (e) {}
  }

  if (!sessionState.userName || !sessionState.countryCode || !sessionState.referralCode) {
    sessionState = {
      conversationState: sessionState.conversationState || user.conversation_state || 'IDLE',
      phoneNumber:       sessionState.phoneNumber || '',
      userName:          sessionState.userName || user.name || 'FOOTBALL FAN',
      countryCode:       sessionState.countryCode || user.country_code || 'XX',
      countryName:       sessionState.countryName || user.country_name || 'Unknown',
      countryFlag:       sessionState.countryFlag || user.country_flag_emoji || '🌍',
      referralCode:      sessionState.referralCode || user.referral_code || generateFallbackReferralCode(),
      fanId:             sessionState.fanId || user.fan_id,
      passportVariant:   sessionState.passportVariant || 3,
      preferredLanguage: sessionState.preferredLanguage || user.language || 'en',
      invalidInputCount: sessionState.invalidInputCount || 0,
      totalPredictions:  sessionState.totalPredictions || 0,
      correctPredictions:sessionState.correctPredictions || 0,
      totalPoints:       sessionState.totalPoints || user.total_points || 0,
      referralCount:     sessionState.referralCount || user.referral_count || 0,
      ...sessionState, // spread parsed JSON on top so it wins on conflict (including dbId)
    };
  }

  sessionState.photoUrl = user.photo_url || sessionState.photoUrl || '';
  return sessionState;
}

function generateFallbackReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function syncUserSessionState(userId: string, sessionState: any): Promise<void> {
  if (!sessionState) return;

  const updates: any = {
    // Store the FULL sessionState blob — this is how dbId survives a Render restart.
    conversation_state: JSON.stringify(sessionState),
  };

  if (sessionState.userName)    updates.name               = sessionState.userName;
  if (sessionState.countryCode) updates.country_code        = sessionState.countryCode;
  if (sessionState.countryName) updates.country_name        = sessionState.countryName;
  if (sessionState.countryFlag) updates.country_flag_emoji  = sessionState.countryFlag;
  if (sessionState.referralCode)updates.referral_code       = sessionState.referralCode;
  if (sessionState.fanId)       updates.fan_id              = sessionState.fanId;
  if (sessionState.referralCount !== undefined) updates.referral_count = sessionState.referralCount;
  if (sessionState.totalPoints  !== undefined) updates.total_points    = sessionState.totalPoints;
  // NOTE: phoneNumber is NOT written to any DB column — Telegram-only API session field.

  const { supabase } = await import('../db/client.js');
  if (sessionState.pendingMatchId) {
    const digits = sessionState.pendingMatchId.replace(/\D/g, '');
    if (digits) {
      const { data: match } = await (supabase as any).from('matches').select('id')
        .eq('api_match_id', parseInt(digits, 10)).maybeSingle();
      if (match) updates.pending_match_id = (match as any).id;
    }
  } else if (sessionState.pendingMatchId === null) {
    updates.pending_match_id = null;
  }

  if (sessionState.pendingWinner) {
    let winnerVal = sessionState.pendingWinner;
    if (winnerVal === 'TEAM1') winnerVal = 'HOME';
    if (winnerVal === 'TEAM2') winnerVal = 'AWAY';
    updates.pending_winner = winnerVal;
  } else if (sessionState.pendingWinner === null) {
    updates.pending_winner = null;
  }

  await updateUser(userId, updates);
}

// ─── Error keyboard ───────────────────────────────────────────────────────────

function getErrorKeyboard(lastCommand: string): BotResponse {
  const retryData = `retry:${lastCommand.substring(0, 50)}`;
  return {
    messages: [{
      kind: 'buttons',
      text: '⚠️ Something went wrong.',
      buttons: [[
        { id: retryData, label: '🔄 Retry' },
        { id: 'menu', label: '🏠 Main Menu' },
      ]],
    }],
  };
}

// ─── Map API response → BotResponse ──────────────────────────────────────────

export function mapRemoteResponse(
  apiResponse: any,
  command?: string,
  userSessionState?: any,
): BotResponse {
  const messages = apiResponse.messages || [];
  const sessionFromResponse = apiResponse.sessionState || {};
  // API response sessionState is the authoritative source — use it directly.
  // userSessionState provides photoUrl fallback only.
  const mergedSession = {
    ...(userSessionState ?? {}),
    ...sessionFromResponse,
    photoUrl: userSessionState?.photoUrl || sessionFromResponse.photoUrl || '',
  };

  let mappedMessages = messages.map((msg: any) => {
    if (msg.type === 'text') {
      if (msg.text?.includes('*OhMyKick Menu*') && msg.text?.includes('*predict*')) {
        return {
          kind: 'buttons',
          text: '⚽ What would you like to do next?',
          buttons: [
            [{ id: 'predict',     label: '🔮 Predict' }],
            [{ id: 'passport',    label: '🪪 Passport'  }, { id: 'stats',       label: '📊 Stats' }],
            [{ id: 'leaderboard', label: '🏆 Leaderboard' }, { id: 'nations',   label: '🌍 Nations' }],
            [{ id: 'referral',    label: '🔗 Referral'  }, { id: 'profile',     label: '👤 Profile' }],
          ],
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
        sections: [{
          title: '',
          rows: msg.listItems.map((item: any) => ({ id: item.id, title: item.title })),
        }],
      };
    }

    if (msg.type === 'image') {
      let imageUrl = msg.imageUrl;

      // Filter out echoed profile photos (server may echo the raw storage URL)
      const isProfilePhoto = imageUrl &&
        (imageUrl.includes('/photos/') || imageUrl.includes('/storage/v1/object/public/photos/'));
      if (isProfilePhoto) return { kind: 'ignored' as any };

      // Prefix relative URLs — the server may return just /api/bot/poster?...
      if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = `https://ohmykick.com${imageUrl}`;
      }

      return {
        kind: 'image',
        url: imageUrl,
        caption: msg.caption || msg.text || '',
        buttons: msg.buttons
          ? msg.buttons.map((b: any) => ({ id: b.id, label: b.title }))
          : undefined,
      };
    }

    return { kind: 'text', text: '' };
  });

  // Drop ignored and empty-text messages
  mappedMessages = mappedMessages.filter((msg: any) =>
    msg.kind !== 'ignored' && (msg.kind !== 'text' || msg.text !== '')
  );

  // Append navigation menu when the session is IDLE or when showing a referral screen
  const sessionState = apiResponse.sessionState || {};
  const isReferral = command === 'referral' || command === 'referral_info' ||
    mappedMessages.some((msg: any) => {
      const txt = msg.text?.toLowerCase() || '';
      return txt.includes('recruit') || txt.includes('referral');
    });

  const isProfileScreen = mappedMessages.some((msg: any) =>
    msg.kind === 'buttons' &&
    Array.isArray(msg.buttons) &&
    msg.buttons.flat().some((b: any) =>
      ['edit_name', 'change_country', 'change_language', 'change_photo'].includes(b.id)
    )
  );

  if (isProfileScreen) {
    mappedMessages = mappedMessages.map((msg: any) => {
      if (
        msg.kind === 'buttons' &&
        Array.isArray(msg.buttons) &&
        msg.buttons.flat().some((b: any) =>
          ['edit_name', 'change_country', 'change_language', 'change_photo'].includes(b.id)
        )
      ) {
        const hasBackMenu = msg.buttons.flat().some((b: any) => b.id === 'menu');
        if (!hasBackMenu) {
          return { ...msg, buttons: [...msg.buttons, [{ id: 'menu', label: '↩ Back to Menu' }]] };
        }
      }
      return msg;
    });
  }

  if ((mergedSession.conversationState === 'IDLE' && !isProfileScreen) || isReferral) {
    const hasMenuAlready = mappedMessages.some((msg: any) =>
      msg.kind === 'buttons' &&
      (msg.text?.includes('What would you like to do next') ||
       (Array.isArray(msg.buttons) && msg.buttons.flat().some((b: any) => b.id === 'predict')))
    );

    if (!hasMenuAlready) {
      mappedMessages.push({
        kind: 'buttons',
        text: '⚽ What would you like to do next?',
        buttons: [
          [{ id: 'predict',     label: '🔮 Predict' }],
          [{ id: 'passport',    label: '🪪 Passport'  }, { id: 'stats',       label: '📊 Stats' }],
          [{ id: 'leaderboard', label: '🏆 Leaderboard' }, { id: 'nations',   label: '🌍 Nations' }],
          [{ id: 'referral',    label: '🔗 Referral'  }, { id: 'profile',     label: '👤 Profile' }],
        ],
      });
    }
  }

  return { messages: mappedMessages };
}

// ─── Local menu appender (used by locally-handled commands) ──────────────────

function appendLocalMenu(response: BotResponse): BotResponse {
  const hasMenu = response.messages.some((msg: any) =>
    msg.kind === 'buttons' &&
    (msg.text?.includes('Menu') ||
     (Array.isArray(msg.buttons) && msg.buttons.flat().some((b: any) => b.id === 'predict')))
  );
  if (hasMenu) return response;
  return {
    messages: [
      ...response.messages,
      {
        kind: 'buttons',
        text: '⚽ *OhMyKick Menu*',
        buttons: [
          [{ id: 'predict',     label: '🔮 Predict' }],
          [{ id: 'passport',    label: '🪪 Passport'  }, { id: 'stats',       label: '📊 Stats' }],
          [{ id: 'leaderboard', label: '🏆 Leaderboard' }, { id: 'nations',   label: '🌍 Nations' }],
          [{ id: 'referral',    label: '🔗 Referral'  }, { id: 'profile',     label: '👤 Profile' }],
        ],
      },
    ],
  };
}

// ─── Deduplicate navigation menus ────────────────────────────────────────────

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
  if (menuIndexes.length <= 1) return messages;
  const lastMenuIdx = menuIndexes[menuIndexes.length - 1];
  return messages.filter((_, idx) => !menuIndexes.includes(idx) || idx === lastMenuIdx);
}

// ─── Telegram response dispatcher ────────────────────────────────────────────

async function sendTelegramResponse(
  chatId: number | string,
  response: BotResponse,
  ctx?: any,
): Promise<void> {
  response.messages = cleanDuplicateMenus(response.messages);

  let isEdited = false;
  if (ctx?.callbackQuery && response.messages.length > 0) {
    const firstMsg = response.messages[0];
    if (firstMsg.kind === 'buttons' || firstMsg.kind === 'text' || firstMsg.kind === 'list') {
      try {
        const text = firstMsg.text;
        let rows: { id: string; label: string }[][] = [];

        if (firstMsg.kind === 'buttons') {
          rows = normalizeButtons(firstMsg.buttons, 3);
        } else if (firstMsg.kind === 'list') {
          const allRows = firstMsg.sections.flatMap((s: any) =>
            s.rows.map((r: any) => ({ id: r.id, label: r.title }))
          );
          rows = normalizeButtons(allRows, 1);
        }

        const replyMarkup = rows.length > 0
          ? Markup.inlineKeyboard(rows.map(row => row.map(b => Markup.button.callback(b.label, b.id)))).reply_markup
          : undefined;

        await ctx.editMessageText(escapeMarkdown(text), {
          parse_mode: 'Markdown',
          reply_markup: replyMarkup,
        });
        isEdited = true;
      } catch (err: any) {
        console.warn('[TG editMessageText failed, falling back to send]:', err.message);
      }
    }
  }

  const startIdx = isEdited ? 1 : 0;
  for (let i = startIdx; i < response.messages.length; i++) {
    await dispatchTelegramMessage(chatId, response.messages[i]);
  }
}

async function dispatchTelegramMessage(chatId: number | string, msg: BotMessage): Promise<void> {
  switch (msg.kind) {
    case 'text':
      await sendTgText(chatId, msg.text);
      break;

    case 'buttons':
      await sendTgButtons(chatId, msg.text, msg.buttons, 3);
      break;

    case 'list': {
      const allRows = msg.sections.flatMap(s =>
        s.rows.map(r => ({ id: r.id, label: r.title }))
      );
      await sendTgButtons(chatId, msg.text, allRows, 1);
      break;
    }

    case 'image':
      await sendTgPhoto(chatId, (msg as any).buffer || msg.url, msg.caption, msg.buttons);
      break;
  }
}
