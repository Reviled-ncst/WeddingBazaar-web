const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function checkConstraints() {
  try {
    console.log('🔍 CHECKING VENDOR FOREIGN KEY ISSUE');
    console.log('=====================================\n');
    
    // Check if vendors table exists and has data
    const vendorCount = await sql`SELECT COUNT(*) as count FROM vendors`;
    console.log(`📊 Vendors in database: ${vendorCount[0].count}`);
    
    if (vendorCount[0].count === 0) {
      console.log('❌ No vendors found! This explains the foreign key constraint error.');
      
      // Check for vendor users who need vendor profiles
      const vendorUsers = await sql`
        SELECT id, email, first_name, last_name 
        FROM users 
        WHERE user_type = 'vendor'
        LIMIT 5
      `;
      
      console.log(`\n� Found ${vendorUsers.length} vendor users without profiles:`);
      vendorUsers.forEach(user => {
        console.log(`  - ${user.id}: ${user.first_name} ${user.last_name} (${user.email})`);
      });
      
      if (vendorUsers.length > 0) {
        const firstVendorUser = vendorUsers[0];
        console.log(`\n🚀 Creating vendor profile for user: ${firstVendorUser.id}`);
        
        try {
          const [newVendor] = await sql`
            INSERT INTO vendors (id, user_id, business_name, business_type, description, created_at)
            VALUES (
              ${firstVendorUser.id},
              ${firstVendorUser.id},
              ${firstVendorUser.first_name + ' Wedding Services'},
              'Photography',
              'Test vendor profile for service creation',
              NOW()
            )
            RETURNING id, business_name
          `;
          
          console.log(`✅ Created vendor profile: ${newVendor.id} - ${newVendor.business_name}`);
          console.log(`\n🎯 NOW USE THIS VENDOR ID: "${newVendor.id}"`);
          
        } catch (createError) {
          console.log('❌ Failed to create vendor profile:', createError.message);
        }
      }
    } else {
      // Show existing vendors
      const vendors = await sql`SELECT id, business_name, user_id FROM vendors LIMIT 5`;
      console.log('\n📋 Existing vendors:');
      vendors.forEach(vendor => {
        console.log(`  - ${vendor.id}: ${vendor.business_name}`);
      });
      
      if (vendors.length > 0) {
        console.log(`\n🎯 USE ANY OF THESE VENDOR IDS: "${vendors[0].id}"`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkConstraints();
