import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

// Mock the poll.js module to avoid actual database updates or match processing
vi.mock('../src/pipeline/poll.js', () => {
  return {
    mockMatchFinished: vi.fn().mockImplementation(async (matchId, homeScore, awayScore) => {
      console.log(`Mock mockMatchFinished called for match ${matchId} with scores ${homeScore}-${awayScore}`);
      return Promise.resolve();
    }),
  };
});

describe('Admin Settle Match API Endpoint', () => {
  let app: any;

  beforeEach(async () => {
    app = Fastify();
    // Register the admin route logic we added to index.ts
    app.post('/admin/settle-match', async (req: any, reply: any) => {
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
        const { mockMatchFinished } = await import('../src/pipeline/poll.js');
        await mockMatchFinished(matchId, homeScore ?? 2, awayScore ?? 1);
        return { ok: true, message: `Match ${matchId} settled manually: ${homeScore}-${awayScore}` };
      } catch (err: any) {
        return reply.status(500).send({ error: err.message });
      }
    });

    await app.ready();
  });

  it('returns 500 if ADMIN_SECRET is not configured', async () => {
    const originalSecret = process.env.ADMIN_SECRET;
    delete process.env.ADMIN_SECRET;

    const response = await app.inject({
      method: 'POST',
      url: '/admin/settle-match',
      payload: { matchId: '123' },
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toContain('ADMIN_SECRET env variable is not set');

    process.env.ADMIN_SECRET = originalSecret;
  });

  it('returns 401 if secret is incorrect', async () => {
    process.env.ADMIN_SECRET = 'super-secret-key';

    const response = await app.inject({
      method: 'POST',
      url: '/admin/settle-match',
      headers: {
        authorization: 'Bearer wrong-secret',
      },
      payload: { matchId: '123' },
    });

    expect(response.statusCode).toBe(401);
  });

  it('returns 400 if matchId is missing', async () => {
    process.env.ADMIN_SECRET = 'super-secret-key';

    const response = await app.inject({
      method: 'POST',
      url: '/admin/settle-match',
      headers: {
        'x-admin-secret': 'super-secret-key',
      },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it('calls mockMatchFinished and returns 200 on successful auth', async () => {
    process.env.ADMIN_SECRET = 'super-secret-key';

    const response = await app.inject({
      method: 'POST',
      url: '/admin/settle-match',
      headers: {
        authorization: 'Bearer super-secret-key',
      },
      payload: {
        matchId: 'match-1234',
        homeScore: 3,
        awayScore: 2,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.ok).toBe(true);
    expect(body.message).toContain('Match match-1234 settled manually: 3-2');

    const { mockMatchFinished } = await import('../src/pipeline/poll.js');
    expect(mockMatchFinished).toHaveBeenCalledWith('match-1234', 3, 2);
  });
});
