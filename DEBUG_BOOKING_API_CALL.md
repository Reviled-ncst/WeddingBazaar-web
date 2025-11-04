# 🔍 DEBUG: Why Booking API Calls Are Not Reaching Backend

## Problem Summary
- **Frontend**: Booking request modal opens and user fills form
- **Expected**: POST `/api/bookings/request` → Backend logs → Email sent
- **Actual**: No backend logs, no email, but user sees success modal (from fallback)
- **Root Cause**: API call is failing silently and returning fallback data

## Evidence from Code Analysis

### 1. Frontend Service Layer (`optimizedBookingApiService.ts`)
```typescript
// Line 202-222: createBookingRequest method
async createBookingRequest(bookingData: any, userId?: string): Promise<any> {
  const requestId = `booking-${userId}-${bookingData.service_id}-${Date.now()}`;
  
  // Prevent duplicate requests
  if (this.requestQueue.has(requestId)) {
    return this.requestQueue.get(requestId);
  }

  const promise = this._createBookingRequestInternal(bookingData, userId);
  this.requestQueue.set(requestId, promise);

  try {
    const result = await promise;
    this.requestQueue.delete(requestId);
    return result;
  } catch (error) {
    this.requestQueue.delete(requestId);
    throw error; // ❌ ERROR IS THROWN BUT CAUGHT LATER
  }
}

// Line 224-266: Internal method with health check
private async _createBookingRequestInternal(bookingData: any, userId?: string): Promise<any> {
  // Parallel health check
  const [healthOk] = await Promise.allSettled([this.healthCheck()]);

  const isHealthy = healthOk.status === 'fulfilled' && healthOk.value;

  if (!isHealthy) {
    return this.createFallbackBooking(bookingData, userId); // ⚠️ RETURNS FAKE DATA
  }

  try {
    // API call to /api/bookings/request
    const response = await this.fetcher.fetch<ApiResponse<BookingRequest>>(
      '/api/bookings/request',
      {
        method: 'POST',
        body: JSON.stringify(optimizedPayload),
        headers: {
          'x-user-id': userId || bookingData.user_id || '1-2025-001'
        }
      },
      FETCH_TIMEOUTS.BOOKING_CREATE
    );

    // ... handle response
  } catch (error) {
    console.error('❌ [OptimizedBooking] API call failed:', error);
    return this.createFallbackBooking(bookingData, userId); // ⚠️ RETURNS FAKE DATA
  }
}
```

### 2. The Problem: Fallback System Hiding Failures
**Issue**: When API call fails or times out, the system returns **fake/fallback data** instead of throwing an error.

**Result**: 
- ✅ User sees "success" modal with fake booking ID
- ❌ No real booking created in database
- ❌ No backend logs (API never reached)
- ❌ No vendor email sent

### 3. Backend Is Ready (`routes/bookings.cjs`)
```javascript
// Line 791-793: Endpoint exists with logging
router.post('/request', async (req, res) => {
  console.log('📝 Creating booking request:', req.body);
  
  // ... booking creation logic
  
  // Line 903-944: Email notification logic
  try {
    const vendorData = await sql`
      SELECT vp.business_name, u.email, u.first_name
      FROM vendor_profiles vp
      LEFT JOIN users u ON vp.user_id::text = u.id::text
      WHERE vp.id::text = ${vendorId}::text
      LIMIT 1
    `;
    
    if (vendorData && vendorData.length > 0 && vendorData[0].email) {
      console.log('📧 Sending new booking notification to vendor:', vendorData[0].email);
      
      emailService.sendNewBookingNotification({
        email: vendorData[0].email,
        businessName: vendorData[0].business_name,
        firstName: vendorData[0].first_name
      }, {
        // ... booking details
      }).catch(err => {
        console.error('❌ Failed to send vendor notification email:', err.message);
      });
    }
  } catch (emailError) {
    console.error('❌ Error preparing vendor notification:', emailError.message);
  }
});
```

## Diagnostic Steps

### Step 1: Check Browser Network Tab
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by "booking" or "request"
4. Try to create a booking
5. **Look for**:
   - Is `POST /api/bookings/request` sent?
   - What's the status code? (200, 500, timeout?)
   - What's the request payload?
   - What's the response body?

### Step 2: Add Detailed Console Logging
Add this to the frontend before testing:

**File**: `src/services/api/optimizedBookingApiService.ts`

