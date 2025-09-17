require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkBookingData() {
  try {
    console.log('=== CHECKING BOOKINGS DATA ===\n');
    
    // Check comprehensive_bookings table
    const comprehensiveRes = await pool.query('SELECT id, couple_id, vendor_id, service_type, status, event_date, created_at FROM comprehensive_bookings ORDER BY created_at DESC LIMIT 10');
    console.log('📋 Comprehensive bookings:');
    console.table(comprehensiveRes.rows);
    
    // Check regular bookings table
    const regularRes = await pool.query('SELECT id, couple_id, vendor_id, service_type, status, event_date, created_at FROM bookings ORDER BY created_at DESC LIMIT 10');
    console.log('\n📅 Regular bookings:');
    console.table(regularRes.rows);
    
    // Check for specific user IDs
    const realUserRes = await pool.query("SELECT * FROM comprehensive_bookings WHERE couple_id = '1-2025-001'");
    console.log('\n🙋‍♂️ Real user (1-2025-001) bookings:');
    console.table(realUserRes.rows);
    
    const legacyUserRes = await pool.query("SELECT * FROM comprehensive_bookings WHERE couple_id = 'current-user-id'");
    console.log('\n👤 Legacy user (current-user-id) bookings:');
    console.table(legacyUserRes.rows);
    
    // Check current test user bookings
    const testUserRes = await pool.query("SELECT * FROM comprehensive_bookings WHERE couple_id LIKE 'c-%'");
    console.log('\n🧪 Test user (c-*) bookings:');
    console.table(testUserRes.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkBookingData();
