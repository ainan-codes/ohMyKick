const API_URL = 'https://www.ohmykick.com/api/bot/message';

async function run() {
  const userId = `+919991831313`; // Same userId from the log
  const state = {
    "conversationState": "PREDICTION_MATCH_SELECT",
    "userName": "Lionel Messi",
    "countryCode": "AR",
    "countryName": "Argentina",
    "countryFlag": "🇦🇷",
    "referralCode": "J3W533",
    "fanId": "AR-530226",
    "passportVariant": 4,
    "totalPredictions": 0,
    "correctPredictions": 0,
    "totalPoints": 0,
    "referralCount": 0,
    "preferredLanguage": "en"
  };

  const payload = {
    userId,
    channel: 'telegram',
    message: 'G001',
    timezone: 'Asia/Calcutta',
    sessionState: state
  };

  console.log('Sending G001 payload...');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

run();
