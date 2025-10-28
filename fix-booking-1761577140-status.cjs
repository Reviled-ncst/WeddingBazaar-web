/**
 * Manually fix status for booking 1761577140
 * The booking has all completion flags TRUE but status is still 'fully_paid'
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixBookingStatus() {
  try {
    console.log('🔧 Fixing booking status for 1761577140...\n');

    // Check current state
    const before = await sql`
      SELECT id, status, vendor_completed, couple_completed, fully_completed
      FROM bookings WHERE id = '1761577140'
    `;

    console.log('BEFORE:');
    console.log(`  Status: ${before[0].status}`);
    console.log(`  Vendor Completed: ${before[0].vendor_completed}`);
    console.log(`  Couple Completed: ${before[0].couple_completed}`);
    console.log(`  Fully Completed: ${before[0].fully_completed}\n`);

    // Update status to 'completed'
    const updated = await sql`
      UPDATE bookings
      SET status = 'completed', updated_at = NOW()
      WHERE id = '1761577140'
        AND vendor_completed = TRUE
        AND couple_completed = TRUE
        AND fully_completed = TRUE
        AND status != 'completed'
      RETURNING *
    `;

    if (updated.length === 0) {
      console.log('⚠️ No update needed or booking already has status "completed"');
      return;
    }

    console.log('✅ Status updated successfully!\n');
    console.log('AFTER:');
    console.log(`  Status: ${updated[0].status}`);
    console.log(`  Vendor Completed: ${updated[0].vendor_completed}`);
    console.log(`  Couple Completed: ${updated[0].couple_completed}`);
    console.log(`  Fully Completed: ${updated[0].fully_completed}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixBookingStatus();
