import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../apps/bot/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in env.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MOCK_FIXTURES = [
  {
    api_match_id: 1001,
    home_team: 'Argentina',
    away_team: 'Poland',
    home_country_code: 'AR',
    away_country_code: 'PL',
    home_flag_emoji: '🇦🇷',
    away_flag_emoji: '🇵🇱',
    kickoff_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Starts in 2 hours
    kickoff_local_ist: '9:00 PM IST',
    stage: 'GROUP_C',
    venue: 'Lusail Stadium',
    status: 'SCHEDULED',
    prediction_open: true
  },
  {
    api_match_id: 1002,
    home_team: 'France',
    away_team: 'Denmark',
    home_country_code: 'FR',
    away_country_code: 'DK',
    home_flag_emoji: '🇫🇷',
    away_flag_emoji: '🇩🇰',
    kickoff_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // Starts in 5 hours
    kickoff_local_ist: '11:30 PM IST',
    stage: 'GROUP_D',
    venue: 'Stadium 974',
    status: 'SCHEDULED',
    prediction_open: true
  },
  {
    api_match_id: 1003,
    home_team: 'Brazil',
    away_team: 'Cameroon',
    home_country_code: 'BR',
    away_country_code: 'CM',
    home_flag_emoji: '🇧🇷',
    away_flag_emoji: '🇨🇲',
    kickoff_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // Started 3 hours ago
    kickoff_local_ist: '6:30 PM IST',
    stage: 'GROUP_G',
    venue: 'Lusail Stadium',
    status: 'LIVE',
    prediction_open: false
  },
  {
    api_match_id: 1004,
    home_team: 'USA',
    away_team: 'England',
    home_country_code: 'US',
    away_country_code: 'GB_ENG',
    home_flag_emoji: '🇺🇸',
    away_flag_emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    kickoff_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Finished yesterday
    kickoff_local_ist: '9:00 PM IST',
    stage: 'GROUP_B',
    venue: 'Al Bayt Stadium',
    status: 'FINISHED',
    home_score: 1,
    away_score: 1,
    prediction_open: false
  },
  {
    api_match_id: 1005,
    home_team: 'Germany',
    away_team: 'Spain',
    home_country_code: 'DE',
    away_country_code: 'ES',
    home_flag_emoji: '🇩🇪',
    away_flag_emoji: '🇪🇸',
    kickoff_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Starts tomorrow
    kickoff_local_ist: '9:00 PM IST',
    stage: 'GROUP_E',
    venue: 'Al Bayt Stadium',
    status: 'SCHEDULED',
    prediction_open: true
  }
];

async function seed() {
  console.log('Seeding mock World Cup 2026 fixtures into database...');
  for (const fixture of MOCK_FIXTURES) {
    const { error } = await supabase
      .from('matches')
      .upsert(fixture, { onConflict: 'api_match_id' });

    if (error) {
      console.error(`Error upserting match ${fixture.home_team} vs ${fixture.away_team}:`, error.message);
    } else {
      console.log(`Successfully seeded: ${fixture.home_team} vs ${fixture.away_team} (${fixture.status})`);
    }
  }
  console.log('Seeding complete.');
}

seed().catch(err => {
  console.error('Unhandled seeding error:', err);
  process.exit(1);
});
