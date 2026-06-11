async function main() {
  const url = 'https://www.ohmykick.com/api/bot/message';
  const payload = {
    userId: '7728573771',
    channel: 'telegram',
    message: 'predict',
    timezone: 'Asia/Calcutta',
    sessionState: {},
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
  } catch (err) {
    console.error('Error:', err.message);
  }
}
main();
