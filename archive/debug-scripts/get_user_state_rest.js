const fs = require('fs');
const path = require('path');

const envPath = 'c:\\Users\\MY PC\\OneDrive\\Desktop\\projects\\ohMyKick\\apps\\bot\\.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

async function main() {
  const supabaseUrl = env['SUPABASE_URL'];
  const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];
  const tgId = '7728573771';

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found in env');
    return;
  }

  const url = `${supabaseUrl}/rest/v1/users?tg_id=eq.${tgId}&select=*`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'application/json',
      }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    console.log('User Record:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error fetching user from Supabase:', err.message);
  }
}
main();
