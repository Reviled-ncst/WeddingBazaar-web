// Check what passwords exist in the database 
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkPasswords() {
  try {
    console.log('🔍 Checking user passwords (first 5 chars only for security)...');
    
    const users = await sql`
      SELECT 
        email, 
        user_type,
        SUBSTRING(password FROM 1 FOR 5) as password_preview,
        LENGTH(password) as password_length,
        created_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 15
    `;
    
    console.log('\n👥 Recent users with password info:');
    users.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.email}`);
      console.log(`     Type: ${user.user_type}`);
      console.log(`     Password starts with: "${user.password_preview}..." (${user.password_length} chars)`);
      console.log(`     Created: ${user.created_at}`);
      console.log('');
    });
    
    // Check if any passwords look like common test passwords
    const commonPasswords = ['pass', 'test', '123', 'demo', 'admin'];
    console.log('🔑 Checking for common password patterns...');
    
    for (const pattern of commonPasswords) {
      const matches = await sql`
        SELECT email, user_type 
        FROM users 
        WHERE password LIKE ${pattern + '%'} 
        OR password = ${pattern}
        LIMIT 5
      `;
      
      if (matches.length > 0) {
        console.log(`\n✅ Found ${matches.length} users with passwords starting with "${pattern}":`);
        matches.forEach(user => {
          console.log(`  - ${user.email} (${user.user_type})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Password check failed:', error.message);
  }
}

checkPasswords().then(() => process.exit(0));
