const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Initialize Neon serverless client
const sql = neon(process.env.DATABASE_URL);

// Test database connection on startup (simplified for faster deployment)
async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Simple connection test only - no user creation during startup
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Quick count check (no user creation to speed up deployment)
    const users = await sql`SELECT COUNT(*) as count FROM users LIMIT 1`;
    console.log(`📊 Found ${users[0].count} users in database`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔧 Database URL present:', !!process.env.DATABASE_URL);  
    
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
