#!/usr/bin/env node

/**
 * EMERGENCY BACKEND DEPLOYMENT
 * 
 * Issue: Frontend verification modal shows despite approved documents
 * Cause: Production backend missing vendor profile & document endpoints
 * Solution: Deploy server-modular.cjs with full document support
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 DEPLOYING CORRECT BACKEND WITH DOCUMENT SUPPORT');
console.log('==================================================');

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
  
  console.log('');
  console.log('🎯 BACKEND DEPLOYMENT READY');
  console.log('==========================');
  console.log('📁 Main file: index.js (modular architecture)');
  console.log('🔌 Endpoints: /api/vendor-profile/:id, /api/vendor-profile/:id/documents');
  console.log('📄 Document verification: SUPPORTED');
  console.log('');
  console.log('⚡ TO DEPLOY: Push this commit to your Render repository');
  
} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
}
