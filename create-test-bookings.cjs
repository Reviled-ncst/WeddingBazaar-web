require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createBookingsForCurrentUser() {
  try {
    console.log('=== CREATING TEST BOOKINGS FOR CURRENT USER ===\n');
    
    // Get the current test user ID (like c-38319639-149)
    const testUsers = await pool.query("SELECT id, email FROM users WHERE id LIKE 'c-%' ORDER BY created_at DESC LIMIT 1");
    
    if (testUsers.rows.length === 0) {
      console.log('❌ No test users found');
      return;
    }
    
    const currentUser = testUsers.rows[0];
    console.log('🎯 Creating bookings for current test user:', currentUser);
    
    // Create a few test bookings for this user
    const vendor = '2-2025-003'; // Beltran Sound Systems - has profile and images
    const service = 'SRV-8154';
    
    const bookingsToCreate = [
      {
        couple_id: currentUser.id,
        vendor_id: vendor,
        service_id: service,
        service_type: 'Security & Guest Management',
        service_name: 'Wedding Day Emergency Support',
        event_date: '2025-12-15',
        event_time: '14:00',
        event_location: 'Manila Cathedral, Manila',
        guest_count: 200,
        budget_range: '₱75,000-₱150,000',
        status: 'quote_sent',
        special_requests: 'Professional security team for VIP guests',
        contact_person: 'John Doe',
        contact_phone: '+639171234567',
        contact_email: currentUser.email,
        preferred_contact_method: 'email'
      },
      {
        couple_id: currentUser.id,
        vendor_id: vendor,
        service_id: service,
        service_type: 'Photography',
        service_name: 'Wedding Photography Package',
        event_date: '2025-11-20',
        event_time: '10:00',
        event_location: 'Tagaytay Highlands, Tagaytay',
        guest_count: 150,
        budget_range: '₱100,000-₱200,000',
        status: 'confirmed',
        special_requests: 'Pre-wedding and wedding day photography',
        contact_person: 'Jane Smith',
        contact_phone: '+639181234567',
        contact_email: currentUser.email,
        preferred_contact_method: 'phone'
      },
      {
        couple_id: currentUser.id,
        vendor_id: vendor,
        service_id: service,
        service_type: 'Catering',
        service_name: 'Premium Wedding Catering',
        event_date: '2026-01-10',
        event_time: '18:00',
        event_location: 'BGC Taguig, Metro Manila',
        guest_count: 300,
        budget_range: '₱200,000-₱500,000',
        status: 'quote_requested',
        special_requests: 'Buffet style with international cuisine',
        contact_person: 'Mike Johnson',
        contact_phone: '+639191234567',
        contact_email: currentUser.email,
        preferred_contact_method: 'email'
      }
    ];
    
    let createdCount = 0;
    
    for (const booking of bookingsToCreate) {
      try {
        const bookingReference = 'WB-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        const result = await pool.query(`
          INSERT INTO comprehensive_bookings (
            booking_reference, couple_id, vendor_id, service_id, service_type, service_name,
            event_date, event_time, event_location, guest_count, budget_range, status,
            special_requests, contact_person, contact_phone, contact_email, preferred_contact_method,
            total_paid, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
          ) RETURNING id, booking_reference, status
        `, [
          bookingReference, booking.couple_id, booking.vendor_id, booking.service_id,
          booking.service_type, booking.service_name, booking.event_date, booking.event_time,
          booking.event_location, booking.guest_count, booking.budget_range, booking.status,
          booking.special_requests, booking.contact_person, booking.contact_phone,
          booking.contact_email, booking.preferred_contact_method, '0.00'
        ]);
        
        console.log(`✅ Created booking: ${result.rows[0].booking_reference} (${result.rows[0].status})`);
        createdCount++;
        
      } catch (err) {
        console.error('❌ Error creating booking:', err.message);
      }
    }
    
    console.log(`\n🎉 Successfully created ${createdCount} bookings for user ${currentUser.id}`);
    console.log('💡 Refresh your Individual Bookings page to see the new bookings!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createBookingsForCurrentUser();
