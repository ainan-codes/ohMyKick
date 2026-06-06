import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import { supabase } from '../db/client.js';
import { getUserById, getUserStats } from '../db/users.js';
import { getMatchById } from '../db/matches.js';
import {
  getUserPredictionForMatch,
  updatePredictionPosterUrl,
  markPosterSent,
} from '../db/predictions.js';
import { sendWhatsAppImage, sendWhatsAppTemplate } from '../whatsapp/sender.js';
import { sendTgPhoto } from '../telegram/sender.js';
import { COUNTRIES } from '../utils/countries.js';
import { logNotification, trackEvent } from '../utils/analytics.js';

dotenv.config();

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    // Backoff reconnect strategy (1s, 2s, 3s, ... max 10s)
    return Math.min(times * 1000, 10000);
  }
});

redis.on('error', (err) => {
  // Capture error to avoid unhandled exception logs
  console.warn(`[Queue Redis] Connection issue: ${err.message}`);
});

// ─── Queue definitions ────────────────────────────────────────
export const posterQueue = new Queue('poster-generation', { connection: redis as any });
export const notifyQueue = new Queue('notifications', { connection: redis as any });

posterQueue.on('error', (err) => {
  console.warn(`[Queue posterQueue] Redis issue: ${err.message}`);
});
notifyQueue.on('error', (err) => {
  console.warn(`[Queue notifyQueue] Redis issue: ${err.message}`);
});

