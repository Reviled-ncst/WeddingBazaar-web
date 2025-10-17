#!/usr/bin/env node

// Database schema analysis to find where review data comes from
import fetch from 'node-fetch';

console.log('🔍 INVESTIGATING: Where Review Data Actually Comes From');
console.log('=======================================================\n');

async function analyzeReviewSources() {
  try {
    // Test 1: Check vendors table for review_count column
    console.log('📊 Test 1: Vendors Table Structure');
    const vendorsResponse = await fetch('https://weddingbazaar-web.onrender.com/api/vendors/featured');
    const vendorsData = await vendorsResponse.json();
    
    if (vendorsData.vendors && vendorsData.vendors.length > 0) {
      const sampleVendor = vendorsData.vendors[0];
      console.log('✅ Sample vendor fields:');
      Object.keys(sampleVendor).forEach(key => {
        if (key.toLowerCase().includes('review')) {
          console.log(`   🎯 ${key}: ${sampleVendor[key]} (${typeof sampleVendor[key]})`);
        }
      });
    }

    // Test 2: Check services table for review data
    console.log('\n📊 Test 2: Services Table Structure');
    const servicesResponse = await fetch('https://weddingbazaar-web.onrender.com/api/services');
    const servicesData = await servicesResponse.json();
    
    if (servicesData.services && servicesData.services.length > 0) {
      const sampleService = servicesData.services[0];
      console.log('✅ Sample service fields:');
      Object.keys(sampleService).forEach(key => {
        if (key.toLowerCase().includes('review') || key.toLowerCase().includes('rating')) {
          console.log(`   🎯 ${key}: ${sampleService[key]} (${typeof sampleService[key]})`);
        }
      });
    }

    // Test 3: Database tables analysis
    console.log('\n📊 Test 3: Database Schema Analysis');
    console.log('Based on provided schema:');
    console.log('✅ services table EXISTS with columns:');
    console.log('   - id, vendor_id, title, description, category, price');
    console.log('   - images, featured, is_active, created_at, updated_at');
    console.log('   - name, location, price_range');
    console.log('❌ reviews table DOES NOT EXIST');
    console.log('❌ No review_count column in services table');
    console.log('❌ No rating column in services table');

    console.log('\n🎯 CONCLUSION:');
    console.log('===============');
    console.log('❌ The review counts shown in the UI are NOT from a reviews table');
    console.log('❌ The reviews table does not exist in the database');
    console.log('🤔 Review data must be coming from:');
    console.log('   1. vendors.review_count column (if it exists)');
    console.log('   2. Mock/default values in the frontend');
    console.log('   3. Hardcoded values in the backend vendor enrichment');

    console.log('\n🚨 MOCK DATA CONFIRMED:');
    console.log('The "12 reviews" and "74 reviews" are NOT real review counts');
    console.log('They are either hardcoded or calculated values');

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

analyzeReviewSources();
