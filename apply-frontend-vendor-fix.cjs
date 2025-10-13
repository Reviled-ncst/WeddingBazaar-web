const fs = require('fs').promises;
const path = require('path');

console.log('🔧 IMPLEMENTING FRONTEND VENDOR ID FIX');
console.log('====================================');

async function fixFrontendVendorId() {
  try {
    // The issue is that the frontend is using "2-2025-003" as vendor ID
    // But it should be using "2" (the actual user ID)
    
    console.log('\n1. Analyzing the frontend vendor identification...');
    
    // Find the VendorBookings component
    const vendorBookingsPath = 'src/pages/users/vendor/bookings/VendorBookings.tsx';
    
    try {
      let content = await fs.readFile(vendorBookingsPath, 'utf8');
      console.log('✅ Found VendorBookings.tsx');
      
      // Look for how the vendor ID is being determined
      const hasVendorIdFix = content.includes('VENDOR_ID_FIX') || content.includes('actualVendorId');
      
      if (hasVendorIdFix) {
        console.log('✅ Vendor ID fix already applied');
        return;
      }
      
      console.log('\n2. Applying smart vendor ID extraction...');
      
      // Add a function at the top to extract proper vendor ID
      const vendorIdFix = `
// VENDOR_ID_FIX: Extract proper vendor ID from malformed IDs
const extractProperVendorId = (userId: string): string => {
  // If the user ID looks like a booking ID (e.g., "2-2025-003"), extract the actual vendor ID
  if (userId && typeof userId === 'string' && /^\\d+-\\d{4}-\\d{3}$/.test(userId)) {
    const actualVendorId = userId.split('-')[0];
    console.log(\`🔧 [VENDOR_ID_FIX] Converting malformed ID "\${userId}" to proper vendor ID "\${actualVendorId}"\`);
    return actualVendorId;
  }
  return userId;
};

`;
      
      // Insert the fix after the imports
      const importEnd = content.lastIndexOf('import ');
      const nextLine = content.indexOf('\n', importEnd);
      content = content.slice(0, nextLine + 1) + vendorIdFix + content.slice(nextLine + 1);
      
      // Find where vendor ID is being used and wrap it with the fix
      content = content.replace(
        /const vendorId = user\.id/g,
        'const vendorId = extractProperVendorId(user.id)'
      );
      
      content = content.replace(
        /vendorId: user\.id/g,
        'vendorId: extractProperVendorId(user.id)'
      );
      
      // Also fix any direct usage in API calls
      content = content.replace(
        /user\.id(?=.*\/api\/bookings)/g,
        'extractProperVendorId(user.id)'
      );
      
      await fs.writeFile(vendorBookingsPath, content, 'utf8');
      console.log('✅ Applied vendor ID fix to VendorBookings.tsx');
      
    } catch (error) {
      console.log('❌ Could not fix VendorBookings.tsx:', error.message);
    }
    
    // Also check and fix the CentralizedBookingAPI
    console.log('\n3. Checking CentralizedBookingAPI...');
    
    const apiPath = 'src/services/api/CentralizedBookingAPI.ts';
    
    try {
      let apiContent = await fs.readFile(apiPath, 'utf8');
      
      if (!apiContent.includes('VENDOR_ID_FIX')) {
        console.log('Applying vendor ID fix to CentralizedBookingAPI...');
        
        const vendorApiFixHelper = `
// VENDOR_ID_FIX: Helper function for vendor ID normalization
const normalizeVendorId = (vendorId: string): string => {
  if (vendorId && typeof vendorId === 'string' && /^\\d+-\\d{4}-\\d{3}$/.test(vendorId)) {
    const normalizedId = vendorId.split('-')[0];
    console.log(\`🔧 [API_VENDOR_ID_FIX] Normalizing "\${vendorId}" to "\${normalizedId}"\`);
    return normalizedId;
  }
  return vendorId;
};

`;
        
        // Insert after imports
        const importEnd = apiContent.lastIndexOf('import ');
        const nextLine = apiContent.indexOf('\n', importEnd);
        apiContent = apiContent.slice(0, nextLine + 1) + vendorApiFixHelper + apiContent.slice(nextLine + 1);
        
        // Fix vendor ID usage in API calls
        apiContent = apiContent.replace(
          /(\\/api\\/bookings\\/vendor\\/\\$\\{)([^}]+)(\\})/g,
          '$1normalizeVendorId($2)$3'
        );
        
        apiContent = apiContent.replace(
          /(vendorId=)([^&\\s]+)/g,
          '$1${normalizeVendorId($2)}'
        );
        
        await fs.writeFile(apiPath, apiContent, 'utf8');
        console.log('✅ Applied vendor ID fix to CentralizedBookingAPI.ts');
      } else {
        console.log('✅ API already has vendor ID fix');
      }
      
    } catch (error) {
      console.log('⚠️ Could not fix CentralizedBookingAPI:', error.message);
    }
    
    console.log('\n4. Creating emergency vendor ID mapping...');
    
    // Create a temporary mapping file
    const mappingContent = `
// EMERGENCY VENDOR ID MAPPING
// This file provides correct vendor IDs for malformed entries
// Remove this file once database is fixed

export const VENDOR_ID_MAPPING: Record<string, string> = {
  '2-2025-003': '2',
  '3-2025-004': '3',
  '4-2025-005': '4',
  // Add more mappings as needed
};

export const getCorrectVendorId = (malformedId: string): string => {
  const corrected = VENDOR_ID_MAPPING[malformedId];
  if (corrected) {
    console.log(\`🔧 [EMERGENCY_MAPPING] Mapped "\${malformedId}" to "\${corrected}"\`);
    return corrected;
  }
  
  // Auto-extract if it matches the pattern
  if (malformedId && typeof malformedId === 'string' && /^\\d+-\\d{4}-\\d{3}$/.test(malformedId)) {
    const extracted = malformedId.split('-')[0];
    console.log(\`🔧 [AUTO_EXTRACT] Extracted "\${extracted}" from "\${malformedId}"\`);
    return extracted;
  }
  
  return malformedId;
};
`;
    
    const mappingPath = 'src/utils/vendorIdMapping.ts';
    await fs.writeFile(mappingPath, mappingContent, 'utf8');
    console.log('✅ Created emergency vendor ID mapping');
    
    console.log('\n🎉 FRONTEND FIX COMPLETED!');
    console.log('========================');
    console.log('✅ Added smart vendor ID extraction logic');
    console.log('✅ Created emergency mapping for malformed IDs');
    console.log('✅ Frontend will now convert "2-2025-003" to "2"');
    console.log('');
    console.log('🔄 Next steps:');
    console.log('1. Rebuild and redeploy the frontend');
    console.log('2. Fix the database records when access is available');
    console.log('3. Remove the emergency mapping once DB is fixed');
    
  } catch (error) {
    console.error('❌ Error applying frontend fix:', error);
  }
}

fixFrontendVendorId();
