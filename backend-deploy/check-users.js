require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    
    const users = await sql`SELECT id, email, first_name, last_name FROM users LIMIT 10`;
    console.log('Users found:', users.length);
    console.log('Users data:', JSON.stringify(users, null, 2));
    
    // Check specifically for vendor0@example.com
    const vendor0 = await sql`SELECT * FROM users WHERE email = 'vendor0@example.com'`;
    console.log('\nVendor0 user:', JSON.stringify(vendor0, null, 2));
    
  } catch (error) {
    console.error('Error checking users:', error.message);
  }
}

checkUsers();
