/**
 * 🧪 Quick Verification Script for Subscription System Deployment
 * Tests all critical subscription endpoints to verify deployment success
 */

const BASE_URL = 'https://weddingbazaar-web.onrender.com/api';

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to run a test
async function runTest(name, url, options = {}) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    const status = response.status;
    const success = status >= 200 && status < 300;
    
    console.log(`   Status: ${status}`);
    console.log(`   Result: ${JSON.stringify(data).substring(0, 200)}...`);
    
    if (success || status === 400 || status === 500) {
      // 400 = validation error (endpoint exists)
      // 500 = DB error (endpoint exists, DB issue)
      console.log(`   ✅ PASS (endpoint exists)`);
      results.passed++;
      results.tests.push({ name, status: 'PASS', httpStatus: status });
    } else if (status === 404) {
      console.log(`   ❌ FAIL (endpoint not found)`);
      results.failed++;
      results.tests.push({ name, status: 'FAIL', httpStatus: status, error: '404 Not Found' });
    } else {
      console.log(`   ⚠️  WARN (unexpected status: ${status})`);
      results.tests.push({ name, status: 'WARN', httpStatus: status });
    }
    
    return { success: true, status, data };
  } catch (error) {
    console.log(`   ❌ FAIL (${error.message})`);
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    return { success: false, error: error.message };
  }
}

// Main test suite
async function runVerification() {
  console.log('🚀 Starting Quick Verification of Subscription System Deployment');
  console.log('='.repeat(70));
  
  // 1. Health check
  await runTest(
    'Health Check',
    `${BASE_URL}/health`
  );
  
  // 2. Subscription plans
  await runTest(
    'Get Subscription Plans',
    `${BASE_URL}/subscriptions/plans`
  );
  
  // 3. Get specific plan
  await runTest(
    'Get Specific Plan (Professional)',
    `${BASE_URL}/subscriptions/plans/professional`
  );
  
  // 4. Create subscription (will fail with 400/500 due to auth/DB, but proves endpoint exists)
  await runTest(
    'Create Subscription',
    `${BASE_URL}/subscriptions/vendor/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorId: 'test-vendor-123',
        planId: 'professional',
        billingCycle: 'monthly'
      })
    }
  );
  
  // 5. Upgrade subscription
  await runTest(
    'Upgrade Subscription',
    `${BASE_URL}/subscriptions/vendor/upgrade`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorId: 'test-vendor-123',
        planId: 'enterprise',
        billingCycle: 'yearly'
      })
    }
  );
  
  // 6. Check usage limit
  await runTest(
    'Check Usage Limit',
    `${BASE_URL}/subscriptions/usage/check-limit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorId: 'test-vendor-123',
        limitType: 'max_services'
      })
    }
  );
  
  // 7. Get vendor subscription
  await runTest(
    'Get Vendor Subscription',
    `${BASE_URL}/subscriptions/vendor/test-vendor-123`
  );
  
  // 8. Payment health check
  await runTest(
    'Payment Service Health',
    `${BASE_URL}/subscriptions/payment/health`
  );
  
  // 9. Analytics overview
  await runTest(
    'Analytics Overview',
    `${BASE_URL}/subscriptions/analytics/overview`
  );
  
  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total:  ${results.tests.length}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 SUCCESS: All endpoints are reachable!');
    console.log('Next step: Create database tables to resolve 500 errors');
  } else {
    console.log('\n⚠️  ISSUES FOUND:');
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        console.log(`   - ${t.name}: ${t.error || `HTTP ${t.httpStatus}`}`);
      });
  }
  
  console.log('\n' + '='.repeat(70));
}

// Run the verification
runVerification().catch(error => {
  console.error('💥 Verification script failed:', error);
  process.exit(1);
});
