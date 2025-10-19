/**
 * Test Script: Contact Info Auto-Population
 * 
 * This script simulates the auto-population logic to verify it works correctly
 */

// Mock vendor profiles with different data scenarios
const testProfiles = [
  {
    name: 'Complete Profile (camelCase)',
    profile: {
      phone: '+63 917 123 4567',
      email: 'vendor@example.com',
      website: 'https://vendor.com'
    },
    expected: {
      phone: '+63 917 123 4567',
      email: 'vendor@example.com',
      website: 'https://vendor.com'
    }
  },
  {
    name: 'Complete Profile (snake_case)',
    profile: {
      contact_phone: '+63 918 234 5678',
      contact_email: 'contact@vendor.ph',
      website_url: 'https://vendor.ph'
    },
    expected: {
      phone: '+63 918 234 5678',
      email: 'contact@vendor.ph',
      website: 'https://vendor.ph'
    }
  },
  {
    name: 'Mixed Naming Conventions',
    profile: {
      phone: '+63 919 345 6789',
      contact_email: 'mixed@vendor.com',
      website_url: 'https://mixed.com'
    },
    expected: {
      phone: '+63 919 345 6789',
      email: 'mixed@vendor.com',
      website: 'https://mixed.com'
    }
  },
  {
    name: 'Partial Profile (Email Only)',
    profile: {
      email: 'partial@vendor.com'
    },
    expected: {
      phone: '',
      email: 'partial@vendor.com',
      website: ''
    }
  },
  {
    name: 'Empty Profile',
    profile: {},
    expected: {
      phone: '',
      email: '',
      website: ''
    }
  },
  {
    name: 'Null Profile',
    profile: null,
    expected: {
      phone: '',
      email: '',
      website: ''
    }
  }
];

// Auto-population logic (same as in AddServiceForm)
function autoPopulateContactInfo(vendorProfile) {
  if (!vendorProfile) {
    return {
      phone: '',
      email: '',
      website: ''
    };
  }

  return {
    phone: vendorProfile.phone || vendorProfile.contact_phone || '',
    email: vendorProfile.email || vendorProfile.contact_email || '',
    website: vendorProfile.website || vendorProfile.website_url || vendorProfile.contact_website || ''
  };
}

// Run tests
console.log('🧪 Testing Contact Info Auto-Population\n');
console.log('='.repeat(80));

let passedTests = 0;
let failedTests = 0;

testProfiles.forEach((test, index) => {
  console.log(`\nTest ${index + 1}: ${test.name}`);
  console.log('-'.repeat(80));
  
  const result = autoPopulateContactInfo(test.profile);
  
  console.log('Input Profile:', JSON.stringify(test.profile, null, 2));
  console.log('Expected Result:', JSON.stringify(test.expected, null, 2));
  console.log('Actual Result:', JSON.stringify(result, null, 2));
  
  const passed = 
    result.phone === test.expected.phone &&
    result.email === test.expected.email &&
    result.website === test.expected.website;
  
  if (passed) {
    console.log('✅ PASSED');
    passedTests++;
  } else {
    console.log('❌ FAILED');
    failedTests++;
    
    if (result.phone !== test.expected.phone) {
      console.log(`  Phone mismatch: expected "${test.expected.phone}", got "${result.phone}"`);
    }
    if (result.email !== test.expected.email) {
      console.log(`  Email mismatch: expected "${test.expected.email}", got "${result.email}"`);
    }
    if (result.website !== test.expected.website) {
      console.log(`  Website mismatch: expected "${test.expected.website}", got "${result.website}"`);
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Test Results: ${passedTests} passed, ${failedTests} failed`);

if (failedTests === 0) {
  console.log('🎉 All tests passed! Contact info auto-population is working correctly.\n');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the logic.\n');
  process.exit(1);
}
