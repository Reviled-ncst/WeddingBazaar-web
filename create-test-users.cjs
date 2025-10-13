// Create test users directly in the production database
const fetch = require('node-fetch');

const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function createTestUsersDirectly() {
    console.log('🔧 Creating test users directly in the database...\n');

    try {
        // Check if we can create users using any existing endpoint
        console.log('1️⃣ Checking if we can create users via API...');
        
        // Test if there's a working registration endpoint or user creation method
        const testUsers = [
            {
                email: 'couples@weddingbazaar.com',
                password: '123456',
                first_name: 'Wedding',
                last_name: 'Couple',
                user_type: 'couple'
            },
            {
                email: 'vendor@weddingbazaar.com', 
                password: '123456',
                first_name: 'Wedding',
                last_name: 'Vendor',
                user_type: 'vendor'
            },
            {
                email: 'test@example.com',
                password: 'password123',
                first_name: 'Test',
                last_name: 'User',
                user_type: 'couple'
            }
        ];

        // Try different endpoints that might create users
        const creationEndpoints = [
            '/api/auth/register',
            '/api/users/create',
            '/api/admin/users',
            '/api/debug/create-user'
        ];

        for (const user of testUsers) {
            console.log(`\n👤 Attempting to create user: ${user.email}`);
            
            for (const endpoint of creationEndpoints) {
                try {
                    console.log(`  📡 Trying: ${endpoint}`);
                    
                    const response = await fetch(`${API_BASE}${endpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(user)
                    });

                    console.log(`  📊 Response: ${response.status}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log(`  ✅ SUCCESS: User created via ${endpoint}`);
                        console.log(`  👤 User data:`, data);
                        break; // Move to next user
                    } else if (response.status === 501) {
                        console.log(`  ⚠️ Not implemented: ${endpoint}`);
                        continue; // Try next endpoint
                    } else {
                        const errorText = await response.text();
                        console.log(`  ❌ Failed: ${errorText}`);
                    }
                } catch (error) {
                    console.log(`  ❌ Error: ${error.message}`);
                }
            }
        }

        // Now test login with the created users
        console.log('\n\n2️⃣ Testing login with potentially created users...');
        
        for (const user of testUsers) {
            console.log(`\n🔐 Testing login: ${user.email}`);
            
            try {
                const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        password: user.password
                    })
                });

                console.log(`📡 Login status: ${loginResponse.status}`);
                
                if (loginResponse.ok) {
                    const loginData = await loginResponse.json();
                    console.log(`✅ LOGIN SUCCESS: ${loginData.user.email}`);
                    console.log(`🎫 Token: ${loginData.token ? 'Yes' : 'No'}`);
                } else {
                    const errorText = await loginResponse.text();
                    console.log(`❌ LOGIN FAILED: ${errorText}`);
                }
            } catch (error) {
                console.log(`❌ Login error: ${error.message}`);
            }
        }

        console.log('\n\n🎯 SUMMARY:');
        console.log('If no users were created successfully, the backend registration');
        console.log('endpoint needs to be implemented to create actual database users.');
        console.log('The 501 responses indicate the registration is not functional.');
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// If this is called directly (not imported)
if (require.main === module) {
    createTestUsersDirectly();
}

module.exports = { createTestUsersDirectly };
