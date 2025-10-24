const { sql } = require('./backend-deploy/config/database.cjs');

async function checkUsers() {
  try {
    console.log('🔍 Checking recent user registrations...\n');
    
    const users = await sql`
      SELECT 
        id, 
        email, 
        firebase_uid, 
        email_verified, 
        user_type,
        created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    console.log('📊 Recent Users:');
    console.log('='.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Type: ${user.user_type}`);
      console.log(`   Firebase UID: ${user.firebase_uid || 'NULL'}`);
      console.log(`   Email Verified: ${user.email_verified}`);
      console.log(`   Created: ${user.created_at}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Found ${users.length} users`);
    
    // Count verified vs unverified
    const verified = users.filter(u => u.email_verified).length;
    const unverified = users.filter(u => !u.email_verified).length;
    
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Verified: ${verified}`);
    console.log(`   ❌ Unverified: ${unverified}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
