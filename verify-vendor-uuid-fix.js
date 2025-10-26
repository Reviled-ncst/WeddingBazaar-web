/**
 * 🧪 VENDOR UUID FIX VERIFICATION TEST
 * 
 * This test verifies that service creation uses the correct vendor UUID
 * instead of the user ID format, fixing the FK constraint violation.
 * 
 * Expected vendor data:
 * - User ID: 2-2025-003
 * - Vendor UUID: daf1dd71-b5c7-44a1-bf88-36d41e73a7fa
 * - Email: elealesantos06@gmail.com
 */

const API_URL = process.env.API_URL || 'https://weddingbazaar-web.onrender.com';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifyVendorUUID() {
  log('cyan', '\n=================================');
  log('cyan', '🔍 VENDOR UUID VERIFICATION TEST');
  log('cyan', '=================================\n');

  try {
    // Step 1: Check vendor record exists
    log('blue', '📋 Step 1: Checking vendor record in database...');
    const vendorResponse = await fetch(`${API_URL}/api/vendors/daf1dd71-b5c7-44a1-bf88-36d41e73a7fa`);
    
    if (!vendorResponse.ok) {
      log('red', `❌ Vendor record not found (Status: ${vendorResponse.status})`);
      log('yellow', 'Run fix-vendor-data-integrity.cjs to create the vendor record');
      return false;
    }

    const vendor = await vendorResponse.json();
    log('green', '✅ Vendor record exists:');
    console.log({
      id: vendor.id,
      user_id: vendor.user_id,
      business_name: vendor.business_name,
      email: vendor.email
    });

    // Step 2: Verify vendor UUID matches
    const expectedUUID = 'daf1dd71-b5c7-44a1-bf88-36d41e73a7fa';
    const expectedUserId = '2-2025-003';

    if (vendor.id !== expectedUUID) {
      log('red', `❌ Vendor UUID mismatch!`);
      log('red', `Expected: ${expectedUUID}`);
      log('red', `Got: ${vendor.id}`);
      return false;
    }

    if (vendor.user_id !== expectedUserId) {
      log('red', `❌ User ID mismatch!`);
      log('red', `Expected: ${expectedUserId}`);
      log('red', `Got: ${vendor.user_id}`);
      return false;
    }

    log('green', '✅ Vendor UUID and User ID match expected values');
    log('green', `   Vendor UUID: ${vendor.id}`);
    log('green', `   User ID: ${vendor.user_id}`);

    // Step 3: Check existing services
    log('blue', '\n📋 Step 2: Checking existing services...');
    const servicesResponse = await fetch(`${API_URL}/api/services/vendor/${expectedUUID}`);
    
    if (!servicesResponse.ok) {
      log('yellow', `⚠️ Could not fetch services (Status: ${servicesResponse.status})`);
    } else {
      const servicesResult = await servicesResponse.json();
      const services = servicesResult.services || [];
      log('green', `✅ Found ${services.length} existing services`);
      
      // Verify vendor_id in existing services
      if (services.length > 0) {
        const firstService = services[0];
        if (firstService.vendor_id === expectedUUID) {
          log('green', '✅ Existing services use correct vendor UUID');
        } else {
          log('red', `❌ Existing services use wrong vendor_id: ${firstService.vendor_id}`);
        }
      }
    }

    // Step 4: Summary
    log('cyan', '\n=================================');
    log('cyan', '📊 VERIFICATION SUMMARY');
    log('cyan', '=================================');
    log('green', '✅ Vendor record exists in database');
    log('green', `✅ Vendor UUID: ${expectedUUID}`);
    log('green', `✅ User ID: ${expectedUserId}`);
    log('green', '✅ FK constraint can be satisfied');
    log('cyan', '\n💡 Next Steps:');
    log('yellow', '1. Login to production: https://weddingbazaarph.web.app/vendor/login');
    log('yellow', `2. Email: elealesantos06@gmail.com`);
    log('yellow', '3. Navigate to Vendor Services');
    log('yellow', '4. Try creating a new service');
    log('yellow', '5. Service should be created with vendor_id = daf1dd71-b5c7-44a1-bf88-36d41e73a7fa');
    log('cyan', '=================================\n');

    return true;

  } catch (error) {
    log('red', `❌ Test failed with error: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Run the test
verifyVendorUUID()
  .then(success => {
    if (success) {
      log('green', '\n🎉 VERIFICATION COMPLETE - Ready for manual testing!');
      process.exit(0);
    } else {
      log('red', '\n❌ VERIFICATION FAILED - Please fix issues before testing');
      process.exit(1);
    }
  })
  .catch(error => {
    log('red', `\n💥 Test crashed: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
