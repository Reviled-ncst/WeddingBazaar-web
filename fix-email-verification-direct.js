// Direct database update to fix email verification
const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function fixEmailVerification() {
  const email = 'renzrusselbauto@gmail.com';
  console.log(`🔧 Updating email verification in database for: ${email}`);
  
  try {
    // First, check current status
    const checkResult = await db.query(
      'SELECT id, email, role, email_verified FROM users WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length === 0) {
      console.log(`❌ User not found in database: ${email}`);
      return;
    }
    
    const user = checkResult.rows[0];
    console.log(`📊 Current user data:`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Email Verified: ${user.email_verified}`);
    
    // Update email_verified to true
    const updateResult = await db.query(
      'UPDATE users SET email_verified = true, updated_at = NOW() WHERE email = $1 RETURNING *',
      [email]
    );
    
    if (updateResult.rows.length > 0) {
      const updatedUser = updateResult.rows[0];
      console.log(`✅ SUCCESS! Email verification updated:`);
      console.log(`   - Email: ${updatedUser.email}`);
      console.log(`   - Role: ${updatedUser.role}`);
      console.log(`   - Email Verified: ${updatedUser.email_verified}`);
      console.log(`   - Updated At: ${updatedUser.updated_at}`);
      console.log(`🎯 You should now be able to access /vendor!`);
      console.log(`🔄 Try refreshing your browser and logging in again.`);
    } else {
      console.log(`⚠️ Update failed - no rows affected`);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log(`📞 Manual database intervention needed`);
  } finally {
    await db.end();
  }
}

fixEmailVerification();
