/**
 * Fix Fully Completed Flag for Existing Bookings
 * 
 * This script updates bookings where both vendor_completed AND couple_completed are TRUE
 * but fully_completed is still FALSE or NULL.
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixFullyCompletedFlag() {
  console.log('🔧 Fixing fully_completed flag for existing bookings...\n');

  try {
    // Find bookings that should be fully completed
    const bookingsToFix = await sql`
      SELECT 
        id,
        status,
        vendor_completed,
        couple_completed,
        fully_completed,
        vendor_completed_at,
        couple_completed_at
      FROM bookings
      WHERE vendor_completed = TRUE
        AND couple_completed = TRUE
        AND (fully_completed = FALSE OR fully_completed IS NULL)
    `;

    if (bookingsToFix.length === 0) {
      console.log('✅ No bookings need fixing. All completion flags are correct!');
      return;
    }

    console.log(`📋 Found ${bookingsToFix.length} booking(s) that need fixing:\n`);
    bookingsToFix.forEach(b => {
      console.log(`  Booking ${b.id}:`);
      console.log(`    - Status: ${b.status}`);
      console.log(`    - Vendor completed: ${b.vendor_completed} at ${b.vendor_completed_at}`);
      console.log(`    - Couple completed: ${b.couple_completed} at ${b.couple_completed_at}`);
      console.log(`    - Fully completed: ${b.fully_completed} (SHOULD BE TRUE)\n`);
    });

    // Fix each booking
    for (const booking of bookingsToFix) {
      console.log(`🔧 Fixing booking ${booking.id}...`);

      const updated = await sql`
        UPDATE bookings
        SET 
          fully_completed = TRUE,
          fully_completed_at = NOW(),
          status = CASE 
            WHEN status != 'completed' THEN 'completed'
            ELSE status
          END,
          updated_at = NOW()
        WHERE id = ${booking.id}
        RETURNING *
      `;

      if (updated.length > 0) {
        console.log(`✅ Fixed booking ${booking.id}:`);
        console.log(`   - Status: ${booking.status} → ${updated[0].status}`);
        console.log(`   - Fully completed: ${booking.fully_completed} → ${updated[0].fully_completed}`);
        console.log(`   - Fully completed at: ${updated[0].fully_completed_at}\n`);
      }
    }

    console.log(`\n🎉 Successfully fixed ${bookingsToFix.length} booking(s)!`);

    // Verify the fix
    const stillBroken = await sql`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE vendor_completed = TRUE
        AND couple_completed = TRUE
        AND (fully_completed = FALSE OR fully_completed IS NULL)
    `;

    if (stillBroken[0].count > 0) {
      console.log(`\n⚠️ Warning: ${stillBroken[0].count} bookings still have incorrect flags!`);
    } else {
      console.log('\n✅ All bookings are now correctly flagged!');
    }

  } catch (error) {
    console.error('❌ Error fixing fully_completed flag:', error);
    throw error;
  }
}

// Run the fix
fixFullyCompletedFlag()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
