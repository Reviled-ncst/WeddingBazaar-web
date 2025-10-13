async function checkVendorRecord() {
  console.log('🔍 Checking if vendor record was created...\n');
  
  const API_BASE = 'https://weddingbazaar-web.onrender.com/api';
  
  try {
    // Create a vendor user
    const vendorEmail = `vendor.check.${Date.now()}@example.com`;
    
    console.log('📤 Creating vendor user...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first_name: 'Check',
        last_name: 'Vendor',
        email: vendorEmail,
        password: 'testpassword123',
        user_type: 'vendor'
      })
    });
    
    const registerResult = await registerResponse.json();
    console.log('Registration result:', JSON.stringify(registerResult, null, 2));
    
    if (registerResponse.ok && registerResult.success) {
      const vendorId = registerResult.user.id;
      console.log(`✅ Vendor user created: ${vendorId}`);
      
      // Now check if we can fetch this vendor from the vendors endpoint
      console.log('\n📤 Checking if vendor exists in vendors table...');
      
      const vendorsResponse = await fetch(`${API_BASE}/vendors/featured`);
      const vendorsResult = await vendorsResponse.json();
      
      if (vendorsResponse.ok && vendorsResult.success) {
        const foundVendor = vendorsResult.vendors.find(v => v.id === vendorId);
        
        if (foundVendor) {
          console.log('✅ Vendor found in vendors table!');
          console.log('Vendor details:', JSON.stringify(foundVendor, null, 2));
          
          // Now try creating a service
          console.log('\n📤 Testing service creation...');
          const serviceResponse = await fetch(`${API_BASE}/services`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              vendor_id: vendorId,
              title: `Test Service - ${Date.now()}`,
              description: 'Testing with properly created vendor record',
              category: 'photography',
              price: 1500.00,
              location: 'Manila, Philippines',
              price_range: '₱₱',
              images: ["https://res.cloudinary.com/dht64xt1g/image/upload/v1760372449/snj7ftfbxminyqe4gjn4.jpg"],
              is_active: true,
              featured: false
            })
          });
          
          const serviceResult = await serviceResponse.json();
          console.log('Service creation result:', JSON.stringify(serviceResult, null, 2));
          
          if (serviceResponse.ok && serviceResult.success) {
            console.log('🎉 SUCCESS! Service created with authenticated vendor!');
            return { success: true, vendorId, serviceId: serviceResult.service.id };
          } else {
            console.log('❌ Service creation still failed');
            return { success: false, error: serviceResult.error, vendorId };
          }
          
        } else {
          console.log('❌ Vendor NOT found in vendors table - registration fix not working');
          console.log(`Available vendors: ${vendorsResult.vendors.map(v => v.id).join(', ')}`);
          return { success: false, error: 'Vendor record not created', vendorId };
        }
      } else {
        console.log('❌ Failed to fetch vendors list');
        return { success: false, error: 'Cannot fetch vendors' };
      }
      
    } else {
      console.log('❌ Vendor registration failed');
      return { success: false, error: registerResult.error };
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

checkVendorRecord().then(result => {
  console.log('\n' + '='.repeat(50));
  if (result.success) {
    console.log('🎉 VENDOR RECORD FIX IS WORKING!');
    console.log(`✅ Vendor: ${result.vendorId}`);
    console.log(`✅ Service: ${result.serviceId}`);
  } else {
    console.log('❌ VENDOR RECORD FIX NEEDS MORE WORK');
    console.log(`❌ Error: ${result.error}`);
    if (result.vendorId) {
      console.log(`❌ Vendor ID: ${result.vendorId}`);
    }
  }
  console.log('='.repeat(50));
}).catch(console.error);
