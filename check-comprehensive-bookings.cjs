const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkComprehensiveBookings() {
  try {
    console.log('🔍 Checking comprehensive_bookings table...');
    const count = await sql`SELECT COUNT(*) as count FROM comprehensive_bookings`;
    console.log('comprehensive_bookings count:', count[0].count);
    
    if (count[0].count > 0) {
      const sample = await sql`SELECT * FROM comprehensive_bookings LIMIT 1`;
      console.log('Sample from comprehensive_bookings:', JSON.stringify(sample[0], null, 2));
    }
    
    console.log('\n🔍 Checking regular bookings table...');
    const regularCount = await sql`SELECT COUNT(*) as count FROM bookings`;
    console.log('bookings count:', regularCount[0].count);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkComprehensiveBookings();
