// 🚀 IMMEDIATE BOOKING + EMAIL TEST
// Copy this ENTIRE script into browser console on https://weddingbazaarph.web.app

console.log('🧪 Starting comprehensive booking + email test...');
console.log('📍 Testing URL: https://weddingbazaar-web.onrender.com');
console.log('');

// Test 1: Backend Health Check
console.log('═══════════════════════════════════════');
console.log('TEST 1: Backend Health Check');
console.log('═══════════════════════════════════════');

fetch('https://weddingbazaar-web.onrender.com/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend is reachable');
    console.log('Health status:', data);
  })
  .catch(error => {
    console.error('❌ Backend unreachable:', error.message);
  });

// Test 2: Email Configuration Check
setTimeout(() => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('TEST 2: Email Configuration Check');
  console.log('═══════════════════════════════════════');
  
  fetch('https://weddingbazaar-web.onrender.com/api/bookings/test-email-config')
    .then(response => response.json())
    .then(data => {
      console.log('✅ Email configuration:', data);
      if (data.configured) {
        console.log('📧 Gmail SMTP is configured correctly');
      } else {
        console.warn('⚠️ Email service not configured');
      }
    })
    .catch(error => {
      console.error('❌ Email config check failed:', error.message);
    });
}, 2000);

// Test 3: Create Test Booking (SHOULD TRIGGER EMAIL)
setTimeout(() => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('TEST 3: Create Booking + Send Email');
  console.log('═══════════════════════════════════════');
  console.log('📝 Submitting booking request...');
  console.log('📧 This should send email to vendor');
  console.log('');
  
  const testBooking = {
    coupleId: '1',
    vendorId: '1', // Must have email in database
    serviceId: '1',
    serviceName: 'TEST EMAIL - Wedding Photography',
    serviceType: 'photography',
    eventDate: '2025-12-31',
    eventTime: '14:00',
    eventLocation: 'Manila, Philippines',
    guestCount: 100,
    budgetRange: '50000-100000',
    totalAmount: 75000,
    specialRequests: 'THIS IS A TEST BOOKING FOR EMAIL NOTIFICATION - Please verify email was received',
    contactPerson: 'John Test User',
    contactPhone: '+639171234567',
    contactEmail: 'testuser@example.com',
    preferredContactMethod: 'email',
    vendorName: 'Test Photography Studio',
    coupleName: 'John & Jane Test'
  };
  
  console.log('📤 Sending request with payload:', testBooking);
  console.log('');
  
  fetch('https://weddingbazaar-web.onrender.com/api/bookings/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'test-user-123'
    },
    body: JSON.stringify(testBooking)
  })
    .then(response => {
      console.log('📡 Response status:', response.status, response.statusText);
      return response.json();
    })
    .then(data => {
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('BOOKING RESPONSE:');
      console.log('═══════════════════════════════════════');
      console.log(data);
      console.log('');
      
      if (data.success && data.booking) {
        console.log('✅ BOOKING CREATED SUCCESSFULLY!');
        console.log('📊 Booking ID:', data.booking.id);
        console.log('📅 Event Date:', data.booking.event_date);
        console.log('📍 Location:', data.booking.event_location);
        console.log('👥 Guests:', data.booking.guest_count);
        console.log('');
        console.log('═══════════════════════════════════════');
        console.log('✅ NEXT STEPS:');
        console.log('═══════════════════════════════════════');
        console.log('1. Check Render logs for email sending messages');
        console.log('2. Look for: "📧 Sending new booking notification"');
        console.log('3. Check vendor email inbox (vendor ID: 1)');
        console.log('4. Verify email was received');
        console.log('');
        console.log('🔍 Render Logs: https://dashboard.render.com');
        console.log('');
      } else {
        console.error('❌ BOOKING FAILED');
        console.error('Error:', data.error || data.message);
      }
    })
    .catch(error => {
      console.error('');
      console.error('═══════════════════════════════════════');
      console.error('❌ BOOKING REQUEST FAILED');
      console.error('═══════════════════════════════════════');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('');
      console.error('Possible causes:');
      console.error('- Network error / CORS issue');
      console.error('- Backend not responding');
      console.error('- Invalid request payload');
    });
}, 4000);

// Test 4: Check Render Logs Reminder
setTimeout(() => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('📋 ACTION REQUIRED:');
  console.log('═══════════════════════════════════════');
  console.log('1. Open Render Dashboard: https://dashboard.render.com');
  console.log('2. Select your backend service');
  console.log('3. Go to Logs tab');
  console.log('4. Search for these keywords:');
  console.log('   - "Creating booking request"');
  console.log('   - "Sending new booking notification"');
  console.log('   - "sendNewBookingNotification"');
  console.log('5. Share the logs in chat!');
  console.log('');
  console.log('🔍 If you see email logs → Email was sent!');
  console.log('❌ If no logs appear → Booking request not reaching backend');
  console.log('');
}, 8000);

console.log('');
console.log('✅ Test script loaded');
console.log('⏳ Running tests in 2-second intervals...');
console.log('📊 Watch this console for results');
console.log('');
