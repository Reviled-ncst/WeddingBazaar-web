/**
 * Add event locations to bookings to test currency conversion
 */

require('dotenv').config({ path: 'backend-deploy/.env' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addEventLocations() {
  try {
    console.log('📍 Adding event locations to bookings...\n');

    // Sample locations from different countries/regions
    const locations = [
      'Manila, Philippines',
      'Cebu City, Philippines',
      'Boracay, Philippines',
      'New York, USA',
      'Los Angeles, USA',
      'London, UK',
      'Paris, France',
      'Tokyo, Japan',
      'Singapore',
      'Sydney, Australia',
      'Bangkok, Thailand',
      'Bali, Indonesia',
      'Hong Kong',
      'Dubai, UAE',
      'Mexico City, Mexico'
    ];

    // Get all bookings
    const bookings = await sql`
      SELECT id, booking_reference, budget_range 
      FROM bookings 
      ORDER BY id
    `;
    
    console.log(`📋 Found ${bookings.length} bookings\n`);

    // Update each booking with a location
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const location = locations[i % locations.length];
      
      await sql`
        UPDATE bookings 
        SET event_location = ${location}
        WHERE id = ${booking.id}
      `;
      
      console.log(`✅ ${booking.booking_reference}:`);
      console.log(`   Location: ${location}`);
      console.log(`   Budget: ${booking.budget_range}`);
      console.log('');
    }

    console.log('🎉 Event locations added successfully!');
    console.log('\n📊 Verifying data:');
    
    const updated = await sql`
      SELECT booking_reference, event_location, budget_range 
      FROM bookings 
      ORDER BY id
    `;
    
    console.log('\n' + '='.repeat(80));
    updated.forEach(b => {
      console.log(`\n${b.booking_reference}:`);
      console.log(`  Location: ${b.event_location}`);
      console.log(`  Budget:   ${b.budget_range}`);
    });
    console.log('\n' + '='.repeat(80));
    
    console.log('\n💡 Now the budget ranges will be converted based on location!');
    console.log('   Example: If location is "Manila, Philippines", budget will show in PHP (₱)');
    console.log('   Example: If location is "Tokyo, Japan", budget will show in JPY (¥)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addEventLocations();
