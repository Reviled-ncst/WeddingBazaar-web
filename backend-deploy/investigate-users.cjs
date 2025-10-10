const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function investigateUsers() {
  try {
    console.log('🔍 Investigating user database for login issues...\n');
    
    // Check user table structure
    console.log('📋 User table schema:');
    const schema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    schema.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    console.log('\n👥 All users in database:');
    const users = await sql`
      SELECT id, email, first_name, last_name, user_type, 
             LEFT(password, 20) as password_start,
             LENGTH(password) as password_length
      FROM users 
      ORDER BY id
    `;
    
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.user_type})`);
      console.log(`     ID: ${user.id}`);
      console.log(`     Name: ${user.first_name} ${user.last_name}`);
      console.log(`     Password: ${user.password_start}... (${user.password_length} chars)`);
      console.log('');
    });
    
    console.log('🔐 Testing password format...');
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`   Testing user: ${testUser.email}`);
      console.log(`   Password starts with: ${testUser.password_start}...`);
      
      if (testUser.password_start.startsWith('$2b$')) {
        console.log('   ✅ Password is bcrypt hashed (correct format)');
      } else {
        console.log('   ❌ Password is NOT bcrypt hashed (problem!)');
      }
    }
    
  } catch (error) {
    console.error('❌ Investigation error:', error.message);
  }
}

investigateUsers();
