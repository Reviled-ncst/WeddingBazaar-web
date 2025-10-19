#!/usr/bin/env node

/**
 * Service API Diagnostic Tool
 * Tests POST /api/services endpoint
 * Date: October 20, 2025
 */

const API_URL = process.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

const testData = {
  vendor_id: 'test-vendor-id',
  title: 'Test Service',
  description: 'Test description for diagnostic purposes',
  category: 'Photography',
  price: 1000,
  location: 'Test City',
  images: ['https://example.com/image1.jpg'],
  is_active: true,
  featured: false,
  years_in_business: 5,
  service_tier: 'Premium',
  wedding_styles: ['Traditional', 'Modern'],
  cultural_specialties: ['Filipino', 'Western'],
  availability: {
    weekdays: true,
    weekends: true,
    holidays: false
  }
};

async function testEndpoint(url, method, data) {
  console.log(`\n🔍 Testing ${method} ${url}`);
  console.log(`📦 Payload:`, JSON.stringify(data, null, 2));
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    console.log(`📄 Raw Response:`, text);
    
    try {
      const json = JSON.parse(text);
      console.log(`✅ Parsed JSON:`, JSON.stringify(json, null, 2));
      return { success: response.ok, data: json, status: response.status };
    } catch (e) {
      console.error(`❌ Failed to parse response as JSON`);
      return { success: false, error: text, status: response.status };
    }
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function diagnoseServiceAPI() {
  console.log('🏥 Service API Diagnostic Tool');
  console.log('='.repeat(60));
  console.log(`🌐 API Base URL: ${API_URL}`);
  console.log('='.repeat(60));
  
  // Test 1: Health check
  console.log('\n📋 Test 1: Health Check');
  const healthResult = await testEndpoint(`${API_URL}/api/health`, 'GET', null);
  
  // Test 2: Check if services endpoint exists (GET)
  console.log('\n📋 Test 2: GET /api/services');
  const getResult = await testEndpoint(`${API_URL}/api/services`, 'GET', null);
  
  // Test 3: POST new service
  console.log('\n📋 Test 3: POST /api/services');
  const postResult = await testEndpoint(`${API_URL}/api/services`, 'POST', testData);
  
  // Test 4: Test with minimal data
  console.log('\n📋 Test 4: POST /api/services (minimal data)');
  const minimalData = {
    vendor_id: 'test-vendor-id',
    title: 'Minimal Test Service',
    category: 'Photography'
  };
  const minimalResult = await testEndpoint(`${API_URL}/api/services`, 'POST', minimalData);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  console.log(`Health Check:        ${healthResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`GET /api/services:   ${getResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`POST /api/services:  ${postResult.success ? '✅ PASS' : '❌ FAIL'} (Status: ${postResult.status})`);
  console.log(`POST (minimal):      ${minimalResult.success ? '✅ PASS' : '❌ FAIL'} (Status: ${minimalResult.status})`);
  
  if (!postResult.success) {
    console.log('\n⚠️  POST /api/services FAILED');
    console.log('Error:', postResult.error || postResult.data);
    console.log('\n🔧 Possible Issues:');
    console.log('  1. Backend route not registered correctly');
    console.log('  2. Database schema mismatch');
    console.log('  3. Authentication required but not provided');
    console.log('  4. CORS issues');
    console.log('  5. Backend not deployed with latest changes');
  } else {
    console.log('\n✅ All tests passed! Service API is working correctly.');
  }
}

// Run diagnostics
diagnoseServiceAPI().catch(console.error);
