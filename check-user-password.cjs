const { sql } = require('./backend-deploy/config/database.cjs');

async function checkUserPassword() {
  try {
    console.log('🔍 Checking user password in database...');
    
    // Check the actual vendor user password
    const users = await sql`
      SELECT id, email, password, user_type, first_name, last_name 
      FROM users 
      WHERE email = 'renzrusselbauto@gmail.com'
    `;
    
    if (users.length > 0) {
      const user = users[0];
      console.log('👤 User found:', {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        name: `${user.first_name} ${user.last_name}`,
        password_hash_length: user.password.length,
        password_starts_with: user.password.substring(0, 10)
      });
      
      // Try to verify the password
      const bcrypt = require('bcrypt');
      const testPasswords = ['Test123!', 'testpassword', 'password123', 'vendor123'];
      
      for (const testPassword of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPassword, user.password);
          console.log(`🔐 Password "${testPassword}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
          
          if (isValid) {
            console.log(`🎉 Correct password found: "${testPassword}"`);
            break;
          }
        } catch (error) {
          console.log(`🔐 Password "${testPassword}": Error - ${error.message}`);
        }
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

checkUserPassword();
