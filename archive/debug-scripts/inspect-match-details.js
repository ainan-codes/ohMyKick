const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../..', 'apps/bot/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: match, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', '53e2c3da-051f-4676-846f-7f424e871877')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Match Details:');
  console.log(JSON.stringify(match, null, 2));
}

main().catch(console.error);
