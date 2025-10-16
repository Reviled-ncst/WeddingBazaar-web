const { sql } = require('./backend-deploy/config/database.cjs');

async function checkVendorIds() {
  console.log('🔍 Checking vendor IDs...');
  
  try {
    const vendors = await sql`
      SELECT vp.user_id, vp.business_name, u.first_name, u.last_name, u.id as user_table_id
      FROM vendor_profiles vp
      JOIN users u ON vp.user_id::text = u.id::text
      LIMIT 5
    `;
    
    console.log(`Found ${vendors.length} vendors:`);
    vendors.forEach(vendor => {
      console.log(`   ${vendor.business_name}: user_id=${vendor.user_id}, u.id=${vendor.user_table_id}`);
    });
    
    // Also check users table structure
    const userSchema = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name IN ('id', 'user_id')
    `;
    
    console.log('\n📋 Users table ID columns:');
    userSchema.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking vendor IDs:', error.message);
    
    // Try a simpler query
    try {
      const users = await sql`SELECT id, first_name, last_name FROM users WHERE user_type = 'vendor' LIMIT 3`;
      console.log('\n🔍 Vendor users:');
      users.forEach(user => {
        console.log(`   ${user.first_name} ${user.last_name}: ${user.id}`);
      });
    } catch (e) {
      console.error('Even simpler query failed:', e.message);
    }
  }
  
  process.exit(0);
}

checkVendorIds();
