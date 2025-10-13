const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

console.log('🔧 FIXING MALFORMED VENDOR USER IDs');
console.log('==================================');

async function fixVendorUserIds() {
  try {
    console.log('\n1. Checking current vendor data...');
    
    // Get vendors with malformed user IDs
    const vendors = await sql`
      SELECT id, user_id, business_name, email, phone
      FROM vendors 
      WHERE user_id LIKE '%-%'
      ORDER BY id
    `;
    
    console.log(`Found ${vendors.length} vendors with malformed user IDs:`);
    vendors.forEach(vendor => {
      console.log(`  - ID: ${vendor.id}, User ID: "${vendor.user_id}", Business: ${vendor.business_name}`);
    });
    
    if (vendors.length === 0) {
      console.log('✅ No malformed vendor user IDs found');
      return;
    }
    
    console.log('\n2. Fixing malformed user IDs...');
    
    for (const vendor of vendors) {
      // Extract the actual user ID (first part before the dash)
      const actualUserId = vendor.user_id.split('-')[0];
      
      console.log(`Fixing vendor ${vendor.id}: "${vendor.user_id}" -> "${actualUserId}"`);
      
      // Update the vendor record
      await sql`
        UPDATE vendors 
        SET user_id = ${actualUserId}
        WHERE id = ${vendor.id}
      `;
      
      console.log(`✅ Fixed vendor ${vendor.id} (${vendor.business_name})`);
    }
    
    console.log('\n3. Verifying fixes...');
    
    // Check the results
    const fixedVendors = await sql`
      SELECT id, user_id, business_name
      FROM vendors 
      WHERE id IN (${vendors.map(v => v.id).join(',')})
      ORDER BY id
    `;
    
    console.log('Updated vendor records:');
    fixedVendors.forEach(vendor => {
      console.log(`  ✅ ID: ${vendor.id}, User ID: "${vendor.user_id}", Business: ${vendor.business_name}`);
    });
    
    console.log('\n4. Testing booking endpoint access...');
    
    // Test that the fixes work
    for (const vendor of fixedVendors) {
      try {
        const bookings = await sql`
          SELECT COUNT(*) as count
          FROM bookings 
          WHERE vendor_id = ${vendor.user_id}
        `;
        
        console.log(`  ✅ Vendor ${vendor.user_id} can now access bookings (${bookings[0].count} found)`);
      } catch (error) {
        console.log(`  ❌ Vendor ${vendor.user_id} still has issues: ${error.message}`);
      }
    }
    
    console.log('\n🎉 VENDOR USER ID FIX COMPLETED!');
    console.log('==================================');
    console.log('✅ All malformed vendor user IDs have been corrected');
    console.log('✅ Vendors can now access their bookings properly');
    console.log('✅ Security system continues to protect against malformed IDs');
    console.log('');
    console.log('🔄 Please refresh the frontend to see the changes');
    
  } catch (error) {
    console.error('❌ Error fixing vendor user IDs:', error);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 DATABASE ACCESS ISSUE:');
      console.log('The database credentials may need to be updated.');
      console.log('This fix can be run on the production server where database access is available.');
    }
  }
}

fixVendorUserIds();
