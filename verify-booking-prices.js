// Verify booking prices are working correctly with fallback logic
const apiUrl = 'https://weddingbazaar-web.onrender.com';

async function verifyBookingPrices() {
  console.log('🔍 Verifying booking prices for user 1-2025-001...');
  
  try {
    // Test the API endpoint directly
    const response = await fetch(`${apiUrl}/api/bookings/user/1-2025-001`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response received:', {
      bookingsCount: data.data?.length || 0,
      hasData: !!data.data
    });
    
    if (data.data && data.data.length > 0) {
      data.data.forEach((booking, index) => {
        console.log(`\n📋 Booking ${index + 1} (ID: ${booking.id}):`);
        console.log(`  Service: ${booking.service_type || 'Unknown'}`);
        console.log(`  Vendor: ${booking.vendor_name || 'Unknown'}`);
        console.log(`  Status: ${booking.status}`);
        console.log(`  Amount Fields:`);
        console.log(`    - quoted_price: ${booking.quoted_price || 'NULL'}`);
        console.log(`    - final_price: ${booking.final_price || 'NULL'}`);
        console.log(`    - total_amount: ${booking.total_amount || 'NULL'}`);
        console.log(`    - deposit_amount: ${booking.deposit_amount || 'NULL'}`);
        console.log(`  Event Date: ${booking.event_date}`);
        
        // Test fallback pricing logic
        let fallbackPrice = 0;
        const serviceType = booking.service_type || '';
        const guestCount = booking.guest_count || 100;
        
        switch (serviceType) {
          case 'Catering':
            fallbackPrice = Math.max(guestCount * 800, 120000);
            break;
          case 'Photography':
            fallbackPrice = 75000;
            break;
          case 'Videography':
            fallbackPrice = 85000;
            break;
          case 'DJ':
          case 'Music':
            fallbackPrice = 35000;
            break;
          case 'Security & Guest Management':
            fallbackPrice = 50000;
            break;
          case 'Decoration':
          case 'Flowers':
            fallbackPrice = 40000;
            break;
          case 'Wedding Planning':
            fallbackPrice = 80000;
            break;
          default:
            fallbackPrice = 45000;
        }
        
        console.log(`  💰 Fallback Pricing:`);
        console.log(`    - Total Amount: ₱${fallbackPrice.toLocaleString()}`);
        console.log(`    - Downpayment (30%): ₱${Math.round(fallbackPrice * 0.3).toLocaleString()}`);
        console.log(`    - Balance (70%): ₱${Math.round(fallbackPrice * 0.7).toLocaleString()}`);
      });
    } else {
      console.log('⚠️ No bookings found for user 1-2025-001');
    }
    
  } catch (error) {
    console.error('❌ Error verifying booking prices:', error.message);
  }
}

// Run the verification
verifyBookingPrices();
