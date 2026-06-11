const API_URL = 'https://www.ohmykick.com/api/bot/message';

async function sendMsg(userId, message, sessionState = {}) {
  const payload = {
    userId,
    channel: 'telegram',
    message,
    timezone: 'Asia/Calcutta',
    sessionState
  };

  console.log(`\n--- [SEND] Message: "${message}" ---`);
  console.log(`Payload sessionState:`, JSON.stringify(sessionState));

  const response = await fetch(API_URL, {
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
  const userId = `+91999${Math.floor(1000000 + Math.random() * 9000000)}`;
  console.log(`Starting session for userId: ${userId}`);

  let state = {};

  // 1. Onboarding - Start
  let res = await sendMsg(userId, 'start', state);
  state = res.sessionState || {};

  // 2. Onboarding - Name
  res = await sendMsg(userId, 'Lionel Messi', state);
  state = res.sessionState || {};

  // 3. Onboarding - Country
  res = await sendMsg(userId, 'AR', state);
  state = res.sessionState || {};

  // 4. Onboarding - Photo (let's try to skip)
  res = await sendMsg(userId, 'skip_photo', state);
  state = res.sessionState || {};

  // 5. Onboarding - Language (choose "en")
  res = await sendMsg(userId, 'en', state);
  state = res.sessionState || {};

  console.log('\n======================================');
  console.log('Testing prediction flow goals select');
  console.log('======================================');

  // Send "predict"
  res = await sendMsg(userId, 'predict', state);
  state = res.sessionState || {};

  // Choose match "G001"
  res = await sendMsg(userId, 'G001', state);
  state = res.sessionState || {};

  // Choose winner "TEAM1" (Mexico)
  res = await sendMsg(userId, 'TEAM1', state);
  state = res.sessionState || {};

  // Choose winner goals "2"
  res = await sendMsg(userId, '2', state);
  state = res.sessionState || {};

  // Choose loser goals "1"
  res = await sendMsg(userId, '1', state);
  state = res.sessionState || {};

  console.log('\n======================================');
  console.log('Testing stats, nations, profile');
  console.log('======================================');

  // Send "stats"
  res = await sendMsg(userId, 'stats', state);
  state = res.sessionState || {};

  // Send "nations"
  res = await sendMsg(userId, 'nations', state);
  state = res.sessionState || {};

  // Send "profile"
  res = await sendMsg(userId, 'profile', state);
  state = res.sessionState || {};
}

run().catch(console.error);
