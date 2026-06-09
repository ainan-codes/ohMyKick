import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('apps/bot/.env') });

import { supabase } from './db/client.js';
import { getUserByTgId } from './db/users.js';

async function run() {
  const tgId = 'test_user_999';
  const user = await getUserByTgId(tgId);
  if (!user) {
    console.error('Test user not found!');
    return;
  }

  console.log('--- Checking Final Test User Data ---');
  console.log(`User ID: ${user.id}`);
  console.log(`Passport Poster URL: ${user.passport_poster_url}`);

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id);

  if (predictions && predictions.length > 0) {
    for (const p of predictions) {
      console.log(`\nMatch ID: ${p.match_id}`);
      console.log(`Prematch Poster URL: ${p.prematch_poster_url}`);
      console.log(`Result Poster URL: ${p.result_poster_url}`);
    }
  } else {
    console.log('No predictions found.');
  }

  // List notification log RECAP entry
  const { data: recapLogs } = await supabase
    .from('notification_log')
    .select('*')
    .eq('user_id', user.id)
    .eq('notification_type', 'RECAP');

  console.log(`Recap Log:`, recapLogs);
}

run().catch(console.error);
