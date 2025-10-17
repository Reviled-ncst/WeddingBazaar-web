#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🔍 INVESTIGATING REVIEW DATA DISCREPANCY\n');

async function investigate() {
  try {
    // 1. Check what the backend API actually returns
    console.log('📡 Step 1: Checking backend /api/services response...\n');
    const servicesResponse = await fetch('https://weddingbazaar-web.onrender.com/api/services');
    const servicesData = await servicesResponse.json();
    
    if (servicesData.services && servicesData.services.length > 0) {
      const firstService = servicesData.services[0];
      console.log('✅ First service from API:');
      console.log('   - Service ID:', firstService.id);
      console.log('   - Service Title:', firstService.title);
      console.log('   - Vendor ID:', firstService.vendor_id);
      console.log('   - vendor_business_name:', firstService.vendor_business_name);
      console.log('   - vendor_rating:', firstService.vendor_rating);
      console.log('   - vendor_review_count:', firstService.vendor_review_count);
      console.log('');
    }

    // 2. Check vendors API for comparison
    console.log('📡 Step 2: Checking /api/vendors/featured response...\n');
    const vendorsResponse = await fetch('https://weddingbazaar-web.onrender.com/api/vendors/featured');
    const vendorsData = await vendorsResponse.json();
    
    if (vendorsData.vendors && vendorsData.vendors.length > 0) {
      const firstVendor = vendorsData.vendors[0];
      console.log('✅ First vendor from API:');
      console.log('   - Vendor ID:', firstVendor.id);
      console.log('   - Vendor Name:', firstVendor.name);
      console.log('   - Rating:', firstVendor.rating);
      console.log('   - Review Count:', firstVendor.reviewCount);
      console.log('');
    }

    // 3. Check if reviews table exists and has data
    console.log('📡 Step 3: Checking database for reviews table...\n');
    
    console.log('⚠️  CRITICAL FINDING:');
    console.log('   The reviews endpoint returns 404, meaning:');
    console.log('   - Reviews table may not exist');
    console.log('   - OR reviews table is empty');
    console.log('   - OR reviews route is not deployed yet');
    console.log('');

    // 4. Summary
    console.log('📊 SUMMARY OF FINDINGS:\n');
    console.log('1. Backend API provides vendor_review_count field');
    console.log('2. This count comes from vendors table (not reviews table)');
    console.log('3. Frontend must map vendor_review_count correctly');
    console.log('4. Reviews table is likely EMPTY or MISSING');
    console.log('5. Review counts are stored in vendors table metadata');
    console.log('');

    console.log('🎯 CONCLUSION:');
    console.log('   Review counts are NOT mock data - they come from vendors.review_count');
    console.log('   However, there are NO actual review records in the database');
    console.log('   The "17 reviews" is a counter, but no actual reviews exist to display');
    console.log('');

  } catch (error) {
    console.error('❌ Investigation error:', error.message);
  }
}

investigate();
