const { sql } = require('./backend-deploy/config/database.cjs');

async function checkUserIdFormat() {
  try {
    const users = await sql`SELECT id, email FROM users LIMIT 5`;
    console.log('Sample user IDs:');
    console.table(users);
    
    // Check the ID format
    if (users.length > 0) {
      const firstId = users[0].id;
      console.log('\nFirst user ID:', firstId);
      console.log('ID type:', typeof firstId);
      console.log('ID format:', firstId.includes('-') ? 'UUID format' : 'Custom format');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUserIdFormat();
