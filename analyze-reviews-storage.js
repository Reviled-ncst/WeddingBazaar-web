#!/usr/bin/env node

// Analyze database schema for reviews storage
import fetch from 'node-fetch';

async function analyzeReviewsStorage() {
  try {
    console.log('🔍 Analyzing reviews storage in database...');
    
    // First, check if we can access the database info via health endpoint
    const healthResponse = await fetch('https://weddingbazaar-web.onrender.com/api/health');
    const healthData = await healthResponse.json();
    
    console.log('📊 Database Status:', healthData.database);
    console.log('📊 Database Stats:', healthData.databaseStats);
    
    // Try to test our new reviews endpoint
    console.log('\n🧪 Testing reviews endpoints...');
    
    const serviceReviews = await fetch('https://weddingbazaar-web.onrender.com/api/reviews/service/SRV-0001');
    console.log('Service Reviews Status:', serviceReviews.status);
    
    if (serviceReviews.status === 200) {
      const reviewsData = await serviceReviews.json();
      console.log('✅ Reviews found:', reviewsData.length);
    } else if (serviceReviews.status === 404) {
      console.log('❌ Reviews endpoint not yet deployed');
    } else {
      const errorText = await serviceReviews.text();
      console.log('❌ Reviews error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  }
}

analyzeReviewsStorage();
