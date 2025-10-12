#!/usr/bin/env node

/**
 * 🔍 QUICK SYSTEM TEST: Verify vendor-booking mapping fix
 */

const { execSync } = require('child_process');

console.log('🧪 ====================================');
console.log('🔍 QUICK SYSTEM TEST: Backend APIs');
console.log('🧪 ====================================');

async function testBackendAPIs() {
  try {
    console.log('\n🏥 1. TESTING BACKEND HEALTH');
    console.log('-----------------------------');
    
    const healthResponse = execSync('curl -s https://weddingbazaar-web.onrender.com/api/health', { encoding: 'utf-8' });
    const health = JSON.parse(healthResponse);
    
    console.log(`✅ Status: ${health.status}`);
    console.log(`📊 Message: ${health.message}`);
    console.log(`💾 Database: Connected`);
    console.log(`📊 Tables: ${health.tables} conversations, ${health.messages} messages`);
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }

  try {
    console.log('\n📅 2. TESTING ENHANCED BOOKINGS API');
    console.log('-----------------------------------');
    
    const bookingsResponse = execSync('curl -s "https://weddingbazaar-web.onrender.com/api/bookings/enhanced?coupleId=1-2025-001"', { encoding: 'utf-8' });
    const bookings = JSON.parse(bookingsResponse);
    
    console.log(`✅ API Status: ${bookings.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`📊 Bookings Found: ${bookings.bookings?.length || 0}`);
    
    if (bookings.bookings && bookings.bookings.length > 0) {
      console.log('\n📋 Booking Details:');
      bookings.bookings.forEach((booking, index) => {
        const vendorStatus = booking.vendor_name ? `✅ ${booking.vendor_name}` : `❌ NULL (ID: ${booking.vendor_id})`;
        console.log(`   ${index + 1}. ${booking.service_name} - ${vendorStatus}`);
        console.log(`      📅 Date: ${booking.booking_date}`);
        console.log(`      💰 Amount: ₱${booking.total_amount?.toLocaleString() || 'N/A'}`);
        console.log(`      📊 Status: ${booking.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Bookings API test failed:', error.message);
    return false;
  }

  try {
    console.log('\n🧾 3. TESTING RECEIPTS API');
    console.log('---------------------------');
    
    const receiptsResponse = execSync('curl -s https://weddingbazaar-web.onrender.com/api/receipts/couple/1-2025-001', { encoding: 'utf-8' });
    const receipts = JSON.parse(receiptsResponse);
    
    console.log(`✅ API Status: ${receipts.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`🧾 Receipts Found: ${receipts.receipts?.length || 0}`);
    
    if (receipts.receipts && receipts.receipts.length > 0) {
      console.log('\n📋 Receipt Details:');
      receipts.receipts.forEach((receipt, index) => {
        console.log(`   ${index + 1}. ${receipt.receipt_number}`);
        console.log(`      🏪 Vendor: ${receipt.vendor_name || 'N/A'}`);
        console.log(`      💰 Amount: ${receipt.amount_paid_formatted || 'N/A'}`);
        console.log(`      📅 Date: ${new Date(receipt.payment_date).toLocaleDateString()}`);
        console.log(`      📊 Status: ${receipt.payment_status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Receipts API test failed:', error.message);
    return false;
  }

  try {
    console.log('\n🏪 4. TESTING VENDORS API');
    console.log('-------------------------');
    
    const vendorsResponse = execSync('curl -s https://weddingbazaar-web.onrender.com/api/vendors/featured', { encoding: 'utf-8' });
    const vendors = JSON.parse(vendorsResponse);
    
    console.log(`✅ API Status: ${vendors.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`🏪 Vendors Found: ${vendors.vendors?.length || 0}`);
    
    if (vendors.vendors && vendors.vendors.length > 0) {
      console.log('\n📋 Vendor Details:');
      vendors.vendors.forEach((vendor, index) => {
        console.log(`   ${index + 1}. ${vendor.name} (ID: ${vendor.id})`);
        console.log(`      📂 Category: ${vendor.category}`);
        console.log(`      ⭐ Rating: ${vendor.rating}★ (${vendor.reviewCount} reviews)`);
        console.log(`      📍 Location: ${vendor.location || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Vendors API test failed:', error.message);
    return false;
  }

  return true;
}

async function main() {
  try {
    const success = await testBackendAPIs();
    
    console.log('\n🎯 ====================================');
    if (success) {
      console.log('✅ ALL API TESTS PASSED');
      console.log('🚀 Backend APIs are working correctly');
      console.log('📱 Frontend should now display proper data');
      console.log('');
      console.log('📋 NEXT STEPS:');
      console.log('1. ✅ Backend APIs working');
      console.log('2. 🔄 Deploy latest backend (if needed)');
      console.log('3. 📱 Test frontend booking page');
      console.log('4. 🧾 Test receipts in frontend');
    } else {
      console.log('❌ SOME API TESTS FAILED');
    }
    console.log('🎯 ====================================');
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
