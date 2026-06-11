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
    console.log(`Response Raw:`, text);
    throw err;
  }
}

async function run() {
  const userId = `+91999${Math.floor(1000000 + Math.random() * 9000000)}`;
  
  // Onboard first
  let res = await sendMsg(userId, 'start');
  let state = res.sessionState;
  
  res = await sendMsg(userId, 'Lionel Messi', state);
  state = res.sessionState;
  
  res = await sendMsg(userId, 'AR', state);
  state = res.sessionState;
  
  res = await sendMsg(userId, 'skip_photo', state);
  state = res.sessionState;
  
  res = await sendMsg(userId, 'en', state);
  state = res.sessionState;

  // Now in IDLE state, send "profile"
  res = await sendMsg(userId, 'profile', state);
  state = res.sessionState;

  // Send "change_photo"
  res = await sendMsg(userId, 'change_photo', state);
  state = res.sessionState;
}

run().catch(console.error);
