// Check booking and receipt status for booking 1761032699
const { sql } = require('./backend-deploy/config/database.cjs');

async function checkBookingAndReceipts() {
  console.log('🔍 Investigating Booking: 1761032699');
  console.log('');

  try {
    // Get booking details
    const booking = await sql`
      SELECT 
        id,
        couple_id,
        vendor_id,
        status,
        amount,
        total_paid,
        remaining_balance,
        downpayment_amount,
        payment_method,
        transaction_id,
        payment_amount,
        payment_type,
        last_payment_date,
        created_at,
        updated_at
      FROM bookings
      WHERE id = '1761032699'
    `;

    if (booking.length === 0) {
      console.log('❌ Booking not found!');
      return;
    }

    console.log('📋 BOOKING DETAILS:');
    console.log(JSON.stringify(booking[0], null, 2));
    console.log('');

    // Get receipts for this booking
    const receipts = await sql`
      SELECT 
        id,
        receipt_number,
        booking_id,
        couple_id,
        vendor_id,
        payment_method,
        amount_paid,
        total_amount,
        transaction_reference,
        description,
        payment_status,
        created_at
      FROM receipts
      WHERE booking_id = '1761032699'
      ORDER BY created_at DESC
    `;

    console.log('🧾 RECEIPTS FOUND:', receipts.length);
    if (receipts.length > 0) {
      console.log(JSON.stringify(receipts, null, 2));
    } else {
      console.log('❌ NO RECEIPTS FOUND FOR THIS BOOKING!');
    }
    console.log('');

    // Analysis
    console.log('📊 ANALYSIS:');
    console.log(`Status: ${booking[0].status}`);
    console.log(`Transaction ID: ${booking[0].transaction_id}`);
    console.log(`Payment Amount: ₱${booking[0].payment_amount}`);
    console.log(`Total Paid: ₱${booking[0].total_paid}`);
    console.log(`Last Payment: ${booking[0].last_payment_date}`);
    console.log(`Receipts in DB: ${receipts.length}`);
    console.log('');

    if (booking[0].status === 'fully_paid' && receipts.length === 0) {
      console.log('⚠️ PROBLEM IDENTIFIED:');
      console.log('  - Booking marked as fully_paid');
      console.log('  - Payment transaction ID exists');
      console.log('  - But NO receipt was created in database');
      console.log('  - This means receipt creation failed during payment processing');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkBookingAndReceipts();
