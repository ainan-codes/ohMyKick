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
  console.log(`Starting photo flow simulation for userId: ${userId}`);

  let state = {};

  // Onboarding - Start
  let res = await sendMsg(userId, 'start', state);
  state = res.sessionState || {};

  // Onboarding - Name
  res = await sendMsg(userId, 'Lionel Messi', state);
  state = res.sessionState || {};

  // Onboarding - Country
  res = await sendMsg(userId, 'AR', state);
  state = res.sessionState || {};

  // Onboarding - Send Photo click
  res = await sendMsg(userId, 'send_photo', state);
  state = res.sessionState || {};

  // Let's see what is returned here!
}

run().catch(console.error);
