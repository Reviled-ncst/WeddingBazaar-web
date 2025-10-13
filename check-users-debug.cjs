const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkUsersAndPasswords() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Get all users
    const users = await sql`
      SELECT id, email, first_name, last_name, user_type, created_at, password 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    console.log(`👥 Found ${users.length} users in database:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.user_type}) - Created: ${user.created_at}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD'}`);
      console.log('');
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('🔧 This explains why login is failing - there are no users to authenticate against.');
      
      console.log('\n🔧 Creating a test user...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userId = 'TEST-' + Date.now();
      
      const newUser = await sql`
        INSERT INTO users (id, email, password, first_name, last_name, user_type, created_at)
        VALUES (${userId}, 'test@example.com', ${hashedPassword}, 'Test', 'User', 'couple', NOW())
        RETURNING id, email, first_name, last_name, user_type
      `;
      
      console.log('✅ Test user created:', newUser[0]);
      console.log('🔑 Login credentials: test@example.com / password123');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    
    if (error.message.includes('No database connection string')) {
      console.log('🔧 DATABASE_URL not found. Checking .env file...');
      const fs = require('fs');
      try {
        const envContent = fs.readFileSync('.env', 'utf8');
        console.log('📄 .env file contents (DATABASE_URL only):');
        const lines = envContent.split('\n');
        const dbLine = lines.find(line => line.startsWith('DATABASE_URL'));
        console.log(dbLine ? `✅ ${dbLine.substring(0, 50)}...` : '❌ DATABASE_URL not found in .env');
      } catch (envError) {
        console.log('❌ Could not read .env file:', envError.message);
      }
    }
  }
}

checkUsersAndPasswords();
