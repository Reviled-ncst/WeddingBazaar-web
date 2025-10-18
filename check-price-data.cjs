/**
 * Check booking price range fields
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './backend-deploy/.env' });

const sql = neon(process.env.DATABASE_URL);

async function checkPriceData() {
  const bookings = await sql`
    SELECT 
      id,
      booking_reference,
      budget_range,
      estimated_cost_min,
      estimated_cost_max,
      estimated_cost_currency,
      total_amount,
      deposit_amount
    FROM bookings
    ORDER BY booking_reference
  `;

  console.log('📊 Booking Price Data:\n');
  
  bookings.forEach(b => {
    console.log(`${b.booking_reference}:`);
    console.log(`  Budget Range:        ${b.budget_range || 'NULL'}`);
    console.log(`  Estimated Min:       ${b.estimated_cost_min || 'NULL'}`);
    console.log(`  Estimated Max:       ${b.estimated_cost_max || 'NULL'}`);
    console.log(`  Currency:            ${b.estimated_cost_currency || 'NULL'}`);
    console.log(`  Total Amount:        ${b.total_amount || 'NULL'}`);
    console.log(`  Deposit Amount:      ${b.deposit_amount || 'NULL'}`);
    console.log('');
  });

  console.log('💡 Should we display budget_range in the UI?');
}

checkPriceData();
