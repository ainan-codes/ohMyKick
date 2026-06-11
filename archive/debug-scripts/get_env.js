const apiKey = 'rnd_ql2tqzRWFitr75YDk1GDjtwJZctN';
const serviceId = 'srv-d8k61vl7vvec73a3bddg';
const headers = {
  Authorization: `Bearer ${apiKey}`,
  Accept: 'application/json',
};

async function main() {
  try {
    const url = `https://api.render.com/v1/services/${serviceId}/env-vars`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    const envVars = await res.json();
    console.log('Environment Variables:');
    envVars.forEach(v => {
      // Don't print sensitive secrets fully, but show keys and values for routing flags
      const isSensitive = ['KEY', 'TOKEN', 'SECRET', 'PASSWORD'].some(s => v.envVar.key.toUpperCase().includes(s));
      const val = isSensitive ? `${v.envVar.value.substring(0, 5)}...` : v.envVar.value;
      console.log(`- ${v.envVar.key}=${val}`);
    });
  } catch (err) {
    console.error('Error fetching env variables:', err.message);
  }
}
main();
