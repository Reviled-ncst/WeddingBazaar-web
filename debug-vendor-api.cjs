const { Pool } = require('pg');

// Test the exact query that the backend should be running
async function testVendorQuery() {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_9tiyUmfaX3QB@ep-mute-mode-a1c209pi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  });

  try {
    console.log('Testing vendor booking query...');
    
    // Test the exact query from bookingService.ts
    const vendorId = '2-2025-003';
    const page = 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    console.log('Query parameters:', { vendorId, page, limit, offset });
    
    // This is the exact query from the backend
    const query = `
      SELECT *
      FROM comprehensive_bookings 
      WHERE vendor_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    console.log('Executing query:', query);
    console.log('With parameters:', [vendorId, limit, offset]);
    
    const result = await pool.query(query, [vendorId, limit, offset]);
    
    console.log(`Query returned ${result.rows.length} rows`);
    
    if (result.rows.length > 0) {
      console.log('Sample booking:', {
        id: result.rows[0].id,
        booking_reference: result.rows[0].booking_reference,
        vendor_id: result.rows[0].vendor_id,
        status: result.rows[0].status,
        created_at: result.rows[0].created_at
      });
    }
    
    // Also test the count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM comprehensive_bookings 
      WHERE vendor_id = $1
    `;
    
    const countResult = await pool.query(countQuery, [vendorId]);
    console.log('Total count:', countResult.rows[0].total);
    
    // Check if comprehensive_bookings table has the data
    const tableCheckQuery = `
      SELECT COUNT(*) as total, vendor_id
      FROM comprehensive_bookings 
      WHERE vendor_id = $1
      GROUP BY vendor_id
    `;
    
    const tableCheck = await pool.query(tableCheckQuery, [vendorId]);
    console.log('Table check result:', tableCheck.rows);
    
    // Check what's in the comprehensive_bookings table
    const allVendorsQuery = `
      SELECT vendor_id, COUNT(*) as count
      FROM comprehensive_bookings 
      GROUP BY vendor_id
      ORDER BY count DESC
      LIMIT 10
    `;
    
    const allVendors = await pool.query(allVendorsQuery);
    console.log('All vendors in comprehensive_bookings:', allVendors.rows);
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await pool.end();
  }
}

testVendorQuery();
