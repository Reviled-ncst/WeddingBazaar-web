const https = require('https');

const options = {
    hostname: 'weddingbazaar-web.onrender.com',
    port: 443,
    path: '/api/debug/vendors',
    method: 'GET'
};

console.log('🔍 Checking vendors table content...');

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log('\n📋 Response:', JSON.stringify(parsed, null, 2));
            
            if (parsed.vendors && parsed.vendors.length > 0) {
                console.log('\n✅ Found vendors with IDs:');
                parsed.vendors.forEach(v => {
                    console.log(`- ID: "${v.id}", Name: "${v.name}", Category: "${v.category}"`);
                });
            } else {
                console.log('\n❌ No vendors found in database');
            }
        } catch (e) {
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (err) => {
    console.error('Error:', err.message);
});

req.end();
