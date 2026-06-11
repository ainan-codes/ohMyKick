const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../..', 'apps/bot/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: false });

  if (error) {
    console.error('Error fetching matches:', error);
    return;
  }

  console.log('Matches in DB:');
  matches.forEach(m => {
    console.log(`ID: ${m.id}, API ID: ${m.api_match_id}, Match: ${m.home_team} vs ${m.away_team}, Status: ${m.status}, Score: ${m.home_score}-${m.away_score}, PredictionOpen: ${m.prediction_open}`);
  });
}

main().catch(console.error);
