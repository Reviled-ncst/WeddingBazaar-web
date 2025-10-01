#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Ultimate workspace cleanup - removing ALL remaining test/debug files...');

// Get all files in root directory
const files = fs.readdirSync('.');

// Essential files to keep (absolutely necessary for production)
const essentialFiles = [
  // Documentation
  'README.md',
  'PROJECT_STRUCTURE.md',
  'COMPREHENSIVE_UI_AND_AUTH_FIXES_COMPLETE.md',
  'VENDOR_SERVICES_FUNCTIONALITY_COMPLETE.md', 
  'VENDOR_SERVICES_BUTTON_SYMMETRY_ENHANCEMENT.md',
  'FOREIGN_KEY_CONSTRAINT_FIX_COMPLETE.md',
  'UNIVERSAL_MESSAGING_FINAL_SUCCESS.md',
  
  // Configuration files
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'eslint.config.js',
  'index.html',
  
  // Firebase/Deployment
  'firebase.json',
  '.firebaserc',
  '.gitignore',
  '.env.example',
  '.dockerignore',
  
  // Essential build scripts (if any)
  'ultimate-cleanup.cjs'
];

// Essential directories to keep
const essentialDirs = [
  'src',
  'public',
  'backend-deploy',
  'dist',
  'node_modules',
  '.git',
  '.firebase',
  '.vscode',
  '.github'
];

let deletedCount = 0;

// Function to safely delete file
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const fileName = path.basename(filePath);
      
      // Skip essential files and directories
      if (essentialFiles.includes(fileName) || essentialDirs.includes(fileName)) {
        return false;
      }
      
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        // Only delete non-essential directories
        if (!essentialDirs.includes(fileName)) {
          fs.rmSync(filePath, { recursive: true, force: true });
          console.log(`🗂️  Deleted directory: ${fileName}`);
          deletedCount++;
        }
      } else {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted: ${fileName}`);
        deletedCount++;
      }
      return true;
    }
  } catch (error) {
    console.log(`❌ Error deleting ${filePath}: ${error.message}`);
    return false;
  }
  return false;
}

// Delete all non-essential files
console.log('🔍 Scanning and deleting all non-essential files...');
files.forEach(file => {
  const fileName = path.basename(file);
  
  // Delete if it's not in the essential lists
  if (!essentialFiles.includes(fileName) && !essentialDirs.includes(fileName)) {
    deleteFile(file);
  }
});

console.log(`\n✅ Ultimate cleanup complete! Deleted ${deletedCount} files and directories.`);

console.log('\n📋 Essential files kept:');
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✓ ${file}`);
  }
});

console.log('\n📁 Essential directories kept:');
essentialDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   ✓ ${dir}/`);
  }
});

console.log('\n🎯 Workspace is now COMPLETELY clean and production-ready!');
console.log('\n🚀 Ready for deployment with only essential files:');
console.log('   ✓ Source code (src/)');
console.log('   ✓ Public assets (public/)');
console.log('   ✓ Production backend (backend-deploy/)');
console.log('   ✓ Essential configuration files');
console.log('   ✓ Essential documentation files');
console.log('   ✓ Node modules and build artifacts');
