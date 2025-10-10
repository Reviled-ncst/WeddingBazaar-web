const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    const users = await sql`SELECT id, email, full_name, user_type, password_hash FROM users`;
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      
      // Create a demo user
      console.log('\n➕ Creating demo user...');
      await sql`
        INSERT INTO users (id, email, full_name, user_type, password_hash, created_at)
        VALUES ('demo-user-001', 'demo@weddingbazaar.com', 'Demo User', 'individual', 'demo123', NOW())
      `;
      
      console.log('✅ Demo user created: demo@weddingbazaar.com / demo123');
      
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.user_type}) - Password: "${user.password_hash}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkUsers();
