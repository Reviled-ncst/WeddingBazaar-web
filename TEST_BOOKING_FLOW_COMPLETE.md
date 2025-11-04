# 🎯 COMPLETE BOOKING FLOW TEST - Email Notification Diagnostic

## SUMMARY OF FINDINGS

**Booking Creation Flow:**
1. Frontend: `Services.tsx` → `ServiceDetailsModal.tsx` → `BookingRequestModal.tsx`
2. API Service: `optimizedBookingApiService.ts` → `createBookingRequest()`
3. Backend: `POST /api/bookings/request` (line 792 in `bookings.cjs`)
4. Email: `emailService.sendNewBookingNotification()` (line 925 in `bookings.cjs`)

**Current Problem:**
- ✅ Email service works (manual test succeeded)
- ✅ Backend endpoint exists and has email logic
- ❌ Booking API calls are NOT reaching backend (no logs in Render)
- ❌ Only profile requests are logged

**Hypothesis:**
The booking creation is failing silently in the frontend OR the API call is being blocked/redirected.

---

## 🧪 STEP 1: Direct Backend API Test (Skip Frontend)

Run this in your browser console on https://weddingbazaarph.web.app:

```javascript
// Test 1: Direct booking creation via backend API
async function testBookingCreationDirect() {
  console.log('🧪 Testing direct booking creation...');
  
  try {
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-123'
      },
      body: JSON.stringify({
        coupleId: '1',
        vendorId: '1', // Vendor ID with email
        serviceId: '1',
        serviceName: 'Test Wedding Photography',
        serviceType: 'photography',
        eventDate: '2025-12-31',
        eventTime: '14:00',
        eventLocation: 'Manila, Philippines',
        guestCount: 100,
        budgetRange: '50000-100000',
        totalAmount: 75000,
        specialRequests: 'Test booking for email notification',
        contactPerson: 'John Doe',
        contactPhone: '+639171234567',
        contactEmail: 'johndoe@example.com',
        preferredContactMethod: 'email',
        vendorName: 'Amazing Photography Studio',
        coupleName: 'John & Jane'
      })
    });
    
    const data = await response.json();
    console.log('✅ Direct API Response:', data);
    
    if (data.success) {
      console.log('🎉 BOOKING CREATED!');
      console.log('📧 Check vendor email inbox for notification');
      console.log('📊 Booking ID:', data.booking?.id);
    } else {
      console.error('❌ Booking failed:', data.error);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Direct API test failed:', error);
    return null;
  }
}

// Run the test
testBookingCreationDirect();
```

**Expected Results:**
- ✅ Response: `{ success: true, booking: {...} }`
- ✅ Render logs show: "📝 Creating booking request"
- ✅ Render logs show: "📧 Sending new booking notification to vendor"
- ✅ Vendor receives email notification

**If this works:** Frontend is the issue (not calling the API)
**If this fails:** Backend/database issue

---

## 🧪 STEP 2: Test Frontend Booking Flow

If Step 1 works, test the actual frontend flow:

```javascript
// Test 2: Check if optimizedBookingApiService is working
async function testFrontendBookingService() {
  console.log('🧪 Testing frontend booking service...');
  
  // Import the service (this assumes you're on the site)
  const { optimizedBookingApiService } = await import('/src/services/api/optimizedBookingApiService.ts');
  
  const testBooking = {
    service_id: '1',
    vendor_id: '1',
    user_id: 'test-user-123',
    service_name: 'Test Photography',
    service_type: 'photography',
    event_date: '2025-12-31',
    event_time: '14:00',
    event_location: 'Manila, Philippines',
    guest_count: 100,
    budget_range: '50000-100000',
    special_requests: 'Test booking via frontend service',
    contact_person: 'Jane Smith',
    contact_phone: '+639177654321',
    contact_email: 'janesmith@example.com',
    preferred_contact_method: 'email',
    vendor_name: 'Test Vendor',
    couple_name: 'Test Couple'
  };
  
  try {
    const result = await optimizedBookingApiService.createBookingRequest(testBooking, 'test-user-123');
    console.log('✅ Frontend service response:', result);
    
    if (result?.id) {
      console.log('🎉 BOOKING CREATED VIA FRONTEND SERVICE!');
      console.log('📧 Check vendor email for notification');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Frontend service failed:', error);
    return null;
  }
}

// Run the test
testFrontendBookingService();
```

---

## 🧪 STEP 3: Check Network Requests During Real Booking

1. Open Chrome DevTools → Network tab
2. Filter by "request"
3. Go to Services page: https://weddingbazaarph.web.app/individual/services
4. Click "Book Now" on any service
5. Fill out booking form
6. Submit booking
7. **Check Network tab for:**
   - ❓ Is there a request to `/api/bookings/request`?
   - ❓ What's the status code? (200, 404, 500?)
   - ❓ What's the response body?

**Screenshot the Network tab and share the result!**

---

## 🧪 STEP 4: Check Console Logs During Real Booking

