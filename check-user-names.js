// Check actual user names in database and create test bookings for vendor 2-2025-003
const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function checkUserNames() {
  try {
    console.log('👥 Checking actual user names in database...');
    
    // First, let's check existing users to see real names
    const userIds = [
      '1-2025-001', '1-2025-002', '1-2025-003', 
      '2-2025-001', '2-2025-002', '2-2025-003',
      '3-2025-001', '3-2025-002', '3-2025-003'
    ];
    
    let realUsers = [];
    
    for (const userId of userIds) {
      try {
        console.log(`📋 Checking user ${userId}...`);
        const response = await fetch(`${API_BASE}/api/users/${userId}`);
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.success && userData.user) {
            const user = userData.user;
            const fullName = `${user.first_name || user.firstName || 'Unknown'} ${user.last_name || user.lastName || 'User'}`;
            console.log(`✅ User ${userId}: ${fullName} (${user.email})`);
            realUsers.push({
              id: userId,
              firstName: user.first_name || user.firstName,
              lastName: user.last_name || user.lastName,
              fullName: fullName,
              email: user.email
            });
          }
        } else if (response.status === 404) {
          console.log(`❌ User ${userId} not found`);
        } else {
          console.log(`⚠️ API error for user ${userId}: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error checking user ${userId}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 FOUND ${realUsers.length} REAL USERS:`);
    realUsers.forEach(user => {
      console.log(`- ${user.id}: ${user.fullName} (${user.email})`);
    });
    
    // Now let's create some test bookings for vendor 2-2025-003 using real couple names
    if (realUsers.length > 0) {
      console.log('\n🎯 Creating test bookings for vendor 2-2025-003...');
      
      const testBookings = [
        {
          couple: realUsers[0], // Use first real user
          serviceType: 'Photography',
          eventDate: '2025-12-15',
          amount: 45000,
          status: 'confirmed'
        },
        {
          couple: realUsers[1] || realUsers[0], // Use second real user or fallback to first
          serviceType: 'Videography', 
          eventDate: '2025-11-20',
          amount: 35000,
          status: 'quote_sent'
        }
      ];
      
      for (const booking of testBookings) {
        try {
          const bookingData = {
            coupleId: booking.couple.id,
            vendorId: '2-2025-003',
            serviceType: booking.serviceType,
            eventDate: booking.eventDate,
            totalAmount: booking.amount,
            status: booking.status,
            notes: `Test booking for ${booking.couple.fullName}`,
            contactPhone: '+63 912 345 6789'
          };
          
          console.log(`📝 Creating booking: ${booking.serviceType} for ${booking.couple.fullName}...`);
          
          const response = await fetch(`${API_BASE}/api/bookings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Created booking ID: ${result.booking?.id || 'unknown'}`);
          } else {
            const error = await response.text();
            console.log(`❌ Failed to create booking: ${response.status} - ${error}`);
          }
          
        } catch (error) {
          console.log(`❌ Error creating booking: ${error.message}`);
        }
      }
      
      // After creating bookings, check if they exist for vendor 2-2025-003
      console.log('\n🔍 Checking if bookings were created for vendor 2-2025-003...');
      
      try {
        const response = await fetch(`${API_BASE}/api/vendors/2-2025-003/bookings`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Vendor 2-2025-003 now has ${data.data?.bookings?.length || 0} bookings`);
          
          if (data.data?.bookings?.length > 0) {
            console.log('\n📋 VENDOR 2-2025-003 BOOKINGS:');
            data.data.bookings.forEach((booking, i) => {
              console.log(`${i + 1}. ${booking.contact_person} - ${booking.service_type} - ₱${booking.quoted_price} - ${booking.status}`);
            });
          }
        } else {
          console.log(`❌ Failed to fetch vendor bookings: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error fetching vendor bookings: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUserNames();
