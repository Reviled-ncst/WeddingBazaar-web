/**
 * DIRECT BOOKING SEARCH
 * Search for the specific booking ID 1760288385 to see where it's stored
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function searchForBooking() {
    console.log('🔍 Searching for booking ID 1760288385...');
    
    // Get auth token
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'vendor0@gmail.com',
            password: 'password123'
        })
    });
    
    const loginData = await loginResponse.json();
    if (!loginResponse.ok) {
        console.log('❌ Login failed');
        return;
    }
    
    const token = loginData.token;
    console.log('✅ Authentication successful');
    
    // Try to get all bookings or search by specific endpoint
    console.log('\n📊 Testing different booking endpoints...');
    
    const endpointsToTest = [
        '/api/bookings',                    // All bookings
        '/api/bookings/1760288385',         // Specific booking
        '/api/bookings/search',             // Search endpoint
        '/api/vendor/bookings',             // Vendor-specific bookings
        '/api/users/2-2025-003/bookings',   // User-specific bookings
    ];
    
    for (const endpoint of endpointsToTest) {
        console.log(`\n🧪 Testing: ${endpoint}`);
        
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log(`   Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Success!`);
                
                if (data.bookings && Array.isArray(data.bookings)) {
                    console.log(`   Found ${data.bookings.length} bookings`);
                    
                    // Look for our specific booking
                    const targetBooking = data.bookings.find(b => 
                        b.id === 1760288385 || 
                        b.id === '1760288385' ||
                        b.vendor_id === '2-2025-003'
                    );
                    
                    if (targetBooking) {
                        console.log(`   🎯 FOUND TARGET BOOKING!`);
                        console.log(`      ID: ${targetBooking.id}`);
                        console.log(`      Vendor ID: ${targetBooking.vendor_id}`);
                        console.log(`      Service: ${targetBooking.service_name}`);
                        console.log(`      Status: ${targetBooking.status}`);
                        return; // Found it!
                    }
                    
                    if (data.bookings.length > 0) {
                        console.log(`   Sample booking:`, data.bookings[0]);
                    }
                } else if (data.booking) {
                    console.log(`   Found single booking:`, data.booking);
                } else {
                    console.log(`   Response:`, data);
                }
            } else {
                const errorData = await response.json();
                console.log(`   ❌ Failed: ${errorData.error || errorData.message}`);
            }
            
        } catch (error) {
            console.log(`   💥 Error: ${error.message}`);
        }
    }
    
    console.log('\n🤔 If no endpoints returned the booking, it might be:');
    console.log('1. The booking data is not yet in the backend database');
    console.log('2. The booking is stored under a different vendor ID');
    console.log('3. The API endpoints have different names');
    console.log('4. There are additional authentication requirements');
}

searchForBooking();
