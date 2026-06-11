const https = require('https');

const RENDER_KEY = 'rnd_ql2tqzRWFitr75YDk1GDjtwJZctN';
const SERVICE_ID = 'srv-d8k61vl7vvec73a3bddg';

function customFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const headers = options.headers || {};
    const reqOptions = {
      method: options.method || 'GET',
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      headers: headers,
      timeout: 15000,
    };

    const req = https.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const rawBuffer = Buffer.concat(chunks);
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(rawBuffer.toString('utf8'))),
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timeout'));
    });

    req.end();
  });
}

async function main() {
  const getUrl = `https://api.render.com/v1/services/${SERVICE_ID}`;
  const res = await customFetch(getUrl, {
    headers: {
      'Authorization': `Bearer ${RENDER_KEY}`,
      'Accept': 'application/json'
    }
  });

  const data = await res.json();
  console.log('Service Info:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