1. Open Chrome DevTools → Console tab
2. Clear console
3. Go to Services page
4. Click "Book Now"
5. Fill out form
6. Submit booking
7. **Look for these logs:**
   - `🚀 [BOOKING API] Starting booking request`
   - `🏥 [BOOKING API] Health check result`
   - `📡 [BOOKING API] Sending POST /api/bookings/request`
   - `✅ [BOOKING API] Response received`

**Screenshot the console and share!**

---

## 🔍 STEP 5: Check Render Logs After Booking Attempt

After submitting a booking:

1. Go to Render dashboard: https://dashboard.render.com
2. Open your backend service logs
3. Search for these keywords:
   - "Creating booking request"
   - "Sending new booking notification"
   - "POST /api/bookings/request"

**Share the logs immediately after booking attempt!**

---

## 🚨 IMMEDIATE ACTIONS

### Action 1: Run Direct API Test (Step 1)
**This bypasses frontend completely and tests backend + email directly**

Copy this to browser console:
```javascript
fetch('https://weddingbazaar-web.onrender.com/api/bookings/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-user-id': 'test' },
  body: JSON.stringify({
    coupleId: '1', vendorId: '1', serviceId: '1', serviceName: 'Test',
    serviceType: 'photography', eventDate: '2025-12-31', eventTime: '14:00',
    eventLocation: 'Manila', guestCount: 100, budgetRange: '50000-100000',
    contactPerson: 'Test', contactPhone: '+639171234567',
    contactEmail: 'test@example.com', preferredContactMethod: 'email',
    vendorName: 'Test Vendor', coupleName: 'Test Couple'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

### Action 2: Check Render Logs
1. Open Render → Backend Service → Logs
2. Watch logs in real-time
3. Run the fetch command above
4. **IMMEDIATELY** check if logs appear

### Action 3: Test Real Booking with DevTools Open
1. Open DevTools (F12)
2. Go to Network tab
3. Create a real booking
4. Check if `/api/bookings/request` appears
5. **Screenshot and share!**

---

## 📊 DEBUGGING CHECKLIST

- [ ] Direct API test (Step 1) - Does it work?
- [ ] Backend logs show booking creation?
- [ ] Backend logs show email sending?
- [ ] Vendor receives email?
- [ ] Frontend service test (Step 2) - Does it work?
- [ ] Network tab shows API request?
- [ ] Console shows booking logs?
- [ ] Any JavaScript errors in console?

---

## 🎯 NEXT STEPS BASED ON RESULTS

### If Direct API Test (Step 1) Works:
**Problem is in frontend - booking modal not calling API**
- Check BookingRequestModal submit handler
- Check optimizedBookingApiService implementation
- Check for JavaScript errors blocking submission

### If Direct API Test Fails:
**Problem is in backend**
- Check database connection
- Check vendor email lookup query
- Check emailService configuration

### If Network Tab Shows No Request:
**Booking submission is failing before API call**
- Check form validation
- Check for JavaScript errors
- Check BookingRequestModal handleSubmit function

### If Network Tab Shows 404/500:
**API endpoint issue**
- Check backend route configuration
- Check CORS settings
- Check request payload format

---

## 📧 EMAIL NOTIFICATION CODE LOCATION

**Backend file:** `backend-deploy/routes/bookings.cjs`
**Lines:** 920-945

```javascript
// Send email notification to vendor (async, don't wait)
emailService.sendNewBookingNotification({
  email: vendorData[0].email,
  businessName: vendorData[0].business_name,
  firstName: vendorData[0].first_name
}, {
  id: bookingId,
  coupleName: coupleName || 'A couple',
  coupleEmail: contactEmail || 'Not provided',
  serviceType: serviceType || 'Wedding Service',
  eventDate: eventDate,
  eventLocation: location,
  guestCount: guestCount,
  budgetRange: budgetRange,
  specialRequests: specialRequests,
  createdAt: new Date().toISOString()
}).catch(err => {
  console.error('❌ Failed to send vendor notification email:', err.message);
});
```

**This code ONLY runs if:**
1. Booking is successfully created in database
2. Vendor email is found in database
3. Email service is configured correctly

---

## ⚡ QUICK START: RUN THIS FIRST

**Open browser console on your site and paste:**

```javascript
// Quick diagnostic test
console.log('🧪 Running quick diagnostic...');

// Test 1: Check API reachability
fetch('https://weddingbazaar-web.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend reachable:', d))
  .catch(e => console.error('❌ Backend unreachable:', e));

// Test 2: Create test booking
setTimeout(() => {
  fetch('https://weddingbazaar-web.onrender.com/api/bookings/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      coupleId: '1', vendorId: '1', serviceId: '1',
      serviceName: 'Test', serviceType: 'photography',
      eventDate: '2025-12-31', eventLocation: 'Manila',
      contactPerson: 'Test', contactPhone: '+639171234567',
      contactEmail: 'test@example.com', vendorName: 'Test',
      coupleName: 'Test'
    })
  })
  .then(r => r.json())
  .then(d => {
    console.log('✅ Booking API response:', d);
    if (d.success) {
      console.log('🎉 BOOKING WORKS! Check Render logs for email notification');
    }
  })
  .catch(e => console.error('❌ Booking API failed:', e));
}, 2000);
```

**Run this NOW and share the console output!**
