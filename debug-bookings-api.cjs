const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function debugBookingsAPI() {
  try {
    console.log('🔍 Debugging why bookings API returns empty...\n');
    
    // 1. Check vendors table
    console.log('1. Checking vendors table:');
    const vendors = await sql`SELECT id, business_name FROM vendors LIMIT 5`;
    console.table(vendors);
    
    // 2. Check specific vendor
    console.log('\n2. Looking for vendor 2-2025-003:');
    const specificVendor = await sql`SELECT * FROM vendors WHERE id = '2-2025-003'`;
    console.log('Found:', specificVendor.length > 0 ? specificVendor[0] : 'NOT FOUND');
    
    // 3. Check bookings table
    console.log('\n3. Bookings for vendor 2-2025-003:');
    const bookings = await sql`SELECT id, vendor_id, couple_id, service_type, status FROM bookings WHERE vendor_id = '2-2025-003' LIMIT 5`;
    console.table(bookings);
    
    // 4. Try the JOIN query that the API uses
    console.log('\n4. Testing API JOIN query:');
    try {
      const joinQuery = await sql`
        SELECT 
          b.id, b.couple_id, b.vendor_id, b.service_type,
          b.event_date, b.status, b.total_amount, b.notes,
          b.created_at, b.updated_at, b.contact_phone,
          v.business_name as vendor_name, v.business_type as vendor_category,
          v.location
        FROM bookings b
        JOIN vendors v ON b.vendor_id = v.id
        WHERE b.vendor_id = '2-2025-003'
        LIMIT 5
      `;
      console.table(joinQuery);
    } catch (joinError) {
      console.error('JOIN query failed:', joinError.message);
      
      // 5. Try without JOIN
      console.log('\n5. Testing without JOIN:');
      const noJoinQuery = await sql`
        SELECT id, couple_id, vendor_id, service_type, event_date, status, total_amount
        FROM bookings 
        WHERE vendor_id = '2-2025-003'
        LIMIT 5
      `;
      console.table(noJoinQuery);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugBookingsAPI();
