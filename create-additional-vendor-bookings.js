/**
 * Create additional test bookings for vendor ID 3
 * This will give the vendor multiple bookings to see in the VendorBookings page
 * 
 * ENDPOINT: /api/bookings/request (POST)
 * FORMAT: snake_case field names (backend expected format)
 * REQUIREMENTS: vendor_id, service_id, service_type, service_name, event_date, couple_id
 * 
 * This script uses the same endpoint as BookingRequestModal.tsx
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function createAdditionalVendorBookings() {
  console.log('🎯 Creating additional test bookings for vendor ID 3...\n');

  const bookings = [
    {
      // Match BookingRequestModal format exactly
      vendor_id: "3",
      service_id: "SRV-0013", // Use a real service ID
      service_type: "photography",
      service_name: "Wedding Photography Package",
      event_date: "2025-11-20",
      event_time: "14:00",
      event_location: "Makati City, Philippines",
      guest_count: 150,
      special_requests: "Golden hour ceremony shots and reception coverage",
      contact_phone: "+63 917 123 4567",
      preferred_contact_method: "phone",
      budget_range: "₱80,000 - ₱120,000",
      // Add couple_id field that backend expects
      couple_id: "1-2025-002"
    },
    {
      vendor_id: "3",
      service_id: "SRV-0014",
      service_type: "catering",
      service_name: "Premium Wedding Catering",
      event_date: "2025-12-05",
      event_time: "18:00",
      event_location: "Quezon City, Philippines",
      guest_count: 200,
      special_requests: "Filipino-Italian fusion menu with vegetarian options",
      contact_phone: "+63 918 234 5678",
      preferred_contact_method: "email",
      budget_range: "₱150,000 - ₱200,000",
      couple_id: "1-2025-004"
    },
    {
      vendor_id: "3",
      service_id: "SRV-0015",
      service_type: "venue",
      service_name: "Garden Wedding Venue",
      event_date: "2025-11-30",
      event_time: "16:00",
      event_location: "Tagaytay, Philippines",
      guest_count: 120,
      special_requests: "Outdoor ceremony with indoor reception backup plan",
      contact_phone: "+63 919 345 6789",
      preferred_contact_method: "email",
      budget_range: "₱100,000 - ₱150,000",
      couple_id: "1-2025-005"
    },
    {
      vendor_id: "3",
      service_id: "SRV-0016",
      service_type: "music_dj",
      service_name: "Premium Wedding DJ Service",
      event_date: "2025-12-10",
      event_time: "19:00",
      event_location: "Bonifacio Global City, Philippines",
      guest_count: 180,
      special_requests: "Mix of modern hits and classic love songs for dancing",
      contact_phone: "+63 920 456 7890",
      preferred_contact_method: "email",
      budget_range: "₱40,000 - ₱60,000",
      couple_id: "1-2025-006"
    },
    {
      vendor_id: "3",
      service_id: "SRV-0017",
      service_type: "wedding_planning",
      service_name: "Full Wedding Coordination",
      event_date: "2025-11-25",
      event_time: "15:00",
      event_location: "Alabang, Philippines",
      guest_count: 100,
      special_requests: "Complete wedding planning from engagement to reception",
      contact_phone: "+63 921 567 8901",
      preferred_contact_method: "phone",
      budget_range: "₱120,000 - ₱180,000",
      couple_id: "1-2025-007"
    }
  ];

  for (let i = 0; i < bookings.length; i++) {
    const booking = bookings[i];
    console.log(`📝 Creating booking ${i + 1}/5: ${booking.serviceType} for ${booking.coupleId}`);
    
    try {
      // Try the same endpoint that BookingRequestModal uses successfully
      const response = await fetch(`${API_BASE}/api/bookings/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking)
      });
      
      // If that fails, try the enhanced endpoint
      if (!response.ok && response.status === 404) {
        console.log(`🔄 Trying enhanced endpoint for booking ${i + 1}`);
        const enhancedResponse = await fetch(`${API_BASE}/api/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(booking)
        });
        
        if (enhancedResponse.ok) {
          const result = await enhancedResponse.json();
          console.log(`✅ Success (enhanced): Booking created with ID ${result.bookingId || result.id}`);
          continue;
        }
      }

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Success: Booking created with ID ${result.bookingId || result.id}`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.log(`💥 Error: ${error.message}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🎉 Finished creating additional vendor bookings!');
  console.log('🔄 Now refresh the VendorBookings page to see multiple bookings');
}

// Run the function
createAdditionalVendorBookings().catch(console.error);
