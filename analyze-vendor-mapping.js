/**
 * DATABASE VENDOR ID ANALYSIS
 * Check which vendor IDs are actually used in the bookings table
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function analyzeVendorIds() {
    console.log('🔍 Analyzing Vendor ID Usage in Database...');
    
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
    
    // Test a range of simple vendor IDs to find where the data is stored
    console.log('\n📊 Scanning for actual booking data...');
    
    const idsToTest = Array.from({length: 20}, (_, i) => (i + 1).toString()); // Test 1-20
    
    for (const id of idsToTest) {
        try {
            const response = await fetch(`${API_BASE}/api/bookings/vendor/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.bookings && data.bookings.length > 0) {
                    console.log(`🎯 FOUND DATA! Vendor ID "${id}" has ${data.bookings.length} bookings:`);
                    data.bookings.forEach((booking, idx) => {
                        console.log(`   ${idx + 1}. Booking ID: ${booking.id}`);
                        console.log(`      Service: ${booking.service_name || booking.service_type}`);
                        console.log(`      Original vendor_id: ${booking.vendor_id}`);
                        console.log(`      Client: ${booking.couple_id}`);
                        console.log(`      Status: ${booking.status}`);
                        console.log(`      Date: ${booking.event_date}`);
                        console.log('      ---');
                    });
                    
                    // Check if this matches our expected booking
                    const targetBooking = data.bookings.find(b => b.id === 1760288385 || b.id === '1760288385');
                    if (targetBooking) {
                        console.log(`🎯 MATCH FOUND! The booking with ID 1760288385 is stored under vendor ID "${id}"`);
                        console.log(`   This means: 2-2025-003 should map to → ${id}`);
                    }
                }
            }
        } catch (error) {
            // Ignore errors and continue
        }
    }
    
    console.log('\n🔍 Analysis Complete');
}

analyzeVendorIds();
