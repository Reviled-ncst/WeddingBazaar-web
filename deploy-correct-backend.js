#!/usr/bin/env node

/**
 * EMERGENCY BACKEND DEPLOYMENT
 * 
 * Issue: Frontend verification modal shows despite approved documents
 * Cause: Production backend missing vendor profile & document endpoints
 * Solution: Deploy server-modular.cjs with full document support
 * 
 * CONSOLE LOG EVIDENCE:
 * - "❌ No documents found in profile" (repeated ~50 times)
 * - "Modular endpoint failed, trying legacy endpoint..."
 * - "Falling back to mock data"
 * - Frontend gets mock data with documents: [] instead of real approved documents
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 DEPLOYING CORRECT BACKEND WITH DOCUMENT SUPPORT');
console.log('==================================================');
console.log('📋 ISSUE: Frontend shows verification modal despite approved docs');
console.log('🔍 CAUSE: Backend missing /api/vendor-profile endpoints');
console.log('💡 SOLUTION: Deploy modular backend with full document support');
console.log('');

// Copy the modular backend as the main deployment file
const sourceFile = path.join(__dirname, 'backend-deploy', 'server-modular.cjs');
const targetFile = path.join(__dirname, 'backend-deploy', 'index.js');

try {
  // Copy modular server as main entry point
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✅ Copied server-modular.cjs -> index.js');
  } else {
    console.error('❌ Source file not found:', sourceFile);
    process.exit(1);
  }
  
  // Update package.json to use index.js as main
  const packageJsonPath = path.join(__dirname, 'backend-deploy', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.main = 'index.js';
  packageJson.scripts.start = 'node index.js';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json main entry point');
  
  // Apply vendor ID format fix to handle both UUID and string formats
  const vendorProfileRoutePath = path.join(__dirname, 'backend-deploy', 'routes', 'vendor-profile.cjs');
  if (fs.existsSync(vendorProfileRoutePath)) {
    let routeContent = fs.readFileSync(vendorProfileRoutePath, 'utf8');
    
    // Add ID format handling fix
    const idFormatFix = `
    // Handle both UUID and string ID formats
    let queryVendorId = vendorId;
    
    // If it's not a UUID format, try to find matching vendor by user_id
    if (!vendorId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.log('🔍 Non-UUID vendor ID detected, looking up by user_id:', vendorId);
      const userLookup = await sql\`
        SELECT vp.id as vendor_profile_id
        FROM vendor_profiles vp
        INNER JOIN users u ON vp.user_id = u.id
        WHERE u.id = \${vendorId}
      \`;
      
      if (userLookup.length > 0) {
        queryVendorId = userLookup[0].vendor_profile_id;
        console.log('✅ Found vendor profile ID:', queryVendorId);
      } else {
        console.log('❌ No vendor profile found for user ID:', vendorId);
      }
    }
    `;
    
    // Insert the fix after the vendorId parameter extraction
    if (routeContent.includes('const { vendorId } = req.params;')) {
      routeContent = routeContent.replace(
        'const { vendorId } = req.params;',
        `const { vendorId } = req.params;
        ${idFormatFix}`
      );
      
      // Update the SQL query to use queryVendorId
      routeContent = routeContent.replace(
        'WHERE vp.id = ${vendorId}',
        'WHERE vp.id = ${queryVendorId}'
      );
      
      fs.writeFileSync(vendorProfileRoutePath, routeContent);
      console.log('✅ Applied vendor ID format fix to routes/vendor-profile.cjs');
    }
  }
  
  console.log('');
  console.log('🎯 BACKEND DEPLOYMENT READY');
  console.log('==========================');
  console.log('📁 Main file: index.js (modular architecture)');
  console.log('🔌 Endpoints: /api/vendor-profile/:id, /api/vendor-profile/:id/documents');
  console.log('📄 Document verification: SUPPORTED');
  console.log('🔧 ID format handling: UUID + String formats');
  console.log('');
  console.log('📊 EXPECTED RESULT AFTER DEPLOYMENT:');
  console.log('   ✅ Console log: "Profile data received: [REAL DATA]"');
  console.log('   ✅ Console log: "📄 Document verification check: [...approved...]"');
  console.log('   ✅ Verification modal: WILL NOT APPEAR');
  console.log('   ✅ Add Service button: WORKS NORMALLY');
  console.log('');
  console.log('⚡ TO DEPLOY: Push backend-deploy/ folder to your Render repository');
  console.log('🌐 Production URL: https://weddingbazaar-web.onrender.com');
  
} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
}
