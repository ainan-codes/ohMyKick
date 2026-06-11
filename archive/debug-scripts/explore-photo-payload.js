const API_URL = 'https://www.ohmykick.com/api/bot/message';

async function testPayload(payloadName, payloadModifier) {
  const userId = `+91999${Math.floor(1000000 + Math.random() * 9000000)}`;
  
  // Base onboarding states
  const state0 = {};
  const res1 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, channel: 'telegram', message: 'start', timezone: 'Asia/Calcutta', sessionState: state0 })
  }).then(r => r.json());
  
  const state1 = res1.sessionState;
  const res2 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, channel: 'telegram', message: 'Lionel Messi', timezone: 'Asia/Calcutta', sessionState: state1 })
  }).then(r => r.json());

  const state2 = res2.sessionState;
  const res3 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, channel: 'telegram', message: 'AR', timezone: 'Asia/Calcutta', sessionState: state2 })
  }).then(r => r.json());

  const state3 = res3.sessionState; // This is ONBOARDING_PHOTO state

  // Modify base payload for the test case
  const testPhotoUrl = 'https://ybkryfliqgfqgjwgniew.supabase.co/storage/v1/object/public/photos/test.jpg';
  const basePayload = {
    userId,
    channel: 'telegram',
    message: '',
    timezone: 'Asia/Calcutta',
    sessionState: state3
  };

  const finalPayload = payloadModifier(basePayload, testPhotoUrl);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload)
    });
    const data = await response.json();
    const nextState = data.sessionState?.conversationState || 'NONE';
    console.log(`[TEST: ${payloadName}] -> HTTP ${response.status}, Next State: ${nextState}`);
    if (nextState !== 'ONBOARDING_PHOTO') {
      console.log(`SUCCESS! Response data:`, JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log(`[TEST: ${payloadName}] -> Error: ${err.message}`);
  }
}

async function run() {
  const tests = [
    {
      name: 'Root photoUrl',
      modifier: (p, url) => { p.photoUrl = url; return p; }
    },
    {
      name: 'Root imageUrl',
      modifier: (p, url) => { p.imageUrl = url; return p; }
    },
    {
      name: 'Root mediaUrl',
      modifier: (p, url) => { p.mediaUrl = url; return p; }
    },
    {
      name: 'SessionState photoUrl',
      modifier: (p, url) => { p.sessionState.photoUrl = url; return p; }
    },
    {
      name: 'SessionState imageUrl',
      modifier: (p, url) => { p.sessionState.imageUrl = url; return p; }
    },
    {
      name: 'Message as object with url',
      modifier: (p, url) => { p.message = { type: 'photo', url }; return p; }
    },
    {
      name: 'Message as object with imageUrl',
      modifier: (p, url) => { p.message = { type: 'photo', imageUrl: url }; return p; }
    },
    {
      name: 'Message as JSON string',
      modifier: (p, url) => { p.message = JSON.stringify({ type: 'photo', url }); return p; }
    },
    {
      name: 'Message prefix photo:',
      modifier: (p, url) => { p.message = `photo:${url}`; return p; }
    },
    {
      name: 'Message is the photo URL itself',
      modifier: (p, url) => { p.message = url; return p; }
    }
  ];

  for (const t of tests) {
    await testPayload(t.name, t.modifier);
  }
}

run().catch(console.error);
