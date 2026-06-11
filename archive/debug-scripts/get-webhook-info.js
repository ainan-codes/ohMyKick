const https = require('https');
const token = '8663907349:AAGr-mLaOt9u2ZF6ve8lTVB63F6yZ_6v-yY';

function customFetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      });
    }).on('error', reject);
  });
}

async function main() {
  const info = await customFetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  console.log('Webhook Info:', JSON.stringify(info, null, 2));
}

main().catch(console.error);
