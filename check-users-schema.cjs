const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkUsersSchema() {
  const cols = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  `;
  
  console.log('Users table columns:', cols.map(c => c.column_name).join(', '));
}

checkUsersSchema().catch(console.error);
