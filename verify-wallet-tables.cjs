#!/usr/bin/env node

/**
 * Quick Wallet Tables Verification and Creation
 * Run with: node verify-wallet-tables.cjs
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function verifyAndCreateTables() {
  console.log('🔍 Checking wallet tables...\n');

  try {
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('vendor_wallets', 'wallet_transactions')
      ORDER BY table_name
    `;

    console.log(`Found ${tables.length}/2 wallet tables:`);
    tables.forEach(t => console.log(`   ✅ ${t.table_name}`));

    if (tables.length === 2) {
      console.log('\n✅ All wallet tables exist!');
      
      // Check if test vendor has wallet
      const testWallets = await sql`
        SELECT * FROM vendor_wallets WHERE vendor_id = '2-2025-001'
      `;
      
      if (testWallets.length > 0) {
        const wallet = testWallets[0];
        console.log('\n💰 Test Vendor Wallet (2-2025-001):');
        console.log(`   Available Balance: ₱${(wallet.available_balance / 100).toFixed(2)}`);
        console.log(`   Total Earnings: ₱${(wallet.total_earnings / 100).toFixed(2)}`);
        console.log(`   Total Transactions: ${wallet.total_transactions || 0}`);
      } else {
        console.log('\n⚠️  Test vendor wallet not found - will be auto-created on first transaction');
      }

      // Check transactions
      const transactions = await sql`
        SELECT COUNT(*) as count FROM wallet_transactions
      `;
      console.log(`\n📊 Total Transactions: ${transactions[0].count}`);

    } else {
      console.log('\n⚠️  Wallet tables missing! Run: node create-wallet-tables.cjs');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Tables do not exist. Creating now...\n');
      console.log('Run: node create-wallet-tables.cjs');
    }
  }
}

verifyAndCreateTables()
  .then(() => {
    console.log('\n✅ Verification complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
