/**
 * Clean up script: Deletes all users, predictions, and notification logs from Supabase.
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
        'Prefer': 'return=minimal'
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
          try { resolve(text ? JSON.parse(text) : {}); } catch { resolve(text); }
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function clean() {
  console.log('Cleaning up database to start fresh...');
  
  try {
    console.log('Deleting from notification_log...');
    await supabaseRequest('DELETE', '/rest/v1/notification_log?id=not.is.null');
    
    console.log('Deleting from predictions...');
    await supabaseRequest('DELETE', '/rest/v1/predictions?id=not.is.null');
    
    console.log('Deleting from users...');
    await supabaseRequest('DELETE', '/rest/v1/users?id=not.is.null');

    console.log('Resetting matches to SCHEDULED (just in case)...');
    await supabaseRequest(
      'PATCH',
      '/rest/v1/matches?id=not.is.null',
      {
        status: 'SCHEDULED',
        prediction_open: true,
        home_score: null,
        away_score: null
      }
    );

    console.log('Cleanup complete!');
  } catch (err) {
    console.error('Error during cleanup:', err.message);
  }
}

clean().catch(err => { console.error(err); process.exit(1); });
