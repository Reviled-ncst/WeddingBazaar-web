/**
 * Fix existing bookings that have both completion flags but wrong status
 * This migrates bookings where:
 * - vendor_completed = TRUE
 * - couple_completed = TRUE
 * - BUT status is NOT 'completed'
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixCompletedBookingsStatus() {
  console.log('🔧 Fixing bookings with completion flags but wrong status...\n');

  try {
    // Find bookings that need fixing
    const brokenBookings = await sql`
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
        AND status != 'completed'
    `;

    console.log(`📊 Found ${brokenBookings.length} booking(s) that need status update\n`);

    if (brokenBookings.length === 0) {
      console.log('✅ No bookings need fixing!');
      return;
    }

    // Show what will be fixed
    console.log('📋 Bookings to fix:');
    brokenBookings.forEach(b => {
      console.log(`  - Booking ${b.id}: status="${b.status}" → will change to "completed"`);
    });

    console.log('\n🔄 Applying fix...\n');

    // Fix each booking
    for (const booking of brokenBookings) {
      const result = await sql`
        UPDATE bookings
        SET 
          status = 'completed',
          fully_completed = TRUE,
          fully_completed_at = COALESCE(fully_completed_at, NOW()),
          updated_at = NOW()
        WHERE id = ${booking.id}
        RETURNING id, status, fully_completed, fully_completed_at
      `;

      console.log(`✅ Fixed booking ${result[0].id}:`);
      console.log(`   Status: ${result[0].status}`);
      console.log(`   Fully Completed: ${result[0].fully_completed}`);
      console.log(`   Completed At: ${result[0].fully_completed_at}`);
      console.log('');
    }

    console.log('🎉 All bookings fixed!');
    console.log('\n📊 Summary:');
    console.log(`   Total fixed: ${brokenBookings.length}`);
    console.log(`   Status changed to: "completed"`);
    console.log(`   Flags updated: fully_completed = TRUE`);

  } catch (error) {
    console.error('❌ Error fixing bookings:', error);
    throw error;
  }
}

// Run the fix
console.log('🚀 Starting booking status fix...\n');
fixCompletedBookingsStatus()
  .then(() => {
    console.log('\n✅ Fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  });
