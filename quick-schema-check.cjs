/**
 * Check Users Table Schema
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    const schema = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Users table columns:');
    schema.forEach(c => console.log('  -', c.column_name));
    
    const users = await sql`SELECT * FROM users LIMIT 1`;
    if (users[0]) {
      console.log('\n📋 Actual user object keys:');
      console.log('  ', Object.keys(users[0]).join(', '));
      
      console.log('\n📋 Sample user:');
      const u = users[0];
      console.log('  id:', u.id);
      console.log('  email:', u.email);
      console.log('  role:', u.role);
      console.log('  user_type:', u.user_type);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
