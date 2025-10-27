/**
 * Check Final Booking Status in Database
 * Verify if booking 1761577140 has the correct status field
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkBookingStatus() {
  try {
    console.log('📊 Checking booking 1761577140 status in database...\n');

    const booking = await sql`
      SELECT 
        id,
        status,
        vendor_completed,
        couple_completed,
        fully_completed,
        vendor_completed_at,
        couple_completed_at,
        fully_completed_at,
        updated_at
      FROM bookings 
      WHERE id = '1761577140'
    `;

    if (booking.length === 0) {
      console.log('❌ Booking not found!');
      return;
    }

    const b = booking[0];
    console.log('Current Database State:');
    console.log('========================');
    console.log(`ID: ${b.id}`);
    console.log(`Status: ${b.status}`);
    console.log(`Vendor Completed: ${b.vendor_completed}`);
    console.log(`Couple Completed: ${b.couple_completed}`);
    console.log(`Fully Completed: ${b.fully_completed}`);
    console.log(`Vendor Completed At: ${b.vendor_completed_at}`);
    console.log(`Couple Completed At: ${b.couple_completed_at}`);
    console.log(`Fully Completed At: ${b.fully_completed_at}`);
    console.log(`Updated At: ${b.updated_at}`);

    console.log('\n\nAnalysis:');
    console.log('========================');
    
    const bothCompleted = b.vendor_completed && b.couple_completed;
    const statusCorrect = b.status === 'completed';
    const fullyCompletedFlag = b.fully_completed === true;

    console.log(`✓ Both parties completed: ${bothCompleted ? '✅ YES' : '❌ NO'}`);
    console.log(`✓ Status is 'completed': ${statusCorrect ? '✅ YES' : '❌ NO (Currently: ' + b.status + ')'}`);
    console.log(`✓ Fully completed flag: ${fullyCompletedFlag ? '✅ YES' : '❌ NO'}`);

    if (bothCompleted && !statusCorrect) {
      console.log('\n⚠️ ISSUE DETECTED: Both parties confirmed but status is not "completed"!');
      console.log('This booking needs to be fixed.');
    } else if (bothCompleted && statusCorrect && fullyCompletedFlag) {
      console.log('\n✅ ALL CORRECT: Booking is properly marked as completed!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBookingStatus();
