/**
 * Check if completion columns exist in bookings table
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkCompletionColumns() {
  try {
    console.log('🔍 Checking completion columns in bookings table...\n');

    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      AND column_name LIKE '%complet%'
      ORDER BY ordinal_position
    `;

    if (columns.length === 0) {
      console.log('❌ NO COMPLETION COLUMNS FOUND!');
      console.log('\nRequired columns:');
      console.log('  - vendor_completed (boolean)');
      console.log('  - vendor_completed_at (timestamp)');
      console.log('  - couple_completed (boolean)');
      console.log('  - couple_completed_at (timestamp)');
      console.log('  - fully_completed (boolean)');
      console.log('  - fully_completed_at (timestamp)');
      console.log('  - completion_notes (text)');
      return;
    }

    console.log('✅ Found completion columns:\n');
    columns.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`);
    });

    // Check a sample booking
    console.log('\n🔍 Checking sample booking completion status...\n');
    const sampleBooking = await sql`
      SELECT 
        id,
        status,
        vendor_completed,
        vendor_completed_at,
        couple_completed,
        couple_completed_at,
        completion_notes
      FROM bookings
      WHERE status IN ('fully_paid', 'paid_in_full', 'completed')
      LIMIT 1
    `;

    if (sampleBooking.length > 0) {
      console.log('Sample booking:', JSON.stringify(sampleBooking[0], null, 2));
    } else {
      console.log('No fully paid bookings found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCompletionColumns();
