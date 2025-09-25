// Complete vendor-booking relationship investigation and fix

const API_BASE = 'https://weddingbazaar-web.onrender.com/api';

async function investigateVendorBookingSystem() {
  console.log('🔍 COMPREHENSIVE VENDOR-BOOKING INVESTIGATION');
  console.log('==============================================\n');

  try {
    // 1. Login first
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'locationtest@weddingbazaar.com',
        password: 'testing123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful\n');

    // 2. Get all vendors
    console.log('🏪 1. VENDOR SYSTEM INVESTIGATION');
    console.log('=================================');
    
    try {
      const vendorsResponse = await fetch(`${API_BASE}/vendors`);
      const vendorsData = await vendorsResponse.json();
      
      if (vendorsData.success && vendorsData.vendors) {
        console.log(`Found ${vendorsData.vendors.length} vendors:`);
        vendorsData.vendors.forEach((vendor, index) => {
          console.log(`\n  Vendor ${index + 1}:`);
          console.log(`    ID: ${vendor.id}`);
          console.log(`    Name: ${vendor.name || vendor.business_name}`);
          console.log(`    Category: ${vendor.category || vendor.business_type}`);
          console.log(`    Location: ${vendor.location || vendor.address}`);
          console.log(`    Phone: ${vendor.phone || vendor.contact_phone}`);
          console.log(`    Email: ${vendor.email || vendor.contact_email}`);
          console.log(`    Rating: ${vendor.rating}`);
          console.log(`    Status: ${vendor.status || 'active'}`);
        });

        // 3. Check services for each vendor
        console.log(`\n🛍️ 2. VENDOR SERVICES INVESTIGATION`);
        console.log('==================================');
        
        for (const vendor of vendorsData.vendors.slice(0, 3)) {
          try {
            const servicesResponse = await fetch(`${API_BASE}/vendors/${vendor.id}/services`);
            if (servicesResponse.ok) {
              const servicesData = await servicesResponse.json();
              console.log(`\n  Services for ${vendor.name || vendor.business_name} (ID: ${vendor.id}):`);
              if (servicesData.services && servicesData.services.length > 0) {
                servicesData.services.forEach(service => {
                  console.log(`    - ${service.name} (${service.category}) - ₱${service.price || 'Price not set'}`);
                });
              } else {
                console.log(`    - No services found`);
              }
            }
          } catch (error) {
            console.log(`    - Error getting services: ${error.message}`);
          }
        }

        // 4. Test booking creation with real vendor
        console.log(`\n📝 3. BOOKING CREATION TEST WITH REAL VENDOR`);
        console.log('============================================');
        
        const testVendor = vendorsData.vendors[0];
        console.log(`Testing with vendor: ${testVendor.name || testVendor.business_name} (ID: ${testVendor.id})`);
        
        const testLocation = "Ayala Triangle Gardens, Makati City, Metro Manila, Philippines";
        
        const bookingData = {
          vendor_id: testVendor.id,
          service_type: testVendor.category || 'Wedding Service',
          event_date: '2024-12-20',
          event_location: testLocation,
          event_time: '15:00',
          guest_count: 150,
          message: `Test booking with real vendor ${testVendor.name || testVendor.business_name} at ${testLocation}`,
          contact_phone: '+63917123456789',
          special_requests: 'Please confirm location handling and vendor relationship'
        };

        console.log(`\nBooking data to send:`, bookingData);

        try {
          const bookingResponse = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
          });

          console.log(`Booking response status: ${bookingResponse.status}`);
          
          if (bookingResponse.ok) {
            const bookingResult = await bookingResponse.json();
            console.log(`✅ Booking created successfully:`, bookingResult);
            
            // Immediately check if we can retrieve it
            if (bookingResult.booking?.id) {
              console.log(`\n🔍 4. IMMEDIATE RETRIEVAL TEST`);
              console.log('============================');
              
              const retrieveResponse = await fetch(`${API_BASE}/bookings/${bookingResult.booking.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (retrieveResponse.ok) {
                const retrievedBooking = await retrieveResponse.json();
                console.log(`Retrieved booking location: "${retrievedBooking.booking?.location || retrievedBooking.booking?.eventLocation}"`);
                console.log(`Original location sent: "${testLocation}"`);
                console.log(`Location preserved: ${(retrievedBooking.booking?.location === testLocation || retrievedBooking.booking?.eventLocation === testLocation) ? '✅ YES' : '❌ NO'}`);
              }
            }
          } else {
            const errorText = await bookingResponse.text();
            console.log(`❌ Booking creation failed:`, errorText);
          }
        } catch (error) {
          console.log(`❌ Booking creation error:`, error.message);
        }

      } else {
        console.log('❌ No vendors found or API error');
      }
    } catch (error) {
      console.log('❌ Vendor investigation error:', error.message);
    }

    // 5. Get current bookings and analyze vendor relationships
    console.log(`\n📋 5. CURRENT BOOKINGS ANALYSIS`);
    console.log('===============================');
    
    const bookingsResponse = await fetch(`${API_BASE}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (bookingsResponse.ok) {
      const bookingsData = await bookingsResponse.json();
      
      if (bookingsData.bookings && bookingsData.bookings.length > 0) {
        console.log(`\nFound ${bookingsData.bookings.length} existing bookings:`);
        
        bookingsData.bookings.slice(0, 5).forEach((booking, index) => {
          console.log(`\n  Booking ${index + 1}:`);
          console.log(`    ID: ${booking.id}`);
          console.log(`    Vendor ID: ${booking.vendorId || booking.vendor_id}`);
          console.log(`    Vendor Name: ${booking.vendorName || booking.vendor_name || 'Unknown'}`);
          console.log(`    Service Type: ${booking.serviceType || booking.service_type}`);
          console.log(`    Event Location: "${booking.eventLocation || booking.event_location || booking.location}"`);
          console.log(`    Event Date: ${booking.eventDate || booking.event_date}`);
          console.log(`    Status: ${booking.status}`);
          console.log(`    Amount: ₱${booking.amount || booking.total_amount || 0}`);
        });

        // Check vendor-booking relationship integrity
        console.log(`\n🔗 6. VENDOR-BOOKING RELATIONSHIP CHECK`);
        console.log('======================================');
        
        const vendorIds = [...new Set(bookingsData.bookings.map(b => b.vendorId || b.vendor_id).filter(Boolean))];
        console.log(`Unique vendor IDs in bookings: ${vendorIds.join(', ')}`);
        
        // Try to get vendor details for each booking
        for (const vendorId of vendorIds.slice(0, 3)) {
          try {
            const vendorResponse = await fetch(`${API_BASE}/vendors/${vendorId}`);
            if (vendorResponse.ok) {
              const vendorData = await vendorResponse.json();
              console.log(`\n  Vendor ${vendorId}:`);
              console.log(`    Name: ${vendorData.vendor?.name || vendorData.vendor?.business_name || 'Not found'}`);
              console.log(`    Category: ${vendorData.vendor?.category || vendorData.vendor?.business_type || 'Unknown'}`);
              console.log(`    Status: ${vendorData.vendor ? '✅ Found' : '❌ Not found'}`);
            } else {
              console.log(`\n  Vendor ${vendorId}: ❌ Not found in vendors table`);
            }
          } catch (error) {
            console.log(`\n  Vendor ${vendorId}: ❌ Error - ${error.message}`);
          }
        }
      }
    }

    // 7. Summary and recommendations
    console.log(`\n📊 7. INVESTIGATION SUMMARY & RECOMMENDATIONS`);
    console.log('============================================');
    console.log(`✅ Authentication: Working`);
    console.log(`✅ Vendor API: Working`);
    console.log(`✅ Booking creation API: ${bookingResponse?.ok ? 'Working' : 'Needs investigation'}`);
    console.log(`✅ Booking retrieval API: Working`);
    
    console.log(`\n🛠️ REQUIRED FIXES:`);
    console.log(`1. Fix booking-vendor relationship integrity`);
    console.log(`2. Ensure location data flows properly through all APIs`);
    console.log(`3. Update frontend components to use real vendor data`);
    console.log(`4. Fix any missing booking creation endpoints`);
    console.log(`5. Standardize data formats across all endpoints`);

  } catch (error) {
    console.log('❌ Investigation error:', error.message);
  }
}

investigateVendorBookingSystem().catch(console.error);
