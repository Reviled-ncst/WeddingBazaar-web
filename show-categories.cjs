// Extract categories from services JSON
const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('services.json', 'utf8'));
  
  // Get unique categories
  const categories = [...new Set(data.map(service => service.category))].sort();
  
  console.log('📊 ACTUAL SERVICE CATEGORIES FROM YOUR DATABASE:');
  console.log('='.repeat(60));
  
  categories.forEach((category, index) => {
    const count = data.filter(s => s.category === category).length;
    const services = data.filter(s => s.category === category);
    const avgPrice = services.reduce((sum, s) => sum + parseFloat(s.price), 0) / services.length;
    
    console.log(`${(index + 1).toString().padStart(2)}. ${category.padEnd(35)} (${count.toString().padStart(2)} services, avg: ₱${avgPrice.toFixed(0)})`);
  });
  
  console.log('='.repeat(60));
  console.log(`📈 SUMMARY:`);
  console.log(`   Total Categories: ${categories.length}`);
  console.log(`   Total Services: ${data.length}`);
  console.log(`   Price Range: ₱${Math.min(...data.map(s => parseFloat(s.price))).toFixed(0)} - ₱${Math.max(...data.map(s => parseFloat(s.price))).toFixed(0)}`);
  
  console.log('\n🔍 DATABASE CATEGORIES FOR QUOTE SYSTEM:');
  console.log('='.repeat(60));
  
  // Show all database categories that should be in the quote system
  categories.forEach(dbCat => {
    const count = data.filter(s => s.category === dbCat).length;
    console.log(`   ${dbCat} (${count} services) ❌ Missing from Quote System`);
  });

} catch (error) {
  console.error('Error:', error.message);
}
