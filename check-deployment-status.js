const https = require('https');

async function checkEndpoint(url, description) {
    return new Promise((resolve) => {
        const request = https.get(url, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                console.log(`✅ ${description}: ${response.statusCode}`);
                if (response.statusCode === 200) {
                    try {
                        const parsed = JSON.parse(data);
                        console.log(`   Response: ${JSON.stringify(parsed, null, 2)}`);
                    } catch (e) {
                        console.log(`   Response: ${data.substring(0, 200)}...`);
                    }
                }
                resolve({ status: response.statusCode, data });
            });
        });
        
        request.on('error', (error) => {
            console.log(`❌ ${description}: ERROR - ${error.message}`);
            resolve({ status: 'ERROR', error: error.message });
        });
        
        request.setTimeout(10000, () => {
            console.log(`⏰ ${description}: TIMEOUT`);
            request.destroy();
            resolve({ status: 'TIMEOUT' });
        });
    });
}

async function checkDeploymentStatus() {
    console.log('\n🚀 CHECKING DEPLOYMENT STATUS...\n');
    
    // Check backend health
    await checkEndpoint('https://weddingbazaar-web.onrender.com/api/health', 'Backend Health');
    
    // Check if modular backend is deployed (profile endpoint should exist)
    await checkEndpoint('https://weddingbazaar-web.onrender.com/api/auth/profile', 'Modular Backend Profile Endpoint');
    
    // Check vendors endpoint
    await checkEndpoint('https://weddingbazaar-web.onrender.com/api/vendors/featured', 'Vendors Endpoint');
    
    console.log('\n✅ Deployment status check complete!\n');
}

checkDeploymentStatus().catch(console.error);
