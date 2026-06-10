import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';
import { supabase } from '../db/client.js';
import { getUserById, getUserStats } from '../db/users.js';
import { getMatchById } from '../db/matches.js';
import {
  getUserPredictionForMatch,
  updatePredictionPosterUrl,
  markPosterSent,
} from '../db/predictions.js';
import { sendWhatsAppImage, sendWhatsAppTemplate, sendWhatsAppButtons } from '../whatsapp/sender.js';
import { sendTgPhoto, sendTgButtons } from '../telegram/sender.js';
import { getNextMatch, formatKickoffTime, formatMatchForDisplay } from '../db/matches.js';
import { COUNTRIES } from '../utils/countries.js';
import { logNotification, trackEvent } from '../utils/analytics.js';
import { ACHIEVEMENTS } from '../utils/achievements.js';

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
      countryCode: user.country_code ?? '',
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
      homeCode: match.home_country_code ?? '',
      awayCode: match.away_country_code ?? '',
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
      countryCode: user.country_code ?? '',
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
      homeCode: match.home_country_code ?? '',
      awayCode: match.away_country_code ?? '',
      winnerCode: (match.home_score ?? 0) > (match.away_score ?? 0) ? (match.home_country_code ?? '')
                : (match.away_score ?? 0) > (match.home_score ?? 0) ? (match.away_country_code ?? '')
                : (match.home_country_code ?? ''),
    });
    posterApiUrl = `${posterServiceUrl}/api/posters/result?${params}`;
  } else if (type === 'achievement') {
    const { achievementId } = job.data;
    const ach = ACHIEVEMENTS[achievementId];
    if (!ach) throw new Error(`Achievement ${achievementId} not found`);

    const params = new URLSearchParams({
      name: user.name,
      countryName: user.country_name,
      flagEmoji: user.country_flag_emoji,
      countryCode: user.country_code ?? '',
      title: ach.title,
      desc: ach.desc,
      icon: ach.icon,
      referralCode: user.referral_code,
    });
    posterApiUrl = `${posterServiceUrl}/api/posters/achievement?${params}`;
  } else if (type === 'recap') {
    const {
      personality,
      personalityDesc,
      personalityIcon,
      predictions,
      accuracy,
      exact,
      streak,
      referrals,
      rank,
    } = job.data;
    const params = new URLSearchParams({
      name: user.name,
      countryName: user.country_name,
      flagEmoji: user.country_flag_emoji,
      countryCode: user.country_code ?? '',
      personality: personality ?? '',
      personalityDesc: personalityDesc ?? '',
      personalityIcon: personalityIcon ?? '',
      predictions: String(predictions ?? 0),
      accuracy: String(accuracy ?? 0),
      exact: String(exact ?? 0),
      streak: String(streak ?? 0),
      referrals: String(referrals ?? 0),
      rank: String(rank ?? 1),
      referralCode: user.referral_code ?? '',
    });
    posterApiUrl = `${posterServiceUrl}/api/posters/recap?${params}`;
  } else {
    throw new Error(`Unknown poster type: ${type}`);
  }

  // Download poster PNG
  console.log(`[Queue] Requesting poster API URL: ${posterApiUrl}`);
  const response = await fetch(posterApiUrl);
  if (!response.ok) throw new Error(`Poster API error: ${response.status}`);
  const imageBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(imageBuffer);
  console.log(`[Queue] Downloaded poster: ${buffer.length} bytes`);

  // Upload to Supabase Storage via raw HTTPS (bypasses FormData issue in SDK)
  const storagePath = `${type}/${userId}${matchId ? `_${matchId}` : ''}_${Date.now()}.png`;
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/posters/${storagePath}`;

  console.log(`[Queue] Uploading ${buffer.length} bytes to: ${uploadUrl}`);
  await new Promise<void>((resolve, reject) => {
    const url = new URL(uploadUrl);
    const lib = url.protocol === 'https:' ? https : http;
    const reqOptions = {
      method: 'POST' as const,
      hostname: url.hostname,
      port: url.port || undefined,
      path: url.pathname,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'image/png',
        'Content-Length': buffer.length,
        'x-upsert': 'true',
      } as Record<string, string | number>,
    };
    const req = lib.request(reqOptions, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if ((res.statusCode ?? 0) >= 400) {
          console.error(`[Queue] Storage upload HTTP ${res.statusCode}:`, body);
          reject(new Error(`Storage upload failed: HTTP ${res.statusCode} — ${body}`));
        } else {
          console.log(`[Queue] Storage upload OK (${res.statusCode}): ${storagePath}`);
          resolve();
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Storage upload timeout')); });
    req.write(buffer);
    req.end();
  });

  // Build public URL from known structure (no SDK call needed)
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/posters/${storagePath}`;
  console.log(`[Queue] Public URL: ${publicUrl}`);

  // Update DB
  if (type === 'passport') {
    const { error: dbErr } = await supabase.from('users').update({
      passport_poster_url: publicUrl,
      passport_poster_updated_at: new Date().toISOString(),
    }).eq('id', userId);
    if (dbErr) console.error(`[Queue] DB update (passport) FAILED:`, dbErr.message);
    else console.log(`[Queue] DB updated: passport_poster_url for user ${userId}`);
  } else if (predictionId && (type === 'prematch' || type === 'result')) {
    await updatePredictionPosterUrl(predictionId, type as 'prematch' | 'result', publicUrl);
    console.log(`[Queue] DB updated: ${type}_poster_url for prediction ${predictionId}`);
  }


  // Enqueue notification
  await notifyQueue.add('send-poster', {
    userId,
    matchId,
    predictionId,
    posterUrl: publicUrl,
    type,
    achievementId: job.data.achievementId,
    personality: job.data.personality,
    personalityDesc: job.data.personalityDesc,
    personalityIcon: job.data.personalityIcon,
    predictions: job.data.predictions,
    accuracy: job.data.accuracy,
    exact: job.data.exact,
    streak: job.data.streak,
    referrals: job.data.referrals,
    rank: job.data.rank,
  });
}

