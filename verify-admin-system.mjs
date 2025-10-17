/**
 * Live System Verification Script
 * Tests all admin user management endpoints in production
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

console.log('🔍 Testing Admin User Management System\n');
console.log('=====================================\n');

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n📡 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status} OK`);
      console.log(`   📊 Data:`, JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      console.log(`   ❌ Status: ${response.status} FAILED`);
      console.log(`   ⚠️ Error:`, JSON.stringify(data, null, 2));
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`   ❌ Request Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Admin API Health
  console.log('\n🏥 TEST 1: Admin API Health Check');
  console.log('─────────────────────────────────');
  const health = await testEndpoint(
    'Admin Health',
    `${API_BASE}/api/admin/health`
  );
  results.total++;
  if (health.success) results.passed++; else results.failed++;

  // Test 2: Get All Users
  console.log('\n👥 TEST 2: Get All Users');
  console.log('─────────────────────────────────');
  const users = await testEndpoint(
    'Get Users',
    `${API_BASE}/api/admin/users`
  );
  results.total++;
  if (users.success) results.passed++; else results.failed++;

  // Test 3: Verify User Data Structure
  if (users.success && users.data.users && users.data.users.length > 0) {
    console.log('\n📋 TEST 3: User Data Structure Validation');
    console.log('─────────────────────────────────────────');
    
    const sampleUser = users.data.users[0];
    const requiredFields = ['id', 'email', 'first_name', 'last_name', 'role', 'status', 'created_at'];
    const missingFields = requiredFields.filter(field => !(field in sampleUser));
    
    if (missingFields.length === 0) {
      console.log('   ✅ All required fields present');
      console.log('   📊 Sample user:', JSON.stringify(sampleUser, null, 2));
      results.passed++;
    } else {
      console.log('   ❌ Missing fields:', missingFields.join(', '));
      results.failed++;
    }
    results.total++;
  }

  // Test 4: Verify Stats Calculation
  if (users.success && users.data.stats) {
    console.log('\n📈 TEST 4: Statistics Validation');
    console.log('─────────────────────────────────');
    
    const stats = users.data.stats;
    const userCount = users.data.users.length;
    
    if (stats.total === userCount) {
      console.log('   ✅ Total count matches:', stats.total);
      console.log('   ✅ Active:', stats.active);
      console.log('   ✅ Inactive:', stats.inactive);
      console.log('   ✅ Suspended:', stats.suspended);
      console.log('   ✅ By Role:', JSON.stringify(stats.byRole, null, 2));
      
      // Verify sum
      const sum = stats.active + stats.inactive + stats.suspended;
      if (sum === stats.total) {
        console.log('   ✅ Status counts add up correctly');
        results.passed++;
      } else {
        console.log('   ❌ Status counts mismatch:', sum, '!==', stats.total);
        results.failed++;
      }
    } else {
      console.log('   ❌ Total count mismatch:', stats.total, '!==', userCount);
      results.failed++;
    }
    results.total++;
  }

  // Test 5: Role Mapping Verification
  if (users.success && users.data.users) {
    console.log('\n🎭 TEST 5: Role Mapping Validation');
    console.log('──────────────────────────────────');
    
    const validRoles = ['individual', 'vendor', 'admin'];
    const userRoles = users.data.users.map(u => u.role);
    const invalidRoles = userRoles.filter(role => !validRoles.includes(role));
    
    if (invalidRoles.length === 0) {
      console.log('   ✅ All roles valid:', [...new Set(userRoles)].join(', '));
      results.passed++;
    } else {
      console.log('   ❌ Invalid roles found:', invalidRoles.join(', '));
      results.failed++;
    }
    results.total++;
  }

  // Test 6: Status Values Verification
  if (users.success && users.data.users) {
    console.log('\n🚦 TEST 6: Status Values Validation');
    console.log('───────────────────────────────────');
    
    const validStatuses = ['active', 'inactive', 'suspended'];
    const userStatuses = users.data.users.map(u => u.status);
    const invalidStatuses = userStatuses.filter(status => !validStatuses.includes(status));
    
    if (invalidStatuses.length === 0) {
      console.log('   ✅ All statuses valid:', [...new Set(userStatuses)].join(', '));
      results.passed++;
    } else {
      console.log('   ❌ Invalid statuses found:', invalidStatuses.join(', '));
      results.failed++;
    }
    results.total++;
  }

  // Test 7: Get Single User
  if (users.success && users.data.users && users.data.users.length > 0) {
    console.log('\n👤 TEST 7: Get Single User');
    console.log('──────────────────────────');
    
    const userId = users.data.users[0].id;
    const singleUser = await testEndpoint(
      'Get Single User',
      `${API_BASE}/api/admin/users/${userId}`
    );
    results.total++;
    if (singleUser.success) results.passed++; else results.failed++;
  }

  // Test 8: Get User Stats
  console.log('\n📊 TEST 8: Get User Statistics');
  console.log('──────────────────────────────');
  const stats = await testEndpoint(
    'Get Stats',
    `${API_BASE}/api/admin/users/stats`
  );
  results.total++;
  if (stats.success) results.passed++; else results.failed++;

  // Final Results
  console.log('\n\n🎯 TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! System is fully operational.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the errors above.');
  }

  console.log('\n═══════════════════════════════════\n');
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
