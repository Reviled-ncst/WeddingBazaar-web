#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🔍 Debugging backend services endpoint...');

async function debug() {
  try {
    console.log('📡 Testing basic health check...');
    const healthResponse = await fetch('https://weddingbazaar-web.onrender.com/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    console.log('📡 Testing services endpoint...');
    const servicesResponse = await fetch('https://weddingbazaar-web.onrender.com/api/services');
    
    console.log('Status:', servicesResponse.status);
    console.log('Status Text:', servicesResponse.statusText);
    
    if (servicesResponse.status === 500) {
      const errorText = await servicesResponse.text();
      console.log('❌ Error response body:', errorText);
    } else {
      const servicesData = await servicesResponse.json();
      console.log('✅ Services response:', JSON.stringify(servicesData, null, 2));
    }

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debug();
