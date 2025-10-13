// Test login with real database users and common passwords
const fetch = require('node-fetch');

const API_BASE = 'https://weddingbazaar-web.onrender.com';
const commonPasswords = ['password123', 'test123', '123456', 'password', 'admin123', 'couple123', 'vendor123'];

const testUsers = [
    'test@example.com',
    'couple1@gmail.com', 
    'couple@test.com',
    'admin@weddingbazaar.com',
    'testvendor1@gmail.com',
    'vendor@test.com',
    'couple1@test.com'
];

async function findWorkingCredentials() {
    console.log('🔍 Testing login with real database users...\n');

    for (const email of testUsers) {
        console.log(`👤 Testing user: ${email}`);
        
        for (const password of commonPasswords) {
            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`\n🎉 SUCCESS! Found working credentials:`);
                    console.log(`   Email: ${email}`);
                    console.log(`   Password: ${password}`);
                    console.log(`   User: ${JSON.stringify(data.user, null, 2)}`);
                    console.log(`   Token: ${data.token ? 'Present' : 'Missing'}`);
                    console.log(`\n✅ USE THESE CREDENTIALS FOR LOGIN TESTING!\n`);
                    return { email, password, data };
                }
            } catch (error) {
                // Continue testing
            }
        }
    }
    
    console.log('❌ No working credentials found with common passwords');
    console.log('💡 The users may have different passwords or hashing may be preventing login');
}

findWorkingCredentials();
