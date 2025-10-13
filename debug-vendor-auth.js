/**
 * VENDOR BOOKINGS DEBUG SCRIPT
 * Tests the authentication and API call issues for vendor 2-2025-003
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function debugVendorBookings() {
    console.log('🔍 Starting Vendor Bookings Debug for 2-2025-003...');
    
    // Step 1: Test login
    console.log('\n1️⃣ Testing Login...');
    try {
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'vendor0@gmail.com',
                password: 'password123'
            })
        });
        
        const loginData = await loginResponse.json();
        
        console.log('Login response status:', loginResponse.status);
        console.log('Login response data:', loginData);
        
        if (loginResponse.ok && loginData.token) {
            console.log('✅ Login successful!');
            console.log(`   User ID: ${loginData.user?.id}`);
            console.log(`   User Type: ${loginData.user?.user_type}`);
            console.log(`   Name: ${loginData.user?.first_name} ${loginData.user?.last_name}`);
            console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
            
            // Step 2: Test authenticated API call
            console.log('\n2️⃣ Testing Authenticated Bookings API...');
            const bookingsResponse = await fetch(`${API_BASE}/api/bookings/vendor/2-2025-003`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loginData.token}`
                }
            });
            
            const bookingsData = await bookingsResponse.json();
            
            console.log(`📊 Bookings API Response: ${bookingsResponse.status}`);
            console.log('Response Data:', bookingsData);
            
            if (bookingsResponse.ok) {
                console.log(`✅ SUCCESS: Found ${bookingsData.bookings?.length || 0} bookings!`);
                if (bookingsData.bookings && bookingsData.bookings.length > 0) {
                    console.log('📋 First booking details:');
                    console.log(JSON.stringify(bookingsData.bookings[0], null, 2));
                }
            } else {
                console.log(`❌ Bookings API failed: ${bookingsResponse.status} - ${bookingsData.message || bookingsData.error}`);
            }
            
        } else {
            console.log(`❌ Login failed: ${loginData.message || 'Unknown error'}`);
        }
        
    } catch (error) {
        console.error('💥 Debug script error:', error);
    }
}

// Run the debug
debugVendorBookings();
