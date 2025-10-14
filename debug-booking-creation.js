/**
 * Debug the booking creation process to understand the 400 error
 * Based on the logs, we're sending SRV-1758769064490 instead of SRV-0013
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function debugBookingCreation() {
  console.log('🔍 Debugging booking creation 400 error...\n');

  // First, let's check what service SRV-1758769064490 is
  console.log('1️⃣ Checking service SRV-1758769064490 (the one being sent):');
  try {
    const serviceResponse = await fetch(`${API_BASE}/api/services/SRV-1758769064490`);
    if (serviceResponse.ok) {
      const serviceData = await serviceResponse.json();
      console.log('✅ Service exists:', {
        id: serviceData.service?.id,
        title: serviceData.service?.title,
        vendor_id: serviceData.service?.vendor_id,
        category: serviceData.service?.category
      });
    } else {
      console.log('❌ Service not found:', serviceResponse.status);
    }
  } catch (error) {
    console.log('💥 Error checking service:', error.message);
  }

  // Let's try creating a booking with the correct format
  console.log('\n2️⃣ Testing booking creation with SRV-1758769064490:');
  
  const bookingData = {
    coupleId: "1-2025-001",
    vendorId: "2-2025-003", // This should match the service's vendor_id
    serviceId: "SRV-1758769064490",
    serviceName: "DJ Service",
    serviceType: "music_dj",
    eventDate: "2025-10-17",
    eventTime: "19:00",
    eventLocation: "Celestino Subdivision, Bacoor, Cavite, Calabarzon, 4102, Philippines",
    guestCount: 100,
    specialRequests: "Test booking from debug script",
    contactPhone: "+63 917 123 4567",
    contactEmail: "test@example.com",
    preferredContactMethod: "email",
    budgetRange: "₱30,000 - ₱50,000"
  };

  try {
    console.log('📤 Sending booking request with data:', bookingData);
    
    const response = await fetch(`${API_BASE}/api/bookings/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    console.log('📡 Response status:', response.status);
    
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    if (!response.ok) {
      console.log('❌ Request failed with status:', response.status);
      
      // Try to parse the error response
      try {
        const errorData = JSON.parse(responseText);
        console.log('❌ Error details:', errorData);
      } catch {
        console.log('❌ Raw error response:', responseText);
      }
    } else {
      console.log('✅ Booking created successfully!');
      const result = JSON.parse(responseText);
      console.log('📋 Created booking:', result);
    }
  } catch (error) {
    console.log('💥 Network error:', error.message);
  }

  // Let's also check what vendor 2-2025-003 looks like
  console.log('\n3️⃣ Checking vendor 2-2025-003:');
  try {
    const vendorResponse = await fetch(`${API_BASE}/api/vendors/2-2025-003`);
    if (vendorResponse.ok) {
      const vendorData = await vendorResponse.json();
      console.log('✅ Vendor exists:', {
        id: vendorData.vendor?.id || vendorData.id,
        name: vendorData.vendor?.name || vendorData.name,
        category: vendorData.vendor?.category || vendorData.category
      });
    } else {
      console.log('❌ Vendor not found:', vendorResponse.status);
    }
  } catch (error) {
    console.log('💥 Error checking vendor:', error.message);
  }
}

debugBookingCreation().catch(console.error);
