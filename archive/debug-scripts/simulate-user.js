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

  // 6. User should now be fully onboarded. Let's test menus and other keyword commands
  console.log('\n======================================');
  console.log('Testing Menu and Flows post-onboarding');
  console.log('======================================');

  // Let's test "predict" command
  console.log('\n--- FLOW: predict ---');
  let resPredict = await sendMsg(userId, 'predict', state);
  let statePredict = resPredict.sessionState || {};

  // If a match prediction selection is returned, let's look at the response and try to make a prediction.
  if (resPredict.messages && resPredict.messages[0] && resPredict.messages[0].type === 'buttons') {
    const winnerChoice = resPredict.messages[0].buttons[0].id; // TEAM1
    console.log(`\n--- FLOW: predict winner selection -> sending ${winnerChoice} ---`);
    let resWinner = await sendMsg(userId, winnerChoice, statePredict);
    let stateWinner = resWinner.sessionState || {};

    // It should then ask for score input. Let's send a score like "2-1".
    console.log(`\n--- FLOW: predict score selection -> sending 2-1 ---`);
    let resScore = await sendMsg(userId, '2-1', stateWinner);
    let stateScore = resScore.sessionState || {};
  } else if (resPredict.messages && resPredict.messages[0] && resPredict.messages[0].type === 'list') {
    // If it's a list, choose the first list item ID
    const matchChoice = resPredict.messages[0].listItems[0].id;
    console.log(`\n--- FLOW: predict match selection -> sending ${matchChoice} ---`);
    let resMatch = await sendMsg(userId, matchChoice, statePredict);
    let stateMatch = resMatch.sessionState || {};

    if (resMatch.messages && resMatch.messages[0] && resMatch.messages[0].type === 'buttons') {
      const winnerChoice = resMatch.messages[0].buttons[0].id;
      console.log(`\n--- FLOW: predict winner selection -> sending ${winnerChoice} ---`);
      let resWinner = await sendMsg(userId, winnerChoice, stateMatch);
      let stateWinner = resWinner.sessionState || {};

      console.log(`\n--- FLOW: predict score selection -> sending 2-1 ---`);
      let resScore = await sendMsg(userId, '2-1', stateWinner);
      let stateScore = resScore.sessionState || {};
    }
  }

  // Let's test "passport" command
  console.log('\n--- FLOW: passport ---');
  let resPassport = await sendMsg(userId, 'passport', state);
  let statePassport = resPassport.sessionState || {};

  // Let's test "achievements" command
  console.log('\n--- FLOW: achievements ---');
  let resAch = await sendMsg(userId, 'achievements', state);

  // Let's test "referral" command
  console.log('\n--- FLOW: referral ---');
  let resRef = await sendMsg(userId, 'referral', state);

  // Let's test "leaderboard" command
  console.log('\n--- FLOW: leaderboard ---');
  let resLdr = await sendMsg(userId, 'leaderboard', state);

  // Let's test "help" command
  console.log('\n--- FLOW: help ---');
  let resHelp = await sendMsg(userId, 'help', state);
}

run().catch(console.error);
