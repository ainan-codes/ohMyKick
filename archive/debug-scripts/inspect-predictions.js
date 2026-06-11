const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../..', 'apps/bot/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const matchId = '53e2c3da-051f-4676-846f-7f424e871877'; // Mexico vs South Africa
  const { data: predictions, error } = await supabase
    .from('predictions')
    .select('*, users(name, tg_id)')
    .eq('match_id', matchId);

  if (error) {
    console.error('Error fetching predictions:', error);
    return;
  }

  console.log('Predictions for Mexico vs South Africa:');
  predictions.forEach(p => {
    console.log(`ID: ${p.id}, User: ${p.users?.name} (TG: ${p.users?.tg_id}), Winner Picked: ${p.predicted_winner}, Score Picked: ${p.predicted_home_score}-${p.predicted_away_score}, Points Earned: ${p.points_earned}, Result Type: ${p.result_type}, IsLocked: ${p.is_locked}`);
  });
}

main().catch(console.error);
