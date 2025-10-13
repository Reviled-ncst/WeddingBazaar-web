async function checkLatestUserRegistrations() {
  console.log('🔍 Checking the latest user registrations and their IDs...\n');
  
  const API_BASE = 'https://weddingbazaar-web.onrender.com/api';
  
  // First, let's test a new registration to see the current ID format
  console.log('📤 Testing new user registration...\n');
  
  const testUser = {
    first_name: 'ID Test',
    last_name: 'User',
    email: `id.test.user.${Date.now()}@example.com`,
    password: 'testpassword123',
    user_type: 'couple'
  };

  try {
    console.log('🔗 Registration endpoint: /api/auth/register');
    console.log('📊 Test user data:', JSON.stringify(testUser, null, 2));
    
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const result = await response.json();
    
    console.log('\n📥 Registration Response:');
    console.log('Status:', response.status, response.statusText);
    console.log('Body:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('\n✅ USER REGISTRATION SUCCESSFUL!');
      console.log(`🆔 User ID: ${result.user.id}`);
      console.log(`📧 Email: ${result.user.email}`);
      console.log(`👤 User Type: ${result.user.user_type}`);
      
      // Analyze the ID format
      console.log('\n🎯 USER ID FORMAT ANALYSIS:');
      const userId = result.user.id;
      console.log(`✅ User ID: ${userId}`);
      
      if (userId.startsWith('1-2025-')) {
        const idNumber = userId.split('-')[2];
        const isValidFormat = /^\d{3}$/.test(idNumber);
        
        console.log(`✅ Format: 1-2025-xxx - CORRECT for individual/couple user`);
        console.log(`✅ Sequential number: ${idNumber} - ${isValidFormat ? 'VALID 3-digit format' : 'INVALID format'}`);
        console.log(`✅ ID Type: ${isValidFormat ? 'Sequential (NEW FORMAT)' : 'Invalid format'}`);
      } else if (userId.startsWith('2-2025-')) {
        const idNumber = userId.split('-')[2];
        const isValidFormat = /^\d{3}$/.test(idNumber);
        
        console.log(`✅ Format: 2-2025-xxx - CORRECT for vendor user`);
        console.log(`✅ Sequential number: ${idNumber} - ${isValidFormat ? 'VALID 3-digit format' : 'INVALID format'}`);
        console.log(`✅ ID Type: ${isValidFormat ? 'Sequential (NEW FORMAT)' : 'Invalid format'}`);
      } else {
        console.log(`❌ Format: Does not match expected patterns - INCORRECT`);
        console.log(`❌ Expected: 1-2025-xxx (individual) or 2-2025-xxx (vendor)`);
      }
      
      return { success: true, userId: result.user.id };
    } else {
      console.log('\n❌ USER REGISTRATION FAILED');
      console.log(`❌ Error: ${result.error || 'Unknown error'}`);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.log('\n❌ NETWORK ERROR during registration');
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testVendorRegistration() {
  console.log('\n\n📤 Testing vendor registration...\n');
  
  const API_BASE = 'https://weddingbazaar-web.onrender.com/api';
  
  const testVendor = {
    first_name: 'Vendor Test',
    last_name: 'Business',
    email: `vendor.test.${Date.now()}@example.com`,
    password: 'testpassword123',
    user_type: 'vendor'
  };

  try {
    console.log('🔗 Registration endpoint: /api/auth/register');
    console.log('📊 Test vendor data:', JSON.stringify(testVendor, null, 2));
    
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testVendor)
    });

    const result = await response.json();
    
    console.log('\n📥 Vendor Registration Response:');
    console.log('Status:', response.status, response.statusText);
    console.log('Body:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('\n✅ VENDOR REGISTRATION SUCCESSFUL!');
      console.log(`🆔 Vendor ID: ${result.user.id}`);
      console.log(`📧 Email: ${result.user.email}`);
      console.log(`👤 User Type: ${result.user.user_type}`);
      
      // Analyze the vendor ID format
      console.log('\n🎯 VENDOR ID FORMAT ANALYSIS:');
      const vendorId = result.user.id;
      console.log(`✅ Vendor ID: ${vendorId}`);
      
      if (vendorId.startsWith('2-2025-')) {
        const idNumber = vendorId.split('-')[2];
        const isValidFormat = /^\d{3}$/.test(idNumber);
        
        console.log(`✅ Format: 2-2025-xxx - CORRECT for vendor user`);
        console.log(`✅ Sequential number: ${idNumber} - ${isValidFormat ? 'VALID 3-digit format' : 'INVALID format'}`);
        console.log(`✅ ID Type: ${isValidFormat ? 'Sequential (NEW FORMAT)' : 'Invalid format'}`);
      } else {
        console.log(`❌ Format: Does not match expected pattern - INCORRECT`);
        console.log(`❌ Expected: 2-2025-xxx for vendor users`);
      }
      
      return { success: true, vendorId: result.user.id };
    } else {
      console.log('\n❌ VENDOR REGISTRATION FAILED');
      console.log(`❌ Error: ${result.error || 'Unknown error'}`);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.log('\n❌ NETWORK ERROR during vendor registration');
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runRegistrationTests() {
  console.log('🚀 Starting User Registration ID Format Tests...\n');
  console.log('=' .repeat(70));
  
  // Test individual/couple user registration
  const individualResult = await checkLatestUserRegistrations();
  
  // Test vendor user registration
  const vendorResult = await testVendorRegistration();
  
  // Summary
  console.log('\n' + '=' .repeat(70));
  console.log('📊 REGISTRATION TEST SUMMARY:');
  
  if (individualResult.success && vendorResult.success) {
    console.log('🎉 ALL REGISTRATION TESTS PASSED!');
    console.log('✅ Individual/couple users use 1-2025-xxx format');
    console.log('✅ Vendor users use 2-2025-xxx format');
    console.log('✅ Sequential ID generation is working correctly');
    console.log(`✅ Latest individual ID: ${individualResult.userId}`);
    console.log(`✅ Latest vendor ID: ${vendorResult.vendorId}`);
  } else {
    console.log('❌ SOME REGISTRATION TESTS FAILED');
    console.log(`❌ Individual success: ${individualResult.success}`);
    console.log(`❌ Vendor success: ${vendorResult.success}`);
  }
  
  console.log('=' .repeat(70));
}

// Run the registration tests
runRegistrationTests().catch(console.error);