**Line 224** (in `_createBookingRequestInternal` method):
```typescript
private async _createBookingRequestInternal(bookingData: any, userId?: string): Promise<any> {
  console.log('🚀 [BOOKING API] Starting booking request', {
    userId,
    serviceId: bookingData.service_id,
    vendorId: bookingData.vendor_id,
    timestamp: new Date().toISOString()
  });

  // Parallel health check
  const [healthOk] = await Promise.allSettled([this.healthCheck()]);
  const isHealthy = healthOk.status === 'fulfilled' && healthOk.value;

  console.log('🏥 [BOOKING API] Health check result:', { isHealthy, healthOk });

  if (!isHealthy) {
    console.warn('⚠️ [BOOKING API] Health check failed, using fallback');
    return this.createFallbackBooking(bookingData, userId);
  }

  try {
    console.log('📡 [BOOKING API] Sending POST /api/bookings/request', {
      url: '/api/bookings/request',
      payload: optimizedPayload
    });

    const response = await this.fetcher.fetch<ApiResponse<BookingRequest>>(
      '/api/bookings/request',
      {
        method: 'POST',
        body: JSON.stringify(optimizedPayload),
        headers: {
          'x-user-id': userId || bookingData.user_id || '1-2025-001'
        }
      },
      FETCH_TIMEOUTS.BOOKING_CREATE
    );

    console.log('✅ [BOOKING API] Response received:', response);

    const bookingData_response = response.data || (response as any).booking;
    
    if (response.success && bookingData_response) {
      this.fetcher.clearCache('bookings');
      return this.formatBookingResponse(bookingData_response, bookingData);
    }

    throw new Error(response.message || 'Invalid response from server');

  } catch (error) {
    console.error('❌ [BOOKING API] API call failed:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    
    console.warn('🔄 [BOOKING API] Using fallback booking');
    return this.createFallbackBooking(bookingData, userId);
  }
}
```

### Step 3: Test Health Check Separately
Add this test in browser console:
```javascript
// Test if backend health check is passing
fetch('https://weddingbazaar-web.onrender.com/api/health')
  .then(r => r.json())
  .then(data => console.log('Backend health:', data))
  .catch(err => console.error('Health check failed:', err));
```

### Step 4: Test Direct API Call
Add this test in browser console:
```javascript
// Test if booking API is reachable
fetch('https://weddingbazaar-web.onrender.com/api/bookings/request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': '1-2025-001'
  },
  body: JSON.stringify({
    coupleId: '1-2025-001',
    vendorId: 'VND-0001',
    serviceId: 'SRV-0001',
    eventDate: '2025-06-15',
    eventLocation: 'Manila Hotel',
    guestCount: 100,
    budgetRange: '₱50,000 - ₱100,000',
    contactPerson: 'Test User',
    contactPhone: '09123456789',
    contactEmail: 'test@example.com',
    preferredContactMethod: 'email',
    serviceName: 'Test Service',
    serviceType: 'Photography',
    vendorName: 'Test Vendor',
    coupleName: 'Test Couple'
  })
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

## Most Likely Root Causes

### Scenario A: Health Check Failing
**Symptom**: `isHealthy = false` → Fallback used immediately
**Solution**: Check why health endpoint `/api/health` is failing
**Logs to look for**: `⚠️ [BOOKING API] Health check failed, using fallback`

### Scenario B: Fetch Timeout
**Symptom**: API call times out (default timeout: 30s)
**Solution**: Increase timeout or optimize backend response time
**Logs to look for**: `error.message.includes('timeout')`

### Scenario C: CORS/Network Error
**Symptom**: Fetch fails due to CORS policy or network issue
**Solution**: Check CORS configuration in backend
**Logs to look for**: `❌ [BOOKING API] API call failed`

### Scenario D: Invalid Payload
**Symptom**: Backend rejects request (400/500 error)
**Solution**: Check payload format matches backend expectations
**Logs to look for**: Backend returns error message in response

## Quick Fix: Force Real API Call

**Temporary workaround to bypass health check**:

**File**: `src/services/api/optimizedBookingApiService.ts`
**Line 230**: Comment out health check fallback
```typescript
// if (!isHealthy) {
//   console.warn('⚠️ [BOOKING API] Health check failed, using fallback');
//   return this.createFallbackBooking(bookingData, userId);
// }
```

This will force the system to try the real API call even if health check fails.

## Next Actions

1. **Add detailed logging** (Step 2 above)
2. **Deploy updated code** to production
3. **Test booking creation** in production
4. **Check browser console** for detailed logs
5. **Check Network tab** for actual HTTP requests
6. **Check Render logs** to see if backend receives the request

## Expected Log Sequence (If Working)

**Frontend Console**:
```
🚀 [BOOKING API] Starting booking request
🏥 [BOOKING API] Health check result: { isHealthy: true }
📡 [BOOKING API] Sending POST /api/bookings/request
✅ [BOOKING API] Response received: { success: true, booking: {...} }
```

**Backend (Render) Logs**:
```
📝 Creating booking request: {...}
💾 Inserting booking with data: {...}
✅ Booking request created with ID: <uuid>
📧 Sending new booking notification to vendor: vendor@example.com
```

**User Experience**:
```
✅ Success modal appears
✅ Email sent to vendor
✅ Booking appears in bookings list
```
