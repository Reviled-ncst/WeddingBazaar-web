const { sql } = require('./backend-deploy/config/database.cjs');

async function checkActualVendorIds() {
  console.log('🔍 ACTUAL VENDOR IDS CHECK');
  console.log('==========================\n');
  
  try {
    // Get all vendors
    const vendors = await sql`
      SELECT id, user_id, business_name, business_type, created_at
      FROM vendors 
      ORDER BY created_at DESC
    `;
    
    console.log(`📊 Found ${vendors.length} vendors in database:`);
    vendors.forEach((vendor, index) => {
      console.log(`  ${index + 1}. ID: "${vendor.id}" (${vendor.id.length} chars)`);
      console.log(`     User ID: "${vendor.user_id}" (${vendor.user_id?.length || 0} chars)`);
      console.log(`     Business: ${vendor.business_name}`);
      console.log(`     Type: ${vendor.business_type}`);
      console.log('     ---');
    });
    
    if (vendors.length > 0) {
      const firstVendor = vendors[0];
      console.log(`\n🎯 RECOMMENDED VENDOR ID FOR TESTING: "${firstVendor.id}"`);
      console.log(`   Length: ${firstVendor.id.length} characters`);
      console.log(`   Business: ${firstVendor.business_name}`);
      
      // Test if services table can accept this vendor_id
      console.log('\n🧪 Testing service creation with this vendor ID...');
      const testServiceData = {
        vendor_id: firstVendor.id,
        title: 'Test Service Creation',
        name: 'Test Service Creation',
        description: 'Testing service creation with valid vendor ID',
        category: 'Photography',
        price_range: '500-1000'
      };
      
      try {
        const [newService] = await sql`
          INSERT INTO services (id, vendor_id, title, name, description, category, price_range, created_at)
          VALUES (
            ${`test-service-${Date.now()}`},
            ${testServiceData.vendor_id},
            ${testServiceData.title},
            ${testServiceData.name},
            ${testServiceData.description},
            ${testServiceData.category},
            ${testServiceData.price_range},
            NOW()
          )
          RETURNING id, vendor_id, title
        `;
        
        console.log('✅ Service creation test SUCCESSFUL!');
        console.log('   Service ID:', newService.id);
        console.log('   Vendor ID:', newService.vendor_id);
        console.log('   Title:', newService.title);
        
        // Clean up test service
        await sql`DELETE FROM services WHERE id = ${newService.id}`;
        console.log('🧹 Test service cleaned up');
        
      } catch (serviceError) {
        console.log('❌ Service creation test FAILED:');
        console.log('   Error:', serviceError.message);
        
        if (serviceError.message.includes('foreign key constraint')) {
          console.log('\n🔍 Foreign key constraint violation detected!');
          console.log('   This means the vendor_id format is incompatible with database constraints.');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Database query error:', error);
  } finally {
    process.exit(0);
  }
}

checkActualVendorIds();
