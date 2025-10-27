/**
 * Fix the user.vendorId to match the real vendor ID
 */
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function fixUserVendorId() {
  console.log('\n🔧 FIXING USER VENDOR ID\n');
  console.log('='.repeat(60));
  
  const userId = '2-2025-003';
  const correctVendorId = '2-2025-003'; // Same as user ID for vendors
  const wrongVendorId = 'daf1dd71-b5c7-44a1-bf88-36d41e73a7fa';
  
  console.log('\n📋 Problem:');
  console.log(`   User ID: ${userId}`);
  console.log(`   Current vendorId: ${wrongVendorId} ❌`);
  console.log(`   Should be: ${correctVendorId} ✅`);
  console.log('');

  // Check if users table has vendorId column
  const checkColumn = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'vendor_id'
  `;

  if (checkColumn.length === 0) {
    console.log('⚠️  users table does not have vendor_id column');
    console.log('   The vendorId might be stored elsewhere or in a JSONB field');
    
    // Check the actual user record
    const user = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;
    
    if (user.length > 0) {
      console.log('\n📄 Current user record:');
      console.log(JSON.stringify(user[0], null, 2));
    }
    return;
  }

  // Update the user's vendor_id
  const result = await sql`
    UPDATE users
    SET vendor_id = ${correctVendorId}
    WHERE id = ${userId}
    RETURNING id, email, vendor_id, role
  `;

  if (result.length > 0) {
    console.log('✅ USER VENDOR_ID UPDATED SUCCESSFULLY!');
    console.log('');
    console.log('Updated user:');
    console.log(`   ID: ${result[0].id}`);
    console.log(`   Email: ${result[0].email}`);
    console.log(`   Vendor ID: ${result[0].vendor_id} ✅`);
    console.log(`   Role: ${result[0].role}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('\n🎉 DONE! Now:');
    console.log('   1. Log out completely');
    console.log('   2. Clear ALL browser cache and cookies');
    console.log('   3. Log back in');
    console.log('   4. Frontend will fetch fresh user data with correct vendorId');
    console.log('   5. Subscription will load correctly!');
  } else {
    console.log('❌ Update failed!');
  }
}

fixUserVendorId()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
