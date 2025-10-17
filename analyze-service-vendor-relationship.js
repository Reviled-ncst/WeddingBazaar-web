import fetch from 'node-fetch';

async function analyzeServiceVendorRelationship() {
  try {
    console.log('🔍 Analyzing Service-Vendor-Review relationship...');
    
    // Fetch services
    const servicesResponse = await fetch('https://weddingbazaar-web.onrender.com/api/services');
    const servicesData = await servicesResponse.json();
    console.log('📊 Services found:', servicesData.services?.length || 0);
    
    // Fetch vendors
    const vendorsResponse = await fetch('https://weddingbazaar-web.onrender.com/api/vendors');
    const vendorsData = await vendorsResponse.json();
    console.log('🏪 Vendors found:', vendorsData.vendors?.length || 0);
    
    // Check if reviews API exists
    let reviewsData = null;
    try {
      const reviewsResponse = await fetch('https://weddingbazaar-web.onrender.com/api/reviews');
      if (reviewsResponse.ok) {
        reviewsData = await reviewsResponse.json();
        console.log('⭐ Reviews found:', reviewsData.reviews?.length || 0);
      } else {
        console.log('❌ Reviews API not available:', reviewsResponse.status);
      }
    } catch (reviewError) {
      console.log('❌ Reviews API error:', reviewError.message);
    }
    
    console.log('\n=== DETAILED ANALYSIS ===\n');
    
    // Analyze each service
    if (servicesData.services) {
      servicesData.services.forEach((service, index) => {
        console.log(`📋 Service ${index + 1}:`);
        console.log(`   ID: ${service.id}`);
        console.log(`   Title: ${service.title}`);
        console.log(`   Name: ${service.name}`);
        console.log(`   Vendor ID: ${service.vendor_id}`);
        console.log(`   Category: ${service.category}`);
        console.log(`   Price: ${service.price}`);
        console.log(`   Rating: ${service.rating || 'N/A'}`);
        console.log(`   Review Count: ${service.review_count || 'N/A'}`);
        
        // Find matching vendor
        const matchingVendor = vendorsData.vendors?.find(v => v.id === service.vendor_id);
        if (matchingVendor) {
          console.log(`   ✅ Matching Vendor Found:`);
          console.log(`      Business Name: ${matchingVendor.name}`);
          console.log(`      Category: ${matchingVendor.category}`);
          console.log(`      Rating: ${matchingVendor.rating}`);
          console.log(`      Review Count: ${matchingVendor.reviewCount}`);
        } else {
          console.log(`   ❌ No matching vendor found for vendor_id: ${service.vendor_id}`);
        }
        
        console.log('');
      });
    }
    
    // Analyze vendors
    console.log('\n=== VENDOR ANALYSIS ===\n');
    if (vendorsData.vendors) {
      vendorsData.vendors.forEach((vendor, index) => {
        console.log(`🏪 Vendor ${index + 1}:`);
        console.log(`   ID: ${vendor.id}`);
        console.log(`   Name: ${vendor.name}`);
        console.log(`   Category: ${vendor.category}`);
        console.log(`   Rating: ${vendor.rating}`);
        console.log(`   Review Count: ${vendor.reviewCount}`);
        console.log(`   Verified: ${vendor.verified}`);
        console.log('');
      });
    }
    
    // Show data mismatch issues
    console.log('\n=== ISSUES IDENTIFIED ===\n');
    
    if (servicesData.services && servicesData.services.length > 0) {
      const service = servicesData.services[0];
      console.log('🔍 Current Issues with Service Display:');
      console.log(`   1. Service title "${service.title}" should show business name instead`);
      console.log(`   2. Need to fetch vendor data to get proper business name`);
      console.log(`   3. Service ratings/reviews may not be properly aggregated`);
      
      const vendor = vendorsData.vendors?.find(v => v.id === service.vendor_id);
      if (vendor) {
        console.log(`   ✅ SOLUTION: Use "${vendor.name}" as display name`);
        console.log(`   ✅ SOLUTION: Use rating ${vendor.rating} from vendor`);
        console.log(`   ✅ SOLUTION: Use ${vendor.reviewCount} reviews from vendor`);
      }
    }
    
    console.log('\n=== RECOMMENDED ACTIONS ===\n');
    console.log('1. Update CentralizedServiceManager to fetch vendor data when enriching services');
    console.log('2. Use vendor.name as the primary display name for services');
    console.log('3. Use vendor rating and reviewCount for accurate display');
    console.log('4. Create proper service-vendor data relationship in frontend');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

analyzeServiceVendorRelationship();
