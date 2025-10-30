const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkBooking() {
  try {
    const bookingId = process.argv[2] || '9f0a34e3-2c93-4f93-8bb4-54f6cbfcf1c7';
    
    console.log('📊 DATABASE QUERY RESULTS:');
    console.log('='.repeat(80));
    console.log('Checking Booking ID:', bookingId);
    console.log('');
    
    // Get booking details
    const booking = await sql`
      SELECT 
        id,
        booking_reference,
        status,
        amount,
        total_paid,
        remaining_balance,
        vendor_completed,
        vendor_completed_at,
        couple_completed,
        couple_completed_at,
        fully_completed,
        fully_completed_at,
        completion_notes,
        created_at,
        updated_at
      FROM bookings
      WHERE id = ${bookingId}
      LIMIT 1
    `;
    
    if (booking.length === 0) {
      console.log('❌ Booking not found!');
      return;
    }
    
    const b = booking[0];
    
    console.log('📋 BOOKING BASIC INFO:');
    console.log('  ID:', b.id);
    console.log('  Reference:', b.booking_reference);
    console.log('  Status:', b.status);
    console.log('  Created:', b.created_at);
    console.log('  Updated:', b.updated_at);
    console.log('');
    
    console.log('💰 PAYMENT INFO:');
    console.log('  Amount:', b.amount ? `₱${parseFloat(b.amount).toFixed(2)}` : 'N/A');
    console.log('  Total Paid:', b.total_paid ? `₱${parseFloat(b.total_paid).toFixed(2)}` : 'N/A');
    console.log('  Remaining:', b.remaining_balance ? `₱${parseFloat(b.remaining_balance).toFixed(2)}` : 'N/A');
    console.log('');
    
    console.log('✅ COMPLETION FLAGS:');
    console.log('  Vendor Completed:', b.vendor_completed ? '✅ YES' : '❌ NO');
    if (b.vendor_completed_at) {
      console.log('    Completed At:', b.vendor_completed_at);
    }
    
    console.log('  Couple Completed:', b.couple_completed ? '✅ YES' : '❌ NO');
    if (b.couple_completed_at) {
      console.log('    Completed At:', b.couple_completed_at);
    }
    
    console.log('  Fully Completed:', b.fully_completed ? '✅ YES' : '❌ NO');
    if (b.fully_completed_at) {
      console.log('    Completed At:', b.fully_completed_at);
    }
    
    if (b.completion_notes) {
      console.log('  Notes:', b.completion_notes);
    }
    console.log('');
    
    console.log('🎯 COMPLETION STATUS SUMMARY:');
    console.log('='.repeat(80));
    
    if (b.status === 'completed' && b.vendor_completed && b.couple_completed && b.fully_completed) {
      console.log('✅ FULLY COMPLETED: Both vendor and couple confirmed, status is completed');
    } else if (b.vendor_completed && b.couple_completed) {
      console.log('⚠️  WARNING: Both confirmed but status is NOT completed!');
      console.log('   Expected: status = "completed"');
      console.log('   Actual: status = "' + b.status + '"');
    } else if (b.vendor_completed && !b.couple_completed) {
      console.log('⏳ PARTIALLY COMPLETE: Vendor confirmed, waiting for couple');
    } else if (!b.vendor_completed && b.couple_completed) {
      console.log('⏳ PARTIALLY COMPLETE: Couple confirmed, waiting for vendor');
    } else {
      console.log('⏳ NOT COMPLETED: Neither party has confirmed yet');
      if (b.status === 'completed') {
        console.log('❌ ERROR: Status is "completed" but no completion flags set!');
      }
    }
    console.log('');
    
    // Check wallet transactions
    console.log('💰 WALLET TRANSACTIONS:');
    console.log('='.repeat(80));
    
    const transactions = await sql`
      SELECT 
        transaction_id,
        transaction_type,
        amount,
        status,
        description,
        created_at
      FROM wallet_transactions
      WHERE booking_id = ${bookingId}
      ORDER BY created_at DESC
    `;
    
    if (transactions.length === 0) {
      console.log('❌ No wallet transactions found for this booking');
      if (b.status === 'completed') {
        console.log('⚠️  WARNING: Booking is marked completed but no wallet transaction exists!');
      }
    } else {
      console.log(`✅ Found ${transactions.length} transaction(s):`);
      transactions.forEach((t, i) => {
        console.log(`\n  Transaction ${i + 1}:`);
        console.log('    ID:', t.transaction_id);
        console.log('    Type:', t.transaction_type);
        console.log('    Amount:', `₱${parseFloat(t.amount).toFixed(2)}`);
        console.log('    Status:', t.status);
        console.log('    Description:', t.description);
        console.log('    Created:', t.created_at);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 Database check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkBooking();
