const { neon } = require('@neondatabase/serverless');

// Enhanced connection with better error handling
const sql = neon('postgresql://neondb_owner:1FKCz6T1lJem@ep-aged-band-a5o5kwtz.us-east-2.aws.neon.tech/weddingbazaar?sslmode=require');

async function createVendor2Bookings() {
  try {
    console.log('🚀 Creating test bookings for vendor 2-2025-003...');
    
    // First check if vendor 2-2025-003 exists
    const vendorCheck = await sql`
      SELECT id, business_name, business_type FROM vendors 
      WHERE id = '2-2025-003'
    `;
    
    if (vendorCheck.length === 0) {
      console.log('❌ Vendor 2-2025-003 not found');
      return;
    }
    
    console.log('✅ Found vendor:', vendorCheck[0]);
    
    // Check current bookings for this vendor
    const currentBookings = await sql`
      SELECT COUNT(*) as count FROM bookings 
      WHERE vendor_id = '2-2025-003'
    `;
    
    console.log(`📊 Current bookings for vendor 2-2025-003: ${currentBookings[0].count}`);
    
    if (currentBookings[0].count > 0) {
      console.log('✅ Vendor already has bookings. Fetching them...');
      
      const existingBookings = await sql`
        SELECT 
          b.id, b.couple_id, b.vendor_id, b.service_type,
          b.event_date, b.status, b.total_amount,
          COALESCE(u.first_name || ' ' || u.last_name, 'Unknown Couple') as couple_name
        FROM bookings b
        LEFT JOIN users u ON b.couple_id = u.id
        WHERE b.vendor_id = '2-2025-003'
        ORDER BY b.created_at DESC
      `;
      
      console.log('\n🎯 Existing bookings:');
      existingBookings.forEach((booking, index) => {
        console.log(`${index + 1}. Booking #${booking.id}`);
        console.log(`   📅 Event Date: ${booking.event_date}`);
        console.log(`   👫 Couple: ${booking.couple_name} (ID: ${booking.couple_id})`);
        console.log(`   🏷️  Service: ${booking.service_type}`);
        console.log(`   📊 Status: ${booking.status}`);
        console.log(`   💰 Amount: $${booking.total_amount}`);
        console.log('');
      });
      
      return;
    }
    
    // Create 3 test bookings for vendor 2-2025-003
    const testBookings = [
      {
        couple_id: '1-2025-001', // Existing couple
        vendor_id: '2-2025-003',
        service_type: 'Photography',
        event_date: '2025-12-15',
        status: 'confirmed',
        total_amount: 2500.00,
        notes: 'Wedding photography package - 8 hours coverage',
        contact_phone: '+1-555-0123',
        created_at: new Date('2025-01-15T10:30:00Z'),
        updated_at: new Date('2025-01-16T14:20:00Z')
      },
      {
        couple_id: '1-2025-001',
        vendor_id: '2-2025-003',
        service_type: 'Videography',
        event_date: '2025-11-22',
        status: 'pending',
        total_amount: 1800.00,
        notes: 'Engagement video session',
        contact_phone: '+1-555-0123',
        created_at: new Date('2025-01-10T09:15:00Z'),
        updated_at: new Date('2025-01-10T09:15:00Z')
      },
      {
        couple_id: '1-2025-001',
        vendor_id: '2-2025-003',
        service_type: 'Photography',
        event_date: '2026-03-28',
        status: 'quote_requested',
        total_amount: 3200.00,
        notes: 'Destination wedding photography - 2 days',
        contact_phone: '+1-555-0123',
        created_at: new Date('2025-01-20T16:45:00Z'),
        updated_at: new Date('2025-01-20T16:45:00Z')
      }
    ];
    
    console.log('\n📝 Creating bookings...');
    
    for (let i = 0; i < testBookings.length; i++) {
      const booking = testBookings[i];
      
      const result = await sql`
        INSERT INTO bookings (
          couple_id, vendor_id, service_type, event_date, 
          status, total_amount, notes, contact_phone, 
          created_at, updated_at
        ) VALUES (
          ${booking.couple_id}, ${booking.vendor_id}, ${booking.service_type}, 
          ${booking.event_date}, ${booking.status}, ${booking.total_amount}, 
          ${booking.notes}, ${booking.contact_phone}, ${booking.created_at}, 
          ${booking.updated_at}
        ) RETURNING id
      `;
      
      console.log(`✅ Created booking #${result[0].id} - ${booking.service_type} (${booking.status})`);
    }
    
    // Verify created bookings
    console.log('\n🔍 Verifying created bookings...');
    
    const finalBookings = await sql`
      SELECT 
        b.id, b.couple_id, b.vendor_id, b.service_type,
        b.event_date, b.status, b.total_amount,
        COALESCE(u.first_name || ' ' || u.last_name, 'Unknown Couple') as couple_name
      FROM bookings b
      LEFT JOIN users u ON b.couple_id = u.id
      WHERE b.vendor_id = '2-2025-003'
      ORDER BY b.created_at DESC
    `;
    
    console.log('\n🎯 Final bookings for vendor 2-2025-003:');
    finalBookings.forEach((booking, index) => {
      console.log(`${index + 1}. Booking #${booking.id}`);
      console.log(`   📅 Event Date: ${booking.event_date}`);
      console.log(`   👫 Couple: ${booking.couple_name} (ID: ${booking.couple_id})`);
      console.log(`   🏷️  Service: ${booking.service_type}`);
      console.log(`   📊 Status: ${booking.status}`);
      console.log(`   💰 Amount: $${booking.total_amount}`);
      console.log('');
    });
    
    console.log('✨ Test bookings created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test bookings:', error);
  }
}

createVendor2Bookings();
