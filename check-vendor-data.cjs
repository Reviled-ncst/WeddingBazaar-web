const fetch = require('node-fetch');

async function checkVendorData() {
  console.log('🔍 [VENDOR CHECK] Investigating vendor data issue...');
  
  const baseUrl = 'https://weddingbazaar-web.onrender.com';
  
  try {
    // Check vendors table
    console.log('1️⃣ [VENDORS] Testing vendors endpoint...');
    const vendorsResponse = await fetch(`${baseUrl}/api/vendors`, {
      timeout: 10000
    });
    
    if (vendorsResponse.ok) {
      const vendorsData = await vendorsResponse.json();
      console.log('✅ [VENDORS] Found vendors:', vendorsData.vendors?.length || 'N/A');
      
      if (vendorsData.vendors && vendorsData.vendors.length > 0) {
        // Look for vendor with ID "2"
        const vendor2 = vendorsData.vendors.find(v => v.id === '2' || v.id === 2);
        if (vendor2) {
          console.log('🎯 [VENDOR-2] Found vendor ID 2:', {
            id: vendor2.id,
            business_name: vendor2.business_name,
            name: vendor2.name,
            category: vendor2.category,
            business_type: vendor2.business_type
          });
        } else {
          console.log('⚠️ [VENDOR-2] Vendor ID 2 not found');
          console.log('📋 [VENDORS] Available vendor IDs:', vendorsData.vendors.map(v => v.id));
        }
      }
    } else {
      console.log('❌ [VENDORS] Failed:', vendorsResponse.status);
    }
    
    // Check vendor profiles
    console.log('\n2️⃣ [VENDOR-PROFILES] Testing vendor profiles...');
    const profilesResponse = await fetch(`${baseUrl}/api/vendor-profiles`, {
      timeout: 10000
    });
    
    if (profilesResponse.ok) {
      const profilesData = await profilesResponse.json();
      console.log('✅ [VENDOR-PROFILES] Response received');
      console.log('🔍 [VENDOR-PROFILES] Structure:', Object.keys(profilesData));
    } else {
      console.log('❌ [VENDOR-PROFILES] Failed:', profilesResponse.status);
    }
    
    // Check specific vendor by ID
    console.log('\n3️⃣ [VENDOR-DETAIL] Testing specific vendor lookup...');
    const vendorDetailResponse = await fetch(`${baseUrl}/api/vendors/2`, {
      timeout: 10000
    });
    
    if (vendorDetailResponse.ok) {
      const vendorDetail = await vendorDetailResponse.json();
      console.log('✅ [VENDOR-DETAIL] Vendor 2 details:', vendorDetail);
    } else {
      console.log('❌ [VENDOR-DETAIL] Failed:', vendorDetailResponse.status);
    }
    
  } catch (error) {
    console.error('❌ [VENDOR CHECK] Error:', error.message);
  }
}

checkVendorData();
