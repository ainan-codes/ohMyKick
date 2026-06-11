const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '..', 'apps/bot/.env') });

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;
const API_FOOTBALL_HOST = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io';

if (!API_FOOTBALL_KEY) {
  console.error('API_FOOTBALL_KEY must be set in env');
  process.exit(1);
}

async function main() {
  const url = `https://${API_FOOTBALL_HOST}/fixtures?id=101`;
  console.log('Querying:', url);

  try {
    const res = await axios.get(url, {
      headers: {
        'x-apisports-key': API_FOOTBALL_KEY
      }
    });

    console.log('Response status:', res.status);
    console.log('Response response field:', JSON.stringify(res.data.response, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().catch(console.error);
