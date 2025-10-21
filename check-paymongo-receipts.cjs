/**
 * Check if there are any PayMongo-style receipts in the database
 */

const { neon } = require('@neondatabase/serverless');

async function checkForPayMongoReceipts() {
  const sql = neon(process.env.DATABASE_URL || 'postgresql://[your-database-url]');

  console.log('🔍 Checking for PayMongo receipts...\n');

  try {
    // Check if there's a separate receipts table with PayMongo schema
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%receipt%'
    `;

    console.log('📋 Receipt-related tables:');
    tableCheck.forEach(t => console.log(`  - ${t.table_name}`));

    // Check columns in receipts table
    console.log('\n📊 Columns in receipts table:');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'receipts'
      ORDER BY ordinal_position
    `;

    columns.forEach(c => {
      console.log(`  - ${c.column_name.padEnd(30)} ${c.data_type}`);
    });

    // Check booking 1760962499
    console.log('\n🔍 Checking booking 1760962499...');
    const booking = await sql`
      SELECT id, status, vendor_notes, created_at
      FROM bookings 
      WHERE id = 1760962499
    `;

    if (booking.length > 0) {
      console.log('✅ Booking found:');
      console.log(`  Status: ${booking[0].status}`);
      console.log(`  Notes: ${booking[0].vendor_notes}`);
      console.log(`  Created: ${booking[0].created_at}`);
    } else {
      console.log('❌ Booking not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkForPayMongoReceipts().then(() => {
  console.log('\n✅ Check complete!');
  process.exit(0);
});
