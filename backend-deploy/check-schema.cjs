// Database schema check script
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    console.log('🔍 Checking users table schema...');
    
    // Check if users table exists and its columns
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Users table columns:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check if there are any users
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`\n👥 Total users in database: ${userCount[0].count}`);
    
    // Try to get first few users to see the actual data structure
    const sampleUsers = await sql`SELECT * FROM users LIMIT 3`;
    console.log('\n📋 Sample users:');
    sampleUsers.forEach((user, i) => {
      console.log(`  User ${i + 1}:`, Object.keys(user));
    });
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    
    // Try to create users table if it doesn't exist
    console.log('\n🔧 Attempting to create users table...');
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          user_type VARCHAR(50) DEFAULT 'individual',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('✅ Users table created successfully');
    } catch (createError) {
      console.error('❌ Failed to create users table:', createError.message);
    }
  }
}

checkSchema().then(() => process.exit(0));
