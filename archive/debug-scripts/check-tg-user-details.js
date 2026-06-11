const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../..', 'apps/bot/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('tg_id', '7728573771')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('User details:', JSON.stringify(user, null, 2));
}

main().catch(console.error);
