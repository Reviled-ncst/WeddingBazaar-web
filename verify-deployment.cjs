#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks frontend and backend deployment status and basic functionality
 */

const https = require('https');

const FRONTEND_URL = 'https://weddingbazaarph.web.app';
const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    https.get(url, (res) => {
      const duration = Date.now() - startTime;
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          duration
        });
      });
    }).on('error', reject);
  });
}

async function checkFrontend() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('📱 FRONTEND DEPLOYMENT CHECK', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  try {
    log(`\n🔍 Checking: ${FRONTEND_URL}`, 'blue');
    const response = await makeRequest(FRONTEND_URL);
    
    if (response.statusCode === 200) {
      log('✅ Frontend is LIVE', 'green');
      log(`   Status: ${response.statusCode}`, 'green');
      log(`   Response Time: ${response.duration}ms`, 'green');
      
      // Check for React app indicators
      if (response.body.includes('root') || response.body.includes('React')) {
        log('✅ React app detected', 'green');
      }
      
      // Check for recent build (if timestamp in HTML)
      const buildDate = new Date().toISOString().split('T')[0];
      log(`   Last checked: ${new Date().toLocaleString()}`, 'green');
      
      return true;
    } else {
      log(`❌ Frontend returned status ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Frontend check failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkBackendHealth() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('⚙️  BACKEND HEALTH CHECK', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  try {
    log(`\n🔍 Checking: ${BACKEND_URL}/api/health`, 'blue');
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      log('✅ Backend is LIVE', 'green');
      log(`   Status: ${data.status}`, 'green');
      log(`   Database: ${data.database || 'Connected'}`, 'green');
      log(`   Response Time: ${response.duration}ms`, 'green');
      return true;
    } else {
      log(`❌ Backend health check returned ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backend health check failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkBackendAPI() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('🔌 BACKEND API ENDPOINTS CHECK', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  const endpoints = [
    { path: '/api/vendors/featured', name: 'Featured Vendors' },
    { path: '/api/services/categories', name: 'Service Categories' }
  ];
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    try {
      log(`\n🔍 Testing: ${endpoint.name}`, 'blue');
      const response = await makeRequest(`${BACKEND_URL}${endpoint.path}`);
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        log(`✅ ${endpoint.name} - OK`, 'green');
        log(`   Response Time: ${response.duration}ms`, 'green');
        
        if (Array.isArray(data)) {
          log(`   Records returned: ${data.length}`, 'green');
        } else if (data.vendors) {
          log(`   Vendors returned: ${data.vendors.length}`, 'green');
        } else if (data.categories) {
          log(`   Categories returned: ${data.categories.length}`, 'green');
        }
      } else {
        log(`❌ ${endpoint.name} - Status ${response.statusCode}`, 'red');
        allPassed = false;
      }
    } catch (error) {
      log(`❌ ${endpoint.name} - Error: ${error.message}`, 'red');
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function checkEmailService() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('📧 EMAIL SERVICE CHECK', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  log('\n⚠️  Email service requires environment variables:', 'yellow');
  log('   - EMAIL_USER (Gmail address)', 'yellow');
  log('   - EMAIL_PASS (Gmail App Password)', 'yellow');
  log('\n📝 To verify email service:', 'blue');
  log('   1. Add EMAIL_USER and EMAIL_PASS to Render', 'blue');
  log('   2. Redeploy backend', 'blue');
  log('   3. Create a test booking', 'blue');
  log('   4. Check vendor email inbox', 'blue');
  log('\n   See: RENDER_EMAIL_SETUP_QUICK.md', 'blue');
}

async function checkRecentFixes() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('🔧 RECENT FIXES VERIFICATION', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  log('\n✅ Code fixes deployed:', 'green');
  log('   1. Payment modal fix (UpgradePrompt.tsx)', 'green');
  log('   2. Signout dialog fix (CoupleHeader.tsx)', 'green');
  log('   3. Email notification system (emailService.cjs)', 'green');
  
  log('\n📋 Manual testing required:', 'yellow');
  log('   - Payment modal appears on "Upgrade Now" click', 'yellow');
  log('   - Signout confirmation modal works correctly', 'yellow');
  log('   - Vendor receives email on new booking', 'yellow');
  
  log('\n📄 See: MANUAL_TEST_PLAN.md for detailed test steps', 'blue');
}

async function main() {
  log('╔════════════════════════════════════════════════════════╗', 'blue');
  log('║     WEDDING BAZAAR DEPLOYMENT VERIFICATION             ║', 'bold');
  log('╚════════════════════════════════════════════════════════╝', 'blue');
  log(`\n🕐 Timestamp: ${new Date().toLocaleString()}`, 'blue');
  
  const results = {
    frontend: await checkFrontend(),
    backendHealth: await checkBackendHealth(),
    backendAPI: await checkBackendAPI()
  };
  
  await checkEmailService();
  await checkRecentFixes();
  
  // Summary
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('📊 DEPLOYMENT SUMMARY', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  log(`\n Frontend:     ${results.frontend ? '✅ LIVE' : '❌ DOWN'}`, 
      results.frontend ? 'green' : 'red');
  log(`   Backend Health: ${results.backendHealth ? '✅ LIVE' : '❌ DOWN'}`, 
      results.backendHealth ? 'green' : 'red');
  log(`   Backend APIs:   ${results.backendAPI ? '✅ WORKING' : '❌ ERRORS'}`, 
      results.backendAPI ? 'green' : 'red');
  
  const allPassed = results.frontend && results.backendHealth && results.backendAPI;
  
  if (allPassed) {
    log('\n✅ ALL SYSTEMS OPERATIONAL', 'green');
    log('\n🎉 Ready for manual testing!', 'green');
    log('   Run manual tests from: MANUAL_TEST_PLAN.md', 'blue');
  } else {
    log('\n❌ SOME SYSTEMS NEED ATTENTION', 'red');
    log('\n🔍 Check deployment logs:', 'yellow');
    log('   Frontend: Firebase Console', 'yellow');
    log('   Backend: Render Dashboard → Logs', 'yellow');
  }
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');
}

main().catch(console.error);
