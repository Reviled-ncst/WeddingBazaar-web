/**
 * Fix Vendor User Roles
 * 
 * This script updates all users who have vendor entries to have role='vendor'
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixVendorUserRoles() {
  console.log('\n🔧 Fixing Vendor User Roles\n');
  console.log('='.repeat(60));
  
  try {
    // Get all vendors
    const vendors = await sql`SELECT id, user_id, business_name FROM vendors ORDER BY created_at`;
    
    console.log(`\nFound ${vendors.length} vendors to fix:\n`);
    
    for (const vendor of vendors) {
      console.log(`\n--- Processing: ${vendor.business_name} ---`);
      console.log(`Vendor ID: ${vendor.id} | User ID: ${vendor.user_id}`);
      
      // Check current role
      const userCheck = await sql`SELECT id, email, role FROM users WHERE id = ${vendor.user_id}`;
      
      if (userCheck.length === 0) {
        console.log(`❌ ERROR: No user found for user_id ${vendor.user_id}`);
        continue;
      }
      
      const user = userCheck[0];
      console.log(`Current role: ${user.role}`);
      
      if (user.role === 'vendor') {
        console.log(`✅ Already correct - no change needed`);
        continue;
      }
      
      // Update to vendor role
      console.log(`🔧 Updating role from '${user.role}' to 'vendor'...`);
      
      const result = await sql`
        UPDATE users 
        SET role = 'vendor', updated_at = NOW()
        WHERE id = ${vendor.user_id}
        RETURNING id, email, role
      `;
      
      if (result.length > 0) {
        console.log(`✅ SUCCESS: ${result[0].email} is now role='vendor'`);
      } else {
        console.log(`❌ ERROR: Update failed`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 VERIFICATION');
    console.log('='.repeat(60) + '\n');
    
    for (const vendor of vendors) {
      const userCheck = await sql`SELECT id, email, role FROM users WHERE id = ${vendor.user_id}`;
      const user = userCheck[0];
      const status = user.role === 'vendor' ? '✅' : '❌';
      console.log(`${status} ${user.email}: role='${user.role}'`);
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run
fixVendorUserRoles()
  .then(() => {
    console.log('\n✅ Fix complete\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });
