/**
 * Generate receipts ONLY for good booking data
 * Manual fix for corrupt booking required separately
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function generateReceiptNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RCP-${timestamp}-${random}`;
}

async function generateReceipts() {
  console.log('🔧 Generating receipts for GOOD booking only...\n');

  // Only process the good booking (#1761028103)
  const goodBooking = await sql`
    SELECT 
      b.id as booking_id,
      b.status,
      b.amount,
      b.total_paid,
      b.downpayment_amount,
      b.remaining_balance,
      b.payment_method,
      b.payment_intent_id,
      b.transaction_id,
      b.last_payment_date,
      b.couple_id,
      b.couple_name,
      b.contact_email,
      b.vendor_id,
      b.service_type,
      b.event_date
    FROM bookings b
    WHERE b.id = 1761028103
  `;

  if (goodBooking.length === 0) {
    console.log('❌ Good booking not found');
    return;
  }

  const booking = goodBooking[0];

  console.log(`✅ Processing Booking #${booking.booking_id}`);
  console.log(`   Total: ₱${parseFloat(booking.amount).toFixed(2)}`);
  console.log(`   Paid: ₱${parseFloat(booking.total_paid).toFixed(2)}`);
  console.log(`   Downpayment: ₱${parseFloat(booking.downpayment_amount || 0).toFixed(2)}`);

  // Convert DECIMAL to centavos (multiply by 100)
  const downpaymentCentavos = Math.round(parseFloat(booking.downpayment_amount || 0) * 100);
  const totalPaidCentavos = Math.round(parseFloat(booking.total_paid) * 100);
  const totalAmountCentavos = Math.round(parseFloat(booking.amount) * 100);
  const balanceCentavos = totalPaidCentavos - downpaymentCentavos;

  const receipts = [];

  // Generate deposit receipt
  if (downpaymentCentavos > 0) {
    const receiptNum = await generateReceiptNumber();
    console.log(`\n💰 Deposit Receipt: ${receiptNum}`);
    console.log(`   Amount: ₱${(downpaymentCentavos / 100).toFixed(2)}`);

    await sql`
      INSERT INTO receipts (
        booking_id,
        receipt_number,
        payment_type,
        amount,
        currency,
        payment_method,
        payment_intent_id,
        paid_by,
        paid_by_name,
        paid_by_email,
        total_paid,
        remaining_balance,
        notes,
        metadata,
        created_at
      ) VALUES (
        ${booking.booking_id.toString()},
        ${receiptNum},
        'deposit',
        ${downpaymentCentavos},
        'PHP',
        ${booking.payment_method || 'card'},
        ${booking.payment_intent_id},
        ${booking.couple_id},
        ${booking.couple_name},
        ${booking.contact_email},
        ${downpaymentCentavos},
        ${totalAmountCentavos - downpaymentCentavos},
        'Deposit payment',
        ${JSON.stringify({
          booking_id: booking.booking_id,
          vendor_id: booking.vendor_id,
          service_type: booking.service_type,
          event_date: booking.event_date
        })},
        ${booking.last_payment_date || new Date().toISOString()}
      )
    `;

    receipts.push(receiptNum);
    console.log(`   ✅ Created`);
  }

  // Generate balance receipt
  if (balanceCentavos > 0) {
    const receiptNum = await generateReceiptNumber();
    console.log(`\n💰 Balance Receipt: ${receiptNum}`);
    console.log(`   Amount: ₱${(balanceCentavos / 100).toFixed(2)}`);

    await sql`
      INSERT INTO receipts (
        booking_id,
        receipt_number,
        payment_type,
        amount,
        currency,
        payment_method,
        payment_intent_id,
        paid_by,
        paid_by_name,
        paid_by_email,
        total_paid,
        remaining_balance,
        notes,
        metadata,
        created_at
      ) VALUES (
        ${booking.booking_id.toString()},
        ${receiptNum},
        'balance',
        ${balanceCentavos},
        'PHP',
        ${booking.payment_method || 'card'},
        ${booking.transaction_id || booking.payment_intent_id},
        ${booking.couple_id},
        ${booking.couple_name},
        ${booking.contact_email},
        ${totalPaidCentavos},
        0,
        'Balance payment',
        ${JSON.stringify({
          booking_id: booking.booking_id,
          vendor_id: booking.vendor_id,
          service_type: booking.service_type,
          event_date: booking.event_date
        })},
        ${booking.last_payment_date || new Date().toISOString()}
      )
    `;

    receipts.push(receiptNum);
    console.log(`   ✅ Created`);
  }

  // Update booking with latest receipt
  if (receipts.length > 0) {
    await sql`
      UPDATE bookings
      SET receipt_number = ${receipts[receipts.length - 1]}
      WHERE id = ${booking.booking_id}
    `;

    console.log(`\n✅ Updated booking with receipt: ${receipts[receipts.length - 1]}`);
    console.log(`✅ Generated ${receipts.length} receipts`);
  }

  console.log('\n\n⚠️  CORRUPT BOOKING WARNING:');
  console.log('   Booking #1761024060 has corrupt data (payment_progress: 43000%)');
  console.log('   This booking needs manual correction in Neon SQL Editor');
  console.log('   Recommended action: DELETE this test booking and create new test');

  process.exit(0);
}

generateReceipts().catch(console.error);
