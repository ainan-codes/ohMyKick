const apiKey = 'rnd_ql2tqzRWFitr75YDk1GDjtwJZctN';
const serviceId = 'srv-d8k61vl7vvec73a3bddg';
const ownerId = 'tea-d8k5nim47okc73bv8e3g';
const headers = {
  Authorization: `Bearer ${apiKey}`,
  Accept: 'application/json',
};

async function main() {
  try {
    const url = `https://api.render.com/v1/logs?ownerId=${ownerId}&resource=${serviceId}&limit=50&direction=backward`;
    console.log('Fetching logs from URL:', url);
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    const data = await res.json();
    console.log('Logs count:', data.logs ? data.logs.length : 0);
    if (data.logs && data.logs.length > 0) {
      // Print in chronological order
      data.logs.reverse().forEach(l => {
        console.log(`[${l.timestamp}] ${l.message}`);
      });
    } else {
      console.log('No logs found.');
    }
  } catch (err) {
    console.error('Error fetching logs:', err.message);
  }
}
main();