async function processNotifyJob(job: { data: any }) {
  const {
    userId,
    matchId,
    predictionId,
    posterUrl,
    type,
    achievementId,
    personality,
    personalityDesc,
    personalityIcon,
    predictions,
    accuracy,
    exact,
    streak,
    referrals,
    rank,
  } = job.data;

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

      // Fetch rank data from global_leaderboard view
      const { data: rankData } = await supabase
        .from('global_leaderboard')
        .select('overall_rank, country_rank')
        .eq('user_id', userId)
        .maybeSingle();

      const globalRank = rankData?.overall_rank ?? '?';
      const countryRank = rankData?.country_rank ?? '?';

      if (resultType === 'PERFECT') {
        caption =
          `🏆 *YOU CALLED IT, ${user.name.toUpperCase()}!*\n\n` +
          `${match.home_team} ${homeScore} – ${awayScore} ${match.away_team} ✅ EXACT SCORE!\n\n` +
          `+${points} points earned\n` +
          `🎯 Tournament accuracy: ${stats.accuracyPct}%\n` +
          `📊 Rank: #${globalRank} globally | #${countryRank} among ${user.country_name} fans\n\n` +
          `Share this. Everyone needs to know 👆\n\n` +
          `Invite friends: ${referralLink}`;
      } else if (resultType === 'CORRECT_WINNER') {
        const predictedWinnerName = prediction.predicted_winner === 'HOME' ? match.home_team : prediction.predicted_winner === 'AWAY' ? match.away_team : 'Draw';
        caption =
          `⚽ *Nearly perfect, ${user.name}.*\n\n` +
          `You called the winner: ${predictedWinnerName} ✅\n` +
          `Exact score: Not quite (you said ${predHome}-${predAway}, it was ${homeScore}-${awayScore})\n\n` +
          `+${points} points earned\n` +
          `📊 Rank: #${globalRank} globally\n\n` +
          `The exact score is 25 points. Next match 🎯\n\n` +
          `Invite friends: ${referralLink}`;
      } else {
        caption =
          `Football can be cruel, ${user.name}.\n\n` +
          `Your pick: ${match.home_team} ${predHome}-${predAway} ${match.away_team} ❌\n` +
          `What happened: ${match.home_team} ${homeScore}-${awayScore} ${match.away_team}\n\n` +
          `+0 points this match\n` +
          `📊 ${stats.correct}/${stats.total} correct · ${stats.accuracyPct}% accuracy\n` +
          `📊 Rank: #${globalRank} globally\n\n` +
          `Every great predictor gets this wrong sometimes.\n` +
          `Next match is your chance 🔥\n\n` +
          `Invite friends: ${referralLink}`;
      }
    } else {
      caption = `Your result poster is ready. Check your prediction! ⚽`;
    }
  } else if (type === 'achievement' && achievementId) {
    const ach = ACHIEVEMENTS[achievementId];
    if (ach) {
      caption =
        `🎉 *ACHIEVEMENT UNLOCKED: ${ach.title.toUpperCase()} ${ach.icon}*\n\n` +
        `Description: _${ach.desc}_\n\n` +
        `Outstanding predicting, ${user.name}! Share your badge to celebrate 👆\n\n` +
        `Invite friends: ${referralLink}`;
    }
  } else if (type === 'recap') {
    caption =
      `🏆 *YOUR WORLD CUP 2026 RECAP & PERSONALITY CARD CARD IS READY!*\n\n` +
      `You've been crowned as: *${personality}* ${personalityIcon}\n\n` +
      `Stats:\n` +
      `• Predictions: ${predictions}\n` +
      `• Accuracy: ${accuracy}%\n` +
      `• Exact scorelines: ${exact} 🏆\n` +
      `• Best streak: ${streak} Days\n` +
      `• Global rank: #${rank}\n\n` +
      `What a tournament! Share your final card to show off your glory 👆\n\n` +
      `Invite friends: ${referralLink}`;
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
    if (type === 'achievement' && achievementId) {
      await supabase
        .from('notification_log')
        .update({ status: 'SENT', sent_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('notification_type', `ACHIEVEMENT_${achievementId}`);
    } else if (type === 'recap') {
      await supabase
        .from('notification_log')
        .update({ status: 'SENT', sent_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('notification_type', 'RECAP');
    } else {
      await logNotification(userId, 'WHATSAPP', type, 'SENT');
    }
  }

  // Send via Telegram (always free, no template restrictions)
  if (user.tg_id) {
    await sendTgPhoto(parseInt(user.tg_id), posterUrl, caption);
    
    // Follow-up UX Menu based on poster type
    if (type === 'prematch') {
      await sendTgButtons(parseInt(user.tg_id), '⚽ What would you like to do next?', [
        [{ id: 'predict', label: '🔮 Predict' }],
        [{ id: 'passport', label: '🪪 Passport' }, { id: 'stats', label: '📊 Stats' }],
        [{ id: 'leaderboard', label: '🏆 Leaderboard' }, { id: 'nations', label: '🌍 Nations' }],
        [{ id: 'referral', label: '🔗 Referral' }, { id: 'profile', label: '👤 Profile' }]
      ]);
    } else if (type === 'result') {
      await sendTgButtons(parseInt(user.tg_id), '🔥 Ready for the next fixture?', [
        [{ id: 'predict', label: '🔮 Predict' }]
      ]);
    } else {
      await sendTgButtons(parseInt(user.tg_id), '⚽ What would you like to do next?', [
        [{ id: 'predict', label: '🔮 Predict' }],
        [{ id: 'passport', label: '🪪 Passport' }, { id: 'stats', label: '📊 Stats' }],
        [{ id: 'leaderboard', label: '🏆 Leaderboard' }, { id: 'nations', label: '🌍 Nations' }],
        [{ id: 'referral', label: '🔗 Referral' }, { id: 'profile', label: '👤 Profile' }]
      ]);
    }
    if (predictionId && type === 'prematch') {
      await markPosterSent(predictionId, 'prematch', 'tg');
    } else if (predictionId && type === 'result') {
      await markPosterSent(predictionId, 'result', 'tg');
    }
    
    if (type === 'achievement' && achievementId) {
      await supabase
        .from('notification_log')
        .update({ status: 'SENT', sent_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('notification_type', `ACHIEVEMENT_${achievementId}`);
    } else if (type === 'recap') {
      await supabase
        .from('notification_log')
        .update({ status: 'SENT', sent_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('notification_type', 'RECAP');
    } else {
      await logNotification(userId, 'TELEGRAM', type, 'SENT');
    }
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

      // ── Auto Next-Match Prompt ─────────────────────────────────
      // Schedule a follow-up prediction nudge 15 minutes after the result poster
      await notifyQueue.add(
        'next-match-prompt',
        { userId },
        { delay: 15 * 60 * 1000 } // 15 minutes
      );
    }
  } catch (err: any) {
    console.error('[notifyWorker] trackEvent error:', err.message);
  }
}

// ─── Next-match prompt handler ────────────────────────────────
async function processNextMatchPromptJob(job: { data: any }) {
  const { userId } = job.data;
  const user = await getUserById(userId);
  if (!user) return;

  // Find next upcoming predictable match
  const nextMatch = await getNextMatch();
  if (!nextMatch) {
    console.log(`[NextMatchPrompt] No upcoming match found for user ${userId}`);
    return;
  }

  // Check if user already predicted this match
  const existing = await getUserPredictionForMatch(userId, nextMatch.id);
  if (existing) {
    console.log(`[NextMatchPrompt] User ${userId} already predicted match ${nextMatch.id}`);
    return;
  }

  const matchDisplay = formatMatchForDisplay(nextMatch);
  const kickoffTime = formatKickoffTime(nextMatch);
  const text =
    `⚽ *New Match Available*\n\n` +
    `*${matchDisplay}*\n\n` +
    `Kickoff:\n` +
    `${kickoffTime}\n\n` +
    `Ready to predict?`;

  if (user.tg_id) {
    await sendTgButtons(
      user.tg_id,
      text,
      [[{ id: 'predict', label: '🔮 Predict' }]]
    );
    console.log(`[NextMatchPrompt] Sent TG next-match prompt to user ${userId}`);
  }

  if (user.wa_id) {
    try {
      await sendWhatsAppButtons(user.wa_id, text, [
        { id: 'predict_now', title: '⚽ Predict Now' },
        { id: 'view_passport', title: '🎫 My Passport' },
      ]);
      console.log(`[NextMatchPrompt] Sent WA next-match prompt to user ${userId}`);
    } catch (err: any) {
      console.error('[NextMatchPrompt] WA send failed:', err.message);
    }
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
  async (job) => {
    if (job.name === 'next-match-prompt') {
      return processNextMatchPromptJob(job);
    }
    return processNotifyJob(job);
  },
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
  let useRedis = false;
  try {
    if (redis.status === 'ready') {
      await redis.ping();
      useRedis = true;
    }
  } catch (err: any) {
    console.warn(`[Queue Bypass] Redis ping failed: ${err.message}. Falling back to synchronous processing.`);
  }

  if (useRedis) {
    return originalPosterAdd(name, data, opts);
  } else {
    console.log(`[Queue Bypass] Redis offline/errored. Processing poster synchronous-in-process for user ${data.userId}...`);
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
  let useRedis = false;
  try {
    if (redis.status === 'ready') {
      await redis.ping();
      useRedis = true;
    }
  } catch (err: any) {
    console.warn(`[Queue Bypass] Redis ping failed: ${err.message}. Falling back to synchronous processing.`);
  }

  if (useRedis) {
    return originalNotifyAdd(name, data, opts);
  } else {
    console.log(`[Queue Bypass] Redis offline/errored. Sending notification synchronous-in-process to user ${data.userId}...`);
    setTimeout(() => {
      processNotifyJob({ data }).catch((err) => {
        console.error(`[Queue Bypass] Synchronous notify job failed:`, err.message);
      });
    }, 50);
    return { id: `mock-job-${Date.now()}` } as any;
  }
}) as any;

console.log('[Queue] Poster and notification workers started. Redis bypass fallback active.');
