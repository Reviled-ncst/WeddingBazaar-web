const fs = require('fs');
const path = require('path');

// Files to clean up console logs from
const filesToClean = [
  'src/shared/components/subscription/UpgradePrompt.tsx',
  'src/utils/logger.ts',
  'src/utils/geolocation-test.ts',
  'src/utils/geolocation-clean.ts',
  'src/utils/analytics.ts',
  'src/services/vendorLookupService.ts',
  'src/services/paymentWebhookHandler.ts',
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

console.log('🧹 Starting smart console log cleanup...\n');

filesToClean.forEach(relativePath => {
  const filePath = path.join(__dirname, relativePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalLength = content.length;
  const originalLines = content.split('\n');
  let removedCount = 0;
  
  // Process line by line to avoid breaking multi-line statements
  const newLines = [];
  let skipNext = false;
  
  for (let i = 0; i < originalLines.length; i++) {
    const line = originalLines[i];
    const trimmed = line.trim();
    
    // Skip lines that are only console.log/info/debug calls
    if (
      trimmed.startsWith('console.log(') ||
      trimmed.startsWith('console.info(') ||
      trimmed.startsWith('console.debug(') ||
      // Commented out console logs
      trimmed.startsWith('// console.log(') ||
      trimmed.startsWith('// console.info(') ||
      trimmed.startsWith('// console.debug(')
    ) {
      removedCount++;
      continue; // Skip this line
    }
    
    newLines.push(line);
  }
  
  if (removedCount > 0) {
    const newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    const savedBytes = originalLength - newContent.length;
    console.log(`✅ ${relativePath}`);
    console.log(`   Removed: ${removedCount} console lines, Saved: ${savedBytes} bytes\n`);
    totalRemoved += removedCount;
  } else {
    console.log(`✓  ${relativePath} - Already clean\n`);
  }
});

console.log(`\n🎉 Cleanup complete!`);
console.log(`📊 Total console lines removed: ${totalRemoved}`);
console.log(`\n⚠️  Note: Only critical error logs and important warnings remain.`);
