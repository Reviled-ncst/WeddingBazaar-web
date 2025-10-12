const fetch = require('node-fetch');

async function getVendorDetails() {
  console.log('🔍 [VENDOR DETAILS] Getting all vendor information...');
  
  const baseUrl = 'https://weddingbazaar-web.onrender.com';
  
  try {
    const vendorsResponse = await fetch(`${baseUrl}/api/vendors`, {
      timeout: 10000
    });
    
    if (vendorsResponse.ok) {
      const vendorsData = await vendorsResponse.json();
      console.log('✅ [VENDORS] Found vendors:', vendorsData.vendors?.length);
      
      if (vendorsData.vendors && vendorsData.vendors.length > 0) {
        console.log('\n📋 [VENDOR LIST] All available vendors:');
        vendorsData.vendors.forEach((vendor, index) => {
          console.log(`${index + 1}. ID: ${vendor.id}`);
          console.log(`   Name: ${vendor.business_name || vendor.name || 'N/A'}`);
          console.log(`   Category: ${vendor.category || vendor.business_type || 'N/A'}`);
          console.log(`   Rating: ${vendor.rating || 'N/A'}`);
          console.log(`   Location: ${vendor.location || 'N/A'}`);
          console.log('   ---');
        });
        
        // Find the most likely vendor for our bookings (probably the first cake/catering vendor)
        const cakeVendor = vendorsData.vendors.find(v => 
          (v.business_name || v.name || '').toLowerCase().includes('cake') ||
          (v.category || v.business_type || '').toLowerCase().includes('cake') ||
          (v.category || v.business_type || '').toLowerCase().includes('catering')
        );
        
        if (cakeVendor) {
          console.log('\n🎯 [MATCHING VENDOR] Most likely vendor for "Professional Cake Designer Service":');
          console.log('   ID:', cakeVendor.id);
          console.log('   Name:', cakeVendor.business_name || cakeVendor.name);
          console.log('   Category:', cakeVendor.category || cakeVendor.business_type);
          console.log('   This should be used instead of vendor_id: "2"');
        }
      }
    } else {
      console.log('❌ [VENDORS] Failed:', vendorsResponse.status);
    }
    
  } catch (error) {
    console.error('❌ [VENDOR DETAILS] Error:', error.message);
  }
}

getVendorDetails();
