/**
 * MANUAL BOOKING CREATION TEST
 * Try to create the booking that should exist for vendor 2-2025-003
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function createTestBooking() {
    console.log('🔍 Creating test booking for vendor 2-2025-003...');
    
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
    
    // Test booking creation endpoints
    const bookingData = {
        service_id: "SRV-1758769064490",
        service_name: "DJ Service",
        vendor_id: "2-2025-003",
        couple_id: "1-2025-001",
        event_date: "2025-10-15",
        event_time: "11:11:00",
        event_location: "TBD",
        service_type: "other",
        special_requests: "asdasdsa",
        status: "request",
        total_amount: "0.00",
        notes: "QUOTE_SENT: Quote has been sent to client"
    };
    
    const endpointsToTry = [
        '/api/bookings',
        '/api/bookings/create',
        '/api/vendor/bookings',
        '/api/bookings/vendor',
    ];
    
    for (const endpoint of endpointsToTry) {
        console.log(`\n🧪 Trying to create booking at: ${endpoint}`);
        
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });
            
            console.log(`   Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Success! Booking created:`, data);
                
                // Now try to fetch it back
                console.log('\n🔄 Testing if we can fetch the created booking...');
                setTimeout(async () => {
                    try {
                        const fetchResponse = await fetch(`${API_BASE}/api/bookings/vendor/2-2025-003`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        if (fetchResponse.ok) {
                            const fetchData = await fetchResponse.json();
                            console.log(`   📊 Fetch result: Found ${fetchData.bookings?.length || 0} bookings`);
                        } else {
                            console.log(`   ❌ Fetch failed: ${fetchResponse.status}`);
                        }
                    } catch (err) {
                        console.log(`   💥 Fetch error: ${err.message}`);
                    }
                }, 1000);
                
                return; // Success, exit
                
            } else {
                const errorData = await response.json();
                console.log(`   ❌ Failed: ${errorData.error || errorData.message}`);
            }
            
        } catch (error) {
            console.log(`   💥 Error: ${error.message}`);
        }
    }
    
    console.log('\n🤔 Could not create booking. The backend may not have booking creation endpoints yet.');
    console.log('💡 The booking data from your JSON file might need to be manually inserted into the database.');
}

createTestBooking();
