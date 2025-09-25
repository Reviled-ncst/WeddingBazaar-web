const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkTables() {
  try {
    console.log('📋 Checking all tables in database...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('Tables found:');
    tables.forEach(table => console.log('  -', table.table_name));
    
    console.log('\n🔍 Checking if comprehensive_bookings exists...');
    const compBookings = tables.find(t => t.table_name === 'comprehensive_bookings');
    console.log('comprehensive_bookings exists:', !!compBookings);
    
    console.log('\n🔍 Checking if bookings exists...');
    const bookings = tables.find(t => t.table_name === 'bookings');
    console.log('bookings exists:', !!bookings);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();
