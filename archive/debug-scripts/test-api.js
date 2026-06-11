async function run() {
  const url = 'https://www.ohmykick.com/api/bot/message';
  const payload = {
    userId: "+919999999999",
    channel: "telegram",
    message: "predict",
    timezone: "Asia/Calcutta",
    sessionState: {
      conversationState: "IDLE",
      phoneNumber: "+919999999999",
      userName: "Test User",
      countryCode: "IN"
    }
  };

  console.log('Sending request to:', url);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('HTTP Status Code:', response.status);
    console.log('Response Headers:');
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });

    const text = await response.text();
    console.log('Response Body text length:', text.length);
    try {
      const json = JSON.parse(text);
      console.log('Response Body JSON:', JSON.stringify(json, null, 2));
    } catch {
      console.log('Response Body Raw:', text);
    }
  } catch (err) {
    console.error('Error encountered:', err);
  }
}

run();
