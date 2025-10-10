const https = require('https');

console.log('Testing backend health endpoint...');

https.get('https://weddingbazaar-web.onrender.com/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Backend version:', response.version);
      console.log('Backend status:', response.status);
      console.log('Environment:', response.environment);
      
      if (response.version === '2.2.0-production-service-crud-complete') {
        console.log('✅ Backend updated successfully!');
      } else {
        console.log('❌ Backend still using old version:', response.version);
      }
      
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
