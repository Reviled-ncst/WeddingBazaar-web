/**
 * Clean up duplicate and corrupt receipts
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function cleanup() {
  console.log('🧹 Cleaning up receipts database...\n');

  // Delete the duplicate receipts from the first failed run
  console.log('Deleting duplicate receipts from first run...');
  await sql`
    DELETE FROM receipts 
    WHERE id IN (
      '0b384600-54b1-4a92-a1cd-f72db49f34bd',
      '2b4e52ae-1523-4b6f-ac9b-2168c1b57399'
    )
  `;

  // Delete the corrupt receipt from the bad booking
  console.log('Deleting corrupt receipt from bad booking...');
  await sql`
    DELETE FROM receipts 
    WHERE id = '9e3e2a43-ec3d-4994-9826-20ba5ce517ed'
  `;

  // Delete the corrupt booking itself
  console.log('Deleting corrupt booking #1761024060...');
  await sql`
    DELETE FROM bookings
    WHERE id = 1761024060
  `;

  console.log('\n✅ Cleanup complete!\n');

  // Verify final state
  const receipts = await sql`SELECT COUNT(*) as count FROM receipts`;
  const bookings = await sql`
    SELECT id, status, amount, total_paid, receipt_number
    FROM bookings
    WHERE total_paid > 0
  `;

  console.log('📊 Final Status:');
  console.log(`   Total receipts: ${receipts[0].count}`);
  console.log(`   Paid bookings: ${bookings.length}\n`);

  for (const b of bookings) {
    console.log(`   Booking #${b.id}:`);
    console.log(`     Status: ${b.status}`);
    console.log(`     Total: ₱${parseFloat(b.amount).toFixed(2)}`);
    console.log(`     Paid: ₱${parseFloat(b.total_paid).toFixed(2)}`);
    console.log(`     Receipt: ${b.receipt_number}`);
  }

  process.exit(0);
}

cleanup().catch(console.error);
