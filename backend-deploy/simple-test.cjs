console.log('Testing new backend...');

const https = require('https');

https.get('https://weddingbazaar-web.onrender.com/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response received:', data);
    try {
      const json = JSON.parse(data);
      console.log('Version:', json.version);
      console.log('Status:', json.status);
    } catch (e) {
      console.log('Not JSON response');
    }
  });
}).on('error', err => console.error('Error:', err.message));
