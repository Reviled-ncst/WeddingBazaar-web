const fs = require('fs');
const path = require('path');

// Files to clean up console logs from
const filesToClean = [
  'src/pages/users/vendor/bookings/VendorBookings.tsx',
  'src/pages/users/vendor/bookings/VendorBookingsSecure.tsx',
  'src/shared/utils/booking-data-mapping.ts',
  'src/services/api/reviewApiService.ts',
  'src/pages/users/individual/bookings/hooks/useReview.ts',
  'src/modules/services/components/BookingRequestModal.tsx',
  'src/shared/components/subscription/UpgradePrompt.tsx',
  'src/utils/logger.ts',
  'src/utils/hooks.ts',
  'src/utils/geolocation-test.ts',
  'src/utils/geolocation-enhanced.ts',
  'src/utils/geolocation-clean.ts',
  'src/utils/analytics.ts',
  'src/services/vendorLookupService.ts',
  'src/services/paymentWebhookHandler.ts',
  'src/services/availabilityService.ts',
  'src/shared/types/subscription.ts',
  'src/shared/services/CentralizedServiceManager.ts',
  'src/shared/services/ServiceManager.ts',
  'src/shared/services/userService.ts',
  'src/shared/services/QuoteAcceptanceService.ts',
  'src/shared/services/categoriesService.ts',
  'src/shared/services/payment/paymongoService.ts',
  'src/shared/services/bookingCompletionService.ts',
  'src/shared/services/bookingActionsService.ts',
  'src/services/auth/firebasePhoneService.ts',
  'src/shared/contexts/FirebaseAuthContext.tsx',
  'src/shared/contexts/AuthContext.tsx'
];

let totalRemoved = 0;

console.log('🧹 Starting final console log cleanup...\n');

filesToClean.forEach(relativePath => {
  const filePath = path.join(__dirname, relativePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalLength = content.length;
  let removedCount = 0;
  
  // Remove all console.log statements (including multiline)
  content = content.replace(/console\.log\([^)]*\);?/g, (match) => {
    removedCount++;
    return '';
  });
  
  // Remove all console.info statements
  content = content.replace(/console\.info\([^)]*\);?/g, (match) => {
    removedCount++;
    return '';
  });
  
  // Remove all console.debug statements
  content = content.replace(/console\.debug\([^)]*\);?/g, (match) => {
    removedCount++;
    return '';
  });
  
  // Remove non-critical console.warn (keep error-related ones)
  content = content.replace(/console\.warn\([^)]*(?:success|completed|loaded|created|updated|retrieved|fetched|found)[^)]*\);?/gi, (match) => {
    removedCount++;
    return '';
  });
  
  // Clean up empty lines (max 2 consecutive)
  content = content.replace(/\n\n\n+/g, '\n\n');
  
  if (removedCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    const savedBytes = originalLength - content.length;
    console.log(`✅ ${relativePath}`);
    console.log(`   Removed: ${removedCount} console statements, Saved: ${savedBytes} bytes\n`);
    totalRemoved += removedCount;
  } else {
    console.log(`✓  ${relativePath} - Already clean\n`);
  }
});

console.log(`\n🎉 Cleanup complete!`);
console.log(`📊 Total console statements removed: ${totalRemoved}`);
console.log(`\n⚠️  Note: Only critical error logs and important warnings remain.`);
