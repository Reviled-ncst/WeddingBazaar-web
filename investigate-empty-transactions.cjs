const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function investigate() {
  console.log('\n=== INVESTIGATING EMPTY TRANSACTION HISTORY ===\n');
  
  const vendorId = '2-2025-001'; // Real vendor ID from database
  
  // 1. Check if vendor wallet exists
  console.log('1. Checking vendor wallet...');
  const wallets = await sql`
    SELECT * FROM vendor_wallets 
    WHERE vendor_id = ${vendorId}
  `;
  console.log(`Found ${wallets.length} wallet(s)`);
  if (wallets.length > 0) {
    console.log('Wallet:', JSON.stringify(wallets[0], null, 2));
  } else {
    console.log('❌ NO WALLET FOUND!');
  }
  
  // 2. Check wallet transactions
  console.log('\n2. Checking wallet transactions...');
  const transactions = await sql`
    SELECT * FROM wallet_transactions 
    WHERE vendor_id = ${vendorId}
    ORDER BY created_at DESC
  `;
  console.log(`Found ${transactions.length} transaction(s)`);
  if (transactions.length > 0) {
    console.log('Sample transaction:', JSON.stringify(transactions[0], null, 2));
  } else {
    console.log('❌ NO TRANSACTIONS FOUND!');
  }
  
  // 3. Check vendor's bookings
  console.log('\n3. Checking vendor bookings...');
  const bookings = await sql`
    SELECT id, status, amount, vendor_completed, couple_completed, fully_completed, created_at
    FROM bookings 
    WHERE vendor_id = ${vendorId}
    ORDER BY created_at DESC
  `;
  console.log(`Found ${bookings.length} booking(s)`);
  
  if (bookings.length > 0) {
    console.log('\nBooking statuses:');
    const statusCounts = {};
    bookings.forEach(b => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });
    console.log(JSON.stringify(statusCounts, null, 2));
    
    const completedBookings = bookings.filter(b => 
      b.status === 'completed' || b.fully_completed === true
    );
    console.log(`\nCompleted bookings: ${completedBookings.length}`);
    
    if (completedBookings.length > 0) {
      console.log('Sample completed booking:', JSON.stringify(completedBookings[0], null, 2));
    }
  }
  
  // 4. Analysis
  console.log('\n=== ANALYSIS ===\n');
  
  if (wallets.length === 0) {
    console.log('❌ ROOT CAUSE: No wallet exists for this vendor');
    console.log('   SOLUTION: Create wallet entry in vendor_wallets table');
  } else if (transactions.length === 0) {
    const completedCount = bookings.filter(b => b.status === 'completed' || b.fully_completed).length;
    
    if (completedCount === 0) {
      console.log('✅ EXPECTED BEHAVIOR:');
      console.log('   - Vendor has no completed bookings');
      console.log('   - Wallet transactions are only created when bookings complete');
      console.log('   - Transaction history is correctly empty');
      console.log('\n   TO TEST:');
      console.log('   - Create a test booking and mark it as completed');
      console.log('   - Or run the CREATE_TEST_WALLET_DATA.sql script');
    } else {
      console.log('❌ DATA INCONSISTENCY:');
      console.log(`   - Vendor has ${completedCount} completed booking(s)`);
      console.log('   - But no wallet transactions exist');
      console.log('   - Transactions should have been created automatically');
      console.log('\n   SOLUTION: Run migration script to create transactions for existing completed bookings');
    }
  } else {
    console.log('✅ ALL GOOD:');
    console.log('   - Wallet exists');
    console.log(`   - ${transactions.length} transaction(s) found`);
    console.log('   - System is working correctly');
  }
  
  console.log('\n=== INVESTIGATION COMPLETE ===\n');
}

investigate().catch(error => {
  console.error('Error during investigation:', error);
  process.exit(1);
});
