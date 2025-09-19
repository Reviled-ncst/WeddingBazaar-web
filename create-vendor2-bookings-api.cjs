// Create test bookings via API instead of direct database access
const axios = require('axios');

const API_BASE = 'https://weddingbazaar-web.onrender.com/api';

async function createVendor2BookingsViaAPI() {
  try {
    console.log('🚀 Creating test bookings for vendor 2-2025-003 via API...');
    
    // First, let's get a valid token by logging in as the couple
    console.log('🔐 Logging in as couple (1-2025-001)...');
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'couple1@gmail.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    console.log('✅ Login successful:', loginResponse.data.user.firstName);
    const token = loginResponse.data.token;
    
    // Check current bookings for vendor 2-2025-003
    console.log('📊 Checking current bookings...');
    
    try {
      const vendorBookingsResponse = await axios.get(
        `${API_BASE}/vendors/2-2025-003/bookings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (vendorBookingsResponse.data.success && vendorBookingsResponse.data.data.bookings.length > 0) {
        console.log('✅ Vendor already has bookings:', vendorBookingsResponse.data.data.bookings.length);
        console.log('\n🎯 Existing bookings:');
        vendorBookingsResponse.data.data.bookings.forEach((booking, index) => {
          console.log(`${index + 1}. ${booking.booking_reference}`);
          console.log(`   📅 Event: ${booking.event_date}`);
          console.log(`   👫 Couple: ${booking.contact_person}`);
          console.log(`   🏷️  Service: ${booking.service_type}`);
          console.log(`   📊 Status: ${booking.status}`);
          console.log(`   💰 Amount: $${booking.quoted_price}`);
          console.log('');
        });
        return;
      }
    } catch (vendorError) {
      console.log('⚠️ Could not fetch vendor bookings (expected if none exist)');
    }
    
    // Create test bookings via the API
    const testBookings = [
      {
        vendor_id: '2-2025-003',
        service_type: 'Photography',
        event_date: '2025-12-15',
        total_amount: 2500.00,
        notes: 'Wedding photography package - 8 hours coverage',
        contact_phone: '+1-555-0123'
      },
      {
        vendor_id: '2-2025-003',
        service_type: 'Videography',
        event_date: '2025-11-22',
        total_amount: 1800.00,
        notes: 'Engagement video session',
        contact_phone: '+1-555-0123'
      },
      {
        vendor_id: '2-2025-003',
        service_type: 'Photography',
        event_date: '2026-03-28',
        total_amount: 3200.00,
        notes: 'Destination wedding photography - 2 days',
        contact_phone: '+1-555-0123'
      }
    ];
    
    console.log('\n📝 Creating bookings via API...');
    
    for (let i = 0; i < testBookings.length; i++) {
      const booking = testBookings[i];
      
      try {
        const response = await axios.post(
          `${API_BASE}/bookings`,
          booking,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data.success) {
          console.log(`✅ Created booking: ${booking.service_type} (${booking.event_date})`);
        } else {
          console.log(`❌ Failed to create booking: ${response.data.message}`);
        }
      } catch (bookingError) {
        console.log(`❌ Error creating booking ${i + 1}:`, bookingError.response?.data?.message || bookingError.message);
      }
    }
    
    // Verify created bookings
    console.log('\n🔍 Verifying created bookings...');
    
    try {
      const finalResponse = await axios.get(
        `${API_BASE}/vendors/2-2025-003/bookings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (finalResponse.data.success) {
        console.log(`✅ Found ${finalResponse.data.data.bookings.length} bookings for vendor 2-2025-003`);
        
        console.log('\n🎯 All bookings for vendor 2-2025-003:');
        finalResponse.data.data.bookings.forEach((booking, index) => {
          console.log(`${index + 1}. ${booking.booking_reference}`);
          console.log(`   📅 Event: ${booking.event_date}`);
          console.log(`   👫 Couple: ${booking.contact_person}`);
          console.log(`   🏷️  Service: ${booking.service_type}`);
          console.log(`   📊 Status: ${booking.status}`);
          console.log(`   💰 Amount: $${booking.quoted_price}`);
          console.log('');
        });
      }
    } catch (verifyError) {
      console.log('⚠️ Could not verify bookings:', verifyError.response?.data?.message || verifyError.message);
    }
    
    console.log('✨ Booking creation process completed!');
    
  } catch (error) {
    console.error('❌ Error in booking creation process:', error.response?.data || error.message);
  }
}

// Install axios if needed: npm install axios
createVendor2BookingsViaAPI();
