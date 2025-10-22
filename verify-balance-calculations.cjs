const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function verifyBalanceCalculations() {
  console.log('🔍 BALANCE CALCULATION VERIFICATION\n');
  console.log('='.repeat(60));
  
  // Get both bookings with receipts
  const bookingsQuery = await sql`
    SELECT 
      b.id,
      b.service_name,
      b.status,
      b.amount as total_amount,
      b.total_paid,
      b.remaining_balance,
      b.downpayment_amount,
      b.payment_progress,
      COUNT(r.id) as receipt_count,
      STRING_AGG(r.receipt_number, ', ') as receipts,
      STRING_AGG(CAST(r.amount AS TEXT), ' + ') as receipt_amounts
    FROM bookings b
    LEFT JOIN receipts r ON CAST(b.id AS TEXT) = r.booking_id
    WHERE b.couple_id = '1-2025-001'
    GROUP BY b.id, b.service_name, b.status, b.amount, b.total_paid, b.remaining_balance, b.downpayment_amount, b.payment_progress
    ORDER BY b.created_at DESC
  `;
  
  console.log(`\n📊 Found ${bookingsQuery.length} bookings:\n`);
  
  bookingsQuery.forEach((booking, index) => {
    const totalAmount = parseFloat(booking.total_amount || '0');
    const totalPaid = parseFloat(booking.total_paid || '0');
    const remaining = parseFloat(booking.remaining_balance || '0');
    const progress = parseFloat(booking.payment_progress || '0');
    
    console.log(`\n${index + 1}. ${booking.service_name} (ID: ${booking.id})`);
    console.log('─'.repeat(60));
    console.log(`   Status: ${booking.status}`);
    console.log(`   Total Amount: ₱${totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`);
    console.log(`   Total Paid: ₱${totalPaid.toLocaleString('en-PH', { minimumFractionDigits: 2 })} (${progress.toFixed(0)}%)`);
    console.log(`   Remaining Balance: ₱${remaining.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`);
    console.log(`   Receipts: ${booking.receipt_count || 0}`);
    
    if (booking.receipt_count > 0) {
      console.log(`   Receipt Numbers: ${booking.receipts}`);
      const amounts = booking.receipt_amounts?.split(' + ').map(a => parseInt(a) / 100) || [];
      console.log(`   Receipt Amounts: ${amounts.map(a => `₱${a.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`).join(' + ')}`);
      const receiptTotal = amounts.reduce((sum, amt) => sum + amt, 0);
      console.log(`   Receipt Total: ₱${receiptTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`);
      
      // Verification
      if (Math.abs(receiptTotal - totalPaid) < 1) {
        console.log('   ✅ Receipts match total_paid');
      } else {
        console.log(`   ⚠️ Mismatch: Receipts (₱${receiptTotal}) vs Total Paid (₱${totalPaid})`);
      }
      
      if (Math.abs((totalAmount - totalPaid) - remaining) < 1) {
        console.log('   ✅ remaining_balance calculation correct');
      } else {
        console.log(`   ⚠️ Balance mismatch: Expected ₱${(totalAmount - totalPaid).toFixed(2)}, Got ₱${remaining.toFixed(2)}`);
      }
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Verification complete!\n');
  
  // Summary
  const summary = {
    totalBookings: bookingsQuery.length,
    withReceipts: bookingsQuery.filter(b => b.receipt_count > 0).length,
    fullyPaid: bookingsQuery.filter(b => parseFloat(b.remaining_balance || '0') === 0).length,
    partiallyPaid: bookingsQuery.filter(b => {
      const paid = parseFloat(b.total_paid || '0');
      const remaining = parseFloat(b.remaining_balance || '0');
      return paid > 0 && remaining > 0;
    }).length,
    unpaid: bookingsQuery.filter(b => parseFloat(b.total_paid || '0') === 0).length
  };
  
  console.log('📈 Summary:');
  console.log(`   Total Bookings: ${summary.totalBookings}`);
  console.log(`   With Receipts: ${summary.withReceipts}`);
  console.log(`   Fully Paid: ${summary.fullyPaid}`);
  console.log(`   Partially Paid: ${summary.partiallyPaid}`);
  console.log(`   Unpaid: ${summary.unpaid}`);
  console.log();
}

verifyBalanceCalculations().catch(console.error);
