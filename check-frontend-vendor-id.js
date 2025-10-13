async function checkFrontendVendorId() {
  console.log('🔍 Checking Frontend Vendor ID Usage...\n');
  
  // Test what vendor ID would be used by the frontend
  // This simulates what happens in VendorServices.tsx
  
  const API_BASE = 'https://weddingbazaar-web.onrender.com/api';
  
  try {
    // Step 1: Get existing vendors to see what IDs are valid
    console.log('📤 Fetching valid vendor IDs...');
    const vendorsResponse = await fetch(`${API_BASE}/vendors/featured`);
    const vendorsResult = await vendorsResponse.json();
    
    if (vendorsResponse.ok && vendorsResult.success) {
      console.log('✅ Valid Vendor IDs in database:');
      vendorsResult.vendors.forEach(vendor => {
        console.log(`   - ${vendor.id}: ${vendor.name || vendor.business_name}`);
      });
      
      const validVendorIds = vendorsResult.vendors.map(v => v.id);
      
      // Step 2: Test which vendor ID the current hardcoded components would use
      const hardcodedVendorId = '2-2025-003';
      const isHardcodedValid = validVendorIds.includes(hardcodedVendorId);
      
      console.log(`\n🎯 Analysis:`);
      console.log(`   - Hardcoded vendor ID: ${hardcodedVendorId}`);
      console.log(`   - Is valid in database: ${isHardcodedValid ? '✅ YES' : '❌ NO'}`);
      
      if (!isHardcodedValid) {
        console.log(`\n❌ PROBLEM FOUND:`);
        console.log(`   The hardcoded vendor ID "${hardcodedVendorId}" does not exist in the vendors table!`);
        console.log(`   This is why you're getting "violates foreign key constraint" errors.`);
        console.log(`\n✅ SOLUTION:`);
        console.log(`   Use one of these valid vendor IDs instead:`);
        validVendorIds.forEach(id => {
          const vendor = vendorsResult.vendors.find(v => v.id === id);
          console.log(`   - ${id} (${vendor.name || vendor.business_name})`);
        });
      }
      
      // Step 3: Test service creation with a valid vendor ID
      const testVendorId = validVendorIds[0]; // Use first valid vendor
      console.log(`\n🧪 Testing service creation with valid vendor ID: ${testVendorId}`);
      
      const testService = {
        vendor_id: testVendorId,
        title: 'Frontend Vendor ID Test - ' + Date.now(),
        description: 'Testing service creation with frontend vendor ID detection',
        category: 'photography',
        price: 1800.00,
        location: 'Manila, Philippines',
        price_range: '₱₱',
        images: [
          "https://res.cloudinary.com/dht64xt1g/image/upload/v1760372449/snj7ftfbxminyqe4gjn4.jpg"
        ],
        is_active: true,
        featured: false
      };
      
      const createResponse = await fetch(`${API_BASE}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testService)
      });
      
      const createResult = await createResponse.json();
      
      console.log('\n📥 Service Creation Test:');
      console.log('Status:', createResponse.status, createResponse.statusText);
      
      if (createResponse.ok && createResult.success) {
        console.log('✅ SUCCESS: Service created with valid vendor ID!');
        console.log(`✅ Service ID: ${createResult.service.id}`);
        console.log(`✅ Vendor ID: ${createResult.service.vendor_id}`);
      } else {
        console.log('❌ FAILED: Service creation failed');
        console.log('Error:', createResult.error);
      }
      
    } else {
      console.log('❌ Failed to fetch vendors');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function runFrontendVendorCheck() {
  console.log('🚀 Frontend Vendor ID Check...\n');
  await checkFrontendVendorId();
  console.log('\n🎯 The issue is likely that hardcoded vendor IDs in the frontend');
  console.log('   do not match the actual vendor IDs in the database.');
  console.log('   This causes foreign key constraint violations when creating services.');
}

// Run the check
runFrontendVendorCheck().catch(console.error);
