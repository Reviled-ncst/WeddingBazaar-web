// Simple script to check booking API response format
const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function checkBookingData() {
  try {
    console.log('🔍 Fetching booking data for user 1-2025-001...');
    
    const response = await fetch(`${API_BASE}/api/bookings/couple/1-2025-001?limit=1`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('\n📊 Raw API Response Structure:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.data && data.data.bookings && data.data.bookings.length > 0) {
      const firstBooking = data.data.bookings[0];
      console.log('\n👥 First Booking Fields for Name:');
      console.log('contact_person:', firstBooking.contact_person);
      console.log('contact_email:', firstBooking.contact_email);
      console.log('vendor_name:', firstBooking.vendor_name);
      console.log('couple_id:', firstBooking.couple_id);
      console.log('vendor_id:', firstBooking.vendor_id);
      
      // Check if there are any other name-related fields
      const nameFields = Object.keys(firstBooking).filter(key => 
        key.includes('name') || key.includes('contact') || key.includes('couple')
      );
      console.log('\n🏷️  All name/contact related fields:', nameFields);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBookingData();
