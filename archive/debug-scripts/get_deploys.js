const https = require('https');

const apiKey = 'rnd_ql2tqzRWFitr75YDk1GDjtwJZctN';
const serviceId = 'srv-d8k61vl7vvec73a3bddg';

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

async function main() {
  try {
    const res = await customFetch(`https://api.render.com/v1/services/${serviceId}/deploys?limit=5`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    const data = await res.json();
    console.log('Deployments:');
    data.forEach(d => {
      console.log(`- ID: ${d.deploy.id}, status: ${d.deploy.status}, commit: ${d.deploy.commit?.id.substring(0, 7) || 'N/A'}, message: "${d.deploy.commit?.message || ''}", triggeredBy: ${d.deploy.triggeredBy}, createdAt: ${d.deploy.createdAt}`);
    });
  } catch (err) {
    console.error('Error fetching deploys:', err.message);
  }
}
main();
