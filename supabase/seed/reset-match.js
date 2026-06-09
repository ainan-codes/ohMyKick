/**
 * Reset the Germany vs Spain match back to SCHEDULED state for re-testing.
 */
const https = require('https');

const SUPABASE_URL = 'https://ybkryfliqgfqgjwgniew.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlia3J5ZmxpcWdmcWdqd2duaWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDczNTM5MywiZXhwIjoyMDk2MzExMzkzfQ.JhWu0Ln7d3aiJBgm0lKXeuroGM2g3k8LqqOJGrh-YQE';

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
        'Prefer': 'return=representation'
      },
      timeout: 15000
    };
    if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);

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

async function reset() {
  console.log('Resetting Germany vs Spain match to SCHEDULED...');
  
  // Update the match
  await supabaseRequest(
    'PATCH',
    '/rest/v1/matches?home_team=eq.Germany&away_team=eq.Spain',
    {
      status: 'SCHEDULED',
      prediction_open: true,
      home_score: null,
      away_score: null,
      kickoff_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  );
  console.log('Match reset done.');

  // Verify
  const matches = await supabaseRequest('GET', '/rest/v1/matches?home_team=eq.Germany&away_team=eq.Spain&select=*', null);
  if (Array.isArray(matches) && matches[0]) {
    const m = matches[0];
    console.log(`Status: ${m.status}, prediction_open: ${m.prediction_open}, home_score: ${m.home_score}, away_score: ${m.away_score}`);
  }
}

reset().catch(err => { console.error(err); process.exit(1); });
