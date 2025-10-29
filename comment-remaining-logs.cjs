#!/usr/bin/env node

/**
 * Script to comment out remaining ✅ success console.log statements
 */

const fs = require('fs');
const path = require('path');

const additionalFiles = [
  'src/pages/users/vendor/bookings/VendorBookingsSecure.tsx',
  'src/pages/users/individual/landing/CoupleHeader.tsx',
  'src/utils/vendorIdMapping.ts',
  'src/utils/geocoding.ts',
  'src/utils/geolocation.ts',
  'src/services/vendorNotificationService.ts',
  'src/services/SimpleBookingService.ts',
  'src/services/booking-process-tracking.ts',
  'src/services/availabilityService.ts',
  'src/services/paymongoService.ts',
  'src/services/auth/firebasePhoneService.ts',
  'src/services/api/CentralizedBookingAPI.ts',
  'src/services/api/optimizedBookingApiService.ts',
  'src/shared/services/QuoteAcceptanceService.ts',
  'src/shared/services/CentralizedServiceManager.ts',
  'src/shared/contexts/UnifiedMessagingContext.tsx',
];

let totalCommented = 0;

additionalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
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
    console.log(`⚪ ${file} - No success logs found (may have multi-line)`);
  }
});

console.log(`\n🎉 Additional: Commented out ${totalCommented} success log statements`);
