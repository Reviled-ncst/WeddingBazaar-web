const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

(async () => {
  const users = await sql`SELECT id, email, role, user_type FROM users`;
  console.log('\n📊 All users - role vs user_type:\n');
  users.forEach(u => {
    console.log(`${u.email}:`);
    console.log(`  role: ${u.role}`);
    console.log(`  user_type: ${u.user_type}\n`);
  });
})();
