#!/usr/bin/env node

/**
 * Add payment tracking columns to bookings table
 * Run this script to add the missing payment tracking fields
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function addPaymentTrackingColumns() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('🔧 Adding payment tracking columns to bookings table...\n');

  try {
    // Add payment tracking columns if they don't exist
    console.log('1️⃣ Adding total_paid column...');
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS total_paid INTEGER DEFAULT 0
    `;
    console.log('✅ total_paid column added');

    console.log('\n2️⃣ Adding remaining_balance column...');
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS remaining_balance INTEGER
    `;
    console.log('✅ remaining_balance column added');

    console.log('\n3️⃣ Adding downpayment_amount column...');
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS downpayment_amount INTEGER
    `;
    console.log('✅ downpayment_amount column added');

    console.log('\n4️⃣ Adding payment_progress column...');
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_progress INTEGER DEFAULT 0
    `;
    console.log('✅ payment_progress column added');

    console.log('\n5️⃣ Adding last_payment_date column...');
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP
    `;
    console.log('✅ last_payment_date column added');

    console.log('\n6️⃣ Adding payment_method column...');
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)
    `;
    console.log('✅ payment_method column added');

    console.log('\n7️⃣ Adding transaction_id column...');
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255)
    `;
    console.log('✅ transaction_id column added');

    // Now update existing bookings with deposit to calculate their remaining balance
    console.log('\n8️⃣ Updating existing paid bookings...');
    
    // Find all bookings with status 'downpayment' and calculate their balances
    const paidBookings = await sql`
      SELECT id, amount, total_amount, downpayment_amount, status
      FROM bookings
      WHERE status IN ('downpayment', 'deposit_paid', 'downpayment_paid')
      AND total_paid IS NULL OR total_paid = 0
    `;

    console.log(`📊 Found ${paidBookings.length} bookings with deposit payments`);

    for (const booking of paidBookings) {
      const totalAmount = booking.total_amount || booking.amount || 0;
      const depositPaid = booking.downpayment_amount || Math.round(totalAmount * 0.3);
      const remaining = totalAmount - depositPaid;
      const progress = Math.round((depositPaid / totalAmount) * 100);

      await sql`
        UPDATE bookings
        SET 
          total_paid = ${depositPaid},
          remaining_balance = ${remaining},
          payment_progress = ${progress}
        WHERE id = ${booking.id}
      `;

      console.log(`   ✅ Updated booking ${booking.id}: ${depositPaid / 100} paid, ${remaining / 100} remaining (${progress}%)`);
    }

    console.log('\n✅ All payment tracking columns added successfully!');
    console.log('\n📋 Summary:');
    console.log('   - total_paid: Running total of all payments');
    console.log('   - remaining_balance: Amount left to pay');
    console.log('   - downpayment_amount: Actual deposit amount paid');
    console.log('   - payment_progress: Percentage of payment complete (0-100)');
    console.log('   - last_payment_date: Timestamp of last payment');
    console.log('   - payment_method: card, gcash, paymaya, etc.');
    console.log('   - transaction_id: PayMongo transaction reference');
    console.log(`\n✅ Updated ${paidBookings.length} existing bookings with correct balances`);

  } catch (error) {
    console.error('❌ Error adding payment tracking columns:', error);
    process.exit(1);
  }
}

addPaymentTrackingColumns()
  .then(() => {
    console.log('\n🎉 Database schema updated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
