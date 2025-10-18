/**
 * Add sample budget ranges to bookings
 * So we can see the budget range display feature in action
 */

require('dotenv').config({ path: 'backend-deploy/.env' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addBudgetRanges() {
  try {
    console.log('💰 Adding budget ranges to bookings...\n');

    // Sample budget ranges for different service types
    const budgetRanges = [
      '$1,000 - $2,500',
      '$2,500 - $5,000',
      '$5,000 - $10,000',
      '$500 - $1,500',
      '$3,000 - $7,500',
      '$10,000 - $25,000'
    ];

    // Get all bookings
    const bookings = await sql`SELECT id, booking_reference, service_type FROM bookings ORDER BY id`;
    
    console.log(`📋 Found ${bookings.length} bookings\n`);

    // Update each booking with a random budget range
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const budgetRange = budgetRanges[i % budgetRanges.length];
      
      await sql`
        UPDATE bookings 
        SET budget_range = ${budgetRange}
        WHERE id = ${booking.id}
      `;
      
      console.log(`✅ ${booking.booking_reference}: ${budgetRange}`);
    }

    console.log('\n🎉 Budget ranges added successfully!');
    console.log('\n📊 Verifying data:');
    
    const updated = await sql`
      SELECT booking_reference, service_type, budget_range 
      FROM bookings 
      ORDER BY id
    `;
    
    updated.forEach(b => {
      console.log(`   ${b.booking_reference} (${b.service_type}): ${b.budget_range}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addBudgetRanges();
