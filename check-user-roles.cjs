/**
 * Check User Roles
 * 
 * This script checks all users and their roles to see if vendor users exist.
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkUserRoles() {
  console.log('\n🔍 Checking User Roles\n');
  console.log('='.repeat(60));
  
  try {
    // Get all users
    const users = await sql`SELECT id, email, role FROM users ORDER BY created_at`;
    
    console.log(`\nFound ${users.length} total users:\n`);
    
    const roleCount = {};
    
    users.forEach((u, i) => {
      console.log(`${i + 1}. ID: ${u.id} | Email: ${u.email}`);
      console.log(`   Role: ${u.role || 'NULL'}\n`);
      
      const role = u.role || 'NULL';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });
    
    console.log('='.repeat(60));
    console.log('📊 Role Distribution:');
    console.log('='.repeat(60));
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`${role}: ${count}`);
    });
    
    // Now check vendors table
    console.log('\n='.repeat(60));
    console.log('📊 Vendors Table:');
    console.log('='.repeat(60));
    
    const vendors = await sql`SELECT id, user_id, business_name FROM vendors ORDER BY created_at`;
    
    console.log(`\nFound ${vendors.length} vendors:\n`);
    
    for (const vendor of vendors) {
      console.log(`Vendor ID: ${vendor.id} | User ID: ${vendor.user_id}`);
      console.log(`Business: ${vendor.business_name}`);
      
      // Check if corresponding user exists and has correct role
      const userCheck = await sql`SELECT id, email, role FROM users WHERE id = ${vendor.user_id}`;
      
      if (userCheck.length === 0) {
        console.log(`❌ NO USER FOUND for this vendor!`);
      } else {
        const user = userCheck[0];
        console.log(`✅ User found: ${user.email} | Role: ${user.role}`);
        if (user.role !== 'vendor') {
          console.log(`⚠️  WARNING: User role is '${user.role}', should be 'vendor'!`);
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run
checkUserRoles()
  .then(() => {
    console.log('✅ Check complete\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });
