const { sendTgButtons } = require('../apps/bot/dist/telegram/sender.js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../apps/bot/.env') });

async function testSend() {
  console.log('Sending message to user 7728573771...');
  
  await sendTgButtons(7728573771, '⚽ What would you like to do next?', [
    [{ id: 'predict', label: '🔮 Predict Another Match' }],
    [{ id: 'passport', label: '🪪 My Passport' }, { id: 'stats', label: '📊 My Stats' }],
    [{ id: 'leaderboard', label: '🏆 Leaderboard' }, { id: 'nations', label: '🌍 Nations' }],
    [{ id: 'referral', label: '🔗 Referral' }]
  ]);

  console.log('Done!');
}

testSend().catch(console.error);
