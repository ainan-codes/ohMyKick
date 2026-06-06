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

    // Set up Telegram webhook if token is available
    const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const RAILWAY_URL = process.env.RAILWAY_PUBLIC_DOMAIN;

    if (TG_TOKEN && RAILWAY_URL && process.env.NODE_ENV === 'production') {
      const { bot } = await import('./telegram/sender.js');
      const webhookUrl = `https://${RAILWAY_URL}/webhook/telegram`;
      await bot.telegram.setWebhook(webhookUrl);
      console.log(`   Telegram webhook set: ${webhookUrl}`);
    } else if (TG_TOKEN) {
      console.log('   ℹ️  Set RAILWAY_PUBLIC_DOMAIN to register Telegram webhook automatically');
      console.log('   ℹ️  Or manually: POST https://api.telegram.org/bot<TOKEN>/setWebhook');
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
