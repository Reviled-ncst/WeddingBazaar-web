const https = require('https');

const options = {
    hostname: 'weddingbazaar-web.onrender.com',
    port: 443,
    path: '/api/vendors/featured',
    method: 'GET'
};

console.log('🔍 Fetching existing vendors to get valid vendor IDs...');

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.success && parsed.vendors) {
                console.log('\n📋 Available vendors:');
                parsed.vendors.forEach((vendor, index) => {
                    console.log(`${index + 1}. ID: ${vendor.id}, Name: ${vendor.name}, Category: ${vendor.category}`);
                });
                
                if (parsed.vendors.length > 0) {
                    console.log(`\n✅ Use vendor ID: ${parsed.vendors[0].id} for testing`);
                }
            } else {
                console.log('No vendors found or error:', parsed);
            }
        } catch (e) {
            console.log('Response:', data);
        }
    });
});

req.on('error', (err) => {
    console.error('Error:', err.message);
});

req.end();
