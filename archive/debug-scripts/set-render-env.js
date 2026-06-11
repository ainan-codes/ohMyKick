const https = require('https');

const RENDER_KEY = 'rnd_ql2tqzRWFitr75YDk1GDjtwJZctN';
const SERVICE_ID = 'srv-d8k61vl7vvec73a3bddg';

function customFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const headers = options.headers || {};
    const reqOptions = {
      method: options.method || 'GET',
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      headers: headers,
      timeout: 15000,
    };

    const req = https.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const rawBuffer = Buffer.concat(chunks);
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(rawBuffer.toString('utf8'))),
          text: () => Promise.resolve(rawBuffer.toString('utf8')),
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function update() {
  const getUrl = `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`;
  console.log('Fetching env vars from Render...');
  
  const res = await customFetch(getUrl, {
    headers: {
      'Authorization': `Bearer ${RENDER_KEY}`,
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`);
  }

  const data = await res.json();
  console.log('Fetched env vars list size:', data.length);

  // Map variables
  let found = false;
  const updatedVars = data.map(item => {
    if (item.envVar.key === 'USE_OHMYKICK_API') {
      found = true;
      console.log(`Updating USE_OHMYKICK_API from "${item.envVar.value}" to "true"`);
      return {
        key: 'USE_OHMYKICK_API',
        value: 'true'
      };
    }
    return {
      key: item.envVar.key,
      value: item.envVar.value
    };
  });

  // If not found, add it
  if (!found) {
    console.log('Adding new environment variable USE_OHMYKICK_API = "true"');
    updatedVars.push({
      key: 'USE_OHMYKICK_API',
      value: 'true'
    });
  }

  console.log('Sending PUT to update env vars...');
  const putRes = await customFetch(getUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${RENDER_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(updatedVars)
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`PUT failed: ${putRes.status} - ${errText}`);
  }

  console.log('Environment variables updated successfully on Render!');
}

update().catch(console.error);
