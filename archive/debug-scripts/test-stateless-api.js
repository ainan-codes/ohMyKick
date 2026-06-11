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

const API_URL = 'https://www.ohmykick.com/api/bot/message';
const testUserId = `tg-stateless-${Math.floor(Math.random() * 10000)}`;

async function sendMsg(message) {
  const payload = {
    userId: testUserId,
    phoneNumber: "1234567890",
    channel: "telegram",
    message: message,
    timezone: "Asia/Calcutta"
    // INTENTIONALLY OMITTING sessionState
  };

  console.log(`\n--- [SEND] Message: "${message}" ---`);
  console.log(`Payload:`, JSON.stringify(payload));

  const response = await customFetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log(`Response Status: ${response.status}`);
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    console.log(`Response JSON:`, JSON.stringify(json, null, 2));
    return json;
  } catch (err) {
    console.log(`Response Raw (failed to parse JSON):`, text);
    throw err;
  }
}

async function run() {
  console.log(`Starting stateless test for userId: ${testUserId}`);

  // Step 1: Send "predict"
  const res1 = await sendMsg('predict');
  
  // Try to find match ID from the list response if it returned matches
  let matchId = '1'; // default fallback
  if (res1.messages && res1.messages.length > 0) {
     const listMsg = res1.messages.find(m => m.type === 'list');
     if (listMsg && listMsg.listItems && listMsg.listItems.length > 0) {
         matchId = listMsg.listItems[0].id;
         console.log(`\nFound match ID to select: ${matchId}`);
     }
  }

  // Step 2: Select a match
  const res2 = await sendMsg(matchId);

  // Step 3: Enter scores
  // Depending on what step 2 returns, we might need winner selection or score selection.
  // The local prediction flow used winner selection first.
  let nextAction = 'winner_home';
  if (res2.messages && res2.messages.length > 0) {
      const btnMsg = res2.messages.find(m => m.type === 'buttons');
      if (btnMsg && btnMsg.buttons && btnMsg.buttons.length > 0) {
          nextAction = btnMsg.buttons[0].id;
      }
  }
  
  const res3 = await sendMsg(nextAction);
  
  // Step 4: Just send a score
  await sendMsg("2-1");
}

run().catch(console.error);
