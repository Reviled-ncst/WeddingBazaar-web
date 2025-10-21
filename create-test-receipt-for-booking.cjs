#!/usr/bin/env node

/**
 * Create a test receipt for booking 1760962499 that already has deposit_paid status
 */

const { neon } = require('@neondatabase/serverless');

async function createTestReceipt() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('🧾 ====================================');
  console.log('🧾 CREATING TEST RECEIPT FOR BOOKING 1760962499');
  console.log('🧾 ====================================\n');

  try {
    // First, get the booking details
    console.log('📋 1. Fetching booking details...');
    const bookings = await sql`
      SELECT id, couple_id, vendor_id, service_type, event_date
      FROM bookings
      WHERE id = 1760962499
    `;

    if (bookings.length === 0) {
      console.error('❌ Booking 1760962499 not found!');
      return;
    }

    const booking = bookings[0];
    console.log('✅ Booking found:', booking);

    // Generate receipt number
    const receiptNumber = `WB-2025-${Date.now().toString().slice(-6)}`;
    
    // Create the receipt
    console.log('\n📋 2. Creating receipt...');
    const receipt = await sql`
      INSERT INTO receipts (
        receipt_number,
        booking_id,
        couple_id,
        vendor_id,
        amount_paid,
        total_amount,
        tax_amount,
        payment_method,
        payment_status,
        transaction_reference,
        description,
        metadata,
        payment_date,
        created_at,
        updated_at
      ) VALUES (
        ${receiptNumber},
        ${booking.id},
        ${booking.couple_id},
        ${booking.vendor_id},
        1350000,
        1350000,
        0,
        'card',
        'completed',
        'pi_gV69xLoD7HHvSQNU45ewevC8',
        'Deposit payment for Test Wedding Photography',
        ${{
          payment_type: 'deposit',
          created_by: 'manual_test',
          original_amount: 13500
        }},
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    if (receipt.length === 0) {
      console.error('❌ Failed to create receipt');
      return;
    }

    console.log('✅ Receipt created successfully!');
    console.log('\n📄 Receipt Details:');
    console.log('   Receipt Number:', receipt[0].receipt_number);
    console.log('   Booking ID:', receipt[0].booking_id);
    console.log('   Amount Paid:', `₱${receipt[0].amount_paid / 100}`);
    console.log('   Payment Method:', receipt[0].payment_method);
    console.log('   Status:', receipt[0].payment_status);
    console.log('   Created At:', receipt[0].created_at);

    // Verify the receipt can be fetched
    console.log('\n📋 3. Verifying receipt can be fetched...');
    const fetchedReceipts = await sql`
      SELECT 
        r.*,
        b.service_type,
        b.event_date,
        v.business_name as vendor_name
      FROM receipts r
      LEFT JOIN bookings b ON r.booking_id = b.id::varchar
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE r.booking_id = '1760962499'
    `;

    console.log(`✅ Found ${fetchedReceipts.length} receipt(s) for booking 1760962499`);
    if (fetchedReceipts.length > 0) {
      console.log('\n📄 Receipt can be fetched successfully:');
      console.log('   Receipt Number:', fetchedReceipts[0].receipt_number);
      console.log('   Vendor Name:', fetchedReceipts[0].vendor_name);
      console.log('   Service Type:', fetchedReceipts[0].service_type);
    }

    console.log('\n✅ SUCCESS! Receipt creation complete.');
    console.log('🎉 You can now test the "View Receipt" button in the UI!');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('   Message:', error.message);
    console.error('   Details:', error.detail);
  }
}

createTestReceipt();
