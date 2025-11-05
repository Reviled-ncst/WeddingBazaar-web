// ============================================================================
// VENDOR DEBUG SCRIPT - Run this in browser console
// ============================================================================

console.log('%c🔍 VENDOR DEBUG DIAGNOSTIC STARTED', 'background: #4F46E5; color: white; padding: 8px; font-size: 14px; font-weight: bold;');
console.log('='.repeat(80));

// 1. Check User Authentication
console.log('\n%c1️⃣ USER AUTHENTICATION CHECK', 'background: #10B981; color: white; padding: 4px; font-weight: bold;');
const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

console.log('Auth Token:', authToken ? '✅ EXISTS' : '❌ MISSING');
console.log('User Object:', user);
console.log('User ID:', user.id);
console.log('User Role:', user.role);
console.log('Vendor ID (from user):', user.vendorId);
console.log('Email:', user.email);

// 2. API Base URL Check
console.log('\n%c2️⃣ API CONFIGURATION CHECK', 'background: #10B981; color: white; padding: 4px; font-weight: bold;');
const apiUrl = import.meta.env?.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
console.log('API Base URL:', apiUrl);
console.log('Expected Services URL:', `${apiUrl}/api/services/vendor/${user.vendorId || user.id}`);
console.log('Expected Bookings URL:', `${apiUrl}/api/bookings/vendor/${user.vendorId || user.id}`);

// 3. Test Backend Health
console.log('\n%c3️⃣ BACKEND HEALTH CHECK', 'background: #10B981; color: white; padding: 4px; font-weight: bold;');
fetch(`${apiUrl}/api/health`)
  .then(res => res.json())
  .then(data => {
    console.log('✅ Backend Health:', data);
  })
  .catch(err => {
    console.error('❌ Backend Health Error:', err);
  });

// 4. Test Services API
console.log('\n%c4️⃣ SERVICES API TEST', 'background: #10B981; color: white; padding: 4px; font-weight: bold;');
const vendorIdForServices = user.vendorId || user.id;
console.log('Testing with Vendor ID:', vendorIdForServices);

fetch(`${apiUrl}/api/services/vendor/${vendorIdForServices}`, {
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
})
  .then(async res => {
    console.log('Services API Status:', res.status);
    const data = await res.json();
    console.log('Services API Response:', data);
    if (data.services && data.services.length > 0) {
      console.log(`✅ Found ${data.services.length} services`);
      console.log('First service:', data.services[0]);
    } else {
      console.log('⚠️ No services found');
    }
    return data;
  })
  .catch(err => {
    console.error('❌ Services API Error:', err);
  });

// 5. Test Bookings API
console.log('\n%c5️⃣ BOOKINGS API TEST', 'background: #10B981; color: white; padding: 4px; font-weight: bold;');
const vendorIdForBookings = user.vendorId || user.id;
console.log('Testing with Vendor ID:', vendorIdForBookings);

fetch(`${apiUrl}/api/bookings/vendor/${vendorIdForBookings}`, {
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
})
  .then(async res => {
    console.log('Bookings API Status:', res.status);
    const data = await res.json();
    console.log('Bookings API Response:', data);
    if (data.bookings && data.bookings.length > 0) {
      console.log(`✅ Found ${data.bookings.length} bookings`);
      console.log('First booking:', data.bookings[0]);
      console.log('Vendor IDs in bookings:', [...new Set(data.bookings.map(b => b.vendor_id))]);
    } else {
      console.log('⚠️ No bookings found');
    }
    return data;
  })
  .catch(err => {
    console.error('❌ Bookings API Error:', err);
  });

// 6. Check Vendor Profile API
console.log('\n%c6️⃣ VENDOR PROFILE API TEST', 'background: #10B981; color: white; padding: 4px; font-weight: bold;');
fetch(`${apiUrl}/api/vendor-profile/${user.vendorId || user.id}`, {
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
})
  .then(async res => {
    console.log('Vendor Profile API Status:', res.status);
    const data = await res.json();
    console.log('Vendor Profile Response:', data);
    return data;
  })
  .catch(err => {
    console.error('❌ Vendor Profile API Error:', err);
  });

// 7. Check for CORS errors
console.log('\n%c7️⃣ CORS & NETWORK CHECK', 'background: #10B981; color: white; padding: 4px; font-weight: bold;');
console.log('Open the Network tab and look for:');
console.log('- Any requests with status code in RED (404, 500, etc.)');
console.log('- Any requests with CORS errors');
console.log('- Any requests that are pending forever');

// 8. Summary
setTimeout(() => {
  console.log('\n' + '='.repeat(80));
  console.log('%c✅ DEBUG DIAGNOSTIC COMPLETE', 'background: #4F46E5; color: white; padding: 8px; font-size: 14px; font-weight: bold;');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Check the console output above for any ❌ errors');
  console.log('2. Verify the Vendor ID matches your database records');
  console.log('3. Check Network tab for failed requests');
  console.log('4. Share the console output with support');
  console.log('='.repeat(80));
}, 3000);

// Export results for easy sharing
window.vendorDebugResults = {
  user,
  authToken: authToken ? 'EXISTS' : 'MISSING',
  apiUrl,
  timestamp: new Date().toISOString()
};

console.log('\n💾 Debug results saved to: window.vendorDebugResults');
console.log('You can copy them with: copy(window.vendorDebugResults)');
