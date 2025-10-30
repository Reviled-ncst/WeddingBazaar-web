const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function findVendorWallet() {
  console.log('\n=== FINDING VENDOR WALLET ===\n');
  
  // The two possible IDs
  const userId = '2-2025-001';
  const vendorUuid = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';
  
  console.log('🔍 Testing with user ID (from users table):', userId);
  const walletByUserId = await sql`
    SELECT * FROM vendor_wallets WHERE vendor_id = ${userId}
  `;
  console.log('   Wallet found:', walletByUserId.length > 0 ? '✅ YES' : '❌ NO');
  if (walletByUserId.length > 0) {
    console.log('   Balance:', walletByUserId[0].total_earnings);
  }
  
  const txnsByUserId = await sql`
    SELECT COUNT(*) as count FROM wallet_transactions WHERE vendor_id = ${userId}
  `;
  console.log('   Transactions:', txnsByUserId[0].count);
  
  console.log('\n🔍 Testing with vendor UUID (from vendors table):', vendorUuid);
  const walletByUuid = await sql`
    SELECT * FROM vendor_wallets WHERE vendor_id = ${vendorUuid}
  `;
  console.log('   Wallet found:', walletByUuid.length > 0 ? '✅ YES' : '❌ NO');
  
  const txnsByUuid = await sql`
    SELECT COUNT(*) as count FROM wallet_transactions WHERE vendor_id = ${vendorUuid}
  `;
  console.log('   Transactions:', txnsByUuid[0].count);
  
  console.log('\n=== RESULT ===\n');
  if (walletByUserId.length > 0) {
    console.log('✅ Wallet is stored using USER ID:', userId);
    console.log('   Frontend should use: user.id');
    console.log('   NOT: user.vendorId');
  } else if (walletByUuid.length > 0) {
    console.log('✅ Wallet is stored using VENDOR UUID:', vendorUuid);
    console.log('   Frontend should use: user.vendorId');
  } else {
    console.log('❌ No wallet found with either ID!');
  }
  
  console.log('\n');
}

findVendorWallet().catch(console.error);
