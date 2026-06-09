import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('apps/bot/.env') });

import { supabase } from './db/client.js';

async function run() {
  console.log('--- Wiping All User Data & Storage ---');

  // 1. Delete DB tables content (in order of foreign key dependencies)
  console.log('Truncating friend_league_members...');
  const { error: flmError } = await supabase.from('friend_league_members').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
  if (flmError) console.error('Error truncating friend_league_members:', flmError.message);

  console.log('Truncating friend_leagues...');
  const { error: flError } = await supabase.from('friend_leagues').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (flError) console.error('Error truncating friend_leagues:', flError.message);

  console.log('Truncating predictions...');
  const { error: predError } = await supabase.from('predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (predError) console.error('Error truncating predictions:', predError.message);

  console.log('Truncating notification_log...');
  const { error: notifError } = await supabase.from('notification_log').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (notifError) console.error('Error truncating notification_log:', notifError.message);

  console.log('Truncating users...');
  const { error: usersError } = await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (usersError) console.error('Error truncating users:', usersError.message);

  // 2. Delete Storage objects
  for (const bucketName of ['posters', 'photos']) {
    console.log(`Cleaning bucket '${bucketName}'...`);
    const { data: files, error: listError } = await supabase.storage.from(bucketName).list();
    if (listError) {
      console.error(`Error listing bucket ${bucketName}:`, listError.message);
      continue;
    }

    if (files && files.length > 0) {
      const fileNames = files.map(f => f.name);
      console.log(`Deleting files: ${fileNames.join(', ')}`);
      const { error: deleteError } = await supabase.storage.from(bucketName).remove(fileNames);
      if (deleteError) {
        console.error(`Error deleting files in ${bucketName}:`, deleteError.message);
      }
    } else {
      console.log(`No files found in bucket '${bucketName}'.`);
    }

    // Check folders like 'passport', 'prematch', 'result', 'achievement', 'recap' inside posters
    const subfolders = ['passport', 'prematch', 'result', 'achievement', 'recap'];
    for (const folder of subfolders) {
      const { data: subFiles, error: listSubError } = await supabase.storage.from(bucketName).list(folder);
      if (!listSubError && subFiles && subFiles.length > 0) {
        const subFilePaths = subFiles.map(f => `${folder}/${f.name}`);
        console.log(`Deleting folder files: ${subFilePaths.join(', ')}`);
        await supabase.storage.from(bucketName).remove(subFilePaths);
      }
    }
  }

  console.log('--- Wipe completed successfully! ---');
}

run().catch(console.error);
