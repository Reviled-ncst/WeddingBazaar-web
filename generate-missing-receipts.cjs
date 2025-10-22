/**
 * Generate Missing Receipts for Paid Bookings
 * 
 * This script:
 * 1. Finds all bookings with payments (total_paid > 0) but no receipts
 * 2. Generates receipts for each payment
 * 3. Updates the bookings table with receipt numbers
 * 
 * Run: node generate-missing-receipts.cjs
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function generateReceiptNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RCP-${timestamp}-${random}`;
}

async function generateMissingReceipts() {
  console.log('🔍 Scanning for bookings with payments but no receipts...\n');

  try {
    // Find all bookings with payments but no receipts
    const bookingsWithPayments = await sql`
      SELECT 
        b.id as booking_id,
        b.status,
        b.amount,
        b.total_paid,
        b.downpayment_amount,
        b.remaining_balance,
        b.payment_progress,
        b.payment_method,
        b.transaction_id,
        b.payment_intent_id,
        b.last_payment_date,
        b.couple_id,
        b.couple_name,
        b.contact_email,
        b.vendor_id,
        b.service_type,
        b.event_date
      FROM bookings b
      WHERE b.total_paid > 0
      AND b.id::text NOT IN (SELECT booking_id FROM receipts WHERE booking_id IS NOT NULL)
      ORDER BY b.last_payment_date DESC
    `;

    if (bookingsWithPayments.length === 0) {
      console.log('✅ No missing receipts found. All paid bookings have receipts.');
      return;
    }

    console.log(`📋 Found ${bookingsWithPayments.length} booking(s) with payments but no receipts:\n`);

    for (const booking of bookingsWithPayments) {
      console.log(`\n🎫 Processing Booking #${booking.booking_id}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Total Paid: ₱${(booking.total_paid / 100).toFixed(2)}`);
      console.log(`   Downpayment: ₱${booking.downpayment_amount ? (booking.downpayment_amount / 100).toFixed(2) : '0.00'}`);
      console.log(`   Progress: ${booking.payment_progress}%`);

      const receipts = [];

      // Convert DECIMAL amounts to INTEGER centavos for receipts table
      const downpaymentCentavos = Math.round(parseFloat(booking.downpayment_amount || 0) * 100);
      const totalPaidCentavos = Math.round(parseFloat(booking.total_paid || 0) * 100);
      const totalAmountCentavos = Math.round(parseFloat(booking.amount || 0) * 100);
      const remainingBalanceCentavos = Math.round(parseFloat(booking.remaining_balance || 0) * 100);

      // Generate downpayment receipt if applicable
      if (downpaymentCentavos > 0) {
        const depositReceipt = await generateReceiptNumber();
        
        console.log(`   💰 Creating deposit receipt: ${depositReceipt}`);
        console.log(`   📊 Amount: ₱${(downpaymentCentavos / 100).toFixed(2)} (${downpaymentCentavos} centavos)`);
        
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
            ${depositReceipt},
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
            ${'Deposit payment (retroactively generated receipt)'},
            ${JSON.stringify({
              booking_id: booking.booking_id,
              vendor_id: booking.vendor_id,
              service_type: booking.service_type,
              event_date: booking.event_date,
              generated_retroactively: true,
              original_payment_date: booking.last_payment_date
            })},
            ${booking.last_payment_date || new Date().toISOString()}
          )
        `;

        receipts.push(depositReceipt);
      }

      // Generate balance/full payment receipt if applicable
      const balanceAmountCentavos = totalPaidCentavos - downpaymentCentavos;
      if (balanceAmountCentavos > 0) {
        const balanceReceipt = await generateReceiptNumber();
        const paymentType = downpaymentCentavos > 0 ? 'balance' : 'full';
        
        console.log(`   💰 Creating ${paymentType} payment receipt: ${balanceReceipt}`);
        console.log(`   📊 Amount: ₱${(balanceAmountCentavos / 100).toFixed(2)} (${balanceAmountCentavos} centavos)`);
        
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
            ${balanceReceipt},
            ${paymentType},
            ${balanceAmountCentavos},
            'PHP',
            ${booking.payment_method || 'card'},
            ${booking.transaction_id || booking.payment_intent_id},
            ${booking.couple_id},
            ${booking.couple_name},
            ${booking.contact_email},
            ${totalPaidCentavos},
            ${remainingBalanceCentavos},
            ${`${paymentType === 'balance' ? 'Balance' : 'Full'} payment (retroactively generated receipt)`},
            ${JSON.stringify({
              booking_id: booking.booking_id,
              vendor_id: booking.vendor_id,
              service_type: booking.service_type,
              event_date: booking.event_date,
              generated_retroactively: true,
              original_payment_date: booking.last_payment_date
            })},
            ${booking.last_payment_date || new Date().toISOString()}
          )
        `;

        receipts.push(balanceReceipt);
      }

      // Update booking with latest receipt number
      if (receipts.length > 0) {
        const latestReceipt = receipts[receipts.length - 1];
        await sql`
          UPDATE bookings
          SET receipt_number = ${latestReceipt}
          WHERE id = ${booking.booking_id}
        `;

        console.log(`   ✅ Updated booking with receipt: ${latestReceipt}`);
        console.log(`   📄 Generated ${receipts.length} receipt(s) total`);
      }
    }

    console.log('\n\n✅ RECEIPT GENERATION COMPLETE\n');

    // Verify results
    const receiptCount = await sql`SELECT COUNT(*) as count FROM receipts`;
    const bookingsWithReceipts = await sql`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE total_paid > 0 AND receipt_number IS NOT NULL
    `;

    console.log('📊 Final Status:');
    console.log(`   Total receipts in database: ${receiptCount[0].count}`);
    console.log(`   Paid bookings with receipts: ${bookingsWithReceipts[0].count}`);

  } catch (error) {
    console.error('❌ Error generating receipts:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Run the script
generateMissingReceipts()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
