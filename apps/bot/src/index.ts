import Fastify from 'fastify';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

// Import handlers
import { registerTelegramHandler } from './telegram/handler.js';
import { registerWhatsAppHandler } from './whatsapp/handler.js';
import { pollActiveMatches } from './pipeline/poll.js';

// Import queues to start workers
import './queues/queue.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

const app = Fastify({
  logger: { level: 'info' },
  trustProxy: true,
});

// ─── Health check ─────────────────────────────────────────────
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Bot webhook routes ────────────────────────────────────────
registerTelegramHandler(app);
registerWhatsAppHandler(app);

// ─── Debug / admin routes ─────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const { mockMatchFinished } = await import('./pipeline/poll.js');

  // Simulate match result for testing: POST /dev/mock-result
  app.post('/dev/mock-result', async (req, reply) => {
    const { matchId, homeScore, awayScore } = req.body as any;
    if (!matchId) return reply.status(400).send({ error: 'matchId required' });
    await mockMatchFinished(matchId, homeScore ?? 2, awayScore ?? 1);
    return { ok: true, message: `Match ${matchId} settled: ${homeScore}-${awayScore}` };
  });
}

// Protected admin route for production match settlement
app.post('/admin/settle-match', async (req, reply) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return reply.status(500).send({ error: 'ADMIN_SECRET env variable is not set' });
  }

  const authHeader = req.headers.authorization;
  const xSecret = req.headers['x-admin-secret'];
  const provided = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : xSecret;

  if (provided !== adminSecret) {
    return reply.status(401).send({ error: 'Unauthorized: invalid token or secret' });
  }

  const { matchId, homeScore, awayScore } = req.body as any;
  if (!matchId) {
    return reply.status(400).send({ error: 'matchId required' });
  }

  try {
    const { mockMatchFinished } = await import('./pipeline/poll.js');
    await mockMatchFinished(matchId, homeScore ?? 2, awayScore ?? 1);
    return { ok: true, message: `Match ${matchId} settled manually: ${homeScore}-${awayScore}` };
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
});

// ─── Match polling scheduler ───────────────────────────────────
// Every 2 minutes during tournament hours
cron.schedule('*/2 * * * *', async () => {
  try {
    await pollActiveMatches();
  } catch (err: any) {
    console.error('[Cron pollMatches]', err.message);
  }
});

// ─── Start server ──────────────────────────────────────────────
const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`\n🚀 OhMyKick Bot Server running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);

    // Set up Telegram webhook/polling if token is available
    const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const RAILWAY_URL = process.env.RAILWAY_PUBLIC_DOMAIN;
    const RENDER_URL = process.env.RENDER_EXTERNAL_URL;

    if (TG_TOKEN) {
      const { bot } = await import('./telegram/sender.js');
      if (process.env.NODE_ENV === 'production') {
        const hostUrl = RENDER_URL || (RAILWAY_URL ? `https://${RAILWAY_URL}` : null);
        if (hostUrl) {
          const webhookUrl = `${hostUrl.replace(/\/$/, '')}/webhook/telegram`;
          await bot.telegram.setWebhook(webhookUrl);
          console.log(`   Telegram webhook set: ${webhookUrl}`);
        } else {
          console.warn('   ⚠️ NODE_ENV is production but no host URL (RENDER_EXTERNAL_URL / RAILWAY_PUBLIC_DOMAIN) was found. Defaulting to polling.');
          await bot.telegram.deleteWebhook({ drop_pending_updates: true });
          bot.launch();
        }
      } else {
        // Delete webhook first to avoid conflict, then launch polling
        await bot.telegram.deleteWebhook({ drop_pending_updates: true });
        bot.launch();
        console.log('   🚀 Telegraf running in long-polling mode (local testing)');
      }
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
