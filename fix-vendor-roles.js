// Quick database fix for vendor routing issue
// Run this to check and fix user_type values for vendor accounts

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();

const sql = neon(process.env.DATABASE_URL);

async function fixVendorRoles() {
  try {
    console.log('🔍 Checking current user roles...');
    
    // Check current state
    const users = await sql`
      SELECT id, email, first_name, last_name, user_type 
      FROM users 
      WHERE email LIKE 'vendor%' OR user_type IN ('vendor', 'business', 'provider', 'couple')
      ORDER BY email
    `;
    
    console.log('📊 Current user data:');
    users.forEach(user => {
      console.log(`  ${user.email} | ${user.user_type} | ${user.first_name} ${user.last_name}`);
    });
    
    // Fix vendor accounts that have wrong role
    const vendorEmails = users.filter(u => u.email.includes('vendor') && u.user_type !== 'vendor');
    
    if (vendorEmails.length > 0) {
      console.log('\n🔧 Fixing vendor account roles...');
      
      for (const user of vendorEmails) {
        await sql`
          UPDATE users 
          SET user_type = 'vendor' 
          WHERE id = ${user.id}
        `;
        console.log(`✅ Fixed: ${user.email} | ${user.user_type} → vendor`);
      }
      
      console.log('\n✅ All vendor accounts updated!');
    } else {
      console.log('\n✅ No vendor accounts need fixing.');
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const updatedUsers = await sql`
      SELECT email, user_type, first_name, last_name 
      FROM users 
      WHERE email LIKE 'vendor%'
      ORDER BY email
    `;
    
    console.log('📊 Updated user data:');
    updatedUsers.forEach(user => {
      console.log(`  ${user.email} | ${user.user_type} | ${user.first_name} ${user.last_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixVendorRoles();
