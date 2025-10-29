#!/usr/bin/env node

/**
 * Script to comment out all ✅ success console.log statements
 * This keeps them for easy re-enable if needed for debugging
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const filesToProcess = [
  'src/pages/users/individual/bookings/IndividualBookings.tsx',
  'src/pages/users/vendor/bookings/VendorBookings.tsx',
  'src/shared/services/completionService.ts',
  'src/shared/utils/booking-data-mapping.ts',
  'src/services/api/reviewApiService.ts',
  'src/shared/services/reviewService.ts',
  'src/pages/users/individual/bookings/hooks/useReview.ts',
  'src/modules/services/components/BookingRequestModal.tsx',
  'src/shared/components/subscription/UpgradePrompt.tsx',
  'src/shared/components/PayMongoPaymentModal.tsx',
  'src/pages/users/vendor/services/VendorServices.tsx',
  'src/shared/contexts/HybridAuthContext.tsx',
  'src/shared/contexts/GlobalMessengerContext.tsx',
  'src/services/api/bookingApiService.ts',
  'src/services/api/messagingApiService.ts',
  'src/shared/services/payment/paymongoService.ts',
];

let totalCommented = 0;

filesToProcess.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Match console.log lines that start with ✅
  const regex = /^(\s*)(console\.log\('✅.*?\);)$/gm;
  
  let matches = 0;
  content = content.replace(regex, (match, indent, logStatement) => {
    matches++;
    return `${indent}// ${logStatement}`;
  });
  
  if (matches > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} - Commented out ${matches} success logs`);
    totalCommented += matches;
  } else {
    console.log(`⚪ ${file} - No success logs found`);
  }
});

console.log(`\n🎉 Total: Commented out ${totalCommented} success log statements`);
console.log(`📝 All logs are preserved and can be easily re-enabled by removing the // comment`);
