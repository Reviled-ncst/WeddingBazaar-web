// Create a test booking for vendor 2-2025-003 to demonstrate couple names
const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function createVendor2Booking() {
  try {
    console.log('🔄 Creating test booking for vendor 2-2025-003...');
    
    const bookingData = {
      vendorId: '2-2025-003',
      coupleId: '1-2025-001', // Use an existing couple
      serviceType: 'Photography',
      eventDate: '2025-12-15',
      eventTime: '14:00',
      location: 'Sunset Garden Resort',
      totalAmount: 50000,
      notes: 'Outdoor wedding photography with golden hour session',
      contactPhone: '+63 917 123 4567',
      contactEmail: 'couple001@example.com'
    };
    
    console.log('📤 Sending booking request:', bookingData);
    
    const response = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Booking created successfully:', result);
      
      // Now test the vendor bookings endpoint
      console.log('\n🔍 Testing vendor bookings endpoint...');
      const vendorResponse = await fetch(`${API_BASE}/api/vendors/2-2025-003/bookings`);
      
      if (vendorResponse.ok) {
        const vendorData = await vendorResponse.json();
        console.log('✅ Vendor bookings loaded:', vendorData);
      } else {
        console.log('⚠️ Vendor bookings API failed:', vendorResponse.status);
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to create booking:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

createVendor2Booking();
