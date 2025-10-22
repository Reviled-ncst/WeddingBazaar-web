/**
 * Inspect actual booking amounts to understand data corruption
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function inspectAmounts() {
  console.log('🔍 Inspecting booking amounts...\n');

  const bookings = await sql`
    SELECT 
      id,
      amount,
      total_paid,
      downpayment_amount,
      remaining_balance,
      payment_progress,
      status,
      pg_typeof(amount) as amount_type,
      pg_typeof(total_paid) as total_paid_type,
      pg_typeof(downpayment_amount) as downpayment_type
    FROM bookings
    WHERE total_paid > 0
  `;

  for (const b of bookings) {
    console.log(`\nBooking #${b.id}`);
    console.log(`  Status: ${b.status}`);
    console.log(`  Amount (${b.amount_type}): ${b.amount}`);
    console.log(`  Total Paid (${b.total_paid_type}): ${b.total_paid}`);
    console.log(`  Downpayment (${b.downpayment_type}): ${b.downpayment_amount}`);
    console.log(`  Remaining Balance: ${b.remaining_balance}`);
    console.log(`  Payment Progress: ${b.payment_progress}%`);
    console.log(`  ---`);
    console.log(`  As Centavos (if DECIMAL *100):`);
    console.log(`    Total Paid: ${Math.round(parseFloat(b.total_paid) * 100)} centavos`);
    console.log(`    Downpayment: ${Math.round(parseFloat(b.downpayment_amount || 0) * 100)} centavos`);
    console.log(`  As Already Centavos (raw):`);
    console.log(`    Total Paid: ${Math.round(parseFloat(b.total_paid))} centavos`);
    console.log(`    Downpayment: ${Math.round(parseFloat(b.downpayment_amount || 0))} centavos`);
  }

  process.exit(0);
}

inspectAmounts().catch(console.error);
