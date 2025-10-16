// Quick script to check vendor users in database
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com';

// Test the specific email you're using to login
async function testLoginEmail() {
    const email = 'renzrusselbauto@gmail.com';
    console.log(`🔍 Testing login email: ${email}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile?email=${encodeURIComponent(email)}`, {
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': email
            }
        });

        if (response.ok) {
            const responseData = await response.json();
            const userData = responseData.user || responseData; // Handle both response formats
            console.log(`✅ SUCCESS! User found with correct role:`);
            console.log(`   - Email: ${userData.email}`);
            console.log(`   - Role: ${userData.role}`);
            console.log(`   - Name: ${userData.firstName} ${userData.lastName}`);
            console.log(`   - Business: ${userData.businessName || 'N/A'}`);
            console.log(`   - Vendor ID: ${userData.vendorId || 'N/A'}`);
            console.log(`   - Email Verified: ${userData.emailVerified}`);
            console.log(`🎯 This should now route to /vendor on login!`);
        } else if (response.status === 404) {
            console.log(`❌ Still not found - database needs to be updated`);
        } else {
            console.log(`⚠️ Error ${response.status}: ${await response.text()}`);
        }
    } catch (error) {
        console.log(`⚠️ Network error: ${error.message}`);
    }
    console.log('---');
}

async function checkVendorUsers() {
    console.log('🔍 Checking for vendor users in the database...');

    // Test known emails that might be vendors
    const testEmails = [
        'renzrusselbauto@gmail.com',    // Your ACTUAL login email (from browser logs)
        'bauto.renzrussel@ncst.edu.ph', // Your Neon console email
        'test@business.com',
        'vendor@test.com', 
        'business@example.com',
        'dj@example.com',
        'photo@example.com'
    ];

    for (const email of testEmails) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/profile?email=${encodeURIComponent(email)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': email
                }
            });

            if (response.ok) {
                const responseData = await response.json();
                const userData = responseData.user || responseData; // Handle both response formats
                console.log(`✅ Found user: ${email}`);
                console.log(`   - Role: ${userData.role}`);
                console.log(`   - Name: ${userData.firstName} ${userData.lastName}`);
                console.log(`   - Business: ${userData.businessName || 'N/A'}`);
                console.log('---');
            } else if (response.status === 404) {
                console.log(`❌ Not found: ${email}`);
            }
        } catch (error) {
            console.log(`⚠️ Error checking ${email}:`, error.message);
        }
    }
}

// Run both checks
async function runAllTests() {
    await testLoginEmail();
    await checkVendorUsers();
}

runAllTests();
