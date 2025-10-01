#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting workspace cleanup...');

// Files and directories to clean up
const filesToDelete = [
  // All the documentation files (keeping only the essential ones)
  'WEDDING_BAZAAR_PLATFORM_DEPLOYMENT_SUCCESS_FINAL.md',
  'VIEW_MODE_CHANGED_TO_LIST.md',
  'vercel-deployment.md',
  'VENDOR_SUBSCRIPTION_SYSTEM.md',
  'VENDOR_SERVICES_IMAGE_FIXES_COMPLETE.md',
  'VENDOR_SERVICES_FIXES_COMPLETE.md',
  'VENDOR_SERVICES_DEBUG_REPORT.md',
  'VENDOR_ROUTING_ISSUE_DIAGNOSIS_AND_FIX.md',
  'VENDOR_REAL_DATA_FIX_COMPLETE.md',
  'VENDOR_PROFILE_INTEGRATION_COMPLETE.md',
  'VENDOR_PROFILE_DROPDOWN_FEATURES.md',
  'VENDOR_MESSAGING_UNIFICATION_COMPLETE.md',
  'VENDOR_IMAGE_UPLOAD_IMPLEMENTATION.md',
  'VENDOR_CUSTOM_PRICING_SYSTEM_COMPLETE.md',
  'VENDOR_COUPLE_NAME_FIX_COMPLETE.md',
  'VENDOR_BOOKING_UI_IMPROVEMENTS.md',
  'VENDOR_BOOKING_UI_ENHANCEMENT_COMPLETE.md',
  'VENDOR_BOOKING_SYSTEM_REWORK_DOCUMENTATION.md',
  'VENDOR_BOOKING_MOCK_DATA_REPLACEMENT_COMPLETE.md',
  'VENDOR_BOOKING_BUTTON_IMPLEMENTATION_COMPLETE.md',
  'VENDOR_BOOKING_BUTTON_FUNCTIONALITY_ANALYSIS.md',
  'VENDOR_BOOKING_API_FIX_COMPLETE.md',
  'VENDOR_BOOKINGS_IMPLEMENTATION_COMPLETE.md',
  'VENDOR_BOOKINGS_COUPLE_NAME_FIX_COMPLETE.md',
  'USER_BOOKING_DETAILS_SUMMARY.md',
  'UPGRADE_PROMPT_FIX_SUMMARY.md',
  'UNIVERSAL_MESSAGING_COMPLETE.md',
  'UI_FIXES_COMPLETE.md',
  'UI_ENHANCEMENT_SUMMARY.md',
  'TYPESCRIPT_BUILD_VERIFICATION_COMPLETE.md',
  'TRUE_LIST_VIEW_COMPLETE.md',
  'TIMELINE_IMPORT_FIX_COMPLETE.md',
  'TESTIMONIALS_ENHANCEMENT_COMPLETE.md',
  'SYNTAX_ERROR_RESOLVED_FINAL.md',
  'SYNTAX_ERROR_FIX_REPORT.md',
  'SYNTAX_ERROR_FINAL_FIX.md',
  'STYLISH_UI_ENHANCEMENT_COMPLETE.md',
  'SERVICE_IMAGES_CATEGORY_FIX_COMPLETE.md',
  'SERVICE_FETCHING_CENTRALIZATION_FIX_COMPLETE.md',
  'SERVICE_DATABASE_EXPANSION_SUCCESS.md',
  'SERVICE_COUNT_FIX.md',
  'SERVICE_CENTRALIZATION_COMPLETE.md',
  'SERVICE_CATEGORIES_FIX_SUMMARY.md',
  'SERVICES_PAGE_REBUILT.md',
  'SERVICES_PAGE_ENHANCEMENT_SUCCESS.md',
  'SERVICES_MOCK_DATA_FIXED.md',
  'SERVICES_MESSAGING_INTEGRATION_COMPLETE.md',
  'SERVICES_IMPLEMENTATION_SUCCESS_REPORT.md',
  'SERVICES_GALLERY_INTERACTIVE_FEATURES_COMPLETE.md',
  'SERVICES_DATA_MANAGEMENT_FINAL_REPORT.md',
  'SERVICES_DATA_FETCHING_COMPLETE.md',
  'SERVICES_CENTRALIZATION_COMPLETE.md',
  'SERVICES_API_86_SERVICES_FIX_COMPLETE.md',
  'SEND_QUOTE_MODAL_COMPLETE.md',
  'SECURITY_VERIFICATION_API_SPEC.md',
  'SARAH_JOHNSON_BUG_CRITICAL_FIX.md',
  'REVIEW_GENERATION_COMPLETE.md',
  'RENDER_DEPLOYMENT_SUCCESS_SEPTEMBER_28.md',
  'RENDER_DEPLOYMENT_STATUS_SEPTEMBER_28.md',
  'RENDER_DEPLOYMENT_MONITORING_SEPTEMBER_28.md',
  'RENDER_BACKEND_FINAL_RESOLUTION.md',
  'RENDER_BACKEND_CRITICAL_STATUS.md',
  'render-deployment.md',
  'render-deployment-debug.md',
  'REGISTER_MODAL_UI_ENHANCEMENT_COMPLETE.md',
  'REGISTER_MODAL_UI_ENHANCEMENT.md',
  'REFACTORING_COMPLETION_SUMMARY.md',
  'RECEIPT_IMPLEMENTATION_SUMMARY.md',
  'REAL_OTP_TESTING_GUIDE.md',
  'QUOTATION_SENT_FILTER_FIX_COMPLETE.md',
  'QUICK_DEPLOY_BACKEND.md',
  'PRODUCTION_SUCCESS_FINAL.md',
  'PRODUCTION_STATUS.md',
  'PRODUCTION_DEPLOYMENT_SUCCESS_FINAL.md',
  'PRODUCTION_DEPLOYMENT_SUCCESS.md',
  'PRODUCTION_DEPLOYMENT_STATUS_CRITICAL_FIX.md',
  'PRODUCTION_DEPLOYMENT_COMPLETE.md',
  'PLATFORM_STATUS_COMPLETE.md',
  'PLANNING_REMOVAL_COMPLETE.md',
  'PHILIPPINE_PRICING_UPDATE_COMPLETE.md',
  'PAYMONGO_SETUP.md',
  'PAYMENT_SYSTEM_TEST_RESULTS.md',
  'PAYMENT_PROCESSING_FIX_COMPLETE.md',
  'PAYMENT_METHODS_STATUS_FINAL.md',
  'PAYMENT_METHODS_COMPLETE.md',
  'PAYMENT_INTEGRATION_PRODUCTION_CHECKLIST.md',
  'PAYMENT_INTEGRATION_GUIDE.md',
  'PAYMENT_INTEGRATION_COMPLETE.md',
  'PACKAGE_SELECTION_ENHANCEMENT.md',
  'OPTION_2_SUCCESS_REPORT.md',
  'NEXT_PHASE_REAL_TIME_FEATURES.md',

  // Test and debug scripts
  'verify-services-fix.js',
  'verify-production-api.js',
  'verify-messaging-status.js',
  'verify-booking-prices.js',
  'verify-booking-data-matching.js',
  'verify-api-integration.js',
  'vendor-booking-system-rework-complete.js',
  'ui-enhancement-complete.js',
  'status-check.js',
  'simple-booking-test.js',
  'seed-vendors.js',
  'rework-vendor-booking-system.js',
  'quick-db-check.js',
  'production-backend-fix-test.js',
  'message-button-fix-summary.js',
  'message-bubble-implementation.js',
  'manual-debug-guide.js',
  'login-fix-script.js',
  'location-capability-demo.js',
  'local-backup-server.js',
  'local-backend.js',
  'investigate-vendor-booking-system.js',
  'investigate-location-flow.js',
  'investigate-database-images.js',
  'inspect-bookings-data.js',
  'full-api-response.js',
  'fixed-services-loader.js',
  'fixed-conversations-api.js',
  'fix-vendor-roles.js',
  'find-vendor2-bookings.js',
  'final-verification-and-test.js',
  'final-test.js',
  'final-services-verification.js',

  // CJS debug and test files
  'verify-vendor-bookings-data.cjs',
  'setup-vendor-messaging.cjs',
  'seed-vendors-database.cjs',
  'scan-messaging-data.cjs',
  'quick-db-check.cjs',
  'migrate-bookings-schema.cjs',
  'local-backup-server.cjs',
  'local-backend.cjs',
  'fix-vendors-schema.cjs',
  'fix-vendor-ratings.cjs',
  'fix-user-booking-prices.cjs',
  'fix-booking-prices.cjs',
  'debug-vendors.cjs',
  'debug-vendor-api.cjs',
  'debug-field-structure.cjs',
  'debug-featured-vendors.cjs',
  'debug-db-schema.cjs',
  'debug-bookings-api.cjs',
  'create-vendor2-bookings.cjs',
  'create-vendor2-bookings-api.cjs',
  'create-test-login.cjs',
  'create-test-bookings.cjs',
  'create-more-bookings.cjs',
  'comprehensive-db-check.cjs',
  'comprehensive-database-analysis.cjs',
  'check-vendors-table.cjs',
  'check-vendor-profiles-subscriptions-users.cjs',
  'check-vendor-messaging.cjs',
  'check-vendor-login.cjs',
  'check-users.cjs',

  // Public test files
  'public/browser-messaging-test.js',
  'public/set-list-view.js',
  'public/service-manager-test.js',
  'public/quick-messaging-fix.js',
  'public/manual-booking-test.js',
  'public/force-list-view.js',
  'public/force-list-immediate.js',
  'public/debug-messaging.js',
  'public/chat-bubble-test.js',
  'public/chat-bubble-browser-test.js',
  'public/booking-test.js',

  // Test directories and files
  'src/tests',
  'src/shared/types/comprehensive-booking.types.js',
  'src/modules/services/types/index.js',

  // Analysis and verification scripts
  'analyze-api-location-issue.mjs',
  'analyze-booking-comprehensive.mjs',
  'analyze-booking-data.mjs',
  'analyze-booking-database.mjs',
  'analyze-booking-patterns.cjs',
  'analyze-booking-structure.mjs',
  'analyze-bookings-data.mjs',
  'analyze-conversations-vendors.mjs',
  'analyze-database-images.js',
  'analyze-detailed-conversations.mjs',
  'analyze-vendor-user-gap.mjs',
  'actual-location-test-guide.js',
  'add-image-columns.mjs',
  'add-real-services-to-db.mjs'
];

