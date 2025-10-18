/**
 * Analyze booking ID format and propose better reference system
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './backend-deploy/.env' });

const sql = neon(process.env.DATABASE_URL);

async function analyzeBookingIDs() {
  try {
    console.log('🔍 Analyzing booking ID format...\n');

    const bookings = await sql`
      SELECT 
        id,
        service_name,
        created_at
      FROM bookings 
      ORDER BY id ASC
    `;

    console.log('📊 CURRENT SITUATION:');
    console.log('='.repeat(100));
    
    bookings.forEach((booking, index) => {
      const timestamp = new Date(booking.id * 1000); // Convert to date if it's a timestamp
      const isTimestamp = booking.id > 1000000000 && booking.id < 2000000000;
      
      console.log(`\n${index + 1}. Booking ID: ${booking.id}`);
      console.log(`   Service: ${booking.service_name}`);
      console.log(`   Created: ${new Date(booking.created_at).toLocaleString()}`);
      console.log(`   Analysis:`);
      console.log(`   - Is this a timestamp? ${isTimestamp ? 'YES ⚠️' : 'NO'}`);
      if (isTimestamp) {
        console.log(`   - As date: ${timestamp.toLocaleString()}`);
        console.log(`   - Matches created_at? ${Math.abs(timestamp - new Date(booking.created_at)) < 1000 ? 'YES' : 'NO'}`);
      }
      console.log(`   - Frontend shows: WB${booking.id}`);
      console.log(`   - Is user-friendly? ${booking.id < 10000 ? 'YES' : 'NO ❌'}`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('\n❌ PROBLEM IDENTIFIED:');
    console.log('   Your booking IDs are UNIX TIMESTAMPS (seconds since 1970)');
    console.log('   This creates IDs like: 1760666640');
    console.log('   Frontend displays as: WB1760666640');
    console.log('   This is NOT user-friendly! ❌');

    console.log('\n✅ RECOMMENDED SOLUTION:');
    console.log('   Option 1: Use sequential IDs (1, 2, 3, 4...)');
    console.log('   Option 2: Use year-based format (2025-001, 2025-002...)');
    console.log('   Option 3: Keep timestamp but display better reference');

    console.log('\n📝 PROPOSED REFERENCE FORMATS:');
    console.log('   Current:    WB1760666640 ❌ (Too long, not memorable)');
    console.log('   Better:     WB-2025-001 ✅ (Year + sequential)');
    console.log('   Or:         WB25-0001 ✅ (Compact year + sequential)');
    console.log('   Or:         WB-00001 ✅ (Simple sequential)');

    console.log('\n🔄 WHAT WE CAN DO:');
    console.log('   1. Keep database IDs as timestamps (internal use)');
    console.log('   2. Add "booking_reference" column with user-friendly format');
    console.log('   3. Generate references like: WB-2025-001, WB-2025-002');
    console.log('   4. Display the friendly reference in UI instead of raw ID');

    console.log('\n💡 EXAMPLE:');
    console.log('   Database ID: 1760666640 (internal, not shown to users)');
    console.log('   Reference:   WB-2025-001 (shown in UI, receipts, emails)');
    console.log('   Users see:   WB-2025-001 ✅ (Clear and memorable!)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

analyzeBookingIDs();
