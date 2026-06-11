const { Telegraf, Markup } = require('telegraf');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../apps/bot/.env') });

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

async function testSend() {
  const buttons = [
    [{ id: 'predict', label: '🔮 Predict Another Match' }],
    [{ id: 'passport', label: '🪪 My Passport' }, { id: 'stats', label: '📊 My Stats' }],
    [{ id: 'leaderboard', label: '🏆 Leaderboard' }, { id: 'nations', label: '🌍 Nations' }],
    [{ id: 'referral', label: '🔗 Referral' }]
  ];

  let rows = [];
  if (buttons.length > 0 && Array.isArray(buttons[0])) {
    rows = buttons;
  } else {
    // 1D logic
  }

  const keyboard = Markup.inlineKeyboard(
    rows.map((row) =>
      row.map((b) => Markup.button.callback(b.label, b.id))
    )
  );

  console.log('Keyboard generated successfully:', JSON.stringify(keyboard, null, 2));
}

testSend().catch(console.error);
