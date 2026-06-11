async function main() {
  const url = 'https://ohmykick.com/api/bot/message';
  const payload = {
    userId: '7728573771',
    channel: 'telegram',
    message: 'predict',
    timezone: 'Asia/Calcutta',
    sessionState: {
      conversationState: "IDLE",
      phoneNumber: "tg-7728573771",
      userName: "Ainan",
      countryCode: "GB_SCT",
      countryName: "Scotland",
      countryFlag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      referralCode: "6T2L8R",
      fanId: "GB_SCT-869652",
      passportVariant: 3,
      preferredLanguage: "en",
      invalidInputCount: 0,
      totalPredictions: 3,
      correctPredictions: 0,
      totalPoints: 0,
      referralCount: 0
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'manual',
    });
    console.log('Status Code:', res.status);
    console.log('Headers:');
    for (const [key, value] of res.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    const text = await res.text();
    console.log('Response body:', text.substring(0, 1000));
  } catch (err) {
    console.error('Error:', err.message);
  }
}
main();
