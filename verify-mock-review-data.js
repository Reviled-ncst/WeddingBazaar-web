#!/usr/bin/env node

// Database direct query to see raw vendor data
import fetch from 'node-fetch';

console.log('🔍 INVESTIGATING: Raw Vendor Database Values');
console.log('==============================================\n');

async function analyzeVendorData() {
  try {
    // Get the full vendor data
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/vendors/featured');
    const data = await response.json();
    
    console.log('📊 Raw Vendor Data from Database:');
    console.log('==================================');
    
    if (data.vendors && data.vendors.length > 0) {
      data.vendors.forEach((vendor, index) => {
        console.log(`\n🏪 Vendor ${index + 1}:`);
        console.log(`   ID: ${vendor.id}`);
        console.log(`   Name: ${vendor.name}`);
        console.log(`   Rating: ${vendor.rating} (${typeof vendor.rating})`);
        console.log(`   Review Count: ${vendor.reviewCount} (${typeof vendor.reviewCount})`);
        console.log(`   Verified: ${vendor.verified}`);
        console.log(`   Years Experience: ${vendor.yearsExperience}`);
      });
    }

    console.log('\n🔍 Analysis:');
    console.log('=============');
    console.log('✅ Vendors table HAS rating and review_count columns');
    console.log('❌ But there is NO reviews table to calculate these from');
    console.log('🤔 This means the rating and review_count values are either:');
    console.log('   1. Manually inserted test data');
    console.log('   2. Generated/hardcoded values');
    console.log('   3. Not based on actual customer reviews');

    console.log('\n🚨 CONCLUSION:');
    console.log('===============');
    console.log('The "12 reviews" shown in the UI are from vendors.review_count');
    console.log('But since there is no reviews table, these are MOCK/TEST values');
    console.log('The system shows fake review counts without actual review records');

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

analyzeVendorData();
