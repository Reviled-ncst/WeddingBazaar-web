/**
 * Create test bookings with proper contact information for vendor booking system testing
 */

const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';

async function createTestBookingsWithRealData() {
  console.log('🧪 Creating test bookings with proper contact information...');
  
  const testBookings = [
    {
      vendorId: "2",
      coupleId: "couple-001", 
      userId: "couple-001",
      serviceType: "DJ",
      serviceName: "Wedding DJ Service",
      eventDate: "2025-12-25",
      eventTime: "18:00",
      eventLocation: "Garden Paradise Resort, Tagaytay",
      guestCount: 150,
      budgetRange: "₱65,000 - ₱85,000",
      specialRequests: "Need wireless microphones for outdoor ceremony and reception playlist with 80s and 90s hits",
      contactPhone: "+63 917 123 4567",
      contactEmail: "maria.santos@gmail.com",
      coupleName: "Maria & Carlos Santos",
      preferredContactMethod: "phone",
      totalAmount: 75000,
      depositAmount: 25000,
      quoteAmount: 75000,
      status: "quote_sent",
      notes: "Quote sent with complete DJ package including sound system, microphones, and lighting",
      responseMessage: "Comprehensive DJ package with premium sound system and lighting setup"
    },
    {
      vendorId: "2", 
      coupleId: "couple-002",
      userId: "couple-002",
      serviceType: "Photography", 
      serviceName: "Wedding Photography Package",
      eventDate: "2025-11-30",
      eventTime: "14:00",
      eventLocation: "Antipolo Hills Church & Reception",
      guestCount: 200,
      budgetRange: "₱120,000 - ₱150,000",
      specialRequests: "Pre-wedding shoot in Manila Bay, same-day edit video, and drone shots of the venue",
      contactPhone: "+63 928 987 6543",
      contactEmail: "john.cruz@yahoo.com",
      coupleName: "John & Lisa Cruz",
      preferredContactMethod: "email",
      totalAmount: 135000,
      depositAmount: 40000,
      quoteAmount: 135000,
      status: "confirmed",
      notes: "Client confirmed booking with full photography and videography package",
      responseMessage: "Premium wedding photography package with same-day edit and drone coverage"
    },
    {
      vendorId: "2",
      coupleId: "couple-003",
      userId: "couple-003", 
      serviceType: "Catering",
      serviceName: "Wedding Catering Services",
      eventDate: "2025-10-15",
      eventTime: "17:30",
      eventLocation: "The Peninsula Manila Ballroom",
      guestCount: 300,
      budgetRange: "₱250,000 - ₱300,000",
      specialRequests: "International buffet with vegetarian options, cocktail reception, and wedding cake",
      contactPhone: "+63 915 555 7890",
      contactEmail: "anna.reyes@hotmail.com", 
      coupleName: "Anna & Miguel Reyes",
      preferredContactMethod: "email",
      totalAmount: 275000,
      depositAmount: 82500,
      quoteAmount: 275000,
      status: "quote_requested",
      notes: "Awaiting quote for premium catering package with international cuisine",
      responseMessage: null
    }
  ];

  try {
    for (const booking of testBookings) {
      console.log(`📋 Creating booking for ${booking.couple_name}...`);
      
      const response = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created booking ID: ${result.booking?.id || result.id} for ${booking.couple_name}`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed to create booking for ${booking.couple_name}:`, error);
      }
    }

    console.log('🎉 Test bookings created successfully!');
    console.log('🔗 Check them at: https://weddingbazaarph.web.app/vendor/bookings');
    
  } catch (error) {
    console.error('❌ Error creating test bookings:', error);
  }
}

// Run the script
createTestBookingsWithRealData();
