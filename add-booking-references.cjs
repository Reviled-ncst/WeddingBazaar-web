/**
 * Add booking_reference column and generate user-friendly references
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './backend-deploy/.env' });

const sql = neon(process.env.DATABASE_URL);

async function addBookingReferences() {
  try {
    console.log('🔧 Adding booking_reference column to database...\n');

    // Check if column exists
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'booking_reference'
    `;

    if (columns.length === 0) {
      console.log('📝 Creating booking_reference column...');
      await sql`
        ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(50) UNIQUE
      `;
      console.log('✅ Column created\n');
    } else {
      console.log('✅ booking_reference column already exists\n');
    }

    // Get all bookings without references
    const bookings = await sql`
      SELECT id, created_at, booking_reference
      FROM bookings 
      ORDER BY created_at ASC
    `;

    console.log(`📊 Found ${bookings.length} booking(s)\n`);
    console.log('🔄 Generating user-friendly references...\n');

    let updated = 0;
    
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      
      if (!booking.booking_reference) {
        const createdDate = new Date(booking.created_at);
        const year = createdDate.getFullYear();
        const sequentialNumber = String(i + 1).padStart(3, '0');
        const reference = `WB-${year}-${sequentialNumber}`;
        
        await sql`
          UPDATE bookings 
          SET booking_reference = ${reference}
          WHERE id = ${booking.id}
        `;

        console.log(`✅ Updated booking ${booking.id}`);
        console.log(`   Old: WB${booking.id} ❌`);
        console.log(`   New: ${reference} ✅`);
        console.log('');
        
        updated++;
      } else {
        console.log(`⏭️  Skipped booking ${booking.id} - already has reference: ${booking.booking_reference}`);
      }
    }

    console.log('='.repeat(80));
    console.log(`✅ Reference generation complete!`);
    console.log(`   Updated: ${updated} booking(s)`);
    console.log(`   Skipped: ${bookings.length - updated} booking(s)`);
    console.log('='.repeat(80));

    // Verify results
    console.log('\n🔍 Verifying new references...\n');
    const verified = await sql`
      SELECT id, booking_reference, service_name, created_at
      FROM bookings 
      ORDER BY booking_reference ASC
    `;

    console.log('📋 BOOKING REFERENCES:');
    verified.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.booking_reference} → Booking ID: ${b.id}`);
      console.log(`      Service: ${b.service_name}`);
      console.log(`      Created: ${new Date(b.created_at).toLocaleString()}`);
      console.log('');
    });

    console.log('💡 NEXT STEP:');
    console.log('   Update the frontend to display booking_reference instead of "WB + ID"');
    console.log('   Users will now see: WB-2025-001 instead of WB1760666640 ✅\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

addBookingReferences();
