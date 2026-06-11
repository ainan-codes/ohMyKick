const https = require('https');

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
          headers: res.headers,
          json: () => Promise.resolve(JSON.parse(rawBuffer.toString('utf8'))),
          text: () => Promise.resolve(rawBuffer.toString('utf8')),
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  const url = 'https://www.ohmykick.com/api/bot/message';
  const payload = {
    userId: "7728573771",
    channel: "telegram",
    message: "hi",
    timezone: "Asia/Calcutta",
    sessionState: {}
  };

  console.log('Sending request to:', url);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await customFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('HTTP Status Code:', response.status);
    const text = await response.text();
    console.log('Response Body JSON:', text);
  } catch (err) {
    console.error('Error encountered:', err);
  }
}

run();
