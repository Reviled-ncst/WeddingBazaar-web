const { sql } = require('./backend-deploy/config/database.cjs');
const bcrypt = require('bcrypt');

async function updateVendorPasswordsInDB() {
  try {
    console.log('🔍 Finding vendor users...\n');
    
    const users = await sql`
      SELECT id, email FROM users 
      WHERE email LIKE 'vendor.%@weddingbazaar.ph' 
      ORDER BY email
    `;
    
    console.log(`Found ${users.length} vendor users\n`);
    
    if (users.length === 0) {
      console.log('❌ No vendor users found in database');
      process.exit(1);
    }
    
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    for (const user of users) {
      console.log(`Updating: ${user.email} (${user.id})`);
      await sql`
        UPDATE users 
        SET password = ${hashedPassword}
        WHERE id = ${user.id}
      `;
    }
    
    console.log('\n✅ All database passwords updated to: test123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

updateVendorPasswordsInDB();