// Directories to clean up
const directoriesToDelete = [
  'src/tests',
  'public/test-scripts'
];

// Files to keep (essential documentation and configs)
const filesToKeep = [
  'README.md',
  'PROJECT_STRUCTURE.md',
  'COMPREHENSIVE_UI_AND_AUTH_FIXES_COMPLETE.md',
  'VENDOR_SERVICES_FUNCTIONALITY_COMPLETE.md', 
  'VENDOR_SERVICES_BUTTON_SYMMETRY_ENHANCEMENT.md',
  'FOREIGN_KEY_CONSTRAINT_FIX_COMPLETE.md',
  'UNIVERSAL_MESSAGING_FINAL_SUCCESS.md',
  'tailwind.config.js',
  'postcss.config.js',
  'eslint.config.js',
  'vite.config.ts',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  '.gitignore',
  'firebase.json',
  '.firebaserc'
];

let deletedCount = 0;

// Function to safely delete file
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      // Check if it's in the keep list
      const fileName = path.basename(filePath);
      if (filesToKeep.includes(fileName)) {
        console.log(`⚠️  Skipping protected file: ${fileName}`);
        return false;
      }
      
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`🗂️  Deleted directory: ${filePath}`);
      } else {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted file: ${filePath}`);
      }
      deletedCount++;
      return true;
    }
  } catch (error) {
    console.log(`❌ Error deleting ${filePath}: ${error.message}`);
    return false;
  }
  return false;
}

// Delete individual files
console.log('🗂️ Cleaning up individual files...');
filesToDelete.forEach(file => {
  deleteFile(file);
});

// Delete directories
console.log('📁 Cleaning up directories...');
directoriesToDelete.forEach(dir => {
  deleteFile(dir);
});

console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} files and directories.`);
console.log('\n📋 Files kept for reference:');
filesToKeep.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✓ ${file}`);
  }
});

console.log('\n🎯 Workspace is now clean and ready for production!');
