/**
 * Plain JS seed script — no TypeScript, no tsx, no extra memory.
 * Uses native https to call Supabase REST API directly.
 */
const https = require('https');

const SUPABASE_URL = 'https://ybkryfliqgfqgjwgniew.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlia3J5ZmxpcWdmcWdqd2duaWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDczNTM5MywiZXhwIjoyMDk2MzExMzkzfQ.JhWu0Ln7d3aiJBgm0lKXeuroGM2g3k8LqqOJGrh-YQE';

const now = Date.now();

const MOCK_FIXTURES = [
  {
    api_match_id: 1001,
    home_team: 'Argentina',
    away_team: 'Poland',
    home_country_code: 'AR',
    away_country_code: 'PL',
    home_flag_emoji: '\uD83C\uDDE6\uD83C\uDDF7',
    away_flag_emoji: '\uD83C\uDDF5\uD83C\uDDF1',
    kickoff_at: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
    kickoff_local_ist: '9:00 PM IST',
    stage: 'GROUP_C',
    venue: 'Lusail Stadium',
    status: 'SCHEDULED',
    prediction_open: true
  },
  {
    api_match_id: 1002,
    home_team: 'France',
    away_team: 'Denmark',
    home_country_code: 'FR',
    away_country_code: 'DK',
    home_flag_emoji: '\uD83C\uDDEB\uD83C\uDDF7',
    away_flag_emoji: '\uD83C\uDDE9\uD83C\uDDF0',
    kickoff_at: new Date(now + 5 * 60 * 60 * 1000).toISOString(),
    kickoff_local_ist: '11:30 PM IST',
    stage: 'GROUP_D',
    venue: 'Stadium 974',
    status: 'SCHEDULED',
    prediction_open: true
  },
  {
    api_match_id: 1003,
    home_team: 'Brazil',
    away_team: 'Cameroon',
    home_country_code: 'BR',
    away_country_code: 'CM',
    home_flag_emoji: '\uD83C\uDDE7\uD83C\uDDF7',
    away_flag_emoji: '\uD83C\uDDE8\uD83C\uDDF2',
    kickoff_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    kickoff_local_ist: '6:30 PM IST',
    stage: 'GROUP_G',
    venue: 'Lusail Stadium',
    status: 'LIVE',
    prediction_open: false
  },
  {
    api_match_id: 1004,
    home_team: 'USA',
    away_team: 'England',
    home_country_code: 'US',
    away_country_code: 'GB_ENG',
    home_flag_emoji: '\uD83C\uDDFA\uD83C\uDDF8',
    away_flag_emoji: '\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F',
    kickoff_at: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    kickoff_local_ist: '9:00 PM IST',
    stage: 'GROUP_B',
    venue: 'Al Bayt Stadium',
    status: 'FINISHED',
    home_score: 1,
    away_score: 1,
    prediction_open: false
  },
  {
    api_match_id: 1005,
    home_team: 'Germany',
    away_team: 'Spain',
    home_country_code: 'DE',
    away_country_code: 'ES',
    home_flag_emoji: '\uD83C\uDDE9\uD83C\uDDEA',
    away_flag_emoji: '\uD83C\uDDEA\uD83C\uDDF8',
    kickoff_at: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
    kickoff_local_ist: '9:00 PM IST',
    stage: 'GROUP_E',
    venue: 'Al Bayt Stadium',
    status: 'SCHEDULED',
    prediction_open: true
  }
];

function supabaseRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      timeout: 15000
    };
    if (bodyStr) {
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${text}`));
        } else {
          try { resolve(JSON.parse(text)); } catch { resolve(text); }
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function seed() {
  console.log('Seeding mock World Cup 2026 fixtures...');
  for (const fixture of MOCK_FIXTURES) {
    try {
      await supabaseRequest('POST', '/rest/v1/matches', [fixture]);
      console.log(`  Seeded: ${fixture.home_team} vs ${fixture.away_team}`);
    } catch (err) {
      console.error(`  Error seeding ${fixture.home_team} vs ${fixture.away_team}:`, err.message);
    }
  }
  console.log('Done.');
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
