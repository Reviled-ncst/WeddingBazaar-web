#!/usr/bin/env node

// Database schema analysis - check what tables actually exist
import fetch from 'node-fetch';

console.log('🔍 DATABASE SCHEMA INVESTIGATION');
console.log('================================\n');

async function analyzeDatabase() {
  try {
    // Test if we can create a debug endpoint to check tables
    console.log('📡 Testing database connectivity...');
    const healthResponse = await fetch('https://weddingbazaar-web.onrender.com/api/health');
    const healthData = await healthResponse.json();
    
    console.log('✅ Backend is connected');
    console.log('Database status:', healthData.database);
    
    // The key question: Does reviews table exist?
    console.log('\n🔍 CRITICAL INVESTIGATION: Reviews Table');
    console.log('=========================================');
    
    console.log('❓ Question: Does reviews table exist in database?');
    console.log('❓ Question: Where are review counts coming from?');
    
    // Check vendor data for review counts
    console.log('\n📊 Checking vendor data source...');
    const vendorsResponse = await fetch('https://weddingbazaar-web.onrender.com/api/vendors/featured');
    const vendorsData = await vendorsResponse.json();
    
    if (vendorsData.vendors && vendorsData.vendors.length > 0) {
      const vendor = vendorsData.vendors[0];
      console.log('\n📋 VENDOR DATA ANALYSIS:');
      console.log(`- Name: ${vendor.name}`);
      console.log(`- Rating: ${vendor.rating}`);
      console.log(`- Review Count: ${vendor.reviewCount}`);
      console.log(`- Available fields:`, Object.keys(vendor));
      
      console.log('\n❓ WHERE DOES reviewCount COME FROM?');
      console.log('- From vendors.review_count column?');
      console.log('- Calculated from reviews table?');
      console.log('- Hardcoded mock data?');
    }
    
    // Check services data
    console.log('\n📊 Checking services data source...');
    const servicesResponse = await fetch('https://weddingbazaar-web.onrender.com/api/services');
    const servicesData = await servicesResponse.json();
    
    if (servicesData.services && servicesData.services.length > 0) {
      const service = servicesData.services[0];
      console.log('\n📋 SERVICE DATA ANALYSIS:');
      console.log(`- Title: ${service.title}`);
      console.log(`- Vendor Rating: ${service.vendor_rating}`);
      console.log(`- Vendor Review Count: ${service.vendor_review_count}`);
      console.log(`- Available fields:`, Object.keys(service));
    }
    
    console.log('\n🚨 HYPOTHESIS TO TEST:');
    console.log('======================');
    console.log('1. Reviews table may not exist');
    console.log('2. Review counts are hardcoded in vendors table');
    console.log('3. No actual review records exist');
    console.log('4. Frontend shows counts but no detail reviews');
    
    console.log('\n📝 NEXT VERIFICATION STEPS:');
    console.log('===========================');
    console.log('1. Check actual database schema');
    console.log('2. Query vendors table structure');
    console.log('3. Verify if reviews table exists');
    console.log('4. Find source of review_count values');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
  }
}

analyzeDatabase();
