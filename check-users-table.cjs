require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkUsersTable() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 Checking users table structure...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    console.table(columns);
    
    console.log('\n📋 Sample user data:');
    const sampleUsers = await sql`SELECT * FROM users LIMIT 5`;
    sampleUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`, JSON.stringify(user, null, 2));
    });
    
    console.log('\n🔍 Looking for users with couple IDs:');
    const coupleUsers = await sql`
      SELECT id, username, email, first_name, last_name, full_name, role 
      FROM users 
      WHERE id IN ('couple_001', 'couple_002', 'couple_003', '1-2025-001') 
      OR username LIKE '%couple%'
      ORDER BY id
    `;
    console.table(coupleUsers);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsersTable();
