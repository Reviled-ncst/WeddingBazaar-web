// Availability Diagnostic Test Script
// Run this in the browser console to debug availability issues

console.log('🔍 Starting Availability Diagnostic Test...');

const API_URL = 'https://weddingbazaar-web.onrender.com';

async function testAvailabilityEndpoints() {
    console.log('🌐 Testing API endpoints for availability functionality...');
    
    // Test 1: Basic API health
    try {
        console.log('📡 Test 1: API Health Check');
        const healthResponse = await fetch(`${API_URL}/api/health`);
        console.log(`✅ Health status: ${healthResponse.status} ${healthResponse.statusText}`);
        const healthData = await healthResponse.json();
        console.log('📊 Health data:', healthData);
    } catch (error) {
        console.error('❌ Health check failed:', error);
    }
    
    // Test 2: Vendor bookings endpoint
    try {
        console.log('📡 Test 2: Vendor Bookings Endpoint');
        const vendorId = '2'; // Known vendor with bookings
        const bookingsResponse = await fetch(`${API_URL}/api/bookings/vendor/${vendorId}`);
        console.log(`✅ Vendor bookings status: ${bookingsResponse.status} ${bookingsResponse.statusText}`);
        const bookingsData = await bookingsResponse.json();
        console.log('📊 Bookings data:', bookingsData);
        
        if (bookingsData.bookings && bookingsData.bookings.length > 0) {
            console.log(`📋 Found ${bookingsData.bookings.length} bookings for vendor ${vendorId}`);
            bookingsData.bookings.forEach((booking, index) => {
                console.log(`📅 Booking ${index + 1}:`, {
                    id: booking.id,
                    date: booking.event_date,
                    status: booking.status,
                    serviceName: booking.service_name
                });
            });
        }
    } catch (error) {
        console.error('❌ Vendor bookings test failed:', error);
    }
    
    // Test 3: Vendor off-days endpoint
    try {
        console.log('📡 Test 3: Vendor Off-Days Endpoint');
        const vendorId = '2-2025-003'; // Test vendor
        const offDaysResponse = await fetch(`${API_URL}/api/vendors/${vendorId}/off-days`);
        console.log(`✅ Off-days status: ${offDaysResponse.status} ${offDaysResponse.statusText}`);
        
        if (offDaysResponse.ok) {
            const offDaysData = await offDaysResponse.json();
            console.log('📊 Off-days data:', offDaysData);
        } else {
            console.log(`ℹ️ Off-days endpoint returned ${offDaysResponse.status} - this is expected if no off-days are set`);
        }
    } catch (error) {
        console.error('❌ Off-days test failed:', error);
    }
    
    // Test 4: Availability logic simulation
    try {
        console.log('📡 Test 4: Availability Logic Simulation');
        const testVendorId = '2';
        const testDate = '2025-10-31'; // Date we know has a booking
        
        console.log(`🔍 Testing availability for vendor ${testVendorId} on ${testDate}`);
        
        // Simulate the availability service logic
        const bookingsResponse = await fetch(`${API_URL}/api/bookings/vendor/${testVendorId}`);
        if (bookingsResponse.ok) {
            const data = await bookingsResponse.json();
            const bookings = data.bookings || [];
            
            // Filter bookings for the specific date
            const bookingsOnDate = bookings.filter(booking => {
                const bookingDate = booking.event_date?.split('T')[0];
                return bookingDate === testDate;
            });
            
            console.log(`📅 Found ${bookingsOnDate.length} bookings on ${testDate}:`, bookingsOnDate);
            
            // Check availability logic
            const confirmedBookings = bookingsOnDate.filter(booking => booking.status === 'confirmed').length;
            const pendingBookings = bookingsOnDate.filter(booking => 
                booking.status === 'pending' || booking.status === 'request'
            ).length;
            
            console.log(`📊 Booking counts: ${confirmedBookings} confirmed, ${pendingBookings} pending/request`);
            
            let isAvailable = true;
            let reason = '';
            
            if (confirmedBookings >= 1) {
                isAvailable = false;
                reason = `Already booked (${confirmedBookings} confirmed booking${confirmedBookings > 1 ? 's' : ''})`;
            } else if (pendingBookings > 0) {
                isAvailable = true;
                reason = `Available with ${pendingBookings} pending request${pendingBookings > 1 ? 's' : ''}`;
            } else {
                isAvailable = true;
                reason = 'Available for booking';
            }
            
            console.log('🎯 Final availability result:', {
                date: testDate,
                vendorId: testVendorId,
                isAvailable: isAvailable,
                reason: reason,
                currentBookings: bookingsOnDate.length,
                maxBookingsPerDay: 1
            });
            
            if (!isAvailable) {
                console.log('🚫 CRITICAL: Date is NOT available for booking!');
                console.log('🚫 This means "booked" dates ARE being detected correctly!');
            } else if (pendingBookings > 0) {
                console.log('⚠️ Date has pending bookings but is still available');
            } else {
                console.log('✅ Date is completely available');
            }
        }
    } catch (error) {
        console.error('❌ Availability logic test failed:', error);
    }
    
    console.log('🏁 Availability diagnostic test completed');
}

// Auto-run the test
testAvailabilityEndpoints();
