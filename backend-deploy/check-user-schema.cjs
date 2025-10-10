const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkUserSchema() {
  try {
    console.log('🔍 Checking users table schema...\n');
    
    // Get table structure
    const schema = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Users table columns:');
    schema.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n🎯 Sample user data:');
    const users = await sql`SELECT * FROM users LIMIT 3`;
    if (users.length > 0) {
      console.log('   Sample record keys:', Object.keys(users[0]));
      users.forEach((user, i) => {
        console.log(`   User ${i + 1}:`, user);
      });
    } else {
      console.log('   No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Schema check error:', error.message);
  }
}

checkUserSchema();
