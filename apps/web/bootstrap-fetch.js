const https = require('https');
const http = require('http');

console.log('[Bootstrap] Overriding global.fetch with native http/https fetch...');

global.fetch = function(url, options = {}) {
  const urlString = typeof url === 'string' ? url : url.toString();
  if (!urlString.startsWith('https://') && !urlString.startsWith('http://')) {
    return Promise.reject(new TypeError('Unsupported protocol'));
  }
  
  return new Promise((resolve, reject) => {
    const urlObj = new URL(urlString);
    const headers = {};
    if (options.headers) {
      if (typeof options.headers.forEach === 'function') {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }
    
    const reqOptions = {
      method: options.method || 'GET',
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      headers: headers,
      timeout: 15000
    };
    
    const lib = urlObj.protocol === 'https:' ? https : http;
    const req = lib.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const rawBuffer = Buffer.concat(chunks);
        resolve({
          ok: res.statusCode && res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode || 200,
          statusText: res.statusMessage || '',
          text: () => Promise.resolve(rawBuffer.toString('utf8')),
          json: () => {
            try {
              return Promise.resolve(JSON.parse(rawBuffer.toString('utf8')));
            } catch (err) {
              return Promise.reject(err);
            }
          },
          arrayBuffer: () => {
            const ab = rawBuffer.buffer.slice(rawBuffer.byteOffset, rawBuffer.byteOffset + rawBuffer.byteLength);
            return Promise.resolve(ab);
          },
          headers: {
            get: (name) => {
              const val = res.headers[name.toLowerCase()];
              return Array.isArray(val) ? val.join(', ') : val || null;
            }
          }
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timeout in custom fetch'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
};
