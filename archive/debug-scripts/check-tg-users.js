const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../..', 'apps/bot/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('Resolved path:', path.join(__dirname, '../../..', 'apps/bot/.env'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .not('tg_id', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log('Recent Telegram Users:');
  users.forEach(u => {
    console.log(`ID: ${u.id}, Name: ${u.name}, tg_id: ${u.tg_id}, State: ${u.conversation_state}`);
  });
}

main().catch(console.error);