// ─── standalone job processors for bypass mode ────────────────
async function processPosterJob(job: { data: any }) {
  const { type, userId, matchId, predictionId } = job.data;

  const user = await getUserById(userId);
  if (!user) throw new Error(`User ${userId} not found`);

  const stats = await getUserStats(userId);
  const posterServiceUrl = process.env.POSTER_SERVICE_URL ?? 'https://ohmykick.vercel.app';
  const appUrl = process.env.APP_URL ?? 'https://ohmykick.com';

  let posterApiUrl: string;

  if (type === 'passport') {
    const userCountry = user.country_code ? COUNTRIES[user.country_code] : null;

    const params = new URLSearchParams({
      name: user.name,
      countryName: user.country_name,
      countryCode: user.country_code ?? '',
      primaryColor: userCountry?.primaryColor ?? '#f0b429',
      secondaryColor: userCountry?.secondaryColor ?? '#ffd166',
      flagEmoji: user.country_flag_emoji,
      fanId: user.fan_id,
      fanLevel: user.fan_level,
      totalPoints: String(stats.totalPoints),
      accuracyPct: String(stats.accuracyPct),
      streakCount: String(user.streak_count),
      referralCount: String(user.referral_count),
      referralCode: user.referral_code,
      ...(user.photo_url ? { photoUrl: user.photo_url } : {}),
    });
    posterApiUrl = `${posterServiceUrl}/api/posters/passport?${params}`;
  } else if (type === 'prematch' && matchId && predictionId) {
    const match = await getMatchById(matchId);
    const prediction = await getUserPredictionForMatch(userId, matchId);
    if (!match || !prediction) throw new Error('Match or prediction not found');

    const homeCountry = match.home_country_code ? COUNTRIES[match.home_country_code] : null;
    const awayCountry = match.away_country_code ? COUNTRIES[match.away_country_code] : null;

    const params = new URLSearchParams({
      name: user.name,
      flagEmoji: user.country_flag_emoji,
      countryName: user.country_name,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      homeFlag: match.home_flag_emoji ?? '🏳️',
      awayFlag: match.away_flag_emoji ?? '🏳️',
      predictionHome: String(prediction.predicted_home_score),
      predictionAway: String(prediction.predicted_away_score),
      stage: match.stage.replace('_', ' '),
      matchDate: new Date(match.kickoff_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      kickoffTime: match.kickoff_local_ist ?? '',
      referralCode: user.referral_code,
      homePrimary: homeCountry?.primaryColor ?? '#1a1a6e',
      awayPrimary: awayCountry?.primaryColor ?? '#6e1a1a',
      homeCountryCode: match.home_country_code ?? '',
      awayCountryCode: match.away_country_code ?? '',
    });
    posterApiUrl = `${posterServiceUrl}/api/posters/prematch?${params}`;
  } else if (type === 'result' && matchId && predictionId) {
    const match = await getMatchById(matchId);
    const prediction = await getUserPredictionForMatch(userId, matchId);
    if (!match || !prediction) throw new Error('Match or prediction not found');

    const params = new URLSearchParams({
      name: user.name,
      countryName: user.country_name,
      flagEmoji: user.country_flag_emoji,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      homeFlag: match.home_flag_emoji ?? '🏳️',
      awayFlag: match.away_flag_emoji ?? '🏳️',
      predictionHome: String(prediction.predicted_home_score),
      predictionAway: String(prediction.predicted_away_score),
      actualHome: String(match.home_score ?? 0),
      actualAway: String(match.away_score ?? 0),
      resultType: prediction.result_type ?? 'WRONG',
      points: String(prediction.points_earned ?? 0),
      accuracy: String(stats.accuracyPct),
      totalPredictions: String(stats.total),
      correctPredictions: String(stats.correct),
      referralCode: user.referral_code,
      homeCountryCode: match.home_country_code ?? '',
      awayCountryCode: match.away_country_code ?? '',
    });
    posterApiUrl = `${posterServiceUrl}/api/posters/result?${params}`;
  } else {
    throw new Error(`Unknown poster type: ${type}`);
  }

  // Download poster PNG
  const response = await fetch(posterApiUrl);
  if (!response.ok) throw new Error(`Poster API error: ${response.status}`);
  const imageBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(imageBuffer);

  // Upload to Supabase Storage
  const path = `${type}/${userId}${matchId ? `_${matchId}` : ''}_${Date.now()}.png`;
  const { error: uploadError } = await supabase.storage
    .from('posters')
    .upload(path, buffer, { contentType: 'image/png', upsert: true });

  if (uploadError) throw new Error(`Supabase upload error: ${uploadError.message}`);

  const { data: urlData } = supabase.storage.from('posters').getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  // Update DB
  if (type === 'passport') {
    await supabase.from('users').update({
      passport_poster_url: publicUrl,
      passport_poster_updated_at: new Date().toISOString(),
    }).eq('id', userId);
  } else if (predictionId && (type === 'prematch' || type === 'result')) {
    await updatePredictionPosterUrl(predictionId, type as 'prematch' | 'result', publicUrl);
  }

  // Enqueue notification
  await notifyQueue.add('send-poster', {
    userId,
    matchId,
    predictionId,
    posterUrl: publicUrl,
    type,
  });
}

async function processNotifyJob(job: { data: any }) {
  const { userId, matchId, predictionId, posterUrl, type } = job.data;

  const user = await getUserById(userId);
  if (!user) return;

  const appUrl = process.env.APP_URL ?? 'https://ohmykick.com';
  const referralLink = `${appUrl}/${user.referral_code}`;

  let caption = '';
  if (type === 'passport') {
    caption =
      `🎫 *Your Fan Passport is ready, ${user.name}!*\n\n` +
      `Share this to your WhatsApp Status 👆\n\n` +
      `Invite friends: ${referralLink}`;
  } else if (type === 'prematch') {
    caption =
      `Your prediction is live, ${user.name} 🔥\n\n` +
      `Share this before the match starts.\n` +
      `If you're right, I'll send you the proof 🏆\n\n` +
      `Invite friends: ${referralLink}`;
  } else if (type === 'result' && matchId) {
    const match = await getMatchById(matchId);
    const prediction = await getUserPredictionForMatch(userId, matchId);
    if (match && prediction) {
      const stats = await getUserStats(userId);
      const homeScore = match.home_score ?? 0;
      const awayScore = match.away_score ?? 0;
      const predHome = prediction.predicted_home_score;
      const predAway = prediction.predicted_away_score;
      const resultType = prediction.result_type ?? 'WRONG';
      const points = prediction.points_earned ?? 0;

      if (resultType === 'PERFECT') {
        caption =
          `🏆 *YOU CALLED IT, ${user.name.toUpperCase()}!*\n\n` +
          `${match.home_team} ${homeScore} – ${awayScore} ${match.away_team} ✅ EXACT SCORE!\n\n` +
          `+${points} points earned\n` +
          `🎯 Tournament accuracy: ${stats.accuracyPct}%\n\n` +
          `Share this. Everyone needs to know 👆\n\n` +
          `Invite friends: ${referralLink}`;
      } else if (resultType === 'CORRECT_WINNER') {
        const predictedWinnerName = prediction.predicted_winner === 'HOME' ? match.home_team : prediction.predicted_winner === 'AWAY' ? match.away_team : 'Draw';
        caption =
          `⚽ *Nearly perfect, ${user.name}.*\n\n` +
          `You called the winner: ${predictedWinnerName} ✅\n` +
          `Exact score: Not quite (you said ${predHome}-${predAway}, it was ${homeScore}-${awayScore})\n\n` +
          `+${points} points earned\n\n` +
          `The exact score is 25 points. Next match 🎯\n\n` +
          `Invite friends: ${referralLink}`;
      } else {
        caption =
          `Football can be cruel, ${user.name}.\n\n` +
          `Your pick: ${match.home_team} ${predHome}-${predAway} ${match.away_team} ❌\n` +
          `What happened: ${match.home_team} ${homeScore}-${awayScore} ${match.away_team}\n\n` +
          `+0 points this match\n` +
          `📊 ${stats.correct}/${stats.total} correct · ${stats.accuracyPct}% accuracy\n\n` +
          `Every great predictor gets this wrong sometimes.\n` +
          `Next match is your chance 🔥\n\n` +
          `Invite friends: ${referralLink}`;
      }
    } else {
      caption = `Your result poster is ready. Check your prediction! ⚽`;
    }
  }

  const isInWaFreeWindow =
    user.wa_id &&
    user.last_wa_message_at &&
    Date.now() - new Date(user.last_wa_message_at).getTime() < 24 * 60 * 60 * 1000;

  // Send via WhatsApp
  if (user.wa_id) {
    if (isInWaFreeWindow) {
      await sendWhatsAppImage(user.wa_id, posterUrl, caption);
      if (predictionId && type === 'prematch') {
        await markPosterSent(predictionId, 'prematch', 'wa');
      } else if (predictionId && type === 'result') {
        await markPosterSent(predictionId, 'result', 'wa');
      }
    } else if (type === 'result' && matchId) {
      const match = await getMatchById(matchId);
      if (match) {
        await sendWhatsAppTemplate(user.wa_id, 'result_ready', [
          `${match.home_team} vs ${match.away_team}`,
          user.name,
        ]);
      }
    }
    await logNotification(userId, 'WHATSAPP', type, 'SENT');
  }

  // Send via Telegram (always free, no template restrictions)
  if (user.tg_id) {
    const buttons =
      type !== 'passport'
        ? [
            [
              { id: 'predict_now', label: '⚽ Predict Next Match' },
              { id: 'referral_info', label: '📨 Invite Friends' },
            ],
          ]
        : [[{ id: 'predict_now', label: '⚽ Predict Now' }]];

    await sendTgPhoto(parseInt(user.tg_id), posterUrl, caption, buttons);
    if (predictionId && type === 'prematch') {
      await markPosterSent(predictionId, 'prematch', 'tg');
    } else if (predictionId && type === 'result') {
      await markPosterSent(predictionId, 'result', 'tg');
    }
    await logNotification(userId, 'TELEGRAM', type, 'SENT');
  }

  // Track analytics events
  try {
    const channel = user.wa_id ? 'whatsapp' : 'telegram';
    if (type === 'passport') {
      trackEvent(userId, 'passport_delivered', { channel });
    } else if (type === 'prematch') {
      trackEvent(userId, 'prematch_poster_delivered', { channel });
    } else if (type === 'result') {
      const prediction = matchId ? await getUserPredictionForMatch(userId, matchId) : null;
      trackEvent(userId, 'result_poster_delivered', {
        channel,
        resultType: prediction?.result_type ?? 'WRONG',
      });
    }
  } catch (err: any) {
    console.error('[notifyWorker] trackEvent error:', err.message);
  }
}

// ─── Poster generation worker ─────────────────────────────────
const posterWorker = new Worker(
  'poster-generation',
  async (job) => processPosterJob(job),
  { connection: redis as any, concurrency: 20 }
);

// ─── Notification delivery worker ────────────────────────────
const notifyWorker = new Worker(
  'notifications',
  async (job) => processNotifyJob(job),
  { connection: redis as any, concurrency: 50 }
);

posterWorker.on('error', (err) => {
  console.warn(`[Worker posterWorker] Redis issue: ${err.message}`);
});

notifyWorker.on('error', (err) => {
  console.warn(`[Worker notifyWorker] Redis issue: ${err.message}`);
});

posterWorker.on('failed', (job, err) => {
  console.error(`[posterWorker] Job ${job?.id} failed:`, err.message);
});

notifyWorker.on('failed', (job, err) => {
  console.error(`[notifyWorker] Job ${job?.id} failed:`, err.message);
});

// ─── Override queue add methods to support Redis bypass local dev mode ─
const originalPosterAdd = posterQueue.add.bind(posterQueue);
posterQueue.add = (async (name: string, data: any, opts: any) => {
  if (redis.status === 'ready') {
    return originalPosterAdd(name, data, opts);
  } else {
    console.log(`[Queue Bypass] Redis offline. Processing poster synchronous-in-process for user ${data.userId}...`);
    setTimeout(() => {
      processPosterJob({ data }).catch((err) => {
        console.error(`[Queue Bypass] Synchronous poster job failed:`, err.message);
      });
    }, 50);
    return { id: `mock-job-${Date.now()}` } as any;
  }
}) as any;

const originalNotifyAdd = notifyQueue.add.bind(notifyQueue);
notifyQueue.add = (async (name: string, data: any, opts: any) => {
  if (redis.status === 'ready') {
    return originalNotifyAdd(name, data, opts);
  } else {
    console.log(`[Queue Bypass] Redis offline. Sending notification synchronous-in-process to user ${data.userId}...`);
    setTimeout(() => {
      processNotifyJob({ data }).catch((err) => {
        console.error(`[Queue Bypass] Synchronous notify job failed:`, err.message);
      });
    }, 50);
    return { id: `mock-job-${Date.now()}` } as any;
  }
}) as any;

console.log('[Queue] Poster and notification workers started. Redis bypass fallback active.');
