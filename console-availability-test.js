// Console Test for Availability Service
// Paste this into the browser console when on localhost:5173

console.log('🧪 Starting Availability Service Console Test');

// Test the availability service directly
async function testAvailabilityService() {
    try {
        // This should access the same instance as the BookingRequestModal
        const { availabilityService } = await import('./src/services/availabilityService.js');
        
        console.log('✅ Imported availability service');
        
        // Test with the same vendor and date that we know has bookings
        const testVendorId = '2-2025-001'; // This should map to vendor "2" 
        const testDate = '2025-10-31'; // This date has a booking according to our API test
        
        console.log(`🔍 Testing availability for vendor ${testVendorId} on ${testDate}`);
        
        const result = await availabilityService.checkAvailability(testVendorId, testDate);
        
        console.log('🎯 Availability result:', result);
        
        if (!result.isAvailable) {
            console.log('🚫 SUCCESS: Date is correctly marked as unavailable!');
            console.log('🚫 This means "booked" detection is working!');
        } else {
            console.log('⚠️ Date is marked as available');
            console.log('📊 Details:', {
                reason: result.reason,
                currentBookings: result.currentBookings,
                bookingStatus: result.bookingStatus
            });
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Also test direct API call
async function testDirectAPICall() {
    console.log('🌐 Testing direct API call...');
    
    try {
        const response = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/vendor/2', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log(`📡 Direct API response: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Direct API data:', data);
            
            // Check for bookings on our test date
            const testDate = '2025-10-31';
            const bookingsOnDate = data.bookings.filter(booking => {
                const bookingDate = booking.event_date?.split('T')[0];
                return bookingDate === testDate;
            });
            
            console.log(`📅 Bookings on ${testDate}:`, bookingsOnDate);
            
            if (bookingsOnDate.length > 0) {
                console.log('✅ Direct API confirms bookings exist on this date');
            } else {
                console.log('ℹ️ No bookings found on this date via direct API');
            }
        }
        
    } catch (error) {
        console.error('❌ Direct API test failed:', error);
    }
}

// Run both tests
console.log('🚀 Running tests...');
testDirectAPICall().then(() => testAvailabilityService());
