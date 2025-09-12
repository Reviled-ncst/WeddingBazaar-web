const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkUsers() {
  try {
    console.log('Checking users table...');
    const users = await sql`SELECT id, email, first_name, last_name FROM users LIMIT 10`;
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
