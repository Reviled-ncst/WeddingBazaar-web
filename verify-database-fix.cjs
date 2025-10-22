// ================================================================
// Database Fix Verification Script
// Run this AFTER executing COMPLETE_DATABASE_FIX.sql
// ================================================================

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function verifyDatabaseFix() {
  console.log('🔍 Starting database verification...\n');
  
  let allChecksPass = true;

  // ============================================================
  // Check 1: Verify bookings table payment columns
  // ============================================================
  console.log('✓ Checking bookings table payment columns...');
  try {
    const bookingsColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      AND column_name IN ('total_paid', 'remaining_balance', 'downpayment_amount', 'payment_progress')
      ORDER BY column_name
    `;

    const expected = {
      'downpayment_amount': 'numeric',
      'payment_progress': 'numeric',
      'remaining_balance': 'numeric',
      'total_paid': 'numeric'
    };

    bookingsColumns.forEach(col => {
      const isCorrect = col.data_type === expected[col.column_name];
      console.log(`  ${isCorrect ? '✅' : '❌'} ${col.column_name}: ${col.data_type} (expected: ${expected[col.column_name]})`);
      if (!isCorrect) allChecksPass = false;
    });

    if (bookingsColumns.length !== 4) {
      console.log(`  ❌ Expected 4 columns, found ${bookingsColumns.length}`);
      allChecksPass = false;
    }
  } catch (error) {
    console.log('  ❌ Error checking bookings columns:', error.message);
    allChecksPass = false;
  }

  console.log('');

  // ============================================================
  // Check 2: Verify receipts table structure
  // ============================================================
  console.log('✓ Checking receipts table structure...');
  try {
    const receiptsColumns = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'receipts'
      ORDER BY ordinal_position
    `;

    const requiredColumns = [
      'id',
      'booking_id',
      'receipt_number',
      'payment_type',
      'amount',
      'currency',
      'payment_method',
      'payment_intent_id',
      'paid_by',
      'paid_by_name',
      'paid_by_email',
      'total_paid',
      'remaining_balance',
      'notes',
      'metadata',
      'created_at'
    ];

    console.log(`  Found ${receiptsColumns.length} columns (expected: ${requiredColumns.length})`);

    const foundColumns = receiptsColumns.map(c => c.column_name);
    const missingColumns = requiredColumns.filter(col => !foundColumns.includes(col));
    const extraColumns = foundColumns.filter(col => !requiredColumns.includes(col));

    if (missingColumns.length > 0) {
      console.log(`  ❌ Missing columns: ${missingColumns.join(', ')}`);
      allChecksPass = false;
    } else {
      console.log('  ✅ All required columns present');
    }

    if (extraColumns.length > 0) {
      console.log(`  ⚠️  Extra columns: ${extraColumns.join(', ')}`);
    }

    // Check critical columns
    const paymentTypeCol = receiptsColumns.find(c => c.column_name === 'payment_type');
    if (paymentTypeCol) {
      console.log(`  ✅ payment_type column exists (${paymentTypeCol.data_type})`);
    } else {
      console.log('  ❌ payment_type column missing!');
      allChecksPass = false;
    }

  } catch (error) {
    console.log('  ❌ Error checking receipts table:', error.message);
    allChecksPass = false;
  }

  console.log('');

  // ============================================================
  // Check 3: Verify indexes exist
  // ============================================================
  console.log('✓ Checking receipts table indexes...');
  try {
    const indexes = await sql`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'receipts'
      ORDER BY indexname
    `;

    const requiredIndexes = [
      'idx_receipts_booking_id',
      'idx_receipts_created_at',
      'idx_receipts_receipt_number'
    ];

    const foundIndexes = indexes.map(i => i.indexname);
    
    requiredIndexes.forEach(idx => {
      const exists = foundIndexes.includes(idx);
      console.log(`  ${exists ? '✅' : '❌'} ${idx}`);
      if (!exists) allChecksPass = false;
    });

  } catch (error) {
    console.log('  ❌ Error checking indexes:', error.message);
    allChecksPass = false;
  }

  console.log('');

  // ============================================================
  // Check 4: Test receipt query (simulate backend query)
  // ============================================================
  console.log('✓ Testing receipt query (simulated backend call)...');
  try {
    // This query should work without errors after the fix
    const testQuery = await sql`
      SELECT 
        r.id,
        r.booking_id,
        r.receipt_number,
        r.payment_type,
        r.amount,
        r.currency,
        r.payment_method,
        r.payment_intent_id,
        r.paid_by,
        r.paid_by_name,
        r.paid_by_email,
        r.total_paid,
        r.remaining_balance,
        r.notes,
        r.created_at
      FROM receipts r
      LIMIT 1
    `;
    
    console.log('  ✅ Receipt query executed successfully');
    console.log(`  ℹ️  Current receipts in database: ${testQuery.length}`);
  } catch (error) {
    console.log('  ❌ Receipt query failed:', error.message);
    allChecksPass = false;
  }

  console.log('');

  // ============================================================
  // Final Results
  // ============================================================
  console.log('='.repeat(60));
  if (allChecksPass) {
    console.log('✅ ALL CHECKS PASSED - Database fix successful!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Test payment flow in the app');
    console.log('2. Make a test payment (use card: 4343434343434345)');
    console.log('3. Click "View Receipt" to verify receipt display');
    console.log('4. Check Render logs for any SQL errors');
  } else {
    console.log('❌ SOME CHECKS FAILED - Review errors above');
    console.log('');
    console.log('Possible issues:');
    console.log('- SQL script did not run completely');
    console.log('- Wrong database selected in Neon');
    console.log('- Permissions issue');
    console.log('');
    console.log('Action: Re-run COMPLETE_DATABASE_FIX.sql in Neon');
  }
  console.log('='.repeat(60));
}

// Run verification
verifyDatabaseFix()
  .then(() => {
    console.log('\n✓ Verification complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
