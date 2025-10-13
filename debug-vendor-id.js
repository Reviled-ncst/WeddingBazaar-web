#!/usr/bin/env node

/**
 * DEBUG VENDOR ID VALIDATION ISSUE
 */

console.log('🔍 DEBUGGING VENDOR ID VALIDATION ISSUE');
console.log('=========================================\n');

async function debugVendorId() {
  const testVendorId = '2-2025-003';
  const apiUrl = 'https://weddingbazaar-web.onrender.com';
  
  console.log(`Testing vendor ID: ${testVendorId}`);
  console.log(`API URL: ${apiUrl}`);
  console.log('');
  
  // Test the validation logic locally
  const isMalformedUserId = (id) => {
    if (!id || typeof id !== 'string') return true;
    // Allow legitimate vendor IDs while blocking obvious booking IDs
    // Temporarily allow "2-2025-003" format until database migration completes
    if (/^\d+-\d{4}-\d{6,}$/.test(id)) return true; // Block very long booking-like IDs
    // Check for other suspicious patterns
    if (id.includes('-') && id.length > 10) return true;
    return false;
  };
  
  console.log('🧪 LOCAL VALIDATION TEST:');
  console.log(`ID: ${testVendorId}`);
  console.log(`Length: ${testVendorId.length}`);
  console.log(`Has dash: ${testVendorId.includes('-')}`);
  console.log(`Regex test (6+ digits): ${/^\d+-\d{4}-\d{6,}$/.test(testVendorId)}`);
  console.log(`Should be blocked: ${isMalformedUserId(testVendorId)}`);
  console.log(`Should allow access: ${!isMalformedUserId(testVendorId)}`);
  console.log('');
  
  // Test the actual API call
  console.log('🌐 PRODUCTION API TEST:');
  try {
    const response = await fetch(`${apiUrl}/api/bookings/vendor/${testVendorId}`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    if (data.code === 'MALFORMED_VENDOR_ID') {
      console.log('\n❌ PROBLEM IDENTIFIED:');
      console.log('The production backend is incorrectly blocking this vendor ID');
      console.log('This suggests the backend code differs from our local version');
    }
    
  } catch (error) {
    console.log(`❌ API Error: ${error.message}`);
  }
  
  console.log('');
  
  // Test with other vendor IDs to see if it's a pattern
  console.log('🧪 TESTING OTHER VENDOR IDs:');
  const otherVendorIds = ['2-2025-001', '2-2025-002', '2-2025-004', '1', '2'];
  
  for (const vendorId of otherVendorIds) {
    try {
      console.log(`\nTesting: ${vendorId}`);
      console.log(`Local validation: ${!isMalformedUserId(vendorId) ? 'ALLOW' : 'BLOCK'}`);
      
      const response = await fetch(`${apiUrl}/api/bookings/vendor/${vendorId}`);
      const data = await response.json();
      
      console.log(`API response: ${response.status} - ${data.code || 'OK'}`);
      
    } catch (error) {
      console.log(`API error: ${error.message}`);
    }
  }
  
  console.log('\n🔧 POTENTIAL SOLUTIONS:');
  console.log('1. Backend needs to be redeployed with the correct validation logic');
  console.log('2. Or the validation logic needs to be updated to allow 2-2025-XXX format');
  console.log('3. Or there may be additional security checks we\'re not seeing');
}

debugVendorId().catch(console.error);
