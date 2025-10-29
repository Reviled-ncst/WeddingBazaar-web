#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting COMPLETE console log removal...\n');

// Files to process (comprehensive list)
const filesToProcess = [
  // Individual Bookings
  'src/pages/users/individual/bookings/IndividualBookings.tsx',
  'src/pages/users/individual/bookings/hooks/useReview.ts',
  'src/pages/users/individual/landing/CoupleHeader.tsx',
  
  // Vendor Bookings
  'src/pages/users/vendor/bookings/VendorBookings.tsx',
  'src/pages/users/vendor/bookings/VendorBookingsSecure.tsx',
  'src/pages/users/vendor/services/VendorServices.tsx',
  
  // Completion & Reviews
  'src/shared/services/completionService.ts',
  'src/shared/services/reviewService.ts',
  'src/services/api/reviewApiService.ts',
  
  // Booking Services
  'src/shared/utils/booking-data-mapping.ts',
  'src/modules/services/components/BookingRequestModal.tsx',
  
  // Subscription & Payment
  'src/shared/components/subscription/UpgradePrompt.tsx',
  'src/shared/components/PayMongoPaymentModal.tsx',
  'src/shared/contexts/SubscriptionContext.tsx',
  
  // Auth
  'src/shared/contexts/HybridAuthContext.tsx',
  
  // Messaging
  'src/shared/contexts/GlobalMessengerContext.tsx',
  'src/shared/contexts/UnifiedMessagingContext.tsx',
  'src/services/api/messagingApiService.ts',
  
  // Other Services
  'src/services/SimpleBookingService.ts',
  'src/services/api/CentralizedBookingAPI.ts',
  'src/services/api/bookingApiService.ts',
  'src/services/api/optimizedBookingApiService.ts',
  'src/services/api/userAPIService.ts',
  'src/services/api/servicesApiService.ts',
  'src/services/availabilityService.ts',
  'src/services/vendorNotificationService.ts',
  'src/services/paymongoService.ts',
  'src/services/cloudinaryService.ts',
  'src/services/booking-process-tracking.ts',
  
  // Utils
  'src/utils/vendorIdMapping.ts',
  'src/utils/geolocation.ts',
  'src/utils/geolocation-enhanced.ts',
  'src/utils/geocoding.ts',
  'src/utils/bookingStatusManager.ts',
];

let totalLogsRemoved = 0;
let filesProcessed = 0;

filesToProcess.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalLines = content.split('\n').length;
  let logsInFile = 0;
  
  // Remove console.log (all types except console.error)
  const patterns = [
    // Standard single-line console.log
    /^(\s*)console\.log\([^;]*\);?\s*$/gm,
    
    // Multi-line console.log
    /^(\s*)console\.log\(\s*$/gm,
    
    // console.info
    /^(\s*)console\.info\([^;]*\);?\s*$/gm,
    
    // console.warn (keep only if critical)
    /^(\s*)console\.warn\(\s*['"]⚠️.*\);?\s*$/gm,
    
    // Commented console.log
    /^(\s*)\/\/\s*console\.log\([^;]*\);?\s*$/gm,
  ];
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      logsInFile += matches.length;
      content = content.replace(pattern, '');
    }
  });
  
  // Remove empty lines created by removal
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  if (logsInFile > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    const newLines = content.split('\n').length;
    console.log(`✅ ${filePath}`);
    console.log(`   Removed ${logsInFile} logs (${originalLines} → ${newLines} lines)\n`);
    totalLogsRemoved += logsInFile;
    filesProcessed++;
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`🎉 COMPLETE! Removed ${totalLogsRemoved} console logs from ${filesProcessed} files`);
console.log(`${'='.repeat(60)}\n`);
