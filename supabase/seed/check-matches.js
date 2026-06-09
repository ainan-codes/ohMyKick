/**
 * Quick check - fetch Germany vs Spain match from Supabase
 */
const https = require('https');

const SUPABASE_URL = 'https://ybkryfliqgfqgjwgniew.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlia3J5ZmxpcWdmcWdqd2duaWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDczNTM5MywiZXhwIjoyMDk2MzExMzkzfQ.JhWu0Ln7d3aiJBgm0lKXeuroGM2g3k8LqqOJGrh-YQE';

function supabaseGet(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const options = {
      method: 'GET',
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Accept': 'application/json'
      },
      timeout: 15000
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        try { resolve(JSON.parse(text)); } catch { resolve(text); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

async function check() {
  console.log('=== Checking DB Matches ===');
  const matches = await supabaseGet('/rest/v1/matches?select=*&order=api_match_id');
  console.log('All matches:');
  if (Array.isArray(matches)) {
    matches.forEach(m => {
      console.log(`  [${m.id}] ${m.home_team} vs ${m.away_team} | status=${m.status} | prediction_open=${m.prediction_open} | api_match_id=${m.api_match_id}`);
    });
  } else {
    console.log(matches);
  }
}

check().catch(err => { console.error(err); process.exit(1); });
