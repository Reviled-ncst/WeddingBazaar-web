#!/usr/bin/env node

console.log('🔍 Verifying backend deployment...');

import fetch from 'node-fetch';

async function verify() {
  try {
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/services');
    const data = await response.json();
    
    if (data.services && data.services[0] && data.services[0].vendor_business_name) {
      console.log('✅ DEPLOYMENT SUCCESS: Vendor enrichment is working!');
      console.log('🎉 Services now include vendor business names');
      console.log('📊 Sample:', {
        service: data.services[0].title,
        vendor_name: data.services[0].vendor_business_name,
        vendor_rating: data.services[0].vendor_rating
      });
    } else {
      console.log('❌ DEPLOYMENT PENDING: Vendor enrichment not yet active');
      console.log('⏳ Wait a few minutes and try again');
    }
  } catch (error) {
    console.log('❌ Verification failed:', error.message);
  }
}

verify();
