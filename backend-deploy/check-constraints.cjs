// Check database constraints on users table
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkConstraints() {
  try {
    console.log('🔍 Checking database constraints...');
    
    // Check constraints on users table
    const constraints = await sql`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'users'
    `;
    
    console.log('\n📋 Users table constraints:');
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name} (${constraint.constraint_type})`);
      if (constraint.check_clause) {
        console.log(`    Check: ${constraint.check_clause}`);
      }
    });
    
    // Check existing users and their user_type values
    const existingUsers = await sql`
      SELECT email, user_type, first_name, last_name, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    console.log(`\n👥 Existing users (${existingUsers.length} found):`);
    existingUsers.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.email} - Type: "${user.user_type}" - Name: ${user.first_name} ${user.last_name}`);
    });
    
    // Check what user_type values exist
    const userTypes = await sql`
      SELECT DISTINCT user_type, COUNT(*) as count
      FROM users 
      GROUP BY user_type
    `;
    
    console.log('\n📊 User types in database:');
    userTypes.forEach(type => {
      console.log(`  - "${type.user_type}": ${type.count} users`);
    });
    
  } catch (error) {
    console.error('❌ Constraint check failed:', error.message);
  }
}

checkConstraints().then(() => process.exit(0));
