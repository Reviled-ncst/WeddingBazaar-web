const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkPartiallyCompleted() {
  try {
    console.log('🔍 Searching for PARTIALLY completed bookings...\n');
    
    // Find bookings where couple completed but NOT fully completed
    const partialBookings = await sql`
      SELECT 
        id,
        booking_reference,
        status,
        vendor_completed,
        couple_completed,
        fully_completed,
        vendor_completed_at,
        couple_completed_at,
        fully_completed_at,
        updated_at
      FROM bookings
      WHERE (vendor_completed = TRUE OR couple_completed = TRUE)
        AND fully_completed = FALSE
      ORDER BY updated_at DESC
    `;
    
    console.log(`Found ${partialBookings.length} partially completed bookings:\n`);
    
    if (partialBookings.length === 0) {
      console.log('✅ NO PARTIALLY COMPLETED BOOKINGS FOUND!');
      console.log('This means the two-sided completion system is working correctly.');
      console.log('All bookings with any completion flag are fully completed.\n');
      
      // Check for bookings that should be status="completed" but aren't
      const incorrectStatus = await sql`
        SELECT 
          id,
          booking_reference,
          status,
          vendor_completed,
          couple_completed,
          fully_completed
        FROM bookings
        WHERE vendor_completed = TRUE 
          AND couple_completed = TRUE
          AND fully_completed = TRUE
          AND status != 'completed'
        ORDER BY updated_at DESC
      `;
      
      if (incorrectStatus.length > 0) {
        console.log(`⚠️  Found ${incorrectStatus.length} booking(s) with incorrect status:\n`);
        incorrectStatus.forEach((b, i) => {
          console.log(`${i + 1}. Booking ID: ${b.id}`);
          console.log(`   Status: ${b.status} (should be "completed")`);
          console.log(`   All flags: YES\n`);
        });
      } else {
        console.log('✅ All fully completed bookings have correct status!');
      }
      
    } else {
      partialBookings.forEach((b, i) => {
        console.log(`${i + 1}. Booking ID: ${b.id}`);
        console.log(`   Reference: ${b.booking_reference || 'N/A'}`);
        console.log(`   Status: ${b.status}`);
        console.log(`   Vendor Complete: ${b.vendor_completed ? `YES (${b.vendor_completed_at})` : 'NO'}`);
        console.log(`   Couple Complete: ${b.couple_completed ? `YES (${b.couple_completed_at})` : 'NO'}`);
        console.log(`   Fully Complete: ${b.fully_completed ? 'YES' : 'NO'}`);
        console.log(`   Updated: ${b.updated_at}`);
        console.log('');
        
        if (b.vendor_completed && b.couple_completed && !b.fully_completed) {
          console.log('   ❌ ERROR: Both parties confirmed but fully_completed = FALSE!');
        } else if (b.vendor_completed && !b.couple_completed) {
          console.log('   ⏳ Vendor confirmed, waiting for couple');
        } else if (!b.vendor_completed && b.couple_completed) {
          console.log('   ⏳ Couple confirmed, waiting for vendor');
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkPartiallyCompleted();
