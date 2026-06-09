import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('apps/bot/.env') });

import { supabase } from './db/client.js';
import { createUser, getUserByTgId, getUserStats } from './db/users.js';
import { processMessage } from './state-machine/index.js';
import { processMatchResult } from './pipeline/results.js';
import { handleRecapRequest } from './flows/recap.js';

// Wait utility to let async operations (like poster generation bypass) complete
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('=== Starting Bot Integration & Poster Verification Test ===');

  console.log('Warming up Next.js poster API endpoints...');
  const posterServiceUrl = process.env.POSTER_SERVICE_URL ?? 'http://localhost:3001';
  try {
    await Promise.allSettled([
      fetch(`${posterServiceUrl}/api/posters/passport`),
      fetch(`${posterServiceUrl}/api/posters/prematch`),
      fetch(`${posterServiceUrl}/api/posters/result`),
      fetch(`${posterServiceUrl}/api/posters/achievement`),
      fetch(`${posterServiceUrl}/api/posters/recap`),
    ]);
    console.log('Warm-up requests sent.');
  } catch (err: any) {
    console.warn('Warm-up failed:', err.message);
  }

  const tgId = 'test_user_999';

  // Cleanup old test user if any
  let user = await getUserByTgId(tgId);
  if (user) {
    console.log(`Cleaning up old test user ${user.id}...`);
    await supabase.from('predictions').delete().eq('user_id', user.id);
    await supabase.from('notification_log').delete().eq('user_id', user.id);
    await supabase.from('users').delete().eq('id', user.id);
  }

  // 1. Onboarding
  console.log('\n--- 1. Simulating Onboarding ---');
  user = await createUser({
    tg_id: tgId,
    name: 'Placeholder',
    country_code: 'XX',
    country_name: 'Unknown',
    country_flag_emoji: '🌍',
  });

  if (!user) {
    throw new Error('Failed to create test user');
  }

  console.log(`Created user: ${user.name} (Fan ID: ${user.fan_id})`);

  // Step 1.1: Submit name 'Alice'
  console.log('Submitting name "Alice"...');
  user = (await getUserByTgId(tgId))!;
  const nameRes = await processMessage(user, { type: 'text', text: 'Alice' }, 'tg');
  console.log('Name response text:', (nameRes.messages[0] as any)?.text);
  
  // Step 1.2: Select country 'AR' (Argentina)
  console.log('Selecting country "AR" (Argentina)...');
  user = (await getUserByTgId(tgId))!;
  const countryRes = await processMessage(user, { type: 'button_reply', text: 'country_AR' }, 'tg');
  console.log('Country response text:', (countryRes.messages[0] as any)?.text);

  // Step 1.3: Skip photo
  console.log('Skipping photo upload...');
  user = (await getUserByTgId(tgId))!;
  const photoRes = await processMessage(user, { type: 'button_reply', text: 'photo_skip' }, 'tg');
  console.log('Photo response text:', (photoRes.messages[0] as any)?.text);

  // Wait for passport poster generation to finish
  console.log('Waiting 15 seconds for passport generation bypass...');
  await wait(15000);

  // Check user record
  user = (await getUserByTgId(tgId))!;
  console.log('Generated Passport Poster URL:', user?.passport_poster_url);
  if (!user?.passport_poster_url) {
    console.error('❌ Passport poster URL not set on user!');
  } else {
    console.log('✅ Passport poster generated successfully!');
  }

  // 2. Fetch matches & predict
  console.log('\n--- 2. Predicting a match ---');
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('home_team', 'Germany')
    .eq('away_team', 'Spain')
    .single();

  if (!matches) {
    throw new Error('Germany vs Spain match not found. Did you run npm run seed-matches?');
  }

  console.log(`Predicting match: ${matches.home_team} vs ${matches.away_team}`);

  // Flow step 1: Start prediction flow
  user = (await getUserByTgId(tgId))!;
  const predFlow1 = await processMessage(user, { type: 'text', text: 'predict' }, 'tg');
  console.log('Pred Flow 1 (Select Match) text:', (predFlow1.messages[0] as any)?.text);

  // Flow step 2: Select Germany vs Spain
  user = (await getUserByTgId(tgId))!;
  const predFlow2 = await processMessage(user, { type: 'button_reply', text: `match_${matches.id}` }, 'tg');
  console.log('Pred Flow 2 (Select Winner) text:', (predFlow2.messages[0] as any)?.text);

  // Flow step 3: Select Germany (HOME)
  user = (await getUserByTgId(tgId))!;
  const predFlow3 = await processMessage(user, { type: 'button_reply', text: 'winner_home' }, 'tg');
  console.log('Pred Flow 3 (Enter Score Prompt) text:', (predFlow3.messages[0] as any)?.text);

  // Flow step 4: Enter score '3 - 0'
  user = (await getUserByTgId(tgId))!;
  const predFlow4 = await processMessage(user, { type: 'text', text: '3 - 0' }, 'tg');
  console.log('Pred Flow 4 (First Goal Scorer Prompt) text:', (predFlow4.messages[0] as any)?.text);

  // Flow step 5: Enter first goal scorer 'Thomas Muller'
  user = (await getUserByTgId(tgId))!;
  const predFlow5 = await processMessage(user, { type: 'text', text: 'Thomas Muller' }, 'tg');
  console.log('Pred Flow 5 (Success/Prematch Poster) text:', (predFlow5.messages[0] as any)?.text);

  // Wait for prematch poster generation to finish
  console.log('Waiting 15 seconds for prematch poster generation...');
  await wait(15000);

  // Retrieve prediction record
  const { data: prediction } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .eq('match_id', matches.id)
    .single();

  console.log('Generated Prematch Poster URL:', prediction?.prematch_poster_url);
  if (!prediction?.prematch_poster_url) {
    console.error('❌ Prematch poster URL not set on prediction!');
  } else {
    console.log('✅ Prematch poster generated successfully!');
  }

  // 3. Settle match (triggering results, streaks, achievements, and result poster)
  console.log('\n--- 3. Settling Match ---');
  console.log('Settling match as 3-0 with Thomas Muller as first goal scorer...');
  await processMatchResult(matches.id, 3, 0, 'Thomas Muller');

  // Wait for result/achievement poster generation
  console.log('Waiting 40 seconds for result and achievement poster generation...');
  await wait(40000);

  // Check prediction result
  const { data: predictionAfterSettle } = await supabase
    .from('predictions')
    .select('*')
    .eq('id', prediction?.id)
    .single();

  console.log('Settle result type:', predictionAfterSettle?.result_type);
  console.log('Points earned:', predictionAfterSettle?.points_earned);
  console.log('Generated Result Poster URL:', predictionAfterSettle?.result_poster_url);

  if (predictionAfterSettle?.result_type !== 'PERFECT') {
    console.error('❌ Prediction not settled as PERFECT!');
  } else {
    console.log('✅ Prediction settled as PERFECT correctly!');
  }

  if (!predictionAfterSettle?.result_poster_url) {
    console.error('❌ Result poster URL not set!');
  } else {
    console.log('✅ Result poster generated successfully!');
  }

  // Check achievements
  const { data: achievementLogs } = await supabase
    .from('notification_log')
    .select('*')
    .eq('user_id', user.id)
    .like('notification_type', 'ACHIEVEMENT_%');

  console.log(`Achievements awarded: ${achievementLogs?.map(a => a.notification_type).join(', ')}`);
  if (!achievementLogs || achievementLogs.length === 0) {
    console.error('❌ No achievements awarded!');
  } else {
    console.log('✅ Achievements checked and awarded successfully!');
  }

  // 4. Request recap card
  console.log('\n--- 4. Requesting Recap Card ---');
  user = (await getUserByTgId(tgId))!;
  const recapRes = await handleRecapRequest(user);
  console.log('Recap request response text:', (recapRes.messages[0] as any)?.text);

  // Wait for recap poster generation
  console.log('Waiting 20 seconds for recap poster generation...');
  await wait(20000);

  const { data: recapLogs } = await supabase
    .from('notification_log')
    .select('*')
    .eq('user_id', user.id)
    .eq('notification_type', 'RECAP');

  if (!recapLogs || recapLogs.length === 0) {
    console.error('❌ Recap notification not logged!');
  } else {
    console.log('✅ Recap card requested and logged successfully!');
  }

  console.log('\n=== Verification Test Completed! ===');
  process.exit(0);
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
