const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:8V4Pu7DFG8HY@ep-soft-pond-a5b0vxpe.us-east-2.aws.neon.tech/neondb?sslmode=require');

async function debugUsers() {
  console.log('=== DEBUGGING USER AUTHENTICATION ===');
  
  try {
    // Check if users table exists and get schema
    console.log('1. Checking users table schema...');
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;
    const schema = await sql(schemaQuery);
    console.log('Users table schema:', schema);
    
    // Get all users with their emails and password hashes
    console.log('\n2. Getting all users...');
    const users = await sql('SELECT id, email, password, user_type, created_at FROM users ORDER BY created_at');
    console.log('Total users found:', users.length);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log('  Email:', user.email);
      console.log('  ID:', user.id);
      console.log('  Type:', user.user_type);
      console.log('  Created:', user.created_at);
      console.log('  Password hash:', user.password.substring(0, 60) + '...');
      console.log('  Hash looks like bcrypt?', user.password.startsWith('$2b$') || user.password.startsWith('$2a$'));
    });
    
    // Try to find the specific test user
    console.log('\n3. Looking for couple@test.com specifically...');
    const testUser = await sql('SELECT * FROM users WHERE email = $1', ['couple@test.com']);
    if (testUser.length > 0) {
      console.log('Found couple@test.com user:', {
        id: testUser[0].id,
        email: testUser[0].email,
        user_type: testUser[0].user_type,
        password_hash: testUser[0].password,
        created_at: testUser[0].created_at
      });
    } else {
      console.log('❌ couple@test.com user NOT FOUND!');
      
      // Create the test user if it doesn't exist
      console.log('\n4. Creating couple@test.com user...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      const newUser = await sql(`
        INSERT INTO users (id, email, password, user_type, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `, ['demo-couple-001', 'couple@test.com', hashedPassword, 'individual']);
      
      console.log('✅ Created couple@test.com user:', newUser[0]);
    }
    
  } catch (error) {
    console.error('Database error:', error);
  }
}

debugUsers().catch(console.error);
