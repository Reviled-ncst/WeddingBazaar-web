require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkVendorSystem() {
  console.log('🔍 Checking Vendor System Status\n');
  
  // Get all vendor users
  const vendorUsers = await sql`
    SELECT id, email, first_name, last_name, created_at
    FROM users
    WHERE user_type = 'vendor'
    ORDER BY created_at
  `;
  
  console.log(`📊 Vendor Users in users table: ${vendorUsers.length}\n`);
  
  // Get all vendor entries
  const vendors = await sql`
    SELECT id, user_id, business_name, created_at
    FROM vendors
    ORDER BY created_at
  `;
  
  console.log(`📊 Vendors in vendors table: ${vendors.length}\n`);
  
  // Cross-reference
  console.log('🔍 Cross-Reference:\n');
  
  for (const user of vendorUsers) {
    const vendor = vendors.find(v => v.user_id === user.id);
    
    console.log(`User: ${user.email}`);
    console.log(`  User ID: ${user.id}`);
    console.log(`  Name: ${user.first_name} ${user.last_name}`);
    console.log(`  Registered: ${user.created_at}`);
    
    if (vendor) {
      console.log(`  ✅ Has vendor entry: ${vendor.id}`);
      console.log(`  Business: ${vendor.business_name}`);
    } else {
      console.log(`  ❌ MISSING vendor entry!`);
    }
    console.log('');
  }
  
  console.log('💡 Summary:');
  console.log(`  Total vendor users: ${vendorUsers.length}`);
  console.log(`  Vendor entries: ${vendors.length}`);
  console.log(`  Missing: ${vendorUsers.length - vendors.length}`);
}

checkVendorSystem();
