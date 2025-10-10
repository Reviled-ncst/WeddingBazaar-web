const https = require('https');

async function testAuthEndpoint(endpoint, method = 'GET', data = null) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'weddingbazaar-web.onrender.com',
            port: 443,
            path: endpoint,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log(`\n🔍 Testing ${method} ${endpoint}...`);

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                if (res.statusCode !== 404) {
                    console.log(`Response: ${responseData}`);
                }
                resolve({ 
                    endpoint, 
                    status: res.statusCode, 
                    exists: res.statusCode !== 404,
                    response: responseData 
                });
            });
        });

        req.on('error', (err) => {
            console.log(`❌ Error: ${err.message}`);
            resolve({ endpoint, status: 'error', exists: false });
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function checkDeployment() {
    console.log('🚨 CHECKING IF AUTHENTICATION WAS ACTUALLY DEPLOYED...\n');
    
    // Test auth endpoints
    await testAuthEndpoint('/api/auth/login', 'POST', { email: 'test', password: 'test' });
    await testAuthEndpoint('/api/auth/register', 'POST', { email: 'test', password: 'test', name: 'test' });
    await testAuthEndpoint('/api/auth/verify', 'POST');
    await testAuthEndpoint('/api/setup/database');
    
    console.log('\n📊 DEPLOYMENT STATUS:');
    console.log('If all endpoints return 404, the deployment did NOT go through');
    console.log('If endpoints exist but return errors, deployment worked but there are issues');
}

checkDeployment();
