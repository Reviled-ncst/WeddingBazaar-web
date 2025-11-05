// 🔍 NOTIFICATION SYSTEM DIAGNOSTIC SCRIPT
// Copy and paste this into browser console on vendor page

console.clear();
console.log('🔍 Starting Notification System Diagnostic...\n');

// Step 1: Check user session
console.log('📋 Step 1: Checking User Session');
console.log('─────────────────────────────────');
const user = JSON.parse(localStorage.getItem('weddingbazaar_user') || '{}');
console.log('User ID:', user.userId || '❌ NOT FOUND');
console.log('Vendor ID:', user.vendorId || '❌ NOT FOUND');
console.log('Role:', user.role || '❌ NOT FOUND');
console.log('Full User Object:', user);
console.log('\n');

// Step 2: Check if we have a vendor ID
if (!user.vendorId) {
  console.error('❌ ERROR: No vendor ID found in session!');
  console.log('💡 FIX: Re-login or run vendor session fix script');
  console.log('📄 See: FIX_VENDOR_SESSION_NO_DATABASE.md\n');
} else {
  console.log('✅ Vendor ID found:', user.vendorId);
  console.log('\n');
}

// Step 3: Test API endpoint
console.log('📋 Step 2: Testing API Endpoint');
console.log('─────────────────────────────────');
const apiUrl = `https://weddingbazaar-web.onrender.com/api/notifications/vendor/${user.vendorId}`;
console.log('API URL:', apiUrl);
console.log('Fetching...\n');

fetch(apiUrl, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('weddingbazaar_token')}`,
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log('Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('─────────────────────────────────');
    console.log('📋 Step 3: API Response Analysis');
    console.log('─────────────────────────────────');
    console.log('Success:', data.success);
    console.log('Total Notifications:', data.count || data.notifications?.length || 0);
    console.log('Unread Count:', data.unreadCount || 0);
    console.log('\n');

    if (data.notifications && data.notifications.length > 0) {
      console.log('📋 Step 4: Checking for Mock Data');
      console.log('─────────────────────────────────');
      
      const firstNotification = data.notifications[0];
      console.log('First Notification:', firstNotification);
      console.log('\n');

      // Check for mock data patterns
      const mockPatterns = [
        { field: 'id', pattern: /^mock-/, name: 'Mock ID' },
        { field: 'id', pattern: /^notif-mock-/, name: 'Mock ID Pattern' },
        { field: 'booking_id', pattern: /^booking-00\d$/, name: 'Mock Booking ID' },
        { field: 'message', pattern: /Sarah & Michael/, name: 'Mock Couple Name (Sarah & Michael)' },
        { field: 'message', pattern: /Jennifer & David/, name: 'Mock Couple Name (Jennifer & David)' },
        { field: 'message', pattern: /Emily & James/, name: 'Mock Couple Name (Emily & James)' }
      ];

      let mockDataFound = false;
      mockPatterns.forEach(({ field, pattern, name }) => {
        const value = firstNotification[field];
        if (value && pattern.test(value)) {
          console.error(`❌ MOCK DATA DETECTED: ${name}`);
          console.error(`   Field: ${field}`);
          console.error(`   Value: ${value}`);
          mockDataFound = true;
        }
      });

      if (!mockDataFound) {
        console.log('✅ NO MOCK DATA DETECTED!');
        console.log('✅ All notifications appear to be real!');
      } else {
        console.error('\n❌ MOCK DATA FOUND IN RESPONSE!');
        console.error('🔧 Possible Causes:');
        console.error('   1. Browser cache not cleared');
        console.error('   2. Backend not deployed yet');
        console.error('   3. Frontend code not updated');
        console.log('\n💡 SOLUTIONS:');
        console.log('   1. Clear cache: Ctrl+Shift+Delete → Clear all');
        console.log('   2. Hard refresh: Ctrl+Shift+R');
        console.log('   3. Try incognito mode: Ctrl+Shift+N');
        console.log('   4. Check backend deployment time');
      }
      console.log('\n');
    } else {
      console.log('ℹ️ No notifications found');
      console.log('💡 This is normal if no bookings submitted yet');
      console.log('📝 To test: Submit a booking as a couple\n');
    }

    // Step 5: Database check recommendation
    console.log('─────────────────────────────────');
    console.log('📋 Step 5: Database Verification');
    console.log('─────────────────────────────────');
    console.log('Run this in Neon SQL console:');
    console.log('');
    console.log('SELECT id, title, message, booking_id, created_at');
    console.log('FROM notifications');
    console.log(`WHERE user_id = '${user.vendorId}'`);
    console.log('ORDER BY created_at DESC');
    console.log('LIMIT 5;');
    console.log('\n');

    // Final summary
    console.log('─────────────────────────────────');
    console.log('📋 DIAGNOSTIC SUMMARY');
    console.log('─────────────────────────────────');
    if (!user.vendorId) {
      console.error('❌ Status: VENDOR ID MISSING');
      console.log('📄 Fix: See FIX_VENDOR_SESSION_NO_DATABASE.md');
    } else if (mockDataFound) {
      console.error('❌ Status: MOCK DATA DETECTED');
      console.log('📄 Fix: Clear cache and hard refresh');
    } else if (data.notifications && data.notifications.length > 0) {
      console.log('✅ Status: WORKING CORRECTLY');
      console.log('🎉 Real notifications are being displayed!');
    } else {
      console.log('⚠️ Status: NO NOTIFICATIONS');
      console.log('💡 Next: Submit a test booking');
    }
    console.log('\n');
    console.log('🔍 Diagnostic Complete!');
  })
  .catch(error => {
    console.error('─────────────────────────────────');
    console.error('❌ API ERROR!');
    console.error('─────────────────────────────────');
    console.error('Error:', error);
    console.error('\n🔧 Possible Causes:');
    console.error('   1. Backend is down');
    console.error('   2. Network issue');
    console.error('   3. Invalid vendor ID');
    console.error('   4. CORS issue');
    console.log('\n💡 SOLUTIONS:');
    console.log('   1. Check backend health:');
    console.log('      https://weddingbazaar-web.onrender.com/api/health');
    console.log('   2. Check Render dashboard for deployment status');
    console.log('   3. Verify vendor ID is correct');
    console.log('\n');
  });

// Additional checks
console.log('─────────────────────────────────');
console.log('📋 Additional Checks');
console.log('─────────────────────────────────');

// Check if old booking service is being imported
console.log('Checking for old imports...');
const scripts = Array.from(document.scripts);
const hasOldBookingService = scripts.some(script => 
  script.src.includes('bookingApiService')
);
if (hasOldBookingService) {
  console.warn('⚠️ Old booking service detected in loaded scripts');
  console.log('💡 This might indicate cached JavaScript');
} else {
  console.log('✅ No old service imports detected');
}

console.log('\n📄 For detailed guide, see: NOTIFICATION_SYSTEM_FINAL_VERIFICATION.md');
console.log('─────────────────────────────────\n');
