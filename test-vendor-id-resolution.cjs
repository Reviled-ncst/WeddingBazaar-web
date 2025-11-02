/**
 * Test Vendor ID Resolution
 * 
 * This script tests the vendor ID resolution logic that happens during service creation.
 * It simulates what the backend does when it receives a user_id instead of vendor_id.
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function testVendorIdResolution() {
  console.log('\n🔍 Testing Vendor ID Resolution\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Get all vendors
    console.log('\n📊 Step 1: Get all vendors');
    const vendors = await sql`SELECT id, user_id, business_name FROM vendors ORDER BY created_at`;
    
    console.log(`\nFound ${vendors.length} vendors:`);
    vendors.forEach((v, i) => {
      console.log(`  ${i + 1}. Vendor ID: ${v.id} | User ID: ${v.user_id} | Business: ${v.business_name}`);
    });
    
    // 2. Get all users with vendor role
    console.log('\n📊 Step 2: Get all vendor users');
    const users = await sql`SELECT id, email, role FROM users WHERE role = 'vendor' ORDER BY created_at`;
    
    console.log(`\nFound ${users.length} vendor users:`);
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. User ID: ${u.id} | Email: ${u.email}`);
    });
    
    // 3. Test resolution for each user
    console.log('\n🧪 Step 3: Test vendor ID resolution for each user');
    console.log('\nSimulating: Frontend sends user.id, backend needs to find vendor.id\n');
    
    for (const user of users) {
      console.log(`\n--- Testing user: ${user.email} (${user.id}) ---`);
      
      // Simulate backend logic
      let actualVendorId = user.id;
      
      // First, try to find vendor by vendor ID (will fail since we're sending user_id)
      let vendorCheck = await sql`SELECT id, user_id FROM vendors WHERE id = ${user.id} LIMIT 1`;
      
      if (vendorCheck.length === 0) {
        console.log(`  ⚠️  Not found by vendor ID (expected)`);
        console.log(`  🔍 Trying user_id lookup...`);
        
        // Try to find by user_id instead
        vendorCheck = await sql`SELECT id, user_id FROM vendors WHERE user_id = ${user.id} LIMIT 1`;
        
        if (vendorCheck.length > 0) {
          actualVendorId = vendorCheck[0].id;
          console.log(`  ✅ Found vendor by user_id: ${actualVendorId}`);
        } else {
          console.log(`  ❌ NOT FOUND by user_id either!`);
        }
      } else {
        console.log(`  ✅ Found vendor by vendor ID: ${vendorCheck[0].id}`);
      }
    }
    
    // 4. Check actual services and their vendor_id values
    console.log('\n📊 Step 4: Check existing services and their vendor_id');
    const services = await sql`
      SELECT s.id, s.title, s.vendor_id, v.business_name
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `;
    
    console.log(`\nFound ${services.length} recent services:`);
    services.forEach((s, i) => {
      const status = s.business_name ? '✅' : '❌';
      console.log(`  ${i + 1}. ${status} Service: ${s.title}`);
      console.log(`      Vendor ID: ${s.vendor_id} | Business: ${s.business_name || 'NOT FOUND'}`);
    });
    
    // 5. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total vendors in vendors table: ${vendors.length}`);
    console.log(`Total vendor users: ${users.length}`);
    console.log(`Recent services checked: ${services.length}`);
    
    const orphanedServices = services.filter(s => !s.business_name).length;
    if (orphanedServices > 0) {
      console.log(`\n⚠️  WARNING: ${orphanedServices} services have invalid vendor_id`);
    } else {
      console.log(`\n✅ All services have valid vendor_id`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testVendorIdResolution()
  .then(() => {
    console.log('\n✅ Test complete\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
