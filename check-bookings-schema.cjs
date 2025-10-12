const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL || 'postgresql://weddingbazaar_owner:CHYHZaobODwI@ep-empty-night-a5lhsw3t.us-east-2.aws.neon.tech/weddingbazaar?sslmode=require');

async function checkBookingsSchema() {
  try {
    console.log('🔍 Checking bookings table schema...');
    
    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Bookings table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if quote_sent_date exists
    const hasQuoteSentDate = columns.some(col => col.column_name === 'quote_sent_date');
    console.log(`\n📅 quote_sent_date column exists: ${hasQuoteSentDate}`);
    
    if (!hasQuoteSentDate) {
      console.log('\n⚠️  Need to add quote_sent_date column');
    }
    
    // Check current bookings
    const bookings = await sql`SELECT id, status, vendor_notes FROM bookings LIMIT 3`;
    console.log('\n📦 Sample bookings:');
    bookings.forEach(booking => {
      console.log(`  - ID: ${booking.id}, Status: ${booking.status}, Notes: ${booking.vendor_notes ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkBookingsSchema();
