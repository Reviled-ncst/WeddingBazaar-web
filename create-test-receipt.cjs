#!/usr/bin/env node

/**
 * Create a test receipt for booking 1760962499 that has a deposit payment
 * This will verify the receipt viewing feature works
 */

const { neon } = require('@neondatabase/serverless');

async function createTestReceipt() {
  const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9tiyUmfaX3QB@ep-mute-mode-a1c209pi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

  console.log('🧾 ====================================');
  console.log('🧾 CREATING TEST RECEIPT');
  console.log('🧾 ====================================');

  try {
    // First, get the booking details
    console.log('\n📋 1. FETCHING BOOKING DETAILS');
    console.log('------------------------------');
    
    const booking = await sql`
      SELECT 
        b.*,
        v.business_name as vendor_name
      FROM bookings b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE b.id = 1760962499
    `;
    
    if (booking.length === 0) {
      console.error('❌ Booking 1760962499 not found!');
      return;
    }
    
    const bookingData = booking[0];
    console.log('✅ Booking found:', {
      id: bookingData.id,
      couple_id: bookingData.couple_id,
      vendor_id: bookingData.vendor_id,
      vendor_name: bookingData.vendor_name,
      status: bookingData.status,
      notes: bookingData.vendor_notes?.substring(0, 50) + '...'
    });
    
    // Extract payment info from notes
    const notes = bookingData.vendor_notes || '';
    const depositMatch = notes.match(/₱([0-9,]+)/);
    const transactionMatch = notes.match(/Transaction ID: ([a-zA-Z0-9_]+)/);
    
    const depositAmount = depositMatch ? parseFloat(depositMatch[1].replace(/,/g, '')) * 100 : 13500;
    const transactionId = transactionMatch ? transactionMatch[1] : 'pi_gV69xLoD7HHvSQNU45ewevC8';
    
    console.log('\n💰 Payment details extracted:');
    console.log(`   Amount: ₱${depositAmount / 100}`);
    console.log(`   Transaction: ${transactionId}`);
    
    // Generate receipt number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const receiptNumber = `WB-${today}-TEST1`;
    
    // Create receipt
    console.log('\n📋 2. CREATING RECEIPT');
    console.log('------------------------------');
    
    const receipt = await sql`
      INSERT INTO receipts (
        receipt_number,
        booking_id,
        couple_id,
        vendor_id,
        payment_type,
        payment_method,
        amount_paid,
        total_amount,
        tax_amount,
        payment_reference,
        notes,
        status,
        created_at
      ) VALUES (
        ${receiptNumber},
        ${bookingData.id},
        ${bookingData.couple_id},
        ${bookingData.vendor_id},
        'deposit',
        'card',
        ${depositAmount},
        ${depositAmount},
        0,
        ${transactionId},
        'Deposit payment received - Test receipt',
        'completed',
        NOW()
      )
      RETURNING *
    `;
    
    console.log('✅ Receipt created successfully!');
    console.log('\n📄 Receipt details:');
    console.log(`   Receipt #: ${receipt[0].receipt_number}`);
    console.log(`   Booking ID: ${receipt[0].booking_id}`);
    console.log(`   Amount: ₱${receipt[0].amount_paid / 100}`);
    console.log(`   Method: ${receipt[0].payment_method}`);
    console.log(`   Status: ${receipt[0].status}`);
    
    console.log('\n✅ Test receipt created! You can now test the "View Receipt" button.');
    console.log(`   URL: https://weddingbazaar-web.onrender.com/api/payment/receipts/${bookingData.id}`);
    
  } catch (error) {
    console.error('❌ Error creating test receipt:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  }
}

createTestReceipt();
