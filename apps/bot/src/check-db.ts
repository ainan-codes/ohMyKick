import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('apps/bot/.env') });

import { supabase } from './db/client.js';

async function run() {
  console.log('Checking if friend_leagues table exists...');
  const { data: fl, error: flError } = await supabase.from('friend_leagues').select('*').limit(1);
  if (flError) {
    console.error('friend_leagues check failed:', flError.message);
  } else {
    console.log('friend_leagues table exists! Row count:', fl?.length);
  }

  console.log('Checking if global_leaderboard view exists...');
  const { data: gl, error: glError } = await supabase.from('global_leaderboard').select('*').limit(1);
  if (glError) {
    console.error('global_leaderboard view check failed:', glError.message);
  } else {
    console.log('global_leaderboard view exists! Row count:', gl?.length);
  }

  console.log('Checking if country_war_standings view exists...');
  const { data: cws, error: cwsError } = await supabase.from('country_war_standings').select('*').limit(1);
  if (cwsError) {
    console.error('country_war_standings view check failed:', cwsError.message);
  } else {
    console.log('country_war_standings view exists! Row count:', cws?.length);
  }

  console.log('Checking if user_achievements table exists...');
  const { data: ua, error: uaError } = await supabase.from('user_achievements').select('*').limit(1);
  if (uaError) {
    console.error('user_achievements check failed:', uaError.message);
  } else {
    console.log('user_achievements table exists! Row count:', ua?.length);
  }
}

run().catch(console.error);
