#!/usr/bin/env node

// Analyze vendors table schema
import fetch from 'node-fetch';

async function analyzeSchema() {
  try {
    console.log('🔍 Analyzing vendors schema...');
    
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/vendors/featured');
    const data = await response.json();
    
    console.log('✅ Sample vendor data structure:');
    if (data.vendors && data.vendors.length > 0) {
      const sampleVendor = data.vendors[0];
      console.log(JSON.stringify(sampleVendor, null, 2));
      
      console.log('\n📋 Available fields:');
      Object.keys(sampleVendor).forEach(key => {
        console.log(`- ${key}: ${typeof sampleVendor[key]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Schema analysis error:', error.message);
  }
}

analyzeSchema();
