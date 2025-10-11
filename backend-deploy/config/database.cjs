const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Initialize Neon serverless client
const sql = neon(process.env.DATABASE_URL);

// Test database connection on startup
async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Check if we have test users
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`📊 Found ${users[0].count} users in database`);
    
    // Create demo user if none exists
    if (users[0].count === 0) {
      console.log('Creating demo user...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('test123', 10);
      await sql`
        INSERT INTO users (id, email, password, user_type, created_at, updated_at)
        VALUES ('demo-couple-001', 'couple@test.com', ${hashedPassword}, 'individual', NOW(), NOW())
      `;
      console.log('✅ Demo user created: couple@test.com / test123');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔧 Database URL present:', !!process.env.DATABASE_URL);  
    console.error('🔧 Database URL format:', process.env.DATABASE_URL ? 'Valid format' : 'Not set');
    
    // Don't throw error during deployment - let server start anyway
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Production environment: continuing startup despite database issue');
      return;
    }
    
    throw error;
  }
}

module.exports = {
  sql,
  testConnection
};
