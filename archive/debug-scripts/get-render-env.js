const RENDER_KEY = 'rnd_ql2tqzRWFitr75YDk1GDjtwJZctN';
const SERVICE_ID = 'srv-d8k61vl7vvec73a3bddg';

async function main() {
  const getUrl = `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`;
  const res = await fetch(getUrl, {
    headers: {
      'Authorization': `Bearer ${RENDER_KEY}`,
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.statusText}`);
  }

  const data = await res.json();
  data.forEach(item => {
    console.log(`${item.envVar.key}=${item.envVar.value}`);
  });
}

main().catch(console.error);
