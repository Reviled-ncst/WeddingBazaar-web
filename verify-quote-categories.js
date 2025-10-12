// Verify all database categories are in the quote system
const fs = require('fs');

try {
  // Get database categories
  const servicesData = JSON.parse(fs.readFileSync('services.json', 'utf8'));
  const dbCategories = [...new Set(servicesData.map(service => service.category))].sort();
  
  // Read the SendQuoteModal file
  const modalFile = fs.readFileSync('src/pages/users/vendor/bookings/components/SendQuoteModal.tsx', 'utf8');
  
  console.log('🔍 VERIFICATION: Database Categories vs Quote System');
  console.log('='.repeat(70));
  
  let missingCount = 0;
  let foundCount = 0;
  
  dbCategories.forEach(category => {
    if (category === 'other' || category === 'photography') {
      // Skip generic categories
      return;
    }
    
    const regex = new RegExp(`'${category}':\\s*{\\s*serviceType:\\s*'${category}'`, 'i');
    const found = regex.test(modalFile);
    
    if (found) {
      console.log(`✅ ${category.padEnd(35)} - Found in Quote System`);
      foundCount++;
    } else {
      console.log(`❌ ${category.padEnd(35)} - Missing from Quote System`);
      missingCount++;
    }
  });
  
  console.log('='.repeat(70));
  console.log(`📊 SUMMARY:`);
  console.log(`   ✅ Found: ${foundCount} categories`);
  console.log(`   ❌ Missing: ${missingCount} categories`);
  console.log(`   📈 Coverage: ${((foundCount / (foundCount + missingCount)) * 100).toFixed(1)}%`);
  
  if (missingCount === 0) {
    console.log('\n🎉 SUCCESS: All database categories are now in the quote system!');
  } else {
    console.log('\n⚠️  Some categories still need to be added to the quote system.');
  }
  
} catch (error) {
  console.error('Error:', error.message);
}
