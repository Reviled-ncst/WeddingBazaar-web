// Browser console verification script
// Run this in the browser console at http://localhost:5173/individual/services

console.log('🔍 Verifying Services page data integration...');

// Check if services are loaded
setTimeout(() => {
  // Look for service cards
  const serviceCards = document.querySelectorAll('[class*="group cursor-pointer"]');
  console.log(`📊 Found ${serviceCards.length} service cards on the page`);
  
  if (serviceCards.length > 0) {
    console.log('✅ Services are being displayed');
    
    // Check first few service cards for real data
    for (let i = 0; i < Math.min(3, serviceCards.length); i++) {
      const card = serviceCards[i];
      const name = card.querySelector('h3')?.textContent || 'Unknown';
      const category = card.querySelector('[class*="text-pink-600"]')?.textContent || 'Unknown';
      const price = card.querySelector('[class*="font-semibold text-pink-600"]')?.textContent || 'Unknown';
      const image = card.querySelector('img')?.src || 'No image';
      
      console.log(`\n📋 Service Card ${i + 1}:`);
      console.log(`  Name: ${name}`);
      console.log(`  Category: ${category}`);
      console.log(`  Price: ${price}`);
      console.log(`  Image: ${image.includes('unsplash') ? 'Real Unsplash image' : 'Other image'}`);
      
      // Check if it's using real database data vs mock data
      if (name.includes('Service') && category === 'Unknown') {
        console.log('  ⚠️ Possibly using fallback/mock data');
      } else {
        console.log('  ✅ Using real database data');
      }
    }
  } else {
    console.log('❌ No service cards found - check for loading issues');
  }
  
  // Check if loading is complete
  const loadingElements = document.querySelectorAll('[class*="loading"]');
  if (loadingElements.length > 0) {
    console.log('⏳ Page is still loading...');
  } else {
    console.log('✅ Page loading is complete');
  }
  
  // Check for error messages
  const errorElements = document.querySelectorAll('[class*="error"]');
  if (errorElements.length > 0) {
    console.log('❌ Found error elements on page');
  }
  
}, 2000); // Wait 2 seconds for data to load
