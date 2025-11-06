const { sql } = require('./backend-deploy/config/database.cjs');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-admin-key.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const VENDOR_EMAILS = [
  'vendor.beauty@weddingbazaar.ph',
  'vendor.florist@weddingbazaar.ph',
  'vendor.planning@weddingbazaar.ph',
  'vendor.venue@weddingbazaar.ph',
  'vendor.music@weddingbazaar.ph',
  'vendor.officiant@weddingbazaar.ph',
  'vendor.rentals@weddingbazaar.ph',
  'vendor.cake@weddingbazaar.ph',
  'vendor.fashion@weddingbazaar.ph',
  'vendor.security@weddingbazaar.ph',
  'vendor.av@weddingbazaar.ph',
  'vendor.stationery@weddingbazaar.ph',
  'vendor.transport@weddingbazaar.ph'
];

const NEW_PASSWORD = 'test123';

async function updatePassword(email) {
  try {
    console.log(`\n🔧 Updating password for: ${email}`);
    
    // 1. Update Firebase Auth
    try {
      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(user.uid, {
        password: NEW_PASSWORD
      });
      console.log(`   ✅ Firebase password updated`);
    } catch (error) {
      console.log(`   ⚠️ Firebase update failed: ${error.message}`);
    }
    
    // 2. Update database
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    const result = await sql`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE email = ${email}
    `;
    
    if (result.count > 0) {
      console.log(`   ✅ Database password updated`);
      return { success: true, email };
    } else {
      console.log(`   ⚠️ No user found in database`);
      return { success: false, email, reason: 'User not found' };
    }
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, email, error: error.message };
  }
}

async function main() {
  console.log('🔐 UPDATING ALL VENDOR PASSWORDS TO "test123"');
  console.log('='.repeat(70));
  
  const results = [];
  
  for (const email of VENDOR_EMAILS) {
    const result = await updatePassword(email);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(70));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Successfully updated: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ UPDATED ACCOUNTS:');
    successful.forEach(r => {
      console.log(`   - ${r.email}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED ACCOUNTS:');
    failed.forEach(r => {
      console.log(`   - ${r.email}: ${r.reason || r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🎉 ALL VENDOR PASSWORDS NOW: test123');
  console.log('='.repeat(70));
  
  process.exit(0);
}

main();
