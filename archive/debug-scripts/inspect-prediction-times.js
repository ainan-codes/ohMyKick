const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../..', 'apps/bot/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: pred, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('id', 'ac282bab-423c-4a18-bba2-f5b7de2175da')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Prediction Details:');
  console.log(JSON.stringify(pred, null, 2));
}

main().catch(console.error);
