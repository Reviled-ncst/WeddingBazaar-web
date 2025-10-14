const fs = require('fs');
const path = require('path');

// Function to search for old AuthContext imports
function findOldAuthContextImports(dir) {
  const results = [];
  
  function searchDirectory(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
          searchDirectory(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Check for old AuthContext imports
          if (content.includes("from '../../../../../../shared/contexts/AuthContext'") ||
              content.includes("from '../../../../../shared/contexts/AuthContext'") ||
              content.includes("from '../../../../shared/contexts/AuthContext'") ||
              content.includes("from '../../../shared/contexts/AuthContext'") ||
              content.includes("from '../../shared/contexts/AuthContext'") ||
              content.includes("from '../shared/contexts/AuthContext'") ||
              content.includes("from './shared/contexts/AuthContext'")) {
            
            const lines = content.split('\n');
            const importLines = lines.filter((line, index) => 
              line.includes('shared/contexts/AuthContext') && 
              (line.includes('import') || line.includes('from'))
            );
            
            if (importLines.length > 0) {
              results.push({
                file: filePath,
                imports: importLines
              });
            }
          }
        } catch (error) {
          console.error(`Error reading file ${filePath}:`, error.message);
        }
      }
    }
  }
  
  searchDirectory(dir);
  return results;
}

// Search for old AuthContext imports
console.log('🔍 Searching for remaining old AuthContext imports...\n');

const results = findOldAuthContextImports('.');

if (results.length === 0) {
  console.log('✅ No old AuthContext imports found!');
} else {
  console.log(`❌ Found ${results.length} files with old AuthContext imports:\n`);
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.file}`);
    result.imports.forEach(importLine => {
      console.log(`   ${importLine.trim()}`);
    });
    console.log('');
  });
}
