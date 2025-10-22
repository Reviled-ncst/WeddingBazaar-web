const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkData() {
  console.log('📊 Checking current data...\n');
  
  // Check bookings
  const bookings = await sql`
    SELECT id, service_name, status, total_paid, remaining_balance, created_at 
    FROM bookings 
    ORDER BY created_at DESC 
    LIMIT 5
  `;
  console.log(`Found ${bookings.length} recent bookings:`);
  bookings.forEach(b => {
    console.log(`  - ${b.id} | ${b.service_name || 'N/A'} | ${b.status} | Paid: ₱${b.total_paid || 0} | Remaining: ₱${b.remaining_balance || 0}`);
  });
  
  // Check receipts
  const receipts = await sql`SELECT * FROM receipts ORDER BY created_at DESC LIMIT 5`;
  console.log(`\nFound ${receipts.length} recent receipts:`);
  receipts.forEach(r => {
    console.log(`  - ${r.receipt_number} | Booking: ${r.booking_id} | Amount: ₱${r.amount / 100} | Type: ${r.payment_type}`);
  });
  
  // Check paid bookings without receipts
  const paidNoReceipt = await sql`
    SELECT b.id, b.service_name, b.status, b.total_paid, b.downpayment_amount
    FROM bookings b
    LEFT JOIN receipts r ON CAST(b.id AS TEXT) = r.booking_id
    WHERE b.total_paid > 0 
      AND r.id IS NULL
    LIMIT 5
  `;
  console.log(`\nFound ${paidNoReceipt.length} paid bookings without receipts:`);
  paidNoReceipt.forEach(b => {
    console.log(`  - ${b.id} | ${b.service_name || 'N/A'} | Status: ${b.status} | Paid: ₱${b.total_paid}`);
  });
}

checkData().catch(console.error);
