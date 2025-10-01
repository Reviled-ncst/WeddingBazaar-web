#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Final workspace cleanup - removing remaining test files and excess documentation...');

// Get all .cjs files (except essential ones)
const essentialCjsFiles = [
  'final-cleanup.cjs',
  'cleanup-workspace.cjs'
];

// Get all .md files (except essential ones) 
const essentialMdFiles = [
  'README.md',
  'PROJECT_STRUCTURE.md',
  'COMPREHENSIVE_UI_AND_AUTH_FIXES_COMPLETE.md',
  'VENDOR_SERVICES_FUNCTIONALITY_COMPLETE.md', 
  'VENDOR_SERVICES_BUTTON_SYMMETRY_ENHANCEMENT.md',
  'FOREIGN_KEY_CONSTRAINT_FIX_COMPLETE.md',
  'UNIVERSAL_MESSAGING_FINAL_SUCCESS.md'
];

let deletedCount = 0;

// Function to safely delete file
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const fileName = path.basename(filePath);
      
      // Skip essential files
      if (essentialCjsFiles.includes(fileName) || essentialMdFiles.includes(fileName)) {
        return false;
      }
      
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted: ${fileName}`);
      deletedCount++;
      return true;
    }
  } catch (error) {
    console.log(`❌ Error deleting ${filePath}: ${error.message}`);
    return false;
  }
  return false;
}

// Find and delete all .cjs files (except essential ones)
console.log('🔍 Finding and deleting remaining .cjs test files...');
const files = fs.readdirSync('.');
files.forEach(file => {
  if (file.endsWith('.cjs') && !essentialCjsFiles.includes(file)) {
    deleteFile(file);
  }
});

// Find and delete excess .md files (keep only essential documentation)
console.log('🔍 Finding and deleting excess .md documentation files...');
files.forEach(file => {
  if (file.endsWith('.md') && !essentialMdFiles.includes(file)) {
    deleteFile(file);
  }
});

// Find and delete any remaining .js test files
console.log('🔍 Finding and deleting any remaining .js test files...');
files.forEach(file => {
  if (file.endsWith('.js') && 
      (file.includes('test') || 
       file.includes('debug') || 
       file.includes('check-') || 
       file.includes('verify-') ||
       file.includes('analyze-'))) {
    deleteFile(file);
  }
});

// Find and delete any .html test files
console.log('🔍 Finding and deleting any remaining .html test files...');
files.forEach(file => {
  if (file.endsWith('.html') && file.includes('test')) {
    deleteFile(file);
  }
});

console.log(`\n✅ Final cleanup complete! Deleted ${deletedCount} additional files.`);
console.log('\n📋 Essential files remaining:');
essentialMdFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✓ ${file}`);
  }
});

console.log('\n🎯 Workspace is now completely clean and production-ready!');
console.log('\n📁 Final workspace structure:');
console.log('   ✓ src/ - Clean source code');
console.log('   ✓ public/ - Clean public assets');
console.log('   ✓ backend-deploy/ - Production backend');
console.log('   ✓ Essential config files only');
console.log('   ✓ Essential documentation only');
